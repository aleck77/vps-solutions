
import React, { Suspense } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryPageProps {
  params: {
    categoryName: string;
  };
}

// Async component to fetch and display the actual posts
async function CategoryPostList({ categoryName }: { categoryName: string }) {
  const posts = await getPostsByCategory(categoryName);
  const categoryTitleText = unslugify(blogCategories.find(cat => slugify(cat) === categoryName) || categoryName);

  return (
    <>
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
    </>
  );
}

// Skeleton component for loading state
function CategoryPageSkeleton() {
  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-primary/5 rounded-lg">
        <Skeleton className="h-10 w-1/2 mx-auto mb-4" />
        <Skeleton className="h-6 w-3/4 mx-auto" />
      </section>
      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-9">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex flex-col space-y-3 p-4 border rounded-lg shadow-lg">
                <Skeleton className="h-48 w-full rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <aside className="md:col-span-3 space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
        </aside>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categoryName } = params;
  if (!categoryName) return { title: 'Blog Category' };
  
  const originalCategory = blogCategories.find(cat => slugify(cat) === categoryName);
  const categoryTitleText = originalCategory ? unslugify(originalCategory) : unslugify(categoryName);

  return {
    title: `Blog Category: ${categoryTitleText} | VHost Solutions`,
    description: `Browse posts in the ${categoryTitleText} category.`,
  };
}

// Main page component is now synchronous
export default function CategoryPage({ params }: CategoryPageProps) {
  const { categoryName } = params;

  if (typeof categoryName !== 'string' || categoryName.trim() === '') {
    notFound();
  }
  
  return (
    <Suspense fallback={<CategoryPageSkeleton />}>
      <CategoryPostList categoryName={categoryName} />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}
