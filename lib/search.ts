// البحث العربي — تطبيع النص (تشكيل، همزات، تاء مربوطة، ألف مقصورة)
// ثم مطابقة بادئة بسيطة. لا اعتماديات داخلية لتسهيل الاختبار المباشر.

export function normalizeAr(input: string): string {
  return input
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '') // التشكيل والتطويل
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export interface SearchEntry {
  id: string;
  group: string; // اسم القسم المعروض
  kind: 'today' | 'seasons' | 'library';
  title: string;
  sub?: string;
  href: string;
  haystack: string; // النص الكامل للفهرسة
}

export function searchEntries(entries: SearchEntry[], query: string, limit = 24): SearchEntry[] {
  const q = normalizeAr(query);
  if (q.length < 2) return [];
  const words = q.split(' ');
  const scored: {entry: SearchEntry; score: number}[] = [];
  for (const entry of entries) {
    const title = normalizeAr(entry.title);
    const hay = normalizeAr(entry.haystack);
    let score = 0;
    let ok = true;
    for (const w of words) {
      if (title.includes(w)) score += 2;
      else if (hay.includes(w)) score += 1;
      else {
        ok = false;
        break;
      }
    }
    if (ok && score > 0) scored.push({entry, score});
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.entry);
}
