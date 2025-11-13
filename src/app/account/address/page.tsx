'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';

const addresses = [
  {
    id: 1,
    name: 'Al Fajri Nur Ramadhan',
    phone: '(+62) 877 9155 0310',
    address: 'Jalan Ariodillah III No. 2186, 20 Ilir D Iv, Ilir Timur I, KOTA PALEMBANG, SUMATERA SELATAN, ID, 30124',
    isDefault: true,
  },
  {
    id: 2,
    name: 'Al Fajri Nur Ramadhan',
    phone: '(+62) 877 9155 0310',
    address: 'Jalan Ariodillah III No. 2186, RT.30, Kelurahan D Empat, Ilir Timur I, KOTA PALEMBANG, SUMATERA SELATAN, ID, 30124',
    isToko: true,
  },
    {
    id: 3,
    name: 'Al Fajri Nur Ramadhan',
    phone: '(+62) 812 7104 8518',
    address: 'Jl. Pangeran Ayin Komplek Kencana Damai Blok E. No 7 SAKO, KOTA PALEMBANG, SUMATERA SELATAN, ID, 30164',
  },
];

export default function AddressPage() {
  return (
    <Card className="bg-card/30 border-border/50 flex-grow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline text-2xl">Alamat Saya</CardTitle>
        <Button className="bg-accent hover:bg-accent/80 rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Alamat Baru
        </Button>
      </CardHeader>
      <Separator />
      <CardContent className="p-6 space-y-6">
        <h3 className="text-lg font-semibold">Alamat</h3>
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
                  {addr.isDefault && <span className="text-xs border border-accent text-accent px-2 py-0.5 rounded">Utama</span>}
                  {addr.isToko && <span className="text-xs border border-muted-foreground text-muted-foreground px-2 py-0.5 rounded">Alamat Toko</span>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 text-right">
                 <div className="flex gap-4">
                  <Button variant="link" className="text-accent p-0 h-auto">Ubah</Button>
                  {index > 0 && <Button variant="link" className="text-accent p-0 h-auto">Hapus</Button>}
                </div>
                <Button variant="outline" disabled={addr.isDefault} className="rounded-full">
                  Atur sebagai utama
                </Button>
              </div>
            </div>
            {index < addresses.length - 1 && <Separator className="mt-6" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
