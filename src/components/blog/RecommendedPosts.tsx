'use client';

import { useEffect, useState } from 'react';
import { mockPosts } from '@/data/posts';
import type { BlogPost } from '@/types';
import { recommendRelevantPosts, RecommendRelevantPostsInput } from '@/ai/flows/recommend-relevant-posts';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface RecommendedPostsProps {
  currentPostId: string | null; // ID of the currently viewed post, or null if on blog index
}

// Helper to get limited browsing history (e.g., last 5 viewed post slugs)
const getBrowsingHistory = (): string[] => {
  if (typeof window === 'undefined') return [];
  const historyString = localStorage.getItem('vhost_blog_history');
  return historyString ? JSON.parse(historyString) : [];
};

// Helper to update browsing history
const updateBrowsingHistory = (currentPostSlug: string | null) => {
  if (typeof window === 'undefined' || !currentPostSlug) return;
  let history = getBrowsingHistory();
  // Remove current slug if it exists to move it to the front
  history = history.filter(slug => slug !== currentPostSlug);
  history.unshift(currentPostSlug);
  // Keep only the last 5 items
  localStorage.setItem('vhost_blog_history', JSON.stringify(history.slice(0, 5)));
};


export default function RecommendedPosts({ currentPostId }: RecommendedPostsProps) {
  const [recommendations, setRecommendations] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPost = currentPostId ? mockPosts.find(p => p.id === currentPostId) : null;

  useEffect(() => {
    if (currentPost) {
      updateBrowsingHistory(currentPost.slug);
    }

    async function fetchRecommendations() {
      setIsLoading(true);
      setError(null);
      try {
        const userHistorySlugs = getBrowsingHistory();
        const userHistoryContent = userHistorySlugs
          .map(slug => mockPosts.find(p => p.slug === slug)?.title || '')
          .filter(Boolean);

        const availablePostsContent = mockPosts
          .filter(p => p.id !== currentPostId) // Exclude current post from available options
          .map(p => `${p.title}: ${p.excerpt.substring(0,100)}...`);

        const input: RecommendRelevantPostsInput = {
          currentPostContent: currentPost ? `${currentPost.title}: ${currentPost.content.substring(0,500)}...` : "Currently viewing blog index page.",
          userHistory: userHistoryContent,
          availablePosts: availablePostsContent,
        };
        
        // In a real app, ensure you handle API rate limits and costs for GenAI calls.
        // This might be too frequent for every page load for every user. Consider caching.
        const result = await recommendRelevantPosts(input);
        
        const recommendedPostObjects = result.recommendedPosts
          .map(titleWithSummary => {
            const title = titleWithSummary.split(':')[0].trim();
            return mockPosts.find(p => p.title === title && p.id !== currentPostId);
          })
          .filter((p): p is BlogPost => Boolean(p))
          .slice(0, 3); // Limit to 3 recommendations

        setRecommendations(recommendedPostObjects);

      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
        setError("Could not load recommendations at this time.");
        // Fallback to simple recent posts if AI fails
        setRecommendations(mockPosts.filter(p => p.id !== currentPostId).slice(0, 3).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecommendations();
  }, [currentPostId, currentPost]);

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center"><Sparkles className="h-5 w-5 mr-2 text-accent" />Recommended For You</CardTitle>
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
  
  if (error && recommendations.length === 0) {
     return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center"><Sparkles className="h-5 w-5 mr-2 text-accent" />Recommended For You</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null; // Don't show if no recommendations
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center"><Sparkles className="h-5 w-5 mr-2 text-accent" />Recommended For You</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map(post => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="block group hover:bg-muted/50 p-2 rounded-md transition-colors">
            <div className="flex items-start space-x-3">
              <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                <Image 
                  src={post.imageUrl} 
                  alt={post.title} 
                  fill
                  sizes="64px"
                  className="object-cover"
                  data-ai-hint={post.dataAiHint as string || "technology"}
                />
              </div>
              <div>
                <h4 className="text-sm font-semibold group-hover:text-primary transition-colors leading-tight">{post.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{post.excerpt.substring(0, 60)}...</p>
              </div>
            </div>
          </Link>
        ))}
         {error && <p className="text-xs text-destructive mt-2">AI recommendations failed, showing recent posts.</p>}
      </CardContent>
    </Card>
  );
}
