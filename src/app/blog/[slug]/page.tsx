
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, UserCircle, Tag as TagIcon, ArrowLeft, TagsIcon as TagsIconLucide } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import RecommendedPosts from '@/components/blog/RecommendedPosts';
import { getPostBySlug } from '@/lib/firestoreBlog';
import EditPostLinkClient from '@/components/blog/EditPostLinkClient';
import { Badge } from '@/components/ui/badge';
import { unslugify } from '@/lib/utils';
import type { BlogPost } from '@/types';

// generateStaticParams остается закомментированным для полной динамики во время отладки
// export async function generateStaticParams() {
//   // const slugs = await getAllPostSlugs();
//   // return slugs.map((slug) => ({ slug }));
//   return [];
// }

// Используем более общий тип для props, чтобы получить params
export async function generateMetadata(
  props: { params: { slug: string } }
): Promise<Metadata> {
  const slug = props.params.slug; // Прямой доступ к props.params.slug
  console.log('[generateMetadata] Received slug from params:', slug);

  if (!slug || typeof slug !== 'string') {
    console.warn('[generateMetadata] Slug is missing or invalid in params:', props.params);
    return { title: 'Post Not Found - Invalid Slug' };
  }
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: 'Post Not Found' };
  }
  return {
    title: `${post.title} | VHost Solutions Blog`,
    description: post.excerpt,
    keywords: post.tags?.join(', '),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.imageUrl ? [{ url: post.imageUrl }] : [],
      type: 'article',
      publishedTime: post.date instanceof Date ? post.date.toISOString() : new Date(post.date as any).toISOString(),
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.imageUrl ? [post.imageUrl] : [],
    },
  };
}

export default async function PostPage(
  props: { params: { slug: string } }
): Promise<JSX.Element> {
  const slug = props.params.slug; // Прямой доступ к props.params.slug
  console.log('[PostPage] Received slug from params:', slug);

  if (!slug || typeof slug !== 'string') {
    console.error('[PostPage] Slug is missing or invalid in params:', props.params);
    notFound();
    // TypeScript требует возврата JSX даже после notFound(), хотя он выбрасывает ошибку
    return <div>Error: Slug is missing or invalid.</div>; 
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
    return <div>Error: Post not found.</div>; // Для TypeScript
  }

  const displayDate = post.date instanceof Date ? post.date : new Date((post.date as any).seconds * 1000 + (post.date as any).nanoseconds / 1000000);

  return (
    <div className="max-w-3xl mx-auto">
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
                <TagIcon className="h-4 w-4 mr-1" />{unslugify(post.category)}
            </div>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">{post.title}</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground text-sm">
            <span className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1.5" />
              Published on {displayDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="flex items-center"><UserCircle className="h-4 w-4 mr-1.5" /> By {post.author}</span>
          </div>
        </header>

        {post.imageUrl && (
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden shadow-lg my-6">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw"
              className="object-cover"
              data-ai-hint={post.dataAiHint || post.title.split(' ').slice(0,2).join(' ') || "blog header"}
            />
          </div>
        )}

        <Separator />

        <div
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-headline prose-headings:text-primary prose-a:text-accent hover:prose-a:text-accent/80"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold text-muted-foreground mb-3 flex items-center">
              <TagsIconLucide className="h-5 w-5 mr-2 text-primary" />
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
    </div>
  );
}

export const revalidate = 60;
