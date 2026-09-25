import type { Metadata } from 'next';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <p className="font-display text-display font-bold text-ink">الصفحة غير موجودة</p>
      <p className="text-label text-ink-3">ربما تغيّر الرابط أو سقط من الصحيح</p>
      <Link href="/" className="btn mt-2">
        العودة إلى اليوم
      </Link>
    </div>
  );
}
