-- Create maintenance_transactions table migration
-- This migration creates the maintenance_transactions table to match the TypeScript interface
-- Created: 2025-08-20

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create transaction status enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
    CREATE TYPE transaction_status AS ENUM ('Completed', 'Scheduled', 'In Progress', 'Cancelled');
  END IF;
END $$;

-- Create maintenance_transactions table
CREATE TABLE IF NOT EXISTS maintenance_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  maintenance_type_id UUID NOT NULL REFERENCES maintenance_types(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  issue TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  notes TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  status transaction_status NOT NULL DEFAULT 'Scheduled',
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_maintenance_transactions_vehicle_id ON maintenance_transactions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_transactions_maintenance_type_id ON maintenance_transactions(maintenance_type_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_transactions_date ON maintenance_transactions(date);
CREATE INDEX IF NOT EXISTS idx_maintenance_transactions_status ON maintenance_transactions(status);

-- Enable RLS
ALTER TABLE maintenance_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view maintenance transactions" 
  ON maintenance_transactions FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert maintenance transactions" 
  ON maintenance_transactions FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update maintenance transactions" 
  ON maintenance_transactions FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete maintenance transactions" 
  ON maintenance_transactions FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_maintenance_transactions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_maintenance_transactions_timestamp
  BEFORE UPDATE ON maintenance_transactions
  FOR EACH ROW EXECUTE FUNCTION update_maintenance_transactions_timestamp();

-- Add table comment
COMMENT ON TABLE maintenance_transactions IS 'Records of maintenance performed on vehicles';

-- Add column comments for clarity
COMMENT ON COLUMN maintenance_transactions.vehicle_id IS 'Reference to the vehicle that received maintenance';
COMMENT ON COLUMN maintenance_transactions.maintenance_type_id IS 'Reference to the type of maintenance performed';
COMMENT ON COLUMN maintenance_transactions.date IS 'Date when the maintenance was performed or scheduled';
COMMENT ON COLUMN maintenance_transactions.issue IS 'Description of the issue that required maintenance';
COMMENT ON COLUMN maintenance_transactions.amount IS 'Cost of the maintenance in currency units';
COMMENT ON COLUMN maintenance_transactions.notes IS 'Additional notes about the maintenance';
COMMENT ON COLUMN maintenance_transactions.performed_by IS 'Name or identifier of who performed the maintenance';
COMMENT ON COLUMN maintenance_transactions.status IS 'Current status of the maintenance transaction';
COMMENT ON COLUMN maintenance_transactions.receipt_url IS 'URL to receipt or invoice for the maintenance';
