-- Fix remaining function with mutable search_path
CREATE OR REPLACE FUNCTION public.update_delivery_partner_location(p_latitude NUMERIC, p_longitude NUMERIC)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    INSERT INTO public.delivery_partner_locations (partner_id, latitude, longitude, updated_at)
    VALUES (auth.uid(), p_latitude, p_longitude, now())
    ON CONFLICT (partner_id)
    DO UPDATE SET 
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        updated_at = EXCLUDED.updated_at;
END;
$function$;

-- Fix RLS for password_failed_verification_attempts table (internal table, restrict all access)
DROP POLICY IF EXISTS "Deny all access" ON public.password_failed_verification_attempts;
CREATE POLICY "Deny all access"
  ON public.password_failed_verification_attempts
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);