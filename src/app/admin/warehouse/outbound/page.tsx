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
    products: { id: string; name: string; quantity: number; }[];
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    orderDate: string;
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

const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
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
      return query(collection(firestore, 'orders'), orderBy('orderDate', 'desc'));
  }, [firestore]);

  const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);
  const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);

  const { finalStockData, stockInData, stockOutData } = useMemo(() => {
    if (!products || !orders) return { finalStockData: [], stockInData: [], stockOutData: [] };

    const productMap = new Map<string, { product: WithId<Product>; stockIn: number; stockOut: number; stockFinal: number; }>();

    products.forEach(p => {
        productMap.set(p.id, {
            product: p,
            stockIn: 0,
            stockOut: 0,
            stockFinal: p.stock || 0,
        });
    });

    const tempStockOutData: { product: WithId<Product>, quantity: number, orderDate: string }[] = [];

    orders.forEach(order => {
        if (order.status !== 'Cancelled') {
            order.products.forEach(item => {
                if (productMap.has(item.id)) {
                    const current = productMap.get(item.id)!;
                    current.stockOut += item.quantity;
                    tempStockOutData.push({ product: current.product, quantity: item.quantity, orderDate: order.orderDate });
                }
            });
        }
    });

    productMap.forEach((value) => {
        value.stockIn = value.stockFinal + value.stockOut;
    });
    
    const finalStockData = Array.from(productMap.values());
    const stockInData = finalStockData.filter(item => item.stockIn > 0);
    const stockOutData = tempStockOutData;

    return { finalStockData, stockInData, stockOutData };

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
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">Gudang - Barang Jadi</h1>

        {/* Stok Akhir Table */}
        <Card>
          <CardHeader>
            <CardTitle>Stok Akhir Produk Jadi</CardTitle>
            <CardDescription>
              Ringkasan stok produk yang tersedia di gudang saat ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Akhir Stok</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({length: 5}).map((_, i) => (
                      <TableRow key={i}>
                          <TableCell colSpan={5}><Skeleton className='h-10 w-full' /></TableCell>
                      </TableRow>
                  ))
                ) : finalStockData.length > 0 ? (
                  finalStockData.map(({ product, stockFinal }) => (
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
                          <StockStatusBadge status={getStockStatus(stockFinal)} />
                      </TableCell>
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
                    <TableCell colSpan={5} className="h-24 text-center">
                      Belum ada data produk.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Stok Masuk Table */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Stok Masuk</CardTitle>
            <CardDescription>
              Daftar semua produk yang masuk ke dalam gudang.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Tgl Masuk</TableHead>
                  <TableHead>Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({length: 3}).map((_, i) => (
                      <TableRow key={i}>
                          <TableCell colSpan={4}><Skeleton className='h-10 w-full' /></TableCell>
                      </TableRow>
                  ))
                ) : stockInData.length > 0 ? (
                  stockInData.map(({ product, stockIn }) => (
                    <TableRow key={`in-${product.id}`}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{formatDate(new Date().toISOString())}</TableCell>
                      <TableCell>{stockIn}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Tidak ada riwayat stok masuk.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Stok Keluar Table */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Stok Keluar</CardTitle>
            <CardDescription>
              Daftar semua produk yang keluar dari gudang berdasarkan pesanan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Tgl Keluar</TableHead>
                  <TableHead>Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({length: 4}).map((_, i) => (
                      <TableRow key={i}>
                          <TableCell colSpan={4}><Skeleton className='h-10 w-full' /></TableCell>
                      </TableRow>
                  ))
                ) : stockOutData.length > 0 ? (
                  stockOutData.map((item, index) => (
                    <TableRow key={`out-${item.product.id}-${index}`}>
                      <TableCell className="font-medium">{item.product.name}</TableCell>
                      <TableCell>{item.product.category}</TableCell>
                      <TableCell>{formatDate(item.orderDate)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Tidak ada riwayat stok keluar.
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
