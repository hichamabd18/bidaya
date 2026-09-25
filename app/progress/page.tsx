import type { Metadata } from 'next';
import { ProgressView } from '@/components/progress/ProgressView';

export const metadata: Metadata = {
  title: 'صحيفتي',
  description: 'صحيفة الإنجاز اليومي والأسبوعي وسجل ثلاثين يومًا',
};

export default function ProgressPage() {
  return <ProgressView />;
}
