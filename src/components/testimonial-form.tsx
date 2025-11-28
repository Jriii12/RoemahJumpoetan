
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
  CardDescription,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Product } from '@/lib/data';

const testimonialSchema = z.object({
  text: z
    .string()
    .min(10, 'Testimoni minimal 10 karakter')
    .max(500, 'Testimoni maksimal 500 karakter'),
  rating: z.number().min(1, 'Rating harus dipilih').max(5),
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

export function TestimonialForm() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [hoveredRating, setHoveredRating] = useState(0);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'));
  }, [firestore]);

  const { data: products } = useCollection<Omit<Product, 'id'>>(productsQuery);

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      text: '',
      rating: 0,
    },
  });

  const onSubmit = async (data: TestimonialFormData) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Gagal Mengirim',
        description: 'Anda harus login untuk memberikan testimoni.',
      });
      return;
    }
    
    if (!products || products.length === 0) {
        toast({
            variant: 'destructive',
            title: 'Gagal Mengirim',
            description: 'Tidak ada produk untuk diberi ulasan saat ini.',
        });
        return;
    }

    // Pick a random product to assign the review to
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const productRatingsColRef = collection(firestore, `products/${randomProduct.id}/ratings`);

    const newRatingData = {
      userId: user.uid,
      userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      comment: data.text,
      rating: data.rating,
      createdAt: new Date().toISOString(),
    };

    addDoc(productRatingsColRef, newRatingData)
      .then(() => {
        toast({
          title: 'Terima Kasih!',
          description: 'Ulasan Anda telah berhasil dikirim dan akan muncul di dasbor admin.',
        });
        form.reset();
      })
      .catch(() => {
        const optimisticPath = `${productRatingsColRef.path}/[new_rating]`;
        const permissionError = new FirestorePermissionError({
          path: optimisticPath,
          operation: 'create',
          requestResourceData: newRatingData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <section className="py-12 md:py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="border-border/50 shadow-lg bg-card/50">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl md:text-4xl font-bold">
              Bagikan Pendapat Anda
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-2">
              Kami sangat menghargai masukan Anda untuk menjadi lebih baik.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isUserLoading ? (
              <div className="text-center text-muted-foreground">Memuat...</div>
            ) : user ? (
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          'h-8 w-8 cursor-pointer transition-colors',
                          (hoveredRating || form.watch('rating')) >= star
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-400'
                        )}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() =>
                          form.setValue('rating', star, {
                            shouldValidate: true,
                          })
                        }
                      />
                    ))}
                  </div>
                  {form.formState.errors.rating && (
                    <p className="text-sm text-destructive text-center mt-2">
                      {form.formState.errors.rating.message}
                    </p>
                  )}
                </div>
                <div>
                  <Textarea
                    {...form.register('text')}
                    placeholder="Tulis testimoni Anda di sini..."
                    rows={5}
                    className="bg-background/50"
                  />
                  {form.formState.errors.text && (
                    <p className="text-sm text-destructive mt-2">
                      {form.formState.errors.text.message}
                    </p>
                  )}
                </div>
                <div className="text-center">
                  <Button
                    type="submit"
                    size="lg"
                    className="rounded-full bg-accent hover:bg-accent/80"
                  >
                    Kirim Testimoni
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Anda harus login untuk memberikan testimoni.
                </p>
                <Button
                  asChild
                  className="rounded-full bg-accent hover:bg-accent/80"
                >
                  <Link href="/login">Login untuk Memberi Testimoni</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
