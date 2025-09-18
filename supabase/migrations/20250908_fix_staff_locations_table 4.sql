-- Fix staff_locations table structure and update functionality
-- Remove external_staff_id column dependency and fix update queries
-- Created: 2025-09-08

-- First, let's check if we need to modify the staff_locations table structure
-- The table should focus on location management with optional manager assignment

-- Update the staff_locations table to ensure proper structure
ALTER TABLE staff_locations 
DROP COLUMN IF EXISTS external_staff_id;

-- Ensure the manager_id column exists and has proper foreign key
ALTER TABLE staff_locations 
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES external_staff(id) ON DELETE SET NULL;

-- Create index for better performance on manager lookups
CREATE INDEX IF NOT EXISTS idx_staff_locations_manager_id ON staff_locations(manager_id);

-- Update any existing RLS policies to work with the new structure
DROP POLICY IF EXISTS "Users can view staff locations" ON staff_locations;
DROP POLICY IF EXISTS "Users can manage staff locations" ON staff_locations;

-- Create updated RLS policies
CREATE POLICY "Users can view staff locations" ON staff_locations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage staff locations" ON staff_locations
    FOR ALL USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON staff_locations TO authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
