
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  available: boolean;
  mom_id: string;
  users: {
    full_name: string;
  };
}

interface CartItem {
  id: string;
  menu_id: string;
  quantity: number;
}

export function MenuBrowser() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMenuItems();
      fetchCartItems();
      subscribeToMenuChanges();
    }
  }, [user]);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu')
        .select(`
          *,
          users!menu_mom_id_fkey(full_name)
        `)
        .eq('available', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch menu items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItems = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_cart', { user_id: user?.id });
      
      if (error) {
        console.error('Error fetching cart items:', error);
        return;
      }
      
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const subscribeToMenuChanges = () => {
    const channel = supabase
      .channel('menu-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu',
        },
        () => {
          fetchMenuItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const addToCart = async (menuItem: MenuItem) => {
    try {
      const { error } = await supabase
        .rpc('add_to_cart', {
          customer_id: user?.id,
          menu_item_id: menuItem.id,
          quantity: 1
        });
      
      if (error) throw error;
      
      fetchCartItems();
      toast({
        title: "Added to Cart",
        description: `${menuItem.title} added to your cart`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const updateCartQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        const { error } = await supabase
          .rpc('remove_from_cart', { cart_item_id: cartItemId });
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .rpc('update_cart_quantity', {
            cart_item_id: cartItemId,
            new_quantity: newQuantity
          });
        
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

  const getCartQuantity = (menuId: string) => {
    const cartItem = cartItems.find(item => item.menu_id === menuId);
    return cartItem ? cartItem.quantity : 0;
  };

  const getCartItem = (menuId: string) => {
    return cartItems.find(item => item.menu_id === menuId);
  };

  if (loading) {
    return <div className="text-center py-8">Loading delicious meals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Available Meals</h2>
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <span className="font-semibold">{cartItems.reduce((sum, item) => sum + item.quantity, 0)} items</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => {
          const cartQuantity = getCartQuantity(item.id);
          const cartItem = getCartItem(item.id);
          
          return (
            <Card key={item.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{item.title}</span>
                  <Badge variant="secondary">
                    by {item.users?.full_name || 'Mom'}
                  </Badge>
                </CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-green-600">₹{item.price}</span>
                  <Badge variant="default">Available</Badge>
                </div>
                
                {cartQuantity > 0 ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cartItem && updateCartQuantity(cartItem.id, cartQuantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-semibold">{cartQuantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cartItem && updateCartQuantity(cartItem.id, cartQuantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="text-sm text-gray-600">In Cart</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => addToCart(item)}
                    className="w-full bg-gradient-to-r from-warm-orange-500 to-warm-orange-600 hover:from-warm-orange-600 hover:to-warm-orange-700"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {menuItems.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No meals available</h3>
          <p className="text-gray-600">Check back soon for delicious home-cooked meals!</p>
        </div>
      )}
    </div>
  );
}
