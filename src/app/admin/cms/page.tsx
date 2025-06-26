'use client';

import { useMemo } from 'react';
import { useAuth } from '@/lib/authContext';
import { Skeleton } from '@/components/ui/skeleton';
import FireCMSComponent from '@/components/cms/FireCMSComponent';

export default function CmsPage() {
    const { user, loading: authLoading } = useAuth();

    // The data source will be memoized and only recreated when the user changes.
    const memoizedDataSource = useMemo(() => {
        // This function will be passed to FireCMS, which will then use it.
        // It's defined here to capture the current user's auth state.
        console.log("CMS Page: Memoizing data source.");
        // In a real app, you might use the user object to pass a token or UID
        // to a backend for authentication, but for Firestore client-side SDK,
        // the auth state is handled automatically.
        return true; // Placeholder to indicate readiness
    }, [user]);


    if (authLoading) {
        return (
            <div className="w-full h-[calc(100vh-4rem)] p-4">
                <Skeleton className="h-12 w-1/3 mb-4" />
                <Skeleton className="w-full h-full" />
            </div>
        );
    }
    
    if (!user) {
        return <p>Please log in to access the CMS.</p>;
    }

    return (
        <div className="w-full h-[calc(100vh-4rem)]">
            <FireCMSComponent />
        </div>
    );
}
