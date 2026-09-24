import { BaseLevelScene, LevelData } from './BaseLevelScene';
import { GameState } from '../GameState';

const level3Data: LevelData = {
  width: 4500, height: 720,
  platforms: [
    { x: 300, y: 680, w: 500, h: 40 },
    { x: 900, y: 680, w: 300, h: 40 },
    { x: 1400, y: 680, w: 400, h: 40 },
    { x: 2000, y: 680, w: 500, h: 40 },
    { x: 2700, y: 680, w: 400, h: 40 },
    { x: 3300, y: 680, w: 500, h: 40 },
    { x: 4000, y: 680, w: 600, h: 40 },
    { x: 600, y: 540, w: 120, h: 20 },
    { x: 850, y: 460, w: 100, h: 20, oneWay: true },
    { x: 1100, y: 540, w: 150, h: 20 },
    { x: 1500, y: 480, w: 120, h: 20, oneWay: true },
    { x: 1800, y: 400, w: 100, h: 20 },
    { x: 2100, y: 520, w: 200, h: 20 },
    { x: 2400, y: 440, w: 150, h: 20, oneWay: true },
    { x: 2800, y: 520, w: 180, h: 20 },
    { x: 3100, y: 440, w: 120, h: 20 },
    { x: 3500, y: 520, w: 200, h: 20, oneWay: true },
    { x: 3800, y: 440, w: 150, h: 20 },
    { x: 4100, y: 520, w: 200, h: 20 },
  ],
  movingPlatforms: [
    { x: 1250, y: 600, w: 80, dx: 0, dy: -150, speed: 0.5 },
    { x: 2600, y: 550, w: 80, dx: 150, dy: 0, speed: 0.7 },
    { x: 3700, y: 580, w: 80, dx: 0, dy: -120, speed: 0.6 },
  ],
  hazards: [
    { x: 1000, y: 670, w: 60, h: 12 },
    { x: 2300, y: 670, w: 80, h: 12 },
    { x: 3600, y: 670, w: 60, h: 12 },
  ],
  enemies: [
    { type: 'skeleton', x: 700, y: 640 },
    { type: 'skeleton', x: 1300, y: 640 },
    { type: 'fireSpirit', x: 1900, y: 500 },
    { type: 'skeleton', x: 2500, y: 640 },
    { type: 'skeleton', x: 3000, y: 640 },
    { type: 'fireSpirit', x: 3500, y: 480 },
    { type: 'skeleton', x: 3900, y: 640 },
  ],
  checkpoints: [
    { x: 1300, y: 640, id: 'mine_1' },
    { x: 2800, y: 640, id: 'mine_2' }
  ],
  npcs: [
    { x: 2200, y: 640, id: 'shrine', dialogue: {
      id: 'mine_shrine',
      lines: [
        { speaker: 'Narrator', text: 'An ancient shrine glows with ethereal light deep within the mine...' },
        { speaker: 'Mara', text: 'This is an Upgrade Shrine. Touch it to gain power.' },
        { speaker: 'Arden', text: 'I can feel the energy flowing through me.' },
      ],
      onComplete: 'shrine_used'
    }}
  ],
  exitX: 4300, exitY: 640,
  nextLevel: 4,
  bgColor: 0x0a0a0f,
  bgFar: 0x1a1a2e,
  bgMid: 0x2d2d4e,
  quest: 'Navigate the Abandoned Mine',
  dialogue: {
    id: 'level3_intro',
    lines: [
      { speaker: 'Narrator', text: 'The Abandoned Mine - Darkness clings to every surface. The rails rust in silence.' },
      { speaker: 'Mara', text: 'Watch for spikes and moving platforms. This place is rigged.' },
    ]
  }
};

export class Level3Scene extends BaseLevelScene {
  constructor() { super('Level3'); }
  
  create(): void {
    this.levelData = level3Data;
    super.create();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
    // Shrine gives upgrade point
    if (GameState.hasSeenDialogue('mine_shrine') && !GameState.story.mineShrine) {
      GameState.setStoryFlag('mineShrine', true);
      GameState.player.upgradePoints++;
      GameState.save();
    }
  }
}
