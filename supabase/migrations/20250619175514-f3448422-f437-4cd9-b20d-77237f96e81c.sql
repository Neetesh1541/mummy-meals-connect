
-- Fix the delivery partner role inconsistency and RLS policies
-- The main issue is that user registration uses 'delivery' role but some policies check for 'delivery_partner'

-- First, ensure all delivery partner roles are consistent as 'delivery'
UPDATE public.user_roles SET role = 'delivery' WHERE role = 'delivery_partner';

-- Remove any leftover 'delivery_partner' role entries
DELETE FROM public.user_roles WHERE role = 'delivery_partner';

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Delivery partners can view relevant orders for dashboard" ON public.orders;
DROP POLICY IF EXISTS "Delivery partners can view assigned and available orders" ON public.orders;
DROP POLICY IF EXISTS "Delivery partners can update their orders" ON public.orders;
DROP POLICY IF EXISTS "Delivery partners can update orders" ON public.orders;

-- Create new, correct SELECT policy for delivery partners using 'delivery' role
CREATE POLICY "Delivery partners can view relevant orders for dashboard"
ON public.orders
FOR SELECT
USING (
    public.has_role(auth.uid(), 'delivery') AND
    (
        (status = 'ready' AND delivery_partner_id IS NULL) OR
        status = 'picked_up' OR
        delivery_partner_id = auth.uid()
    )
);

-- Create new, correct UPDATE policy for delivery partners using 'delivery' role
CREATE POLICY "Delivery partners can update their orders"
ON public.orders
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'delivery') AND
  ( (status = 'ready' AND delivery_partner_id IS NULL) OR (delivery_partner_id = auth.uid()) )
)
WITH CHECK (
  public.has_role(auth.uid(), 'delivery')
);

-- Update the validation function to use the correct role name 'delivery'
CREATE OR REPLACE FUNCTION public.validate_order_status_update()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID := auth.uid();
  is_mom BOOLEAN := (OLD.mom_id = current_user_id);
  is_delivery_partner BOOLEAN := public.has_role(current_user_id, 'delivery');
BEGIN
  -- This trigger only fires on status updates. RLS should prevent unauthorized access.
  
  -- Mom's allowed transitions
  IF is_mom THEN
    IF (OLD.status = 'placed' AND NEW.status = 'preparing') OR
       (OLD.status = 'preparing' AND NEW.status = 'ready') THEN
      RETURN NEW; -- Allowed
    END IF;
  END IF;

  -- Delivery Partner's allowed transitions
  IF is_delivery_partner THEN
    -- Case 1: Accepting an available order
    IF OLD.status = 'ready' AND OLD.delivery_partner_id IS NULL AND
       NEW.status = 'picked_up' AND NEW.delivery_partner_id = current_user_id THEN
      RETURN NEW; -- Allowed
    END IF;

    -- Case 2: Completing an assigned order
    IF OLD.status = 'picked_up' AND OLD.delivery_partner_id = current_user_id AND
       NEW.status = 'delivered' THEN
      RETURN NEW; -- Allowed
    END IF;
  END IF;

  -- If we reach here, the transition is not allowed for the user/state.
  RAISE EXCEPTION 'Invalid order status transition or insufficient permissions. From: %, To: %', OLD.status, NEW.status;

  RETURN NULL; -- Unreachable
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
