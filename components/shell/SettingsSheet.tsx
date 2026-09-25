'use client';

import React, { useMemo, useState } from 'react';
import { ArrowRight, Check, Compass, MapPin, Minus, Plus, Search, Volume2, VolumeX } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Segmented } from '@/components/ui/controls';
import { useToast } from '@/components/ui/Toast';
import { useApp } from '@/components/providers/AppProvider';
import { APP_METADATA } from '@/lib/data/meta';
import { applyBackup, backupFileName, collectBackup } from '@/lib/backup';
import { ALGERIAN_WILAYAS, MAJOR_ISLAMIC_CITIES } from '@/lib/prayer';
import { normalizeAr } from '@/lib/search';
import { cn } from '@/lib/utils';

/** ورقة الإعدادات — صفوف قائمة لا صناديق متداخلة */
export function SettingsSheet() {
  const {
    settingsOpen,
    setSettingsOpen,
    location,
    theme,
    updateSettings,
    toggleTheme,
    sound,
    hijriOffset,
    locate,
    locating,
  } = useApp();

  const [view, setView] = useState<'root' | 'location'>('root');

  const close = () => {
    setSettingsOpen(false);
    setView('root');
  };

  return (
    <Sheet
      open={settingsOpen}
      onClose={close}
      title={view === 'root' ? 'الإعدادات' : 'تحديد الموقع'}
      subtitle={
        view === 'root'
          ? 'الموقع والمظهر والصوت ومعايرة التقويم'
          : 'مدينتك تحسم مواقيت الصلاة والتقويم'
      }
      size="sm"
      bodyClassName="px-0 py-0"
    >
      {view === 'root' ? (
        <RootView
          onOpenLocation={() => setView('location')}
          {...{ location, theme, updateSettings, toggleTheme, sound, hijriOffset, locate, locating }}
        />
      ) : (
        <LocationView onBack={() => setView('root')} />
      )}
    </Sheet>
  );
}

/** تصدير السجل إلى ملف واستعادته على أي جهاز — بلا حسابات ولا خادم */
function BackupSection() {
  const { reloadFromStorage } = useApp();
  const { show } = useToast();

  const handleExport = () => {
    const payload = collectBackup();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = backupFileName();
    anchor.click();
    URL.revokeObjectURL(url);
    show({ message: `صُدِّر السجل — ${Object.keys(payload.records).length} سجلًا` });
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // يسمح بإعادة اختيار الملف نفسه
    if (!file) return;
    const raw = await file.text();
    const result = applyBackup(raw);
    if (!result.ok) {
      show({ message: result.error ?? 'فشلت الاستعادة', duration: 5000 });
      return;
    }
    reloadFromStorage();
    const parts = [
      result.restored > 0 ? `استُعيد ${result.restored}` : null,
      result.merged > 0 ? `دُمج ${result.merged}` : null,
      result.skipped > 0 ? `تُجوهِل ${result.skipped} غير صالح` : null,
    ].filter(Boolean);
    show({ message: parts.length ? `تمت الاستعادة — ${parts.join('، ')}` : 'لا جديد في الملف', duration: 6000 });
  };

  return (
    <div className="border-t border-hairline px-5 py-4">
      <p className="text-body font-medium">نسخة احتياطية</p>
      <p className="mt-0.5 text-caption leading-relaxed text-ink-3">
        سجلك على جهازك — صدّره ملفًا واحتفظ به، واستعيده على أي جهاز. الاستعادة تُكمل ما ينقص ولا تحذف علاماتك الأحدث.
      </p>
      <div className="mt-2.5 flex gap-2">
        <button type="button" onClick={handleExport} className="btn flex-1">
          تصدير السجل
        </button>
        <label className="btn flex-1 cursor-pointer">
          استعادة من ملف
          <input
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            className="sr-only"
            aria-label="اختيار ملف النسخة الاحتياطية"
          />
        </label>
      </div>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-3.5 last:border-b-0">
      <div className="min-w-0">
        <p className="text-body font-medium leading-snug">{label}</p>
        {hint && <p className="mt-0.5 text-caption leading-relaxed text-ink-3">{hint}</p>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}

function RootView({
  onOpenLocation,
  location,
  theme,
  toggleTheme,
  sound,
  updateSettings,
  hijriOffset,
  locate,
  locating,
}: {
  onOpenLocation: () => void;
  location: { name: string };
  theme: 'day' | 'night';
  toggleTheme: () => void;
  sound: boolean;
  updateSettings: (patch: { sound?: boolean; hijriOffset?: number }) => void;
  hijriOffset: number;
  locate: () => void;
  locating: boolean;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onOpenLocation}
        className="flex w-full items-center justify-between gap-3 border-b border-hairline px-5 py-3.5 text-start transition-colors hover:bg-surface"
      >
        <span className="flex items-center gap-2.5">
          <MapPin className="h-4.5 w-4.5 text-accent" aria-hidden="true" />
          <span>
            <span className="block text-body font-medium">الموقع</span>
            <span className="mt-0.5 block text-caption text-ink-3">{location.name}</span>
          </span>
        </span>
        <span className="text-label text-accent-ink">تغيير</span>
      </button>

      <Row label="المظهر">
        <Segmented
          ariaLabel="اختيار المظهر"
          options={[
            { value: 'day', label: 'نهاري' },
            { value: 'night', label: 'ليلي' },
          ]}
          value={theme}
          onChange={(v) => {
            if (v !== theme) toggleTheme();
          }}
        />
      </Row>

      <Row label="المؤثرات الصوتية والاهتزاز" hint="نقرات المسبحة وإتمام الأوراد">
        <button
          type="button"
          role="switch"
          aria-checked={sound}
          onClick={() => updateSettings({ sound: !sound })}
          className={cn(
            'relative h-8 w-14 rounded-full border transition-colors',
            sound ? 'border-accent-strong bg-accent-strong' : 'border-strong bg-surface',
          )}
          aria-label={sound ? 'مفعّلة — انقر للكتم' : 'مكتومة — انقر للتفعيل'}
        >
          <span
            className={cn(
              'absolute top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-raised text-ink-2 shadow-sm transition-all',
              sound ? 'start-7' : 'start-1',
            )}
          >
            {sound ? <Volume2 className="h-3.5 w-3.5" aria-hidden="true" /> : <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />}
          </span>
        </button>
      </Row>

      <Row label="معايرة التقويم الهجري" hint="وفق إعلان رؤية الهلال — ± يومان">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => updateSettings({ hijriOffset: Math.max(-2, hijriOffset - 1) })}
            disabled={hijriOffset <= -2}
            className="btn-icon h-9! w-9!"
            aria-label="إنقاص يوم"
          >
            <Minus aria-hidden="true" />
          </button>
          <span className="min-w-12 text-center text-label font-bold tabular-nums" aria-live="polite">
            {hijriOffset > 0 ? `+${hijriOffset}` : hijriOffset === 0 ? 'فلكي' : hijriOffset}
          </span>
          <button
            type="button"
            onClick={() => updateSettings({ hijriOffset: Math.min(2, hijriOffset + 1) })}
            disabled={hijriOffset >= 2}
            className="btn-icon h-9! w-9!"
            aria-label="زيادة يوم"
          >
            <Plus aria-hidden="true" />
          </button>
        </div>
      </Row>

      <BackupSection />

      <div className="px-5 py-4">
        <a href="/offline.html" download="اليوم-النبوي-ووظائف-العام.html" className="btn w-full">
          تنزيل نسخة مستقلة تعمل دون اتصال (ملف واحد)
        </a>
        <p className="mt-2 text-caption leading-relaxed text-ink-3">
          ملف HTML واحد يحوي كل المحتوى والمواقيت والمسبحة — يعمل من أي متصفح بلا إنترنت.
        </p>
        <details className="group mt-3">
          <summary className="cursor-pointer list-none text-label font-medium text-ink-2 transition-colors hover:text-ink">
            المصادر المعتمدة
            <span className="mr-1.5 inline-block transition-transform group-open:rotate-90" aria-hidden="true">
              ‹
            </span>
          </summary>
          <ul className="mt-2 space-y-1.5 border-s border-hairline ps-3 text-caption leading-relaxed text-ink-3">
            {APP_METADATA.sources.map((source) => (
              <li key={source}>{source}</li>
            ))}
          </ul>
        </details>
        <p className="mt-3 text-caption text-ink-3">الإصدار {APP_METADATA.version} · يعمل دون اتصال بعد أول زيارة</p>
      </div>
    </div>
  );
}

function LocationView({ onBack }: { onBack: () => void }) {
  const { location, updateSettings, locate, locating } = useApp();
  const [query, setQuery] = useState('');

  const q = normalizeAr(query);
  const wilayas = useMemo(
    () => (q ? ALGERIAN_WILAYAS.filter((w) => normalizeAr(w.name).includes(q)) : ALGERIAN_WILAYAS),
    [q],
  );
  const cities = useMemo(
    () => (q ? MAJOR_ISLAMIC_CITIES.filter((c) => normalizeAr(c.name + c.country).includes(q)) : MAJOR_ISLAMIC_CITIES),
    [q],
  );

  const pick = (name: string) => {
    const found = [...ALGERIAN_WILAYAS, ...MAJOR_ISLAMIC_CITIES].find((c) => c.name === name);
    if (found) updateSettings({ location: found });
    onBack();
  };

  return (
    <div>
      <div className="space-y-2 border-b border-hairline p-4">
        <button type="button" onClick={locate} disabled={locating} className="btn btn--primary w-full">
          <Compass className={cn('h-4 w-4', locating && 'animate-spin')} aria-hidden="true" />
          {locating ? 'جارٍ تحديد الموقع…' : 'تحديد موقعي تلقائيًا (GPS)'}
        </button>
        <div className="relative">
          <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن ولاية أو مدينة…"
            aria-label="البحث عن ولاية أو مدينة"
            className="w-full rounded-sm border border-hairline bg-raised py-2 pe-9 ps-3 text-body text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
          />
        </div>
        <button type="button" onClick={onBack} className="btn btn--ghost min-h-9! w-full">
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          رجوع إلى الإعدادات
        </button>
      </div>

      <div className="p-4">
        <h3 className="text-caption font-semibold text-ink-3">الولايات الجزائرية (58)</h3>
        <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {wilayas.map((w) => (
            <CityButton key={w.name} name={w.name} sub={w.country} selected={location.name === w.name} onClick={() => pick(w.name)} />
          ))}
        </div>
        {wilayas.length === 0 && <p className="py-3 text-label text-ink-3">لا نتائج بين الولايات</p>}

        <h3 className="mt-5 text-caption font-semibold text-ink-3">عواصم ومدن إسلامية</h3>
        <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {cities.map((c) => (
            <CityButton
              key={c.name}
              name={c.name}
              sub={c.country}
              selected={location.name === c.name}
              onClick={() => pick(c.name)}
            />
          ))}
        </div>
        {cities.length === 0 && <p className="py-3 text-label text-ink-3">لا نتائج بين المدن</p>}
      </div>
    </div>
  );
}

function CityButton({
  name,
  sub,
  selected,
  onClick,
}: {
  name: string;
  sub?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex min-h-11 items-center justify-between gap-1 rounded-sm border px-2.5 py-1.5 text-start text-label transition-colors',
        selected ? 'border-accent bg-accent-soft font-semibold text-accent-ink' : 'border-hairline text-ink hover:border-accent',
      )}
    >
      <span className="min-w-0">
        <span className="block truncate">{name}</span>
        {sub && sub !== 'الجزائر' && <span className="block truncate text-caption text-ink-3">{sub}</span>}
      </span>
      {selected && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
    </button>
  );
}
