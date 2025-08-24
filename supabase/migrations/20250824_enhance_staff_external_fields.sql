-- Migration: Enhance billing_staff table with external system fields
-- This migration adds new fields from the external system while maintaining backward compatibility

-- Add new fields to billing_staff table
ALTER TABLE billing_staff 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS middle_name TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Update existing records to populate new fields from legal_name
-- This ensures backward compatibility by splitting existing legal_name into first_name and last_name
UPDATE billing_staff 
SET 
  first_name = CASE 
    WHEN legal_name IS NOT NULL AND position(' ' in legal_name) > 0 
    THEN split_part(legal_name, ' ', 1)
    ELSE legal_name
  END,
  last_name = CASE 
    WHEN legal_name IS NOT NULL AND position(' ' in legal_name) > 0 
    THEN substring(legal_name from position(' ' in legal_name) + 1)
    ELSE ''
  END
WHERE first_name IS NULL OR last_name IS NULL;

-- Create a function to automatically update legal_name when first_name or last_name changes
-- This maintains backward compatibility for existing code that relies on legal_name
CREATE OR REPLACE FUNCTION update_legal_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Update legal_name whenever first_name or last_name changes
  IF NEW.first_name IS NOT NULL OR NEW.last_name IS NOT NULL THEN
    NEW.legal_name = TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update legal_name
DROP TRIGGER IF EXISTS trigger_update_legal_name ON billing_staff;
CREATE TRIGGER trigger_update_legal_name
  BEFORE INSERT OR UPDATE OF first_name, last_name ON billing_staff
  FOR EACH ROW
  EXECUTE FUNCTION update_legal_name();

-- Add indexes for better query performance on new fields
CREATE INDEX IF NOT EXISTS idx_billing_staff_first_name ON billing_staff(first_name);
CREATE INDEX IF NOT EXISTS idx_billing_staff_last_name ON billing_staff(last_name);
CREATE INDEX IF NOT EXISTS idx_billing_staff_date_of_birth ON billing_staff(date_of_birth);

-- Add comments to document the new fields
COMMENT ON COLUMN billing_staff.first_name IS 'First name from external system - used to compute legal_name';
COMMENT ON COLUMN billing_staff.last_name IS 'Last name from external system - used to compute legal_name';
COMMENT ON COLUMN billing_staff.middle_name IS 'Middle name from external system';
COMMENT ON COLUMN billing_staff.date_of_birth IS 'Date of birth from external system';
COMMENT ON COLUMN billing_staff.legal_name IS 'Full name for backward compatibility - automatically computed from first_name + last_name';

-- Create a view that provides both old and new field structures for easy querying
CREATE OR REPLACE VIEW staff_unified_view AS
SELECT 
  id,
  -- New structure (external system compatible)
  first_name,
  last_name,
  middle_name,
  date_of_birth,
  
  -- Existing structure (backward compatible)
  legal_name,
  preferred_name,
  birth_name,
  
  -- Contact Information
  email,
  phone_number,
  address,
  
  -- Emergency Contacts
  emergency_contact_name,
  emergency_contact_phone,
  emergency_contact_relationship,
  
  -- Personal Details
  marital_status,
  
  -- EEO Data
  gender,
  ethnicity_race,
  veteran_status,
  disability_status,
  
  -- Work-Related Information
  employee_id,
  job_title,
  department,
  location,
  staff_location_id,
  employment_status,
  hire_date,
  termination_date,
  
  -- Compensation Information
  salary,
  hourly_rate,
  
  -- System fields
  created_at,
  updated_at
FROM billing_staff;

-- Grant appropriate permissions on the view
GRANT SELECT ON staff_unified_view TO authenticated;
GRANT SELECT ON staff_unified_view TO service_role;
