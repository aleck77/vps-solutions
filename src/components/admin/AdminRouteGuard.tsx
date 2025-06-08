
'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/lib/authContext'; // Updated import path
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
// import { useToast } from '@/hooks/use-toast'; // Not used in this minimal version yet

interface AdminRouteGuardProps {
  children: ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user, loading, isAdmin } = useAuth(); // 'user' and 'isAdmin' are placeholders in minimal context
  const router = useRouter();
  // const { toast } = useToast(); // Not used yet

  useEffect(() => {
    if (!loading) {
      if (!user) { // In our minimal context, user is always null, so this would always redirect
                    // This needs to be updated when real auth logic is restored
        // For now, let's assume if loading is false, and we don't have a user from a real auth system,
        // we should redirect. The minimal context doesn't simulate a logged-in user.
        // This will effectively always redirect until real auth logic is in useAuth.
        // To allow testing the dashboard page, we might need to temporarily bypass this
        // or simulate a 'user' in the minimal context.
        // For now, this logic will be problematic with the minimal stub.
        // router.push('/admin/login'); 
        console.log("AdminRouteGuard: User not found (or minimal stub in use), would redirect to /admin/login");
      } 
      // else if (!isAdmin) { // Future check for admin role
      //   toast({ title: "Access Denied", description: "You do not have permission to access this page.", variant: "destructive" });
      //   router.push('/'); 
      // }
    }
  }, [user, loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 p-8 rounded-lg shadow-lg bg-card w-full max-w-sm">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
            <Skeleton className="h-10 w-full mt-4" />
            <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  // With the minimal stub, user is always null, so this would prevent children from rendering.
  // This needs to be adjusted once useAuth provides a real user object.
  // if (!user) { 
  //   return null; 
  // }

  return <>{children}</>;
}
