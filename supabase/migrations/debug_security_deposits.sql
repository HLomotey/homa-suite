-- Debug security deposits system
-- Run this in Supabase SQL Editor to check current state

-- 1. Check if tables exist
SELECT 
  'Tables Status' as check_type,
  table_name,
  CASE WHEN table_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('security_deposits', 'security_deposit_deductions')
ORDER BY table_name;

-- 2. Check if triggers exist
SELECT 
  'Triggers Status' as check_type,
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_name LIKE '%security_deposit%' 
   OR trigger_name LIKE '%deduction%';

-- 3. Check current security deposits
SELECT 
  'Current Deposits' as check_type,
  COUNT(*) as total_deposits,
  COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_deposits
FROM security_deposits;

-- 4. Check current deductions
SELECT 
  'Current Deductions' as check_type,
  COUNT(*) as total_deductions,
  COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_deductions
FROM security_deposit_deductions;

-- 5. Check assignments that should have deposits
SELECT 
  'Assignments Needing Deposits' as check_type,
  COUNT(*) as active_assignments_with_tenants,
  COUNT(sd.id) as assignments_with_deposits
FROM assignments a
LEFT JOIN security_deposits sd ON a.id = sd.assignment_id
WHERE a.tenant_id IS NOT NULL 
  AND a.status = 'Active';

-- 6. Sample assignment data
SELECT 
  'Sample Assignment Data' as check_type,
  a.id,
  a.tenant_id,
  a.status,
  CASE WHEN sd.id IS NOT NULL THEN 'HAS_DEPOSIT' ELSE 'NO_DEPOSIT' END as deposit_status
FROM assignments a
LEFT JOIN security_deposits sd ON a.id = sd.assignment_id
WHERE a.tenant_id IS NOT NULL
LIMIT 5;
