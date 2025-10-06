-- Simple Migration - Assignments Table Only
-- Created: 2025-10-05
-- This version only adds columns to assignments table to avoid any reference errors

-- Add missing columns to assignments table
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS transportation_agreement BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS transport_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS bus_card_agreement BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS bus_card_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS housing_agreement BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS rent_deposit_amount DECIMAL(10,2);

-- Add indexes for better performance on assignments table
CREATE INDEX IF NOT EXISTS idx_assignments_transport_agreement ON assignments(transportation_agreement);
CREATE INDEX IF NOT EXISTS idx_assignments_bus_agreement ON assignments(bus_card_agreement);
CREATE INDEX IF NOT EXISTS idx_assignments_housing_agreement ON assignments(housing_agreement);

-- Update existing assignments to have housing_agreement = true where rent_amount exists
UPDATE assignments 
SET housing_agreement = true 
WHERE rent_amount IS NOT NULL AND rent_amount > 0;

-- Add comments for documentation
COMMENT ON COLUMN assignments.transportation_agreement IS 'Whether staff member has transportation benefit agreement';
COMMENT ON COLUMN assignments.transport_amount IS 'Monthly transportation allowance amount';
COMMENT ON COLUMN assignments.bus_card_agreement IS 'Whether staff member has bus card benefit agreement';
COMMENT ON COLUMN assignments.bus_card_amount IS 'Bus card amount (one-time or periodic)';
COMMENT ON COLUMN assignments.housing_agreement IS 'Whether staff member has housing benefit agreement';
COMMENT ON COLUMN assignments.rent_deposit_amount IS 'Security deposit amount for housing';
