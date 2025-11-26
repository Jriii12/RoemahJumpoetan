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
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

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
        products: cartItems.map(item => {
          const productData: any = {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            imageUrl: item.product.imageUrl,
          };
          if (item.size) {
            productData.size = item.size;
          }
          return productData;
        }),
        totalAmount: cartTotal,
        orderDate: new Date().toISOString(),
        status: 'Pending',
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
                    <CardDescription>Saat ini kami hanya menerima Cash on Delivery (COD).</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-4 border rounded-md bg-muted/30">
                        <p className="font-semibold">Bayar di Tempat (Cash on Delivery)</p>
                        <p className="text-sm text-muted-foreground">Siapkan uang pas saat kurir tiba.</p>
                    </div>
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
  );
}
