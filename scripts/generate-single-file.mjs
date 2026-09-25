import fs from 'fs';
import path from 'path';

// Load the prayer engine and data from lib
const prayerCode = fs.readFileSync(path.resolve('./lib/prayer.ts'), 'utf-8');
const dataCode = fs.readFileSync(path.resolve('./lib/data.ts'), 'utf-8');

// Strip export / type declarations to make clean vanilla JS objects
function tsToJs(code) {
  return code
    .replace(/export\s+interface\s+[\s\S]*?}\n/g, '')
    .replace(/export\s+type\s+[\s\S]*?;\n/g, '')
    .replace(/:\s*string\[\]/g, '')
    .replace(/:\s*number\[\]/g, '')
    .replace(/:\s*string/g, '')
    .replace(/:\s*number/g, '')
    .replace(/:\s*boolean/g, '')
    .replace(/:\s*Coordinates/g, '')
    .replace(/:\s*PrayerTimesResult/g, '')
    .replace(/:\s*HijriDate/g, '')
    .replace(/:\s*Record<[^>]+>/g, '')
    .replace(/export\s+const\s+/g, 'const ')
    .replace(/export\s+function\s+/g, 'function ');
}

const cleanedPrayer = tsToJs(prayerCode);
const cleanedData = tsToJs(dataCode);

// Embedded Manifest JSON
const manifestObj = {
  name: "اليوم النبوي ووظائف العام",
  short_name: "اليوم النبوي",
  description: "الدليل الشامل للاقتداء والتعبد وتزكية النفس وفق السنن النبوية ومواسم العام",
  start_url: "./index.html",
  display: "standalone",
  orientation: "portrait",
  background_color: "#064e3b",
  theme_color: "#064e3b",
  dir: "rtl",
  lang: "ar",
  icons: [
    {
      src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0iIzA2NGUzYiIvPjxwYXRoIGQ9Ik0yNTYgOTZMMTYwIDI4OGgxOTJMMjU2IDk2eiIgZmlsbD0iI2Q5NzcwNiIvPjwvc3ZnPg==",
      sizes: "512x512",
      type: "image/svg+xml",
      purpose: "any maskable"
    }
  ]
};

const manifestDataUri = "data:application/manifest+json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifestObj));

const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>اليوم النبوي ووظائف العام - الدليل الشامل للاقتداء والتعبد وتزكية النفس</title>
  <meta name="description" content="الدليل الشامل للاقتداء والتعبد وتزكية النفس وفق السنن النبوية الشريفة ووظائف مواسم العام ومتتبع العادات الإيمانية" />
  <meta name="theme-color" content="#064e3b" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="اليوم النبوي" />

  <!-- PWA Manifest via Data-URI -->
  <link rel="manifest" href="${manifestDataUri}" />

  <!-- Google Fonts: Cairo & Amiri -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            emerald: {
              950: '#032d22',
              900: '#064e3b',
              800: '#065f46',
              700: '#047857',
              600: '#059669',
            },
            amber: {
              400: '#fbbf24',
              500: '#f59e0b',
              600: '#d97706',
              700: '#b45309',
            }
          },
          fontFamily: {
            cairo: ['Cairo', 'sans-serif'],
            amiri: ['Amiri', 'serif'],
          }
        }
      }
    };
  </script>

  <!-- React 18, ReactDOM & Babel Standalone CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.6/babel.min.js"></script>

  <style>
    body {
      font-family: 'Cairo', sans-serif;
      -webkit-tap-highlight-color: transparent;
    }
    .font-amiri {
      font-family: 'Amiri', serif;
    }
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(6, 78, 59, 0.4);
      border-radius: 9999px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(6, 78, 59, 0.7);
    }
  </style>

  <!-- Inlined Service Worker for 100% Offline PWA Execution -->
  <script>
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        const swScript = \`
          const CACHE_NAME = 'prophetic-day-v1';
          self.addEventListener('install', (e) => {
            self.skipWaiting();
          });
          self.addEventListener('activate', (e) => {
            e.waitUntil(clients.claim());
          });
          self.addEventListener('fetch', (e) => {
            e.respondWith(
              caches.match(e.request).then((res) => res || fetch(e.request).catch(() => caches.match(e.request)))
            );
          });
        \`;
        const blob = new Blob([swScript], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);
        navigator.serviceWorker.register(swUrl).catch((err) => {
          console.warn('SW registration skipped:', err);
        });
      });
    }
  </script>
</head>
<body class="bg-stone-100 text-stone-900 antialiased selection:bg-emerald-800 selection:text-amber-100">
  <div id="root"></div>

  <!-- Inlined Astronomical Prayer Engine, Knowledge Base & React App -->
  <script type="text/babel">
    const { useState, useEffect, useMemo, useCallback } = React;

    // --- 1. Sound & Haptics Feedback Engine ---
    const AudioFeedback = {
      ctx: null,
      getCtx() {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
          const Cls = window.AudioContext || window.webkitAudioContext;
          this.ctx = new Cls();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        return this.ctx;
      },
      playClick(enabled) {
        if (!enabled) return;
        try {
          const ctx = this.getCtx();
          if (!ctx) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(480, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.04);
          gain.gain.setValueAtTime(0.18, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.05);
        } catch(e) {}
      },
      playBell(enabled) {
        if (!enabled) return;
        try {
          const ctx = this.getCtx();
          if (!ctx) return;
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
            gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.07 + 0.7);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + idx * 0.07);
            osc.stop(ctx.currentTime + idx * 0.07 + 0.8);
          });
        } catch(e) {}
      },
      vibrate(ms = 25) {
        if ('vibrate' in navigator) {
          try { navigator.vibrate(ms); } catch(e) {}
        }
      }
    };

    // --- 2. Astronomical Prayer Engine ---
    ${cleanedPrayer}

    // --- 3. Complete Islamic Knowledge Base ---
    ${cleanedData}

    // --- 4. Main Standalone Application Component ---
    function App() {
      const [location, setLocation] = useState(() => {
        const saved = localStorage.getItem('algeria_prayer_location');
        if (saved) {
          try { return JSON.parse(saved); } catch(e) {}
        }
        return ALGERIAN_WILAYAS[15]; // Alger
      });

      const [offset, setOffset] = useState(() => {
        return parseInt(localStorage.getItem('hijri_offset_days') || '0', 10);
      });

      const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme_dark_mode') === 'true';
      });

      const [soundEnabled, setSoundEnabled] = useState(() => {
        return localStorage.getItem('sound_enabled') !== 'false';
      });

      const [activeTab, setActiveTab] = useState('timeline');
      const [now, setNow] = useState(new Date());

      const [completedTimeline, setCompletedTimeline] = useState(() => {
        const savedDate = localStorage.getItem('daily_checklist_date');
        if (savedDate === new Date().toDateString()) {
          const saved = localStorage.getItem('completed_timeline_items');
          if (saved) {
            try { return JSON.parse(saved); } catch(e) {}
          }
        }
        return {};
      });

      const [dailyHabits, setDailyHabits] = useState(() => {
        const savedDate = localStorage.getItem('daily_checklist_date');
        if (savedDate === new Date().toDateString()) {
          const saved = localStorage.getItem('daily_habits_state');
          if (saved) {
            try { return JSON.parse(saved); } catch(e) {}
          }
        }
        return {};
      });

      const [weeklyHabits, setWeeklyHabits] = useState(() => {
        const saved = localStorage.getItem('weekly_habits_state');
        if (saved) {
          try { return JSON.parse(saved); } catch(e) {}
        }
        return {};
      });

      // Tasbeeh state
      const [isTasbeehOpen, setIsTasbeehOpen] = useState(false);
      const [tasbeehText, setTasbeehText] = useState('سُبْحَانَ اللَّهِ');
      const [tasbeehTitle, setTasbeehTitle] = useState('التسبيح المطلق');
      const [tasbeehCount, setTasbeehCount] = useState(0);
      const [tasbeehTarget, setTasbeehTarget] = useState(33);
      const [tasbeehLap, setTasbeehLap] = useState(0);

      // Location modal state
      const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
      const [locationQuery, setLocationQuery] = useState('');

      // Search state for contextual sunan
      const [contextualQuery, setContextualQuery] = useState('');
      const [contextualCat, setContextualCat] = useState('all');

      // Month tab state
      const [selectedHijriMonth, setSelectedHijriMonth] = useState(1);

      // Clock tick
      useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
      }, []);

      // LocalStorage sync
      useEffect(() => {
        localStorage.setItem('algeria_prayer_location', JSON.stringify(location));
        localStorage.setItem('hijri_offset_days', offset.toString());
        localStorage.setItem('theme_dark_mode', darkMode.toString());
        localStorage.setItem('sound_enabled', soundEnabled.toString());
        localStorage.setItem('daily_checklist_date', new Date().toDateString());
        localStorage.setItem('completed_timeline_items', JSON.stringify(completedTimeline));
        localStorage.setItem('daily_habits_state', JSON.stringify(dailyHabits));
        localStorage.setItem('weekly_habits_state', JSON.stringify(weeklyHabits));
        if (darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }, [location, offset, darkMode, soundEnabled, completedTimeline, dailyHabits, weeklyHabits]);

      const prayers = useMemo(() => calculatePrayerTimes(location, now), [location, now]);
      const hijri = useMemo(() => getHijriDate(now, offset), [now, offset]);
      const gregorianStr = useMemo(() => formatConciseGregorian(now), [now]);

      useEffect(() => {
        if (hijri.month) setSelectedHijriMonth(hijri.month);
      }, [hijri.month]);

      const handleTasbeehClick = () => {
        AudioFeedback.playClick(soundEnabled);
        AudioFeedback.vibrate(25);
        const next = tasbeehCount + 1;
        if (tasbeehTarget > 0 && next >= tasbeehTarget) {
          AudioFeedback.playBell(soundEnabled);
          AudioFeedback.vibrate([40, 60, 40]);
          setTasbeehCount(0);
          setTasbeehLap(l => l + 1);
        } else {
          setTasbeehCount(next);
        }
      };

      const openTasbeehForDua = (text, title) => {
        setTasbeehText(text);
        setTasbeehTitle(title);
        setTasbeehCount(0);
        setTasbeehLap(0);
        setTasbeehTarget(33);
        setIsTasbeehOpen(true);
        AudioFeedback.vibrate(30);
      };

      const copyToClipboard = (text) => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text);
          AudioFeedback.vibrate(25);
          alert('تم نسخ الذكر إلى الحافظة بنجاح');
        }
      };

      const totalTimelineItems = MODULE_1_DAILY_TIMELINE.reduce((a, s) => a + s.items.length, 0);
      const completedTimelineCount = Object.values(completedTimeline).filter(Boolean).length;
      const timelinePercent = Math.round((completedTimelineCount / totalTimelineItems) * 100);

      const completedHabitCount = HABIT_DAILY_INDICATORS.filter(h => dailyHabits[h.habit_name]).length;
      const habitPercent = Math.round((completedHabitCount / HABIT_DAILY_INDICATORS.length) * 100);

      return (
        <div className={"min-h-screen " + (darkMode ? "dark bg-stone-950 text-stone-100" : "bg-stone-100 text-stone-900")}>
          {/* Header Bar with Prayer Times */}
          <header className="bg-emerald-950 text-emerald-50 border-b border-emerald-800 shadow-md">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Dates */}
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <div className="flex items-center gap-1.5 bg-emerald-900 px-3 py-1 rounded-lg border border-emerald-700">
                    <span>📅</span>
                    <span className="font-amiri text-lg font-bold text-amber-200">{hijri.formattedText}</span>
                    {hijri.isWhiteDay && <span className="text-[10px] bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded">أيام البيض</span>}
                    {hijri.isFastingDay && <span className="text-[10px] bg-emerald-700 text-emerald-100 px-1.5 py-0.5 rounded">صيام مسنون</span>}
                  </div>
                  <div className="flex items-center gap-1 bg-emerald-900/60 px-2 py-0.5 rounded text-xs text-emerald-300">
                    <span>تعديل:</span>
                    <button onClick={() => setOffset(o => Math.max(-2, o - 1))} className="px-1.5 bg-emerald-800 rounded font-mono">-</button>
                    <span className="font-mono font-bold text-amber-300">{offset > 0 ? "+" + offset : offset}</span>
                    <button onClick={() => setOffset(o => Math.min(2, o + 1))} className="px-1.5 bg-emerald-800 rounded font-mono">+</button>
                  </div>
                  <span className="text-xs text-emerald-300/80 pr-2 border-r border-emerald-800">{gregorianStr}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 text-xs">
                  <button onClick={() => setIsLocationModalOpen(true)} className="flex items-center gap-1 bg-emerald-900 hover:bg-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-700">
                    <span>📍</span>
                    <span className="font-bold">{location.name}</span>
                  </button>
                  <button onClick={() => { setTasbeehText('سُبْحَانَ اللَّهِ'); setTasbeehTitle('المسبحة'); setIsTasbeehOpen(true); }} className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-3 py-1.5 rounded-lg">
                    ✨ المسبحة
                  </button>
                  <button onClick={() => setSoundEnabled(s => !s)} className="p-1.5 bg-emerald-900 hover:bg-emerald-800 rounded-lg">
                    {soundEnabled ? "🔊" : "🔇"}
                  </button>
                  <button onClick={() => setDarkMode(d => !d)} className="p-1.5 bg-emerald-900 hover:bg-emerald-800 rounded-lg">
                    {darkMode ? "☀️" : "🌙"}
                  </button>
                </div>
              </div>

              {/* Prayers ribbon */}
              <div className="mt-3 pt-3 border-t border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="bg-emerald-900/60 px-3 py-1 rounded-md">
                  الوقت الحالي: <strong className="text-amber-300">{prayers.currentPrayer}</strong> | المتبقي لـ <strong className="text-amber-300">{prayers.nextPrayer}</strong>: <span className="font-mono text-amber-400 font-bold">{prayers.timeToNext}</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 text-center">
                  {[
                    { n: 'الإمساك', t: prayers.imsak },
                    { n: 'الفجر', t: prayers.fajr },
                    { n: 'الشروق', t: prayers.sunrise },
                    { n: 'الظهر', t: prayers.dhuhr },
                    { n: 'العصر', t: prayers.asr },
                    { n: 'المغرب', t: prayers.maghrib },
                    { n: 'العشاء', t: prayers.isha },
                    { n: 'ثلث الليل', t: prayers.lastThird },
                  ].map(p => (
                    <div key={p.n} className={"p-1 rounded " + (prayers.nextPrayer === p.n ? "bg-amber-500/30 border border-amber-400" : "bg-emerald-900/40")}>
                      <div className="text-[10px] text-emerald-300">{p.n}</div>
                      <div className="font-mono font-bold">{p.t}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </header>

          {/* Nav Tabs */}
          <nav className="sticky top-0 z-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur border-b border-stone-200 dark:border-stone-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 overflow-x-auto py-2">
              {[
                { id: 'timeline', n: 'المسار الزمني لليوم والليلة', i: '⏰' },
                { id: 'seasons', n: 'وظائف الشهور والتقويم الهجري', i: '📅' },
                { id: 'contextual', n: 'المناسبات والأحوال العارضة', i: '🏷️' },
                { id: 'tracker', n: 'المعين الإيماني ومتتبع السنن', i: '🛡️' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); AudioFeedback.vibrate(15); }}
                  className={"px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 transition-all " + (activeTab === tab.id ? "bg-emerald-900 text-amber-300 shadow" : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800")}
                >
                  <span>{tab.i}</span>
                  <span>{tab.n}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Main Body */}
          <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
            {/* TAB 1: DAILY TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold font-amiri text-stone-900 dark:text-stone-100">المسار الزمني النبوي لليوم والليلة</h2>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
                      هدي النبي ﷺ من الاستيقاظ حتى المنام، مضبوطاً بالشكل التام مع بيان الأسرار التزكوية ومصادرها المعتمدة.
                    </p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-4 py-2 rounded-xl text-center">
                    <div className="text-xs text-stone-500 dark:text-stone-400">إنجاز اليوم</div>
                    <div className="text-lg font-bold font-mono text-emerald-800 dark:text-emerald-300">{completedTimelineCount} / {totalTimelineItems} ({timelinePercent}%)</div>
                  </div>
                </div>

                {MODULE_1_DAILY_TIMELINE.map(stage => {
                  const isActiveStage = prayers.activeTimelineStageId === stage.stage_id;
                  return (
                    <div key={stage.stage_id} className={"rounded-2xl border overflow-hidden " + (isActiveStage ? "border-amber-500/70 bg-amber-500/5 shadow-md" : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900")}>
                      <div className={"p-4 border-b " + (isActiveStage ? "bg-amber-500/20 text-stone-900 dark:text-amber-200 font-bold" : "bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200")}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-emerald-800 text-amber-300 font-mono text-xs flex items-center justify-center font-bold">{stage.stage_id}</span>
                            <h3 className="font-bold text-base">{stage.period_name}</h3>
                            {isActiveStage && <span className="bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full">الفترة الحالية</span>}
                          </div>
                          <span className="text-xs text-stone-500">{stage.items.length} سنن وأعمال</span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-1"><strong className="text-emerald-700 dark:text-emerald-400">المقصد التعبدي:</strong> {stage.stage_objective}</p>
                      </div>

                      <div className="p-4 space-y-4">
                        {stage.items.map((item, idx) => {
                          const isDone = Boolean(completedTimeline[item.id]);
                          return (
                            <div key={item.id} className={"p-4 rounded-xl border transition-all " + (isDone ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/50" : "bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700")}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5">
                                  <input
                                    type="checkbox"
                                    checked={isDone}
                                    onChange={() => {
                                      setCompletedTimeline(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                                      AudioFeedback.vibrate(25);
                                    }}
                                    className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                  />
                                  <div>
                                    <h4 className={"text-base font-bold " + (isDone ? "line-through text-stone-400" : "text-stone-900 dark:text-stone-100")}>{item.title}</h4>
                                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 mt-0.5">{item.act_description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {item.dhikr_dua && (
                                    <>
                                      <button onClick={() => copyToClipboard(item.dhikr_dua)} className="p-1.5 text-stone-400 hover:text-emerald-700 text-xs" title="نسخ">📋</button>
                                      <button onClick={() => openTasbeehForDua(item.dhikr_dua, item.title)} className="p-1.5 text-amber-600 text-xs" title="تسبيح">✨</button>
                                    </>
                                  )}
                                </div>
                              </div>

                              {item.dhikr_dua && (
                                <div className="mt-3 bg-white dark:bg-stone-900/90 p-3 rounded-lg border border-stone-200 dark:border-stone-700">
                                  <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-1">النص المأثور مضبوطاً بالشكل:</div>
                                  <div className="font-amiri text-base sm:text-lg text-emerald-950 dark:text-emerald-100 leading-loose select-all">{item.dhikr_dua}</div>
                                </div>
                              )}

                              <div className="mt-3 space-y-1.5 text-xs">
                                <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 p-2 rounded border border-emerald-200 dark:border-emerald-800/50">
                                  <strong>الفضل الشرعي:</strong> {item.reward_virtue}
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200 p-2 rounded border border-amber-200 dark:border-amber-800/50">
                                  <strong>الجانب التربوي وتزكية النفس:</strong> {item.spiritual_and_educational_facet}
                                </div>
                                <div className="text-[10px] text-stone-400 font-mono pt-1">المصدر: {item.source}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: HIJRI SEASONS */}
            {activeTab === 'seasons' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
                  <h2 className="text-xl font-bold font-amiri text-stone-900 dark:text-stone-100">التقويم الهجري ووظائف الشهور وفصول العام</h2>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">مستخلص من كتاب «لطائف المعارف فيما لمواسم العام من الوظائف» للحافظ ابن رجب الحنبلي.</p>
                  
                  {/* Months Carousel */}
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center gap-1.5 overflow-x-auto pb-2">
                    {MODULE_2_HIJRI_SEASONS.months.map(m => (
                      <button
                        key={m.month_number}
                        onClick={() => setSelectedHijriMonth(m.month_number)}
                        className={"px-3 py-1.5 rounded-xl text-xs shrink-0 font-bold " + (selectedHijriMonth === m.month_number ? "bg-emerald-900 text-amber-300" : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300")}
                      >
                        #{m.month_number} {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                {(() => {
                  const mData = MODULE_2_HIJRI_SEASONS.months.find(m => m.month_number === selectedHijriMonth) || MODULE_2_HIJRI_SEASONS.months[0];
                  return (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-l from-emerald-950 via-emerald-900 to-emerald-950 text-white p-5 rounded-2xl border border-emerald-800">
                        <span className="text-xs text-amber-300 font-mono">الشهر الهجري #{mData.month_number}</span>
                        <h3 className="text-xl font-bold font-amiri text-amber-200 mt-0.5">{mData.title}</h3>
                      </div>

                      <div className="space-y-4">
                        {mData.acts_and_functions.map((act, aIdx) => (
                          <div key={aIdx} className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">{act.act_name}</h4>
                              {act.dhikr_dua && (
                                <button onClick={() => openTasbeehForDua(act.dhikr_dua, act.act_name)} className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-1 rounded">✨ تسبيح</button>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{act.details}</p>
                            {act.dhikr_dua && (
                              <div className="bg-stone-50 dark:bg-stone-800 p-3 rounded-lg font-amiri text-base text-emerald-900 dark:text-emerald-100">{act.dhikr_dua}</div>
                            )}
                            <div className="space-y-1.5 text-xs">
                              {act.reward && <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded text-emerald-900 dark:text-emerald-200"><strong>الفضل والأجر:</strong> {act.reward}</div>}
                              <div className="bg-amber-50 dark:bg-amber-950/30 p-2 rounded text-amber-950 dark:text-amber-200"><strong>الجانب التربوي (لطائف المعارف):</strong> {act.spiritual_and_educational_facet}</div>
                              <div className="text-[10px] text-stone-400 font-mono">الدليل: {act.evidence}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Solar Seasons */}
                      <div className="mt-8 pt-4 border-t border-stone-200 dark:border-stone-800">
                        <h3 className="font-bold text-lg mb-3">فقه فصول السنة الشمسية في الهدي النبوي</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {MODULE_2_HIJRI_SEASONS.seasonal_solar_cycles.map((s, sIdx) => (
                            <div key={sIdx} className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
                              <h4 className="font-bold text-emerald-900 dark:text-emerald-300">{s.season_name}</h4>
                              <p className="text-xs text-stone-600 dark:text-stone-400">{s.spiritual_concept_and_functions}</p>
                              <div className="text-xs bg-amber-50 dark:bg-amber-950 p-2 rounded text-amber-950 dark:text-amber-200">{s.educational_facet}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 3: CONTEXTUAL SUNAN */}
            {activeTab === 'contextual' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
                  <h2 className="text-xl font-bold font-amiri text-stone-900 dark:text-stone-100">المناسبات والأحوال العارضة والسنن المقيدة</h2>
                  <input
                    type="text"
                    value={contextualQuery}
                    onChange={e => setContextualQuery(e.target.value)}
                    placeholder="ابحث في الأدعية والمناسبات (كفارة المجلس، دعاء الكرب، السفر، الاستخارة)..."
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2 text-sm"
                  />
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <button onClick={() => setContextualCat('all')} className={"px-3 py-1 rounded-xl text-xs font-semibold " + (contextualCat === 'all' ? "bg-emerald-900 text-amber-300" : "bg-stone-100 dark:bg-stone-800")}>الكل</button>
                    {MODULE_3_CONTEXTUAL.map(c => (
                      <button key={c.category_name} onClick={() => setContextualCat(c.category_name)} className={"px-3 py-1 rounded-xl text-xs font-semibold shrink-0 " + (contextualCat === c.category_name ? "bg-emerald-900 text-amber-300" : "bg-stone-100 dark:bg-stone-800")}>
                        {c.category_name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {MODULE_3_CONTEXTUAL.filter(c => contextualCat === 'all' || c.category_name === contextualCat).map(cat => {
                    const items = cat.items.filter(i => {
                      const q = contextualQuery.trim().toLowerCase();
                      if (!q) return true;
                      return i.situation.includes(q) || i.sunnah_act.includes(q) || i.text.includes(q);
                    });
                    if (items.length === 0) return null;

                    return (
                      <div key={cat.category_name} className="space-y-3">
                        <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <span>{cat.category_name}</span>
                        </h3>
                        <div className="space-y-3">
                          {items.map((item, iIdx) => (
                            <div key={iIdx} className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-2.5">
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">المناسبة / الحال:</span>
                                  <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">{item.situation}</h4>
                                </div>
                                <div className="flex items-center gap-1">
                                  {item.text && (
                                    <>
                                      <button onClick={() => copyToClipboard(item.text)} className="p-1 text-stone-400 text-xs">📋</button>
                                      <button onClick={() => openTasbeehForDua(item.text, item.situation)} className="p-1 text-amber-600 text-xs">✨</button>
                                    </>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300"><strong>السنة المشروعة:</strong> {item.sunnah_act}</p>
                              {item.text && (
                                <div className="bg-stone-50 dark:bg-stone-800 p-3 rounded-lg font-amiri text-base text-emerald-950 dark:text-emerald-100 leading-relaxed select-all font-medium">
                                  {item.text}
                                </div>
                              )}
                              <div className="space-y-1 text-xs">
                                {item.reward && <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded text-emerald-900 dark:text-emerald-200"><strong>الفضل:</strong> {item.reward}</div>}
                                <div className="bg-amber-50 dark:bg-amber-950/30 p-2 rounded text-amber-950 dark:text-amber-200"><strong>تزكية النفس:</strong> {item.spiritual_and_educational_facet}</div>
                                <div className="text-[10px] text-stone-400 font-mono">المصدر: {item.source}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: SPIRITUAL TRACKER */}
            {activeTab === 'tracker' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold font-amiri text-stone-900 dark:text-stone-100">المعين الإيماني ومتتبع السنن</h2>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">مؤشرات الأداء التعبدي اليومي، وأصول فقه التعبد الـ 7 وقواعد الأذكار الـ 6.</p>
                  </div>
                  <div className="text-center bg-emerald-50 dark:bg-emerald-950/60 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <div className="text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-300">{habitPercent}%</div>
                    <div className="text-xs text-stone-500">معدل الإنجاز اليومي</div>
                  </div>
                </div>

                {/* Daily KPIs */}
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
                  <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">1. مؤشرات الأداء التعبدي اليومية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {HABIT_DAILY_INDICATORS.map((h, hIdx) => {
                      const isDone = Boolean(dailyHabits[h.habit_name]);
                      return (
                        <div
                          key={hIdx}
                          onClick={() => {
                            setDailyHabits(prev => ({ ...prev, [h.habit_name]: !prev[h.habit_name] }));
                            AudioFeedback.vibrate(25);
                          }}
                          className={"p-3.5 rounded-xl border cursor-pointer flex items-center justify-between " + (isDone ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500" : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700")}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{isDone ? "✅" : "⭕"}</span>
                            <div>
                              <div className={"text-sm font-bold " + (isDone ? "line-through text-stone-400" : "")}>{h.habit_name}</div>
                              <div className="text-xs text-stone-500">{h.evaluation_criterion}</div>
                            </div>
                          </div>
                          <span className="text-xs font-mono bg-white dark:bg-stone-900 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">{h.target}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Weekly & Soul Rules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Soul Rules */}
                  <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
                    <h3 className="font-bold text-base text-emerald-900 dark:text-emerald-300">أصول فقه التعبد وسياسة النفس (الأصول الـ 7)</h3>
                    <div className="space-y-3">
                      {MODULE_4_SOUL_RULES.map((r, rIdx) => (
                        <div key={rIdx} className="bg-stone-50 dark:bg-stone-800 p-3 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                          <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">{rIdx + 1}. {r.title}</h4>
                          <p className="text-xs text-stone-600 dark:text-stone-400">{r.rule_content}</p>
                          <div className="text-[11px] bg-amber-50 dark:bg-amber-950/40 p-2 rounded text-amber-900 dark:text-amber-200">{r.soul_governance_application}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dhikr Rules */}
                  <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
                    <h3 className="font-bold text-base text-emerald-900 dark:text-emerald-300">قواعد فقه الأذكار (الـ 6 قواعد)</h3>
                    <div className="space-y-3">
                      {MODULE_4_DHIKR_RULES.map((dr, drIdx) => (
                        <div key={drIdx} className="bg-stone-50 dark:bg-stone-800 p-3 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                          <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">قاعدة {drIdx + 1}: {dr.title}</h4>
                          <p className="text-xs text-stone-600 dark:text-stone-400">{dr.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* Floating Tasbeeh FAB */}
          <button
            onClick={() => { setTasbeehText('سُبْحَانَ اللَّهِ'); setTasbeehTitle('المسبحة'); setIsTasbeehOpen(true); }}
            className="fixed bottom-6 left-6 z-40 bg-emerald-900 text-amber-300 p-4 rounded-full shadow-2xl border border-amber-400/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>✨</span>
            <span className="text-xs font-bold font-amiri">المسبحة</span>
          </button>

          {/* Tasbeeh Modal */}
          {isTasbeehOpen && (
            <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4" onClick={() => setIsTasbeehOpen(false)}>
              <div className="bg-emerald-950 border border-emerald-700 rounded-3xl w-full max-w-md text-emerald-50 shadow-2xl overflow-hidden p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span>✨</span>
                    <h3 className="font-bold text-lg font-amiri">المسبحة الإلكترونية</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setTasbeehCount(0); setTasbeehLap(0); }} className="text-xs bg-emerald-800 px-2 py-1 rounded">تصفير</button>
                    <button onClick={() => setIsTasbeehOpen(false)} className="text-stone-400 hover:text-white">✕</button>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <div className="text-xs text-amber-300 font-bold">{tasbeehTitle}</div>
                  <div className="font-amiri text-lg sm:text-xl text-amber-100 leading-relaxed min-h-[50px] flex items-center justify-center">{tasbeehText}</div>
                  <div className="text-xs text-emerald-300">الهدف: {tasbeehTarget > 0 ? tasbeehTarget : 'مطلق'} | الدورات: {tasbeehLap}</div>
                </div>

                <div className="flex justify-center py-4">
                  <button
                    onClick={handleTasbeehClick}
                    className="w-48 h-48 rounded-full bg-gradient-to-b from-emerald-800 to-emerald-950 border-4 border-amber-400/60 shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all"
                  >
                    <span className="font-mono text-6xl font-black text-amber-300">{tasbeehCount}</span>
                    <span className="text-xs text-emerald-300 mt-1">انقر للعد</span>
                  </button>
                </div>

                <div className="flex justify-center gap-2 pt-2 border-t border-emerald-800">
                  {[33, 100, 1000, 0].map(t => (
                    <button key={t} onClick={() => { setTasbeehTarget(t); setTasbeehCount(0); }} className={"px-3 py-1 rounded text-xs font-mono " + (tasbeehTarget === t ? "bg-amber-500 text-stone-950 font-bold" : "bg-emerald-900 text-emerald-300")}>
                      {t === 0 ? 'مطلق' : t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Location Modal */}
          {isLocationModalOpen && (
            <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4" onClick={() => setIsLocationModalOpen(false)}>
              <div className="bg-emerald-950 border border-emerald-700 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col text-emerald-50 shadow-2xl p-4 space-y-3" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-emerald-800 pb-2">
                  <h3 className="font-bold text-base">اختيار الولاية الجزائرية (58 ولاية)</h3>
                  <button onClick={() => setIsLocationModalOpen(false)} className="text-stone-400">✕</button>
                </div>
                <input
                  type="text"
                  value={locationQuery}
                  onChange={e => setLocationQuery(e.target.value)}
                  placeholder="ابحث عن ولايتك..."
                  className="w-full bg-emerald-900 border border-emerald-700 rounded-lg px-3 py-1.5 text-xs text-emerald-100"
                />
                <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-1">
                  {ALGERIAN_WILAYAS.filter(w => w.name.includes(locationQuery)).map(w => (
                    <button
                      key={w.name}
                      onClick={() => { setLocation(w); setIsLocationModalOpen(false); }}
                      className={"p-2 rounded text-xs text-right border " + (location.name === w.name ? "bg-amber-500 text-stone-950 font-bold" : "bg-emerald-900/60 text-emerald-200 border-emerald-800")}
                    >
                      {w.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    ReactDOM.render(<App />, document.getElementById('root'));
  </script>
</body>
</html>
`;

fs.writeFileSync(path.resolve('./public/index.html'), htmlContent, 'utf-8');
console.log('Successfully generated public/index.html with full single-file PWA architecture!');
