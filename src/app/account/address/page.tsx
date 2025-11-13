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
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Plus, BookUser } from 'lucide-react';
import { useState, useEffect } from 'react';

type Address = {
  id: string;
  name: string;
  phone: string;
  province: string;
  street: string;
  details: string;
  address: string;
  isDefault: boolean;
};

const initialAddresses: Address[] = [];

export default function AddressPage() {
  const [open, setOpen] = useState(false);
  const [addresses, setAddresses] = useState(initialAddresses);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('');
  const [street, setStreet] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    if (editingAddress) {
      setName(editingAddress.name);
      setPhone(editingAddress.phone);
      setProvince(editingAddress.province);
      setStreet(editingAddress.street);
      setDetails(editingAddress.details);
      setOpen(true);
    }
  }, [editingAddress]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset form when dialog closes
      setEditingAddress(null);
      setName('');
      setPhone('');
      setProvince('');
      setStreet('');
      setDetails('');
    }
    setOpen(isOpen);
  };

  const handleAddNewClick = () => {
    setEditingAddress(null);
    setName('');
    setPhone('');
    setProvince('');
    setStreet('');
    setDetails('');
    setOpen(true);
  };

  const handleEditClick = (address: Address) => {
    setEditingAddress(address);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editingAddress) {
      // Update existing address
      const updatedAddresses = addresses.map((addr) =>
        addr.id === editingAddress.id
          ? {
              ...addr,
              name,
              phone,
              province,
              street,
              details,
              address: `${street}, ${province}`,
            }
          : addr
      );
      setAddresses(updatedAddresses);
    } else {
      // Add new address
      const newAddress: Address = {
        id: `addr_${Date.now()}`,
        name,
        phone,
        province,
        street,
        details,
        address: `${street}, ${province}`,
        isDefault: addresses.length === 0,
      };
      setAddresses([...addresses, newAddress]);
    }

    handleOpenChange(false); // Close and reset dialog
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    setAddressToDelete(null);
  };
  
  const handleSetDefault = (id: string) => {
    setAddresses(prev => 
        prev.map(addr => ({
            ...addr,
            isDefault: addr.id === id
        }))
    );
  };


  return (
    <>
      <Card className="bg-card/30 border-border/50 flex-grow">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline text-2xl">Alamat Saya</CardTitle>
          <Button
            onClick={handleAddNewClick}
            className="bg-accent hover:bg-accent/80 rounded-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Alamat Baru
          </Button>
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
                        <span className="text-muted-foreground">
                          {addr.phone}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{addr.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {addr.details}
                      </p>
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
                        <Button
                          variant="link"
                          className="text-accent p-0 h-auto"
                          onClick={() => handleEditClick(addr)}
                        >
                          Ubah
                        </Button>
                        {!addr.isDefault && (
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="link"
                                className="text-accent p-0 h-auto"
                              >
                                Hapus
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Alamat?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus alamat ini? Tindakan ini tidak dapat diurungkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteAddress(addr.id)} className="bg-destructive hover:bg-destructive/80">Hapus</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                      {!addr.isDefault && (
                        <Button
                          variant="outline"
                          className="rounded-full"
                          onClick={() => handleSetDefault(addr.id)}
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

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[480px] bg-card">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">
              {editingAddress ? 'Ubah Alamat' : 'Alamat Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nomor Telepon"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">
                Provinsi, Kota, Kecamatan, Kode Pos
              </Label>
              <Input
                id="province"
                name="province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="Provinsi, Kota, Kecamatan, Kode Pos"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">Nama Jalan, Gedung, No. Rumah</Label>
              <Textarea
                id="street"
                name="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
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
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Detail Lainnya (Cth: Blok / Unit No., Patokan)"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-accent hover:bg-accent/80">
                OK
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
