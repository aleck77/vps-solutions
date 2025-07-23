import type { Metadata } from 'next';
import DynamicPage from '@/components/pages/DynamicPage';
import { getPageBySlug } from '@/lib/firestoreBlog';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('terms-of-service');
  if (!page) return {};
  return {
    title: `${page.title} | VHost Solutions`,
    description: page.metaDescription,
  };
}

export default async function TermsOfServicePage() {
  // The DynamicPage component handles fetching and rendering the content
  // for the 'terms-of-service' slug.
  return <DynamicPage slug="terms-of-service" />;
}
