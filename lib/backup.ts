// النسخة الاحتياطية — تصدير كل سجلات التطبيق إلى ملف JSON واستعادتها.
// دلالات الاستعادة: «إكمال ما ينقص» — المفاتيح الغائبة تُستعاد بالكامل،
// والمفاتيح الموجودة تُدمج (اتحاد العلامات، وحالة الجهاز الحالية تفوز على التعارض)
// فلا تُمحى أبدًا علامات أحدث من النسخة الاحتياطية.

import {APP_METADATA} from './data/meta.ts';

const NS = 'bidaya.v1:';

export interface BackupPayload {
  app: 'bidaya';
  schema: 1;
  appVersion: string;
  exportedAt: string;
  /** المفتاح المختصر (بلا بادئة النسخة) → القيمة */
  records: Record<string, unknown>;
}

export function backupFileName(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `bidaya-backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`;
}

/** يجمع كل سجلات التطبيق من التخزين المحلي */
export function collectBackup(): BackupPayload {
  const records: Record<string, unknown> = {};
  if (typeof window !== 'undefined') {
    const storage = window.localStorage;
    for (let i = 0; i < storage.length; i++) {
      const fullKey = storage.key(i);
      if (!fullKey || !fullKey.startsWith(NS)) continue;
      const shortKey = fullKey.slice(NS.length);
      const raw = storage.getItem(fullKey);
      if (raw === null) continue;
      try {
        records[shortKey] = JSON.parse(raw);
      } catch {
        records[shortKey] = raw; // قيمة نصية نادرة — تُحفظ كما هي
      }
    }
  }
  return {
    app: 'bidaya',
    schema: 1,
    appVersion: APP_METADATA.version,
    exportedAt: new Date().toISOString(),
    records,
  };
}

export interface ImportResult {
  ok: boolean;
  error?: string;
  /** مفاتيح استُعيدت بالكامل (لم تكن على الجهاز) */
  restored: number;
  /** مفاتيح دُمجت مع بيانات أحدث على الجهاز */
  merged: number;
  /** مفاتيح تجاوزت لعدم صلاحيتها */
  skipped: number;
}

const KEY_PATTERN = /^(day:\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])|week:\d{4}-W(?:0[1-9]|[1-4]\d|5[0-3])|month:\d{4}-(?:0[1-9]|1[0-2])|settings)$/;

/** دمج سجل دوري على مستوى العلامات — حالة الجهاز تفوز */
function mergeRecord(
  incoming: Record<string, Record<string, unknown>>,
  current: Record<string, Record<string, unknown>>,
): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {...incoming};
  for (const key of Object.keys(current)) {
    out[key] = {...(incoming[key] ?? {}), ...current[key]};
  }
  return out;
}

export function applyBackup(raw: string): ImportResult {
  const failed = (error: string): ImportResult => ({ok: false, error, restored: 0, merged: 0, skipped: 0});

  let payload: BackupPayload;
  try {
    payload = JSON.parse(raw) as BackupPayload;
  } catch {
    return failed('الملف ليس JSON سليمًا');
  }
  if (
    !payload ||
    payload.app !== 'bidaya' ||
    payload.schema !== 1 ||
    typeof payload.records !== 'object' ||
    payload.records === null
  ) {
    return failed('الملف ليس نسخة احتياطية من هذا التطبيق');
  }
  if (typeof window === 'undefined') return failed('الاستعادة تتم داخل المتصفح فقط');

  const storage = window.localStorage;
  let restored = 0;
  let merged = 0;
  let skipped = 0;

  for (const [shortKey, value] of Object.entries(payload.records)) {
    if (!KEY_PATTERN.test(shortKey) || typeof value !== 'object' || value === null || Array.isArray(value)) {
      skipped++;
      continue;
    }
    const fullKey = NS + shortKey;
    const existingRaw = storage.getItem(fullKey);

    if (existingRaw === null) {
      storage.setItem(fullKey, JSON.stringify(value));
      restored++;
      continue;
    }

    try {
      const current = JSON.parse(existingRaw);
      if (shortKey === 'settings' || typeof current !== 'object' || current === null || Array.isArray(current)) {
        merged++; // إعدادات الجهاز الحالية تبقى كما هي
        continue;
      }
      const combined = mergeRecord(
        value as Record<string, Record<string, unknown>>,
        current as Record<string, Record<string, unknown>>,
      );
      storage.setItem(fullKey, JSON.stringify(combined));
      merged++;
    } catch {
      storage.setItem(fullKey, JSON.stringify(value));
      restored++;
    }
  }

  return {ok: true, restored, merged, skipped};
}
