
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WavyBackground } from '@/components/WavyBackground';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-background relative">
      <WavyBackground />
      <Header />
      <main className="container py-20 relative z-10 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Payment Canceled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <XCircle className="h-12 w-12 mx-auto text-orange-500" />
            <p className="text-xl font-semibold">Payment Canceled</p>
            <p>Your payment was canceled. You have not been charged.</p>
            <Button asChild>
              <Link to="/customer-dashboard">Return to Cart</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
