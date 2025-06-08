
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { getAuthInstance } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { seedDatabaseAction, setUserAdminClaimAction } from '@/app/actions/adminActions'; // Import actions

export default function AdminDashboardPage() {
  const { user, loading, isAdmin } = useAuth(); // Added isAdmin
  const auth = getAuthInstance();
  const router = useRouter();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isMakingAdmin, setIsMakingAdmin] = useState(false);

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

  const handleMakeAdmin = async () => {
    // IMPORTANT: Replace 'YOUR_USER_UID_HERE' with the actual UID of the user you want to make admin.
    // You can get this from the Firebase console > Authentication.
    const uidToMakeAdmin = user?.uid; // Using current logged-in user's UID for simplicity now

    if (!uidToMakeAdmin) {
      toast({ title: 'Error', description: 'User UID not found. Cannot set admin claim.', variant: 'destructive' });
      return;
    }
    setIsMakingAdmin(true);
    console.log(`[AdminDashboardPage] Attempting to make user ${uidToMakeAdmin} an admin...`);
    try {
      const result = await setUserAdminClaimAction(uidToMakeAdmin);
      console.log('[AdminDashboardPage] setUserAdminClaimAction result:', result);
      if (result.success) {
        toast({ title: 'Success!', description: `${result.message} Please log out and log back in for changes to take effect.` });
      } else {
        toast({ title: 'Error Setting Admin Claim', description: result.message, variant: 'destructive' });
      }
    } catch (error: any) {
      console.error('[AdminDashboardPage] Error calling setUserAdminClaimAction:', error);
      toast({ title: 'Operation Failed', description: error.message || 'An unexpected error occurred while setting admin claim.', variant: 'destructive' });
    } finally {
      setIsMakingAdmin(false);
    }
  };


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
                disabled={isSeeding}
                className="mt-2"
              >
                {isSeeding ? 'Seeding...' : 'Seed Database'}
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                This button will trigger the database seeding process. Check server console for logs.
              </p>
            </div>

            <div>
              <h3 className="font-headline text-xl font-semibold">Admin Rights (Test)</h3>
              <Button
                variant="outline"
                onClick={handleMakeAdmin}
                disabled={isMakingAdmin}
                className="mt-2"
              >
                {isMakingAdmin ? 'Processing...' : 'Make Current User Admin (Test)'}
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                Sets an admin claim for the currently logged-in user ({user.email}). You'll need to log out and log back in.
              </p>
            </div>
          </div>

          <Button onClick={handleLogout} variant="destructive" className="w-full sm:w-auto mt-4">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
