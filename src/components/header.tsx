'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { useCart } from '@/context/cart-context';
import { navLinks } from '@/lib/data';
import { CartSheet } from './cart-sheet';

export function Header() {
  const { cartCount } = useCart();
  const [isCartOpen, setIsCartOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold font-headline text-lg">
              Roemah Jumpoetan
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex-1 flex items-center md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium">
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold"
                  >
                    <span className="font-bold font-headline">
                      Roemah Jumpoetan
                    </span>
                  </Link>
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link href={link.href} className="hover:text-primary">
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <div className="flex-1 text-center">
                <Link href="/" className="font-bold font-headline text-base">
                    Roemah Jumpoetan
                </Link>
            </div>
        </div>

        <div className="flex flex-none items-center justify-end space-x-2">
          <nav className="flex items-center">
            <Button variant="ghost" size="icon" className="hidden md:inline-flex" asChild>
              <Link href="/login">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Link>
            </Button>
            <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
                <span className="sr-only">Shopping Cart</span>
              </Button>
            </CartSheet>
          </nav>
        </div>
      </div>
    </header>
  );
}
