'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, ShoppingCart } from 'lucide-react';
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
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Header() {
  const { cartCount } = useCart();
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden flex-shrink-0 mr-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-background">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Image
                    src="/logo.png"
                    alt="Roemah Jumpoetan Logo"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <span className="font-bold font-headline">
                    Roemah Jumpoetan
                  </span>
                </Link>
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link href={link.href} className="hover:text-primary/80">
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="Roemah Jumpoetan Logo"
              width={60}
              height={60}
              className="rounded-full"
            />
            <span className="font-bold font-headline text-lg hidden sm:inline-block">
              ROEMAH JUMPOETAN
              <br />
              PALEMBANG
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'transition-colors hover:text-primary/80 relative',
                pathname === link.href ? 'text-primary' : 'text-primary/60'
              )}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary"></span>
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                {cartCount}
              </span>
            )}
            <span className="sr-only">Shopping Cart</span>
          </Button>
          <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />
          <Button asChild className="ml-2 rounded-full bg-accent hover:bg-accent/80">
            <Link href="/login">Login/Daftar</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
