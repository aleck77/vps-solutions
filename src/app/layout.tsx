import type { Metadata } from 'next';
// Removed Inter and Poppins imports as they are now commented out in globals.css
// and tailwind.config.ts uses system fallbacks.
import './globals.css';
import 'easymde/dist/easymde.min.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/lib/authContext';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import { getNavigationMenu } from '@/lib/firestoreBlog';

export const metadata: Metadata = {
  title: 'VHost Solutions - Premier VPS Hosting',
  description: 'Reliable and high-performance VPS hosting solutions.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch navigation data on the server
  const headerNav = await getNavigationMenu('header-nav');
  const footerCol1 = await getNavigationMenu('footer-col-1');
  const footerCol2 = await getNavigationMenu('footer-col-2');


  // Fallback to empty arrays if data is not found
  const headerNavItems = headerNav?.items || [];
  const footerCol1Items = footerCol1?.items || [];
  const footerCol2Items = footerCol2?.items || [];

  return (
    <html lang="en">
       <head>
        {/* Updated favicon link to SVG */}
        <link rel="icon" href="/images/vhost-logo.svg" type="image/svg+xml" />
        <GoogleAnalytics />
      </head>
      {/* font-body and font-headline are applied via globals.css using Tailwind's @layer base */}
      <body className="antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <Header navItems={headerNavItems} />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer footerCol1Links={footerCol1Items} footerCol2Links={footerCol2Items} />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
