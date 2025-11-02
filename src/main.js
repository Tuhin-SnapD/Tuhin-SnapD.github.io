import Phaser from 'phaser';
import PreloadScene from './scenes/preload.js';
import WorldScene from './scenes/worldScene.js';
import UIScene from './scenes/uiScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#87ceeb', // Sky blue for Mario style
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 640,
      height: 360
    },
    max: {
      width: 1920,
      height: 1080
    }
  },
  scene: [PreloadScene, WorldScene, UIScene]
};

const game = new Phaser.Game(config);

