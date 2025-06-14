
-- Create a table to store the last known location of delivery partners
CREATE TABLE public.delivery_partner_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add a trigger to automatically update the timestamp
CREATE OR REPLACE FUNCTION public.update_location_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_location_update_set_timestamp
BEFORE UPDATE ON public.delivery_partner_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_location_timestamp();

-- Enable Row Level Security
ALTER TABLE public.delivery_partner_locations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow delivery partners to insert and update their own location
CREATE POLICY "Delivery partners can manage their own location"
ON public.delivery_partner_locations
FOR ALL
USING (auth.uid() = partner_id)
WITH CHECK (auth.uid() = partner_id);

-- Policy: Allow customers to see the location of their delivery partner for active orders
CREATE POLICY "Customers can see their delivery partner location"
ON public.delivery_partner_locations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.delivery_partner_id = public.delivery_partner_locations.partner_id
    AND orders.customer_id = auth.uid()
    AND orders.status = 'picked_up'
  )
);

-- Policy: Allow moms to see the location of a delivery partner for their orders
CREATE POLICY "Moms can see their delivery partner location"
ON public.delivery_partner_locations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.delivery_partner_id = public.delivery_partner_locations.partner_id
    AND orders.mom_id = auth.uid()
    AND (orders.status = 'ready' OR orders.status = 'picked_up')
  )
);

-- Enable realtime updates on the new table
ALTER TABLE public.delivery_partner_locations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_partner_locations;
