
import type { Metadata } from 'next';
// Removed Inter and Poppins imports as they are now commented out in globals.css
// and tailwind.config.ts uses system fallbacks.
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/lib/authContext';

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
        {/* Add a link to your favicon below */}
        {/* You should place favicon.ico in the 'public' folder */}
        {/* or e.g. favicon.png in 'public/images/' and update href accordingly */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        {/* Example for a PNG favicon in public/images/: */}
        {/* <link rel="icon" href="/images/favicon.png" type="image/png" /> */}
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
