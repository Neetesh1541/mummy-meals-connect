
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validate shipping details schema
const ShippingDetailsSchema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters").max(300, "Address too long"),
  city: z.string().min(2, "City must be at least 2 characters").max(100, "City name too long"),
  state: z.string().min(2, "State must be at least 2 characters").max(100, "State name too long"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Pincode must be exactly 6 digits"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits"),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("User not found");

    const body = await req.json();
    
    // Validate input with Zod
    const parseResult = ShippingDetailsSchema.safeParse(body.shipping_details);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Invalid shipping details: ${errorMessage}`);
    }
    
    const shipping_details = parseResult.data;

    const { data: cartItems, error: cartError } = await supabaseClient.rpc('get_cart_items', {
      user_id: user.id
    });

    if (cartError) throw cartError;
    if (!cartItems || cartItems.length === 0) throw new Error("Cart is empty");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    const line_items = cartItems.map(item => ({
        price_data: {
            currency: 'inr',
            product_data: {
                name: item.menu.title,
            },
            unit_amount: item.menu.price * 100, // Amount in paise
        },
        quantity: item.quantity,
    }));
    
    const origin = req.headers.get("origin");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-cancel`,
      metadata: {
        user_id: user.id,
        shipping_details: JSON.stringify(shipping_details),
        customer_phone: shipping_details.phone
      }
    });

    console.log("Checkout session created successfully:", session.id);

    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
