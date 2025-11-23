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
  Archive,
  ArrowDown,
  ArrowUp,
  BarChart,
  Calendar as CalendarIcon,
  DollarSign,
  Package,
  TriangleAlert,
} from 'lucide-react';
import { AdminDonutChart } from '../components/charts';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import React from 'react';
import { cn } from '@/lib/utils';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

const MetricCard = ({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: { value: string; direction: 'up' | 'down' };
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend && (
        <p className="text-xs text-muted-foreground flex items-center">
          {trend.direction === 'up' ? (
            <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
          ) : (
            <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
          )}
          {trend.value} dari bulan lalu
        </p>
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
  const bestSellers = [
    { id: '1', name: 'Kain Jumputan Merah', purchases: 120 },
    { id: '2', name: 'Gaun Pesta Jumputan', purchases: 95 },
    { id: '3', name: 'Kemeja Pria Jumputan', purchases: 80 },
    { id: '4', name: 'Selendang Sutra', purchases: 72 },
    { id: '5', name: 'Blouse Wanita Modern', purchases: 65 },
  ];
  const isLoadingBestSellers = false;

  const lowStockProducts = [
      {id: '1', name: 'Kain Jumputan Biru', stock: 8},
      {id: '2', name: 'Tas Pesta', stock: 5},
  ];
  const isLoadingLowStock = false;
  
  const getStockStatus = (stock: number): 'tersedia' | 'hampir habis' | 'habis' => {
    if (stock <= 0) return 'habis';
    if (stock < 10) return 'hampir habis';
    return 'tersedia';
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dasbor</h1>
        <Button variant="outline">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Rentang Waktu: Hari Ini
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Penjualan"
          value={formatPrice(973000)}
          icon={DollarSign}
          trend={{ value: '+12.5%', direction: 'up' }}
        />
        <MetricCard
          title="Uang Masuk"
          value={formatPrice(30973000)}
          icon={ArrowDown}
          trend={{ value: '+20.1%', direction: 'up' }}
        />
        <MetricCard
          title="Uang Keluar"
          value={formatPrice(28088000)}
          icon={ArrowUp}
          trend={{ value: '-5.2%', direction: 'down' }}
        />
      </div>

       <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
            <CardHeader className='pb-2'>
                <CardTitle className='text-base'>Total Uang Masuk</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xl font-bold">{formatPrice(30973000)}</p>
            </CardContent>
        </Card>
         <Card className="md:col-span-1">
            <CardHeader className='pb-2'>
                <CardTitle className='text-base'>Total Uang Keluar</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xl font-bold">{formatPrice(28088000)}</p>
            </CardContent>
        </Card>
         <Card className="md:col-span-1">
            <CardHeader className='pb-2'>
                <CardTitle className='text-base'>Total Uang Toko</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xl font-bold">{formatPrice(2885000)}</p>
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
                {isLoadingBestSellers ? Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className='h-8 w-full'/></TableCell>
                        <TableCell><Skeleton className='h-8 w-full'/></TableCell>
                    </TableRow>
                )) : bestSellers && bestSellers.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className='font-medium'>{product.name}</TableCell>
                    <TableCell className="text-right">{product.purchases}</TableCell>
                  </TableRow>
                ))}
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
            <AdminDonutChart type="paymentMethod" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Arus Kas</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminDonutChart type="cashflow" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
