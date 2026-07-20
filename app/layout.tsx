import { Metadata } from 'next';
import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PropsWithChildren, Suspense } from 'react';
import { getURL } from '@/utils/helpers';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import 'styles/main.css';

const title = 'HealthOS';
const description = 'HealthOS - Commercial Healthcare Operating System.';

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description
  }
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const supabase = createClient();
  const user = await getUser(supabase);

  return (
    <html lang="en">
      <body className="bg-black">
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
      </body>
    </html>
  );
}
