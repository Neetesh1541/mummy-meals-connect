import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatTile } from "@/components/dashboard/StatTile";
import {
  DashboardTabsList,
  DashboardTabsTrigger,
} from "@/components/dashboard/DashboardTabs";
import { MenuManagement } from "@/components/MenuManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, Users, DollarSign, Clock, Phone, MapPin, Truck, CreditCard, Wallet, MessageSquare } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DeliveryMap } from "@/components/DeliveryMap";
import { ChatBox } from "@/components/ChatBox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types/order";
import { getStatusClassNames } from "@/lib/status-colors";

export default function MomDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    totalRevenue: 0,
    onlineRevenue: 0,
    codRevenue: 0,
    menuItems: 0,
  });

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchStats();
      
      // Set up real-time subscription for orders
      const channel = supabase
        .channel(`mom-dashboard-orders-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `mom_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('MomDashboard: Order change received!', payload);
            fetchOrders();
            fetchStats();
            
            // Show toast for order updates
            if (payload.eventType === 'UPDATE') {
              toast({
                title: "Order Updated",
                description: "An order status has been updated.",
              });
            } else if (payload.eventType === 'INSERT') {
              toast({
                title: "New Order!",
                description: "You have received a new order.",
              });
            }
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Successfully subscribed to mom-dashboard for user ${user.id}`);
          }
          if (status === 'CHANNEL_ERROR') {
            console.error(`Subscription error for mom-dashboard user ${user.id}:`, err);
            toast({
              title: "Connection Error",
              description: "Could not connect to real-time updates. Please refresh the page.",
              variant: "destructive"
            });
          }
        });

      return () => {
        console.log('Cleaning up mom dashboard subscription');
        supabase.removeChannel(channel);
      };
    }
  }, [user, toast]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      console.log('Fetching orders for mom:', user.id);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          created_at,
          payment_method,
          quantity,
          delivery_partner_id,
          shipping_details,
          menu!orders_menu_id_fkey(title),
          customer:users!orders_customer_id_fkey(full_name, phone, address),
          delivery_partner:users!orders_delivery_partner_id_fkey(full_name, phone)
        `)
        .eq('mom_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
      
      console.log('Orders fetched successfully:', data);
      setOrders(data as Order[] || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please refresh the page.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const [ordersResponse, menuResponse] = await Promise.all([
        supabase.from('orders').select('status, total_amount, payment_method').eq('mom_id', user.id),
        supabase.from('menu').select('id', { count: 'exact' }).eq('mom_id', user.id)
      ]);
      
      const orders = ordersResponse.data || [];
      const completedOrders = orders.filter(o => o.status === 'delivered');
      
      const onlineRevenue = completedOrders
        .filter(o => o.payment_method === 'stripe')
        .reduce((sum, order) => sum + (order.total_amount || 0), 0);

      const codRevenue = completedOrders
        .filter(o => o.payment_method === 'cod')
        .reduce((sum, order) => sum + (order.total_amount || 0), 0);

      setStats({
        totalOrders: orders.length,
        activeOrders: orders.filter(order => ['placed', 'preparing', 'ready', 'picked_up'].includes(order.status ?? '')).length,
        totalRevenue: completedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
        onlineRevenue,
        codRevenue,
        menuItems: menuResponse.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [user]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!user) return;
    
    setUpdatingOrderId(orderId);
    try {
      console.log('Updating order status:', { orderId, newStatus });
      
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .eq('mom_id', user.id); // Ensure only mom can update their orders
      
      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }
      
      console.log('Order status updated successfully');
      toast({
        title: "Status Updated",
        description: `Order status successfully changed to ${newStatus.replace('_', ' ')}.`,
      });
      
      // Refresh orders to get latest data
      fetchOrders();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatAddress = (address: any) => {
    if (!address) return 'Not provided';
    const { line1, city, state, postal_code } = address;
    return [line1, city, state, postal_code].filter(Boolean).join(', ');
  };

  const renderStatusControl = (order: Order) => {
    const isUpdating = updatingOrderId === order.id;

    switch (order.status) {
      case 'placed':
        return (
          <Button 
            size="sm" 
            className="w-full mt-2" 
            onClick={() => updateOrderStatus(order.id, 'preparing')} 
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Start Preparing"}
          </Button>
        );
      case 'preparing':
        return (
          <Button 
            size="sm" 
            className="w-full mt-2" 
            onClick={() => updateOrderStatus(order.id, 'ready')} 
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Mark as Ready for Pickup"}
          </Button>
        );
      case 'ready':
        return (
          <div className="text-center mt-2">
            <Badge className={`capitalize ${getStatusClassNames(order.status).badge}`}>
              Waiting for Delivery Partner
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Order is ready and waiting to be picked up by a delivery partner
            </p>
          </div>
        );
      case 'picked_up':
        return (
          <div className="text-center mt-2">
            <Badge className={`capitalize ${getStatusClassNames(order.status).badge}`}>
              Out for Delivery
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Order is being delivered by {order.delivery_partner?.full_name || 'delivery partner'}
            </p>
          </div>
        );
      case 'delivered':
        return (
          <div className="text-center mt-2">
            <Badge className={`capitalize ${getStatusClassNames(order.status).badge}`}>
              Delivered
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Order completed successfully
            </p>
          </div>
        );
      default:
        return (
          <div className="text-center mt-2">
            <Badge className={`capitalize ${getStatusClassNames(order.status).badge}`}>
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
        );
    }
  };

  return (
    <DashboardShell
      eyebrow="Mummy Partner"
      title="Your kitchen dashboard"
      subtitle="Manage your menu, track incoming orders and watch your earnings grow — all in one place."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-fade-up">
        <StatTile
          title="Total Orders"
          value={stats.totalOrders}
          description={`${stats.activeOrders} active right now`}
          icon={<Users className="h-5 w-5" />}
          tone="primary"
        />
        <StatTile
          title="Menu Items"
          value={stats.menuItems}
          description="Dishes on your menu"
          icon={<ChefHat className="h-5 w-5" />}
          tone="secondary"
        />
        <StatTile
          title="Online Revenue"
          value={`₹${stats.onlineRevenue.toFixed(2)}`}
          description="From online payments"
          icon={<CreditCard className="h-5 w-5" />}
          tone="accent"
        />
        <StatTile
          title="COD Revenue"
          value={`₹${stats.codRevenue.toFixed(2)}`}
          description="To be collected"
          icon={<Wallet className="h-5 w-5" />}
          tone="muted"
        />

          <Tabs defaultValue="menu" className="w-full">
            <DashboardTabsList className="mb-6">
              <DashboardTabsTrigger value="menu">
                <ChefHat className="h-4 w-4" />
                Menu Management
              </DashboardTabsTrigger>
              <DashboardTabsTrigger value="orders">
                <Clock className="h-4 w-4" />
                Order Management
              </DashboardTabsTrigger>
            </DashboardTabsList>

            <TabsContent value="menu" className="animate-fade-in">
              <MenuManagement />
            </TabsContent>

            <TabsContent value="orders" className="animate-fade-in">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">Order Management</h2>

                {orders.length === 0 ? (
                  <Card className="border-dashed border-border/70 bg-card/60 backdrop-blur-sm">
                    <CardContent className="text-center py-16">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                        <Clock className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                      <p className="text-muted-foreground">Orders will appear here when customers place them</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {orders.map((order) => (
                      <Card key={order.id} className="border-border/60 bg-card/70 backdrop-blur-sm smooth-transition hover:-translate-y-1 hover:shadow-warm overflow-hidden flex flex-col">
                        <CardContent className="p-6 flex-grow flex flex-col">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">{order.menu.title}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                Quantity: {order.quantity}
                              </p>
                               <div className="flex items-center gap-2 mt-2">
                                {order.payment_method === 'cod' ? (
                                  <>
                                    <Wallet className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm text-blue-500 font-medium">Cash on Delivery</span>
                                  </>
                                ) : (
                                  <>
                                    <CreditCard className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-green-500 font-medium">Paid Online</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-2xl font-bold text-green-600">₹{order.total_amount}</p>
                            </div>
                          </div>

                          <div className="border-t pt-4 mt-4 space-y-4 text-sm flex-grow">
                             <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2"><Users className="h-4 w-4" /> Customer Details</h4>
                                <div className="pl-6 space-y-1">
                                    <p><strong>Name:</strong> {order.customer?.full_name}</p>
                                    <p className="flex items-start gap-2"><strong><Phone className="h-4 w-4 mt-0.5" />:</strong> <span>{order.customer?.phone || 'Not provided'}</span></p>
                                    <p className="flex items-start gap-2"><strong><MapPin className="h-4 w-4 mt-0.5" />:</strong> <span>{formatAddress(order.shipping_details?.address)}</span></p>
                                </div>
                            </div>

                            {order.delivery_partner && (
                                <div>
                                    <h4 className="font-semibold flex items-center gap-2 mb-2"><Truck className="h-4 w-4" /> Delivery Partner</h4>
                                    <div className="pl-6 space-y-1">
                                        <p><strong>Name:</strong> {order.delivery_partner.full_name}</p>
                                        <p className="flex items-start gap-2"><strong><Phone className="h-4 w-4 mt-0.5" />:</strong> <span>{order.delivery_partner.phone || 'Not provided'}</span></p>
                                    </div>
                                </div>
                            )}
                          </div>
                          
                          {(order.status === 'picked_up' || order.status === 'ready') && order.delivery_partner_id && (
                            <div className="mt-4">
                              <h4 className="font-semibold flex items-center gap-2 mb-2"><MapPin className="h-4 w-4" /> Delivery Location</h4>
                              <DeliveryMap deliveryPartnerId={order.delivery_partner_id} />
                            </div>
                          )}

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

                          <div className="mt-auto pt-4">
                             {renderStatusControl(order)}
                          </div>

                        </CardContent>
                        <div className={`h-1.5 w-full ${getStatusClassNames(order.status).bg}`}></div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
    </DashboardShell>
  );
}
