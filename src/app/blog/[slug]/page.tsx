
import Image from 'next/image';
import Link from 'next/link';
import type { BlogPost } from '@/types';
import { CalendarDays, UserCircle, Tag, ArrowLeft, TagsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import RecommendedPosts from '@/components/blog/RecommendedPosts';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPostSlugs } from '@/lib/firestoreBlog';
import EditPostLinkClient from '@/components/blog/EditPostLinkClient';
import { Badge } from '@/components/ui/badge'; // For tag display

interface PostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return { title: 'Post Not Found' };
  }
  return {
    title: `${post.title} | VHost Solutions Blog`,
    description: post.excerpt,
    keywords: post.tags?.join(', '),
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
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
                <Tag className="h-4 w-4 mr-1" />{post.category}
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
              {post.tags.map(tagSlug => (
                <Button key={tagSlug} variant="outline" size="sm" asChild>
                  <Link href={`/blog/tag/${tagSlug}`}>
                    #{tagSlug.replace(/-/g, ' ')} {/* Display slightly nicer */}
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
