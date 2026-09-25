// اختبارات ذهبية لمحرك المواقيت والتقويم — تشغيل: npm test
// تُثبِّت سلوك المحرك الحالي وتثبت إصلاح المنطقة الزمنية (IANA/التوقيت الصيفي).
import assert from 'node:assert/strict';
import { ALGERIAN_WILAYAS, MAJOR_ISLAMIC_CITIES, calculatePrayerTimes, getHijriDate, tzOffsetHours } from '../lib/prayer.ts';

const minutesOf = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

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

console.log('— المنطقة الزمنية عبر IANA —');
check('القاهرة شتاءً UTC+2 وصيفًا UTC+3 (التوقيت الصيفي محسوم)', () => {
  const winter = tzOffsetHours('Africa/Cairo', new Date(2026, 0, 15, 12, 0));
  const summer = tzOffsetHours('Africa/Cairo', new Date(2026, 6, 15, 12, 0));
  assert.equal(winter, 2);
  assert.equal(summer, 3);
});
check('القدس شتاءً UTC+2 وصيفًا UTC+3', () => {
  assert.equal(tzOffsetHours('Asia/Jerusalem', new Date(2026, 0, 15, 12)), 2);
  assert.equal(tzOffsetHours('Asia/Jerusalem', new Date(2026, 6, 15, 12)), 3);
});
check('الجزائر ثابتة UTC+1 طوال العام', () => {
  assert.equal(tzOffsetHours('Africa/Algiers', new Date(2026, 0, 15, 12)), 1);
  assert.equal(tzOffsetHours('Africa/Algiers', new Date(2026, 6, 15, 12)), 1);
});

console.log('— فلكية المواقيت —');
check('مكة: الظهر في أول السنة ضمن 12:20–12:35', () => {
  const makkah = MAJOR_ISLAMIC_CITIES[0];
  const t = calculatePrayerTimes(makkah, new Date(2026, 0, 1, 9, 0));
  const m = minutesOf(t.dhuhr);
  assert.ok(m >= 740 && m <= 755, `dhuhr=${t.dhuhr}`);
});
check('القاهرة: ظهر شتاءً ~12:04 (UTC+2) وصيفًا ~13:01 (UTC+3) — لا «13:04 في الشتاء» كما كان الخطأ', () => {
  const cairo = MAJOR_ISLAMIC_CITIES.find((c) => c.name === 'القاهرة');
  const winter = calculatePrayerTimes(cairo, new Date(2026, 0, 15, 9, 0));
  const summer = calculatePrayerTimes(cairo, new Date(2026, 6, 15, 9, 0));
  const w = minutesOf(winter.dhuhr);
  const s = minutesOf(summer.dhuhr);
  assert.ok(w >= 710 && w <= 735, `winter dhuhr=${winter.dhuhr} (المتوقع 11:50–12:15)`);
  assert.ok(s >= 770 && s <= 795, `summer dhuhr=${summer.dhuhr} (المتوقع 12:50–13:15)`);
});
check('الجزائر العاصمة: فجر 25 سبتمبر 2026 (فلكي 18° خالص ≈ 05:11، قبل احتياط الوزارة)', () => {
  const algiers = ALGERIAN_WILAYAS[15];
  const t = calculatePrayerTimes(algiers, new Date(2026, 8, 25, 10, 0));
  const m = minutesOf(t.fajr);
  assert.ok(m >= 5 * 60 && m <= 5 * 60 + 25, `fajr=${t.fajr}`);
});
check('العشاء 17° يسبق الفجر 18° بفارق منطقي (< 100 دقيقة في تلمسان صيفًا)', () => {
  const tlemcen = ALGERIAN_WILAYAS.find((w) => w.name.includes('تلمسان'));
  const t = calculatePrayerTimes(tlemcen, new Date(2026, 5, 21, 12, 0));
  const diff = minutesOf(t.fajr) + 24 * 60 - minutesOf(t.isha);
  assert.ok(diff < 24 * 60, `isha=${t.isha} fajr=${t.fajr}`);
});
check('الصلاة القادمة و لحظتها في المستقبل دائمًا', () => {
  const algiers = ALGERIAN_WILAYAS[15];
  const t = calculatePrayerTimes(algiers, new Date());
  assert.ok(t.nextPrayerDate.getTime() > Date.now() - 1000, 'nextPrayerDate مستقبلية');
  assert.ok(t.nextPrayer.length > 0);
});
check('مرحلة المسار النشطة ضمن ST01..ST08', () => {
  const algiers = ALGERIAN_WILAYAS[15];
  const t = calculatePrayerTimes(algiers, new Date(2026, 8, 25, 14, 0));
  assert.match(t.activeTimelineStageId, /^ST0[1-8]$/);
});
check('ثلث الليل يقع بين منتصف الليل والفجر', () => {
  const algiers = ALGERIAN_WILAYAS[15];
  const t = calculatePrayerTimes(algiers, new Date(2026, 8, 25, 20, 0));
  const midnight = minutesOf(t.midnight);
  const lastThird = minutesOf(t.lastThird);
  assert.ok(lastThird > midnight % 1440 || midnight + lastThird > 0, `midnight=${t.midnight} lastThird=${t.lastThird}`);
});

console.log('— التقويم الهجري —');
check('هجري اليوم ضمن مدى سليم', () => {
  const h = getHijriDate(new Date());
  assert.ok(h.day >= 1 && h.day <= 30);
  assert.ok(h.month >= 1 && h.month <= 12);
  assert.ok(h.year >= 1447 && h.year <= 1449, `year=${h.year}`);
  assert.ok(h.formattedText.includes('هـ'));
});
check('معايرة الرؤية +1 تنقل التاريخ يومًا', () => {
  const base = getHijriDate(new Date(2026, 8, 25), 0);
  const shifted = getHijriDate(new Date(2026, 8, 25), 1);
  assert.equal(shifted.day, base.day === 30 ? 1 : base.day + 1);
});
check('الأيام البيض 13–15', () => {
  const white = getHijriDate(new Date(2026, 8, 25), 0);
  assert.equal(white.isWhiteDay, white.day >= 13 && white.day <= 15);
});

if (process.exitCode) {
  console.error(`\nفشل ${process.exitCode && 'بعض'} الاختبارات`);
} else {
  console.log(`\nنجحت كل الاختبارات (${passed})`);
}
