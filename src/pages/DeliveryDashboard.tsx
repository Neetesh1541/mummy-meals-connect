
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

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

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
      
      const statusOrder: { [key: string]: number } = { 'picked_up': 1, 'delivered': 2 };
      const sortedMine = (mine || []).sort((a, b) => {
        const aVal = statusOrder[a.status] || 99;
        const bVal = statusOrder[b.status] || 99;
        return aVal - bVal;
      });
      setMyOrders(sortedMine);

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
    setUpdatingOrder(orderId);
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
    } finally {
      setUpdatingOrder(null);
    }
  };

  const completeOrder = async (orderId: string) => {
    setUpdatingOrder(orderId);
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
