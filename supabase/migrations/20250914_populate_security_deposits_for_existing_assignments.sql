-- Populate security deposits for all existing assignments
-- Migration: 20250914_populate_security_deposits_for_existing_assignments.sql

-- Insert security deposits for all existing assignments that don't already have one
INSERT INTO public.security_deposits (
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
  'Migrated from existing assignment' as notes,
  NOW() as created_at,
  NOW() as updated_at
FROM assignments a
LEFT JOIN security_deposits sd ON sd.assignment_id = a.id
WHERE sd.id IS NULL  -- Only create deposits for assignments that don't have one
  AND a.tenant_id IS NOT NULL  -- Only for assignments with tenants
  AND a.status = 'Active';  -- Only for active assignments

-- The trigger function create_deduction_schedule() will automatically
-- create the deduction schedule for each new security deposit record

-- Add trigger to automatically create security deposits for new assignments
CREATE OR REPLACE FUNCTION create_security_deposit_for_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create security deposit if assignment has a tenant and is active
  IF NEW.tenant_id IS NOT NULL AND NEW.status = 'Active' THEN
    -- Check if security deposit already exists
    IF NOT EXISTS (
      SELECT 1 FROM security_deposits 
      WHERE assignment_id = NEW.id
    ) THEN
      -- Create security deposit
      INSERT INTO security_deposits (
        assignment_id,
        total_amount,
        payment_method,
        payment_status,
        notes
      ) VALUES (
        NEW.id,
        500.00,
        'payroll_deduction',
        'pending',
        'Auto-created for new assignment'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new assignments
DROP TRIGGER IF EXISTS trigger_create_security_deposit_on_assignment ON assignments;
CREATE TRIGGER trigger_create_security_deposit_on_assignment
  AFTER INSERT ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION create_security_deposit_for_assignment();

-- Create trigger for assignment updates (when tenant is added or status changes)
DROP TRIGGER IF EXISTS trigger_create_security_deposit_on_assignment_update ON assignments;
CREATE TRIGGER trigger_create_security_deposit_on_assignment_update
  AFTER UPDATE ON assignments
  FOR EACH ROW
  WHEN (
    -- Trigger when tenant_id is added or status becomes Active
    (OLD.tenant_id IS NULL AND NEW.tenant_id IS NOT NULL) OR
    (OLD.status != 'Active' AND NEW.status = 'Active')
  )
  EXECUTE FUNCTION create_security_deposit_for_assignment();

-- Add comment for documentation
COMMENT ON FUNCTION create_security_deposit_for_assignment() IS 'Automatically creates security deposits for assignments with tenants';
COMMENT ON TRIGGER trigger_create_security_deposit_on_assignment ON assignments IS 'Creates security deposit when new assignment is created';
COMMENT ON TRIGGER trigger_create_security_deposit_on_assignment_update ON assignments IS 'Creates security deposit when assignment gets tenant or becomes active';
