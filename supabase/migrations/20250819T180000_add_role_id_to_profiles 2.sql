-- Add role_id column to profiles table
-- This establishes the relationship between profiles and roles

-- Add role_id column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);

-- Update RLS policies to include role_id in selects
-- The existing policies should still work, but we may need to update them later

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.role_id IS 'Foreign key reference to roles table, nullable to allow users without roles';

-- Show result
SELECT 
    'role_id column added to profiles table' as status,
    COUNT(*) as total_profiles,
    COUNT(role_id) as profiles_with_roles
FROM public.profiles;
