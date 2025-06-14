
-- Drop the old functions first to allow renaming parameters.
DROP FUNCTION IF EXISTS public.add_to_cart(uuid, uuid, integer);
DROP FUNCTION IF EXISTS public.create_orders_from_cart(uuid);
DROP FUNCTION IF EXISTS public.submit_feedback(uuid, uuid, integer, text);

-- Recreate the functions with non-conflicting parameter names (prefixed with 'p_').
CREATE OR REPLACE FUNCTION public.add_to_cart(p_customer_id uuid, p_menu_item_id uuid, p_quantity integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    auth_user_email TEXT;
BEGIN
    -- Ensure the user exists in public.users table
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_customer_id) THEN
        SELECT email INTO auth_user_email FROM auth.users WHERE id = p_customer_id;
        
        INSERT INTO public.users (id, email)
        VALUES (p_customer_id, auth_user_email)
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- "add to cart" logic
    INSERT INTO cart (customer_id, menu_id, quantity)
    VALUES (p_customer_id, p_menu_item_id, p_quantity)
    ON CONFLICT (customer_id, menu_id)
    DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_orders_from_cart(p_customer_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  cart_item RECORD;
  auth_user_email TEXT;
BEGIN
    -- Ensure the user exists in public.users table
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_customer_id) THEN
        SELECT email INTO auth_user_email FROM auth.users WHERE id = p_customer_id;
        
        INSERT INTO public.users (id, email)
        VALUES (p_customer_id, auth_user_email)
        ON CONFLICT (id) DO NOTHING;
    END IF;

  -- "create orders" logic
  FOR cart_item IN 
    SELECT c.menu_id, c.quantity, m.price, m.mom_id
    FROM cart c
    JOIN menu m ON c.menu_id = m.id
    WHERE c.customer_id = p_customer_id
  LOOP
    INSERT INTO orders (customer_id, mom_id, menu_id, quantity, total_amount)
    VALUES (
      p_customer_id, 
      cart_item.mom_id, 
      cart_item.menu_id, 
      cart_item.quantity,
      cart_item.price * cart_item.quantity
    );
  END LOOP;
  
  -- Clear the cart after creating orders
  DELETE FROM cart WHERE customer_id = p_customer_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.submit_feedback(
  p_order_id UUID,
  p_customer_id UUID,
  p_rating_value INTEGER,
  p_comment_text TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    auth_user_email TEXT;
BEGIN
    -- Ensure the user exists in public.users table
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_customer_id) THEN
        SELECT email INTO auth_user_email FROM auth.users WHERE id = p_customer_id;
        
        INSERT INTO public.users (id, email)
        VALUES (p_customer_id, auth_user_email)
        ON CONFLICT (id) DO NOTHING;
    END IF;

  -- "submit feedback" logic
  INSERT INTO feedback (order_id, customer_id, rating, comment)
  VALUES (p_order_id, p_customer_id, p_rating_value, p_comment_text);
END;
$function$;
