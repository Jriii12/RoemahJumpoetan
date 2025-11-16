'use client';
import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode, useState } from 'react';
import { AdminHeader } from './components/header';
import { AdminSidebar } from './components/sidebar';
import { cn } from '@/lib/utils';

function ProtectedAdminContent({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // If auth is done loading and there's no user, redirect to login
    if (!isUserLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, router]);

  // While loading or if there's no user, show a loading screen.
  // This content is safe because the useEffect will trigger a redirect.
  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[hsl(var(--admin-background))] text-white">
        Loading...
      </div>
    );
  }

  // If user is logged in, render the main admin layout
  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: 'hsl(var(--admin-background))' }}
    >
      {/* Mobile Sidebar */}
      <AdminSidebar
        className={cn(
          'fixed inset-y-0 left-0 z-20 h-full transform transition-transform duration-300 ease-in-out md:hidden',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Desktop Sidebar */}
      <AdminSidebar className="hidden md:fixed md:inset-y-0 md:flex md:flex-col" />
      
      <div className="md:pl-64 flex flex-col flex-1">
        <AdminHeader onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-4">
          <div
            className="rounded-lg border-2 border-[hsl(var(--admin-border))] p-6 h-full"
            style={{
              backgroundColor: 'hsl(var(--admin-content-background))',
              color: 'hsl(var(--admin-content-foreground))',
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  // If we are on the login page, we don't want to render the protected admin layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // All other admin pages are wrapped in the protected layout
  return <ProtectedAdminContent>{children}</ProtectedAdminContent>;
}
