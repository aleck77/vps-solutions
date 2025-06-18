import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
// Важно: Полный код страницы временно убран для изоляции проблемы с params.
// Мы вернем его, как только ошибка "params should be awaited" будет решена.

// generateStaticParams пока закомментирован для полной динамики
// export async function generateStaticParams() {
//   // const slugs = await getAllPostSlugs();
//   // return slugs.map((slug) => ({ slug }));
//   return [];
// }

export async function generateMetadata(
  { params }: { params: { slug: string } } // Явная инлайн-типизация params
): Promise<Metadata> {
  const { slug } = params; // Деструктуризация slug из params
  console.log('[generateMetadata] Received slug from params:', slug);

  if (!slug || typeof slug !== 'string') {
    console.warn('[generateMetadata] Slug is missing in params:', { params });
    return { title: 'Post Not Found - Invalid Slug' };
  }
  // Минимальные метаданные для теста
  return {
    title: `Test Post: ${slug}`,
    description: `This is a test page for slug: ${slug}`,
  };
}

export default async function PostPage(
  { params }: { params: { slug: string } } // Явная инлайн-типизация params
): Promise<JSX.Element> {
  const { slug } = params; // Деструктуризация slug из params
  console.log('[PostPage] Received slug from params:', slug);

  if (!slug || typeof slug !== 'string') {
    console.error('[PostPage] Slug is missing or invalid in params:', { params });
    notFound();
    // Компонент notFound() должен сам прервать рендеринг.
    // Явная инструкция return здесь не должна быть строго необходима,
    // но для дополнительной ясности или если notFound() не работает как ожидается,
    // можно добавить: return <div>Error: Slug is missing or invalid.</div>;
  }

  // Радикально упрощенный вывод для теста
  return (
    <div>
      <h1>Test Post Page</h1>
      <p>The slug for this page is: <strong>{slug}</strong>.</p>
      <p>This is a simplified page to test params handling.</p>
    </div>
  );
}

export const revalidate = 60; // Можно оставить или убрать на время теста
