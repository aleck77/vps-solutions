
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DynamicPage from '@/components/pages/DynamicPage';
import { getPageBySlug } from '@/lib/firestoreBlog';

type PageParams = {
  slug: string;
};

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
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
// This component is now synchronous. The async work is handled by DynamicPage.
export default function Page({ params }: { params: PageParams }) {
  const { slug } = params;

  if (!slug) {
    notFound();
  }

  // The DynamicPage component now handles fetching data based on the slug,
  // showing a loading state, and calling notFound() if the page doesn't exist.
  // Since DynamicPage is an async Server Component, this parent page doesn't need to be.
  return <DynamicPage slug={slug} />;
}
