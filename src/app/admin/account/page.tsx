'use client';

import React from 'react';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  WithId,
} from '@/firebase';
import { collection, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
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
import { useRouter } from 'next/navigation';
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
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type UserData = {
  firstName: string;
  lastName: string;
  role: 'owner' | 'admin' | 'kasir' | 'pegawai gudang';
  address?: string;
  phoneNumber?: string;
};

export default function InformasiAkunPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), orderBy('firstName'));
  }, [firestore]);

  const { data: users, isLoading } = useCollection<UserData>(usersQuery);

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
  
  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      owner: 'Owner',
      admin: 'Admin',
      kasir: 'Kasir',
      'pegawai gudang': 'Pegawai Gudang',
    };
    return roleMap[role.toLowerCase()] || role;
  }

  return (
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
                      <Button variant="link" className="p-0 h-auto text-blue-600">
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="link"
                            className="p-0 h-auto ml-4 text-red-600"
                          >
                            Delete
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
  );
}
