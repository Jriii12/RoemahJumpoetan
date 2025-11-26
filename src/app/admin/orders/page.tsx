'use client';

import React, { useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase, WithId } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
  CardDescription
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


type Order = {
    userId: string;
    customerName: string;
    customerDetails: {
      firstName: string;
      lastName: string;
      address: string;
      city: string;
      postalCode: string;
    },
    products: { id: string; name: string; quantity: number; price: number; imageUrl: string; size?: string; }[];
    totalAmount: number;
    orderDate: string;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

const statusOptions: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const statusVariantMap: Record<Order['status'], 'default' | 'secondary' | 'destructive'> = {
    Pending: 'default',
    Processing: 'secondary',
    Shipped: 'secondary',
    Delivered: 'secondary',
    Cancelled: 'destructive'
}
const getStatusVariant = (status: Order['status']) => {
    return statusVariantMap[status] || 'default';
}

export default function PesananPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WithId<Order> | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [status, setStatus] = useState<Order['status'] | ''>('');


  const ordersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'orders'), orderBy('orderDate', 'desc'));
  }, [firestore]);

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  useEffect(() => {
    if (editingOrder) {
      setCustomerName(editingOrder.customerName);
      setStatus(editingOrder.status);
      setEditDialogOpen(true);
    } else {
      setCustomerName('');
      setStatus('');
    }
  }, [editingOrder]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleEditClick = (order: WithId<Order>) => {
    setEditingOrder(order);
  };

  const handleEditFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !editingOrder) return;
    
    const orderDocRef = doc(firestore, 'orders', editingOrder.id);
    const updatedData = {
      customerName,
      status,
    };
    
    updateDoc(orderDocRef, updatedData).then(() => {
        toast({ title: 'Pesanan Berhasil Diperbarui' });
        setEditDialogOpen(false);
        setEditingOrder(null);
    }).catch(err => {
        const permissionError = new FirestorePermissionError({
          path: orderDocRef.path,
          operation: 'update',
          requestResourceData: updatedData
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleDelete = async (order: WithId<Order>) => {
    if (!firestore) return;
    const orderDocRef = doc(firestore, 'orders', order.id);
    deleteDoc(orderDocRef)
      .then(() => {
        toast({
          title: 'Pesanan Berhasil Dihapus',
          description: `Pesanan dari "${order.customerName}" telah dihapus.`,
        });
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: orderDocRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setEditingOrder(null);
    }
    setEditDialogOpen(isOpen);
  };

  return (
    <>
    <div>
      <h1 className="text-2xl font-bold mb-4">Pesanan</h1>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan Masuk</CardTitle>
          <CardDescription>
            Kelola semua pesanan yang masuk dari pelanggan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID Pesanan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
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
              ) : orders && orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id.substring(0, 7)}</TableCell>
                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Buka menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditClick(order)} className='cursor-pointer'>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    <span>Edit Pesanan</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                            onSelect={(e) => e.preventDefault()}
                                            className='text-destructive focus:text-destructive cursor-pointer'
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          <span>Hapus Pesanan</span>
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Hapus Pesanan?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Apakah Anda yakin ingin menghapus pesanan dari "{order.customerName}"? Tindakan ini tidak dapat diurungkan.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(order)}
                                                className="bg-destructive hover:bg-destructive/80"
                                            >
                                                Hapus
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Belum ada pesanan yang masuk.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    
    <Dialog open={isEditDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
          <DialogHeader>
              <DialogTitle>Ubah Data Pesanan</DialogTitle>
              <DialogDescription>
                  Perbarui detail pesanan di bawah ini.
              </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditFormSubmit} className="grid gap-4 py-4">
              <div className="space-y-2">
                  <Label htmlFor="customerName">Nama Pelanggan</Label>
                  <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="status">Status Pesanan</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as Order['status'])} required>
                      <SelectTrigger id="status">
                          <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                          {statusOptions.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>
              <DialogFooter>
                  <DialogClose asChild>
                      <Button type="button" variant="outline">Batal</Button>
                  </DialogClose>
                  <Button type="submit">Simpan Perubahan</Button>
              </DialogFooter>
          </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
