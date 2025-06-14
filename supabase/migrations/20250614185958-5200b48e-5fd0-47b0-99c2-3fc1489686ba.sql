
-- Add shipping details and phone number to orders table
ALTER TABLE public.orders ADD COLUMN shipping_details JSONB;
ALTER TABLE public.orders ADD COLUMN customer_phone TEXT;

-- Update the function to accept and store shipping info
CREATE OR REPLACE FUNCTION public.create_orders_from_cart(p_customer_id uuid, p_shipping_details jsonb, p_customer_phone text)
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
    INSERT INTO orders (customer_id, mom_id, menu_id, quantity, total_amount, shipping_details, customer_phone)
    VALUES (
      p_customer_id, 
      cart_item.mom_id, 
      cart_item.menu_id, 
      cart_item.quantity,
      cart_item.price * cart_item.quantity,
      p_shipping_details,
      p_customer_phone
    );
  END LOOP;
  
  -- Clear the cart after creating orders
  DELETE FROM cart WHERE customer_id = p_customer_id;
END;
$function$
