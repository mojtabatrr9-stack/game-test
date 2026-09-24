import Phaser from 'phaser';
import { audio } from '../systems/AudioSystem';

export interface EnemyConfig {
  type: 'skeleton' | 'fireSpirit' | 'cursedPlant' | 'eliteKnight';
  x: number;
  y: number;
  hp: number;
  damage: number;
  xpReward: number;
  detectionRange: number;
  attackRange: number;
  speed: number;
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  protected config: EnemyConfig;
  protected currentState: 'idle' | 'patrol' | 'chase' | 'attack' | 'hurt' | 'dead' = 'idle';
  protected hp: number;
  protected maxHp: number;
  protected hurtTimer = 0;
  protected attackCooldown = 0;
  protected attackDuration = 0;
  protected facingRight = true;
  protected patrolDir = 1;
  protected patrolTimer = 0;
  protected attackTelegraph = 0;
  protected isTelegraphing = false;
  protected animTimer = 0;
  protected dead = false;
  protected knockbackVel = 0;

  constructor(scene: Phaser.Scene, config: EnemyConfig) {
    super(scene, config.x, config.y, `enemy_${config.type}`);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.config = config;
    this.hp = config.hp;
    this.maxHp = config.hp;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 36);
    body.setOffset(-12, -18);
    body.setGravityY(800);
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(300, 600);
    
    this.setDepth(8);
    this.setupTexture();
  }

  protected setupTexture(): void {
    const g = this.scene.add.graphics();
    const key = `enemy_${this.config.type}`;
    
    switch (this.config.type) {
      case 'skeleton':
        g.fillStyle(0xe8e8e8, 1);
        g.fillRect(-8, -18, 16, 24); // body
        g.fillStyle(0xd4d4d4, 1);
        g.fillRect(-6, -26, 12, 10); // skull
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(-4, -22, 3, 3); // eye
        g.fillRect(1, -22, 3, 3); // eye
        g.fillStyle(0xa0a0a0, 1);
        g.fillRect(-6, 6, 5, 10); // leg
        g.fillRect(1, 6, 5, 10); // leg
        g.fillStyle(0x808080, 1);
        g.fillRect(8, -12, 3, 18); // weapon
        break;
      case 'fireSpirit':
        g.fillStyle(0xf97316, 1);
        g.fillCircle(0, -5, 12);
        g.fillStyle(0xfbbf24, 1);
        g.fillCircle(0, -5, 8);
        g.fillStyle(0xef4444, 1);
        g.fillRect(-3, -8, 2, 3);
        g.fillRect(1, -8, 2, 3);
        g.fillStyle(0xf97316, 0.7);
        g.fillRect(-6, -18, 4, 8);
        g.fillRect(2, -18, 4, 8);
        g.fillRect(-2, -20, 4, 6);
        break;
      case 'cursedPlant':
        g.fillStyle(0x166534, 1);
        g.fillRect(-4, -5, 8, 20);
        g.fillStyle(0x15803d, 1);
        g.fillRect(-12, -15, 10, 12);
        g.fillRect(2, -15, 10, 12);
        g.fillStyle(0xdc2626, 1);
        g.fillCircle(0, -18, 6);
        g.fillStyle(0x991b1b, 1);
        g.fillRect(-2, -20, 4, 4);
        break;
      case 'eliteKnight':
        g.fillStyle(0x374151, 1);
        g.fillRect(-12, -20, 24, 30);
        g.fillStyle(0x1f2937, 1);
        g.fillRect(-10, -30, 20, 14);
        g.fillStyle(0xef4444, 1);
        g.fillRect(-8, -24, 16, 4);
        g.fillStyle(0x4b5563, 1);
        g.fillRect(-10, 10, 8, 12);
        g.fillRect(2, 10, 8, 12);
        g.fillStyle(0x9ca3af, 1);
        g.fillRect(12, -18, 4, 28);
        g.fillStyle(0xfbbf24, 1);
        g.fillRect(10, 8, 8, 4);
        break;
    }
    
    g.generateTexture(key, 32, 44);
    g.destroy();
  }

  update(delta: number, playerX: number, playerY: number): void {
    if (this.dead) return;

    // Hurt state
    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(this.knockbackVel * (this.hurtTimer / 300));
      this.setTint(0xff6666);
      if (this.hurtTimer <= 0) {
        this.clearTint();
        this.currentState = 'idle';
      }
      return;
    }

    // Attack telegraph
    if (this.isTelegraphing) {
      this.attackTelegraph -= delta;
      this.setAlpha(Math.sin(Date.now() * 0.015) > 0 ? 1 : 0.5);
      if (this.attackTelegraph <= 0) {
        this.isTelegraphing = false;
        this.setAlpha(1);
        this.performAttack(playerX, playerY);
      }
      return;
    }

    // Attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    const dist = Math.abs(playerX - this.x);
    const onGround = body.blocked.down || body.touching.down;

    if (!onGround) return;

    // AI based on distance
    if (dist < this.config.attackRange && this.attackCooldown <= 0) {
      this.currentState = 'attack';
      this.isTelegraphing = true;
      this.attackTelegraph = 500; // Telegraph time
    } else if (dist < this.config.detectionRange) {
      this.currentState = 'chase';
      const dir = playerX > this.x ? 1 : -1;
      body.setVelocityX(dir * this.config.speed);
      this.facingRight = dir > 0;
      this.setFlipX(!this.facingRight);
    } else {
      this.currentState = 'patrol';
      this.patrolTimer -= delta;
      if (this.patrolTimer <= 0) {
        this.patrolDir *= -1;
        this.patrolTimer = 2000;
      }
      body.setVelocityX(this.patrolDir * this.config.speed * 0.3);
      this.facingRight = this.patrolDir > 0;
      this.setFlipX(!this.facingRight);
    }
  }

  protected performAttack(playerX: number, playerY: number): void {
    this.attackCooldown = 1500;
    // Attack is handled by the scene checking distance
  }

  canDamagePlayer(playerX: number, playerY: number): boolean {
    if (this.dead || this.currentState === 'hurt') return false;
    if (!this.isTelegraphing && this.attackCooldown > 1000) return false;
    const dist = Math.sqrt((playerX - this.x) ** 2 + (playerY - this.y) ** 2);
    return dist < this.config.attackRange + 10;
  }

  takeDamage(amount: number, knockbackDir: number): boolean {
    if (this.dead) return false;
    
    this.hp -= amount;
    this.hurtTimer = 300;
    this.knockbackVel = knockbackDir * 200;
    this.currentState = 'hurt';
    audio.playHit();
    
    // Floating damage number
    this.showDamageNumber(amount);
    
    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  private showDamageNumber(amount: number): void {
    const txt = this.scene.add.text(this.x, this.y - 30, `-${amount}`, {
      fontSize: '14px', color: '#ff4444', fontStyle: 'bold'
    }).setDepth(20);
    this.scene.tweens.add({
      targets: txt, y: txt.y - 30, alpha: 0, duration: 800,
      onComplete: () => txt.destroy()
    });
  }

  protected die(): void {
    this.dead = true;
    this.currentState = 'dead';
    audio.playEnemyDeath();
    
    this.scene.tweens.add({
      targets: this, alpha: 0, y: this.y + 10, duration: 500,
      onComplete: () => this.destroy()
    });
  }

  isDead(): boolean { return this.dead; }
  getHP(): number { return this.hp; }
  getMaxHP(): number { return this.maxHp; }
  getXP(): number { return this.config.xpReward; }
  getType(): string { return this.config.type; }
}

// Fire Spirit - ranged enemy
export class FireSpiritEnemy extends Enemy {
  private projectileCooldown = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, {
      type: 'fireSpirit', x, y, hp: 40, damage: 12,
      xpReward: 20, detectionRange: 250, attackRange: 200, speed: 60
    });
  }

  protected performAttack(_playerX: number, _playerY: number): void {
    this.attackCooldown = 2000;
    // Fire projectile handled by scene
  }

  shouldFireProjectile(): boolean {
    if (this.dead || this.attackCooldown > 1500) return false;
    return this.currentState === 'chase' || this.currentState === 'attack';
  }
}

// Cursed Plant - ambush enemy
export class CursedPlantEnemy extends Enemy {
  private triggered = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, {
      type: 'cursedPlant', x, y, hp: 30, damage: 15,
      xpReward: 15, detectionRange: 80, attackRange: 50, speed: 0
    });
    this.setAlpha(0.7);
  }

  update(delta: number, playerX: number, playerY: number): void {
    if (this.dead) return;
    const dist = Math.abs(playerX - this.x);
    if (!this.triggered && dist < this.config.detectionRange) {
      this.triggered = true;
      this.setAlpha(1);
      this.isTelegraphing = true;
      this.attackTelegraph = 300;
    }
    if (this.triggered) {
      super.update(delta, playerX, playerY);
    }
  }
}

// Mini-boss
export class MiniBoss extends Enemy {
  private phase = 1;
  private chargeTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, {
      type: 'eliteKnight', x, y, hp: 200, damage: 25,
      xpReward: 100, detectionRange: 300, attackRange: 60, speed: 100
    });
    this.setScale(1.5);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(36, 54);
  }

  update(delta: number, playerX: number, playerY: number): void {
    if (this.dead) return;
    
    if (this.hp < this.maxHp * 0.5 && this.phase === 1) {
      this.phase = 2;
      this.config.speed = 140;
    }
    
    super.update(delta, playerX, playerY);
  }

  getPhase(): number { return this.phase; }
}
