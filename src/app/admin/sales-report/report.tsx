'use client';
import React, { forwardRef } from 'react';
import Image from 'next/image';
import { WithId } from '@/firebase';
import { Separator } from '@/components/ui/separator';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

type Order = {
    orderDate: string;
    customerName: string;
    totalAmount: number;
};

interface SalesReportPrintProps {
    orders: WithId<Order>[];
    totalRevenue: number;
    dateRange?: DateRange;
}

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

export const SalesReportPrint = forwardRef<HTMLDivElement, SalesReportPrintProps>(({ orders, totalRevenue, dateRange }, ref) => {
    const getFormattedDateRange = () => {
        if (!dateRange || !dateRange.from) return 'Semua Waktu';
        if (dateRange.to) {
            return `${format(dateRange.from, "d LLL yyyy", { locale: id })} - ${format(dateRange.to, "d LLL yyyy", { locale: id })}`;
        }
        return `Mulai dari ${format(dateRange.from, "d LLL yyyy", { locale: id })}`;
    }
    
    return (
        <div ref={ref} className="p-10 text-black bg-white font-sans">
            {/* Header */}
            <header className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Image
                        src="/img/logo jumputan.jpg"
                        alt="Roemah Jumpoetan Logo"
                        width={60}
                        height={60}
                        className="rounded-full"
                    />
                    <div>
                        <h1 className="font-bold text-xl">ROEMAH JUMPOETAN</h1>
                        <p className="text-sm">Laporan Penjualan</p>
                    </div>
                </div>
                 <div className="text-right">
                    <p className="font-semibold">Periode Laporan</p>
                    <p className="text-sm">{getFormattedDateRange()}</p>
                 </div>
            </header>
            <Separator className="my-4 bg-gray-300" />
            
            {/* Table */}
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b-2 border-black">
                        <th className="py-2 pr-4">ID Pesanan</th>
                        <th className="py-2 pr-4">Tanggal</th>
                        <th className="py-2 pr-4">Pelanggan</th>
                        <th className="py-2 pr-4 text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id} className="border-b">
                            <td className="py-2 pr-4 font-mono text-xs">{order.id.substring(0, 7)}</td>
                            <td className="py-2 pr-4">{formatDate(order.orderDate)}</td>
                            <td className="py-2 pr-4">{order.customerName}</td>
                            <td className="py-2 pr-4 text-right">{formatPrice(order.totalAmount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

             {/* Footer */}
            <footer className="mt-8 text-right">
                <div className='inline-block text-left p-4 bg-gray-100 rounded-lg'>
                    <div className="font-bold text-lg">
                        <span>Total Pendapatan: </span>
                        <span>{formatPrice(totalRevenue)}</span>
                    </div>
                    <p className="text-sm text-gray-600">Laporan ini dibuat pada {format(new Date(), "d LLL yyyy, HH:mm", { locale: id })}</p>
                </div>
            </footer>
        </div>
    );
});

SalesReportPrint.displayName = 'SalesReportPrint';
