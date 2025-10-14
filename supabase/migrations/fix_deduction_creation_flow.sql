-- Fix the deduction creation flow
-- The issue is that deductions are being created without parent security deposits

-- Step 1: Clean up orphaned deductions (they shouldn't exist without deposits)
DELETE FROM security_deposit_deductions 
WHERE security_deposit_id NOT IN (
  SELECT id FROM security_deposits
);

-- Step 2: Verify the security deposit creation trigger exists and works
-- Check if assignments trigger security deposit creation
SELECT 
  'Assignment Trigger Check' as check_type,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE table_name = 'assignments' 
  AND trigger_name LIKE '%security_deposit%';

-- Step 3: Manually create security deposits for active assignments that don't have them
-- This should trigger the deduction creation automatically
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
  a.id,
  500.00,
  'payroll_deduction',
  'pending',
  'Created to fix missing deposits',
  NOW(),
  NOW()
FROM assignments a
LEFT JOIN security_deposits sd ON a.id = sd.assignment_id
WHERE a.tenant_id IS NOT NULL 
  AND a.status = 'Active'
  AND sd.id IS NULL;

-- Step 4: Verify that deductions were created by the trigger
SELECT 
  'Verification After Fix' as check_type,
  sd.assignment_id,
  sd.total_amount,
  COUNT(sdd.id) as deduction_count,
  CASE 
    WHEN COUNT(sdd.id) = 4 THEN 'Complete'
    WHEN COUNT(sdd.id) > 0 THEN 'Partial'
    ELSE 'Missing'
  END as deduction_status
FROM security_deposits sd
LEFT JOIN security_deposit_deductions sdd ON sd.id = sdd.security_deposit_id
WHERE sd.notes = 'Created to fix missing deposits'
GROUP BY sd.id, sd.assignment_id, sd.total_amount;

-- Step 5: Check for any remaining orphaned deductions
SELECT 
  'Remaining Orphaned Deductions' as check_type,
  COUNT(*) as orphaned_count
FROM security_deposit_deductions sdd
LEFT JOIN security_deposits sd ON sdd.security_deposit_id = sd.id
WHERE sd.id IS NULL;
