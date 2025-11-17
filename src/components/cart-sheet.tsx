'use client';

import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

type CartSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg bg-background">
        <SheetHeader className="px-6">
          <SheetTitle className="font-headline text-2xl text-primary">
            Shopping Cart
          </SheetTitle>
        </SheetHeader>
        <Separator className="bg-border/50"/>
        {cartItems.length > 0 ? (
          <>
            <ScrollArea className="my-4 flex-1">
              <div className="flex flex-col gap-6 px-6">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex items-start gap-4">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-border">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        data-ai-hint={item.product.imageHint}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <h4 className="font-semibold text-primary">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.product.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity - 1
                            )
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity + 1
                            )
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator className="bg-border/50"/>
            <SheetFooter className="p-6">
              <div className="w-full space-y-4">
                <div className="flex justify-between text-lg font-semibold text-primary">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <SheetClose asChild>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-full"
                    style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
                  >
                    Proceed to Checkout
                  </Button>
                </SheetClose>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <h3 className="font-semibold text-xl text-primary">Your cart is empty</h3>
            <p className="text-muted-foreground">
              Add some beautiful Jumputan products to get started.
            </p>
            <SheetClose asChild>
              <Button asChild className="rounded-full">
                <Link href="/products">Start Shopping</Link>
              </Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
