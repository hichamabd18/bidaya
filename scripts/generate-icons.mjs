// توليد أيقونات PWA و iOS وموقع الويب من المصدر الأصلي الكامل public/original.png
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'public/original.png';
const OUT = 'public/icons';
fs.mkdirSync(OUT, {recursive: true});

const jobs = [
  {out: `${OUT}/icon-192.png`, size: 192},
  {out: `${OUT}/icon-512.png`, size: 512},
  {out: `${OUT}/maskable-192.png`, size: 192},
  {out: `${OUT}/maskable-512.png`, size: 512},
  {out: 'public/apple-touch-icon.png', size: 180},
  {out: `${OUT}/icon-144.png`, size: 144},
  {out: 'public/favicon-32x32.png', size: 32},
  {out: 'public/favicon-16x16.png', size: 16},
  {out: 'public/favicon.png', size: 48},
  {out: 'public/logo.png', size: 1024},
];

for (const job of jobs) {
  await sharp(SRC)
    .resize(job.size, job.size)
    .png({compressionLevel: 9})
    .toFile(job.out);
  const kb = (fs.statSync(job.out).size / 1024).toFixed(1);
  console.log(`✓ ${path.basename(job.out)} (${kb} KB)`);
}

// توليد icon.svg و icon-maskable.svg متضمنًا صورة 512 بدقة كاملة وغير مقطوعة
const b64 = (await sharp(SRC).resize(512, 512).png({compressionLevel: 9}).toBuffer()).toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image width="512" height="512" href="data:image/png;base64,${b64}"/>
</svg>`;
fs.writeFileSync('public/icon.svg', svg);
fs.writeFileSync('public/icon-maskable.svg', svg);
console.log('✓ icon.svg & icon-maskable.svg');
