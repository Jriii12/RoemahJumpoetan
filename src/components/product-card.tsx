'use client';

import Image from 'next/image';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/data';
import { ShoppingCart } from 'lucide-react';
import type { WithId } from '@/firebase';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

type ProductCardProps = {
  product: WithId<Omit<Product, 'id'>>;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (user) {
      addToCart(product);
    } else {
      toast({
        title: 'Harap Login Terlebih Dahulu',
        description: 'Anda harus login untuk menambahkan produk ke keranjang.',
        variant: 'destructive',
      });
      router.push('/login');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full group bg-card border-border/50">
      <CardHeader className="p-0">
        <div className="aspect-[3/4] overflow-hidden relative">
          <Image
            src={product.imageUrl}
            alt={product.name}
            data-ai-hint={product.imageHint}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-muted-foreground text-sm">{product.category}</p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <p className="font-bold text-primary text-base md:text-lg whitespace-nowrap">
          {formatPrice(product.price)}
        </p>
        <Button
          onClick={handleAddToCart}
          variant="outline"
          size="icon"
          className="hover:bg-primary hover:text-primary-foreground rounded-full flex-shrink-0 ml-2"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="sr-only">Add to Cart</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
