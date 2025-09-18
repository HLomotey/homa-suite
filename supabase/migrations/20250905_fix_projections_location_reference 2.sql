-- Fix projections table to reference staff_locations instead of company_locations
-- Drop the existing foreign key constraint
ALTER TABLE projections DROP CONSTRAINT IF EXISTS fk_projections_location;

-- Add new foreign key constraint to reference staff_locations
ALTER TABLE projections 
ADD CONSTRAINT fk_projections_location 
FOREIGN KEY (location_id) REFERENCES staff_locations(id) ON DELETE RESTRICT;

-- Update the comment to reflect the correct reference
COMMENT ON COLUMN projections.location_id IS 'Reference to staff location';
