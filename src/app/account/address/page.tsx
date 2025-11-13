'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Plus, BookUser, MapPin } from 'lucide-react';
import { useState } from 'react';

// The static list of addresses is removed.
// In a real application, this would be fetched from a database.
const initialAddresses: any[] = [];

export default function AddressPage() {
  const [open, setOpen] = useState(false);
  const [addresses, setAddresses] = useState(initialAddresses);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newAddress = {
        id: `addr_${Date.now()}`,
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        province: formData.get('province') as string,
        street: formData.get('street') as string,
        details: formData.get('details') as string,
        address: `${formData.get('street') as string}, ${formData.get('province') as string}`,
        isDefault: addresses.length === 0,
    };
    
    setAddresses([...addresses, newAddress]);

    console.log('Form submitted', newAddress);
    setOpen(false); // Close the dialog after submission
  };

  return (
    <Card className="bg-card/30 border-border/50 flex-grow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline text-2xl">Alamat Saya</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/80 rounded-full">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Alamat Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg bg-card">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl">
                Alamat Baru
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nama Lengkap
                  </Label>
                  <Input id="name" name="name" placeholder="Nama Lengkap" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Nomor Telepon
                  </Label>
                  <Input id="phone" name="phone" placeholder="Nomor Telepon" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">
                  Provinsi, Kota, Kecamatan, Kode Pos
                </Label>
                <Input
                  id="province"
                  name="province"
                  placeholder="Provinsi, Kota, Kecamatan, Kode Pos"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="street">Nama Jalan, Gedung, No. Rumah</Label>
                <Textarea
                  id="street"
                  name="street"
                  placeholder="Nama Jalan, Gedung, No. Rumah"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="details">
                  Detail Lainnya (Cth: Blok / Unit No., Patokan)
                </Label>
                <Textarea
                  id="details"
                  name="details"
                  placeholder="Detail Lainnya (Cth: Blok / Unit No., Patokan)"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Tambah Lokasi
              </Button>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Nanti Saja
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-accent hover:bg-accent/80">
                OK
              </Button>
            </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <Separator />
      <CardContent className="p-6">
        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
            <BookUser className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold text-foreground">
              Belum ada alamat
            </h3>
            <p className="mt-1">
              Tambahkan alamat baru untuk kemudahan berbelanja.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {addresses.map((addr, index) => (
              <div key={addr.id}>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-semibold">{addr.name}</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="text-muted-foreground">{addr.phone}</span>
                    </div>
                    <p className="text-muted-foreground">{addr.address}</p>
                    <div className="flex gap-2 mt-2">
                      {addr.isDefault && (
                        <span className="text-xs border border-accent text-accent px-2 py-0.5 rounded">
                          Utama
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <div className="flex gap-4">
                      <Button variant="link" className="text-accent p-0 h-auto">
                        Ubah
                      </Button>
                      {!addr.isDefault && (
                        <Button variant="link" className="text-accent p-0 h-auto">
                          Hapus
                        </Button>
                      )}
                    </div>
                    {!addr.isDefault && (
                        <Button
                            variant="outline"
                            className="rounded-full"
                        >
                            Atur sebagai utama
                        </Button>
                    )}
                  </div>
                </div>
                {index < addresses.length - 1 && (
                  <Separator className="mt-6" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
