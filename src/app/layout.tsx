'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-context';
import { FirebaseClientProvider } from '@/firebase';
import { usePathname } from 'next/navigation';

// Metadata can't be in a client component, but since we need usePathname,
// we'll manage metadata here and keep the component client-side.
// For a more robust solution, you'd hoist metadata to a server component layout.
// export const metadata: Metadata = {
//   title: 'Roemah Jumpoetan Palembang',
//   description:
//     'Discover authentic Jumputan textiles from Palembang. High-quality, handcrafted fabrics, clothing, and accessories.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <html lang="en" className="scroll-smooth dark">
      <head>
        <title>Roemah Jumpoetan Palembang</title>
        <meta
          name="description"
          content="Discover authentic Jumputan textiles from Palembang. High-quality, handcrafted fabrics, clothing, and accessories."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/img/logo jumputan.jpg" sizes="any" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              {!isAdminPage && <Header />}
              <main className="flex-grow">{children}</main>
              {!isAdminPage && <Footer />}
            </div>
            <Toaster />
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
