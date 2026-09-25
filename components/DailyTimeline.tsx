'use client';

import React, { useState } from 'react';
import { MODULE_1_DAILY_TIMELINE, DailyStage, DailyItem } from '@/lib/data';
import {
  Check,
  Sparkles,
  Clock,
  Search,
  ChevronLeft,
} from 'lucide-react';
import { feedback } from '@/lib/sound';
import { DevotionalBottomSheet, BottomSheetItem } from './DevotionalBottomSheet';

interface DailyTimelineProps {
  activeStageId: string;
  soundEnabled: boolean;
  completedItems: Record<string, boolean>;
  onToggleItem: (id: string) => void;
  onSendToTasbeeh: (text: string, title: string) => void;
}

export const DailyTimeline: React.FC<DailyTimelineProps> = ({
  activeStageId,
  completedItems,
  onToggleItem,
  onSendToTasbeeh,
}) => {
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'remaining' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemForSheet, setSelectedItemForSheet] = useState<BottomSheetItem | null>(null);

  // Filter stages based on stage filter, search query, and completion status
  const stagesToRender = MODULE_1_DAILY_TIMELINE.filter((s) => {
    if (selectedStageFilter !== 'all' && s.stage_id !== selectedStageFilter) {
      return false;
    }
    return true;
  }).map((stage) => {
    let filteredItems = stage.items;

    // Filter by status
    if (statusFilter === 'remaining') {
      filteredItems = filteredItems.filter((item) => !completedItems[item.id]);
    } else if (statusFilter === 'completed') {
      filteredItems = filteredItems.filter((item) => Boolean(completedItems[item.id]));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filteredItems = filteredItems.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.act_description.toLowerCase().includes(q) ||
          (item.dhikr_dua && item.dhikr_dua.toLowerCase().includes(q)) ||
          item.spiritual_and_educational_facet.toLowerCase().includes(q)
      );
    }

    return {
      ...stage,
      items: filteredItems,
    };
  }).filter((stage) => stage.items.length > 0);

  // Calculate overall timeline completion
  const totalItemsCount = MODULE_1_DAILY_TIMELINE.reduce(
    (acc, stage) => acc + stage.items.length,
    0
  );
  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const completionPercentage = totalItemsCount > 0 ? Math.round((completedCount / totalItemsCount) * 100) : 0;

  const handleRowClick = (item: DailyItem, stageName: string) => {
    setSelectedItemForSheet({
      id: item.id,
      title: item.title,
      categoryLabel: 'سنة نبوية',
      stageName: stageName,
      vocalizedText: item.dhikr_dua,
      description: item.act_description,
      virtueReward: item.reward_virtue,
      soulFacet: item.spiritual_and_educational_facet,
      sourceEvidence: item.source,
      isRepeatable: Boolean(item.dhikr_dua),
      repeatTarget: item.id.includes('tasbih') || item.id.includes('istighfar') ? 33 : 1,
      isCompleted: Boolean(completedItems[item.id]),
    });
  };

  return (
    <section id="daily-timeline-section" className="space-y-4">
      {/* 1. Header & Daily Progress Tracker (Strictly anti-slop, hairline-bordered) */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl p-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--accent)] shrink-0" />
              <h2 className="font-display font-bold text-base sm:text-lg text-[var(--ink-primary)]">
                المسار الزمني النبوي لليوم والليلة
              </h2>
            </div>
            <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
              تتبع الهدي النبوي الشريف من ناشئة الليل حتى الفراش، مع أسرار تزكية النفس ومقاصد العبادة.
            </p>
          </div>

          {/* Progress summary with tabular digits */}
          <div className="text-right sm:text-left shrink-0">
            <div className="text-xs text-[var(--ink-secondary)]">
              إنجاز اليوم:{' '}
              <strong className="text-[var(--ink-primary)] tabular font-bold">
                {completedCount} / {totalItemsCount}
              </strong>{' '}
              ({completionPercentage}%)
            </div>
            <div className="progress-track w-full sm:w-36 mt-1.5">
              <div
                className="progress-fill"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Search Input & Status Filter */}
        <div className="mt-3 pt-3 border-t border-[var(--border-hairline)] flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[var(--ink-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في السنن والأذكار (مثل: الاستيقاظ، الوتر، القيلولة)..."
              className="w-full bg-[var(--bg-surface-raised)] border border-[var(--border-hairline)] rounded-md pr-8 pl-3 py-1.5 text-xs text-[var(--ink-primary)] placeholder-[var(--ink-muted)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex items-center gap-1 shrink-0 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`btn py-1 px-2.5 text-xs ${
                statusFilter === 'all' ? 'border-[var(--accent)] text-[var(--accent-ink)] font-bold' : ''
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setStatusFilter('remaining')}
              className={`btn py-1 px-2.5 text-xs ${
                statusFilter === 'remaining' ? 'border-[var(--accent)] text-[var(--accent-ink)] font-bold' : ''
              }`}
            >
              المتبقي ({totalItemsCount - completedCount})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`btn py-1 px-2.5 text-xs ${
                statusFilter === 'completed' ? 'border-[var(--accent)] text-[var(--accent-ink)] font-bold' : ''
              }`}
            >
              المنجز ({completedCount})
            </button>
          </div>
        </div>

        {/* Stages Carousel */}
        <div className="mt-3 pt-2 border-t border-[var(--border-hairline)]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedStageFilter('all')}
              className={`btn py-1 px-2.5 text-xs shrink-0 rounded-md ${
                selectedStageFilter === 'all'
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)] font-bold border-[var(--accent)]'
                  : 'text-[var(--ink-secondary)]'
              }`}
            >
              كل المحطات ({totalItemsCount})
            </button>
            {MODULE_1_DAILY_TIMELINE.map((stage) => {
              const isCurrent = activeStageId === stage.stage_id;
              const isSelected = selectedStageFilter === stage.stage_id;
              const completedInStage = stage.items.filter((i) => completedItems[i.id]).length;

              return (
                <button
                  key={stage.stage_id}
                  onClick={() => {
                    setSelectedStageFilter(stage.stage_id);
                    feedback.vibrate(12);
                  }}
                  className={`btn py-1 px-2.5 text-xs shrink-0 rounded-md flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)] font-bold border-[var(--accent)]'
                      : isCurrent
                      ? 'border-[var(--accent)] text-[var(--accent-ink)] font-medium'
                      : 'text-[var(--ink-secondary)]'
                  }`}
                >
                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />}
                  <span>{stage.period_name.split('(')[0].trim()}</span>
                  <span className="tabular text-[10px] text-[var(--ink-muted)]">
                    {completedInStage}/{stage.items.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Stages with Hairline Row Lists (Invariant 2: Absolutely no nested cards) */}
      <div className="space-y-4">
        {stagesToRender.map((stage) => {
          const isCurrentlyActiveTime = activeStageId === stage.stage_id;

          return (
            <div
              key={stage.stage_id}
              id={`stage-${stage.stage_id}`}
              className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl overflow-hidden transition-colors"
            >
              {/* Stage Header */}
              <div
                className={`px-4 py-2.5 border-b border-[var(--border-hairline)] flex items-center justify-between gap-2 ${
                  isCurrentlyActiveTime ? 'bg-[var(--accent-soft)]/50' : ''
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs text-[var(--accent-ink)] font-bold shrink-0">
                    {stage.stage_id}
                  </span>
                  <h3 className="font-display font-bold text-sm sm:text-base text-[var(--ink-primary)] truncate">
                    {stage.period_name}
                  </h3>
                  {isCurrentlyActiveTime && (
                    <span className="badge badge--accent text-[10px]">
                      المحطة الحالية
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[var(--ink-secondary)] shrink-0 tabular">
                  {stage.items.length} سنن
                </span>
              </div>

              {/* Stage Objective Quote */}
              <div className="px-4 py-2 bg-[var(--bg-surface-raised)] border-b border-[var(--border-hairline)] text-xs text-[var(--ink-secondary)]">
                <span className="font-semibold text-[var(--ink-primary)]">المقصد التعبدي: </span>
                <span>{stage.stage_objective}</span>
              </div>

              {/* Row List of Sunan Items */}
              <div className="row-list">
                {stage.items.map((item) => {
                  const isChecked = Boolean(completedItems[item.id]);

                  return (
                    <div
                      key={item.id}
                      id={`item-${item.id}`}
                      className="row-item cursor-pointer px-4 hover:bg-[var(--bg-surface-raised)]"
                      onClick={() => handleRowClick(item, stage.period_name)}
                    >
                      {/* Circle Checkbox */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleItem(item.id);
                          feedback.vibrate(isChecked ? 12 : [25, 40, 25]);
                        }}
                        className={`row-item__check ${
                          isChecked ? 'row-item__check--done' : ''
                        }`}
                        title={isChecked ? 'تراجع عن الإنجاز' : 'تحديد كمنجز'}
                        aria-label={item.title}
                      >
                        {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </button>

                      {/* Content Body */}
                      <div className="row-item__body">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`row-item__title ${
                              isChecked ? 'row-item__title--done' : ''
                            }`}
                          >
                            {item.title}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <ChevronLeft className="w-4 h-4 text-[var(--ink-muted)] group-hover:text-[var(--accent-ink)] transition-colors" />
                          </div>
                        </div>

                        {/* Brief text/meta */}
                        {item.dhikr_dua ? (
                          <div className="text-xs font-display text-[var(--accent-ink)] line-clamp-1">
                            « {item.dhikr_dua} »
                          </div>
                        ) : (
                          <div className="row-item__meta line-clamp-1">
                            {item.act_description}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Bottom Sheet for Full Devotional Details */}
      <DevotionalBottomSheet
        item={selectedItemForSheet}
        isOpen={Boolean(selectedItemForSheet)}
        onClose={() => setSelectedItemForSheet(null)}
        onToggleComplete={(id) => {
          onToggleItem(id);
          setSelectedItemForSheet((prev) =>
            prev ? { ...prev, isCompleted: !prev.isCompleted } : null
          );
        }}
        onLaunchTasbeeh={onSendToTasbeeh}
      />
    </section>
  );
};
