
import PostCard from '@/components/blog/PostCard';
import CategoryFilter from '@/components/blog/CategoryFilter';
import type { BlogPost } from '@/types';
import { blogCategories } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import RecommendedPosts from '@/components/blog/RecommendedPosts';
import { getPostsByCategory } from '@/lib/firestoreBlog';
import { notFound } from 'next/navigation';
import { slugify } from '@/lib/utils'; // Imported slugify

interface CategoryPageProps {
  params: {
    categoryName: string; 
  };
}

export async function generateStaticParams() {
  return blogCategories.map((category) => ({
    categoryName: slugify(category), // Use slugify here
  }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const categoryNameParam = params.categoryName; 

  if (typeof categoryNameParam !== 'string' || categoryNameParam.trim() === '') {
    return {
      title: 'Invalid Category | VHost Solutions Blog',
      description: 'The requested blog category was not found or is invalid.',
    };
  }
  
  // Find original category name by comparing slugified versions
  const originalCategory = blogCategories.find(cat => slugify(cat) === categoryNameParam);
  const categoryTitle = originalCategory || categoryNameParam; // Fallback to param if no exact match

  return {
    title: `Blog Category: ${categoryTitle} | VHost Solutions`,
    description: `Browse posts in the ${categoryTitle} category.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categoryNameParam = params.categoryName; 

  if (typeof categoryNameParam !== 'string' || categoryNameParam.trim() === '') {
    console.error('[CategoryPage] Invalid or missing categoryName in params:', params);
    notFound();
    return null; 
  }

  const categorySlug = categoryNameParam; // categoryNameParam is already a slug from generateStaticParams
  const posts = await getPostsByCategory(categorySlug);

  // Find original category name by comparing slugified versions
  const originalCategory = blogCategories.find(cat => slugify(cat) === categorySlug);
  const categoryTitle = originalCategory || categorySlug; // Fallback to slug if no exact match

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
          <RecommendedPosts currentPostId={null} /> 
        </aside>
      </div>
    </div>
  );
}

export const revalidate = 60;
