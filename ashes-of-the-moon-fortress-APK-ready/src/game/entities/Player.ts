import Phaser from 'phaser';
import { GameState } from '../GameState';
import { audio } from '../systems/AudioSystem';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private speed = 200;
  private jumpForce = -420;
  private isAttacking = false;
  private attackTimer = 0;
  private attackDuration = 300;
  private isHurt = false;
  private hurtTimer = 0;
  private invulnerable = false;
  private invulnerableTimer = 0;
  private facingRight = true;
  private coyoteTime = 0;
  private coyoteDuration = 100;
  private jumpBufferTime = 0;
  private jumpBufferDuration = 100;
  private isGrounded = false;
  private attackHitbox: Phaser.Geom.Rectangle | null = null;
  private animFrame = 0;
  private animTimer = 0;
  private currentState: 'idle' | 'run' | 'jump' | 'fall' | 'attack' | 'hurt' | 'dead' = 'idle';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 40);
    body.setOffset(-12, -20);
    body.setCollideWorldBounds(true);
    body.setGravityY(800);
    body.setMaxVelocity(300, 600);
    
    this.setDepth(10);
    this.setupTexture();
  }

  private setupTexture(): void {
    const g = this.scene.add.graphics();
    // Knight body
    g.fillStyle(0x4a5568, 1);
    g.fillRect(-12, -20, 24, 30);
    // Helmet
    g.fillStyle(0x718096, 1);
    g.fillRect(-10, -28, 20, 12);
    // Visor
    g.fillStyle(0x2d3748, 1);
    g.fillRect(-8, -22, 16, 4);
    // Legs
    g.fillStyle(0x2d3748, 1);
    g.fillRect(-10, 10, 8, 12);
    g.fillRect(2, 10, 8, 12);
    // Sword
    g.fillStyle(0xe2e8f0, 1);
    g.fillRect(12, -15, 3, 25);
    g.fillStyle(0x8b6914, 1);
    g.fillRect(10, 8, 7, 4);
    // Cape
    g.fillStyle(0x9b2c2c, 1);
    g.fillRect(-14, -15, 4, 20);
    
    g.generateTexture('player', 32, 48);
    g.destroy();
  }

  update(time: number, delta: number, cursors: Phaser.Types.Input.Keyboard.CursorKeys, spaceKey: Phaser.Input.Keyboard.Key): void {
    if (this.currentState === 'dead') return;

    // Timers
    if (this.invulnerable) {
      this.invulnerableTimer -= delta;
      this.setAlpha(Math.sin(time * 0.02) > 0 ? 1 : 0.4);
      if (this.invulnerableTimer <= 0) {
        this.invulnerable = false;
        this.setAlpha(1);
      }
    }

    if (this.isHurt) {
      this.hurtTimer -= delta;
      if (this.hurtTimer <= 0) this.isHurt = false;
      return;
    }

    if (this.isAttacking) {
      this.attackTimer -= delta;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
        this.attackHitbox = null;
      }
      return;
    }

    // Stamina regen
    GameState.restoreStamina(delta * 0.02);

    const body = this.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.touching.down;
    
    if (onGround) {
      this.coyoteTime = this.coyoteDuration;
      this.isGrounded = true;
    } else {
      this.coyoteTime -= delta;
      this.isGrounded = false;
    }

    // Jump buffer
    if (Phaser.Input.Keyboard.JustDown(cursors.up!)) {
      this.jumpBufferTime = this.jumpBufferDuration;
    }
    this.jumpBufferTime -= delta;

    // Movement
    let moveX = 0;
    if (cursors.left?.isDown) moveX = -1;
    if (cursors.right?.isDown) moveX = 1;

    if (moveX !== 0) {
      body.setVelocityX(moveX * this.speed);
      this.facingRight = moveX > 0;
      this.setFlipX(!this.facingRight);
    } else {
      body.setVelocityX(body.velocity.x * 0.7);
    }

    // Jump
    if (this.jumpBufferTime > 0 && this.coyoteTime > 0) {
      body.setVelocityY(this.jumpForce);
      this.coyoteTime = 0;
      this.jumpBufferTime = 0;
      audio.playJump();
    }

    // Attack
    if (Phaser.Input.Keyboard.JustDown(spaceKey) && !this.isAttacking) {
      this.startAttack();
    }

    // Animation state
    this.updateAnimation(onGround, body.velocity);
  }

  private startAttack(): void {
    this.isAttacking = true;
    this.attackTimer = this.attackDuration;
    audio.playSword();
    
    const dir = this.facingRight ? 1 : -1;
    this.attackHitbox = new Phaser.Geom.Rectangle(
      this.x + dir * 20, this.y - 10, 30, 30
    );
  }

  private updateAnimation(onGround: boolean, velocity: { x: number; y: number }): void {
    if (this.isAttacking) {
      this.currentState = 'attack';
    } else if (!onGround) {
      this.currentState = velocity.y < 0 ? 'jump' : 'fall';
    } else if (Math.abs(velocity.x) > 10) {
      this.currentState = 'run';
    } else {
      this.currentState = 'idle';
    }
  }

  getAttackHitbox(): Phaser.Geom.Rectangle | null {
    if (!this.isAttacking || !this.attackHitbox) return null;
    const dir = this.facingRight ? 1 : -1;
    this.attackHitbox.x = this.x + dir * 20;
    this.attackHitbox.y = this.y - 10;
    return this.attackHitbox;
  }

  takeDamage(amount: number, knockbackDir: number): boolean {
    if (this.invulnerable || this.currentState === 'dead') return false;
    
    const dead = GameState.takeDamage(amount);
    this.isHurt = true;
    this.hurtTimer = 300;
    this.invulnerable = true;
    this.invulnerableTimer = 1000;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(knockbackDir * 200);
    body.setVelocityY(-150);
    
    audio.playDamage();
    
    if (dead) {
      this.currentState = 'dead';
      body.setVelocity(0, 0);
      this.setTint(0x666666);
    }
    
    return dead;
  }

  isDead(): boolean { return this.currentState === 'dead'; }
  isOnGround(): boolean { return this.isGrounded; }
  getFacing(): number { return this.facingRight ? 1 : -1; }

  respawn(x: number, y: number): void {
    this.setPosition(x, y);
    this.currentState = 'idle';
    this.isHurt = false;
    this.invulnerable = false;
    this.isAttacking = false;
    this.setAlpha(1);
    this.clearTint();
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.enable = true;
  }
}
