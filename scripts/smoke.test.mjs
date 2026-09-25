// اختبار دخان الإنتاج — يبني خادم الإنتاج الحقيقي ويفحص كل مسار وكل أصل PWA.
// المتطلب: npm run build أولاً. التشغيل: npm run test:smoke
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';

const PORT = 4311;
const BASE = `http://127.0.0.1:${PORT}`;

function waitForPort(port, timeoutMs = 45000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tryOnce = () => {
      const socket = net.connect(port, '127.0.0.1');
      socket.once('connect', () => {
        socket.destroy();
        resolve();
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) reject(new Error('الخادم لم يستجب خلال المهلة'));
        else setTimeout(tryOnce, 400);
      });
    };
    tryOnce();
  });
}

const server = spawn('node', ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(PORT)], {
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverLog = '';
server.stdout.on('data', (d) => (serverLog += d));
server.stderr.on('data', (d) => (serverLog += d));

let passed = 0;
async function check(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}\n    ${err.message}`);
    process.exitCode = 1;
  }
}

async function get(path, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${BASE}${path}`, {redirect: 'manual'});
      const body = res.status === 200 ? await res.text() : '';
      return {status: res.status, body, headers: res.headers};
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error('unreachable');
}

try {
  if (!fs.existsSync('.next/BUILD_ID')) {
    throw new Error('لا يوجد بناء إنتاجي — شغّل npm run build أولاً');
  }
  await waitForPort(PORT);
  console.log('— المسارات —');

  await check('الرئيسية: أعمال اليوم والتاريخ والمواقيت', async () => {
    const {status, body} = await get('/');
    assert2(status === 200, `status=${status}`);
    assert2(body.includes('أعمال اليوم'), 'ينقص عنوان أعمال اليوم');
    assert2(body.includes('dir="rtl"'), 'الاتجاه RTL مفقود');
    assert2(body.includes('lang="ar"'), 'اللغة العربية مفقودة');
    assert2(body.includes('تجاوز إلى المحتوى'), 'رابط التجاوز مفقود');
    assert2(body.includes('المسار النبوي') || body.includes('محطات اليوم') || body.includes('المحطة'), 'قائمة المحطات مفقودة');
  });

  await check('المواسم: وظائف الشهور', async () => {
    const {status, body} = await get('/seasons');
    assert2(status === 200);
    assert2(body.includes('وظائف الشهور'), 'قائمة الشهور مفقودة');
    assert2(body.includes('ابن رجب'), 'نسبة المصدر مفقودة');
  });

  await check('المكتبة: الفهرس والمجموعات', async () => {
    const {status, body} = await get('/library');
    assert2(status === 200);
    assert2(body.includes('فقه الأذكار') || body.includes('أصول سياسة النفس'), 'مجموعات المكتبة مفقودة');
  });

  await check('تقدمي: الصحيفة والسجل', async () => {
    const {status, body} = await get('/progress');
    assert2(status === 200);
    assert2(body.includes('صحيفة اليوم'), 'عنوان الصحيفة مفقود');
    assert2(body.includes('آخر ثلاثين يومًا'), 'السجل مفقود');
  });

  await check('صفحة قراءة: شهرية وسياقية وقواعد', async () => {
    for (const path of ['/library/month-1-1', '/library/ctx-0-0', '/library/soul-WP01', '/library/dhikr-DR01']) {
      const {status, body} = await get(path);
      assert2(status === 200, `${path} status=${status}`);
      assert2(body.includes('الإسناد') || body.includes('القاعدة') || body.includes('المقصد'), `${path} بلا محتوى`);
    }
  });

  await check('404 يعمل', async () => {
    const {status} = await get('/nonexistent');
    assert2(status === 404, `status=${status}`);
  });

  console.log('— أصول PWA —');
  await check('manifest صالح بالمفاتيح الأساسية', async () => {
    const {status, body} = await get('/manifest.json');
    assert2(status === 200);
    const manifest = JSON.parse(body);
    assert2(manifest.dir === 'rtl' && manifest.lang === 'ar');
    assert2(Array.isArray(manifest.icons) && manifest.icons.some((i) => i.src.includes('512')));
  });
  await check('أيقونات PNG و apple-touch-icon موجودة', async () => {
    for (const path of ['/icons/icon-192.png', '/icons/icon-512.png', '/icons/maskable-512.png', '/apple-touch-icon.png']) {
      const {status, headers} = await get(path);
      assert2(status === 200, `${path} status=${status}`);
      assert2((headers.get('content-type') || '').includes('image/png'), `${path} type`);
    }
  });
  await check('عامل الخدمة يُخدم', async () => {
    const {status, body} = await get('/sw.js');
    assert2(status === 200);
    assert2(body.includes('network') || body.includes('navigate'), 'استراتيجية التنقل مفقودة');
  });

  console.log('— النسخة المستقلة —');
  await check('offline.html كامل بلا مراجع خارجية', async () => {
    const {status, body} = await get('/offline.html');
    assert2(status === 200, `status=${status}`);
    assert2(body.includes('اليوم النبوي'), 'عنوان مفقود');
    assert2(!/src=["']https?:/.test(body), 'سكربت خارجي!');
    assert2(!/href=["']https?:\/\//.test(body.replace(/xmlns="[^"]*"/g, '').replace(/rel="preconnect"[^>]*/g, '')), 'روابط خارجية!');
    assert2((body.match(/data:font\/woff2/g) || []).length === 3, 'الخطوط غير مضمّنة');
  });

  const total = passed + (process.exitCode ? 1 : 0);
  console.log(process.exitCode ? '\nفشل اختبار الدخان' : `\nنجح اختبار الدخان (${passed})`);
} catch (err) {
  console.error('فشل الإقلاع:', err.message);
  console.error(serverLog.slice(-800));
  process.exitCode = 1;
} finally {
  server.kill('SIGTERM');
  setTimeout(() => process.exit(process.exitCode ? 1 : 0), 300);
}

function assert2(cond, msg = 'شرط غير محقق') {
  if (!cond) throw new Error(msg);
}
