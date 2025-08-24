-- Create external_staff table with EXACT 31 columns from external system
-- This table will store staff data imported from external system

CREATE TABLE IF NOT EXISTS external_staff (
  -- Column 1: ID (Primary Key)
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Column 2: FIRST_NAME
  first_name TEXT,
  
  -- Column 3: LAST_NAME  
  last_name TEXT,
  
  -- Column 4: MIDDLE_NAME
  middle_name TEXT,
  
  -- Column 5: E_MAIL
  e_mail TEXT,
  
  -- Column 6: DATE_OF_BIRTH
  date_of_birth DATE,
  
  -- Column 7: PHONE_N
  phone_n TEXT,
  
  -- Column 8: ADDRESS
  address TEXT,
  
  -- Column 9: CITY
  city TEXT,
  
  -- Column 10: STATE
  state TEXT,
  
  -- Column 11: ZIP_CODE
  zip_code TEXT,
  
  -- Column 12: COUNTRY
  country TEXT,
  
  -- Column 13: GENDER
  gender TEXT,
  
  -- Column 14: MARITAL_STATUS
  marital_status TEXT,
  
  -- Column 15: DEPARTMENT
  department TEXT,
  
  -- Column 16: POSITION
  position TEXT,
  
  -- Column 17: EMPLOYMENT_STATUS
  employment_status TEXT,
  
  -- Column 18: HIRE_DATE
  hire_date DATE,
  
  -- Column 19: TERMINATION_DATE
  termination_date DATE,
  
  -- Column 20: SUPERVISOR
  supervisor TEXT,
  
  -- Column 21: WORK_LOCATION
  work_location TEXT,
  
  -- Column 22: SALARY
  salary DECIMAL(12,2),
  
  -- Column 23: HOURLY_RATE
  hourly_rate DECIMAL(8,2),
  
  -- Column 24: PAY_FREQUENCY
  pay_frequency TEXT,
  
  -- Column 25: EMERGENCY_CONTACT_NAME
  emergency_contact_name TEXT,
  
  -- Column 26: EMERGENCY_CONTACT_PHONE
  emergency_contact_phone TEXT,
  
  -- Column 27: EMERGENCY_CONTACT_RELATIONSHIP
  emergency_contact_relationship TEXT,
  
  -- Column 28: ETHNICITY_RACE
  ethnicity_race TEXT,
  
  -- Column 29: VETERAN_STATUS
  veteran_status TEXT,
  
  -- Column 30: DISABILITY_STATUS
  disability_status TEXT,
  
  -- Column 31: External Staff ID (from external system)
  external_staff_id TEXT,
  
  -- System fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_external_staff_external_id ON external_staff(external_staff_id);
CREATE INDEX IF NOT EXISTS idx_external_staff_email ON external_staff(e_mail);
CREATE INDEX IF NOT EXISTS idx_external_staff_first_last_name ON external_staff(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_external_staff_department ON external_staff(department);
CREATE INDEX IF NOT EXISTS idx_external_staff_employment_status ON external_staff(employment_status);

-- Add comments for documentation
COMMENT ON TABLE external_staff IS 'External staff data imported from external HR system with exact column structure';
COMMENT ON COLUMN external_staff.external_staff_id IS 'Original staff ID from external system';
COMMENT ON COLUMN external_staff.e_mail IS 'Email address (exact column name from external system)';
COMMENT ON COLUMN external_staff.phone_n IS 'Phone number (exact column name from external system)';
COMMENT ON COLUMN external_staff.date_of_birth IS 'Date of birth';
COMMENT ON COLUMN external_staff.position IS 'Job position/title';
COMMENT ON COLUMN external_staff.work_location IS 'Work location/office';
COMMENT ON COLUMN external_staff.pay_frequency IS 'Payment frequency (Monthly, Bi-weekly, etc.)';

-- Enable RLS (Row Level Security)
ALTER TABLE external_staff ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view external staff data" ON external_staff
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert external staff data" ON external_staff
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update external staff data" ON external_staff
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete external staff data" ON external_staff
  FOR DELETE USING (auth.role() = 'authenticated');
