
-- Fix delivery partner dashboard real-time issues and location tracking
-- This migration addresses several issues:
-- 1. Ensures delivery partner location updates work in real-time
-- 2. Fixes order status update functions to work with proper user permissions
-- 3. Enables proper real-time notifications for location and order updates

-- Enable real-time for delivery partner locations (if not already done)
ALTER TABLE public.delivery_partner_locations REPLICA IDENTITY FULL;

-- Ensure the publication includes the delivery partner locations table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'delivery_partner_locations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_partner_locations;
    END IF;
END $$;

-- Create a function to safely update delivery partner location with proper permissions
CREATE OR REPLACE FUNCTION public.update_delivery_partner_location(
    p_latitude numeric,
    p_longitude numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $function$
BEGIN
    -- Insert or update the delivery partner's location
    INSERT INTO public.delivery_partner_locations (partner_id, latitude, longitude, updated_at)
    VALUES (auth.uid(), p_latitude, p_longitude, now())
    ON CONFLICT (partner_id)
    DO UPDATE SET 
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        updated_at = EXCLUDED.updated_at;
END;
$function$;

-- Create a function to safely accept orders with proper permissions
CREATE OR REPLACE FUNCTION public.accept_delivery_order(
    p_order_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
AS $function$
DECLARE
    updated_order record;
BEGIN
    -- Update the order with the delivery partner and change status
    UPDATE public.orders 
    SET 
        delivery_partner_id = auth.uid(),
        status = 'picked_up'
    WHERE 
        id = p_order_id 
        AND status = 'ready' 
        AND delivery_partner_id IS NULL
    RETURNING * INTO updated_order;
    
    -- Check if any row was updated
    IF updated_order.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Order is no longer available or already assigned'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'order_id', updated_order.id
    );
END;
$function$;

-- Create a function to safely complete deliveries with proper permissions
CREATE OR REPLACE FUNCTION public.complete_delivery_order(
    p_order_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
AS $function$
DECLARE
    updated_order record;
BEGIN
    -- Update the order status to delivered
    UPDATE public.orders 
    SET status = 'delivered'
    WHERE 
        id = p_order_id 
        AND delivery_partner_id = auth.uid()
        AND status = 'picked_up'
    RETURNING * INTO updated_order;
    
    -- Check if any row was updated
    IF updated_order.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Order cannot be completed or is not assigned to you'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'order_id', updated_order.id
    );
END;
$function$;
