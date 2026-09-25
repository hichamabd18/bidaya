'use client';

import React from 'react';
import { Copy, Share2, Sparkles } from 'lucide-react';
import { useApp } from '@/components/providers/AppProvider';
import { useToast } from '@/components/ui/Toast';
import { copyText, shareDevotionalContent } from '@/lib/native';
import type { LibraryEntry } from '@/lib/library';

/** جزر تفاعل صفحة القراءة — نسخ ومشاركة وتسبيح */
export function ArticleActions({ entry }: { entry: LibraryEntry }) {
  const { openTasbeeh } = useApp();
  const { show } = useToast();

  const plainText = [
    entry.title,
    entry.scripture ? `\n« ${entry.scripture} »` : '',
    ...entry.sections.map((s) => `\n${s.label}: ${s.text}`),
    entry.source ? `\nالإسناد: ${entry.source}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const copy = async () => {
    const ok = await copyText(plainText);
    show({ message: ok ? 'نُسخ النص إلى الحافظة' : 'تعذّر النسخ في هذا المتصفح' });
  };

  const share = async () => {
    const result = await shareDevotionalContent({
      title: entry.title,
      text: entry.scripture ?? entry.sections[0]?.text,
      reward: entry.sections.find((s) => s.label.includes('الفضل'))?.text,
      facet: entry.sections.find((s) => s.label.includes('المقصد'))?.text,
      source: entry.source,
    });
    if (result === 'copied') show({ message: 'نُسخ النص إلى الحافظة' });
    if (result === 'failed') show({ message: 'تعذّرت المشاركة في هذا المتصفح' });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-hairline pt-4">
      {entry.scripture && (
        <button type="button" onClick={() => openTasbeeh({ text: entry.scripture!, title: entry.title })} className="btn btn--primary">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          التسبيح بهذا الذكر
        </button>
      )}
      <button type="button" onClick={copy} className="btn">
        <Copy className="h-4 w-4" aria-hidden="true" />
        نسخ
      </button>
      <button type="button" onClick={share} className="btn">
        <Share2 className="h-4 w-4" aria-hidden="true" />
        مشاركة
      </button>
    </div>
  );
}
