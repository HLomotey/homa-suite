-- =====================================================
-- SECTION 3: Create Triggers (run after Section 2)
-- Copy and run this section after functions are created
-- =====================================================

-- Trigger to automatically generate deduction schedule when security deposit is created
CREATE TRIGGER trigger_create_deduction_schedule
  AFTER INSERT ON security_deposits
  FOR EACH ROW
  EXECUTE FUNCTION create_deduction_schedule();

-- Triggers for automatic updated_at timestamp updates
CREATE TRIGGER trigger_security_deposits_updated_at
  BEFORE UPDATE ON security_deposits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_deductions_updated_at
  BEFORE UPDATE ON security_deposit_deductions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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
    (OLD.tenant_id IS NULL AND NEW.tenant_id IS NOT NULL) OR
    (OLD.status != 'Active' AND NEW.status = 'Active') OR
    (NEW.tenant_id IS NOT NULL AND NEW.status = 'Active' AND 
     (OLD.tenant_id IS DISTINCT FROM NEW.tenant_id OR OLD.status IS DISTINCT FROM NEW.status))
  )
  EXECUTE FUNCTION create_security_deposit_for_assignment();

-- Verify triggers exist
SELECT 'Triggers created successfully' as status;
SELECT trigger_name, event_object_table FROM information_schema.triggers 
WHERE trigger_name LIKE '%security_deposit%' OR trigger_name LIKE '%deduction%';
