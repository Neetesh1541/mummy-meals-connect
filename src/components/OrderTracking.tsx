import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Truck, MapPin, Phone, User, Wallet, CreditCard, MessageSquare, Bell, BellOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { differenceInMinutes } from "date-fns";
import { DeliveryMap } from './DeliveryMap';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChatBox } from "./ChatBox";
import { Order } from "@/types/order";
import { useToast } from "@/hooks/use-toast";
import { getStatusClassNames } from "@/lib/status-colors";
import { useNotifications } from "@/hooks/useNotifications";
import { OrderStatusTimeline, ORDER_STATUS_LABELS } from "./OrderStatusTimeline";
import { LiveIndicator, LiveStatus } from "./LiveIndicator";


export function OrderTracking() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [now, setNow] = useState(new Date());
  const [liveStatus, setLiveStatus] = useState<LiveStatus>("connecting");
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const prevStatuses = useRef<Record<string, string>>({});
  const { toast } = useToast();
  const { 
    permission: notificationPermission, 
    requestPermission, 
    notifyOrderUpdate, 
    notifyDeliveryPartnerAssigned 
  } = useNotifications();

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000);

    return () => clearInterval(timer);
  }, []);


  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      console.log('OrderTracking: Fetching orders for customer:', user.id);
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
          shipping_details,
          menu!orders_menu_id_fkey(title, price),
          mom:users!orders_mom_id_fkey(full_name, phone, address),
          delivery_partner:users!orders_delivery_partner_id_fkey(full_name, phone)
        `)
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
      
      const next = (data as Order[]) || [];

      // Diff statuses so notifications fire whether the update arrived via
      // realtime or via the polling fallback.
      const seen = prevStatuses.current;
      if (Object.keys(seen).length > 0) {
        next.forEach((order) => {
          const before = seen[order.id];
          if (before && before !== order.status) {
            toast({
              title: "Order update",
              description: `${order.menu?.title ?? "Your order"} · ${
                ORDER_STATUS_LABELS[order.status] ?? order.status
              }`,
            });
            notifyOrderUpdate(order.status);
          }
        });
      }
      prevStatuses.current = Object.fromEntries(next.map((o) => [o.id, o.status]));

      setOrders(next);
      setLastSync(new Date());
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, toast, notifyOrderUpdate]);

  useEffect(() => {
    if (!user) return;

    fetchOrders();

    let pollTimer: ReturnType<typeof setInterval> | null = null;
    const startPolling = () => {
      if (pollTimer) return;
      setLiveStatus("polling");
      pollTimer = setInterval(fetchOrders, 15000);
    };
    const stopPolling = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    // If realtime hasn't connected within 6s, fall back to polling.
    const fallbackTimer = setTimeout(startPolling, 6000);

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
        (payload) => {
          const newData = payload.new as any;
          const oldData = payload.old as any;
          if (payload.eventType === 'UPDATE' && newData && oldData) {
            if (!oldData.delivery_partner_id && newData.delivery_partner_id) {
              toast({
                title: "Delivery partner assigned",
                description: "Someone is on the way to pick up your order.",
              });
              notifyDeliveryPartnerAssigned();
            }
          }
          fetchOrders();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          clearTimeout(fallbackTimer);
          stopPolling();
          setLiveStatus("live");
          fetchOrders();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          startPolling();
        }
      });

    // Refresh whenever the tab regains focus.
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchOrders();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearTimeout(fallbackTimer);
      stopPolling();
      document.removeEventListener('visibilitychange', onVisible);
      supabase.removeChannel(channel);
    };
  }, [user, fetchOrders, toast, notifyDeliveryPartnerAssigned]);

  const syncedAgo = lastSync
    ? (() => {
        const s = Math.max(0, Math.round((now.getTime() - lastSync.getTime()) / 1000));
        return s < 60 ? `updated ${s}s ago` : `updated ${Math.round(s / 60)}m ago`;
      })()
    : undefined;


  const getStatusIcon = (status: string) => {
    const iconColor = getStatusClassNames(status).text;
    switch (status) {
      case 'placed':
        return <Clock className={`h-4 w-4 ${iconColor}`} />;
      case 'preparing':
        return <Clock className={`h-4 w-4 ${iconColor}`} />;
      case 'ready':
        return <CheckCircle className={`h-4 w-4 ${iconColor}`} />;
      case 'picked_up':
        return <Truck className={`h-4 w-4 ${iconColor}`} />;
      case 'delivered':
        return <CheckCircle className={`h-4 w-4 ${iconColor}`} />;
      default:
        return <Clock className="h-4 w-4" />;
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
      {/* Header with notification toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Order Tracking</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={requestPermission}
          className={`gap-2 rounded-xl ${notificationPermission === 'granted' ? 'text-green-600 border-green-200 bg-green-50' : ''}`}
        >
          {notificationPermission === 'granted' ? (
            <>
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications On</span>
            </>
          ) : (
            <>
              <BellOff className="h-4 w-4" />
              <span className="hidden sm:inline">Enable Notifications</span>
            </>
          )}
        </Button>
      </div>
      
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
                      From {order.mom?.full_name} • Quantity: {order.quantity}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <Badge className={`flex items-center gap-1 capitalize ${getStatusClassNames(order.status).badge}`}>
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
                      <span className="font-semibold">Chef: {order.mom?.full_name}</span>
                      <div className="ml-auto flex items-center gap-2">
                        {order.mom?.phone ? (
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
                        <span>{formatAddress(order.mom?.address)}</span>
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
