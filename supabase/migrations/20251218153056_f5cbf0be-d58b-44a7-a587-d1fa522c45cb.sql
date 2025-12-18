-- Remove overly permissive policies that expose all user data
DROP POLICY IF EXISTS "Allow authenticated users to read user profiles" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to view all users data" ON public.users;

-- Fix the broken "Allow users to see their own data and order participants' data" policy
-- The current policy has a logic error comparing o.mom_id = o.id instead of o.mom_id = users.id
DROP POLICY IF EXISTS "Allow users to see their own data and order participants' data" ON public.users;

-- Create a corrected policy for viewing own data + order participants
CREATE POLICY "Users can view their own data and order participants"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    (id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM orders o
      WHERE (
        -- I am the customer and this user is the mom or delivery partner
        (o.customer_id = auth.uid() AND (o.mom_id = users.id OR o.delivery_partner_id = users.id))
        OR
        -- I am the mom and this user is the customer or delivery partner
        (o.mom_id = auth.uid() AND (o.customer_id = users.id OR o.delivery_partner_id = users.id))
        OR
        -- I am the delivery partner and this user is the customer or mom
        (o.delivery_partner_id = auth.uid() AND (o.customer_id = users.id OR o.mom_id = users.id))
      )
    )
  );

-- Remove duplicate update policies
DROP POLICY IF EXISTS "Allow users to update their own data" ON public.users;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.users;

-- Keep just one clean update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Remove duplicate select policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;