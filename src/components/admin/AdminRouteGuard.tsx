
'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth'; // Using the base useAuth for now
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminRouteGuardProps {
  children: ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user, loading, isAdmin } = useAuth(); // isAdmin is a placeholder here
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/admin/login');
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

  if (!user) { // Could also check !isAdmin here once implemented
    return null; // Or a specific "Access Denied" page if preferred while redirecting
  }

  return <>{children}</>;
}
