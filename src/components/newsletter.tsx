'use client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

export function Newsletter() {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
    toast({
        title: "Subscribed!",
        description: `Thank you for subscribing with ${email}.`
    });
    (e.target as HTMLFormElement).reset();
  };

  if (!isClient) {
    // Render nothing or a placeholder on the server and during initial client render
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center space-x-2">
      <Input type="email" name="email" placeholder="Email" required />
      <Button type="submit" variant="default" className="rounded-full" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
        Subscribe
      </Button>
    </form>
  );
}
