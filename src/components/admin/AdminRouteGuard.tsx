
'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
// import { Skeleton } from '@/components/ui/skeleton'; // Not using skeleton for more direct feedback

interface AdminRouteGuardProps {
  children: ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  console.log('[AdminRouteGuard] State update: user:', user, 'loading:', loading);

  useEffect(() => {
    console.log('[AdminRouteGuard] useEffect triggered. loading:', loading, 'user:', !!user);
    if (!loading && !user) {
      console.log('[AdminRouteGuard] Not loading and no user, redirecting to /admin/login');
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  if (loading) {
    console.log('[AdminRouteGuard] Auth state is loading. Rendering loading message.');
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <p className="text-xl font-semibold text-primary">Admin Area: Checking authentication status...</p>
        <p className="text-muted-foreground">Please wait a moment.</p>
      </div>
    );
  }

  if (!user) {
    // This state should ideally be brief as useEffect should redirect.
    console.log('[AdminRouteGuard] Auth state loaded, but no user. Should be redirecting. Rendering fallback message.');
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <p className="text-xl font-semibold text-destructive">Admin Area: User not authenticated.</p>
        <p className="text-muted-foreground">Redirecting to login page...</p>
      </div>
    );
  }

  console.log('[AdminRouteGuard] User is authenticated. Rendering protected content (children).');
  return <>{children}</>;
}
