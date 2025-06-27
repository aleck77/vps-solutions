
import Link from 'next/link';
import { Facebook, Twitter, Linkedin } from 'lucide-react';
import type { MenuItem, FooterContent, SocialLink, FooterContentBlock } from '@/types';

interface FooterProps {
  footerMenus: { [key: string]: MenuItem[] };
  footerContent: FooterContent | null;
}

const defaultFooterContent: FooterContent = {
  contentBlocks: [
    { 
      id: 'footer-text-1', 
      type: 'text', 
      title: 'VHost Solutions', 
      description: "Providing reliable and scalable VPS hosting for your business needs, backed by 24/7 support and a passion for technology." 
    },
    { 
      id: 'footer-menu-1', 
      type: 'menu', 
      title: 'Company', 
      menuId: 'footer-col-1' 
    },
    { 
      id: 'footer-menu-2', 
      type: 'menu', 
      title: 'Resources', 
      menuId: 'footer-col-2' 
    },
  ],
  copyright: "VHost Solutions. All rights reserved.",
  socialLinks: [
    { name: 'Facebook', href: '#' },
    { name: 'Twitter', href: '#' },
    { name: 'LinkedIn', href: '#' },
  ]
};

const socialIconMap: Record<SocialLink['name'], React.ElementType> = {
  'Facebook': Facebook,
  'Twitter': Twitter,
  'LinkedIn': Linkedin,
};

export default function Footer({ footerMenus, footerContent }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const content = footerContent || defaultFooterContent;

  const blocksToRender = content?.contentBlocks || [];
  const socialLinksToRender = content?.socialLinks || [];
  const copyrightText = content?.copyright || defaultFooterContent.copyright;
  
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {Array.isArray(blocksToRender) && blocksToRender.map((block, index) => {
            if (!block) return null;

            if (block.type === 'text') {
              return (
                <div key={block.id || index} className="md:col-span-2">
                  <h3 className="text-lg font-headline font-semibold text-primary mb-2">{block.title}</h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    {block.description}
                  </p>
                </div>
              );
            }
            if (block.type === 'menu') {
              const menuItems = (footerMenus && footerMenus[block.menuId]) || [];
              return (
                <div key={block.id || index}>
                  <h4 className="text-md font-semibold mb-2">{block.title}</h4>
                  <ul className="space-y-1 text-sm">
                    {Array.isArray(menuItems) && menuItems.map((link, linkIndex) => (
                       <li key={link.label || linkIndex}>
                          <Link href={link.href || '#'} className="text-muted-foreground hover:text-primary transition-colors">
                              {link.label || 'Unnamed Link'}
                          </Link>
                       </li>
                    ))}
                  </ul>
                </div>
              );
            }
            return null;
          })}
        </div>
        <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center">
           <p className="text-sm text-muted-foreground mb-4 sm:mb-0">&copy; {currentYear} {copyrightText}</p>
           <div className="flex space-x-4">
              {Array.isArray(socialLinksToRender) && socialLinksToRender.map((link, index) => {
                if (!link) return null;
                const Icon = socialIconMap[link.name];
                if (!Icon) return null;
                return (
                  <Link key={link.name || index} href={link.href || '#'} aria-label={link.name} className="text-muted-foreground hover:text-primary">
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
        </div>
      </div>
    </footer>
  );
}
