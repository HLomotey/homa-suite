-- Minimal Security Deposits Migration - No Dependencies
-- Copy and paste this entire file into Supabase SQL Editor and run

-- Create security_deposits table
CREATE TABLE IF NOT EXISTS public.security_deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL UNIQUE REFERENCES assignments(id) ON DELETE CASCADE,
  total_amount numeric(10, 2) NOT NULL DEFAULT 500.00 CHECK (total_amount >= 0),
  payment_method varchar(50) NOT NULL DEFAULT 'payroll_deduction',
  payment_status varchar(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  paid_date date,
  refund_date date,
  refund_amount numeric(10, 2) DEFAULT 0 CHECK (refund_amount >= 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create security_deposit_deductions table
CREATE TABLE IF NOT EXISTS public.security_deposit_deductions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  security_deposit_id uuid NOT NULL REFERENCES security_deposits(id) ON DELETE CASCADE,
  deduction_number integer NOT NULL CHECK (deduction_number >= 1 AND deduction_number <= 4),
  scheduled_date date NOT NULL,
  amount numeric(10, 2) NOT NULL DEFAULT 125.00 CHECK (amount >= 0),
  status varchar(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'deducted', 'waived', 'adjusted')),
  actual_deduction_date date,
  actual_amount numeric(10, 2),
  reason text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(security_deposit_id, deduction_number)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_security_deposits_assignment_id ON security_deposits(assignment_id);
CREATE INDEX IF NOT EXISTS idx_deductions_security_deposit_id ON security_deposit_deductions(security_deposit_id);
CREATE INDEX IF NOT EXISTS idx_deductions_scheduled_date ON security_deposit_deductions(scheduled_date);

-- Enable RLS
ALTER TABLE security_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_deposit_deductions ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies
CREATE POLICY "security_deposits_policy" ON security_deposits FOR ALL USING (true);
CREATE POLICY "security_deposit_deductions_policy" ON security_deposit_deductions FOR ALL USING (true);

-- Test insert to verify tables work
INSERT INTO security_deposits (assignment_id, notes) 
SELECT id, 'Test deposit' FROM assignments WHERE tenant_id IS NOT NULL AND status = 'Active' LIMIT 1
ON CONFLICT (assignment_id) DO NOTHING;

-- Verify success
SELECT 
  (SELECT COUNT(*) FROM security_deposits) as deposits_count,
  (SELECT COUNT(*) FROM security_deposit_deductions) as deductions_count,
  'Tables created successfully' as status;
