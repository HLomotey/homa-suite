-- Simple migration: Add company account support to staff locations
-- This migration only adds the company_account_id field to staff_locations table

-- Add company_account_id column to staff_locations table
ALTER TABLE staff_locations 
ADD COLUMN IF NOT EXISTS company_account_id INTEGER REFERENCES company_accounts(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_staff_locations_company_account_id 
ON staff_locations(company_account_id);

-- Grant necessary permissions
GRANT SELECT ON company_accounts TO authenticated;
