import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AccountPage() {
  return (
    <div className="container py-12 md:py-24 max-w-2xl px-4">
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">My Account</CardTitle>
          <CardDescription>
            This is your account page. In the future, you'll be able to see your order history and manage your details here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p>For now, this page is just a placeholder.</p>
            <Button asChild className="rounded-full">
                <Link href="/products">
                    Continue Shopping
                </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
