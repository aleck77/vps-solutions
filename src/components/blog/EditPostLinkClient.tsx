'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FilePenLine } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

interface EditPostLinkClientProps {
  postId: string | undefined;
}

export default function EditPostLinkClient({ postId }: EditPostLinkClientProps) {
  const { isAdmin, loading } = useAuth();

  if (loading || !isAdmin || !postId) {
    return null; 
  }

  return (
    <Button asChild variant="outline" size="sm">
      <Link href={`/admin/posts/edit/${postId}`} className="flex items-center">
        <FilePenLine className="h-4 w-4 mr-2" />
        Edit This Post
      </Link>
    </Button>
  );
}
