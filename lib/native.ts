// واجهات المتصفح الأصلية: قفل الشاشة، المشاركة، كشف iOS — مُنمَّطة بالكامل.

interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

let wakeLockSentinel: WakeLockSentinel | null = null;

/** إبقاء الشاشة مضاءة أثناء الورد اليومي أو التسبيح */
export async function requestWakeLock(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return false;
  try {
    wakeLockSentinel = await navigator.wakeLock.request('screen');
    wakeLockSentinel.addEventListener('release', () => {
      wakeLockSentinel = null;
    });
    return true;
  } catch {
    return false; // وضع توفير الطاقة أو الإخفاء
  }
}

export async function releaseWakeLock(): Promise<void> {
  if (!wakeLockSentinel) return;
  try {
    await wakeLockSentinel.release();
  } catch {}
  wakeLockSentinel = null;
}

export interface ShareDataPayload {
  title: string;
  text?: string;
  reward?: string;
  facet?: string;
  source?: string;
}

function formatShareText(data: ShareDataPayload): string {
  return [
    `${data.title}`,
    data.text ? `\n« ${data.text} »` : '',
    data.reward ? `\nالفضل: ${data.reward}` : '',
    data.facet ? `\nالمقصد التربوي: ${data.facet}` : '',
    data.source ? `\nالإسناد: ${data.source}` : '',
    `\n— من تطبيق «اليوم النبوي ووظائف العام»`,
  ]
    .filter(Boolean)
    .join('\n');
}

/** مشاركة أصلية مع سقوط تلقائي إلى الحافظة */
export async function shareDevotionalContent(data: ShareDataPayload): Promise<'shared' | 'copied' | 'failed'> {
  const formattedText = formatShareText(data);

  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      await navigator.share({title: data.title, text: formattedText});
      return 'shared';
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return 'failed';
      // فشل المشاركة → نسخ
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(formattedText);
      return 'copied';
    } catch {
      return 'failed';
    }
  }

  return 'failed';
}

/** نسخ نص قصير مع معالجة فشل الحافظة */
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** iOS Safari داخل المتصفح (وليس مثبتًا) */
export function isIOSSafariWeb(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);
  const isStandalone = (window.navigator as NavigatorStandalone).standalone === true;
  return isIOS && !isStandalone;
}
