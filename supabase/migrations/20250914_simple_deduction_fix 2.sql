-- Simple fix to create deduction schedules for existing deposits
-- Run this after creating the security_deposits tables

-- First, create a simple function to generate deductions
CREATE OR REPLACE FUNCTION generate_deductions_for_deposit(deposit_id UUID, start_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
  deduction_date DATE := start_date;
  i INTEGER;
BEGIN
  -- Create 4 deductions starting from next payroll date
  FOR i IN 1..4 LOOP
    INSERT INTO security_deposit_deductions (
      security_deposit_id,
      deduction_number,
      scheduled_date,
      amount,
      status
    ) VALUES (
      deposit_id,
      i,
      deduction_date,
      CASE WHEN i = 4 THEN 125.00 ELSE 125.00 END, -- All $125 for simplicity
      'scheduled'
    );
    
    -- Add 15 days for next deduction (approximately bi-weekly)
    deduction_date := deduction_date + INTERVAL '15 days';
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate deductions for all existing deposits that don't have them
DO $$
DECLARE
  deposit_record RECORD;
BEGIN
  FOR deposit_record IN 
    SELECT sd.id 
    FROM security_deposits sd
    LEFT JOIN security_deposit_deductions sdd ON sd.id = sdd.security_deposit_id
    WHERE sdd.id IS NULL
  LOOP
    PERFORM generate_deductions_for_deposit(deposit_record.id);
  END LOOP;
END $$;

-- Create trigger for future deposits
CREATE OR REPLACE FUNCTION auto_create_deductions()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM generate_deductions_for_deposit(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_create_deductions ON security_deposits;
CREATE TRIGGER trigger_auto_create_deductions
  AFTER INSERT ON security_deposits
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_deductions();

-- Check results
SELECT 
  'Deduction Schedule Created' as status,
  COUNT(*) as total_deductions
FROM security_deposit_deductions;

-- Show sample deduction schedule
SELECT 
  sd.assignment_id,
  sdd.deduction_number,
  sdd.scheduled_date,
  sdd.amount,
  sdd.status
FROM security_deposits sd
JOIN security_deposit_deductions sdd ON sd.id = sdd.security_deposit_id
ORDER BY sd.assignment_id, sdd.deduction_number
LIMIT 10;
