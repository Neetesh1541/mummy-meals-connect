
-- This migration enables realtime updates for the cart table.

-- Set replica identity to FULL for the cart table.
-- This ensures that the complete row data is available for realtime updates.
ALTER TABLE public.cart REPLICA IDENTITY FULL;

-- Add the cart table to the supabase_realtime publication.
-- This tells Supabase to broadcast changes from this table.
ALTER PUBLICATION supabase_realtime ADD TABLE public.cart;
