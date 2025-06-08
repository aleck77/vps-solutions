
'use client';

import { createContext, useContext, type ReactNode, useState, useEffect } from 'react';

// Simplified user type for testing
interface UserType {
  email: string;
  uid: string;
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  isAdmin: boolean; // Kept for consistency, but will be static for now
  // login: (email: string, pass: string) => Promise<void>; // Placeholder
  // logout: () => Promise<void>; // Placeholder
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Static for this simplified version

  useEffect(() => {
    // Simulate auth check
    const timer = setTimeout(() => {
      // To test logged-in state:
      // setUser({ email: 'test@example.com', uid: 'testuid123' });
      // setIsAdmin(true);

      // To test logged-out state:
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
    }, 500); // Simulate a small delay

    return () => clearTimeout(timer);
  }, []);

  const providerValue: AuthContextType = {
    user,
    loading,
    isAdmin,
    // login: async () => console.log('Login placeholder'), // Placeholder
    // logout: async () => console.log('Logout placeholder'), // Placeholder
  };

  if (loading && !user) { // Show loading only on initial load without a user yet
    // You could return a global loading spinner here if desired
    // For now, to minimize complexity, we'll let child components render
    // or be blocked by AdminRouteGuard
  }

  // This is the line that consistently causes a parsing error
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

// Placeholder for useAdminAuth, can be expanded later
export function useAdminAuth() {
  const context = useAuth();
  // useEffect(() => {
  //   if (!context.loading && !context.user) {
  //     // router.push('/admin/login'); // Needs useRouter from 'next/navigation'
  //     console.log("useAdminAuth: Not loaded or no user, would redirect to login.");
  //   } else if (!context.loading && context.user && !context.isAdmin) {
  //     // router.push('/'); // Or an access denied page
  //     console.log("useAdminAuth: User is not admin, would redirect.");
  //   }
  // }, [context.user, context.loading, context.isAdmin]);
  return context;
}
