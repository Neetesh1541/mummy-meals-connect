
-- Retroactively create a user profile and assign the 'customer' role 
-- to 'neeteshk1104@gmail.com' if they don't have one.
DO $$
DECLARE
    target_user_id UUID;
    target_user_email TEXT;
BEGIN
    -- Find the user_id and email from the authentication system.
    SELECT id, email INTO target_user_id, target_user_email 
    FROM auth.users 
    WHERE email = 'neeteshk1104@gmail.com';

    -- Proceed only if the user exists in the auth system and doesn't have a role yet.
    IF target_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = target_user_id) THEN
        
        -- Ensure the user record exists in the public users table to satisfy foreign key constraints.
        INSERT INTO public.users (id, email)
        VALUES (target_user_id, target_user_email)
        ON CONFLICT (id) DO NOTHING;

        -- Now, safely insert the 'customer' role for the user.
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'customer');
    END IF;
END $$;
