import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findLibraryEntry, libraryEntries } from '@/lib/library';
import { ScriptureBlock } from '@/components/ui/ScriptureBlock';
import { ArticleActions } from '@/components/library/ArticleActions';
import { BackButton } from '@/components/ui/BackButton';

export function generateStaticParams() {
  return libraryEntries().map((entry) => ({ id: entry.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const entry = findLibraryEntry(id);
  if (!entry) return { title: 'غير موجود' };
  const description = entry.scripture ?? entry.sections[0]?.text ?? entry.title;
  return {
    title: entry.title,
    description: description.slice(0, 155),
  };
}

/** صفحة القراءة — المحتوى أولًا، بلا طبقات زجاجية */
export default async function LibraryArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = findLibraryEntry(id);
  if (!entry) notFound();

  const isMonth = entry.kind === 'month';
  const parentHref = isMonth ? '/seasons' : '/library';
  const parentLabel = isMonth ? 'المواسم' : 'الجامع';

  return (
    <article className="mx-auto max-w-[44rem] pb-16">
      {/* شريط التنقل والعودة */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-3">
        <BackButton fallbackHref={parentHref} label="رجوع" />
        <nav aria-label="مسار التصفح" className="flex items-center gap-1.5 text-caption text-ink-3">
          <Link href={parentHref} className="underline underline-offset-2 hover:text-accent-ink">
            {parentLabel}
          </Link>
          <span aria-hidden="true"> ‹ </span>
          <span className="max-w-[200px] truncate sm:max-w-none">{entry.group}</span>
        </nav>
      </div>

      <h1 className="mt-2 font-display text-headline font-bold leading-[1.5] text-ink">{entry.title}</h1>

      {entry.scripture && (
        <div className="mt-5 border-y border-hairline py-5">
          <ScriptureBlock text={entry.scripture} source={entry.source} />
        </div>
      )}

      <div className="mt-6 space-y-5">
        {entry.sections.map((section) => (
          <section key={section.label}>
            <h2 className="mb-1.5 text-label font-semibold text-ink-3">{section.label}</h2>
            <p className="text-body leading-[1.95] text-ink">{section.text}</p>
          </section>
        ))}
      </div>

      {!entry.scripture && entry.source && (
        <p className="mt-6 border-t border-hairline pt-3 text-caption leading-relaxed text-ink-3">الإسناد: {entry.source}</p>
      )}

      <div className="mt-7">
        <ArticleActions entry={entry} />
      </div>
    </article>
  );
}
