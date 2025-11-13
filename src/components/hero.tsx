import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Hero() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-background');

  return (
    <section className="relative h-[60vh] md:h-[80vh] w-full">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          data-ai-hint={heroImage.imageHint}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex h-full items-center justify-center text-center">
        <div className="container text-white max-w-4xl">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold">
            The Art of Palembang's Jumputan
          </h1>
          <p className="mt-4 text-lg md:text-xl text-slate-200">
            Experience the rich heritage and intricate craftsmanship of authentic
            Jumputan textiles, handcrafted by local artisans.
          </p>
          <Button asChild size="lg" className="mt-8" variant="default" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
            <Link href="/products">Shop The Collection</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
