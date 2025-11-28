'use client';

import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isQrDialogOpen, setQrDialogOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !firestore || cartItems.length === 0) {
        toast({
            title: 'Error',
            description: 'Anda harus login dan memiliki barang di keranjang.',
            variant: 'destructive',
        });
        return;
    }
    
    const formData = new FormData(e.currentTarget);
    const customerDetails = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        postalCode: formData.get('postalCode') as string,
    }

    const orderData = {
        userId: user.uid,
        customerName: `${customerDetails.firstName} ${customerDetails.lastName}`,
        customerDetails,
        products: cartItems.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            imageUrl: item.product.imageUrl,
            size: item.size
        })),
        totalAmount: cartTotal,
        orderDate: new Date().toISOString(),
        status: 'Pending',
        paymentMethod: paymentMethod,
    };

    const ordersColRef = collection(firestore, 'orders');

    addDoc(ordersColRef, orderData).then(() => {
        toast({
            title: 'Pesanan Berhasil!',
            description: 'Terima kasih telah berbelanja. Kami akan segera memproses pesanan Anda.',
        });
        clearCart();
        router.push('/products');
    }).catch(err => {
         const permissionError = new FirestorePermissionError({
          path: ordersColRef.path,
          operation: 'create',
          requestResourceData: orderData,
        });
        errorEmitter.emit('permission-error', permissionError);
    })
  }
  
  const qrCodeData = encodeURIComponent(`PEMBAYARAN ROEMAH JUMPOETAN - TOTAL: ${formatPrice(cartTotal)}`);

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto py-24 text-center">
        <h1 className="font-headline text-3xl font-bold">Keranjang Anda Kosong</h1>
        <p className="text-muted-foreground mt-2">Tidak ada produk untuk di-checkout.</p>
        <Button onClick={() => router.push('/products')} className="mt-6">
          Kembali Berbelanja
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-12 md:py-16 px-4">
        <div className="text-center mb-10">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Checkout</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Selesaikan pesanan Anda.
          </p>
        </div>
        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Alamat Pengiriman</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="firstName">Nama Depan</Label>
                          <Input id="firstName" name="firstName" placeholder="Nama Depan" required/>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="lastName">Nama Belakang</Label>
                          <Input id="lastName" name="lastName" placeholder="Nama Belakang" required/>
                      </div>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="address">Alamat</Label>
                      <Input id="address" name="address" placeholder="Jalan, nomor rumah, etc." required/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="city">Kota</Label>
                          <Input id="city" name="city" placeholder="Kota" required/>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="postalCode">Kode Pos</Label>
                          <Input id="postalCode" name="postalCode" placeholder="Kode Pos" required/>
                      </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Metode Pembayaran</CardTitle>
                  <CardDescription>Pilih metode pembayaran Anda.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                    <Label htmlFor="cod" className="flex items-start gap-4 p-4 border rounded-md cursor-pointer has-[:checked]:border-primary">
                      <RadioGroupItem value="cod" id="cod" className="mt-1"/>
                      <div>
                        <p className="font-semibold">Bayar di Tempat (Cash on Delivery)</p>
                        <p className="text-sm text-muted-foreground">Siapkan uang pas saat kurir tiba.</p>
                      </div>
                    </Label>
                    <Label htmlFor="qris" className="flex items-start gap-4 p-4 border rounded-md cursor-pointer has-[:checked]:border-primary">
                      <RadioGroupItem value="qris" id="qris" className="mt-1"/>
                      <div>
                        <p className="font-semibold">QRIS</p>
                        <p className="text-sm text-muted-foreground">Scan kode QR untuk membayar melalui e-wallet atau m-banking.</p>
                        {paymentMethod === 'qris' && (
                          <Button type="button" size="sm" className="mt-3" onClick={() => setQrDialogOpen(true)}>
                            Tampilkan Kode QR
                          </Button>
                        )}
                      </div>
                    </Label>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <Card className="sticky top-28">
                <CardHeader>
                  <CardTitle>Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                    {cartItems.map(item => (
                        <div key={item.id} className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-3">
                              <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                                  <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                              </div>
                              <div>
                                  <h4 className="font-semibold text-sm">{item.product.name}</h4>
                                  <p className="text-xs text-muted-foreground">
                                      {item.quantity} x {formatPrice(item.product.price)}
                                      {item.size && ` (Size: ${item.size})`}
                                  </p>
                              </div>
                          </div>
                          <p className="font-semibold text-sm text-right">{formatPrice(item.product.price * item.quantity)}</p>
                        </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-muted-foreground">Pengiriman</span>
                      <span>{formatPrice(0)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    Buat Pesanan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      <Dialog open={isQrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-center font-headline text-2xl">Pembayaran QRIS</DialogTitle>
            <DialogDescription className="text-center">
              Scan kode QR di bawah ini untuk menyelesaikan pembayaran Anda.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted/50 rounded-lg flex flex-col items-center">
            <Image 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrCodeData}`} 
              alt="QRIS Code" 
              width={250} 
              height={250} 
              className="rounded-md" 
            />
          </div>
          <p className="text-xs text-center text-muted-foreground">Total: <span className="font-bold">{formatPrice(cartTotal)}</span></p>
        </DialogContent>
      </Dialog>
    </>
  );
}
