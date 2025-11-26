'use client';

import React from 'react';
import { useFirestore, WithId } from '@/firebase';
import { collectionGroup, query, onSnapshot, collection, getDocs }from 'firebase/firestore';
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
};

// We will fetch product info separately or it might be denormalized in the rating doc.
// For now, let's just fetch ratings and display what we have.
type AggregatedRating = WithId<ProductRating> & {
    productName?: string;
    productImageUrl?: string;
};


export default function RatingProdukPage() {
  const firestore = useFirestore();
  const [allRatings, setAllRatings] = React.useState<AggregatedRating[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [productsMap, setProductsMap] = React.useState<Map<string, Omit<Product, 'id'>>>(new Map());


  React.useEffect(() => {
    if (!firestore) return;

    // 1. Fetch all products first and create a map. This is done once.
    const fetchProducts = async () => {
      try {
        const productsSnapshot = await getDocs(collection(firestore, 'products'));
        const productsData = new Map<string, Omit<Product, 'id'>>();
        productsSnapshot.forEach(doc => {
          productsData.set(doc.id, doc.data() as Omit<Product, 'id'>);
        });
        setProductsMap(productsData);
        return productsData; // Return for use in the listener
      } catch (error) {
        console.error("Error fetching products:", error);
        setIsLoading(false);
        // Handle product fetch error if necessary
      }
      return new Map();
    };

    const setupListener = async () => {
      setIsLoading(true);
      const fetchedProductsMap = await fetchProducts();

      // 2. Use a collection group query to listen for all ratings in real-time
      const ratingsQuery = query(collectionGroup(firestore, 'ratings'));

      const unsubscribe = onSnapshot(ratingsQuery, 
        (ratingsSnapshot) => {
          let collectedRatings: AggregatedRating[] = ratingsSnapshot.docs.map(doc => {
            const ratingData = doc.data() as ProductRating;
            const productId = doc.ref.parent.parent?.id; // Get parent product ID
            const productInfo = productId ? fetchedProductsMap.get(productId) : undefined;
            
            return {
              id: doc.id,
              ...ratingData,
              productName: productInfo?.name,
              productImageUrl: productInfo?.imageUrl
            };
          });
          
          // 3. Sort the ratings on the client-side
          collectedRatings.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA; // Sort descending
          });

          setAllRatings(collectedRatings);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error fetching ratings with onSnapshot:", error);
          if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
              path: `**/ratings`, // Representing a collection group query
              operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
          }
          setIsLoading(false);
        }
      );

      // Return the unsubscribe function to be called on component unmount
      return unsubscribe;
    };
    
    // Call setupListener and store the unsubscribe function
    const unsubscribePromise = setupListener();

    // Cleanup function
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) {
          unsubscribe();
        }
      });
    };

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
                            <span className='font-medium'>{rating.productName || 'Produk tidak ditemukan'}</span>
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
