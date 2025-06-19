
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/firestoreBlog';
import RecommendedPosts from '@/components/blog/RecommendedPosts';
import EditPostLinkClient from '@/components/blog/EditPostLinkClient';
import { CalendarDays, UserCircle, Tag } from 'lucide-react';
import Image from 'next/image';

interface PostPageProps {
  params: {
    slug: string;
  };
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  // Возвращаем пустой массив, чтобы Next.js не пытался ничего предрендерить,
  // все будет генерироваться динамически.
  return [];
}

export async function generateMetadata(
  { params }: PostPageProps
): Promise<Metadata> {
  const slug = params.slug; // Direct access
  console.log('[generateMetadata] Received slug from params:', slug);

  if (!slug || typeof slug !== 'string') {
    console.warn('[generateMetadata] Slug is missing or invalid:', slug);
    return { title: 'Post Not Found' };
  }
  
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

export default async function PostPage(
  { params }: PostPageProps
): Promise<JSX.Element> {
  const slug = params.slug; // Direct access
  console.log('[PostPage] Received slug from params:', slug);

  if (!slug || typeof slug !== 'string') {
    console.error('[PostPage] Slug is missing or invalid:', slug);
    notFound();
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    console.log(`[PostPage] Post with slug "${slug}" not found, rendering notFound().`);
    notFound();
  }
  
  console.log(`[PostPage] Rendering post: "${post.title}"`);

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
        {/* @ts-ignore TODO: fix currentPostContent or type of RecommendedPostsProps */}
        <RecommendedPosts currentPostId={post.id} currentPostContent={post.content} />
      </aside>
    </div>
  );
}

export const revalidate = 60;
