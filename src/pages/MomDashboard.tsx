import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MenuManagement } from "@/components/MenuManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, Users, DollarSign, Clock, Phone, MapPin, Truck, CreditCard, Wallet, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DeliveryMap } from "@/components/DeliveryMap";
import { ChatBox } from "@/components/ChatBox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  payment_method: string;
  delivery_partner_id?: string;
  menu: {
    title: string;
  };
  customer: {
    full_name: string;
    phone?: string;
    address?: any;
  };
  delivery_partner?: {
    full_name: string;
    phone?: string;
  };
}

const getStatusColorForMom = (status: string) => {
  switch (status) {
    case 'placed': return 'bg-yellow-400';
    case 'preparing': return 'bg-orange-400';
    case 'ready': return 'bg-blue-400';
    case 'picked_up': return 'bg-indigo-400';
    case 'delivered': return 'bg-green-500';
    default: return 'bg-gray-300';
  }
};

export default function MomDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
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
      const channel = subscribeToOrderChanges();

      return () => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          created_at,
          payment_method,
          delivery_partner_id,
          menu!orders_menu_id_fkey(title),
          customer:users!orders_customer_id_fkey(full_name, phone, address),
          delivery_partner:users!orders_delivery_partner_id_fkey(full_name, phone)
        `)
        .eq('mom_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    try {
      const [ordersResponse, menuResponse] = await Promise.all([
        supabase.from('orders').select('status, total_amount, payment_method').eq('mom_id', user.id),
        supabase.from('menu').select('id', { count: 'exact' }).eq('mom_id', user.id)
      ]);
      
      const orders = ordersResponse.data || [];
      
      const onlineRevenue = orders
        .filter(o => o.payment_method === 'stripe')
        .reduce((sum, order) => sum + (order.total_amount || 0), 0);

      const codRevenue = orders
        .filter(o => o.payment_method === 'cod')
        .reduce((sum, order) => sum + (order.total_amount || 0), 0);

      setStats({
        totalOrders: orders.length,
        activeOrders: orders.filter(order => ['placed', 'preparing', 'ready'].includes(order.status ?? '')).length,
        totalRevenue: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
        onlineRevenue,
        codRevenue,
        menuItems: menuResponse.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const subscribeToOrderChanges = () => {
    if (!user) return null;
    
    const channel = supabase
      .channel('mom-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `mom_id=eq.${user?.id}`,
        },
        () => {
          fetchOrders();
          fetchStats();
        }
      )
      .subscribe();

    return channel;
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const formatAddress = (address: any) => {
    if (!address) return 'Not provided';
    const { line1, city, state, postal_code } = address;
    return [line1, city, state, postal_code].filter(Boolean).join(', ');
  };

  return (
    <div className="min-h-screen bg-background relative animated-soft-gradient">
      <Header />
      <main className="container py-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-warm-orange-500 to-pastel-green-500 bg-clip-text text-transparent">
              Your Kitchen Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your menu and orders with love
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 animate-fade-in">
            <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-warm-orange-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <div className="p-2 bg-warm-orange-100 rounded-full">
                  <Users className="h-4 w-4 text-warm-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">{stats.activeOrders} active</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-pastel-green-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
                 <div className="p-2 bg-pastel-green-100 rounded-full">
                  <ChefHat className="h-4 w-4 text-pastel-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.menuItems}</div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-green-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Online Revenue</CardTitle>
                <div className="p-2 bg-green-100 rounded-full">
                  <CreditCard className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.onlineRevenue.toFixed(2)}</div>
                 <p className="text-xs text-muted-foreground">From Stripe payments</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-blue-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">COD Revenue</CardTitle>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Wallet className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.codRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">To be collected</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="menu" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="menu" className="gap-2">
                <ChefHat className="h-4 w-4" />
                Menu Management
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <Clock className="h-4 w-4" />
                Order Management
              </TabsTrigger>
            </TabsList>

            <TabsContent value="menu" className="animate-fade-in">
              <MenuManagement />
            </TabsContent>

            <TabsContent value="orders" className="animate-fade-in">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Order Management</h2>
                
                {orders.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                      <p className="text-gray-600">Orders will appear here when customers place them</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order) => (
                      <Card key={order.id} className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                        <CardContent className="p-6 flex-grow">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">{order.menu.title}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleString()}
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
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600">₹{order.total_amount}</p>
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className="mt-2 p-2 border rounded-md bg-background focus:ring-2 focus:ring-ring"
                              >
                                <option value="placed">Placed</option>
                                <option value="preparing">Preparing</option>
                                <option value="ready">Ready</option>
                                <option value="picked_up" disabled>Picked Up</option>
                                <option value="delivered" disabled>Delivered</option>
                              </select>
                            </div>
                          </div>

                          <div className="border-t pt-4 mt-4 space-y-4 text-sm">
                             <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2"><Users className="h-4 w-4" /> Customer Details</h4>
                                <div className="pl-6 space-y-1">
                                    <p><strong>Name:</strong> {order.customer.full_name}</p>
                                    <p className="flex items-start gap-2"><strong><Phone className="h-4 w-4 mt-0.5" />:</strong> <span>{order.customer.phone || 'Not provided'}</span></p>
                                    <p className="flex items-start gap-2"><strong><MapPin className="h-4 w-4 mt-0.5" />:</strong> <span>{formatAddress(order.customer.address)}</span></p>
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

                        </CardContent>
                        <div className={`h-1.5 w-full ${getStatusColorForMom(order.status)}`}></div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
