// Web Native APIs integration: WakeLock, Web Share, Haptics, and PWA Utilities

let wakeLockSentinel: any = null;

/**
 * Request Screen Wake Lock to keep display on during devotional routines
 */
export async function requestWakeLock(): Promise<boolean> {
  if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
    return false;
  }
  try {
    wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
    wakeLockSentinel.addEventListener('release', () => {
      wakeLockSentinel = null;
    });
    return true;
  } catch {
    // Wake Lock may fail if battery saver is on or document is hidden
    return false;
  }
}

/**
 * Release active screen wake lock
 */
export async function releaseWakeLock(): Promise<void> {
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
    } catch {
      // Ignore
    }
    wakeLockSentinel = null;
  }
}

export interface ShareDataPayload {
  title: string;
  text?: string;
  reward?: string;
  facet?: string;
  source?: string;
}

/**
 * Native Web Share API with automatic clipboard fallback
 */
export async function shareDevotionalContent(data: ShareDataPayload): Promise<'shared' | 'copied' | 'failed'> {
  const formattedText = [
    `✨ ${data.title}`,
    data.text ? `\n« ${data.text} »` : '',
    data.reward ? `\n🌿 الفضل: ${data.reward}` : '',
    data.facet ? `\n🤍 المقصد التربوي: ${data.facet}` : '',
    data.source ? `\n📖 المصدر: ${data.source}` : '',
    `\n— من تطبيق «اليوم النبوي ووظائف العام»`
  ].filter(Boolean).join('\n');

  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      await navigator.share({
        title: data.title,
        text: formattedText,
      });
      return 'shared';
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return 'failed';
      }
      // If user aborted or share failed, fallback to clipboard
    }
  }

  // Fallback to Clipboard API
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

/**
 * Check if the browser is running on iOS Safari outside standalone mode
 */
export function isIOSSafariWeb(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isStandalone = (window.navigator as any).standalone === true;
  return isIOS && !isStandalone;
}
