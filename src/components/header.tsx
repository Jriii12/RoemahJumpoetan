'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, Menu, ShoppingCart, User as UserIcon } from 'lucide-react';
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
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';

type UserProfile = {
  firstName: string;
  lastName: string;
};

function UserAuthControl() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid);
    }
    return null;
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  const getInitials = () => {
    if (userProfile) {
      const { firstName, lastName } = userProfile;
      return `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
    }
    return '';
  };
  
  if (isUserLoading) {
     return <div className="h-9 w-28 animate-pulse rounded-full bg-muted"></div>
  }

  if (user) {
    return (
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {userProfile?.firstName} {userProfile?.lastName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/account')}>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Akun Saya</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button asChild className="ml-2 rounded-full bg-accent hover:bg-accent/80 text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 h-auto">
      <Link href="/login">Login/Daftar</Link>
    </Button>
  )

}


export function Header() {
  const { cartCount } = useCart();
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden flex-shrink-0">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-background">
              <nav className="grid gap-6 text-lg font-medium p-6">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Image
                    src="/img/logo jumputan.jpg"
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
              src="/img/logo jumputan.jpg"
              alt="Roemah Jumpoetan Logo"
              width={50}
              height={50}
              className="rounded-full hidden sm:block"
            />
             <Image
              src="/img/logo jumputan.jpg"
              alt="Roemah Jumpoetan Logo"
              width={40}
              height={40}
              className="rounded-full sm:hidden"
            />
            <span className="font-bold font-headline text-base sm:text-lg hidden sm:inline-block">
              ROEMAH JUMPOETAN
              <br />
              PALEMBANG
            </span>
          </Link>
        </div>
        
        {/* Center Section - Desktop Navigation */}
        <div className="hidden md:flex flex-1 justify-center">
            <nav className="flex items-center gap-6 text-sm font-medium">
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
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-end space-x-2">
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
          
          {isClient ? <UserAuthControl /> : <div className="h-9 w-28 animate-pulse rounded-full bg-muted"></div>}
        </div>
      </div>
    </header>
  );
}
