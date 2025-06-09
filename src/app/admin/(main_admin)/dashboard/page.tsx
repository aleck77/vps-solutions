
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { getAuthInstance } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { seedDatabaseAction } from '@/app/actions/adminActions'; // setUserAdminClaimAction removed as button is removed

export default function AdminDashboardPage() {
  const { user, loading, isAdmin } = useAuth();
  const auth = getAuthInstance();
  const router = useRouter();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  // Removed isMakingAdmin state as the button is removed

  console.log('[AdminDashboardPage] State update: user:', user, 'loading:', loading, 'isAdmin:', isAdmin);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/admin/login');
    } catch (error: any) {
      toast({ title: 'Logout Failed', description: error.message, variant: 'destructive' });
      console.error('Logout error:', error);
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    console.log('[AdminDashboardPage] Calling seedDatabaseAction...');
    try {
      const result = await seedDatabaseAction();
      console.log('[AdminDashboardPage] seedDatabaseAction result:', result);
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
      } else {
        toast({ title: 'Error Seeding', description: result.message, variant: 'destructive' });
      }
    } catch (error: any) {
      console.error('[AdminDashboardPage] Error calling seedDatabaseAction:', error);
      toast({ title: 'Operation Failed', description: error.message || 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsSeeding(false);
    }
  };

  // handleMakeAdmin function removed as the button is removed

  if (loading) {
    console.log('[AdminDashboardPage] Auth data is loading. Rendering loading message.');
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl font-semibold text-primary">Admin Dashboard: Loading user data...</p>
      </div>
    );
  }

  if (!user) {
    console.log('[AdminDashboardPage] Auth data loaded, but no user found. Rendering user not found message (should be redirected by guard).');
    return (
       <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl font-semibold text-destructive">Admin Dashboard: User not found.</p>
        <p className="text-muted-foreground">You might be redirected to login if authentication failed or is incomplete.</p>
      </div>
    );
  }

  console.log('[AdminDashboardPage] User is authenticated and data loaded. Rendering dashboard content for:', user.email, 'Is Admin:', isAdmin);
  return (
    <div className="container mx-auto py-10">
      <Card className="mx-auto max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">Admin Dashboard</CardTitle>
          <CardDescription>Welcome to the VHost Solutions admin panel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">
            Hello, <span className="font-semibold text-accent">{user.email}</span>!
            (Admin status: {isAdmin ? 'Yes' : 'No'})
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-headline text-xl font-semibold">Database Operations</h3>
              <Button 
                variant="outline"
                onClick={handleSeedDatabase}
                disabled={isSeeding || !isAdmin} // Disable if not admin
                className="mt-2"
              >
                {isSeeding ? 'Seeding...' : 'Seed Database'}
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                This button will trigger the database seeding process. (Requires admin rights)
              </p>
            </div>

            {/* Section for "Make Admin" button removed */}
          </div>

          <Button onClick={handleLogout} variant="destructive" className="w-full sm:w-auto mt-4">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
