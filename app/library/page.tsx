import type { Metadata } from 'next';
import { LibraryIndex } from '@/components/library/LibraryIndex';

export const metadata: Metadata = {
  title: 'المكتبة',
  description: 'سنن المناسبات والأحوال، أصول سياسة النفس، وفقه الأذكار — موثقة',
};

export default function LibraryPage() {
  return <LibraryIndex />;
}
