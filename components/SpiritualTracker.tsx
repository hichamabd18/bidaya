'use client';

import React, { useState } from 'react';
import {
  MODULE_4_SOUL_RULES,
  MODULE_4_DHIKR_RULES,
  HABIT_DAILY_INDICATORS,
  HABIT_WEEKLY_MILESTONES,
  HABIT_MONTHLY_MILESTONES,
  SoulRule,
  DhikrRule,
  HabitItem,
} from '@/lib/data';
import {
  Check,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { feedback } from '@/lib/sound';

interface SpiritualTrackerProps {
  dailyHabits: Record<string, boolean>;
  onToggleHabit: (habitName: string) => void;
  weeklyHabits: Record<string, boolean>;
  onToggleWeeklyHabit: (key: string) => void;
  soundEnabled: boolean;
  onResetToday: () => void;
}

export const SpiritualTracker: React.FC<SpiritualTrackerProps> = ({
  dailyHabits,
  onToggleHabit,
  weeklyHabits,
  onToggleWeeklyHabit,
  onResetToday,
}) => {
  const [activeSection, setActiveSection] = useState<'tracker' | 'rules' | 'dhikr_rules'>('tracker');
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({});

  const totalDaily = HABIT_DAILY_INDICATORS.length;
  const completedDaily = HABIT_DAILY_INDICATORS.filter(
    (h) => dailyHabits[h.habit_name]
  ).length;
  const dailyRate = totalDaily > 0 ? Math.round((completedDaily / totalDaily) * 100) : 0;

  const toggleRule = (id: string) => {
    setExpandedRules((prev) => ({ ...prev, [id]: !prev[id] }));
    feedback.vibrate(12);
  };

  return (
    <section id="spiritual-tracker-section" className="space-y-4">
      {/* 1. Header & Section Navigation */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl p-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--accent)] shrink-0" />
              <h2 className="font-display font-bold text-base sm:text-lg text-[var(--ink-primary)]">
                المعين الإيماني: فقه التعبد وسياسة النفس ومتتبع السنن
              </h2>
            </div>
            <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
              منظومة تربوية مستخلصة من «أنيس المتعبد»، «بداية الهداية»، وقواعد ابن القيم والنووي.
            </p>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-1 shrink-0 text-xs">
            <button
              onClick={() => {
                setActiveSection('tracker');
                feedback.vibrate(12);
              }}
              className={`btn py-1 px-3 text-xs ${
                activeSection === 'tracker'
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)] font-bold border-[var(--accent)]'
                  : 'text-[var(--ink-secondary)]'
              }`}
            >
              متتبع العادات
            </button>
            <button
              onClick={() => {
                setActiveSection('rules');
                feedback.vibrate(12);
              }}
              className={`btn py-1 px-3 text-xs ${
                activeSection === 'rules'
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)] font-bold border-[var(--accent)]'
                  : 'text-[var(--ink-secondary)]'
              }`}
            >
              أصول التعبد ({MODULE_4_SOUL_RULES.length})
            </button>
            <button
              onClick={() => {
                setActiveSection('dhikr_rules');
                feedback.vibrate(12);
              }}
              className={`btn py-1 px-3 text-xs ${
                activeSection === 'dhikr_rules'
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)] font-bold border-[var(--accent)]'
                  : 'text-[var(--ink-secondary)]'
              }`}
            >
              فقه الأذكار ({MODULE_4_DHIKR_RULES.length})
            </button>
          </div>
        </div>

        {/* Daily Progress Tracker bar if on tracker view */}
        {activeSection === 'tracker' && (
          <div className="mt-3 pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[var(--ink-secondary)]">مؤشر الإنجاز الإيماني لليوم:</span>
                <span className="font-bold text-[var(--ink-primary)] tabular">
                  {completedDaily} من {totalDaily} عمل ({dailyRate}%)
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${dailyRate}%` }} />
              </div>
            </div>

            <button
              onClick={() => {
                if (confirm('هل تريد تصفير متتبع اليوم والبدء من جديد؟')) {
                  onResetToday();
                  feedback.vibrate(25);
                }
              }}
              className="btn py-1 px-2.5 text-xs text-[var(--ink-secondary)] shrink-0 flex items-center gap-1"
              title="تصفير قائمة اليوم"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تصفير اليوم</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Main Tab Contents */}
      {activeSection === 'tracker' && (
        <div className="space-y-4">
          {/* Daily Habits (Row list) */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[var(--border-hairline)] flex items-center justify-between">
              <h3 className="font-display font-bold text-xs sm:text-sm text-[var(--ink-primary)]">
                الورد والسنن اليومية الثابتة ({totalDaily})
              </h3>
              <span className="text-[11px] text-[var(--ink-secondary)] tabular">
                {completedDaily}/{totalDaily} منجز
              </span>
            </div>

            <div className="row-list">
              {HABIT_DAILY_INDICATORS.map((habit) => {
                const isChecked = Boolean(dailyHabits[habit.habit_name]);
                return (
                  <div
                    key={habit.habit_name}
                    className="row-item cursor-pointer px-4 hover:bg-[var(--bg-surface-raised)]"
                    onClick={() => {
                      onToggleHabit(habit.habit_name);
                      feedback.vibrate(isChecked ? 12 : [25, 40, 25]);
                    }}
                  >
                    <button
                      type="button"
                      className={`row-item__check ${
                        isChecked ? 'row-item__check--done' : ''
                      }`}
                      aria-label={habit.habit_name}
                    >
                      {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </button>

                    <div className="row-item__body">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`row-item__title ${
                            isChecked ? 'row-item__title--done' : ''
                          }`}
                        >
                          {habit.habit_name}
                        </span>
                        <span className="badge text-[10px] tabular bg-[var(--bg-surface-raised)] border border-[var(--border-hairline)]">
                          {habit.target}
                        </span>
                      </div>
                      <span className="row-item__meta">{habit.evaluation_criterion}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Milestones */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[var(--border-hairline)]">
              <h3 className="font-display font-bold text-xs sm:text-sm text-[var(--ink-primary)]">
                المحطات التعبدية الأسبوعية
              </h3>
            </div>

            <div className="space-y-3 p-4">
              {HABIT_WEEKLY_MILESTONES.map((habit) => (
                <div key={habit.milestone} className="border border-[var(--border-hairline)] rounded-lg p-3 bg-[var(--bg-surface-raised)]">
                  <h4 className="font-display font-bold text-xs sm:text-sm text-[var(--accent-ink)] mb-2">
                    {habit.milestone}
                  </h4>
                  <div className="space-y-1.5">
                    {habit.checklist.map((item) => {
                      const isChecked = Boolean(weeklyHabits[item]);
                      return (
                        <div
                          key={item}
                          onClick={() => {
                            onToggleWeeklyHabit(item);
                            feedback.vibrate(isChecked ? 12 : [25, 40, 25]);
                          }}
                          className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-[var(--bg-surface)] text-xs"
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isChecked
                                ? 'bg-[var(--success)] border-[var(--success)]'
                                : 'border-[var(--border-strong)]'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                          </div>
                          <span className={isChecked ? 'line-through text-[var(--ink-muted)]' : 'text-[var(--ink-primary)]'}>
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Milestones */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[var(--border-hairline)]">
              <h3 className="font-display font-bold text-xs sm:text-sm text-[var(--ink-primary)]">
                المعالم الشهرية لتزكية النفس
              </h3>
            </div>

            <div className="row-list">
              {HABIT_MONTHLY_MILESTONES.map((habit) => (
                <div key={habit.milestone} className="row-item px-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0 mt-2" />
                  <div className="row-item__body">
                    <span className="row-item__title">{habit.milestone}</span>
                    <span className="row-item__meta">{habit.goal}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Soul Rules View (أصول سياسة النفس السبعة) */}
      {activeSection === 'rules' && (
        <div className="space-y-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl p-4 text-xs text-[var(--ink-secondary)]">
            <strong>الأصول السبعة في فقه التعبد وسياسة النفس:</strong> قواعد عملية مأخوذة من «أنيس المتعبد» وفقه الغزالي وابن القيم في التدرج ومجاهدة النفس وحفظ الاستقامة.
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl overflow-hidden">
            <div className="row-list">
              {MODULE_4_SOUL_RULES.map((rule) => {
                const isExpanded = Boolean(expandedRules[rule.rule_id]);
                return (
                  <div key={rule.rule_id} className="border-b border-[var(--border-hairline)]">
                    <div
                      onClick={() => toggleRule(rule.rule_id)}
                      className="row-item cursor-pointer px-4 hover:bg-[var(--bg-surface-raised)] border-b-0"
                    >
                      <span className="font-mono text-xs font-bold text-[var(--accent-ink)] shrink-0 tabular">
                        {rule.rule_id}
                      </span>
                      <div className="row-item__body">
                        <span className="row-item__title">{rule.title}</span>
                        <p className="row-item__meta line-clamp-1">{rule.rule_content}</p>
                      </div>
                      <div className="btn p-1 text-[var(--ink-muted)] border-none">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 py-3.5 bg-[var(--bg-surface-raised)] border-t border-[var(--border-hairline)] text-xs space-y-2">
                        <p className="text-[var(--ink-primary)] leading-relaxed">
                          {rule.rule_content}
                        </p>
                        <div className="p-3 rounded-md bg-[var(--accent-soft)]/40 border border-[var(--accent-soft)]">
                          <strong className="text-[var(--accent-ink)]">التطبيق في سياسة النفس: </strong>
                          <span className="text-[var(--ink-primary)]">{rule.soul_governance_application}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. Dhikr Rules View (قواعد فقه الأذكار) */}
      {activeSection === 'dhikr_rules' && (
        <div className="space-y-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl p-4 text-xs text-[var(--ink-secondary)]">
            <strong>قواعد ابن القيم والنووي في فقه الأذكار:</strong> ضوابط شرعية لتذوق حلاوة الذكر وحضور القلب، ومراعاة الأعداد والجمع بين السر والجهر.
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl overflow-hidden">
            <div className="row-list">
              {MODULE_4_DHIKR_RULES.map((rule) => {
                const isExpanded = Boolean(expandedRules[rule.rule_id]);
                return (
                  <div key={rule.rule_id} className="border-b border-[var(--border-hairline)]">
                    <div
                      onClick={() => toggleRule(rule.rule_id)}
                      className="row-item cursor-pointer px-4 hover:bg-[var(--bg-surface-raised)] border-b-0"
                    >
                      <span className="font-mono text-xs font-bold text-[var(--accent-ink)] shrink-0 tabular">
                        {rule.rule_id}
                      </span>
                      <div className="row-item__body">
                        <span className="row-item__title">{rule.title}</span>
                        <p className="row-item__meta line-clamp-1">{rule.content}</p>
                      </div>
                      <div className="btn p-1 text-[var(--ink-muted)] border-none">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 py-3.5 bg-[var(--bg-surface-raised)] border-t border-[var(--border-hairline)] text-xs space-y-2">
                        <p className="text-[var(--ink-primary)] leading-relaxed">
                          {rule.content}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
