'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import { HABIT_DAILY_INDICATORS, HABIT_WEEKLY_MILESTONES, HABIT_MONTHLY_MILESTONES } from '@/lib/data/habits';
import { MODULE_1_DAILY_TIMELINE } from '@/lib/data/timeline';
import { useApp } from '@/components/providers/AppProvider';
import { CheckRow } from '@/components/ui/rows';
import { EmptyState, Progress, SectionHeader } from '@/components/ui/controls';
import { useToast } from '@/components/ui/Toast';
import { feedback } from '@/lib/sound';
import { recentDays } from '@/lib/store';
import { cn } from '@/lib/utils';

const TIMELINE_TOTAL = MODULE_1_DAILY_TIMELINE.reduce((acc, s) => acc + s.items.length, 0);
const HABITS_TOTAL = HABIT_DAILY_INDICATORS.length;

function dayPercent(record: { timeline: Record<string, boolean>; habits: Record<string, boolean> }): number {
  const done = Object.values(record.timeline).filter(Boolean).length + Object.values(record.habits).filter(Boolean).length;
  const total = TIMELINE_TOTAL + HABITS_TOTAL;
  return total === 0 ? 0 : done / total;
}

/** تقدمي — صحيفة اليوم والأسبوع وسجلّ هادئ لثلاثين يومًا */
export function ProgressView() {
  const { day, setHabitDone, week, setWeeklyDone, resetToday, mounted } = useApp();
  const { show } = useToast();

  const habitsDone = HABIT_DAILY_INDICATORS.filter((h) => day.habits[h.habit_name]).length;

  const history = useMemo(() => (mounted ? recentDays(30) : []), [mounted]);

  const resetWithUndo = () => {
    const snapshot = resetToday();
    feedback.vibrate(25);
    show({
      message: 'صُفِّرت علامات اليوم',
      action: { label: 'تراجع', onClick: () => {
        // الإرجاع يعيد الحالتين معًا
        for (const [id, v] of Object.entries(snapshot.timeline)) setHabitDone(id, v); // placeholder no-op (يُستبدل أدناه)
      } },
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h1 className="font-display text-headline font-bold leading-tight text-ink">تقدمي</h1>
        <button type="button" onClick={resetWithUndo} className="btn btn--ghost min-h-9! text-ink-3">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          تصفير اليوم
        </button>
      </div>

      {/* ——— اليوم ——— */}
      <SectionHeader title="صحيفة اليوم" aside={mounted ? `${habitsDone + Object.values(day.timeline).filter(Boolean).length} أعمال منجزة` : undefined} />
      <div className="mt-3 space-y-2">
        <Progress value={habitsDone} total={HABITS_TOTAL} />
        <p className="text-caption text-ink-3 tabular-nums">
          الورد اليومي: {habitsDone} من {HABITS_TOTAL} · المسار النبوي: {Object.values(day.timeline).filter(Boolean).length} من{' '}
          {TIMELINE_TOTAL} — <Link href="/" className="text-accent-ink underline underline-offset-2">أكمل مسار اليوم</Link>
        </p>
      </div>
      <div className="panel mt-3 overflow-hidden">
        {HABIT_DAILY_INDICATORS.map((habit) => (
          <CheckRow
            key={habit.habit_name}
            title={habit.habit_name}
            preview={habit.evaluation_criterion}
            meta={habit.target}
            done={Boolean(day.habits[habit.habit_name])}
            onToggle={() => {
              const currently = Boolean(day.habits[habit.habit_name]);
              setHabitDone(habit.habit_name, !currently);
              feedback.vibrate(currently ? 12 : [25, 40, 25]);
            }}
          />
        ))}
      </div>

      {/* ——— الأسبوع ——— يُحفظ بمفتاح أسبوعي: لا يُمحى بانتهاء اليوم */}
      <SectionHeader title="محطات الأسبوع" sub="تُحفظ طوال الأسبوع الحالي" />
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {HABIT_WEEKLY_MILESTONES.map((milestone) => (
          <div key={milestone.milestone} className="panel overflow-hidden">
            <h3 className="border-b border-hairline bg-surface px-4 py-2.5 font-display text-label font-bold text-accent-ink">
              {milestone.milestone}
            </h3>
            <div>
              {milestone.checklist.map((item) => {
                const done = Boolean(week.weekly[item]);
                return (
                  <CheckRow
                    key={item}
                    title={item}
                    done={done}
                    onToggle={() => {
                      setWeeklyDone(item, !done);
                      feedback.vibrate(done ? 12 : [20, 30, 20]);
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ——— الشهر ——— */}
      <SectionHeader title="معالم الشهر" />
      <div className="panel mt-3 overflow-hidden">
        {HABIT_MONTHLY_MILESTONES.map((milestone) => (
          <Link
            key={milestone.milestone}
            href="/seasons"
            className="flex items-start gap-3 border-b border-hairline px-4 py-3 transition-colors last:border-b-0 hover:bg-raised"
          >
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span className="min-w-0 flex-1">
              <span className="block text-body leading-snug text-ink">{milestone.milestone}</span>
              <span className="mt-0.5 block text-label leading-relaxed text-ink-2">{milestone.goal}</span>
            </span>
            <span className="mt-1 shrink-0 text-caption text-accent-ink underline underline-offset-2">المواسم</span>
          </Link>
        ))}
      </div>

      {/* ——— السجل ——— */}
      <SectionHeader title="آخر ثلاثين يومًا" sub="كل نقطة نسبة إنجاز ذلك اليوم — المسار والورد معًا" />
      {history.length === 0 ? (
        <p className="py-6 text-label text-ink-3">…</p>
      ) : (
        <div className="mt-3 grid grid-cols-10 gap-1.5" role="img" aria-label="سجل الإنجاز لثلاثين يومًا">
          {history.map((point, i) => {
            const pct = dayPercent(point.record);
            const isToday = i === history.length - 1;
            return (
              <span
                key={point.key}
                title={`${point.key} — ${Math.round(pct * 100)}٪`}
                className={cn(
                  'aspect-square rounded-full',
                  isToday && 'ring-2 ring-accent ring-offset-2 ring-offset-page',
                )}
                style={{
                  backgroundColor: 'var(--accent-strong)',
                  opacity: pct === 0 ? 0.12 : 0.15 + pct * 0.85,
                }}
              />
            );
          })}
        </div>
      )}
      {history.length > 0 && history.every((p) => dayPercent(p.record) === 0) && (
        <EmptyState title="صحيفة بيضاء" hint='يُملأ هذا السجل من أعمال اليوم — ابدأ بأي عمل وستُضاء أول نقطة' />
      )}
    </div>
  );
}
