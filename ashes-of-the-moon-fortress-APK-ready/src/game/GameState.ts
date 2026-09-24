// Central GameState - manages all persistent game data
export interface PlayerStats {
  hp: number;
  maxHp: number;
  xp: number;
  xpToNext: number;
  level: number;
  attack: number;
  fireballDamage: number;
  fireballCooldown: number;
  stamina: number;
  maxStamina: number;
  upgradePoints: number;
}

export interface CompanionState {
  alive: boolean;
  downed: boolean;
  hp: number;
  maxHp: number;
  fireballCooldown: number;
}

export interface StoryFlags {
  forestChoice: 'save' | 'ignore' | null;
  mineShrine: boolean;
  trainCompleted: boolean;
  bossDefeated: boolean;
  ending: 'heroic' | 'sacrifice' | 'corrupted' | null;
  checkpointsReached: string[];
  currentLevel: number;
  dialogueSeen: string[];
  skippableDialogue: boolean;
}

export interface GameSave {
  player: PlayerStats;
  companion: CompanionState;
  story: StoryFlags;
  settings: { musicVolume: number; sfxVolume: number };
}

const DEFAULT_SAVE: GameSave = {
  player: {
    hp: 100, maxHp: 100, xp: 0, xpToNext: 50, level: 1,
    attack: 15, fireballDamage: 10, fireballCooldown: 1500,
    stamina: 100, maxStamina: 100, upgradePoints: 0
  },
  companion: {
    alive: true, downed: false, hp: 80, maxHp: 80, fireballCooldown: 0
  },
  story: {
    forestChoice: null, mineShrine: false, trainCompleted: false,
    bossDefeated: false, ending: null, checkpointsReached: [],
    currentLevel: 1, dialogueSeen: [], skippableDialogue: false
  },
  settings: { musicVolume: 0.5, sfxVolume: 0.7 }
};

class GameStateManager {
  private data: GameSave;
  private listeners: Array<() => void> = [];

  constructor() {
    this.data = this.load();
  }

  private load(): GameSave {
    try {
      const saved = localStorage.getItem('ashes_moon_fortress_save');
      if (saved) {
        return { ...DEFAULT_SAVE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load save:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_SAVE));
  }

  save(): void {
    try {
      localStorage.setItem('ashes_moon_fortress_save', JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save:', e);
    }
  }

  reset(): void {
    this.data = JSON.parse(JSON.stringify(DEFAULT_SAVE));
    this.save();
    this.notify();
  }

  get player(): PlayerStats { return this.data.player; }
  get companion(): CompanionState { return this.data.companion; }
  get story(): StoryFlags { return this.data.story; }
  get settings() { return this.data.settings; }

  setStoryFlag(key: keyof StoryFlags, value: any): void {
    (this.data.story as any)[key] = value;
    this.save();
    this.notify();
  }

  addXP(amount: number): boolean {
    this.data.player.xp += amount;
    let leveled = false;
    while (this.data.player.xp >= this.data.player.xpToNext) {
      this.data.player.xp -= this.data.player.xpToNext;
      this.data.player.level++;
      this.data.player.xpToNext = Math.floor(this.data.player.xpToNext * 1.5);
      this.data.player.upgradePoints++;
      leveled = true;
    }
    this.save();
    this.notify();
    return leveled;
  }

  takeDamage(amount: number): boolean {
    this.data.player.hp = Math.max(0, this.data.player.hp - amount);
    this.save();
    this.notify();
    return this.data.player.hp <= 0;
  }

  heal(amount: number): void {
    this.data.player.hp = Math.min(this.data.player.maxHp, this.data.player.hp + amount);
    this.save();
    this.notify();
  }

  upgradeStat(stat: string): void {
    if (this.data.player.upgradePoints <= 0) return;
    this.data.player.upgradePoints--;
    switch (stat) {
      case 'maxHp': this.data.player.maxHp += 20; this.data.player.hp += 20; break;
      case 'attack': this.data.player.attack += 5; break;
      case 'fireballDamage': this.data.player.fireballDamage += 3; break;
      case 'fireballCooldown': this.data.player.fireballCooldown = Math.max(500, this.data.player.fireballCooldown - 200); break;
      case 'maxStamina': this.data.player.maxStamina += 20; this.data.player.stamina += 20; break;
    }
    this.save();
    this.notify();
  }

  restoreStamina(amount: number): void {
    this.data.player.stamina = Math.min(this.data.player.maxStamina, this.data.player.stamina + amount);
  }

  useStamina(amount: number): boolean {
    if (this.data.player.stamina < amount) return false;
    this.data.player.stamina -= amount;
    return true;
  }

  companionDown(): void {
    this.data.companion.downed = true;
    this.data.companion.hp = 0;
    this.save();
    this.notify();
  }

  companionRevive(): void {
    this.data.companion.downed = false;
    this.data.companion.hp = this.data.companion.maxHp;
    this.save();
    this.notify();
  }

  addCheckpoint(id: string): void {
    if (!this.data.story.checkpointsReached.includes(id)) {
      this.data.story.checkpointsReached.push(id);
      this.save();
    }
  }

  hasSeenDialogue(id: string): boolean {
    return this.data.story.dialogueSeen.includes(id);
  }

  markDialogueSeen(id: string): void {
    if (!this.data.story.dialogueSeen.includes(id)) {
      this.data.story.dialogueSeen.push(id);
      this.save();
    }
  }

  setLevel(level: number): void {
    this.data.story.currentLevel = level;
    this.save();
  }

  onChange(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  private notify(): void {
    this.listeners.forEach(fn => fn());
  }

  getFullState(): GameSave {
    return JSON.parse(JSON.stringify(this.data));
  }
}

export const GameState = new GameStateManager();
