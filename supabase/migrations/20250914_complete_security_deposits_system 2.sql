-- Complete Security Deposits System Migration
-- Migration: 20250914_complete_security_deposits_system.sql
-- This file contains all security deposit related changes in proper dependency order

-- =====================================================
-- STEP 1: Clean up existing objects (if any)
-- =====================================================

-- Drop existing triggers
DROP TRIGGER IF EXISTS trigger_create_deduction_schedule ON security_deposits;
DROP TRIGGER IF EXISTS trigger_security_deposits_updated_at ON security_deposits;
DROP TRIGGER IF EXISTS trigger_deductions_updated_at ON security_deposit_deductions;
DROP TRIGGER IF EXISTS trigger_create_security_deposit_on_assignment_insert ON assignments;
DROP TRIGGER IF EXISTS trigger_create_security_deposit_on_assignment_update ON assignments;

-- Drop existing functions
DROP FUNCTION IF EXISTS create_deduction_schedule();
DROP FUNCTION IF EXISTS create_security_deposit_for_assignment();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop existing tables
DROP TABLE IF EXISTS security_deposit_deductions CASCADE;
DROP TABLE IF EXISTS security_deposits CASCADE;

-- =====================================================
-- STEP 2: Create Tables
-- =====================================================

-- Create security_deposits table
CREATE TABLE public.security_deposits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL,
  total_amount numeric(10, 2) NOT NULL DEFAULT 500.00,
  payment_method character varying(50) NOT NULL DEFAULT 'payroll_deduction',
  payment_status character varying(20) NOT NULL DEFAULT 'pending',
  paid_date date NULL,
  refund_date date NULL,
  refund_amount numeric(10, 2) NULL DEFAULT 0,
  notes text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid NULL,
  updated_by uuid NULL,
  
  CONSTRAINT security_deposits_pkey PRIMARY KEY (id),
  CONSTRAINT security_deposits_assignment_id_fkey 
    FOREIGN KEY (assignment_id) REFERENCES assignments (id) ON DELETE CASCADE,
  CONSTRAINT security_deposits_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users (id),
  CONSTRAINT security_deposits_updated_by_fkey 
    FOREIGN KEY (updated_by) REFERENCES auth.users (id),
  CONSTRAINT security_deposits_payment_status_check CHECK (
    payment_status IN ('pending', 'partial', 'paid', 'refunded')
  ),
  CONSTRAINT security_deposits_refund_amount_check CHECK (refund_amount >= 0),
  CONSTRAINT security_deposits_total_amount_check CHECK (total_amount >= 0),
  CONSTRAINT security_deposits_assignment_id_unique UNIQUE (assignment_id)
);

-- Create security_deposit_deductions table
CREATE TABLE public.security_deposit_deductions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  security_deposit_id uuid NOT NULL,
  deduction_number integer NOT NULL,
  scheduled_date date NOT NULL,
  amount numeric(10, 2) NOT NULL DEFAULT 125.00,
  status character varying(20) NOT NULL DEFAULT 'scheduled',
  actual_deduction_date date NULL,
  actual_amount numeric(10, 2) NULL,
  reason text NULL,
  notes text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT security_deposit_deductions_pkey PRIMARY KEY (id),
  CONSTRAINT security_deposit_deductions_security_deposit_id_deduction_n_key 
    UNIQUE (security_deposit_id, deduction_number),
  CONSTRAINT security_deposit_deductions_security_deposit_id_fkey 
    FOREIGN KEY (security_deposit_id) REFERENCES security_deposits (id) ON DELETE CASCADE,
  CONSTRAINT security_deposit_deductions_amount_check CHECK (amount >= 0),
  CONSTRAINT security_deposit_deductions_deduction_number_check CHECK (
    deduction_number >= 1 AND deduction_number <= 4
  ),
  CONSTRAINT security_deposit_deductions_status_check CHECK (
    status IN ('scheduled', 'deducted', 'waived', 'adjusted')
  )
);

-- =====================================================
-- STEP 3: Create Indexes
-- =====================================================

CREATE INDEX idx_security_deposits_assignment_id 
  ON security_deposits (assignment_id);
CREATE INDEX idx_security_deposits_payment_status 
  ON security_deposits (payment_status);
CREATE INDEX idx_security_deposits_created_at 
  ON security_deposits (created_at);

CREATE INDEX idx_deductions_security_deposit_id 
  ON security_deposit_deductions (security_deposit_id);
CREATE INDEX idx_deductions_scheduled_date 
  ON security_deposit_deductions (scheduled_date);
CREATE INDEX idx_deductions_status 
  ON security_deposit_deductions (status);

-- =====================================================
-- STEP 4: Enable RLS and Create Policies
-- =====================================================

ALTER TABLE security_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_deposit_deductions ENABLE ROW LEVEL SECURITY;

-- RLS policies for security_deposits
CREATE POLICY "Authenticated users can view security deposits" 
  ON security_deposits FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert security deposits" 
  ON security_deposits FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update security deposits" 
  ON security_deposits FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete security deposits" 
  ON security_deposits FOR DELETE 
  USING (auth.role() = 'authenticated');

-- RLS policies for security_deposit_deductions
CREATE POLICY "Authenticated users can view deductions" 
  ON security_deposit_deductions FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert deductions" 
  ON security_deposit_deductions FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update deductions" 
  ON security_deposit_deductions FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete deductions" 
  ON security_deposit_deductions FOR DELETE 
  USING (auth.role() = 'authenticated');

-- =====================================================
-- STEP 5: Create Functions
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

-- =====================================================
-- STEP 6: Create Triggers
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
    -- Trigger when tenant is assigned to previously unassigned assignment
    (OLD.tenant_id IS NULL AND NEW.tenant_id IS NOT NULL) OR
    -- Trigger when assignment becomes active from inactive state
    (OLD.status != 'Active' AND NEW.status = 'Active') OR
    -- Trigger when both tenant and active status are set simultaneously
    (NEW.tenant_id IS NOT NULL AND NEW.status = 'Active' AND 
     (OLD.tenant_id IS DISTINCT FROM NEW.tenant_id OR OLD.status IS DISTINCT FROM NEW.status))
  )
  EXECUTE FUNCTION create_security_deposit_for_assignment();

-- =====================================================
-- STEP 7: Backfill Existing Assignments
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

-- =====================================================
-- STEP 8: Add Comments
-- =====================================================

COMMENT ON TABLE security_deposits IS 'Security deposits for property assignments - fixed $500 amount with payroll deduction schedule';
COMMENT ON TABLE security_deposit_deductions IS 'Payroll deduction schedule for security deposits - 4 payments of $125 each on 7th and 22nd of each month';

COMMENT ON COLUMN security_deposits.total_amount IS 'Fixed amount of $500 for all security deposits';
COMMENT ON COLUMN security_deposits.payment_method IS 'Always payroll_deduction for automated payroll processing';
COMMENT ON COLUMN security_deposit_deductions.deduction_number IS 'Sequence number 1-4 for the 4 payroll deductions';
COMMENT ON COLUMN security_deposit_deductions.scheduled_date IS 'Scheduled deduction date based on employment start date and payroll schedule (7th/22nd)';
COMMENT ON COLUMN security_deposit_deductions.amount IS 'Deduction amount - typically $125 (500/4), final payment may vary for remainder';

COMMENT ON FUNCTION create_deduction_schedule() IS 'Automatically creates 4 payroll deduction records based on employment start date and company payroll schedule (7th and 22nd of each month)';
COMMENT ON FUNCTION create_security_deposit_for_assignment() IS 'Automatically creates $500 security deposit when assignment becomes active with tenant assigned';
COMMENT ON FUNCTION update_updated_at_column() IS 'Generic function to automatically update updated_at timestamp on row updates';

-- =====================================================
-- STEP 9: Log Completion
-- =====================================================

DO $$
DECLARE
  deposit_count INTEGER;
  deduction_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO deposit_count FROM security_deposits;
  SELECT COUNT(*) INTO deduction_count FROM security_deposit_deductions;
  
  RAISE NOTICE 'Security Deposits System Migration Complete!';
  RAISE NOTICE 'Created % security deposits with % total deductions', deposit_count, deduction_count;
END $$;
