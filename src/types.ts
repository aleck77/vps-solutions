
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
}

// For creating new posts, some fields are set by the server or have defaults
export type NewBlogPost = Omit<BlogPost, 'id' | 'date' | 'createdAt' | 'updatedAt'> & {
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};


export type BlogCategoryType = "AI" | "No-code" | "Webcode" | "Automation" | "Tools" | "Cloud Hosting";
export const blogCategories: BlogCategoryType[] = ["AI", "No-code", "Webcode", "Automation", "Tools", "Cloud Hosting"];

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
