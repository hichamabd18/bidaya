// Astronomical Prayer Times Engine (Algerian Ministry of Religious Affairs standard: Fajr 18°, Isha 17°)

export interface Coordinates {
  latitude: number;
  longitude: number;
  timezone: number; // e.g. 1 for UTC+1 (Algeria)
  name: string;
  country: string;
}

export const ALGERIAN_WILAYAS: Coordinates[] = [
  { name: '1. أدرار', country: 'الجزائر', latitude: 27.874, longitude: -0.293, timezone: 1 },
  { name: '2. الشلف', country: 'الجزائر', latitude: 36.165, longitude: 1.334, timezone: 1 },
  { name: '3. الأغواط', country: 'الجزائر', latitude: 33.800, longitude: 2.865, timezone: 1 },
  { name: '4. أم البواقي', country: 'الجزائر', latitude: 35.875, longitude: 7.113, timezone: 1 },
  { name: '5. باتنة', country: 'الجزائر', latitude: 35.556, longitude: 6.174, timezone: 1 },
  { name: '6. بجاية', country: 'الجزائر', latitude: 36.755, longitude: 5.084, timezone: 1 },
  { name: '7. بسكرة', country: 'الجزائر', latitude: 34.850, longitude: 5.733, timezone: 1 },
  { name: '8. بشار', country: 'الجزائر', latitude: 31.616, longitude: -2.216, timezone: 1 },
  { name: '9. البليدة', country: 'الجزائر', latitude: 36.470, longitude: 2.827, timezone: 1 },
  { name: '10. البويرة', country: 'الجزائر', latitude: 36.374, longitude: 3.901, timezone: 1 },
  { name: '11. تمنراست', country: 'الجزائر', latitude: 22.785, longitude: 5.522, timezone: 1 },
  { name: '12. تبسة', country: 'الجزائر', latitude: 35.404, longitude: 8.124, timezone: 1 },
  { name: '13. تلمسان', country: 'الجزائر', latitude: 34.882, longitude: -1.316, timezone: 1 },
  { name: '14. تيارت', country: 'الجزائر', latitude: 35.371, longitude: 1.316, timezone: 1 },
  { name: '15. تيزي وزو', country: 'الجزائر', latitude: 36.711, longitude: 4.045, timezone: 1 },
  { name: '16. الجزائر العاصمة', country: 'الجزائر', latitude: 36.753, longitude: 3.058, timezone: 1 },
  { name: '17. الجلفة', country: 'الجزائر', latitude: 34.672, longitude: 3.263, timezone: 1 },
  { name: '18. جيجل', country: 'الجزائر', latitude: 36.820, longitude: 5.766, timezone: 1 },
  { name: '19. سطيف', country: 'الجزائر', latitude: 36.191, longitude: 5.413, timezone: 1 },
  { name: '20. سعيدة', country: 'الجزائر', latitude: 34.830, longitude: 0.151, timezone: 1 },
  { name: '21. سكيكدة', country: 'الجزائر', latitude: 36.878, longitude: 6.909, timezone: 1 },
  { name: '22. سيدي بلعباس', country: 'الجزائر', latitude: 35.189, longitude: -0.630, timezone: 1 },
  { name: '23. عنابة', country: 'الجزائر', latitude: 36.900, longitude: 7.766, timezone: 1 },
  { name: '24. قالمة', country: 'الجزائر', latitude: 36.462, longitude: 7.426, timezone: 1 },
  { name: '25. قسنطينة', country: 'الجزائر', latitude: 36.365, longitude: 6.614, timezone: 1 },
  { name: '26. المدية', country: 'الجزائر', latitude: 36.264, longitude: 2.753, timezone: 1 },
  { name: '27. مستغانم', country: 'الجزائر', latitude: 35.931, longitude: 0.089, timezone: 1 },
  { name: '28. المسيلة', country: 'الجزائر', latitude: 35.705, longitude: 4.541, timezone: 1 },
  { name: '29. معسكر', country: 'الجزائر', latitude: 35.396, longitude: 0.140, timezone: 1 },
  { name: '30. ورقلة', country: 'الجزائر', latitude: 31.949, longitude: 5.325, timezone: 1 },
  { name: '31. وهران', country: 'الجزائر', latitude: 35.698, longitude: -0.633, timezone: 1 },
  { name: '32. البيض', country: 'الجزائر', latitude: 33.680, longitude: 1.019, timezone: 1 },
  { name: '33. إليزي', country: 'الجزائر', latitude: 26.507, longitude: 8.481, timezone: 1 },
  { name: '34. برج بوعريريج', country: 'الجزائر', latitude: 36.073, longitude: 4.761, timezone: 1 },
  { name: '35. بومرداس', country: 'الجزائر', latitude: 36.766, longitude: 3.477, timezone: 1 },
  { name: '36. الطارف', country: 'الجزائر', latitude: 36.767, longitude: 8.313, timezone: 1 },
  { name: '37. تندوف', country: 'الجزائر', latitude: 27.676, longitude: -8.147, timezone: 1 },
  { name: '38. تسمسيلت', country: 'الجزائر', latitude: 35.607, longitude: 1.810, timezone: 1 },
  { name: '39. الوادي', country: 'الجزائر', latitude: 33.368, longitude: 6.867, timezone: 1 },
  { name: '40. خنشلة', country: 'الجزائر', latitude: 35.435, longitude: 7.143, timezone: 1 },
  { name: '41. سوق أهراس', country: 'الجزائر', latitude: 36.286, longitude: 7.951, timezone: 1 },
  { name: '42. تيبازة', country: 'الجزائر', latitude: 36.592, longitude: 2.443, timezone: 1 },
  { name: '43. ميلة', country: 'الجزائر', latitude: 36.450, longitude: 6.264, timezone: 1 },
  { name: '44. عين الدفلى', country: 'الجزائر', latitude: 36.264, longitude: 1.967, timezone: 1 },
  { name: '45. النعامة', country: 'الجزائر', latitude: 33.266, longitude: -0.316, timezone: 1 },
  { name: '46. عين تموشنت', country: 'الجزائر', latitude: 35.297, longitude: -1.140, timezone: 1 },
  { name: '47. غرداية', country: 'الجزائر', latitude: 32.490, longitude: 3.673, timezone: 1 },
  { name: '48. غليزان', country: 'الجزائر', latitude: 35.742, longitude: 0.555, timezone: 1 },
  { name: '49. تيميمون', country: 'الجزائر', latitude: 29.263, longitude: 0.231, timezone: 1 },
  { name: '50. برج باجي مختار', country: 'الجزائر', latitude: 21.328, longitude: 0.954, timezone: 1 },
  { name: '51. أولاد جلال', country: 'الجزائر', latitude: 34.433, longitude: 5.066, timezone: 1 },
  { name: '52. بني عباس', country: 'الجزائر', latitude: 30.133, longitude: -2.166, timezone: 1 },
  { name: '53. عين صالح', country: 'الجزائر', latitude: 27.193, longitude: 2.483, timezone: 1 },
  { name: '54. عين قزام', country: 'الجزائر', latitude: 19.566, longitude: 5.766, timezone: 1 },
  { name: '55. تقرت', country: 'الجزائر', latitude: 33.105, longitude: 6.064, timezone: 1 },
  { name: '56. جانت', country: 'الجزائر', latitude: 24.553, longitude: 9.485, timezone: 1 },
  { name: '57. المغير', country: 'الجزائر', latitude: 33.950, longitude: 5.916, timezone: 1 },
  { name: '58. المنيعة', country: 'الجزائر', latitude: 30.584, longitude: 2.877, timezone: 1 },
];

export const MAJOR_ISLAMIC_CITIES: Coordinates[] = [
  { name: 'مكة المكرمة', country: 'المملكة العربية السعودية', latitude: 21.4225, longitude: 39.8262, timezone: 3 },
  { name: 'المدينة المنورة', country: 'المملكة العربية السعودية', latitude: 24.4672, longitude: 39.6111, timezone: 3 },
  { name: 'القدس الشريف', country: 'فلسطين', latitude: 31.7683, longitude: 35.2137, timezone: 3 },
  { name: 'القاهرة', country: 'مصر', latitude: 30.0444, longitude: 31.2357, timezone: 3 },
  { name: 'إسطنبول', country: 'تركيا', latitude: 41.0082, longitude: 28.9784, timezone: 3 },
  { name: 'دمشق', country: 'سوريا', latitude: 33.5138, longitude: 36.2765, timezone: 3 },
  { name: 'بغداد', country: 'العراق', latitude: 33.3152, longitude: 44.3661, timezone: 3 },
  { name: 'الرباط', country: 'المغرب', latitude: 34.0209, longitude: -6.8416, timezone: 1 },
  { name: 'تونس', country: 'تونس', latitude: 36.8065, longitude: 10.1815, timezone: 1 },
  { name: 'طرابلس', country: 'ليبيا', latitude: 32.8872, longitude: 13.1913, timezone: 2 },
  { name: 'الدوحة', country: 'قطر', latitude: 25.2854, longitude: 51.5310, timezone: 3 },
  { name: 'أبو ظبي', country: 'الإمارات', latitude: 24.4539, longitude: 54.3773, timezone: 4 },
];

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
  timeToNext: string;
  activeTimelineStageId: string; // ST01 .. ST08
}

// Math helpers for Astronomical Prayer calculations
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

// Compute Sun Position: Julian Date -> Declination & Equation of Time
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
  return { declination: d, equationOfTime: EqT };
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

// MidDay time in hours
function computeMidDay(EqT: number, timezone: number, lng: number): number {
  const noon = fixHour(12 + timezone - lng / 15 - EqT);
  return noon;
}

// Time for given sun altitude angle
function computeSunAngleTime(angle: number, noon: number, lat: number, dec: number, direction: 'ccw' | 'cw'): number {
  const cosH = (Math.sin(rad(angle)) - Math.sin(rad(lat)) * Math.sin(rad(dec))) / (Math.cos(rad(lat)) * Math.cos(rad(dec)));
  if (cosH > 1 || cosH < -1) return noon; // Polar region limit
  const H = deg(Math.acos(cosH)) / 15;
  return direction === 'ccw' ? noon - H : noon + H;
}

// Asr time based on shadow ratio = 1 (Shafi'i/Hanbali/Maliki standard)
function computeAsrTime(ratio: number, noon: number, lat: number, dec: number): number {
  const angle = -deg(Math.atan(1 / (ratio + Math.tan(rad(Math.abs(lat - dec))))));
  return computeSunAngleTime(angle, noon, lat, dec, 'cw');
}

function formatTimeHHMM(hours: number): string {
  if (isNaN(hours)) return '--:--';
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const hh = h.toString().padStart(2, '0');
  const mm = m.toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export function calculatePrayerTimes(coords: Coordinates, date: Date = new Date()): PrayerTimesResult {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  const jd = julianDate(y, m, d);
  const sun = sunPosition(jd);

  // Algerian Ministry of Religious Affairs Standard:
  // Fajr: 18°
  // Isha: 17°
  // Maghrib: 0.833° (standard atmospheric refraction at sunset)
  // Sunrise: 0.833°
  const fajrAngle = -18;
  const ishaAngle = -17;
  const sunElevationAngle = -0.833;

  const noon = computeMidDay(sun.equationOfTime, coords.timezone, coords.longitude);
  const sunriseH = computeSunAngleTime(sunElevationAngle, noon, coords.latitude, sun.declination, 'ccw');
  const sunsetH = computeSunAngleTime(sunElevationAngle, noon, coords.latitude, sun.declination, 'cw');
  const fajrH = computeSunAngleTime(fajrAngle, noon, coords.latitude, sun.declination, 'ccw');
  const asrH = computeAsrTime(1, noon, coords.latitude, sun.declination);
  const ishaH = computeSunAngleTime(ishaAngle, noon, coords.latitude, sun.declination, 'cw');

  // Convert to Date objects with UTC-normalized coordinates timezone
  const makeDate = (hourVal: number): Date => {
    const utcMs = Date.UTC(y, m - 1, d, 0, 0, 0, 0) + ((hourVal - coords.timezone) * 3600 * 1000);
    return new Date(utcMs);
  };

  const fajrDate = makeDate(fajrH);
  const sunriseDate = makeDate(sunriseH);
  const dhuhrDate = makeDate(noon);
  const asrDate = makeDate(asrH);
  const maghribDate = makeDate(sunsetH);
  const ishaDate = makeDate(ishaH);

  // Night calculations (Sunset to next Fajr):
  // Approx next fajr is fajrDate + 24 hours
  const nightDurationMs = fajrDate.getTime() + 24 * 3600 * 1000 - maghribDate.getTime();
  const midnightDate = new Date(maghribDate.getTime() + nightDurationMs / 2);
  const lastThirdDate = new Date(maghribDate.getTime() + (nightDurationMs * 2) / 3);

  const nightDurationHours = (fajrH + 24 - sunsetH) % 24;
  const midnightH = fixHour(sunsetH + nightDurationHours / 2);
  const lastThirdH = fixHour(sunsetH + (nightDurationHours * 2) / 3);

  const now = date.getTime();
  const prayers = [
    { name: 'الفجر', date: fajrDate, stage: 'ST02' },
    { name: 'الشروق', date: sunriseDate, stage: 'ST03' },
    { name: 'الظهر', date: dhuhrDate, stage: 'ST04' },
    { name: 'العصر', date: asrDate, stage: 'ST05' },
    { name: 'المغرب', date: maghribDate, stage: 'ST06' },
    { name: 'العشاء', date: ishaDate, stage: 'ST07' },
  ];

  let currentPrayer = 'العشاء';
  let nextPrayer = 'الفجر';
  let nextPrayerDate = new Date(fajrDate.getTime() + (now > fajrDate.getTime() ? 24 * 3600 * 1000 : 0));
  let activeTimelineStageId = 'ST01'; // Default late night / sahar

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
    nextPrayerDate = new Date(fajrDate.getTime() + 24 * 3600 * 1000);
    // After midnight or past bedtime?
    const hoursAfterIsha = (now - ishaDate.getTime()) / (1000 * 3600);
    if (hoursAfterIsha > 3.5 || now >= lastThirdDate.getTime()) {
      activeTimelineStageId = 'ST01'; // Sahar / Qiyam
    } else if (hoursAfterIsha > 1.5) {
      activeTimelineStageId = 'ST08'; // Sleep / Bedtime
    } else {
      activeTimelineStageId = 'ST07'; // Isha & Early Night
    }
  }

  const diffMs = Math.max(0, nextPrayerDate.getTime() - now);
  const diffHours = Math.floor(diffMs / (1000 * 3600));
  const diffMins = Math.floor((diffMs % (1000 * 3600)) / (1000 * 60));
  const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
  const timeToNext = `${diffHours.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;

  return {
    fajr: formatTimeHHMM(fajrH),
    sunrise: formatTimeHHMM(sunriseH),
    dhuhr: formatTimeHHMM(noon),
    asr: formatTimeHHMM(asrH),
    maghrib: formatTimeHHMM(sunsetH),
    isha: formatTimeHHMM(ishaH),
    imsak: formatTimeHHMM(fajrH - 10 / 60),
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
    timeToNext,
    activeTimelineStageId,
  };
}

// Precise Hijri Date computation with manual offset calibration (Kuwaiti algorithm + calibration)
export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
  dayName: string;
  formattedText: string;
  isWhiteDay: boolean;
  isFastingDay: boolean; // Monday or Thursday
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

  // Modified Umm al-Qura / Tabular algorithm
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

  // Hijri calculation
  const z = jd - 1948439 + 10632;
  const n = Math.floor((z - 1) / 10631);
  const zz = z - 10631 * n + 354;
  const j = Math.floor((10985 - zz) / 5316) * Math.floor((50 * zz) / 17719) + Math.floor(zz / 5670) * Math.floor((43 * zz) / 15238);
  const zzz = zz - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const hijriMonth = Math.floor((24 * zzz) / 709);
  const hijriDay = zzz - Math.floor((709 * hijriMonth) / 24);
  const hijriYear = 30 * n + j - 30;

  const hMonthNormalized = ((hijriMonth - 1) % 12 + 12) % 12;
  const monthName = HIJRI_MONTHS_AR[hMonthNormalized];
  const formattedText = `${dayName}، ${hijriDay} ${monthName} ${hijriYear} هـ`;

  const isWhiteDay = hijriDay >= 13 && hijriDay <= 15;
  const isFastingDay = dayOfWeek === 1 || dayOfWeek === 4; // Mon or Thu

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
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const d = date.getDate();
  const m = monthsAr[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y} م`;
}
