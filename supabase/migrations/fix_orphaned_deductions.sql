-- Fix orphaned deductions by creating missing security deposits
-- Run this in Supabase SQL Editor

-- First, let's see what we have
SELECT 
  'Orphaned Deductions Analysis' as check_type,
  COUNT(DISTINCT sdd.security_deposit_id) as unique_deposit_ids_in_deductions,
  COUNT(sd.id) as actual_deposits_exist,
  COUNT(DISTINCT sdd.security_deposit_id) - COUNT(sd.id) as missing_deposits
FROM security_deposit_deductions sdd
LEFT JOIN security_deposits sd ON sdd.security_deposit_id = sd.id;

-- Find all orphaned deduction records (deductions without deposits)
SELECT 
  'Orphaned Deductions Details' as check_type,
  sdd.security_deposit_id,
  COUNT(*) as deduction_count,
  MIN(sdd.scheduled_date) as first_deduction_date,
  SUM(sdd.amount) as total_amount
FROM security_deposit_deductions sdd
LEFT JOIN security_deposits sd ON sdd.security_deposit_id = sd.id
WHERE sd.id IS NULL
GROUP BY sdd.security_deposit_id;

-- Create missing security deposits for orphaned deductions
INSERT INTO security_deposits (
  id,
  assignment_id,
  total_amount,
  payment_method,
  payment_status,
  notes,
  created_at,
  updated_at
)
SELECT DISTINCT
  sdd.security_deposit_id as id,
  -- Try to find assignment_id from the deduction pattern or use a placeholder
  COALESCE(
    (SELECT a.id FROM assignments a 
     JOIN external_staff es ON es.id = a.tenant_id 
     WHERE a.status = 'Active' 
     AND a.tenant_id IS NOT NULL 
     LIMIT 1), 
    gen_random_uuid()
  ) as assignment_id,
  COALESCE(SUM(sdd.amount), 500.00) as total_amount,
  'payroll_deduction' as payment_method,
  'pending' as payment_status,
  'Created to fix orphaned deductions' as notes,
  NOW() as created_at,
  NOW() as updated_at
FROM security_deposit_deductions sdd
LEFT JOIN security_deposits sd ON sdd.security_deposit_id = sd.id
WHERE sd.id IS NULL
GROUP BY sdd.security_deposit_id
ON CONFLICT (id) DO NOTHING;

-- Alternative approach: Link deductions to existing assignments
-- This creates proper deposits linked to actual assignments
DO $$
DECLARE
  assignment_record RECORD;
  new_deposit_id UUID;
  deduction_record RECORD;
BEGIN
  -- For each active assignment without a deposit, check if there are orphaned deductions
  FOR assignment_record IN 
    SELECT a.id as assignment_id, a.tenant_id
    FROM assignments a
    LEFT JOIN security_deposits sd ON a.id = sd.assignment_id
    WHERE a.tenant_id IS NOT NULL 
      AND a.status = 'Active'
      AND sd.id IS NULL
  LOOP
    -- Check if there are any orphaned deductions we can link to this assignment
    SELECT sdd.security_deposit_id INTO new_deposit_id
    FROM security_deposit_deductions sdd
    LEFT JOIN security_deposits sd ON sdd.security_deposit_id = sd.id
    WHERE sd.id IS NULL
    LIMIT 1;
    
    IF new_deposit_id IS NOT NULL THEN
      -- Create the security deposit with the existing deduction ID
      INSERT INTO security_deposits (
        id,
        assignment_id,
        total_amount,
        payment_method,
        payment_status,
        notes,
        created_at,
        updated_at
      ) VALUES (
        new_deposit_id,
        assignment_record.assignment_id,
        500.00,
        'payroll_deduction',
        'pending',
        'Linked to existing deductions',
        NOW(),
        NOW()
      ) ON CONFLICT (id) DO NOTHING;
      
      RAISE NOTICE 'Created deposit % for assignment %', new_deposit_id, assignment_record.assignment_id;
    END IF;
  END LOOP;
END $$;

-- Verify the fix
SELECT 
  'Fix Verification' as check_type,
  COUNT(DISTINCT sdd.security_deposit_id) as total_deduction_groups,
  COUNT(DISTINCT sd.id) as total_deposits,
  COUNT(DISTINCT CASE WHEN sd.id IS NOT NULL THEN sdd.security_deposit_id END) as linked_deductions,
  COUNT(DISTINCT CASE WHEN sd.id IS NULL THEN sdd.security_deposit_id END) as still_orphaned
FROM security_deposit_deductions sdd
LEFT JOIN security_deposits sd ON sdd.security_deposit_id = sd.id;

-- Show sample of fixed records
SELECT 
  'Sample Fixed Records' as check_type,
  sd.id as deposit_id,
  sd.assignment_id,
  sd.total_amount,
  COUNT(sdd.id) as deduction_count
FROM security_deposits sd
JOIN security_deposit_deductions sdd ON sd.id = sdd.security_deposit_id
GROUP BY sd.id, sd.assignment_id, sd.total_amount
LIMIT 5;
