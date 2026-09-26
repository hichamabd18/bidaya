'use client';

import React, {useEffect, useState} from 'react';
import {RotateCcw, Volume2, VolumeX} from 'lucide-react';
import {Sheet} from '@/components/ui/Sheet';
import {useApp} from '@/components/providers/AppProvider';
import type {TasbeehSeed} from '@/components/providers/AppProvider';
import {useToast} from '@/components/ui/Toast';
import {feedback} from '@/lib/sound';
import {requestWakeLock, releaseWakeLock} from '@/lib/native';
import {cn} from '@/lib/utils';

const PRESET_ADHKAR = [
  {title: 'التسبيح', text: 'سُبْحَانَ اللَّهِ', target: 33},
  {title: 'التحميد', text: 'الْحَمْدُ لِلَّهِ', target: 33},
  {title: 'التكبير', text: 'اللَّهُ أَكْبَرُ', target: 34},
  {
    title: 'التهليل',
    text: 'لا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    target: 100,
  },
  {title: 'الاستغفار', text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', target: 100},
  {title: 'الصلاة على النبي ﷺ', text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', target: 100},
  {title: 'الحوقلة', text: 'لا حَوْلَ وَلا قُوَّةَ إِلَّا بِاللَّهِ', target: 100},
  {title: 'الكلمتان', text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ', target: 100},
];

const R = 46;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function TasbeehSheet() {
  const {tasbeehOpen, tasbeehSeed, closeTasbeeh, sound, updateSettings} = useApp();
  const {show} = useToast();

  const [presetIndex, setPresetIndex] = useState(0);
  const [custom, setCustom] = useState<TasbeehSeed | null>(null);
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [laps, setLaps] = useState(0);
  const [announce, setAnnounce] = useState('');
  
  const activeText = custom?.text ?? PRESET_ADHKAR[presetIndex].text;
  const activeTitle = custom?.title ?? PRESET_ADHKAR[presetIndex].title;

  // بذرة من المحتوى — اشتقاق أثناء التصيير وفق النمط الموثّق في React
  const seedKey = tasbeehSeed ? `${tasbeehSeed.title}|${tasbeehSeed.text}` : null;
  const [prevSeedKey, setPrevSeedKey] = useState<string | null>(null);
  if (tasbeehOpen && seedKey && seedKey !== prevSeedKey) {
    setPrevSeedKey(seedKey);
    setCustom(tasbeehSeed);
    setCount(0);
    setLaps(0);
    setTarget(33);
  }

  // قفل إطفاء الشاشة طوال الجلسة — وترتيب الإغلاق في مكان واحد
  const handleClose = () => {
    setCustom(null);
    setCount(0);
    setLaps(0);
    setAnnounce('');
    closeTasbeeh();
  };

  useEffect(() => {
    if (tasbeehOpen) {
      void requestWakeLock();
    } else {
      void releaseWakeLock();
    }
    return () => {
      void releaseWakeLock();
    };
  }, [tasbeehOpen]);

  const increment = () => {
    feedback.playBeadClick(sound);
    feedback.vibrate(12);
    const next = count + 1;
    if (next >= target) {
      feedback.playTargetComplete(sound);
      feedback.vibrate([25, 40, 25]);
      setCount(0);
      setLaps((l) => l + 1);
      setAnnounce(`أتممت ${target} من ${activeTitle} — الدورة ${laps + 1}`);
    } else {
      setCount(next);
      if (next % 10 === 0) setAnnounce(`${next} من ${target}`);
    }
  };

  const reset = () => {
    feedback.vibrate(25);
    setCount(0);
    setLaps(0);
    setAnnounce('صُفِّر العداد');
    show({message: 'صُفِّر العداد'});
  };

  const pickPreset = (index: number) => {
    setPresetIndex(index);
    setCustom(null);
    setTarget(PRESET_ADHKAR[index].target);
    setCount(0);
    setLaps(0);
    feedback.vibrate(12);
  };

  const progress = target > 0 ? Math.min(1, count / target) : 0;

  return (
    <Sheet
      open={tasbeehOpen}
      onClose={handleClose}
      title="المسبحة"
      subtitle={activeTitle}
      size="sm"
      bodyClassName="flex flex-col items-center gap-5 px-5 py-5"
      footer={
        <>
          <div className="flex items-center gap-1.5" role="group" aria-label="الهدف">
            {[33, 100, 1000].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTarget(t);
                  setCount(0);
                  feedback.vibrate(10);
                }}
                aria-pressed={target === t}
                className={cn(
                  'min-h-10 min-w-11 rounded-sm border px-2 text-label tabular-nums transition-colors',
                  target === t
                    ? 'border-accent bg-accent-soft font-bold text-accent-ink'
                    : 'border-hairline text-ink-2 hover:border-accent',
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => updateSettings({sound: !sound})}
              className="btn-icon"
              aria-label={sound ? 'كتم المؤثرات الصوتية' : 'تفعيل المؤثرات الصوتية'}
              title="المؤثرات الصوتية"
            >
              {sound ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
            </button>
            <button type="button" onClick={reset} className="btn btn--danger" aria-label="تصفير العداد">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              تصفير
            </button>
          </div>
        </>
      }
    >
      <div aria-live="polite" className="sr-only">
        {announce}
      </div>

      {/* الأذكار الجاهزة */}
      <div className="flex w-full gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="group" aria-label="الأذكار الجاهزة">
        {PRESET_ADHKAR.map((preset, index) => (
          <button
            key={preset.title}
            type="button"
            onClick={() => pickPreset(index)}
            aria-pressed={!custom && presetIndex === index}
            data-active={!custom && presetIndex === index ? 'true' : 'false'}
            className="chip"
          >
            {preset.title}
          </button>
        ))}
      </div>

      {/* الذكر الحالي */}
      <p className="max-w-xs text-center font-display text-[1.125rem] leading-[1.95] text-ink">« {activeText} »</p>

      {/* حلقة العدّ — الفعل الأول في الشاشة */}
      <button
        type="button"
        onClick={increment}
        aria-label={`عدّ — ${count} من ${target}`}
        className="relative flex h-44 w-44 select-none items-center justify-center rounded-full border border-hairline bg-surface transition-transform active:scale-[0.97]"
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--hairline)" strokeWidth="3" />
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="var(--accent-strong)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={`${progress * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            className="transition-[stroke-dasharray] duration-150 ease-out"
          />
        </svg>
        <span className="flex flex-col items-center">
          <span className="text-[2.5rem] font-bold leading-none tabular-nums text-ink">{count}</span>
          <span className="mt-1 text-caption text-ink-3 tabular-nums">
            من {target} · الدورات {laps}
          </span>
        </span>
      </button>

      <p className="text-caption text-ink-3">انقر الحلقة للذكر — تُخفَض الدورة تلقائيًا عند إتمام الهدف</p>
    </Sheet>
  );
}
