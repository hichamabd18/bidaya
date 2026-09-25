'use client';

import React, {useEffect} from 'react';
import {Header} from '@/components/shell/Header';
import {BottomNav, TasbeehFab} from '@/components/shell/BottomNav';
import {TasbeehSheet} from '@/components/shell/TasbeehSheet';
import {SettingsSheet} from '@/components/shell/SettingsSheet';
import {SearchOverlay} from '@/components/shell/SearchOverlay';
import {InstallBanner} from '@/components/shell/InstallBanner';
import {useApp} from '@/components/providers/AppProvider';

/**
 * هيكل التطبيق — طبقات الترويسة والتنقل والنوافذ.
 * المحتوى والتذييل يُمرَّران من التخطيط كعناصر خادمية (children).
 */
export function AppShell({children}: {children: React.ReactNode}) {
  const {setSearchOpen} = useApp();

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
      {/* رابط تجاوز — أول عنصر قابل للتركيز */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded-sm focus:border focus:border-accent focus:bg-raised focus:px-3 focus:py-2 focus:text-label focus:font-semibold"
      >
        تجاوز إلى المحتوى
      </a>
      <InstallBanner />
      <Header />
      <main id="main" className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-32 md:pb-16 focus:outline-none">
        {children}
      </main>
      <BottomNav />
      <TasbeehFab />
      <TasbeehSheet />
      <SettingsSheet />
      <SearchOverlay />
    </div>
  );
}
