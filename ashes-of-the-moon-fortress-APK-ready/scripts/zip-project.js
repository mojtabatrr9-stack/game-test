const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const output = fs.createWriteStream(path.join(__dirname, '..', 'ashes-of-the-moon-fortress.zip'));
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`✓ فایل زیپ ایجاد شد: ashes-of-the-moon-fortress.zip (${archive.pointer()} bytes)`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// فایل‌های اصلی پروژه
const filesToInclude = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.js',
  'index.html',
  'README.md',
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

filesToInclude.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    archive.file(filePath, { name: file });
    console.log(`✓ اضافه شد: ${file}`);
  } else {
    console.warn(`⚠ فایل یافت نشد: ${file}`);
  }
});

archive.finalize();
