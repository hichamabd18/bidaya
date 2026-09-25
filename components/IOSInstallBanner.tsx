'use client';

import React, { useState, useEffect } from 'react';
import { isIOSSafariWeb } from '@/lib/native';
import { Share, PlusSquare, X } from 'lucide-react';

export const IOSInstallBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const isDismissed = sessionStorage.getItem('ios_banner_dismissed');
      if (isIOSSafariWeb() && !isDismissed) {
        setShowBanner(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('ios_banner_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div
      id="ios-install-banner"
      className="bg-[var(--bg-surface-raised)] border-b border-[var(--border-hairline)] px-4 py-2.5 text-xs text-[var(--ink-primary)] shadow-sm relative z-20 flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base">📲</span>
        <div className="min-w-0">
          <span className="font-semibold text-[var(--accent-ink)]">
            تثبيت التطبيق على الآيفون:
          </span>{' '}
          <span className="text-[var(--ink-secondary)]">
            اضغط على زر المشاركة{' '}
            <Share className="w-3.5 h-3.5 inline-block text-[var(--accent)] -mt-0.5 mx-0.5" /> ثم اختر{' '}
            <strong>«إضافة إلى الصفحة الرئيسية»</strong>{' '}
            <PlusSquare className="w-3.5 h-3.5 inline-block text-[var(--accent)] -mt-0.5 mx-0.5" />
          </span>
        </div>
      </div>

      <button
        onClick={handleDismiss}
        className="btn-close w-7 h-7 min-w-[28px] min-h-[28px]"
        title="إغلاق"
        aria-label="إغلاق التنبيه"
      >
        <X className="w-3.5 h-3.5 text-[var(--ink-secondary)] shrink-0" />
      </button>
    </div>
  );
};
