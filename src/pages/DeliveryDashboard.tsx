import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { WavyBackground } from "@/components/WavyBackground";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Order } from "@/types/order";
import { AvailableDeliveriesTab } from "@/components/delivery/AvailableDeliveriesTab";
import { MyDeliveriesTab } from "@/components/delivery/MyDeliveriesTab";
import { StatCard } from "@/components/delivery/StatCard";
import { DollarSign, Truck } from "lucide-react";
import { LocationSharer } from "@/components/delivery/LocationSharer";

type DeliveryOrderResponse = {
  success: boolean;
  error?: string;
  order_id?: string;
};

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalEarnings: 0, completedDeliveries: 0 });

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    console.log("DeliveryDashboard: Fetching orders for user:", user.id);
    setLoading(true);
    try {
      // Fetch available orders (ready for pickup, no delivery partner assigned)
      const { data: available, error: availableError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          created_at,
          quantity,
          delivery_fee,
          shipping_details,
          menu (title),
          customer:users!orders_customer_id_fkey (full_name, phone),
          mom:users!orders_mom_id_fkey (full_name, phone, address)
        `)
        .eq('status', 'ready')
        .is('delivery_partner_id', null)
        .order('created_at', { ascending: true });

      if (availableError) {
        console.error('Error fetching available orders:', availableError);
        throw availableError;
      }
      
      console.log('Available orders fetched:', available?.length || 0);
      setAvailableOrders(available || []);

      // Fetch my orders (assigned to this delivery partner)
      const { data: mine, error: mineError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          created_at,
          quantity,
          delivery_fee,
          shipping_details,
          menu (title),
          customer:users!orders_customer_id_fkey (full_name, phone),
          mom:users!orders_mom_id_fkey (full_name, phone, address)
        `)
        .eq('delivery_partner_id', user.id)
        .order('created_at', { ascending: false });

      if (mineError) {
        console.error('Error fetching my orders:', mineError);
        throw mineError;
      }
      
      // Sort orders: picked_up first, then delivered
      const statusOrder: { [key: string]: number } = { 'picked_up': 1, 'delivered': 2 };
      const sortedMine = (mine || []).sort((a, b) => {
        const aVal = statusOrder[a.status] || 99;
        const bVal = statusOrder[b.status] || 99;
        if (aVal !== bVal) {
          return aVal - bVal;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      console.log('My orders fetched:', sortedMine?.length || 0);
      setMyOrders(sortedMine);

      // Calculate stats
      const completed = mine?.filter(o => o.status === 'delivered') || [];
      const earnings = completed.reduce((acc, order) => acc + (order.delivery_fee || 0), 0);
      setStats({
        totalEarnings: earnings,
        completedDeliveries: completed.length
      });

    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchOrders();
      
      // Subscribe to all orders changes for real-time updates
      const channel = supabase
        .channel(`delivery-dashboard-${user.id}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'orders'
          },
          (payload) => {
            console.log('DeliveryDashboard: Order change detected:', payload);
            
            // Show toast for relevant updates
            if (payload.eventType === 'UPDATE') {
              const newData = payload.new as any;
              const oldData = payload.old as any;
              
              // If order becomes ready and available
              if (newData.status === 'ready' && !newData.delivery_partner_id && oldData.status !== 'ready') {
                toast({
                  title: "New Delivery Available!",
                  description: "A new order is ready for pickup.",
                });
              }
              
              // If order gets assigned to someone else
              if (oldData.status === 'ready' && newData.status === 'picked_up' && newData.delivery_partner_id !== user.id) {
                toast({
                  title: "Order Taken",
                  description: "An available order was picked up by another delivery partner.",
                });
              }
            }
            
            fetchOrders();
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to delivery orders changes');
          }
          if (status === 'CHANNEL_ERROR') {
            console.error('Delivery orders subscription error:', err);
            toast({
              title: "Connection Error",
              description: "Could not connect to real-time updates. Please refresh the page.",
              variant: "destructive"
            });
          }
        });

      return () => {
        console.log('Cleaning up delivery orders subscription');
        supabase.removeChannel(channel);
      }
    }
  }, [user, fetchOrders, toast]);

  const acceptOrder = async (orderId: string) => {
    if (!user) return;
    setUpdatingOrder(orderId);
    try {
      console.log('Accepting order:', orderId);
      
      // Use direct update instead of RPC for better error handling
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          delivery_partner_id: user.id,
          status: 'picked_up'
        })
        .eq('id', orderId)
        .eq('status', 'ready')
        .is('delivery_partner_id', null)
        .select()
        .single();

      if (error) {
        console.error('Error accepting order:', error);
        if (error.code === 'PGRST116') {
          toast({
            title: "Order No Longer Available",
            description: "This order was already accepted by another delivery partner.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      console.log('Order accepted successfully:', data);
      toast({
        title: "Order Accepted",
        description: "You have accepted the order. It's now in your deliveries.",
      });
      
      // Refresh orders immediately
      fetchOrders();
    } catch (error: any) {
      console.error("Error accepting order:", error);
      toast({
        title: "Error Accepting Order",
        description: error.message || "Failed to accept the order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdatingOrder(null);
    }
  };

  const completeOrder = async (orderId: string) => {
    if (!user) return;
    setUpdatingOrder(orderId);
    try {
      console.log('Completing order:', orderId);
      
      const { data, error } = await supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', orderId)
        .eq('delivery_partner_id', user.id)
        .eq('status', 'picked_up')
        .select()
        .single();

      if (error) {
        console.error('Error completing order:', error);
        if (error.code === 'PGRST116') {
          toast({
            title: "Order Cannot Be Completed",
            description: "This order is not available for completion.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      console.log('Order completed successfully:', data);
      toast({
        title: "Order Completed",
        description: "You have successfully delivered the order!",
      });
      
      // Refresh orders immediately
      fetchOrders();
    } catch (error: any) {
      console.error("Error completing order:", error);
      toast({
        title: "Error Completing Order",
        description: error.message || "Failed to complete the order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdatingOrder(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative">
        <WavyBackground />
        <Header />
        <main className="container py-8 relative z-10">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading deliveries...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
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

          <div className="grid md:grid-cols-2 gap-6 mb-8 animate-fade-in">
            <StatCard 
              title="Total Earnings"
              value={`₹${stats.totalEarnings.toFixed(2)}`}
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              description="From completed deliveries"
            />
            <StatCard 
              title="Completed Deliveries"
              value={stats.completedDeliveries}
              icon={<Truck className="h-4 w-4 text-muted-foreground" />}
              description="Making customers happy"
            />
          </div>

          <div className="mb-8 animate-fade-in">
            <LocationSharer />
          </div>

          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="available">
                Available Deliveries ({availableOrders.length})
              </TabsTrigger>
              <TabsTrigger value="mine">
                My Deliveries ({myOrders.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="available">
              <AvailableDeliveriesTab
                orders={availableOrders}
                onAccept={acceptOrder}
                updatingOrderId={updatingOrder}
              />
            </TabsContent>
            <TabsContent value="mine">
              <MyDeliveriesTab
                orders={myOrders}
                onComplete={completeOrder}
                updatingOrderId={updatingOrder}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
