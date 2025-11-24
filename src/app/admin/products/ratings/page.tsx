'use client';

import React from 'react';
import { useFirestore, WithId } from '@/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/data';
import Image from 'next/image';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type ProductRating = {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  productId?: string;
  productName?: string;
  productImageUrl?: string;
};

export default function RatingProdukPage() {
  const firestore = useFirestore();
  const [allRatings, setAllRatings] = React.useState<WithId<ProductRating>[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch all ratings using a more robust method without collectionGroup
  React.useEffect(() => {
    const fetchAllRatings = async () => {
      if (!firestore) return;
      setIsLoading(true);

      try {
        const productsCollectionRef = collection(firestore, 'products');
        const productsSnapshot = await getDocs(productsCollectionRef).catch(err => {
            const permissionError = new FirestorePermissionError({
              path: productsCollectionRef.path,
              operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            // Return a resolved promise with an empty snapshot to prevent further errors
            return Promise.resolve({ docs: [] as any[] });
        });
        
        const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WithId<Product>[];
        
        let collectedRatings: WithId<ProductRating>[] = [];

        for (const product of productsData) {
          const ratingsQuery = query(collection(firestore, `products/${product.id}/ratings`), orderBy('createdAt', 'desc'));
          const ratingsSnapshot = await getDocs(ratingsQuery);
          
          const productRatings = ratingsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<ProductRating, 'id'>),
            productId: product.id,
            productName: product.name,
            productImageUrl: product.imageUrl,
          }));

          collectedRatings = [...collectedRatings, ...productRatings];
        }

        // Sort all ratings globally by date
        collectedRatings.sort((a, b) => {
            const dateA = (a.createdAt as any).toDate ? (a.createdAt as any).toDate() : new Date(a.createdAt);
            const dateB = (b.createdAt as any).toDate ? (b.createdAt as any).toDate() : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
        });
        
        setAllRatings(collectedRatings);

      } catch (error) {
        // This catch is for unexpected errors during the process, not permission errors which are handled inside.
        console.error("Error fetching ratings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllRatings();
  }, [firestore]);
  
  const formatDate = (dateValue: any) => {
    if (!dateValue) return '-';
    // Handle both string and Firestore Timestamp object
    const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
        <div className="flex items-center">
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
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Rating Produk</h1>
      <Card>
        <CardHeader>
          <CardTitle>Ulasan Pelanggan</CardTitle>
          <CardDescription>
            Berikut adalah daftar ulasan dan rating yang diberikan oleh pelanggan untuk setiap produk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
              <TableHeader>
              <TableRow>
                  <TableHead className='w-[250px]'>Produk</TableHead>
                  <TableHead className='w-[150px]'>Pelanggan</TableHead>
                  <TableHead className='w-[120px]'>Rating</TableHead>
                  <TableHead>Ulasan</TableHead>
                  <TableHead className='w-[150px]'>Tanggal</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
              {isLoading ? (
                  Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={5}><Skeleton className="h-12 w-full" /></TableCell>
                    </TableRow>
                ))
              ) : allRatings.length > 0 ? (
                  allRatings.map((rating) => (
                  <TableRow key={rating.id}>
                      <TableCell>
                          <div className='flex items-center gap-3'>
                            {rating.productImageUrl && (
                                <div className='relative h-10 w-10 rounded-md overflow-hidden'>
                                    <Image src={rating.productImageUrl} alt={rating.productName || 'product'} fill className='object-cover' sizes="40px" />
                                </div>
                            )}
                            <span className='font-medium'>{rating.productName}</span>
                          </div>
                      </TableCell>
                      <TableCell>{rating.userName}</TableCell>
                      <TableCell>{renderStars(rating.rating)}</TableCell>
                      <TableCell className='text-muted-foreground'>{rating.comment || '-'}</TableCell>
                      <TableCell>{formatDate(rating.createdAt)}</TableCell>
                  </TableRow>
                  ))
              ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                        Belum ada rating yang diberikan.
                    </TableCell>
                </TableRow>
              )}
              </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
