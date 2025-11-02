export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        fill: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    // Update progress bar
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    this.load.on('loaderror', (file) => {
      console.error('Failed to load:', file.key, file.url);
    });

    // Player sprites will be created dynamically below

    // Load tilemap
    // For now, we'll create a simple map programmatically
    // Later you can replace this with a Tiled map export
    const baseUrl = import.meta.env.BASE_URL || '/';
    this.load.json('mapData', baseUrl + 'data/mapData.json');
    
    // Load locations data
    this.load.json('locations', baseUrl + 'data/locations.json');

    // Load tileset (placeholder - simple colored tiles)
    // In production, replace with actual tileset images
    this.createPlaceholderTiles();
    
    // Create player sprites with animations
    this.createPlayerSprites();
  }

  createPlayerSprites() {
    const size = 16;
    
    // Mario-style idle frame (red cap, blue overalls, brown shirt)
    const idleFrame = this.add.graphics();
    // Red cap
    idleFrame.fillStyle(0xff0000);
    idleFrame.fillRect(2, 0, 12, 4);
    // Brown shirt
    idleFrame.fillStyle(0xa05000);
    idleFrame.fillRect(4, 4, 8, 4);
    // Blue overalls
    idleFrame.fillStyle(0x0080ff);
    idleFrame.fillRect(4, 8, 8, 8);
    // White gloves
    idleFrame.fillStyle(0xffffff);
    idleFrame.fillRect(2, 8, 2, 4);
    idleFrame.fillRect(12, 8, 2, 4);
    // Face/skin
    idleFrame.fillStyle(0xffff80);
    idleFrame.fillRect(5, 4, 6, 3);
    // Eyes
    idleFrame.fillStyle(0x000000);
    idleFrame.fillRect(6, 5, 1, 1);
    idleFrame.fillRect(9, 5, 1, 1);
    // Mustache
    idleFrame.fillStyle(0x000000);
    idleFrame.fillRect(5, 7, 6, 1);
    idleFrame.generateTexture('player_idle', size, size);
    idleFrame.destroy();

    // Walk frame 1 (left leg forward)
    const walk1 = this.add.graphics();
    // Red cap
    walk1.fillStyle(0xff0000);
    walk1.fillRect(2, 0, 12, 4);
    // Brown shirt
    walk1.fillStyle(0xa05000);
    walk1.fillRect(4, 4, 8, 4);
    // Blue overalls
    walk1.fillStyle(0x0080ff);
    walk1.fillRect(4, 8, 8, 8);
    // Left leg extended
    walk1.fillStyle(0x0060cc);
    walk1.fillRect(3, 14, 4, 4);
    // White gloves
    walk1.fillStyle(0xffffff);
    walk1.fillRect(2, 8, 2, 4);
    walk1.fillRect(12, 8, 2, 4);
    // Face
    walk1.fillStyle(0xffff80);
    walk1.fillRect(5, 4, 6, 3);
    // Eyes
    walk1.fillStyle(0x000000);
    walk1.fillRect(6, 5, 1, 1);
    walk1.fillRect(9, 5, 1, 1);
    // Mustache
    walk1.fillStyle(0x000000);
    walk1.fillRect(5, 7, 6, 1);
    walk1.generateTexture('player_walk1', size, size);
    walk1.destroy();

    // Walk frame 2 (right leg forward)
    const walk2 = this.add.graphics();
    // Red cap
    walk2.fillStyle(0xff0000);
    walk2.fillRect(2, 0, 12, 4);
    // Brown shirt
    walk2.fillStyle(0xa05000);
    walk2.fillRect(4, 4, 8, 4);
    // Blue overalls
    walk2.fillStyle(0x0080ff);
    walk2.fillRect(4, 8, 8, 8);
    // Right leg extended
    walk2.fillStyle(0x0060cc);
    walk2.fillRect(9, 14, 4, 4);
    // White gloves
    walk2.fillStyle(0xffffff);
    walk2.fillRect(2, 8, 2, 4);
    walk2.fillRect(12, 8, 2, 4);
    // Face
    walk2.fillStyle(0xffff80);
    walk2.fillRect(5, 4, 6, 3);
    // Eyes
    walk2.fillStyle(0x000000);
    walk2.fillRect(6, 5, 1, 1);
    walk2.fillRect(9, 5, 1, 1);
    // Mustache
    walk2.fillStyle(0x000000);
    walk2.fillRect(5, 7, 6, 1);
    walk2.generateTexture('player_walk2', size, size);
    walk2.destroy();
  }

  createPlaceholderTiles() {
    const tileSize = 32;
    
    // Mario-style grass tile (green with pattern)
    const grass = this.add.graphics();
    // Base grass color
    grass.fillStyle(0x7cb847);
    grass.fillRect(0, 0, tileSize, tileSize);
    // Grass pattern
    grass.fillStyle(0x68a73a);
    grass.fillRect(0, 0, 16, 16);
    grass.fillRect(16, 16, 16, 16);
    // Grass texture lines
    grass.lineStyle(1, 0x5a8a2d);
    grass.moveTo(0, 16);
    grass.lineTo(32, 16);
    grass.moveTo(16, 0);
    grass.lineTo(16, 32);
    grass.generateTexture('grass', tileSize, tileSize);
    grass.destroy();

    // Dirt tile (brown with dots texture)
    const dirt = this.add.graphics();
    dirt.fillStyle(0x8b4513);
    dirt.fillRect(0, 0, tileSize, tileSize);
    // Dots pattern
    dirt.fillStyle(0x6b3413);
    dirt.fillRect(4, 4, 2, 2);
    dirt.fillRect(12, 8, 2, 2);
    dirt.fillRect(20, 4, 2, 2);
    dirt.fillRect(8, 16, 2, 2);
    dirt.fillRect(16, 20, 2, 2);
    dirt.fillRect(24, 12, 2, 2);
    dirt.generateTexture('dirt', tileSize, tileSize);
    dirt.destroy();

    // Brick block (brown with question mark block style)
    const brick = this.add.graphics();
    // Brick base
    brick.fillStyle(0xcd853f);
    brick.fillRect(0, 0, tileSize, tileSize);
    // Brick lines
    brick.lineStyle(1, 0x8b4513);
    brick.moveTo(0, 0);
    brick.lineTo(32, 0);
    brick.moveTo(0, 16);
    brick.lineTo(32, 16);
    for (let i = 8; i < 32; i += 8) {
      brick.moveTo(i - 4, 0);
      brick.lineTo(i - 4, 16);
    }
    for (let i = 12; i < 32; i += 8) {
      brick.moveTo(i, 16);
      brick.lineTo(i, 32);
    }
    brick.generateTexture('brick', tileSize, tileSize);
    brick.destroy();

    // Question mark block
    const qBlock = this.add.graphics();
    qBlock.fillStyle(0xffcc00);
    qBlock.fillRect(0, 0, tileSize, tileSize);
    qBlock.lineStyle(2, 0x000000);
    qBlock.strokeRect(0, 0, tileSize, tileSize);
    // Yellow shading
    qBlock.fillStyle(0xdddd00);
    qBlock.fillRect(0, 0, tileSize, 8);
    qBlock.fillRect(0, 0, 8, tileSize);
    qBlock.fillStyle(0xeeee66);
    qBlock.fillRect(24, 0, 8, tileSize);
    qBlock.fillRect(0, 24, tileSize, 8);
    // Question mark
    qBlock.lineStyle(2, 0x000000);
    qBlock.beginPath();
    qBlock.arc(16, 10, 5, 0, Math.PI * 2, false);
    qBlock.closePath();
    qBlock.strokePath();
    qBlock.moveTo(11, 15);
    qBlock.lineTo(11, 20);
    qBlock.strokePath();
    qBlock.generateTexture('question_block', tileSize, tileSize);
    qBlock.destroy();

    // Solid block (blue Mario World style with bolts)
    const solidBlock = this.add.graphics();
    solidBlock.fillStyle(0x5aa3ff);
    solidBlock.fillRect(0, 0, tileSize, tileSize);
    solidBlock.lineStyle(2, 0x000000);
    solidBlock.strokeRect(0, 0, tileSize, tileSize);
    // Light blue highlight
    solidBlock.fillStyle(0x8cc5ff);
    solidBlock.fillRect(0, 0, tileSize, 8);
    solidBlock.fillRect(0, 0, 8, tileSize);
    // Dark blue shadow
    solidBlock.fillStyle(0x3d7ddb);
    solidBlock.fillRect(24, 0, 8, tileSize);
    solidBlock.fillRect(0, 24, tileSize, 8);
    // Corner bolts
    solidBlock.fillStyle(0xffffff);
    solidBlock.fillRect(3, 3, 4, 4);
    solidBlock.fillRect(25, 3, 4, 4);
    solidBlock.fillRect(3, 25, 4, 4);
    solidBlock.fillRect(25, 25, 4, 4);
    solidBlock.generateTexture('solid_block', tileSize, tileSize);
    solidBlock.destroy();

    // Create background elements
    this.createBackgroundElements();
  }
  
  createBackgroundElements() {
    // Blue sky background
    const sky = this.add.graphics();
    sky.fillStyle(0x87ceeb);
    sky.fillRect(0, 0, 256, 256);
    sky.generateTexture('sky', 256, 256);
    sky.destroy();

    // Cloud (white fluffy)
    const cloud = this.add.graphics();
    cloud.fillStyle(0xffffff);
    cloud.fillCircle(10, 10, 8);
    cloud.fillCircle(20, 8, 10);
    cloud.fillCircle(30, 10, 8);
    cloud.fillCircle(18, 16, 6);
    cloud.fillCircle(28, 16, 8);
    cloud.generateTexture('cloud', 40, 24);
    cloud.destroy();

    // Big cloud
    const bigCloud = this.add.graphics();
    bigCloud.fillStyle(0xffffff);
    bigCloud.fillCircle(15, 15, 12);
    bigCloud.fillCircle(30, 12, 15);
    bigCloud.fillCircle(45, 15, 12);
    bigCloud.fillCircle(25, 24, 10);
    bigCloud.fillCircle(40, 24, 12);
    bigCloud.generateTexture('big_cloud', 60, 36);
    bigCloud.destroy();

    // Mountain (light blue with highlights)
    const mountain = this.add.graphics();
    mountain.fillStyle(0xadd8e6);
    mountain.beginPath();
    mountain.moveTo(0, 100);
    mountain.lineTo(50, 0);
    mountain.lineTo(100, 100);
    mountain.closePath();
    mountain.fillPath();
    // Highlight
    mountain.fillStyle(0xd4e8f0);
    mountain.beginPath();
    mountain.moveTo(0, 100);
    mountain.lineTo(30, 30);
    mountain.lineTo(50, 100);
    mountain.closePath();
    mountain.fillPath();
    mountain.generateTexture('mountain', 100, 100);
    mountain.destroy();

    // Bush
    const bush = this.add.graphics();
    bush.fillStyle(0x7cb847);
    bush.fillCircle(8, 8, 6);
    bush.fillCircle(16, 8, 8);
    bush.fillCircle(24, 8, 6);
    bush.fillCircle(12, 14, 6);
    bush.fillCircle(20, 14, 6);
    bush.generateTexture('bush', 32, 20);
    bush.destroy();
  }

  create() {
    // Remove loading text from HTML
    const loading = document.getElementById('loading');
    if (loading) loading.remove();
    
    // Data is already loaded via Phaser's loader
    this.scene.start('WorldScene');
  }
}

