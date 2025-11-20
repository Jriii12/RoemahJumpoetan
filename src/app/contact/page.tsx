'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Mail, MapPin, Phone, Clock, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const { toast } = useToast();

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: 'Pesan Terkirim!',
      description:
        'Terima kasih telah menghubungi kami. Kami akan segera merespons Anda.',
    });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* SECTION HEADER */}
      <div className="container mx-auto px-4 pt-16 pb-12 text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4">
          Hubungi Kami
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Kami siap membantu mewujudkan proyek handycraft impian Anda. 
          Diskusikan kebutuhan Anda bersama tim profesional kami.
        </p>
      </div>

      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* BAGIAN KIRI: FORMULIR (Mengambil 7 kolom) */}
          <div className="lg:col-span-7">
            <Card className="border-none shadow-lg bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold">Kirim Pesan</CardTitle>
                <CardDescription>
                  Silakan isi formulir di bawah ini, kami akan membalas secepatnya.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium">Nama Lengkap</Label>
                      <Input
                        id="fullName"
                        placeholder="Nama Anda"
                        required
                        className="h-12 bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="nama@email.com"
                        required
                        className="h-12 bg-background/50"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium">Subjek</Label>
                    <Select required>
                      <SelectTrigger id="subject" className="h-12 bg-background/50">
                        <SelectValue placeholder="Pilih topik pembicaraan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pertanyaan">Pertanyaan Umum</SelectItem>
                        <SelectItem value="pemesanan">Pemesanan Khusus (Custom)</SelectItem>
                        <SelectItem value="kolaborasi">Kolaborasi / Partnership</SelectItem>
                        <SelectItem value="lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium">Pesan</Label>
                    <Textarea
                      id="message"
                      placeholder="Tuliskan detail kebutuhan atau pertanyaan Anda..."
                      rows={8}
                      required
                      className="bg-background/50 resize-none p-4"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full md:w-auto rounded-full bg-accent hover:bg-accent/90 text-white px-8 font-semibold"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Kirim Pesan Sekarang
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* BAGIAN KANAN: INFO & MAP (Mengambil 5 kolom) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Info Card */}
            <Card className="border-border/40 shadow-md bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Informasi Kontak</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Item Kontak */}
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Butik & Workshop</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Jln. Aiptu A. Wahab, Lr. Kebun Pisang No.37,<br/>
                      Kec. Jakbaring, Kel. Tuan Kentang,<br/>
                      Palembang, 30252
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Telepon / WhatsApp</h4>
                    <p className="text-sm text-muted-foreground">0821-7820-0327 (Admin Shop)</p>
                    <p className="text-sm text-muted-foreground">0815-1909-2233 (Admin Butik)</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Email</h4>
                    <p className="text-sm text-muted-foreground">info@roemahjumpoetan.com</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Jam Operasional</h4>
                    <p className="text-sm text-muted-foreground">Senin - Jumat: 09:00 - 17:00</p>
                    <p className="text-sm text-muted-foreground">Sabtu: 08:00 - 15:00</p>
                    <p className="text-sm text-red-500/80 mt-1">Minggu: Tutup</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Card - Disatukan alurnya di kolom kanan */}
            <div className="rounded-xl overflow-hidden border border-border/40 shadow-md h-[300px] relative">
                {/* Menggunakan Embed Google Maps Palembang (Generic point ke Tuan Kentang) */}
                 <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.366389419885!2d104.7625543741089!3d-3.022699996953298!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e3b9c4b6b6b6b6b%3A0x6b6b6b6b6b6b6b6b!2sTuan%20Kentang%2C%20Kec.%20Jakabaring%2C%20Kota%20Palembang%2C%20Sumatera%20Selatan!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                    width="100%" 
                    height="100%" 
                    style={{border:0}} 
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="grayscale hover:grayscale-0 transition-all duration-500"
                ></iframe>
                <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-bold shadow-md text-black">
                    Lokasi Butik
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}