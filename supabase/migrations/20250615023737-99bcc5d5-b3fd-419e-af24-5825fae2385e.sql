
-- Create a new function to check if a user has permission to view a location
CREATE OR REPLACE FUNCTION public.can_view_delivery_location(p_partner_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_customer BOOLEAN;
  is_mom BOOLEAN;
  current_user_id UUID := auth.uid();
BEGIN
  -- Check if user is a customer with an active order for this partner
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.delivery_partner_id = p_partner_id
    AND orders.customer_id = current_user_id
    AND orders.status = 'picked_up'
  ) INTO is_customer;

  IF is_customer THEN RETURN TRUE; END IF;

  -- Check if user is a mom with an active order for this partner
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.delivery_partner_id = p_partner_id
    AND orders.mom_id = current_user_id
    AND (orders.status = 'ready' OR orders.status = 'picked_up')
  ) INTO is_mom;

  IF is_mom THEN RETURN TRUE; END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the old, separate policies
DROP POLICY IF EXISTS "Customers can see their delivery partner location" ON public.delivery_partner_locations;
DROP POLICY IF EXISTS "Moms can see their delivery partner location" ON public.delivery_partner_locations;

-- Create a new, single policy that uses the function
CREATE POLICY "Users can see relevant delivery partner locations"
ON public.delivery_partner_locations
FOR SELECT
USING (public.can_view_delivery_location(partner_id));
