import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      
      {/* SECTION 1: HEADER UTAMA */}
      <div className="text-center mb-16 md:mb-24">
        <span className="text-xs md:text-sm font-bold tracking-[0.3em] text-primary/60 uppercase mb-4 block">
          Est. Palembang
        </span>
        <h1 className="font-headline text-4xl md:text-6xl font-bold text-primary mb-6 tracking-tight">
          Tentang Roemah Jumpoetan
        </h1>
        <div className="h-1 w-20 bg-primary/20 mx-auto mb-6 rounded-full"></div>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Melestarikan warisan, memberdayakan pengrajin, dan menghadirkan keindahan Jumputan Palembang untuk dunia.
        </p>
      </div>

      {/* SECTION 2: KONTEN UTAMA (STORY) */}
      <div className="flex flex-col lg:flex-row items-stretch bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        
        {/* Bagian Gambar (Kiri) */}
        <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-full">
          <Image
            // Saran: Gunakan gambar proses pembuatan kain atau kain detail texture
            src="https://picsum.photos/seed/fabric-texture/800/1000" 
            alt="Workshop Roemah Jumpoetan"
            fill
            className="object-cover hover:scale-105 transition-transform duration-700 ease-in-out"
          />
          {/* Overlay gradient halus agar gambar menyatu dengan border */}
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Bagian Teks (Kanan) */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-card/50 backdrop-blur-sm">
          <div className="max-w-xl">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Kisah di Balik Sehelai Kain
            </h2>
            
            <div className="space-y-6 text-muted-foreground text-base md:text-lg leading-loose text-justify md:text-left">
              <p>
                <span className="font-semibold text-primary">Roemah Jumpoetan Palembang</span> adalah sebuah inisiatif tulus untuk melestarikan kain Jumputan, warisan budaya tak benda kebanggaan Sumatera Selatan. Kami percaya bahwa setiap helai kain bukan sekadar penutup tubuh, melainkan kanvas yang menceritakan kisah tradisi, kesabaran, dan keahlian leluhur.
              </p>
              <p>
                Lahir dari kecintaan mendalam pada seni lokal, kami berkolaborasi langsung dengan tangan-tangan terampil para pengrajin di pelosok Palembang. Misi kami melampaui estetika; kami hadir untuk memberdayakan komunitas, memastikan kesejahteraan pengrajin, sembari membawa elegansi Jumputan ke panggung modern.
              </p>
              <p>
                Dari kain lembaran hingga busana siap pakai, setiap karya melalui proses celup ikat tradisional yang otentik. Kami menjanjikan kualitas tertinggi dalam setiap simpul dan warna, mempersembahkan mahakarya yang tak lekang oleh waktu untuk Anda.
              </p>
            </div>

            {/* Tanda Tangan / Elemen Dekoratif Bawah */}
            <div className="mt-10 pt-8 border-t border-border/30">
                <p className="font-headline text-sm font-medium tracking-widest uppercase text-primary">
                    Roemah Jumpoetan Palembang
                </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}