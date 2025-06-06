import Link from 'next/link';
import { Server, Briefcase, Newspaper, Users, Mail, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from '@/components/ui/sheet';
import * as React from 'react';

const navLinks = [
  { href: '/', label: 'Home', icon: <Server className="h-5 w-5" /> },
  { href: '/blog', label: 'Blog', icon: <Newspaper className="h-5 w-5" /> },
  { href: '/order', label: 'Order VPS', icon: <Briefcase className="h-5 w-5" /> },
  { href: '/about', label: 'About Us', icon: <Users className="h-5 w-5" /> },
  { href: '/contact', label: 'Contact', icon: <Mail className="h-5 w-5" /> },
];

export default function Header() {
  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-headline font-bold text-primary">
          VHost Solutions
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-4 items-center">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-foreground hover:text-primary transition-colors font-medium">
              {link.label}
            </Link>
          ))}
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
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-card">
              <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                  <SheetTitle asChild>
                    <Link href="/" className="text-xl font-headline font-bold text-primary">
                       VHost Solutions
                    </Link>
                  </SheetTitle>
                   <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-6 w-6" />
                        <span className="sr-only">Close menu</span>
                      </Button>
                    </SheetClose>
                </div>
                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted transition-colors text-lg"
                      >
                        {link.icon}
                        <span>{link.label}</span>
                      </Link>
                    </SheetClose>
                  ))}
                   <SheetClose asChild>
                    <Button asChild variant="default" className="mt-6 w-full">
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
