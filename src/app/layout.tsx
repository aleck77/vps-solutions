
import type { Metadata } from 'next';
// Removed Inter and Poppins imports as they are now commented out in globals.css
// and tailwind.config.ts uses system fallbacks.
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/lib/authContext';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';

export const metadata: Metadata = {
  title: 'VHost Solutions - Premier VPS Hosting',
  description: 'Reliable and high-performance VPS hosting solutions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <head>
        {/* Updated favicon link to SVG */}
        <link rel="icon" href="/images/vhost-logo.svg" type="image/svg+xml" />
        <GoogleAnalytics trackingId={process.env.NEXT_PUBLIC_GA_ID || ''} />
      </head>
      {/* font-body and font-headline are applied via globals.css using Tailwind's @layer base */}
      <body className="antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
