# Ashes of the Moon Fortress

A complete 2D side-scrolling action platformer with light RPG progression, companion AI, combat, exploration and story choices.

## Quick Start

```bash
npm install
npm run dev    # Development server
npm run build  # Production build
```

## Controls

| Key | Action |
|-----|--------|
| ← → | Move Left/Right |
| ↑ | Jump |
| Space | Sword Attack |
| F | Mara Fireball |
| E | Interact (NPCs, Checkpoints, Exit) |
| U | Upgrade Menu |
| ESC | Pause Menu |
| R | Restart (when dead) |

Mobile touch controls appear automatically on touch devices.

## Architecture

```
src/
├── App.tsx              # React wrapper mounting Phaser
├── main.tsx             # Entry point
├── index.css            # Global styles
└── game/
    ├── index.ts         # Phaser game config & scene registration
    ├── GameState.ts     # Central state manager (save/load/progression)
    ├── systems/
    │   └── AudioSystem.ts   # Procedural audio via Web Audio API
    ├── entities/
    │   ├── Player.ts        # Arden the Knight
    │   ├── Companion.ts     # Mara the Cowgirl
    │   ├── Enemies.ts       # All enemy types + MiniBoss
    │   └── Boss.ts          # Three-phase final boss
    ├── scenes/
    │   ├── BaseLevelScene.ts # Core gameplay loop (shared logic)
    │   ├── MenuScene.ts      # Title screen
    │   ├── Level1Scene.ts    # Ashen Village (tutorial)
    │   ├── Level2Scene.ts    # Whispering Forest (story choice)
    │   ├── Level3Scene.ts    # Abandoned Mine (platforms/hazards)
    │   ├── Level4Scene.ts    # Burning Train (falling obstacles)
    │   ├── Level5Scene.ts    # Moon Fortress (final boss)
    │   └── EndingScene.ts    # Three endings
    └── ui/
        ├── HUD.ts            # Health, XP, companion status, boss bar
        └── DialogueSystem.ts # Dialogue with choices
```

## Game Features

### Characters
- **Arden** (Knight): Sword melee, stamina system, HP/XP/level progression
- **Mara** (Cowgirl Companion): Follows player, fires magic fireballs, can be downed/revived

### Combat
- Sword attack with hitbox detection
- Fireball projectiles with cooldown and max count
- Enemy knockback, hurt states, death animations
- Damage invulnerability frames
- Floating damage numbers

### Progression
- XP from enemies → Level up → Upgrade points
- Upgrades: Max HP, Sword DMG, Fireball DMG, Fireball CD, Max Stamina
- Save/load via localStorage

### Levels
1. **Ashen Village** - Tutorial, meet Mara, basic enemies
2. **Whispering Forest** - Story choice, cursed plants, mini-boss
3. **Abandoned Mine** - Moving platforms, spikes, upgrade shrine
4. **Burning Train** - Falling obstacles, fire spirits, fast pace
5. **Moon Fortress** - Elite enemies, three-phase final boss

### Story
- Dialogue system with typewriter effect
- Meaningful choice in Level 2 affects ending
- Three endings: Heroic, Sacrifice, Corrupted
- Dialogue skippable on subsequent playthroughs

### Technical
- Coyote time & jump buffering for responsive controls
- Parallax backgrounds
- Camera follow with limits
- Object cleanup for projectiles/effects
- Mobile touch controls
- Browser scroll prevention
- Procedural audio (no external files needed)
- Pixel-art style rendering

## Asset License/Source

All visual assets are procedurally generated using Phaser Graphics API at runtime. No external image files required. All audio is procedurally generated via Web Audio API. No external audio files required.

| Asset | Source |
|-------|--------|
| Player sprite | Procedural Phaser Graphics |
| Companion sprite | Procedural Phaser Graphics |
| Enemy sprites | Procedural Phaser Graphics |
| Boss sprite | Procedural Phaser Graphics |
| Platforms/environment | Procedural Phaser Graphics |
| UI elements | Procedural Phaser Graphics |
| Sound effects | Web Audio API oscillators |
| Background music | Web Audio API procedural melody |

## Test Checklist

- [x] Player movement (left/right)
- [x] Jumping with coyote time and buffering
- [x] Sword attack with hitbox
- [x] Mara follow behavior
- [x] Fireball cooldown and max count
- [x] Fireball collision and cleanup
- [x] Enemy death and XP reward
- [x] Level-up notification
- [x] HP and XP HUD updates
- [x] Checkpoint save and respawn
- [x] Boss phases (3 phases)
- [x] Story dialogue and choices
- [x] Multiple endings
- [x] Save and load (localStorage)
- [x] Pause menu
- [x] Mobile touch controls
- [x] Browser resize (Scale.FIT)
- [x] Missing audio handled gracefully
- [x] No external dependencies beyond Phaser

## Technology

- **Phaser 3** - Game engine
- **TypeScript** - Type-safe code
- **Vite** - Build tool
- **React** - Mounting layer
- **Web Audio API** - Procedural sound
- **localStorage** - Save system
