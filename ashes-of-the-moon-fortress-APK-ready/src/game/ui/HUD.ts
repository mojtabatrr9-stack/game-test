import Phaser from 'phaser';
import { GameState } from '../GameState';

export class HUD {
  private scene: Phaser.Scene;
  private hpBar: Phaser.GameObjects.Graphics;
  private hpText: Phaser.GameObjects.Text;
  private xpBar: Phaser.GameObjects.Graphics;
  private xpText: Phaser.GameObjects.Text;
  private levelText: Phaser.GameObjects.Text;
  private companionStatus: Phaser.GameObjects.Text;
  private companionCooldownBar: Phaser.GameObjects.Graphics;
  private interactionPrompt: Phaser.GameObjects.Text;
  private questPanel: Phaser.GameObjects.Text;
  private bossBar: Phaser.GameObjects.Graphics;
  private bossName: Phaser.GameObjects.Text;
  private bossHpText: Phaser.GameObjects.Text;
  private damageFlash: Phaser.GameObjects.Rectangle;
  private upgradePointsText: Phaser.GameObjects.Text;
  private staminaBar: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // HP Bar
    this.hpBar = scene.add.graphics().setDepth(50).setScrollFactor(0);
    this.hpText = scene.add.text(120, 12, '', {
      fontSize: '14px', color: '#ffffff', fontFamily: 'monospace'
    }).setDepth(51).setScrollFactor(0);
    
    // XP Bar
    this.xpBar = scene.add.graphics().setDepth(50).setScrollFactor(0);
    this.xpText = scene.add.text(120, 48, '', {
      fontSize: '12px', color: '#a78bfa', fontFamily: 'monospace'
    }).setDepth(51).setScrollFactor(0);
    this.levelText = scene.add.text(12, 48, '', {
      fontSize: '14px', color: '#fbbf24', fontFamily: 'monospace', fontStyle: 'bold'
    }).setDepth(51).setScrollFactor(0);
    
    // Stamina bar
    this.staminaBar = scene.add.graphics().setDepth(50).setScrollFactor(0);
    
    // Companion status
    this.companionStatus = scene.add.text(1080, 12, '', {
      fontSize: '13px', color: '#e2e8f0', fontFamily: 'monospace', align: 'right'
    }).setDepth(51).setScrollFactor(0);
    this.companionCooldownBar = scene.add.graphics().setDepth(50).setScrollFactor(0);
    
    // Interaction prompt
    this.interactionPrompt = scene.add.text(640, 650, '', {
      fontSize: '16px', color: '#fbbf24', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(51).setScrollFactor(0);
    
    // Quest panel
    this.questPanel = scene.add.text(12, 80, '', {
      fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace'
    }).setDepth(51).setScrollFactor(0);
    
    // Boss bar (hidden by default)
    this.bossBar = scene.add.graphics().setDepth(50).setScrollFactor(0).setVisible(false);
    this.bossName = scene.add.text(640, 680, '', {
      fontSize: '16px', color: '#ef4444', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(51).setScrollFactor(0).setVisible(false);
    this.bossHpText = scene.add.text(640, 700, '', {
      fontSize: '12px', color: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(51).setScrollFactor(0).setVisible(false);
    
    // Damage flash
    this.damageFlash = scene.add.rectangle(640, 360, 1280, 720, 0xff0000, 0)
      .setDepth(49).setScrollFactor(0);
    
    // Upgrade points
    this.upgradePointsText = scene.add.text(12, 110, '', {
      fontSize: '12px', color: '#34d399', fontFamily: 'monospace'
    }).setDepth(51).setScrollFactor(0);
  }

  update(): void {
    const p = GameState.player;
    const c = GameState.companion;
    
    // HP Bar
    this.hpBar.clear();
    this.hpBar.fillStyle(0x1a1a2e, 0.8);
    this.hpBar.fillRoundedRect(12, 8, 200, 20, 4);
    const hpPercent = p.hp / p.maxHp;
    const hpColor = hpPercent > 0.5 ? 0x22c55e : hpPercent > 0.25 ? 0xeab308 : 0xef4444;
    this.hpBar.fillStyle(hpColor, 1);
    this.hpBar.fillRoundedRect(14, 10, Math.max(0, 196 * hpPercent), 16, 3);
    this.hpText.setText(`HP: ${p.hp}/${p.maxHp}`);
    
    // XP Bar
    this.xpBar.clear();
    this.xpBar.fillStyle(0x1a1a2e, 0.8);
    this.xpBar.fillRoundedRect(12, 38, 200, 14, 3);
    const xpPercent = p.xp / p.xpToNext;
    this.xpBar.fillStyle(0x8b5cf6, 1);
    this.xpBar.fillRoundedRect(14, 40, Math.max(0, 196 * xpPercent), 10, 2);
    this.xpText.setText(`XP: ${p.xp}/${p.xpToNext}`);
    this.levelText.setText(`Lv.${p.level}`);
    
    // Stamina
    this.staminaBar.clear();
    this.staminaBar.fillStyle(0x1a1a2e, 0.6);
    this.staminaBar.fillRoundedRect(12, 56, 120, 8, 2);
    const stPercent = p.stamina / p.maxStamina;
    this.staminaBar.fillStyle(0x06b6d4, 1);
    this.staminaBar.fillRoundedRect(13, 57, Math.max(0, 118 * stPercent), 6, 2);
    
    // Companion status
    if (!c.alive && c.downed) {
      this.companionStatus.setText('Mara: DOWNED\nPress E to revive');
      this.companionStatus.setColor('#ef4444');
    } else {
      const cd = GameState.player.fireballCooldown;
      this.companionStatus.setText(`Mara: OK\n[Fire: ${Math.ceil(cd/1000)}s cd]`);
      this.companionStatus.setColor('#22c55e');
    }
    
    // Companion cooldown bar
    this.companionCooldownBar.clear();
    this.companionCooldownBar.fillStyle(0x1a1a2e, 0.6);
    this.companionCooldownBar.fillRoundedRect(1080, 50, 180, 8, 2);
    
    // Upgrade points
    if (p.upgradePoints > 0) {
      this.upgradePointsText.setText(`★ ${p.upgradePoints} upgrade point(s) - Press U`);
    } else {
      this.upgradePointsText.setText('');
    }
  }

  showInteraction(text: string): void {
    this.interactionPrompt.setText(text);
  }

  hideInteraction(): void {
    this.interactionPrompt.setText('');
  }

  showBoss(name: string, hp: number, maxHp: number): void {
    this.bossBar.setVisible(true);
    this.bossName.setVisible(true).setText(name);
    this.bossHpText.setVisible(true).setText(`${hp}/${maxHp}`);
    
    this.bossBar.clear();
    this.bossBar.fillStyle(0x1a1a2e, 0.8);
    this.bossBar.fillRoundedRect(240, 660, 800, 16, 4);
    const percent = hp / maxHp;
    this.bossBar.fillStyle(0xef4444, 1);
    this.bossBar.fillRoundedRect(242, 662, Math.max(0, 796 * percent), 12, 3);
  }

  hideBoss(): void {
    this.bossBar.setVisible(false);
    this.bossName.setVisible(false);
    this.bossHpText.setVisible(false);
  }

  flashDamage(): void {
    this.damageFlash.setAlpha(0.3);
    this.scene.tweens.add({
      targets: this.damageFlash, alpha: 0, duration: 300
    });
  }

  setQuest(text: string): void {
    this.questPanel.setText(`◆ ${text}`);
  }
}
