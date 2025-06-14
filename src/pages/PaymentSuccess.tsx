
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (sessionId) {
      const fulfillOrder = async () => {
        try {
          const { error: functionError } = await supabase.functions.invoke('fulfill-order', {
            body: { session_id: sessionId },
          });

          if (functionError) {
            throw functionError;
          }

          setStatus('success');
        } catch (e: any) {
          setError(e.message || 'An unknown error occurred.');
          setStatus('error');
        }
      };

      fulfillOrder();
    } else {
      setError('No session ID found.');
      setStatus('error');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg animate-fade-in">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {status === 'loading' && 'Processing Payment...'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'error' && 'Payment Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-24">
            {status === 'loading' && <Loader2 className="h-16 w-16 animate-spin text-blue-500" />}
            {status === 'success' && <CheckCircle className="h-16 w-16 text-green-500" />}
            {status === 'error' && <XCircle className="h-16 w-16 text-red-500" />}
          </div>
          {status === 'success' && (
            <p className="text-muted-foreground mt-4">
              Thank you for your purchase! Your order is being processed. You can track your order in your dashboard.
            </p>
          )}
          {status === 'error' && (
            <p className="text-destructive mt-4">
              There was an issue with your payment. Please try again from the cart.
              <br />
              {error && <span className="text-sm font-mono p-2 bg-red-50 rounded-md block mt-2">Error: {error}</span>}
            </p>
          )}
          <Button asChild className="mt-6 w-full">
            <Link to="/customer-dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
