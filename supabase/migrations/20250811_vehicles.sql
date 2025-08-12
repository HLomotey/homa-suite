-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE vehicle_status AS ENUM ('Active', 'Inactive', 'Maintenance', 'Sold');

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state TEXT NOT NULL,
  address TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  vin TEXT NOT NULL UNIQUE,
  year INTEGER NOT NULL,
  color TEXT NOT NULL,
  license_plate TEXT NOT NULL,
  status vehicle_status NOT NULL DEFAULT 'Active',
  purchase_date DATE NOT NULL,
  location_id UUID NOT NULL REFERENCES company_locations(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX idx_vehicles_location ON vehicles(location_id);

-- Enable RLS on vehicles table
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vehicles if they don't exist
DO $$ 
BEGIN
  -- Check if the policy exists before creating it
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vehicles' AND policyname = 'Users can view vehicles') THEN
    EXECUTE 'CREATE POLICY "Users can view vehicles" ON vehicles FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vehicles' AND policyname = 'Users can insert vehicles') THEN
    EXECUTE 'CREATE POLICY "Users can insert vehicles" ON vehicles FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vehicles' AND policyname = 'Users can update vehicles') THEN
    EXECUTE 'CREATE POLICY "Users can update vehicles" ON vehicles FOR UPDATE USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vehicles' AND policyname = 'Users can delete vehicles') THEN
    EXECUTE 'CREATE POLICY "Users can delete vehicles" ON vehicles FOR DELETE USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- Create trigger to update timestamps
CREATE TRIGGER update_vehicles_timestamp
BEFORE UPDATE ON vehicles
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Add comments on table and columns for better documentation
COMMENT ON TABLE vehicles IS 'Vehicles owned by the company';
COMMENT ON COLUMN vehicles.id IS 'Unique identifier for the vehicle';
COMMENT ON COLUMN vehicles.state IS 'State where the vehicle is registered';
COMMENT ON COLUMN vehicles.address IS 'Address where the vehicle is typically parked';
COMMENT ON COLUMN vehicles.make IS 'Manufacturer of the vehicle';
COMMENT ON COLUMN vehicles.model IS 'Model of the vehicle';
COMMENT ON COLUMN vehicles.vin IS 'Vehicle Identification Number - unique to each vehicle';
COMMENT ON COLUMN vehicles.year IS 'Year the vehicle was manufactured';
COMMENT ON COLUMN vehicles.color IS 'Color of the vehicle';
COMMENT ON COLUMN vehicles.license_plate IS 'License plate number of the vehicle';
COMMENT ON COLUMN vehicles.status IS 'Current operational status of the vehicle';
COMMENT ON COLUMN vehicles.purchase_date IS 'Date when the vehicle was purchased';
COMMENT ON COLUMN vehicles.location_id IS 'Company location where the vehicle is assigned';

-- Function to notify when a vehicle location is changed
CREATE OR REPLACE FUNCTION notify_vehicle_location_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.location_id IS DISTINCT FROM NEW.location_id THEN
    PERFORM pg_notify(
      'vehicle_location_change',
      json_build_object(
        'id', NEW.id,
        'make', NEW.make,
        'model', NEW.model,
        'license_plate', NEW.license_plate,
        'old_location_id', OLD.location_id,
        'new_location_id', NEW.location_id
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vehicle location change notification
CREATE TRIGGER notify_vehicle_location_change
AFTER UPDATE ON vehicles
FOR EACH ROW EXECUTE FUNCTION notify_vehicle_location_change();
