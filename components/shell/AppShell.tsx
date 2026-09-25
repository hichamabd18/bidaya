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
      {children}
      <BottomNav />
      <TasbeehFab />
      <TasbeehSheet />
      <SettingsSheet />
      <SearchOverlay />
    </div>
  );
}
