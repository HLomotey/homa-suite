-- Fix properties table manager_id foreign key constraint
-- The PropertyForm uses external_staff for manager selection, but the constraint references billing_staff
-- This migration updates the foreign key to reference external_staff table

-- Drop the existing foreign key constraint
ALTER TABLE public.properties 
DROP CONSTRAINT IF EXISTS properties_manager_id_fkey;

-- Add new foreign key constraint referencing external_staff
ALTER TABLE public.properties 
ADD CONSTRAINT properties_manager_id_fkey 
FOREIGN KEY (manager_id) REFERENCES public.external_staff(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_properties_manager_id ON public.properties(manager_id);

-- Add comment for documentation
COMMENT ON COLUMN public.properties.manager_id IS 'Reference to external staff member who manages this property';
