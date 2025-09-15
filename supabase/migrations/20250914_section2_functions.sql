-- =====================================================
-- SECTION 2: Create Functions (run after Section 1)
-- Copy and run this section after tables are created
-- =====================================================

-- Generic function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create deduction schedule based on employment start date
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
    processing_date := seventh_date;
  ELSIF day_val <= 22 THEN
    processing_date := twentysecond_date;
  ELSE
    IF month_val = 12 THEN
      processing_date := make_date(year_val + 1, 1, 7);
    ELSE
      processing_date := make_date(year_val, month_val + 1, 7);
    END IF;
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
        WHEN deduction_count = 4 THEN NEW.total_amount - (deduction_amount * 3)
        ELSE deduction_amount 
      END,
      'scheduled'
    );
    
    -- Calculate next deduction date
    IF EXTRACT(DAY FROM processing_date) = 7 THEN
      processing_date := make_date(
        EXTRACT(YEAR FROM processing_date)::INTEGER,
        EXTRACT(MONTH FROM processing_date)::INTEGER,
        22
      );
    ELSE
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
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for automatic security deposit creation
CREATE OR REPLACE FUNCTION create_security_deposit_for_assignment()
RETURNS TRIGGER AS $$
DECLARE
  deposit_exists BOOLEAN := FALSE;
  new_deposit_id UUID;
BEGIN
  RAISE NOTICE 'Security deposit trigger fired for assignment ID: %, tenant_id: %, status: %', 
    NEW.id, NEW.tenant_id, NEW.status;
  
  IF NEW.tenant_id IS NOT NULL AND NEW.status = 'Active' THEN
    SELECT EXISTS(
      SELECT 1 FROM security_deposits 
      WHERE assignment_id = NEW.id
    ) INTO deposit_exists;
    
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
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in create_security_deposit_for_assignment: % - %', SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verify functions exist
SELECT 'Functions created successfully' as status;
SELECT routine_name FROM information_schema.routines WHERE routine_name LIKE '%security_deposit%' OR routine_name = 'update_updated_at_column';
