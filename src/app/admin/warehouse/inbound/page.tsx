'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
import { collection, addDoc, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

type PurchasedMaterial = {
  name: string;
  quantity: string;
  storeName: string;
  purchaseDate: string;
};

type UsedMaterial = {
  name: string;
  quantity: string;
  purpose: string;
  usageDate: string;
};

const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Helper to parse quantity strings like "100 meter" into { value: 100, unit: "meter" }
const parseQuantity = (quantityStr: string): { value: number; unit: string } => {
    const match = quantityStr.match(/^(\d+)\s*(\D+)$/);
    if (match) {
        return { value: parseInt(match[1], 10), unit: match[2].trim() };
    }
    return { value: 0, unit: '' };
};

export default function BarangMentahPage() {
  const [isPurchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [isUsageDialogOpen, setUsageDialogOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  // State for purchase form
  const [purchaseName, setPurchaseName] = useState('');
  const [purchaseStore, setPurchaseStore] = useState('');

  // Firestore hooks
  const purchasesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'purchasedRawMaterials'), orderBy('purchaseDate', 'desc'));
  }, [firestore]);
  const { data: purchasedMaterials, isLoading: isLoadingPurchases } = useCollection<PurchasedMaterial>(purchasesQuery);

  const usagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'usedRawMaterials'), orderBy('usageDate', 'desc'));
  }, [firestore]);
  const { data: usedMaterials, isLoading: isLoadingUsages } = useCollection<UsedMaterial>(usagesQuery);
  
  const { uniqueMaterialNames, materialToStoreMap } = useMemo(() => {
    if (!purchasedMaterials) return { uniqueMaterialNames: [], materialToStoreMap: new Map() };
    const names = new Set<string>();
    const storeMap = new Map<string, string>();
    // Iterate in reverse to get the latest purchase first
    for (let i = purchasedMaterials.length - 1; i >= 0; i--) {
        const material = purchasedMaterials[i];
        names.add(material.name);
        if (!storeMap.has(material.name)) {
            storeMap.set(material.name, material.storeName);
        }
    }
    return { uniqueMaterialNames: Array.from(names).sort(), materialToStoreMap: storeMap };
  }, [purchasedMaterials]);

  useEffect(() => {
    if (isPurchaseDialogOpen) {
      setPurchaseName('');
      setPurchaseStore('');
    }
  }, [isPurchaseDialogOpen]);

  const handlePurchaseMaterialSelect = (name: string) => {
    if (name === 'addNew') {
      setPurchaseName('');
      setPurchaseStore('');
    } else {
      setPurchaseName(name);
      setPurchaseStore(materialToStoreMap.get(name) || '');
    }
  };

  const handlePurchaseFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) return;
    const formData = new FormData(e.currentTarget);
    const newPurchaseData = {
      name: purchaseName || formData.get('customName') as string,
      quantity: formData.get('quantity') as string,
      storeName: purchaseStore,
      purchaseDate: formData.get('purchaseDate') as string,
    };
    
    if (!newPurchaseData.name) {
        toast({ variant: 'destructive', title: 'Nama barang harus diisi' });
        return;
    }
    
    const purchasesColRef = collection(firestore, 'purchasedRawMaterials');
    addDoc(purchasesColRef, newPurchaseData).then(() => {
        toast({ title: "Pembelian berhasil dicatat." });
        setPurchaseDialogOpen(false);
    }).catch(err => {
        const permissionError = new FirestorePermissionError({
            path: purchasesColRef.path,
            operation: 'create',
            requestResourceData: newPurchaseData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }
  
  const handleUsageFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) return;
    const formData = new FormData(e.currentTarget);
    const newUsageData = {
      name: formData.get('name') as string,
      quantity: formData.get('quantity') as string,
      purpose: formData.get('purpose') as string,
      usageDate: formData.get('usageDate') as string,
    };

    if (!newUsageData.name || newUsageData.name === 'addNew') {
        toast({ variant: 'destructive', title: 'Nama barang harus dipilih' });
        return;
    }

    const usagesColRef = collection(firestore, 'usedRawMaterials');
    addDoc(usagesColRef, newUsageData).then(() => {
        toast({ title: "Penggunaan berhasil dicatat." });
        setUsageDialogOpen(false);
    }).catch(err => {
        const permissionError = new FirestorePermissionError({
            path: usagesColRef.path,
            operation: 'create',
            requestResourceData: newUsageData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }

  // Calculate final stock
  const finalStock = useMemo(() => {
    const stockMap = new Map<string, { purchased: number; used: number; unit: string }>();

    purchasedMaterials?.forEach(material => {
      const { value, unit } = parseQuantity(material.quantity);
      if (!unit) return;
      const key = `${material.name.toLowerCase()}_${unit.toLowerCase()}`;
      const current = stockMap.get(key) || { purchased: 0, used: 0, unit };
      current.purchased += value;
      stockMap.set(key, current);
    });

    usedMaterials?.forEach(material => {
      const { value, unit } = parseQuantity(material.quantity);
      if (!unit) return;
      const key = `${material.name.toLowerCase()}_${unit.toLowerCase()}`;
      const current = stockMap.get(key) || { purchased: 0, used: 0, unit };
      current.used += value;
      stockMap.set(key, current);
    });

    return Array.from(stockMap.entries()).map(([key, data]) => {
        const [name] = key.split('_');
        return {
            name: name.charAt(0).toUpperCase() + name.slice(1),
            purchased: data.purchased,
            used: data.used,
            final: data.purchased - data.used,
            unit: data.unit,
        }
    });

  }, [purchasedMaterials, usedMaterials]);

  const isLoading = isLoadingPurchases || isLoadingUsages;

  return (
    <>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">Gudang - Barang Mentah</h1>

        {/* Tabel Stok Akhir */}
        <Card>
            <CardHeader>
                <CardTitle>Stok Akhir Barang Mentah</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Barang</TableHead>
                            <TableHead>Total Beli</TableHead>
                            <TableHead>Total Pakai</TableHead>
                            <TableHead>Stok Akhir</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({length: 3}).map((_,i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : finalStock.length > 0 ? (
                           finalStock.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className='font-medium'>{item.name}</TableCell>
                                    <TableCell>{item.purchased} {item.unit}</TableCell>
                                    <TableCell>{item.used} {item.unit}</TableCell>
                                    <TableCell className='font-bold'>{item.final} {item.unit}</TableCell>
                                </TableRow>
                           ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className='h-24 text-center'>Belum ada data stok.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        {/* Tabel Barang Mentah Sudah Dibeli */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Riwayat Pembelian Barang Mentah</CardTitle>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingPurchases ? (
                    Array.from({length: 3}).map((_,i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                        </TableRow>
                    ))
                ) : purchasedMaterials && purchasedMaterials.length > 0 ? (
                    purchasedMaterials.map((material) => (
                    <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell>{material.quantity}</TableCell>
                        <TableCell>{material.storeName}</TableCell>
                        <TableCell>{formatDate(material.purchaseDate)}</TableCell>
                    </TableRow>
                    ))
                ) : (
                     <TableRow>
                        <TableCell colSpan={4} className='h-24 text-center'>Belum ada riwayat pembelian.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Tabel Barang Mentah Sudah Digunakan */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Riwayat Penggunaan Barang Mentah</CardTitle>
               <Button onClick={() => setUsageDialogOpen(true)}>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingUsages ? (
                     Array.from({length: 2}).map((_,i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                        </TableRow>
                    ))
                ) : usedMaterials && usedMaterials.length > 0 ? (
                    usedMaterials.map((material) => (
                    <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell>{material.quantity}</TableCell>
                        <TableCell>{material.purpose}</TableCell>
                        <TableCell>{formatDate(material.usageDate)}</TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className='h-24 text-center'>Belum ada riwayat penggunaan.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Pencatatan Pembelian */}
      <Dialog open={isPurchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Catat Pembelian Barang Mentah</DialogTitle>
            <DialogDescription>
              Isi detail pembelian barang mentah di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePurchaseFormSubmit} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Barang</Label>
              <Select onValueChange={handlePurchaseMaterialSelect} defaultValue="">
                <SelectTrigger id="name">
                  <SelectValue placeholder="Pilih atau ketik barang baru" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueMaterialNames.map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                  <SelectItem value="addNew">-- Ketik Barang Baru --</SelectItem>
                </SelectContent>
              </Select>
              {purchaseName === '' && (
                <Input
                  name="customName"
                  placeholder="Ketik nama barang baru"
                  className="mt-2"
                  required
                />
              )}
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
                value={purchaseStore}
                onChange={(e) => setPurchaseStore(e.target.value)}
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
      
      {/* Dialog Pencatatan Penggunaan */}
      <Dialog open={isUsageDialogOpen} onOpenChange={setUsageDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Catat Penggunaan Barang Mentah</DialogTitle>
            <DialogDescription>
              Isi detail penggunaan barang mentah di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUsageFormSubmit} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="usage-name">Nama Barang</Label>
              <Select name="name" required>
                <SelectTrigger id="usage-name">
                  <SelectValue placeholder="Pilih barang yang digunakan" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueMaterialNames.map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="usage-quantity">Jumlah</Label>
              <Input
                id="usage-quantity"
                name="quantity"
                placeholder="Contoh: 10 meter"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Keperluan</Label>
              <Input
                id="purpose"
                name="purpose"
                placeholder="Contoh: Produksi Kemeja Batch #24"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usageDate">Tanggal Digunakan</Label>
              <Input
                id="usageDate"
                name="usageDate"
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
