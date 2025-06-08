
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
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
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
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
    if (!context.loading && !context.user) {
      router.push('/admin/login');
    }
    // Add admin role check here if needed:
    // if (!context.loading && context.user && !context.isAdmin) {
    //   router.push('/'); // or some 'unauthorized' page
    // }
  }, [context.user, context.loading, context.isAdmin, router]);

  return context;
}
