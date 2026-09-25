'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { useApp } from '@/components/providers/AppProvider';
import { SearchEntry, normalizeAr, searchEntries } from '@/lib/search';
import { libraryEntries } from '@/lib/library';
import { MODULE_1_DAILY_TIMELINE } from '@/lib/data/timeline';
import { EmptyState } from '@/components/ui/controls';

/** فهرس البحث الشامل — يُبنى مرة واحدة عند أول فتح */
function useSearchIndex(): SearchEntry[] {
  return useMemo(() => {
    const entries: SearchEntry[] = [];

    for (const stage of MODULE_1_DAILY_TIMELINE) {
      const stageName = stage.period_name.split('(')[0].trim();
      for (const item of stage.items) {
        entries.push({
          id: item.id,
          kind: 'today',
          group: stageName,
          title: item.title,
          sub: item.dhikr_dua || item.act_description,
          href: `/?focus=${item.id}`,
          haystack: [item.title, item.act_description, item.dhikr_dua, item.alternative_dhikr, item.reward_virtue, item.spiritual_and_educational_facet, item.source]
            .filter(Boolean)
            .join(' '),
        });
      }
    }

    for (const entry of libraryEntries()) {
      entries.push({
        id: entry.id,
        kind: entry.kind === 'month' ? 'seasons' : 'library',
        group: entry.group,
        title: entry.title,
        sub: entry.scripture ?? entry.sections[0]?.text,
        href: `/library/${entry.id}`,
        haystack: [entry.title, entry.scripture, ...entry.sections.map((s) => s.text), entry.source].filter(Boolean).join(' '),
      });
    }

    return entries;
  }, []);
}

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useApp();
  const router = useRouter();
  const index = useSearchIndex();
  const [query, setQuery] = useState('');

  const results = searchOpen ? searchEntries(index, query) : [];

  const close = () => {
    setSearchOpen(false);
    setQuery('');
  };

  const go = (href: string) => {
    close();
    router.push(href);
  };

  return (
    <Sheet
      open={searchOpen}
      onClose={close}
      title="البحث في التطبيق"
      subtitle="المسار اليومي، وظائف الشهور، المكتبة، وفقه الأذكار"
      size="md"
      bodyClassName="px-0 py-0"
    >
      <div className="sticky top-0 z-10 border-b border-hairline bg-raised p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute end-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-3" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن ذكر، سنة، موسم… (يتجاهل التشكيل والهمزات)"
            aria-label="نص البحث"
            autoFocus
            className="w-full rounded-sm border border-hairline bg-surface py-2.5 pe-10 ps-3 text-body text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute start-2 top-1/2 -translate-y-1/2 rounded-sm p-1.5 text-ink-3 hover:text-ink"
              aria-label="مسح البحث"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[55vh]" role="list">
        {query.trim().length >= 2 && results.length === 0 && (
          <EmptyState
            title="لا نتائج"
            hint={`لا شيء يطابق «${query}» — جرّب كلمة أقصر أو تحقق من الإملاء`}
            actionLabel="مسح البحث"
            onAction={() => setQuery('')}
          />
        )}
        {query.trim().length < 2 && (
          <p className="px-5 py-8 text-center text-label text-ink-3">اكتب حرفين فأكثر — يبحث في كل أعمال اليوم والمواسم والجامع</p>
        )}
        {results.map((entry) => (
          <button
            key={`${entry.kind}-${entry.id}`}
            type="button"
            role="listitem"
            onClick={() => go(entry.href)}
            className="block w-full border-b border-hairline px-5 py-3 text-start transition-colors last:border-b-0 hover:bg-surface"
          >
            <span className="text-caption text-accent-ink">{entry.group}</span>
            <span className="mt-0.5 block text-body font-medium leading-snug text-ink">{entry.title}</span>
            {entry.sub && <span className="mt-0.5 block line-clamp-1 text-caption text-ink-3">{entry.sub}</span>}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
