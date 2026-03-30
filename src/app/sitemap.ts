import type { MetadataRoute } from 'next';
import {
  getAllPublishedPosts,
  getAllCategories,
  getAllUniqueTagSlugs,
} from '@/lib/firestoreBlog';

// Guard: если Firebase не сконфигурирован при билде — возвращаем минимальный sitemap
// Next.js инлайнит NEXT_PUBLIC_* только если они переданы как ARG в Dockerfile
const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://vps.artelegis.com.ua';

// Статические страницы — всегда доступны, не зависят от Firebase
const staticRoutes: MetadataRoute.Sitemap = [
  '',
  '/about',
  '/blog',
  '/contact',
  '/order',
  '/privacy-policy',
  '/terms-of-service',
].map((route) => ({
  url: `${siteUrl}${route}`,
  lastModified: new Date(),
  changeFrequency: 'monthly' as const,
  priority: route === '' ? 1.0 : 0.8,
}));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // При билде без Firebase env — возвращаем только статику, не падаем
  if (!isFirebaseConfigured) {
    console.warn('[sitemap] NEXT_PUBLIC_FIREBASE_PROJECT_ID not set — returning static routes only');
    return staticRoutes;
  }

  try {
    const [posts, categories, tags] = await Promise.all([
      getAllPublishedPosts(),
      getAllCategories(),
      getAllUniqueTagSlugs(),
    ]);

    const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${siteUrl}/blog/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    const tagRoutes: MetadataRoute.Sitemap = tags.map((tagSlug) => ({
      url: `${siteUrl}/blog/tag/${tagSlug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));

    return [...staticRoutes, ...postRoutes, ...categoryRoutes, ...tagRoutes];
  } catch (error) {
    // Если Firebase доступен но упал — не роняем весь билд
    console.error('[sitemap] Failed to fetch dynamic routes:', error);
    return staticRoutes;
  }
}