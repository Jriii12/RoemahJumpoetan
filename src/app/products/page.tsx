'use client';

import React, { useState, useMemo } from 'react';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Phone, Search, ShoppingCart } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, WithId, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Product } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const categories = [
  'Semua Produk',
  'Pakaian Wanita',
  'Fashion Muslim',
  'Pakaian Pria',
  'Souvenir & Perlengkapan Pesta',
  'Kain',
  'Pakaian',
  'Aksesoris',
];

const uniqueCategories = [...new Set(categories)];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Produk');
  const [selectedProduct, setSelectedProduct] = useState<WithId<Omit<Product, 'id'>> | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const firestore = useFirestore();
  const { user } = useUser();
  const { addToCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), orderBy('name'));
  }, [firestore]);

  const { data: products, isLoading } = useCollection<Omit<Product, 'id'>>(
    productsQuery
  );

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Semua Produk' ||
        product.category === selectedCategory;
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory, products]);

  const handleDetailClick = (product: WithId<Omit<Product, 'id'>>) => {
    setSelectedProduct(product);
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

    if (user) {
      addToCart(selectedProduct);
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
      <div className="container mx-auto py-8 md:py-12 px-4">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">
            Our Collection
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Browse our entire catalog of authentic Jumputan products.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-full"
            />
          </div>
          <div className="w-full sm:w-64">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="rounded-full">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDetailClick={handleDetailClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg border-border/50">
            <h3 className="font-semibold text-xl">No Products Found</h3>
            <p className="text-muted-foreground mt-2">
              Your search and filter combination did not return any results.
            </p>
          </div>
        )}
      </div>

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
