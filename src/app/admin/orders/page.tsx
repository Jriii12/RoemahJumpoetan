'use client';

import React from 'react';
import { useCollection, useFirestore, useMemoFirebase, WithId } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
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
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


type Order = {
    userId: string;
    customerName: string;
    products: { id: string; name: string; quantity: number; price: number; }[];
    totalAmount: number;
    orderDate: string;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

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

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'orders'), orderBy('orderDate', 'desc'));
  }, [firestore]);

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

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

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    if(!firestore) return;
    const orderDocRef = doc(firestore, 'orders', orderId);
    const updatedData = { status };
    
    updateDoc(orderDocRef, updatedData).then(() => {
        toast({
            title: "Status Pesanan Diperbarui",
            description: `Pesanan ${orderId} sekarang berstatus ${status}.`
        })
    }).catch(err => {
         const permissionError = new FirestorePermissionError({
          path: orderDocRef.path,
          operation: 'update',
          requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', permissionError);
    })
  }

  return (
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
                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Processing')}>
                                    Proses Pesanan
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Shipped')}>
                                    Kirim Pesanan
                                </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Delivered')}>
                                    Selesai
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Cancelled')} className="text-destructive">
                                    Batalkan
                                </DropdownMenuItem>
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
  );
}
