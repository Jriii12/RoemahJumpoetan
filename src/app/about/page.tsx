import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="container py-12 md:py-24">
      <Card className="bg-card border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-4xl md:text-5xl font-bold">
            Tentang Roemah Jumpoetan
          </CardTitle>
        </CardHeader>
        <CardContent className="max-w-4xl mx-auto space-y-8">
          <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
            <Image
              src="https://picsum.photos/seed/about-us/1200/400"
              alt="Workshop Roemah Jumpoetan"
              data-ai-hint="artisan workshop"
              fill
              className="object-cover"
            />
          </div>
          <div className="text-lg text-foreground/80 space-y-4">
            <p>
              Roemah Jumpoetan Palembang adalah sebuah inisiatif untuk melestarikan dan
              mempopulerkan kain Jumputan, salah satu warisan budaya tak benda dari
              Palembang, Sumatera Selatan. Kami percaya bahwa setiap helai kain
              menceritakan sebuah kisah—kisah tentang tradisi, keahlian, dan
              keindahan yang diwariskan dari generasi ke generasi.
            </p>
            <p>
              Didirikan atas kecintaan pada seni dan budaya lokal, kami
              bekerja sama langsung dengan para pengrajin di Palembang. Misi kami
              adalah untuk memberdayakan komunitas pengrajin lokal, memastikan
              kesejahteraan mereka, sambil memperkenalkan keindahan Jumputan ke
              panggung dunia.
            </p>
            <p>
              Setiap produk yang kami tawarkan, mulai dari kain lembaran,
              pakaian siap pakai, hingga aksesoris, dibuat dengan proses celup
              ikat tradisional yang otentik. Kami berkomitmen untuk menjaga
              kualitas tertinggi dalam setiap detail, memastikan Anda menerima
              sebuah mahakarya yang tak lekang oleh waktu.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
