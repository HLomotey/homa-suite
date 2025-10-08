-- Backfill security deposits for existing active assignments with tenants
-- Migration: 20250914_005_backfill_existing_assignments.sql

-- Create security deposits for existing assignments that don't have them
INSERT INTO security_deposits (
  assignment_id,
  total_amount,
  payment_method,
  payment_status,
  notes,
  created_at,
  updated_at
)
SELECT 
  a.id as assignment_id,
  500.00 as total_amount,
  'payroll_deduction' as payment_method,
  'pending' as payment_status,
  'Backfilled via migration for existing assignment' as notes,
  NOW() as created_at,
  NOW() as updated_at
FROM assignments a
LEFT JOIN security_deposits sd ON sd.assignment_id = a.id
WHERE sd.id IS NULL  -- No existing deposit
  AND a.tenant_id IS NOT NULL  -- Has tenant assigned
  AND a.status = 'Active'  -- Assignment is active
  AND a.created_at < NOW();  -- Existing assignment (not just created)

-- Log the number of deposits created
DO $$
DECLARE
  deposit_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO deposit_count
  FROM security_deposits
  WHERE notes LIKE '%Backfilled via migration%';
  
  RAISE NOTICE 'Backfilled % security deposits for existing assignments', deposit_count;
END $$;
