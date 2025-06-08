
import { AuthProvider } from '@/hooks/useAuth';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import type { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AuthProvider>
      <AdminRouteGuard>
        <div className="flex min-h-screen flex-col">
          {/* We can add an admin-specific header/sidebar here later */}
          <main className="flex-grow p-6 bg-muted/20">
            {children}
          </main>
        </div>
      </AdminRouteGuard>
    </AuthProvider>
  );
}
