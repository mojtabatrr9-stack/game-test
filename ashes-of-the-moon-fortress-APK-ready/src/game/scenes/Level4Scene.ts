import { BaseLevelScene, LevelData } from './BaseLevelScene';

const level4Data: LevelData = {
  width: 5000, height: 720,
  platforms: [
    { x: 300, y: 680, w: 400, h: 40 },
    { x: 800, y: 680, w: 300, h: 40 },
    { x: 1200, y: 680, w: 400, h: 40 },
    { x: 1700, y: 680, w: 300, h: 40 },
    { x: 2100, y: 680, w: 400, h: 40 },
    { x: 2600, y: 680, w: 300, h: 40 },
    { x: 3000, y: 680, w: 400, h: 40 },
    { x: 3500, y: 680, w: 300, h: 40 },
    { x: 3900, y: 680, w: 400, h: 40 },
    { x: 4400, y: 680, w: 500, h: 40 },
    { x: 500, y: 540, w: 100, h: 20, oneWay: true },
    { x: 900, y: 480, w: 120, h: 20 },
    { x: 1400, y: 520, w: 100, h: 20, oneWay: true },
    { x: 1800, y: 460, w: 120, h: 20 },
    { x: 2300, y: 520, w: 150, h: 20, oneWay: true },
    { x: 2700, y: 460, w: 100, h: 20 },
    { x: 3200, y: 520, w: 150, h: 20, oneWay: true },
    { x: 3600, y: 460, w: 120, h: 20 },
    { x: 4100, y: 520, w: 200, h: 20 },
    { x: 4600, y: 480, w: 150, h: 20 },
  ],
  movingPlatforms: [
    { x: 1050, y: 600, w: 80, dx: 100, dy: 0, speed: 0.8 },
    { x: 1950, y: 580, w: 80, dx: 0, dy: -100, speed: 0.6 },
    { x: 2850, y: 600, w: 80, dx: 80, dy: 0, speed: 0.9 },
    { x: 3750, y: 580, w: 80, dx: 0, dy: -80, speed: 0.7 },
  ],
  hazards: [
    { x: 1100, y: 670, w: 50, h: 12 },
    { x: 2000, y: 670, w: 60, h: 12 },
    { x: 2900, y: 670, w: 50, h: 12 },
    { x: 3800, y: 670, w: 60, h: 12 },
  ],
  enemies: [
    { type: 'fireSpirit', x: 600, y: 500 },
    { type: 'fireSpirit', x: 1300, y: 480 },
    { type: 'skeleton', x: 1700, y: 640 },
    { type: 'fireSpirit', x: 2200, y: 500 },
    { type: 'fireSpirit', x: 2700, y: 480 },
    { type: 'skeleton', x: 3100, y: 640 },
    { type: 'fireSpirit', x: 3500, y: 500 },
    { type: 'fireSpirit', x: 4000, y: 480 },
    { type: 'skeleton', x: 4500, y: 640 },
  ],
  checkpoints: [
    { x: 1600, y: 640, id: 'train_1' },
    { x: 3200, y: 640, id: 'train_2' }
  ],
  npcs: [],
  exitX: 4800, exitY: 640,
  nextLevel: 5,
  bgColor: 0x1a0a0a,
  bgFar: 0x2e0a0a,
  bgMid: 0x4e1b1b,
  quest: 'Cross the Burning Train before it collapses!',
  dialogue: {
    id: 'level4_intro',
    lines: [
      { speaker: 'Narrator', text: 'The Burning Train - An enchanted locomotive races through cursed lands. Fire spirits haunt the cars.' },
      { speaker: 'Mara', text: 'The train won\'t stop! We have to keep moving forward!' },
      { speaker: 'Arden', text: 'Stay sharp. The flames grow hotter ahead.' },
    ]
  }
};

export class Level4Scene extends BaseLevelScene {
  private fallingObstacleTimer = 0;

  constructor() { super('Level4'); }
  
  create(): void {
    this.levelData = level4Data;
    super.create();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
    
    // Falling obstacles
    this.fallingObstacleTimer -= delta;
    if (this.fallingObstacleTimer <= 0) {
      this.fallingObstacleTimer = 3000 + Math.random() * 2000;
      this.spawnFallingObstacle();
    }
  }

  private spawnFallingObstacle(): void {
    const cam = this.cameras.main;
    const x = cam.scrollX + 100 + Math.random() * (cam.width - 200);
    const obstacle = this.add.rectangle(x, cam.scrollY - 30, 30, 30, 0xf97316);
    this.physics.add.existing(obstacle);
    const body = obstacle.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocityY(200 + Math.random() * 100);
    
    this.physics.add.overlap(this.player, obstacle, () => {
      this.player.takeDamage(10, 0);
      this.hud.flashDamage();
      obstacle.destroy();
    });
    
    this.time.delayedCall(4000, () => {
      if (obstacle.active) obstacle.destroy();
    });
  }
}
