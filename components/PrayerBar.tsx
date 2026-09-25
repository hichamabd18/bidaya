'use client';

import React, { useState } from 'react';
import {
  ALGERIAN_WILAYAS,
  MAJOR_ISLAMIC_CITIES,
  Coordinates,
  PrayerTimesResult,
  HijriDate,
} from '@/lib/prayer';
import {
  MapPin,
  Compass,
  Clock,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Sparkles,
  Calendar,
  X,
  Search,
  Settings,
  Sliders,
  MoonStar,
} from 'lucide-react';

interface PrayerBarProps {
  prayerTimes: PrayerTimesResult;
  hijriDate: HijriDate;
  gregorianText: string;
  currentLocation: Coordinates;
  onLocationChange: (loc: Coordinates) => void;
  onGpsRequest: () => void;
  hijriOffset: number;
  onOffsetChange: (delta: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenTasbeeh: () => void;
}

export const PrayerBar: React.FC<PrayerBarProps> = ({
  prayerTimes,
  hijriDate,
  gregorianText,
  currentLocation,
  onLocationChange,
  onGpsRequest,
  hijriOffset,
  onOffsetChange,
  soundEnabled,
  onToggleSound,
  darkMode,
  onToggleDarkMode,
  onOpenTasbeeh,
}) => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRibbonExpanded, setIsRibbonExpanded] = useState(false);

  const prayersList = [
    { key: 'imsak', name: 'الإمساك', time: prayerTimes.imsak, icon: '🌙' },
    { key: 'fajr', name: 'الفجر', time: prayerTimes.fajr, icon: '🌅' },
    { key: 'sunrise', name: 'الشروق', time: prayerTimes.sunrise, icon: '☀️' },
    { key: 'dhuhr', name: 'الظهر', time: prayerTimes.dhuhr, icon: '☀️' },
    { key: 'asr', name: 'العصر', time: prayerTimes.asr, icon: '🌤️' },
    { key: 'maghrib', name: 'المغرب', time: prayerTimes.maghrib, icon: '🌇' },
    { key: 'isha', name: 'العشاء', time: prayerTimes.isha, icon: '🌌' },
    { key: 'lastThird', name: 'ثلث الليل', time: prayerTimes.lastThird, icon: '✨' },
  ];

  const filteredWilayas = ALGERIAN_WILAYAS.filter((w) =>
    w.name.includes(searchQuery)
  );
  const filteredIslamic = MAJOR_ISLAMIC_CITIES.filter(
    (c) => c.name.includes(searchQuery) || c.country.includes(searchQuery)
  );

  return (
    <header
      id="prayer-header-bar"
      className="bg-[var(--bg-surface)] text-[var(--ink-primary)] border-b border-[var(--border-hairline)] relative z-30 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-3.5 py-3 sm:px-6">
        {/* Top App Bar with Brand, Location & Quick Controls */}
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Location Pill */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8.5 h-8.5 rounded-lg bg-[var(--accent-soft)] text-[var(--accent-ink)] flex items-center justify-center shrink-0 border border-[var(--border-hairline)] shadow-2xs">
              <MoonStar className="w-5 h-5 text-[var(--accent-ink)] shrink-0" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base leading-tight truncate text-[var(--ink-primary)] font-display">
                  اليوم النبوي ووظائف العام
                </h1>
                <span className="badge badge--accent hidden sm:inline-block">
                  دليل التعبد
                </span>
              </div>
              {/* Location Pill */}
              <button
                id="btn-open-location-compact"
                onClick={() => setShowLocationModal(true)}
                className="flex items-center gap-1.5 text-xs text-[var(--ink-secondary)] hover:text-[var(--accent-ink)] transition-colors mt-0.5"
                title="تغيير الولاية / المدينة"
              >
                <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-[200px] font-medium underline underline-offset-2">
                  {currentLocation.name}
                </span>
              </button>
            </div>
          </div>

          {/* Action Tools: Grouped in ONE clean settings cluster + Tasbeeh */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Unified Settings Cluster - All settings in one place */}
            <div
              id="header-settings-cluster"
              className="flex items-center bg-[var(--bg-surface-raised)] border border-[var(--border-hairline)] rounded-lg p-0.5 gap-0.5 shadow-2xs"
            >
              {/* GPS Locate Button */}
              <button
                id="btn-gps-locate"
                onClick={onGpsRequest}
                className="btn-icon"
                title="تحديد الموقع عبر GPS"
                aria-label="تحديد الموقع عبر GPS"
              >
                <Compass className="w-4 h-4 text-[var(--accent)] shrink-0" />
              </button>

              {/* Audio Toggle */}
              <button
                id="btn-audio-toggle"
                onClick={onToggleSound}
                className="btn-icon"
                title={soundEnabled ? 'كتم الصوت' : 'تفعيل المؤثرات الصوتية'}
                aria-label="تبديل الصوت"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[var(--accent)] shrink-0" />
                ) : (
                  <VolumeX className="w-4 h-4 text-[var(--ink-muted)] shrink-0" />
                )}
              </button>

              {/* Theme Toggle */}
              <button
                id="btn-theme-toggle"
                onClick={onToggleDarkMode}
                className="btn-icon"
                title={darkMode ? 'الوضع المضيء (ورق مخطوطة)' : 'الوضع الليلي (سماء هادئة)'}
                aria-label="تبديل المظهر"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 text-[var(--accent)] shrink-0" />
                ) : (
                  <Moon className="w-4 h-4 text-[var(--ink-secondary)] shrink-0" />
                )}
              </button>

              {/* App Settings Modal Button */}
              <button
                id="btn-settings-toggle"
                onClick={() => setShowSettingsModal(true)}
                className="btn-icon relative"
                title="لوحة الإعدادات الشاملة ومعايرة الرؤية"
                aria-label="إعدادات التطبيق"
              >
                <Settings className="w-4 h-4 text-[var(--ink-secondary)] shrink-0" />
                {hijriOffset !== 0 && (
                  <span className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                )}
              </button>
            </div>

            {/* Tasbeeh Quick Launch Button */}
            <button
              id="btn-quick-tasbeeh"
              onClick={onOpenTasbeeh}
              className="btn btn--primary text-xs py-1.5 px-3 h-8.5 rounded-lg flex items-center gap-1.5 shrink-0 shadow-xs"
              title="المسبحة الإلكترونية"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">المسبحة</span>
            </button>
          </div>
        </div>

        {/* Date Row with Hijri adjustment */}
        <div className="mt-2.5 pt-2 border-t border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-2 text-xs" suppressHydrationWarning>
          <div className="flex items-center gap-2" suppressHydrationWarning>
            <div className="flex items-center gap-1.5 text-[var(--ink-primary)]" suppressHydrationWarning>
              <Calendar className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
              <span className="font-display text-sm font-bold" suppressHydrationWarning>
                {hijriDate.formattedText}
              </span>
            </div>
            {hijriDate.isWhiteDay && (
              <span className="badge badge--accent" suppressHydrationWarning>الأيام البيض</span>
            )}
            {hijriDate.isFastingDay && (
              <span className="badge badge--success" suppressHydrationWarning>صيام مسنون</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[var(--ink-secondary)] text-[11px] bg-[var(--bg-surface-raised)] px-2 py-0.5 rounded-md border border-[var(--border-hairline)]" suppressHydrationWarning>
            <button
              id="btn-open-settings-date"
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-1 hover:text-[var(--accent-ink)] transition-colors cursor-pointer"
              title="فتح لوحة إعدادات الرؤية"
            >
              <Sliders className="w-3 h-3 text-[var(--accent)]" />
              <span>الرؤية:</span>
            </button>
            <button
              id="btn-offset-minus"
              onClick={() => onOffsetChange(-1)}
              disabled={hijriOffset <= -2}
              className="btn py-0 px-1.5 text-[10px] min-w-[20px] h-5 rounded disabled:opacity-30"
              title="إنقاص يوم"
            >
              -
            </button>
            <span className="tabular font-bold text-[var(--ink-primary)] px-0.5" suppressHydrationWarning>
              {hijriOffset > 0 ? `+${hijriOffset}` : hijriOffset}
            </span>
            <button
              id="btn-offset-plus"
              onClick={() => onOffsetChange(1)}
              disabled={hijriOffset >= 2}
              className="btn py-0 px-1.5 text-[10px] min-w-[20px] h-5 rounded disabled:opacity-30"
              title="زيادة يوم"
            >
              +
            </button>
          </div>
        </div>

        {/* Hero Moment: Next Prayer Countdown (Modern Islamic Timepiece Card) */}
        <div className="hero-prayer my-3 relative overflow-hidden" suppressHydrationWarning>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right relative z-10">
            {/* Next Prayer Label & Location */}
            <div className="space-y-1">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/15 text-[var(--accent-ink)] text-xs font-semibold"
                suppressHydrationWarning
              >
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                <span className="hero-prayer__label mb-0" suppressHydrationWarning>
                  الوقت المتبقي لصلاة {prayerTimes.nextPrayer}
                </span>
              </div>
              <div className="text-xs text-[var(--ink-secondary)]">
                مواقيت موثوقة لولاية <span className="font-semibold text-[var(--ink-primary)]">{currentLocation.name}</span>
              </div>
            </div>

            {/* Countdown Digits */}
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-[var(--ink-secondary)] hidden xs:inline">المتبقي:</span>
              <div className="hero-prayer__time tabular tracking-tight" suppressHydrationWarning>
                {prayerTimes.timeToNext}
              </div>
            </div>
          </div>
        </div>

        {/* Prayer Times Strip (Responsive: Horizontal scroll-snap on Mobile, 8-column grid on Desktop) */}
        <div
          className="time-strip grid grid-flow-col auto-cols-[minmax(72px,1fr)] sm:grid-flow-row sm:grid-cols-4 md:grid-cols-8 gap-2 overflow-x-auto sm:overflow-x-visible pb-1 sm:pb-0 snap-x snap-mandatory"
          suppressHydrationWarning
        >
          {prayersList.map((p) => {
            const isNext = prayerTimes.nextPrayer === p.name;
            return (
              <div
                key={p.key}
                className={`time-pill snap-start flex flex-col justify-center ${
                  isNext ? 'time-pill--current ring-2 ring-[var(--accent)]' : 'hover:border-[var(--accent)]/50'
                }`}
                suppressHydrationWarning
              >
                <div className="text-base sm:text-lg mb-0.5" aria-hidden="true">{p.icon}</div>
                <span className="time-pill__name font-medium" suppressHydrationWarning>{p.name}</span>
                <span className="time-pill__value tabular font-bold text-xs sm:text-sm" suppressHydrationWarning>{p.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Location Selection Modal (Bottom-Sheet on Mobile, Modal on Desktop) */}
      {showLocationModal && (
        <div
          id="location-modal"
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowLocationModal(false)}
        >
          <div
            className="bg-[var(--bg-surface-raised)] border border-[var(--border-hairline)] rounded-t-2xl sm:rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col text-[var(--ink-primary)] shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Drag Handle indicator for mobile */}
            <div className="sm:hidden w-12 h-1 bg-[var(--border-strong)] rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

            {/* Modal Header */}
            <div className="p-4 border-b border-[var(--border-hairline)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="font-bold text-base text-[var(--ink-primary)] font-display">
                  تحديد الموقع لحساب أوقات الصلاة
                </h3>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="btn-close"
                aria-label="إغلاق نافذة الموقع"
              >
                <X className="w-4 h-4 text-[var(--ink-secondary)] shrink-0" />
              </button>
            </div>

            {/* GPS Quick Button & Search Input */}
            <div className="p-3 border-b border-[var(--border-hairline)] space-y-2 bg-[var(--bg-surface)]">
              <button
                onClick={() => {
                  onGpsRequest();
                  setShowLocationModal(false);
                }}
                className="btn btn--primary w-full text-xs py-2"
              >
                <Compass className="w-4 h-4" />
                <span>تحديد موقعي التلقائي عبر GPS</span>
              </button>

              <div className="relative">
                <Search className="w-4 h-4 text-[var(--ink-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن ولاية جزائرية أو مدينة..."
                  className="w-full bg-[var(--bg-surface-raised)] border border-[var(--border-hairline)] rounded-md pr-9 pl-3 py-2 text-xs text-[var(--ink-primary)] placeholder-[var(--ink-muted)] focus:outline-none focus:border-[var(--accent)]"
                  autoFocus
                />
              </div>
            </div>

            {/* Wilayas & Cities List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Algerian Wilayas Section */}
              <div>
                <h4 className="text-xs font-semibold text-[var(--ink-secondary)] mb-2 flex items-center gap-1.5">
                  <span>الولايات الجزائرية (58 ولاية)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {filteredWilayas.map((wilaya) => (
                    <button
                      key={wilaya.name}
                      onClick={() => {
                        onLocationChange(wilaya);
                        setShowLocationModal(false);
                      }}
                      className={`text-right px-2.5 py-2 rounded-md text-xs transition-all border ${
                        currentLocation.name === wilaya.name
                          ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)] font-bold border-[var(--accent)]'
                          : 'bg-[var(--bg-surface)] text-[var(--ink-primary)] border-[var(--border-hairline)] hover:border-[var(--accent)]'
                      }`}
                    >
                      {wilaya.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Major Islamic Cities Section */}
              <div>
                <h4 className="text-xs font-semibold text-[var(--ink-secondary)] mb-2 flex items-center gap-1.5">
                  <span>عواصم ومدن إسلامية كبرى</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {filteredIslamic.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => {
                        onLocationChange(city);
                        setShowLocationModal(false);
                      }}
                      className={`text-right px-2.5 py-2 rounded-md text-xs transition-all border ${
                        currentLocation.name === city.name
                          ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)] font-bold border-[var(--accent)]'
                          : 'bg-[var(--bg-surface)] text-[var(--ink-primary)] border-[var(--border-hairline)] hover:border-[var(--accent)]'
                      }`}
                    >
                      <div>{city.name}</div>
                      <div className="text-[10px] text-[var(--ink-muted)]">
                        {city.country}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[var(--border-hairline)] flex justify-end">
              <button
                onClick={() => setShowLocationModal(false)}
                className="btn text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Unified App Settings Modal */}
      {showSettingsModal && (
        <div
          id="app-settings-modal"
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowSettingsModal(false)}
        >
          <div
            className="bg-[var(--bg-surface-raised)] border border-[var(--border-hairline)] rounded-t-2xl sm:rounded-xl w-full max-w-md max-h-[88vh] flex flex-col text-[var(--ink-primary)] shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Drag Handle indicator for mobile */}
            <div className="sm:hidden w-12 h-1 bg-[var(--border-strong)] rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

            {/* Modal Header */}
            <div className="p-4 border-b border-[var(--border-hairline)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[var(--accent)]" />
                <div>
                  <h3 className="font-bold text-base text-[var(--ink-primary)] font-display leading-tight">
                    إعدادات التطبيق والمعايرة
                  </h3>
                  <p className="text-[11px] text-[var(--ink-secondary)]">
                    جميع الخيارات في مكان واحد: المظهر، الأصوات، والرؤية
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="btn-close"
                aria-label="إغلاق نافذة الإعدادات"
              >
                <X className="w-4 h-4 text-[var(--ink-secondary)] shrink-0" />
              </button>
            </div>

            {/* Settings Sections */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* 1. Theme Option */}
              <div className="bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border-hairline)] space-y-2">
                <div className="font-semibold text-[var(--ink-primary)] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {darkMode ? <Moon className="w-4 h-4 text-[var(--accent)]" /> : <Sun className="w-4 h-4 text-[var(--accent)]" />}
                    <span>مظهر التطبيق</span>
                  </span>
                  <span className="text-[11px] text-[var(--ink-muted)] font-normal">
                    {darkMode ? 'الوضع الليلي' : 'الوضع المضيء'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { if (darkMode) onToggleDarkMode(); }}
                    className={`flex items-center justify-center gap-2 p-2 rounded-md border transition-all ${
                      !darkMode
                        ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)] font-bold border-[var(--accent)] shadow-2xs'
                        : 'border-[var(--border-hairline)] text-[var(--ink-secondary)] hover:bg-[var(--bg-surface-raised)]'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-[var(--accent)]" />
                    <span>ورق مخطوطة (مضيء)</span>
                  </button>
                  <button
                    onClick={() => { if (!darkMode) onToggleDarkMode(); }}
                    className={`flex items-center justify-center gap-2 p-2 rounded-md border transition-all ${
                      darkMode
                        ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)] font-bold border-[var(--accent)] shadow-2xs'
                        : 'border-[var(--border-hairline)] text-[var(--ink-secondary)] hover:bg-[var(--bg-surface-raised)]'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-[var(--accent)]" />
                    <span>سماء هادئة (ليلي)</span>
                  </button>
                </div>
              </div>

              {/* 2. Audio Effects */}
              <div className="bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border-hairline)] flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-semibold text-[var(--ink-primary)] flex items-center gap-1.5">
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-[var(--accent)]" /> : <VolumeX className="w-4 h-4 text-[var(--ink-muted)]" />}
                    <span>المؤثرات الصوتية والاهتزاز</span>
                  </div>
                  <p className="text-[11px] text-[var(--ink-secondary)]">
                    نقرات المسبحة، إتمام الأوراد، والتنبيهات الخفيفة
                  </p>
                </div>
                <button
                  onClick={onToggleSound}
                  className={`btn text-xs py-1.5 px-3 min-w-[70px] ${
                    soundEnabled ? 'btn--primary' : 'border border-[var(--border-hairline)]'
                  }`}
                >
                  {soundEnabled ? 'مفعّلة' : 'مكتومة'}
                </button>
              </div>

              {/* 3. Hijri Sighting Calibration */}
              <div className="bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border-hairline)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-[var(--ink-primary)] flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[var(--accent)]" />
                    <span>معايرة الرؤية الشرعية للهلال</span>
                  </div>
                  <span className="badge badge--accent tabular font-bold">
                    {hijriOffset > 0 ? `+${hijriOffset} يوم` : hijriOffset < 0 ? `${hijriOffset} يوم` : 'فلكي دقيق'}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--ink-secondary)] leading-relaxed">
                  تعديل التقويم الهجري بحسب إعلان دار الإفتاء أو وزارة الشؤون الدينية لثبوت رؤية هلال الشهر (+/- يومين).
                </p>

                {/* Stepper + Presets */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOffsetChange(-1)}
                      disabled={hijriOffset <= -2}
                      className="btn w-8 h-8 p-0 text-sm font-bold disabled:opacity-40"
                      title="تأخير يوم"
                    >
                      -
                    </button>
                    <span className="tabular font-bold text-sm px-2 text-[var(--ink-primary)]">
                      {hijriOffset > 0 ? `+${hijriOffset}` : hijriOffset}
                    </span>
                    <button
                      onClick={() => onOffsetChange(1)}
                      disabled={hijriOffset >= 2}
                      className="btn w-8 h-8 p-0 text-sm font-bold disabled:opacity-40"
                      title="تقديم يوم"
                    >
                      +
                    </button>
                  </div>

                  {/* Direct Preset Buttons */}
                  <div className="flex items-center gap-1">
                    {[-1, 0, 1].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => onOffsetChange(preset - hijriOffset)}
                        className={`px-2 py-1 rounded text-[11px] tabular transition-colors border ${
                          hijriOffset === preset
                            ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)] font-bold border-[var(--accent)]'
                            : 'border-[var(--border-hairline)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                        }`}
                      >
                        {preset > 0 ? `+${preset}` : preset === 0 ? 'فلكي' : preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Location & Prayer Calculation */}
              <div className="bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border-hairline)] space-y-2.5">
                <div className="font-semibold text-[var(--ink-primary)] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[var(--accent)]" />
                    <span>الموقع الجغرافي لحساب المواقيت</span>
                  </span>
                  <span
                    className="text-[11px] text-[var(--accent-ink)] font-medium underline cursor-pointer"
                    onClick={() => {
                      setShowSettingsModal(false);
                      setShowLocationModal(true);
                    }}
                  >
                    {currentLocation.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      onGpsRequest();
                      setShowSettingsModal(false);
                    }}
                    className="btn btn--primary flex-1 text-xs py-2 gap-1.5"
                  >
                    <Compass className="w-4 h-4" />
                    <span>تحديد الموقع عبر GPS</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowSettingsModal(false);
                      setShowLocationModal(true);
                    }}
                    className="btn flex-1 text-xs py-2 gap-1.5 border border-[var(--border-hairline)]"
                  >
                    <MapPin className="w-4 h-4 text-[var(--accent)]" />
                    <span>تغيير الولاية (58)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[var(--border-hairline)] flex justify-end bg-[var(--bg-surface)]">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="btn btn--primary text-xs py-1.5 px-5"
              >
                تم
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

