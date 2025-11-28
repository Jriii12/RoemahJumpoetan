
'use client';

import React from 'react';
import { useFirestore, WithId } from '@/firebase';
import { collectionGroup, query, onSnapshot, collection, getDocs, orderBy }from 'firebase/firestore';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
  createdAt: string; // Should be ISO string or Firebase Timestamp
};

type AggregatedRating = WithId<ProductRating> & {
    productName?: string;
    productImageUrl?: string;
};


export default function RatingProdukPage() {
  const firestore = useFirestore();
  const [allRatings, setAllRatings] = React.useState<AggregatedRating[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [productsMap, setProductsMap] = React.useState<Map<string, Omit<Product, 'id'>>>(new Map());
  const [selectedRating, setSelectedRating] = React.useState<AggregatedRating | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);


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

      return unsubscribe;
    };
    
    const unsubscribePromise = setupListener();

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

  const handleRowClick = (rating: AggregatedRating) => {
    setSelectedRating(rating);
    setIsDetailOpen(true);
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold mb-4">Rating Produk</h1>
        <Card>
          <CardHeader>
            <CardTitle>Ulasan Pelanggan</CardTitle>
            <CardDescription>
              Berikut adalah daftar ulasan dan rating yang diberikan oleh pelanggan untuk setiap produk. Klik baris untuk melihat detail.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className='w-[120px]'>Rating</TableHead>
                    <TableHead>Ulasan</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Tanggal</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? (
                    Array.from({length: 5}).map((_, i) => (
                      <TableRow key={i}>
                          <TableCell colSpan={4}><Skeleton className="h-12 w-full" /></TableCell>
                      </TableRow>
                  ))
                ) : allRatings.length > 0 ? (
                    allRatings.map((rating) => (
                    <TableRow key={rating.id} onClick={() => handleRowClick(rating)} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>{renderStars(rating.rating)}</TableCell>
                        <TableCell className='text-muted-foreground truncate max-w-sm'>{rating.comment || '-'}</TableCell>
                        <TableCell>{rating.productName || 'N/A'}</TableCell>
                        <TableCell>{formatDate(rating.createdAt)}</TableCell>
                    </TableRow>
                    ))
                ) : (
                  <TableRow>
                      <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                          Belum ada rating yang diberikan.
                      </TableCell>
                  </TableRow>
                )}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-lg">
            {selectedRating && (
                <>
                <DialogHeader>
                    <DialogTitle>Detail Ulasan</DialogTitle>
                    <DialogDescription>
                        Ulasan lengkap dari pelanggan untuk produk.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    {/* Product Info */}
                    <div className="flex items-start gap-4 p-4 rounded-md border bg-muted/30">
                        {selectedRating.productImageUrl && (
                            <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                                <Image src={selectedRating.productImageUrl} alt={selectedRating.productName || 'Produk'} fill className="object-cover" />
                            </div>
                        )}
                        <div>
                            <p className="font-semibold text-sm text-muted-foreground">PRODUK</p>
                            <p className="font-bold text-foreground">{selectedRating.productName || 'Produk tidak ditemukan'}</p>
                        </div>
                    </div>
                    {/* User & Date */}
                    <div className='space-y-4'>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-semibold text-muted-foreground">PELANGGAN</p>
                                <p className="text-foreground">{selectedRating.userName}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-muted-foreground">TANGGAL</p>
                                <p className="text-foreground">{formatDate(selectedRating.createdAt)}</p>
                            </div>
                        </div>
                         {/* Rating and Comment */}
                        <div>
                            <p className="font-semibold text-muted-foreground text-sm">RATING</p>
                            {renderStars(selectedRating.rating)}
                        </div>
                        <div>
                            <p className="font-semibold text-muted-foreground text-sm">ULASAN</p>
                            <p className="text-foreground text-base leading-relaxed mt-1">{selectedRating.comment}</p>
                        </div>
                    </div>
                </div>
                </>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
