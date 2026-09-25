'use client';

import React from 'react';
import {cn} from '@/lib/utils';

/** ترويسة قسم طباعية — بلا صندوق ولا أيقونة */
export function SectionHeader({
  title,
  sub,
  aside,
  id,
}: {
  title: string;
  sub?: string;
  aside?: React.ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-hairline pb-2 pt-8 first:pt-0">
      <div className="min-w-0">
        <h2 className="font-display text-title font-bold leading-snug text-ink">{title}</h2>
        {sub && <p className="mt-0.5 text-caption text-ink-3">{sub}</p>}
      </div>
      {aside && <div className="shrink-0 text-caption text-ink-3 tabular-nums">{aside}</div>}
    </div>
  );
}

/** شريحة تصفية — العدد رقم هادئ لا شارة */
export function Chip({
  active,
  onClick,
  children,
  count,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button type="button" className="chip" data-active={active ? 'true' : 'false'} onClick={onClick} aria-pressed={active}>
      <span>{children}</span>
      {typeof count === 'number' && <span className="text-caption text-ink-3 tabular-nums">{count}</span>}
    </button>
  );
}

/** مبدّل مقطعي — لخيارين إلى أربعة */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: {value: T; label: string}[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="inline-flex items-center gap-0.5 rounded-sm border border-hairline bg-surface p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'min-h-9 rounded-[5px] px-3 text-label transition-colors',
            value === option.value
              ? 'border border-hairline bg-raised font-semibold text-ink shadow-none'
              : 'border border-transparent text-ink-2 hover:text-ink',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** شريط تقدّم — خط نحاسي رفيع برقم جدولي */
export function Progress({value, total, className}: {value: number; total: number; className?: string}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={value}
      aria-valuetext={`${value} من ${total}`}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-hairline/70', className)}
    >
      <div
        className="h-full rounded-full bg-accent-strong transition-[width] duration-300 ease-out"
        style={{width: `${pct}%`}}
      />
    </div>
  );
}

/** حالة فراغ صادقة — بلا أيقونات زائفة */
export function EmptyState({
  title,
  hint,
  actionLabel,
  onAction,
}: {
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="anim-content flex flex-col items-center gap-2 px-6 py-14 text-center">
      <p className="text-title font-semibold text-ink-2">{title}</p>
      {hint && <p className="max-w-sm text-label leading-relaxed text-ink-3">{hint}</p>}
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="btn mt-2">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
