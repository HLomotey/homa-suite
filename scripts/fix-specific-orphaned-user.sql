-- Fix Specific Orphaned User Script
-- Use this to fix a specific email address that's stuck in auth.users without a profile
-- Replace 'user@example.com' with the actual email address that's causing issues

-- Step 1: Check if the user exists in auth.users but not in profiles
-- Replace 'user@example.com' with the actual problematic email
DO $$
DECLARE
    user_email TEXT := 'user@example.com'; -- CHANGE THIS TO THE ACTUAL EMAIL
    auth_user_id UUID;
    profile_exists BOOLEAN := FALSE;
BEGIN
    -- Find the auth user
    SELECT id INTO auth_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF auth_user_id IS NOT NULL THEN
        RAISE NOTICE 'Found auth user with ID: %', auth_user_id;
        
        -- Check if profile exists
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = auth_user_id) INTO profile_exists;
        
        IF profile_exists THEN
            RAISE NOTICE 'Profile already exists for this user';
        ELSE
            RAISE NOTICE 'No profile found - this is an orphaned auth user';
            
            -- Option 1: Delete the orphaned auth user (uncomment to use)
            -- DELETE FROM auth.users WHERE id = auth_user_id;
            -- RAISE NOTICE 'Deleted orphaned auth user';
            
            -- Option 2: Create a profile for the existing auth user (recommended)
            INSERT INTO public.profiles (
                id, 
                email, 
                full_name, 
                status,
                created_at, 
                updated_at
            ) VALUES (
                auth_user_id,
                user_email,
                user_email, -- Use email as default name
                'pending',
                NOW(),
                NOW()
            );
            RAISE NOTICE 'Created profile for existing auth user';
        END IF;
    ELSE
        RAISE NOTICE 'No auth user found with email: %', user_email;
    END IF;
END $$;
