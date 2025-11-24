'use client';

import React from 'react';
import { useFirestore, useMemoFirebase, useCollection, WithId } from '@/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
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

type ProductRating = {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type ProductWithRatings = WithId<Product> & {
  ratings: WithId<ProductRating>[];
};

export default function RatingProdukPage() {
  const firestore = useFirestore();
  const [productsWithRatings, setProductsWithRatings] = React.useState<ProductWithRatings[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), orderBy('name'));
  }, [firestore]);

  const { data: products } = useCollection<Product>(productsQuery);

  React.useEffect(() => {
    if (!products || !firestore) return;

    const fetchRatings = async () => {
      setIsLoading(true);
      const allProductsWithRatings: ProductWithRatings[] = [];

      for (const product of products) {
        const ratingsQuery = query(
          collection(firestore, `products/${product.id}/ratings`),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const ratingsSnapshot = await getDocs(ratingsQuery);
        const ratings = ratingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithId<ProductRating>));
        
        if (ratings.length > 0) {
            allProductsWithRatings.push({ ...product, ratings });
        }
      }
      setProductsWithRatings(allProductsWithRatings);
      setIsLoading(false);
    };

    fetchRatings();
  }, [products, firestore]);
  
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
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : productsWithRatings.length > 0 ? (
            <div className="space-y-8">
              {productsWithRatings.map((product) => (
                <div key={product.id}>
                    <h3 className='font-bold text-lg mb-2'>{product.name}</h3>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className='w-[150px]'>Tanggal</TableHead>
                            <TableHead className='w-[150px]'>Pelanggan</TableHead>
                            <TableHead className='w-[120px]'>Rating</TableHead>
                            <TableHead>Ulasan</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {product.ratings.map((rating) => (
                            <TableRow key={rating.id}>
                            <TableCell>{formatDate(rating.createdAt)}</TableCell>
                            <TableCell>{rating.userName}</TableCell>
                            <TableCell>{renderStars(rating.rating)}</TableCell>
                            <TableCell className='text-muted-foreground'>{rating.comment || '-'}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-center text-muted-foreground">
              Belum ada rating yang diberikan.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
