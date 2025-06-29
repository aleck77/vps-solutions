import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DynamicPage from '@/components/pages/DynamicPage';
import { getPageBySlug } from '@/lib/firestoreBlog';

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPageBySlug(params.slug);

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: `${page.title} | VHost Solutions`,
    description: page.metaDescription,
  };
}


// This component will render any dynamically created page that doesn't have a
// dedicated file-based route.
export default async function CatchAllPage({ params }: Props) {
  const { slug } = params;

  if (!slug) {
    notFound();
  }

  // The DynamicPage component now handles fetching data based on the slug,
  // showing a loading state, and calling notFound() if the page doesn't exist.
  // Since DynamicPage is now a Server Component, this page must be async.
  return <DynamicPage slug={slug} />;
}
