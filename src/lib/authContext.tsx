'use client';

import type { User } from 'firebase/auth';
import type { ReactNode } from 'react';
import * as React from 'react';
import { getAuthInstance } from '@/lib/firebase';
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth';

console.log('[AuthProvider FileLevel] Context file parsing started. Version: Patched');

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  console.log('%c[AuthProvider Component] Instance created/rendering starts. Version: Patched', 'color: blue; font-weight: bold;');
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [authInstance, setAuthInstance] = React.useState<ReturnType<typeof getAuthInstance> | null>(null);

  React.useEffect(() => {
    console.log('%c[AuthProvider Effect1] Mount: Initializing auth instance... Version: Patched', 'color: green;');
    let isMounted = true;
    try {
      const instance = getAuthInstance();
      if (isMounted) {
        setAuthInstance(instance);
        console.log('%c[AuthProvider Effect1] authInstance successfully set in state. Version: Patched', 'color: green;');
      }
    } catch (error) {
      console.error("[AuthProvider Effect1] CRITICAL ERROR initializing auth instance. Version: Patched:", error);
      if (isMounted) {
        setLoading(false);
        console.log('%c[AuthProvider Effect1] Set loading to false due to auth instance init error. Version: Patched', 'color: red;');
      }
    }
    return () => {
      isMounted = false;
      console.log('%c[AuthProvider Effect1] Unmount. Version: Patched', 'color: green;');
    };
  }, []);

  React.useEffect(() => {
    console.log(`%c[AuthProvider Effect2] Dependency change or mount. authInstance is: ${authInstance ? 'DEFINED' : 'NULL'}. Current loading state: ${loading}. Version: Patched`, 'color: purple;');

    if (!authInstance) {
      console.log('%c[AuthProvider Effect2] authInstance is NULL, cannot subscribe to onAuthStateChanged yet. Version: Patched', 'color: orange;');
      // If authInstance is still null after a bit, it means Effect1 failed
      const timer = setTimeout(() => {
        if (authInstance === null && loading) {
            console.warn('[AuthProvider Effect2 TIMEOUT] authInstance still null after 3s, forcing loading to false. Version: Patched');
            setLoading(false);
        }
      }, 3000);
      return () => {
        console.log('%c[AuthProvider Effect2] Cleanup for timeout. Version: Patched', 'color: purple;');
        clearTimeout(timer);
      };
    }

    console.log('%c[AuthProvider Effect2] authInstance is DEFINED. Subscribing to onAuthStateChanged... Version: Patched', 'color: purple;');
    const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
      console.log(`%c[AuthProvider Effect2] >>> onAuthStateChanged Fired! currentUser: ${currentUser ? currentUser.email : null}. Version: Patched`, 'color: blue; font-weight: bold;');
      setUser(currentUser);

      if (currentUser) {
        console.log(`%c[AuthProvider Effect2] User signed in: ${currentUser.email}. Attempting to get ID token result... Version: Patched`, 'color: #1E90FF');
        try {
          const idTokenResult = await currentUser.getIdTokenResult(true); // Force refresh to get latest claims
          console.log(`%c[AuthProvider Effect2] idTokenResult.claims: ${JSON.stringify(idTokenResult.claims)}. Version: Patched`, 'color: #1E90FF');
          if (idTokenResult.claims.admin === true) {
            setIsAdmin(true);
            console.log(`%c[AuthProvider Effect2] isAdmin set to: true based on claims. Version: Patched`, 'color: #32CD32');
          } else {
            setIsAdmin(false);
            console.log(`%c[AuthProvider Effect2] isAdmin set to: false (claim not present or not true). Version: Patched`, 'color: #FF8C00');
          }
        } catch (error) {
          console.error('%c[AuthProvider Effect2] Error getting ID token result or claims. Version: Patched:', 'color: red;', error);
          setIsAdmin(false); // Default to false on error
          console.log('%c[AuthProvider Effect2] isAdmin set to: false due to error fetching claims. Version: Patched', 'color: #FF8C00');
        }
      } else {
        setIsAdmin(false);
        console.log('%c[AuthProvider Effect2] No currentUser, isAdmin set to: false. Version: Patched', 'color: #FF8C00');
      }
      setLoading(false);
      console.log(`%c[AuthProvider Effect2] <<< Auth state updated. Loading: ${loading}, User: ${currentUser ? currentUser.email : 'null'}, IsAdmin: ${isAdmin}. (Note: isAdmin might be stale here due to async nature, check next render). Version: Patched`, 'color: blue; font-weight: bold;');
    });

    return () => {
      console.log('%c[AuthProvider Effect2] Unsubscribing from onAuthStateChanged. Version: Patched', 'color: purple;');
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authInstance]);

  // This log will show the actual state values that the provider will pass down on this render pass.
  React.useEffect(() => {
    console.log(`%c[AuthProvider STATE_RENDER_PASS] loading: ${loading}, user: ${user ? user.email : 'null'}, isAdmin: ${isAdmin}. Version: Patched`, 'color: magenta; font-weight: bold;');
  });

  const providerValue = { user, loading, isAdmin };

  return (
    <AuthContext.Provider value={providerValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider. Version: Patched');
  }
  return context;
}

export function useAdminAuth() {
  const context = useAuth();
  return { ...context, isAdminUser: context.isAdmin };
}
