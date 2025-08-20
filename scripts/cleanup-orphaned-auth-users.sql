-- Cleanup Orphaned Auth Users Script
-- This script identifies and removes auth users that don't have corresponding profiles
-- Use this when user creation fails after auth user is created but before profile is created

-- First, let's identify orphaned auth users (users in auth.users but not in public.profiles)
SELECT 
    au.id,
    au.email,
    au.created_at as auth_created_at,
    p.id as profile_id
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- If you want to see what users would be affected, run the above query first

-- To clean up orphaned auth users, uncomment and run the following:
-- WARNING: This will permanently delete auth users that don't have profiles
-- Make sure you really want to delete these users before running

/*
-- Delete orphaned auth users
DELETE FROM auth.users 
WHERE id IN (
    SELECT au.id
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
);
*/

-- Alternative: If you want to create profiles for existing auth users instead of deleting them
-- This is safer as it preserves the auth users and creates missing profiles

/*
-- Create profiles for orphaned auth users
INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
    NOW(),
    NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
*/

-- Verification query - run this after cleanup to confirm no orphaned users remain
SELECT 
    COUNT(*) as orphaned_auth_users_count
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
