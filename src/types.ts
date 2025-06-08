import type { Timestamp } from 'firebase/firestore';

export interface BlogPost {
  id?: string; // Firestore document ID, optional here as it's set by Firestore
  slug: string;
  title: string;
  date: Timestamp; // Publication date
  author: string;
  category: string; // Should match a slug from Categories collection
  excerpt: string;
  content: string;
  imageUrl: string;
  tags?: string[];
  published: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

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
