'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronLeft,
  Compass,
  Heart,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import {
  LIBRARY_CATEGORIES,
  LibraryCategoryDef,
  LibraryCategoryId,
  cleanGroupTitle,
  entriesByGroup,
  groupUnitLabel,
  libraryEntries,
  libraryGroups,
  monthActId,
} from '@/lib/library';
import { MODULE_2_HIJRI_SEASONS } from '@/lib/data/seasons';
import { SearchEntry, normalizeAr, searchEntries } from '@/lib/search';
import { useApp } from '@/components/providers/AppProvider';
import { PressRow } from '@/components/ui/rows';
import { EmptyState } from '@/components/ui/controls';
import { cn } from '@/lib/utils';

/** أيقونة الباب حسب المعرّف */
function CategoryIcon({ id, className }: { id: string; className?: string }) {
  switch (id) {
    case 'bidaya':
      return <BookOpen className={cn('h-4 w-4', className)} aria-hidden="true" />;
    case 'hearts':
      return <Heart className={cn('h-4 w-4', className)} aria-hidden="true" />;
    case 'contextual':
      return <Compass className={cn('h-4 w-4', className)} aria-hidden="true" />;
    case 'seasons':
      return <Calendar className={cn('h-4 w-4', className)} aria-hidden="true" />;
    default:
      return <Sparkles className={cn('h-4 w-4', className)} aria-hidden="true" />;
  }
}

/**
 * الجامع — فهرس ومكتبة مقروءة وميسّرة للجوال وسطح المكتب.
 * تنظيم هرمي بأبواب كبرى، عناوين كاملة بلا بتر، وتصفح سلس في المكان.
 */
export function LibraryIndex() {
  const router = useRouter();
  const { hijri, mounted } = useApp();

  const [activeCategory, setActiveCategory] = useState<LibraryCategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    // فتح الباب الأول تلقائيًا لتقديم فوري للمحتوى
    return new Set(['بداية الهداية: فقه الطاعات']);
  });

  // الشهر الفعال: المختار يدوياً أو الشهر الهجري الحالي
  const activeMonthNumber = selectedMonth ?? (mounted && hijri.month ? hijri.month : 1);

  // فهرس المجموعات وأعداد المواد
  const allGroups = useMemo(() => libraryGroups(), []);
  const groupCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const g of allGroups) {
      map.set(g.name, g.count);
    }
    return map;
  }, [allGroups]);

  // إجمالي المواد لكل باب رئيسي
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    let total = 0;
    for (const cat of LIBRARY_CATEGORIES) {
      let catTotal = 0;
      for (const groupName of cat.groupNames) {
        catTotal += groupCounts.get(groupName) ?? 0;
      }
      counts[cat.id] = catTotal;
      total += catTotal;
    }
    counts.all = total;
    return counts;
  }, [groupCounts]);

  // فهرس البحث الداخلي السريع
  const searchIndex = useMemo(() => {
    const items: SearchEntry[] = [];
    for (const entry of libraryEntries()) {
      items.push({
        id: entry.id,
        kind: entry.kind === 'month' ? 'seasons' : 'library',
        group: entry.group,
        title: entry.title,
        sub: entry.scripture ?? entry.sections[0]?.text,
        href: `/library/${entry.id}`,
        haystack: [
          entry.title,
          entry.scripture,
          ...entry.sections.map((s) => s.text),
          entry.source,
          entry.group,
        ]
          .filter(Boolean)
          .join(' '),
      });
    }
    return items;
  }, []);

  // نتائج البحث اللحظي
  const searchResults = useMemo(() => {
    if (searchQuery.trim().length < 2) return [];
    return searchEntries(searchIndex, searchQuery, 30);
  }, [searchIndex, searchQuery]);

  // تبديل فتح/طي مجموعة
  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  // فتح الكل أو طي الكل
  const toggleAllInView = (groups: string[]) => {
    const allOpen = groups.every((g) => expandedGroups.has(g));
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (allOpen) {
        for (const g of groups) next.delete(g);
      } else {
        for (const g of groups) next.add(g);
      }
      return next;
    });
  };

  // تصفية الأبواب المعروضة
  const visibleCategories = useMemo(() => {
    if (activeCategory === 'all') return LIBRARY_CATEGORIES;
    return LIBRARY_CATEGORIES.filter((c) => c.id === activeCategory);
  }, [activeCategory]);

  // مجموعات الأبواب المعروضة حالياً
  const currentGroupsInView = useMemo(() => {
    return visibleCategories.flatMap((c) => (c.id === 'seasons' ? [] : c.groupNames));
  }, [visibleCategories]);

  const areAllCurrentOpen = currentGroupsInView.length > 0 && currentGroupsInView.every((g) => expandedGroups.has(g));

  // بيانات وظائف الشهر المحدد
  const activeMonthData = useMemo(() => {
    return MODULE_2_HIJRI_SEASONS.months.find((m) => m.month_number === activeMonthNumber);
  }, [activeMonthNumber]);

  return (
    <div className="mx-auto max-w-3xl pb-20">
      {/* ——— ترويسة الصفحة ——— */}
      <header className="border-b border-hairline pb-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-display text-headline font-bold leading-tight text-ink">الجامع</h1>
          <span className="text-caption text-ink-3 tabular-nums">
            {categoryCounts.all} موضوعاً وسنة موثقة
          </span>
        </div>
        <p className="mt-1 text-label text-ink-2 leading-relaxed">
          جامع الأذكار والسنن النبوية، وأصول تزكية النفس، ومناسبات الأحوال — موثقة بإسنادها
        </p>
      </header>

      {/* ——— شريط البحث اللحظي ——— */}
      <div className="mt-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في أبواب ومواضيع الجامع (صلاة، توبة، سفر، ذكر...)"
            aria-label="البحث في مواضيع وأبواب الجامع"
            className="w-full rounded-sm border border-hairline bg-surface py-2.5 pe-10 ps-3 text-label text-ink placeholder:text-ink-3 transition-colors focus:border-accent focus:bg-raised focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute start-2 top-1/2 -translate-y-1/2 rounded-sm p-1.5 text-ink-3 hover:text-ink"
              aria-label="مسح البحث"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* ——— حالة البحث النشط ——— */}
      {searchQuery.trim().length >= 2 ? (
        <section aria-label="نتائج البحث" className="mt-5">
          <div className="flex items-center justify-between border-b border-hairline pb-2">
            <h2 className="text-label font-semibold text-ink">
              نتائج البحث عن «{searchQuery}»
            </h2>
            <span className="text-caption text-ink-3 tabular-nums">
              {searchResults.length} نتيجة
            </span>
          </div>

          {searchResults.length > 0 ? (
            <div className="panel mt-3 overflow-hidden divide-y divide-hairline">
              {searchResults.map((res) => (
                <div key={res.id} className="p-1">
                  <div className="px-3 pt-2">
                    <span className="inline-block rounded-xs bg-accent-soft/60 px-2 py-0.5 text-caption font-medium text-accent-ink">
                      {res.group}
                    </span>
                  </div>
                  <PressRow
                    title={res.title}
                    preview={res.sub}
                    isScripture={res.sub?.includes('«') || res.sub?.includes('﴿')}
                    onClick={() => router.push(res.href)}
                    className="border-none"
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="لم نجد نتائج مطابقة"
              hint="جرّب كلمة أخرى مثل: الصلاة، الوضوء، الإخلاص، الهم، السفر، الاستغفار"
              actionLabel="مسح البحث"
              onAction={() => setSearchQuery('')}
            />
          )}
        </section>
      ) : (
        <>
          {/* ——— شريط التبويبات الرئيسية (أزرار أفقية سهلة اللمس) ——— */}
          <nav
            aria-label="أبواب الجامع الرئيسية"
            className="mt-4 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-none"
          >
            <div className="flex items-center gap-1.5 py-1">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                aria-pressed={activeCategory === 'all'}
                className={cn(
                  'flex min-h-10 shrink-0 items-center gap-1.5 rounded-sm border px-3 py-1.5 text-label transition-colors',
                  activeCategory === 'all'
                    ? 'border-accent bg-accent-soft font-semibold text-accent-ink shadow-xs'
                    : 'border-hairline bg-raised text-ink-2 hover:border-accent hover:text-ink',
                )}
              >
                <span>جميع الأبواب</span>
                <span className="text-caption tabular-nums opacity-80">
                  {categoryCounts.all}
                </span>
              </button>

              {LIBRARY_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    aria-pressed={isActive}
                    className={cn(
                      'flex min-h-10 shrink-0 items-center gap-1.5 rounded-sm border px-3 py-1.5 text-label transition-colors',
                      isActive
                        ? 'border-accent bg-accent-soft font-semibold text-accent-ink shadow-xs'
                        : 'border-hairline bg-raised text-ink-2 hover:border-accent hover:text-ink',
                    )}
                  >
                    <CategoryIcon
                      id={cat.id}
                      className={isActive ? 'text-accent-ink' : 'text-ink-3'}
                    />
                    <span>{cat.shortTitle}</span>
                    <span className="text-caption tabular-nums opacity-80">
                      {categoryCounts[cat.id]}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* ——— شريط التحكم السريع (عدد المواد وزر فتح/طي الكل) ——— */}
          {currentGroupsInView.length > 1 && (
            <div className="mt-4 flex items-center justify-between px-1 text-caption text-ink-3">
              <span>
                {currentGroupsInView.length} أقسام فرعية
              </span>
              <button
                type="button"
                onClick={() => toggleAllInView(currentGroupsInView)}
                className="underline underline-offset-4 hover:text-ink transition-colors"
              >
                {areAllCurrentOpen ? 'طي كل الأقسام' : 'فتح كل الأقسام'}
              </button>
            </div>
          )}

          {/* ——— عرض الأبواب والمجموعات ——— */}
          <div className="mt-4 space-y-8">
            {visibleCategories.map((category) => (
              <section
                key={category.id}
                aria-labelledby={`cat-title-${category.id}`}
                className="space-y-3"
              >
                {/* ترويسة الباب الكبير */}
                <div className="border-b border-hairline pb-2.5 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-accent-soft text-accent-ink">
                        <CategoryIcon id={category.id} />
                      </div>
                      <h2
                        id={`cat-title-${category.id}`}
                        className="font-display text-title font-bold leading-tight text-ink"
                      >
                        {category.title}
                      </h2>
                    </div>
                    <span className="rounded-xs bg-surface border border-hairline px-2 py-0.5 text-caption font-medium text-ink-2">
                      {category.badge}
                    </span>
                  </div>
                  <p className="mt-1 text-caption text-ink-3 leading-relaxed">
                    {category.description}
                  </p>
                </div>

                {/* ——— إذا كان الباب هو «وظائف شهور العام» ——— */}
                {category.id === 'seasons' ? (
                  <div className="panel p-3.5 sm:p-4 space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-label font-semibold text-ink">
                          اختر الشهر الهجري لتصفح وظائفه:
                        </span>
                        {mounted && hijri.month && (
                          <span className="text-caption text-accent-ink font-medium">
                            الشهر الحالي: {MODULE_2_HIJRI_SEASONS.months[hijri.month - 1]?.name}
                          </span>
                        )}
                      </div>

                      {/* شبكة الأشهر الـ 12 المقروءة والواضحة */}
                      <div className="mt-2.5 grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6" role="radiogroup" aria-label="أشهر العام الهجري">
                        {MODULE_2_HIJRI_SEASONS.months.map((m) => {
                          const isCurrent = mounted && m.month_number === hijri.month;
                          const isSelected = activeMonthNumber === m.month_number;
                          const actsCount = m.acts_and_functions.length;

                          return (
                            <button
                              key={m.month_number}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() => setSelectedMonth(m.month_number)}
                              className={cn(
                                'relative flex min-h-12 flex-col items-center justify-center rounded-sm border px-2 py-1.5 text-center transition-colors',
                                isSelected
                                  ? 'border-accent bg-accent-soft font-semibold text-accent-ink shadow-xs'
                                  : 'border-hairline bg-raised text-ink-2 hover:border-accent hover:text-ink',
                              )}
                            >
                              <span className="text-label leading-tight">{m.name}</span>
                              <span className="text-[11px] tabular-nums text-ink-3">
                                {actsCount} {actsCount === 2 ? 'سنتان' : actsCount <= 10 ? 'وظائف' : 'وظيفة'}
                              </span>
                              {isCurrent && (
                                <span
                                  title="الشهر الحالي"
                                  className="absolute end-1 top-1 h-1.5 w-1.5 rounded-full bg-accent"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* وظائف الشهر المختار */}
                    {activeMonthData && (
                      <div className="border-t border-hairline pt-3">
                        <div className="mb-2 flex items-baseline justify-between">
                          <h3 className="text-label font-bold text-ink">
                            وظائف شهر {activeMonthData.name}
                          </h3>
                          <span className="text-caption text-ink-3 tabular-nums">
                            {activeMonthData.acts_and_functions.length} وظائف
                          </span>
                        </div>
                        <p className="mb-3 text-caption text-ink-3">
                          {activeMonthData.title}
                        </p>

                        <div className="rounded-sm border border-hairline overflow-hidden divide-y divide-hairline bg-raised">
                          {activeMonthData.acts_and_functions.map((act, actIndex) => (
                            <PressRow
                              key={act.act_name}
                              title={act.act_name}
                              preview={act.dhikr_dua || act.details}
                              isScripture={Boolean(act.dhikr_dua)}
                              meta={act.reward}
                              onClick={() =>
                                router.push(`/library/${monthActId(activeMonthData.month_number, actIndex)}`)
                              }
                              className="border-none"
                            />
                          ))}
                        </div>

                        <div className="mt-3 text-start">
                          <button
                            type="button"
                            onClick={() => router.push('/seasons')}
                            className="inline-flex items-center gap-1 text-caption text-accent-ink hover:underline font-medium"
                          >
                            <span>عرض تقويم المواسم وفصول العام كاملاً</span>
                            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ——— بقية الأبواب: بطاقات ممتدة مقروءة ومرنة مع طي/فتح ——— */
                  <div className="space-y-2.5">
                    {category.groupNames.map((groupName) => {
                      const count = groupCounts.get(groupName) ?? 0;
                      const isOpen = expandedGroups.has(groupName);
                      const cleanTitle = cleanGroupTitle(groupName);
                      const unitText = groupUnitLabel(groupName, count);
                      const groupEntries = entriesByGroup(groupName);

                      return (
                        <div
                          key={groupName}
                          className={cn(
                            'panel overflow-hidden border transition-colors',
                            isOpen ? 'border-hairline shadow-xs' : 'border-hairline hover:border-line-strong',
                          )}
                        >
                          {/* زر رأس القسم القابل للنقر بمساحة لمس مريحة */}
                          <button
                            type="button"
                            onClick={() => toggleGroup(groupName)}
                            aria-expanded={isOpen}
                            aria-controls={`group-content-${groupName}`}
                            className="flex min-h-12 w-full items-center justify-between gap-3 p-3.5 sm:p-4 text-start transition-colors hover:bg-raised/80"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span
                                className={cn(
                                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-caption tabular-nums font-semibold transition-colors',
                                  isOpen
                                    ? 'bg-accent text-white'
                                    : 'bg-accent-soft text-accent-ink',
                                )}
                              >
                                {count}
                              </span>

                              <div className="min-w-0 flex-1">
                                <h3 className="text-body font-semibold text-ink leading-snug break-words">
                                  {cleanTitle}
                                </h3>
                                <p className="mt-0.5 text-caption text-ink-3">
                                  {unitText}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="hidden sm:inline-block text-caption text-ink-3">
                                {isOpen ? 'إخفاء' : 'عرض'}
                              </span>
                              <ChevronDown
                                className={cn(
                                  'h-4.5 w-4.5 text-ink-3 transition-transform duration-200',
                                  isOpen && 'rotate-180 text-accent',
                                )}
                                aria-hidden="true"
                              />
                            </div>
                          </button>

                          {/* قائمة المواد عند فتح القسم */}
                          {isOpen && (
                            <div
                              id={`group-content-${groupName}`}
                              className="border-t border-hairline bg-raised/50 divide-y divide-hairline"
                            >
                              {groupEntries.map((entry) => (
                                <PressRow
                                  key={entry.id}
                                  title={entry.title}
                                  preview={entry.scripture ?? entry.sections[0]?.text}
                                  isScripture={Boolean(entry.scripture)}
                                  onClick={() => router.push(`/library/${entry.id}`)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
