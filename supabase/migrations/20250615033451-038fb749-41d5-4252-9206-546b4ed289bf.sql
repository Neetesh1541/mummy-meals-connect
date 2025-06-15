
-- Create feedback table
CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraint to users table
ALTER TABLE public.feedback 
ADD CONSTRAINT fk_customer_id 
FOREIGN KEY (customer_id) 
REFERENCES public.users(id) ON DELETE CASCADE;

-- Indexes for performance
CREATE INDEX ON public.feedback (order_id);
CREATE INDEX ON public.feedback (customer_id);

-- RLS policies for feedback table
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all feedback
CREATE POLICY "Allow authenticated users to view all feedback"
ON public.feedback
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow users to insert feedback for their own orders
CREATE POLICY "Allow insert for own orders"
ON public.feedback
FOR INSERT
WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (
        SELECT 1
        FROM public.orders
        WHERE id = order_id AND public.orders.customer_id = auth.uid()
    )
);

-- Re-create the function to get menu ratings
CREATE OR REPLACE FUNCTION get_menu_ratings()
RETURNS TABLE (
  menu_id_arg uuid,
  avg_rating numeric,
  rating_count bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    o.menu_id as menu_id_arg,
    AVG(f.rating)::numeric(2,1) as avg_rating,
    COUNT(f.id) as rating_count
  FROM public.feedback f
  JOIN public.orders o ON f.order_id = o.id
  WHERE o.menu_id IS NOT NULL
  GROUP BY o.menu_id;
$$;
