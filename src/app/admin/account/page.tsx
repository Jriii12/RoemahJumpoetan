'use client';

import React, { useState, useEffect } from 'react';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  WithId,
} from '@/firebase';
import { collection, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
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
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useRouter } from 'next/navigation';

type UserData = {
  firstName: string;
  lastName: string;
  role: 'owner' | 'admin' | 'kasir' | 'pegawai gudang';
  address?: string;
  phoneNumber?: string;
};

const userRoles = ['owner', 'admin', 'kasir', 'pegawai gudang'];

export default function InformasiAkunPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<WithId<UserData> | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserData['role'] | ''>('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');


  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), orderBy('firstName'));
  }, [firestore]);

  const { data: users, isLoading } = useCollection<UserData>(usersQuery);

  useEffect(() => {
    if (editingUser) {
        setFirstName(editingUser.firstName);
        setLastName(editingUser.lastName);
        setRole(editingUser.role);
        setAddress(editingUser.address || '');
        setPhoneNumber(editingUser.phoneNumber || '');
        setDialogOpen(true);
    } else {
        // Reset form when closing dialog or for new user
        setFirstName('');
        setLastName('');
        setRole('');
        setAddress('');
        setPhoneNumber('');
    }
  }, [editingUser]);
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        setEditingUser(null);
    }
    setDialogOpen(isOpen);
  }

  const handleEditClick = (user: WithId<UserData>) => {
    setEditingUser(user);
  };
  
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !editingUser) return;
    
    const userDocRef = doc(firestore, 'users', editingUser.id);
    const updatedData = {
        firstName,
        lastName,
        role,
        address,
        phoneNumber,
    };
    
    updateDoc(userDocRef, updatedData).then(() => {
        toast({ title: 'Pengguna Berhasil Diperbarui' });
        handleOpenChange(false);
    }).catch(err => {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'update',
          requestResourceData: updatedData
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }

  const handleDelete = async (userId: string, userName: string) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userId);
    deleteDoc(userDocRef)
      .then(() => {
        toast({
          title: 'Pengguna Berhasil Dihapus',
          description: `Pengguna "${userName}" telah dihapus.`,
        });
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };
  
  const getRoleDisplayName = (roleValue: string) => {
    const roleMap: Record<string, string> = {
      owner: 'Owner',
      admin: 'Admin',
      kasir: 'Kasir',
      'pegawai gudang': 'Pegawai Gudang',
    };
    return roleMap[roleValue.toLowerCase()] || roleValue;
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold mb-4">Informasi Akun</h1>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Data User</CardTitle>
              <Button
                className="bg-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary-foreground))] text-[hsl(var(--admin-primary-foreground))] hover:text-[hsl(var(--admin-primary))]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jabatan</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : users && users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                      <TableCell>{getRoleDisplayName(user.role || '')}</TableCell>
                      <TableCell>{user.address || '-'}</TableCell>
                      <TableCell>{user.phoneNumber || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-600" onClick={() => handleEditClick(user)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Pengguna?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus pengguna "{user.firstName} {user.lastName}"? Tindakan ini tidak dapat diurungkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                                className="bg-destructive hover:bg-destructive/80"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Tidak ada data pengguna.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Ubah Data Pengguna</DialogTitle>
                <DialogDescription>
                    Perbarui detail pengguna di bawah ini.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">Nama Depan</Label>
                        <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Nama Belakang</Label>
                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="role">Jabatan</Label>
                    <Select value={role} onValueChange={(value) => setRole(value as UserData['role'])} required>
                        <SelectTrigger id="role">
                            <SelectValue placeholder="Pilih jabatan" />
                        </SelectTrigger>
                        <SelectContent>
                            {userRoles.map(r => (
                                <SelectItem key={r} value={r}>{getRoleDisplayName(r)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="address">Alamat</Label>
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Telepon</Label>
                    <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Batal</Button>
                    </DialogClose>
                    <Button type="submit">Simpan Perubahan</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
