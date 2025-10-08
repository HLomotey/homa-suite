-- Sync profiles table with auth.users data
-- This ensures all auth users have corresponding profile records

-- Insert missing profiles from auth.users (matching by email)
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
WHERE au.email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.email = au.email
  );

-- Update existing profiles with missing data (matching by email)
UPDATE public.profiles 
SET 
    id = au.id,
    full_name = COALESCE(
        profiles.full_name,
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        SPLIT_PART(au.email, '@', 1)
    ),
    updated_at = NOW()
FROM auth.users au
WHERE profiles.email = au.email
  AND (profiles.id IS NULL OR profiles.full_name IS NULL OR profiles.full_name = '');

-- Show sync result
SELECT 
    'Profiles synced successfully' as status,
    COUNT(*) as total_profiles
FROM public.profiles;
