
import PostCard from '@/components/blog/PostCard';
import CategoryFilter from '@/components/blog/CategoryFilter';
import type { BlogPost } from '@/types';
import { blogCategories } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import RecommendedPosts from '@/components/blog/RecommendedPosts';
import { getPostsByCategory } from '@/lib/firestoreBlog';
import { notFound } from 'next/navigation';
import { slugify, unslugify } from '@/lib/utils'; // Imported unslugify

interface CategoryPageProps {
  params: {
    categoryName: string; 
  };
}

export async function generateStaticParams() {
  return blogCategories.map((category) => ({
    categoryName: slugify(category), 
  }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  // Destructure categoryName directly from params
  const { categoryName: categoryNameParam } = params; 

  if (typeof categoryNameParam !== 'string' || categoryNameParam.trim() === '') {
    return {
      title: 'Invalid Category | VHost Solutions Blog',
      description: 'The requested blog category was not found or is invalid.',
    };
  }
  
  const originalCategory = blogCategories.find(cat => slugify(cat) === categoryNameParam);
  // Use unslugify to get a more readable title if the original name had spaces/caps
  const categoryTitle = originalCategory ? unslugify(originalCategory) : unslugify(categoryNameParam); 

  return {
    title: `Blog Category: ${categoryTitle} | VHost Solutions`,
    description: `Browse posts in the ${categoryTitle} category.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // Destructure categoryName directly from params
  const { categoryName: categoryNameParam } = params;

  if (typeof categoryNameParam !== 'string' || categoryNameParam.trim() === '') {
    console.error('[CategoryPage] Invalid or missing categoryName in params:', params);
    notFound();
    return null; 
  }

  const categorySlug = categoryNameParam; 
  const posts = await getPostsByCategory(categorySlug);

  const originalCategory = blogCategories.find(cat => slugify(cat) === categorySlug);
  const categoryTitle = originalCategory ? unslugify(originalCategory) : unslugify(categorySlug); 

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

    