import Phaser from 'phaser';
import { audio } from '../systems/AudioSystem';

export class FinalBoss extends Phaser.Physics.Arcade.Sprite {
  private hp = 500;
  private maxHp = 500;
  private phase = 1;
  private currentState: 'idle' | 'attack' | 'hurt' | 'phaseTransition' | 'dead' = 'idle';
  private attackTimer = 0;
  private attackCooldown = 2000;
  private hurtTimer = 0;
  private facingRight = false;
  private moveSpeed = 80;
  private transitionTimer = 0;
  private projectiles: Phaser.Physics.Arcade.Sprite[] = [];
  private arenaHazards: Phaser.Physics.Arcade.Sprite[] = [];
  private dead = false;
  private attackPattern = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'boss');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(40, 60);
    body.setOffset(-20, -30);
    body.setGravityY(800);
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(200, 600);
    body.setImmovable(true);
    
    this.setDepth(7);
    this.setScale(2);
    this.setupTexture();
  }

  private setupTexture(): void {
    const g = this.scene.add.graphics();
    // Dark armor body
    g.fillStyle(0x1a1a2e, 1);
    g.fillRect(-20, -30, 40, 45);
    // Helmet
    g.fillStyle(0x16213e, 1);
    g.fillRect(-16, -45, 32, 20);
    // Glowing eyes
    g.fillStyle(0xef4444, 1);
    g.fillRect(-10, -38, 6, 4);
    g.fillRect(4, -38, 6, 4);
    // Crown/horns
    g.fillStyle(0x7c2d12, 1);
    g.fillRect(-18, -50, 6, 8);
    g.fillRect(12, -50, 6, 8);
    g.fillRect(-4, -52, 8, 6);
    // Cape
    g.fillStyle(0x4c1d95, 1);
    g.fillRect(-22, -25, 6, 35);
    g.fillRect(16, -25, 6, 35);
    // Legs
    g.fillStyle(0x1a1a2e, 1);
    g.fillRect(-14, 15, 10, 16);
    g.fillRect(4, 15, 10, 16);
    // Sword
    g.fillStyle(0x6b7280, 1);
    g.fillRect(20, -35, 5, 40);
    g.fillStyle(0xef4444, 1);
    g.fillRect(18, 2, 9, 6);
    // Shoulder pads
    g.fillStyle(0x374151, 1);
    g.fillRect(-24, -28, 8, 10);
    g.fillRect(16, -28, 8, 10);
    
    g.generateTexture('boss', 52, 70);
    g.destroy();
  }

  update(delta: number, playerX: number, playerY: number): void {
    if (this.dead) return;

    // Hurt state
    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
      this.setTint(0xff6666);
      if (this.hurtTimer <= 0) this.clearTint();
      return;
    }

    // Phase transition
    if (this.currentState === 'phaseTransition') {
      this.transitionTimer -= delta;
      this.setAlpha(Math.sin(Date.now() * 0.01) > 0 ? 1 : 0.5);
      if (this.transitionTimer <= 0) {
        this.setAlpha(1);
        this.currentState = 'idle';
      }
      return;
    }

    // Check phase transitions
    if (this.phase === 1 && this.hp < this.maxHp * 0.66) {
      this.enterPhase(2);
      return;
    }
    if (this.phase === 2 && this.hp < this.maxHp * 0.33) {
      this.enterPhase(3);
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    const dist = Math.abs(playerX - this.x);
    const onGround = body.blocked.down || body.touching.down;

    if (!onGround) return;

    // Attack timer
    this.attackTimer -= delta;

    // Phase-based behavior
    switch (this.phase) {
      case 1: this.phaseOneBehavior(delta, playerX, dist); break;
      case 2: this.phaseTwoBehavior(delta, playerX, playerY, dist); break;
      case 3: this.phaseThreeBehavior(delta, playerX, playerY, dist); break;
    }
  }

  private phaseOneBehavior(delta: number, playerX: number, dist: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (dist > 80) {
      const dir = playerX > this.x ? 1 : -1;
      body.setVelocityX(dir * this.moveSpeed);
      this.facingRight = dir > 0;
      this.setFlipX(this.facingRight);
    } else if (this.attackTimer <= 0) {
      // Sword slash attack
      this.attackTimer = this.attackCooldown;
      this.attackPattern = (this.attackPattern + 1) % 3;
    }
  }

  private phaseTwoBehavior(delta: number, playerX: number, playerY: number, dist: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.moveSpeed = 100;
    
    if (dist > 150) {
      const dir = playerX > this.x ? 1 : -1;
      body.setVelocityX(dir * this.moveSpeed);
      this.facingRight = dir > 0;
      this.setFlipX(this.facingRight);
    }
    
    if (this.attackTimer <= 0) {
      this.attackTimer = 1500;
      this.fireProjectile(playerX, playerY);
    }
  }

  private phaseThreeBehavior(delta: number, playerX: number, playerY: number, dist: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.moveSpeed = 140;
    
    // Faster movement and more aggressive
    const dir = playerX > this.x ? 1 : -1;
    body.setVelocityX(dir * this.moveSpeed);
    this.facingRight = dir > 0;
    this.setFlipX(this.facingRight);
    
    if (this.attackTimer <= 0) {
      this.attackTimer = 1000;
      this.attackPattern = (this.attackPattern + 1) % 2;
      if (this.attackPattern === 0) {
        this.fireProjectile(playerX, playerY);
        this.spawnArenaHazard();
      }
    }
  }

  private enterPhase(phase: number): void {
    this.phase = phase;
    this.currentState = 'phaseTransition';
    this.transitionTimer = 2000;
    audio.playBossHit();
    
    // Screen shake
    this.scene.cameras.main.shake(500, 0.01);
    
    // Clear existing projectiles
    this.projectiles.forEach(p => p.destroy());
    this.projectiles = [];
  }

  fireProjectile(targetX: number, targetY: number): void {
    const proj = this.scene.add.sprite(this.x, this.y - 20, 'boss_projectile') as Phaser.Physics.Arcade.Sprite;
    this.scene.physics.add.existing(proj);
    const pBody = proj.body as Phaser.Physics.Arcade.Body;
    pBody.setAllowGravity(false);
    pBody.setSize(10, 10);
    
    const angle = Math.atan2(targetY - this.y, targetX - this.x);
    const speed = 200 + this.phase * 50;
    pBody.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    proj.setDepth(11);
    
    this.projectiles.push(proj);
    this.scene.time.delayedCall(3000, () => {
      const idx = this.projectiles.indexOf(proj);
      if (idx >= 0) this.projectiles.splice(idx, 1);
      proj.destroy();
    });
  }

  spawnArenaHazard(): void {
    const cam = this.scene.cameras.main;
    const x = cam.scrollX + Math.random() * cam.width;
    const hazard = this.scene.add.sprite(x, cam.scrollY - 20, 'boss_projectile') as Phaser.Physics.Arcade.Sprite;
    this.scene.physics.add.existing(hazard);
    const hBody = hazard.body as Phaser.Physics.Arcade.Body;
    hBody.setAllowGravity(false);
    hBody.setVelocityY(250);
    hazard.setTint(0xff0000);
    hazard.setDepth(11);
    
    this.arenaHazards.push(hazard);
    this.scene.time.delayedCall(4000, () => {
      const idx = this.arenaHazards.indexOf(hazard);
      if (idx >= 0) this.arenaHazards.splice(idx, 1);
      hazard.destroy();
    });
  }

  canDamagePlayer(playerX: number, playerY: number): boolean {
    if (this.dead || this.currentState === 'phaseTransition') return false;
    const dist = Math.sqrt((playerX - this.x) ** 2 + (playerY - this.y) ** 2);
    return dist < 70;
  }

  takeDamage(amount: number): void {
    if (this.dead || this.currentState === 'phaseTransition') return;
    this.hp -= amount;
    this.hurtTimer = 200;
    audio.playBossHit();
    
    const txt = this.scene.add.text(this.x, this.y - 50, `-${amount}`, {
      fontSize: '16px', color: '#ffaa00', fontStyle: 'bold'
    }).setDepth(20);
    this.scene.tweens.add({
      targets: txt, y: txt.y - 40, alpha: 0, duration: 800,
      onComplete: () => txt.destroy()
    });
    
    if (this.hp <= 0) {
      this.die();
    }
  }

  private die(): void {
    this.dead = true;
    this.currentState = 'dead';
    audio.playBossHit();
    
    this.scene.cameras.main.shake(1000, 0.02);
    
    this.scene.tweens.add({
      targets: this, alpha: 0, duration: 2000,
      onComplete: () => this.destroy()
    });
    
    // Clean up projectiles
    this.projectiles.forEach(p => p.destroy());
    this.arenaHazards.forEach(h => h.destroy());
  }

  getProjectiles(): Phaser.Physics.Arcade.Sprite[] { return this.projectiles; }
  getArenaHazards(): Phaser.Physics.Arcade.Sprite[] { return this.arenaHazards; }
  isDead(): boolean { return this.dead; }
  getHP(): number { return this.hp; }
  getMaxHP(): number { return this.maxHp; }
  getPhase(): number { return this.phase; }
}
