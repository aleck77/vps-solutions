
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
import { getNavigationMenu, getFooterContent, getGeneralSettings } from '@/lib/firestoreBlog';

export async function generateMetadata(): Promise<Metadata> {
  const generalSettings = await getGeneralSettings();
  const siteName = generalSettings?.siteName || 'VHost Solutions';
  
  return {
    title: `${siteName} - Premier VPS Hosting`,
    description: 'Reliable and high-performance VPS hosting solutions.',
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch navigation data on the server
  const headerNav = await getNavigationMenu('header-nav');
  const footerCol1 = await getNavigationMenu('footer-col-1');
  const footerCol2 = await getNavigationMenu('footer-col-2');
  const footerContent = await getFooterContent();
  const generalSettings = await getGeneralSettings();


  // Fallback to empty arrays if data is not found
  const headerNavItems = headerNav?.items || [];
  const footerCol1Items = footerCol1?.items || [];
  const footerCol2Items = footerCol2?.items || [];
  
  const siteName = generalSettings?.siteName || "VHost Solutions";
  const logoUrl = generalSettings?.logoUrl || "/images/vhost-logo.svg";

  return (
    <html lang="en">
       <head>
        {/* Updated favicon link to SVG */}
        <link rel="icon" href={logoUrl} type="image/svg+xml" />
        <GoogleAnalytics />
      </head>
      {/* font-body and font-headline are applied via globals.css using Tailwind's @layer base */}
      <body className="antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <Header navItems={headerNavItems} siteName={siteName} logoUrl={logoUrl} />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer 
            footerCol1Links={footerCol1Items} 
            footerCol2Links={footerCol2Items} 
            footerContent={footerContent}
          />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
