-- Direct Orphaned User Cleanup
-- This script uses a more direct approach to handle orphaned auth users
-- Replace the email address below with your actual problematic email

-- Step 1: First, let's see what we're dealing with
-- Check auth users (this might require admin privileges)
SELECT 
    'Auth Users' as table_name,
    email,
    id,
    created_at
FROM auth.users 
WHERE email = 'junior@bohconcepts.com'  -- CHANGE THIS EMAIL
ORDER BY created_at DESC;

-- Check profiles
SELECT 
    'Profiles' as table_name,
    email,
    id,
    created_at
FROM public.profiles 
WHERE email = 'k@s.com'  -- CHANGE THIS EMAIL
ORDER BY created_at DESC;

-- Step 2: If you can't access auth.users directly, try this approach
-- Create a profile for the user if you know their auth ID
-- You can get the auth ID from the Supabase dashboard under Authentication > Users

/*
-- Method 1: If you know the auth user ID, create the missing profile
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    status,
    created_at,
    updated_at
) VALUES (
    'PASTE_AUTH_USER_ID_HERE',  -- Get this from Supabase dashboard
    'REPLACE_WITH_YOUR_EMAIL@example.com',
    'User Name',  -- Replace with actual name
    'pending',
    NOW(),
    NOW()
);
*/

-- Step 3: Alternative - Use Supabase admin functions if available
-- This requires the admin client and might need to be done via API

-- Step 4: If all else fails, delete via Supabase dashboard
-- Go to Authentication > Users in Supabase dashboard
-- Find the user by email and delete manually
