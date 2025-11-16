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
import { Mail, MapPin, Phone, Clock, Send, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    <div className="container py-12 md:py-20 px-4">
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
            Hubungi Kami
            </h1>
            <p className="mt-4 text-lg text-primary/80 max-w-3xl mx-auto">
            Kami siap membantu mewujudkan proyek handycraft impian Anda. Jangan ragu
            untuk menghubungi tim profesional kami.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-card/30 border border-border/50 rounded-lg p-8">
                 <h2 className="font-headline text-3xl font-bold mb-6">Kirim Pesan</h2>
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

            {/* Contact Info & Map */}
            <div className="space-y-8">
                <Card className="bg-card/30 border-border/50">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Informasi Kontak</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <div className="flex items-start gap-4">
                            <MapPin className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-foreground">Alamat</h4>
                                <p>Jln aiptu a wahab Lr. kebun pisang No.37, Rt. 031 Rw. 01, Kec. Jakbaring, Kel. Tuan Kentang, Palembang, 30252</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <Phone className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-foreground">Telepon</h4>
                                <p>082178200327 (Admin Shop)</p>
                                <p>0815-1909-2233 (Admin Butik)</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <Mail className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-foreground">Email</h4>
                                <p>info@roemahjumpoetan.com</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Clock className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-foreground">Jam Operasional</h4>
                                <p>Senin - Jumat: 09:00 - 17:00</p>
                                <p>Sabtu: 08:00 - 15:00 | Minggu: Tutup</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                 <Card className="bg-card/30 border-border/50">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center aspect-video">
                        <Building className="w-16 h-16 text-accent mb-4"/>
                        <h3 className="font-semibold text-xl">Lokasi Butik</h3>
                        <p className="text-muted-foreground mt-2">Kunjungi galeri kami untuk melihat koleksi lengkap dan konsultasi langsung.</p>
                         <Button asChild variant="outline" className="mt-4 rounded-full">
                            <a href="#" target="_blank" rel="noopener noreferrer">Lihat di Peta</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
