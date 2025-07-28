import type { Metadata, ResolvingMetadata } from 'next';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import type { ReactNode } from 'react';
import { getNavigationMenu, getGeneralSettings, getFooterContent } from '@/lib/firestoreBlog';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';

const locales = ['en', 'uk'];

export async function generateMetadata({params}: {params: {locale: string}}, parent: ResolvingMetadata): Promise<Metadata> {
  const { locale } = await params; 
  setRequestLocale(locale);
  const generalSettings = await getGeneralSettings();
  const siteName = generalSettings?.siteName || 'VHost Solutions';
  
  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: 'Reliable and high-performance VPS hosting solutions.',
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{locale: string}>;
}) {
  // Ensure that the incoming `locale` is valid
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  
  setRequestLocale(locale);

  let messages;
  try {
    messages = await getMessages( {locale});
  } catch (error) {
    console.error("Could not get messages for next-intl, check configuration:", error);
    notFound();
  }

  const [headerNav, footerCol1, footerCol2, footerCol3, generalSettings, footerContent] = await Promise.all([
    getNavigationMenu('header-nav'),
    getNavigationMenu('footer-col-1'),
    getNavigationMenu('footer-col-2'),
    getNavigationMenu('footer-col-3'),
    getGeneralSettings(),
    getFooterContent(),
  ]);

  const footerMenus = {
    'footer-col-1': footerCol1?.items || [],
    'footer-col-2': footerCol2?.items || [],
    'footer-col-3': footerCol3?.items || [],
  };

  const siteName = generalSettings?.siteName || 'VHost Solutions';
  const logoUrl = generalSettings?.logoUrl || '/images/vhost-logo.svg';

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
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
