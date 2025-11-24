import Image from 'next/image';
import { Target, Eye, Users, TrendingUp, Handshake, CheckCircle } from 'lucide-react';

export default function AboutPage() {
  
  const missions = [
    {
      icon: <Eye className="h-6 w-6 text-primary" />,
      text: 'Mengenalkan produk lokal dari Sumatra Selatan, khususnya di bidang tekstil.',
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
      text: 'Memperkaya kreasi dan mengasah kreativitas yang dituangkan ke dalam kain khas Jumputan Palembang.',
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
      text: 'Ikut membantu memperkenalkan produk dan salah satu aset dari Sumatra Selatan.',
    },
    {
      icon: <Target className="h-6 w-6 text-primary" />,
      text: 'Menjadi salah satu UMKM yang berhasil di bidangnya.',
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      text: 'Membantu perekonomian di sekitar tempat produksi dan mengurangi angka pengangguran.',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      {/* SECTION 1: HEADER UTAMA */}
      <div className="text-center mb-16 md:mb-24">
        <span className="text-xs md:text-sm font-bold tracking-[0.3em] text-primary/60 uppercase mb-4 block">
          Didirikan Tahun 2000
        </span>
        <h1 className="font-headline text-4xl md:text-6xl font-bold text-primary mb-6 tracking-tight">
          Tentang Roemah Jumpoetan
        </h1>
        <div className="h-1 w-20 bg-primary/20 mx-auto mb-6 rounded-full"></div>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Kisah Perjuangan, Dedikasi, dan Inovasi dalam Melestarikan Warisan Jumputan Palembang.
        </p>
      </div>

      {/* SECTION 2: KONTEN UTAMA (STORY) */}
      <div className="flex flex-col lg:flex-row items-stretch bg-card border border-border/40 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 mb-16">
        {/* Bagian Gambar (Kiri) */}
        <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-full">
          <Image
            src="https://picsum.photos/seed/jumputan/800/1000"
            alt="Kain Jumputan Palembang"
            data-ai-hint="jumputan fabric"
            fill
            className="object-cover hover:scale-105 transition-transform duration-700 ease-in-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
        </div>

        {/* Bagian Teks (Kanan) */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-card/50 backdrop-blur-sm">
          <div className="max-w-xl">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Merintis dari Nol
            </h2>
            
            <div className="space-y-6 text-muted-foreground text-base md:text-lg leading-loose text-justify">
              <p>
                <span className="font-semibold text-primary">Roemah Jumpoetan</span> berdiri pada tahun 2000, dirintis oleh <span className="font-semibold text-primary">Ibu Badriah</span> dan <span className="font-semibold text-primary">Bapak Aceng</span>. Usaha ini mereka mulai dari nol, berawal dari mengambil upahan dari pengrajin-pengrajin besar. 
              </p>
              <p>
                Dengan ketekunan dan dedikasi, mereka membangun usaha ini hingga mencapai titik sekarang. Perjalanan panjang itu diiringi dengan inovasi-inovasi jumputan terbaru, menghasilkan karya yang semakin kaya dan beragam dari tahun ke tahun.
              </p>
            </div>

            <div className="mt-10 pt-8 border-t border-border/30">
                <p className="font-headline text-sm font-medium tracking-widest uppercase text-primary">
                    Ibu Badriah & Bapak Aceng
                </p>
                 <p className="text-xs text-muted-foreground">Pendiri Roemah Jumpoetan</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* SECTION 3: VISI & MISI */}
      <div className="text-center mb-16">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-4">Visi & Misi Kami</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Kami memiliki komitmen kuat untuk memajukan warisan budaya dan memberdayakan komunitas lokal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {missions.map((mission, index) => (
          <div key={index} className="bg-card/70 border border-border/40 p-6 rounded-xl flex items-start gap-4 hover:border-accent/50 hover:bg-accent/10 transition-all duration-300">
             <div className="flex-shrink-0 mt-1">
                {mission.icon}
             </div>
            <p className="text-muted-foreground text-base">{mission.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
