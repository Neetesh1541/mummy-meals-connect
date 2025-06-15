
-- Enable Row Level Security on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to see their own data,
-- and to allow participants of an order to see each other's contact details.
CREATE POLICY "Allow users to see their own data and order participants' data"
ON public.users
FOR SELECT
USING (
  id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.orders o
    WHERE
      (o.customer_id = auth.uid() AND (o.mom_id = id OR o.delivery_partner_id = id)) OR
      (o.mom_id = auth.uid() AND (o.customer_id = id OR o.delivery_partner_id = id)) OR
      (o.delivery_partner_id = auth.uid() AND (o.customer_id = id OR o.mom_id = id))
  )
);

-- Create a policy to allow users to update their own profile information.
CREATE POLICY "Allow users to update their own data"
ON public.users
FOR UPDATE
USING (id = auth.uid());
