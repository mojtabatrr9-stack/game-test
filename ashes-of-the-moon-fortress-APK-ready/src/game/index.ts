import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene';
import { Level1Scene } from './scenes/Level1Scene';
import { Level2Scene } from './scenes/Level2Scene';
import { Level3Scene } from './scenes/Level3Scene';
import { Level4Scene } from './scenes/Level4Scene';
import { Level5Scene } from './scenes/Level5Scene';
import { EndingScene } from './scenes/EndingScene';

export function startGame(container: HTMLElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: container,
    width: 1280,
    height: 720,
    backgroundColor: '#0a0a0f',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 800 },
        debug: false
      }
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 720,
    },
    scene: [
      MenuScene,
      Level1Scene,
      Level2Scene,
      Level3Scene,
      Level4Scene,
      Level5Scene,
      EndingScene
    ],
    input: {
      keyboard: true,
      mouse: true,
      touch: true,
    },
    render: {
      pixelArt: true,
      antialias: false,
      roundPixels: true,
    }
  };

  const game = new Phaser.Game(config);
  
  // Prevent scrolling
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
  });

  return game;
}
