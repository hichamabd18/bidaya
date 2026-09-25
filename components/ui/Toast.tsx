'use client';

import React, {createContext, useCallback, useContext, useRef, useState} from 'react';
import {cn} from '@/lib/utils';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  message: string;
  action?: ToastAction;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
}

const ToastContext = createContext<{show: (options: ToastOptions) => void}>({show: () => {}});

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 1;

export function ToastProvider({children}: {children: React.ReactNode}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    ({message, action, duration = action ? 6000 : 3200}: ToastOptions) => {
      const id = nextId++;
      setToasts((prev) => [...prev.slice(-2), {id, message, action}]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{show}}>
      {children}
      {/* منطقة حية — تُعلن الرسائل لقارئات الشاشة بلطف */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="anim-content pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-md border border-hairline bg-raised px-4 py-2.5 text-label text-ink shadow-overlay"
          >
            <span className="min-w-0">{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                className={cn('shrink-0 rounded-sm px-1.5 py-1 font-semibold text-accent-ink hover:bg-accent-soft')}
                onClick={() => {
                  toast.action!.onClick();
                  dismiss(toast.id);
                }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
