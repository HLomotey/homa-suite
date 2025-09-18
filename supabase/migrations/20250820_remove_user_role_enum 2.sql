-- Remove user_role enum constraint to use dynamic roles table as single source of truth
-- This migration removes the enum constraint and allows any role name from the roles table

-- First, alter the users table to use TEXT instead of enum
ALTER TABLE public.users 
ALTER COLUMN role TYPE TEXT;

-- Drop the user_role enum type
DROP TYPE IF EXISTS user_role;

-- Add a foreign key constraint to ensure role values exist in roles table
-- But first, update any invalid role values to 'staff'
UPDATE public.users 
SET role = 'staff' 
WHERE role NOT IN (SELECT name FROM public.roles);

-- Add check constraint to ensure role exists in roles table
ALTER TABLE public.users 
ADD CONSTRAINT fk_users_role_name 
FOREIGN KEY (role) REFERENCES public.roles(name) ON UPDATE CASCADE;

-- Update the comment
COMMENT ON COLUMN public.users.role IS 'User role name that must exist in roles table';

-- Show the result
SELECT 
    'User role enum removed successfully' as status,
    'Role column now references roles table dynamically' as description;
