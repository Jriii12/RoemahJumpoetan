import Link from 'next/link';
import { Newsletter } from './newsletter';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="w-full bg-card border-t mt-12">
      <div className="container mx-auto py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
           <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="Roemah Jumpoetan Logo"
              width={50}
              height={50}
              className="rounded-full"
            />
            <span className="font-bold font-headline text-lg">
              ROEMAH JUMPOETAN PALEMBANG
            </span>
          </Link>
          <p className="text-muted-foreground mt-2">
            Preserving Palembang's heritage, one thread at a time.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold">Quick Links</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-primary">
                Katalog Produk
              </Link>
            </li>
            <li>
               <Link href="/about" className="hover:text-primary">
                Tentang Kami
              </Link>
            </li>
             <li>
               <Link href="/contact" className="hover:text-primary">
                Kontak
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold">Stay Connected</h4>
          <p className="text-muted-foreground">
            Subscribe to our newsletter for the latest collections and offers.
          </p>
          <Newsletter />
        </div>
      </div>
      <div className="border-t border-border/50">
        <div className="container mx-auto py-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Roemah Jumpoetan. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
