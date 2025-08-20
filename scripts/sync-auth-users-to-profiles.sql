-- Sync Auth Users to Profiles Table
-- This script creates profiles for all auth users that don't have them

-- First, let's see what we're working with
SELECT 
    'Current Profiles Count' as info,
    COUNT(*) as count
FROM public.profiles;

-- Create profiles for auth users that don't have them
-- Note: This requires admin access to auth.users table
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    status,
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name', 
        SPLIT_PART(au.email, '@', 1)
    ) as full_name,
    'active' as status,
    au.created_at,
    NOW() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
  AND au.email IS NOT NULL;

-- Show results
SELECT 
    'Profiles After Sync' as info,
    COUNT(*) as count
FROM public.profiles;

-- Show newly created profiles
SELECT 
    'Newly Created Profiles' as info,
    email,
    full_name,
    status,
    created_at
FROM public.profiles
WHERE updated_at >= NOW() - INTERVAL '1 minute'
ORDER BY created_at DESC;
