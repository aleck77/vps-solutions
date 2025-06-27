import Link from 'next/link';
import { Facebook, Twitter, Linkedin } from 'lucide-react';
import type { MenuItem } from '@/types';

interface FooterProps {
  footerCol1Links: MenuItem[];
  footerCol2Links: MenuItem[];
}

export default function Footer({ footerCol1Links, footerCol2Links }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-lg font-headline font-semibold text-primary mb-2">VHost Solutions</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Providing reliable and scalable VPS hosting for your business needs, backed by 24/7 support and a passion for technology.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-2">Company</h4>
            <ul className="space-y-1 text-sm">
              {footerCol1Links.map(link => (
                 <li key={link.href}>
                    <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                        {link.label}
                    </Link>
                 </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-md font-semibold mb-2">Resources</h4>
            <ul className="space-y-1 text-sm">
              {footerCol2Links.map(link => (
                 <li key={link.href}>
                    <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                        {link.label}
                    </Link>
                 </li>
              ))}
            </ul>
          </div>

        </div>
        <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center">
           <p className="text-sm text-muted-foreground mb-4 sm:mb-0">&copy; {currentYear} VHost Solutions. All rights reserved.</p>
           <div className="flex space-x-4">
              <Link href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
        </div>
      </div>
    </footer>
  );
}
