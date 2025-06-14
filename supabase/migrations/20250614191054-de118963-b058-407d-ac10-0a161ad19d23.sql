
CREATE OR REPLACE FUNCTION public.notify_order_placed()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Notify the mom when an order is placed
    PERFORM pg_notify('order_placed', json_build_object('order_id', NEW.id, 'user_id', NEW.customer_id)::text);
    RETURN NEW;
END;
$function$
