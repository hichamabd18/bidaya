import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'اليوم النبوي ووظائف العام - الدليل الشامل للاقتداء والتعبد وتزكية النفس',
  description: 'الدليل الشامل للاقتداء والتعبد وتزكية النفس وفق السنن النبوية الشريفة ووظائف مواسم العام ومتتبع العادات الإيمانية',
  openGraph: {
    title: 'اليوم النبوي ووظائف العام - الدليل الشامل للاقتداء والتعبد وتزكية النفس',
    description: 'الدليل الشامل للاقتداء والتعبد وتزكية النفس وفق السنن النبوية الشريفة ووظائف مواسم العام ومتتبع العادات الإيمانية',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'اليوم النبوي ووظائف العام - الدليل الشامل للاقتداء والتعبد وتزكية النفس',
    description: 'الدليل الشامل للاقتداء والتعبد وتزكية النفس وفق السنن النبوية الشريفة ووظائف مواسم العام ومتتبع العادات الإيمانية',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#f6f1e7" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased selection:bg-[#a97c34] selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
