'use client';

import React from 'react';
import { useFirestore, useMemoFirebase, useCollection, WithId } from '@/firebase';
import { collection, query, orderBy, limit, getDocs, collectionGroup } from 'firebase/firestore';
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

type ProductRating = {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  productId?: string; // Will be added when flattening
  productName?: string; // Will be added when flattening
  productImageUrl?: string; // Will be added when flattening
};

export default function RatingProdukPage() {
  const firestore = useFirestore();
  const [allRatings, setAllRatings] = React.useState<WithId<ProductRating>[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Query across all 'ratings' subcollections in the entire database
  const ratingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collectionGroup(firestore, 'ratings'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: fetchedRatings, isLoading: isLoadingRatings } = useCollection<Omit<ProductRating, 'id'>>(ratingsQuery);
  const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]));

  React.useEffect(() => {
    if (isLoadingRatings || isLoadingProducts) {
      setIsLoading(true);
      return;
    }
    if (!fetchedRatings || !products) {
       setIsLoading(false);
       return;
    }

    const productsMap = new Map(products.map(p => [p.id, p]));

    const ratingsWithProductInfo = fetchedRatings.map(rating => {
      // The path of a subcollection document is 'products/{productId}/ratings/{ratingId}'
      const pathSegments = rating.id.split('/');
      const productId = pathSegments.length > 2 ? pathSegments[pathSegments.length - 3] : undefined;
      const product = productId ? productsMap.get(productId) : undefined;
      
      return {
        ...rating,
        productId,
        productName: product?.name || 'Unknown Product',
        productImageUrl: product?.imageUrl
      };
    }).filter(r => r.productId); // Filter out any ratings that couldn't be mapped to a product

    setAllRatings(ratingsWithProductInfo as WithId<ProductRating>[]);
    setIsLoading(false);

  }, [fetchedRatings, products, isLoadingRatings, isLoadingProducts]);

  
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
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
                                    <Image src={rating.productImageUrl} alt={rating.productName || 'product'} fill className='object-cover' />
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
                    <TableCell colSpan={5} className="h-48 flex items-center justify-center text-center text-muted-foreground">
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
