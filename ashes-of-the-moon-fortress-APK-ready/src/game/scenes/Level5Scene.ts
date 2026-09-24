import { BaseLevelScene, LevelData } from './BaseLevelScene';
import { GameState } from '../GameState';

const level5Data: LevelData = {
  width: 3000, height: 720,
  platforms: [
    { x: 400, y: 680, w: 600, h: 40 },
    { x: 1100, y: 680, w: 400, h: 40 },
    { x: 1600, y: 680, w: 800, h: 40 },
    { x: 2500, y: 680, w: 600, h: 40 },
    { x: 600, y: 540, w: 150, h: 20 },
    { x: 900, y: 460, w: 120, h: 20 },
    { x: 1300, y: 520, w: 150, h: 20, oneWay: true },
    { x: 1800, y: 480, w: 200, h: 20 },
    { x: 2200, y: 540, w: 180, h: 20 },
  ],
  enemies: [
    { type: 'eliteKnight', x: 700, y: 640 },
    { type: 'eliteKnight', x: 1200, y: 640 },
    { type: 'fireSpirit', x: 1500, y: 500 },
    { type: 'eliteKnight', x: 1900, y: 640 },
    { type: 'skeleton', x: 2100, y: 640 },
    { type: 'eliteKnight', x: 2400, y: 640 },
  ],
  checkpoints: [
    { x: 1000, y: 640, id: 'fortress_1' }
  ],
  npcs: [
    { x: 1400, y: 640, id: 'final_npc', dialogue: {
      id: 'final_encounter',
      lines: [
        { speaker: 'Narrator', text: 'The Moon Fortress towers above, its walls scarred by ancient battles. At its heart awaits the one who framed Arden...' },
        { speaker: 'Mara', text: 'This is it, Arden. The Commander is just ahead. Are you ready?' },
        { speaker: 'Arden', text: 'I\'ve been ready for years. Let\'s finish this.' },
      ]
    }}
  ],
  exitX: 2800, exitY: 640,
  nextLevel: 5,
  bgColor: 0x0a0a1a,
  bgFar: 0x1a1a3e,
  bgMid: 0x2d2d5e,
  quest: 'Reach the Commander in the Moon Fortress',
  boss: { x: 2700, y: 600 },
  dialogue: {
    id: 'level5_intro',
    lines: [
      { speaker: 'Narrator', text: 'The Moon Fortress - The final stronghold. Moonlight bleeds through shattered windows.' },
      { speaker: 'Mara', text: 'I can feel the trapped souls... they\'re calling out to us.' },
    ]
  }
};

export class Level5Scene extends BaseLevelScene {
  constructor() { super('Level5'); }
  
  create(): void {
    this.levelData = level5Data;
    // Boss level - exit is blocked until boss is defeated
    this.levelData.exitX = 99999; // Prevent exit until boss is dead
    super.create();
  }
}
