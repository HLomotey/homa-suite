-- Run all security deposit migrations manually
-- Execute these in your Supabase SQL Editor in order:

-- 1. Add missing bus_card_agreement column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assignments' 
        AND column_name = 'bus_card_agreement'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE assignments ADD COLUMN bus_card_agreement BOOLEAN DEFAULT FALSE;
        COMMENT ON COLUMN assignments.bus_card_agreement IS 'Whether the tenant has agreed to bus card benefit terms';
        RAISE NOTICE 'Added bus_card_agreement column to assignments table';
    ELSE
        RAISE NOTICE 'bus_card_agreement column already exists in assignments table';
    END IF;
END $$;

-- 2. Fix payment_status constraint (remove column)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assignments' 
        AND column_name = 'payment_status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE assignments DROP COLUMN payment_status;
        RAISE NOTICE 'Dropped payment_status column from assignments table';
        
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE udt_name = 'payment_status_enum'
                AND table_schema = 'public'
            ) THEN
                DROP TYPE payment_status_enum;
                RAISE NOTICE 'Dropped unused payment_status_enum type';
            END IF;
        END IF;
    ELSE
        RAISE NOTICE 'payment_status column does not exist in assignments table (expected)';
    END IF;
END $$;

-- 3. Create security deposits tables
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

-- 4. Create triggers for automatic security deposit creation
CREATE OR REPLACE FUNCTION create_security_deposit_for_assignment()
RETURNS TRIGGER AS $$
DECLARE
  deposit_exists BOOLEAN := FALSE;
BEGIN
  RAISE NOTICE 'Trigger fired for assignment ID: %, tenant_id: %, status: %', NEW.id, NEW.tenant_id, NEW.status;
  
  IF NEW.tenant_id IS NOT NULL AND NEW.status = 'Active' THEN
    SELECT EXISTS(
      SELECT 1 FROM security_deposits 
      WHERE assignment_id = NEW.id
    ) INTO deposit_exists;
    
    RAISE NOTICE 'Deposit exists for assignment %: %', NEW.id, deposit_exists;
    
    IF NOT deposit_exists THEN
      INSERT INTO security_deposits (
        assignment_id,
        total_amount,
        payment_method,
        payment_status,
        notes
      ) VALUES (
        NEW.id,
        500.00,
        'payroll_deduction',
        'pending',
        'Auto-created for assignment'
      );
      
      RAISE NOTICE 'Created security deposit for assignment %', NEW.id;
    ELSE
      RAISE NOTICE 'Security deposit already exists for assignment %', NEW.id;
    END IF;
  ELSE
    RAISE NOTICE 'Skipping security deposit creation - tenant_id: %, status: %', NEW.tenant_id, NEW.status;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in create_security_deposit_for_assignment: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new assignments
CREATE TRIGGER trigger_create_security_deposit_on_assignment
  AFTER INSERT ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION create_security_deposit_for_assignment();

-- Create trigger for assignment updates
CREATE TRIGGER trigger_create_security_deposit_on_assignment_update
  AFTER UPDATE ON assignments
  FOR EACH ROW
  WHEN (
    (OLD.tenant_id IS NULL AND NEW.tenant_id IS NOT NULL) OR
    (OLD.status != 'Active' AND NEW.status = 'Active') OR
    (NEW.tenant_id IS NOT NULL AND NEW.status = 'Active' AND 
     (OLD.tenant_id != NEW.tenant_id OR OLD.status != NEW.status))
  )
  EXECUTE FUNCTION create_security_deposit_for_assignment();

-- 5. Create deposits for existing assignments
INSERT INTO security_deposits (
  assignment_id,
  total_amount,
  payment_method,
  payment_status,
  notes
)
SELECT 
  a.id as assignment_id,
  500.00 as total_amount,
  'payroll_deduction' as payment_method,
  'pending' as payment_status,
  'Created via manual migration' as notes
FROM assignments a
LEFT JOIN security_deposits sd ON sd.assignment_id = a.id
WHERE sd.id IS NULL
  AND a.tenant_id IS NOT NULL
  AND a.status = 'Active';

-- Enable RLS
ALTER TABLE security_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_deposit_deductions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view security deposits" ON security_deposits FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert security deposits" ON security_deposits FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update security deposits" ON security_deposits FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view deductions" ON security_deposit_deductions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert deductions" ON security_deposit_deductions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update deductions" ON security_deposit_deductions FOR UPDATE USING (auth.role() = 'authenticated');
