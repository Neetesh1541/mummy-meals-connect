-- Fix function search_path vulnerabilities for all existing functions

CREATE OR REPLACE FUNCTION public.complete_delivery_order(p_order_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
    updated_order record;
BEGIN
    UPDATE public.orders 
    SET status = 'delivered'
    WHERE 
        id = p_order_id 
        AND delivery_partner_id = auth.uid()
        AND status = 'picked_up'
    RETURNING * INTO updated_order;
    
    IF updated_order.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Order cannot be completed or is not assigned to you'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'order_id', updated_order.id
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.clear_cart(user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  DELETE FROM cart WHERE customer_id = user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.remove_from_cart(cart_item_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  DELETE FROM cart WHERE id = cart_item_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_order_placed()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
    PERFORM pg_notify('order_placed', json_build_object('order_id', NEW.id, 'user_id', NEW.customer_id)::text);
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_estimated_delivery_time()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
    IF NEW.status = 'picked_up' AND OLD.status != 'picked_up' THEN
        NEW.estimated_delivery_at = NOW() + INTERVAL '30 minutes';
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
declare
begin
  return event;
end;
$function$;

CREATE OR REPLACE FUNCTION public.update_location_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.accept_delivery_order(p_order_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
    updated_order record;
BEGIN
    UPDATE public.orders 
    SET 
        delivery_partner_id = auth.uid(),
        status = 'picked_up'
    WHERE 
        id = p_order_id 
        AND status = 'ready' 
        AND delivery_partner_id IS NULL
    RETURNING * INTO updated_order;
    
    IF updated_order.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Order is no longer available or already assigned'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'order_id', updated_order.id
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.add_to_cart(p_customer_id uuid, p_menu_item_id uuid, p_quantity integer)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
    INSERT INTO cart (customer_id, menu_id, quantity)
    VALUES (p_customer_id, p_menu_item_id, p_quantity)
    ON CONFLICT (customer_id, menu_id)
    DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_cart_quantity(cart_item_id uuid, new_quantity integer)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  UPDATE cart 
  SET quantity = new_quantity
  WHERE id = cart_item_id;
END;
$function$;

-- Fix the three create_orders_from_cart overloads
CREATE OR REPLACE FUNCTION public.create_orders_from_cart(p_customer_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  cart_item RECORD;
  auth_user_email TEXT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_customer_id) THEN
        SELECT email INTO auth_user_email FROM auth.users WHERE id = p_customer_id;
        INSERT INTO public.users (id, email)
        VALUES (p_customer_id, auth_user_email)
        ON CONFLICT (id) DO NOTHING;
    END IF;

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
  
  DELETE FROM cart WHERE customer_id = p_customer_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_orders_from_cart(p_customer_id uuid, p_shipping_details jsonb, p_customer_phone text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  cart_item RECORD;
  auth_user_email TEXT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_customer_id) THEN
        SELECT email INTO auth_user_email FROM auth.users WHERE id = p_customer_id;
        INSERT INTO public.users (id, email)
        VALUES (p_customer_id, auth_user_email)
        ON CONFLICT (id) DO NOTHING;
    END IF;

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
  
  DELETE FROM cart WHERE customer_id = p_customer_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_orders_from_cart(p_customer_id uuid, p_shipping_details jsonb, p_customer_phone text, p_payment_method text DEFAULT 'stripe'::text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = public
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
  
  DELETE FROM cart WHERE customer_id = p_customer_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.submit_feedback(p_order_id uuid, p_customer_id uuid, p_rating_value integer, p_comment_text text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
    auth_user_email TEXT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_customer_id) THEN
        SELECT email INTO auth_user_email FROM auth.users WHERE id = p_customer_id;
        INSERT INTO public.users (id, email)
        VALUES (p_customer_id, auth_user_email)
        ON CONFLICT (id) DO NOTHING;
    END IF;

  INSERT INTO feedback (order_id, customer_id, rating, comment)
  VALUES (p_order_id, p_customer_id, p_rating_value, p_comment_text);
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_order_status_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  current_user_id UUID := auth.uid();
  is_mom BOOLEAN := (OLD.mom_id = current_user_id);
  is_delivery_partner BOOLEAN := public.has_role(current_user_id, 'delivery');
BEGIN
  IF is_mom THEN
    IF (OLD.status = 'placed' AND NEW.status = 'preparing') OR
       (OLD.status = 'preparing' AND NEW.status = 'ready') THEN
      RETURN NEW;
    END IF;
  END IF;

  IF is_delivery_partner THEN
    IF OLD.status = 'ready' AND OLD.delivery_partner_id IS NULL AND
       NEW.status = 'picked_up' AND NEW.delivery_partner_id = current_user_id THEN
      RETURN NEW;
    END IF;

    IF OLD.status = 'picked_up' AND OLD.delivery_partner_id = current_user_id AND
       NEW.status = 'delivered' THEN
      RETURN NEW;
    END IF;
  END IF;

  RAISE EXCEPTION 'Invalid order status transition or insufficient permissions. From: %, To: %', OLD.status, NEW.status;

  RETURN NULL;
END;
$function$;