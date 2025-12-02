
'use client';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Box,
  Calendar as CalendarIcon,
  DollarSign,
  Package,
  ShoppingCart,
  TriangleAlert,
} from 'lucide-react';
import { AdminDonutChart } from '../components/charts';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, where } from 'firebase/firestore';

type Order = {
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  products: { id: string; name: string; quantity: number; price: number }[];
  paymentMethod?: 'cod' | 'qris';
};

type InboundRecord = {
  quantity: number;
};

type OutboundRecord = {
  quantity: number;
};

type PurchasedMaterial = {
    quantity: string;
    price: number;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(num);
}

const MetricCard = ({
  title,
  value,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  isLoading?: boolean;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className='h-8 w-3/4' />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
);

const StockStatusBadge = ({ status }: { status: 'tersedia' | 'hampir habis' | 'habis' }) => {
    const variants = {
        'tersedia': 'bg-green-500/20 text-green-500 border-green-500/50',
        'hampir habis': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
        'habis': 'bg-red-500/20 text-red-500 border-red-500/50'
    }
    return <Badge variant="outline" className={cn('capitalize', variants[status])}>{status}</Badge>
}

export default function AdminDashboardPage() {
  const firestore = useFirestore();

  // --- Data Fetching ---
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'orders'));
  }, [firestore]);
  const { data: allOrders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);

  const inboundQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'inboundFinishedGoods'));
  }, [firestore]);
  const { data: inboundRecords, isLoading: isLoadingInbound } = useCollection<InboundRecord>(inboundQuery);

  const outboundQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'outboundFinishedGoods'));
  }, [firestore]);
  const { data: outboundRecords, isLoading: isLoadingOutbound } = useCollection<OutboundRecord>(outboundQuery);
  
  const lowStockQuery = useMemoFirebase(() => {
    if(!firestore) return null;
    return query(collection(firestore, 'products'), where('stock', '<', 10), limit(5));
  }, [firestore]);
  const { data: lowStockProducts, isLoading: isLoadingLowStock } = useCollection<{name: string, stock: number}>(lowStockQuery);

  const purchasedMaterialsQuery = useMemoFirebase(() => {
    if(!firestore) return null;
    return query(collection(firestore, 'purchasedRawMaterials'));
  }, [firestore]);
  const { data: purchasedMaterials, isLoading: isLoadingPurchases } = useCollection<PurchasedMaterial>(purchasedMaterialsQuery);


  // --- Data Calculation ---
  const { deliveredOrders, totalSales, paymentMethodCounts } = useMemo(() => {
    if (!allOrders) return { deliveredOrders: [], totalSales: 0, paymentMethodCounts: { cod: 0, qris: 0 } };
    const delivered = allOrders.filter(o => o.status === 'Delivered');
    const sales = delivered.reduce((sum, order) => sum + order.totalAmount, 0);
    const counts = delivered.reduce((acc, order) => {
        if (order.paymentMethod === 'cod') acc.cod++;
        if (order.paymentMethod === 'qris') acc.qris++;
        return acc;
    }, { cod: 0, qris: 0 });
    return { deliveredOrders: delivered, totalSales: sales, paymentMethodCounts: counts };
  }, [allOrders]);
  
  const totalOutlay = useMemo(() => {
    if(!purchasedMaterials) return 0;
    return purchasedMaterials.reduce((sum, item) => sum + (item.price || 0), 0);
  }, [purchasedMaterials]);

  const totalInboundItems = useMemo(() => {
    return inboundRecords?.reduce((sum, record) => sum + record.quantity, 0) || 0;
  }, [inboundRecords]);

  const totalOutboundItems = useMemo(() => {
    return outboundRecords?.reduce((sum, record) => sum + record.quantity, 0) || 0;
  }, [outboundRecords]);
  
  const bestSellers = useMemo(() => {
    if (!deliveredOrders) return [];
    const productSales: Record<string, {name: string, purchases: number}> = {};

    deliveredOrders.forEach(order => {
        order.products.forEach(product => {
            if(!productSales[product.id]) {
                productSales[product.id] = { name: product.name, purchases: 0 };
            }
            productSales[product.id].purchases += product.quantity;
        })
    });

    return Object.values(productSales)
        .sort((a,b) => b.purchases - a.purchases)
        .slice(0, 5);
  }, [deliveredOrders]);
  
  const getStockStatus = (stock: number): 'tersedia' | 'hampir habis' | 'habis' => {
    if (stock <= 0) return 'habis';
    if (stock < 10) return 'hampir habis';
    return 'tersedia';
  }

  const isLoadingMetrics = isLoadingOrders || isLoadingInbound || isLoadingOutbound || isLoadingPurchases;


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dasbor</h1>
        <Button variant="outline">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Rentang Waktu: Semua
        </Button>
      </div>
      
      {isLoadingLowStock ? <Skeleton className='h-12 w-full' /> : lowStockProducts && lowStockProducts.length > 0 && (
        <Alert variant="destructive" className="bg-yellow-500/10 border-yellow-500/50 text-yellow-500">
          <TriangleAlert className="h-4 w-4 !text-yellow-500" />
          <AlertTitle>Peringatan Stok Rendah</AlertTitle>
          <AlertDescription>
            {lowStockProducts.length} produk memiliki stok di bawah ambang batas. Segera restock untuk menghindari kehabisan.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Penjualan"
          value={formatPrice(totalSales)}
          icon={DollarSign}
          isLoading={isLoadingOrders}
        />
        <MetricCard
          title="Total Pesanan Selesai"
          value={formatNumber(deliveredOrders?.length || 0)}
          icon={ShoppingCart}
          isLoading={isLoadingOrders}
        />
        <MetricCard
          title="Total Barang Masuk"
          value={formatNumber(totalInboundItems)}
          icon={Box}
          isLoading={isLoadingInbound}
        />
        <MetricCard
          title="Total Barang Keluar"
          value={formatNumber(totalOutboundItems)}
          icon={Package}
          isLoading={isLoadingOutbound}
        />
      </div>

       <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
            <CardHeader className='pb-2'>
                <CardTitle className='text-base'>Total Uang Masuk</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoadingOrders ? <Skeleton className="h-7 w-3/4"/> : <p className="text-xl font-bold">{formatPrice(totalSales)}</p>}
            </CardContent>
        </Card>
         <Card className="md:col-span-1">
            <CardHeader className='pb-2'>
                <CardTitle className='text-base'>Total Uang Keluar</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoadingPurchases ? <Skeleton className="h-7 w-3/4"/> : <p className="text-xl font-bold">{formatPrice(totalOutlay)}</p>}
            </CardContent>
        </Card>
         <Card className="md:col-span-1">
            <CardHeader className='pb-2'>
                <CardTitle className='text-base'>Total Uang Toko</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoadingMetrics ? <Skeleton className="h-7 w-3/4"/> : <p className="text-xl font-bold">{formatPrice(totalSales - totalOutlay)}</p>}
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead className="text-right">Jumlah Pembelian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingOrders ? Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className='h-8 w-full'/></TableCell>
                        <TableCell><Skeleton className='h-8 w-full'/></TableCell>
                    </TableRow>
                )) : bestSellers.length > 0 ? bestSellers.map((product) => (
                  <TableRow key={product.name}>
                    <TableCell className='font-medium'>{product.name}</TableCell>
                    <TableCell className="text-right">{product.purchases}</TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={2} className="text-center h-24">Belum ada penjualan.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status Stok Produk</CardTitle>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingLowStock ? Array.from({length: 3}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className='h-8 w-full'/></TableCell>
                        <TableCell><Skeleton className='h-8 w-full'/></TableCell>
                        <TableCell><Skeleton className='h-8 w-full'/></TableCell>
                    </TableRow>
                )) : lowStockProducts && lowStockProducts.length > 0 ? lowStockProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className='font-medium'>{product.name}</TableCell>
                    <TableCell>
                        <StockStatusBadge status={getStockStatus(product.stock || 0)} />
                    </TableCell>
                    <TableCell className="text-right">{product.stock}</TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={3} className='text-center h-24'>Semua stok aman!</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
       <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transaksi per Metode Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? <div className='h-[250px] flex items-center justify-center'><Skeleton className="h-48 w-48 rounded-full"/></div> : 
            <AdminDonutChart type="paymentMethod" data={{ cash: paymentMethodCounts.cod, qris: paymentMethodCounts.qris }} />
            }
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Arus Kas</CardTitle>
          </CardHeader>
          <CardContent>
             {isLoadingMetrics ? <div className='h-[250px] flex items-center justify-center'><Skeleton className="h-48 w-48 rounded-full"/></div> : 
                <AdminDonutChart type="cashflow" data={{ sales: totalSales, purchase: totalOutlay }} />
             }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

