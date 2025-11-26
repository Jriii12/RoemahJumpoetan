'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function PenjahitPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manajemen Penjahit</h1>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pekerjaan Penjahit</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Fitur untuk mengelola pekerjaan yang diberikan kepada penjahit sedang dalam pengembangan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
