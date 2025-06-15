import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Camera, Search, Star, Repeat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { SubscriptionDialog } from "./SubscriptionDialog";

interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  available: boolean;
  mom_id: string;
  image_url: string | null;
  is_subscribable: boolean;
  users: {
    full_name: string;
  } | null;
}

interface CartItem {
  id: string;
  menu_id: string;
  quantity: number;
}

interface Rating {
  menu_id_arg: string;
  avg_rating: number;
  rating_count: number;
}

const StarDisplay = ({ rating, count }: { rating: number; count: number }) => {
  const fullStars = Math.round(rating);
  const emptyStars = 5 - fullStars;

  if (count === 0) {
    return <div className="text-sm text-muted-foreground">No ratings yet</div>;
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-4 w-4 fill-current" />
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
        ))}
      </div>
      <span className="text-xs text-muted-foreground ml-1">
        ({count} {count === 1 ? "rating" : "ratings"})
      </span>
    </div>
  );
};

export function MenuBrowser() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [maxPrice, setMaxPrice] = useState(500);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

  const fetchMenuItemsAndRatings = useCallback(async (isInitialLoad: boolean) => {
    setLoading(true);
    try {
      const menuPromise = supabase
        .from("menu")
        .select(`*, is_subscribable, users (full_name)`)
        .eq("available", true)
        .order("created_at", { ascending: false });

      const ratingsPromise = supabase.rpc("get_menu_ratings");

      const [
        { data: menuData, error: menuError },
        { data: ratingsData, error: ratingsError },
      ] = await Promise.all([menuPromise, ratingsPromise]);

      if (menuError) throw menuError;
      if (ratingsError) throw ratingsError;

      setMenuItems(menuData || []);
      setRatings(ratingsData || []);

      if (menuData && menuData.length > 0) {
        const prices = menuData.map((item) => item.price || 0).filter(p => p > 0);
        if (prices.length > 0) {
          const newMaxPrice = Math.ceil(Math.max(...prices));
          setMaxPrice(newMaxPrice);
          if (isInitialLoad) {
            setPriceRange([0, newMaxPrice]);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching menu items or ratings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch menu items or ratings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchCartItems = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.rpc('get_user_cart', {
        user_id: user.id
      });
      
      if (error) {
        console.error('Error fetching cart items:', error);
        return;
      }
      
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMenuItemsAndRatings(true);
      fetchCartItems();

      const channel = supabase
        .channel(`customer-dashboard-browser-${user.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "menu" },
          () => fetchMenuItemsAndRatings(false)
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "feedback" },
          () => fetchMenuItemsAndRatings(false)
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "cart",
            filter: `customer_id=eq.${user.id}`,
          },
          () => fetchCartItems()
        )
        .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
                console.log(`Successfully subscribed to menu/cart updates for user ${user.id}`);
            }
            if (status === 'CHANNEL_ERROR') {
                console.error(`Subscription error for menu/cart for user ${user.id}:`, err);
            }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchCartItems, fetchMenuItemsAndRatings]);

  const addToCart = async (menuItem: MenuItem) => {
    if (!user) return;
    try {
      const { error } = await supabase.rpc('add_to_cart', {
        p_customer_id: user.id,
        p_menu_item_id: menuItem.id,
        p_quantity: 1
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
        const { error } = await supabase.rpc('remove_from_cart', {
          cart_item_id: cartItemId
        });
        
        if (error) throw error;
      } else {
        const { error } = await supabase.rpc('update_cart_quantity', {
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

  const handleSubscribeClick = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setShowSubscriptionDialog(true);
  };

  const filteredMenuItems = useMemo(() => {
    return menuItems
      .filter((item) =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((item) => {
        if (item.price === null || typeof item.price === 'undefined') return true;
        return item.price >= priceRange[0] && item.price <= priceRange[1];
      });
  }, [menuItems, searchTerm, priceRange]);

  if (loading) {
    return <div className="text-center py-8">Loading delicious meals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Available Meals</h2>
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <span className="font-semibold">
            {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-2 relative">
           <div className="text-sm text-muted-foreground mb-2">Search by name</div>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground mt-2" />
          <Input
            type="text"
            placeholder="Search for delicious meals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="md:col-span-1">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Price Range</span>
            <span>
              ₹{priceRange[0]} - ₹{priceRange[1]}
            </span>
          </div>
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={maxPrice}
            step={10}
            className="w-full"
          />
        </div>
      </div>

      {filteredMenuItems.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenuItems.map((item) => {
            const cartQuantity = getCartQuantity(item.id);
            const cartItem = getCartItem(item.id);
            const itemRating = ratings.find(r => r.menu_id_arg === item.id);

            return (
              <Card
                key={item.id}
                className="hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in flex flex-col overflow-hidden"
              >
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title || 'Menu item'} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <Camera className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <CardHeader className="flex-grow pb-2">
                  <CardTitle className="flex justify-between items-start">
                    <span>{item.title}</span>
                    <Badge variant="secondary">
                      by {item.users?.full_name || "Mom"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                     <StarDisplay rating={itemRating?.avg_rating || 0} count={itemRating?.rating_count || 0} />
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-green-600">
                      ₹{item.price}
                    </span>
                    <Badge variant="default">Available</Badge>
                  </div>

                  <div className="space-y-2">
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
                    {item.is_subscribable && (
                        <Button
                            variant="outline"
                            onClick={() => handleSubscribeClick(item)}
                            className="w-full"
                        >
                            <Repeat className="h-4 w-4 mr-2" />
                            Subscribe
                        </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && menuItems.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No meals available</h3>
          <p className="text-gray-600">Check back soon for delicious home-cooked meals!</p>
        </div>
      )}
      
      {!loading && menuItems.length > 0 && filteredMenuItems.length === 0 && (
         <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No meals found</h3>
          <p className="text-gray-600">We couldn't find any meals matching your search. Try another keyword!</p>
        </div>
      )}
      
      {selectedMenuItem && (
        <SubscriptionDialog
            isOpen={showSubscriptionDialog}
            onClose={() => setShowSubscriptionDialog(false)}
            menuItem={selectedMenuItem}
        />
      )}
    </div>
  );
}
