'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type UserProfile = {
  firstName: string;
  role?: 'admin' | 'owner';
};

export default function AdminDashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid);
    }
    return null;
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const [role, setRole] = useState<'admin' | 'owner' | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/admin/login');
    }
    if (userProfile) {
       if (userProfile.role === 'admin' || userProfile.role === 'owner') {
        setRole(userProfile.role);
       } else {
        // If user has no valid role, redirect them
        router.push('/admin/login?error=no_access');
       }
    }
  }, [user, isUserLoading, router, userProfile]);

  const isLoading = isUserLoading || isProfileLoading || !role;

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
         </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {userProfile?.firstName || 'Admin'}!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Your role is: <strong>{role}</strong>. You can manage your tasks from here.
            </p>
          </CardContent>
        </Card>
        
        {/* Owner and Admin */}
        {(role === 'owner' || role === 'admin') && (
            <Card>
                <CardHeader>
                    <CardTitle>Laporan</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Lihat laporan penjualan dan performa toko.</p>
                </CardContent>
            </Card>
        )}

        {/* Admin Only */}
        {role === 'admin' && (
          <>
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
             <Card>
              <CardHeader>
                <CardTitle>Manage Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p>View and manage customer accounts.</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
