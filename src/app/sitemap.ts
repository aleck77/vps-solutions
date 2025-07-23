
import { MetadataRoute } from 'next'
import { getAllPublishedPosts, getAllCategories, getAllUniqueTagSlugs } from '@/lib/firestoreBlog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vhost.solutions';

  // 1. Статические страницы
  const staticRoutes = [
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

  // 2. Динамические страницы постов
  const posts = await getAllPublishedPosts();
  const postRoutes = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt), // CORRECTED: Create a new Date from the ISO string
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 3. Динамические страницы категорий
  const categories = await getAllCategories();
  const categoryRoutes = categories.map((category) => ({
    url: `${siteUrl}/blog/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // 4. Динамические страницы тегов
  const tags = await getAllUniqueTagSlugs();
  const tagRoutes = tags.map((tagSlug) => ({
      url: `${siteUrl}/blog/tag/${tagSlug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
  }));

  return [
      ...staticRoutes,
      ...postRoutes,
      ...categoryRoutes,
      ...tagRoutes,
  ];
}
