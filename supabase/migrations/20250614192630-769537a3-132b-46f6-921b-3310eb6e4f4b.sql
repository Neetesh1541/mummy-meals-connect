
-- Create a trigger to notify moms of new orders by executing the existing function
CREATE TRIGGER on_order_placed_notify_mom
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.notify_order_placed();

-- Enable Row Level Security on the orders table to make realtime more reliable and secure
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow customers to see their own orders
CREATE POLICY "Customers can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = customer_id);

-- RLS Policy: Allow moms to see orders placed for their menu items
CREATE POLICY "Moms can view orders for their menus"
  ON public.orders FOR SELECT
  USING (auth.uid() = mom_id);

-- RLS Policy: Allow delivery partners to see orders assigned to them
CREATE POLICY "Delivery partners can see their assigned orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = delivery_partner_id);
