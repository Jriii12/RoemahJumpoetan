'use client';

import Link from 'next/link';
import { ProductCard } from './product-card';
import { Button } from './ui/button';
import { useCollection, useFirestore, useMemoFirebase, WithId } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { type Product } from '@/lib/data';
import { Skeleton } from './ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Phone, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useMemo } from 'react';
import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

const clothingCategories = ['Pakaian', 'Pakaian Wanita', 'Pakaian Pria', 'Fashion Muslim'];
const availableSizes = ['M', 'L', 'XL', 'XXL'];

export function FeaturedProducts() {
  const firestore = useFirestore();
  const [selectedProduct, setSelectedProduct] = useState<WithId<Omit<Product, 'id'>> | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const { user } = useUser();
  const { addToCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const featuredProductsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), limit(4));
  }, [firestore]);

  const { data: featuredProducts, isLoading } = useCollection<Omit<Product, 'id'>>(featuredProductsQuery);
  
  const isClothing = selectedProduct && clothingCategories.includes(selectedProduct.category);

  const handleDetailClick = (product: WithId<Omit<Product, 'id'>>) => {
    setSelectedProduct(product);
    setSelectedSize(undefined); // Reset size when opening a new detail
    setIsDetailOpen(true);
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCartFromDetail = () => {
    if (!selectedProduct) return;

    if (isClothing && !selectedSize) {
      toast({
        title: 'Pilih Ukuran',
        description: 'Silakan pilih ukuran terlebih dahulu.',
        variant: 'destructive',
      });
      return;
    }
    
    if (user) {
      addToCart(selectedProduct, selectedSize);
      setIsDetailOpen(false);
    } else {
      toast({
        title: 'Harap Login Terlebih Dahulu',
        description: 'Anda harus login untuk menambahkan produk ke keranjang.',
        variant: 'destructive',
      });
      router.push('/login');
    }
  };

  return (
    <>
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
                <ProductCard key={product.id} product={product} onDetailClick={handleDetailClick} />
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

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-3xl bg-card">
          {selectedProduct && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start'>
                <div className='relative aspect-[3/4] rounded-lg overflow-hidden'>
                     <Image
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        data-ai-hint={selectedProduct.imageHint}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className='flex flex-col h-full pt-2 md:pt-4'>
                    <DialogHeader>
                        <DialogTitle className='font-headline text-2xl md:text-3xl mb-2 text-left'>{selectedProduct.name}</DialogTitle>
                         <div className='flex items-center justify-between text-left'>
                            <p className='text-sm text-muted-foreground'>{selectedProduct.category}</p>
                            <p className="font-bold text-primary text-xl">
                                {formatPrice(selectedProduct.price)}
                            </p>
                         </div>
                    </DialogHeader>

                    {isClothing && (
                      <div className="my-4">
                        <Label className="font-semibold mb-2 block">Pilih Ukuran:</Label>
                        <RadioGroup 
                          value={selectedSize} 
                          onValueChange={setSelectedSize}
                          className="flex items-center gap-2"
                        >
                          {availableSizes.map(size => (
                            <Label 
                              key={size}
                              htmlFor={`size-${size}`}
                              className={`flex items-center justify-center rounded-md border text-sm h-9 w-9 cursor-pointer transition-colors ${selectedSize === size ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent/80'}`}
                            >
                              <RadioGroupItem value={size} id={`size-${size}`} className="sr-only" />
                              {size}
                            </Label>
                          ))}
                        </RadioGroup>
                      </div>
                    )}
                    
                    <div className='flex-grow my-4 text-left'>
                        <DialogDescription asChild>
                            <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground leading-relaxed">
                            {selectedProduct.description.split('\n').map((line, index) => (
                                line.trim() && <li key={index}>{line}</li>
                            ))}
                            </ul>
                        </DialogDescription>
                    </div>

                     <div className="flex flex-col gap-2 mt-auto">
                        <Button size="lg" onClick={handleAddToCartFromDetail}>
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Tambah ke Keranjang
                        </Button>
                        <a href="https://wa.me/6282178200327?text=Saya%20tertarik%20dengan%20produk%20ini" target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="lg" className="w-full">
                            <Phone className="mr-2 h-5 w-5" />
                            Hubungi Admin
                          </Button>
                        </a>
                      </div>
                </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
