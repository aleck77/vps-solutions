// src/lib/authContext.tsx
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

// 1. Define the context type
interface AuthContextType {
  // Minimal context, can be expanded later
  user: null; // Placeholder
  loading: boolean;
  isAdmin: boolean;
}

// 2. Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Simulate a basic provider value
  const providerValue: AuthContextType = {
    user: null,
    loading: true,
    isAdmin: false,
  };

  // This is the line that consistently causes a parsing error
  return (
    <AuthContext.Provider value={providerValue}>
      {children}
    </AuthContext.Provider>
  );
}

// 4. Create the useAuth hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 5. Placeholder for useAdminAuth
export function useAdminAuth() {
  const context = useAuth();
  // Basic implementation, can be expanded
  // In a real app, isAdmin would come from user claims or another source
  return { ...context, isAdminUser: false }; // Dummy isAdminUser
}
