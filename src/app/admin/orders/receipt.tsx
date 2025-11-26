'use client';
import React, { forwardRef } from 'react';
import Image from 'next/image';
import { WithId } from '@/firebase';
import { Separator } from '@/components/ui/separator';

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

interface OrderReceiptProps {
  order: WithId<Order>;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
};

export const OrderReceipt = forwardRef<HTMLDivElement, OrderReceiptProps>(({ order }, ref) => {
    return (
        <div ref={ref} className="p-6 space-y-6 printable-receipt text-black bg-white">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <Image
                        src="/img/logo jumputan.jpg"
                        alt="Roemah Jumpoetan Logo"
                        width={60}
                        height={60}
                        className="rounded-full"
                    />
                    <div>
                        <h2 className="font-bold text-lg">ROEMAH JUMPOETAN</h2>
                        <p className="text-xs text-gray-600">Jl. Aiptu A. Wahab, Palembang</p>
                    </div>
                </div>
                <div className="text-right">
                    <h3 className="font-bold text-xl uppercase">Invoice</h3>
                    <p className="text-xs text-gray-500">Order ID: {order.id.substring(0, 7).toUpperCase()}</p>
                </div>
            </div>
            <Separator />
            {/* Sender and Receiver */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold text-gray-500 text-sm mb-1">PENGIRIM:</h4>
                    <p className="font-bold">Roemah Jumpoetan</p>
                    <p className="text-sm">Jl. Aiptu A. Wahab, Lr. Kebun Pisang No.37</p>
                    <p className="text-sm">Kota Palembang, Sumatera Selatan</p>
                    <p className="text-sm">0815-1909-2233</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-500 text-sm mb-1">PENERIMA:</h4>
                    <p className="font-bold">{order.customerName}</p>
                    <p className="text-sm">{order.customerDetails.address}</p>
                    <p className="text-sm">{order.customerDetails.city}, {order.customerDetails.postalCode}</p>
                </div>
            </div>
            <Separator />
            {/* Product List */}
            <div>
                <h4 className="font-semibold mb-2">DETAIL PESANAN:</h4>
                <div className="space-y-2">
                    {order.products.map(product => (
                        <div key={product.id} className="flex justify-between items-center text-sm">
                            <div>
                                <p>{product.name} {product.size ? `(${product.size})` : ''}</p>
                                <p className="text-xs text-gray-500">{product.quantity} x {formatPrice(product.price)}</p>
                            </div>
                            <p>{formatPrice(product.quantity * product.price)}</p>
                        </div>
                    ))}
                </div>
            </div>
            <Separator />
            {/* Total */}
             <div className="space-y-1">
                <div className="flex justify-between">
                    <span className='text-sm'>Subtotal</span>
                    <span className='text-sm'>{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                    <span className='text-sm'>Pengiriman</span>
                    <span className='text-sm'>{formatPrice(0)}</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                    <span>TOTAL</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                </div>
            </div>
            <Separator />
            {/* Footer */}
            <div className="text-center text-xs text-gray-500 pt-4">
                <p>Terima kasih telah berbelanja di Roemah Jumpoetan!</p>
                <p>Ini adalah bukti pembelian yang sah.</p>
            </div>
        </div>
    );
});

OrderReceipt.displayName = 'OrderReceipt';
