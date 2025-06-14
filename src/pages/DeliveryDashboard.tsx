import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Clock, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/useGeolocation";

interface AvailableOrder {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  menu: {
    title: string;
  };
  customer: {
    full_name: string;
  };
  mom: {
    full_name: string;
  };
}

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [availableOrders, setAvailableOrders] = useState<AvailableOrder[]>([]);
  const [myOrders, setMyOrders] = useState<AvailableOrder[]>([]);
  const { position, error: geoError, startWatching, stopWatching } = useGeolocation();
  const [isTracking, setIsTracking] = useState(false);

  const [stats, setStats] = useState({
    totalDeliveries: 0,
    activeDeliveries: 0,
    todayEarnings: 850,
    rating: 4.8,
  });

  useEffect(() => {
    if (user) {
      fetchOrders();
      const channel = subscribeToOrderChanges();
      return () => {
        supabase.removeChannel(channel);
      }
    }
  }, [user]);

  useEffect(() => {
    const activeDeliveries = myOrders.some(o => o.status === 'picked_up');
    if (activeDeliveries && !isTracking) {
      startWatching();
      setIsTracking(true);
    } else if (!activeDeliveries && isTracking) {
      stopWatching();
      setIsTracking(false);
    }
  }, [myOrders, isTracking, startWatching, stopWatching]);

  useEffect(() => {
    if (position && user && isTracking) {
      const updateLocation = async () => {
        await supabase
          .from('delivery_partner_locations')
          .upsert({
            partner_id: user.id,
            latitude: position.latitude,
            longitude: position.longitude,
            updated_at: new Date().toISOString()
          }, { onConflict: 'partner_id' });
      };
      updateLocation();
    }
  }, [position, user, isTracking]);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      // Fetch available orders (ready status, no delivery partner assigned)
      const { data: available, error: availableError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          created_at,
          menu!orders_menu_id_fkey(title),
          customer:users!orders_customer_id_fkey(full_name),
          mom:users!orders_mom_id_fkey(full_name)
        `)
        .eq('status', 'ready')
        .is('delivery_partner_id', null);
      
      if (availableError) throw availableError;
      setAvailableOrders(available || []);

      // Fetch my assigned orders
      const { data: assigned, error: assignedError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          created_at,
          menu!orders_menu_id_fkey(title),
          customer:users!orders_customer_id_fkey(full_name),
          mom:users!orders_mom_id_fkey(full_name)
        `)
        .eq('delivery_partner_id', user?.id)
        .in('status', ['picked_up', 'delivered']);
      
      if (assignedError) throw assignedError;
      setMyOrders(assigned || []);

      // Update stats
      setStats(prev => ({
        ...prev,
        totalDeliveries: (assigned || []).filter(o => o.status === 'delivered').length,
        activeDeliveries: (assigned || []).filter(o => o.status === 'picked_up').length,
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const subscribeToOrderChanges = () => {
    const channel = supabase
      .channel('delivery-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const acceptOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          delivery_partner_id: user?.id,
          status: 'picked_up'
        })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast({
        title: "Order accepted!",
        description: "You've been assigned this delivery",
      });
    } catch (error) {
      console.error('Error accepting order:', error);
      toast({
        title: "Error",
        description: "Failed to accept order",
        variant: "destructive",
      });
    }
  };

  const completeDelivery = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast({
        title: "Delivery completed!",
        description: "Great job! The order has been delivered",
      });
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast({
        title: "Error",
        description: "Failed to complete delivery",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative animated-soft-gradient">
      <Header />
      <main className="container py-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-warm-orange-500 to-pastel-green-500 bg-clip-text text-transparent">
              Delivery Partner Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Delivering happiness, one meal at a time
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 animate-fade-in">
            <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-blue-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Truck className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDeliveries}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-orange-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
                 <div className="p-2 bg-orange-100 rounded-full">
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeDeliveries}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-green-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
                <div className="p-2 bg-green-100 rounded-full">
                  <DollarSign className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.todayEarnings}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-purple-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <div className="p-2 bg-purple-100 rounded-full">
                  <MapPin className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rating}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="animate-fade-in hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle>Available Deliveries</CardTitle>
                <CardDescription>Orders ready for pickup</CardDescription>
              </CardHeader>
              <CardContent>
                {availableOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No deliveries available</h3>
                    <p className="text-gray-600">Check back soon for new opportunities</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{order.menu.title}</h4>
                            <p className="text-sm text-gray-600">From: {order.mom.full_name}</p>
                            <p className="text-sm text-gray-600">To: {order.customer.full_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">₹{order.total_amount}</p>
                            <Badge variant="default">Ready</Badge>
                          </div>
                        </div>
                        <Button
                          onClick={() => acceptOrder(order.id)}
                          className="w-full mt-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        >
                          Accept Delivery
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="animate-fade-in hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle>My Deliveries</CardTitle>
                <CardDescription>Your assigned deliveries</CardDescription>
              </CardHeader>
              <CardContent>
                {myOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No active deliveries</h3>
                    <p className="text-gray-600">Accept orders from the available list</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{order.menu.title}</h4>
                            <p className="text-sm text-gray-600">Customer: {order.customer.full_name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">₹{order.total_amount}</p>
                            <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                              {order.status === 'picked_up' ? 'Out for Delivery' : 'Delivered'}
                            </Badge>
                          </div>
                        </div>
                        {order.status === 'picked_up' && (
                          <Button
                            onClick={() => completeDelivery(order.id)}
                            className="w-full mt-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                          >
                            Mark as Delivered
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {geoError && (
             <Card className="animate-fade-in bg-destructive/10 border-destructive/50">
               <CardHeader>
                  <CardTitle className="text-destructive">Location Error</CardTitle>
                  <CardDescription className="text-destructive-foreground">{geoError}</CardDescription>
               </CardHeader>
             </Card>
          )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
