
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Server, Briefcase, Newspaper, Users, Mail, Menu, LogIn, LogOut } from 'lucide-react';
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
import { getAuthInstance } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const navLinks = [
  { href: '/', label: 'Home', icon: <Server className="h-5 w-5" /> },
  { href: '/blog', label: 'Blog', icon: <Newspaper className="h-5 w-5" /> },
  { href: '/order', label: 'Order VPS', icon: <Briefcase className="h-5 w-5" /> },
  { href: '/about', label: 'About Us', icon: <Users className="h-5 w-5" /> },
  { href: '/contact', label: 'Contact', icon: <Mail className="h-5 w-5" /> },
];

const mobileMenuDescriptionId = "mobile-menu-description";

export default function Header() {
  const { user, loading } = useAuth();
  const auth = getAuthInstance();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/admin/login');
    } catch (error: any) {
      toast({ title: 'Logout Failed', description: error.message, variant: 'destructive' });
      console.error('Logout error:', error);
    }
  };

  const adminNavLink = { href: '/admin/dashboard', label: 'Admin', icon: <LogIn className="h-5 w-5" /> };
  const allNavLinks = [...navLinks, adminNavLink];

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
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="text-foreground hover:text-primary transition-colors font-medium">
              {link.label}
            </Link>
          ))}
          {!loading && user ? (
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          ) : (
            <Link href="/admin/dashboard" className="text-foreground hover:text-primary transition-colors font-medium">
              Admin
            </Link>
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
                  Mobile navigation menu for VHost Solutions. Contains links to Home, Blog, Order VPS, About Us, Contact, and Admin pages.
                </SheetDescription>
              </SheetHeader>
              <div className="p-6">
                <nav className="flex flex-col space-y-3">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.label}>
                      <Link
                        href={link.href}
                        className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted transition-colors text-lg font-medium"
                      >
                        {link.icon}
                        <span>{link.label}</span>
                      </Link>
                    </SheetClose>
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
