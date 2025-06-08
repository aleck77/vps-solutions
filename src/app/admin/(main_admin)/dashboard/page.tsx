
'use client';

import { useAuth } from '@/hooks/useAuth';
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
    return <p>Loading admin dashboard...</p>;
  }

  if (!user) {
    // This should ideally be handled by AdminRouteGuard, but as a fallback:
    return <p>Redirecting to login...</p>; 
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">Admin Dashboard</CardTitle>
          <CardDescription>Welcome to the VHost Solutions admin panel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">
            Hello, <span className="font-semibold text-accent">{user.email}</span>!
          </p>
          
          {/* Placeholder for Seed Database button */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold font-headline">Database Operations</h3>
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
