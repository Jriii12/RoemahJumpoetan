'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export default function PenjahitPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Informasi Penjahit</h1>
      <Card>
        <CardHeader>
          <CardTitle>Data Penjahit</CardTitle>
          <CardDescription>
            Kelola data penjahit yang bekerja sama dengan Roemah Jumpoetan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16 text-muted-foreground">
            <p>Halaman ini sedang dalam pengembangan.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
