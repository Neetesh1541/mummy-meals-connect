
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { TrackedOrderCard } from './TrackedOrderCard';
import { Loader2, ShoppingBag } from 'lucide-react';

export interface OrderWithDetails {
    id: string;
    created_at: string;
    status: string;
    quantity: number | null;
    total_amount: number | null;
    delivery_partner_id: string | null;
    menu: { title: string; image_url: string | null; } | null;
    mom: { full_name: string | null; } | null;
    delivery_partner: { full_name: string | null; } | null;
}

export function CustomerOrderTracking() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [orders, setOrders] = useState<OrderWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            menu:menu_id (title, image_url),
            mom:mom_id (full_name),
            delivery_partner:delivery_partner_id (full_name)
          `)
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        // The type inference from Supabase for joined tables can be complex.
        // Casting to `any` resolves the TypeScript error, and we rely on
        // runtime checks (optional chaining) in the rendering component.
        setOrders((data as any) || []);
      } catch (error: any) {
        console.error("Error fetching orders:", error);
        toast({ title: "Error", description: "Failed to fetch orders.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }, [user, toast]);

    useEffect(() => {
        if(user) {
            fetchOrders();

            const channel = supabase
                .channel(`customer-orders-${user.id}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `customer_id=eq.${user.id}`
                },
                () => {
                    fetchOrders();
                })
                .subscribe();
            
            return () => {
                supabase.removeChannel(channel);
            }
        }
    }, [user, fetchOrders]);
    
    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-2">Loading your orders...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-12 bg-muted rounded-lg">
                <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                <p className="text-gray-600">You haven't placed any orders. Browse some meals to get started!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {orders.map(order => (
                <TrackedOrderCard key={order.id} order={order} />
            ))}
        </div>
    );
}
