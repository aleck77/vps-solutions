import Image from 'next/image';
import Link from 'next/link';
import type { BlogPost } from '@/types';
import { CalendarDays, UserCircle, Tag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import RecommendedPosts from '@/components/blog/RecommendedPosts';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPostSlugs } from '@/lib/firestoreBlog'; // Assuming this fetches from Firestore

interface PostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs(); // Fetch slugs from Firestore
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: PostPageProps) {
  // Directly use params.slug in the async call
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return { title: 'Post Not Found' };
  }
  return {
    title: `${post.title} | VHost Solutions Blog`,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  // Directly use params.slug in the async call
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <article className="space-y-8">
        <header className="space-y-4">
          <Button variant="outline" size="sm" asChild className="mb-6">
            <Link href="/blog" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
          {/* Ensure post.category is a string (slug) */}
          <Link href={`/blog/category/${post.category.toLowerCase()}`} className="text-accent font-semibold hover:underline">
            <div className="flex items-center text-sm">
                <Tag className="h-4 w-4 mr-1" />{post.category} {/* Display category name/slug */}
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
            className="object-cover"
          />
        </div>

        <Separator />

        <div
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-headline prose-headings:text-primary prose-a:text-accent hover:prose-a:text-accent/80"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">TAGS:</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <Link key={tag} href={`/blog/tag/${tag.toLowerCase()}`} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded hover:bg-primary/10 hover:text-primary transition-colors">
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <Separator className="my-12" />

      {/* Pass post.id if available, otherwise null or handle appropriately */}
      <RecommendedPosts currentPostId={post.id || null} />
    </div>
  );
}

export const revalidate = 60;
