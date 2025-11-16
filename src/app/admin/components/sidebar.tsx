'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Archive,
  User,
  LogOut,
  Pencil,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const menuItems = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Produk',
    icon: ShoppingBag,
    subItems: [
      { label: 'Kelola Produk', href: '/admin/products' },
      { label: 'Tambah Produk', href: '/admin/products/add' },
      { label: 'Rating Produk', href: '/admin/products/ratings' },
    ],
  },
  {
    label: 'Pesanan',
    icon: ShoppingCart,
    subItems: [
      { label: 'Order', href: '/admin/orders' },
      { label: 'Pengiriman', href: '/admin/orders/shipping' },
      { label: 'Return/Refund', href: '/admin/orders/returns' },
    ],
  },
  {
    label: 'Gudang',
    icon: Archive,
    subItems: [
      { label: 'Barang Masuk', href: '/admin/warehouse/inbound' },
      { label: 'Barang Keluar', href: '/admin/warehouse/outbound' },
    ],
  },
  {
    label: 'Informasi Akun',
    href: '/admin/account',
    icon: User,
  },
];

type UserProfile = {
  firstName?: string;
  lastName?: string;
};

type AdminSidebarProps = {
  className?: string;
};

export function AdminSidebar({ className }: AdminSidebarProps) {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Produk: false,
    Pesanan: false,
    Gudang: false,
  });
  const auth = useAuth();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

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


  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/admin/login');
    }
  };

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      className={cn(
        'w-64 flex-shrink-0 p-4 flex flex-col border-r',
        'bg-[hsl(var(--admin-sidebar))] text-[hsl(var(--admin-sidebar-foreground))] border-[hsl(var(--admin-border))]',
        className
      )}
    >
      <div className="flex items-center gap-4 mb-4 p-2">
        {isLoading ? (
          <Skeleton className="h-10 w-10 rounded-full" />
        ) : (
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.photoURL || undefined} />
            <AvatarFallback className='bg-muted text-muted-foreground'>{getInitials()}</AvatarFallback>
          </Avatar>
        )}
        <div className="flex-grow">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
            </div>
          ) : (
            <p className="font-bold">{userProfile?.firstName || 'Admin'}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
      <Separator className='bg-[hsl(var(--admin-border))]' />
      <nav className="flex-grow flex flex-col space-y-2 mt-4">
        {menuItems.map((item) =>
          item.subItems ? (
            <Collapsible
              key={item.label}
              open={openMenus[item.label]}
              onOpenChange={() => toggleMenu(item.label)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between font-semibold text-base"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                  {openMenus[item.label] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-12 flex flex-col space-y-2 mt-2">
                {item.subItems.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {sub.label}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className="w-full justify-start font-semibold text-base"
            >
              <Link href={item.href!} className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </Button>
          )
        )}
      </nav>
    </aside>
  );
}
