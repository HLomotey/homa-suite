-- Create security deposit tables only - no dependencies
-- Run this first in Supabase SQL Editor

-- Create security_deposits table
CREATE TABLE IF NOT EXISTS public.security_deposits (
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
  CONSTRAINT security_deposits_payment_status_check CHECK (
    payment_status IN ('pending', 'partial', 'paid', 'refunded')
  ),
  CONSTRAINT security_deposits_refund_amount_check CHECK (refund_amount >= 0),
  CONSTRAINT security_deposits_total_amount_check CHECK (total_amount >= 0),
  CONSTRAINT security_deposits_assignment_id_unique UNIQUE (assignment_id)
);

-- Create security_deposit_deductions table
CREATE TABLE IF NOT EXISTS public.security_deposit_deductions (
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
CREATE INDEX IF NOT EXISTS idx_security_deposits_assignment_id ON security_deposits (assignment_id);
CREATE INDEX IF NOT EXISTS idx_security_deposits_payment_status ON security_deposits (payment_status);
CREATE INDEX IF NOT EXISTS idx_deductions_security_deposit_id ON security_deposit_deductions (security_deposit_id);
CREATE INDEX IF NOT EXISTS idx_deductions_scheduled_date ON security_deposit_deductions (scheduled_date);

-- Enable RLS
ALTER TABLE security_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_deposit_deductions ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies
DROP POLICY IF EXISTS "Authenticated users can manage security deposits" ON security_deposits;
DROP POLICY IF EXISTS "Authenticated users can manage deductions" ON security_deposit_deductions;

CREATE POLICY "Authenticated users can manage security deposits" 
  ON security_deposits FOR ALL 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage deductions" 
  ON security_deposit_deductions FOR ALL 
  USING (auth.role() = 'authenticated');

-- Verify tables were created
SELECT 'SUCCESS: Tables created' as result;
SELECT table_name, table_type FROM information_schema.tables 
WHERE table_name LIKE 'security_deposit%' AND table_schema = 'public';
