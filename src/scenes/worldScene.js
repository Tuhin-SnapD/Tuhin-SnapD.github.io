import Phaser from 'phaser';
import { C, FONT, ACCENTS, drawPanel, makeButton, showToast, resumeExists } from '../ui/theme.js';

const PLAYER_SPEED = 220;
const JUMP_VELOCITY = -560;

const WORLD_HEIGHT = 720;
const GROUND_Y = 500;
const GROUND_TOP = GROUND_Y + 16;
// Ground is drawn well below the camera bounds so tall viewports never reveal
// empty space underneath the world.
const VISUAL_BOTTOM = 4000;
const TOUCH_BUTTON_SIZE = 64;
const TOUCH_BUTTON_PADDING = 10;
const JUMP_BUFFER_MS = 150;
const COYOTE_MS = 90;

const COIN_POSITIONS = [
  { x: 400, dy: 110 },
  { x: 850, dy: 220 },
  { x: 1250, dy: 180 },
  { x: 1450, dy: 250 },
  { x: 1700, dy: 110 },
  { x: 2150, dy: 150 },
  { x: 2450, dy: 200 },
  { x: 2750, dy: 120 },
  { x: 3000, dy: 110 },
  { x: 1000, dy: 150 }
];

const PLATFORMS = [
  { x: 600, y: 356, w: 146 },
  { x: 1000, y: 318, w: 146 },
  { x: 1400, y: 372, w: 146 },
  { x: 1800, y: 330, w: 146 },
  { x: 2200, y: 372, w: 146 },
  { x: 2600, y: 322, w: 146 },
  { x: 3000, y: 372, w: 146 },
  { x: 3400, y: 330, w: 146 }
];

const ZONE_LABELS = {
  childhood: 'Childhood',
  school: 'School',
  college: 'University',
  firstJob: 'First Job',
  current: 'Current Role',
  skills: 'Skills',
  projects: 'Projects',
  future: 'Future'
};

function hasTouchInput(scene) {
  const device = scene.sys.game.device;
  return (device?.input?.touch) ||
    (typeof window !== 'undefined' && 'ontouchstart' in window) ||
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
}

const NO_INSETS = { top: 0, right: 0, bottom: 0, left: 0 };

function safeInsets() {
  if (typeof document === 'undefined' || !document.body) return NO_INSETS;

  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;inset:0;visibility:hidden;pointer-events:none;' +
    'padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
  document.body.appendChild(probe);

  const styles = getComputedStyle(probe);
  const insets = {
    top: parseFloat(styles.paddingTop) || 0,
    right: parseFloat(styles.paddingRight) || 0,
    bottom: parseFloat(styles.paddingBottom) || 0,
    left: parseFloat(styles.paddingLeft) || 0
  };
  probe.remove();
  return insets;
}

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' });
    this.player = null;
    this.cursors = null;
    this.wasd = null;
    this.zones = [];
    this.currentZone = null;
    this.canMove = true;
    this.coins = null;
    this.collectedCoins = 0;
    this.groundY = GROUND_Y;
    this.resumeAvailable = false;
    this.touch = { left: false, right: false };
    this.touchPointers = { left: null, right: null };
    this.jumpPressed = false;
    this.jumpQueuedAt = -Infinity;
    this.lastGroundedAt = -Infinity;
  }

  create() {
    this.resumeUrl = (import.meta.env?.BASE_URL || '/') + 'resume.pdf';
    resumeExists(this.resumeUrl).then((ok) => { this.resumeAvailable = ok; });

    const mapData = this.cache.json.get('mapData');
    if (!mapData) {
      console.error('Failed to load mapData');
      return;
    }

    let maxZoneX = 0;
    for (const zone of mapData.zones || []) {
      maxZoneX = Math.max(maxZoneX, zone.x + zone.width);
    }
    const worldWidth = Math.max(mapData.width * mapData.tileWidth, maxZoneX + 500);
    this.worldWidth = worldWidth;
    this.physics.world.setBounds(0, 0, worldWidth, WORLD_HEIGHT);

    this.createBackground(worldWidth);
    this.createGround(worldWidth);
    this.createPlatforms();
    this.createZones(mapData.zones || []);

    this.player = this.physics.add.sprite(100, 400, 'player_idle');
    this.player.setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(26, 46);
    this.player.body.setOffset(19, 38);

    this.playerShadow = this.add.image(this.player.x, GROUND_TOP - 4, 'shadow')
      .setDepth(4)
      .setAlpha(0.35)
      .setScale(0.36, 0.32);

    this.physics.add.collider(this.player, this.groundBody);
    this.physics.add.collider(this.player, this.platformBodies);

    this.createAnimations();
    this.player.play('idle');

    this.cameras.main.setBounds(0, 0, worldWidth, Math.max(WORLD_HEIGHT, this.scale.height));
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12, 0, 0);
    this.cameras.main.setDeadzone(160, 80);
    this.cameras.main.setBackgroundColor('#070a18');

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    };
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.interactKey.on('down', () => this.handleInteraction());

    this.createCoins();
    this.createHud();
    this.createInteractIndicator();
    this.setupTouchControls();
    this.layoutHud(this.scale.width, this.scale.height);

    this.scale.on('resize', this.handleResize, this);
    this.game.events.on(Phaser.Core.Events.BLUR, this.clearTouchState, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.handleResize, this);
      this.game.events.off(Phaser.Core.Events.BLUR, this.clearTouchState, this);
      this.input.off('pointerup', this.releaseTouchPointer, this);
      this.input.off('gameout', this.clearTouchState, this);
      this.tweens.killAll();
    });
  }

  handleResize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;

    this.cameras.main.setBounds(0, 0, this.worldWidth, Math.max(WORLD_HEIGHT, height));
    this.skyImage?.setDisplaySize(width, height);
    this.vignetteImage?.setDisplaySize(width, height);
    this.layoutHud(width, height);

    if (this.introOpen) {
      this.layoutIntro(width, height);
    }
  }

  layoutHud(width, height) {
    const insets = safeInsets();

    this.coinPill?.setPosition(85 + insets.left, 44 + insets.top);
    this.resumeBtn?.container.setPosition(width - 46 - insets.right, 44 + insets.top);
    this.hint?.setPosition(width / 2, height - 26 - insets.bottom);

    if (this.touchButtons) {
      const y = height - 64 - insets.bottom;
      this.touchButtons.left.setPosition(56 + insets.left, y);
      this.touchButtons.right.setPosition(140 + insets.left, y);
      this.touchButtons.jump.setPosition(width - 140 - insets.right, y);
      this.touchButtons.interact.setPosition(width - 56 - insets.right, y);
    }
  }

  createAnimations() {
    if (!this.anims.exists('idle')) {
      this.anims.create({ key: 'idle', frames: [{ key: 'player_idle' }], frameRate: 1, repeat: -1 });
    }
    if (!this.anims.exists('walk')) {
      this.anims.create({
        key: 'walk',
        frames: [
          { key: 'player_walk1' },
          { key: 'player_idle' },
          { key: 'player_walk2' },
          { key: 'player_walk3' }
        ],
        frameRate: 9,
        repeat: -1
      });
    }
  }

  createBackground(worldWidth) {
    const { width, height } = this.cameras.main;

    this.skyImage = this.add.image(0, 0, 'sky')
      .setOrigin(0, 0)
      .setDisplaySize(width, height)
      .setScrollFactor(0)
      .setDepth(-1000);

    // Stars
    const rnd = new Phaser.Math.RandomDataGenerator(['timeline']);
    for (let i = 0; i < 46; i++) {
      const star = this.add.circle(
        rnd.between(0, width + 400),
        rnd.between(20, 330),
        rnd.realInRange(0.8, 2.1),
        0xffffff,
        rnd.realInRange(0.18, 0.7)
      ).setScrollFactor(0.04, 1).setDepth(-980);
      this.tweens.add({
        targets: star,
        alpha: rnd.realInRange(0.05, 0.25),
        duration: rnd.between(1600, 4200),
        delay: rnd.between(0, 2000),
        yoyo: true,
        repeat: -1
      });
    }

    // Halo behind the horizon
    this.add.image(1020, 210, 'glow')
      .setScale(2.6, 2.1)
      .setTint(C.violet)
      .setAlpha(0.4)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScrollFactor(0.05, 1)
      .setDepth(-960);

    this.add.image(1020, 210, 'glow')
      .setScale(1.1, 0.9)
      .setTint(0xc4b5fd)
      .setAlpha(0.35)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScrollFactor(0.05, 1)
      .setDepth(-959);

    // Clouds
    for (let x = -100; x < worldWidth * 0.5 + width; x += 460) {
      const y = 90 + (Math.floor(x / 460) % 3) * 62;
      const cloud = this.add.image(x, y, 'cloud')
        .setScrollFactor(0.07, 1)
        .setAlpha(Phaser.Math.RND.realInRange(0.10, 0.2))
        .setScale(Phaser.Math.RND.realInRange(0.7, 1.25))
        .setDepth(-930);
      this.tweens.add({
        targets: cloud,
        x: cloud.x + 80,
        duration: Phaser.Math.RND.between(14000, 22000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Far and mid hills
    for (let x = -200; x < worldWidth * 0.35 + width; x += 820) {
      this.add.image(x, GROUND_TOP + 26, 'hill-far')
        .setOrigin(0.5, 1)
        .setScrollFactor(0.12, 1)
        .setAlpha(0.9)
        .setDepth(-820);
    }
    for (let x = -300; x < worldWidth * 0.55 + width; x += 760) {
      this.add.image(x, GROUND_TOP + 12, 'hill-mid')
        .setOrigin(0.5, 1)
        .setScrollFactor(0.25, 1)
        .setDepth(-800);
    }

    // Silhouetted trees
    for (let x = 60; x < worldWidth * 0.8 + width; x += 280) {
      const scale = Phaser.Math.RND.realInRange(0.6, 1.05);
      this.add.image(x, GROUND_TOP + 6, 'tree')
        .setOrigin(0.5, 1)
        .setScale(scale)
        .setScrollFactor(0.42, 1)
        .setAlpha(0.85)
        .setDepth(-760);
    }

    this.vignetteImage = this.add.image(0, 0, 'vignette')
      .setOrigin(0, 0)
      .setDisplaySize(width, height)
      .setScrollFactor(0)
      .setDepth(500);
  }

  createGround(worldWidth) {
    const slabHeight = VISUAL_BOTTOM - GROUND_TOP;
    const slab = this.add.graphics().setDepth(0);
    slab.fillStyle(0x0a0f26, 1);
    slab.fillRect(0, GROUND_TOP, worldWidth, slabHeight);
    slab.fillStyle(0x0e1430, 1);
    slab.fillRect(0, GROUND_TOP + 26, worldWidth, slabHeight - 26);

    for (let y = GROUND_TOP + 54; y < VISUAL_BOTTOM; y += 42) {
      slab.lineStyle(1, 0xffffff, 0.035);
      slab.moveTo(0, y);
      slab.lineTo(worldWidth, y);
      slab.strokePath();
    }

    this.add.image(0, GROUND_TOP - 1, 'accent-line')
      .setOrigin(0, 0)
      .setDisplaySize(worldWidth, 3)
      .setAlpha(0.75)
      .setDepth(1);

    this.groundBody = this.add.rectangle(worldWidth / 2, (GROUND_TOP + VISUAL_BOTTOM) / 2, worldWidth, slabHeight);
    this.physics.add.existing(this.groundBody, true);
  }

  createPlatforms() {
    this.platformBodies = this.physics.add.staticGroup();

    for (const p of PLATFORMS) {
      const g = this.add.graphics().setDepth(6);
      g.fillStyle(0x000000, 0.25);
      g.fillRoundedRect(p.x - p.w / 2, p.y + 6, p.w, 18, 9);
      g.fillStyle(0x121a36, 1);
      g.fillRoundedRect(p.x - p.w / 2, p.y, p.w, 18, 9);
      g.lineStyle(1.5, 0x8b8fff, 0.45);
      g.strokeRoundedRect(p.x - p.w / 2, p.y, p.w, 18, 9);
      g.fillStyle(C.violet, 0.9);
      g.fillRoundedRect(p.x - p.w / 2 + 14, p.y + 2, p.w - 28, 3, 1.5);

      const body = this.add.rectangle(p.x, p.y + 9, p.w, 18);
      this.platformBodies.add(body);
    }
  }

  createZones(zoneConfigs) {
    const locations = this.cache.json.get('locations') || {};
    const cardWidth = 208;
    const cardHeight = 58;
    const cardY = GROUND_TOP - 186;

    zoneConfigs.forEach((cfg, index) => {
      const accent = ACCENTS[index % ACCENTS.length];
      const cx = cfg.x + cfg.width / 2;
      const label = ZONE_LABELS[cfg.id] || locations[cfg.id]?.title || cfg.id;

      const stem = this.add.graphics().setDepth(17);
      stem.lineStyle(1.5, accent, 0.35);
      stem.beginPath();
      stem.moveTo(cx, cardY + cardHeight / 2);
      stem.lineTo(cx, GROUND_TOP - 3);
      stem.strokePath();

      const baseGlow = this.add.image(cx, GROUND_TOP - 4, 'glow')
        .setScale(0.55, 0.16)
        .setTint(accent)
        .setAlpha(0.22)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(16);

      const baseRing = this.add.ellipse(cx, GROUND_TOP - 3, 34, 11, accent, 0.14)
        .setStrokeStyle(1.5, accent, 0.5)
        .setDepth(16);

      const card = this.add.container(cx, cardY).setDepth(20);
      const glow = this.add.image(0, 0, 'glow')
        .setScale(1.7, 0.72)
        .setTint(accent)
        .setAlpha(0.15)
        .setBlendMode(Phaser.BlendModes.ADD);

      const shadow = this.add.graphics();
      shadow.fillStyle(0x05070f, 0.4);
      shadow.fillRoundedRect(-cardWidth / 2, -cardHeight / 2 + 7, cardWidth, cardHeight, 16);

      const panel = this.add.graphics();
      drawPanel(panel, cardWidth, cardHeight, 16, C.panel, 0.82, accent, 0.34);

      const dot = this.add.circle(-cardWidth / 2 + 20, 0, 4, accent, 1);

      const title = this.add.text(-cardWidth / 2 + 34, 0, label, {
        fontFamily: FONT,
        fontSize: '16px',
        fontStyle: '600',
        color: C.text
      }).setOrigin(0, 0.5);

      const indexText = this.add.text(cardWidth / 2 - 16, 0, String(index + 1).padStart(2, '0'), {
        fontFamily: FONT,
        fontSize: '11px',
        fontStyle: '600',
        color: '#98a2c2'
      }).setOrigin(1, 0.5);

      card.add([glow, shadow, panel, dot, title, indexText]);

      this.tweens.add({
        targets: card,
        y: cardY - 4,
        duration: 2600 + index * 120,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.zones.push({
        cfg,
        accent,
        card,
        glow,
        baseGlow,
        baseRing,
        title,
        cardY,
        active: false,
        area: new Phaser.Geom.Rectangle(cfg.x, GROUND_TOP - cfg.height, cfg.width, cfg.height)
      });
    });
  }

  createCoins() {
    const collected = JSON.parse(localStorage.getItem('collectedCoinPositions') || '[]');
    this.collectedCoins = parseInt(localStorage.getItem('collectedCoins') || '0', 10) || 0;

    this.coins = this.physics.add.group();

    for (const { x, dy } of COIN_POSITIONS) {
      const y = GROUND_Y - dy;
      const key = `${x},${y}`;
      if (collected.includes(key)) continue;

      const glow = this.add.image(x, y, 'glow')
        .setScale(0.42)
        .setTint(C.amber)
        .setAlpha(0.38)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(9);

      const coin = this.coins.create(x, y, 'coin');
      coin.setScale(0.72);
      coin.setDepth(11);
      coin.setData('positionKey', key);
      coin.setData('glow', glow);
      coin.body.setAllowGravity(false);
      coin.body.setCircle(20, 8, 8);

      this.tweens.add({
        targets: [coin, glow],
        y: y - 11,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.tweens.add({
        targets: coin,
        scaleX: 0.6,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    if (this.coins.getLength() > 0) {
      this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    }
  }

  createInteractIndicator() {
    const container = this.add.container(0, 0).setDepth(70).setVisible(false);
    const bg = this.add.graphics();
    drawPanel(bg, 34, 34, 9, 0x0b1026, 0.9, 0xffffff, 0.28);

    const key = this.add.text(0, 0, 'E', {
      fontFamily: FONT,
      fontSize: '15px',
      fontStyle: '700',
      color: '#ffffff'
    }).setOrigin(0.5);

    const labelBg = this.add.graphics();
    drawPanel(labelBg, 74, 28, 14, 0x0b1026, 0.8, 0xffffff, 0.12);
    labelBg.x = 62;

    const label = this.add.text(62, 0, 'Explore', {
      fontFamily: FONT,
      fontSize: '12px',
      fontStyle: '600',
      color: C.muted
    }).setOrigin(0.5);

    container.add([labelBg, bg, key, label]);
    this.interactIndicator = container;

    // Tapping the "Explore" prompt also opens the stop on touch screens.
    container.setSize(140, 48);
    container.setInteractive(new Phaser.Geom.Rectangle(-24, -24, 140, 48), Phaser.Geom.Rectangle.Contains);
    container.input.cursor = 'pointer';
    container.on('pointerdown', () => this.handleInteraction());

    this.indicatorTween = this.tweens.add({
      targets: container,
      scale: { from: 1, to: 1.07 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      paused: true
    });
  }

  createHud() {
    const { width, height } = this.cameras.main;

    const coinPill = this.add.container(85, 44).setScrollFactor(0).setDepth(1000);
    const pillBg = this.add.graphics();
    drawPanel(pillBg, 122, 44, 22, C.panel, 0.75, 0xffffff, 0.12);
    const coinIcon = this.add.image(-36, 0, 'coin').setScale(0.5);
    this.coinText = this.add.text(-16, 0, `${this.collectedCoins}`, {
      fontFamily: FONT,
      fontSize: '16px',
      fontStyle: '700',
      color: C.text
    }).setOrigin(0, 0.5);
    this.coinLabel = this.add.text(-16 + this.coinText.width + 8, 0, 'coins', {
      fontFamily: FONT,
      fontSize: '12px',
      fontStyle: '500',
      color: C.muted
    }).setOrigin(0, 0.5);
    coinPill.add([pillBg, coinIcon, this.coinText, this.coinLabel]);
    coinPill.setSize(122, 44);
    this.coinPill = coinPill;

    this.resumeBtn = makeButton(this, width - 46, 44, 44, 44, 'CV', {
      radius: 22,
      fontSize: 12.5,
      fontStyle: '700',
      onClick: () => this.openResume()
    });
    this.resumeBtn.container.setScrollFactor(0).setDepth(1000);
    this.resumeBtn.container.input.hitArea.setTo(-28, -28, 56, 56);

    // Scroll progress line
    this.progressLine = this.add.image(0, 0, 'accent-line')
      .setOrigin(0, 0)
      .setDisplaySize(0, 3)
      .setScrollFactor(0)
      .setDepth(1100);

    // Controls hint
    const hint = this.add.container(width / 2, height - 26).setScrollFactor(0).setDepth(1000).setAlpha(0.7);
    const hintBg = this.add.graphics();
    drawPanel(hintBg, 330, 32, 16, C.panel, 0.55, 0xffffff, 0.08);
    const hintText = this.add.text(0, 0, '←  →  Move        Space  Jump        E  Explore', {
      fontFamily: FONT,
      fontSize: '12px',
      fontStyle: '500',
      color: C.muted
    }).setOrigin(0.5);
    hint.add([hintBg, hintText]);
    this.hint = hint;
    if (hasTouchInput(this)) hint.setVisible(false);

    this.createIntro();
  }

  createIntro() {
    if (localStorage.getItem('introSeen') === '1') return;

    this.canMove = false;
    const { width, height } = this.cameras.main;

    const overlay = this.add.rectangle(0, 0, 4000, 4000, 0x050814, 0.72)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(2000)
      .setAlpha(0)
      .setInteractive();

    const root = this.add.container(width / 2, height / 2).setScrollFactor(0).setDepth(2001);
    const panelW = 560;
    const panelH = 344;

    const shadow = this.add.graphics();
    shadow.fillStyle(0x02040e, 0.55);
    shadow.fillRoundedRect(-panelW / 2 + 6, -panelH / 2 + 14, panelW, panelH, 26);

    const panel = this.add.graphics();
    drawPanel(panel, panelW, panelH, 26, C.panel, 0.94, 0xffffff, 0.14, 1.5);

    const accentBar = this.add.graphics();
    accentBar.fillStyle(C.violet, 0.9);
    accentBar.fillRoundedRect(-panelW / 2 + 34, -panelH / 2 + 26, 44, 3, 1.5);

    const eyebrow = this.add.text(-panelW / 2 + 34, -124, 'TUHIN CHAKRABARTY  ·  INTERACTIVE PORTFOLIO', {
      fontFamily: FONT,
      fontSize: '11px',
      fontStyle: '700',
      color: '#a78bfa'
    }).setOrigin(0, 0.5);

    const title = this.add.text(-panelW / 2 + 34, -88, 'Walk through my journey', {
      fontFamily: FONT,
      fontSize: '31px',
      fontStyle: '700',
      color: '#ffffff'
    }).setOrigin(0, 0.5);

    const subtitle = this.add.text(-panelW / 2 + 34, -24, 'Eight stops along the timeline — childhood in India, VIT Vellore, Bank of America, and leading PRISM 2.0 at PayU. Move through the world and open each stop to read the story.', {
      fontFamily: FONT,
      fontSize: '14.5px',
      fontStyle: '400',
      color: C.muted,
      lineSpacing: 6,
      wordWrap: { width: panelW - 68 }
    }).setOrigin(0, 0.5);

    root.add([shadow, panel, accentBar, eyebrow, title, subtitle]);

    const keys = [
      { key: '←  →', label: 'Move', width: 62 },
      { key: 'Space', label: 'Jump', width: 62 },
      { key: 'E', label: 'Open', width: 36 }
    ];
    let kx = -panelW / 2 + 34;
    for (const k of keys) {
      const capBg = this.add.graphics();
      drawPanel(capBg, k.width, 30, 8, 0xffffff, 0.06, 0xffffff, 0.14);
      const capText = this.add.text(0, 0, k.key, {
        fontFamily: FONT,
        fontSize: '12px',
        fontStyle: '600',
        color: C.text
      }).setOrigin(0.5);
      const cap = this.add.container(kx + k.width / 2, 66, [capBg, capText]);
      const label = this.add.text(kx + k.width + 14, 66, k.label, {
        fontFamily: FONT,
        fontSize: '13px',
        fontStyle: '500',
        color: C.muted
      }).setOrigin(0, 0.5);
      root.add([cap, label]);
      kx += k.width + 14 + label.width + 34;
    }

    const start = makeButton(this, 0, 126, 200, 46, 'Start exploring', {
      radius: 23,
      fill: C.violet,
      fillAlpha: 1,
      hoverFillAlpha: 1,
      stroke: 0xffffff,
      strokeAlpha: 0.22,
      hoverStrokeAlpha: 0.4,
      color: '#ffffff',
      fontSize: 15,
      onClick: () => dismiss()
    });
    root.add(start.container);

    this.introRoot = root;
    this.introOverlay = overlay;

    const introScale = Math.min(1, (width - 24) / panelW, (height - 24) / panelH);
    root.setPosition(width / 2, height / 2).setScale(introScale);
    root.setAlpha(0);
    this.tweens.add({ targets: root, alpha: 1, duration: 300, ease: 'Power2' });
    this.tweens.add({ targets: overlay, alpha: 1, duration: 260 });

    const dismiss = () => {
      if (!this.introOpen) return;
      this.introOpen = false;
      this.input.keyboard.off('keydown-ENTER', dismiss);
      this.input.keyboard.off('keydown-SPACE', dismiss);
      this.input.keyboard.off('keydown-ESC', dismiss);
      overlay.disableInteractive();
      localStorage.setItem('introSeen', '1');
      this.tweens.add({
        targets: [root, overlay],
        alpha: 0,
        duration: 240,
        onComplete: () => {
          root.destroy();
          overlay.destroy();
          this.introRoot = null;
          this.introOverlay = null;
          this.canMove = true;
        }
      });
    };

    this.introOpen = true;
    overlay.on('pointerdown', dismiss);
    this.input.keyboard.on('keydown-ENTER', dismiss);
    this.input.keyboard.on('keydown-SPACE', dismiss);
    this.input.keyboard.on('keydown-ESC', dismiss);
  }

  layoutIntro(width, height) {
    if (!this.introRoot) return;
    const scale = Math.min(1, (width - 24) / 560, (height - 24) / 344);
    this.introRoot.setPosition(width / 2, height / 2).setScale(scale);
  }

  openResume() {
    if (this.resumeAvailable) {
      window.open(this.resumeUrl, '_blank', 'noopener,noreferrer');
    } else {
      showToast(this, 'Resume not uploaded yet');
    }
  }

  collectCoin(player, coin) {
    if (!coin.active) return;

    const glow = coin.getData('glow');
    const { x, y } = coin;
    const key = coin.getData('positionKey') || `${x},${y}`;

    this.tweens.killTweensOf(coin);
    if (glow) {
      this.tweens.killTweensOf(glow);
      glow.destroy();
    }
    coin.disableBody(true, true);

    this.spawnBurst(x, y, C.amber, 10);

    const floater = this.add.text(x, y - 8, '+1', {
      fontFamily: FONT,
      fontSize: '17px',
      fontStyle: '700',
      color: '#fde68a'
    }).setOrigin(0.5).setDepth(40);
    this.tweens.add({
      targets: floater,
      y: y - 54,
      alpha: 0,
      duration: 700,
      ease: 'Power2',
      onComplete: () => floater.destroy()
    });

    this.collectedCoins++;
    const collected = JSON.parse(localStorage.getItem('collectedCoinPositions') || '[]');
    if (!collected.includes(key)) {
      collected.push(key);
      localStorage.setItem('collectedCoinPositions', JSON.stringify(collected));
    }
    localStorage.setItem('collectedCoins', String(this.collectedCoins));
    this.coinText.setText(`${this.collectedCoins}`);
    this.coinLabel?.setX(-16 + this.coinText.width + 8);
  }

  spawnBurst(x, y, tint, quantity) {
    const emitter = this.add.particles(x, y, 'spark', {
      speed: { min: 70, max: 190 },
      lifespan: { min: 320, max: 680 },
      scale: { start: 0.42, end: 0 },
      quantity,
      tint,
      blendMode: Phaser.BlendModes.ADD,
      emitting: false
    }).setDepth(40);
    emitter.explode(quantity);
    this.time.delayedCall(800, () => emitter.destroy());
  }

  checkZone() {
    let found = null;
    for (const zone of this.zones) {
      if (Phaser.Geom.Rectangle.Contains(zone.area, this.player.x, this.player.y)) {
        found = zone;
        break;
      }
    }

    if (found === this.currentZone) return;

    this.setZoneActive(this.currentZone, false);
    this.setZoneActive(found, true);
    this.currentZone = found;

    if (this.interactIndicator) {
      this.interactIndicator.setVisible(!!found);
      if (found) {
        this.indicatorTween.resume();
        this.tweens.add({
          targets: this.interactIndicator,
          scale: { from: 0.8, to: 1 },
          duration: 220,
          ease: 'Back.easeOut'
        });
      } else {
        this.indicatorTween.pause();
      }
    }

    if (found) {
      const visited = JSON.parse(localStorage.getItem('visitedZones') || '[]');
      if (!visited.includes(found.cfg.id)) {
        visited.push(found.cfg.id);
        localStorage.setItem('visitedZones', JSON.stringify(visited));
        this.spawnBurst(this.player.x, this.player.y - 10, found.accent, 14);
      }
    }
  }

  setZoneActive(zone, active) {
    if (!zone || zone.active === active) return;
    zone.active = active;

    this.tweens.add({
      targets: zone.card,
      scale: active ? 1.05 : 1,
      duration: 240,
      ease: 'Power2'
    });
    this.tweens.add({
      targets: zone.glow,
      alpha: active ? 0.34 : 0.15,
      duration: 240
    });
    this.tweens.add({
      targets: [zone.baseGlow, zone.baseRing],
      alpha: active ? 0.4 : 0.22,
      duration: 240
    });
    zone.title.setColor(active ? '#ffffff' : C.text);
  }

  resumeMovement() {
    this.canMove = true;
    this.clearTouchState();
    this.player?.setVelocity(0, 0);
    if (this.currentZone && this.interactIndicator) {
      this.interactIndicator.setVisible(true);
      this.indicatorTween?.resume();
    }
  }

  handleInteraction() {
    if (!this.currentZone || !this.canMove) return;

    const locationsData = this.cache.json.get('locations');
    if (!locationsData) {
      console.error('Failed to load locations data');
      return;
    }

    const locationData = locationsData[this.currentZone.cfg.id];
    if (!locationData) {
      console.warn(`No location data found for zone: ${this.currentZone.cfg.id}`);
      return;
    }

    this.canMove = false;
    this.player.setVelocity(0, 0);
    this.clearTouchState();
    this.interactIndicator.setVisible(false);

    this.spawnBurst(this.player.x, this.player.y - 6, this.currentZone.accent, 14);

    this.scene.launch('UIScene', {
      locationId: this.currentZone.cfg.id,
      locationData,
      resumeUrl: this.resumeUrl,
      resumeAvailable: this.resumeAvailable
    });
  }

  setupTouchControls() {
    if (!hasTouchInput(this)) return;

    const { width, height } = this.cameras.main;
    const size = TOUCH_BUTTON_SIZE;
    const y = height - 64;
    const opts = {
      radius: size / 2,
      fill: 0xffffff,
      fillAlpha: 0.09,
      hoverFillAlpha: 0.16,
      stroke: 0xffffff,
      strokeAlpha: 0.24,
      hoverStrokeAlpha: 0.4,
      fontSize: 24
    };

    const left = makeButton(this, 56, y, size, size, '←', opts);
    const right = makeButton(this, 140, y, size, size, '→', opts);
    const jump = makeButton(this, width - 140, y, size, size, '↑', opts);
    const interact = makeButton(this, width - 56, y, size, size, 'E', { ...opts, fontSize: 19 });

    for (const btn of [left, right, jump, interact]) {
      btn.container.setScrollFactor(0).setDepth(1000);

      // Give fingers a little extra room without moving the visuals.
      const half = size / 2 + TOUCH_BUTTON_PADDING;
      btn.container.input.hitArea.setTo(-half, -half, half * 2, half * 2);
    }

    this.touchButtons = {
      left: left.container,
      right: right.container,
      jump: jump.container,
      interact: interact.container
    };

    // Track which finger is holding each direction. Releasing on pointerout
    // made movement cut out when a thumb drifted a few pixels, so release is
    // handled by the scene-level pointerup instead.
    const hold = (btn, key) => {
      btn.container.on('pointerdown', (pointer) => {
        const other = key === 'left' ? 'right' : 'left';
        this.touchPointers[other] = null;
        this.touch[other] = false;

        this.touchPointers[key] = pointer.id;
        this.touch[key] = true;
      });
    };
    hold(left, 'left');
    hold(right, 'right');

    jump.container.on('pointerdown', () => { this.jumpPressed = true; });
    interact.container.on('pointerdown', () => this.handleInteraction());

    this.input.on('pointerup', this.releaseTouchPointer, this);
    this.input.on('gameout', this.clearTouchState, this);
  }

  releaseTouchPointer(pointer) {
    for (const key of ['left', 'right']) {
      if (this.touchPointers[key] === pointer.id) {
        this.touchPointers[key] = null;
        this.touch[key] = false;
      }
    }
  }

  clearTouchState() {
    this.touch.left = false;
    this.touch.right = false;
    this.touchPointers.left = null;
    this.touchPointers.right = null;
    this.jumpPressed = false;
    this.jumpQueuedAt = -Infinity;
  }

  update() {
    if (!this.player || !this.cursors || !this.wasd) return;

    this.playerShadow.setVisible(this.player.body.blocked.down || this.player.body.touching.down);
    this.playerShadow.x = this.player.x;
    this.playerShadow.y = this.player.y + 40;

    const cam = this.cameras.main;
    const maxScroll = Math.max(1, this.worldWidth - cam.width);
    this.progressLine.setDisplaySize(cam.width * Math.min(1, cam.scrollX / maxScroll), 3);

    if (!this.canMove) return;

    const leftDown = this.cursors.left?.isDown || this.wasd.left?.isDown || this.touch.left;
    const rightDown = this.cursors.right?.isDown || this.wasd.right?.isDown || this.touch.right;

    let velocityX = 0;
    if (leftDown) {
      velocityX = -PLAYER_SPEED;
      this.player.setFlipX(true);
    } else if (rightDown) {
      velocityX = PLAYER_SPEED;
      this.player.setFlipX(false);
    }
    this.player.setVelocityX(velocityX);

    const now = this.time.now;
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;
    if (onGround) this.lastGroundedAt = now;

    const jumpDown = Phaser.Input.Keyboard.JustDown(this.jumpKey) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.up);
    if (jumpDown || this.jumpPressed) {
      this.jumpQueuedAt = now;
      this.jumpPressed = false;
    }

    // Buffer taps made just before landing and allow a late jump just after
    // walking off a ledge, so touch controls feel much less picky.
    const jumpBuffered = now - this.jumpQueuedAt <= JUMP_BUFFER_MS;
    const canJump = onGround || now - this.lastGroundedAt <= COYOTE_MS;

    if (jumpBuffered && canJump) {
      this.player.setVelocityY(JUMP_VELOCITY);
      this.jumpQueuedAt = -Infinity;
      this.lastGroundedAt = -Infinity;
      this.cameras.main.shake(90, 0.0012);
      this.spawnBurst(this.player.x, this.player.y + 30, 0xffffff, 4);
    }

    if (onGround) {
      const current = this.player.anims.currentAnim?.key;
      if (velocityX !== 0 && current !== 'walk') this.player.play('walk');
      if (velocityX === 0 && current !== 'idle') this.player.play('idle');
    } else if (this.player.anims.currentAnim?.key !== 'idle') {
      this.player.anims.stop();
    }

    if (this.interactIndicator) {
      this.interactIndicator.setPosition(this.player.x, this.player.y - 76);
    }

    this.checkZone();
  }
}
