'use client';

import React, { useState, useMemo } from 'react';
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
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCollection, useFirestore, useMemoFirebase, WithId } from '@/firebase';
import { collection, addDoc, query, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/lib/data';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

type InboundRecord = {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  inboundDate: string;
  notes: string;
};

type OutboundRecord = {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  outboundDate: string;
  purpose: string;
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

const parseQuantity = (quantity: number | string): number => {
  if (typeof quantity === 'number') return quantity;
  return parseInt(quantity, 10) || 0;
};

export default function BarangJadiPage() {
  const [isInboundDialogOpen, setInboundDialogOpen] = useState(false);
  const [isOutboundDialogOpen, setOutboundDialogOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  // Firestore hooks
  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), orderBy('name'));
  }, [firestore]);
  const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

  const inboundQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'inboundFinishedGoods'), orderBy('inboundDate', 'desc'));
  }, [firestore]);
  const { data: inboundRecords, isLoading: isLoadingInbound } = useCollection<InboundRecord>(inboundQuery);

  const outboundQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'outboundFinishedGoods'), orderBy('outboundDate', 'desc'));
  }, [firestore]);
  const { data: outboundRecords, isLoading: isLoadingOutbound } = useCollection<OutboundRecord>(outboundQuery);
  
  const handleInboundFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !products) return;
    const formData = new FormData(e.currentTarget);
    const productId = formData.get('productId') as string;
    const selectedProduct = products.find(p => p.id === productId);

    if (!selectedProduct) {
        toast({ variant: 'destructive', title: 'Produk harus dipilih' });
        return;
    }

    const newInboundData: Omit<InboundRecord, 'id'> = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      category: selectedProduct.category,
      quantity: parseQuantity(formData.get('quantity') as string),
      inboundDate: formData.get('inboundDate') as string,
      notes: formData.get('notes') as string,
    };
    
    const inboundColRef = collection(firestore, 'inboundFinishedGoods');
    addDoc(inboundColRef, newInboundData).then(() => {
      toast({ title: 'Barang masuk berhasil dicatat.' });
      setInboundDialogOpen(false);
    }).catch(err => {
      const permissionError = new FirestorePermissionError({ path: inboundColRef.path, operation: 'create', requestResourceData: newInboundData });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleOutboundFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !products) return;
    const formData = new FormData(e.currentTarget);
    const productId = formData.get('productId') as string;
    const selectedProduct = products.find(p => p.id === productId);

    if (!selectedProduct) {
        toast({ variant: 'destructive', title: 'Produk harus dipilih' });
        return;
    }

    const newOutboundData: Omit<OutboundRecord, 'id'> = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      category: selectedProduct.category,
      quantity: parseQuantity(formData.get('quantity') as string),
      outboundDate: formData.get('outboundDate') as string,
      purpose: formData.get('purpose') as string,
    };

    const outboundColRef = collection(firestore, 'outboundFinishedGoods');
    addDoc(outboundColRef, newOutboundData).then(() => {
      toast({ title: 'Barang keluar berhasil dicatat.' });
      setOutboundDialogOpen(false);
    }).catch(err => {
      const permissionError = new FirestorePermissionError({ path: outboundColRef.path, operation: 'create', requestResourceData: newOutboundData });
      errorEmitter.emit('permission-error', permissionError);
    });
  };
  
  const finalStock = useMemo(() => {
    if (!products) return [];
    return products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        final: p.stock || 0
    }));
  }, [products]);


  const isLoading = isLoadingProducts || isLoadingInbound || isLoadingOutbound;

  return (
    <>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">Gudang - Barang Jadi</h1>

        <Card>
          <CardHeader>
            <CardTitle>Stok Akhir Produk Jadi</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Stok Akhir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingProducts ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={3}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : finalStock.length > 0 ? (
                  finalStock.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className='font-medium'>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className='font-bold text-right'>{item.final}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className='h-24 text-center'>Belum ada data stok.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Riwayat Barang Masuk (Produk Jadi)</CardTitle>
              <Button onClick={() => setInboundDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Catat Barang Masuk
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Tanggal Masuk</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingInbound ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : inboundRecords && inboundRecords.length > 0 ? (
                  inboundRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.productName}</TableCell>
                      <TableCell>{record.category}</TableCell>
                      <TableCell>{record.quantity}</TableCell>
                      <TableCell>{formatDate(record.inboundDate)}</TableCell>
                      <TableCell>{record.notes || '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className='h-24 text-center'>Belum ada riwayat barang masuk.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Riwayat Barang Keluar (Produk Jadi)</CardTitle>
              <Button onClick={() => setOutboundDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Catat Barang Keluar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Tanggal Keluar</TableHead>
                  <TableHead>Keperluan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingOutbound ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : outboundRecords && outboundRecords.length > 0 ? (
                  outboundRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.productName}</TableCell>
                      <TableCell>{record.category}</TableCell>
                      <TableCell>{record.quantity}</TableCell>
                      <TableCell>{formatDate(record.outboundDate)}</TableCell>
                      <TableCell>{record.purpose}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className='h-24 text-center'>Belum ada riwayat barang keluar.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Pencatatan Barang Masuk */}
      <Dialog open={isInboundDialogOpen} onOpenChange={setInboundDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Catat Barang Masuk</DialogTitle>
            <DialogDescription>
              Catat produk jadi yang telah selesai diproduksi dan masuk ke gudang.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInboundFormSubmit} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inbound-productId">Nama Produk</Label>
              <Select name="productId" required>
                <SelectTrigger id="inbound-productId">
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inbound-quantity">Jumlah</Label>
              <Input id="inbound-quantity" name="quantity" type="number" placeholder="Masukkan jumlah" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inbound-date">Tanggal Masuk</Label>
              <Input id="inbound-date" name="inboundDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inbound-notes">Catatan (Opsional)</Label>
              <Input id="inbound-notes" name="notes" placeholder="Contoh: Dari batch produksi #25" />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Batal</Button>
              </DialogClose>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Pencatatan Barang Keluar */}
      <Dialog open={isOutboundDialogOpen} onOpenChange={setOutboundDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Catat Barang Keluar</DialogTitle>
            <DialogDescription>
              Catat produk jadi yang keluar dari gudang untuk keperluan non-penjualan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOutboundFormSubmit} className="grid gap-4 py-4">
             <div className="space-y-2">
              <Label htmlFor="outbound-productId">Nama Produk</Label>
              <Select name="productId" required>
                <SelectTrigger id="outbound-productId">
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="outbound-quantity">Jumlah</Label>
              <Input id="outbound-quantity" name="quantity" type="number" placeholder="Masukkan jumlah" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outbound-date">Tanggal Keluar</Label>
              <Input id="outbound-date" name="outboundDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outbound-purpose">Keperluan</Label>
              <Input id="outbound-purpose" name="purpose" placeholder="Contoh: Sampel untuk pameran" required />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Batal</Button>
              </DialogClose>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
