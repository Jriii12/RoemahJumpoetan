'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  MessageSquare,
  Archive,
  User,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

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
    label: 'Obrolan',
    href: '/admin/chat',
    icon: MessageSquare,
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

export function AdminSidebar() {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Produk: false,
    Pesanan: false,
    Gudang: false,
  });
  const auth = useAuth();
  const router = useRouter();

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
      className="w-64 flex-shrink-0 p-4"
      style={{ backgroundColor: 'hsl(var(--admin-sidebar))', color: 'hsl(var(--admin-sidebar-foreground))' }}
    >
      <nav className="flex flex-col space-y-2">
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
                  className="w-full justify-between font-semibold"
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
              <CollapsibleContent className="pl-8 flex flex-col space-y-2 mt-2">
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
              className="w-full justify-start font-semibold"
            >
              <Link href={item.href!} className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </Button>
          )
        )}
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start font-semibold"
        >
          <div className="flex items-center gap-3">
            <LogOut className="h-5 w-5" />
            <span>Log Out</span>
          </div>
        </Button>
      </nav>
    </aside>
  );
}
