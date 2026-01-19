
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validate session_id format (Stripe checkout sessions start with cs_)
const SessionIdSchema = z.object({
  session_id: z.string()
    .min(1, "Session ID is required")
    .regex(/^cs_/, "Invalid Stripe session ID format"),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input with Zod
    const parseResult = SessionIdSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors.map(e => e.message).join(', ');
      throw new Error(errorMessage);
    }
    
    const { session_id } = parseResult.data;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    console.log("Retrieving Stripe session:", session_id);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const { user_id, shipping_details, customer_phone } = session.metadata!;
      
      if (!user_id || !shipping_details || !customer_phone) {
        throw new Error("Required metadata missing from session");
      }
      
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

      const { error } = await supabaseAdmin.rpc('create_orders_from_cart', {
          p_customer_id: user_id,
          p_shipping_details: JSON.parse(shipping_details),
          p_customer_phone: customer_phone,
          p_payment_method: 'stripe'
      });

      if (error) {
        throw new Error(`Failed to create order: ${error.message}`);
      }

      console.log("Order fulfilled successfully for user:", user_id);

      return new Response(JSON.stringify({ success: true, message: "Order created successfully" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
        throw new Error("Payment not successful");
    }

  } catch (error) {
    console.error("Error fulfilling order:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
