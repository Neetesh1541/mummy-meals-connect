
-- Enable Row Level Security on the menu table
ALTER TABLE public.menu ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all menu items
CREATE POLICY "Allow all users to view menu" 
ON public.menu FOR SELECT 
USING (true);

-- Allow moms to insert new menu items for themselves
CREATE POLICY "Moms can create their own menu items"
ON public.menu FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = mom_id);

-- Allow moms to update their own menu items
CREATE POLICY "Moms can update their own menu items"
ON public.menu FOR UPDATE
TO authenticated
USING (auth.uid() = mom_id)
WITH CHECK (auth.uid() = mom_id);

-- Allow moms to delete their own menu items
CREATE POLICY "Moms can delete their own menu items"
ON public.menu FOR DELETE
TO authenticated
USING (auth.uid() = mom_id);
