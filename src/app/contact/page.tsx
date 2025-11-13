import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';

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
    lines: ['Senin - Jumat: 09:00 - 17:00', 'Sabtu: 08:00 - 15:00', 'Minggu: Tutup'],
  },
];

export default function ContactPage() {
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

       {/* Optional: Add form and map sections here in the future */}

    </div>
  );
}
