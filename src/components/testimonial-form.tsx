
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const testimonialSchema = z.object({
  comment: z.string().min(10, 'Ulasan minimal 10 karakter').max(500, 'Ulasan maksimal 500 karakter'),
  rating: z.number().min(1, 'Rating harus dipilih').max(5),
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

export function TestimonialForm() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      comment: '',
      rating: 0,
    },
  });

  const onSubmit = async (data: TestimonialFormData) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Gagal Mengirim',
        description: 'Anda harus login untuk memberikan ulasan.',
      });
      return;
    }

    const testimonialsColRef = collection(firestore, 'testimonials');

    try {
      await addDoc(testimonialsColRef, {
        userId: user.uid,
        text: data.comment,
        rating: data.rating,
        dateCreated: serverTimestamp(),
      });
      toast({
        title: 'Terima Kasih!',
        description: 'Ulasan Anda telah berhasil dikirim.',
      });
      form.reset();
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Mengirim',
        description: 'Terjadi kesalahan saat mengirim ulasan Anda.',
      });
    }
  };

  return (
    <section className="py-12 md:py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="border-border/50 shadow-lg bg-card/50">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl md:text-4xl font-bold">Bagikan Pendapat Anda</CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-2">
              Kami sangat menghargai masukan Anda untuk menjadi lebih baik.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Controller
                    name="rating"
                    control={form.control}
                    render={({ field }) => (
                      <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'h-8 w-8 cursor-pointer transition-colors',
                              (hoveredRating || field.value) >= star
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-400'
                            )}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            onClick={() => field.onChange(star)}
                          />
                        ))}
                      </div>
                    )}
                  />
                  {form.formState.errors.rating && (
                    <p className="text-sm text-destructive text-center mt-2">{form.formState.errors.rating.message}</p>
                  )}
                </div>
                <div>
                  <Controller
                    name="comment"
                    control={form.control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        placeholder="Tulis ulasan Anda di sini..."
                        rows={5}
                        className="bg-background/50"
                      />
                    )}
                  />
                  {form.formState.errors.comment && (
                    <p className="text-sm text-destructive mt-2">{form.formState.errors.comment.message}</p>
                  )}
                </div>
                <div className="text-center">
                  <Button type="submit" size="lg" className="rounded-full bg-accent hover:bg-accent/80">
                    Kirim Ulasan
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Anda harus login untuk memberikan ulasan.</p>
                <Button asChild className="rounded-full bg-accent hover:bg-accent/80">
                  <Link href="/login">Login untuk Memberi Ulasan</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
