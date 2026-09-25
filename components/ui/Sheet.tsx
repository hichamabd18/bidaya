'use client';

import React, {useEffect, useId, useRef} from 'react';
import {X} from 'lucide-react';
import {cn} from '@/lib/utils';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** sheet = من الأسفل على الجوال؛ modal = نافذة وسطية */
  variant?: 'sheet' | 'modal';
  size?: 'sm' | 'md' | 'lg';
  bodyClassName?: string;
}

/**
 * الطبقة العلوية الوحيدة في التطبيق — كل النوافذ ترث سلوكها:
 * فخ تركيز، إغلاق بـ Escape، قفل تمرير الصفحة، إرجاع التركيز، دلالات dialog.
 */
export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  variant = 'sheet',
  size = 'md',
  bodyClassName,
}: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    if (panel) {
      const first = panel.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panel).focus();
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key === 'Tab' && panel) {
        const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => el.offsetParent !== null || el === document.activeElement,
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-xl',
    lg: 'sm:max-w-2xl',
  }[size];

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex bg-scrim anim-scrim',
        variant === 'sheet' ? 'items-end justify-center' : 'items-center justify-center p-4',
      )}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        className={cn(
          'flex max-h-[92dvh] w-full flex-col overflow-hidden border-x border-t border-hairline bg-raised text-ink shadow-overlay focus:outline-none',
          variant === 'sheet'
            ? cn('anim-sheet rounded-t-lg sm:rounded-lg sm:border', widths)
            : cn('anim-modal rounded-lg border', widths),
        )}
      >
        {variant === 'sheet' && (
          <div aria-hidden="true" className="mx-auto mt-2.5 mb-1 h-1 w-12 shrink-0 rounded-full bg-strong sm:hidden" />
        )}

        <div className="flex items-start justify-between gap-3 border-b border-hairline px-5 py-3.5">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-title font-bold leading-snug">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-caption text-ink-3">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="btn-icon -me-1 -mt-1" aria-label="إغلاق">
            <X aria-hidden="true" />
          </button>
        </div>

        <div className={cn('flex-1 overflow-y-auto overscroll-contain px-5 py-4', bodyClassName)}>{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline bg-surface px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
