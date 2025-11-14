'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, getDoc } from 'firebase/firestore';


const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
        />
        <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
        />
        <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
        />
        <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
        />
    </svg>
);


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Firebase not available',
      });
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
         await auth.signOut();
         toast({
            variant: 'destructive',
            title: 'Verifikasi Email Diperlukan',
            description: 'Silakan verifikasi email Anda sebelum login. Email verifikasi baru telah dikirimkan.',
        });
        await sendEmailVerification(userCredential.user);
        return;
      }
      
      toast({
        title: 'Login Successful',
        description: "Welcome back! You're now logged in.",
      });
      router.push('/');
    } catch (error: any) {
      let description = 'An unexpected error occurred. Please try again.';
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          description = 'Invalid email or password.';
          break;
        case 'auth/invalid-email':
          description = 'Please enter a valid email address.';
          break;
      }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description,
      });
    }
  };
  
  const handleGoogleSignIn = async () => {
    if (!auth || !firestore) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user already exists in Firestore
      const userDocRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      // If user doesn't exist, create a new document
      if (!userDoc.exists()) {
        const [firstName, ...lastName] = user.displayName?.split(" ") || ["", ""];
        await setDoc(userDocRef, {
            id: user.uid,
            firstName: firstName,
            lastName: lastName.join(" "),
            email: user.email,
        });
      }
      toast({
        title: 'Login Berhasil',
        description: 'Selamat datang kembali!',
      });
      router.push('/');

    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Login Gagal',
        description: 'Gagal login dengan Google. Silakan coba lagi.',
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-background to-purple-900/40 flex items-center justify-center p-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="text-center text-primary hidden md:flex flex-col items-center">
          <Image
            src="/img/logo jumputan.jpg"
            alt="Roemah Jumpoetan Logo"
            width={250}
            height={250}
            className="rounded-full mb-6"
          />
          <h2 className="font-headline text-3xl font-bold">
            Kain Jumputan Dengan Kualitas Terbaik
          </h2>
        </div>

        <div className="w-full max-w-md mx-auto">
          <Card className="bg-card/80 border-border/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl font-bold">
                Log In
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Masukkan Email Address Anda"
                      required
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      Lupa Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Masukkan Password Anda"
                      required
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-full bg-accent hover:bg-accent/80"
                >
                  Log In
                </Button>
              </form>
               <div className="relative my-6">
                <Separator />
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Atau lanjutkan dengan
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full rounded-full" onClick={handleGoogleSignIn}>
                <GoogleIcon />
                Lanjutkan dengan Google
              </Button>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Belum punya akun?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-primary hover:text-primary/80"
                >
                  Daftar
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
