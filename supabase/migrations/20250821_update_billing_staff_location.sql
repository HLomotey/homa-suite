-- First, add a new column for staff_location_id as UUID
ALTER TABLE billing_staff ADD COLUMN staff_location_id UUID REFERENCES staff_locations(id);

-- Create a function to update the existing records (if needed in the future)
-- This is a placeholder and would need actual data mapping logic
CREATE OR REPLACE FUNCTION migrate_staff_locations()
RETURNS void AS $$
BEGIN
    -- This function would be used to map existing text locations to staff_location_id values
    -- For now, it's just a placeholder
    RAISE NOTICE 'Location migration would happen here';
END;
$$ LANGUAGE plpgsql;

-- We'll keep the old location column for backward compatibility
-- but mark it as deprecated in the comments
COMMENT ON COLUMN billing_staff.location IS 'DEPRECATED: Use staff_location_id instead. Will be removed in future versions.';
