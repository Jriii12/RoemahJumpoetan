import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-background to-purple-900/40 flex items-center justify-center p-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left Column */}
        <div className="text-center text-primary hidden md:flex flex-col items-center">
          <Image 
            src="/img/logo jumputan.jpg"
            alt="Roemah Jumpoetan Logo"
            width={250}
            height={250}
            className="rounded-full mb-6"
          />
          <h2 className="font-headline text-3xl font-bold">
            Kain Jumputan Dengan Kualitas Terbaik
          </h2>
        </div>

        {/* Right Column */}
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-card/80 border-border/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl font-bold">Log In</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="Masukkan Email Address Anda" required className="pl-10"/>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="text-xs text-muted-foreground hover:text-primary">
                        Lupa Password?
                    </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="Masukkan Password Anda" required className="pl-10 pr-10"/>
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>

               <Button className="w-full rounded-full border-2 border-accent text-accent-foreground hover:bg-accent/80 bg-transparent text-lg font-bold py-6">
                 LOG IN
               </Button>
                
               <div className="text-center text-sm text-muted-foreground">
                    Belum Punya Akun?{" "}
                    <Link href="#" className="underline font-semibold text-primary/90 hover:text-primary">
                        Daftar
                    </Link>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
