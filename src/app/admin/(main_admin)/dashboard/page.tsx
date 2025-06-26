
'use client';

import { useAuth } from '@/lib/authContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { seedDatabaseAction } from '@/app/actions/adminActions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    const result = await seedDatabaseAction();
    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }
    setIsSeeding(false);
  };


  if (loading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-screen w-full" />
        </div>
    );
  }

  if (!user) {
    // This case should be handled by the AdminRouteGuard, but as a fallback:
    return <p>Redirecting to login...</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Welcome, {user.email}. This is the main admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>From here you can manage your blog posts and other site content.</p>
           <Button asChild>
              <Link href="/admin/posts">Manage Blog Posts</Link>
            </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle>Database Seeding</CardTitle>
            <CardDescription>
              Use this tool to populate your Firestore database with initial data (posts, categories, pages). This should only be run once.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleSeed} disabled={isSeeding}>
              {isSeeding ? 'Seeding...' : 'Seed Database'}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
