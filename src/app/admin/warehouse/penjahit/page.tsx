'use client';

import React, { useState, useEffect } from 'react';
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
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
  useCollection,
  useFirestore,
  useMemoFirebase,
  WithId,
} from '@/firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

type SewingJob = {
  jobName: string;
  clothingModel: string;
  fabricType: string;
  clothingType: string;
  startDate: string;
  dueDate: string;
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

export default function PenjahitPage() {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<WithId<SewingJob> | null>(
    null
  );
  const { toast } = useToast();
  const firestore = useFirestore();

  // Form state
  const [jobName, setJobName] = useState('');
  const [clothingModel, setClothingModel] = useState('');
  const [fabricType, setFabricType] = useState('');
  const [clothingType, setClothingType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const jobsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'sewingJobs'), orderBy('startDate', 'desc'));
  }, [firestore]);

  const { data: jobs, isLoading } = useCollection<SewingJob>(jobsQuery);

  const resetForm = () => {
    setJobName('');
    setClothingModel('');
    setFabricType('');
    setClothingType('');
    setStartDate('');
    setDueDate('');
    setEditingJob(null);
  };

  useEffect(() => {
    if (isDialogOpen) {
      if (editingJob) {
        setJobName(editingJob.jobName);
        setClothingModel(editingJob.clothingModel);
        setFabricType(editingJob.fabricType);
        setClothingType(editingJob.clothingType);
        setStartDate(editingJob.startDate);
        setDueDate(editingJob.dueDate);
      } else {
        resetForm();
      }
    } else {
      resetForm();
    }
  }, [isDialogOpen, editingJob]);
  
  const handleAddNewClick = () => {
    setEditingJob(null);
    setDialogOpen(true);
  };
  
  const handleEditClick = (job: WithId<SewingJob>) => {
    setEditingJob(job);
    setDialogOpen(true);
  };


  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) return;

    const jobData = {
      jobName,
      clothingModel,
      fabricType,
      clothingType,
      startDate,
      dueDate,
    };

    if (editingJob) {
      const docRef = doc(firestore, 'sewingJobs', editingJob.id);
      updateDoc(docRef, jobData)
        .then(() => {
          toast({ title: 'Pekerjaan berhasil diperbarui.' });
          setDialogOpen(false);
        })
        .catch((err) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: jobData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    } else {
      const jobsColRef = collection(firestore, 'sewingJobs');
      addDoc(jobsColRef, jobData)
        .then(() => {
          toast({ title: 'Pekerjaan baru berhasil ditambahkan.' });
          setDialogOpen(false);
        })
        .catch((err) => {
          const permissionError = new FirestorePermissionError({
            path: jobsColRef.path,
            operation: 'create',
            requestResourceData: jobData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    }
  };
  
  const handleDelete = (jobId: string) => {
      if (!firestore) return;
      const docRef = doc(firestore, 'sewingJobs', jobId);
      deleteDoc(docRef).then(() => {
          toast({ title: "Pekerjaan berhasil dihapus."})
      }).catch(err => {
          const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'delete' });
          errorEmitter.emit('permission-error', permissionError);
      })
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold mb-4">Manajemen Penjahit</h1>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Daftar Pekerjaan Penjahit</CardTitle>
              <Button onClick={handleAddNewClick}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Pekerjaan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model Baju</TableHead>
                  <TableHead>Jenis Kain</TableHead>
                  <TableHead>Jenis Baju</TableHead>
                  <TableHead>Tgl. Dikasih</TableHead>
                  <TableHead>Tgl. Selesai</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : jobs && jobs.length > 0 ? (
                  jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.clothingModel}</TableCell>
                      <TableCell>{job.fabricType}</TableCell>
                      <TableCell>{job.clothingType}</TableCell>
                      <TableCell>{formatDate(job.startDate)}</TableCell>
                      <TableCell>{formatDate(job.dueDate)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditClick(job)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Pekerjaan?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus pekerjaan "{job.jobName}"? Tindakan ini tidak bisa dibatalkan.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(job.id)} className="bg-destructive hover:bg-destructive/80">Hapus</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Belum ada pekerjaan yang ditambahkan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingJob ? 'Ubah Pekerjaan' : 'Tambah Pekerjaan Baru'}
            </DialogTitle>
            <DialogDescription>
              Isi detail pekerjaan untuk penjahit di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="jobName">Nama Pekerjaan</Label>
              <Input id="jobName" value={jobName} onChange={(e) => setJobName(e.target.value)} placeholder="Cth: Jahit Kemeja Batch 1" required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="clothingModel">Model Baju</Label>
              <Input id="clothingModel" value={clothingModel} onChange={(e) => setClothingModel(e.target.value)} placeholder="Cth: Kemeja Lengan Panjang" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fabricType">Jenis Kain</Label>
              <Input id="fabricType" value={fabricType} onChange={(e) => setFabricType(e.target.value)} placeholder="Cth: Katun" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clothingType">Jenis Baju</Label>
              <Input id="clothingType" value={clothingType} onChange={(e) => setClothingType(e.target.value)} placeholder="Cth: Kemeja" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Tgl Dikasih</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Tgl Selesai</Label>
                  <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </DialogClose>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
