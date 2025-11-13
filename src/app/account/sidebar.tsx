'use client';

import { useMemoFirebase, useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  MapPin,
  Newspaper,
  Pencil,
  Shield,
  User,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type UserProfile = {
  firstName: string;
  lastName: string;
};

export function Sidebar() {
  const { user } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();

  const userDocRef = useMemoFirebase(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid);
    }
    return null;
  }, [user, firestore]);

  const { data: userProfile, isLoading } = useDoc<UserProfile>(userDocRef);

  const getInitials = () => {
    if (userProfile) {
      const { firstName, lastName } = userProfile;
      return `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
    }
    return '';
  };

  const navItems = [
    { href: '/account/profile', icon: User, label: 'Profil' },
    { href: '/account/address', icon: MapPin, label: 'Alamat' },
    { href: '/account/password', icon: Shield, label: 'Ubah Password' },
  ];

  const secondaryNav = [
    { href: '/account/orders', icon: Newspaper, label: 'Pesanan Saya' },
    { href: '/account/notifications', icon: Bell, label: 'Notifikasi' },
  ];

  return (
    <Card className="w-full md:w-64 flex-shrink-0 bg-card/30 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-4 mb-6">
          {isLoading ? (
            <Skeleton className="h-12 w-12 rounded-full" />
          ) : (
            <Avatar className="h-12 w-12">
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
          )}
          <div className="flex-grow">
            {isLoading ? (
              <div className='space-y-2'>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ) : (
              <>
                <p className="font-bold">{userProfile?.firstName}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary cursor-pointer">
                  <Pencil className="h-3 w-3" />
                  <span>Ubah Profil</span>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="font-semibold text-sm mb-2 px-2">Akun Saya</p>
        <nav className="flex flex-col gap-1">
          {navItems.map((item, index) => (
             <Button
              key={index}
              asChild
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              className="justify-start gap-3 px-2"
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>
        <Separator className="my-4" />
        <nav className="flex flex-col gap-1">
          {secondaryNav.map((item, index) => (
             <Button
              key={index}
              asChild
              variant='ghost'
              className="justify-start gap-3 px-2"
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}
