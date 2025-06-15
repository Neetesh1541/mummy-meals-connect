
-- Clean up all previous attempts to ensure a fresh start
DROP TRIGGER IF EXISTS before_order_update_validate_status ON public.orders;
DROP FUNCTION IF EXISTS public.validate_order_status_update();
DROP FUNCTION IF EXISTS public.can_mom_update_order_status(text, text);
DROP FUNCTION IF EXISTS public.can_delivery_partner_update_order(orders, orders);
-- A comprehensive drop of all possible policy names I might have created
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN (SELECT polname FROM pg_policy WHERE polrelid = 'public.orders'::regclass)
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_name) || ' ON public.orders;';
    END LOOP;
END;
$$;

-- Enable real-time functionality for the chat messages table
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Trigger function to validate order status transitions
CREATE OR REPLACE FUNCTION public.validate_order_status_update()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID := auth.uid();
  is_mom BOOLEAN := (OLD.mom_id = current_user_id);
  is_delivery_partner BOOLEAN := public.has_role(current_user_id, 'delivery_partner');
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

-- Create the trigger that runs ONLY when the 'status' column is updated
CREATE TRIGGER before_order_update_validate_status
BEFORE UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.validate_order_status_update();

-- Re-enable and Apply RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders FORCE ROW LEVEL SECURITY;

-- SELECT policies
CREATE POLICY "Customers can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Moms can view orders for their items" ON public.orders FOR SELECT USING (auth.uid() = mom_id);
CREATE POLICY "Delivery partners can view assigned and available orders" ON public.orders FOR SELECT USING (
    (delivery_partner_id = auth.uid()) OR
    (status = 'ready' AND delivery_partner_id IS NULL AND public.has_role(auth.uid(), 'delivery_partner'))
);

-- UPDATE policies (now simplified, as the trigger handles validation)
CREATE POLICY "Moms can update their own orders"
ON public.orders FOR UPDATE USING (auth.uid() = mom_id) WITH CHECK (auth.uid() = mom_id);

CREATE POLICY "Delivery partners can update orders"
ON public.orders FOR UPDATE USING (
  public.has_role(auth.uid(), 'delivery_partner') AND
  ( (status = 'ready' AND delivery_partner_id IS NULL) OR (delivery_partner_id = auth.uid()) )
) WITH CHECK (public.has_role(auth.uid(), 'delivery_partner'));
