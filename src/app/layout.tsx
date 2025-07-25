import type { Metadata } from 'next';
import './globals.css';
import 'easymde/dist/easymde.min.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/lib/authContext';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { ReactNode } from 'react';

// This is the root layout, it should not contain locale-specific logic.
// The locale layout will handle i18n.
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/vhost-logo.svg" type="image/svg+xml" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
