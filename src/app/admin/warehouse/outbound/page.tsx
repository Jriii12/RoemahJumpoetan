'use client';

import React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


const StockStatusBadge = ({ status }: { status: 'tersedia' | 'hampir habis' | 'habis' }) => {
    const variants = {
        'tersedia': 'bg-green-500/20 text-green-500 border-green-500/50',
        'hampir habis': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
        'habis': 'bg-red-500/20 text-red-500 border-red-500/50'
    }
    return <Badge variant="outline" className={cn('capitalize', variants[status])}>{status}</Badge>
}

const getStockStatus = (stock: number): 'tersedia' | 'hampir habis' | 'habis' => {
    if (stock <= 0) return 'habis';
    if (stock < 10) return 'hampir habis';
    return 'tersedia';
}


export default function BarangJadiPage() {
  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), orderBy('name'));
  }, [firestore]);

  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gudang - Barang Jadi</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Stok Produk Jadi</CardTitle>
          <CardDescription>
            Berikut adalah daftar stok untuk semua produk jadi yang tersedia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Stok Tersedia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className='h-10 w-full' /></TableCell>
                        <TableCell><Skeleton className='h-10 w-full' /></TableCell>
                        <TableCell><Skeleton className='h-10 w-full' /></TableCell>
                        <TableCell><Skeleton className='h-10 w-full' /></TableCell>
                    </TableRow>
                ))
              ) : products && products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 rounded-md overflow-hidden">
                           <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes='48px'
                          />
                        </div>
                        <span>{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                        <StockStatusBadge status={getStockStatus(product.stock || 0)} />
                    </TableCell>
                    <TableCell className="text-right font-bold">{product.stock || 0}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Belum ada produk.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
