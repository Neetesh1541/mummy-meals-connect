
-- This migration updates cart-related database functions to fix a real-time update issue.
-- By changing functions from SECURITY DEFINER to SECURITY INVOKER, we ensure that database
-- changes are attributed to the logged-in user, allowing Supabase's Realtime service
-- to correctly broadcast updates to the appropriate user channels.
-- The redundant user-creation logic within these functions is also removed, as this is
-- now handled automatically by a trigger on new user sign-ups.

-- Function 1: add_to_cart
CREATE OR REPLACE FUNCTION public.add_to_cart(p_customer_id uuid, p_menu_item_id uuid, p_quantity integer)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $function$
BEGIN
    INSERT INTO cart (customer_id, menu_id, quantity)
    VALUES (p_customer_id, p_menu_item_id, p_quantity)
    ON CONFLICT (customer_id, menu_id)
    DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity;
END;
$function$;

-- Function 2: update_cart_quantity
CREATE OR REPLACE FUNCTION public.update_cart_quantity(cart_item_id uuid, new_quantity integer)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $function$
BEGIN
  UPDATE cart 
  SET quantity = new_quantity
  WHERE id = cart_item_id;
END;
$function$;

-- Function 3: remove_from_cart
CREATE OR REPLACE FUNCTION public.remove_from_cart(cart_item_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $function$
BEGIN
  DELETE FROM cart WHERE id = cart_item_id;
END;
$function$;

-- Function 4: clear_cart
CREATE OR REPLACE FUNCTION public.clear_cart(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $function$
BEGIN
  DELETE FROM cart WHERE customer_id = user_id;
END;
$function$;

-- Function 5: create_orders_from_cart
-- This updates the most recent version of the function, which includes the payment_method parameter.
CREATE OR REPLACE FUNCTION public.create_orders_from_cart(p_customer_id uuid, p_shipping_details jsonb, p_customer_phone text, p_payment_method text DEFAULT 'stripe'::text)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $function$
DECLARE
  cart_item RECORD;
BEGIN
  FOR cart_item IN 
    SELECT c.menu_id, c.quantity, m.price, m.mom_id
    FROM cart c
    JOIN menu m ON c.menu_id = m.id
    WHERE c.customer_id = p_customer_id
  LOOP
    INSERT INTO orders (customer_id, mom_id, menu_id, quantity, total_amount, shipping_details, customer_phone, payment_method)
    VALUES (
      p_customer_id, 
      cart_item.mom_id, 
      cart_item.menu_id, 
      cart_item.quantity,
      cart_item.price * cart_item.quantity,
      p_shipping_details,
      p_customer_phone,
      p_payment_method
    );
  END LOOP;
  
  -- Clear the cart after creating orders
  DELETE FROM cart WHERE customer_id = p_customer_id;
END;
$function$;
