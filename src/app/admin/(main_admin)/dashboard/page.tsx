
'use client';

import { useAuth } from '@/lib/authContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { seedDatabaseAction } from '@/app/actions/adminActions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Newspaper, Settings, Wrench, ListTree, Server } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


function ManagementCard({ title, description, href, icon, linkText }: { title: string, description: string, href: string, icon: React.ReactNode, linkText: string }) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <div className="p-6 pt-0">
        <Button asChild>
          <Link href={href}>{linkText}</Link>
        </Button>
      </div>
    </Card>
  );
}


export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    const result = await seedDatabaseAction();
    if (result.success) {
      toast({
        title: result.message,
        description: (
          <ul className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            {result.details?.map((detail, index) => (
              <li key={index} className="text-sm text-white">{detail}</li>
            ))}
          </ul>
        ),
      });
    } else {
      toast({
        title: 'Error Seeding Database',
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
        <CardContent>
           <Tabs defaultValue="management" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="management">Content Management</TabsTrigger>
              <TabsTrigger value="tools">Site Tools</TabsTrigger>
            </TabsList>
            <TabsContent value="management" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <ManagementCard 
                        title="Manage Blog Posts"
                        description="Create, edit, and delete blog articles."
                        href="/admin/posts"
                        icon={<Newspaper className="h-5 w-5 text-muted-foreground" />}
                        linkText="Go to Posts"
                    />
                     <ManagementCard 
                        title="Manage Site Pages"
                        description="Edit static pages like About Us."
                        href="/admin/pages"
                        icon={<BookOpen className="h-5 w-5 text-muted-foreground" />}
                        linkText="Manage Pages"
                    />
                     <ManagementCard 
                        title="Manage Navigation"
                        description="Control header and footer menus."
                        href="/admin/navigation"
                        icon={<ListTree className="h-5 w-5 text-muted-foreground" />}
                        linkText="Manage Menus"
                    />
                    <ManagementCard 
                        title="Manage VPS Plans"
                        description="Edit pricing and features of VPS plans."
                        href="/admin/plans"
                        icon={<Server className="h-5 w-5 text-muted-foreground" />}
                        linkText="Manage Plans"
                    />
                     <ManagementCard 
                        title="Site Settings"
                        description="Manage global settings like homepage content, header, footer, and contact info."
                        href="/admin/settings"
                        icon={<Wrench className="h-5 w-5 text-muted-foreground" />}
                        linkText="Edit Settings"
                    />
                </div>
            </TabsContent>
            <TabsContent value="tools" className="mt-6">
               <Card className="border-dashed">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Site Tools</CardTitle>
                    <CardDescription>
                    Use these tools for site-wide operations. Be careful, these actions can be destructive.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <h3 className="font-semibold mb-2">Database Seeding</h3>
                    <p className="text-sm text-muted-foreground mb-3">Populate your Firestore database with initial data (posts, categories, pages, menus, plans). This should only be run once on a fresh database.</p>
                    <Button onClick={handleSeed} disabled={isSeeding} variant="outline">
                    {isSeeding ? 'Seeding...' : 'Seed Database'}
                    </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
