import { testimonials } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function Testimonials() {
  return (
    <section className="py-12 md:py-24 bg-card/50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-bold">
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            We are proud to share the experiences of our valued patrons.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-card border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex flex-col">
                  <span className="font-bold text-lg">{testimonial.name}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {testimonial.location}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="italic">"{testimonial.quote}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
