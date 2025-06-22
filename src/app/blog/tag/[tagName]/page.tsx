
'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostsByTag } from '@/lib/firestoreBlog';
import type { BlogPost } from '@/types';
import { unslugify } from '@/lib/utils';
import PostCard from '@/components/blog/PostCard';
import { Skeleton } from '@/components/ui/skeleton';

function TagPageSkeleton() {
    return (
        <div className="space-y-8">
            <header className="py-8 bg-primary/5 rounded-lg text-center">
                <Skeleton className="h-10 w-1/2 mx-auto" />
                <Skeleton className="h-5 w-1/3 mx-auto mt-3" />
            </header>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, index) => (
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

export default function TagPage() {
    const params = useParams();
    const tagName = Array.isArray(params.tagName) ? params.tagName[0] : params.tagName;

    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tagTitle, setTagTitle] = useState('');

    useEffect(() => {
        async function fetchTagPosts() {
            if (!tagName) {
                setLoading(false);
                setError('Tag not found.');
                return;
            }

            try {
                setLoading(true);
                const title = unslugify(tagName);
                setTagTitle(title);
                document.title = `Posts tagged with: ${title} | VHost Solutions`;
                
                const fetchedPosts = await getPostsByTag(tagName);
                setPosts(fetchedPosts);
            } catch (e: any) {
                setError(e.message || 'Failed to fetch posts.');
            } finally {
                setLoading(false);
            }
        }
        fetchTagPosts();
    }, [tagName]);

    if (loading) {
        return <TagPageSkeleton />;
    }

    if (error || !tagTitle) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <header className="py-8 bg-primary/5 rounded-lg text-center">
                <p className="text-sm font-semibold text-accent uppercase tracking-wider">Tag</p>
                <h1 className="text-4xl font-bold font-headline text-primary mt-2">{tagTitle}</h1>
            </header>

            {posts.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-lg text-muted-foreground">No posts found with this tag yet.</p>
                    <Link href="/blog" className="mt-4 inline-block text-accent hover:underline">
                        &larr; Back to all posts
                    </Link>
                </div>
            )}
        </div>
    );
}
