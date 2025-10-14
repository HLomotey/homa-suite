-- Quick fix to set up security deposits system
-- Run this entire script in Supabase SQL Editor

-- Step 1: Create tables if they don't exist
CREATE TABLE IF NOT EXISTS security_deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL UNIQUE REFERENCES assignments(id) ON DELETE CASCADE,
  total_amount numeric(10, 2) NOT NULL DEFAULT 500.00,
  payment_method varchar(50) NOT NULL DEFAULT 'payroll_deduction',
  payment_status varchar(20) NOT NULL DEFAULT 'pending',
  paid_date date,
  refund_date date,
  refund_amount numeric(10, 2) DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_deposit_deductions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  security_deposit_id uuid NOT NULL REFERENCES security_deposits(id) ON DELETE CASCADE,
  deduction_number integer NOT NULL CHECK (deduction_number >= 1 AND deduction_number <= 4),
  scheduled_date date NOT NULL,
  amount numeric(10, 2) NOT NULL DEFAULT 125.00,
  status varchar(20) NOT NULL DEFAULT 'scheduled',
  actual_deduction_date date,
  actual_amount numeric(10, 2),
  reason text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(security_deposit_id, deduction_number)
);

-- Step 2: Enable RLS
ALTER TABLE security_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_deposit_deductions ENABLE ROW LEVEL SECURITY;

-- Step 3: Create simple policies
DROP POLICY IF EXISTS "security_deposits_policy" ON security_deposits;
DROP POLICY IF EXISTS "security_deposit_deductions_policy" ON security_deposit_deductions;

CREATE POLICY "security_deposits_policy" ON security_deposits FOR ALL USING (true);
CREATE POLICY "security_deposit_deductions_policy" ON security_deposit_deductions FOR ALL USING (true);

-- Step 4: Create function to generate deductions
CREATE OR REPLACE FUNCTION create_deductions_for_deposit(deposit_id UUID)
RETURNS VOID AS $$
DECLARE
  deduction_date DATE := CURRENT_DATE + INTERVAL '7 days';
  i INTEGER;
BEGIN
  -- Create 4 deductions, 15 days apart
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
      125.00,
      'scheduled'
    );
    
    deduction_date := deduction_date + INTERVAL '15 days';
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger function
CREATE OR REPLACE FUNCTION auto_create_deductions()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_deductions_for_deposit(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger
DROP TRIGGER IF EXISTS trigger_auto_create_deductions ON security_deposits;
CREATE TRIGGER trigger_auto_create_deductions
  AFTER INSERT ON security_deposits
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_deductions();

-- Step 7: Create deposits for existing assignments
INSERT INTO security_deposits (assignment_id, notes)
SELECT 
  a.id,
  'Auto-created for existing assignment'
FROM assignments a
LEFT JOIN security_deposits sd ON a.id = sd.assignment_id
WHERE a.tenant_id IS NOT NULL 
  AND a.status = 'Active'
  AND sd.id IS NULL
ON CONFLICT (assignment_id) DO NOTHING;

-- Step 8: Verify setup
SELECT 
  'Setup Complete' as status,
  (SELECT COUNT(*) FROM security_deposits) as total_deposits,
  (SELECT COUNT(*) FROM security_deposit_deductions) as total_deductions;
