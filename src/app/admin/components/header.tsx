'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

type AdminHeaderProps = {
  onMenuClick: () => void;
};

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  return (
    <header
      className="flex h-20 items-center justify-between px-4 sm:px-8"
      style={{ backgroundColor: 'hsl(var(--admin-primary))' }}
    >
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white hover:text-white hover:bg-white/10"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
      </div>
      <Link href="/" className="flex items-center space-x-3">
        <div className="text-right hidden sm:block">
          <span className="font-bold text-sm block">ROEMAH JUMPOETAN</span>
          <span className="text-xs block">PALEMBANG</span>
        </div>
        <Image
          src="/img/logo jumputan.jpg"
          alt="Roemah Jumpoetan Logo"
          width={50}
          height={50}
          className="rounded-full"
        />
      </Link>
    </header>
  );
}
