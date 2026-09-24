import { BaseLevelScene, LevelData } from './BaseLevelScene';
import { GameState } from '../GameState';
import { MiniBoss } from '../entities/Enemies';

const level2Data: LevelData = {
  width: 4000, height: 720,
  platforms: [
    { x: 400, y: 680, w: 600, h: 40 },
    { x: 1100, y: 680, w: 400, h: 40 },
    { x: 1600, y: 680, w: 500, h: 40 },
    { x: 2200, y: 680, w: 600, h: 40 },
    { x: 2900, y: 680, w: 400, h: 40 },
    { x: 3500, y: 680, w: 600, h: 40 },
    { x: 500, y: 540, w: 120, h: 20, oneWay: true },
    { x: 750, y: 450, w: 100, h: 20 },
    { x: 1000, y: 520, w: 150, h: 20, oneWay: true },
    { x: 1300, y: 460, w: 120, h: 20 },
    { x: 1800, y: 520, w: 200, h: 20 },
    { x: 2100, y: 440, w: 150, h: 20, oneWay: true },
    { x: 2500, y: 520, w: 180, h: 20 },
    { x: 2800, y: 440, w: 120, h: 20 },
    { x: 3200, y: 520, w: 200, h: 20, oneWay: true },
    { x: 3600, y: 480, w: 150, h: 20 },
  ],
  enemies: [
    { type: 'cursedPlant', x: 700, y: 650 },
    { type: 'cursedPlant', x: 1400, y: 650 },
    { type: 'skeleton', x: 1800, y: 640 },
    { type: 'fireSpirit', x: 2400, y: 500 },
    { type: 'cursedPlant', x: 3000, y: 650 },
    { type: 'skeleton', x: 3400, y: 640 },
  ],
  checkpoints: [
    { x: 1500, y: 640, id: 'forest_1' },
    { x: 3000, y: 640, id: 'forest_2' }
  ],
  npcs: [
    { x: 2000, y: 640, id: 'forest_spirit', dialogue: {
      id: 'forest_choice',
      lines: [
        { speaker: 'Narrator', text: 'A glowing spirit emerges from the cursed undergrowth. It holds a crystallized soul...' },
        { speaker: 'Forest Spirit', text: 'Knight... I am bound to this tree. Within this crystal lies the soul of a child. You can free it... or take its power for yourself.' },
        { speaker: 'Mara', text: 'Arden, think carefully. This choice matters.' },
      ],
      choices: [
        { text: 'Free the child\'s soul', flag: 'forestChoice', value: 'save' },
        { text: 'Absorb the crystal\'s power', flag: 'forestChoice', value: 'ignore' }
      ]
    }}
  ],
  exitX: 3900, exitY: 640,
  nextLevel: 3,
  bgColor: 0x0a1a0f,
  bgFar: 0x0a2e1a,
  bgMid: 0x1b4e2d,
  quest: 'Cross the Whispering Forest',
  boss: undefined,
  dialogue: {
    id: 'level2_intro',
    lines: [
      { speaker: 'Narrator', text: 'The Whispering Forest - Ancient trees twist with cursed energy. The air is thick with sorrow.' },
      { speaker: 'Mara', text: 'Stay close, knight. These plants are hungry.' },
    ]
  }
};

export class Level2Scene extends BaseLevelScene {
  private miniBossSpawned = false;

  constructor() { super('Level2'); }
  
  create(): void {
    this.levelData = level2Data;
    super.create();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
    
    // Spawn mini-boss when reaching certain point
    if (!this.miniBossSpawned && this.player.x > 2600) {
      this.miniBossSpawned = true;
      const mb = new MiniBoss(this, 2800, 600);
      this.enemies.push(mb);
      this.hud.setQuest('Defeat the Forest Guardian!');
    }
  }
}
