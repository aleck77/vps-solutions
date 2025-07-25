import type { Metadata } from 'next';
import DynamicPage from '@/components/pages/DynamicPage';
import { getPageBySlug } from '@/lib/firestoreBlog';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('privacy-policy');
  if (!page) return {};
  return {
    title: `${page.title} | VHost Solutions`,
    description: page.metaDescription,
  };
}

export default async function PrivacyPolicyPage() {
  // The DynamicPage component handles fetching and rendering the content
  // for the 'privacy-policy' slug.
  return <DynamicPage slug="privacy-policy" />;
}
