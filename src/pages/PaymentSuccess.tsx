
import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WavyBackground } from '@/components/WavyBackground';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function PaymentSuccess() {
  const location = useLocation();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sessionId = searchParams.get('session_id');

    if (sessionId) {
      const verifyPayment = async () => {
        try {
          const { error: functionError } = await supabase.functions.invoke('verify-session', {
            body: { session_id: sessionId },
          });

          if (functionError) throw functionError;

          setStatus('success');
        } catch (err: any) {
          console.error(err);
          setError(err.message || 'Payment verification failed.');
          setStatus('error');
        }
      };
      verifyPayment();
    } else {
      setError('No session ID found.');
      setStatus('error');
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background relative">
      <WavyBackground />
      <Header />
      <main className="container py-20 relative z-10 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'verifying' && (
              <>
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-500" />
                <p>Verifying your payment...</p>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                <p className="text-xl font-semibold">Payment Successful!</p>
                <p>Your order has been placed. You can track it in your dashboard.</p>
                <Button asChild>
                  <Link to="/customer-dashboard">Go to Dashboard</Link>
                </Button>
              </>
            )}
            {status === 'error' && (
              <>
                <CheckCircle className="h-12 w-12 mx-auto text-red-500" />
                <p className="text-xl font-semibold">Payment Error</p>
                <p>{error}</p>
                <Button asChild>
                  <Link to="/customer-dashboard">Go to Cart</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
