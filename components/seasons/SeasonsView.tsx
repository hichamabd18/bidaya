'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MODULE_2_HIJRI_SEASONS } from '@/lib/data/seasons';
import { monthActId } from '@/lib/library';
import { useApp } from '@/components/providers/AppProvider';
import { Segmented, SectionHeader, EmptyState } from '@/components/ui/controls';
import { PressRow } from '@/components/ui/rows';
import { cn } from '@/lib/utils';

type ViewMode = 'months' | 'seasons';

/** المواسم — وظائف الشهور الهجرية وفصول العام (لطائف المعارف لابن رجب) */
export function SeasonsView() {
  const { hijri, mounted } = useApp();
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>('months');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const currentMonth = mounted ? hijri.month : null;
  const month = MODULE_2_HIJRI_SEASONS.months.find((m) => m.month_number === (selectedMonth ?? currentMonth ?? 1));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <div>
          <h1 className="font-display text-headline font-bold leading-tight text-ink">المواسم ووظائف العام</h1>
          <p className="mt-1 text-caption text-ink-3">
            مستخلصة من «لطائف المعارف فيما لمواسم العام من الوظائف» للحافظ ابن رجب الحنبلي
          </p>
        </div>
        <Segmented
          ariaLabel="عرض الشهور أو الفصول"
          options={[
            { value: 'months', label: 'وظائف الشهور' },
            { value: 'seasons', label: 'فصول العام' },
          ]}
          value={mode}
          onChange={setMode}
        />
      </div>

      {mode === 'months' ? (
        <>
          {/* شبكة السنة الهجرية — الشهر الحالي معلَّم */}
          <div className="mt-5 grid grid-cols-3 gap-1.5 sm:grid-cols-6" role="group" aria-label="أشهر العام الهجري">
            {MODULE_2_HIJRI_SEASONS.months.map((m) => {
              const isCurrent = m.month_number === currentMonth;
              const isSelected = month?.month_number === m.month_number;
              return (
                <button
                  key={m.month_number}
                  type="button"
                  onClick={() => setSelectedMonth(m.month_number)}
                  aria-pressed={isSelected}
                  className={cn(
                    'relative min-h-12 rounded-sm border px-2 py-2 text-label transition-colors',
                    isSelected
                      ? 'border-accent bg-accent-soft font-semibold text-accent-ink'
                      : 'border-hairline text-ink-2 hover:border-accent hover:text-ink',
                  )}
                >
                  {m.name}
                  {isCurrent && (
                    <span
                      aria-label="الشهر الحالي"
                      className="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {month ? (
            <div className="mt-6">
              <SectionHeader
                title={month.title}
                sub={currentMonth === month.month_number ? 'الشهر الحالي' : undefined}
                aside={`${month.acts_and_functions.length} وظائف`}
              />
              <div className="panel mt-3 overflow-hidden">
                {month.acts_and_functions.map((act, index) => (
                  <PressRow
                    key={act.act_name}
                    title={act.act_name}
                    preview={act.details}
                    meta={act.reward}
                    onClick={() => router.push(`/library/${monthActId(month.month_number, index)}`)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="اختر شهرًا" hint="ستظهر وظائفه وأعماله الموسمية" />
          )}
        </>
      ) : (
        <div className="mt-6 space-y-8">
          {MODULE_2_HIJRI_SEASONS.seasonal_solar_cycles.map((season) => (
            <article key={season.season_name}>
              <SectionHeader title={season.season_name} />
              <p className="mt-3 text-body leading-[1.9] text-ink-2">{season.spiritual_concept_and_functions}</p>
              <div className="mt-3 border-s-2 border-accent ps-3">
                <p className="text-caption font-semibold text-accent-ink">المقصد التربوي</p>
                <p className="mt-1 text-label leading-[1.9] text-ink">{season.educational_facet}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
