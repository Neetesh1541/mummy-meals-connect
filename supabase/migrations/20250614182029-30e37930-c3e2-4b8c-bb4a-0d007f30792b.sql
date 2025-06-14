
-- This function is triggered when a new user signs up.
-- We are modifying it to no longer write to the redundant `user_type` column in the `users` table,
-- which will bypass the faulty check constraint causing the signup to fail.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert into users table, but without the problematic user_type column
    INSERT INTO public.users (id, email, full_name, phone)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'phone'
    );
    
    -- This part correctly inserts the role into the user_roles table, and remains unchanged.
    IF NEW.raw_user_meta_data->>'user_type' IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, NEW.raw_user_meta_data->>'user_type');
    END IF;
    
    RETURN NEW;
END;
$$;
