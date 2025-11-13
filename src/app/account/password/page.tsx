'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const formSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password saat ini harus diisi'),
    newPassword: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof formSchema>;

export default function PasswordPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Anda harus login untuk mengubah password.',
      });
      return;
    }

    const credential = EmailAuthProvider.credential(currentUser.email, data.currentPassword);

    try {
      await reauthenticateWithCredential(currentUser, credential);
      // Re-authentication successful, now update the password
      await updatePassword(currentUser, data.newPassword);
      toast({
        title: 'Berhasil!',
        description: 'Password Anda telah berhasil diperbarui.',
      });
      form.reset();
    } catch (error: any) {
      let description = 'Terjadi kesalahan. Silakan coba lagi.';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = 'Password saat ini yang Anda masukkan salah.';
      } else if (error.code === 'auth/requires-recent-login') {
        description =
          'Sesi Anda telah berakhir. Silakan logout dan login kembali untuk mengubah password.';
      }
      toast({
        variant: 'destructive',
        title: 'Gagal Memperbarui Password',
        description: description,
      });
    }
  };

  return (
    <Card className="bg-card/30 border-border/50 flex-grow">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Ubah Password</CardTitle>
        <p className="text-muted-foreground text-sm">
          Untuk keamanan akun Anda, mohon untuk tidak menyebarkan password Anda
          ke orang lain.
        </p>
      </CardHeader>
      <Separator />
      <CardContent className="p-6">
        <div className="max-w-md mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
               <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-3 items-center gap-4">
                    <FormLabel className="text-right text-muted-foreground">
                      Password Saat Ini
                    </FormLabel>
                    <FormControl className="col-span-2 relative">
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Password Saat Ini"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Eye className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <div className="col-start-2 col-span-2">
                        <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-3 items-center gap-4">
                    <FormLabel className="text-right text-muted-foreground">
                      Password Baru
                    </FormLabel>
                    <FormControl className="col-span-2 relative">
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Password Baru"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Eye className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <div className="col-start-2 col-span-2">
                        <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-3 items-center gap-4">
                    <FormLabel className="text-right text-muted-foreground">
                      Konfirmasi Password
                    </FormLabel>
                    <FormControl className="col-span-2">
                       <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Konfirmasi Password"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Eye className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                     <div className="col-start-2 col-span-2">
                        <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1"></div>
                <div className="col-span-2">
                  <Button type="submit" className="rounded-full bg-accent hover:bg-accent/80">
                    Konfirmasi
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
