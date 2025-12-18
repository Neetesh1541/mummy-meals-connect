-- Fix 1: Secure submit_feedback function with proper authorization
CREATE OR REPLACE FUNCTION public.submit_feedback(
  p_order_id UUID,
  p_customer_id UUID,
  p_rating_value INTEGER,
  p_comment_text TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
DECLARE
  v_current_user UUID := auth.uid();
  v_order_exists BOOLEAN;
BEGIN
  -- Verify caller matches customer_id parameter
  IF v_current_user IS NULL OR v_current_user != p_customer_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only submit feedback for yourself';
  END IF;

  -- Verify order exists, belongs to user, and is delivered
  SELECT EXISTS(
    SELECT 1 FROM orders 
    WHERE id = p_order_id 
    AND customer_id = v_current_user
    AND status = 'delivered'
  ) INTO v_order_exists;
  
  IF NOT v_order_exists THEN
    RAISE EXCEPTION 'Order not found or not eligible for feedback';
  END IF;
  
  -- Prevent duplicate feedback
  IF EXISTS(SELECT 1 FROM feedback WHERE order_id = p_order_id AND customer_id = v_current_user) THEN
    RAISE EXCEPTION 'Feedback already submitted for this order';
  END IF;
  
  INSERT INTO feedback (order_id, customer_id, rating, comment)
  VALUES (p_order_id, v_current_user, p_rating_value, p_comment_text);
END;
$function$;

-- Fix 2: Add search_path to functions missing it
CREATE OR REPLACE FUNCTION public.get_menu_ratings()
RETURNS TABLE(menu_id_arg UUID, avg_rating NUMERIC, rating_count BIGINT)
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT
    o.menu_id as menu_id_arg,
    AVG(f.rating)::numeric(2,1) as avg_rating,
    COUNT(f.id) as rating_count
  FROM public.feedback f
  JOIN public.orders o ON f.order_id = o.id
  WHERE o.menu_id IS NOT NULL
  GROUP BY o.menu_id;
$function$;

CREATE OR REPLACE FUNCTION public.is_part_of_order(p_order_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders
    WHERE id = p_order_id
      AND (
        customer_id = p_user_id
        OR mom_id = p_user_id
        OR delivery_partner_id = p_user_id
      )
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_cart(user_id UUID)
RETURNS TABLE(id UUID, menu_id UUID, quantity INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT c.id, c.menu_id, c.quantity
  FROM cart c
  WHERE c.customer_id = user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_cart_items(user_id UUID)
RETURNS TABLE(id UUID, quantity INTEGER, menu_id UUID, menu JSON)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.quantity,
    c.menu_id,
    json_build_object(
      'title', m.title,
      'price', m.price,
      'mom_id', m.mom_id,
      'users', json_build_object('full_name', u.full_name)
    ) as menu
  FROM cart c
  JOIN menu m ON c.menu_id = m.id
  JOIN users u ON m.mom_id = u.id
  WHERE c.customer_id = user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_id = _user_id AND role = _role
    )
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    INSERT INTO public.users (id, email, full_name, phone)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'phone'
    );
    
    IF NEW.raw_user_meta_data->>'user_type' IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, NEW.raw_user_meta_data->>'user_type');
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.can_view_delivery_location(p_partner_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  is_customer BOOLEAN;
  is_mom BOOLEAN;
  current_user_id UUID := auth.uid();
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.delivery_partner_id = p_partner_id
    AND orders.customer_id = current_user_id
    AND orders.status = 'picked_up'
  ) INTO is_customer;

  IF is_customer THEN RETURN TRUE; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.delivery_partner_id = p_partner_id
    AND orders.mom_id = current_user_id
    AND (orders.status = 'ready' OR orders.status = 'picked_up')
  ) INTO is_mom;

  IF is_mom THEN RETURN TRUE; END IF;

  RETURN FALSE;
END;
$function$;

-- Fix 3: Add RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO public
  USING ((SELECT auth.uid())::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO public
  WITH CHECK ((SELECT auth.uid())::text = user_id::text);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO public
  USING ((SELECT auth.uid())::text = user_id::text)
  WITH CHECK ((SELECT auth.uid())::text = user_id::text);