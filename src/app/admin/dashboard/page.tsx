'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc } from 'firebase/firestore';

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
      return;
    }
    if (userProfile) {
       if (userProfile.role === 'admin' || userProfile.role === 'owner') {
        setRole(userProfile.role);
       } else {
        // If user has no valid role, redirect them
        router.push('/admin/login?error=no_access');
       }
    }
    // Added dependency on isUserLoading to re-check when loading is complete
  }, [user, isUserLoading, router, userProfile]);

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading) {
    return <div>Loading Dashboard...</div>;
  }
  
  if (!role) {
    // This can happen briefly while userProfile is loading or if the role is invalid
    return <div>Verifying access...</div>;
  }


  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to the admin dashboard, {userProfile?.firstName}. Your role is {role}.</p>
    </div>
  );
}
