
--
-- This migration updates the Row Level Security (RLS) policies for delivery partners
-- on the 'orders' table. It replaces the policies that use the `has_role` helper function
-- with more direct policies that check the `user_type` from the `users` table. This
-- should provide a more reliable way to grant permissions and fix issues with real-time
-- updates and order acceptance on the delivery dashboard.
--

-- Drop the existing, potentially problematic RLS policies for delivery partners.
DROP POLICY IF EXISTS "Delivery partners can view assigned and available orders" ON public.orders;
DROP POLICY IF EXISTS "Delivery partners can update orders" ON public.orders;

-- Create a more robust SELECT policy for delivery partners.
-- This allows them to see their assigned orders or any available orders if their
-- `user_type` in the `users` table is 'delivery_partner'.
CREATE POLICY "Delivery partners can view assigned and available orders"
ON public.orders FOR SELECT
USING (
  (delivery_partner_id = auth.uid()) OR
  (
    status = 'ready' AND
    delivery_partner_id IS NULL AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_type = 'delivery_partner'
    )
  )
);

-- Create a more robust UPDATE policy for delivery partners.
-- This allows them to accept available orders or update their assigned orders if their
-- `user_type` in the `users` table is 'delivery_partner'.
CREATE POLICY "Delivery partners can update orders"
ON public.orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND user_type = 'delivery_partner'
  ) AND
  (
    (status = 'ready' AND delivery_partner_id IS NULL) OR
    (delivery_partner_id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND user_type = 'delivery_partner'
  )
);

