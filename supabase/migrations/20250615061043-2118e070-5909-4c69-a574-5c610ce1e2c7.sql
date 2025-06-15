
--
-- This migration corrects the Row Level Security (RLS) policies for delivery partners
-- on the 'orders' table. It reverts to using the `public.has_role` helper function,
-- which correctly checks the `user_roles` table. The previous migration mistakenly
-- used the `user_type` column from the `users` table, which is not being populated.
-- This change ensures that delivery partners have the correct permissions to see
-- and accept orders on the dashboard.
--

-- Drop the incorrect policies that were just added.
DROP POLICY IF EXISTS "Delivery partners can view assigned and available orders" ON public.orders;
DROP POLICY IF EXISTS "Delivery partners can update orders" ON public.orders;

-- Re-create the SELECT policy using the has_role function.
-- This allows delivery partners to see their assigned orders or any available orders.
CREATE POLICY "Delivery partners can view assigned and available orders"
ON public.orders FOR SELECT
USING (
    (delivery_partner_id = auth.uid()) OR
    (status = 'ready' AND delivery_partner_id IS NULL AND public.has_role(auth.uid(), 'delivery_partner'))
);

-- Re-create the UPDATE policy using the has_role function.
-- This allows delivery partners to accept available orders or update their assigned orders.
CREATE POLICY "Delivery partners can update orders"
ON public.orders FOR UPDATE
USING (
  public.has_role(auth.uid(), 'delivery_partner') AND
  ( (status = 'ready' AND delivery_partner_id IS NULL) OR (delivery_partner_id = auth.uid()) )
)
WITH CHECK (public.has_role(auth.uid(), 'delivery_partner'));

