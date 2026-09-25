'use client';

import React, { useEffect, useState } from 'react';
import { X, Share2, Sparkles, BookOpen, Heart, CheckCircle2, Circle, Copy, Check } from 'lucide-react';
import { shareDevotionalContent, requestWakeLock, releaseWakeLock } from '@/lib/native';
import { feedback } from '@/lib/sound';

export interface BottomSheetItem {
  id: string;
  title: string;
  categoryLabel?: string;
  stageName?: string;
  vocalizedText?: string;
  description?: string;
  virtueReward?: string;
  soulFacet?: string;
  sourceEvidence?: string;
  isRepeatable?: boolean;
  repeatTarget?: number;
  isCompleted?: boolean;
}

interface DevotionalBottomSheetProps {
  item: BottomSheetItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleComplete?: (id: string) => void;
  onLaunchTasbeeh?: (text: string, title: string) => void;
}

export const DevotionalBottomSheet: React.FC<DevotionalBottomSheetProps> = ({
  item,
  isOpen,
  onClose,
  onToggleComplete,
  onLaunchTasbeeh,
}) => {
  const [shareStatus, setShareStatus] = useState<'idle' | 'shared' | 'copied'>('idle');

  // Request screen wake lock while reading devotional content
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

  if (!isOpen || !item) return null;

  const handleShare = async () => {
    feedback.vibrate(15);
    const result = await shareDevotionalContent({
      title: item.title,
      text: item.vocalizedText || item.description,
      reward: item.virtueReward,
      facet: item.soulFacet,
      source: item.sourceEvidence,
    });
    if (result === 'shared') {
      setShareStatus('shared');
      setTimeout(() => setShareStatus('idle'), 2500);
    } else if (result === 'copied') {
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2500);
    }
  };

  const handleToggle = () => {
    if (onToggleComplete) {
      onToggleComplete(item.id);
      feedback.vibrate([25, 40, 25]);
    }
  };

  const handleTasbeeh = () => {
    if (onLaunchTasbeeh && (item.vocalizedText || item.title)) {
      onLaunchTasbeeh(item.vocalizedText || item.title, item.title);
      onClose();
    }
  };

  return (
    <div
      id="devotional-bottom-sheet-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 transition-opacity"
      onClick={onClose}
    >
      <div
        id="devotional-bottom-sheet-content"
        className="w-full max-w-2xl bg-[var(--bg-surface-raised)] border-t border-x border-[var(--border-hairline)] rounded-t-2xl max-h-[88vh] flex flex-col text-[var(--ink-primary)] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="w-12 h-1.5 bg-[var(--border-strong)] rounded-full mx-auto mt-3 mb-1 shrink-0" />

        {/* Header */}
        <div className="px-5 py-3 border-b border-[var(--border-hairline)] flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {item.categoryLabel && (
                <span className="badge badge--accent">{item.categoryLabel}</span>
              )}
              {item.stageName && (
                <span className="text-xs text-[var(--ink-secondary)]">
                  {item.stageName}
                </span>
              )}
            </div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-[var(--ink-primary)] leading-snug">
              {item.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="btn-close"
            title="إغلاق"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4 text-[var(--ink-secondary)] shrink-0" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Vocalized Main Text if present */}
          {item.vocalizedText && (
            <div className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-center">
              <p className="font-display text-lg sm:text-xl font-bold leading-relaxed text-[var(--accent-ink)] select-all">
                « {item.vocalizedText} »
              </p>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div className="text-sm leading-relaxed text-[var(--ink-primary)]">
              {item.description}
            </div>
          )}

          {/* Virtue & Reward */}
          {item.virtueReward && (
            <div className="flex items-start gap-2.5 p-3 rounded-md bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs sm:text-sm">
              <BookOpen className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-[var(--ink-primary)]">الفضل والأجر الشرعي: </span>
                <span className="text-[var(--ink-secondary)]">{item.virtueReward}</span>
              </div>
            </div>
          )}

          {/* Soul Discipline Facet */}
          {item.soulFacet && (
            <div className="flex items-start gap-2.5 p-3 rounded-md bg-[var(--accent-soft)]/40 border border-[var(--accent-soft)] text-xs sm:text-sm">
              <Heart className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-[var(--accent-ink)]">المقصد التعبدي وتزكية النفس: </span>
                <span className="text-[var(--ink-primary)]">{item.soulFacet}</span>
              </div>
            </div>
          )}

          {/* Hadith / Scholarly Source */}
          {item.sourceEvidence && (
            <div className="text-xs text-[var(--ink-muted)] pt-1 flex items-center gap-1.5">
              <span>📖 التخريج والتوثيق:</span>
              <span className="font-medium">{item.sourceEvidence}</span>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar (Invariant 4: At most ONE .btn--primary) */}
        <div className="px-5 py-3 border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Completion Toggle */}
            {onToggleComplete && (
              <button
                onClick={handleToggle}
                className={`btn text-xs py-1.5 px-3 flex items-center gap-1.5 ${
                  item.isCompleted ? 'border-[var(--success)] text-[var(--success)]' : ''
                }`}
              >
                {item.isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                    <span>تم العمل اليوم</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4 text-[var(--ink-muted)]" />
                    <span>تحديد كمنجز</span>
                  </>
                )}
              </button>
            )}

            {/* Copy button without share icon */}
            <button
              onClick={handleShare}
              className="btn text-xs py-1.5 px-3 flex items-center gap-1.5"
              title="نسخ النص للحافظة"
            >
              {shareStatus === 'copied' || shareStatus === 'shared' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                  <span>تم النسخ للحافظة</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[var(--ink-secondary)]" />
                  <span>نسخ النص</span>
                </>
              )}
            </button>
          </div>

          {/* If repeatable, primary action is launching Tasbeeh */}
          {item.isRepeatable && onLaunchTasbeeh ? (
            <button
              onClick={handleTasbeeh}
              className="btn btn--primary text-xs py-1.5 px-4 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>بدء التسبيح ({item.repeatTarget || 33})</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="btn text-xs py-1.5 px-4"
            >
              إغلاق
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
