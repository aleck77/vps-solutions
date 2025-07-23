import type { Metadata } from 'next';
import DynamicPage from '@/components/pages/DynamicPage';
import { getPageBySlug } from '@/lib/firestoreBlog';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('about');
  if (!page) return {};
  return {
    title: `${page.title} | VHost Solutions`,
    description: page.metaDescription,
  };
}

export default async function AboutPage() {
  // The DynamicPage component now handles all fetching, rendering, and logic.
  // It is a server component, so this page must be async.
  return <DynamicPage slug="about" />;
}
