
import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/firestoreBlog';
import RecommendedPosts from '@/components/blog/RecommendedPosts';
import EditPostLinkClient from '@/components/blog/EditPostLinkClient';
import { CalendarDays, UserCircle, Tag } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

interface PostPageProps {
  params: {
    slug: string;
  };
}

// Async component to fetch and display the actual post data
async function PostDisplay({ slug }: { slug: string }) {
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="grid md:grid-cols-12 gap-8 items-start">
      <div className="md:col-span-9 space-y-8">
        <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-card p-6 sm:p-8 rounded-lg shadow-lg">
          <header className="mb-8 border-b pb-6">
            <h1 className="font-headline text-3xl sm:text-4xl font-bold text-primary !mb-3">{post.title}</h1>
            <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-2">
              <span className="flex items-center"><CalendarDays className="h-4 w-4 mr-1.5" /> Published on {new Date(post.date as any).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="flex items-center"><UserCircle className="h-4 w-4 mr-1.5" /> By {post.author}</span>
              {post.category && (
                <span className="flex items-center">
                  <Tag className="h-4 w-4 mr-1.5" /> Category: <a href={`/blog/category/${post.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:underline text-accent">{post.category}</a>
                </span>
              )}
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="mt-4 text-sm">
                <strong className="text-muted-foreground">Tags:</strong>
                {post.tags.map(tag => (
                  <a
                    key={tag}
                    href={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                    className="ml-2 px-2.5 py-1 bg-muted text-muted-foreground rounded-full hover:bg-accent/20 hover:text-accent transition-colors text-xs font-medium"
                  >
                    {tag}
                  </a>
                ))}
              </div>
            )}
          </header>
          {post.imageUrl && (
            <div className="relative w-full aspect-[16/9] mb-8 rounded-md overflow-hidden shadow-md">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 900px"
                data-ai-hint={post.dataAiHint || "blog header image"}
              />
            </div>
          )}
          <div
            className="prose-p:text-foreground prose-headings:text-primary prose-strong:text-foreground prose-a:text-accent hover:prose-a:text-accent/80"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
        <div className="mt-8">
          <EditPostLinkClient postId={post.id} />
        </div>
      </div>
      <aside className="md:col-span-3 space-y-6 sticky top-24">
        <RecommendedPosts currentPostId={post.id} currentPostContent={post.content} />
      </aside>
    </div>
  );
}

// Skeleton component for loading state
function PostSkeleton() {
  return (
    <div className="grid md:grid-cols-12 gap-8 items-start">
      <div className="md:col-span-9 space-y-8">
        <div className="prose dark:prose-invert lg:prose-xl max-w-none bg-card p-6 sm:p-8 rounded-lg shadow-lg">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <div className="flex gap-4 mb-6">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-5 w-1/4" />
          </div>
          <Skeleton className="w-full aspect-[16/9] rounded-md mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
      <aside className="md:col-span-3 space-y-6 sticky top-24">
         <Skeleton className="h-64 w-full rounded-lg" />
      </aside>
    </div>
  );
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const slug = params.slug;
  if (!slug) return { title: 'Post Not Found' };

  const post = await getPostBySlug(slug);
  if (!post) {
    return {
      title: 'Post Not Found | VHost Solutions',
      description: 'The blog post you are looking for could not be found.',
    };
  }
  return {
    title: `${post.title} | VHost Solutions Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      // @ts-ignore
      publishedTime: new Date(post.date as any).toISOString(),
      authors: [post.author],
      images: [{ url: post.imageUrl }],
    },
  };
}

// Main page component is now synchronous
export default function PostPage({ params }: PostPageProps) {
  const { slug } = params;

  return (
    <Suspense fallback={<PostSkeleton />}>
      <PostDisplay slug={slug} />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}
