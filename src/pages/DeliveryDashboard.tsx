
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
    setLoading(true);
    try {
      const { data: available, error: availableError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          created_at,
          quantity,
          delivery_fee,
          menu (title),
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
          created_at,
          quantity,
          delivery_fee,
          menu (title),
          shipping_details,
          customer:users!orders_customer_id_fkey (full_name, phone),
          mom:users!orders_mom_id_fkey (full_name, phone, address)
        `)
        .eq('delivery_partner_id', user.id);

      if (mineError) throw mineError;
      
      const statusOrder: { [key: string]: number } = { 'picked_up': 1, 'delivered': 2 };
      const sortedMine = (mine || []).sort((a, b) => {
        const aVal = statusOrder[a.status] || 99;
        const bVal = statusOrder[b.status] || 99;
        if (aVal !== bVal) {
          return aVal - bVal;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setMyOrders(sortedMine);

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
        .channel('orders-delivery-realtime') // Use a new channel name to ensure a fresh subscription
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            console.log('DeliveryDashboard: Change received on orders table!', payload);
            console.log('Refetching all orders to update UI.');
            fetchOrders();
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Successfully subscribed to 'orders' table for Delivery Dashboard`);
          }
           if (status === 'CHANNEL_ERROR') {
            console.error(`Subscription error on 'orders' for Delivery Dashboard:`, err);
          }
        });

      return () => {
        console.log("Cleaning up orders subscription for Delivery Dashboard.");
        supabase.removeChannel(channel);
      }
    }
  }, [user, fetchOrders]);

  const acceptOrder = async (orderId: string) => {
    if (!user) return;
    setUpdatingOrder(orderId);
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ delivery_partner_id: user.id, status: 'picked_up' })
        .eq('id', orderId)
        .eq('status', 'ready')
        .is('delivery_partner_id', null)
        .select();

      if (error) {
        // Handle postgres-level errors, e.g. from the trigger
        throw error;
      }
      
      if (!data || data.length === 0) {
        // This is our race condition. The order is no longer available.
        const raceConditionError = new Error("This order is no longer available. It may have been accepted by another driver.");
        raceConditionError.name = "RaceConditionError";
        throw raceConditionError;
      }

      toast({
        title: "Order Accepted",
        description: "You have accepted the order. It's now in your deliveries.",
      });
      fetchOrders(); // Manually trigger a refresh
    } catch (error: any) {
      console.error("Error accepting order:", error);
      
      // If it was our race condition, we refresh the list.
      if (error.name === "RaceConditionError") {
        fetchOrders(); // Refresh the list to remove the stale order
      }

      toast({
        title: "Error Accepting Order",
        description: error.message || "Failed to accept the order.",
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
      const { data, error } = await supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', orderId)
        .eq('delivery_partner_id', user.id)
        .eq('status', 'picked_up')
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        const raceConditionError = new Error("Could not complete this order. Its status may have changed.");
        raceConditionError.name = "RaceConditionError";
        throw raceConditionError;
      }

      toast({
        title: "Order Completed",
        description: "You have completed the order.",
      });
      fetchOrders(); // Manually trigger a refresh
    } catch (error: any) {
      console.error("Error completing order:", error);

      if (error.name === "RaceConditionError") {
        fetchOrders();
      }
      
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

          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="available">Available Deliveries</TabsTrigger>
              <TabsTrigger value="mine">My Deliveries</TabsTrigger>
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
