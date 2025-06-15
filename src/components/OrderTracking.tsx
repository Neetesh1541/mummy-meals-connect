
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Truck, MapPin, Phone, User, Wallet, CreditCard, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { differenceInMinutes } from "date-fns";
import { DeliveryMap } from './DeliveryMap';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChatBox } from "./ChatBox";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  quantity: number;
  created_at: string;
  payment_method: string;
  estimated_delivery_at: string | null;
  menu: {
    title: string;
    price: number;
  };
  mom: {
    full_name: string;
    phone?: string;
    address?: any;
  };
  delivery_partner?: {
    full_name: string;
    phone?: string;
  };
  delivery_partner_id?: string;
}

export function OrderTracking() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000); // update every minute

    return () => clearInterval(timer);
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          quantity,
          created_at,
          estimated_delivery_at,
          delivery_partner_id,
          payment_method,
          menu!orders_menu_id_fkey(title, price),
          mom:users!orders_mom_id_fkey(full_name, phone, address),
          delivery_partner:users!orders_delivery_partner_id_fkey(full_name, phone)
        `)
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchOrders();
      const channel = supabase
        .channel(`order-tracking-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `customer_id=eq.${user.id}`,
          },
          () => {
            console.log('OrderTracking: Change received on orders table!');
            fetchOrders();
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Successfully subscribed to order tracking for user ${user.id}`);
          }
          if (status === 'CHANNEL_ERROR') {
            console.error(`Subscription error for order tracking for user ${user.id}:`, err);
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchOrders]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'placed':
        return <Clock className="h-4 w-4" />;
      case 'preparing':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'picked_up':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed':
        return 'default';
      case 'preparing':
        return 'secondary';
      case 'ready':
        return 'default';
      case 'picked_up':
        return 'secondary';
      case 'delivered':
        return 'default';
      default:
        return 'default';
    }
  };

  const renderTimeRemaining = (order: Order) => {
    if (order.status !== 'picked_up' || !order.estimated_delivery_at) {
      return null;
    }

    const estimatedDate = new Date(order.estimated_delivery_at);
    const minutesRemaining = differenceInMinutes(estimatedDate, now);

    if (minutesRemaining < 1) {
      return <span className="text-sm text-orange-500 font-semibold">Arriving soon</span>;
    }

    return (
      <span className="text-sm text-blue-600 font-semibold">
        ~{minutesRemaining} min remaining
      </span>
    );
  };

  const formatAddress = (address: any) => {
    if (!address) return 'Not provided';
    const { line1, city, state, postal_code } = address;
    return [line1, city, state, postal_code].filter(Boolean).join(', ');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Order Tracking</h2>
      
      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-gray-600">Place your first order to start tracking!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="animate-fade-in">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.menu.title}</CardTitle>
                    <CardDescription>
                      From {order.mom.full_name} • Quantity: {order.quantity}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <Badge variant={getStatusColor(order.status)} className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                    </Badge>
                    {renderTimeRemaining(order)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-green-600">
                    ₹{order.total_amount}
                  </span>
                   <div className="flex items-center gap-2">
                     {order.payment_method === 'cod' ? (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                            <Wallet className="h-4 w-4 mr-1" />
                            Cash on Delivery
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                            <CreditCard className="h-4 w-4 mr-1" />
                            Paid Online
                        </Badge>
                    )}
                    <span className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                    </span>
                   </div>
                </div>
                
                <div className="space-y-4 text-sm text-gray-600 border-t pt-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold">Chef: {order.mom.full_name}</span>
                      <div className="ml-auto flex items-center gap-2">
                        {order.mom.phone ? (
                          <>
                            <span className="text-muted-foreground">{order.mom.phone}</span>
                            <a href={`tel:${order.mom.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                              <Phone className="h-3 w-3" />
                              <span>Call</span>
                            </a>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Not provided</span>
                        )}
                      </div>
                    </div>
                     <div className="flex items-start gap-2 pl-6">
                        <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                        <span>{formatAddress(order.mom.address)}</span>
                    </div>
                  </div>

                  {order.delivery_partner && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold">Delivery: {order.delivery_partner.full_name}</span>
                        <div className="ml-auto flex items-center gap-2">
                          {order.delivery_partner.phone ? (
                            <>
                              <span className="text-muted-foreground">{order.delivery_partner.phone}</span>
                              <a href={`tel:${order.delivery_partner.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                                <Phone className="h-3 w-3" />
                                <span>Call</span>
                              </a>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Not provided</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {order.status === 'picked_up' && order.delivery_partner_id && (
                    <div className="mt-2 pl-6">
                       <DeliveryMap deliveryPartnerId={order.delivery_partner_id} />
                    </div>
                  )}
                </div>
                
                <Collapsible className="mt-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Chat about this order</span>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <ChatBox orderId={order.id} />
                  </CollapsibleContent>
                </Collapsible>
                
                <div className="mt-4 flex space-x-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`flex-1 ${['placed', 'preparing', 'ready', 'picked_up', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-200'}`} />
                  <div className={`flex-1 ${['preparing', 'ready', 'picked_up', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-200'}`} />
                  <div className={`flex-1 ${['ready', 'picked_up', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-200'}`} />
                  <div className={`flex-1 ${['picked_up', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-200'}`} />
                  <div className={`flex-1 ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-200'}`} />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Placed</span>
                  <span>Preparing</span>
                  <span>Ready</span>
                  <span>Out for delivery</span>
                  <span>Delivered</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
