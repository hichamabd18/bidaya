import {APP_METADATA} from '@/lib/data/meta';

/** تذييل خادمي — المصادر أولى هنا لا زرّ تصدير */
export function Footer() {
  return (
    <footer className="mb-16 border-t border-hairline py-6 md:mb-0">
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
