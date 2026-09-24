import Phaser from 'phaser';
import { GameState } from '../GameState';
import { audio } from '../systems/AudioSystem';

export interface DialogueLine {
  speaker: string;
  text: string;
  portrait?: string;
}

export interface DialogueChoice {
  text: string;
  flag: string;
  value: any;
}

export interface DialogueSequence {
  id: string;
  lines: DialogueLine[];
  choices?: DialogueChoice[];
  onComplete?: string;
}

export class DialogueSystem {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;
  private dialogueText: Phaser.GameObjects.Text;
  private portrait: Phaser.GameObjects.Graphics;
  private continueIndicator: Phaser.GameObjects.Text;
  private choiceButtons: Phaser.GameObjects.Text[] = [];
  private choiceBg: Phaser.GameObjects.Graphics[] = [];
  private currentSequence: DialogueSequence | null = null;
  private currentLine = 0;
  private isActive = false;
  private isShowingChoices = false;
  private onComplete: (() => void) | null = null;
  private charIndex = 0;
  private fullText = '';
  private typeTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    this.container = scene.add.container(0, 0).setDepth(100).setVisible(false);
    
    // Background
    this.bg = scene.add.graphics();
    this.bg.fillStyle(0x000000, 0.85);
    this.bg.fillRoundedRect(40, 480, 1200, 180, 8);
    this.bg.lineStyle(2, 0x8b5cf6, 1);
    this.bg.strokeRoundedRect(40, 480, 1200, 180, 8);
    this.container.add(this.bg);
    
    // Portrait area
    this.portrait = scene.add.graphics();
    this.container.add(this.portrait);
    
    // Name text
    this.nameText = scene.add.text(160, 490, '', {
      fontSize: '18px', color: '#fbbf24', fontStyle: 'bold', fontFamily: 'monospace'
    });
    this.container.add(this.nameText);
    
    // Dialogue text
    this.dialogueText = scene.add.text(160, 520, '', {
      fontSize: '16px', color: '#e2e8f0', fontFamily: 'monospace',
      wordWrap: { width: 1040 }
    });
    this.container.add(this.dialogueText);
    
    // Continue indicator
    this.continueIndicator = scene.add.text(1200, 640, '▼', {
      fontSize: '16px', color: '#8b5cf6'
    });
    this.container.add(this.continueIndicator);
    
    // Input handling
    scene.input.on('pointerdown', () => this.advance());
    scene.input.keyboard?.on('keydown-SPACE', () => this.advance());
    scene.input.keyboard?.on('keydown-ENTER', () => this.advance());
  }

  start(sequence: DialogueSequence, onComplete?: () => void): void {
    if (GameState.story.skippableDialogue && GameState.hasSeenDialogue(sequence.id)) {
      if (onComplete) onComplete();
      return;
    }
    
    this.currentSequence = sequence;
    this.currentLine = 0;
    this.isActive = true;
    this.isShowingChoices = false;
    this.onComplete = onComplete || null;
    this.container.setVisible(true);
    this.clearChoices();
    this.showLine();
    GameState.markDialogueSeen(sequence.id);
  }

  private showLine(): void {
    if (!this.currentSequence) return;
    if (this.currentLine >= this.currentSequence.lines.length) {
      if (this.currentSequence.choices && this.currentSequence.choices.length > 0) {
        this.showChoices();
      } else {
        this.close();
      }
      return;
    }
    
    const line = this.currentSequence.lines[this.currentLine];
    this.nameText.setText(line.speaker);
    this.fullText = line.text;
    this.charIndex = 0;
    this.dialogueText.setText('');
    this.continueIndicator.setVisible(false);
    
    // Draw portrait
    this.portrait.clear();
    this.portrait.fillStyle(0x1a1a2e, 1);
    this.portrait.fillRoundedRect(60, 500, 80, 80, 4);
    this.portrait.lineStyle(2, 0x8b5cf6, 1);
    this.portrait.strokeRoundedRect(60, 500, 80, 80, 4);
    
    // Simple portrait indicator
    if (line.speaker === 'Arden') {
      this.portrait.fillStyle(0x4a5568, 1);
      this.portrait.fillRect(80, 520, 40, 40);
      this.portrait.fillStyle(0x718096, 1);
      this.portrait.fillRect(85, 510, 30, 15);
    } else if (line.speaker === 'Mara') {
      this.portrait.fillStyle(0x6b21a8, 1);
      this.portrait.fillRect(80, 520, 40, 40);
      this.portrait.fillStyle(0xfde047, 1);
      this.portrait.fillRect(85, 510, 30, 12);
    } else if (line.speaker === 'Narrator') {
      this.portrait.fillStyle(0x374151, 1);
      this.portrait.fillRect(80, 520, 40, 40);
      this.portrait.fillStyle(0x8b5cf6, 1);
      this.portrait.fillCircle(100, 540, 10);
    }
    
    // Typewriter effect
    if (this.typeTimer) this.typeTimer.destroy();
    this.typeTimer = this.scene.time.addEvent({
      delay: 30, repeat: line.text.length - 1,
      callback: () => {
        this.charIndex++;
        this.dialogueText.setText(this.fullText.substring(0, this.charIndex));
        if (this.charIndex >= this.fullText.length) {
          this.continueIndicator.setVisible(true);
        }
      }
    });
  }

  private showChoices(): void {
    if (!this.currentSequence?.choices) return;
    this.isShowingChoices = true;
    this.continueIndicator.setVisible(false);
    this.dialogueText.setText('Make your choice:');
    
    this.currentSequence.choices.forEach((choice, i) => {
      const y = 560 + i * 30;
      const bg = this.scene.add.graphics();
      bg.fillStyle(0x1a1a2e, 0.9);
      bg.fillRoundedRect(160, y - 2, 400, 26, 4);
      bg.lineStyle(1, 0x8b5cf6, 1);
      bg.strokeRoundedRect(160, y - 2, 400, 26, 4);
      this.container.add(bg);
      this.choiceBg.push(bg);
      
      const btn = this.scene.add.text(170, y, `${i + 1}. ${choice.text}`, {
        fontSize: '14px', color: '#e2e8f0', fontFamily: 'monospace'
      }).setInteractive({ useHandCursor: true });
      
      btn.on('pointerdown', () => {
        if (choice.flag) {
          GameState.setStoryFlag(choice.flag as any, choice.value);
        }
        audio.playUI();
        this.close();
      });
      
      btn.on('pointerover', () => btn.setColor('#fbbf24'));
      btn.on('pointerout', () => btn.setColor('#e2e8f0'));
      
      this.container.add(btn);
      this.choiceButtons.push(btn);
    });
  }

  private clearChoices(): void {
    this.choiceButtons.forEach(b => b.destroy());
    this.choiceBg.forEach(b => b.destroy());
    this.choiceButtons = [];
    this.choiceBg = [];
  }

  advance(): void {
    if (!this.isActive) return;
    if (this.isShowingChoices) return;
    
    audio.playUI();
    
    if (this.charIndex < this.fullText.length) {
      // Skip typewriter
      this.charIndex = this.fullText.length;
      this.dialogueText.setText(this.fullText);
      this.continueIndicator.setVisible(true);
      if (this.typeTimer) this.typeTimer.destroy();
    } else {
      this.currentLine++;
      this.showLine();
    }
  }

  close(): void {
    this.isActive = false;
    this.isShowingChoices = false;
    this.container.setVisible(false);
    this.clearChoices();
    if (this.typeTimer) this.typeTimer.destroy();
    if (this.onComplete) this.onComplete();
  }

  getActive(): boolean { return this.isActive; }
}
