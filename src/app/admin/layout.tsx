'use client';
import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { AdminHeader } from './components/header';
import { AdminSidebar } from './components/sidebar';

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // If we are on the login page, we don't want to render the admin layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

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
      className="min-h-screen w-full text-white"
      style={{ backgroundColor: 'hsl(var(--admin-background))' }}
    >
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-4">
          <div
            className="rounded-lg border-2 border-[hsl(var(--admin-border))] p-6 h-[calc(100vh-120px)]"
            style={{ backgroundColor: 'hsl(var(--admin-content-background))', color: 'hsl(var(--admin-content-foreground))' }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
