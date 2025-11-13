import { FeaturedProducts } from '@/components/featured-products';
import { Testimonials } from '@/components/testimonials';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-background to-background/80">
      <div className="h-[calc(100vh-80px)] min-h-[500px] flex items-center justify-center relative">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="container text-center relative">
              <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold text-primary">
                  The Art of Palembang's Jumputan
              </h1>
              <p className="mt-6 text-lg md:text-xl text-primary/80 max-w-3xl mx-auto">
                  Experience the rich heritage and intricate craftsmanship of authentic
                  Jumputan textiles, handcrafted by local artisans.
              </p>
          </div>
      </div>
      <FeaturedProducts />
      <Separator className="my-12 md:my-24" />
      <Testimonials />
    </div>
  );
}
