-- Migration to remove all user role restrictions
-- This disables RLS policies and grants unrestricted access to all tables

-- Disable RLS on all tables that have role-based restrictions
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies that enforce role restrictions
-- Users table policies
DROP POLICY IF EXISTS "Allow authenticated users to read all users" ON public.users;
DROP POLICY IF EXISTS "Allow users to insert their own record" ON public.users;
DROP POLICY IF EXISTS "Allow users to update their own record" ON public.users;
DROP POLICY IF EXISTS "Allow admins to manage all users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.users;
DROP POLICY IF EXISTS "Allow individual write access" ON public.users;
DROP POLICY IF EXISTS "Allow service role full access" ON public.users;

-- Notifications table policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can create notifications for themselves" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role can manage all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;

-- Vehicles table policies
DROP POLICY IF EXISTS "Users can view vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can insert vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can update vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can delete vehicles" ON public.vehicles;

-- Roles table policies
DROP POLICY IF EXISTS "Users can view roles" ON public.roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;

-- Role permissions table policies
DROP POLICY IF EXISTS "Users can view role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Admins can manage role permissions" ON public.role_permissions;

-- User roles table policies
DROP POLICY IF EXISTS "Users can view user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Profiles table policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Grant unrestricted access to all authenticated users
-- This ensures all users can access all data without role restrictions

-- Grant full access to users table
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO anon;

-- Grant full access to notifications table
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO anon;

-- Grant full access to vehicles table
GRANT ALL ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO anon;

-- Grant full access to roles table
GRANT ALL ON public.roles TO authenticated;
GRANT ALL ON public.roles TO anon;

-- Grant full access to role_permissions table
GRANT ALL ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO anon;

-- Grant full access to user_roles table
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO anon;

-- Grant full access to profiles table
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO anon;

-- Grant sequence permissions for auto-incrementing IDs
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Add comment documenting the change
COMMENT ON SCHEMA public IS 'All role restrictions removed - unrestricted access granted to all users';
