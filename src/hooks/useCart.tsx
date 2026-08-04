import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  menu_id: string;
  quantity: number;
  title: string;
  price: number;
  mom_id: string;
  momName: string;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (menuId: string, title?: string) => Promise<void>;
  setQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
  getItemByMenuId: (menuId: string) => CartItem | undefined;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_cart_items", {
        user_id: user.id,
      });
      if (error) throw error;

      const mapped: CartItem[] = (data || []).map((row: any) => ({
        id: row.id,
        menu_id: row.menu_id,
        quantity: row.quantity ?? 0,
        title: row.menu?.title ?? "Unknown item",
        price: Number(row.menu?.price) || 0,
        mom_id: row.menu?.mom_id ?? "",
        momName: row.menu?.users?.full_name ?? "Mom",
      }));
      setItems(mapped);
    } catch (error: any) {
      console.error("Cart: failed to load items", error);
      toast({
        title: "Cart unavailable",
        description: error?.message || "Failed to load your cart.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Initial load + realtime backup channel
  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    refresh();

    const channel = supabase
      .channel(`cart-sync-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart",
          filter: `customer_id=eq.${user.id}`,
        },
        () => {
          refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refresh]);

  const addItem = useCallback(
    async (menuId: string, title?: string) => {
      if (!user) return;
      // Optimistic bump so the UI reacts instantly
      setItems((prev) => {
        const existing = prev.find((i) => i.menu_id === menuId);
        if (!existing) return prev;
        return prev.map((i) =>
          i.menu_id === menuId ? { ...i, quantity: i.quantity + 1 } : i
        );
      });

      try {
        const { error } = await supabase.rpc("add_to_cart", {
          p_customer_id: user.id,
          p_menu_item_id: menuId,
          p_quantity: 1,
        });
        if (error) throw error;
        toast({
          title: "Added to cart",
          description: title ? `${title} is in your cart.` : "Item added.",
        });
      } catch (error: any) {
        console.error("Cart: add failed", error);
        toast({
          title: "Couldn't add item",
          description: error?.message || "Please try again.",
          variant: "destructive",
        });
      } finally {
        await refresh();
      }
    },
    [user, toast, refresh]
  );

  const setQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      // Optimistic update
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((i) => i.id !== cartItemId)
          : prev.map((i) => (i.id === cartItemId ? { ...i, quantity } : i))
      );

      try {
        const { error } =
          quantity <= 0
            ? await supabase.rpc("remove_from_cart", { cart_item_id: cartItemId })
            : await supabase.rpc("update_cart_quantity", {
                cart_item_id: cartItemId,
                new_quantity: quantity,
              });
        if (error) throw error;
      } catch (error: any) {
        console.error("Cart: update failed", error);
        toast({
          title: "Couldn't update cart",
          description: error?.message || "Please try again.",
          variant: "destructive",
        });
      } finally {
        await refresh();
      }
    },
    [toast, refresh]
  );

  const clear = useCallback(async () => {
    if (!user) return;
    const snapshot = items;
    setItems([]);
    try {
      const { error } = await supabase.rpc("clear_cart", { user_id: user.id });
      if (error) throw error;
      toast({ title: "Cart cleared", description: "All items removed." });
    } catch (error: any) {
      setItems(snapshot);
      toast({
        title: "Couldn't clear cart",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      await refresh();
    }
  }, [user, items, toast, refresh]);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
    const totalAmount = items.reduce(
      (sum, i) => sum + (i.price || 0) * (i.quantity || 0),
      0
    );
    return {
      items,
      totalItems,
      totalAmount,
      loading,
      refresh,
      addItem,
      setQuantity,
      clear,
      getItemByMenuId: (menuId: string) =>
        items.find((i) => i.menu_id === menuId),
    };
  }, [items, loading, refresh, addItem, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
