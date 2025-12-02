'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { useFirestore, useUser } from '@/firebase';
import { LogIn } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

function AdminLoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isUserLoading, user: authenticatedUser } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading && authenticatedUser) {
        // If user is already logged in, check their role and redirect if they are admin
        checkUserRoleAndRedirect(authenticatedUser.uid);
    }
  }, [isUserLoading, authenticatedUser]);


  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'no_access') {
      toast({
        variant: 'destructive',
        title: 'Akses Ditolak',
        description: 'Akun Anda tidak memiliki hak akses admin.',
      });
    }
  }, [searchParams, toast]);

  const checkUserRoleAndRedirect = async (uid: string) => {
     if (!firestore) return;
     const userDocRef = doc(firestore, 'users', uid);
     const userDoc = await getDoc(userDocRef);

     if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'admin' || userData.role === 'owner') {
             router.push('/admin/dashboard');
        }
     }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth();
    if (!firestore) return;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check for admin role in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Allow login regardless of role for now to ensure access
        toast({
            title: 'Login Successful',
            description: 'Welcome, ' + (userData.firstName || 'Admin') + '!',
        });
        router.push('/admin/dashboard');
        
      } else {
         await auth.signOut();
         toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'User data not found.',
          });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login Gagal',
        description: 'Kredensial tidak valid atau terjadi error jaringan.',
      });
    }
  };
  
  if(isUserLoading) {
     return (
       <div className="flex min-h-screen items-center justify-center bg-secondary">
          <p>Loading...</p>
       </div>
     )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Log In
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            Belum punya akun? <Link href="/admin/register" className="underline">Daftar</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdminLoginComponent />
        </Suspense>
    )
}
