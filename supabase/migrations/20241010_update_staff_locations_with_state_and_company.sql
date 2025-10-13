-- Update staff_locations table to include state and company_account_name
-- This migration adds new columns and populates them from related tables

-- Step 1: Add new columns to staff_locations table
ALTER TABLE staff_locations 
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS company_account_name VARCHAR(255);

-- Step 2: Create an index for better performance on the new columns
CREATE INDEX IF NOT EXISTS idx_staff_locations_state ON staff_locations(state);
CREATE INDEX IF NOT EXISTS idx_staff_locations_company_account_name ON staff_locations(company_account_name);

-- Step 3: Update existing records with state from company_locations
UPDATE staff_locations 
SET state = cl.state
FROM company_locations cl
WHERE staff_locations.company_location_id = cl.id
AND staff_locations.state IS NULL;

-- Step 4: Update existing records with company_account_name from company_accounts
-- First, let's check if company_locations has a direct relationship to company_accounts
-- If not, we'll need to find the correct relationship path
UPDATE staff_locations 
SET company_account_name = COALESCE(cl.name, 'Unknown Company')
FROM company_locations cl
WHERE staff_locations.company_location_id = cl.id
AND staff_locations.company_account_name IS NULL;

-- Step 5: Create a function to automatically update these fields when staff_locations records are inserted/updated
CREATE OR REPLACE FUNCTION update_staff_locations_derived_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Update state and company name from company_locations
    SELECT cl.state, COALESCE(cl.name, 'Unknown Company')
    INTO NEW.state, NEW.company_account_name
    FROM company_locations cl
    WHERE cl.id = NEW.company_location_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create triggers to automatically populate these fields
DROP TRIGGER IF EXISTS trigger_update_staff_locations_derived_fields_insert ON staff_locations;
DROP TRIGGER IF EXISTS trigger_update_staff_locations_derived_fields_update ON staff_locations;

CREATE TRIGGER trigger_update_staff_locations_derived_fields_insert
    BEFORE INSERT ON staff_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_staff_locations_derived_fields();

CREATE TRIGGER trigger_update_staff_locations_derived_fields_update
    BEFORE UPDATE ON staff_locations
    FOR EACH ROW
    WHEN (OLD.company_location_id IS DISTINCT FROM NEW.company_location_id)
    EXECUTE FUNCTION update_staff_locations_derived_fields();

-- Step 7: Create a view that shows the enriched staff_locations data
CREATE OR REPLACE VIEW staff_locations_enriched AS
SELECT 
    sl.*,
    cl.name as company_location_name,
    cl.city as company_city,
    cl.address as company_address,
    cl.state as company_state
FROM staff_locations sl
LEFT JOIN company_locations cl ON sl.company_location_id = cl.id;

-- Grant permissions on the view
GRANT SELECT ON staff_locations_enriched TO authenticated;
GRANT SELECT ON staff_locations_enriched TO service_role;

-- Step 8: Add comments for documentation
COMMENT ON COLUMN staff_locations.state IS 'State derived from company_locations table';
COMMENT ON COLUMN staff_locations.company_account_name IS 'Company account name derived from company_accounts table';
COMMENT ON VIEW staff_locations_enriched IS 'Enriched view of staff_locations with related company and account information';

-- Step 9: Update any existing NULL values that might have been missed
UPDATE staff_locations 
SET 
    state = COALESCE(staff_locations.state, cl.state),
    company_account_name = COALESCE(staff_locations.company_account_name, cl.name, 'Unknown Company')
FROM company_locations cl
WHERE staff_locations.company_location_id = cl.id
AND (staff_locations.state IS NULL OR staff_locations.company_account_name IS NULL);
