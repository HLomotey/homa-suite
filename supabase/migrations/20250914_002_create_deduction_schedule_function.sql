-- Create deduction schedule function based on employment start date
-- Migration: 20250914_002_create_deduction_schedule_function.sql

-- Function to create deduction schedule based on employment start date and payroll dates (7th and 22nd)
CREATE OR REPLACE FUNCTION create_deduction_schedule()
RETURNS TRIGGER AS $$
DECLARE
  start_date DATE;
  year_val INTEGER;
  month_val INTEGER;
  day_val INTEGER;
  processing_date DATE;
  deduction_count INTEGER := 0;
  deduction_amount NUMERIC := 125.00;
  seventh_date DATE;
  twentysecond_date DATE;
BEGIN
  -- Get employment start date from external_staff table
  SELECT es."EMPLOYMENT START DATE"::DATE
  INTO start_date
  FROM assignments a
  JOIN external_staff es ON es.id = a.tenant_id
  WHERE a.id = NEW.assignment_id;
  
  -- If no start date found, use assignment creation date as fallback
  IF start_date IS NULL THEN
    start_date := CURRENT_DATE;
  END IF;
  
  -- Extract date components
  year_val := EXTRACT(YEAR FROM start_date);
  month_val := EXTRACT(MONTH FROM start_date);
  day_val := EXTRACT(DAY FROM start_date);
  
  -- Calculate first deduction date based on start date
  seventh_date := make_date(year_val, month_val, 7);
  twentysecond_date := make_date(year_val, month_val, 22);
  
  -- Determine first deduction date
  IF day_val <= 7 THEN
    -- Start date is before or on 7th, first deduction on 7th of same month
    processing_date := seventh_date;
  ELSIF day_val <= 22 THEN
    -- Start date is between 8th and 22nd, first deduction on 22nd of same month
    processing_date := twentysecond_date;
  ELSE
    -- Start date is after 22nd, first deduction on 7th of next month
    IF month_val = 12 THEN
      processing_date := make_date(year_val + 1, 1, 7);
    ELSE
      processing_date := make_date(year_val, month_val + 1, 7);
    END IF;
  END IF;
  
  -- Create 4 deduction records
  WHILE deduction_count < 4 LOOP
    deduction_count := deduction_count + 1;
    
    -- Insert deduction record
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
      processing_date := make_date(
        EXTRACT(YEAR FROM processing_date)::INTEGER,
        EXTRACT(MONTH FROM processing_date)::INTEGER,
        22
      );
    ELSE
      -- Current is 22nd, next is 7th of next month
      IF EXTRACT(MONTH FROM processing_date) = 12 THEN
        processing_date := make_date(
          EXTRACT(YEAR FROM processing_date)::INTEGER + 1,
          1,
          7
        );
      ELSE
        processing_date := make_date(
          EXTRACT(YEAR FROM processing_date)::INTEGER,
          EXTRACT(MONTH FROM processing_date)::INTEGER + 1,
          7
        );
      END IF;
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
CREATE TRIGGER trigger_create_deduction_schedule
  AFTER INSERT ON security_deposits
  FOR EACH ROW
  EXECUTE FUNCTION create_deduction_schedule();

-- Add function comment
COMMENT ON FUNCTION create_deduction_schedule() IS 'Automatically creates 4 payroll deduction records based on employment start date and company payroll schedule (7th and 22nd of each month)';
