// src/app/blog/[slug]/page.tsx
// Максимально упрощенная версия для теста params

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Убрали generateStaticParams для полной динамики в dev

// 1. Простой вариант для generateMetadata
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const slug = params.slug;
  console.log('[generateMetadata - Test Version] Received slug:', slug);

  if (!slug || typeof slug !== 'string') {
    console.warn('[generateMetadata - Test Version] Slug is missing or invalid:', slug);
    return { title: 'Post Not Found - Invalid Slug' };
  }
  // Просто возвращаем title с самим слагом для теста
  return {
    title: `Test Post: ${slug}`,
    description: `This is a test page for slug: ${slug}`,
  };
}

// 2. Простой вариант для PostPage
export default async function PostPage(
  { params }: { params: { slug: string } }
): Promise<JSX.Element> {
  const slug = params.slug;
  console.log('[PostPage - Test Version] Received slug:', slug);

  if (!slug || typeof slug !== 'string') {
    console.error('[PostPage - Test Version] Slug is missing or invalid:', slug);
    notFound();
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Test Page for Single Post</h1>
      <p>This page is intended to test the `params.slug` functionality.</p>
      <hr />
      <h2>Slug Received:</h2>
      <p style={{ fontSize: '24px', color: 'blue', fontWeight: 'bold' }}>{slug}</p>
      <hr />
      <p>
        If you see the correct slug above, it means the `params.slug` was received correctly
        by this simplified component.
      </p>
      <p>
        If the error "params should be awaited" still appears in the server console for this
        route, then the issue is likely deeper within Next.js/Turbopack or the environment.
      </p>
    </div>
  );
}

export const revalidate = 60; // Можно оставить или убрать для теста
