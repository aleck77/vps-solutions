
import {getMessages, unstable_setRequestLocale} from 'next-intl/server';
import {NextIntlClientProvider} from 'next-intl';
import type { ReactNode } from 'react';
import { getNavigationMenu, getGeneralSettings, getFooterContent } from '@/lib/firestoreBlog';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Define locales at a higher scope
const locales = ['en', 'uk'];

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: ReactNode;
  params: {locale: string};
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) {
      // In a real app, you'd want to handle this more gracefully,
      // maybe redirecting to a default locale. For now, we'll let it 404.
  }
  unstable_setRequestLocale(locale);
 
  // Providing all messages to the client
  // side is the easiest way to get started
  let messages;
  try {
    messages = await getMessages();
  } catch (error) {
    console.error("Could not get messages for next-intl, check configuration:", error);
    // Potentially render a fallback or a generic error page
    return <div>Error loading translations.</div>;
  }

  // Fetch navigation and settings
  const [headerNav, footerCol1, footerCol2, footerCol3, generalSettings, footerContent] = await Promise.all([
    getNavigationMenu('header-nav'),
    getNavigationMenu('footer-col-1'),
    getNavigationMenu('footer-col-2'),
    getNavigationMenu('footer-col-3'),
    getGeneralSettings(),
    getFooterContent()
  ]);

  const footerMenus = {
    'footer-col-1': footerCol1?.items || [],
    'footer-col-2': footerCol2?.items || [],
    'footer-col-3': footerCol3?.items || [],
  };
  
  const siteName = generalSettings?.siteName || 'VHost Solutions';
  const logoUrl = generalSettings?.logoUrl || '/images/vhost-logo.svg';

  return (
    <NextIntlClientProvider messages={messages}>
        <div className="flex flex-col min-h-screen">
            <Header navItems={headerNav?.items || []} siteName={siteName} logoUrl={logoUrl} />
            <main className="flex-grow container mx-auto px-4 py-8">
                {children}
            </main>
            <Footer footerMenus={footerMenus} footerContent={footerContent} />
        </div>
    </NextIntlClientProvider>
  );
}
