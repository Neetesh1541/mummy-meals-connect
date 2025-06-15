
-- Drop the existing, overly restrictive SELECT policy for delivery partners.
DROP POLICY IF EXISTS "Delivery partners can view assigned and available orders" ON public.orders;

-- Create a new, corrected SELECT policy that allows for proper real-time updates.
-- This policy ensures all delivery partners can see:
-- 1. Orders that are 'ready' for anyone to pick up.
-- 2. Any order that is currently 'picked_up' (this is key for all partners to get the real-time update).
-- 3. Any order assigned to them, regardless of status (e.g., to see their own completed deliveries).
CREATE POLICY "Delivery partners can view relevant orders for dashboard"
ON public.orders
FOR SELECT
USING (
    public.has_role(auth.uid(), 'delivery_partner') AND
    (
        (status = 'ready' AND delivery_partner_id IS NULL) OR
        status = 'picked_up' OR
        delivery_partner_id = auth.uid()
    )
);
