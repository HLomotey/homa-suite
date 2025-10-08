-- Add deduction schedule trigger to existing security deposits system
-- Run this after the minimal migration

-- Function to create deduction schedule based on employment start date
CREATE OR REPLACE FUNCTION create_deduction_schedule()
RETURNS TRIGGER AS $$
DECLARE
  start_date DATE;
  processing_date DATE;
  deduction_count INTEGER := 0;
  deduction_amount NUMERIC := 125.00;
BEGIN
  -- Get employment start date from external_staff table
  SELECT es."EMPLOYMENT START DATE"::DATE
  INTO start_date
  FROM assignments a
  JOIN external_staff es ON es.id = a.tenant_id
  WHERE a.id = NEW.assignment_id;
  
  -- If no start date found, use current date as fallback
  IF start_date IS NULL THEN
    start_date := CURRENT_DATE;
  END IF;
  
  -- Calculate first deduction date based on start date
  -- If start date is before or on 7th, first deduction on 7th of same month
  -- If start date is between 8th and 22nd, first deduction on 22nd of same month
  -- If start date is after 22nd, first deduction on 7th of next month
  IF EXTRACT(DAY FROM start_date) <= 7 THEN
    processing_date := DATE_TRUNC('month', start_date) + INTERVAL '6 days'; -- 7th of month
  ELSIF EXTRACT(DAY FROM start_date) <= 22 THEN
    processing_date := DATE_TRUNC('month', start_date) + INTERVAL '21 days'; -- 22nd of month
  ELSE
    processing_date := DATE_TRUNC('month', start_date + INTERVAL '1 month') + INTERVAL '6 days'; -- 7th of next month
  END IF;
  
  -- Create 4 deduction records
  WHILE deduction_count < 4 LOOP
    deduction_count := deduction_count + 1;
    
    INSERT INTO security_deposit_deductions (
      security_deposit_id,
      deduction_number,
      scheduled_date,
      amount,
      status
    ) VALUES (
      NEW.id,
      deduction_count,
      processing_date,
      CASE 
        WHEN deduction_count = 4 THEN NEW.total_amount - (deduction_amount * 3) -- Final payment gets remainder
        ELSE deduction_amount 
      END,
      'scheduled'
    );
    
    -- Calculate next deduction date (alternate between 7th and 22nd)
    IF EXTRACT(DAY FROM processing_date) = 7 THEN
      -- Current is 7th, next is 22nd of same month
      processing_date := DATE_TRUNC('month', processing_date) + INTERVAL '21 days';
    ELSE
      -- Current is 22nd, next is 7th of next month
      processing_date := DATE_TRUNC('month', processing_date + INTERVAL '1 month') + INTERVAL '6 days';
    END IF;
  END LOOP;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in create_deduction_schedule: %', SQLERRM;
    RETURN NEW; -- Don't fail the main operation
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate deduction schedule when security deposit is created
DROP TRIGGER IF EXISTS trigger_create_deduction_schedule ON security_deposits;
CREATE TRIGGER trigger_create_deduction_schedule
  AFTER INSERT ON security_deposits
  FOR EACH ROW
  EXECUTE FUNCTION create_deduction_schedule();

-- Create deductions for existing security deposits that don't have them
DO $$
DECLARE
  deposit_record RECORD;
  deduction_date DATE;
  i INTEGER;
BEGIN
  FOR deposit_record IN 
    SELECT sd.id, sd.total_amount
    FROM security_deposits sd
    LEFT JOIN security_deposit_deductions sdd ON sd.id = sdd.security_deposit_id
    WHERE sdd.id IS NULL
  LOOP
    deduction_date := CURRENT_DATE + INTERVAL '7 days';
    
    FOR i IN 1..4 LOOP
      INSERT INTO security_deposit_deductions (
        security_deposit_id,
        deduction_number,
        scheduled_date,
        amount,
        status
      ) VALUES (
        deposit_record.id,
        i,
        deduction_date,
        CASE 
          WHEN i = 4 THEN deposit_record.total_amount - 375.00 -- Final payment gets remainder
          ELSE 125.00
        END,
        'scheduled'
      );
      
      -- Add 15 days for next deduction
      deduction_date := deduction_date + INTERVAL '15 days';
    END LOOP;
  END LOOP;
END $$;

-- Verify deductions were created
SELECT 
  sd.assignment_id,
  sd.total_amount,
  COUNT(sdd.id) as deduction_count,
  STRING_AGG(sdd.scheduled_date::text || ' ($' || sdd.amount || ')', ', ' ORDER BY sdd.deduction_number) as schedule
FROM security_deposits sd
LEFT JOIN security_deposit_deductions sdd ON sd.id = sdd.security_deposit_id
GROUP BY sd.id, sd.assignment_id, sd.total_amount
ORDER BY sd.created_at;
