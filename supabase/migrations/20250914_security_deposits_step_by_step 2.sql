-- Security Deposits Migration - Step by Step Execution
-- Run each section separately in Supabase SQL Editor

-- =====================================================
-- SECTION 1: Clean up and create tables ONLY
-- Copy and run this section first
-- =====================================================

-- Drop existing objects
DROP TRIGGER IF EXISTS trigger_create_deduction_schedule ON security_deposits;
DROP TRIGGER IF EXISTS trigger_security_deposits_updated_at ON security_deposits;
DROP TRIGGER IF EXISTS trigger_deductions_updated_at ON security_deposit_deductions;
DROP TRIGGER IF EXISTS trigger_create_security_deposit_on_assignment_insert ON assignments;
DROP TRIGGER IF EXISTS trigger_create_security_deposit_on_assignment_update ON assignments;

DROP FUNCTION IF EXISTS create_deduction_schedule();
DROP FUNCTION IF EXISTS create_security_deposit_for_assignment();
DROP FUNCTION IF EXISTS update_updated_at_column();

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

-- Create indexes
CREATE INDEX idx_security_deposits_assignment_id ON security_deposits (assignment_id);
CREATE INDEX idx_security_deposits_payment_status ON security_deposits (payment_status);
CREATE INDEX idx_deductions_security_deposit_id ON security_deposit_deductions (security_deposit_id);
CREATE INDEX idx_deductions_scheduled_date ON security_deposit_deductions (scheduled_date);

-- Enable RLS
ALTER TABLE security_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_deposit_deductions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can manage security deposits" ON security_deposits FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage deductions" ON security_deposit_deductions FOR ALL USING (auth.role() = 'authenticated');

-- Verify tables exist
SELECT 'Tables created successfully' as status;
SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'security_deposit%';
