
-- We are updating these functions to be more robust.
-- They will now check if a user profile exists in the public.users table before proceeding.
-- If a profile is missing, it will create a basic one using the user's ID and email from the authentication service.
-- This ensures that users who signed up before the profile creation process was fixed can still use the app seamlessly.

CREATE OR REPLACE FUNCTION public.add_to_cart(customer_id uuid, menu_item_id uuid, quantity integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    auth_user_email TEXT;
BEGIN
    -- Ensure the user exists in public.users table
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = customer_id) THEN
        SELECT email INTO auth_user_email FROM auth.users WHERE id = customer_id;
        
        INSERT INTO public.users (id, email)
        VALUES (customer_id, auth_user_email);
    END IF;

    -- Original "add to cart" logic
    INSERT INTO cart (customer_id, menu_id, quantity)
    VALUES (customer_id, menu_item_id, quantity)
    ON CONFLICT (customer_id, menu_id)
    DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_orders_from_cart(customer_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  cart_item RECORD;
  auth_user_email TEXT;
BEGIN
    -- Ensure the user exists in public.users table
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = customer_id) THEN
        SELECT email INTO auth_user_email FROM auth.users WHERE id = customer_id;
        
        INSERT INTO public.users (id, email)
        VALUES (customer_id, auth_user_email);
    END IF;

  -- Original "create orders" logic
  FOR cart_item IN 
    SELECT c.menu_id, c.quantity, m.price, m.mom_id
    FROM cart c
    JOIN menu m ON c.menu_id = m.id
    WHERE c.customer_id = customer_id
  LOOP
    INSERT INTO orders (customer_id, mom_id, menu_id, quantity, total_amount)
    VALUES (
      customer_id, 
      cart_item.mom_id, 
      cart_item.menu_id, 
      cart_item.quantity,
      cart_item.price * cart_item.quantity
    );
  END LOOP;
  
  -- Clear the cart after creating orders
  DELETE FROM cart WHERE customer_id = customer_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.submit_feedback(
  order_id UUID,
  customer_id UUID,
  rating_value INTEGER,
  comment_text TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    auth_user_email TEXT;
BEGIN
    -- Ensure the user exists in public.users table
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = customer_id) THEN
        SELECT email INTO auth_user_email FROM auth.users WHERE id = customer_id;
        
        INSERT INTO public.users (id, email)
        VALUES (customer_id, auth_user_email);
    END IF;

  -- Original "submit feedback" logic
  INSERT INTO feedback (order_id, customer_id, rating, comment)
  VALUES (order_id, customer_id, rating_value, comment_text);
END;
$function$;

