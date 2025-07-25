
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Server, Newspaper, Users, Mail, Menu, LogIn, LogOut, Briefcase, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose, 
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import * as React from 'react';
import { useAuth } from '@/lib/authContext';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { MenuItem } from '@/types';
import { getAuthInstance } from '@/lib/firebase';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTheme } from 'next-themes';
import {useTranslations} from 'next-intl';
import {useLocale} from 'next-intl';


// A client component to render a single navigation link.
function NavLink({ href, label }: { href: string; label: string }) {
  const locale = useLocale();
  return (
    <Link href={`/${locale}${href}`} className="text-foreground hover:text-primary transition-colors font-medium">
      {label}
    </Link>
  );
}

// A client component to render a single mobile navigation link.
function MobileNavLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  const locale = useLocale();
  return (
    <SheetClose asChild>
      <Link
        href={`/${locale}${href}`}
        className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted transition-colors text-lg font-medium"
      >
        {icon}
        <span>{label}</span>
      </Link>
    </SheetClose>
  );
}

interface HeaderProps {
  navItems: MenuItem[];
  siteName: string;
  logoUrl: string;
}

export default function Header({ navItems, siteName, logoUrl }: HeaderProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const mobileMenuDescriptionId = React.useId();
  const t = useTranslations('Header');
  const locale = useLocale();

  const [mounted, setMounted] = React.useState(false);
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    const auth = getAuthInstance(); 
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push(`/${locale}/admin/login`);
    } catch (error: any) {
      toast({ title: 'Logout Failed', description: error.message, variant: 'destructive' });
      console.error('Logout error:', error);
    }
  };

  const translatedNavItems = [
    {href: '/', label: t('home')},
    {href: '/blog', label: t('blog')},
    {href: '/order', label: t('orderVps')},
    {href: '/about', label: t('aboutUs')},
    {href: '/contact', label: t('contact')},
  ]

  const iconMap: { [key: string]: React.ReactNode } = {
    [t('home')]: <Server className="h-5 w-5" />,
    [t('blog')]: <Newspaper className="h-5 w-5" />,
    [t('orderVps')]: <Briefcase className="h-5 w-5" />,
    [t('aboutUs')]: <Users className="h-5 w-5" />,
    [t('contact')]: <Mail className="h-5 w-5" />,
  };

  const currentLogoUrl = mounted && resolvedTheme === 'dark' ? '/images/vhost-logo-dark.svg' : logoUrl;
  
  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={`/${locale}`} className="flex items-center space-x-2 text-primary dark:text-foreground">
           {mounted ? (
            <Image 
              src={currentLogoUrl}
              alt={`${siteName} Logo`}
              width={40} 
              height={40} 
              priority
              key={currentLogoUrl} // Add key to force re-render on src change
            />
          ) : (
            <div style={{ width: 40, height: 40 }} /> // Placeholder to prevent layout shift
          )}
          <span className="text-2xl font-headline font-bold">
            {siteName}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-4 items-center">
          {translatedNavItems.map((link) => (
            <NavLink key={link.label} href={link.href} label={link.label} />
          ))}
          {!loading && isAdmin && (
            <NavLink href="/admin/dashboard" label={t('dashboard')} />
          )}
          {!loading && user ? (
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" /> {t('logout')}
            </Button>
          ) : !loading ? (
             <Button asChild variant="ghost">
                <Link href={`/${locale}/admin/login`}>{t('adminLogin')}</Link>
            </Button>
          ) : null }
          <ThemeToggle />
          <Button asChild variant="default">
            <Link href={`/${locale}/order`}>{t('getStarted')}</Link>
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] sm:w-[400px] bg-card p-0"
              aria-describedby={mobileMenuDescriptionId} 
            >
              <SheetHeader className="p-6 pb-4 border-b">
                <SheetTitle asChild>
                  <Link href={`/${locale}`} className="text-xl font-headline font-bold text-primary dark:text-foreground flex items-center space-x-2">
                     <Image 
                        src={currentLogoUrl}
                        alt={`${siteName} Logo`}
                        width={32}
                        height={32}
                        key={`mobile-${currentLogoUrl}`}
                      />
                      <span>{siteName}</span>
                  </Link>
                </SheetTitle>
                <SheetDescription id={mobileMenuDescriptionId} className="sr-only">
                  Mobile navigation menu for {siteName}.
                </SheetDescription>
              </SheetHeader>
              <div className="p-6">
                <nav className="flex flex-col space-y-3">
                  {translatedNavItems.map((link) => (
                    <MobileNavLink key={link.label} href={link.href} label={link.label} icon={iconMap[link.label] || <Server className="h-5 w-5" />} />
                  ))}
                  <div className="pt-2 border-t">
                    {!loading && isAdmin ? (
                       <>
                        <MobileNavLink href="/admin/dashboard" label={t('dashboard')} icon={<LayoutDashboard className="h-5 w-5"/>} />
                        <SheetClose asChild>
                           <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted transition-colors text-lg font-medium w-full text-left"
                          >
                            <LogOut className="h-5 w-5" />
                            <span>{t('logout')}</span>
                          </button>
                        </SheetClose>
                       </>
                    ) : !loading && user ? ( // Logged in but not admin
                       <SheetClose asChild>
                         <button
                           onClick={handleLogout}
                           className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted transition-colors text-lg font-medium w-full text-left"
                         >
                           <LogOut className="h-5 w-5" />
                           <span>{t('logout')}</span>
                         </button>
                       </SheetClose>
                    ) : !loading ? ( // Not logged in
                      <MobileNavLink href="/admin/login" label={t('adminLogin')} icon={<LogIn className="h-5 w-5" />} />
                    ) : null}
                  </div>
                  <SheetClose asChild>
                    <Button asChild variant="default" className="mt-6 w-full text-lg py-3">
                      <Link href={`/${locale}/order`}>{t('getStarted')}</Link>
                    </Button>
                  </SheetClose>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
