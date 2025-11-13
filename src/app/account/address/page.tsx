'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, BookUser } from 'lucide-react';

// The static list of addresses is removed.
// In a real application, this would be fetched from a database.
const addresses: any[] = [];

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
                      {addr.isToko && (
                        <span className="text-xs border border-muted-foreground text-muted-foreground px-2 py-0.5 rounded">
                          Alamat Toko
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <div className="flex gap-4">
                      <Button variant="link" className="text-accent p-0 h-auto">
                        Ubah
                      </Button>
                      {index > 0 && (
                        <Button variant="link" className="text-accent p-0 h-auto">
                          Hapus
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      disabled={addr.isDefault}
                      className="rounded-full"
                    >
                      Atur sebagai utama
                    </Button>
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
