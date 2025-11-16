'use client';

import Link from 'next/link';
import { ProductCard } from './product-card';
import { Button } from './ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { type Product } from '@/lib/data';
import { Skeleton } from './ui/skeleton';

export function FeaturedProducts() {
  const firestore = useFirestore();

  const featuredProductsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), limit(4));
  }, [firestore]);

  const { data: featuredProducts, isLoading } = useCollection<Omit<Product, 'id'>>(featuredProductsQuery);

  return (
    <section className="py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-bold">
            Our Premium Collection
          </h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Discover our handpicked selection of the finest Jumputan creations,
            where tradition meets contemporary elegance.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {isLoading ? (
             Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="aspect-[3/4] w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ))
          ) : (
            featuredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
