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
import { Phone, Search, ShoppingCart, Star } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, WithId, useUser } from '@/firebase';
import { collection, query, orderBy, addDoc } from 'firebase/firestore';
import type { Product } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

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
const clothingCategories = ['Pakaian', 'Pakaian Wanita', 'Pakaian Pria', 'Fashion Muslim'];
const availableSizes = ['M', 'L', 'XL', 'XXL'];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Produk');
  const [selectedProduct, setSelectedProduct] = useState<WithId<Omit<Product, 'id'>> | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');


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
  
  const isClothing = selectedProduct && clothingCategories.includes(selectedProduct.category);

  const handleDetailClick = (product: WithId<Omit<Product, 'id'>>) => {
    setSelectedProduct(product);
    setSelectedSize(undefined); // Reset size when opening a new detail
    setRating(0);
    setReviewText('');
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

  const handleRatingSubmit = async () => {
    if (!firestore || !user || !selectedProduct) {
        toast({
            variant: 'destructive',
            title: 'Gagal',
            description: 'Anda harus login untuk memberi rating.',
        });
        return;
    }
    if (rating === 0) {
        toast({
            variant: 'destructive',
            title: 'Gagal',
            description: 'Silakan pilih rating bintang terlebih dahulu.',
        });
        return;
    }

    const ratingsColRef = collection(firestore, 'products', selectedProduct.id, 'ratings');
    const newRatingData = {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        rating: rating,
        comment: reviewText,
        createdAt: new Date().toISOString(),
    };

    try {
        await addDoc(ratingsColRef, newRatingData);
        toast({
            title: 'Terima Kasih!',
            description: 'Rating Anda telah berhasil dikirimkan.',
        });
        setRating(0);
        setReviewText('');
    } catch (e) {
        const permissionError = new FirestorePermissionError({
            path: ratingsColRef.path,
            operation: 'create',
            requestResourceData: newRatingData,
        });
        errorEmitter.emit('permission-error', permissionError);
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
        <DialogContent className="sm:max-w-4xl bg-card">
          {selectedProduct && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start'>
                <div className='flex flex-col gap-6'>
                    <div className='relative aspect-[3/4] rounded-lg overflow-hidden'>
                         <Image
                            src={selectedProduct.imageUrl}
                            alt={selectedProduct.name}
                            data-ai-hint={selectedProduct.imageHint}
                            fill
                            className="object-cover"
                        />
                    </div>
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

                    <div className="mt-4 pt-4 border-t">
                        <h4 className="font-semibold mb-2">Beri Rating & Ulasan</h4>
                         <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                key={star}
                                className={cn(
                                    'h-6 w-6 cursor-pointer transition-colors',
                                    (hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                )}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                />
                            ))}
                        </div>
                        <Textarea
                            placeholder="Tulis ulasan Anda di sini..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            className="mb-2"
                        />
                        <Button onClick={handleRatingSubmit} size="sm">Kirim Ulasan</Button>
                    </div>


                     <div className="flex flex-col gap-2 mt-auto pt-4">
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
