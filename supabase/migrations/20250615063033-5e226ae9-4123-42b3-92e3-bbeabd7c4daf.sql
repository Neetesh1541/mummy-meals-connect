
-- This migration enables Row Level Security (RLS) and sets up the
-- necessary policies for the order tracking feature to function correctly.
-- It ensures that users can only see the data they are permitted to see.

-- First, let's secure the 'users' table.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow any logged-in user to view basic profile information.
-- This is needed for customers to see the Mom's name.
CREATE POLICY "Allow authenticated users to read user profiles"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own profile information.
CREATE POLICY "Allow users to update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Next, let's secure the 'orders' table.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow customers to view their own orders.
DROP POLICY IF EXISTS "Customers can see their own orders" ON public.orders;
CREATE POLICY "Customers can see their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = customer_id);

-- Finally, let's secure the 'menu' table.
ALTER TABLE public.menu ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view the menu items.
DROP POLICY IF EXISTS "Menu is visible to everyone" ON public.menu;
CREATE POLICY "Menu is visible to everyone"
ON public.menu
FOR SELECT
USING (true);
