
'use client';

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean; // Placeholder for now
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Placeholder
  const auth = getAuthInstance();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Placeholder for admin check - will be replaced with custom claims
        // For now, any logged-in user is considered admin for UI purposes
        // In a real app, you'd check custom claims:
        // const idTokenResult = await currentUser.getIdTokenResult();
        // setIsAdmin(!!idTokenResult.claims.isAdmin);
        setIsAdmin(true); // Simplified for now
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]); // Removed 'isAdmin' from dependencies as it's set within this effect

  const providerValue = { user, loading, isAdmin };

  return (
    <AuthContext.Provider value={providerValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Specific hook for admin routes, can include admin role check later
export function useAdminAuth() {
  const context = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!context.loading) {
      if (!context.user) {
        router.push('/admin/login');
      }
      // Add admin role check here if needed:
      // else if (!context.isAdmin) { // Future check for admin role
      //   // toast({ title: "Access Denied", description: "You do not have permission to access this page.", variant: "destructive" });
      //   router.push('/');
      // }
    }
  }, [context.user, context.loading, context.isAdmin, router]);

  return context;
}
