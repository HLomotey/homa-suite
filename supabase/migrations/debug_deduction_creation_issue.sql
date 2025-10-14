-- Debug why deductions exist without parent security deposits
-- This should help identify the root cause

-- 1. Check if deductions were created by the trigger or manually
SELECT 
  'Deduction Creation Analysis' as analysis_type,
  sdd.security_deposit_id,
  sdd.created_at,
  COUNT(*) as deduction_count,
  'Orphaned - No Parent Deposit' as status
FROM security_deposit_deductions sdd
LEFT JOIN security_deposits sd ON sdd.security_deposit_id = sd.id
WHERE sd.id IS NULL
GROUP BY sdd.security_deposit_id, sdd.created_at
ORDER BY sdd.created_at;

-- 2. Check if these deposit IDs exist in any other tables or were deleted
SELECT 
  'Missing Deposit IDs Check' as analysis_type,
  DISTINCT sdd.security_deposit_id as missing_deposit_id,
  'Does not exist in security_deposits table' as issue
FROM security_deposit_deductions sdd
LEFT JOIN security_deposits sd ON sdd.security_deposit_id = sd.id
WHERE sd.id IS NULL;

-- 3. Check if the trigger function is working correctly for new deposits
-- Let's see what happens when we create a test deposit
INSERT INTO security_deposits (
  assignment_id,
  total_amount,
  payment_method,
  payment_status,
  notes
) 
SELECT 
  a.id,
  500.00,
  'payroll_deduction',
  'pending',
  'Test deposit to verify trigger'
FROM assignments a
LEFT JOIN security_deposits sd ON a.id = sd.assignment_id
WHERE a.tenant_id IS NOT NULL 
  AND a.status = 'Active'
  AND sd.id IS NULL
LIMIT 1
RETURNING id, assignment_id;

-- 4. Check if deductions were created for the test deposit
SELECT 
  'Test Deposit Deductions' as analysis_type,
  sd.id as deposit_id,
  sd.assignment_id,
  COUNT(sdd.id) as deductions_created
FROM security_deposits sd
LEFT JOIN security_deposit_deductions sdd ON sd.id = sdd.security_deposit_id
WHERE sd.notes = 'Test deposit to verify trigger'
GROUP BY sd.id, sd.assignment_id;

-- 5. Clean up test deposit
DELETE FROM security_deposits WHERE notes = 'Test deposit to verify trigger';
