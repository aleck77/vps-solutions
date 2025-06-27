
import Link from 'next/link';
import { Facebook, Twitter, Linkedin } from 'lucide-react';
import type { MenuItem } from '@/types';

export default function Footer({ footerLinks }: { footerLinks: MenuItem[] }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-headline font-semibold text-primary mb-2">VHost Solutions</h3>
            <p className="text-muted-foreground text-sm">
              Providing reliable and scalable VPS hosting for your business needs.
            </p>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-1 text-sm">
              {footerLinks.map(link => (
                 <li key={link.href}>
                    <Link href={link.href} className="text-muted-foreground hover:text-primary">
                        {link.label}
                    </Link>
                 </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-2">Connect With Us</h4>
            <div className="flex space-x-3">
              <Link href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-6 w-6" />
              </Link>
              <Link href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} VHost Solutions. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
