import PostCard from '@/components/blog/PostCard';
import CategoryFilter from '@/components/blog/CategoryFilter';
import { mockPosts } from '@/data/posts';
import type { BlogPost, BlogCategory } from '@/types';
import { blogCategories } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import RecommendedPosts from '@/components/blog/RecommendedPosts';

interface CategoryPageProps {
  params: {
    categoryName: string;
  };
}

// Simulate fetching posts by category
async function getPostsByCategory(categoryName: string): Promise<BlogPost[]> {
  const normalizedCategoryName = categoryName.toLowerCase();
  return mockPosts.filter(post => post.category.toLowerCase() === normalizedCategoryName);
}

export async function generateStaticParams() {
  return blogCategories.map((category) => ({
    categoryName: category.toLowerCase(),
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryName } = params;
  const posts = await getPostsByCategory(categoryName);
  const categoryTitle = blogCategories.find(cat => cat.toLowerCase() === categoryName) || categoryName;

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
          <CategoryFilter currentCategory={categoryName} />
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
          <RecommendedPosts currentPostId={null} />
        </aside>
      </div>
    </div>
  );
}

export const revalidate = 60;
