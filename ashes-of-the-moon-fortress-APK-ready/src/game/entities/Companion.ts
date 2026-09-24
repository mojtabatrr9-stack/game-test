import Phaser from 'phaser';
import { GameState } from '../GameState';
import { audio } from '../systems/AudioSystem';

export class Companion extends Phaser.Physics.Arcade.Sprite {
  private targetDistance = 80;
  private followSpeed = 150;
  private facingRight = true;
  private currentState: 'idle' | 'run' | 'attack' | 'hurt' | 'downed' | 'dead' = 'idle';
  private fireballCooldownTimer = 0;
  private maxActiveFireballs = 3;
  private activeFireballs: Phaser.Physics.Arcade.Sprite[] = [];
  private hurtTimer = 0;
  private isDowned = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'companion');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(20, 36);
    body.setOffset(-10, -18);
    body.setCollideWorldBounds(true);
    body.setGravityY(800);
    body.setMaxVelocity(250, 600);
    
    this.setDepth(9);
    this.setupTexture();
  }

  private setupTexture(): void {
    const g = this.scene.add.graphics();
    // Body - purple western coat
    g.fillStyle(0x6b21a8, 1);
    g.fillRect(-10, -16, 20, 24);
    // Head
    g.fillStyle(0xfbbf24, 1);
    g.fillRect(-7, -26, 14, 12);
    // Blonde hair
    g.fillStyle(0xfde047, 1);
    g.fillRect(-9, -30, 18, 8);
    g.fillRect(-10, -24, 4, 10);
    g.fillRect(6, -24, 4, 10);
    // Brown cowboy hat
    g.fillStyle(0x92400e, 1);
    g.fillRect(-12, -34, 24, 6);
    g.fillRect(-8, -38, 16, 6);
    // Red scarf
    g.fillStyle(0xdc2626, 1);
    g.fillRect(-6, -16, 12, 4);
    // Legs
    g.fillStyle(0x44403c, 1);
    g.fillRect(-8, 8, 6, 10);
    g.fillRect(2, 8, 6, 10);
    // Boots
    g.fillStyle(0x78350f, 1);
    g.fillRect(-9, 16, 8, 4);
    g.fillRect(1, 16, 8, 4);
    // Gun arm
    g.fillStyle(0x78350f, 1);
    g.fillRect(10, -8, 8, 4);
    // Magic flame on gun
    g.fillStyle(0xf97316, 1);
    g.fillRect(16, -12, 4, 6);
    g.fillStyle(0xfbbf24, 1);
    g.fillRect(17, -14, 2, 4);
    
    g.generateTexture('companion', 28, 44);
    g.destroy();
  }

  update(delta: number, playerX: number, playerY: number, playerFacing: number): void {
    if (this.currentState === 'dead') return;
    
    if (this.isDowned) {
      this.currentState = 'downed';
      this.setTint(0x666666);
      return;
    }

    // Hurt timer
    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
      this.setAlpha(Math.sin(Date.now() * 0.02) > 0 ? 1 : 0.5);
      if (this.hurtTimer <= 0) this.setAlpha(1);
      return;
    }

    // Cooldown
    if (this.fireballCooldownTimer > 0) {
      this.fireballCooldownTimer -= delta;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.touching.down;
    
    // Follow player
    const dx = playerX - this.x;
    const dist = Math.abs(dx);
    
    if (dist > this.targetDistance + 20) {
      const dir = dx > 0 ? 1 : -1;
      body.setVelocityX(dir * this.followSpeed);
      this.facingRight = dir > 0;
      this.setFlipX(!this.facingRight);
      this.currentState = 'run';
    } else if (dist < this.targetDistance - 20) {
      const dir = dx > 0 ? -1 : 1;
      body.setVelocityX(dir * this.followSpeed * 0.5);
      this.currentState = 'run';
    } else {
      body.setVelocityX(body.velocity.x * 0.8);
      this.currentState = 'idle';
    }

    // Jump if player is above and on ground
    if (onGround && playerY < this.y - 60 && dist < 200) {
      body.setVelocityY(-380);
    }

    // Keep within level bounds
    const cam = this.scene.cameras.main;
    if (this.x < cam.scrollX + 20) {
      body.setVelocityX(this.followSpeed);
    }
    if (this.x > cam.scrollX + cam.width - 20) {
      body.setVelocityX(-this.followSpeed);
    }
  }

  fireFireball(): Phaser.Physics.Arcade.Sprite | null {
    if (this.fireballCooldownTimer > 0) return null;
    if (this.activeFireballs.length >= this.maxActiveFireballs) return null;
    if (this.isDowned) return null;

    this.fireballCooldownTimer = GameState.player.fireballCooldown;
    audio.playFireball();

    // Create fireball
    const fb = this.scene.add.sprite(this.x + (this.facingRight ? 20 : -20), this.y - 5, 'fireball') as Phaser.Physics.Arcade.Sprite;
    this.scene.physics.add.existing(fb);
    const fbBody = fb.body as Phaser.Physics.Arcade.Body;
    fbBody.setAllowGravity(false);
    fbBody.setSize(12, 12);
    
    const dir = this.facingRight ? 1 : -1;
    fbBody.setVelocityX(dir * 350);
    fb.setDepth(11);
    
    this.activeFireballs.push(fb);
    
    // Auto-destroy after 2 seconds
    this.scene.time.delayedCall(2000, () => {
      this.removeFireball(fb);
    });

    return fb;
  }

  removeFireball(fb: Phaser.Physics.Arcade.Sprite): void {
    const idx = this.activeFireballs.indexOf(fb);
    if (idx >= 0) this.activeFireballs.splice(idx, 1);
    fb.destroy();
  }

  createImpactEffect(x: number, y: number): void {
    const particles = this.scene.add.particles(x, y, 'fireball_particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      lifespan: 300,
      quantity: 6,
      emitting: false
    });
    particles.setDepth(12);
    particles.explode(6);
    this.scene.time.delayedCall(500, () => particles.destroy());
  }

  takeDamage(amount: number): void {
    if (this.isDowned || this.hurtTimer > 0) return;
    const comp = GameState.companion;
    comp.hp -= amount;
    if (comp.hp <= 0) {
      this.down();
    } else {
      this.hurtTimer = 500;
    }
  }

  down(): void {
    this.isDowned = true;
    GameState.companionDown();
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
  }

  revive(): void {
    this.isDowned = false;
    GameState.companionRevive();
    this.clearTint();
    this.setAlpha(1);
  }

  isDownedState(): boolean { return this.isDowned; }
  getCooldownPercent(): number {
    return Math.max(0, this.fireballCooldownTimer / GameState.player.fireballCooldown);
  }
  getActiveFireballs(): Phaser.Physics.Arcade.Sprite[] { return this.activeFireballs; }
}
