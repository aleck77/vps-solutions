
import PostCard from '@/components/blog/PostCard';
import CategoryFilter from '@/components/blog/CategoryFilter';
import type { BlogPost } from '@/types';
import { blogCategories } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import RecommendedPosts from '@/components/blog/RecommendedPosts';
import { getPostsByCategory } from '@/lib/firestoreBlog';
import { notFound } from 'next/navigation';
import { slugify, unslugify } from '@/lib/utils';
import type { Metadata } from 'next';

interface CategoryPageProps {
  params: {
    categoryName: string;
  };
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  // Возвращаем пустой массив, чтобы Next.js не пытался ничего предрендерить,
  // все будет генерироваться динамически.
  return [];
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categoryName = params.categoryName; // Direct access
  console.log('[CategoryPage generateMetadata] Received categoryName from props.params:', categoryName);

  if (typeof categoryName !== 'string' || categoryName.trim() === '') {
    return {
      title: 'Invalid Category | VHost Solutions Blog',
      description: 'The requested blog category was not found or is invalid.',
    };
  }
  
  const originalCategory = blogCategories.find(cat => slugify(cat) === categoryName);
  const categoryTitleText = originalCategory ? unslugify(originalCategory) : unslugify(categoryName); 

  return {
    title: `Blog Category: ${categoryTitleText} | VHost Solutions`,
    description: `Browse posts in the ${categoryTitleText} category.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categoryName = params.categoryName; // Direct access
  console.log('[CategoryPage] Received categoryName from props.params:', categoryName);

  if (typeof categoryName !== 'string' || categoryName.trim() === '') {
    console.error('[CategoryPage] Invalid or missing categoryName in params:', { categoryName }); 
    notFound();
  }

  const posts = await getPostsByCategory(categoryName);

  const originalCategory = blogCategories.find(cat => slugify(cat) === categoryName);
  const categoryTitleText = originalCategory ? unslugify(originalCategory) : unslugify(categoryName); 

  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-primary/5 rounded-lg">
        <h1 className="text-4xl font-bold font-headline text-primary mb-4">
          Blog Category: {categoryTitleText}
        </h1>
        <p className="text-xl text-foreground max-w-2xl mx-auto">
          Posts related to {categoryTitleText}.
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
        </div>
        <aside className="md:col-span-3 space-y-6">
          <RecommendedPosts currentPostId={null} /> 
        </aside>
      </div>
    </div>
  );
}

export const revalidate = 60;
