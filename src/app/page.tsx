import { Hero } from '@/components/hero';
import { FeaturedProducts } from '@/components/featured-products';
import { Testimonials } from '@/components/testimonials';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <Separator className="my-12 md:my-24" />
      <Testimonials />
    </>
  );
}
