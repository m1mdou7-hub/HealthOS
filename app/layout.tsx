export const dynamic = 'force-dynamic';
import { Metadata, Viewport } from 'next';
import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PropsWithChildren, Suspense } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { getDirection } from '@/i18n/config';
import { getURL } from '@/utils/helpers';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import '@/styles/main.css';
import ReactQueryProvider from '@/components/providers/ReactQueryProvider';
import PWAProvider from '@/components/providers/PWAProvider';

const title = 'HealthOS';
const description = 'HealthOS - Commercial Healthcare Operating System.';

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  title: title,
  description: description,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HealthOS',
  },
  openGraph: {
    title: title,
    description: description
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'msapplication-TileColor': '#10b981',
    'msapplication-tap-highlight': 'no',
  }
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const supabase = createClient();
  const user = await getUser(supabase);

  // Resolve the active locale (from the NEXT_LOCALE cookie, default Arabic) and
  // set the document direction dynamically so RTL/LTR is applied app-wide.
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir}>
      <body className="bg-black">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ReactQueryProvider>
            {/* PWA: Service Worker registration, offline strip, install banner */}
            <PWAProvider />

            {/* Render marketing navbar only if not logged in */}
            {!user && <Navbar />}

            <main
              id="skip"
              className={!user ? "min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)] bg-black" : "bg-black"}
            >
              {children}
            </main>

            {/* Render marketing footer only if not logged in */}
            {!user && <Footer />}

            <Suspense>
              <Toaster />
            </Suspense>
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
