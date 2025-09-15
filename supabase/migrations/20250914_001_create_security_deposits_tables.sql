-- Create security deposits and deductions tables
-- Migration: 20250914_001_create_security_deposits_tables.sql

-- Drop existing tables and functions if they exist (clean slate)
DROP TRIGGER IF EXISTS trigger_create_deduction_schedule ON security_deposits;
DROP TRIGGER IF EXISTS trigger_security_deposits_updated_at ON security_deposits;
DROP TRIGGER IF EXISTS trigger_deductions_updated_at ON security_deposit_deductions;
DROP TRIGGER IF EXISTS trigger_create_security_deposit_on_assignment ON assignments;
DROP TRIGGER IF EXISTS trigger_create_security_deposit_on_assignment_update ON assignments;

DROP FUNCTION IF EXISTS create_deduction_schedule();
DROP FUNCTION IF EXISTS create_security_deposit_for_assignment();

DROP TABLE IF EXISTS security_deposit_deductions CASCADE;
DROP TABLE IF EXISTS security_deposits CASCADE;

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

-- Create indexes for performance
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

-- Enable RLS
ALTER TABLE security_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_deposit_deductions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for security_deposits
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

-- Create RLS policies for security_deposit_deductions
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

-- Add table comments
COMMENT ON TABLE security_deposits IS 'Security deposits for property assignments - fixed $500 amount with payroll deduction schedule';
COMMENT ON TABLE security_deposit_deductions IS 'Payroll deduction schedule for security deposits - 4 payments of $125 each on 7th and 22nd of each month';

-- Add column comments
COMMENT ON COLUMN security_deposits.total_amount IS 'Fixed amount of $500 for all security deposits';
COMMENT ON COLUMN security_deposits.payment_method IS 'Always payroll_deduction for automated payroll processing';
COMMENT ON COLUMN security_deposit_deductions.deduction_number IS 'Sequence number 1-4 for the 4 payroll deductions';
COMMENT ON COLUMN security_deposit_deductions.scheduled_date IS 'Scheduled deduction date based on employment start date and payroll schedule (7th/22nd)';
COMMENT ON COLUMN security_deposit_deductions.amount IS 'Deduction amount - typically $125 (500/4), final payment may vary for remainder';
