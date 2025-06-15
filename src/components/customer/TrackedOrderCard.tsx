
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import type { OrderWithDetails } from './CustomerOrderTracking';
import DeliveryMap from '@/components/DeliveryMap';
import { Loader2, Package, Truck, Home, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface TrackedOrderCardProps {
  order: OrderWithDetails;
}

interface Location {
  latitude: number;
  longitude: number;
}

const statusMap: { [key: string]: { text: string; icon: React.ReactNode; color: string } } = {
    placed: { text: "Placed", icon: <Package className="h-4 w-4" />, color: "bg-blue-500" },
    preparing: { text: "Preparing", icon: <Loader2 className="h-4 w-4 animate-spin" />, color: "bg-yellow-500" },
    ready: { text: "Ready for Pickup", icon: <Package className="h-4 w-4" />, color: "bg-orange-500" },
    picked_up: { text: "On the way", icon: <Truck className="h-4 w-4" />, color: "bg-teal-500" },
    delivered: { text: "Delivered", icon: <CheckCircle className="h-4 w-4" />, color: "bg-green-500" },
    cancelled: { text: "Cancelled", icon: <Home className="h-4 w-4" />, color: "bg-red-500" },
};

export function TrackedOrderCard({ order }: TrackedOrderCardProps) {
  const [location, setLocation] = useState<Location | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const statusInfo = statusMap[order.status] || statusMap.placed;

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const fetchLocation = async () => {
      if (order.status === 'picked_up' && order.delivery_partner_id) {
        setLoadingLocation(true);
        try {
          const { data, error } = await supabase
            .from('delivery_partner_locations')
            .select('latitude, longitude')
            .eq('partner_id', order.delivery_partner_id)
            .maybeSingle();
          
          if (error) throw error;
          if (data) {
            setLocation(data as Location);
          }

          channel = supabase
            .channel(`delivery-location-${order.id}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'delivery_partner_locations',
                filter: `partner_id=eq.${order.delivery_partner_id}`,
              },
              (payload) => {
                const newLocation = payload.new as Location;
                setLocation(newLocation);
              }
            )
            .subscribe();

        } catch (error) {
          console.error("Error fetching delivery partner location:", error);
        } finally {
          setLoadingLocation(false);
        }
      }
    };

    fetchLocation();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [order.status, order.delivery_partner_id, order.id]);

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        {order.menu?.image_url && (
            <img src={order.menu.image_url} alt={order.menu.title} className="w-1/3 h-auto object-cover" />
        )}
        <div className="w-2/3">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle>{order.menu?.title || 'Order'}</CardTitle>
                    <Badge variant="secondary" className="whitespace-nowrap">
                        From {order.mom?.full_name || 'Mom'}
                    </Badge>
                </div>
                <CardDescription>
                Order placed on {format(new Date(order.created_at), 'PPP')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 mb-4 p-2 rounded-md bg-muted">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white ${statusInfo.color}`}>
                        {statusInfo.icon}
                    </div>
                    <span className="font-semibold">{statusInfo.text}</span>
                </div>

                <div className="text-sm space-y-1">
                    <p><strong>Quantity:</strong> {order.quantity}</p>
                    <p><strong>Total:</strong> ₹{order.total_amount.toFixed(2)}</p>
                    {order.delivery_partner?.full_name && <p><strong>Driver:</strong> {order.delivery_partner.full_name}</p>}
                </div>
            </CardContent>
        </div>
      </div>
      {order.status === 'picked_up' && (
        <div className="p-4 border-t">
          <h4 className="font-semibold mb-2">Live Tracking</h4>
          {loadingLocation ? (
            <div className="h-48 flex items-center justify-center bg-muted rounded-md">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : location ? (
            <div className="h-48 rounded-md overflow-hidden">
              <DeliveryMap deliveryPersonPosition={[location.latitude, location.longitude]} />
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center bg-muted rounded-md">
                <p className="text-muted-foreground">Waiting for driver's location...</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
