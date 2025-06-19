
import PostCard from '@/components/blog/PostCard';
// import CategoryFilter from '@/components/blog/CategoryFilter'; // Can be reused or a new TagFilter created
import type { BlogPost } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import RecommendedPosts from '@/components/blog/RecommendedPosts';
import { getPostsByTag, getAllUniqueTagSlugs } from '@/lib/firestoreBlog';
import { notFound } from 'next/navigation';
import { unslugify } from '@/lib/utils'; // For displaying tag name nicely
import type { Metadata } from 'next';

interface TagPageProps {
  params: {
    tagName: string;
  };
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  // Возвращаем пустой массив, чтобы Next.js не пытался ничего предрендерить,
  // все будет генерироваться динамически.
  return [];
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tagName = params.tagName; // Direct access
  console.log('[TagPage generateMetadata] Received tagName from props.params:', tagName);
  const displayName = unslugify(tagName);
  return {
    title: `Posts tagged with "${displayName}" | VHost Solutions Blog`,
    description: `Browse all blog posts tagged with "${displayName}" on VHost Solutions.`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const tagName = params.tagName; // Direct access
  console.log('[TagPage] Received tagName from props.params:', tagName);

  if (!tagName) {
    notFound();
  }

  const posts = await getPostsByTag(tagName);
  const displayName = unslugify(tagName);

  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-primary/5 rounded-lg">
        <h1 className="text-4xl font-bold font-headline text-primary mb-4">
          Tag: {displayName}
        </h1>
        <p className="text-xl text-foreground max-w-2xl mx-auto">
          Showing posts tagged with "{displayName}".
        </p>
      </section>

      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-9">
          <div className="mb-8">
            <Button variant="outline" asChild>
                <Link href="/blog">View All Posts</Link>
            </Button>
          </div>
          {posts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">No blog posts found with this tag.</p>
              <Button asChild variant="outline">
                <Link href="/blog">Back to All Posts</Link>
              </Button>
            </div>
          )}
        </div>
        <aside className="md:col-span-3 space-y-6">
          <RecommendedPosts currentPostId={null} />
        </aside>
      </div>
    </div>
  );
}

export const revalidate = 60;
