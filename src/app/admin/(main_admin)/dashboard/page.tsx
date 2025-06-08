
'use client';

import { useAuth } from '@/lib/authContext';
import { getAuthInstance } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const auth = getAuthInstance();
  const router = useRouter();
  const { toast } = useToast();

  console.log('[AdminDashboardPage] State update: user:', user, 'loading:', loading);

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

  if (loading) {
    console.log('[AdminDashboardPage] Auth data is loading. Rendering loading message.');
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl font-semibold text-primary">Admin Dashboard: Loading user data...</p>
      </div>
    );
  }

  if (!user) {
    // This should ideally not be reached if AdminRouteGuard is working and authContext updates correctly after login.
    // If it is reached, it means user became null after being initially authenticated, or there's a race condition.
    console.log('[AdminDashboardPage] Auth data loaded, but no user found. Rendering user not found message.');
    return (
       <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl font-semibold text-destructive">Admin Dashboard: User not found.</p>
        <p className="text-muted-foreground">You might be redirected to login if authentication failed.</p>
      </div>
    );
  }

  console.log('[AdminDashboardPage] User is authenticated and data loaded. Rendering dashboard content for:', user.email);
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
          </p>
          
          <div className="space-y-2">
            <h3 className="font-headline text-xl font-semibold">Database Operations</h3>
            <Button 
              variant="outline"
              onClick={() => alert('Seed Database functionality to be implemented!')}
            >
              Seed Database (Not Implemented)
            </Button>
            <p className="text-sm text-muted-foreground">
              This button will trigger the database seeding process. Ensure your Firestore rules allow admin writes.
            </p>
          </div>

          <Button onClick={handleLogout} variant="destructive" className="w-full sm:w-auto">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
