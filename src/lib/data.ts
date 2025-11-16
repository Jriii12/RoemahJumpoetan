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
  image: ImagePlaceholder;
};

export type Testimonial = {
  id: number;
  name: string;
  quote: string;
  location: string;
};

export const products: Product[] = [
  // Existing Products (assigned to new categories where applicable)
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
    category: 'Pakaian Wanita',
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
    category: 'Pakaian Pria',
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
  // Pakaian Wanita
  {
    id: 'pw-001',
    name: 'Blus Jumputan Anggun',
    price: 550000,
    category: 'Pakaian Wanita',
    description: 'Blus modern dengan motif jumputan yang anggun, cocok untuk acara formal maupun kasual.',
    image: imageMap.get('pw-blouse-1')!,
  },
  {
    id: 'pw-002',
    name: 'Rok Lilit Jumputan',
    price: 620000,
    category: 'Pakaian Wanita',
    description: 'Rok lilit serbaguna yang dapat disesuaikan dengan berbagai gaya, menampilkan keindahan jumputan.',
    image: imageMap.get('pw-skirt-1')!,
  },
  {
    id: 'pw-003',
    name: 'Outerwear Kimono Jumputan',
    price: 780000,
    category: 'Pakaian Wanita',
    description: 'Outerwear model kimono yang stylish, memberikan sentuhan etnik pada penampilan modern Anda.',
    image: imageMap.get('pw-outer-1')!,
  },
  {
    id: 'pw-004',
    name: 'Celana Kulot Jumputan',
    price: 590000,
    category: 'Pakaian Wanita',
    description: 'Celana kulot yang nyaman dan modis dengan detail jumputan yang unik.',
    image: imageMap.get('pw-culottes-1')!,
  },
  {
    id: 'pw-005',
    name: 'Dress Pesta Jumputan',
    price: 1350000,
    category: 'Pakaian Wanita',
    description: 'Dress pesta mewah dengan kombinasi kain jumputan sutra dan desain kontemporer.',
    image: imageMap.get('pw-dress-2')!,
  },
  {
    id: 'pw-006',
    name: 'Tunik Jumputan Asimetris',
    price: 680000,
    category: 'Pakaian Wanita',
    description: 'Tunik dengan potongan asimetris yang modern, dipercantik dengan motif jumputan.',
    image: imageMap.get('pw-tunic-1')!,
  },
  {
    id: 'pw-007',
    name: 'Kaftan Jumputan Elegan',
    price: 950000,
    category: 'Pakaian Wanita',
    description: 'Kaftan longgar dan elegan, sempurna untuk acara santai maupun semi-formal.',
    image: imageMap.get('pw-caftan-1')!,
  },
  {
    id: 'pw-008',
    name: 'Vest Jumputan Modern',
    price: 480000,
    category: 'Pakaian Wanita',
    description: 'Vest tanpa lengan yang dapat dipadupadankan untuk melengkapi gaya Anda.',
    image: imageMap.get('pw-vest-1')!,
  },
  {
    id: 'pw-009',
    name: 'Jumpsuit Jumputan',
    price: 890000,
    category: 'Pakaian Wanita',
    description: 'Jumpsuit praktis dan stylish, pilihan tepat untuk tampil beda.',
    image: imageMap.get('pw-jumpsuit-1')!,
  },
  {
    id: 'pw-010',
    name: 'Blazer Jumputan Formal',
    price: 980000,
    category: 'Pakaian Wanita',
    description: 'Blazer dengan sentuhan etnik jumputan untuk penampilan kerja yang profesional.',
    image: imageMap.get('pw-blazer-1')!,
  },
  // Fashion Muslim
  {
    id: 'fm-001',
    name: 'Gamis Jumputan Syar\'i',
    price: 1100000,
    category: 'Fashion Muslim',
    description: 'Gamis syar\'i dengan bahan adem dan motif jumputan yang mewah.',
    image: imageMap.get('fm-gamis-1')!,
  },
  {
    id: 'fm-002',
    name: 'Hijab Voal Jumputan',
    price: 250000,
    category: 'Fashion Muslim',
    description: 'Hijab voal premium dengan print motif jumputan eksklusif.',
    image: imageMap.get('fm-hijab-1')!,
  },
  {
    id: 'fm-003',
    name: 'Tunik Muslimah Jumputan',
    price: 720000,
    category: 'Fashion Muslim',
    description: 'Tunik panjang yang sopan dan modis, cocok untuk berbagai acara.',
    image: imageMap.get('fm-tunic-1')!,
  },
  {
    id: 'fm-004',
    name: 'Abaya Jumputan Modern',
    price: 1200000,
    category: 'Fashion Muslim',
    description: 'Abaya dengan desain modern dan detail jumputan yang halus.',
    image: imageMap.get('fm-abaya-1')!,
  },
  {
    id: 'fm-005',
    name: 'Setelan Celana Muslimah',
    price: 950000,
    category: 'Fashion Muslim',
    description: 'Setelan atasan dan celana panjang dengan sentuhan jumputan yang chic.',
    image: imageMap.get('fm-set-1')!,
  },
  {
    id: 'fm-006',
    name: 'Pashmina Jumputan Sutra',
    price: 350000,
    category: 'Fashion Muslim',
    description: 'Pashmina sutra lembut dengan motif jumputan Palembang.',
    image: imageMap.get('fm-pashmina-1')!,
  },
  {
    id: 'fm-007',
    name: 'Mukena Jumputan Travel',
    price: 600000,
    category: 'Fashion Muslim',
    description: 'Mukena ringan dan praktis untuk traveling dengan tas cantik bermotif jumputan.',
    image: imageMap.get('fm-mukena-1')!,
  },
  {
    id: 'fm-008',
    name: 'Outerwear Panjang Muslimah',
    price: 850000,
    category: 'Fashion Muslim',
    description: 'Outerwear panjang untuk melengkapi busana muslimah Anda.',
    image: imageMap.get('fm-outer-1')!,
  },
  {
    id: 'fm-009',
    name: 'Gamis Pesta Muslimah',
    price: 1500000,
    category: 'Fashion Muslim',
    description: 'Gamis untuk acara pesta dengan bahan berkualitas dan motif jumputan yang menawan.',
    image: imageMap.get('fm-gamis-2')!,
  },
  {
    id: 'fm-010',
    name: 'Bergo Instan Jumputan',
    price: 180000,
    category: 'Fashion Muslim',
    description: 'Bergo instan praktis dengan sentuhan motif jumputan di bagian pet.',
    image: imageMap.get('fm-bergo-1')!,
  },
  // Pakaian Pria
  {
    id: 'pp-001',
    name: 'Kemeja Batik Jumputan',
    price: 720000,
    category: 'Pakaian Pria',
    description: 'Kemeja lengan pendek dengan kombinasi batik dan jumputan.',
    image: imageMap.get('pp-shirt-1')!,
  },
  {
    id: 'pp-002',
    name: 'Baju Koko Jumputan',
    price: 650000,
    category: 'Pakaian Pria',
    description: 'Baju koko modern dengan aksen jumputan di bagian kerah dan lengan.',
    image: imageMap.get('pp-koko-1')!,
  },
  {
    id: 'pp-003',
    name: 'Celana Sirwal Jumputan',
    price: 480000,
    category: 'Pakaian Pria',
    description: 'Celana sirwal santai dengan detail jumputan yang kasual.',
    image: imageMap.get('pp-pants-1')!,
  },
  {
    id: 'pp-004',
    name: 'Outerwear Pria Etnik',
    price: 880000,
    category: 'Pakaian Pria',
    description: 'Outerwear pria yang terinspirasi dari jubah dengan motif jumputan.',
    image: imageMap.get('pp-outer-1')!,
  },
  {
    id: 'pp-005',
    name: 'Kemeja Formal Jumputan',
    price: 800000,
    category: 'Pakaian Pria',
    description: 'Kemeja lengan panjang untuk acara formal dengan motif jumputan yang elegan.',
    image: imageMap.get('pp-shirt-2')!,
  },
  {
    id: 'pp-006',
    name: 'Kaos Polo Aksen Jumputan',
    price: 450000,
    category: 'Pakaian Pria',
    description: 'Kaos polo dengan kerah dan ujung lengan bermotif jumputan.',
    image: imageMap.get('pp-polo-1')!,
  },
  {
    id: 'pp-007',
    name: 'Jaket Bomber Jumputan',
    price: 950000,
    category: 'Pakaian Pria',
    description: 'Jaket bomber modern dengan panel kain jumputan di bagian depan.',
    image: imageMap.get('pp-jacket-1')!,
  },
  {
    id: 'pp-008',
    name: 'Rompi Pria Jumputan',
    price: 550000,
    category: 'Pakaian Pria',
    description: 'Rompi yang dapat menambah kesan formal pada kemeja Anda.',
    image: imageMap.get('pp-vest-1')!,
  },
  {
    id: 'pp-009',
    name: 'Sarung Tenun Jumputan',
    price: 750000,
    category: 'Pakaian Pria',
    description: 'Sarung tenun berkualitas tinggi dengan tumpal motif jumputan.',
    image: imageMap.get('pp-sarong-1')!,
  },
  {
    id: 'pp-010',
    name: 'Kemeja Koko Modern',
    price: 680000,
    category: 'Pakaian Pria',
    description: 'Baju koko lengan panjang dengan desain minimalis dan aksen jumputan.',
    image: imageMap.get('pp-koko-2')!,
  },
  // Souvenir & Perlengkapan Pesta
  {
    id: 'sp-001',
    name: 'Dompet Koin Jumputan',
    price: 75000,
    category: 'Souvenir & Perlengkapan Pesta',
    description: 'Souvenir dompet koin cantik dari kain perca jumputan.',
    image: imageMap.get('sp-pouch-1')!,
  },
  {
    id: 'sp-002',
    name: 'Gantungan Kunci Boneka',
    price: 50000,
    category: 'Souvenir & Perlengkapan Pesta',
    description: 'Gantungan kunci boneka dengan baju dari kain jumputan.',
    image: imageMap.get('sp-keychain-1')!,
  },
  {
    id: 'sp-003',
    name: 'Kipas Tangan Jumputan',
    price: 120000,
    category: 'Souvenir & Perlengkapan Pesta',
    description: 'Kipas tangan dengan rangka bambu dan kain jumputan.',
    image: imageMap.get('sp-fan-1')!,
  },
  {
    id: 'sp-004',
    name: 'Taplak Meja Jumputan',
    price: 450000,
    category: 'Souvenir & Perlengkapan Pesta',
    description: 'Taplak meja tamu dengan motif jumputan yang mempercantik ruangan.',
    image: imageMap.get('sp-tablecloth-1')!,
  },
  {
    id: 'sp-005',
    name: 'Pouch Serbaguna',
    price: 150000,
    category: 'Souvenir & Perlengkapan Pesta',
    description: 'Pouch untuk makeup atau alat tulis dengan lapisan dalam tahan air.',
    image: imageMap.get('sp-pouch-2')!,
  },
  {
    id: 'sp-006',
    name: 'Ikat Kepala Jumputan',
    price: 85000,
    category: 'Souvenir & Perlengkapan Pesta',
    description: 'Ikat kepala atau bandana dari kain jumputan elastis.',
    image: imageMap.get('sp-headband-1')!,
  },
  {
    id: 'sp-007',
    name: 'Goodie Bag Pesta',
    price: 45000,
    category: 'Souvenir & Perlengkapan Pesta',
    description: 'Tas serut kecil untuk souvenir pesta atau acara.',
    image: imageMap.get('sp-goodiebag-1')!,
  },
  {
    id: 'sp-008',
    name: 'Tatakan Gelas Jumputan',
    price: 95000,
    category: 'Souvenir & Perlengkapan Pesta',
    description: 'Set isi 4 tatakan gelas dari kain jumputan.',
    image: imageMap.get('sp-coaster-1')!,
  },
  {
    id: 'sp-009',
    name: 'Hiasan Dinding Jumputan',
    price: 350000,
    category: 'Souvenir & Perlengkapan Pesta',
    description: 'Hiasan dinding dalam bingkai kayu dengan kain jumputan.',
    image: imageMap.get('sp-walldecor-1')!,
  },
  {
    id: 'sp-010',
    name: 'Bookmark Kain Jumputan',
    price: 35000,
    category: 'Souvenir & Perlengkapan Pesta',
    description: 'Pembatas buku unik dari kain jumputan yang dikeraskan.',
    image: imageMap.get('sp-bookmark-1')!,
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
