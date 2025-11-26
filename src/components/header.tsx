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
import { Skeleton } from './ui/skeleton';

// --- TIPE DATA ---
type UserProfile = {
  firstName: string;
  lastName: string;
};

// --- KOMPONEN AUTH ---
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
    return 'U';
  };
  
  if (isUserLoading) {
      return <Skeleton className="h-9 w-24 rounded-full" />
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-transparent focus:ring-0">
            <Avatar className="h-9 w-9 border">
              <AvatarImage src={user?.photoURL || undefined} alt="User avatar" />
              <AvatarFallback className="bg-accent/10 text-accent font-bold">{getInitials()}</AvatarFallback>
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
          <DropdownMenuItem onClick={() => router.push('/account')} className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Akun Saya</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button asChild className="rounded-full bg-accent hover:bg-accent/80 text-accent-foreground text-xs sm:text-sm px-4 py-2 h-auto font-medium shadow-sm">
      <Link href="/login">Login/Daftar</Link>
    </Button>
  )
}

// --- KOMPONEN UTAMA HEADER ---
export function Header() {
  const { cartCount } = useCart();
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-colors duration-300',
        scrolled ? 'border-border/50 bg-background/95 backdrop-blur' : 'border-transparent bg-background/80'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-4 md:w-1/3">
            {/* Mobile Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden -ml-2 text-primary hover:text-primary/70"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="/" className="flex items-center gap-2 mb-6">
                    <Image
                      src="/img/logo jumputan.jpg"
                      alt="Logo"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <span className="font-bold text-lg text-primary">Roemah Jumpoetan</span>
                  </Link>
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          'text-lg font-medium py-2 transition-colors hover:text-accent',
                          pathname === link.href ? 'text-accent' : 'text-primary'
                        )}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo Desktop */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative overflow-hidden rounded-full border border-border/50 shadow-sm">
                <Image
                  src="/img/logo jumputan.jpg"
                  alt="Roemah Jumpoetan Logo"
                  width={48}
                  height={48}
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="hidden md:flex flex-col justify-center">
                <span className="font-bold font-headline text-sm leading-none tracking-wide uppercase text-primary">
                  Roemah Jumpoetan
                </span>
                <span className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground mt-1 uppercase">
                  Palembang
                </span>
              </div>
            </Link>
          </div>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center justify-center gap-8 lg:gap-10 md:w-1/3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative text-sm font-medium transition-colors hover:text-primary/70',
                  pathname === link.href
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute -bottom-[29px] left-1/2 -translate-x-1/2 w-full h-[2px] bg-accent rounded-t-full"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center justify-end gap-3 md:w-1/3">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-muted text-primary"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground shadow-sm">
                  {cartCount}
                </span>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Button>

            <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />

            <div className="hidden sm:block">
              <UserAuthControl />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
