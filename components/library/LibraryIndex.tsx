'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { libraryGroups, entriesByGroup } from '@/lib/library';
import { PressRow } from '@/components/ui/rows';
import { cn } from '@/lib/utils';

/**
 * المكتبة — فهرس مجموعات وقوائم قراءة.
 * الجوال: شبكة مجموعات ثم القائمة أسفلها. سطح المكتب: فهرس جانبي ثابت.
 */
export function LibraryIndex() {
  const router = useRouter();
  const groups = useMemo(() => libraryGroups(), []);
  const [selected, setSelected] = useState(groups[0]?.name ?? '');
  const entries = useMemo(() => entriesByGroup(selected), [selected]);

  return (
    <div>
      {/* رأس الصفحة */}
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-headline font-bold leading-tight text-ink">المكتبة</h1>
        <p className="mt-1 text-caption text-ink-3">
          المناسبات والأحوال العارضة، وأصول سياسة النفس، وفقه الأذكار — موثقة بإسنادها
        </p>
      </div>

      <div className="mt-5 lg:grid lg:grid-cols-[250px_1fr] lg:gap-10">
        {/* فهرس المجموعات */}
        <nav aria-label="مجموعات المكتبة" className="lg:block">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:sticky lg:top-28 lg:grid-cols-1 lg:gap-0.5">
            {groups.map((group) => {
              const active = group.name === selected;
              return (
                <button
                  key={group.name}
                  type="button"
                  onClick={() => setSelected(group.name)}
                  aria-pressed={active}
                  className={cn(
                    'flex min-h-11 items-center justify-between gap-2 rounded-sm px-3 py-2 text-start text-label transition-colors lg:min-h-9',
                    active
                      ? 'bg-accent-soft font-semibold text-accent-ink lg:bg-transparent lg:font-semibold lg:text-accent-ink'
                      : 'border border-hairline text-ink-2 hover:border-accent hover:text-ink lg:border-transparent lg:hover:bg-surface',
                  )}
                >
                  <span className="min-w-0 truncate">{group.name}</span>
                  <span className="shrink-0 text-caption text-ink-3 tabular-nums">{group.count}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* قائمة المجموعة */}
        <div className="mt-5 min-w-0 lg:mt-0">
          <h2 className="sr-only">{selected}</h2>
          <div className="panel overflow-hidden">
            {entries.map((entry) => (
              <PressRow
                key={entry.id}
                title={entry.title}
                preview={entry.scripture ?? entry.sections[0]?.text}
                isScripture={Boolean(entry.scripture)}
                onClick={() => router.push(`/library/${entry.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
