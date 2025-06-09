
import PostCard from '@/components/blog/PostCard';
import CategoryFilter from '@/components/blog/CategoryFilter';
import type { BlogPost } from '@/types'; // Removed unused BlogCategory as blogCategories is imported directly
import { blogCategories } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import RecommendedPosts from '@/components/blog/RecommendedPosts';
import { getPostsByCategory } from '@/lib/firestoreBlog'; // Assuming this fetches from Firestore
import { notFound } from 'next/navigation'; // Ensure notFound is imported

interface CategoryPageProps {
  params: {
    categoryName: string;
  };
}

export async function generateStaticParams() {
  // Fetch categories from Firestore or use a predefined list
  // For now, using the predefined list as in previous versions
  return blogCategories.map((category) => ({
    categoryName: category.toLowerCase(), // Ensure slugs are lowercase
  }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  if (!params || typeof params.categoryName !== 'string') {
    return { title: 'Invalid Category | VHost Solutions Blog' };
  }
  const categoryName = params.categoryName;
  const categoryTitle = blogCategories.find(cat => cat.toLowerCase() === categoryName.toLowerCase()) || categoryName;
  return {
    title: `Blog Category: ${categoryTitle} | VHost Solutions`,
    description: `Browse posts in the ${categoryTitle} category.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  if (!params || !params.categoryName || typeof params.categoryName !== 'string') {
    console.error('[CategoryPage] Invalid or missing categoryName in params:', params);
    notFound();
  }

  const categorySlug = params.categoryName.toLowerCase();
  const posts = await getPostsByCategory(categorySlug);

  // Use categorySlug for display logic as well to ensure consistency
  const categoryTitle = blogCategories.find(cat => cat.toLowerCase() === categorySlug) || params.categoryName;

  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-primary/5 rounded-lg">
        <h1 className="text-4xl font-bold font-headline text-primary mb-4">
          Blog Category: {categoryTitle}
        </h1>
        <p className="text-xl text-foreground max-w-2xl mx-auto">
          Posts related to {categoryTitle}.
        </p>
      </section>
      
      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-9">
          <CategoryFilter currentCategory={categorySlug} />
          {posts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">No blog posts found in this category.</p>
              <Button asChild variant="outline">
                <Link href="/blog">Back to All Posts</Link>
              </Button>
            </div>
          )}
          {/* TODO: Add Pagination component here if many posts */}
        </div>
        <aside className="md:col-span-3 space-y-6">
          {/* Pass null or a relevant ID if applicable */}
          <RecommendedPosts currentPostId={null} /> 
        </aside>
      </div>
    </div>
  );
}

export const revalidate = 60;
