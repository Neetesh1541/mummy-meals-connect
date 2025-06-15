
-- Add a 'delivery_fee' column to the 'orders' table with a default value
ALTER TABLE public.orders ADD COLUMN delivery_fee NUMERIC DEFAULT 40.00;

-- Add an index for faster queries on earnings and delivery status
CREATE INDEX IF NOT EXISTS idx_orders_delivery_partner_id_status_created_at 
ON public.orders(delivery_partner_id, status, created_at);
