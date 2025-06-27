
import type { Timestamp } from 'firebase/firestore';

export interface BlogPost {
  id?: string; // Firestore document ID
  slug: string;
  title: string;
  date: string; // Changed from Date | Timestamp to string for serializability
  author: string;
  category: string; // This will store the category SLUG
  excerpt: string;
  content: string;
  imageUrl: string;
  tags?: string[];
  published: boolean;
  createdAt: string; // Changed from Date | Timestamp to string
  updatedAt: string; // Changed from Date | Timestamp to string
  dataAiHint?: string;
}

// For creating new posts, some fields are set by the server or have defaults
export type NewBlogPost = Omit<BlogPost, 'id' | 'date' | 'createdAt' | 'updatedAt'> & {
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};


export type BlogCategoryType = "AI" | "No-code" | "Vibe coding" | "Automation" | "Tools" | "Cloud Hosting";
export const blogCategories: BlogCategoryType[] = ["AI", "No-code", "Vibe coding", "Automation", "Tools", "Cloud Hosting"];

export interface Category {
  id?: string; // Firestore document ID
  name: string;
  slug: string;
}

export interface Subscriber {
  id?: string; // Firestore document ID
  email: string;
  subscribedAt: Timestamp;
}

export interface VPSPlan {
  id?: string; // Firestore document ID, now optional
  name: string;
  cpu: string;
  ram: string;
  storage: string;
  bandwidth: string;
  priceMonthly: number;
  features: string[];
}

// --- Headless Page Content Types ---

interface BaseBlock {
  type: string;
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  level: number;
  text: string;
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  text: string;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  url: string;
  alt: string;
  dataAiHint?: string;
}

export interface ValueCardBlock extends BaseBlock {
  type: 'value_card';
  icon: string;
  title: string;
  text: string;
}

export type ContentBlock = HeadingBlock | ParagraphBlock | ImageBlock | ValueCardBlock;

export interface PageData {
  id?: string; // This will be the slug, e.g., "about"
  title: string;
  metaDescription: string;
  contentBlocks: ContentBlock[];
  updatedAt?: string; // Changed from Date | Timestamp to string
  createdAt?: string; // Changed from Date | Timestamp to string
}

// --- Navigation Types ---
export interface MenuItem {
  id?: string; // Optional temporary ID for dnd-kit
  label: string;
  href: string;
  // In the future, we can add `children: MenuItem[]` for sub-menus
}

export interface NavigationMenu {
  id?: string; // e.g., 'header-nav', 'footer-links'
  items: MenuItem[];
}

// --- Site Settings Types ---
export interface HomepageFeature {
  id?: string; // For DND keying
  icon: string; // lucide icon name
  title: string;
  description: string;
}

export interface HeroBlock {
  type: 'hero';
  id: string; // For DND keying
  heroTitle: string;
  heroSubtitle: string;
}

export interface FeaturesBlock {
  type: 'features';
  id: string; // For DND keying
  featuresTitle: string;
  features: HomepageFeature[];
}

export interface CtaBlock {
  type: 'cta';
  id: string; // For DND keying
  ctaTitle: string;
  ctaSubtitle: string;
}

export type HomepageContentBlock = HeroBlock | FeaturesBlock | CtaBlock;

export interface HomepageContent {
  id?: 'homepage';
  contentBlocks: HomepageContentBlock[];
}

export interface ContactInfo {
  id?: 'contact_info';
  address: string;
  salesEmail: string;
  supportEmail: string;
  phone: string;
  salesHours: string;
  supportHours: string;
}

export type SocialLinkName = 'Facebook' | 'Twitter' | 'LinkedIn';
export interface SocialLink {
  name: SocialLinkName;
  href: string;
}

export interface FooterContent {
  id?: 'footer';
  description: string;
  copyright: string;
  socialLinks: SocialLink[];
}

export interface GeneralSettings {
  id?: 'general';
  siteName: string;
  logoUrl: string;
}
