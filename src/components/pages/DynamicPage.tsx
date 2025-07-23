import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/firestoreBlog';
import PageRenderer from './PageRenderer';

interface DynamicPageProps {
    slug: string;
}

export default async function DynamicPage({ slug }: DynamicPageProps) {
  const pageData = await getPageBySlug(slug);

  if (!pageData) {
    notFound();
  }
  
  return <PageRenderer pageData={pageData} />;
}
