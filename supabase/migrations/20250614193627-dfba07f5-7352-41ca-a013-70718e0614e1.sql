
-- Add a column to store the estimated delivery time
ALTER TABLE public.orders
ADD COLUMN estimated_delivery_at TIMESTAMP WITH TIME ZONE;

-- Create a function to automatically set the estimated delivery time
-- when an order is marked as 'picked_up'. We'll estimate 30 minutes for delivery.
CREATE OR REPLACE FUNCTION set_estimated_delivery_time()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'picked_up' AND OLD.status != 'picked_up' THEN
        NEW.estimated_delivery_at = NOW() + INTERVAL '30 minutes';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run the function before an order is updated
CREATE TRIGGER on_order_picked_up_set_delivery_time
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION set_estimated_delivery_time();
