-- Debug and fix security deposit trigger issues
-- Migration: 20250914_debug_security_deposit_triggers.sql

-- First, let's check if the triggers exist and recreate them properly
DROP TRIGGER IF EXISTS trigger_create_security_deposit_on_assignment ON assignments;
DROP TRIGGER IF EXISTS trigger_create_security_deposit_on_assignment_update ON assignments;
DROP FUNCTION IF EXISTS create_security_deposit_for_assignment();

-- Create improved function with better logging and error handling
CREATE OR REPLACE FUNCTION create_security_deposit_for_assignment()
RETURNS TRIGGER AS $$
DECLARE
  deposit_exists BOOLEAN := FALSE;
BEGIN
  -- Add logging to help debug
  RAISE NOTICE 'Trigger fired for assignment ID: %, tenant_id: %, status: %', NEW.id, NEW.tenant_id, NEW.status;
  
  -- Only create security deposit if assignment has a tenant and is active
  IF NEW.tenant_id IS NOT NULL AND NEW.status = 'Active' THEN
    -- Check if security deposit already exists
    SELECT EXISTS(
      SELECT 1 FROM security_deposits 
      WHERE assignment_id = NEW.id
    ) INTO deposit_exists;
    
    RAISE NOTICE 'Deposit exists for assignment %: %', NEW.id, deposit_exists;
    
    IF NOT deposit_exists THEN
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
        'Auto-created for assignment'
      );
      
      RAISE NOTICE 'Created security deposit for assignment %', NEW.id;
    ELSE
      RAISE NOTICE 'Security deposit already exists for assignment %', NEW.id;
    END IF;
  ELSE
    RAISE NOTICE 'Skipping security deposit creation - tenant_id: %, status: %', NEW.tenant_id, NEW.status;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in create_security_deposit_for_assignment: %', SQLERRM;
    RETURN NEW; -- Don't fail the main operation
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new assignments
CREATE TRIGGER trigger_create_security_deposit_on_assignment
  AFTER INSERT ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION create_security_deposit_for_assignment();

-- Create trigger for assignment updates (when tenant is added or status changes)
CREATE TRIGGER trigger_create_security_deposit_on_assignment_update
  AFTER UPDATE ON assignments
  FOR EACH ROW
  WHEN (
    -- Trigger when tenant_id is added or status becomes Active
    (OLD.tenant_id IS NULL AND NEW.tenant_id IS NOT NULL) OR
    (OLD.status != 'Active' AND NEW.status = 'Active') OR
    -- Also trigger when both conditions are met in an update
    (NEW.tenant_id IS NOT NULL AND NEW.status = 'Active' AND 
     (OLD.tenant_id != NEW.tenant_id OR OLD.status != NEW.status))
  )
  EXECUTE FUNCTION create_security_deposit_for_assignment();

-- Test the trigger by manually calling it for existing assignments
-- This will create deposits for any assignments that should have them but don't
INSERT INTO security_deposits (
  assignment_id,
  total_amount,
  payment_method,
  payment_status,
  notes
)
SELECT 
  a.id as assignment_id,
  500.00 as total_amount,
  'payroll_deduction' as payment_method,
  'pending' as payment_status,
  'Created via debug migration' as notes
FROM assignments a
LEFT JOIN security_deposits sd ON sd.assignment_id = a.id
WHERE sd.id IS NULL  -- Only create deposits for assignments that don't have one
  AND a.tenant_id IS NOT NULL  -- Only for assignments with tenants
  AND a.status = 'Active';  -- Only for active assignments

-- Add comments for documentation
COMMENT ON FUNCTION create_security_deposit_for_assignment() IS 'Automatically creates security deposits for assignments with tenants - includes debug logging';
COMMENT ON TRIGGER trigger_create_security_deposit_on_assignment ON assignments IS 'Creates security deposit when new assignment is created';
COMMENT ON TRIGGER trigger_create_security_deposit_on_assignment_update ON assignments IS 'Creates security deposit when assignment gets tenant or becomes active';
