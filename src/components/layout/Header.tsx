
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Server, Newspaper, Users, Mail, Menu, LogIn, LogOut, Briefcase } from 'lucide-react';
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

const mobileMenuDescriptionId = "mobile-menu-description";

// A client component to render a single navigation link.
function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-foreground hover:text-primary transition-colors font-medium">
      {label}
    </Link>
  );
}

// A client component to render a single mobile navigation link.
function MobileNavLink({ href, label }: { href: string; label: string }) {
  // A map from label to icon component
  const iconMap: { [key: string]: React.ReactNode } = {
    'Home': <Server className="h-5 w-5" />,
    'Blog': <Newspaper className="h-5 w-5" />,
    'Order VPS': <Briefcase className="h-5 w-5" />,
    'About Us': <Users className="h-5 w-5" />,
    'Contact': <Mail className="h-5 w-5" />,
  };
  const icon = iconMap[label] || <Server className="h-5 w-5" />;

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


export default function Header({ navItems }: { navItems: MenuItem[] }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    // Moved here to ensure it's only called on client-side
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

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            src="/images/vhost-logo.svg"
            alt="VHost Solutions Logo" 
            width={40} 
            height={40} 
            priority 
          />
          <span className="text-2xl font-headline font-bold text-primary">
            VHost Solutions
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-4 items-center">
          {navItems.map((link) => (
            <NavLink key={link.label} href={link.href} label={link.label} />
          ))}
          {!loading && user ? (
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          ) : (
            <NavLink href="/admin/dashboard" label="Admin" />
          )}
          <Button asChild variant="default">
            <Link href="/order">Get Started</Link>
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
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
                        src="/images/vhost-logo.svg"
                        alt="VHost Solutions Logo"
                        width={32}
                        height={32}
                      />
                      <span>VHost Solutions</span>
                  </Link>
                </SheetTitle>
                <SheetDescription id={mobileMenuDescriptionId} className="sr-only">
                  Mobile navigation menu for VHost Solutions.
                </SheetDescription>
              </SheetHeader>
              <div className="p-6">
                <nav className="flex flex-col space-y-3">
                  {navItems.map((link) => (
                    <MobileNavLink key={link.label} href={link.href} label={link.label} />
                  ))}
                  <div className="pt-2 border-t">
                    {!loading && user ? (
                      <SheetClose asChild>
                         <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted transition-colors text-lg font-medium w-full text-left"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Logout</span>
                        </button>
                      </SheetClose>
                    ) : (
                      <SheetClose asChild>
                         <Link
                          href="/admin/dashboard"
                          className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted transition-colors text-lg font-medium"
                        >
                          <LogIn className="h-5 w-5" />
                          <span>Admin Login</span>
                        </Link>
                      </SheetClose>
                    )}
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
