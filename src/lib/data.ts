import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

const imageMap = new Map<string, ImagePlaceholder>(
  PlaceHolderImages.map((img) => [img.id, img])
);

export type Product = {
  id: string;
  name: string;
  price: number;
  category: 'Kain' | 'Pakaian' | 'Aksesoris';
  description: string;
  image: ImagePlaceholder;
};

export type Testimonial = {
  id: number;
  name: string;
  quote: string;
  location: string;
};

export const products: Product[] = [
  {
    id: 'prod_001',
    name: 'Jumputan Sutra Merah',
    price: 750000,
    category: 'Kain',
    description:
      'Kain jumputan sutra asli dengan motif tradisional Palembang, diwarnai dengan tangan untuk menghasilkan warna merah yang kaya dan corak yang unik.',
    image: imageMap.get('product-kain-1')!,
  },
  {
    id: 'prod_002',
    name: 'Gaun Malam Jumputan',
    price: 1250000,
    category: 'Pakaian',
    description:
      'Gaun malam elegan yang dibuat dari kain jumputan pilihan, menggabungkan desain modern dengan sentuhan warisan budaya.',
    image: imageMap.get('product-pakaian-1')!,
  },
  {
    id: 'prod_003',
    name: 'Tas Tangan Etnik',
    price: 450000,
    category: 'Aksesoris',
    description:
      'Tas tangan yang stylish dan fungsional, dibuat dari sisa kain jumputan premium, cocok untuk melengkapi penampilan Anda.',
    image: imageMap.get('product-aksesoris-1')!,
  },
  {
    id: 'prod_004',
    name: 'Kemeja Pria Jumputan',
    price: 680000,
    category: 'Pakaian',
    description:
      'Kemeja pria lengan panjang dengan aksen jumputan di bagian saku dan kerah, memberikan tampilan kasual namun tetap berkelas.',
    image: imageMap.get('product-pakaian-2')!,
  },
  {
    id: 'prod_005',
    name: 'Jumputan Katun Biru',
    price: 550000,
    category: 'Kain',
    description:
      'Kain jumputan katun yang nyaman dengan warna biru indigo alami, cocok untuk dijadikan pakaian sehari-hari.',
    image: imageMap.get('product-kain-2')!,
  },
  {
    id: 'prod_006',
    name: 'Syal Jumputan Pelangi',
    price: 320000,
    category: 'Aksesoris',
    description:
      'Syal lembut dengan gradasi warna-warni yang cerah, dibuat dari kain jumputan ringan untuk kenyamanan maksimal.',
    image: imageMap.get('product-aksesoris-2')!,
  },
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
