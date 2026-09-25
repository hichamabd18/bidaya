'use client';

import React, { useEffect } from 'react';
import { Header } from '@/components/shell/Header';
import { BottomNav, TasbeehFab } from '@/components/shell/BottomNav';
import { TasbeehSheet } from '@/components/shell/TasbeehSheet';
import { SettingsSheet } from '@/components/shell/SettingsSheet';
import { SearchOverlay } from '@/components/shell/SearchOverlay';
import { InstallBanner } from '@/components/shell/InstallBanner';
import { useApp } from '@/components/providers/AppProvider';
import { APP_METADATA } from '@/lib/data/meta';

/** تذييل هادئ — المصادر أولى هنا لا زرّ تصدير */
function Footer() {
  return (
    <footer className="border-t border-hairline py-6 md:mb-0 mb-16">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <p className="font-display text-label font-bold text-ink">{APP_METADATA.title}</p>
        <p className="mx-auto mt-1.5 max-w-xl text-caption leading-relaxed text-ink-3">
          {APP_METADATA.sources.slice(0, 4).join(' · ')}
          {' · وغيرها من أمهات كتب السنن والأذكار'}
        </p>
        <p className="mt-2 text-caption text-ink-3">
          مواقيت فلكية لـ ٥٨ ولاية جزائرية ومعايرة الرؤية · الإصدار {APP_METADATA.version}
        </p>
      </div>
    </footer>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { setSearchOpen } = useApp();

  // اختصار لوحة المفاتيح للبحث
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setSearchOpen]);

  return (
    <div className="flex min-h-dvh flex-col">
      <InstallBanner />
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-5 sm:px-6 md:pb-12">{children}</main>
      <Footer />
      <BottomNav />
      <TasbeehFab />
      <TasbeehSheet />
      <SettingsSheet />
      <SearchOverlay />
    </div>
  );
}
