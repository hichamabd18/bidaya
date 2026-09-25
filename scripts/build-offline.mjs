// بناء النسخة المستقلة — ملف HTML واحد يعمل بلا خادم ولا شبكة.
// المحرك والبيانات والمخزن تُجمَّع من المصدر نفسه الذي يعمل به التطبيق (esbuild، لا regex).
// تشغيل: node scripts/build-offline.mjs  (يُستدعى تلقائيًا عبر npm run build)
import esbuild from 'esbuild';
import fs from 'node:fs';

const b64 = (p) => fs.readFileSync(p).toString('base64');
const fontPlex400 = b64('node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-400-normal.woff2');
const fontPlex700 = b64('node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-700-normal.woff2');
const fontAmiri400 = b64('node_modules/@fontsource/amiri/files/amiri-arabic-400-normal.woff2');

const result = await esbuild.build({
  entryPoints: ['scripts/offline/main.ts'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2019',
  write: false,
  legalComments: 'none',
  define: {'process.env.NODE_ENV': '"production"'},
});
const js = result.outputFiles[0].text;

const css = fs
  .readFileSync('scripts/offline/styles.css', 'utf8')
  .replace('__PLEX400__', fontPlex400)
  .replace('__PLEX700__', fontPlex700)
  .replace('__AMIRI400__', fontAmiri400);

const icon = fs.readFileSync('public/icon.svg', 'utf8').replace(/#f6f1e7/g, 'currentColor').trim();

const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
<meta name="theme-color" content="#f6f1e7"/>
<meta name="description" content="بداية الهداية — نسخة مستقلة تعمل دون اتصال"/>
<title>بداية الهداية — نسخة دون اتصال</title>
<link rel="icon" href="data:image/svg+xml;base64,${b64('public/icon.svg')}"/>
<style>${css}</style>
</head>
<body>
<header class="app-header" id="app-header">
  <div class="row1">
    <div class="brand">
      <span class="brand-mark"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 7v14M3 12h18M8 3l4 4 4-4"/></svg></span>
      <h1>بداية الهداية</h1>
    </div>
    <div style="display:flex;gap:6px;flex-shrink:0">
      <select id="loc-select" class="select-inline" aria-label="تحديد الموقع"></select>
      <button class="icon-btn" id="theme-btn" aria-label="تبديل المظهر"></button>
    </div>
  </div>
  <div class="row2">
    <div class="date-line"></div>
    <div class="countdown"><span class="dot"></span><span id="loc-label" style="font-size:12px;color:var(--ink-3)"></span></div>
  </div>
  <div class="tabs" role="tablist" aria-label="الأقسام">
    <button class="tab" role="tab" data-tab="today" aria-selected="true">اليوم</button>
    <button class="tab" role="tab" data-tab="seasons" aria-selected="false">المواسم</button>
    <button class="tab" role="tab" data-tab="library" aria-selected="false">المكتبة</button>
    <button class="tab" role="tab" data-tab="tasbeeh" aria-selected="false">المسبحة</button>
  </div>
</header>

<main id="main"></main>

<div class="reader" id="reader" role="dialog" aria-modal="true">
  <div class="reader-card">
    <div class="reader-head"></div>
    <div class="reader-body"></div>
    <div class="reader-actions"></div>
  </div>
</div>

<footer class="app-footer">
  <b>بداية الهداية — نسخة مستقلة دون اتصال</b><br/>
  المحتوى من: المنح العلية للفريح · مختصر لطائف المعارف لابن رجب · اليوم النبوي للطريري · أنيس المتعبد للأسطل · بداية الهداية للغزالي · الدعوات والأذكار للسعد<br/>
  مواقيت فلكية (الفجر 18°، العشاء 17°) بمعايرة رؤية ±يومين — تُحفظ بياناتك محليًا على جهازك
</footer>

<script>${js}</script>
</body>
</html>
`;

fs.writeFileSync('public/offline.html', html);
const kb = (fs.statSync('public/offline.html').size / 1024).toFixed(0);
console.log(`✓ public/offline.html (${kb} KB) — يعمل دون اتصال بالكامل`);
