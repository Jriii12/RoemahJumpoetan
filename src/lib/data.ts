import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

const imageMap = new Map<string, ImagePlaceholder>(
  PlaceHolderImages.map((img) => [img.id, img])
);

export type Product = {
  id: string;
  name: string;
  price: number;
  category:
    | 'Kain'
    | 'Pakaian'
    | 'Aksesoris'
    | 'Pakaian Wanita'
    | 'Fashion Muslim'
    | 'Pakaian Pria'
    | 'Souvenir & Perlengkapan Pesta';
  description: string;
  imageUrl: string;
  imageHint: string;
  stock: number;
  status: 'tersedia' | 'hampir habis' | 'habis';
  purchases: number;
};

export type Testimonial = {
  id: number;
  name: string;
  quote: string;
  location: string;
};

export const products: Omit<Product, 'id'>[] = [
  // This data is now for fallback or seeding purposes, the app primarily uses Firestore.
];

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Rina S.',
    location: 'Jakarta',
    quote:
      'Kualitas kainnya luar biasa! Warnanya sangat hidup dan tidak luntur. Saya sangat puas dengan pembelian saya.',
  },
  {
    id: 2,
    name: 'Andi P.',
    location: 'Surabaya',
    quote:
      'Gaun yang saya pesan pas sekali di badan dan terasa sangat mewah. Desainnya unik dan mendapat banyak pujian.',
  },
  {
    id: 3,
    name: 'Eliza T.',
    location: 'Bandung',
    quote:
      'Pelayanannya cepat dan ramah. Produknya dibungkus dengan sangat cantik. Pasti akan belanja di sini lagi!',
  },
];

export const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Katalog Produk' },
  { href: '/about', label: 'Tentang Kami' },
  { href: '/contact', label: 'Kontak' },
];
