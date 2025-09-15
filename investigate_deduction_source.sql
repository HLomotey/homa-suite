-- Investigate the source of orphaned deductions
-- Run this to understand how deductions got created without deposits

-- 1. Check if there are any security deposits at all
SELECT 
  'Security Deposits Count' as check_type,
  COUNT(*) as total_deposits,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_deposits
FROM security_deposits;

-- 2. Check deductions without parent deposits
SELECT 
  'Orphaned Deductions Analysis' as check_type,
  COUNT(*) as total_orphaned_deductions,
  COUNT(DISTINCT security_deposit_id) as unique_orphaned_deposit_ids,
  MIN(created_at) as earliest_orphaned,
  MAX(created_at) as latest_orphaned
FROM security_deposit_deductions sdd
LEFT JOIN security_deposits sd ON sdd.security_deposit_id = sd.id
WHERE sd.id IS NULL;

-- 3. Show sample orphaned deduction records with their IDs
SELECT 
  'Sample Orphaned Deductions' as check_type,
  sdd.id as deduction_id,
  sdd.security_deposit_id as missing_deposit_id,
  sdd.deduction_number,
  sdd.scheduled_date,
  sdd.amount,
  sdd.status,
  sdd.created_at
FROM security_deposit_deductions sdd
LEFT JOIN security_deposits sd ON sdd.security_deposit_id = sd.id
WHERE sd.id IS NULL
ORDER BY sdd.security_deposit_id, sdd.deduction_number
LIMIT 10;

-- 4. Check if these deposit IDs follow UUID pattern (generated vs manual)
SELECT 
  'Deposit ID Pattern Analysis' as check_type,
  sdd.security_deposit_id,
  CASE 
    WHEN sdd.security_deposit_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
    THEN 'Valid UUID'
    ELSE 'Invalid UUID'
  END as id_format,
  COUNT(*) as deduction_count
FROM security_deposit_deductions sdd
LEFT JOIN security_deposits sd ON sdd.security_deposit_id = sd.id
WHERE sd.id IS NULL
GROUP BY sdd.security_deposit_id
ORDER BY sdd.security_deposit_id;

-- 5. Check if the trigger exists and is enabled
SELECT 
  'Trigger Status' as check_type,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement,
  trigger_schema,
  trigger_catalog
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_create_deduction_schedule';

-- 6. Check if there are any assignments that should have deposits but don't
SELECT 
  'Assignments Without Deposits' as check_type,
  a.id as assignment_id,
  a.tenant_name,
  a.status,
  a.created_at,
  CASE WHEN sd.id IS NOT NULL THEN 'Has Deposit' ELSE 'Missing Deposit' END as deposit_status
FROM assignments a
LEFT JOIN security_deposits sd ON a.id = sd.assignment_id
WHERE a.tenant_id IS NOT NULL 
  AND a.status = 'Active'
ORDER BY a.created_at DESC
LIMIT 10;
