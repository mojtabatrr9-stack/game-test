import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Import all source files as raw strings using Vite's ?raw feature
import appTsx from '../../App.tsx?raw';
import mainTsx from '../../main.tsx?raw';
import indexCss from '../../index.css?raw';
import gameIndex from '../index.ts?raw';
import gameState from '../GameState.ts?raw';
import audioSystem from '../systems/AudioSystem.ts?raw';
import playerTs from '../entities/Player.ts?raw';
import companionTs from '../entities/Companion.ts?raw';
import enemiesTs from '../entities/Enemies.ts?raw';
import bossTs from '../entities/Boss.ts?raw';
import baseLevelScene from '../scenes/BaseLevelScene.ts?raw';
import menuScene from '../scenes/MenuScene.ts?raw';
import level1Scene from '../scenes/Level1Scene.ts?raw';
import level2Scene from '../scenes/Level2Scene.ts?raw';
import level3Scene from '../scenes/Level3Scene.ts?raw';
import level4Scene from '../scenes/Level4Scene.ts?raw';
import level5Scene from '../scenes/Level5Scene.ts?raw';
import endingScene from '../scenes/EndingScene.ts?raw';
import hudTs from '../ui/HUD.ts?raw';
import dialogueSystem from '../ui/DialogueSystem.ts?raw';

export async function createProjectZip(): Promise<void> {
  const zip = new JSZip();

  // All source files
  const sourceFiles: Record<string, string> = {
    'src/App.tsx': appTsx,
    'src/main.tsx': mainTsx,
    'src/index.css': indexCss,
    'src/game/index.ts': gameIndex,
    'src/game/GameState.ts': gameState,
    'src/game/systems/AudioSystem.ts': audioSystem,
    'src/game/entities/Player.ts': playerTs,
    'src/game/entities/Companion.ts': companionTs,
    'src/game/entities/Enemies.ts': enemiesTs,
    'src/game/entities/Boss.ts': bossTs,
    'src/game/scenes/BaseLevelScene.ts': baseLevelScene,
    'src/game/scenes/MenuScene.ts': menuScene,
    'src/game/scenes/Level1Scene.ts': level1Scene,
    'src/game/scenes/Level2Scene.ts': level2Scene,
    'src/game/scenes/Level3Scene.ts': level3Scene,
    'src/game/scenes/Level4Scene.ts': level4Scene,
    'src/game/scenes/Level5Scene.ts': level5Scene,
    'src/game/scenes/EndingScene.ts': endingScene,
    'src/game/ui/HUD.ts': hudTs,
    'src/game/ui/DialogueSystem.ts': dialogueSystem,
  };

  // Add source files
  Object.entries(sourceFiles).forEach(([path, content]) => {
    zip.file(path, content);
  });

  // package.json
  zip.file('package.json', JSON.stringify({
    name: "ashes-of-the-moon-fortress",
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
      typecheck: "tsc --noEmit"
    },
    dependencies: {
      phaser: "^3.80.0",
      react: "^18.2.0",
      "react-dom": "^18.2.0"
    },
    devDependencies: {
      "@types/react": "^18.2.0",
      "@types/react-dom": "^18.2.0",
      "@vitejs/plugin-react": "^4.0.0",
      "typescript": "^5.0.0",
      "vite": "^5.0.0"
    }
  }, null, 2));

  // tsconfig.json
  zip.file('tsconfig.json', JSON.stringify({
    compilerOptions: {
      target: "ES2020",
      useDefineForClassFields: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx",
      strict: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
      noFallthroughCasesInSwitch: true
    },
    include: ["src"]
  }, null, 2));

  // vite.config.js
  zip.file('vite.config.js', `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
`);

  // index.html
  zip.file('index.html', `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Ashes of the Moon Fortress</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 100%; height: 100%; overflow: hidden; background: #0a0a0f; }
      #root { width: 100%; height: 100%; }
      canvas { display: block; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);

  // README.md
  zip.file('README.md', `# Ashes of the Moon Fortress

A complete 2D side-scrolling action platformer with RPG progression, companion AI, combat, exploration and story choices.

## Quick Start

\`\`\`bash
npm install
npm run dev    # Development server at http://localhost:3000
npm run build  # Production build
\`\`\`

## Controls

| Key | Action |
|-----|--------|
| Left/Right Arrow | Move |
| Up Arrow | Jump |
| Space | Sword Attack |
| F | Mara Fireball |
| E | Interact |
| U | Upgrade Menu |
| ESC | Pause |
| R | Restart |

## Architecture

- Phaser 3 - Game engine
- TypeScript - Type-safe code
- Vite - Build tool
- Web Audio API - Procedural sound
- localStorage - Save system

## Levels

1. Ashen Village - Tutorial
2. Whispering Forest - Story choice + mini-boss
3. Abandoned Mine - Platforms + hazards
4. Burning Train - Falling obstacles
5. Moon Fortress - Final boss (3 phases)

## Endings

- Heroic (free the souls)
- Sacrifice (Arden stays behind)
- Corrupted (absorb dark power)
`);

  // .gitignore
  zip.file('.gitignore', `node_modules
dist
.env
*.zip
`);

  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'ashes-of-the-moon-fortress.zip');
}
