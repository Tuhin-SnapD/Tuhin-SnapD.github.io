import Phaser from 'phaser';
import PreloadScene from './scenes/preload.js';
import WorldScene from './scenes/worldScene.js';
import UIScene from './scenes/uiScene.js';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  backgroundColor: '#070a18',
  antialias: true,
  roundPixels: false,
  disableContextMenu: true,
  input: {
    activePointers: 3,
    touch: { capture: true }
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.NO_CENTER
  },
  scene: [PreloadScene, WorldScene, UIScene]
};

const game = new Phaser.Game(config);

// Expose the game instance in development to make debugging easier
if (import.meta.env.DEV) {
  window.game = game;
}
