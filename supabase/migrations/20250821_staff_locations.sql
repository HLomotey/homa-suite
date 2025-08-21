-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create staff_locations table
CREATE TABLE IF NOT EXISTS staff_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_location_id UUID NOT NULL REFERENCES company_locations(id),
  location_code TEXT NOT NULL,
  location_description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Enable RLS on staff_locations table
ALTER TABLE staff_locations ENABLE ROW LEVEL SECURITY;

-- Create policies for staff_locations if they don't exist
DO $$ 
BEGIN
  -- Check if the policy exists before creating it
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff_locations' AND policyname = 'Users can view staff locations') THEN
    EXECUTE 'CREATE POLICY "Users can view staff locations" ON staff_locations FOR SELECT USING (true)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff_locations' AND policyname = 'Users can insert staff locations') THEN
    EXECUTE 'CREATE POLICY "Users can insert staff locations" ON staff_locations FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff_locations' AND policyname = 'Users can update staff locations') THEN
    EXECUTE 'CREATE POLICY "Users can update staff locations" ON staff_locations FOR UPDATE USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff_locations' AND policyname = 'Users can delete staff locations') THEN
    EXECUTE 'CREATE POLICY "Users can delete staff locations" ON staff_locations FOR DELETE USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- Create trigger to update timestamps
CREATE TRIGGER update_staff_locations_timestamp
BEFORE UPDATE ON staff_locations
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Add comments on table and columns for better documentation
COMMENT ON TABLE staff_locations IS 'Specific locations within company branches where staff can be assigned';
COMMENT ON COLUMN staff_locations.company_location_id IS 'Reference to the parent company location';
COMMENT ON COLUMN staff_locations.location_code IS 'Unique code for the staff location (e.g., MAIN-001)';
COMMENT ON COLUMN staff_locations.location_description IS 'Description of the staff location (e.g., "Main Office - First Floor")';
COMMENT ON COLUMN staff_locations.is_active IS 'Whether the staff location is currently active';
