
'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { BlogPost } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, UserCircle, Tag, FilePenLine } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

interface PostCardProps {
  post: BlogPost;
}

export default function PostCard({ post }: PostCardProps) {
  const { isAdmin } = useAuth();

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative w-full h-48">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            data-ai-hint={post.dataAiHint || "blog abstract"}
            className="object-cover"
          />
        </div>
      </Link>
      <CardHeader>
        <Link href={`/blog/category/${post.category.toLowerCase()}`} className="text-sm text-accent font-medium hover:underline">
          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-1" /> {post.category}
          </div>
        </Link>
        <CardTitle className="font-headline text-xl mt-1">
          <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
            {post.title}
          </Link>
        </CardTitle>
        <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 mt-1">
          <span className="flex items-center"><CalendarDays className="h-3.5 w-3.5 mr-1" /> {new Date(post.date).toLocaleDateString()}</span>
          <span className="flex items-center"><UserCircle className="h-3.5 w-3.5 mr-1" /> {post.author}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{post.excerpt}</CardDescription>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 items-center">
        <Button asChild variant="outline" size="sm">
          <Link href={`/blog/${post.slug}`}>Read More</Link>
        </Button>
        {isAdmin && post.id && (
          <Button asChild variant="secondary" size="sm">
            <Link href={`/admin/posts/edit/${post.id}`}>
              <FilePenLine className="h-4 w-4 mr-1" /> Edit Post
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
