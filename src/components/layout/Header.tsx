
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


// A client component to render a single navigation link.
function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-foreground hover:text-primary transition-colors font-medium">
      {label}
    </Link>
  );
}

// A client component to render a single mobile navigation link.
function MobileNavLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <SheetClose asChild>
      <Link
        href={href}
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

  const handleLogout = async () => {
    const auth = getAuthInstance(); 
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/admin/login');
    } catch (error: any) {
      toast({ title: 'Logout Failed', description: error.message, variant: 'destructive' });
      console.error('Logout error:', error);
    }
  };

  const iconMap: { [key: string]: React.ReactNode } = {
    'Home': <Server className="h-5 w-5" />,
    'Blog': <Newspaper className="h-5 w-5" />,
    'Order VPS': <Briefcase className="h-5 w-5" />,
    'About Us': <Users className="h-5 w-5" />,
    'Contact': <Mail className="h-5 w-5" />,
  };

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            src={logoUrl}
            alt={`${siteName} Logo`}
            width={40} 
            height={40} 
            priority 
          />
          <span className="text-2xl font-headline font-bold text-primary">
            {siteName}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-4 items-center">
          {navItems.map((link) => (
            <NavLink key={link.label} href={link.href} label={link.label} />
          ))}
          {!loading && isAdmin && (
            <NavLink href="/admin/dashboard" label="Dashboard" />
          )}
          {!loading && user ? (
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          ) : !loading ? (
             <Button asChild variant="ghost">
                <Link href="/admin/login">Admin Login</Link>
            </Button>
          ) : null }
          <ThemeToggle />
          <Button asChild variant="default">
            <Link href="/order">Get Started</Link>
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
                  <Link href="/" className="text-xl font-headline font-bold text-primary flex items-center space-x-2">
                     <Image 
                        src={logoUrl}
                        alt={`${siteName} Logo`}
                        width={32}
                        height={32}
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
                  {navItems.map((link) => (
                    <MobileNavLink key={link.label} href={link.href} label={link.label} icon={iconMap[link.label] || <Server className="h-5 w-5" />} />
                  ))}
                  <div className="pt-2 border-t">
                    {!loading && isAdmin ? (
                       <>
                        <MobileNavLink href="/admin/dashboard" label="Dashboard" icon={<LayoutDashboard className="h-5 w-5"/>} />
                        <SheetClose asChild>
                           <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted transition-colors text-lg font-medium w-full text-left"
                          >
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
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
                           <span>Logout</span>
                         </button>
                       </SheetClose>
                    ) : !loading ? ( // Not logged in
                      <MobileNavLink href="/admin/login" label="Admin Login" icon={<LogIn className="h-5 w-5" />} />
                    ) : null}
                  </div>
                  <SheetClose asChild>
                    <Button asChild variant="default" className="mt-6 w-full text-lg py-3">
                      <Link href="/order">Get Started</Link>
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
