import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-context';
import { FirebaseClientProvider } from '@/firebase';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AppBody } from './app-body'; // Impor komponen baru

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-cormorant',
});

export const metadata: Metadata = {
  title: 'Roemah Jumpoetan Palembang',
  description:
    'Discover authentic Jumputan textiles from Palembang. High-quality, handcrafted fabrics, clothing, and accessories.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        'scroll-smooth dark',
        inter.variable,
        cormorant.variable
      )}
    >
      <head>
        <link rel="icon" href="/img/logo jumputan.jpg" sizes="any" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <CartProvider>
            {/* Gunakan komponen AppBody untuk membungkus children */}
            <AppBody>{children}</AppBody>
            <Toaster />
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
