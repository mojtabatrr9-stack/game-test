# راهنمای دانلود پروژه

## چگونه فایل ZIP پروژه را دانلود کنیم؟

پس از اجرای پروژه با دستور `npm run dev`، یک دکمه در گوشه بالا-راست صفحه بازی ظاهر می‌شود:

**📦 دانلود پروژه (ZIP)**

با کلیک روی این دکمه، تمام فایل‌های سورس کد پروژه به صورت یک فایل ZIP دانلود می‌شود.

## محتویات فایل ZIP

فایل زیپ شامل موارد زیر است:

```
ashes-of-the-moon-fortress/
├── package.json              # تنظیمات پروژه و وابستگی‌ها
├── tsconfig.json             # تنظیمات TypeScript
├── vite.config.js            # تنظیمات Vite
├── index.html                # صفحه HTML اصلی
├── README.md                 # مستندات کامل
├── .gitignore                # فایل‌های نادیده برای Git
└── src/
    ├── App.tsx               # کامپوننت اصلی React
    ├── main.tsx              # نقطه ورود
    ├── index.css             # استایل‌های سراسری
    └── game/
        ├── index.ts          # تنظیمات Phaser
        ├── GameState.ts      # مدیریت state بازی
        ├── systems/
        │   └── AudioSystem.ts    # سیستم صوتی
        ├── entities/
        │   ├── Player.ts         # بازیکن (Arden)
        │   ├── Companion.ts      # همراه (Mara)
        │   ├── Enemies.ts        # دشمنان
        │   └── Boss.ts           # باس نهایی
        ├── scenes/
        │   ├── BaseLevelScene.ts # صحنه پایه
        │   ├── MenuScene.ts      # منوی اصلی
        │   ├── Level1Scene.ts    # مرحله ۱
        │   ├── Level2Scene.ts    # مرحله ۲
        │   ├── Level3Scene.ts    # مرحله ۳
        │   ├── Level4Scene.ts    # مرحله ۴
        │   ├── Level5Scene.ts    # مرحله ۵
        │   └── EndingScene.ts    # صحنه پایانی
        └── ui/
            ├── HUD.ts            # رابط کاربری
            └── DialogueSystem.ts # سیستم دیالوگ
```

## استفاده از فایل ZIP

پس از دانلود:

1. فایل ZIP را استخراج کنید
2. به پوشه استخراج شده بروید
3. دستورات زیر را اجرا کنید:

```bash
npm install
npm run dev
```

4. بازی در مرورگر باز می‌شود: http://localhost:3000

## نکات مهم

- فایل ZIP شامل تمام سورس کد TypeScript است
- فایل‌های `node_modules` و `dist` در ZIP نیستند (باید با `npm install` ساخته شوند)
- تمام تنظیمات پروژه (package.json, tsconfig.json, vite.config.js) شامل شده‌اند
- مستندات کامل (README.md) نیز در ZIP موجود است
