'use client';

import React from 'react';
import {Check, ChevronLeft} from 'lucide-react';
import {cn} from '@/lib/utils';

interface CheckRowProps {
  title: string;
  /** سطر معاينة — ذكر أو وصف */
  preview?: string;
  isScripture?: boolean;
  meta?: string;
  done: boolean;
  onToggle: () => void;
  onPress?: () => void;
  trailing?: React.ReactNode;
}

/**
 * صف إنجاز — عنصرا تحكم منفصلان ومُسمان (علّم / افتح التفاصيل)،
 * يصل إليهما لوحة المفاتيح وقارئ الشاشة.
 */
export function CheckRow({title, preview, isScripture, meta, done, onToggle, onPress, trailing}: CheckRowProps) {
  return (
    <div className="flex items-start gap-3 border-b border-hairline px-4 py-3 last:border-b-0">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={`${title} — ${done ? 'منجز' : 'غير منجز'}`}
        data-done={done}
        onClick={onToggle}
        className="check"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
      </button>
      <button type="button" onClick={onPress ?? onToggle} className="min-w-0 flex-1 text-start">
        <span
          className={cn(
            'block text-body leading-snug',
            done ? 'text-ink-3 line-through' : 'text-ink',
          )}
        >
          {title}
        </span>
        {preview &&
          (isScripture ? (
            <span className="mt-1 block line-clamp-1 font-display text-[15px] leading-relaxed text-accent-ink">
              « {preview} »
            </span>
          ) : (
            <span className="mt-0.5 block line-clamp-1 text-label text-ink-2">{preview}</span>
          ))}
        {meta && <span className="mt-0.5 block text-caption text-ink-3">{meta}</span>}
      </button>
      {trailing}
    </div>
  );
}

interface PressRowProps {
  title: string;
  preview?: string;
  isScripture?: boolean;
  meta?: string;
  onClick: () => void;
  trailing?: React.ReactNode;
  className?: string;
}

/** صف فتح — للمحتوى القابل للتصفح (مكتبة، مواسم) */
export function PressRow({title, preview, isScripture, meta, onClick, trailing, className}: PressRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 border-b border-hairline px-4 py-3 text-start transition-colors last:border-b-0 hover:bg-raised focus-visible:bg-raised',
        className,
      )}
    >
      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
      <span className="min-w-0 flex-1">
        <span className="block text-body leading-snug text-ink">{title}</span>
        {preview &&
          (isScripture ? (
            <span className="mt-1 block line-clamp-1 font-display text-[15px] leading-relaxed text-accent-ink">
              « {preview} »
            </span>
          ) : (
            <span className="mt-0.5 block line-clamp-1 text-label text-ink-2">{preview}</span>
          ))}
        {meta && <span className="mt-0.5 block text-caption text-ink-3">{meta}</span>}
      </span>
      {trailing ?? <ChevronLeft className="mt-1 h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />}
    </button>
  );
}
