'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase, WithId } from '@/firebase';
import { collection, addDoc, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
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
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Pencil,
  Plus,
  Trash2,
  Printer,
  ChevronDown,
} from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

type SewingJob = {
  jobName: string;
  modelName: string;
  modelImageUrl: string;
  fabricType: string;
  clothingType: string;
  quantity: number;
  tailorName?: string;
  dateGiven?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
};

const statusVariantMap: Record<SewingJob['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Pending: 'outline',
  'In Progress': 'secondary',
  Completed: 'default',
};
const getStatusVariant = (status: SewingJob['status']) => {
  return statusVariantMap[status] || 'default';
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

export default function PenjahitPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<WithId<SewingJob> | null>(null);
  
  // Form state
  const [formState, setFormState] = useState<Partial<SewingJob>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const sewingJobsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'sewingJobs'), orderBy('status'), orderBy('dateGiven', 'desc'));
  }, [firestore]);

  const { data: sewingJobs, isLoading } = useCollection<SewingJob>(sewingJobsQuery);

  const { pendingJobs, inProgressJobs } = useMemo(() => {
    const pending: WithId<SewingJob>[] = [];
    const inProgress: WithId<SewingJob>[] = [];
    sewingJobs?.forEach(job => {
      if (job.status === 'Pending') {
        pending.push(job);
      } else if (job.status === 'In Progress' || job.status === 'Completed') {
        inProgress.push(job);
      }
    });
    return { pendingJobs: pending, inProgressJobs: inProgress };
  }, [sewingJobs]);
  
  const resetForm = () => {
    setFormState({ status: 'Pending' });
    setImagePreview(null);
    setEditingJob(null);
  };
  
  useEffect(() => {
    if (isDialogOpen) {
      if (editingJob) {
        setFormState(editingJob);
        setImagePreview(editingJob.modelImageUrl);
      } else {
        resetForm();
      }
    } else {
      resetForm();
    }
  }, [isDialogOpen, editingJob]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({...prev, quantity: parseInt(e.target.value, 10) || 0 }));
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormState(prev => ({ ...prev, modelImageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) return;
    
    const jobData = { ...formState, quantity: Number(formState.quantity || 0) };

    if (!jobData.modelImageUrl || !jobData.jobName) {
        toast({ variant: 'destructive', title: 'Data tidak lengkap', description: 'Pastikan nama pekerjaan dan gambar model sudah diisi.' });
        return;
    }

    if (editingJob) {
      const docRef = doc(firestore, 'sewingJobs', editingJob.id);
      updateDoc(docRef, jobData).then(() => {
        toast({ title: "Pekerjaan berhasil diperbarui." });
        setDialogOpen(false);
      }).catch(err => {
        const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: jobData });
        errorEmitter.emit('permission-error', permissionError);
      });
    } else {
      const colRef = collection(firestore, 'sewingJobs');
      addDoc(colRef, jobData).then(() => {
          toast({ title: "Pekerjaan baru berhasil ditambahkan." });
          setDialogOpen(false);
      }).catch(err => {
          const permissionError = new FirestorePermissionError({ path: colRef.path, operation: 'create', requestResourceData: jobData });
          errorEmitter.emit('permission-error', permissionError);
      });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'sewingJobs', jobId);
    deleteDoc(docRef).then(() => {
      toast({ title: "Pekerjaan berhasil dihapus." });
    }).catch(err => {
      const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'delete' });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleUpdateStatus = (jobId: string, status: SewingJob['status']) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'sewingJobs', jobId);
    const updateData: Partial<SewingJob> = { status };
    if (status === 'In Progress' && !editingJob?.dateGiven) {
        updateData.dateGiven = new Date().toISOString().split('T')[0];
    }
    updateDoc(docRef, updateData).catch(err => {
      const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: { status } });
      errorEmitter.emit('permission-error', permissionError);
    });
  };
  
  const handlePrint = () => {
    window.print();
  }

  const JobTable = ({ title, jobs, isLoading, type }: { title: string, jobs: WithId<SewingJob>[], isLoading: boolean, type: 'inProgress' | 'pending' }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead>Detail Pekerjaan</TableHead>
              <TableHead>Penjahit</TableHead>
              <TableHead>Tgl. Diberikan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right print-hide">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}><Skeleton className="h-12 w-full" /></TableCell>
                </TableRow>
              ))
            ) : jobs.length > 0 ? (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                      <Image src={job.modelImageUrl} alt={job.modelName} fill className="object-cover" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold">{job.jobName}</p>
                    <p className="text-sm text-muted-foreground">{job.clothingType} ({job.fabricType}) - {job.quantity} pcs</p>
                  </TableCell>
                  <TableCell>{job.tailorName || '-'}</TableCell>
                  <TableCell>{formatDate(job.dateGiven)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right print-hide">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {type === 'pending' && (
                           <DropdownMenuItem onClick={() => handleUpdateStatus(job.id, 'In Progress')}>
                            Beri ke Penjahit
                          </DropdownMenuItem>
                        )}
                         {type === 'inProgress' && (
                           <DropdownMenuItem onClick={() => handleUpdateStatus(job.id, 'Completed')}>
                            Tandai Selesai
                          </DropdownMenuItem>
                         )}
                        <DropdownMenuItem onClick={() => { setEditingJob(job); setDialogOpen(true); }}>
                          <Pencil className="mr-2 h-4 w-4"/> Edit
                        </DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <div className='relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive focus:text-destructive'>
                                  <Trash2 className="mr-2 h-4 w-4"/> Hapus
                                </div>
                            </AlertDialogTrigger>
                           <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Pekerjaan?</AlertDialogTitle>
                                <AlertDialogDescription>Tindakan ini tidak dapat diurungkan.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteJob(job.id)} className="bg-destructive hover:bg-destructive/80">Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                           </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className='h-24 text-center'>Tidak ada pekerjaan.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; }
          .print-hide { display: none; }
        }
      `}</style>
      <div className="space-y-6 printable-area">
        <div className="flex justify-between items-center print-hide">
          <h1 className="text-2xl font-bold">Manajemen Penjahit</h1>
          <div className='flex gap-2'>
             <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Pekerjaan
              </Button>
               <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Cetak Laporan
              </Button>
          </div>
        </div>
        
        <JobTable title="Pekerjaan Sedang Berlangsung" jobs={inProgressJobs} isLoading={isLoading} type="inProgress" />
        <JobTable title="Pekerjaan Tertunda" jobs={pendingJobs} isLoading={isLoading} type="pending" />
        
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingJob ? 'Ubah' : 'Tambah'} Pekerjaan Jahit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="space-y-2">
              <Label htmlFor="jobName">Nama Pekerjaan</Label>
              <Input id="jobName" name="jobName" value={formState.jobName || ''} onChange={handleInputChange} required placeholder="Contoh: Produksi Kemeja Batch #26" />
            </div>
            
            <div className="space-y-2">
                <Label>Gambar Model</Label>
                <Input id="picture" type="file" onChange={handleImageUpload} className="hidden" />
                <Button type='button' variant='outline' onClick={() => document.getElementById('picture')?.click()}>Pilih Gambar</Button>
                {imagePreview && <Image src={imagePreview} alt="Preview" width={100} height={100} className="mt-2 rounded-md border" />}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="modelName">Nama Model</Label>
                    <Input id="modelName" name="modelName" value={formState.modelName || ''} onChange={handleInputChange} required placeholder="Kemeja Lengan Panjang" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="clothingType">Jenis Baju</Label>
                    <Input id="clothingType" name="clothingType" value={formState.clothingType || ''} onChange={handleInputChange} required placeholder="Kemeja" />
                </div>
            </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="fabricType">Jenis Kain</Label>
                    <Input id="fabricType" name="fabricType" value={formState.fabricType || ''} onChange={handleInputChange} required placeholder="Katun Jumputan" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="quantity">Jumlah</Label>
                    <Input id="quantity" name="quantity" type="number" value={formState.quantity || ''} onChange={handleQuantityChange} required placeholder="50"/>
                </div>
            </div>
            
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="tailorName">Nama Penjahit</Label>
                    <Input id="tailorName" name="tailorName" value={formState.tailorName || ''} onChange={handleInputChange} placeholder="Ibu Siti" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="dateGiven">Tanggal Diberikan</Label>
                    <Input id="dateGiven" name="dateGiven" type="date" value={formState.dateGiven || ''} onChange={handleInputChange} />
                </div>
            </div>

            <DialogFooter className="mt-4 print-hide">
              <DialogClose asChild>
                <Button type="button" variant="outline">Batal</Button>
              </DialogClose>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

    