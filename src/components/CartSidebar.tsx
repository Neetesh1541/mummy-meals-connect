import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Minus, Plus, Trash2, CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { CheckoutDialog, type ShippingForm } from "./CheckoutDialog";
import { useCart } from "@/hooks/useCart";

export function CartSidebar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { items, totalItems, totalAmount, setQuantity, clear, refresh } = useCart();
  const [loading, setLoading] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const checkout = async (form: ShippingForm, paymentMethod: "stripe" | "cod") => {
    if (!user) return;
    setLoading(true);

    // Single canonical shape, accepted by the checkout function's validator
    const shipping_details = {
      name: form.fullName,
      address: form.street,
      city: form.city,
      state: form.state,
      pincode: form.zip,
      phone: form.phone,
    };

    try {
      if (paymentMethod === "stripe") {
        const { data, error } = await supabase.functions.invoke(
          "create-checkout-session",
          { body: { shipping_details } }
        );

        // Edge function returns a 400 with a readable message on validation errors
        const serverError = (data as any)?.error;
        if (error || serverError) {
          throw new Error(
            serverError || error?.message || "Could not start the card payment."
          );
        }

        if (data?.url) {
          window.location.href = data.url;
          return;
        }
        throw new Error("Payment session could not be created. Please try again.");
      }

      const { error } = await supabase.rpc("create_orders_from_cart", {
        p_customer_id: user.id,
        p_shipping_details: shipping_details,
        p_customer_phone: form.phone,
        p_payment_method: "cod",
      });
      if (error) throw new Error(error.message);

      toast({
        title: "Order placed!",
        description: "Track it live under Track Orders.",
      });
      setIsCheckoutOpen(false);
      await refresh();
    } catch (error: any) {
      console.error("Checkout failed:", error);
      toast({
        title: "Checkout failed",
        description: error?.message || "Failed to process your order.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="w-full lg:w-96 lg:shrink-0">
      <div className="glass rounded-3xl p-6 lg:sticky lg:top-24">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShoppingCart className="h-4 w-4" />
            </span>
            Cart
            <Badge variant="secondary" className="rounded-full">
              {totalItems}
            </Badge>
          </h3>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="rounded-xl text-muted-foreground hover:text-destructive"
              aria-label="Clear cart"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="py-12 text-center animate-fade-in">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <ShoppingCart className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">
              Add some delicious meals to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border/60 bg-card/60 p-4 smooth-transition hover:border-primary/30 animate-fade-in"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h4 className="font-medium leading-tight">{item.title}</h4>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {item.momName}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-primary">₹{item.price}</span>
                  <div className="flex items-center gap-1 rounded-xl border border-border/60 p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg"
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                      aria-label={`Decrease ${item.title}`}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg"
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      aria-label={`Increase ${item.title}`}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="mt-2 text-right text-sm text-muted-foreground">
                  Subtotal ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">₹{totalAmount.toFixed(2)}</span>
              </div>

              <Button
                onClick={() => setIsCheckoutOpen(true)}
                disabled={items.length === 0 || loading}
                className="btn-premium w-full rounded-xl bg-gradient-warm text-primary-foreground shadow-warm"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
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
          total={totalAmount}
        />
      </div>
    </aside>
  );
}
