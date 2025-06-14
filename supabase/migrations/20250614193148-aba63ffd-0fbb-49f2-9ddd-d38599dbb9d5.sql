
-- Allow moms to update the status of their orders
CREATE POLICY "Moms can update their order status"
  ON public.orders FOR UPDATE
  USING (auth.uid() = mom_id)
  WITH CHECK (auth.uid() = mom_id);

-- This policy was too restrictive, so we'll remove it and create a new one.
DROP POLICY IF EXISTS "Delivery partners can see their assigned orders" ON public.orders;

-- Allow delivery partners to see their assigned orders AND orders available for pickup
CREATE POLICY "Delivery partners can view assigned and available orders"
  ON public.orders FOR SELECT
  USING (
    (auth.uid() = delivery_partner_id) OR
    (status = 'ready' AND delivery_partner_id IS NULL)
  );

-- Allow delivery partners to accept an available order by assigning it to themselves
CREATE POLICY "Delivery partners can accept orders"
  ON public.orders FOR UPDATE
  USING (status = 'ready' AND delivery_partner_id IS NULL)
  WITH CHECK (delivery_partner_id = auth.uid());

-- Allow delivery partners to update the status of their assigned orders
CREATE POLICY "Delivery partners can update their deliveries"
  ON public.orders FOR UPDATE
  USING (auth.uid() = delivery_partner_id)
  WITH CHECK (auth.uid() = delivery_partner_id);
