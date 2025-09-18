-- Create triggers for automatic security deposit creation on assignments
-- Migration: 20250914_003_create_security_deposit_triggers.sql

-- Function to automatically create security deposit when assignment becomes active with tenant
CREATE OR REPLACE FUNCTION create_security_deposit_for_assignment()
RETURNS TRIGGER AS $$
DECLARE
  deposit_exists BOOLEAN := FALSE;
  new_deposit_id UUID;
BEGIN
  -- Log trigger execution for debugging
  RAISE NOTICE 'Security deposit trigger fired for assignment ID: %, tenant_id: %, status: %', 
    NEW.id, NEW.tenant_id, NEW.status;
  
  -- Only create deposit if assignment has tenant and is active
  IF NEW.tenant_id IS NOT NULL AND NEW.status = 'Active' THEN
    -- Check if deposit already exists for this assignment
    SELECT EXISTS(
      SELECT 1 FROM security_deposits 
      WHERE assignment_id = NEW.id
    ) INTO deposit_exists;
    
    RAISE NOTICE 'Deposit exists for assignment %: %', NEW.id, deposit_exists;
    
    -- Create deposit if it doesn't exist
    IF NOT deposit_exists THEN
      INSERT INTO security_deposits (
        assignment_id,
        total_amount,
        payment_method,
        payment_status,
        notes,
        created_at
      ) VALUES (
        NEW.id,
        500.00,
        'payroll_deduction',
        'pending',
        'Auto-created for active assignment with tenant',
        NOW()
      ) RETURNING id INTO new_deposit_id;
      
      RAISE NOTICE 'Created security deposit % for assignment %', new_deposit_id, NEW.id;
    ELSE
      RAISE NOTICE 'Security deposit already exists for assignment %', NEW.id;
    END IF;
  ELSE
    RAISE NOTICE 'Skipping security deposit creation - tenant_id: %, status: %', 
      NEW.tenant_id, NEW.status;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in create_security_deposit_for_assignment: % - %', SQLSTATE, SQLERRM;
    -- Don't fail the main operation, just log the error
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new assignment insertions
CREATE TRIGGER trigger_create_security_deposit_on_assignment_insert
  AFTER INSERT ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION create_security_deposit_for_assignment();

-- Trigger for assignment updates (when tenant or status changes)
CREATE TRIGGER trigger_create_security_deposit_on_assignment_update
  AFTER UPDATE ON assignments
  FOR EACH ROW
  WHEN (
    -- Trigger when tenant is assigned to previously unassigned assignment
    (OLD.tenant_id IS NULL AND NEW.tenant_id IS NOT NULL) OR
    -- Trigger when assignment becomes active from inactive state
    (OLD.status != 'Active' AND NEW.status = 'Active') OR
    -- Trigger when both tenant and active status are set simultaneously
    (NEW.tenant_id IS NOT NULL AND NEW.status = 'Active' AND 
     (OLD.tenant_id IS DISTINCT FROM NEW.tenant_id OR OLD.status IS DISTINCT FROM NEW.status))
  )
  EXECUTE FUNCTION create_security_deposit_for_assignment();

-- Add function comment
COMMENT ON FUNCTION create_security_deposit_for_assignment() IS 'Automatically creates $500 security deposit when assignment becomes active with tenant assigned';
