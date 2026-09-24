import Phaser from 'phaser';
import { GameState } from '../GameState';
import { Player } from '../entities/Player';
import { Companion } from '../entities/Companion';
import { Enemy, FireSpiritEnemy, CursedPlantEnemy, MiniBoss } from '../entities/Enemies';
import { FinalBoss } from '../entities/Boss';
import { HUD } from '../ui/HUD';
import { DialogueSystem, DialogueSequence } from '../ui/DialogueSystem';
import { audio } from '../systems/AudioSystem';

export interface LevelData {
  width: number;
  height: number;
  platforms: Array<{ x: number; y: number; w: number; h: number; oneWay?: boolean }>;
  enemies: Array<{ type: string; x: number; y: number }>;
  checkpoints: Array<{ x: number; y: number; id: string }>;
  npcs: Array<{ x: number; y: number; id: string; dialogue: DialogueSequence }>;
  exitX: number;
  exitY: number;
  nextLevel: number;
  bgColor: number;
  bgFar: number;
  bgMid: number;
  quest: string;
  boss?: { x: number; y: number };
  hazards?: Array<{ x: number; y: number; w: number; h: number }>;
  movingPlatforms?: Array<{ x: number; y: number; w: number; dx: number; dy: number; speed: number }>;
  dialogue?: DialogueSequence;
}

export class BaseLevelScene extends Phaser.Scene {
  protected player!: Player;
  protected companion!: Companion;
  protected enemies: Enemy[] = [];
  protected boss: FinalBoss | null = null;
  protected hud!: HUD;
  protected dialogue!: DialogueSystem;
  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected spaceKey!: Phaser.Input.Keyboard.Key;
  protected fKey!: Phaser.Input.Keyboard.Key;
  protected eKey!: Phaser.Input.Keyboard.Key;
  protected escKey!: Phaser.Input.Keyboard.Key;
  protected rKey!: Phaser.Input.Keyboard.Key;
  protected uKey!: Phaser.Input.Keyboard.Key;
  protected platforms: Phaser.Physics.Arcade.StaticGroup | null = null;
  protected oneWayPlatforms: Phaser.Physics.Arcade.Group | null = null;
  protected movingPlatformGroup: Phaser.Physics.Arcade.Group | null = null;
  protected checkpoints: Phaser.GameObjects.Sprite[] = [];
  protected npcs: Phaser.GameObjects.Sprite[] = [];
  protected exitGate!: Phaser.GameObjects.Sprite;
  protected hazards: Phaser.Physics.Arcade.StaticGroup | null = null;
  protected levelData!: LevelData;
  protected isPaused = false;
  protected pauseContainer!: Phaser.GameObjects.Container;
  protected lastCheckpoint = { x: 100, y: 400 };
  protected interactTarget: string | null = null;
  protected mobileControls: { left: boolean; right: boolean; jump: boolean; attack: boolean; fire: boolean; interact: boolean } = {
    left: false, right: false, jump: false, attack: false, fire: false, interact: false
  };
  protected upgradeMenu: Phaser.GameObjects.Container | null = null;
  protected fireballTextureCreated = false;

  constructor(key: string) {
    super(key);
  }

  create(): void {
    audio.init();
    audio.resume();
    audio.playMusic(GameState.story.currentLevel);
    
    this.createFireballTextures();
    this.setupInput();
    this.buildLevel();
    this.setupCollisions();
    this.setupHUD();
    this.setupDialogue();
    this.createParallax();
    this.createMobileControls();
    this.createPauseMenu();
    
    // Level intro dialogue
    if (this.levelData.dialogue) {
      this.time.delayedCall(500, () => {
        this.dialogue.start(this.levelData.dialogue!);
      });
    }
    
    this.hud.setQuest(this.levelData.quest);
    
    // Prevent browser scroll
    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    });
  }

  private createFireballTextures(): void {
    if (this.fireballTextureCreated) return;
    this.fireballTextureCreated = true;
    
    const g = this.add.graphics();
    g.fillStyle(0xf97316, 1);
    g.fillCircle(6, 6, 6);
    g.fillStyle(0xfbbf24, 1);
    g.fillCircle(6, 6, 3);
    g.generateTexture('fireball', 12, 12);
    g.destroy();
    
    const g2 = this.add.graphics();
    g2.fillStyle(0xf97316, 0.8);
    g2.fillCircle(3, 3, 3);
    g2.generateTexture('fireball_particle', 6, 6);
    g2.destroy();
    
    const g3 = this.add.graphics();
    g3.fillStyle(0xef4444, 1);
    g3.fillCircle(5, 5, 5);
    g3.fillStyle(0xfbbf24, 0.8);
    g3.fillCircle(5, 5, 3);
    g3.generateTexture('boss_projectile', 10, 10);
    g3.destroy();
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.fKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.rKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.uKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.U);
  }

  protected buildLevel(): void {
    const ld = this.levelData;
    
    // Camera bounds
    this.cameras.main.setBounds(0, 0, ld.width, ld.height);
    this.physics.world.setBounds(0, 0, ld.width, ld.height);
    
    // Background
    this.cameras.main.setBackgroundColor(ld.bgColor);
    
    // Static platforms
    this.platforms = this.physics.add.staticGroup();
    this.oneWayPlatforms = this.physics.add.group({ allowGravity: false, immovable: true });
    
    ld.platforms.forEach(p => {
      const plat = this.add.rectangle(p.x, p.y, p.w, p.h, 0x374151);
      this.physics.add.existing(plat, true);
      if (p.oneWay) {
        (this.oneWayPlatforms as Phaser.Physics.Arcade.Group).add(plat);
      } else {
        (this.platforms as Phaser.Physics.Arcade.StaticGroup).add(plat, true);
      }
      // Platform decoration
      const deco = this.add.graphics();
      deco.fillStyle(0x4b5563, 1);
      deco.fillRect(p.x - p.w/2, p.y - p.h/2, p.w, 4);
    });
    
    // Moving platforms
    if (ld.movingPlatforms) {
      this.movingPlatformGroup = this.physics.add.group({ allowGravity: false, immovable: true });
      ld.movingPlatforms.forEach(mp => {
        const plat = this.add.rectangle(mp.x, mp.y, mp.w, 16, 0x6b21a8);
        this.physics.add.existing(plat, true);
        (this.movingPlatformGroup as Phaser.Physics.Arcade.Group).add(plat);
        this.tweens.add({
          targets: plat,
          x: mp.x + mp.dx,
          y: mp.y + mp.dy,
          duration: 2000 / mp.speed,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      });
    }
    
    // Hazards
    if (ld.hazards) {
      this.hazards = this.physics.add.staticGroup();
      ld.hazards.forEach(h => {
        const spike = this.add.rectangle(h.x, h.y, h.w, h.h, 0xef4444);
        this.physics.add.existing(spike, true);
        (this.hazards as Phaser.Physics.Arcade.StaticGroup).add(spike, true);
        // Spike visual
        const g = this.add.graphics();
        g.fillStyle(0xef4444, 1);
        for (let i = 0; i < h.w; i += 12) {
          g.fillTriangle(h.x - h.w/2 + i, h.y + h.h/2, h.x - h.w/2 + i + 6, h.y - h.h/2, h.x - h.w/2 + i + 12, h.y + h.h/2);
        }
      });
    }
    
    // Player
    this.player = new Player(this, 100, ld.height - 100);
    
    // Companion
    this.companion = new Companion(this, 60, ld.height - 100);
    if (!GameState.companion.alive || GameState.companion.downed) {
      this.companion.down();
    }
    
    // Enemies
    ld.enemies.forEach(e => {
      let enemy: Enemy;
      switch (e.type) {
        case 'fireSpirit':
          enemy = new FireSpiritEnemy(this, e.x, e.y);
          break;
        case 'cursedPlant':
          enemy = new CursedPlantEnemy(this, e.x, e.y);
          break;
        case 'miniBoss':
          enemy = new MiniBoss(this, e.x, e.y);
          break;
        default:
          enemy = new Enemy(this, { type: 'skeleton', x: e.x, y: e.y, hp: 50, damage: 10, xpReward: 15, detectionRange: 180, attackRange: 40, speed: 70 });
      }
      this.enemies.push(enemy);
    });
    
    // Boss
    if (ld.boss) {
      this.boss = new FinalBoss(this, ld.boss.x, ld.boss.y);
    }
    
    // Checkpoints
    ld.checkpoints.forEach(cp => {
      const sprite = this.add.sprite(cp.x, cp.y, 'checkpoint');
      this.createCheckpointTexture();
      const g = this.add.graphics();
      g.fillStyle(0x8b5cf6, 0.8);
      g.fillRect(cp.x - 8, cp.y - 30, 16, 40);
      g.fillStyle(0xfbbf24, 1);
      g.fillTriangle(cp.x - 8, cp.y - 30, cp.x + 8, cp.y - 30, cp.x, cp.y - 40);
      sprite.setData('id', cp.id);
      sprite.setData('x', cp.x);
      sprite.setData('y', cp.y);
      this.checkpoints.push(sprite);
    });
    
    // NPCs
    ld.npcs.forEach(npc => {
      const sprite = this.add.sprite(npc.x, npc.y, 'npc');
      this.createNPCTexture();
      const g = this.add.graphics();
      g.fillStyle(0x065f46, 1);
      g.fillRect(npc.x - 10, npc.y - 25, 20, 30);
      g.fillStyle(0xfbbf24, 1);
      g.fillCircle(npc.x, npc.y - 30, 8);
      g.fillStyle(0x22c55e, 1);
      g.fillRect(npc.x - 2, npc.y - 40, 4, 8);
      sprite.setData('id', npc.id);
      sprite.setData('dialogue', npc.dialogue);
      this.npcs.push(sprite);
    });
    
    // Exit gate
    this.createExitTexture();
    this.exitGate = this.add.sprite(ld.exitX, ld.exitY, 'exit_gate');
    
    // Camera follow
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
  }

  private createCheckpointTexture(): void {
    if (!this.textures.exists('checkpoint')) {
      const g = this.add.graphics();
      g.fillStyle(0x8b5cf6, 1);
      g.fillRect(0, 0, 16, 40);
      g.generateTexture('checkpoint', 16, 40);
      g.destroy();
    }
  }

  private createNPCTexture(): void {
    if (!this.textures.exists('npc')) {
      const g = this.add.graphics();
      g.fillStyle(0x065f46, 1);
      g.fillRect(0, 0, 20, 30);
      g.generateTexture('npc', 20, 30);
      g.destroy();
    }
  }

  private createExitTexture(): void {
    if (!this.textures.exists('exit_gate')) {
      const g = this.add.graphics();
      g.fillStyle(0x8b5cf6, 0.6);
      g.fillRect(0, 0, 40, 60);
      g.lineStyle(3, 0xfbbf24, 1);
      g.strokeRect(2, 2, 36, 56);
      g.fillStyle(0xfbbf24, 0.8);
      g.fillRect(15, 25, 10, 10);
      g.generateTexture('exit_gate', 40, 60);
      g.destroy();
    }
  }

  private setupCollisions(): void {
    // Player-platform collisions
    if (this.platforms) {
      this.physics.add.collider(this.player, this.platforms);
      this.physics.add.collider(this.companion, this.platforms);
      this.enemies.forEach(e => this.physics.add.collider(e, this.platforms!));
      if (this.boss) this.physics.add.collider(this.boss, this.platforms);
    }
    
    // One-way platforms (only collide from above)
    if (this.oneWayPlatforms) {
      this.physics.add.collider(this.player, this.oneWayPlatforms, (obj1) => {
        const body = (obj1 as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.Body;
        if (body.velocity.y > 0) return;
        body.position.y = body.prev.y;
      });
      this.physics.add.collider(this.companion, this.oneWayPlatforms);
      this.enemies.forEach(e => this.physics.add.collider(e, this.oneWayPlatforms!));
    }
    
    // Moving platforms
    if (this.movingPlatformGroup) {
      this.physics.add.collider(this.player, this.movingPlatformGroup);
      this.physics.add.collider(this.companion, this.movingPlatformGroup);
    }
    
    // Hazards
    if (this.hazards) {
      this.physics.add.overlap(this.player, this.hazards, () => {
        this.player.takeDamage(15, this.player.x < (this.hazards as any).getFirstAlive()?.x ? -1 : 1);
        this.hud.flashDamage();
      });
    }
  }

  private setupHUD(): void {
    this.hud = new HUD(this);
  }

  private setupDialogue(): void {
    this.dialogue = new DialogueSystem(this);
  }

  private createParallax(): void {
    const ld = this.levelData;
    // Far background
    const farBg = this.add.graphics().setScrollFactor(0.2);
    farBg.fillStyle(ld.bgFar, 0.3);
    for (let i = 0; i < ld.width; i += 200) {
      const h = 100 + Math.random() * 150;
      farBg.fillTriangle(i, ld.height - h, i + 100, ld.height - h - 80, i + 200, ld.height - h);
    }
    
    // Mid background
    const midBg = this.add.graphics().setScrollFactor(0.5);
    midBg.fillStyle(ld.bgMid, 0.4);
    for (let i = 0; i < ld.width; i += 120) {
      const h = 60 + Math.random() * 100;
      midBg.fillRect(i, ld.height - h, 80, h);
    }
    
    // Stars/particles
    const stars = this.add.graphics().setScrollFactor(0.1);
    stars.fillStyle(0xfbbf24, 0.5);
    for (let i = 0; i < 50; i++) {
      stars.fillCircle(Math.random() * ld.width, Math.random() * ld.height * 0.5, 1 + Math.random() * 2);
    }
  }

  private createMobileControls(): void {
    // Only show on touch devices
    if (!('ontouchstart' in window)) return;
    
    const btnSize = 50;
    const padding = 10;
    const baseY = 620;
    
    const createBtn = (x: number, y: number, label: string, key: keyof typeof this.mobileControls) => {
      const btn = this.add.rectangle(x, y, btnSize, btnSize, 0x1a1a2e, 0.6)
        .setScrollFactor(0).setDepth(60).setInteractive();
      const txt = this.add.text(x, y, label, { fontSize: '12px', color: '#e2e8f0', fontFamily: 'monospace' })
        .setOrigin(0.5).setScrollFactor(0).setDepth(61);
      
      btn.on('pointerdown', () => { this.mobileControls[key] = true; });
      btn.on('pointerup', () => { this.mobileControls[key] = false; });
      btn.on('pointerout', () => { this.mobileControls[key] = false; });
    };
    
    createBtn(70, baseY, '◄', 'left');
    createBtn(140, baseY, '►', 'right');
    createBtn(105, baseY - 60, '▲', 'jump');
    createBtn(1140, baseY, '⚔', 'attack');
    createBtn(1070, baseY, '🔥', 'fire');
    createBtn(1210, baseY, 'E', 'interact');
  }

  private createPauseMenu(): void {
    this.pauseContainer = this.add.container(0, 0).setDepth(200).setVisible(false);
    const bg = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.8);
    this.pauseContainer.add(bg);
    
    const title = this.add.text(640, 200, 'PAUSED', { fontSize: '48px', color: '#fbbf24', fontStyle: 'bold', fontFamily: 'monospace' }).setOrigin(0.5);
    this.pauseContainer.add(title);
    
    const resumeBtn = this.add.text(640, 320, '[ Continue ]', { fontSize: '24px', color: '#e2e8f0', fontFamily: 'monospace' }).setOrigin(0.5).setInteractive();
    resumeBtn.on('pointerdown', () => this.togglePause());
    this.pauseContainer.add(resumeBtn);
    
    const settingsBtn = this.add.text(640, 380, '[ Settings ]', { fontSize: '24px', color: '#e2e8f0', fontFamily: 'monospace' }).setOrigin(0.5).setInteractive();
    settingsBtn.on('pointerdown', () => this.showSettings());
    this.pauseContainer.add(settingsBtn);
    
    const quitBtn = this.add.text(640, 440, '[ Quit to Menu ]', { fontSize: '24px', color: '#ef4444', fontFamily: 'monospace' }).setOrigin(0.5).setInteractive();
    quitBtn.on('pointerdown', () => { audio.stopMusic(); this.scene.start('MenuScene'); });
    this.pauseContainer.add(quitBtn);
    
    const resetBtn = this.add.text(640, 520, '[ Reset Save ]', { fontSize: '18px', color: '#94a3b8', fontFamily: 'monospace' }).setOrigin(0.5).setInteractive();
    resetBtn.on('pointerdown', () => { GameState.reset(); });
    this.pauseContainer.add(resetBtn);
  }

  private showSettings(): void {
    // Simple volume display
    const txt = this.add.text(640, 560, `Music: ${Math.round(GameState.settings.musicVolume * 100)}% | SFX: ${Math.round(GameState.settings.sfxVolume * 100)}%`, {
      fontSize: '14px', color: '#94a3b8', fontFamily: 'monospace'
    }).setOrigin(0.5);
    this.pauseContainer.add(txt);
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;
    this.pauseContainer.setVisible(this.isPaused);
    if (this.isPaused) {
      this.physics.pause();
    } else {
      this.physics.resume();
    }
  }

  update(time: number, delta: number): void {
    if (this.isPaused) return;
    if (this.dialogue.getActive()) return;
    
    // Handle pause
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.togglePause();
      return;
    }
    
    // Handle restart
    if (Phaser.Input.Keyboard.JustDown(this.rKey) && this.player.isDead()) {
      this.restartLevel();
      return;
    }
    
    // Handle upgrade menu
    if (Phaser.Input.Keyboard.JustDown(this.uKey) && GameState.player.upgradePoints > 0) {
      this.showUpgradeMenu();
      return;
    }
    
    // Update player
    this.player.update(time, delta, this.cursors, this.spaceKey);
    
    // Handle mobile input
    if (this.mobileControls.left) {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(-200);
      this.player.setFlipX(true);
    }
    if (this.mobileControls.right) {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(200);
      this.player.setFlipX(false);
    }
    if (this.mobileControls.jump) {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      if (this.player.isOnGround()) body.setVelocityY(-420);
      this.mobileControls.jump = false;
    }
    if (this.mobileControls.attack) {
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        // Attack handled in player update
      }
      this.mobileControls.attack = false;
    }
    
    // Fire fireball
    if (Phaser.Input.Keyboard.JustDown(this.fKey) || this.mobileControls.fire) {
      const fb = this.companion.fireFireball();
      if (fb) {
        // Setup fireball collision with enemies
        this.enemies.forEach(enemy => {
          this.physics.add.overlap(fb, enemy, () => {
            enemy.takeDamage(GameState.player.fireballDamage, fb.x < enemy.x ? 1 : -1);
            this.companion.createImpactEffect(fb.x, fb.y);
            this.companion.removeFireball(fb);
          });
        });
        // Boss collision
        if (this.boss && !this.boss.isDead()) {
          this.physics.add.overlap(fb, this.boss, () => {
            this.boss!.takeDamage(GameState.player.fireballDamage);
            this.companion.createImpactEffect(fb.x, fb.y);
            this.companion.removeFireball(fb);
          });
        }
      }
      this.mobileControls.fire = false;
    }
    
    // Update companion
    this.companion.update(delta, this.player.x, this.player.y, this.player.getFacing());
    
    // Update enemies
    this.enemies = this.enemies.filter(e => !e.isDead());
    this.enemies.forEach(enemy => {
      enemy.update(delta, this.player.x, this.player.y);
      
      // Enemy damages player
      if (enemy.canDamagePlayer(this.player.x, this.player.y)) {
        const dir = this.player.x < enemy.x ? -1 : 1;
        const dead = this.player.takeDamage(enemy['config'].damage, dir);
        this.hud.flashDamage();
        if (dead) this.onPlayerDeath();
      }
      
      // Player sword hits enemy
      const hitbox = this.player.getAttackHitbox();
      if (hitbox) {
        const enemyBounds = enemy.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(hitbox, enemyBounds)) {
          const killed = enemy.takeDamage(GameState.player.attack, this.player.getFacing());
          if (killed) this.onEnemyKilled(enemy);
        }
      }
    });
    
    // Update boss
    if (this.boss && !this.boss.isDead()) {
      this.boss.update(delta, this.player.x, this.player.y);
      
      // Boss damages player
      if (this.boss.canDamagePlayer(this.player.x, this.player.y)) {
        const dir = this.player.x < this.boss.x ? -1 : 1;
        const dead = this.player.takeDamage(20, dir);
        this.hud.flashDamage();
        if (dead) this.onPlayerDeath();
      }
      
      // Boss projectiles
      this.boss.getProjectiles().forEach(proj => {
        this.physics.add.overlap(this.player, proj, () => {
          const dir = this.player.x < proj.x ? -1 : 1;
          const dead = this.player.takeDamage(15, dir);
          this.hud.flashDamage();
          proj.destroy();
          if (dead) this.onPlayerDeath();
        });
      });
      
      // Arena hazards
      this.boss.getArenaHazards().forEach(hazard => {
        this.physics.add.overlap(this.player, hazard, () => {
          const dead = this.player.takeDamage(10, 0);
          this.hud.flashDamage();
          hazard.destroy();
          if (dead) this.onPlayerDeath();
        });
      });
      
      // Player attacks boss
      const hitbox = this.player.getAttackHitbox();
      if (hitbox) {
        const bossBounds = this.boss.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(hitbox, bossBounds)) {
          this.boss.takeDamage(GameState.player.attack);
          if (this.boss.isDead()) this.onBossDefeated();
        }
      }
      
      // Update boss HUD
      this.hud.showBoss('The Commander', this.boss.getHP(), this.boss.getMaxHP());
    }
    
    // Checkpoint interaction
    this.interactTarget = null;
    this.checkpoints.forEach(cp => {
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, cp.getData('x'), cp.getData('y')) < 50) {
        this.interactTarget = `checkpoint_${cp.getData('id')}`;
        this.hud.showInteraction('[E] Rest at Checkpoint');
        if (Phaser.Input.Keyboard.JustDown(this.eKey) || this.mobileControls.interact) {
          GameState.addCheckpoint(cp.getData('id'));
          this.lastCheckpoint = { x: cp.getData('x'), y: cp.getData('y') };
          GameState.heal(30);
          if (this.companion.isDownedState()) this.companion.revive();
          audio.playCheckpoint();
          this.mobileControls.interact = false;
        }
      }
    });
    
    // NPC interaction
    this.npcs.forEach(npc => {
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y) < 60) {
        this.interactTarget = `npc_${npc.getData('id')}`;
        this.hud.showInteraction('[E] Talk');
        if (Phaser.Input.Keyboard.JustDown(this.eKey) || this.mobileControls.interact) {
          this.dialogue.start(npc.getData('dialogue'));
          this.mobileControls.interact = false;
        }
      }
    });
    
    // Exit gate
    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.exitGate.x, this.exitGate.y) < 50) {
      if (this.enemies.length === 0 || this.levelData.enemies.length === 0) {
        this.hud.showInteraction('[E] Proceed');
        if (Phaser.Input.Keyboard.JustDown(this.eKey) || this.mobileControls.interact) {
          this.nextLevel();
          this.mobileControls.interact = false;
        }
      } else {
        this.hud.showInteraction(`Defeat all enemies (${this.enemies.length} remaining)`);
      }
    }
    
    if (!this.interactTarget) {
      this.hud.hideInteraction();
    }
    
    // Fall death
    if (this.player.y > this.levelData.height + 100) {
      const dead = this.player.takeDamage(999, 0);
      if (dead) this.onPlayerDeath();
    }
    
    // Update HUD
    this.hud.update();
  }

  protected onEnemyKilled(enemy: Enemy): void {
    const leveled = GameState.addXP(enemy.getXP());
    if (leveled) {
      audio.playLevelUp();
      this.showLevelUpNotification();
    }
  }

  protected onBossDefeated(): void {
    GameState.setStoryFlag('bossDefeated', true);
    GameState.addXP(200);
    audio.stopMusic();
    this.hud.hideBoss();
    
    this.time.delayedCall(2000, () => {
      this.scene.start('EndingScene');
    });
  }

  protected onPlayerDeath(): void {
    this.time.delayedCall(1500, () => {
      this.showDeathScreen();
    });
  }

  private showDeathScreen(): void {
    const container = this.add.container(0, 0).setDepth(200);
    const bg = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.8);
    container.add(bg);
    
    const text = this.add.text(640, 280, 'YOU DIED', { fontSize: '48px', color: '#ef4444', fontStyle: 'bold', fontFamily: 'monospace' }).setOrigin(0.5);
    container.add(text);
    
    const restart = this.add.text(640, 380, '[R] Restart from Checkpoint', { fontSize: '24px', color: '#e2e8f0', fontFamily: 'monospace' }).setOrigin(0.5);
    container.add(restart);
    
    const menu = this.add.text(640, 430, '[ESC] Return to Menu', { fontSize: '18px', color: '#94a3b8', fontFamily: 'monospace' }).setOrigin(0.5);
    container.add(menu);
  }

  private restartLevel(): void {
    GameState.player.hp = GameState.player.maxHp;
    GameState.player.stamina = GameState.player.maxStamina;
    GameState.save();
    this.player.respawn(this.lastCheckpoint.x, this.lastCheckpoint.y);
  }

  private showLevelUpNotification(): void {
    const txt = this.add.text(640, 200, `LEVEL UP! Lv.${GameState.player.level}\nPress U to upgrade`, {
      fontSize: '24px', color: '#fbbf24', fontStyle: 'bold', fontFamily: 'monospace', align: 'center'
    }).setOrigin(0.5).setDepth(100);
    
    this.tweens.add({
      targets: txt, y: 150, alpha: 0, duration: 3000,
      onComplete: () => txt.destroy()
    });
  }

  private showUpgradeMenu(): void {
    if (this.upgradeMenu) return;
    
    this.upgradeMenu = this.add.container(0, 0).setDepth(150);
    const bg = this.add.rectangle(640, 360, 500, 400, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(2, 0x8b5cf6);
    this.upgradeMenu.add(bg);
    
    const title = this.add.text(640, 190, 'UPGRADE', { fontSize: '28px', color: '#fbbf24', fontStyle: 'bold', fontFamily: 'monospace' }).setOrigin(0.5);
    this.upgradeMenu.add(title);
    
    const points = this.add.text(640, 230, `Points: ${GameState.player.upgradePoints}`, { fontSize: '16px', color: '#34d399', fontFamily: 'monospace' }).setOrigin(0.5);
    this.upgradeMenu.add(points);
    
    const upgrades = [
      { key: 'maxHp', label: `Max HP (+20) [${GameState.player.maxHp}]` },
      { key: 'attack', label: `Sword DMG (+5) [${GameState.player.attack}]` },
      { key: 'fireballDamage', label: `Fireball DMG (+3) [${GameState.player.fireballDamage}]` },
      { key: 'fireballCooldown', label: `Fireball CD (-0.2s) [${(GameState.player.fireballCooldown/1000).toFixed(1)}s]` },
      { key: 'maxStamina', label: `Max Stamina (+20) [${GameState.player.maxStamina}]` }
    ];
    
    upgrades.forEach((u, i) => {
      const y = 280 + i * 40;
      const btn = this.add.text(640, y, u.label, { fontSize: '14px', color: '#e2e8f0', fontFamily: 'monospace' }).setOrigin(0.5).setInteractive();
      btn.on('pointerdown', () => {
        if (GameState.player.upgradePoints > 0) {
          GameState.upgradeStat(u.key);
          audio.playUI();
          this.upgradeMenu!.destroy();
          this.upgradeMenu = null;
          if (GameState.player.upgradePoints > 0) this.showUpgradeMenu();
        }
      });
      btn.on('pointerover', () => btn.setColor('#fbbf24'));
      btn.on('pointerout', () => btn.setColor('#e2e8f0'));
      this.upgradeMenu!.add(btn);
    });
    
    const closeBtn = this.add.text(640, 530, '[Close - ESC]', { fontSize: '14px', color: '#94a3b8', fontFamily: 'monospace' }).setOrigin(0.5).setInteractive();
    closeBtn.on('pointerdown', () => { this.upgradeMenu?.destroy(); this.upgradeMenu = null; });
    this.upgradeMenu.add(closeBtn);
    
    // Close with ESC
    const escHandler = this.input.keyboard!.on('keydown-ESC', () => {
      this.upgradeMenu?.destroy();
      this.upgradeMenu = null;
      escHandler.removeAllListeners();
    });
  }

  protected nextLevel(): void {
    const next = this.levelData.nextLevel;
    GameState.setLevel(next);
    GameState.save();
    audio.stopMusic();
    
    const sceneNames = ['', 'Level1', 'Level2', 'Level3', 'Level4', 'Level5'];
    if (next <= 5) {
      this.scene.start(sceneNames[next]);
    }
  }
}
