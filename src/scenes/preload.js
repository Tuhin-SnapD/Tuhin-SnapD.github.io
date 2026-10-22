import { FONT, gradientTexture, radialTexture } from '../ui/theme.js';

const SKY_STOPS = [
  [0, '#070a18'],
  [0.4, '#0d1330'],
  [0.68, '#191a45'],
  [0.86, '#2a1d55'],
  [1, '#3b2560']
];

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }
}

function paint(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, w, h);
  draw(tex.getContext(), w, h);
  tex.refresh();
}

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const barW = 280;
    const barH = 6;
    const track = this.add.graphics();
    track.fillStyle(0xffffff, 0.08);
    track.fillRoundedRect(width / 2 - barW / 2, height / 2, barW, barH, barH / 2);

    const bar = this.add.graphics();
    const label = this.add.text(width / 2, height / 2 - 34, 'Preparing your journey', {
      fontFamily: FONT,
      fontSize: '15px',
      fontStyle: '500',
      color: '#98a2c2'
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      bar.clear();
      bar.fillStyle(0x7c5cff, 1);
      bar.fillRoundedRect(width / 2 - barW / 2, height / 2, Math.max(barH, barW * value), barH, barH / 2);
    });

    this.load.on('complete', () => {
      bar.destroy();
      track.destroy();
      label.destroy();
    });

    this.load.on('loaderror', (file) => {
      console.error('Failed to load:', file.key, file.url);
    });

    this.createTextures();

    const baseUrl = import.meta.env.BASE_URL || '/';
    this.load.json('mapData', baseUrl + 'data/mapData.json');
    this.load.json('locations', baseUrl + 'data/locations.json');
  }

  createTextures() {
    const { width, height } = this.cameras.main;

    // Full-screen sky gradient.
    gradientTexture(this, 'sky', 16, 512, SKY_STOPS);
    gradientTexture(this, 'accent-line', 512, 8, [
      [0, '#7c5cff'],
      [0.5, '#22d3ee'],
      [1, '#f472b6']
    ], 'h');

    // Soft radial assets.
    radialTexture(this, 'glow', 256, 256, [
      [0, 'rgba(255,255,255,1)'],
      [0.35, 'rgba(255,255,255,0.45)'],
      [1, 'rgba(255,255,255,0)']
    ]);
    radialTexture(this, 'spark', 64, 64, [
      [0, 'rgba(255,255,255,1)'],
      [0.5, 'rgba(255,255,255,0.6)'],
      [1, 'rgba(255,255,255,0)']
    ]);
    radialTexture(this, 'shadow', 160, 60, [
      [0, 'rgba(0,0,0,0.55)'],
      [0.6, 'rgba(0,0,0,0.25)'],
      [1, 'rgba(0,0,0,0)']
    ]);

    this.createCoinTexture();
    this.createCloudTexture();
    this.createHillTexture('hill-far', 1000, 320, ['#241f52', '#151a3a'], 0.2);
    this.createHillTexture('hill-mid', 860, 260, ['#1c2450', '#101533'], 0.34);
    this.createTreeTexture();
    this.createPlayerTextures();

    // Vignette overlay (screen sized).
    paint(this, 'vignette', width, height, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.78);
      g.addColorStop(0, 'rgba(3,5,14,0)');
      g.addColorStop(1, 'rgba(3,5,14,0.6)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
  }

  createCoinTexture() {
    paint(this, 'coin', 56, 56, (ctx) => {
      const g = ctx.createLinearGradient(0, 6, 0, 50);
      g.addColorStop(0, '#fde68a');
      g.addColorStop(0.55, '#fbbf24');
      g.addColorStop(1, '#f59e0b');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(28, 28, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(28, 28, 20.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(180,83,9,0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(28, 28, 15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath();
      ctx.ellipse(21, 18, 7, 4.5, -0.6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  createCloudTexture() {
    paint(this, 'cloud', 280, 120, (ctx) => {
      ctx.filter = 'blur(10px)';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      const blobs = [
        [90, 70, 46], [140, 52, 58], [196, 68, 44], [160, 78, 40], [60, 80, 28]
      ];
      for (const [x, y, r] of blobs) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.filter = 'none';
    });
  }

  createHillTexture(key, w, h, [top, bottom], rimAlpha) {
    paint(this, key, w, h, (ctx) => {
      const g = ctx.createLinearGradient(0, 60, 0, h);
      g.addColorStop(0, top);
      g.addColorStop(1, bottom);
      ctx.fillStyle = g;

      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h * 0.55);
      ctx.quadraticCurveTo(w * 0.16, h * 0.12, w * 0.36, h * 0.52);
      ctx.quadraticCurveTo(w * 0.55, h * 0.85, w * 0.72, h * 0.42);
      ctx.quadraticCurveTo(w * 0.87, h * 0.18, w, h * 0.5);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(160,170,255,${rimAlpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.55);
      ctx.quadraticCurveTo(w * 0.16, h * 0.12, w * 0.36, h * 0.52);
      ctx.quadraticCurveTo(w * 0.55, h * 0.85, w * 0.72, h * 0.42);
      ctx.quadraticCurveTo(w * 0.87, h * 0.18, w, h * 0.5);
      ctx.stroke();
    });
  }

  createTreeTexture() {
    paint(this, 'tree', 160, 240, (ctx) => {
      ctx.fillStyle = '#0b1024';
      roundRect(ctx, 74, 140, 12, 100, 6);
      ctx.fill();

      const canopy = [
        [60, 100, 42], [100, 84, 50], [128, 112, 34], [78, 128, 38], [112, 146, 26]
      ];
      for (const [x, y, r] of canopy) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = 'rgba(124,92,255,0.22)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(100, 84, 50, Math.PI * 1.05, Math.PI * 1.75);
      ctx.stroke();
    });
  }

  createPlayerTextures() {
    const legFrames = {
      player_idle: { left: [21, 66, 18], right: [35, 66, 18], arm: 0 },
      player_walk1: { left: [18, 68, 16], right: [36, 64, 20], arm: 2 },
      player_walk2: { left: [22, 64, 20], right: [33, 68, 16], arm: -2 },
      player_walk3: { left: [16, 66, 18], right: [37, 66, 18], arm: 1 }
    };

    for (const [key, frame] of Object.entries(legFrames)) {
      paint(this, key, 64, 88, (ctx) => {
        // Soft contact shadow is drawn separately in-scene.

        // Backpack
        ctx.fillStyle = '#0f2f4a';
        roundRect(ctx, 9, 40, 14, 28, 7);
        ctx.fill();

        // Legs
        ctx.fillStyle = '#1b2340';
        roundRect(ctx, frame.left[0], frame.left[1], 8, frame.left[2], 4);
        ctx.fill();
        roundRect(ctx, frame.right[0], frame.right[1], 8, frame.right[2], 4);
        ctx.fill();

        // Shoes
        ctx.fillStyle = '#0b1024';
        roundRect(ctx, frame.left[0] - 1, frame.left[1] + frame.left[2] - 4, 11, 6, 3);
        ctx.fill();
        roundRect(ctx, frame.right[0] - 1, frame.right[1] + frame.right[2] - 4, 11, 6, 3);
        ctx.fill();

        // Body
        const bodyGradient = ctx.createLinearGradient(0, 36, 0, 70);
        bodyGradient.addColorStop(0, '#8b6cff');
        bodyGradient.addColorStop(1, '#6644f0');
        ctx.fillStyle = bodyGradient;
        roundRect(ctx, 17, 36, 30, 34, 11);
        ctx.fill();

        // Arms
        ctx.fillStyle = '#7c5cff';
        roundRect(ctx, 12, 42 + frame.arm, 9, 22, 4.5);
        ctx.fill();
        roundRect(ctx, 43, 42 - frame.arm, 9, 22, 4.5);
        ctx.fill();

        // Scarf
        ctx.fillStyle = '#f472b6';
        roundRect(ctx, 16, 43, 32, 6, 3);
        ctx.fill();

        // Head
        ctx.fillStyle = '#f4c9a4';
        ctx.beginPath();
        ctx.arc(32, 23, 13, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = '#161228';
        ctx.beginPath();
        ctx.arc(32, 23, 13, Math.PI * 1.02, Math.PI * 1.98);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(22, 16, 7, 5, -0.5, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#161228';
        ctx.beginPath();
        ctx.arc(27.5, 25, 1.8, 0, Math.PI * 2);
        ctx.arc(36.5, 25, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Highlight on the hoodie
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(22, 42);
        ctx.lineTo(22, 60);
        ctx.stroke();
      });
    }
  }

  create() {
    const loading = document.getElementById('loading');
    if (loading) loading.remove();
    this.scene.start('WorldScene');
  }
}
