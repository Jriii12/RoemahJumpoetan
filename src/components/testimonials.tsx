'use client';

import { useCollection, useFirestore, useMemoFirebase, WithId } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';

type TestimonialData = {
  id: string;
  userId: string;
  text: string;
  rating: number;
  dateCreated: string;
};

type UserProfile = {
  firstName?: string;
  lastName?: string;
};

type EnrichedTestimonial = TestimonialData & {
  userName: string;
  userLocation?: string; // Assuming location might not always be there
};

const renderStars = (rating: number) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-4 w-4',
            rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          )}
        />
      ))}
    </div>
  );
};

export function Testimonials() {
  const firestore = useFirestore();
  const [testimonials, setTestimonials] = useState<EnrichedTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const testimonialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'testimonials'), limit(3));
  }, [firestore]);

  const { data: testimonialsData } = useCollection<TestimonialData>(testimonialsQuery);

  useEffect(() => {
    if (!testimonialsData || !firestore) return;

    const fetchUserDetails = async () => {
      setIsLoading(true);
      const enrichedTestimonials = await Promise.all(
        testimonialsData.map(async (testimonial) => {
          const userDocRef = doc(firestore, 'users', testimonial.userId);
          const userDocSnap = await getDoc(userDocRef);
          let userName = 'Anonymous';
          let userLocation = 'Unknown';
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserProfile;
            userName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Anonymous';
            // Assuming location is stored as `address`, modify if different
            // For now, we'll keep it simple as location isn't in User schema.
          }
          return { ...testimonial, userName, userLocation };
        })
      );
      setTestimonials(enrichedTestimonials);
      setIsLoading(false);
    };

    fetchUserDetails();
  }, [testimonialsData, firestore]);

  return (
    <section className="py-12 md:py-24 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-bold">
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            We are proud to share the experiences of our valued patrons.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="bg-card border-border/50 shadow-lg">
                  <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-1/4 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))
            : testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="bg-card border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex flex-col gap-2">
                       <div className="flex items-center justify-between">
                         <span className="font-bold text-lg">{testimonial.userName}</span>
                         {renderStars(testimonial.rating)}
                       </div>
                      <span className="text-sm font-normal text-muted-foreground">
                        {testimonial.userLocation}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="italic">"{testimonial.text}"</p>
                  </CardContent>
                </Card>
              ))}
          {(!isLoading && testimonials.length === 0) && (
            <p className="col-span-full text-center text-muted-foreground">
              Belum ada testimoni.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
