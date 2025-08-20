-- Debug script to check user data across all tables

-- Check auth.users count
SELECT 'auth.users' as table_name, COUNT(*) as count FROM auth.users;

-- Check public.users count  
SELECT 'public.users' as table_name, COUNT(*) as count FROM public.users;

-- Check profiles count
SELECT 'profiles' as table_name, COUNT(*) as count FROM public.profiles;

-- Check what's in profiles table
SELECT 
    'profiles_data' as info,
    id,
    email,
    full_name,
    status,
    role_id,
    created_at
FROM public.profiles 
ORDER BY created_at DESC;

-- Check if profiles have role relationships
SELECT 
    'profiles_with_roles' as info,
    p.id,
    p.email,
    p.full_name,
    r.name as role_name,
    r.id as role_id
FROM public.profiles p
LEFT JOIN public.roles r ON p.role_id = r.id
ORDER BY p.created_at DESC;

-- Check RLS policies on profiles
SELECT 
    'profiles_policies' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';
