'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useCollection, useFirestore, useMemoFirebase, WithId } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
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
import { Button } from '@/components/ui/button';
import { Printer, Calendar as CalendarIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useReactToPrint } from 'react-to-print';
import { SalesReportPrint } from './report';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type Order = {
    totalAmount: number;
    orderDate: string;
    customerName: string;
    products: { name: string; quantity: number; price: number; }[];
};

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

export default function SalesReportPage() {
    const firestore = useFirestore();
    const printComponentRef = useRef<HTMLDivElement>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const deliveredOrdersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        
        const constraints = [where('status', '==', 'Delivered')];
        if (dateRange?.from) {
             constraints.push(where('orderDate', '>=', dateRange.from.toISOString()));
        }
        if (dateRange?.to) {
            const toDate = new Date(dateRange.to);
            toDate.setHours(23, 59, 59, 999); // Include the whole day
            constraints.push(where('orderDate', '<=', toDate.toISOString()));
        }
        
        return query(collection(firestore, 'orders'), ...constraints, orderBy('orderDate', 'desc'));
    }, [firestore, dateRange]);

    const { data: deliveredOrders, isLoading } = useCollection<Order>(deliveredOrdersQuery);

    const totalRevenue = useMemo(() => {
        return deliveredOrders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0;
    }, [deliveredOrders]);

    const handlePrint = useReactToPrint({
        content: () => printComponentRef.current,
        documentTitle: `laporan-penjualan-${new Date().toISOString().split('T')[0]}`,
    });
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Laporan Penjualan</h1>
                    <p className="text-muted-foreground">Analisis penjualan yang sudah selesai.</p>
                </div>
                <div className='flex gap-2'>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                            "w-[260px] justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                {format(dateRange.from, "d LLL y", { locale: id })} -{" "}
                                {format(dateRange.to, "d LLL y", { locale: id })}
                                </>
                            ) : (
                                format(dateRange.from, "d LLL y", { locale: id })
                            )
                            ) : (
                            <span>Pilih rentang tanggal</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                                locale={id}
                            />
                        </PopoverContent>
                    </Popover>
                    <Button onClick={handlePrint} disabled={!deliveredOrders || deliveredOrders.length === 0}>
                        <Printer className="mr-2 h-4 w-4" />
                        Cetak Laporan
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ringkasan Penjualan</CardTitle>
                    <CardDescription>
                        Total pendapatan dari semua pesanan yang telah terkirim dalam rentang waktu yang dipilih.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">ID Pesanan</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Pelanggan</TableHead>
                                <TableHead className="text-right">Total Penjualan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={4}><Skeleton className="h-10 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : deliveredOrders && deliveredOrders.length > 0 ? (
                                deliveredOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono text-xs">{order.id.substring(0, 7)}</TableCell>
                                        <TableCell>{formatDate(order.orderDate)}</TableCell>
                                        <TableCell>{order.customerName}</TableCell>
                                        <TableCell className="text-right">{formatPrice(order.totalAmount)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Tidak ada data penjualan pada rentang tanggal ini.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex justify-end font-bold text-lg pr-6 pb-6">
                    <div className="flex items-center gap-4">
                        <span>Total Pendapatan:</span>
                        <span>{formatPrice(totalRevenue)}</span>
                    </div>
                </CardFooter>
            </Card>

            <div style={{ display: 'none' }}>
                <SalesReportPrint ref={printComponentRef} orders={deliveredOrders || []} totalRevenue={totalRevenue} dateRange={dateRange}/>
            </div>
        </div>
    );
}
