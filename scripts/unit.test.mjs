// اختبارات الوحدة — المخزن والبحث والمعرّفات. تشغيل: npm test
import assert from 'node:assert/strict';
import {dayKey, weekKey, monthKey, EMPTY_DAY, getDay, setDay} from '../lib/store.ts';
import {normalizeAr, searchEntries} from '../lib/search.ts';
import {coerceCoordinates, ALGERIAN_WILAYAS} from '../lib/prayer.ts';
import {monthActId, contextualId, findLibraryEntry, libraryEntries} from '../lib/library.ts';
import {collectBackup, applyBackup, backupFileName} from '../lib/backup.ts';
import {HABIT_DAILY_INDICATORS} from '../lib/data/habits.ts';

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}\n    ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('— مفاتيح الدور —');
check('dayKey بصيغة YYYY-MM-DD مبطنة', () => {
  assert.equal(dayKey(new Date(2026, 8, 25)), '2026-09-25');
  assert.equal(dayKey(new Date(2026, 0, 5)), '2026-01-05');
});
check('weekKey يطابق أسبوع ISO المعروف', () => {
  assert.equal(weekKey(new Date(2026, 8, 25)), '2026-W39');
  assert.equal(weekKey(new Date(2026, 0, 1)), '2026-W01'); // الخميس
  assert.equal(weekKey(new Date(2025, 11, 29)), '2026-W01'); // الاثنين أول الأسبوع
  assert.equal(weekKey(new Date(2024, 11, 30)), '2025-W01');
  assert.equal(weekKey(new Date(2026, 1, 23)), '2026-W09');
});
check('weekKey يوحّد الأسبوع كله (اثنين→أحد)', () => {
  const monday = weekKey(new Date(2026, 8, 21)); // الاثنين
  const sunday = weekKey(new Date(2026, 8, 27)); // الأحد
  assert.equal(monday, sunday);
});
check('monthKey', () => {
  assert.equal(monthKey(new Date(2026, 8, 25)), '2026-09');
});

console.log('— التطبيع العربي —');
check('التشكيل والهمزات والتاء المربوطة', () => {
  assert.equal(normalizeAr('الْحَمْدُ'), 'الحمد');
  assert.equal(normalizeAr('أستغفارٌ إسلامي'), 'استغفار اسلامي');
  assert.equal(normalizeAr('مؤمنة'), 'مومنه');
  assert.equal(normalizeAr('الشَّهادة'), 'الشهاده');
});
check('التطبيع يوحّد البحث', () => {
  assert.equal(normalizeAr('أحمد'), normalizeAr('احمد'));
  assert.equal(normalizeAr('قُرْآن'), normalizeAr('قران'));
});

console.log('— البحث —');
const ENTRIES = [
  {id: '1', group: 'أ', kind: 'today', title: 'الاستيقاظ ومسح أثر النوم', sub: '', href: '/', haystack: 'الاستيقاظ مسح النوم الحمد لله'},
  {id: '2', group: 'ب', kind: 'library', title: 'دعاء الكرب', sub: '', href: '/x', haystack: 'الكرب الضيق لا إله إلا الله'},
  {id: '3', group: 'ج', kind: 'seasons', title: 'صيام عاشوراء', sub: '', href: '/y', haystack: 'المحرم العاشر صيام'},
];
check('كلمة من العنوان تسبق كلمة من المتن', () => {
  const hits = searchEntries(ENTRIES, 'الكرب');
  assert.equal(hits[0]?.id, '2');
});
check('البحث يتجاهل التشكيل والهمزات', () => {
  assert.equal(searchEntries(ENTRIES, 'أستيقاظ').length, 1);
  assert.equal(searchEntries(ENTRIES, 'عاشوراء').length, 1);
});
check('حرف واحد لا يُطلق نتائج (ضجيج)', () => {
  assert.equal(searchEntries(ENTRIES, 'ا').length, 0);
});
check('حد النتائج', () => {
  const many = Array.from({length: 40}, (_, i) => ({
    id: String(i), group: 'س', kind: 'library', title: `عمل ${i}`, sub: '', href: '/', haystack: 'كلمة مشتركة',
  }));
  assert.equal(searchEntries(many, 'كلمة').length, 24);
});

console.log('— ترميم الإحداثيات والمعرّفات —');
check('coerceCoordinates يرمّم مخطط timezone القديم', () => {
  const legacy = {name: '16. الجزائر العاصمة', country: 'الجزائر', latitude: 36.7, longitude: 3.0, timezone: 1};
  const fixed = coerceCoordinates(legacy, ALGERIAN_WILAYAS[0]);
  assert.equal(fixed.tzId, 'Africa/Algiers');
});
check('coerceCoordinates يرمّم مدناً معروفة باسمها', () => {
  const legacy = {name: 'القاهرة', country: 'مصر', latitude: 30, longitude: 31, timezone: 2};
  const fixed = coerceCoordinates(legacy, ALGERIAN_WILAYAS[0]);
  assert.equal(fixed.tzId, 'Africa/Cairo');
});
check('معرّفات المكتبة ثابتة وقابلة للعكس وشاملة لبداية الهداية وأعمال القلوب', () => {
  assert.equal(monthActId(3, 2), 'month-3-2');
  assert.equal(contextualId(0, 5), 'ctx-0-5');
  const entries = libraryEntries();
  assert.ok(entries.length >= 100, `entries=${entries.length}`);

  // تحقق من تفرد جميع المعرّفات
  const ids = new Set();
  for (const entry of entries) {
    assert.ok(!ids.has(entry.id), `معرف مكرر: ${entry.id}`);
    ids.add(entry.id);
    assert.ok(entry.title && entry.title.trim().length > 0, `عنوان فارغ في: ${entry.id}`);
    assert.ok(entry.group && entry.group.trim().length > 0, `مجموعة فارغة في: ${entry.id}`);
    assert.ok(entry.sections && entry.sections.length > 0, `أقسام فارغة في: ${entry.id}`);
    for (const sec of entry.sections) {
      assert.ok(sec.label && sec.text, `قسم ناقص في: ${entry.id}`);
    }
  }

  // تحقق من مواد بداية الهداية للإمام الغزالي
  const bidayaTime = findLibraryEntry('bidayah-time-architecture');
  assert.ok(bidayaTime, 'لم يتم العثور على عمارة الأوقات من بداية الهداية');
  assert.equal(bidayaTime.kind, 'bidaya');
  assert.ok(bidayaTime.source?.includes('بداية الهداية'));

  const bidayaTongue = findLibraryEntry('bidayah-tongue-guard');
  assert.ok(bidayaTongue, 'لم يتم العثور على حفظ اللسان من بداية الهداية');

  const bidayaAllah = findLibraryEntry('bidayah-adab-allah');
  assert.ok(bidayaAllah, 'لم يتم العثور على آداب الصحبة مع الله');

  // تحقق من منازل أعمال القلوب للإمام ابن القيم
  const heartYaqadha = findLibraryEntry('heart-yaqadha');
  assert.ok(heartYaqadha, 'لم يتم العثور على منزلة اليقظة من الإكسير');
  assert.equal(heartYaqadha.kind, 'heart');
  assert.ok(heartYaqadha.source?.includes('الإكسير'));

  const heartMahabbah = findLibraryEntry('heart-mahabbah');
  assert.ok(heartMahabbah, 'لم يتم العثور على منزلة المحبة من الإكسير');
});

console.log('— سجلات اليوم —');
check('EMPTY_DAY ثابت البنية', () => {
  assert.deepEqual(Object.keys(EMPTY_DAY).sort(), ['habits', 'timeline']);
});
check('getDay/setDay على مفتاح مخصص', () => {
  // بيئة نود بلا localStorage: تُستخدم قيم فارغة دون انهيار
  const record = getDay('2099-01-01');
  assert.deepEqual(record.timeline, {});
});
check('صحيفتي — تشتمل على ورد السنة النبوية وطلب العلم', () => {
  assert.ok(HABIT_DAILY_INDICATORS.length >= 12);
  const names = HABIT_DAILY_INDICATORS.map((h) => h.habit_name);
  assert.ok(names.some((n) => n.includes('السنة النبوية')), 'ينقص ورد السنة النبوية');
  assert.ok(names.some((n) => n.includes('طلب العلم')), 'ينقص طلب العلم الشرعي');
});

console.log('— النسخة الاحتياطية —');

// محاكاة localStorage ثم حقنها كـ window للوحدات التي تلمسه عند الاستدعاء
function makeStorage() {
  const map = new Map();
  return {
    get length() {
      return map.size;
    },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
  };
}
const storage = makeStorage();
globalThis.window = {localStorage: storage};

check('اسم ملف النسخة مبطن ومؤرّخ', () => {
  assert.equal(backupFileName(new Date(2026, 8, 25)), 'bidaya-backup-2026-09-25.json');
});
check('التصدير من تخزين فارغ: لا سجلات', () => {
  const payload = collectBackup();
  assert.equal(payload.app, 'bidaya');
  assert.equal(payload.schema, 1);
  assert.equal(Object.keys(payload.records).length, 0);
});
check('دورة كاملة: تصدير ثم مسح ثم استعادة تعيد السجلات', () => {
  storage.setItem('bidaya.v1:day:2026-09-25', JSON.stringify({timeline: {TL01_01: true}, habits: {}}));
  storage.setItem('bidaya.v1:week:2026-W39', JSON.stringify({weekly: {'قراءة الكهف': true}}));
  const json = JSON.stringify(collectBackup());
  storage.clear();
  const result = applyBackup(json);
  assert.equal(result.ok, true, result.error);
  assert.equal(result.restored, 2);
  assert.equal(JSON.parse(storage.getItem('bidaya.v1:day:2026-09-25')).timeline.TL01_01, true);
});
check('الدمج: العلامات تتحد وحالة الجهاز الأحدث تفوز', () => {
  storage.clear();
  storage.setItem('bidaya.v1:day:2026-09-25', JSON.stringify({timeline: {TL01_01: false, TL02_01: true}, habits: {}}));
  const backup = {
    app: 'bidaya', schema: 1, appVersion: '3.0.0', exportedAt: '2026-09-24T00:00:00Z',
    records: {'day:2026-09-25': {timeline: {TL01_01: true, TL03_01: true}, habits: {}}},
  };
  const result = applyBackup(JSON.stringify(backup));
  assert.equal(result.ok, true);
  assert.equal(result.merged, 1);
  const day = JSON.parse(storage.getItem('bidaya.v1:day:2026-09-25'));
  assert.equal(day.timeline.TL01_01, false, 'أحدث حالة على الجهاز يجب أن تبقى');
  assert.equal(day.timeline.TL02_01, true);
  assert.equal(day.timeline.TL03_01, true, 'علامة النسخة الغائبة على الجهاز تُستعاد');
});
check('ملف غير سليم أو غريب يُرفض بلطف', () => {
  assert.equal(applyBackup('ليس json').ok, false);
  assert.equal(applyBackup('{"app":"other","schema":1,"records":{}}').ok, false);
  assert.equal(applyBackup('{"app":"bidaya","schema":9,"records":{}}').ok, false);
});
check('مفاتيح غريبة تُتجاهل لا تُكتب', () => {
  storage.clear();
  const evil = {
    app: 'bidaya', schema: 1, appVersion: '3.0.0', exportedAt: 'x',
    records: {'settings__proto__': {admin: true}, 'day:9999-99-99': {}, 'week:2026-W39': {weekly: {}}},
  };
  const result = applyBackup(JSON.stringify(evil));
  assert.ok(result.skipped >= 2);
  assert.equal(storage.getItem('bidaya.v1:settings__proto__'), null);
  assert.equal(result.restored, 1); // الأسبوع الصالح فقط
});

if (process.exitCode) {
  console.error('\nفشلت بعض اختبارات الوحدة');
} else {
  console.log(`\nنجحت كل اختبارات الوحدة (${passed})`);
}
