'use client';

import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {
  ALGERIAN_WILAYAS,
  Coordinates,
  HijriDate,
  PrayerTimesResult,
  calculatePrayerTimes,
  coerceCoordinates,
  formatConciseGregorian,
  getHijriDate,
} from '@/lib/prayer';
import {
  AppSettings,
  DayRecord,
  EMPTY_DAY,
  EMPTY_WEEK,
  ThemeName,
  WeekRecord,
  dayKey as makeDayKey,
  getDay,
  getWeek,
  loadRawSettings,
  prune,
  saveRawSettings,
  setDay,
  setWeek,
  weekKey as makeWeekKey,
} from '@/lib/store';
import {useToast} from '@/components/ui/Toast';

const DEFAULT_LOCATION = ALGERIAN_WILAYAS[15]; // الجزائر العاصمة

/** محطة اليوم ← سمة لون الصفحة «فجر» */
const STAGE_DAYPART: Record<string, string> = {
  ST01: 'late',
  ST02: 'dawn',
  ST03: 'morning',
  ST04: 'noon',
  ST05: 'afternoon',
  ST06: 'dusk',
  ST07: 'evening',
  ST08: 'night',
};

export interface TasbeehSeed {
  text: string;
  title: string;
}

interface AppContextValue {
  mounted: boolean;
  location: Coordinates;
  hijriOffset: number;
  theme: ThemeName;
  sound: boolean;
  updateSettings: (patch: Partial<AppSettings>) => void;
  toggleTheme: () => void;

  prayer: PrayerTimesResult;
  hijri: HijriDate;
  gregorian: string;
  daypart: string;

  day: DayRecord;
  setTimelineDone: (id: string, done: boolean) => void;
  setHabitDone: (id: string, done: boolean) => void;
  resetToday: () => DayRecord;
  restoreToday: (snapshot: DayRecord) => void;
  /** إعادة قراءة كل الحالة من التخزين (بعد استعادة نسخة احتياطية) */
  reloadFromStorage: () => void;
  week: WeekRecord;
  setWeeklyDone: (id: string, done: boolean) => void;

  locate: () => void;
  locating: boolean;

  tasbeehOpen: boolean;
  tasbeehSeed: TasbeehSeed | null;
  openTasbeeh: (seed?: TasbeehSeed) => void;
  closeTasbeeh: () => void;

  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({children}: {children: React.ReactNode}) {
  const {show} = useToast();
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => loadRawSettings());
  const [minuteTick, setMinuteTick] = useState(() => Date.now());
  const [day, setDayState] = useState<DayRecord>(EMPTY_DAY);
  const [week, setWeekState] = useState<WeekRecord>(EMPTY_WEEK);
  const [locating, setLocating] = useState(false);
  const [tasbeehOpen, setTasbeehOpen] = useState(false);
  const [tasbeehSeed, setTasbeehSeed] = useState<TasbeehSeed | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // ——— الإقلاع: استرجاع آمن بعد الترطيب (نظام خارجي → بلا setState متزامن) ———
  useEffect(() => {
    const timer = setTimeout(() => {
      const loaded = loadRawSettings();
      loaded.location = coerceCoordinates(loaded.location, DEFAULT_LOCATION);
      setSettings(loaded);
      setDayState(getDay());
      setWeekState(getWeek());
      prune();
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // نبضة الدقيقة — كل الحسابات الزمنية على هذه الإيقاع لا على الثانية
  useEffect(() => {
    const interval = setInterval(() => setMinuteTick(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  // المظهر: آلية واحدة (data-theme) + تحديث لون شريط النظام
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'night') root.setAttribute('data-theme', 'night');
    else root.removeAttribute('data-theme');
    root.style.colorScheme = settings.theme === 'night' ? 'dark' : 'light';
    const meta = document.querySelector('meta[name="theme-color"]:not([media])');
    meta?.setAttribute('content', settings.theme === 'night' ? '#12161d' : '#f6f1e7');
  }, [settings.theme, mounted]);

  // ——— الاستمرارية ———
  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = {...prev, ...patch};
      saveRawSettings(next);
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings((prev) => {
      const next = {...prev, theme: prev.theme === 'night' ? ('day' as const) : ('night' as const)};
      saveRawSettings(next);
      return next;
    });
  }, []);

  const persistDay = useCallback((record: DayRecord) => {
    setDayState(record);
    setDay(record);
  }, []);

  const setTimelineDone = useCallback(
    (id: string, done: boolean) => {
      setDayState((prev) => {
        const next = {...prev, timeline: {...prev.timeline, [id]: done}};
        setDay(next);
        return next;
      });
    },
    [],
  );

  const setHabitDone = useCallback((id: string, done: boolean) => {
    setDayState((prev) => {
      const next = {...prev, habits: {...prev.habits, [id]: done}};
      setDay(next);
      return next;
    });
  }, []);

  const resetToday = useCallback((): DayRecord => {
    const snapshot = {...day, timeline: {...day.timeline}, habits: {...day.habits}};
    persistDay(EMPTY_DAY);
    return snapshot;
  }, [day, persistDay]);

  const restoreToday = useCallback(
    (snapshot: DayRecord) => {
      persistDay(snapshot);
    },
    [persistDay],
  );

  const reloadFromStorage = useCallback(() => {
    const loaded = loadRawSettings();
    loaded.location = coerceCoordinates(loaded.location, DEFAULT_LOCATION);
    setSettings(loaded);
    setDayState(getDay());
    setWeekState(getWeek());
    prune();
  }, []);

  const setWeeklyDone = useCallback((id: string, done: boolean) => {
    setWeekState((prev) => {
      const next = {weekly: {...prev.weekly, [id]: done}};
      setWeek(next);
      return next;
    });
  }, []);

  // ——— الحسابات ———
  const location = mounted ? coerceCoordinates(settings.location, DEFAULT_LOCATION) : DEFAULT_LOCATION;

  const prayer = useMemo(
    () => calculatePrayerTimes(location, new Date(minuteTick)),
    [location, minuteTick],
  );

  const hijri = useMemo(
    () => getHijriDate(new Date(minuteTick), settings.hijriOffset),
    [minuteTick, settings.hijriOffset],
  );

  const gregorian = useMemo(() => formatConciseGregorian(new Date(minuteTick)), [minuteTick]);

  // لون الصفحة يتبع محطة اليوم (الاتجاه «فجر»)
  const daypart = STAGE_DAYPART[prayer.activeTimelineStageId] ?? 'noon';
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-daypart', daypart);
  }, [daypart, mounted]);

  // ——— تحديد الموقع ———
  const locate = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      show({message: 'المتصفح لا يدعم تحديد الموقع — اختر ولايتك من القائمة'});
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const deviceTz = (() => {
          try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
          } catch {
            return 'Africa/Algiers';
          }
        })();
        const gps: Coordinates = {
          name: `موقعي (${pos.coords.latitude.toFixed(2)}°، ${pos.coords.longitude.toFixed(2)}°)`,
          country: 'GPS',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          tzId: deviceTz, // منطقة الجهاز — صحيحة للتوقيت الصيفي أينما كان المستخدم
        };
        updateSettings({location: gps});
        setLocating(false);
        show({message: `حُدِّد الموقع: ${gps.name}`});
      },
      () => {
        setLocating(false);
        show({message: 'تعذّر جلب الموقع — اختر ولايتك من القائمة', duration: 5000});
      },
      {enableHighAccuracy: true, timeout: 8000},
    );
  }, [show, updateSettings]);

  // ——— المسبحة ———
  const openTasbeeh = useCallback((seed?: TasbeehSeed) => {
    setTasbeehSeed(seed ?? null);
    setTasbeehOpen(true);
  }, []);
  const closeTasbeeh = useCallback(() => setTasbeehOpen(false), []);

  const value: AppContextValue = {
    mounted,
    location,
    hijriOffset: settings.hijriOffset,
    theme: settings.theme,
    sound: settings.sound,
    updateSettings,
    toggleTheme,
    prayer,
    hijri,
    gregorian,
    daypart,
    day,
    setTimelineDone,
    setHabitDone,
    resetToday,
    restoreToday,
    reloadFromStorage,
    week,
    setWeeklyDone,
    locate,
    locating,
    tasbeehOpen,
    tasbeehSeed,
    openTasbeeh,
    closeTasbeeh,
    settingsOpen,
    setSettingsOpen,
    searchOpen,
    setSearchOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
