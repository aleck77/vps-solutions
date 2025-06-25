import type { Timestamp } from 'firebase/firestore';

export interface BlogPost {
  id?: string; // Firestore document ID
  slug: string;
  title: string;
  date: Date | Timestamp; // Changed to allow Date for client-side processing, Firestore will store Timestamp
  author: string;
  category: string; // This will store the category SLUG
  excerpt: string;
  content: string;
  imageUrl: string;
  tags?: string[];
  published: boolean;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  dataAiHint?: string; // RESTORED
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
  id: string;
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
  icon: 'zap' | 'users' | 'shield_check';
  title: string;
  text: string;
}

export type ContentBlock = HeadingBlock | ParagraphBlock | ImageBlock | ValueCardBlock;

export interface PageData {
  id?: string;
  title: string;
  metaDescription: string;
  contentBlocks: ContentBlock[];
}
