import type { Metadata } from 'next';
import { LibraryIndex } from '@/components/library/LibraryIndex';

export const metadata: Metadata = {
  title: 'الجامع',
  description: 'جامع الأذكار والسنن، أصول سياسة النفس وتزكيتها، ومناسبات الأحوال — موثقة بإسنادها',
};

export default function LibraryPage() {
  return <LibraryIndex />;
}
