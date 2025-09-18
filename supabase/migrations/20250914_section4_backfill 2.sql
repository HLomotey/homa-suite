-- =====================================================
-- SECTION 4: Backfill and Test (run after Section 3)
-- Copy and run this section after triggers are created
-- =====================================================

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

-- Add comments
COMMENT ON TABLE security_deposits IS 'Security deposits for property assignments - fixed $500 amount with payroll deduction schedule';
COMMENT ON TABLE security_deposit_deductions IS 'Payroll deduction schedule for security deposits - 4 payments of $125 each on 7th and 22nd of each month';

-- Test the system by checking what was created
DO $$
DECLARE
  deposit_count INTEGER;
  deduction_count INTEGER;
  assignment_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO deposit_count FROM security_deposits;
  SELECT COUNT(*) INTO deduction_count FROM security_deposit_deductions;
  SELECT COUNT(*) INTO assignment_count FROM assignments WHERE tenant_id IS NOT NULL AND status = 'Active';
  
  RAISE NOTICE 'Migration Complete!';
  RAISE NOTICE 'Active assignments with tenants: %', assignment_count;
  RAISE NOTICE 'Security deposits created: %', deposit_count;
  RAISE NOTICE 'Total deductions scheduled: %', deduction_count;
END $$;

-- Final verification query
SELECT 
  'System Status' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM security_deposits) THEN 'Security deposits table working'
    ELSE 'No deposits found'
  END as status
UNION ALL
SELECT 
  'Deductions Status' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM security_deposit_deductions) THEN 'Deductions table working'
    ELSE 'No deductions found'
  END as status
UNION ALL
SELECT 
  'Triggers Status' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'trigger_create_security_deposit_on_assignment_insert'
    ) THEN 'Triggers active'
    ELSE 'Triggers missing'
  END as status;
