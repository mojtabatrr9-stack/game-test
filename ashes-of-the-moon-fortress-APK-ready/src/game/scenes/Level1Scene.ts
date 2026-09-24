import { BaseLevelScene, LevelData } from './BaseLevelScene';
import { GameState } from '../GameState';

const level1Data: LevelData = {
  width: 3200, height: 720,
  platforms: [
    { x: 400, y: 680, w: 800, h: 40 },
    { x: 1000, y: 680, w: 400, h: 40 },
    { x: 1500, y: 680, w: 600, h: 40 },
    { x: 2200, y: 680, w: 800, h: 40 },
    { x: 3000, y: 680, w: 400, h: 40 },
    { x: 600, y: 550, w: 150, h: 20 },
    { x: 900, y: 480, w: 120, h: 20 },
    { x: 1200, y: 520, w: 150, h: 20, oneWay: true },
    { x: 1700, y: 560, w: 200, h: 20 },
    { x: 2000, y: 480, w: 150, h: 20, oneWay: true },
    { x: 2500, y: 550, w: 180, h: 20 },
  ],
  enemies: [
    { type: 'skeleton', x: 800, y: 640 },
    { type: 'skeleton', x: 1600, y: 640 },
    { type: 'skeleton', x: 2400, y: 640 },
  ],
  checkpoints: [
    { x: 1400, y: 640, id: 'village_1' }
  ],
  npcs: [
    { x: 300, y: 640, id: 'elder', dialogue: {
      id: 'elder_intro',
      lines: [
        { speaker: 'Narrator', text: 'The village of Ashenmere lies in ruins. Burning crystals pulse with trapped souls...' },
        { speaker: 'Elder', text: 'Arden... you have returned. The Moon Fortress has fallen, and with it, our people.' },
        { speaker: 'Arden', text: 'I was exiled from these lands. Why should I help?' },
        { speaker: 'Elder', text: 'Because you are the only one who can reach the Fortress. Take this companion - she guards the enchanted fire train.' },
        { speaker: 'Mara', text: 'Name\'s Mara. I\'ve been looking for someone brave enough - or foolish enough - to help me.' },
        { speaker: 'Arden', text: '...Very well. Let\'s end this.' },
      ]
    }}
  ],
  exitX: 3100, exitY: 640,
  nextLevel: 2,
  bgColor: 0x0f0a1a,
  bgFar: 0x1a0a2e,
  bgMid: 0x2d1b4e,
  quest: 'Explore the Ashen Village and find Mara',
  dialogue: {
    id: 'level1_intro',
    lines: [
      { speaker: 'Narrator', text: 'Ashen Village - Where it all began. The moon hangs low, casting purple shadows over the ruins.' },
    ]
  }
};

export class Level1Scene extends BaseLevelScene {
  constructor() { super('Level1'); }
  
  create(): void {
    this.levelData = level1Data;
    super.create();
  }
}
