'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';

const categories = [
  'Kain',
  'Pakaian',
  'Aksesoris',
  'Pakaian Wanita',
  'Fashion Muslim',
  'Pakaian Pria',
  'Souvenir & Perlengkapan Pesta',
];

const formSchema = z.object({
  name: z.string().min(1, 'Nama produk harus diisi'),
  price: z.coerce.number().min(1, 'Harga harus lebih besar dari 0'),
  category: z.string().min(1, 'Kategori harus dipilih'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  imageUrl: z.string().url('URL gambar tidak valid'),
  imageHint: z.string().min(1, 'Hint gambar harus diisi'),
});

type FormData = z.infer<typeof formSchema>;

export default function AddProductPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      price: 0,
      description: '',
      imageUrl: '',
      imageHint: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!firestore) return;

    try {
      const productsColRef = collection(firestore, 'products');
      await addDoc(productsColRef, {
        name: data.name,
        price: data.price,
        category: data.category,
        description: data.description,
        image: {
            imageUrl: data.imageUrl,
            imageHint: data.imageHint,
        }
      });
      toast({
        title: 'Produk Ditambahkan!',
        description: `${data.name} berhasil disimpan.`,
      });
      router.push('/admin/products');
    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Menambahkan Produk',
        description: 'Terjadi kesalahan saat menyimpan produk.',
      });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tambah Produk Baru</h1>
      <Card>
        <CardHeader>
          <CardTitle>Detail Produk</CardTitle>
          <CardDescription>
            Isi formulir di bawah ini untuk menambahkan produk baru ke katalog
            Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Produk</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Jumputan Sutra Merah" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Contoh: 750000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori produk" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Jelaskan detail produk di sini..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Gambar Produk</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageHint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hint Gambar (AI)</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: red fabric" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                 <Button variant="outline" type="button" onClick={() => router.back()}>
                    Batal
                 </Button>
                <Button type="submit">
                  <Upload className="mr-2 h-4 w-4" />
                  Simpan Produk
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
