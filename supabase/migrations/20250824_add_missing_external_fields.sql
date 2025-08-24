-- Migration to add missing external system fields to billing_staff table
-- This ensures all fields from the external system have corresponding database columns

-- Add missing address components
ALTER TABLE billing_staff 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT;

-- Add missing work-related fields
ALTER TABLE billing_staff 
ADD COLUMN IF NOT EXISTS supervisor TEXT,
ADD COLUMN IF NOT EXISTS work_location TEXT,
ADD COLUMN IF NOT EXISTS pay_frequency TEXT;

-- Add comments for the new fields
COMMENT ON COLUMN billing_staff.city IS 'City from external system address';
COMMENT ON COLUMN billing_staff.state IS 'State/Province from external system address';
COMMENT ON COLUMN billing_staff.zip_code IS 'ZIP/Postal code from external system address';
COMMENT ON COLUMN billing_staff.country IS 'Country from external system address';
COMMENT ON COLUMN billing_staff.supervisor IS 'Direct supervisor/manager name';
COMMENT ON COLUMN billing_staff.work_location IS 'Specific work location/office';
COMMENT ON COLUMN billing_staff.pay_frequency IS 'Payment frequency (Monthly, Bi-weekly, etc.)';

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_billing_staff_city ON billing_staff(city);
CREATE INDEX IF NOT EXISTS idx_billing_staff_state ON billing_staff(state);
CREATE INDEX IF NOT EXISTS idx_billing_staff_supervisor ON billing_staff(supervisor);
CREATE INDEX IF NOT EXISTS idx_billing_staff_work_location ON billing_staff(work_location);

-- Update the unified view to include new fields
DROP VIEW IF EXISTS staff_unified_view;
CREATE VIEW staff_unified_view AS
SELECT 
  id,
  -- Personal Information
  legal_name,
  first_name,
  last_name,
  middle_name,
  preferred_name,
  birth_name,
  date_of_birth,
  
  -- Contact Information
  email,
  phone_number,
  address,
  city,
  state,
  zip_code,
  country,
  
  -- Emergency Contacts
  emergency_contact_name,
  emergency_contact_phone,
  emergency_contact_relationship,
  
  -- Personal Details
  marital_status,
  gender,
  ethnicity_race,
  veteran_status,
  disability_status,
  
  -- Work Information
  employee_id,
  job_title,
  department,
  location, -- DEPRECATED
  staff_location_id,
  supervisor,
  work_location,
  employment_status,
  hire_date,
  termination_date,
  
  -- Compensation
  salary,
  hourly_rate,
  pay_frequency,
  
  -- System fields
  created_at,
  updated_at
FROM billing_staff;

COMMENT ON VIEW staff_unified_view IS 'Unified view of staff data including all external system fields';
