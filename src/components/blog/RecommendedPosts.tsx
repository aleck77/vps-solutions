'use client';

import { useEffect, useState } from 'react';
import type { BlogPost } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react'; // RESTORED
import { recommendRelevantPosts, type RecommendRelevantPostsInput } from '@/ai/flows/recommend-relevant-posts'; // RESTORED
import { getAllPublishedPosts } from '@/lib/firestoreBlog'; // To get available posts for the AI

interface RecommendedPostsProps {
  currentPostId: string | null;
  currentPostContent?: string; 
}

export default function RecommendedPosts({ currentPostId, currentPostContent }: RecommendedPostsProps) {
  const [postsToShow, setPostsToShow] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    async function fetchAll() {
      setIsLoading(true); // Set loading true at the start of fetching all posts
      try {
        const fetched = await getAllPublishedPosts();
        if (isMounted) { // Check if component is still mounted
            setAllPosts(fetched);
        }
      } catch (error) {
        console.error("Failed to fetch all posts for recommendations:", error);
        if (isMounted) {
            setAllPosts([]); // Set to empty on error to avoid issues
        }
      } 
      // Do not set isLoading to false here, let the next effect handle it after recommendations
    }
    
    let isMounted = true;
    fetchAll();
    return () => { isMounted = false; };
  }, []); // Fetch all posts only once on mount

  useEffect(() => {
    let isMounted = true;
    if (allPosts.length === 0 && !isLoading) { // if loading is already false and no posts, nothing to do
        return;
    }
    if (allPosts.length === 0 && isLoading && currentPostId === null) { // For general blog pages, if no posts yet, keep loading.
        // This condition might be tricky if getAllPublishedPosts is slow.
        // Initial state of isLoading is true. If allPosts is empty, it means fetchAll hasn't completed or returned empty.
        // If currentPostId is null (e.g. blog index), we might want to show loading until allPosts are fetched.
        // But if fetchAll completes and allPosts is still empty, then the recommendation logic will also yield empty.
        // Let's simplify: if allPosts is empty, we can't recommend.
        if (isLoading) setIsLoading(false); // If no posts, stop loading.
        return;
    }


    async function fetchRecommendations() {
      if (!isMounted) return;
      setIsLoading(true);
      try {
        const availablePostsForAI = allPosts
          .filter(p => p.id !== currentPostId)
          .map(p => `${p.title}: ${p.excerpt}`);

        const input: RecommendRelevantPostsInput = {
          currentPostContent: currentPostContent || '',
          userHistory: [], // Mocking user history for now
          availablePosts: availablePostsForAI,
        };

        const result = await recommendRelevantPosts(input);
        
        if (isMounted) {
          if (result.recommendedPosts.length > 0) {
            const recommendedFullPosts = result.recommendedPosts
              .map(titleOrSummary => allPosts.find(p => p.title === titleOrSummary || `${p.title}: ${p.excerpt}` === titleOrSummary))
              .filter(p => p !== undefined) as BlogPost[];
            setPostsToShow(recommendedFullPosts.slice(0, 3));
          } else {
            // Fallback to recent posts if AI returns nothing
            const recentPosts = allPosts
              .filter(p => p.id !== currentPostId)
              .sort((a, b) => new Date(b.date as any).getTime() - new Date(a.date as any).getTime())
              .slice(0, 3);
            setPostsToShow(recentPosts);
          }
        }
      } catch (error) {
        console.error('Error fetching AI recommendations, falling back to recent posts:', error);
        if (isMounted) {
          const recentPosts = allPosts
            .filter(p => p.id !== currentPostId)
            .sort((a, b) => new Date(b.date as any).getTime() - new Date(a.date as any).getTime())
            .slice(0, 3);
          setPostsToShow(recentPosts);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    
    // Only fetch recommendations if we have posts to recommend from
    if (allPosts.length > 0) {
        fetchRecommendations();
    } else {
        // if allPosts is empty after the first effect, set loading to false
        if(isLoading) setIsLoading(false);
        setPostsToShow([]);
    }

    return () => { isMounted = false; };

  }, [currentPostId, currentPostContent, allPosts, isLoading]); // Added isLoading to deps for the allPosts.length === 0 check

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-accent" />
            Recommended For You
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex space-x-3 items-center">
              <div className="h-16 w-16 bg-muted rounded"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  if (postsToShow.length === 0) {
    return null; 
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center">
           <Sparkles className="h-5 w-5 mr-2 text-accent" />
           Recommended For You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {postsToShow.map(post => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="block group hover:bg-muted/50 p-2 rounded-md transition-colors">
            <div className="flex items-start space-x-3">
              <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                <Image 
                  src={post.imageUrl} 
                  alt={post.title} 
                  fill
                  sizes="64px"
                  className="object-cover"
                  data-ai-hint={post.dataAiHint || "blog image"} // RESTORED data-ai-hint for images within this component
                />
              </div>
              <div>
                <h4 className="text-sm font-semibold group-hover:text-primary transition-colors leading-tight">{post.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{post.excerpt.substring(0, 60)}...</p>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
