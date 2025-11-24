'use client';

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase, WithId } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

type Order = {
    products: { id: string; quantity: number; }[];
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

const getStockStatus = (stock: number): 'tersedia' | 'hampir habis' | 'habis' => {
    if (stock <= 0) return 'habis';
    if (stock < 10) return 'hampir habis';
    return 'tersedia';
}

const StockStatusBadge = ({ status }: { status: 'tersedia' | 'hampir habis' | 'habis' }) => {
    const variants = {
        'tersedia': 'bg-green-500/20 text-green-500 border-green-500/50',
        'hampir habis': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
        'habis': 'bg-red-500/20 text-red-500 border-red-500/50'
    }
    return <Badge variant="outline" className={cn('capitalize', variants[status])}>{status}</Badge>
}

export default function BarangJadiPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<WithId<Product> | null>(null);
  const [newStock, setNewStock] = useState(0);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), orderBy('name'));
  }, [firestore]);

  const ordersQuery = useMemoFirebase(() => {
      if(!firestore) return null;
      return query(collection(firestore, 'orders'));
  }, [firestore]);

  const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);
  const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);

  const stockData = useMemo(() => {
    if (!products || !orders) return [];

    const productStockMap = new Map<string, { product: WithId<Product>; stockIn: number; stockOut: number; stockFinal: number; }>();

    // Initialize map with current stock from products
    products.forEach(p => {
        productStockMap.set(p.id, {
            product: p,
            stockIn: 0, 
            stockOut: 0,
            stockFinal: p.stock || 0,
        });
    });

    // Calculate stock out from non-cancelled orders
    orders.forEach(order => {
        if (order.status !== 'Cancelled') {
            order.products.forEach(item => {
                if (productStockMap.has(item.id)) {
                    const current = productStockMap.get(item.id)!;
                    current.stockOut += item.quantity;
                }
            });
        }
    });

    // Calculate stock in based on final and out
    productStockMap.forEach((value) => {
        value.stockIn = value.stockFinal + value.stockOut;
    });

    return Array.from(productStockMap.values());

  }, [products, orders]);
  
  const handleEditClick = (product: WithId<Product>) => {
    setEditingProduct(product);
    setNewStock(product.stock || 0);
    setDialogOpen(true);
  };
  
  const handleSaveStock = () => {
    if (!firestore || !editingProduct) return;

    const productDocRef = doc(firestore, 'products', editingProduct.id);
    const updatedData = { stock: Number(newStock) };
    
    updateDoc(productDocRef, updatedData)
      .then(() => {
        toast({
          title: 'Stok Diperbarui',
          description: `Stok untuk ${editingProduct.name} telah diubah menjadi ${newStock}.`,
        });
        setDialogOpen(false);
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: productDocRef.path,
          operation: 'update',
          requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const isLoading = isLoadingProducts || isLoadingOrders;

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Gudang - Barang Jadi</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Stok Produk Jadi</CardTitle>
            <CardDescription>
              Berikut adalah rincian pergerakan stok untuk semua produk jadi yang tersedia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Produk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stok Masuk</TableHead>
                  <TableHead>Stok Keluar</TableHead>
                  <TableHead>Total Akhir Stok</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({length: 5}).map((_, i) => (
                      <TableRow key={i}>
                          <TableCell colSpan={6}><Skeleton className='h-10 w-full' /></TableCell>
                      </TableRow>
                  ))
                ) : stockData && stockData.length > 0 ? (
                  stockData.map(({ product, stockIn, stockOut, stockFinal }) => (
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
                      <TableCell>
                          <StockStatusBadge status={getStockStatus(stockFinal)} />
                      </TableCell>
                      <TableCell>{stockIn}</TableCell>
                      <TableCell>{stockOut}</TableCell>
                      <TableCell className="font-bold">{stockFinal}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(product)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Belum ada produk.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Stok Produk</DialogTitle>
            <DialogDescription>
              Ubah jumlah stok untuk: <span className="font-semibold text-foreground">{editingProduct?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="stock">Jumlah Stok Baru</Label>
            <Input
              id="stock"
              type="number"
              value={newStock}
              onChange={(e) => setNewStock(Number(e.target.value))}
              placeholder="Masukkan jumlah stok"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveStock}>
              Simpan Stok
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
