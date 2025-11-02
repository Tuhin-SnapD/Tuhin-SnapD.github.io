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
  }

  create() {
    const mapData = this.cache.json.get('mapData');
    if (!mapData) {
      console.error('Failed to load mapData');
      return;
    }
    
    // Calculate world width based on zones (horizontal layout)
    // Find the furthest zone position
    let maxZoneX = 0;
    if (mapData.zones && mapData.zones.length > 0) {
      mapData.zones.forEach(zone => {
        const zoneEnd = zone.x + zone.width;
        if (zoneEnd > maxZoneX) {
          maxZoneX = zoneEnd;
        }
      });
    }
    const worldWidth = Math.max(mapData.width * mapData.tileWidth, maxZoneX + 500); // Add buffer
    const worldHeight = 600; // Fixed height for side-scrolling
    this.groundY = worldHeight - 100; // Ground level
    
    // Create Mario-style background
    this.createBackground(worldWidth, worldHeight);
    
    // Create platforms group
    this.platforms = this.physics.add.staticGroup();
    
    // Create ground platform (full width) - Mario World style wavy grass
    const ground = this.platforms.create(0, this.groundY + 16, 'grass');
    ground.setScale(worldWidth / 32, 1);
    ground.setOrigin(0, 0);
    ground.refreshBody();
    
    // Create additional platforms at different heights for variety
    const platformY1 = this.groundY - 150;
    const platformY2 = this.groundY - 250;
    
    // Platform 1 (medium height) with Mario-style grass
    const platform1 = this.platforms.create(800, platformY1, 'grass');
    platform1.setScale(200 / 32, 1);
    platform1.setOrigin(0, 0);
    platform1.refreshBody();
    
    // Platform 2 (higher)
    const platform2 = this.platforms.create(1500, platformY2, 'grass');
    platform2.setScale(200 / 32, 1);
    platform2.setOrigin(0, 0);
    platform2.refreshBody();
    
    // Platform 3 (ground level, connecting)
    const platform3 = this.platforms.create(2500, this.groundY + 16, 'grass');
    platform3.setScale(300 / 32, 1);
    platform3.setOrigin(0, 0);
    platform3.refreshBody();
    
    // Create zone areas (positioned horizontally)
    this.createZones(mapData.zones, worldWidth);
    
    // Create player
    this.player = this.physics.add.sprite(100, this.groundY - 50, 'player_idle');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(1.5);
    this.player.body.setSize(12, 12);
    
    // Player collision with platforms
    this.physics.add.collider(this.player, this.platforms);
    
    // Add decorative Mario blocks (after player is created for collision)
    this.createDecorativeBlocks(worldWidth);
    
    // Create player animations
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

    // Camera follows player (horizontally only)
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, false, 1, 0, 0, 100);
    this.cameras.main.setZoom(1);
    
    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // WASD support (A/D for left/right, W/SPACE for jump)
    this.wasd = {
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
    
    // Jump key (Space and W)
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.wasd.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

    // Interaction key
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.interactKey.on('down', () => this.handleInteraction());

    // Touch controls for mobile
    this.setupTouchControls();

    // Interaction indicator (positioned relative to player)
    this.interactIndicator = this.add.text(
      this.player.x,
      this.player.y - 30,
      'Press E',
      {
        font: '12px monospace',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 }
      }
    );
    this.interactIndicator.setOrigin(0.5);
    this.interactIndicator.setVisible(false);
    this.interactIndicator.setDepth(1000);

    // Settings UI (music toggle, resume button)
    this.createSettingsUI();
  }

  createSettingsUI() {
    const padding = 20;
    const btnSize = 40;
    const btnY = padding + btnSize / 2;

    // Music toggle button
    this.musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
    this.musicBtn = this.add.rectangle(
      this.cameras.main.width - padding - btnSize / 2,
      btnY,
      btnSize,
      btnSize,
      this.musicEnabled ? 0x4ade80 : 0x6b7280,
      0.7
    );
    this.musicBtn.setScrollFactor(0);
    this.musicBtn.setStrokeStyle(1, 0xffffff);
    this.musicBtn.setInteractive({ useHandCursor: true });

    this.musicText = this.add.text(
      this.musicBtn.x,
      this.musicBtn.y,
      '♪',
      {
        font: '20px monospace',
        fill: '#ffffff'
      }
    );
    this.musicText.setOrigin(0.5);
    this.musicText.setScrollFactor(0);

    this.musicBtn.on('pointerdown', () => {
      this.musicEnabled = !this.musicEnabled;
      localStorage.setItem('musicEnabled', this.musicEnabled.toString());
      this.musicBtn.setFillStyle(this.musicEnabled ? 0x4ade80 : 0x6b7280, 0.7);
      
      if (this.music) {
        if (this.musicEnabled) {
          this.music.play();
        } else {
          this.music.stop();
        }
      }
    });

    // Resume download button
    const resumeBtn = this.add.rectangle(
      this.cameras.main.width - padding - btnSize / 2 - btnSize - 10,
      btnY,
      btnSize * 1.5,
      btnSize,
      0x818cf8,
      0.7
    );
    resumeBtn.setScrollFactor(0);
    resumeBtn.setStrokeStyle(1, 0xffffff);
    resumeBtn.setInteractive({ useHandCursor: true });

    const resumeText = this.add.text(
      resumeBtn.x,
      resumeBtn.y,
      '📄',
      {
        font: '18px monospace',
        fill: '#ffffff'
      }
    );
    resumeText.setOrigin(0.5);
    resumeText.setScrollFactor(0);

    resumeBtn.on('pointerdown', () => {
      window.open('/resume.pdf', '_blank');
    });
  }

  createZones(zoneConfigs, worldWidth) {
    zoneConfigs.forEach((zoneConfig) => {
      // Use coordinates from mapData (already in pixels)
      const zoneX = zoneConfig.x;
      const zoneY = this.groundY - 50; // On ground level
      const zoneWidth = zoneConfig.width;
      const zoneHeight = zoneConfig.height;
      
      // Create collision zone
      const zone = this.add.zone(
        zoneX + zoneWidth / 2,
        zoneY,
        zoneWidth,
        zoneHeight
      );
      zone.setData('id', zoneConfig.id);
      this.physics.world.enable(zone);
      zone.body.setAllowGravity(false);
      zone.body.setImmovable(true);
      
      // Visual indicator - more visible
      const zoneRect = this.add.rectangle(
        zoneX + zoneWidth / 2,
        zoneY,
        zoneWidth,
        zoneHeight,
        0x4ade80,
        0.3
      );
      zoneRect.setStrokeStyle(3, 0x4ade80, 1.0);
      zoneRect.setDepth(100);
      
      // Add a pulsing effect to make zones more noticeable
      this.tweens.add({
        targets: zoneRect,
        alpha: { from: 0.3, to: 0.6 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      // Zone label - larger and more prominent
      const zoneLabel = this.add.text(
        zoneX + zoneWidth / 2,
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
      zoneLabel.setOrigin(0.5);
      zoneLabel.setDepth(101);
      
      // Add an icon/marker above the label
      const marker = this.add.text(
        zoneX + zoneWidth / 2,
        zoneY - 100,
        '📍',
        {
          font: '24px monospace'
        }
      );
      marker.setOrigin(0.5);
      marker.setDepth(101);
      
      // Add pulsing to marker
      this.tweens.add({
        targets: marker,
        y: { from: zoneY - 100, to: zoneY - 95 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.zones.push({ zone, config: zoneConfig, label: zoneLabel, marker: marker, rect: zoneRect });
    });
  }

  update() {
    if (!this.canMove || !this.player) return;
    if (!this.cursors || !this.wasd) return;

    const speed = 200;
    let velocityX = 0;
    
    // Left/Right movement
    if ((this.cursors.left && this.cursors.left.isDown) || (this.wasd.left && this.wasd.left.isDown)) {
      velocityX = -speed;
      this.player.setFlipX(true);
    } else if ((this.cursors.right && this.cursors.right.isDown) || (this.wasd.right && this.wasd.right.isDown)) {
      velocityX = speed;
      this.player.setFlipX(false);
    }
    
    this.player.setVelocityX(velocityX);

    // Jumping (only when touching ground/platform)
    const isOnGround = this.player.body.touching.down;
    
    // Check for jump input (keyboard or touch)
    const shouldJump = (Phaser.Input.Keyboard.JustDown(this.jumpKey) || 
                        Phaser.Input.Keyboard.JustDown(this.wasd.up) ||
                        (this.jumpPressed && isOnGround));
    
    if (shouldJump && isOnGround) {
      this.player.setVelocityY(-400);
      this.isJumping = true;
      this.jumpPressed = false; // Reset touch jump flag
    }
    
    // Reset jump flag when on ground
    if (isOnGround) {
      this.isJumping = false;
    }

    // Update animation based on movement
    if (velocityX !== 0 && isOnGround) {
      if (!this.player.anims.currentAnim || this.player.anims.currentAnim.key !== 'walk') {
        this.player.play('walk');
      }
    } else if (isOnGround) {
      if (!this.player.anims.currentAnim || this.player.anims.currentAnim.key !== 'idle') {
        this.player.play('idle');
      }
    }

    // Update interaction indicator position to follow player
    if (this.interactIndicator) {
      this.interactIndicator.setPosition(this.player.x, this.player.y - 30);
    }

    // Check zone collisions
    this.checkZoneCollisions();
  }

  checkZoneCollisions() {
    if (!this.player) return;
    
    let inZone = false;
    let currentZone = null;

    this.zones.forEach(({ zone, config }) => {
      if (Phaser.Geom.Rectangle.Contains(zone.getBounds(), this.player.x, this.player.y)) {
        inZone = true;
        currentZone = config.id;
      }
    });

    if (inZone && currentZone !== this.currentZone) {
      this.currentZone = currentZone;
      if (this.interactIndicator) {
        this.interactIndicator.setVisible(true);
      }
      
      // Mark zone as visited in localStorage
      const visited = JSON.parse(localStorage.getItem('visitedZones') || '[]');
      if (!visited.includes(currentZone)) {
        visited.push(currentZone);
        localStorage.setItem('visitedZones', JSON.stringify(visited));
      }
    } else if (!inZone) {
      this.currentZone = null;
      if (this.interactIndicator) {
        this.interactIndicator.setVisible(false);
      }
    }
  }

  handleInteraction() {
    if (this.currentZone && this.canMove) {
      const locationsData = this.cache.json.get('locations');
      if (!locationsData) {
        console.error('Failed to load locations data');
        return;
      }
      
      const locationData = locationsData[this.currentZone];
      if (locationData) {
        this.canMove = false;
        this.player.setVelocity(0, 0);
        
        // Show modal via UI scene
        this.scene.launch('UIScene', {
          locationId: this.currentZone,
          locationData: locationData
        });
      } else {
        console.warn(`No location data found for zone: ${this.currentZone}`);
      }
    }
  }

  setupTouchControls() {
    const buttonSize = 60;
    const padding = 20;
    
    // Left button
    const leftBtn = this.add.rectangle(
      padding + buttonSize / 2,
      this.cameras.main.height - padding - buttonSize / 2,
      buttonSize,
      buttonSize,
      0xffffff,
      0.4
    );
    leftBtn.setScrollFactor(0);
    leftBtn.setInteractive({ useHandCursor: true });
    
    const leftText = this.add.text(leftBtn.x, leftBtn.y, '←', {
      font: '28px monospace',
      fill: '#ffffff'
    });
    leftText.setOrigin(0.5);
    leftText.setScrollFactor(0);

    // Right button
    const rightBtn = this.add.rectangle(
      padding + buttonSize * 2,
      this.cameras.main.height - padding - buttonSize / 2,
      buttonSize,
      buttonSize,
      0xffffff,
      0.4
    );
    rightBtn.setScrollFactor(0);
    rightBtn.setInteractive({ useHandCursor: true });
    
    const rightText = this.add.text(rightBtn.x, rightBtn.y, '→', {
      font: '28px monospace',
      fill: '#ffffff'
    });
    rightText.setOrigin(0.5);
    rightText.setScrollFactor(0);

    // Jump button (larger, positioned between movement and interact)
    const jumpBtn = this.add.rectangle(
      padding + buttonSize * 4,
      this.cameras.main.height - padding - buttonSize / 2,
      buttonSize * 1.2,
      buttonSize,
      0x4ade80,
      0.6
    );
    jumpBtn.setScrollFactor(0);
    jumpBtn.setInteractive({ useHandCursor: true });
    
    const jumpText = this.add.text(jumpBtn.x, jumpBtn.y, '↑', {
      font: '28px monospace',
      fill: '#ffffff'
    });
    jumpText.setOrigin(0.5);
    jumpText.setScrollFactor(0);

    // Touch handlers for left/right
    leftBtn.on('pointerdown', () => {
      if (this.wasd && this.wasd.left) {
        this.wasd.left.isDown = true;
      }
    });
    leftBtn.on('pointerup', () => {
      if (this.wasd && this.wasd.left) {
        this.wasd.left.isDown = false;
      }
    });
    leftBtn.on('pointerout', () => {
      if (this.wasd && this.wasd.left) {
        this.wasd.left.isDown = false;
      }
    });

    rightBtn.on('pointerdown', () => {
      if (this.wasd && this.wasd.right) {
        this.wasd.right.isDown = true;
      }
    });
    rightBtn.on('pointerup', () => {
      if (this.wasd && this.wasd.right) {
        this.wasd.right.isDown = false;
      }
    });
    rightBtn.on('pointerout', () => {
      if (this.wasd && this.wasd.right) {
        this.wasd.right.isDown = false;
      }
    });

    // Jump button handler - store flag to trigger jump in update
    this.jumpPressed = false;
    jumpBtn.on('pointerdown', () => {
      this.jumpPressed = true;
    });

    // Interaction button (right side)
    const interactBtn = this.add.rectangle(
      this.cameras.main.width - padding - buttonSize / 2,
      this.cameras.main.height - padding - buttonSize / 2,
      buttonSize * 1.5,
      buttonSize,
      0x818cf8,
      0.7
    );
    interactBtn.setScrollFactor(0);
    interactBtn.setInteractive({ useHandCursor: true });
    
    const interactText = this.add.text(interactBtn.x, interactBtn.y, 'E', {
      font: '20px monospace',
      fill: '#ffffff',
      fontWeight: 'bold'
    });
    interactText.setOrigin(0.5);
    interactText.setScrollFactor(0);

    interactBtn.on('pointerdown', () => {
      this.handleInteraction();
    });

    // Store touch controls for toggling
    this.touchControls = {
      leftBtn, rightBtn, jumpBtn, interactBtn,
      leftText, rightText, jumpText, interactText
    };
    
    // Hide buttons on desktop
    const device = this.sys.game.device;
    const hasTouch = (device && device.input && device.input.touch) || 
                     (typeof window !== 'undefined' && 'ontouchstart' in window) || 
                     (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
    if (!hasTouch) {
      leftBtn.setVisible(false);
      rightBtn.setVisible(false);
      jumpBtn.setVisible(false);
      interactBtn.setVisible(false);
      leftText.setVisible(false);
      rightText.setVisible(false);
      jumpText.setVisible(false);
      interactText.setVisible(false);
    }
  }

  createBackground(worldWidth, worldHeight) {
    // Create background sky tiles
    for (let x = 0; x < worldWidth; x += 256) {
      for (let y = 0; y < worldHeight / 2; y += 256) {
        const skyTile = this.add.image(x, y, 'sky');
        skyTile.setOrigin(0, 0);
        skyTile.setDepth(-100);
      }
    }
    
    // Add mountains in the background (far right area)
    const mountains = this.add.group();
    for (let i = 0; i < 3; i++) {
      const mountain = this.add.image(3000 + i * 150, this.groundY - 50, 'mountain');
      mountain.setOrigin(0.5, 1);
      mountain.setScale(0.8 + i * 0.2);
      mountain.setDepth(-50);
      mountains.add(mountain);
    }
    
    // Add clouds scattered across the sky
    const cloudPositions = [
      { x: 200, y: 50 },
      { x: 600, y: 80 },
      { x: 1200, y: 60 },
      { x: 1800, y: 100 },
      { x: 2400, y: 40 },
      { x: 2800, y: 90 },
      { x: 100, y: 120 },
      { x: 900, y: 140 }
    ];
    
    cloudPositions.forEach(pos => {
      const cloudType = Math.random() > 0.5 ? 'cloud' : 'big_cloud';
      const cloud = this.add.image(pos.x, pos.y, cloudType);
      cloud.setOrigin(0.5, 0.5);
      cloud.setDepth(-30);
      
      // Add some parallax effect by placing at different depths
      if (cloudType === 'big_cloud') {
        cloud.setDepth(-20);
      }
    });
    
    // Add bushes on the ground
    const bushPositions = [
      { x: 300, y: this.groundY },
      { x: 700, y: this.groundY },
      { x: 1100, y: this.groundY },
      { x: 2000, y: this.groundY },
      { x: 2700, y: this.groundY },
      { x: 3100, y: this.groundY }
    ];
    
    bushPositions.forEach(pos => {
      const bush = this.add.image(pos.x, pos.y, 'bush');
      bush.setOrigin(0.5, 1);
      bush.setDepth(10);
    });
  }

  createDecorativeBlocks(worldWidth) {
    // Add question mark blocks at various heights
    const qBlockPositions = [
      { x: 600, y: this.groundY - 120 },
      { x: 1200, y: this.groundY - 80 },
      { x: 1400, y: this.groundY - 200 },
      { x: 2100, y: this.groundY - 100 },
      { x: 2400, y: this.groundY - 150 },
      { x: 2900, y: this.groundY - 80 }
    ];
    
    const questionBlocks = this.physics.add.staticGroup();
    qBlockPositions.forEach(pos => {
      const qBlock = questionBlocks.create(pos.x, pos.y, 'question_block');
      qBlock.setOrigin(0.5, 0.5);
      qBlock.setScale(1);
    });
    
    // Add solid blocks
    const solidBlockPositions = [
      { x: 650, y: this.groundY - 120 },
      { x: 1250, y: this.groundY - 80 },
      { x: 1450, y: this.groundY - 200 },
      { x: 1466, y: this.groundY - 200 },
      { x: 2150, y: this.groundY - 100 }
    ];
    
    solidBlockPositions.forEach(pos => {
      const solidBlock = questionBlocks.create(pos.x, pos.y, 'solid_block');
      solidBlock.setOrigin(0.5, 0.5);
      solidBlock.setScale(1);
    });
    
    // Add brick blocks as platforms
    const brickPositions = [
      { x: 900, y: this.groundY - 60 },
      { x: 1050, y: this.groundY - 120 },
      { x: 2200, y: this.groundY - 60 }
    ];
    
    brickPositions.forEach(pos => {
      const brick = questionBlocks.create(pos.x, pos.y, 'brick');
      brick.setOrigin(0.5, 0.5);
      brick.setScale(1);
    });
    
    // Player collides with decorative blocks
    this.physics.add.collider(this.player, questionBlocks);
  }

  resumeMovement() {
    this.canMove = true;
  }
}