'use client';

import Image from 'next/image';
import Link from 'next/link';

export function AdminHeader() {
  return (
    <header className="flex h-20 items-center justify-between px-8" style={{ backgroundColor: 'hsl(var(--admin-primary))' }}>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <Link href="/" className="flex items-center space-x-3">
        <div className="text-right">
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
