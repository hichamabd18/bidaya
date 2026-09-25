'use client';

import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { isIOSSafariWeb } from '@/lib/native';

/** دليل التثبيت على iOS — يظهر لمستخدم Safari داخل المتصفح فقط */
export function InstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem('bidaya:ios-banner');
      if (isIOSSafariWeb() && !dismissed) setShow(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem('bidaya:ios-banner', '1');
  };

  return (
    <div className="relative z-20 border-b border-hairline bg-raised px-4 py-2.5 text-label text-ink">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <p className="min-w-0 leading-relaxed">
          <span className="font-semibold text-accent-ink">تثبيت التطبيق: </span>
          <span className="text-ink-2">
            اضغط زر المشاركة
            <Plus className="mx-0.5 inline-block h-3.5 w-3.5 -translate-y-px text-accent" aria-hidden="true" />
            ثم «إضافة إلى الشاشة الرئيسية»
          </span>
        </p>
        <button type="button" onClick={dismiss} className="btn-icon h-8! w-8! shrink-0" aria-label="إغلاق دليل التثبيت">
          <X className="h-4! w-4!" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
