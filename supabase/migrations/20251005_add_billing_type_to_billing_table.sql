-- Add billing_type column to billing table to support both housing and transportation billing
-- This allows the same billing system to handle both types of charges

-- Create billing type enum
DO $$ 
BEGIN
  -- Create the enum type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_type') THEN
    CREATE TYPE billing_type AS ENUM ('housing', 'transportation');
  END IF;
END
$$;

-- Add billing_type column to billing table
ALTER TABLE public.billing 
ADD COLUMN IF NOT EXISTS billing_type billing_type NOT NULL DEFAULT 'housing';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_billing_billing_type ON billing(billing_type);

-- Add comment for documentation
COMMENT ON COLUMN billing.billing_type IS 'Type of billing: housing for rent charges, transportation for transport charges';

-- Update existing records to be housing type (since they were all housing before)
UPDATE billing SET billing_type = 'housing' WHERE billing_type IS NULL;

-- Create a view for transportation billing specifically
CREATE OR REPLACE VIEW transportation_billing_view AS
SELECT 
  b.*,
  es."PAYROLL FIRST NAME" || ' ' || es."PAYROLL LAST NAME" AS tenant_name,
  p.title AS property_name,
  r.name AS room_name,
  a.status AS assignment_status,
  a.end_date AS assignment_end_date
FROM billing b
LEFT JOIN external_staff es ON b.tenant_id = es.id
LEFT JOIN properties p ON b.property_id::text = p.id::text
LEFT JOIN rooms r ON b.room_id::text = r.id::text
LEFT JOIN assignments a ON a.tenant_id = b.tenant_id 
  AND a.property_id::text = b.property_id::text 
  AND a.room_id::text = b.room_id::text
WHERE b.billing_type = 'transportation';

-- Create a view for housing billing specifically
CREATE OR REPLACE VIEW housing_billing_view AS
SELECT 
  b.*,
  es."PAYROLL FIRST NAME" || ' ' || es."PAYROLL LAST NAME" AS tenant_name,
  p.title AS property_name,
  r.name AS room_name,
  a.status AS assignment_status,
  a.end_date AS assignment_end_date
FROM billing b
LEFT JOIN external_staff es ON b.tenant_id = es.id
LEFT JOIN properties p ON b.property_id::text = p.id::text
LEFT JOIN rooms r ON b.room_id::text = r.id::text
LEFT JOIN assignments a ON a.tenant_id = b.tenant_id 
  AND a.property_id::text = b.property_id::text 
  AND a.room_id::text = b.room_id::text
WHERE b.billing_type = 'housing';

-- Add comments on views
COMMENT ON VIEW transportation_billing_view IS 'View for transportation billing records with staff and property details';
COMMENT ON VIEW housing_billing_view IS 'View for housing billing records with staff and property details';
