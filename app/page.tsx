import type { Metadata } from 'next';
import { TodayView } from '@/components/today/TodayView';

export const metadata: Metadata = {
  title: 'اليوم',
  description: 'المسار الزمني النبوي لليوم والليلة، مواقيت الصلاة، ومحطة الوقت الحالي',
};

export default function TodayPage() {
  return <TodayView />;
}
