// src/app/blog/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
// Убраны импорты, которые не используются в упрощенной версии, для чистоты теста
// import Image from 'next/image';
// import Link from 'next/link';
// import { CalendarDays, UserCircle, Tag, ArrowLeft, TagsIcon } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Separator } from '@/components/ui/separator';
// import RecommendedPosts from '@/components/blog/RecommendedPosts';
// import { getPostBySlug, getAllPostSlugs } from '@/lib/firestoreBlog';
// import EditPostLinkClient from '@/components/blog/EditPostLinkClient';
// import { Badge } from '@/components/ui/badge';
// import { unslugify } from '@/lib/utils';

interface PostPageProps {
  params: {
    slug: string;
  };
}

// Упрощенная generateStaticParams, если она нужна Next.js для определения маршрутов
// export async function generateStaticParams() {
//   // const slugs = await getAllPostSlugs(); // Пока закомментировано для упрощения
//   // return slugs.map((slug) => ({ slug }));
//   return [{ slug: 'test-post' }]; // Возвращаем хотя бы один тестовый слаг
// }

export async function generateMetadata(
  { params }: PostPageProps
): Promise<Metadata> {
  const slugFromParams = params.slug; // Просто получаем значение
  console.log('[generateMetadata] Received slug from params:', slugFromParams);

  if (!slugFromParams || typeof slugFromParams !== 'string') {
    console.warn('[generateMetadata] Slug is missing or invalid in params:', params);
    return { title: 'Post Not Found - Invalid Slug' };
  }
  // const post = await getPostBySlug(slugFromParams); // Пока закомментировано
  // if (!post) {
  //   return { title: 'Post Not Found' };
  // }
  // return {
  //   title: `${post.title} | VHost Solutions Blog`,
  //   description: post.excerpt,
  //   keywords: post.tags?.join(', '),
  // };
  return {
    title: `Post: ${slugFromParams}`,
  }
}

export default async function PostPage(
  { params }: PostPageProps
): Promise<JSX.Element> {
  const slugFromParams = params.slug; // Просто получаем значение
  console.log('[PostPage] Received slug from params:', slugFromParams);

  if (!slugFromParams || typeof slugFromParams !== 'string') {
    console.error('[PostPage] Slug is missing or invalid in params:', params);
    // notFound(); // notFound() здесь может вызывать проблемы при рендеринге, пока просто вернем ошибку
    return <div>Error: Slug is missing or invalid.</div>;
  }

  // const post = await getPostBySlug(slugFromParams); // Пока закомментировано
  // if (!post) {
  //   notFound();
  //   return <></>; // Обязательно что-то вернуть после notFound
  // }

  return (
    <div>
      <h1 className="text-3xl font-bold">Post Page for Slug: {slugFromParams}</h1>
      <p>This is a simplified test page for the slug: <strong>{slugFromParams}</strong>.</p>
      <p>Original content and components are commented out for testing purposes.</p>
      {/*
      <article className="space-y-8">
        <header className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center mb-6">
            <Button variant="outline" size="sm" asChild>
              <Link href="/blog" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
            <EditPostLinkClient postId={post.id} />
          </div>
          <Link href={`/blog/category/${post.category.toLowerCase()}`} className="text-accent font-semibold hover:underline">
            <div className="flex items-center text-sm">
                <Tag className="h-4 w-4 mr-1" />{unslugify(post.category)}
            </div>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">{post.title}</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground text-sm">
            <span className="flex items-center"><CalendarDays className="h-4 w-4 mr-1.5" /> Published on {new Date(post.date as any).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="flex items-center"><UserCircle className="h-4 w-4 mr-1.5" /> By {post.author}</span>
          </div>
        </header>

        <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
            data-ai-hint={post.title.split(' ').slice(0,2).join(' ') || post.category || "article"}
            className="object-cover"
          />
        </div>

        <Separator />

        <div
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-headline prose-headings:text-primary prose-a:text-accent hover:prose-a:text-accent/80"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold text-muted-foreground mb-3 flex items-center">
              <TagsIcon className="h-5 w-5 mr-2 text-primary" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tagSlugItem => (
                <Button key={tagSlugItem} variant="outline" size="sm" asChild>
                  <Link href={`/blog/tag/${tagSlugItem}`}>
                    #{unslugify(tagSlugItem)}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        )}
      </article>

      <Separator className="my-12" />

      <RecommendedPosts currentPostId={post.id || null} currentPostContent={post.content} />
      */}
    </div>
  );
}

// export const revalidate = 60; // Пока закомментировано
