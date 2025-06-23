import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import slug from 'slug';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a URL-friendly slug from a string.
 * Uses the 'slug' library for robust and configurable slug generation.
 * @param text The string to slugify.
 * @returns The slugified string.
 */
export function slugify(text: string): string {
  if (!text) return '';
  // The 'slug' library handles lowercasing, replacing spaces, and removing special characters.
  return slug(text);
}

export function unslugify(slug: string): string {
  if (!slug) return '';
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
