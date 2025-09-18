-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create company_locations table
CREATE TABLE IF NOT EXISTS company_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Enable RLS on company_locations table
ALTER TABLE company_locations ENABLE ROW LEVEL SECURITY;

-- Create policies for company_locations if they don't exist
DO $$ 
BEGIN
  -- Check if the policy exists before creating it
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_locations' AND policyname = 'Users can view company locations') THEN
    EXECUTE 'CREATE POLICY "Users can view company locations" ON company_locations FOR SELECT USING (true)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_locations' AND policyname = 'Users can insert company locations') THEN
    EXECUTE 'CREATE POLICY "Users can insert company locations" ON company_locations FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_locations' AND policyname = 'Users can update company locations') THEN
    EXECUTE 'CREATE POLICY "Users can update company locations" ON company_locations FOR UPDATE USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_locations' AND policyname = 'Users can delete company locations') THEN
    EXECUTE 'CREATE POLICY "Users can delete company locations" ON company_locations FOR DELETE USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update timestamps
CREATE TRIGGER update_company_locations_timestamp
BEFORE UPDATE ON company_locations
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Add comments on table and columns for better documentation
COMMENT ON TABLE company_locations IS 'Company branch locations where vehicles can be assigned';
COMMENT ON COLUMN company_locations.name IS 'Name of the company location/branch';
COMMENT ON COLUMN company_locations.address IS 'Street address of the location';
COMMENT ON COLUMN company_locations.city IS 'City where the location is situated';
COMMENT ON COLUMN company_locations.state IS 'State/province where the location is situated';
COMMENT ON COLUMN company_locations.zip_code IS 'Postal/ZIP code of the location';
COMMENT ON COLUMN company_locations.country IS 'Country where the location is situated';
COMMENT ON COLUMN company_locations.phone IS 'Contact phone number for the location';
COMMENT ON COLUMN company_locations.email IS 'Contact email for the location';
COMMENT ON COLUMN company_locations.is_active IS 'Whether the location is currently active';
