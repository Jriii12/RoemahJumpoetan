'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MapPin, Phone, Clock, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


const contactInfo = [
  {
    icon: MapPin,
    title: 'Alamat',
    lines: [
      'Jln aiptu a wahab Lr. kebun pisang No.37',
      'Rt. 031 Rw. 01, Kec. Jakbaring',
      'Kel. Tuan Kentang, Palembang, 30252',
    ],
  },
  {
    icon: Phone,
    title: 'Telepon',
    lines: ['082178200327 (admin shop)', '0815-1909-2233 (admin butik)'],
  },
  {
    icon: Mail,
    title: 'Email',
    lines: ['info@roemahjumpoetan.com', 'sales@roemahjumpoetan.com'],
  },
  {
    icon: Clock,
    title: 'Jam Operasional',
    lines: ['Senin - Sabtu: 09:00 - 17:00', 'Minggu: Tutup'],
  },
];

const additionalInfo = [
    "Konsultasi gratis untuk semua layanan",
    "Estimasi harga dalam 24 jam",
    "Garansi kepuasan 100%",
    "Pengiriman ke seluruh Indonesia",
    "Pembayaran fleksibel"
]

export default function ContactPage() {
  const { toast } = useToast();

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
        title: "Pesan Terkirim!",
        description: "Terima kasih telah menghubungi kami. Kami akan segera merespons Anda."
    });
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="container py-12 md:py-24 px-4">
      <div className="text-center mb-12 md:mb-16">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
          Hubungi Kami
        </h1>
        <p className="mt-4 text-lg text-primary/80 max-w-3xl mx-auto">
          Kami siap membantu mewujudkan proyek handycraft impian Anda. Jangan ragu
          untuk menghubungi tim profesional kami.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {contactInfo.map((info, index) => (
          <Card key={index} className="text-center bg-card/50 border-border/40 pt-6">
            <CardHeader className="items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-accent/20 text-accent mb-4">
                <info.icon className="h-8 w-8" />
              </div>
              <CardTitle className="font-semibold text-xl">{info.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {info.lines.map((line, i) => (
                <p key={i} className="text-muted-foreground break-words">
                  {line}
                </p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 md:mt-24 grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left Side: Form */}
          <div className="lg:col-span-3">
              <h2 className="font-headline text-3xl md:text-4xl font-bold mb-8 text-primary">Kirim Pesan</h2>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <Label htmlFor="fullName">Nama Lengkap *</Label>
                          <Input id="fullName" placeholder="Masukkan nama lengkap" required />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input id="email" type="email" placeholder="nama@email.com" required />
                      </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <Label htmlFor="phone">Nomor Telepon</Label>
                          <Input id="phone" type="tel" placeholder="+62 812 3456 7890" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="subject">Subjek *</Label>
                          <Select required>
                              <SelectTrigger id="subject">
                                  <SelectValue placeholder="Pilih subjek" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="pertanyaan">Pertanyaan Umum</SelectItem>
                                  <SelectItem value="pemesanan">Pemesanan Khusus</SelectItem>
                                  <SelectItem value="kolaborasi">Kolaborasi</SelectItem>
                                  <SelectItem value="lainnya">Lainnya</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="message">Pesan *</Label>
                      <Textarea id="message" placeholder="Ceritakan kebutuhan atau pertanyaan Anda..." rows={5} required />
                  </div>
                  <Button type="submit" size="lg" className="rounded-full bg-accent hover:bg-accent/80 w-full sm:w-auto">
                      <Send className="mr-2 h-4 w-4" />
                      Kirim Pesan
                  </Button>
              </form>
          </div>

          {/* Right Side: Location & Info */}
          <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                  <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary">Lokasi Kami</h2>
                   <Card className="bg-card/50 border-border/40">
                      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                          <MapPin className="w-12 h-12 text-accent mb-4"/>
                          <h3 className="font-semibold text-lg">Peta Lokasi</h3>
                          <p className="text-muted-foreground">Jl. Aiptu A. Wahab, Palembang</p>
                      </CardContent>
                  </Card>
              </div>
               <div className="space-y-4">
                  <h2 className="font-headline text-3xl font-bold text-primary">Informasi Tambahan</h2>
                  <Card className="bg-card/50 border-border/40">
                      <CardContent className="p-6">
                          <ul className="space-y-3 text-muted-foreground">
                              {additionalInfo.map((text, i) => (
                                  <li key={i} className="flex items-start">
                                      <CheckCircle className="w-5 h-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                                      <span>{text}</span>
                                  </li>
                              ))}
                          </ul>
                      </CardContent>
                  </Card>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="w-full rounded-full" variant="outline">
                      <a href="tel:082178200327">
                        <Phone className="mr-2 h-4 w-4" />
                        Telepon Sekarang
                      </a>
                  </Button>
                  <Button asChild size="lg" className="w-full rounded-full bg-accent hover:bg-accent/80">
                      <a href="mailto:info@roemahjumpoetan.com">
                        <Mail className="mr-2 h-4 w-4" />
                        Kirim Email
                      </a>
                  </Button>
              </div>
          </div>
      </div>
    </div>
  );
}
