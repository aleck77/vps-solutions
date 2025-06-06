export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  date: string;
  author: string;
  category: BlogCategory;
  excerpt: string;
  content: string;
  imageUrl: string;
  tags?: string[];
}

export type BlogCategory = "AI" | "No-code" | "Webcode" | "Automation" | "Tools" | "Cloud Hosting";

export const blogCategories: BlogCategory[] = ["AI", "No-code", "Webcode", "Automation", "Tools", "Cloud Hosting"];

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
