'use client';

import React from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Sparkles} from 'lucide-react';
import {NAV_ITEMS} from '@/components/shell/Header';
import {useApp} from '@/components/providers/AppProvider';
import {cn} from '@/lib/utils';

/** شريط التنقل السفلي — أربع وجهات وزرّ المسبحة في المنتصف */
export function BottomNav() {
  const pathname = usePathname();
  const {openTasbeeh} = useApp();

  return (
    <nav
      aria-label="التنقل الرئيسي"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface/95 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] backdrop-blur-md md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pt-1">
        {NAV_ITEMS.slice(0, 2).map((item) => (
          <NavItem key={item.href} item={item} active={pathname === item.href} />
        ))}

        <div className="relative flex flex-col items-center">
          <button
            type="button"
            onClick={() => openTasbeeh()}
            aria-label="المسبحة الإلكترونية"
            className="-mt-5 flex h-13 w-13 items-center justify-center rounded-full border-4 border-page bg-accent-strong text-white shadow-overlay transition-transform active:scale-95"
          >
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </button>
          <span className="mt-0.5 text-[0.625rem] font-medium leading-none text-ink-2">المسبحة</span>
        </div>

        {NAV_ITEMS.slice(2).map((item) => (
          <NavItem key={item.href} item={item} active={pathname === item.href} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({
  item,
  active,
}: {
  item: {href: string; label: string; icon: React.ComponentType<{className?: string}>};
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 rounded-sm py-1 transition-colors',
        active ? 'font-semibold text-accent-ink' : 'text-ink-2 hover:text-ink',
      )}
    >
      <item.icon className="h-5 w-5" aria-hidden="true" />
      <span className="text-[0.625rem] leading-none">{item.label}</span>
    </Link>
  );
}

/** زر المسبحة العائم — سطح المكتب */
export function TasbeehFab() {
  const {openTasbeeh} = useApp();
  return (
    <button
      type="button"
      onClick={() => openTasbeeh()}
      aria-label="المسبحة الإلكترونية"
      className="fixed bottom-6 start-6 z-40 hidden items-center gap-2 rounded-full border border-hairline bg-raised py-3 pe-4 ps-3.5 text-label font-semibold text-accent-ink shadow-overlay transition-colors hover:border-accent md:flex"
    >
      <Sparkles className="h-4.5 w-4.5 text-accent" aria-hidden="true" />
      المسبحة
    </button>
  );
}
