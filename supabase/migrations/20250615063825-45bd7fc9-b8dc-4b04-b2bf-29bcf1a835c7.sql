
-- This migration consolidates and corrects the Row Level Security (RLS) policies
-- for delivery partners on the 'orders' table. It removes previous, potentially
-- conflicting policies and establishes a single, clear set of rules.

-- Drop all known previous RLS policies for delivery partners to avoid conflicts.
DROP POLICY IF EXISTS "Delivery partners can view assigned and available orders" ON public.orders;
DROP POLICY IF EXISTS "Delivery partners can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Delivery partners can update orders" ON public.orders;
DROP POLICY IF EXISTS "Delivery partners can accept orders" ON public.orders;
DROP POLICY IF EXISTS "Delivery partners can update their deliveries" ON public.orders;

-- Create a single, correct SELECT policy for delivery partners.
-- They can see orders assigned to them, or available orders if they have the correct role.
CREATE POLICY "Delivery partners can view assigned and available orders"
ON public.orders
FOR SELECT
USING (
    (delivery_partner_id = auth.uid()) OR
    (status = 'ready' AND delivery_partner_id IS NULL AND public.has_role(auth.uid(), 'delivery_partner'))
);

-- Create a single, correct UPDATE policy for delivery partners.
-- They can update available orders (to accept) or their own orders (to complete),
-- but only if they have the delivery partner role.
CREATE POLICY "Delivery partners can update their orders"
ON public.orders
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'delivery_partner') AND
  ( (status = 'ready' AND delivery_partner_id IS NULL) OR (delivery_partner_id = auth.uid()) )
)
WITH CHECK (
  public.has_role(auth.uid(), 'delivery_partner')
);
