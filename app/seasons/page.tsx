import type { Metadata } from 'next';
import { SeasonsView } from '@/components/seasons/SeasonsView';

export const metadata: Metadata = {
  title: 'المواسم',
  description: 'وظائف الشهور الهجرية وفصول العام — مستخلصة من لطائف المعارف لابن رجب',
};

export default function SeasonsPage() {
  return <SeasonsView />;
}
