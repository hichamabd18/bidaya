// توليد أيقونات PWA و iOS من المصدر SVG الواحد — تشغيل: node scripts/generate-icons.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'public/icons';
fs.mkdirSync(OUT, {recursive: true});

const jobs = [
  {src: 'public/icon.svg', out: `${OUT}/icon-192.png`, size: 192},
  {src: 'public/icon.svg', out: `${OUT}/icon-512.png`, size: 512},
  {src: 'public/icon-maskable.svg', out: `${OUT}/maskable-192.png`, size: 192},
  {src: 'public/icon-maskable.svg', out: `${OUT}/maskable-512.png`, size: 512},
  {src: 'public/icon-maskable.svg', out: 'public/apple-touch-icon.png', size: 180},
  {src: 'public/icon-maskable.svg', out: `${OUT}/icon-144.png`, size: 144},
];

for (const job of jobs) {
  await sharp(fs.readFileSync(job.src), {density: 300})
    .resize(job.size, job.size)
    .png({compressionLevel: 9})
    .toFile(job.out);
  const kb = (fs.statSync(job.out).size / 1024).toFixed(1);
  console.log(`✓ ${path.basename(job.out)} (${kb} KB)`);
}
