
-- Create cart management functions
CREATE OR REPLACE FUNCTION get_cart_items(user_id UUID)
RETURNS TABLE (
  id UUID,
  quantity INTEGER,
  menu_id UUID,
  menu JSON
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

CREATE OR REPLACE FUNCTION get_user_cart(user_id UUID)
RETURNS TABLE (
  id UUID,
  menu_id UUID,
  quantity INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.menu_id, c.quantity
  FROM cart c
  WHERE c.customer_id = user_id;
END;
$$;

CREATE OR REPLACE FUNCTION add_to_cart(customer_id UUID, menu_item_id UUID, quantity INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO cart (customer_id, menu_id, quantity)
  VALUES (customer_id, menu_item_id, quantity)
  ON CONFLICT (customer_id, menu_id)
  DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity;
END;
$$;

CREATE OR REPLACE FUNCTION update_cart_quantity(cart_item_id UUID, new_quantity INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE cart 
  SET quantity = new_quantity
  WHERE id = cart_item_id;
END;
$$;

CREATE OR REPLACE FUNCTION remove_from_cart(cart_item_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM cart WHERE id = cart_item_id;
END;
$$;

CREATE OR REPLACE FUNCTION clear_cart(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM cart WHERE customer_id = user_id;
END;
$$;

CREATE OR REPLACE FUNCTION create_orders_from_cart(customer_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cart_item RECORD;
BEGIN
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
$$;

CREATE OR REPLACE FUNCTION submit_feedback(
  order_id UUID,
  customer_id UUID,
  rating_value INTEGER,
  comment_text TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO feedback (order_id, customer_id, rating, comment)
  VALUES (order_id, customer_id, rating_value, comment_text);
END;
$$;
