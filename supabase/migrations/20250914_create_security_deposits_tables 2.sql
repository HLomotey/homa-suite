-- Create security deposits and deductions tables
-- Migration: 20250914_create_security_deposits_tables.sql

-- Drop existing tables and functions if they exist
DROP TRIGGER IF EXISTS trigger_create_deduction_schedule ON security_deposits;
DROP TRIGGER IF EXISTS trigger_security_deposits_updated_at ON security_deposits;
DROP TRIGGER IF EXISTS trigger_deductions_updated_at ON security_deposit_deductions;

DROP FUNCTION IF EXISTS create_deduction_schedule();

DROP TABLE IF EXISTS security_deposit_deductions CASCADE;
DROP TABLE IF EXISTS security_deposits CASCADE;

-- Create security_deposits table
CREATE TABLE IF NOT EXISTS public.security_deposits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL,
  total_amount numeric(10, 2) NOT NULL,
  payment_method character varying(50) NULL DEFAULT 'cash'::character varying,
  payment_status character varying(20) NULL DEFAULT 'pending'::character varying,
  paid_date date NULL,
  refund_date date NULL,
  refund_amount numeric(10, 2) NULL DEFAULT 0,
  notes text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  created_by uuid NULL,
  updated_by uuid NULL,
  CONSTRAINT security_deposits_pkey PRIMARY KEY (id),
  CONSTRAINT security_deposits_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES assignments (id) ON DELETE CASCADE,
  CONSTRAINT security_deposits_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users (id),
  CONSTRAINT security_deposits_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users (id),
  CONSTRAINT security_deposits_payment_status_check CHECK (
    (payment_status)::text = ANY (
      ARRAY[
        'pending'::character varying,
        'partial'::character varying,
        'paid'::character varying,
        'refunded'::character varying
      ]::text[]
    )
  ),
  CONSTRAINT security_deposits_refund_amount_check CHECK ((refund_amount >= (0)::numeric)),
  CONSTRAINT security_deposits_total_amount_check CHECK ((total_amount >= (0)::numeric))
) TABLESPACE pg_default;

-- Create indexes for security_deposits
CREATE INDEX IF NOT EXISTS idx_security_deposits_assignment_id 
ON public.security_deposits USING btree (assignment_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_security_deposits_payment_status 
ON public.security_deposits USING btree (payment_status) TABLESPACE pg_default;

-- Create security_deposit_deductions table
CREATE TABLE IF NOT EXISTS public.security_deposit_deductions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  security_deposit_id uuid NOT NULL,
  deduction_number integer NOT NULL,
  scheduled_date date NOT NULL,
  amount numeric(10, 2) NOT NULL,
  status character varying(20) NULL DEFAULT 'scheduled'::character varying,
  actual_deduction_date date NULL,
  actual_amount numeric(10, 2) NULL,
  reason text NULL,
  notes text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT security_deposit_deductions_pkey PRIMARY KEY (id),
  CONSTRAINT security_deposit_deductions_security_deposit_id_deduction_n_key 
    UNIQUE (security_deposit_id, deduction_number),
  CONSTRAINT security_deposit_deductions_security_deposit_id_fkey 
    FOREIGN KEY (security_deposit_id) REFERENCES security_deposits (id) ON DELETE CASCADE,
  CONSTRAINT security_deposit_deductions_amount_check CHECK ((amount >= (0)::numeric)),
  CONSTRAINT security_deposit_deductions_deduction_number_check CHECK (
    (deduction_number >= 1) AND (deduction_number <= 4)
  ),
  CONSTRAINT security_deposit_deductions_status_check CHECK (
    (status)::text = ANY (
      ARRAY[
        'scheduled'::character varying,
        'deducted'::character varying,
        'waived'::character varying,
        'adjusted'::character varying
      ]::text[]
    )
  )
) TABLESPACE pg_default;

-- Create indexes for security_deposit_deductions
CREATE INDEX IF NOT EXISTS idx_deductions_security_deposit_id 
ON public.security_deposit_deductions USING btree (security_deposit_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_deductions_scheduled_date 
ON public.security_deposit_deductions USING btree (scheduled_date) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_deductions_status 
ON public.security_deposit_deductions USING btree (status) TABLESPACE pg_default;

-- Function to create deduction schedule based on employment start date
CREATE OR REPLACE FUNCTION create_deduction_schedule()
RETURNS TRIGGER AS $$
DECLARE
  assignment_record RECORD;
  staff_record RECORD;
  start_date DATE;
  processing_date DATE;
  deduction_amount NUMERIC(10, 2);
  deduction_count INTEGER := 0;
  year_val INTEGER;
  month_val INTEGER;
  seventh_date DATE;
  twentysecond_date DATE;
BEGIN
  -- Get assignment details
  SELECT a.* INTO assignment_record 
  FROM assignments a
  WHERE a.id = NEW.assignment_id;
  
  -- Get external staff employment start date
  SELECT es.* INTO staff_record 
  FROM external_staff es
  WHERE es.id = assignment_record.tenant_id;
  
  -- Use employment start date (HIRE DATE) as reference
  IF staff_record."HIRE DATE" IS NOT NULL AND staff_record."HIRE DATE" != '' THEN
    start_date := staff_record."HIRE DATE"::DATE;
  ELSE
    -- Fallback to assignment start date
    start_date := assignment_record.start_date::DATE;
  END IF;
  
  -- Calculate deduction amount ($500 / 4 = $125)
  deduction_amount := NEW.total_amount / 4;
  
  -- Start from employment/assignment start date
  processing_date := start_date;
  
  -- Generate 4 deduction dates on 7th and 22nd of each month
  WHILE deduction_count < 4 LOOP
    year_val := EXTRACT(YEAR FROM processing_date);
    month_val := EXTRACT(MONTH FROM processing_date);
    
    -- Calculate 7th and 22nd of current month
    seventh_date := make_date(year_val, month_val, 7);
    twentysecond_date := make_date(year_val, month_val, 22);
    
    -- Determine next deduction date
    IF processing_date <= seventh_date THEN
      -- Use 7th of current month
      INSERT INTO security_deposit_deductions (
        security_deposit_id,
        deduction_number,
        scheduled_date,
        amount,
        status
      ) VALUES (
        NEW.id,
        deduction_count + 1,
        seventh_date,
        CASE 
          WHEN deduction_count = 3 THEN NEW.total_amount - (deduction_amount * 3) -- Final payment gets remainder
          ELSE deduction_amount 
        END,
        'scheduled'
      );
      
      -- Next deduction will be 22nd of same month
      processing_date := twentysecond_date;
      
    ELSIF processing_date <= twentysecond_date THEN
      -- Use 22nd of current month
      INSERT INTO security_deposit_deductions (
        security_deposit_id,
        deduction_number,
        scheduled_date,
        amount,
        status
      ) VALUES (
        NEW.id,
        deduction_count + 1,
        twentysecond_date,
        CASE 
          WHEN deduction_count = 3 THEN NEW.total_amount - (deduction_amount * 3) -- Final payment gets remainder
          ELSE deduction_amount 
        END,
        'scheduled'
      );
      
      -- Next deduction will be 7th of next month
      IF month_val = 12 THEN
        processing_date := make_date(year_val + 1, 1, 7);
      ELSE
        processing_date := make_date(year_val, month_val + 1, 7);
      END IF;
      
    ELSE
      -- Start date is after 22nd, use 7th of next month
      IF month_val = 12 THEN
        processing_date := make_date(year_val + 1, 1, 7);
      ELSE
        processing_date := make_date(year_val, month_val + 1, 7);
      END IF;
      
      INSERT INTO security_deposit_deductions (
        security_deposit_id,
        deduction_number,
        scheduled_date,
        amount,
        status
      ) VALUES (
        NEW.id,
        deduction_count + 1,
        processing_date,
        CASE 
          WHEN deduction_count = 3 THEN NEW.total_amount - (deduction_amount * 3) -- Final payment gets remainder
          ELSE deduction_amount 
        END,
        'scheduled'
      );
      
      -- Next deduction will be 22nd of same month
      processing_date := make_date(EXTRACT(YEAR FROM processing_date)::INTEGER, 
                               EXTRACT(MONTH FROM processing_date)::INTEGER, 22);
    END IF;
    
    deduction_count := deduction_count + 1;
    
    -- Move to next payroll period for subsequent iterations
    IF deduction_count < 4 THEN
      IF EXTRACT(DAY FROM processing_date) = 7 THEN
        processing_date := make_date(EXTRACT(YEAR FROM processing_date)::INTEGER, 
                                 EXTRACT(MONTH FROM processing_date)::INTEGER, 22);
      ELSE
        -- Move to 7th of next month
        IF EXTRACT(MONTH FROM processing_date) = 12 THEN
          processing_date := make_date(EXTRACT(YEAR FROM processing_date)::INTEGER + 1, 1, 7);
        ELSE
          processing_date := make_date(EXTRACT(YEAR FROM processing_date)::INTEGER, 
                                   EXTRACT(MONTH FROM processing_date)::INTEGER + 1, 7);
        END IF;
      END IF;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_create_deduction_schedule
  AFTER INSERT ON security_deposits 
  FOR EACH ROW
  EXECUTE FUNCTION create_deduction_schedule();

CREATE TRIGGER trigger_security_deposits_updated_at 
  BEFORE UPDATE ON security_deposits 
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_deductions_updated_at 
  BEFORE UPDATE ON security_deposit_deductions 
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE security_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_deposit_deductions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your auth requirements)
CREATE POLICY "Enable read access for authenticated users" ON security_deposits
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON security_deposits
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON security_deposits
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON security_deposit_deductions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON security_deposit_deductions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON security_deposit_deductions
  FOR UPDATE USING (auth.role() = 'authenticated');
