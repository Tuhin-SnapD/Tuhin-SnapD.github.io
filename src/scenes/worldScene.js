const PLAYER_SPEED = 200;
const JUMP_VELOCITY = -400;

const COIN_POSITIONS_OFFSETS = [
  { x: 400, dy: 100 },
  { x: 850, dy: 220 },
  { x: 1250, dy: 180 },
  { x: 1450, dy: 250 },
  { x: 1700, dy: 100 },
  { x: 2150, dy: 150 },
  { x: 2450, dy: 200 },
  { x: 2750, dy: 120 },
  { x: 3000, dy: 100 },
  { x: 1000, dy: 150 }
];

function hasTouchInput(scene) {
  const device = scene.sys.game.device;
  return (device?.input?.touch) ||
         (typeof window !== 'undefined' && 'ontouchstart' in window) ||
         (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
}

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' });
    this.cursors = null;
    this.player = null;
    this.platforms = null;
    this.zones = [];
    this.currentZone = null;
    this.canMove = true;
    this.isJumping = false;
    this.jumpKey = null;
    this.jumpPressed = false;
    this.groundY = 0;
    this.coins = null;
    this.collectedCoins = 0;
    this.zoneGlows = [];
    this.backgroundLayers = [];
    this.indicatorPulseTween = null;
    this.resumeUrl = '/resume.pdf';
  }

  create() {
    this.resumeUrl = (import.meta.env?.BASE_URL || '/') + 'resume.pdf';

    const mapData = this.cache.json.get('mapData');
    if (!mapData) {
      console.error('Failed to load mapData');
      return;
    }

    let maxZoneX = 0;
    if (mapData.zones?.length) {
      for (const zone of mapData.zones) {
        maxZoneX = Math.max(maxZoneX, zone.x + zone.width);
      }
    }
    const worldWidth = Math.max(mapData.width * mapData.tileWidth, maxZoneX + 500);
    const worldHeight = 600;
    this.groundY = worldHeight - 100;

    this.createBackground(worldWidth, worldHeight);

    this.platforms = this.physics.add.staticGroup();

    const ground = this.platforms.create(0, this.groundY + 16, 'grass');
    ground.setScale(worldWidth / 32, 1);
    ground.setOrigin(0, 0);
    ground.refreshBody();

    const platformY1 = this.groundY - 150;
    const platformY2 = this.groundY - 250;

    const platform1 = this.platforms.create(800, platformY1, 'grass');
    platform1.setScale(200 / 32, 1);
    platform1.setOrigin(0, 0);
    platform1.refreshBody();

    const platform2 = this.platforms.create(1500, platformY2, 'grass');
    platform2.setScale(200 / 32, 1);
    platform2.setOrigin(0, 0);
    platform2.refreshBody();

    const platform3 = this.platforms.create(2500, this.groundY + 16, 'grass');
    platform3.setScale(300 / 32, 1);
    platform3.setOrigin(0, 0);
    platform3.refreshBody();

    this.createZones(mapData.zones);

    this.player = this.physics.add.sprite(100, this.groundY - 50, 'player_idle');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(1.5);
    this.player.body.setSize(12, 12);

    this.tweens.add({
      targets: this.player,
      alpha: { from: 0.95, to: 1 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.physics.add.collider(this.player, this.platforms);

    this.coins = this.physics.add.group({ defaultKey: 'coin', maxSize: 50 });

    this.createDecorativeBlocks();

    this.collectedCoins = parseInt(localStorage.getItem('collectedCoins') || '0', 10) || 0;
    this.createCoins();
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    this.createCoinCounter();

    this.anims.create({
      key: 'idle',
      frames: [{ key: 'player_idle' }],
      frameRate: 1,
      repeat: -1
    });

    this.anims.create({
      key: 'walk',
      frames: [
        { key: 'player_walk1' },
        { key: 'player_idle' },
        { key: 'player_walk2' },
        { key: 'player_idle' }
      ],
      frameRate: 8,
      repeat: -1
    });

    this.player.play('idle');

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12, 0, 80);
    this.cameras.main.setDeadzone(120, 40);
    this.cameras.main.setZoom(1);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    };
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.interactKey.on('down', () => this.handleInteraction());

    this.setupTouchControls();
    this.createInteractIndicator();
    this.createSettingsUI();
  }

  createInteractIndicator() {
    this.interactIndicator = this.add.container(this.player.x, this.player.y - 30);
    const bg = this.add.rectangle(0, 0, 80, 30, 0x4ade80, 0.9);
    bg.setStrokeStyle(2, 0xffffff);
    const txt = this.add.text(0, 0, 'Press E', {
      font: 'bold 14px monospace',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    txt.setOrigin(0.5);
    this.interactIndicator.add([bg, txt]);
    this.interactIndicator.setVisible(false);
    this.interactIndicator.setDepth(1000);

    this.indicatorPulseTween = this.tweens.add({
      targets: this.interactIndicator,
      scale: { from: 0.9, to: 1.1 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      paused: true
    });
  }

  createCoinCounter() {
    const { width } = this.cameras.main;
    this.coinCounter = this.add.text(width - 120, 60, `💰 ${this.collectedCoins}`, {
      font: 'bold 18px monospace',
      fill: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.coinCounter.setScrollFactor(0);
    this.coinCounter.setDepth(2000);
  }

  updateCoinCounter() {
    if (this.coinCounter) {
      this.coinCounter.setText(`💰 ${this.collectedCoins}`);
    }
  }

  attachButtonFeedback(button, { hoverScale = 1.1, pressScale = 0.9, onClick } = {}) {
    button.on('pointerover', () => {
      this.tweens.add({ targets: button, scale: hoverScale, duration: 150, ease: 'Power2' });
    });
    button.on('pointerout', () => {
      this.tweens.add({ targets: button, scale: 1, duration: 150, ease: 'Power2' });
    });
    button.on('pointerdown', () => {
      this.tweens.add({
        targets: button,
        scale: pressScale,
        duration: 100,
        yoyo: true,
        ease: 'Power2',
        onComplete: onClick
      });
    });
  }

  createSettingsUI() {
    const padding = 20;
    const btnSize = 40;
    const btnY = padding + btnSize / 2;
    const camWidth = this.cameras.main.width;

    this.musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
    this.musicBtn = this.add.rectangle(
      camWidth - padding - btnSize / 2,
      btnY,
      btnSize,
      btnSize,
      this.musicEnabled ? 0x4ade80 : 0x6b7280,
      0.7
    );
    this.musicBtn.setScrollFactor(0);
    this.musicBtn.setStrokeStyle(1, 0xffffff);
    this.musicBtn.setInteractive({ useHandCursor: true });

    this.musicText = this.add.text(this.musicBtn.x, this.musicBtn.y, '♪', {
      font: '20px monospace',
      fill: '#ffffff'
    });
    this.musicText.setOrigin(0.5).setScrollFactor(0);

    this.attachButtonFeedback(this.musicBtn, {
      onClick: () => {
        this.musicEnabled = !this.musicEnabled;
        localStorage.setItem('musicEnabled', this.musicEnabled.toString());
        this.musicBtn.setFillStyle(this.musicEnabled ? 0x4ade80 : 0x6b7280, 0.7);
        if (this.music) {
          if (this.musicEnabled) this.music.play();
          else this.music.stop();
        }
      }
    });

    const resumeBtn = this.add.rectangle(
      camWidth - padding - btnSize / 2 - btnSize - 10,
      btnY,
      btnSize * 1.5,
      btnSize,
      0x818cf8,
      0.7
    );
    resumeBtn.setScrollFactor(0);
    resumeBtn.setStrokeStyle(1, 0xffffff);
    resumeBtn.setInteractive({ useHandCursor: true });

    const resumeText = this.add.text(resumeBtn.x, resumeBtn.y, '📄', {
      font: '18px monospace',
      fill: '#ffffff'
    });
    resumeText.setOrigin(0.5).setScrollFactor(0);

    this.attachButtonFeedback(resumeBtn, {
      onClick: () => window.open(this.resumeUrl, '_blank', 'noopener,noreferrer')
    });
  }

  createZones(zoneConfigs) {
    zoneConfigs.forEach((zoneConfig) => {
      const zoneX = zoneConfig.x;
      const zoneY = this.groundY - 50;
      const zoneWidth = zoneConfig.width;
      const zoneHeight = zoneConfig.height;
      const cx = zoneX + zoneWidth / 2;

      const zone = this.add.zone(cx, zoneY, zoneWidth, zoneHeight);
      zone.setData('id', zoneConfig.id);
      this.physics.world.enable(zone);
      zone.body.setAllowGravity(false);
      zone.body.setImmovable(true);

      const zoneRect = this.add.rectangle(cx, zoneY, zoneWidth, zoneHeight, 0x4ade80, 0.3);
      zoneRect.setStrokeStyle(3, 0x4ade80, 1.0);
      zoneRect.setDepth(100);

      const glow1 = this.add.rectangle(cx, zoneY, zoneWidth + 10, zoneHeight + 10, 0x4ade80, 0.2);
      glow1.setStrokeStyle(2, 0x4ade80, 0.6);
      glow1.setDepth(99);

      const glow2 = this.add.rectangle(cx, zoneY, zoneWidth + 20, zoneHeight + 20, 0x4ade80, 0.1);
      glow2.setStrokeStyle(1, 0x4ade80, 0.4);
      glow2.setDepth(98);

      this.tweens.add({
        targets: zoneRect,
        alpha: { from: 0.3, to: 0.6 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.tweens.add({
        targets: glow1,
        alpha: { from: 0.1, to: 0.3 },
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.tweens.add({
        targets: glow2,
        alpha: { from: 0.05, to: 0.15 },
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.zoneGlows.push({ rect: zoneRect, glow1, glow2 });

      const label = this.add.text(
        cx,
        zoneY - 70,
        zoneConfig.id.charAt(0).toUpperCase() + zoneConfig.id.slice(1).replace(/([A-Z])/g, ' $1'),
        {
          font: 'bold 20px monospace',
          fill: '#4ade80',
          align: 'center',
          stroke: '#000000',
          strokeThickness: 4
        }
      );
      label.setOrigin(0.5).setDepth(101);

      const marker = this.add.text(cx, zoneY - 100, '📍', { font: '24px monospace' });
      marker.setOrigin(0.5).setDepth(101);

      this.tweens.add({
        targets: marker,
        y: { from: zoneY - 100, to: zoneY - 95 },
        scale: { from: 1, to: 1.2 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      const sparkles = this.add.particles(marker.x, marker.y, 'coin', {
        scale: { start: 0.3, end: 0 },
        speed: { min: 10, max: 20 },
        lifespan: 2000,
        frequency: 500,
        quantity: 1,
        tint: [0x4ade80, 0x60a5fa, 0xa78bfa]
      });
      sparkles.setDepth(102);

      this.zones.push({ zone, config: zoneConfig, label, marker, rect: zoneRect, sparkles });
    });
  }

  update() {
    if (!this.canMove || !this.player || !this.cursors || !this.wasd) return;

    let velocityX = 0;
    const leftDown = this.cursors.left?.isDown || this.wasd.left?.isDown;
    const rightDown = this.cursors.right?.isDown || this.wasd.right?.isDown;

    if (leftDown) {
      velocityX = -PLAYER_SPEED;
      this.player.setFlipX(true);
    } else if (rightDown) {
      velocityX = PLAYER_SPEED;
      this.player.setFlipX(false);
    }
    this.player.setVelocityX(velocityX);

    const isOnGround = this.player.body.touching.down;
    const shouldJump = (
      Phaser.Input.Keyboard.JustDown(this.jumpKey) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.up) ||
      (this.jumpPressed && isOnGround)
    );

    if (shouldJump && isOnGround) {
      this.player.setVelocityY(JUMP_VELOCITY);
      this.isJumping = true;
      this.jumpPressed = false;
      this.cameras.main.shake(100, 0.0015);

      const jumpParticles = this.add.particles(this.player.x, this.player.y + 8, 'coin', {
        scale: { start: 0.3, end: 0 },
        speed: { min: 20, max: 40 },
        angle: { min: 250, max: 290 },
        lifespan: 300,
        quantity: 3,
        tint: 0xffffff
      });
      this.time.delayedCall(300, () => jumpParticles.destroy());
    }

    if (isOnGround) this.isJumping = false;

    const currentAnim = this.player.anims.currentAnim?.key;
    if (velocityX !== 0 && isOnGround) {
      if (currentAnim !== 'walk') this.player.play('walk');
    } else if (isOnGround) {
      if (currentAnim !== 'idle') this.player.play('idle');
    }

    if (this.interactIndicator) {
      this.interactIndicator.setPosition(this.player.x, this.player.y - 35);
    }

    this.checkZoneCollisions();
    this.updateParallax();
  }

  updateParallax() {
    if (!this.player || !this.backgroundLayers?.length) return;
    const scrollX = this.cameras.main.scrollX;
    for (const layer of this.backgroundLayers) {
      const positions = layer.originalPositions;
      const entries = layer.group?.children?.entries;
      if (!positions || !entries) continue;
      const offset = scrollX * (1 - layer.speed);
      for (let i = 0; i < entries.length; i++) {
        const original = positions[i];
        if (original) entries[i].x = original.x - offset;
      }
    }
  }

  collectCoin(player, coin) {
    this.cameras.main.shake(100, 0.003);

    const positionKey = coin.getData('positionKey') || `${coin.x},${coin.y}`;

    const particles = this.add.particles(coin.x, coin.y, 'coin', {
      scale: { start: 0.5, end: 0 },
      speed: { min: 50, max: 100 },
      lifespan: 500,
      quantity: 5,
      tint: [0xffd700, 0xffed4e, 0xffff00]
    });

    coin.disableBody(true, true);

    this.collectedCoins++;
    const collected = JSON.parse(localStorage.getItem('collectedCoinPositions') || '[]');
    if (!collected.includes(positionKey)) {
      collected.push(positionKey);
      localStorage.setItem('collectedCoinPositions', JSON.stringify(collected));
    }
    localStorage.setItem('collectedCoins', this.collectedCoins.toString());
    this.updateCoinCounter();

    this.time.delayedCall(500, () => particles?.destroy?.());
  }

  createCoins() {
    const collected = JSON.parse(localStorage.getItem('collectedCoinPositions') || '[]');

    for (const { x, dy } of COIN_POSITIONS_OFFSETS) {
      const y = this.groundY - dy;
      const key = `${x},${y}`;
      if (collected.includes(key)) continue;

      const coin = this.coins.create(x, y, 'coin');
      if (!coin) continue;

      coin.setScale(0.8);
      coin.setData('positionKey', key);
      coin.body.setAllowGravity(false);
      coin.body.setSize(12, 12);

      this.tweens.add({
        targets: coin,
        y: y - 10,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.tweens.add({
        targets: coin,
        angle: 360,
        duration: 2000,
        repeat: -1,
        ease: 'Linear'
      });
    }
  }

  checkZoneCollisions() {
    if (!this.player) return;

    let currentZone = null;
    for (const { zone, config } of this.zones) {
      if (Phaser.Geom.Rectangle.Contains(zone.getBounds(), this.player.x, this.player.y)) {
        currentZone = config.id;
        break;
      }
    }

    if (currentZone && currentZone !== this.currentZone) {
      this.currentZone = currentZone;
      if (this.interactIndicator) {
        this.interactIndicator.setVisible(true);
        this.indicatorPulseTween?.resume();
        this.tweens.add({
          targets: this.interactIndicator,
          scale: { from: 1, to: 1.2 },
          duration: 200,
          yoyo: true,
          ease: 'Power2'
        });
      }

      const zoneInfo = this.zones.find(z => z.config.id === currentZone);
      if (zoneInfo?.rect) {
        this.tweens.add({
          targets: zoneInfo.rect,
          alpha: { from: 0.6, to: 1 },
          duration: 300,
          yoyo: true,
          repeat: 1,
          ease: 'Power2'
        });
      }

      const visited = JSON.parse(localStorage.getItem('visitedZones') || '[]');
      if (!visited.includes(currentZone)) {
        visited.push(currentZone);
        localStorage.setItem('visitedZones', JSON.stringify(visited));

        if (zoneInfo && this.player) {
          const celebrationParticles = this.add.particles(this.player.x, this.player.y, 'coin', {
            scale: { start: 0.4, end: 0 },
            speed: { min: 80, max: 120 },
            lifespan: 800,
            quantity: 15,
            tint: [0x4ade80, 0x60a5fa, 0xa78bfa, 0xffd700]
          });
          this.time.delayedCall(800, () => celebrationParticles?.destroy?.());
        }
      }
    } else if (!currentZone && this.currentZone) {
      this.currentZone = null;
      if (this.interactIndicator) {
        this.interactIndicator.setVisible(false);
        this.indicatorPulseTween?.pause();
      }
    }
  }

  handleInteraction() {
    if (!this.currentZone || !this.canMove) return;

    const locationsData = this.cache.json.get('locations');
    if (!locationsData) {
      console.error('Failed to load locations data');
      return;
    }

    const locationData = locationsData[this.currentZone];
    if (!locationData) {
      console.warn(`No location data found for zone: ${this.currentZone}`);
      return;
    }

    this.canMove = false;
    this.player.setVelocity(0, 0);

    this.cameras.main.shake(100, 0.003);
    const interactParticles = this.add.particles(this.player.x, this.player.y, 'coin', {
      scale: { start: 0.5, end: 0 },
      speed: { min: 50, max: 150 },
      lifespan: 600,
      quantity: 10,
      tint: [0x4ade80, 0x60a5fa, 0xa78bfa]
    });
    this.time.delayedCall(600, () => interactParticles.destroy());

    this.cameras.main.flash(200, 255, 255, 255);

    this.scene.launch('UIScene', {
      locationId: this.currentZone,
      locationData,
      resumeUrl: this.resumeUrl
    });
  }

  setupTouchControls() {
    this.jumpPressed = false;
    if (!hasTouchInput(this)) return;

    const buttonSize = 60;
    const padding = 20;
    const camWidth = this.cameras.main.width;
    const camHeight = this.cameras.main.height;
    const rowY = camHeight - padding - buttonSize / 2;

    const mkBtn = (x, w, color, alpha, label, labelSize = 28) => {
      const rect = this.add.rectangle(x, rowY, w, buttonSize, color, alpha);
      rect.setScrollFactor(0);
      rect.setInteractive({ useHandCursor: true });
      const text = this.add.text(rect.x, rect.y, label, {
        font: `${labelSize}px monospace`,
        fill: '#ffffff'
      });
      text.setOrigin(0.5).setScrollFactor(0);
      return { rect, text };
    };

    const left = mkBtn(padding + buttonSize / 2, buttonSize, 0xffffff, 0.4, '←');
    const right = mkBtn(padding + buttonSize * 2, buttonSize, 0xffffff, 0.4, '→');
    const jump = mkBtn(padding + buttonSize * 4, buttonSize * 1.2, 0x4ade80, 0.6, '↑');
    const interact = mkBtn(camWidth - padding - buttonSize / 2, buttonSize * 1.5, 0x818cf8, 0.7, 'E', 20);

    const wireHold = (btn, key) => {
      const press = () => { if (this.wasd?.[key]) this.wasd[key].isDown = true; };
      const release = () => { if (this.wasd?.[key]) this.wasd[key].isDown = false; };
      btn.on('pointerdown', press);
      btn.on('pointerup', release);
      btn.on('pointerout', release);
      btn.on('pointerupoutside', release);
    };

    wireHold(left.rect, 'left');
    wireHold(right.rect, 'right');

    jump.rect.on('pointerdown', () => { this.jumpPressed = true; });
    interact.rect.on('pointerdown', () => this.handleInteraction());

    this.touchControls = { left, right, jump, interact };
  }

  createBackground(worldWidth, worldHeight) {
    const farBg = this.add.group();
    for (let x = 0; x < worldWidth + 512; x += 256) {
      for (let y = 0; y < worldHeight / 2; y += 256) {
        const tile = this.add.image(x, y, 'sky');
        tile.setOrigin(0, 0);
        tile.setDepth(-100);
        tile.setTint(0x87ceeb);
        farBg.add(tile);
      }
    }
    this.backgroundLayers.push({ group: farBg, speed: 0.2, originalPositions: null });

    const mediumBg = this.add.group();
    for (let x = 0; x < worldWidth + 512; x += 256) {
      for (let y = worldHeight / 2; y < worldHeight; y += 256) {
        const tile = this.add.image(x, y, 'sky');
        tile.setOrigin(0, 0);
        tile.setDepth(-90);
        tile.setTint(0x98d4eb);
        mediumBg.add(tile);
      }
    }
    this.backgroundLayers.push({ group: mediumBg, speed: 0.4, originalPositions: null });

    const mountains = this.add.group();
    const mountainCount = Math.max(5, Math.ceil(worldWidth / 400));
    for (let i = 0; i < mountainCount; i++) {
      const mountain = this.add.image(200 + i * 400, this.groundY - 50, 'mountain');
      mountain.setOrigin(0.5, 1);
      mountain.setScale(0.6 + (i % 3) * 0.15);
      mountain.setDepth(-50);
      mountain.setTint(0xadd8e6);
      mountains.add(mountain);
    }
    this.backgroundLayers.push({ group: mountains, speed: 0.3, originalPositions: null });

    const clouds = this.add.group();
    const cloudSpacing = 450;
    for (let x = 100; x < worldWidth + 200; x += cloudSpacing) {
      const y = 40 + ((x / cloudSpacing) % 3) * 40;
      const cloudType = (x / cloudSpacing) % 2 < 1 ? 'cloud' : 'big_cloud';
      const cloud = this.add.image(x, y, cloudType);
      cloud.setOrigin(0.5, 0.5);
      cloud.setDepth(-30);
      cloud.setTint(0xffffff);
      clouds.add(cloud);
    }
    this.backgroundLayers.push({ group: clouds, speed: 0.1, originalPositions: null });

    for (const layer of this.backgroundLayers) {
      layer.originalPositions = layer.group.children.entries.map(c => ({ x: c.x, y: c.y }));
    }

    const bushSpacing = 400;
    for (let x = 300; x < worldWidth; x += bushSpacing) {
      const bush = this.add.image(x, this.groundY, 'bush');
      bush.setOrigin(0.5, 1);
      bush.setDepth(10);
    }
  }

  createDecorativeBlocks() {
    const decorBlocks = this.physics.add.staticGroup();

    const qBlockPositions = [
      { x: 600, y: this.groundY - 120 },
      { x: 1200, y: this.groundY - 80 },
      { x: 1400, y: this.groundY - 200 },
      { x: 2100, y: this.groundY - 100 },
      { x: 2400, y: this.groundY - 150 },
      { x: 2900, y: this.groundY - 80 }
    ];
    for (const pos of qBlockPositions) {
      decorBlocks.create(pos.x, pos.y, 'question_block').setOrigin(0.5).setScale(1);
    }

    const solidBlockPositions = [
      { x: 650, y: this.groundY - 120 },
      { x: 1250, y: this.groundY - 80 },
      { x: 1450, y: this.groundY - 200 },
      { x: 1482, y: this.groundY - 200 },
      { x: 2150, y: this.groundY - 100 }
    ];
    for (const pos of solidBlockPositions) {
      decorBlocks.create(pos.x, pos.y, 'solid_block').setOrigin(0.5).setScale(1);
    }

    const brickPositions = [
      { x: 900, y: this.groundY - 60 },
      { x: 1050, y: this.groundY - 120 },
      { x: 2200, y: this.groundY - 60 }
    ];
    for (const pos of brickPositions) {
      decorBlocks.create(pos.x, pos.y, 'brick').setOrigin(0.5).setScale(1);
    }

    this.physics.add.collider(this.player, decorBlocks);
  }

  resumeMovement() {
    this.canMove = true;
  }
}
