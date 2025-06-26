'use client';

import { useAuth } from '@/lib/authContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { seedDatabaseAction } from '@/app/actions/adminActions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Newspaper, Settings, Wrench } from 'lucide-react';

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
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Manage Blog Posts</CardTitle>
                    <Newspaper className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Create, edit, and delete blog articles.</p>
                </CardContent>
                <div className="p-6 pt-0">
                    <Button asChild>
                        <Link href="/admin/posts">Go to Posts</Link>
                    </Button>
                </div>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Manage Site Pages</CardTitle>
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Edit static pages like "About Us".</p>
                </CardContent>
                 <div className="p-6 pt-0">
                    <Button asChild>
                       <Link href="/admin/pages">Manage Pages</Link>
                    </Button>
                </div>
            </Card>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Site Tools</CardTitle>
            <CardDescription>
              Use these tools for site-wide operations. Be careful, these actions can be destructive.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <h3 className="font-semibold mb-2">Database Seeding</h3>
            <p className="text-sm text-muted-foreground mb-3">Populate your Firestore database with initial data (posts, categories, pages). This should only be run once on a fresh database.</p>
            <Button onClick={handleSeed} disabled={isSeeding} variant="outline">
              {isSeeding ? 'Seeding...' : 'Seed Database'}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
