import Phaser from 'phaser';
import { GameState } from '../GameState';
import { audio } from '../systems/AudioSystem';

export class EndingScene extends Phaser.Scene {
  constructor() { super('EndingScene'); }

  create(): void {
    audio.stopMusic();
    
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a0a2e, 0x1a0a2e, 1);
    bg.fillRect(0, 0, 1280, 720);
    
    // Determine ending based on story flags
    const ending = this.determineEnding();
    GameState.setStoryFlag('ending', ending);
    
    // Moon
    const moon = this.add.graphics();
    moon.fillStyle(ending === 'corrupted' ? 0xef4444 : 0xfbbf24, 0.3);
    moon.fillCircle(640, 120, 60);
    moon.fillStyle(ending === 'corrupted' ? 0xdc2626 : 0xfde047, 0.5);
    moon.fillCircle(640, 120, 40);
    
    const endings = {
      heroic: {
        title: 'HEROIC ENDING',
        lines: [
          'The Commander falls, his dark armor crumbling to dust.',
          'The burning crystals shatter, releasing the trapped souls.',
          'Arden stands victorious, his name cleared at last.',
          'Mara smiles beside him, the fire train glowing bright.',
          '"You did it, knight. The village is free."',
          'Together they watch as the souls ascend to the moon.',
          'The curse is broken. Peace returns to the land.',
          '',
          'Arden and Mara ride into the sunrise,',
          'guardians of a new dawn.'
        ],
        color: '#fbbf24'
      },
      sacrifice: {
        title: 'SACRIFICE ENDING',
        lines: [
          'The Commander falls, but the crystals begin to overload.',
          'Arden realizes only one soul can absorb the curse.',
          '"Mara, take the train. Get the people to safety."',
          '"Arden, no! There has to be another way!"',
          '"There isn\'t. This is my redemption."',
          'Arden touches the crystals, absorbing the curse into himself.',
          'The village is saved. The souls are free.',
          'But Arden becomes the new guardian of the Moon Fortress.',
          '',
          'Eternal, watchful, alone - but at peace.'
        ],
        color: '#8b5cf6'
      },
      corrupted: {
        title: 'CORRUPTED ENDING',
        lines: [
          GameState.story.forestChoice === 'ignore' ?
            'The power Arden absorbed in the forest twists within him.' :
            'The Commander\'s dark energy seeps into Arden\'s wounds.',
          'As the Commander falls, Arden feels the power surge.',
          '"Yes... this power is mine now."',
          'Mara watches in horror as Arden\'s eyes glow red.',
          '"Arden? What have you become?"',
          '"What I should have been all along."',
          'The new lord of the Moon Fortress sits upon the throne.',
          'The village is freed... but a new tyrant rises.',
          '',
          'The cycle continues. The moon watches, indifferent.'
        ].filter(l => l !== undefined),
        color: '#ef4444'
      }
    };
    
    const e = endings[ending];
    
    // Title
    this.add.text(640, 200, e.title, {
      fontSize: '36px', color: e.color, fontStyle: 'bold', fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    // Ending text with typewriter
    let lineIndex = 0;
    const textObj = this.add.text(200, 280, '', {
      fontSize: '16px', color: '#e2e8f0', fontFamily: 'monospace',
      wordWrap: { width: 880 }, lineSpacing: 8
    });
    
    const showNextLine = () => {
      if (lineIndex < e.lines.length) {
        textObj.setText(textObj.text + (textObj.text ? '\n' : '') + e.lines[lineIndex]);
        lineIndex++;
        this.time.delayedCall(800, showNextLine);
      } else {
        // Show restart option
        const btn = this.add.text(640, 650, '[ Return to Menu ]', {
          fontSize: '20px', color: '#94a3b8', fontFamily: 'monospace'
        }).setOrigin(0.5).setInteractive();
        btn.on('pointerdown', () => {
          GameState.setStoryFlag('skippableDialogue', true);
          this.scene.start('MenuScene');
        });
      }
    };
    
    this.time.delayedCall(1000, showNextLine);
    
    // Stats
    this.add.text(640, 580, `Final Level: ${GameState.player.level} | Ending: ${ending.toUpperCase()}`, {
      fontSize: '14px', color: '#64748b', fontFamily: 'monospace'
    }).setOrigin(0.5);
  }

  private determineEnding(): 'heroic' | 'sacrifice' | 'corrupted' {
    if (GameState.story.forestChoice === 'ignore') {
      return 'corrupted';
    }
    // Random between heroic and sacrifice based on play style
    if (GameState.player.level >= 5) {
      return 'sacrifice';
    }
    return 'heroic';
  }
}
