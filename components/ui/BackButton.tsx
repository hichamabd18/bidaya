'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
  className?: string;
}

/** زر العودة الذكي — يعود خطوة للوراء في سجل المتصفح أو يتجه للوجهة الافتراضية */
export function BackButton({ fallbackHref = '/library', label = 'رجوع', className }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cn(
        'inline-flex min-h-10 sm:min-h-9 items-center gap-1.5 rounded-sm border border-hairline bg-surface px-3 py-2 sm:py-1.5 text-label font-medium text-ink transition-colors hover:border-accent hover:text-accent-ink active:scale-95',
        className,
      )}
      aria-label={label}
    >
      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
