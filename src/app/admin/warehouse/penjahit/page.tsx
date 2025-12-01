'use client';

import React, { useState, useEffect } from 'react';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  WithId,
} from '@/firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
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
import { Pencil, Plus, Printer, Trash2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';


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
  const [editingJob, setEditingJob] = useState<WithId<SewingJob> | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  // Form state
  const [jobName, setJobName] = useState('');
  const [clothingModel, setClothingModel] = useState('');
  const [fabricType, setFabricType] = useState('');
  const [clothingType, setClothingType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const sewingJobsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'sewingJobs'), orderBy('startDate', 'desc'));
  }, [firestore]);

  const { data: sewingJobs, isLoading } = useCollection<SewingJob>(sewingJobsQuery);
  
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
    
    try {
      if (editingJob) {
        const docRef = doc(firestore, 'sewingJobs', editingJob.id);
        await updateDoc(docRef, jobData);
        toast({ title: "Pekerjaan berhasil diperbarui." });
      } else {
        const jobsColRef = collection(firestore, 'sewingJobs');
        await addDoc(jobsColRef, jobData);
        toast({ title: "Pekerjaan berhasil ditambahkan." });
      }
      setDialogOpen(false);
    } catch(err) {
      toast({
        variant: 'destructive',
        title: 'Gagal menyimpan pekerjaan',
        description: (err as Error).message
      });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!firestore) return;
    try {
      const docRef = doc(firestore, 'sewingJobs', jobId);
      await deleteDoc(docRef);
      toast({ title: "Pekerjaan berhasil dihapus." });
    } catch (err) {
        toast({
        variant: 'destructive',
        title: 'Gagal menghapus pekerjaan',
        description: (err as Error).message
      });
    }
  };

  const generatePdf = async () => {
    if (!sewingJobs) return;
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Laporan Pekerjaan Penjahit', 14, 22);
    doc.setFontSize(11);
    doc.text(`Tanggal Cetak: ${format(new Date(), "d LLL yyyy", { locale: id })}`, 14, 28);
    
    const tableColumn = ["Nama Pekerjaan", "Model Baju", "Jenis Kain", "Jenis Baju", "Tgl. Diserahkan", "Tgl. Selesai"];
    const tableRows: string[][] = [];

    sewingJobs.forEach(job => {
        const jobData = [
            job.jobName,
            job.clothingModel,
            job.fabricType,
            job.clothingType,
            formatDate(job.startDate),
            formatDate(job.dueDate)
        ];
        tableRows.push(jobData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
    });

    doc.save('laporan-penjahit.pdf');
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Manajemen Penjahit</h1>
            <div className="flex gap-2">
                 <Button onClick={generatePdf} variant="outline" disabled={!sewingJobs || sewingJobs.length === 0}>
                    <Printer className="mr-2 h-4 w-4" />
                    Cetak Laporan
                </Button>
                <Button onClick={handleAddNewClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Pekerjaan
                </Button>
            </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Pekerjaan Jahit</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Pekerjaan</TableHead>
                  <TableHead>Model Baju</TableHead>
                  <TableHead>Jenis Kain</TableHead>
                  <TableHead>Jenis Baju</TableHead>
                  <TableHead>Tgl. Diserahkan</TableHead>
                  <TableHead>Tgl. Selesai</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : sewingJobs && sewingJobs.length > 0 ? (
                  sewingJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.jobName}</TableCell>
                      <TableCell>{job.clothingModel}</TableCell>
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Pekerjaan?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus pekerjaan ini?
                                Tindakan ini tidak dapat diurungkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteJob(job.id)}
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
                    <TableCell colSpan={7} className="h-24 text-center">
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">
              {editingJob ? 'Ubah' : 'Tambah'} Pekerjaan Jahit
            </DialogTitle>
            <DialogDescription>
              Isi detail pekerjaan untuk penjahit di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="jobName">Nama Pekerjaan</Label>
              <Input id="jobName" value={jobName} onChange={(e) => setJobName(e.target.value)} placeholder="Contoh: Kemeja Batik Batch 1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clothingModel">Model Baju</Label>
              <Input id="clothingModel" value={clothingModel} onChange={(e) => setClothingModel(e.target.value)} placeholder="Contoh: Kemeja Lengan Panjang" required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="fabricType">Jenis Kain</Label>
              <Input id="fabricType" value={fabricType} onChange={(e) => setFabricType(e.target.value)} placeholder="Contoh: Katun Primisima" required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="clothingType">Jenis Baju</Label>
              <Input id="clothingType" value={clothingType} onChange={(e) => setClothingType(e.target.value)} placeholder="Contoh: Kemeja" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="startDate">Tgl. Diserahkan</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                <Label htmlFor="dueDate">Tgl. Selesai</Label>
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
