-- Debug orphaned deductions issue
-- Run this first to understand the current state

-- 1. Check how many deductions exist vs deposits
SELECT 
  'Current State Analysis' as analysis_type,
  (SELECT COUNT(*) FROM security_deposits) as total_deposits,
  (SELECT COUNT(*) FROM security_deposit_deductions) as total_deductions,
  (SELECT COUNT(DISTINCT security_deposit_id) FROM security_deposit_deductions) as unique_deposit_ids_referenced;

-- 2. Find orphaned deductions (deductions without parent deposits)
SELECT 
  'Orphaned Deductions' as analysis_type,
  sdd.security_deposit_id,
  COUNT(*) as deduction_count,
  MIN(sdd.scheduled_date) as earliest_deduction,
  MAX(sdd.scheduled_date) as latest_deduction,
  SUM(sdd.amount) as total_deduction_amount
FROM security_deposit_deductions sdd
LEFT JOIN security_deposits sd ON sdd.security_deposit_id = sd.id
WHERE sd.id IS NULL
GROUP BY sdd.security_deposit_id
ORDER BY earliest_deduction;

-- 3. Check if we have active assignments that could be linked to these deductions
SELECT 
  'Available Assignments' as analysis_type,
  a.id as assignment_id,
  a.tenant_id,
  a.tenant_name,
  a.property_name,
  a.room_name,
  a.status,
  CASE 
    WHEN sd.id IS NOT NULL THEN 'Has Deposit'
    ELSE 'No Deposit'
  END as deposit_status
FROM assignments a
LEFT JOIN security_deposits sd ON a.id = sd.assignment_id
WHERE a.tenant_id IS NOT NULL
ORDER BY a.created_at DESC;

-- 4. Show sample deduction records to understand the data structure
SELECT 
  'Sample Deduction Records' as analysis_type,
  sdd.*
FROM security_deposit_deductions sdd
LIMIT 5;
