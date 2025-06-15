
-- Add a column to the menu table to indicate if an item is available for subscription
ALTER TABLE public.menu ADD COLUMN is_subscribable BOOLEAN DEFAULT FALSE;

-- Create a table for subscriptions
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.users(id) NOT NULL,
  menu_id UUID REFERENCES public.menu(id) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  frequency TEXT NOT NULL, -- e.g., 'daily', 'weekly'
  delivery_day TEXT, -- For weekly, e.g., 'monday'
  delivery_time TEXT, -- e.g., 'lunch', 'dinner'
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'paused', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  shipping_details JSONB
);

-- Enable RLS for subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can manage their own subscriptions
CREATE POLICY "Customers can manage their own subscriptions"
ON public.subscriptions
FOR ALL
USING (auth.uid() = customer_id);

-- Policy: Moms can view subscriptions for their menu items
CREATE POLICY "Moms can view subscriptions for their menu items"
ON public.subscriptions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.menu m
    WHERE m.id = subscriptions.menu_id AND m.mom_id = auth.uid()
  )
);

-- Add the new table to realtime
ALTER TABLE public.subscriptions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
