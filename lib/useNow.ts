'use client';

import { useSyncExternalStore } from 'react';

// ساعة خارجية مشتركة — القارئات الوحيدة المسموح لها بقراءة الزمن الحي
// (العدّاد في الترويسة، المسبحة). القراءة عبر useSyncExternalStore نظيفة
// للترطيب ولقواعد نقاء التصيير.

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  if (!timer) {
    timer = setInterval(() => listeners.forEach((listener) => listener()), 1000);
  }
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/** الزمن الحي بالمللي ثانية — null قبل الترطيب (يُعرض «—» حينئذ) */
export function useNow(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => Date.now(),
    () => 0,
  );
}
