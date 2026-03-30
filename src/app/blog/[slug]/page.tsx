
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams, notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/firestoreBlog';
import type { BlogPost } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, UserCircle, Tag } from 'lucide-react';
import EditPostLinkClient from '@/components/blog/EditPostLinkClient';
import RecommendedPosts from '@/components/blog/RecommendedPosts';
import { Skeleton } from '@/components/ui/skeleton';
import { marked } from 'marked';

// Skeleton component for loading state
function PostSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="prose dark:prose-invert lg:prose-xl max-w-none bg-card p-6 sm:p-8 rounded-lg shadow-lg">
        <header className="mb-8 border-b pb-6">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <div className="flex gap-x-4">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-5 w-1/4" />
          </div>
        </header>
        <Skeleton className="w-full h-80 mb-8 rounded-md" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    </div>
  );
}

function PostPageContent() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      if (!slug) {
        setLoading(false);
        setError('Slug not found.');
        return;
      }
      
      try {
        setLoading(true);
        const fetchedPost = await getPostBySlug(slug);
        if (fetchedPost) {
          setPost(fetchedPost);
          document.title = `${fetchedPost.title} | VHost Solutions`;
        } else {
          setError('Post not found.');
        }
      } catch (e: any) {
        setError(e.message || 'Failed to fetch post.');
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  const parsedContent = useMemo(() => {
    if (!post?.content) return '';
    try {
      // Note: `marked` can be vulnerable to XSS if not configured properly.
      // For this prototype, we trust the content from our Markdown editor.
      // In a production app, consider using a sanitizer like DOMPurify.
      return marked.parse(post.content);
    } catch (e) {
      console.error("Markdown parsing error:", e);
      return '<p>Error: Could not parse content.</p>';
    }
  }, [post?.content]);

  if (loading) {
    return <PostSkeleton />;
  }

  if (error || !post) {
    notFound();
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-8 lg:col-span-9">
            <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-card p-6 sm:p-8 rounded-lg shadow-lg">
                <header className="mb-8 border-b pb-6">
                <h1 className="font-headline text-3xl sm:text-4xl font-bold text-primary !mb-3">{post.title}</h1>
                <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-2">
                    <span className="flex items-center"><CalendarDays className="h-4 w-4 mr-1.5" /> Published on {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span className="flex items-center"><UserCircle className="h-4 w-4 mr-1.5" /> By {post.author}</span>
                    <Link href={`/blog/category/${post.category}`} className="flex items-center hover:underline text-accent">
                        <Tag className="h-4 w-4 mr-1.5" /> {post.category}
                    </Link>
                </div>
                {post.tags && post.tags.length > 0 && (
                    <div className="mt-3 text-sm text-muted-foreground">
                    Tags: {post.tags.map(tag => (
                        <Link key={tag} href={`/blog/tag/${tag}`} className="ml-1 px-2 py-0.5 bg-muted rounded-full hover:bg-accent/20 hover:text-accent transition-colors">{tag}</Link>
                    ))}
                    </div>
                )}
                </header>
                {post.imageUrl && (
                <div className="relative w-full aspect-video mb-8 rounded-md overflow-hidden shadow-md">
                    <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 720px"
                    data-ai-hint={post.dataAiHint || "blog header image"}
                    />
                </div>
                )}
                <div dangerouslySetInnerHTML={{ __html: parsedContent }} />
            </article>
            <div className="mt-8">
                <EditPostLinkClient postId={post.id} />
            </div>
        </div>
        <aside className="md:col-span-4 lg:col-span-3 space-y-6 md:sticky top-24">
             <RecommendedPosts currentPostId={post.id!} currentPostContent={post.content} />
        </aside>
    </div>
  );
}

export default function PostPage() {
  return (
    <Suspense fallback={<PostSkeleton />}>
      <PostPageContent />
    </Suspense>
  );
}
