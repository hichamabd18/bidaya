'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {usePathname, useRouter} from 'next/navigation';
import {CalendarDays, MapPin, Moon, BookOpen, Search, Settings, Sprout, Sun, Sunrise} from 'lucide-react';
import {useApp} from '@/components/providers/AppProvider';
import {useNow} from '@/lib/useNow';
import {cn} from '@/lib/utils';

export const NAV_ITEMS = [
  {href: '/', label: 'اليوم', icon: Sunrise},
  {href: '/seasons', label: 'المواسم', icon: CalendarDays},
  {href: '/library', label: 'الجامع', icon: BookOpen},
  {href: '/progress', label: 'تقدمي', icon: Sprout},
] as const;

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  if (m > 0) return `${m}:${s.toString().padStart(2, '0')}`;
  return `${s} ث`;
}

/** العدّاد الحي — الورقة الوحيدة التي تنبض كل ثانية */
function Countdown() {
  const {prayer, mounted} = useApp();
  const router = useRouter();
  const now = useNow();

  const goToTimes = () => {
    const el = document.getElementById('times');
    if (el) {
      el.scrollIntoView({behavior: 'smooth', block: 'center'});
    } else {
      router.push('/');
      setTimeout(() => document.getElementById('times')?.scrollIntoView({behavior: 'smooth', block: 'center'}), 500);
    }
  };

  if (!mounted || !now) {
    return <span className="text-label text-ink-3 tabular-nums" aria-hidden="true">—:—</span>;
  }

  const remaining = prayer.nextPrayerDate.getTime() - now;

  return (
    <button
      type="button"
      onClick={goToTimes}
      className="flex items-center gap-1.5 rounded-sm px-1 py-0.5 text-label text-ink-2 transition-colors hover:text-accent-ink"
      title={`الوقت المتبقي لصلاة ${prayer.nextPrayer} — انقر لعرض المواقيت`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
      <span className="font-medium">{prayer.nextPrayer}</span>
      <span className="tabular-nums text-ink-3">بعد {formatCountdown(remaining)}</span>
    </button>
  );
}

function DateLine() {
  const {hijri, gregorian, mounted, location, setSettingsOpen} = useApp();

  if (!mounted) {
    return (
      <div className="flex items-center gap-2" aria-hidden="true">
        <span className="h-4 w-40 rounded bg-hairline/60" />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
      <p className="font-display text-[0.9375rem] font-bold leading-none text-ink">{hijri.formattedText}</p>
      <span className="text-caption text-ink-3" dir="rtl">
        {gregorian}
      </span>
      {hijri.isWhiteDay && <span className="badge badge--accent">الأيام البيض</span>}
      {hijri.isFastingDay && <span className="badge badge--success">صيام مسنون</span>}
      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        className="flex min-h-6 items-center gap-1 text-caption text-ink-3 transition-colors hover:text-accent-ink"
        title="تغيير الموقع"
      >
        <MapPin className="h-3 w-3 shrink-0 text-accent" aria-hidden="true" />
        <span className="max-w-36 truncate">{location.name}</span>
      </button>
    </div>
  );
}

export function Header() {
  const {theme, toggleTheme, setSearchOpen, setSettingsOpen} = useApp();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-page transition-colors">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* السطر الأول: الهوية والتنقل والأدوات */}
        <div className="flex h-14 items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="بداية الهداية — الرئيسية">
            <Image
              src="/icons/icon-192.png"
              alt="شعار بداية الهداية"
              width={34}
              height={34}
              className="h-8.5 w-8.5 shrink-0 rounded-lg border border-hairline/80 object-cover shadow-xs"
              priority
            />
            <span className="truncate font-display text-[1.125rem] font-bold leading-none">بداية الهداية</span>
          </Link>

          {/* تنقل سطح المكتب */}
          <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-9 items-center gap-1.5 rounded-sm px-3 text-label transition-colors',
                    active ? 'bg-accent-soft font-semibold text-accent-ink' : 'text-ink-2 hover:bg-surface hover:text-ink',
                  )}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            <button type="button" onClick={() => setSearchOpen(true)} className="btn-icon" aria-label="البحث في التطبيق" title="بحث (Ctrl+K)">
              <Search aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="btn-icon"
              aria-label={theme === 'night' ? 'الوضع النهاري' : 'الوضع الليلي'}
              title={theme === 'night' ? 'ورق المخطوطة (نهاري)' : 'سماء هادئة (ليلي)'}
            >
              {theme === 'night' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </button>
            <button type="button" onClick={() => setSettingsOpen(true)} className="btn-icon" aria-label="الإعدادات" title="الإعدادات">
              <Settings aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* السطر الثاني: التاريخ والعدّاد */}
        <div className="flex items-center justify-between gap-3 border-t border-hairline py-2">
          <DateLine />
          <Countdown />
        </div>
      </div>
    </header>
  );
}
