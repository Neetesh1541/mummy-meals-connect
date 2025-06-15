
import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Clock, User, Phone, MapPin, Truck } from "lucide-react";
import { WavyBackground } from "@/components/WavyBackground";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatBox } from "@/components/ChatBox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MessageSquare } from "lucide-react";

interface Order {
  id: string;
  status: string;
  menu: {
    title: string;
  };
  quantity: number;
  shipping_details: any;
  customer: {
    full_name: string;
    phone: string;
  };
  mom: {
    full_name: string;
    phone: string;
    address: any;
  };
}

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: available, error: availableError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          menu (title),
          quantity,
          shipping_details,
          customer:users!orders_customer_id_fkey (full_name, phone),
          mom:users!orders_mom_id_fkey (full_name, phone, address)
        `)
        .eq('status', 'ready')
        .is('delivery_partner_id', null);

      if (availableError) throw availableError;
      setAvailableOrders(available || []);

      const { data: mine, error: mineError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          menu (title),
          quantity,
          shipping_details,
          customer:users!orders_customer_id_fkey (full_name, phone),
          mom:users!orders_mom_id_fkey (full_name, phone, address)
        `)
        .eq('delivery_partner_id', user.id);

      if (mineError) throw mineError;
      setMyOrders(mine || []);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch orders.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchOrders();
      const channel = supabase
        .channel('delivery-dashboard-orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            console.log('DeliveryDashboard: Change received!', payload)
            fetchOrders();
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Successfully subscribed to orders for Delivery Dashboard`);
          }
           if (status === 'CHANNEL_ERROR') {
            console.error(`Subscription error for Delivery Dashboard:`, err);
          }
        });

      return () => {
        supabase.removeChannel(channel);
      }
    }
  }, [user, fetchOrders]);

  const acceptOrder = async (orderId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('orders')
        .update({ delivery_partner_id: user.id, status: 'picked_up' })
        .eq('id', orderId);

      if (error) throw error;
      toast({
        title: "Order Accepted",
        description: "You have accepted the order.",
      });
      fetchOrders(); // Manually trigger a refresh
    } catch (error: any) {
      console.error("Error accepting order:", error);
      toast({
        title: "Error Accepting Order",
        description: error.message || "Failed to accept the order.",
        variant: "destructive"
      });
    }
  };

  const completeOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', orderId);

      if (error) throw error;
      toast({
        title: "Order Completed",
        description: "You have completed the order.",
      });
      fetchOrders(); // Manually trigger a refresh
    } catch (error: any) {
      console.error("Error completing order:", error);
      toast({
        title: "Error Completing Order",
        description: error.message || "Failed to complete the order.",
        variant: "destructive"
      });
    }
  };

  const formatAddress = (address: any) => {
    if (!address) return 'Not provided';
    const { line1, city, state, postal_code } = address;
    return [line1, city, state, postal_code].filter(Boolean).join(', ');
  };

  if (loading) {
    return <div className="text-center py-8">Loading deliveries...</div>;
  }

  return (
    <div className="min-h-screen bg-background relative">
      <WavyBackground />
      <Header />
      <main className="container py-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-warm-orange-500 to-pastel-green-500 bg-clip-text text-transparent animate-fade-in">
              Deliver and Earn!
            </h1>
            <p className="text-muted-foreground mt-2 animate-fade-in">
              Accept deliveries and make customers happy
            </p>
          </div>

          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="available">Available Deliveries</TabsTrigger>
              <TabsTrigger value="mine">My Deliveries</TabsTrigger>
            </TabsList>
            <TabsContent value="available" className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-4">Available Deliveries</h2>
              {availableOrders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No deliveries available</h3>
                    <p className="text-gray-600">Check back later for new opportunities!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {availableOrders.map((order) => (
                    <Card key={order.id} className="animate-fade-in">
                      <CardHeader>
                        <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center text-sm">
                          <div className="font-semibold">{order.menu.title}</div>
                          <div>Qty: {order.quantity}</div>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          To be delivered to {order.shipping_details.name}
                        </div>
                        <div className="border-t pt-2 mt-2 space-y-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-semibold">Customer: {order.customer.full_name}</span>
                              <a href={`tel:${order.customer.phone}`} className="ml-auto flex items-center gap-1 text-blue-600 hover:underline">
                                <Phone className="h-3 w-3" />
                                <span>Call</span>
                              </a>
                            </div>
                            <div className="flex items-start gap-2 pl-6">
                              <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                              <span className="text-xs">{formatAddress(order.shipping_details.address)}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-semibold">Chef: {order.mom.full_name}</span>
                              <a href={`tel:${order.mom.phone}`} className="ml-auto flex items-center gap-1 text-blue-600 hover:underline">
                                <Phone className="h-3 w-3" />
                                <span>Call</span>
                              </a>
                            </div>
                            <div className="flex items-start gap-2 pl-6">
                              <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                              <span className="text-xs">{formatAddress(order.mom.address)}</span>
                            </div>
                          </div>
                        </div>
                        <Button className="w-full mt-4" onClick={() => acceptOrder(order.id)}>
                          Accept Delivery
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="mine" className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-4">My Deliveries</h2>
              {myOrders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No deliveries accepted yet</h3>
                    <p className="text-gray-600">Accept an order to see it here!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {myOrders.map((order) => (
                    <Card key={order.id} className="animate-fade-in">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
                          <Badge variant={order.status === 'picked_up' ? 'secondary' : 'default'}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center text-sm">
                          <div className="font-semibold">{order.menu.title}</div>
                          <div>Qty: {order.quantity}</div>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          To be delivered to {order.shipping_details.name}
                        </div>
                        <div className="border-t pt-2 mt-2 space-y-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-semibold">Customer: {order.customer.full_name}</span>
                              <a href={`tel:${order.customer.phone}`} className="ml-auto flex items-center gap-1 text-blue-600 hover:underline">
                                <Phone className="h-3 w-3" />
                                <span>Call</span>
                              </a>
                            </div>
                            <div className="flex items-start gap-2 pl-6">
                              <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                              <span className="text-xs">{formatAddress(order.shipping_details.address)}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-semibold">Chef: {order.mom.full_name}</span>
                              <a href={`tel:${order.mom.phone}`} className="ml-auto flex items-center gap-1 text-blue-600 hover:underline">
                                <Phone className="h-3 w-3" />
                                <span>Call</span>
                              </a>
                            </div>
                            <div className="flex items-start gap-2 pl-6">
                              <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                              <span className="text-xs">{formatAddress(order.mom.address)}</span>
                            </div>
                          </div>
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

                        {order.status === 'picked_up' && (
                          <Button className="w-full mt-4" onClick={() => completeOrder(order.id)}>
                            Mark as Delivered
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
