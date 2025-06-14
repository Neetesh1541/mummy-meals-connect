
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Minus, Plus, Trash2, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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

export function CartSidebar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItemWithMenu[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const { data, error } = await supabase
        .from('cart')
        .select(`
          id,
          quantity,
          menu_id,
          menu:menu_id (
            title,
            price,
            mom_id,
            users:mom_id (
              full_name
            )
          )
        `)
        .eq('customer_id', user?.id);
      
      if (error) {
        console.error('Error fetching cart:', error);
        return;
      }
      
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        const { error } = await supabase
          .from('cart')
          .delete()
          .eq('id', cartItemId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart')
          .update({ quantity: newQuantity })
          .eq('id', cartItemId);
        
        if (error) throw error;
      }
      
      fetchCartItems();
    } catch (error) {
      console.error('Error updating cart:', error);
      toast({
        title: "Error",
        description: "Failed to update cart",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('customer_id', user?.id);
      
      if (error) throw error;
      
      setCartItems([]);
      toast({
        title: "Cart cleared",
        description: "All items removed from cart",
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    }
  };

  const checkout = async () => {
    setLoading(true);
    try {
      // Create orders from cart items
      for (const item of cartItems) {
        const { error } = await supabase
          .from('orders')
          .insert({
            customer_id: user?.id,
            mom_id: item.menu.mom_id,
            menu_id: item.menu_id,
            quantity: item.quantity,
            total_amount: item.menu.price * item.quantity,
            status: 'placed'
          });
        
        if (error) throw error;
      }
      
      await clearCart();
      
      toast({
        title: "Order placed successfully!",
        description: "Your order has been sent to the kitchen",
      });
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.menu.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
                <h4 className="font-medium">{item.menu.title}</h4>
                <Badge variant="secondary" className="text-xs">
                  {item.menu.users?.full_name || 'Mom'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-semibold">₹{item.menu.price}</span>
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
                  Total: ₹{(item.menu.price * item.quantity).toFixed(2)}
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
              onClick={checkout}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {loading ? "Processing..." : "Checkout"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
