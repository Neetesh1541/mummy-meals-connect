
-- Add missing columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0;
