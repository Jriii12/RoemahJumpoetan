import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="container py-12 md:py-20 px-4">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
          Tentang Roemah Jumpoetan
        </h1>
        <p className="mt-4 text-lg text-primary/80 max-w-3xl mx-auto">
          Melestarikan warisan, memberdayakan pengrajin, dan menghadirkan keindahan Jumputan Palembang untuk Anda.
        </p>
      </div>

      <Card className="bg-card/30 border-border/50 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative min-h-[400px] lg:min-h-[600px]">
              <Image
                src="https://picsum.photos/seed/about-us/800/1000"
                alt="Workshop Roemah Jumpoetan"
                data-ai-hint="artisan workshop"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center p-8 md:p-12">
              <h2 className="font-headline text-3xl font-bold mb-6">
                Kisah di Balik Sehelai Kain
              </h2>
              <div className="text-base md:text-lg text-foreground/80 space-y-4">
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
            </div>
        </div>
      </Card>
    </div>
  );
}
