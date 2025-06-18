
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPostBySlug } from '@/lib/firestoreBlog';
import RecommendedPosts from '@/components/blog/RecommendedPosts';
import { CalendarDays, UserCircle, Tag } from 'lucide-react';
import Link from 'next/link';
import EditPostLinkClient from '@/components/blog/EditPostLinkClient';

// generateStaticParams пока закомментирован для полной динамики
// export async function generateStaticParams() {
//   // const slugs = await getAllPostSlugs();
//   // return slugs.map((slug) => ({ slug }));
//   return [];
// }

export async function generateMetadata(props: any): Promise<Metadata> {
  const slug = props.params.slug as string;
  console.log('[generateMetadata] Received slug from props.params:', slug);

  if (!slug || typeof slug !== 'string') {
    console.warn('[generateMetadata] Slug is missing in params:', props.params);
    return { title: 'Post Not Found - Invalid Slug' };
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: `${post.title} | VHost Solutions Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: post.imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

export default async function PostPage(props: any): Promise<JSX.Element> {
  const slug = props.params.slug as string;
  console.log('[PostPage] Received slug from props.params:', slug);

  if (!slug || typeof slug !== 'string') {
    console.error('[PostPage] Slug is missing or invalid in params:', props.params);
    notFound();
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <article className="space-y-8">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold font-headline text-primary leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1.5" />
              Published on {new Date(post.date as any).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center">
              <UserCircle className="h-4 w-4 mr-1.5" />
              By {post.author}
            </div>
            <Link href={`/blog/category/${post.category.toLowerCase()}`} className="flex items-center hover:text-accent transition-colors">
              <Tag className="h-4 w-4 mr-1.5" />
              {post.category}
            </Link>
          </div>
          {post.id && <EditPostLinkClient postId={post.id} />}
        </header>

        {post.imageUrl && (
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              data-ai-hint={post.dataAiHint || "blog header image"}
            />
          </div>
        )}

        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">TAGS:</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/blog/tag/${tag.toLowerCase()}`}>
                  <span className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors">
                    {tag}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <aside className="mt-16">
        <RecommendedPosts currentPostId={post.id!} currentPostContent={post.content} />
      </aside>
    </div>
  );
}

export const revalidate = 60;
