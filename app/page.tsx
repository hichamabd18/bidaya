'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ALGERIAN_WILAYAS,
  Coordinates,
  calculatePrayerTimes,
  getHijriDate,
  formatConciseGregorian,
  PrayerTimesResult,
  HijriDate,
} from '@/lib/prayer';
import { PrayerBar } from '@/components/PrayerBar';
import { DailyTimeline } from '@/components/DailyTimeline';
import { HijriSeasons } from '@/components/HijriSeasons';
import { ContextualSunan } from '@/components/ContextualSunan';
import { SpiritualTracker } from '@/components/SpiritualTracker';
import { InteractiveTasbeeh } from '@/components/InteractiveTasbeeh';
import { IOSInstallBanner } from '@/components/IOSInstallBanner';
import {
  Clock,
  Calendar,
  Tag,
  ShieldCheck,
  Sparkles,
  Download,
  X,
  Info,
  BookMarked,
  CheckCircle,
} from 'lucide-react';
import { feedback } from '@/lib/sound';

type ActiveTab = 'timeline' | 'seasons' | 'contextual' | 'tracker';

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);

  // 1. Settings & Persistence (Deterministic defaults for SSR to eliminate hydration mismatch)
  const [selectedLocation, setSelectedLocation] = useState<Coordinates>(ALGERIAN_WILAYAS[15]);
  const [hijriOffset, setHijriOffset] = useState<number>(0);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // 2. Active Tab & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('timeline');
  const [isTasbeehOpen, setIsTasbeehOpen] = useState<boolean>(false);
  const [tasbeehInitialText, setTasbeehInitialText] = useState<string>('');
  const [tasbeehInitialTitle, setTasbeehInitialTitle] = useState<string>('');
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);

  // 3. Habit & Timeline Checklist states
  const [completedTimelineItems, setCompletedTimelineItems] = useState<Record<string, boolean>>({});
  const [dailyHabits, setDailyHabits] = useState<Record<string, boolean>>({});
  const [weeklyHabits, setWeeklyHabits] = useState<Record<string, boolean>>({});

  // Current live date tick
  const [currentDateTime, setCurrentDateTime] = useState<Date>(() => new Date());

  // Mount effect to restore state from localStorage cleanly without hydration error
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      try {
        const savedLoc = localStorage.getItem('algeria_prayer_location');
        if (savedLoc) setSelectedLocation(JSON.parse(savedLoc));

        const savedOffset = localStorage.getItem('hijri_offset_days');
        if (savedOffset) setHijriOffset(parseInt(savedOffset, 10) || 0);

        const savedTheme = localStorage.getItem('theme_dark_mode');
        if (savedTheme !== null) setDarkMode(savedTheme === 'true');

        const savedSound = localStorage.getItem('sound_enabled');
        if (savedSound !== null) setSoundEnabled(savedSound !== 'false');

        const savedDate = localStorage.getItem('daily_checklist_date');
        const todayStr = new Date().toDateString();
        if (savedDate === todayStr) {
          const savedTimeline = localStorage.getItem('completed_timeline_items');
          if (savedTimeline) setCompletedTimelineItems(JSON.parse(savedTimeline));

          const savedDaily = localStorage.getItem('daily_habits_state');
          if (savedDaily) setDailyHabits(JSON.parse(savedDaily));

          const savedWeekly = localStorage.getItem('weekly_habits_state');
          if (savedWeekly) setWeeklyHabits(JSON.parse(savedWeekly));
        }
      } catch (e) {
        console.error('Failed to load saved state from localStorage', e);
      }

      // Register offline PWA service worker
      if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save changes to LocalStorage only after mount
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem('algeria_prayer_location', JSON.stringify(selectedLocation));
      localStorage.setItem('hijri_offset_days', hijriOffset.toString());
      localStorage.setItem('sound_enabled', soundEnabled.toString());
      localStorage.setItem('theme_dark_mode', darkMode.toString());
      localStorage.setItem('daily_checklist_date', new Date().toDateString());
      localStorage.setItem('completed_timeline_items', JSON.stringify(completedTimelineItems));
      localStorage.setItem('daily_habits_state', JSON.stringify(dailyHabits));
      localStorage.setItem('weekly_habits_state', JSON.stringify(weeklyHabits));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [
    isMounted,
    selectedLocation,
    hijriOffset,
    soundEnabled,
    darkMode,
    completedTimelineItems,
    dailyHabits,
    weeklyHabits,
  ]);

  // Dark mode class on html root
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (darkMode) {
        document.documentElement.setAttribute('data-theme', 'night');
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode]);

  // Prayer times computation
  const prayerTimes: PrayerTimesResult = useMemo(() => {
    return calculatePrayerTimes(selectedLocation, currentDateTime);
  }, [selectedLocation, currentDateTime]);

  // Hijri date computation with manual offset
  const hijriDate: HijriDate = useMemo(() => {
    return getHijriDate(currentDateTime, hijriOffset);
  }, [currentDateTime, hijriOffset]);

  const gregorianText = useMemo(() => {
    return formatConciseGregorian(currentDateTime);
  }, [currentDateTime]);

  // Handle GPS location request
  const handleGpsRequest = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const userGps: Coordinates = {
            name: `موقعي الجغرافي (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
            country: 'الجزائر (GPS)',
            latitude: lat,
            longitude: lng,
            timezone: 1, // Algeria UTC+1 default
          };
          setSelectedLocation(userGps);
          feedback.playTargetComplete(soundEnabled);
          feedback.vibrate([30, 40, 30]);
        },
        () => {
          alert('تعذر جلب موقع GPS. يرجى اختيار ولايتك يدوياً من القائمة.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, [soundEnabled]);

  // Toggle checklist item in timeline
  const handleToggleTimelineItem = (id: string) => {
    setCompletedTimelineItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle daily habit
  const handleToggleDailyHabit = (name: string) => {
    setDailyHabits((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Toggle weekly habit
  const handleToggleWeeklyHabit = (key: string) => {
    setWeeklyHabits((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Manual reset of today's habits
  const handleResetToday = () => {
    if (confirm('هل ترغب في إعادة ضبط علامات اليوم لتبدأ من جديد؟')) {
      setDailyHabits({});
      setCompletedTimelineItems({});
      feedback.vibrate(50);
    }
  };

  // Send a specific dhikr or dua to the interactive Tasbeeh
  const handleSendToTasbeeh = (text: string, title: string) => {
    setTasbeehInitialText(text);
    setTasbeehInitialTitle(title);
    setIsTasbeehOpen(true);
    feedback.vibrate(30);
  };

  return (
    <div
      id="prophetic-day-app"
      className="min-h-screen bg-[var(--bg-page)] text-[var(--ink-primary)] flex flex-col font-ui antialiased transition-colors"
    >
      {/* iOS Safari Installation Prompt */}
      <IOSInstallBanner />

      {/* 1. Global Prayer, Date & Geolocation Header */}
      <PrayerBar
        prayerTimes={prayerTimes}
        hijriDate={hijriDate}
        gregorianText={gregorianText}
        currentLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        onGpsRequest={handleGpsRequest}
        hijriOffset={hijriOffset}
        onOffsetChange={(delta) => setHijriOffset((prev) => Math.max(-2, Math.min(2, prev + delta)))}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onOpenTasbeeh={() => {
          setTasbeehInitialText('');
          setTasbeehInitialTitle('');
          setIsTasbeehOpen(true);
        }}
      />

      {/* 2. Desktop Navigation Tabs Ribbon (Visible on md+ screens) */}
      <nav
        id="main-tabs-navigation"
        className="hidden md:block sticky top-0 z-20 bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-hairline)] transition-colors shadow-2xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 py-2.5">
            <div className="flex items-center bg-[var(--bg-surface-raised)] border border-[var(--border-hairline)] rounded-xl p-1 gap-1 shadow-2xs">
              {/* Tab 1: Daily Timeline */}
              <button
                id="tab-btn-timeline"
                onClick={() => {
                  setActiveTab('timeline');
                  feedback.vibrate(15);
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm transition-all rounded-lg ${
                  activeTab === 'timeline'
                    ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)] font-bold shadow-2xs'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                <Clock className="w-4 h-4 text-[var(--accent)]" />
                <span>المسار الزمني لليوم والليلة</span>
              </button>

              {/* Tab 2: Hijri Seasons */}
              <button
                id="tab-btn-seasons"
                onClick={() => {
                  setActiveTab('seasons');
                  feedback.vibrate(15);
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm transition-all rounded-lg ${
                  activeTab === 'seasons'
                    ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)] font-bold shadow-2xs'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                <Calendar className="w-4 h-4 text-[var(--accent)]" />
                <span>وظائف الشهور والتقويم الهجري</span>
              </button>

              {/* Tab 3: Contextual Sunan */}
              <button
                id="tab-btn-contextual"
                onClick={() => {
                  setActiveTab('contextual');
                  feedback.vibrate(15);
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm transition-all rounded-lg ${
                  activeTab === 'contextual'
                    ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)] font-bold shadow-2xs'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                <Tag className="w-4 h-4 text-[var(--accent)]" />
                <span>المناسبات والأحوال العارضة</span>
              </button>

              {/* Tab 4: Spiritual Tracker */}
              <button
                id="tab-btn-tracker"
                onClick={() => {
                  setActiveTab('tracker');
                  feedback.vibrate(15);
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm transition-all rounded-lg ${
                  activeTab === 'tracker'
                    ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)] font-bold shadow-2xs'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
                <span>المعين الإيماني ومتتبع السنن</span>
              </button>
            </div>

            {/* Offline Single-File PWA Download Action */}
            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={() => setShowDownloadModal(true)}
                className="btn btn--primary text-xs py-2 px-3.5 rounded-xl shadow-xs"
                title="تصدير وتحميل التطبيق كملف HTML منفرد بدون إنترنت (100% Offline PWA)"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تحميل كملف PWA مستقل</span>
                <span className="sm:hidden">ملف PWA</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 3. Main Body Container with safe bottom padding for mobile navigation */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-6 pb-28 md:pb-12">
        {activeTab === 'timeline' && (
          <DailyTimeline
            activeStageId={prayerTimes.activeTimelineStageId}
            soundEnabled={soundEnabled}
            completedItems={completedTimelineItems}
            onToggleItem={handleToggleTimelineItem}
            onSendToTasbeeh={handleSendToTasbeeh}
          />
        )}

        {activeTab === 'seasons' && (
          <HijriSeasons
            currentHijriDate={hijriDate}
            onSendToTasbeeh={handleSendToTasbeeh}
          />
        )}

        {activeTab === 'contextual' && (
          <ContextualSunan onSendToTasbeeh={handleSendToTasbeeh} />
        )}

        {activeTab === 'tracker' && (
          <SpiritualTracker
            dailyHabits={dailyHabits}
            onToggleHabit={handleToggleDailyHabit}
            weeklyHabits={weeklyHabits}
            onToggleWeeklyHabit={handleToggleWeeklyHabit}
            soundEnabled={soundEnabled}
            onResetToday={handleResetToday}
          />
        )}
      </main>

      {/* 4. Footer */}
      <footer className="bg-[var(--bg-surface)] border-t border-[var(--border-hairline)] py-6 text-center text-xs text-[var(--ink-secondary)] space-y-2 mb-16 md:mb-0 transition-colors">
        <div className="max-w-4xl mx-auto px-4">
          <p className="font-semibold text-[var(--ink-primary)] font-display text-sm">
            اليوم النبوي ووظائف العام - الدليل الشامل للاقتداء والتعبد وتزكية النفس
          </p>
          <p className="text-[11px] mt-1 text-[var(--ink-secondary)]">
            مبني على أمهات كتب السنة: المنح العلية للفريح • مختصر لطائف المعارف لابن رجب • اليوم النبوي للطريري • أنيس المتعبد للأسطل • بداية الهداية للغزالي • الدعوات والأذكار للسعد
          </p>
          <div className="pt-2 text-[10px] text-[var(--ink-muted)] flex items-center justify-center gap-2">
            <span>مواقيت دقيقة لـ 58 ولاية جزائرية</span>
            <span>•</span>
            <button
              onClick={() => setShowDownloadModal(true)}
              className="text-[var(--accent-ink)] underline font-medium hover:opacity-80"
            >
              تصدير كملف PWA مستقل بدون إنترنت
            </button>
          </div>
        </div>
      </footer>

      {/* 5. Mobile Ergonomic Bottom Navigation Bar (Visible only on mobile screens) */}
      <nav
        id="mobile-bottom-navigation"
        className="bottom-nav md:hidden transition-colors"
        aria-label="التنقل الرئيسي للهاتف"
      >
        <div className="grid grid-cols-5 items-center max-w-md mx-auto px-2 pt-1 pb-0.5">
          {/* Tab 1: Timeline */}
          <button
            id="mobile-nav-timeline"
            onClick={() => {
              setActiveTab('timeline');
              feedback.vibrate(15);
            }}
            className={`nav-icon ${activeTab === 'timeline' ? 'nav-icon--active' : ''}`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[10px] mt-1 leading-none font-medium">المسار</span>
          </button>

          {/* Tab 2: Seasons */}
          <button
            id="mobile-nav-seasons"
            onClick={() => {
              setActiveTab('seasons');
              feedback.vibrate(15);
            }}
            className={`nav-icon ${activeTab === 'seasons' ? 'nav-icon--active' : ''}`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] mt-1 leading-none font-medium">المواسم</span>
          </button>

          {/* Center Elevated Button: Floating Tasbeeh for Mobile Thumb */}
          <div className="flex flex-col items-center justify-center -mt-6 relative z-10">
            <button
              id="mobile-nav-tasbeeh-fab"
              onClick={() => {
                setTasbeehInitialText('');
                setTasbeehInitialTitle('');
                setIsTasbeehOpen(true);
                feedback.vibrate(25);
              }}
              className="w-13 h-13 rounded-full bg-gradient-to-tr from-[var(--accent)] to-[#c59546] text-white flex items-center justify-center shadow-lg border-2 border-[var(--bg-surface)] active:scale-95 transition-transform"
              title="المسبحة الإلكترونية"
              aria-label="المسبحة الإلكترونية"
            >
              <Sparkles className="w-6 h-6" />
            </button>
            <span className="text-[10px] font-bold text-[var(--accent-ink)] mt-0.5 leading-none">المسبحة</span>
          </div>

          {/* Tab 3: Contextual Sunan */}
          <button
            id="mobile-nav-contextual"
            onClick={() => {
              setActiveTab('contextual');
              feedback.vibrate(15);
            }}
            className={`nav-icon ${activeTab === 'contextual' ? 'nav-icon--active' : ''}`}
          >
            <Tag className="w-5 h-5" />
            <span className="text-[10px] mt-1 leading-none font-medium">المناسبات</span>
          </button>

          {/* Tab 4: Tracker */}
          <button
            id="mobile-nav-tracker"
            onClick={() => {
              setActiveTab('tracker');
              feedback.vibrate(15);
            }}
            className={`nav-icon ${activeTab === 'tracker' ? 'nav-icon--active' : ''}`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] mt-1 leading-none font-medium">المعين</span>
          </button>
        </div>
      </nav>

      {/* 6. Floating Tasbeeh for Desktop Screens */}
      <button
        id="floating-tasbeeh-fab"
        onClick={() => {
          setTasbeehInitialText('');
          setTasbeehInitialTitle('');
          setIsTasbeehOpen(true);
        }}
        className="hidden md:flex fixed bottom-6 left-6 z-40 bg-[var(--bg-surface-raised)] text-[var(--accent-ink)] p-3.5 rounded-full shadow-lg border border-[var(--border-hairline)] hover:border-[var(--accent)] active:scale-95 transition-all items-center justify-center gap-2 group"
        title="فتح المسبحة الإلكترونية"
      >
        <Sparkles className="w-5 h-5 text-[var(--accent)] group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-bold hidden md:inline">
          المسبحة
        </span>
      </button>

      {/* Interactive Tasbeeh Modal */}
      <InteractiveTasbeeh
        isOpen={isTasbeehOpen}
        initialText={tasbeehInitialText}
        initialTitle={tasbeehInitialTitle}
        onClose={() => setIsTasbeehOpen(false)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
      />

      {/* Single-File PWA Download / Export Modal */}
      {showDownloadModal && (
        <div
          id="pwa-download-modal"
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setShowDownloadModal(false)}
        >
          <div
            className="bg-[var(--bg-surface-raised)] border border-[var(--border-hairline)] rounded-2xl w-full max-w-lg text-[var(--ink-primary)] shadow-xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="font-bold text-base font-display text-[var(--ink-primary)]">
                  تحميل نسخة ملف واحد مستقلة (Single-File Offline PWA)
                </h3>
              </div>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="btn-close"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4 text-[var(--ink-secondary)] shrink-0" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-[var(--ink-secondary)] leading-relaxed">
              <p>
                تم إعداد هذا التطبيق ليعمل كـ <strong>ملف واحد متكامل (Single-file executable `index.html`)</strong> يحتوي على كامل المحتوى الموسوعي، ومحرك حساب مواقيت الصلاة الفلكي للـ 58 ولاية جزائرية، والمسبحة التفاعلية، ومتتبع العادات، دون الحاجة لأي خادم أو اتصال بالإنترنت.
              </p>
              <div className="bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border-hairline)] text-xs space-y-1">
                <div className="font-bold text-[var(--ink-primary)]">مزايا النسخة المستقلة:</div>
                <div>• تعمل مباشرة بمجرد النقر عليها مرتين في أي متصفح (Chrome, Firefox, Safari, Edge).</div>
                <div>• تدعم التثبيت الفوري كـ تطبيق هاتف أو حاسوب عبر ميزة Add to Home Screen (PWA).</div>
                <div>• تحفظ بيانات متتبع العادات والمسبحة والموقع في LocalStorage الخاص بجهازك بأمان تام.</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-[var(--border-hairline)]">
              <a
                href="/index.html"
                download="اليوم-النبوي-ووظائف-العام.html"
                className="btn btn--primary w-full sm:w-auto text-xs py-2 px-4 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>تحميل ملف HTML الآن (100% Offline)</span>
              </a>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="btn w-full sm:w-auto text-xs py-2 px-4"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
