'use client';

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase, WithId } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
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
import { Plus, Minus, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

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
  const [dialogMode, setDialogMode] = useState<'add' | 'subtract' | null>(null);
  const [editingProduct, setEditingProduct] = useState<WithId<Product> | null>(null);
  const [stockChange, setStockChange] = useState(0);
  const [note, setNote] = useState('');

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), orderBy('name'));
  }, [firestore]);

  const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

  const handleOpenDialog = (product: WithId<Product>, mode: 'add' | 'subtract') => {
    setEditingProduct(product);
    setDialogMode(mode);
    setStockChange(0);
    setNote('');
    setDialogOpen(true);
  };
  
  const handleSaveStock = () => {
    if (!firestore || !editingProduct || !dialogMode || stockChange <= 0) {
        toast({
            variant: 'destructive',
            title: 'Input tidak valid',
            description: 'Jumlah stok harus lebih besar dari 0.'
        });
        return;
    };

    const productDocRef = doc(firestore, 'products', editingProduct.id);
    const amountToChange = dialogMode === 'add' ? increment(stockChange) : increment(-stockChange);
    
    updateDoc(productDocRef, { stock: amountToChange })
      .then(() => {
        toast({
          title: 'Stok Berhasil Diperbarui',
          description: `Stok untuk ${editingProduct.name} telah diubah.`,
        });
        setDialogOpen(false);
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: productDocRef.path,
          operation: 'update',
          requestResourceData: { stock: `increment(${dialogMode === 'add' ? stockChange : -stockChange})` },
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const isLoading = isLoadingProducts;

  return (
    <>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">Gudang - Stok Produk Jadi</h1>

        {/* Stok Akhir Table */}
        <Card>
          <CardHeader>
            <CardTitle>Stok Akhir Produk Jadi</CardTitle>
            <CardDescription>
              Kelola inventaris produk yang tersedia di gudang. Tambah stok untuk barang yang baru selesai diproduksi atau kurangi untuk keperluan lain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Jumlah Stok</TableHead>
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
                      <TableCell className="font-bold">{product.stock || 0}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2" onClick={() => handleOpenDialog(product, 'add')}>
                            <Plus className="h-4 w-4 mr-1" />
                            Masuk
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(product, 'subtract')}>
                            <Minus className="h-4 w-4 mr-1" />
                            Keluar
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
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
                {dialogMode === 'add' ? 'Catat Barang Masuk' : 'Catat Barang Keluar'}
            </DialogTitle>
            <DialogDescription>
              Masukkan jumlah stok untuk: <span className="font-semibold text-foreground">{editingProduct?.name}</span>.
              Stok saat ini: <span className="font-semibold text-foreground">{editingProduct?.stock || 0}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
                <Label htmlFor="stockChange">Jumlah</Label>
                <Input
                  id="stockChange"
                  type="number"
                  value={stockChange}
                  onChange={(e) => setStockChange(Number(e.target.value))}
                  placeholder="Masukkan jumlah stok"
                  min="1"
                />
            </div>
             {dialogMode === 'subtract' && (
               <div>
                <Label htmlFor="note">Catatan (Opsional)</Label>
                <Input
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Contoh: Untuk sampel foto"
                />
                </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveStock}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
