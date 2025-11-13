import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ContactPage() {
  return (
    <div className="container py-12 md:py-24 max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-4xl md:text-5xl font-bold">
            Hubungi Kami
          </CardTitle>
          <CardDescription className="text-lg">
            Ada pertanyaan atau ingin berkolaborasi? Kami siap membantu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input id="name" placeholder="Nama Anda" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@anda.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subjek</Label>
              <Input id="subject" placeholder="Subjek pesan Anda" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Pesan</Label>
              <Textarea
                id="message"
                placeholder="Tuliskan pesan Anda di sini..."
                className="min-h-[150px]"
              />
            </div>
            <Button type="submit" size="lg" className="w-full" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
              Kirim Pesan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
