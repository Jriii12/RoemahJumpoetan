
'use client';

import { FeaturedProducts } from '@/components/featured-products';
import { TestimonialForm } from '@/components/testimonial-form';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-background to-background/80">
      <div className="h-[calc(80vh-80px)] min-h-[500px] flex items-center justify-center relative overflow-hidden">
        <Image
          src="/img/kain.jpeg"
          alt="A close-up of a beautifully textured Jumputan fabric."
          data-ai-hint="fabric texture"
          fill
          className="object-cover z-0"
        />
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="container text-center relative z-20 px-4">
          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold text-white">
            The Art of Palembang's Jumputan
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
            Experience the rich heritage and intricate craftsmanship of
            authentic Jumputan textiles, handcrafted by local artisans.
          </p>
        </div>
      </div>
      <FeaturedProducts />
      <Separator className="my-12 md:my-24" />
      <TestimonialForm />
    </div>
  );
}
