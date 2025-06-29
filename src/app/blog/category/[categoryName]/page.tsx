
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostsByCategory } from '@/lib/firestoreBlog';
import type { BlogPost } from '@/types';
import { slugify, unslugify } from '@/lib/utils';
import PostCard from '@/components/blog/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { blogCategories } from '@/types';

function CategoryPageSkeleton() {
    return (
        <div className="space-y-8">
            <header className="py-8 bg-primary/5 rounded-lg text-center">
                <Skeleton className="h-10 w-1/2 mx-auto" />
                <Skeleton className="h-5 w-1/3 mx-auto mt-3" />
            </header>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="flex flex-col space-y-3 p-4 border rounded-lg shadow-lg">
                        <Skeleton className="h-48 w-full rounded-md" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-8 w-1/3" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CategoryPageContent() {
    const params = useParams();
    const categoryName = Array.isArray(params.categoryName) ? params.categoryName[0] : params.categoryName;
    
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categoryTitle, setCategoryTitle] = useState('');

    useEffect(() => {
        async function fetchCategoryPosts() {
            if (!categoryName) {
                setLoading(false);
                setError('Category not found.');
                return;
            }

            try {
                setLoading(true);
                const originalCategory = blogCategories.find(cat => slugify(cat) === categoryName);
                const title = originalCategory ? unslugify(originalCategory) : unslugify(categoryName);
                setCategoryTitle(title);
                document.title = `Posts in: ${title} | VHost Solutions`;

                const fetchedPosts = await getPostsByCategory(categoryName);
                setPosts(fetchedPosts);
            } catch (e: any) {
                setError(e.message || 'Failed to fetch posts.');
            } finally {
                setLoading(false);
            }
        }
        fetchCategoryPosts();
    }, [categoryName]);

    if (loading) {
        return <CategoryPageSkeleton />;
    }

    if (error || !categoryTitle) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <header className="py-8 bg-primary/5 rounded-lg text-center">
                <p className="text-sm font-semibold text-accent uppercase tracking-wider">Category</p>
                <h1 className="text-4xl font-bold font-headline text-primary mt-2">{categoryTitle}</h1>
            </header>

            {posts.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-lg text-muted-foreground">No posts found in this category yet.</p>
                    <Link href="/blog" className="mt-4 inline-block text-accent hover:underline">
                        &larr; Back to all posts
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function CategoryPage() {
    return (
        <Suspense fallback={<CategoryPageSkeleton />}>
            <CategoryPageContent />
        </Suspense>
    );
}
