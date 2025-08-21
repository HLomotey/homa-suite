-- Create maintenance_types table migration
-- This migration creates the maintenance_types table to match the TypeScript interface
-- Created: 2025-08-20

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create maintenance category enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'maintenance_category') THEN
    CREATE TYPE maintenance_category AS ENUM ('Preventive', 'Corrective', 'Predictive');
  END IF;
END $$;

-- Create maintenance_types table
CREATE TABLE IF NOT EXISTS maintenance_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category maintenance_category NOT NULL,
  estimated_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  estimated_duration DECIMAL(5, 2) NOT NULL DEFAULT 0.00, -- in hours
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_maintenance_types_category ON maintenance_types(category);
CREATE UNIQUE INDEX IF NOT EXISTS idx_maintenance_types_name_unique ON maintenance_types(name);

-- Enable RLS
ALTER TABLE maintenance_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view maintenance types" 
  ON maintenance_types FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert maintenance types" 
  ON maintenance_types FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update maintenance types" 
  ON maintenance_types FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete maintenance types" 
  ON maintenance_types FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_maintenance_types_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_maintenance_types_timestamp
  BEFORE UPDATE ON maintenance_types
  FOR EACH ROW EXECUTE FUNCTION update_maintenance_types_timestamp();

-- Add table comment
COMMENT ON TABLE maintenance_types IS 'Types of maintenance that can be performed on vehicles';

-- Insert default maintenance types
INSERT INTO maintenance_types (name, description, category, estimated_cost, estimated_duration) VALUES
('Oil Change', 'Regular engine oil and filter replacement', 'Preventive', 50.00, 1.00),
('Tire Rotation', 'Rotate tires to ensure even wear', 'Preventive', 25.00, 0.50),
('Brake Inspection', 'Check brake pads, rotors, and fluid', 'Preventive', 75.00, 1.50),
('Engine Repair', 'Major engine component repair or replacement', 'Corrective', 1500.00, 8.00),
('Transmission Service', 'Transmission fluid change and inspection', 'Preventive', 150.00, 2.00),
('Battery Replacement', 'Replace vehicle battery', 'Corrective', 120.00, 0.75),
('Air Filter Replacement', 'Replace engine air filter', 'Preventive', 30.00, 0.25),
('Coolant System Service', 'Flush and refill coolant system', 'Preventive', 100.00, 1.50),
('Suspension Repair', 'Repair or replace suspension components', 'Corrective', 800.00, 4.00),
('Diagnostic Check', 'Computer diagnostic scan for issues', 'Predictive', 100.00, 1.00)
ON CONFLICT (name) DO NOTHING;
