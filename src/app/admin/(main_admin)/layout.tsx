
import { AuthProvider, useAuth } from '@/lib/authContext'; // Updated import path
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import type { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // AuthProvider is already in the root layout, so it might not be strictly needed here again
  // However, to ensure AdminRouteGuard has access via useAuth, we ensure an AuthProvider is an ancestor.
  // If RootLayout already provides it, this nested one is redundant but harmless.
  // For clarity and to ensure it works even if RootLayout changes, we can keep it, or rely on RootLayout's.
  // Let's rely on RootLayout's AuthProvider for now to avoid nesting issues.
  return (
    // <AuthProvider> // Removed redundant AuthProvider, relying on RootLayout's
      <AdminRouteGuard>
        <div className="flex min-h-screen flex-col">
          {/* We can add an admin-specific header/sidebar here later */}
          <main className="flex-grow p-6 bg-muted/20">
            {children}
          </main>
        </div>
      </AdminRouteGuard>
    // </AuthProvider>
  );
}
