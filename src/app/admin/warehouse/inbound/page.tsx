'use client';

import React, { useState } from 'react';
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

const purchasedMaterials = [
  { id: '1', name: 'Kain Katun Jepang', quantity: '50 meter', store: 'Toko Kain Maju Jaya', date: '2023-11-20' },
  { id: '2', name: 'Benang Emas', quantity: '10 gulung', store: 'Supplier Benang Kilau', date: '2023-11-18' },
  { id: '3', name: 'Pewarna Tekstil (Merah)', quantity: '5 botol', store: 'Toko Kimia Warna', date: '2023-11-15' },
];

const usedMaterials = [
  { id: '1', name: 'Kain Katun Jepang', quantity: '10 meter', purpose: 'Produksi Kemeja Batch #23', date: '2023-11-22' },
  { id: '2', name: 'Benang Emas', quantity: '2 gulung', purpose: 'Finishing Selendang Sutra', date: '2023-11-21' },
];

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

export default function BarangMentahPage() {
  const [isPurchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Logic to handle form submission, e.g., save to Firestore
    console.log("Form submitted");
    setPurchaseDialogOpen(false);
  }

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold mb-4">Gudang - Barang Mentah</h1>

        {/* Tabel Barang Mentah Sudah Dibeli */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Barang Mentah Dibeli</CardTitle>
               <Button onClick={() => setPurchaseDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Catat Pembelian
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Nama Toko</TableHead>
                  <TableHead>Tanggal Beli</TableHead>
                   <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchasedMaterials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell>{material.quantity}</TableCell>
                    <TableCell>{material.store}</TableCell>
                    <TableCell>{formatDate(material.date)}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="link" className="p-0 h-auto">Detail</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Tabel Barang Mentah Sudah Digunakan */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Barang Mentah Digunakan</CardTitle>
               <Button>
                <Plus className="mr-2 h-4 w-4" />
                Catat Penggunaan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Keperluan</TableHead>
                  <TableHead>Tanggal Digunakan</TableHead>
                   <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usedMaterials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell>{material.quantity}</TableCell>
                    <TableCell>{material.purpose}</TableCell>
                    <TableCell>{formatDate(material.date)}</TableCell>
                     <TableCell className="text-right">
                       <Button variant="link" className="p-0 h-auto">Detail</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isPurchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Catat Pembelian Barang Mentah</DialogTitle>
            <DialogDescription>
              Isi detail pembelian barang mentah di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Barang</Label>
              <Input
                id="name"
                name="name"
                placeholder="Contoh: Kain Katun Jepang"
                required
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="quantity">Jumlah</Label>
              <Input
                id="quantity"
                name="quantity"
                placeholder="Contoh: 50 meter"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeName">Nama Toko</Label>
              <Input
                id="storeName"
                name="storeName"
                placeholder="Contoh: Toko Kain Maju Jaya"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Tanggal Beli</Label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                required
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </DialogClose>
              <Button type="submit">
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
