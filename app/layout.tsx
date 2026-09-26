import type { Metadata, Viewport } from 'next';
// خطوط مُستضافة ذاتيًا — عربية أولًا، بلا طلبات خارجية ولا انزياح تخطيط
import '@fontsource/ibm-plex-sans-arabic/arabic-400.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-500.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-700.css';
import '@fontsource/ibm-plex-sans-arabic/latin-400.css';
import '@fontsource/ibm-plex-sans-arabic/latin-500.css';
import '@fontsource/ibm-plex-sans-arabic/latin-600.css';
import '@fontsource/ibm-plex-sans-arabic/latin-700.css';
import '@fontsource/amiri/arabic-400.css';
import '@fontsource/amiri/arabic-700.css';
import '@fontsource/amiri/latin-400.css';
import '@fontsource/amiri/latin-700.css';
import './globals.css';
import { AppProvider } from '@/components/providers/AppProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { AppShell } from '@/components/shell/AppShell';
import { Footer } from '@/components/shell/Footer';

const APP_TITLE = 'بداية الهداية';
const APP_DESCRIPTION =
  'الدليل الشامل للاقتداء والتعبد وتزكية النفس وفق السنن النبوية الشريفة ووظائف مواسم العام ومتتبع العادات الإيمانية';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? 'http://localhost:3000'),
  title: {
    default: `${APP_TITLE} — الدليل الشامل للاقتداء والتعبد وتزكية النفس`,
    template: `%s · ${APP_TITLE}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_TITLE,
  openGraph: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    type: 'website',
    locale: 'ar_DZ',
  },
  twitter: {
    card: 'summary',
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'بداية الهداية',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f1e7' },
    { media: '(prefers-color-scheme: dark)', color: '#12161d' },
  ],
};

/**
 * يُطبَّع المظهر قبل الترطيب — لا وميض أبيض لمستخدم الوضع الليلي.
 */
const THEME_BOOT = `(function(){try{var s=localStorage.getItem('bidaya.v1:settings');var t=s?JSON.parse(s).theme:null;if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'night':'day';}if(t==='night'){document.documentElement.setAttribute('data-theme','night');}else if(t==='ocean'){document.documentElement.setAttribute('data-theme','ocean');}else{document.documentElement.removeAttribute('data-theme');}document.documentElement.style.colorScheme=t==='night'?'dark':'light';}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="bg-page font-ui text-ink antialiased">
        <ToastProvider>
          <AppProvider>
            <AppShell>{children}</AppShell>
          </AppProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
