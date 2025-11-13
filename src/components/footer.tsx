import Link from 'next/link';
import { Newsletter } from './newsletter';

export function Footer() {
  return (
    <footer className="w-full bg-card border-t mt-12">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col gap-2">
          <h3 className="font-headline text-xl font-bold">Roemah Jumpoetan</h3>
          <p className="text-muted-foreground">
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
                Products
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-primary">
                My Account
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
      <div className="border-t">
        <div className="container py-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Roemah Jumpoetan. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
