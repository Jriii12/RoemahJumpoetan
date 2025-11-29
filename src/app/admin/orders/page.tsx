
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
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
import { MoreHorizontal, Pencil, Trash2, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

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
  const [selectedOrder, setSelectedOrder] = useState<WithId<Order> | null>(null);

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'orders'), orderBy('orderDate', 'desc'));
  }, [firestore]);

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);
  
  useEffect(() => {
    // If the selected order is deleted from the main list, close the detail view.
    if (selectedOrder && orders && !orders.find(o => o.id === selectedOrder.id)) {
      setSelectedOrder(null);
    }
  }, [orders, selectedOrder]);


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

  const handleUpdateStatus = async (newStatus: Order['status']) => {
    if (!firestore || !selectedOrder) return;
    
    const orderDocRef = doc(firestore, 'orders', selectedOrder.id);
    
    updateDoc(orderDocRef, { status: newStatus }).then(() => {
        toast({ title: 'Status Pesanan Diperbarui' });
        // Update local state to reflect the change immediately
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }).catch(err => {
        const permissionError = new FirestorePermissionError({
          path: orderDocRef.path,
          operation: 'update',
          requestResourceData: { status: newStatus }
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
        if(selectedOrder?.id === order.id) {
          setSelectedOrder(null); // Close detail view if the deleted order was selected
        }
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: orderDocRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <div className="flex h-full">
      <div className={cn("flex-grow transition-all duration-300", selectedOrder ? 'pr-4 w-2/3' : 'w-full')}>
        <h1 className="text-2xl font-bold mb-4">Pesanan</h1>
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pesanan Masuk</CardTitle>
            <CardDescription>
              Kelola semua pesanan yang masuk dari pelanggan. Klik baris untuk melihat detail.
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
                  <TableHead className="text-right w-[50px]">Aksi</TableHead>
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
                    <TableRow key={order.id} onClick={() => setSelectedOrder(order)} className={cn('cursor-pointer', selectedOrder?.id === order.id && 'bg-muted/50')}>
                      <TableCell className="font-mono text-xs">{order.id.substring(0, 7)}</TableCell>
                      <TableCell>{formatDate(order.orderDate)}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                      <TableCell>
                          <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={(e) => e.stopPropagation()} // Prevent row click
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
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

      {/* --- Order Detail Pane --- */}
      {selectedOrder && (
         <Card className="w-1/3 h-full flex flex-col transition-all duration-300 ease-in-out">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Detail Pesanan</CardTitle>
                    <CardDescription>ID: {selectedOrder.id.substring(0, 7)}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedOrder(null)}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <Separator />
            <CardContent className="p-6 flex-grow overflow-y-auto space-y-6">
                {/* Customer Details */}
                <div>
                    <h4 className="font-semibold text-sm mb-2">Pelanggan</h4>
                    <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">{selectedOrder.customerName}</p>
                        <p>{selectedOrder.customerDetails.address}</p>
                        <p>{selectedOrder.customerDetails.city}, {selectedOrder.customerDetails.postalCode}</p>
                    </div>
                </div>

                <Separator />
                
                {/* Product List */}
                <div>
                    <h4 className="font-semibold text-sm mb-4">Produk ({selectedOrder.products.length})</h4>
                    <div className="space-y-4">
                        {selectedOrder.products.map(product => (
                            <div key={product.id} className="flex items-start gap-4">
                                <Image src={product.imageUrl} alt={product.name} width={48} height={64} className="rounded-md object-cover border" />
                                <div className="text-sm flex-grow">
                                    <p className="font-medium text-foreground">{product.name} {product.size ? `(${product.size})` : ''}</p>
                                    <p className="text-muted-foreground">{product.quantity} x {formatPrice(product.price)}</p>
                                </div>
                                <p className="text-sm font-medium text-foreground">{formatPrice(product.quantity * product.price)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                 <Separator />

                {/* Total */}
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Pengiriman</span>
                        <span>{formatPrice(0)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base">
                        <span>Total</span>
                        <span>{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                </div>

            </CardContent>
            <Separator />
            <CardFooter className="p-6">
                <div className="w-full space-y-2">
                    <Label htmlFor="status" className="text-xs font-semibold">UBAH STATUS PESANAN</Label>
                    <Select value={selectedOrder.status} onValueChange={handleUpdateStatus}>
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
            </CardFooter>
         </Card>
      )}
    </div>
  );
}


