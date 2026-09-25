// اختبارات الوحدة — المخزن والبحث والمعرّفات. تشغيل: npm test
import assert from 'node:assert/strict';
import {dayKey, weekKey, monthKey, EMPTY_DAY, getDay, setDay} from '../lib/store.ts';
import {normalizeAr, searchEntries} from '../lib/search.ts';
import {coerceCoordinates, ALGERIAN_WILAYAS} from '../lib/prayer.ts';
import {monthActId, contextualId, findLibraryEntry, libraryEntries} from '../lib/library.ts';

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
check('معرّفات المكتبة ثابتة وقابلة للعكس', () => {
  assert.equal(monthActId(3, 2), 'month-3-2');
  assert.equal(contextualId(0, 5), 'ctx-0-5');
  const entries = libraryEntries();
  assert.ok(entries.length > 60, `entries=${entries.length}`);
  assert.ok(findLibraryEntry(entries[0].id));
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

if (process.exitCode) {
  console.error('\nفشلت بعض اختبارات الوحدة');
} else {
  console.log(`\nنجحت كل اختبارات الوحدة (${passed})`);
}
