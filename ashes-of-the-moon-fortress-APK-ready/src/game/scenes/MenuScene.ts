import Phaser from 'phaser';
import { GameState } from '../GameState';
import { audio } from '../systems/AudioSystem';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create(): void {
    audio.init();
    
    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a0a2e, 0x1a0a2e, 1);
    bg.fillRect(0, 0, 1280, 720);
    
    // Moon
    const moon = this.add.graphics();
    moon.fillStyle(0xfbbf24, 0.3);
    moon.fillCircle(640, 150, 80);
    moon.fillStyle(0xfde047, 0.5);
    moon.fillCircle(640, 150, 60);
    moon.fillStyle(0xfef3c7, 0.8);
    moon.fillCircle(640, 150, 40);
    
    // Stars
    const stars = this.add.graphics();
    stars.fillStyle(0xffffff, 0.6);
    for (let i = 0; i < 100; i++) {
      stars.fillCircle(Math.random() * 1280, Math.random() * 400, Math.random() * 2);
    }
    
    // Fortress silhouette
    const fortress = this.add.graphics();
    fortress.fillStyle(0x1a1a2e, 1);
    fortress.fillRect(200, 400, 100, 200);
    fortress.fillRect(350, 350, 120, 250);
    fortress.fillRect(520, 380, 80, 220);
    fortress.fillRect(680, 340, 140, 260);
    fortress.fillRect(870, 370, 100, 230);
    fortress.fillRect(1020, 400, 80, 200);
    // Towers
    fortress.fillRect(230, 350, 40, 50);
    fortress.fillRect(390, 300, 40, 50);
    fortress.fillRect(720, 290, 60, 50);
    fortress.fillRect(900, 320, 40, 50);
    
    // Ground
    fortress.fillStyle(0x0f0a1a, 1);
    fortress.fillRect(0, 600, 1280, 120);
    
    // Title
    const titleStyle = { fontSize: '42px', color: '#fbbf24', fontStyle: 'bold', fontFamily: 'monospace' };
    this.add.text(640, 200, 'ASHES OF THE', titleStyle).setOrigin(0.5);
    this.add.text(640, 250, 'MOON FORTRESS', { ...titleStyle, fontSize: '52px' }).setOrigin(0.5);
    
    // Subtitle
    this.add.text(640, 310, 'A Dark Fantasy Western', { fontSize: '16px', color: '#94a3b8', fontFamily: 'monospace' }).setOrigin(0.5);
    
    // Menu options
    const hasSave = GameState.story.currentLevel > 1 || GameState.player.level > 1;
    
    const newGame = this.add.text(640, 420, '[ New Game ]', { fontSize: '24px', color: '#e2e8f0', fontFamily: 'monospace' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    newGame.on('pointerover', () => newGame.setColor('#fbbf24'));
    newGame.on('pointerout', () => newGame.setColor('#e2e8f0'));
    newGame.on('pointerdown', () => {
      GameState.reset();
      audio.playUI();
      this.startGame();
    });
    
    if (hasSave) {
      const continueBtn = this.add.text(640, 470, '[ Continue ]', { fontSize: '24px', color: '#22c55e', fontFamily: 'monospace' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      continueBtn.on('pointerover', () => continueBtn.setColor('#fbbf24'));
      continueBtn.on('pointerout', () => continueBtn.setColor('#22c55e'));
      continueBtn.on('pointerdown', () => {
        audio.playUI();
        this.startGame();
      });
    }
    
    const controls = this.add.text(640, 540, '[ Controls ]', { fontSize: '20px', color: '#94a3b8', fontFamily: 'monospace' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    controls.on('pointerover', () => controls.setColor('#fbbf24'));
    controls.on('pointerout', () => controls.setColor('#94a3b8'));
    controls.on('pointerdown', () => this.showControls());
    
    // Credits
    this.add.text(640, 680, 'Arrow Keys: Move | Up: Jump | Space: Attack | F: Fireball | E: Interact | ESC: Pause', {
      fontSize: '12px', color: '#64748b', fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    // Animate moon glow
    this.tweens.add({
      targets: moon, alpha: { from: 0.8, to: 1 },
      duration: 2000, yoyo: true, repeat: -1
    });
  }

  private startGame(): void {
    const level = GameState.story.currentLevel;
    const scenes = ['', 'Level1', 'Level2', 'Level3', 'Level4', 'Level5'];
    this.scene.start(scenes[level] || 'Level1');
  }

  private showControls(): void {
    const container = this.add.container(0, 0).setDepth(10);
    const bg = this.add.rectangle(640, 360, 800, 500, 0x0a0a1a, 0.95);
    bg.setStrokeStyle(2, 0x8b5cf6);
    container.add(bg);
    
    const controls = [
      '← → : Move Left/Right',
      '↑ : Jump',
      'Space : Sword Attack',
      'F : Mara Fireball',
      'E : Interact (NPCs, Checkpoints, Exit)',
      'U : Upgrade Menu (when available)',
      'ESC : Pause Menu',
      'R : Restart (when dead)',
      '',
      'Mobile: Touch controls appear automatically',
      '',
      'Defeat enemies for XP. Level up to gain upgrade points.',
      'Reach checkpoints to save progress and heal.',
      'Mara follows you and fires when you press F.',
    ];
    
    this.add.text(640, 150, 'CONTROLS', { fontSize: '28px', color: '#fbbf24', fontStyle: 'bold', fontFamily: 'monospace' }).setOrigin(0.5);
    container.add(this.add.text(640, 150, 'CONTROLS', { fontSize: '28px', color: '#fbbf24', fontStyle: 'bold', fontFamily: 'monospace' }).setOrigin(0.5));
    
    controls.forEach((line, i) => {
      const txt = this.add.text(640, 210 + i * 28, line, { fontSize: '14px', color: '#e2e8f0', fontFamily: 'monospace' }).setOrigin(0.5);
      container.add(txt);
    });
    
    const closeBtn = this.add.text(640, 600, '[ Close ]', { fontSize: '18px', color: '#94a3b8', fontFamily: 'monospace' }).setOrigin(0.5).setInteractive();
    closeBtn.on('pointerdown', () => container.destroy());
    container.add(closeBtn);
  }
}
