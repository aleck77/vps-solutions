'use client';

import { useParams } from 'next/navigation';
import DynamicPage from '@/components/pages/DynamicPage';

// This component will render any dynamically created page that doesn't have a
// dedicated file-based route.
export default function CatchAllPage() {
  const params = useParams();
  // The slug can be a string or an array of strings if it's a catch-all route.
  // We're expecting a single slug here.
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  if (!slug) {
    // This case might not be hit if Next.js ensures slug is always present, but it's good for safety.
    return null; 
  }

  // The DynamicPage component handles fetching data based on the slug,
  // showing a loading state, and calling notFound() if the page doesn't exist.
  return <DynamicPage slug={slug} />;
}
