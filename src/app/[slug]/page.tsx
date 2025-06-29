import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/firestoreBlog';
import PageRenderer from '@/components/pages/PageRenderer';

type PageParams = {
  slug: string;
};

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  // Use params.slug directly in the async call
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


export default async function Page({ params }: { params: PageParams }) {
  // Use params.slug directly in the async call, removing the intermediate variable.
  const pageData = await getPageBySlug(params.slug);

  if (!pageData) {
    notFound();
  }

  return <PageRenderer pageData={pageData} />;
}
