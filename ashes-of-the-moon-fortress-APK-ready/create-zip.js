const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const output = fs.createWriteStream(path.join(__dirname, 'ashes-of-the-moon-fortress.zip'));
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`✅ ZIP file created: ashes-of-the-moon-fortress.zip (${archive.pointer()} bytes)`);
  console.log('\n📦 To use the project:');
  console.log('   1. Extract the ZIP file');
  console.log('   2. cd into the extracted folder');
  console.log('   3. npm install');
  console.log('   4. npm run dev');
  console.log('   5. Open http://localhost:3000');
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Files to include
const files = [
  'package.json',
  'tsconfig.json',
  'vite.config.js',
  'index.html',
  'README.md',
  '.gitignore',
  'src/App.tsx',
  'src/main.tsx',
  'src/index.css',
  'src/game/index.ts',
  'src/game/GameState.ts',
  'src/game/systems/AudioSystem.ts',
  'src/game/entities/Player.ts',
  'src/game/entities/Companion.ts',
  'src/game/entities/Enemies.ts',
  'src/game/entities/Boss.ts',
  'src/game/scenes/BaseLevelScene.ts',
  'src/game/scenes/MenuScene.ts',
  'src/game/scenes/Level1Scene.ts',
  'src/game/scenes/Level2Scene.ts',
  'src/game/scenes/Level3Scene.ts',
  'src/game/scenes/Level4Scene.ts',
  'src/game/scenes/Level5Scene.ts',
  'src/game/scenes/EndingScene.ts',
  'src/game/ui/HUD.ts',
  'src/game/ui/DialogueSystem.ts'
];

console.log('🎮 Creating ZIP file for Ashes of the Moon Fortress...\n');

let addedCount = 0;
files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    archive.file(filePath, { name: file });
    console.log(`  ✓ ${file}`);
    addedCount++;
  } else {
    console.warn(`  ⚠ File not found: ${file}`);
  }
});

console.log(`\n📊 Added ${addedCount}/${files.length} files`);
console.log('📦 Compressing...\n');

archive.finalize();
