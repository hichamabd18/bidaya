// مخزن محلي موسوم ومُوثَّق الإصدار.
// إصلاح جوهري: كانت سجلات الأسبوع والشهر تُستعاد فقط إذا طابقها مفتاح «اليوم»،
// فتُمحى تقدّمات الأسبوع كل منتصف ليل. الآن تُؤرشف السجلات بمفاتيح دورية
// (يوم/أسبوع/شهر) مع الاحتفاظ بالتاريخ لصفحات التقدم.

const NS = 'bidaya';
const VERSION = 1;
const key = (name: string) => `${NS}.v${VERSION}:${name}`;

function safeGet(name: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key(name));
  } catch {
    return null;
  }
}

function safeSet(name: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key(name), value);
  } catch {
    // التخزين ممتلئ أو محجوب — نتجاهل بهدوء
  }
}

function safeRemove(name: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key(name));
  } catch {}
}

function parseJSON<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ——— الإعدادات ———

export type ThemeName = 'day' | 'night';

export interface AppSettings {
  location: unknown; // Coordinates — يُرمَّم في coercion طبقة أعلى
  hijriOffset: number;
  theme: ThemeName;
  sound: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  location: null,
  hijriOffset: 0,
  theme: 'day',
  sound: true,
};

export function loadRawSettings(): AppSettings {
  // مفتاحان قديمان (ما قبل التسمية) للترحيل السلس
  const legacy = safeGet('settings') ?? (typeof window !== 'undefined' ? null : null);
  const raw = parseJSON<Partial<AppSettings>>(legacy, {});
  const legacyTheme = typeof window !== 'undefined' ? window.localStorage.getItem('theme_dark_mode') : null;
  const legacyOffset = typeof window !== 'undefined' ? window.localStorage.getItem('hijri_offset_days') : null;
  const legacySound = typeof window !== 'undefined' ? window.localStorage.getItem('sound_enabled') : null;
  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    theme:
      raw.theme ?? (legacyTheme !== null ? (legacyTheme === 'true' ? 'night' : 'day') : DEFAULT_SETTINGS.theme),
    hijriOffset: raw.hijriOffset ?? (legacyOffset !== null ? parseInt(legacyOffset, 10) || 0 : 0),
    sound: raw.sound ?? (legacySound !== null ? legacySound !== 'false' : true),
  };
}

export function saveRawSettings(settings: AppSettings): void {
  safeSet('settings', JSON.stringify(settings));
}

// ——— المفاتيح الدورية ———

const pad = (n: number) => n.toString().padStart(2, '0');

export function dayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** أسبوع ISO (يبدأ الاثنين) — «2026-W39» */
export function weekKey(d: Date = new Date()): string {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayNum = (date.getDay() + 6) % 7; // الاثنين = 0
  date.setDate(date.getDate() - dayNum + 3); // خميس هذا الأسبوع
  const isoYear = date.getFullYear();
  const jan4 = new Date(isoYear, 0, 4);
  const jan4DayNum = (jan4.getDay() + 6) % 7;
  const week1Thu = new Date(isoYear, 0, 4 - jan4DayNum + 3);
  const week = 1 + Math.round((date.getTime() - week1Thu.getTime()) / (7 * 24 * 3600 * 1000));
  return `${isoYear}-W${pad(week)}`;
}

export function monthKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

// ——— سجلات الإنجاز ———

export interface DayRecord {
  timeline: Record<string, boolean>;
  habits: Record<string, boolean>;
}

export const EMPTY_DAY: DayRecord = {timeline: {}, habits: {}};

export interface WeekRecord {
  weekly: Record<string, boolean>;
}

export const EMPTY_WEEK: WeekRecord = {weekly: {}};

export function getDay(key: string = dayKey()): DayRecord {
  return parseJSON<DayRecord>(safeGet(`day:${key}`), {...EMPTY_DAY, timeline: {}, habits: {}});
}

export function setDay(record: DayRecord, key: string = dayKey()): void {
  safeSet(`day:${key}`, JSON.stringify(record));
}

export function getWeek(key: string = weekKey()): WeekRecord {
  return parseJSON<WeekRecord>(safeGet(`week:${key}`), {weekly: {}});
}

export function setWeek(record: WeekRecord, key: string = weekKey()): void {
  safeSet(`week:${key}`, JSON.stringify(record));
}

export interface HistoryPoint {
  key: string;
  record: DayRecord;
}

/** آخر n يوم من السجلات (لشبكة التاريخ في «تقدمي») */
export function recentDays(n: number, endDate: Date = new Date()): HistoryPoint[] {
  const out: HistoryPoint[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - i);
    const k = dayKey(d);
    out.push({key: k, record: getDay(k)});
  }
  return out;
}

/** حذف سجلات اليوم الأقدم من مدة الاحتفاظ */
export function prune(keepDays: number = 120): void {
  if (typeof window === 'undefined') return;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - keepDays);
  const cutoffKey = dayKey(cutoff);
  let stale: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const fullKey = window.localStorage.key(i);
    if (!fullKey || !fullKey.startsWith(`${NS}.v${VERSION}:day:`)) continue;
    const dayPart = fullKey.replace(`${NS}.v${VERSION}:day:`, '');
    if (dayPart < cutoffKey) stale.push(fullKey);
  }
  stale.forEach((k) => {
    try {
      window.localStorage.removeItem(k);
    } catch {}
  });
  stale = [];
}
