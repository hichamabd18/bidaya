'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Copy, Sparkles } from 'lucide-react';
import { MODULE_1_DAILY_TIMELINE } from '@/lib/data/timeline';
import type { DailyItem } from '@/lib/data/types';
import { useApp } from '@/components/providers/AppProvider';
import { CheckRow, PressRow } from '@/components/ui/rows';
import { EmptyState, Progress, SectionHeader, Segmented } from '@/components/ui/controls';
import { ScriptureBlock, FacetBlock } from '@/components/ui/ScriptureBlock';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';
import { feedback } from '@/lib/sound';
import { copyText } from '@/lib/native';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'remaining' | 'done';

const PRAYERS = [
  { key: 'imsak', name: 'الإمساك' },
  { key: 'fajr', name: 'الفجر' },
  { key: 'sunrise', name: 'الشروق' },
  { key: 'dhuhr', name: 'الظهر' },
  { key: 'asr', name: 'العصر' },
  { key: 'maghrib', name: 'المغرب' },
  { key: 'isha', name: 'العشاء' },
  { key: 'lastThird', name: 'ثلث الليل' },
] as const;

function PrayerStrip() {
  const { prayer, mounted } = useApp();
  return (
    <section id="times" aria-label="مواقيت الصلاة" className="panel p-2">
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
        {PRAYERS.map((p) => {
          const isNext = mounted && prayer.nextPrayer === p.name;
          return (
            <div
              key={p.key}
              aria-current={isNext ? 'true' : undefined}
              className={cn(
                'flex flex-col items-center justify-center rounded-sm border px-1 py-2 text-center transition-colors',
                isNext ? 'border-accent bg-accent-soft' : 'border-transparent',
              )}
            >
              <span className={cn('text-caption', isNext ? 'font-semibold text-accent-ink' : 'text-ink-2')}>{p.name}</span>
              <span className={cn('text-label font-semibold tabular-nums', isNext ? 'text-accent-ink' : 'text-ink')}>
                {prayer[p.key]}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

interface SheetItemState {
  item: DailyItem;
  stageName: string;
}

export function TodayView() {
  const { day, setTimelineDone, prayer, mounted, openTasbeeh } = useApp();
  const { show } = useToast();

  const [status, setStatus] = useState<StatusFilter>('all');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [focusedItem, setFocusedItem] = useState<SheetItemState | null>(null);
  const [flashStage, setFlashStage] = useState<string | null>(null);

  const activeStageId = prayer.activeTimelineStageId;

  // المحطة الحالية تُفتح تلقائيًا — اشتقاق أثناء التصيير (نمط React الموثّق)
  const [prevActiveStage, setPrevActiveStage] = useState(activeStageId);
  if (activeStageId !== prevActiveStage) {
    setPrevActiveStage(activeStageId);
    setExpanded((prev) => new Set(prev).add(activeStageId));
  }

  // رابط عميق ‎/?focus=TL01_01‎ — يفتح المحطة ويمرّر إليها (قراءة نظام خارجي)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const focusId = params.get('focus');
    if (!focusId) return;
    const found = MODULE_1_DAILY_TIMELINE.flatMap((stage) =>
      stage.items.map((item) => ({ item, stage })),
    ).find((entry) => entry.item.id === focusId);
    if (!found) return;
    const timer = setTimeout(() => {
      setExpanded((prev) => new Set(prev).add(found.stage.stage_id));
      setFocusedItem({ item: found.item, stageName: found.stage.period_name });
      document.getElementById(`stage-${found.stage.stage_id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setFlashStage(found.stage.stage_id);
      setTimeout(() => setFlashStage(null), 2000);
    }, 80);
    return () => clearTimeout(timer);
  }, []);

  const totals = useMemo(() => {
    const all = MODULE_1_DAILY_TIMELINE.flatMap((s) => s.items);
    const done = all.filter((i) => day.timeline[i.id]).length;
    return { total: all.length, done };
  }, [day.timeline]);

  const visibleStages = useMemo(
    () =>
      MODULE_1_DAILY_TIMELINE.map((stage) => {
        let items = stage.items;
        if (status === 'remaining') items = items.filter((i) => !day.timeline[i.id]);
        if (status === 'done') items = items.filter((i) => day.timeline[i.id]);
        return { stage, items };
      }).filter(({ items }) => items.length > 0),
    [status, day.timeline],
  );

  const toggleExpand = (stageId: string) => {
    feedback.vibrate(10);
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      return next;
    });
  };

  const openItem = (item: DailyItem, stageName: string) => {
    feedback.vibrate(8);
    setFocusedItem({ item, stageName });
  };

  const toggleDone = (id: string, currentlyDone: boolean) => {
    setTimelineDone(id, !currentlyDone);
    feedback.vibrate(currentlyDone ? 12 : [25, 40, 25]);
  };

  return (
    <div className="mx-auto max-w-3xl pb-16">
      {/* ——— رأس اليوم ——— */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <div>
          <h1 className="font-display text-headline font-bold leading-tight text-ink">أعمال اليوم</h1>
          <p className="mt-1 text-label text-ink-2 tabular-nums" aria-live="polite">
            {mounted ? (
              <>
                أنجزت <strong className="font-semibold text-ink">{totals.done}</strong> من{' '}
                <strong className="font-semibold text-ink">{totals.total}</strong> عملًا ·{' '}
                {totals.total > 0 ? Math.round((totals.done / totals.total) * 100) : 0}٪
              </>
            ) : (
              '…'
            )}
          </p>
        </div>
        <Segmented
          ariaLabel="تصفية حسب الحالة"
          options={[
            { value: 'all', label: 'الكل' },
            { value: 'remaining', label: 'المتبقي' },
            { value: 'done', label: 'المنجز' },
          ]}
          value={status}
          onChange={setStatus}
        />
      </div>
      <Progress value={totals.done} total={totals.total} className="mt-3" />

      {/* ——— مواقيت الصلاة ——— */}
      <div className="mt-5">
        <PrayerStrip />
      </div>

      {/* ——— محطات اليوم ——— */}
      <div className="mt-6 lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">
        {/* سكة المحطات — سطح المكتب */}
        <nav aria-label="محطات اليوم" className="hidden lg:block">
          <div className="sticky top-28 space-y-0.5">
            {MODULE_1_DAILY_TIMELINE.map((stage, index) => {
              const isCurrent = stage.stage_id === activeStageId;
              const doneInStage = stage.items.filter((i) => day.timeline[i.id]).length;
              const open = expanded.has(stage.stage_id);
              return (
                <button
                  key={stage.stage_id}
                  type="button"
                  onClick={() => {
                    if (!open) toggleExpand(stage.stage_id);
                    document.getElementById(`stage-${stage.stage_id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-start text-label transition-colors',
                    isCurrent ? 'bg-accent-soft font-semibold text-accent-ink' : 'text-ink-2 hover:bg-surface hover:text-ink',
                  )}
                  aria-current={isCurrent ? 'true' : undefined}
                >
                  <span className="tabular-nums text-caption text-ink-3">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{stage.period_name.split('(')[0].trim()}</span>
                  <span className="text-caption tabular-nums text-ink-3">
                    {doneInStage}/{stage.items.length}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* قائمة المحطات */}
        <div className="min-w-0">
          {visibleStages.length === 0 && (
            <EmptyState
              title={status === 'done' ? 'لم تُنجز أعمال بعد' : 'أتممت كل أعمال اليوم'}
              hint={
                status === 'done'
                  ? 'ابدأ بمحطة الوقت الحالي — كل عمل تحسبه لك صحيفة اليوم'
                  : 'حفظك الله — عُد غدًا بقلب سالم أو راجع ما فاتك من اليوم برفق'
              }
              actionLabel={status === 'done' ? 'عرض كل المحطات' : undefined}
              onAction={status === 'done' ? () => setStatus('all') : undefined}
            />
          )}

          {visibleStages.map(({ stage, items }, index) => {
            const isCurrent = stage.stage_id === activeStageId && mounted;
            const open = expanded.has(stage.stage_id);
            const doneInStage = stage.items.filter((i) => day.timeline[i.id]).length;
            const stageComplete = doneInStage === stage.items.length;

            return (
              <section
                key={stage.stage_id}
                id={`stage-${stage.stage_id}`}
                aria-label={stage.period_name}
                className={cn(
                  'border-b border-hairline transition-colors last:border-b-0',
                  flashStage === stage.stage_id && 'bg-accent-soft/40',
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(stage.stage_id)}
                  aria-expanded={open}
                  aria-controls={`stage-body-${stage.stage_id}`}
                  className="flex w-full items-center gap-3 px-1 py-4 text-start"
                >
                  <span
                    aria-hidden="true"
                    className={cn('h-2 w-2 shrink-0 rounded-full', isCurrent ? 'bg-accent' : 'bg-hairline')}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-title font-semibold leading-snug text-ink">
                        {index + 1}. {stage.period_name.split('(')[0].trim()}
                      </span>
                      {isCurrent && <span className="badge badge--accent">الآن</span>}
                      {stageComplete && <span className="badge badge--success">أُتمّت</span>}
                    </span>
                    <span className="mt-0.5 block text-caption text-ink-3 tabular-nums">
                      {doneInStage} من {items.length} · {stage.period_name.includes('(') ? stage.period_name.split('(')[1].replace(')', '') : ''}
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={cn('h-4.5 w-4.5 shrink-0 text-ink-3 transition-transform duration-200', open && 'rotate-180')}
                  />
                </button>

                {open && (
                  <div id={`stage-body-${stage.stage_id}`} className="anim-content pb-3">
                    <p className="mb-2 px-1 text-label leading-relaxed text-ink-2">
                      <span className="font-semibold text-accent-ink">المقصد: </span>
                      {stage.stage_objective}
                    </p>
                    <div className="panel overflow-hidden">
                      {items.map((item) => (
                        <CheckRow
                          key={item.id}
                          title={item.title}
                          preview={item.dhikr_dua || item.act_description}
                          isScripture={Boolean(item.dhikr_dua)}
                          done={Boolean(day.timeline[item.id])}
                          onToggle={() => toggleDone(item.id, Boolean(day.timeline[item.id]))}
                          onPress={() => openItem(item, stage.period_name)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>

      {/* ——— ورقة تفاصيل العمل ——— */}
      <ItemSheet state={focusedItem} onClose={() => setFocusedItem(null)} onToggle={toggleDone} onTasbeeh={openTasbeeh} show={show} />
    </div>
  );
}

function ItemSheet({
  state,
  onClose,
  onToggle,
  onTasbeeh,
  show,
}: {
  state: SheetItemState | null;
  onClose: () => void;
  onToggle: (id: string, currentlyDone: boolean) => void;
  onTasbeeh: (seed: { text: string; title: string }) => void;
  show: (opts: { message: string }) => void;
}) {
  const { day } = useApp();
  const item = state?.item;
  const done = item ? Boolean(day.timeline[item.id]) : false;

  if (!item) return null;

  const copy = async () => {
    const ok = await copyText(`« ${item.dhikr_dua || item.title} »\n${item.source}`);
    show({ message: ok ? 'نُسخ النص إلى الحافظة' : 'تعذّر النسخ في هذا المتصفح' });
  };

  return (
    <Sheet
      open={Boolean(state)}
      onClose={onClose}
      title={item.title}
      subtitle={state!.stageName}
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              onToggle(item.id, done);
              if (done) show({ message: 'أُلغيّ الإنجاز' });
            }}
            className={cn('btn', done && 'border-success text-success')}
          >
            {done ? 'منجز اليوم — للتراجع' : 'تحديد كمنجز'}
          </button>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={copy} className="btn-icon" aria-label="نسخ النص" title="نسخ النص">
              <Copy aria-hidden="true" />
            </button>
            {item.dhikr_dua && (
              <button
                type="button"
                onClick={() => {
                  onTasbeeh({ text: item.dhikr_dua, title: item.title });
                  onClose();
                }}
                className="btn btn--primary"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                التسبيح
              </button>
            )}
          </div>
        </>
      }
    >
      {item.dhikr_dua && <ScriptureBlock text={item.dhikr_dua} />}

      {item.alternative_dhikr && (
        <div className="mt-3">
          <p className="mb-1 text-caption font-semibold text-ink-3">بديلها</p>
          <ScriptureBlock text={item.alternative_dhikr} size="md" />
        </div>
      )}

      <div className="mt-4 space-y-4">
        <div>
          <h3 className="mb-1 text-label font-semibold text-ink-3">العمل</h3>
          <p className="text-body leading-[1.9] text-ink">{item.act_description}</p>
        </div>
        {item.reward_virtue && (
          <div>
            <h3 className="mb-1 text-label font-semibold text-ink-3">الفضل والأثر</h3>
            <p className="text-body leading-[1.9] text-ink-2">{item.reward_virtue}</p>
          </div>
        )}
        {item.spiritual_and_educational_facet && (
          <FacetBlock label="المقصد التعبدي وتزكية النفس">{item.spiritual_and_educational_facet}</FacetBlock>
        )}
        {item.source && (
          <p className="border-t border-hairline pt-3 text-caption leading-relaxed text-ink-3">الإسناد: {item.source}</p>
        )}
      </div>
    </Sheet>
  );
}
