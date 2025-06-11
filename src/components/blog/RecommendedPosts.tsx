
'use client';

import { useEffect, useState } from 'react';
import type { BlogPost } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { recommendRelevantPosts, type RecommendRelevantPostsInput } from '@/ai/flows/recommend-relevant-posts';
import { getAllPublishedPosts } from '@/lib/firestoreBlog';

interface RecommendedPostsProps {
  currentPostId: string | null;
  currentPostContent?: string;
}

export default function RecommendedPosts({ currentPostId, currentPostContent }: RecommendedPostsProps) {
  const [postsToShow, setPostsToShow] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [initialFetchDone, setInitialFetchDone] = useState(false); // Flag for first fetch

  // Effect 1: Fetch all posts once on mount
  useEffect(() => {
    let isMounted = true;
    console.log('[RecommendedPosts Effect1] Mounting. Fetching all posts...');
    
    async function fetchAllInitialPosts() {
      try {
        const fetched = await getAllPublishedPosts();
        if (isMounted) {
          setAllPosts(fetched);
          console.log('[RecommendedPosts Effect1] All posts fetched successfully:', fetched.length);
        }
      } catch (error) {
        console.error("[RecommendedPosts Effect1] Failed to fetch all posts:", error);
        if (isMounted) {
          setAllPosts([]); // Ensure allPosts is an array even on error
        }
      } finally {
        if (isMounted) {
          setInitialFetchDone(true);
          console.log('[RecommendedPosts Effect1] Initial fetch marked as done.');
        }
      }
    }

    fetchAllInitialPosts();

    return () => {
      isMounted = false;
      console.log('[RecommendedPosts Effect1] Unmounted.');
    };
  }, []);

  // Effect 2: Process posts for recommendations once allPosts are fetched
  useEffect(() => {
    let isMounted = true;
    console.log('[RecommendedPosts Effect2] Running. initialFetchDone:', initialFetchDone, 'allPosts count:', allPosts.length);

    if (!initialFetchDone) {
      console.log('[RecommendedPosts Effect2] Initial fetch not done yet. Aborting this run.');
      return; // Wait for the first effect to complete
    }

    async function fetchRecommendationsAndFallbacks() {
      if (!isMounted) return;
      
      // Ensure isLoading is true at the start of this processing step if it's not already.
      // This is important if this effect re-runs due to prop changes after initial load.
      if (!isLoading) setIsLoading(true); 
      console.log('[RecommendedPosts Effect2 fetchRecommendationsAndFallbacks] Starting. Current post content available:', !!currentPostContent);

      try {
        const availablePostsForAI = allPosts
          .filter(p => p.id !== currentPostId)
          .map(p => `${p.title}: ${p.excerpt}`);

        if (allPosts.length === 0) {
            console.log('[RecommendedPosts Effect2] No posts in allPosts. Setting empty recommendations.');
            if(isMounted) setPostsToShow([]);
            return; // No posts to recommend from or fallback to
        }
        
        // Determine if we should even attempt AI call
        // For example, if currentPostContent is empty and no other context, AI might not be useful
        // Or if availablePostsForAI is empty (only one post in total, which is the current one)
        if (!currentPostContent && availablePostsForAI.length === 0) {
             console.log('[RecommendedPosts Effect2] No current content and no other posts for AI context. Using direct fallback.');
             const recentPosts = allPosts // Use allPosts directly since availablePostsForAI would be empty
              .filter(p => p.id !== currentPostId) // Still filter current
              .sort((a, b) => new Date(b.date as any).getTime() - new Date(a.date as any).getTime())
              .slice(0, 3);
            if (isMounted) setPostsToShow(recentPosts);
            return;
        }


        const input: RecommendRelevantPostsInput = {
          currentPostContent: currentPostContent || '',
          userHistory: [], // Mocking user history
          availablePosts: availablePostsForAI,
        };
        
        console.log('[RecommendedPosts Effect2] Calling recommendRelevantPosts with input:', input);
        const result = await recommendRelevantPosts(input);
        console.log('[RecommendedPosts Effect2] AI flow result received. Recommended posts count:', result.recommendedPosts.length);

        if (isMounted) {
          if (result.recommendedPosts.length > 0) {
            const recommendedFullPosts = result.recommendedPosts
              .map(titleOrSummary => {
                const found = allPosts.find(p => p.title === titleOrSummary || `${p.title}: ${p.excerpt}` === titleOrSummary);
                if (!found) console.warn(`[RecommendedPosts Effect2] Could not find full post for recommendation: "${titleOrSummary}"`);
                return found;
              })
              .filter(p => p !== undefined) as BlogPost[];
            setPostsToShow(recommendedFullPosts.slice(0, 3));
            console.log('[RecommendedPosts Effect2] Set posts from AI recommendations:', recommendedFullPosts.length > 0 ? recommendedFullPosts.length : 'none actually mapped');
          } else {
            console.log('[RecommendedPosts Effect2] AI returned no recommendations, falling back to recent posts.');
            const recentPosts = allPosts
              .filter(p => p.id !== currentPostId)
              .sort((a, b) => new Date(b.date as any).getTime() - new Date(a.date as any).getTime())
              .slice(0, 3);
            setPostsToShow(recentPosts);
            console.log('[RecommendedPosts Effect2] Set posts from fallback (recent):', recentPosts.length);
          }
        }
      } catch (error) {
        // This catch is for errors within fetchRecommendationsAndFallbacks itself,
        // not necessarily from the AI call if it's handled inside recommendRelevantPosts
        console.error('[RecommendedPosts Effect2] Error during recommendation/fallback logic:', error);
        if (isMounted) {
          console.log('[RecommendedPosts Effect2] Falling back to recent posts due to error in logic.');
          const recentPosts = allPosts
            .filter(p => p.id !== currentPostId)
            .sort((a, b) => new Date(b.date as any).getTime() - new Date(a.date as any).getTime())
            .slice(0, 3);
          setPostsToShow(recentPosts);
          console.log('[RecommendedPosts Effect2] Set posts from fallback (error in logic):', recentPosts.length);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          console.log('[RecommendedPosts Effect2] setIsLoading(false) in finally. Posts to show:', postsToShow.length);
        }
      }
    }

    fetchRecommendationsAndFallbacks();

    return () => {
      isMounted = false;
      console.log('[RecommendedPosts Effect2] Unmounted.');
    };
  // Dependencies: run when initial fetch is done, or when relevant props/allPosts change
  }, [initialFetchDone, allPosts, currentPostId, currentPostContent]);


  // This console log helps see the final state before rendering
  console.log('[RecommendedPosts Render] isLoading:', isLoading, 'postsToShow:', postsToShow.length);

  if (isLoading) {
    console.log('[RecommendedPosts Render] Rendering SKELETON.');
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
    console.log('[RecommendedPosts Render] Rendering NULL (no posts to show).');
    return null;
  }

  console.log('[RecommendedPosts Render] Rendering ACTUAL posts.');
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
                  data-ai-hint={post.dataAiHint || "blog image"}
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
