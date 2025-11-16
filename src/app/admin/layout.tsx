'use client';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminHeader } from './components/header';
import { AdminSidebar } from './components/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[hsl(var(--admin-background))] text-white">
        Loading...
      </div>
    );
  }

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
