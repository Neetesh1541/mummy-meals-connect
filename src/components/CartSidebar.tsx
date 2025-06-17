
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Minus, Plus, Trash2, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { CheckoutDialog } from "./CheckoutDialog";

interface CartItemWithMenu {
  id: string;
  quantity: number;
  menu_id: string;
  menu: {
    title: string;
    price: number;
    mom_id: string;
    users: {
      full_name: string;
    };
  };
}

interface CartItemRaw {
  id: string;
  quantity: number;
  menu_id: string;
  menu: any; // Json type from Supabase
}

export function CartSidebar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItemWithMenu[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const transformCartData = (rawData: CartItemRaw[]): CartItemWithMenu[] => {
    return rawData.map(item => ({
      id: item.id,
      quantity: item.quantity,
      menu_id: item.menu_id,
      menu: {
        title: item.menu?.title || 'Unknown Item',
        price: Number(item.menu?.price) || 0,
        mom_id: item.menu?.mom_id || '',
        users: {
          full_name: item.menu?.users?.full_name || 'Mom'
        }
      }
    }));
  };

  const fetchCartItems = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    
    try {
      console.log('Fetching cart items for user:', user.id);
      const { data, error } = await supabase.rpc('get_cart_items', {
        user_id: user.id,
      });

      if (error) {
        console.error('Error fetching cart:', error);
        toast({
          title: "Error",
          description: "Failed to fetch cart items",
          variant: "destructive",
        });
        return;
      }
      
      console.log('Cart items fetched:', data);
      const transformedData = transformCartData(data || []);
      setCartItems(transformedData);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cart items",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchCartItems();

      // Set up real-time subscription for cart changes
      const channel = supabase
        .channel(`cart-changes-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cart',
            filter: `customer_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Cart change detected:', payload);
            fetchCartItems();
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Successfully subscribed to cart changes for user ${user.id}`);
          }
          if (status === 'CHANNEL_ERROR') {
            console.error(`Cart subscription error for user ${user.id}:`, err);
            toast({
              title: "Connection Error",
              description: "Could not connect to real-time updates. Please refresh the page.",
              variant: "destructive"
            });
          }
        });

      return () => {
        console.log(`Cleaning up cart subscription for user ${user.id}`);
        supabase.removeChannel(channel);
      };
    } else {
      setCartItems([]);
    }
  }, [user, fetchCartItems, toast]);

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      console.log('Updating cart item:', cartItemId, 'to quantity:', newQuantity);
      
      if (newQuantity <= 0) {
        const { error } = await supabase.rpc('remove_from_cart', {
          cart_item_id: cartItemId,
        });
        if (error) throw error;
        console.log('Item removed from cart');
      } else {
        const { error } = await supabase.rpc('update_cart_quantity', {
          cart_item_id: cartItemId,
          new_quantity: newQuantity,
        });
        if (error) throw error;
        console.log('Cart quantity updated');
      }
    } catch (error: any) {
      console.error('Error updating cart:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update cart",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      console.log('Clearing cart for user:', user.id);
      const { error } = await supabase.rpc('clear_cart', {
        user_id: user.id,
      });
      
      if (error) throw error;
      
      toast({
        title: "Cart cleared",
        description: "All items removed from cart",
      });
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to clear cart",
        variant: "destructive",
      });
    }
  };

  const checkout = async (address: any, paymentMethod: 'stripe' | 'cod') => {
    if (!user) return;
    setLoading(true);
    try {
      const shipping_details = {
        name: address.fullName,
        phone: address.phone,
        address: {
          line1: address.street,
          city: address.city,
          state: address.state,
          postal_code: address.zip,
          country: 'IN',
        },
      };

      console.log('Processing checkout with:', { paymentMethod, shipping_details });

      if (paymentMethod === 'stripe') {
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
          body: { shipping_details }
        });
        
        if (error) throw error;

        if (data?.url) {
          window.location.href = data.url;
        } else {
          toast({
            title: "Error",
            description: "Could not create payment session.",
            variant: "destructive",
          });
        }
      } else { // Cash on Delivery
        const { error } = await supabase.rpc('create_orders_from_cart', {
            p_customer_id: user.id,
            p_shipping_details: shipping_details,
            p_customer_phone: address.phone,
            p_payment_method: 'cod'
        });

        if (error) {
          throw new Error(`Failed to create order: ${error.message}`);
        }
        
        toast({
          title: "Order Placed!",
          description: "Your order has been placed successfully. You can track it in your dashboard.",
        });
        setIsCheckoutOpen(false);
      }
    } catch (error: any) {
      console.error('Error during checkout:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to process order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => {
    const price = item.menu?.price || 0;
    const quantity = item.quantity || 0;
    return sum + (price * quantity);
  }, 0);
  
  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <div className="w-96 bg-white dark:bg-gray-800 border-l p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Cart ({totalItems})
        </h3>
        {cartItems.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearCart}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Your cart is empty</p>
          <p className="text-sm text-gray-500">Add some delicious meals!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{item.menu?.title || 'Unknown Item'}</h4>
                <Badge variant="secondary" className="text-xs">
                  {item.menu?.users?.full_name || 'Mom'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-semibold">₹{item.menu?.price || 0}</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="text-right mt-2">
                <span className="text-sm font-semibold">
                  Total: ₹{((item.menu?.price || 0) * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total Amount:</span>
              <span className="text-green-600">₹{totalAmount.toFixed(2)}</span>
            </div>
            
            <Button
              onClick={() => setIsCheckoutOpen(true)}
              disabled={cartItems.length === 0}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Checkout
            </Button>
          </div>
        </div>
      )}
      <CheckoutDialog 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onCheckout={checkout}
        loading={loading}
      />
    </div>
  );
}
