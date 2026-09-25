'use client';

import React, { useState } from 'react';
import { MODULE_3_CONTEXTUAL, ContextualCategory, ContextualDuaItem } from '@/lib/data';
import {
  Search,
  Sparkles,
  Tag,
  ChevronLeft,
} from 'lucide-react';
import { feedback } from '@/lib/sound';
import { DevotionalBottomSheet, BottomSheetItem } from './DevotionalBottomSheet';

interface ContextualSunanProps {
  onSendToTasbeeh: (text: string, title: string) => void;
}

export const ContextualSunan: React.FC<ContextualSunanProps> = ({ onSendToTasbeeh }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemForSheet, setSelectedItemForSheet] = useState<BottomSheetItem | null>(null);

  // Filter items
  const filteredCategories = MODULE_3_CONTEXTUAL.map((category) => {
    if (selectedCategory !== 'all' && category.category_name !== selectedCategory) {
      return { ...category, items: [] };
    }

    const filteredItems = category.items.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        item.situation.toLowerCase().includes(q) ||
        item.sunnah_act.toLowerCase().includes(q) ||
        item.text.toLowerCase().includes(q) ||
        item.reward.toLowerCase().includes(q) ||
        item.spiritual_and_educational_facet.toLowerCase().includes(q)
      );
    });

    return { ...category, items: filteredItems };
  }).filter((category) => category.items.length > 0);

  const totalFilteredCount = filteredCategories.reduce(
    (acc, cat) => acc + cat.items.length,
    0
  );

  const handleRowClick = (item: ContextualDuaItem, categoryName: string) => {
    setSelectedItemForSheet({
      id: item.situation,
      title: item.situation,
      categoryLabel: categoryName,
      stageName: item.sunnah_act,
      vocalizedText: item.text,
      description: item.sunnah_act,
      virtueReward: item.reward,
      soulFacet: item.spiritual_and_educational_facet,
      sourceEvidence: item.source,
      isRepeatable: Boolean(item.text),
      repeatTarget: item.situation.includes('استغفار') ? 33 : 1,
    });
  };

  return (
    <section id="contextual-sunan-section" className="space-y-4">
      {/* 1. Header & Instant Filter Bar */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl p-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <h2 className="font-display font-bold text-base sm:text-lg text-[var(--ink-primary)]">
              المناسبات والأحوال العارضة والسنن المقيدة
            </h2>
          </div>
          <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
            أدعية وسنن السفر، الكرب، المعاملات، اللباس، الآيات الكونية، الرقى، والطب النبوي مشكولة وموثقة.
          </p>
        </div>

        {/* Search Input */}
        <div className="mt-3 relative">
          <Search className="w-3.5 h-3.5 text-[var(--ink-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في الأدعية (مثال: كفارة المجلس، دعاء الكرب، السفر، الاستخارة، الريح)..."
            className="w-full bg-[var(--bg-surface-raised)] border border-[var(--border-hairline)] rounded-md pr-8 pl-14 py-1.5 text-xs text-[var(--ink-primary)] placeholder-[var(--ink-muted)] focus:outline-none focus:border-[var(--accent)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="btn absolute left-2 top-1/2 -translate-y-1/2 py-0.5 px-2 text-[10px]"
            >
              مسح
            </button>
          )}
        </div>

        {/* Category Filter Chips Carousel */}
        <div className="mt-3 pt-2 border-t border-[var(--border-hairline)]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => {
                setSelectedCategory('all');
                feedback.vibrate(12);
              }}
              className={`btn py-1 px-2.5 text-xs shrink-0 rounded-md ${
                selectedCategory === 'all'
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)] font-bold border-[var(--accent)]'
                  : 'text-[var(--ink-secondary)]'
              }`}
            >
              الكل ({totalFilteredCount})
            </button>
            {MODULE_3_CONTEXTUAL.map((category) => {
              const isSelected = selectedCategory === category.category_name;
              return (
                <button
                  key={category.category_name}
                  onClick={() => {
                    setSelectedCategory(category.category_name);
                    feedback.vibrate(12);
                  }}
                  className={`btn py-1 px-2.5 text-xs shrink-0 rounded-md ${
                    isSelected
                      ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)] font-bold border-[var(--accent)]'
                      : 'text-[var(--ink-secondary)]'
                  }`}
                >
                  <span>{category.category_name}</span>
                  <span className="tabular text-[10px] text-[var(--ink-muted)]">
                    ({category.items.length})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Categorized Row-Lists (Invariant 2: No nested cards) */}
      <div className="space-y-4">
        {filteredCategories.map((category) => (
          <div
            key={category.category_name}
            className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl overflow-hidden"
          >
            <div className="px-4 py-2.5 border-b border-[var(--border-hairline)] flex items-center justify-between">
              <h3 className="font-display font-bold text-xs sm:text-sm text-[var(--ink-primary)]">
                {category.category_name}
              </h3>
              <span className="text-[11px] text-[var(--ink-secondary)] tabular">
                {category.items.length} أدعية وسنن
              </span>
            </div>

            <div className="row-list">
              {category.items.map((item) => (
                <div
                  key={item.situation}
                  onClick={() => handleRowClick(item, category.category_name)}
                  className="row-item cursor-pointer px-4 hover:bg-[var(--bg-surface-raised)]"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0 mt-2" />
                  <div className="row-item__body">
                    <div className="flex items-center justify-between gap-2">
                      <span className="row-item__title">{item.situation}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <ChevronLeft className="w-4 h-4 text-[var(--ink-muted)] group-hover:text-[var(--accent-ink)] transition-colors" />
                      </div>
                    </div>

                    <p className="row-item__meta line-clamp-1">{item.sunnah_act}</p>

                    {item.text && (
                      <p className="text-xs font-display text-[var(--accent-ink)] line-clamp-1 mt-0.5">
                        « {item.text} »
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Devotional Bottom Sheet for Contextual Duas */}
      <DevotionalBottomSheet
        item={selectedItemForSheet}
        isOpen={Boolean(selectedItemForSheet)}
        onClose={() => setSelectedItemForSheet(null)}
        onLaunchTasbeeh={onSendToTasbeeh}
      />
    </section>
  );
};
