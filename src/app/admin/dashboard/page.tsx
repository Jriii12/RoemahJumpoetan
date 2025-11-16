'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/admin/login');
    }
    // Here you would also check for admin role/claims
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, Admin!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is your admin dashboard. You can manage users, products, and orders from here.</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Manage Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View, add, edit, or delete products in your store.</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>View Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Review and manage customer orders.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
