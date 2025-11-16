'use client';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
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
  DialogDescription,
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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type Address = {
  id: string;
  name: string;
  phone: string;
  province: string;
  street: string;
  details: string;
  isDefault: boolean;
};

export default function AddressPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const addressesColRef = useMemoFirebase(() => {
    if (user && firestore) {
      return collection(firestore, `users/${user.uid}/addresses`);
    }
    return null;
  }, [user, firestore]);

  const { data: addresses, isLoading } = useCollection<Omit<Address, 'id'>>(addressesColRef);

  const [open, setOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

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

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!addressesColRef || !firestore || !user) return;
    
    const addressData = {
      name,
      phone,
      province,
      street,
      details,
    };

    try {
        if (editingAddress) {
            // Update existing address
            const addressRef = doc(firestore, `users/${user.uid}/addresses`, editingAddress.id);
            await updateDoc(addressRef, addressData);
        } else {
            // Add new address
            await addDoc(addressesColRef, { ...addressData, isDefault: !addresses || addresses.length === 0 });
        }
        toast({
            title: `Alamat ${editingAddress ? 'diperbarui' : 'ditambahkan'}`,
        });
        handleOpenChange(false);
    } catch(e) {
        console.error(e);
        toast({
            variant: 'destructive',
            title: 'Gagal menyimpan alamat'
        })
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!user || !firestore) return;
    const addressRef = doc(firestore, `users/${user.uid}/addresses`, id);
    try {
      await deleteDoc(addressRef);
      toast({
        title: 'Alamat berhasil dihapus',
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Gagal menghapus alamat',
      });
    }
  };
  
  const handleSetDefault = async (id: string) => {
     if (!user || !firestore || !addresses) return;
     const batch = writeBatch(firestore);

     addresses.forEach(addr => {
        const addressRef = doc(firestore, `users/${user.uid}/addresses`, addr.id);
        if(addr.id === id) {
            batch.update(addressRef, { isDefault: true });
        } else if (addr.isDefault) {
             batch.update(addressRef, { isDefault: false });
        }
     });

     try {
        await batch.commit();
        toast({
            title: 'Alamat utama berhasil diatur'
        });
     } catch(e) {
        console.error(e);
        toast({
            variant: 'destructive',
            title: 'Gagal mengatur alamat utama'
        });
     }
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
          {isLoading ? (
            <div className='space-y-4'>
                <Skeleton className='h-24 w-full' />
                <Skeleton className='h-24 w-full' />
            </div>
          ) : addresses && addresses.length === 0 ? (
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
              {addresses && addresses.map((addr, index) => (
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
                      <p className="text-muted-foreground">{addr.street}, {addr.province}</p>
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
             <DialogDescription>
                Lengkapi detail di bawah ini untuk menyimpan alamat Anda.
            </DialogDescription>
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
