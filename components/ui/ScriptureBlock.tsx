import React from 'react';
import {cn} from '@/lib/utils';

/**
 * كتلة النص الشرعي — خط أميري بحجم ومبيّن قراءة، يُعرض مثل سطر مصحف.
 * النص القرآني والحديثي يُطبَعان غير أن واجهة الاستخدام.
 */
export function ScriptureBlock({
  text,
  source,
  size = 'lg',
  className,
}: {
  text: string;
  source?: string;
  size?: 'md' | 'lg';
  className?: string;
}) {
  return (
    <figure className={cn('my-1', className)}>
      <blockquote
        className={cn(
          'text-center font-display leading-[2] text-ink',
          size === 'lg' ? 'px-1 text-[1.3125rem]' : 'text-[1.125rem]',
        )}
        lang="ar"
        dir="rtl"
      >
        « {text} »
      </blockquote>
      {source && <figcaption className="mt-2 text-center text-caption leading-relaxed text-ink-3">{source}</figcaption>}
    </figure>
  );
}

/** فقرة مقصد تربوي — خط بادئ في اتجاه البداية */
export function FacetBlock({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <div className="border-s-2 border-accent ps-3">
      <p className="text-caption font-semibold text-accent-ink">{label}</p>
      <p className="mt-1 text-label leading-[1.9] text-ink-2">{children}</p>
    </div>
  );
}
