
'use client';

import type { User } from 'firebase/auth';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { getAuthInstance } from '@/lib/firebase'; 
import { onAuthStateChanged } from 'firebase/auth';

console.log('[AuthProvider FileLevel] Context file parsing started. This should appear once per client bundle.');

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  console.log('%c[AuthProvider Component] Instance created/rendering starts.', 'color: blue; font-weight: bold;');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authInstance, setAuthInstance] = useState<ReturnType<typeof getAuthInstance> | null>(null);

  useEffect(() => {
    console.log('%c[AuthProvider Effect1] Mount: Initializing auth instance...', 'color: green;');
    let isMounted = true;
    try {
      const instance = getAuthInstance(); // Get instance from firebase.ts
      if (isMounted) {
        setAuthInstance(instance);
        console.log('%c[AuthProvider Effect1] authInstance successfully set in state.', 'color: green;');
      }
    } catch (error) {
      console.error("[AuthProvider Effect1] CRITICAL ERROR initializing auth instance:", error);
      if (isMounted) {
        setLoading(false); // Ensure loading is false if auth init fails critically
        console.log('%c[AuthProvider Effect1] Set loading to false due to auth instance init error.', 'color: red;');
      }
    }
    return () => { 
      isMounted = false;
      console.log('%c[AuthProvider Effect1] Unmount.', 'color: green;');
    };
  }, []); // Runs once on mount

  useEffect(() => {
    console.log(`%c[AuthProvider Effect2] Dependency change or mount. authInstance is: ${authInstance ? 'DEFINED' : 'NULL'}. Current loading state: ${loading}`, 'color: purple;');
    
    if (!authInstance) {
      console.log('%c[AuthProvider Effect2] authInstance is NULL, cannot subscribe to onAuthStateChanged yet.', 'color: orange;');
      // If authInstance is still null after a bit, it means Effect1 failed or getAuthInstance() is problematic
      const timer = setTimeout(() => {
        // Check loading state before forcing it to false to avoid redundant updates if it resolved some other way.
        if (authInstance === null && loading) { 
            console.warn('[AuthProvider Effect2 TIMEOUT] authInstance still null after 3s, forcing loading to false.');
            setLoading(false);
        }
      }, 3000); // 3 second timeout
      return () => {
        console.log('%c[AuthProvider Effect2] Cleanup for timeout.', 'color: purple;');
        clearTimeout(timer);
      };
    }

    console.log('%c[AuthProvider Effect2] authInstance is DEFINED. Subscribing to onAuthStateChanged...', 'color: purple;');
    const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
      console.log(`%c[AuthProvider Effect2] onAuthStateChanged Fired! currentUser: ${currentUser ? currentUser.email : null}`, 'color: blue; font-weight: bold;');
      setUser(currentUser);
      if (currentUser) {
        // TODO: Implement proper admin check via custom claims
        // console.log('[AuthProvider Effect2] User is present. Setting isAdmin to true (placeholder).');
        setIsAdmin(true); // Placeholder
      } else {
        // console.log('[AuthProvider Effect2] User is null. Setting isAdmin to false.');
        setIsAdmin(false);
      }
      console.log('%c[AuthProvider Effect2] Calling setLoading(false) from onAuthStateChanged.', 'color: blue; font-weight: bold;');
      setLoading(false);
    });

    return () => {
      console.log('%c[AuthProvider Effect2] Unsubscribing from onAuthStateChanged.', 'color: purple;');
      unsubscribe();
    };
  }, [authInstance, loading]); // Added loading to dependency list for the timeout logic, and to re-evaluate if loading changes externally.

  const providerValue = { user, loading, isAdmin };
  // console.log(`[AuthProvider Component] Returning provider. Loading: ${loading}, User: ${user ? user.email : null}`);

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

export function useAdminAuth() {
  const context = useAuth();
  return { ...context, isAdminUser: context.isAdmin };
}
