
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

    console.log("Verifying Stripe session:", session_id);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const userId = session.metadata?.user_id;
      if (!userId) {
        throw new Error("User ID not found in session metadata");
      }

      const { shipping_details, customer_phone } = session.metadata!;
      if (!shipping_details || !customer_phone) {
          throw new Error("Shipping details not found in session metadata");
      }

      // Use service role key to perform admin tasks
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

      const { error: rpcError } = await supabaseAdmin.rpc('create_orders_from_cart', {
        p_customer_id: userId,
        p_shipping_details: JSON.parse(shipping_details),
        p_customer_phone: customer_phone,
        p_payment_method: 'stripe'
      });

      if (rpcError) throw rpcError;

      console.log("Session verified and order created for user:", userId);

      return new Response(JSON.stringify({ status: 'success', message: 'Order created' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      throw new Error("Payment not successful");
    }
  } catch (error) {
    console.error("Error verifying session:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
