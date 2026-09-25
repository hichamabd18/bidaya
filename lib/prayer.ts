// محرك الحساب الفلكي لمواقيت الصلاة (خوارزمية PrayTimes) مع دقة توقيت IANA.
// معيار وزارة الشؤون الدينية الجزائرية: الفجر 18°، العشاء 17°، العصر مذهب الجمهور.
//
// تعديل 3.0: كانت الإحداثيات تحمل «timezone» رقمية ثابتة — ما يجعل القاهرة
// والقدس (التوقيت الصيفي) ومدنًا أخرى خاطئة نصف العام، وأي موقع GPS يُحسب
// على UTC+1 أينما كان على الأرض. الآن تُحلَّل الإزاحة الصحيحة لتاريخ اليوم
// من معرّف IANA للمنطقة الزمنية عبر Intl (قدرة منصة، بلا مكتبات).

export interface Coordinates {
  latitude: number;
  longitude: number;
  /** معرّف IANA للمنطقة الزمنية — يحسم الإزاحة والتوقيت الصيفي لكل تاريخ */
  tzId: string;
  name: string;
  country: string;
}

export const ALGERIA_TZ = 'Africa/Algiers';

export const ALGERIAN_WILAYAS: Coordinates[] = [
  { name: '1. أدرار', country: 'الجزائر', latitude: 27.874, longitude: -0.293, tzId: ALGERIA_TZ },
  { name: '2. الشلف', country: 'الجزائر', latitude: 36.165, longitude: 1.334, tzId: ALGERIA_TZ },
  { name: '3. الأغواط', country: 'الجزائر', latitude: 33.8, longitude: 2.865, tzId: ALGERIA_TZ },
  { name: '4. أم البواقي', country: 'الجزائر', latitude: 35.875, longitude: 7.113, tzId: ALGERIA_TZ },
  { name: '5. باتنة', country: 'الجزائر', latitude: 35.556, longitude: 6.174, tzId: ALGERIA_TZ },
  { name: '6. بجاية', country: 'الجزائر', latitude: 36.755, longitude: 5.084, tzId: ALGERIA_TZ },
  { name: '7. بسكرة', country: 'الجزائر', latitude: 34.85, longitude: 5.733, tzId: ALGERIA_TZ },
  { name: '8. بشار', country: 'الجزائر', latitude: 31.616, longitude: -2.216, tzId: ALGERIA_TZ },
  { name: '9. البليدة', country: 'الجزائر', latitude: 36.47, longitude: 2.827, tzId: ALGERIA_TZ },
  { name: '10. البويرة', country: 'الجزائر', latitude: 36.374, longitude: 3.901, tzId: ALGERIA_TZ },
  { name: '11. تمنراست', country: 'الجزائر', latitude: 22.785, longitude: 5.522, tzId: ALGERIA_TZ },
  { name: '12. تبسة', country: 'الجزائر', latitude: 35.404, longitude: 8.124, tzId: ALGERIA_TZ },
  { name: '13. تلمسان', country: 'الجزائر', latitude: 34.882, longitude: -1.316, tzId: ALGERIA_TZ },
  { name: '14. تيارت', country: 'الجزائر', latitude: 35.371, longitude: 1.316, tzId: ALGERIA_TZ },
  { name: '15. تيزي وزو', country: 'الجزائر', latitude: 36.711, longitude: 4.045, tzId: ALGERIA_TZ },
  { name: '16. الجزائر العاصمة', country: 'الجزائر', latitude: 36.753, longitude: 3.058, tzId: ALGERIA_TZ },
  { name: '17. الجلفة', country: 'الجزائر', latitude: 34.672, longitude: 3.263, tzId: ALGERIA_TZ },
  { name: '18. جيجل', country: 'الجزائر', latitude: 36.82, longitude: 5.766, tzId: ALGERIA_TZ },
  { name: '19. سطيف', country: 'الجزائر', latitude: 36.191, longitude: 5.413, tzId: ALGERIA_TZ },
  { name: '20. سعيدة', country: 'الجزائر', latitude: 34.83, longitude: 0.151, tzId: ALGERIA_TZ },
  { name: '21. سكيكدة', country: 'الجزائر', latitude: 36.878, longitude: 6.909, tzId: ALGERIA_TZ },
  { name: '22. سيدي بلعباس', country: 'الجزائر', latitude: 35.189, longitude: -0.63, tzId: ALGERIA_TZ },
  { name: '23. عنابة', country: 'الجزائر', latitude: 36.9, longitude: 7.766, tzId: ALGERIA_TZ },
  { name: '24. قالمة', country: 'الجزائر', latitude: 36.462, longitude: 7.426, tzId: ALGERIA_TZ },
  { name: '25. قسنطينة', country: 'الجزائر', latitude: 36.365, longitude: 6.614, tzId: ALGERIA_TZ },
  { name: '26. المدية', country: 'الجزائر', latitude: 36.264, longitude: 2.753, tzId: ALGERIA_TZ },
  { name: '27. مستغانم', country: 'الجزائر', latitude: 35.931, longitude: 0.089, tzId: ALGERIA_TZ },
  { name: '28. المسيلة', country: 'الجزائر', latitude: 35.705, longitude: 4.541, tzId: ALGERIA_TZ },
  { name: '29. معسكر', country: 'الجزائر', latitude: 35.396, longitude: 0.14, tzId: ALGERIA_TZ },
  { name: '30. ورقلة', country: 'الجزائر', latitude: 31.949, longitude: 5.325, tzId: ALGERIA_TZ },
  { name: '31. وهران', country: 'الجزائر', latitude: 35.698, longitude: -0.633, tzId: ALGERIA_TZ },
  { name: '32. البيض', country: 'الجزائر', latitude: 33.68, longitude: 1.019, tzId: ALGERIA_TZ },
  { name: '33. إليزي', country: 'الجزائر', latitude: 26.507, longitude: 8.481, tzId: ALGERIA_TZ },
  { name: '34. برج بوعريريج', country: 'الجزائر', latitude: 36.073, longitude: 4.76, tzId: ALGERIA_TZ },
  { name: '35. بومرداس', country: 'الجزائر', latitude: 36.766, longitude: 3.477, tzId: ALGERIA_TZ },
  { name: '36. الطارف', country: 'الجزائر', latitude: 36.767, longitude: 8.313, tzId: ALGERIA_TZ },
  { name: '37. تندوف', country: 'الجزائر', latitude: 27.676, longitude: -8.147, tzId: ALGERIA_TZ },
  { name: '38. تسمسيلت', country: 'الجزائر', latitude: 35.607, longitude: 1.81, tzId: ALGERIA_TZ },
  { name: '39. الوادي', country: 'الجزائر', latitude: 33.368, longitude: 6.867, tzId: ALGERIA_TZ },
  { name: '40. خنشلة', country: 'الجزائر', latitude: 35.435, longitude: 7.143, tzId: ALGERIA_TZ },
  { name: '41. سوق أهراس', country: 'الجزائر', latitude: 36.286, longitude: 7.951, tzId: ALGERIA_TZ },
  { name: '42. تيبازة', country: 'الجزائر', latitude: 36.592, longitude: 2.443, tzId: ALGERIA_TZ },
  { name: '43. ميلة', country: 'الجزائر', latitude: 36.45, longitude: 6.264, tzId: ALGERIA_TZ },
  { name: '44. عين الدفلى', country: 'الجزائر', latitude: 36.264, longitude: 1.967, tzId: ALGERIA_TZ },
  { name: '45. النعامة', country: 'الجزائر', latitude: 33.266, longitude: -0.316, tzId: ALGERIA_TZ },
  { name: '46. عين تموشنت', country: 'الجزائر', latitude: 35.297, longitude: -1.14, tzId: ALGERIA_TZ },
  { name: '47. غرداية', country: 'الجزائر', latitude: 32.49, longitude: 3.673, tzId: ALGERIA_TZ },
  { name: '48. غليزان', country: 'الجزائر', latitude: 35.742, longitude: 0.555, tzId: ALGERIA_TZ },
  { name: '49. تيميمون', country: 'الجزائر', latitude: 29.263, longitude: 0.231, tzId: ALGERIA_TZ },
  { name: '50. برج باجي مختار', country: 'الجزائر', latitude: 21.328, longitude: 0.954, tzId: ALGERIA_TZ },
  { name: '51. أولاد جلال', country: 'الجزائر', latitude: 34.433, longitude: 5.066, tzId: ALGERIA_TZ },
  { name: '52. بني عباس', country: 'الجزائر', latitude: 30.133, longitude: -2.166, tzId: ALGERIA_TZ },
  { name: '53. عين صالح', country: 'الجزائر', latitude: 27.193, longitude: 2.483, tzId: ALGERIA_TZ },
  { name: '54. عين قزام', country: 'الجزائر', latitude: 19.566, longitude: 5.766, tzId: ALGERIA_TZ },
  { name: '55. تقرت', country: 'الجزائر', latitude: 33.105, longitude: 6.064, tzId: ALGERIA_TZ },
  { name: '56. جانت', country: 'الجزائر', latitude: 24.553, longitude: 9.485, tzId: ALGERIA_TZ },
  { name: '57. المغير', country: 'الجزائر', latitude: 33.95, longitude: 5.916, tzId: ALGERIA_TZ },
  { name: '58. المنيعة', country: 'الجزائر', latitude: 30.584, longitude: 2.877, tzId: ALGERIA_TZ },
];

export const MAJOR_ISLAMIC_CITIES: Coordinates[] = [
  { name: 'مكة المكرمة', country: 'المملكة العربية السعودية', latitude: 21.4225, longitude: 39.8262, tzId: 'Asia/Riyadh' },
  { name: 'المدينة المنورة', country: 'المملكة العربية السعودية', latitude: 24.4672, longitude: 39.6111, tzId: 'Asia/Riyadh' },
  { name: 'القدس الشريف', country: 'فلسطين', latitude: 31.7683, longitude: 35.2137, tzId: 'Asia/Jerusalem' },
  { name: 'القاهرة', country: 'مصر', latitude: 30.0444, longitude: 31.2357, tzId: 'Africa/Cairo' },
  { name: 'إسطنبول', country: 'تركيا', latitude: 41.0082, longitude: 28.9784, tzId: 'Europe/Istanbul' },
  { name: 'دمشق', country: 'سوريا', latitude: 33.5138, longitude: 36.2765, tzId: 'Asia/Damascus' },
  { name: 'بغداد', country: 'العراق', latitude: 33.3152, longitude: 44.3661, tzId: 'Asia/Baghdad' },
  { name: 'الرباط', country: 'المغرب', latitude: 34.0209, longitude: -6.8416, tzId: 'Africa/Casablanca' },
  { name: 'تونس', country: 'تونس', latitude: 36.8065, longitude: 10.1815, tzId: 'Africa/Tunis' },
  { name: 'طرابلس', country: 'ليبيا', latitude: 32.8872, longitude: 13.1913, tzId: 'Africa/Tripoli' },
  { name: 'الدوحة', country: 'قطر', latitude: 25.2854, longitude: 51.531, tzId: 'Asia/Qatar' },
  { name: 'أبو ظبي', country: 'الإمارات', latitude: 24.4539, longitude: 54.3773, tzId: 'Asia/Dubai' },
];

/**
 * إزاحة التوقيت الصحيحة (ساعات) لمنطقة IANA عند تاريخ معين — تراعي التوقيت الصيفي.
 */
export function tzOffsetHours(tzId: string, date: Date = new Date()): number {
  try {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: tzId,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const parts = dtf.formatToParts(date);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? '0');
    const asUTC = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
    return Math.round(((asUTC - date.getTime()) / 36e5) * 20) / 20; // أقرب 3 دقائق
  } catch {
    return 1; // الجزائر افتراضيًا
  }
}

/** ترميم إحداثيات قديمة محفوظة قبل مخطط tzId */
export function coerceCoordinates(raw: unknown, fallback: Coordinates): Coordinates {
  if (!raw || typeof raw !== 'object') return fallback;
  const r = raw as Partial<Coordinates> & {timezone?: number};
  if (typeof r.latitude !== 'number' || typeof r.longitude !== 'number' || !r.name) return fallback;
  if (r.tzId) return r as Coordinates;
  // مخطط قديم: نستنتج المنطقة من الاسم/البلد
  const byName = MAJOR_ISLAMIC_CITIES.find((c) => c.name === r.name);
  if (byName) return byName;
  if (typeof r.country === 'string' && r.country.includes('الجزائر')) return {...(r as Coordinates), tzId: ALGERIA_TZ};
  try {
    const device = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (device) return {...(r as Coordinates), tzId: device};
  } catch {}
  return fallback;
}

export interface PrayerTimesResult {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  imsak: string;
  midnight: string;
  lastThird: string;
  rawDates: {
    fajr: Date;
    sunrise: Date;
    dhuhr: Date;
    asr: Date;
    maghrib: Date;
    isha: Date;
    midnight: Date;
    lastThird: Date;
  };
  currentPrayer: string;
  nextPrayer: string;
  /** لحظة الصلاة القادمة القادمة (قد تكون فجر الغد) — للعد التنازلي الحي */
  nextPrayerDate: Date;
  timeToNext: string;
  activeTimelineStageId: string; // ST01 .. ST08
}

// ——— رياضيات فلكية ———
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

function fixHour(h: number): number {
  h = h - 24 * Math.floor(h / 24);
  return h < 0 ? h + 24 : h;
}

function fixAngle(a: number): number {
  a = a - 360 * Math.floor(a / 360);
  return a < 0 ? a + 360 : a;
}

// موقع الشمس: Julian Date -> الميل ومعادلة الزمن
function sunPosition(jd: number) {
  const D = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * D);
  const q = fixAngle(280.459 + 0.98564736 * D);
  const L = fixAngle(q + 1.915 * Math.sin(rad(g)) + 0.02 * Math.sin(rad(2 * g)));

  const e = 23.439 - 0.00000036 * D;
  const d = deg(Math.asin(Math.sin(rad(e)) * Math.sin(rad(L))));
  let RA = deg(Math.atan2(Math.cos(rad(e)) * Math.sin(rad(L)), Math.cos(rad(L)))) / 15;
  RA = fixHour(RA);
  const EqT = q / 15 - RA;
  return {declination: d, equationOfTime: EqT};
}

function julianDate(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

function computeMidDay(EqT: number, timezone: number, lng: number): number {
  const noon = fixHour(12 + timezone - lng / 15 - EqT);
  return noon;
}

function computeSunAngleTime(angle: number, noon: number, lat: number, dec: number, direction: 'ccw' | 'cw'): number {
  const cosH = (Math.sin(rad(angle)) - Math.sin(rad(lat)) * Math.sin(rad(dec))) / (Math.cos(rad(lat)) * Math.cos(rad(dec)));
  if (cosH > 1 || cosH < -1) return noon; // حد المناطق القطبية
  const H = deg(Math.acos(cosH)) / 15;
  return direction === 'ccw' ? noon - H : noon + H;
}

// العصر بمقدار ظل الشاخص (مذهب الجمهور: قامة واحدة)
function computeAsrTime(ratio: number, noon: number, lat: number, dec: number): number {
  const angle = deg(Math.atan(1 / (ratio + Math.tan(rad(Math.abs(lat - dec))))));
  return computeSunAngleTime(angle, noon, lat, dec, 'cw');
}

function formatTimeHHMM(hours: number): string {
  if (isNaN(hours)) return '--:--';
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

interface DayTimes {
  fajrH: number;
  sunriseH: number;
  dhuhrH: number;
  asrH: number;
  sunsetH: number;
  ishaH: number;
  fajrDate: Date;
  sunriseDate: Date;
  dhuhrDate: Date;
  asrDate: Date;
  maghribDate: Date;
  ishaDate: Date;
  offset: number;
}

function computeDay(coords: Coordinates, date: Date): DayTimes {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  const jd = julianDate(y, m, d);
  const sun = sunPosition(jd);

  // معيار وزارة الشؤون الدينية الجزائرية
  const fajrAngle = -18;
  const ishaAngle = -17;
  const sunElevationAngle = -0.833;

  // الإزاحة تُحل عند ظهر ذلك اليوم في منطقة الموقع نفسها (تصحيح التوقيت الصيفي)
  const offset = tzOffsetHours(coords.tzId, new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));

  const noon = computeMidDay(sun.equationOfTime, offset, coords.longitude);
  const sunriseH = computeSunAngleTime(sunElevationAngle, noon, coords.latitude, sun.declination, 'ccw');
  const sunsetH = computeSunAngleTime(sunElevationAngle, noon, coords.latitude, sun.declination, 'cw');
  const fajrH = computeSunAngleTime(fajrAngle, noon, coords.latitude, sun.declination, 'ccw');
  const asrH = computeAsrTime(1, noon, coords.latitude, sun.declination);
  const ishaH = computeSunAngleTime(ishaAngle, noon, coords.latitude, sun.declination, 'cw');

  const makeDate = (hourVal: number): Date => {
    const utcMs = Date.UTC(y, m - 1, d, 0, 0, 0, 0) + (hourVal - offset) * 3600 * 1000;
    return new Date(utcMs);
  };

  return {
    fajrH,
    sunriseH,
    dhuhrH: noon,
    asrH,
    sunsetH,
    ishaH,
    fajrDate: makeDate(fajrH),
    sunriseDate: makeDate(sunriseH),
    dhuhrDate: makeDate(noon),
    asrDate: makeDate(asrH),
    maghribDate: makeDate(sunsetH),
    ishaDate: makeDate(ishaH),
    offset,
  };
}

export function calculatePrayerTimes(coords: Coordinates, date: Date = new Date()): PrayerTimesResult {
  const today = computeDay(coords, date);
  const tomorrow = computeDay(coords, new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 12, 0, 0));

  // ليل اليوم: من الغروب إلى فجر الغد
  const nightDurationHours = (today.fajrH + 24 - today.sunsetH) % 24;
  const midnightH = fixHour(today.sunsetH + nightDurationHours / 2);
  const lastThirdH = fixHour(today.sunsetH + (nightDurationHours * 2) / 3);
  const midnightDate = today.maghribDate.getTime() < today.ishaDate.getTime()
    ? new Date(today.maghribDate.getTime() + ((midnightH - today.sunsetH + 24) % 24) * 3600 * 1000)
    : new Date(today.maghribDate.getTime() + ((midnightH - today.sunsetH + 24) % 24) * 3600 * 1000);
  const lastThirdDate = new Date(today.maghribDate.getTime() + ((lastThirdH - today.sunsetH + 24) % 24) * 3600 * 1000);

  const now = date.getTime();
  const {fajrDate, sunriseDate, dhuhrDate, asrDate, maghribDate, ishaDate} = today;

  let currentPrayer = 'العشاء';
  let nextPrayer = 'الفجر';
  let nextPrayerDate = tomorrow.fajrDate;
  let activeTimelineStageId = 'ST01'; // السحر/القيام افتراضيًا

  if (now < fajrDate.getTime()) {
    currentPrayer = 'قيام الليل / السحر';
    nextPrayer = 'الفجر';
    nextPrayerDate = fajrDate;
    activeTimelineStageId = 'ST01';
  } else if (now < sunriseDate.getTime()) {
    currentPrayer = 'الفجر';
    nextPrayer = 'الشروق';
    nextPrayerDate = sunriseDate;
    activeTimelineStageId = 'ST02';
  } else if (now < dhuhrDate.getTime()) {
    currentPrayer = 'الضحى';
    nextPrayer = 'الظهر';
    nextPrayerDate = dhuhrDate;
    activeTimelineStageId = 'ST03';
  } else if (now < asrDate.getTime()) {
    currentPrayer = 'الظهر';
    nextPrayer = 'العصر';
    nextPrayerDate = asrDate;
    activeTimelineStageId = 'ST04';
  } else if (now < maghribDate.getTime()) {
    currentPrayer = 'العصر';
    nextPrayer = 'المغرب';
    nextPrayerDate = maghribDate;
    activeTimelineStageId = 'ST05';
  } else if (now < ishaDate.getTime()) {
    currentPrayer = 'المغرب';
    nextPrayer = 'العشاء';
    nextPrayerDate = ishaDate;
    activeTimelineStageId = 'ST06';
  } else {
    currentPrayer = 'العشاء';
    nextPrayer = 'الفجر';
    nextPrayerDate = tomorrow.fajrDate;
    const hoursAfterIsha = (now - ishaDate.getTime()) / (1000 * 3600);
    if (hoursAfterIsha > 3.5 || now >= lastThirdDate.getTime()) {
      activeTimelineStageId = 'ST01';
    } else if (hoursAfterIsha > 1.5) {
      activeTimelineStageId = 'ST08';
    } else {
      activeTimelineStageId = 'ST07';
    }
  }

  const diffMs = Math.max(0, nextPrayerDate.getTime() - now);
  const diffHours = Math.floor(diffMs / (1000 * 3600));
  const diffMins = Math.floor((diffMs % (1000 * 3600)) / (1000 * 60));
  const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
  const timeToNext = `${diffHours.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;

  return {
    fajr: formatTimeHHMM(today.fajrH),
    sunrise: formatTimeHHMM(today.sunriseH),
    dhuhr: formatTimeHHMM(today.dhuhrH),
    asr: formatTimeHHMM(today.asrH),
    maghrib: formatTimeHHMM(today.sunsetH),
    isha: formatTimeHHMM(today.ishaH),
    imsak: formatTimeHHMM(today.fajrH - 10 / 60),
    midnight: formatTimeHHMM(midnightH),
    lastThird: formatTimeHHMM(lastThirdH),
    rawDates: {
      fajr: fajrDate,
      sunrise: sunriseDate,
      dhuhr: dhuhrDate,
      asr: asrDate,
      maghrib: maghribDate,
      isha: ishaDate,
      midnight: midnightDate,
      lastThird: lastThirdDate,
    },
    currentPrayer,
    nextPrayer,
    nextPrayerDate,
    timeToNext,
    activeTimelineStageId,
  };
}

// ——— التاريخ الهجري ———
// الخوارزمية الجدولية المعتمدة سابقًا (تُثبَّت مع معايرة الرؤية ±2 يوم)،
// أُبقيت عمدًا حتى لا تتغير التواريخ الشرعية المعروضة على المستخدمين.

export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
  dayName: string;
  formattedText: string;
  isWhiteDay: boolean;
  isFastingDay: boolean; // الاثنين أو الخميس
}

export const HIJRI_MONTHS_AR = [
  'المحرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

export const ARABIC_DAYS = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

export function getHijriDate(date: Date = new Date(), offsetDays: number = 0): HijriDate {
  const adjustedDate = new Date(date);
  adjustedDate.setDate(adjustedDate.getDate() + offsetDays);

  const dayOfWeek = adjustedDate.getDay();
  const dayName = ARABIC_DAYS[dayOfWeek];

  const day = adjustedDate.getDate();
  const month = adjustedDate.getMonth();
  const year = adjustedDate.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  let a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);
  if (y < 1583) b = 0;
  if (y === 1582) {
    if (m > 10) b = -10;
    if (m === 10) {
      b = 0;
      if (day > 4) b = -10;
    }
  }

  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;
  b = 0;
  if (jd > 2299160) {
    a = Math.floor((jd - 1867216.25) / 36524.25);
    b = 1 + a - Math.floor(a / 4);
  }
  const bb = jd + b + 1524;
  let cc = Math.floor((bb - 122.1) / 365.25);
  const dd = Math.floor(365.25 * cc);
  const ee = Math.floor((bb - dd) / 30.6001);
  const dayOfMonth = bb - dd - Math.floor(30.6001 * ee);

  const z = jd - 1948439 + 10632;
  const n = Math.floor((z - 1) / 10631);
  const zz = z - 10631 * n + 354;
  const j = Math.floor((10985 - zz) / 5316) * Math.floor((50 * zz) / 17719) + Math.floor(zz / 5670) * Math.floor((43 * zz) / 15238);
  const zzz = zz - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const hijriMonth = Math.floor((24 * zzz) / 709);
  const hijriDay = zzz - Math.floor((709 * hijriMonth) / 24);
  const hijriYear = 30 * n + j - 30;

  const hMonthNormalized = (((hijriMonth - 1) % 12) + 12) % 12;
  const monthName = HIJRI_MONTHS_AR[hMonthNormalized];
  const formattedText = `${dayName}، ${hijriDay} ${monthName} ${hijriYear} هـ`;

  const isWhiteDay = hijriDay >= 13 && hijriDay <= 15;
  const isFastingDay = dayOfWeek === 1 || dayOfWeek === 4;

  return {
    day: hijriDay,
    month: hMonthNormalized + 1,
    year: hijriYear,
    monthName,
    dayName,
    formattedText,
    isWhiteDay,
    isFastingDay,
  };
}

export function formatConciseGregorian(date: Date = new Date()): string {
  const monthsAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ];
  const d = date.getDate();
  const m = monthsAr[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y} م`;
}
