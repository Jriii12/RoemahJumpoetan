'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firebase not available',
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Email Terkirim',
        description:
          'Silakan periksa kotak masuk Anda untuk tautan reset password.',
      });
      router.push('/login');
    } catch (error: any) {
      let description = 'Terjadi kesalahan. Silakan coba lagi.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        description = 'Email tidak terdaftar.';
      } else if (error.code === 'auth/invalid-email') {
          description = 'Silakan masukkan alamat email yang valid.';
      }
      toast({
        variant: 'destructive',
        title: 'Gagal Mengirim Email',
        description,
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-background to-purple-900/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <Card className="bg-card/80 border-border/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl font-bold">
              Lupa Password
            </CardTitle>
            <CardDescription>
              Masukkan alamat email Anda di bawah ini untuk menerima tautan
              reset password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full rounded-full bg-accent hover:bg-accent/80"
              >
                Kirim Tautan Reset
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Button asChild variant="link" className="text-primary">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
