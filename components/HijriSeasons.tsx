'use client';

import React, { useState } from 'react';
import { MODULE_2_HIJRI_SEASONS, MonthFunctionItem, SeasonSolar } from '@/lib/data';
import { HijriDate } from '@/lib/prayer';
import {
  Calendar,
  Sparkles,
  Sun,
  CloudRain,
  Flower2,
  Flame,
  ChevronLeft,
} from 'lucide-react';
import { feedback } from '@/lib/sound';
import { DevotionalBottomSheet, BottomSheetItem } from './DevotionalBottomSheet';

interface HijriSeasonsProps {
  currentHijriDate: HijriDate;
  onSendToTasbeeh: (text: string, title: string) => void;
}

export const HijriSeasons: React.FC<HijriSeasonsProps> = ({
  currentHijriDate,
  onSendToTasbeeh,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(currentHijriDate.month);
  const [activeTab, setActiveTab] = useState<'months' | 'seasons'>('months');
  const [selectedItemForSheet, setSelectedItemForSheet] = useState<BottomSheetItem | null>(null);

  const currentMonthData =
    MODULE_2_HIJRI_SEASONS.months.find((m) => m.month_number === selectedMonth) ||
    MODULE_2_HIJRI_SEASONS.months[0];

  const getSeasonIcon = (name: string) => {
    if (name.includes('الربيع')) return <Flower2 className="w-4 h-4 text-[var(--success)]" />;
    if (name.includes('الصيف')) return <Flame className="w-4 h-4 text-[var(--accent)]" />;
    if (name.includes('الخريف')) return <Sun className="w-4 h-4 text-[var(--accent)]" />;
    return <CloudRain className="w-4 h-4 text-[var(--ink-secondary)]" />;
  };

  const handleOpenDuaSheet = (act: MonthFunctionItem, monthTitle: string) => {
    setSelectedItemForSheet({
      id: act.act_name,
      title: act.act_name,
      categoryLabel: `وظائف ${monthTitle}`,
      stageName: 'مواسم العام',
      vocalizedText: act.dhikr_dua,
      description: act.details,
      virtueReward: act.reward,
      soulFacet: act.spiritual_and_educational_facet,
      sourceEvidence: act.evidence,
      isRepeatable: Boolean(act.dhikr_dua),
      repeatTarget: 33,
    });
  };

  return (
    <section id="hijri-seasons-section" className="space-y-4">
      {/* 1. Header and Selector Tabs */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl p-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--accent)] shrink-0" />
              <h2 className="font-display font-bold text-base sm:text-lg text-[var(--ink-primary)]">
                التقويم الهجري ووظائف الشهور وفصول العام
              </h2>
            </div>
            <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
              مستخلص من كتاب <strong>«لطائف المعارف فيما لمواسم العام من الوظائف»</strong> للحافظ ابن رجب الحنبلي.
            </p>
          </div>

          {/* Sub-tab Navigation (Months vs Solar Seasons) */}
          <div className="flex items-center gap-1 shrink-0 text-xs">
            <button
              onClick={() => {
                setActiveTab('months');
                feedback.vibrate(12);
              }}
              className={`btn py-1 px-3 text-xs ${
                activeTab === 'months'
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)] font-bold border-[var(--accent)]'
                  : 'text-[var(--ink-secondary)]'
              }`}
            >
              وظائف الشهور (12)
            </button>
            <button
              onClick={() => {
                setActiveTab('seasons');
                feedback.vibrate(12);
              }}
              className={`btn py-1 px-3 text-xs ${
                activeTab === 'seasons'
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)] font-bold border-[var(--accent)]'
                  : 'text-[var(--ink-secondary)]'
              }`}
            >
              فصول العام (4)
            </button>
          </div>
        </div>

        {/* Hijri Months Carousel Grid */}
        {activeTab === 'months' && (
          <div className="mt-3 pt-2 border-t border-[var(--border-hairline)]">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {MODULE_2_HIJRI_SEASONS.months.map((month) => {
                const isCurrentToday = currentHijriDate.month === month.month_number;
                const isSelected = selectedMonth === month.month_number;

                return (
                  <button
                    key={month.month_number}
                    onClick={() => {
                      setSelectedMonth(month.month_number);
                      feedback.vibrate(12);
                    }}
                    className={`btn py-1 px-2.5 text-xs shrink-0 rounded-md flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)] font-bold border-[var(--accent)]'
                        : isCurrentToday
                        ? 'border-[var(--accent)] text-[var(--accent-ink)] font-medium'
                        : 'text-[var(--ink-secondary)]'
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-75 tabular">
                      #{month.month_number}
                    </span>
                    <span>{month.name}</span>
                    {isCurrentToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Main Content Area */}
      {activeTab === 'months' ? (
        <div className="space-y-4">
          {/* Selected Month Banner */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl p-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="badge badge--accent font-mono text-xs tabular">
                    الشهر #{currentMonthData.month_number}
                  </span>
                  <h3 className="font-display font-bold text-base sm:text-lg text-[var(--ink-primary)]">
                    {currentMonthData.title}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Month Devotional Acts (Row List - Invariant 2) */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[var(--border-hairline)] flex items-center justify-between">
              <h4 className="font-bold text-xs sm:text-sm text-[var(--ink-primary)]">
                وظائف وأعمال {currentMonthData.name} ({currentMonthData.acts_and_functions.length})
              </h4>
              <span className="text-[11px] text-[var(--ink-secondary)]">
                انقر على العمل لعرض الفضل والتفاصيل والأذكار
              </span>
            </div>

            <div className="row-list">
              {currentMonthData.acts_and_functions.map((act) => (
                <div
                  key={act.act_name}
                  onClick={() => handleOpenDuaSheet(act, currentMonthData.name)}
                  className="row-item cursor-pointer px-4 hover:bg-[var(--bg-surface-raised)]"
                >
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0 mt-2" />
                  <div className="row-item__body">
                    <div className="flex items-center justify-between gap-2">
                      <span className="row-item__title">{act.act_name}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <ChevronLeft className="w-4 h-4 text-[var(--ink-muted)] group-hover:text-[var(--accent-ink)] transition-colors" />
                      </div>
                    </div>

                    <div className="row-item__meta line-clamp-1">
                      {act.details}
                    </div>

                    {act.reward && (
                      <div className="text-[11px] text-[var(--ink-secondary)]">
                        🌿 {act.reward}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Solar Seasons View (Row-list based) */
        <div className="space-y-4">
          {MODULE_2_HIJRI_SEASONS.seasonal_solar_cycles.map((season) => (
            <div
              key={season.season_name}
              className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-[var(--border-hairline)] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getSeasonIcon(season.season_name)}
                  <h3 className="font-display font-bold text-base text-[var(--ink-primary)]">
                    {season.season_name}
                  </h3>
                </div>
              </div>

              {/* Spiritual Lesson & Concepts */}
              <div className="p-4 space-y-2.5 text-xs text-[var(--ink-secondary)]">
                <div className="leading-relaxed">
                  <strong className="text-[var(--ink-primary)]">الوظيفة التعبدية والاعتبار: </strong>
                  <span>{season.spiritual_concept_and_functions}</span>
                </div>
                <div className="p-3 rounded-md bg-[var(--accent-soft)]/40 border border-[var(--accent-soft)] text-[var(--ink-primary)]">
                  <strong className="text-[var(--accent-ink)]">المقصد التربوي وتزكية النفس: </strong>
                  <span>{season.educational_facet}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Devotional Bottom Sheet for Month Acts */}
      <DevotionalBottomSheet
        item={selectedItemForSheet}
        isOpen={Boolean(selectedItemForSheet)}
        onClose={() => setSelectedItemForSheet(null)}
        onLaunchTasbeeh={onSendToTasbeeh}
      />
    </section>
  );
};
