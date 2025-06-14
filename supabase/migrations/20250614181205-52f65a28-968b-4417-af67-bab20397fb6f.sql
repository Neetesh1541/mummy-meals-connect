
-- Enable Row Level Security on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view other users' data.
-- This is necessary for customers to see mom's names on menu items.
CREATE POLICY "Allow authenticated users to view all users data"
ON public.users FOR SELECT
TO authenticated
USING (true);

-- Enable realtime updates on the menu table
ALTER TABLE public.menu REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu;
