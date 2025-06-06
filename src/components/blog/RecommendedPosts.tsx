'use client';

import { useEffect, useState } from 'react';
import { mockPosts } from '@/data/posts';
import type { BlogPost } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { List } from 'lucide-react'; // Using a more generic icon

interface RecommendedPostsProps {
  currentPostId: string | null; 
}

export default function RecommendedPosts({ currentPostId }: RecommendedPostsProps) {
  const [postsToShow, setPostsToShow] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Filter out the current post and take the 3 most recent ones
    const recentPosts = mockPosts
      .filter(p => p.id !== currentPostId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
    
    setPostsToShow(recentPosts);
    setIsLoading(false);
  }, [currentPostId]);

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center">
            <List className="h-5 w-5 mr-2 text-muted-foreground" />
            Other Posts
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
    return null; // Don't show if no other posts
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center">
           <List className="h-5 w-5 mr-2 text-muted-foreground" />
           Other Posts
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
