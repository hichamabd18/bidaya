'use client';

import React, { useState, useEffect } from 'react';
import { feedback } from '@/lib/sound';
import { requestWakeLock, releaseWakeLock } from '@/lib/native';
import {
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface InteractiveTasbeehProps {
  initialText?: string;
  initialTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const PRESET_ADHKAR = [
  { title: 'التسبيح المطلق', text: 'سُبْحَانَ اللَّهِ', target: 33 },
  { title: 'التحميد', text: 'الْحَمْدُ لِلَّهِ', target: 33 },
  { title: 'التكبير', text: 'اللَّهُ أَكْبَرُ', target: 34 },
  {
    title: 'التهليل التام',
    text: 'لا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    target: 100,
  },
  { title: 'الاستغفار', text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', target: 100 },
  {
    title: 'الصلاة على النبي ﷺ',
    text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    target: 100,
  },
  { title: 'الحوقلة (كنز العرش)', text: 'لا حَوْلَ وَلا قُوَّةَ إِلَّا بِاللَّهِ', target: 100 },
  {
    title: 'الكلمتان الخفيفتان',
    text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    target: 100,
  },
  {
    title: 'تسبيح الوتر',
    text: 'سُبْحَانَ الْمَلِكِ الْقُدُّوسِ، رَبِّ الْمَلائِكَةِ وَالرُّوحِ',
    target: 3,
  },
];

export const InteractiveTasbeeh: React.FC<InteractiveTasbeehProps> = ({
  initialText,
  initialTitle,
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
}) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [customText, setCustomText] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [lap, setLap] = useState<number>(0);
  const [isPressing, setIsPressing] = useState<boolean>(false);

  // Keep screen awake while Tasbeeh session is active
  useEffect(() => {
    if (isOpen) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => {
      releaseWakeLock();
    };
  }, [isOpen]);

  const [prevInitialText, setPrevInitialText] = useState<string | undefined>(initialText);
  if (initialText !== prevInitialText) {
    setPrevInitialText(initialText);
    if (initialText) {
      setCustomText(initialText);
      setCustomTitle(initialTitle || 'ذكر مخصص');
      setCount(0);
      setLap(0);
      setTarget(33);
    }
  }

  const activeDhikrText = customText || PRESET_ADHKAR[selectedPresetIndex].text;
  const activeDhikrTitle = customTitle || PRESET_ADHKAR[selectedPresetIndex].title;

  const handleIncrement = () => {
    feedback.playBeadClick(soundEnabled);
    feedback.vibrate(12);
    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 100);

    const nextCount = count + 1;
    if (target > 0 && nextCount >= target) {
      feedback.playTargetComplete(soundEnabled);
      feedback.vibrate([25, 40, 25]);
      setCount(0);
      setLap((prev) => prev + 1);
    } else {
      setCount(nextCount);
    }
  };

  const handleReset = () => {
    feedback.vibrate(25);
    setCount(0);
    setLap(0);
  };

  const progress = target > 0 ? Math.min(100, Math.round((count / target) * 100)) : 0;

  if (!isOpen) return null;

  return (
    <div
      id="tasbeeh-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none"
      onClick={onClose}
    >
      <div
        id="tasbeeh-modal-content"
        className="w-full max-w-md bg-[var(--bg-surface-raised)] border border-[var(--border-hairline)] rounded-t-2xl sm:rounded-2xl max-h-[92vh] sm:max-h-[85vh] text-[var(--ink-primary)] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle for mobile */}
        <div className="sm:hidden w-12 h-1.5 bg-[var(--border-strong)] rounded-full mx-auto mt-3 mb-1 shrink-0" />

        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-[var(--border-hairline)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="font-display font-bold text-base text-[var(--ink-primary)]">
              المسبحة الإلكترونية المتصلة
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleSound}
              className="btn p-1.5 text-[var(--ink-secondary)]"
              title={soundEnabled ? 'كتم صوت النقرات' : 'تفعيل صوت النقرات'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[var(--accent)]" />
              ) : (
                <VolumeX className="w-4 h-4 text-[var(--ink-muted)]" />
              )}
            </button>

            <button
              onClick={onClose}
              className="btn-close"
              title="إغلاق"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4 text-[var(--ink-secondary)] shrink-0" />
            </button>
          </div>
        </div>

        {/* Preset Selector Pill Bar */}
        <div className="px-4 py-2 bg-[var(--bg-surface)] border-b border-[var(--border-hairline)] overflow-x-auto scrollbar-none flex items-center gap-1.5">
          {PRESET_ADHKAR.map((preset, idx) => (
            <button
              key={preset.title}
              onClick={() => {
                setSelectedPresetIndex(idx);
                setCustomText('');
                setCustomTitle('');
                setTarget(preset.target);
                setCount(0);
                setLap(0);
                feedback.vibrate(12);
              }}
              className={`btn py-1 px-2.5 text-xs shrink-0 rounded-md ${
                !customText && selectedPresetIndex === idx
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)] font-bold border-[var(--accent)]'
                  : 'text-[var(--ink-secondary)]'
              }`}
            >
              {preset.title}
            </button>
          ))}
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center justify-center text-center space-y-4">
          {/* Target & Lap Indicators */}
          <div className="flex items-center justify-center gap-4 text-xs text-[var(--ink-secondary)]">
            <div className="flex items-center gap-1">
              <span>المستهدف:</span>
              <span className="font-bold text-[var(--ink-primary)] tabular">{target}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span>الدورات التامة:</span>
              <span className="font-bold text-[var(--accent-ink)] tabular">{lap}</span>
            </div>
          </div>

          {/* Active Dhikr Card */}
          <div className="w-full p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
            <h4 className="font-semibold text-xs text-[var(--ink-secondary)] mb-1">
              {activeDhikrTitle}
            </h4>
            <p className="font-display font-bold text-lg sm:text-xl text-[var(--accent-ink)] leading-relaxed select-all">
              « {activeDhikrText} »
            </p>
          </div>

          {/* Large Tactile Counter Circle (Invariant 4: The primary action) */}
          <div className="py-2 flex flex-col items-center">
            <button
              onClick={handleIncrement}
              className={`w-36 h-36 sm:w-40 sm:h-40 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-75 select-none active:scale-95 shadow-lg ${
                isPressing
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)] scale-95'
                  : 'bg-[var(--accent-soft)] text-[var(--accent-ink)] border-[var(--accent)] hover:shadow-xl'
              }`}
              title="انقر للتسبيح"
              aria-label="تسبيح"
            >
              <span className="font-display text-4xl sm:text-5xl font-bold tabular tracking-tight">
                {count}
              </span>
              <span className="text-[11px] font-medium opacity-80 mt-0.5">
                انقر للذكر
              </span>
            </button>
          </div>

          {/* Progress bar with percentage */}
          <div className="w-48 space-y-1">
            <div className="progress-track">
              <div
                className="progress-fill transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[10px] text-[var(--ink-muted)] tabular text-center">
              {count} / {target} ({progress}%)
            </div>
          </div>
        </div>

        {/* Footer Target Switcher & Reset */}
        <div className="px-5 py-3 border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-[var(--ink-secondary)]">الهدف:</span>
            {[33, 100, 1000].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTarget(t);
                  feedback.vibrate(12);
                }}
                className={`btn py-0.5 px-2 text-[11px] tabular ${
                  target === t ? 'border-[var(--accent)] text-[var(--accent-ink)] font-bold' : ''
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleReset}
            className="btn py-1 px-2.5 text-xs text-[var(--danger)] hover:border-[var(--danger)] flex items-center gap-1"
            title="تصفير العداد"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تصفير</span>
          </button>
        </div>
      </div>
    </div>
  );
};
