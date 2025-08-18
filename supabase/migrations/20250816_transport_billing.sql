-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop and recreate enum types to ensure consistency
DO $$ 
BEGIN
  -- Drop existing types if they exist
  DROP TYPE IF EXISTS billing_status CASCADE;
  DROP TYPE IF EXISTS billing_period_status CASCADE;
  
  -- Create the enum types with the correct values
  CREATE TYPE billing_status AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');
  CREATE TYPE billing_period_status AS ENUM ('ACTIVE', 'CLOSED', 'ARCHIVED');
END
$$;

-- Create billing_periods table
CREATE TABLE IF NOT EXISTS billing_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status billing_period_status NOT NULL DEFAULT 'ACTIVE',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Create transport_billing table
CREATE TABLE IF NOT EXISTS transport_billing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  billing_period_id UUID NOT NULL REFERENCES billing_periods(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES company_locations(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  status billing_status NOT NULL DEFAULT 'PENDING',
  due_date DATE NOT NULL,
  paid_date DATE,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  UNIQUE(billing_period_id, staff_id, vehicle_id)
);

-- Create transport_billing_rates table for configurable rates
CREATE TABLE IF NOT EXISTS transport_billing_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES company_locations(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL, -- e.g., 'Sedan', 'SUV', 'Van'
  rate_per_day DECIMAL(10, 2) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  UNIQUE(location_id, vehicle_type, effective_from)
);

-- Create transport_billing_usage table to track actual usage
CREATE TABLE IF NOT EXISTS transport_billing_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  billing_id UUID NOT NULL REFERENCES transport_billing(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  distance DECIMAL(10, 2), -- in miles/kilometers
  duration DECIMAL(10, 2), -- in hours
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transport_billing_period ON transport_billing(billing_period_id);
CREATE INDEX IF NOT EXISTS idx_transport_billing_staff ON transport_billing(staff_id);
CREATE INDEX IF NOT EXISTS idx_transport_billing_location ON transport_billing(location_id);
CREATE INDEX IF NOT EXISTS idx_transport_billing_vehicle ON transport_billing(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_transport_billing_status ON transport_billing(status);
CREATE INDEX IF NOT EXISTS idx_transport_billing_rates_location ON transport_billing_rates(location_id);
CREATE INDEX IF NOT EXISTS idx_transport_billing_usage_billing ON transport_billing_usage(billing_id);

-- Enable RLS on all tables
ALTER TABLE billing_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_billing_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_billing_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for billing_periods
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billing_periods' AND policyname = 'Users can view billing periods') THEN
    EXECUTE 'CREATE POLICY "Users can view billing periods" ON billing_periods FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billing_periods' AND policyname = 'Users can insert billing periods') THEN
    EXECUTE 'CREATE POLICY "Users can insert billing periods" ON billing_periods FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billing_periods' AND policyname = 'Users can update billing periods') THEN
    EXECUTE 'CREATE POLICY "Users can update billing periods" ON billing_periods FOR UPDATE USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- Create RLS policies for transport_billing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transport_billing' AND policyname = 'Users can view transport billing') THEN
    EXECUTE 'CREATE POLICY "Users can view transport billing" ON transport_billing FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transport_billing' AND policyname = 'Users can insert transport billing') THEN
    EXECUTE 'CREATE POLICY "Users can insert transport billing" ON transport_billing FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transport_billing' AND policyname = 'Users can update transport billing') THEN
    EXECUTE 'CREATE POLICY "Users can update transport billing" ON transport_billing FOR UPDATE USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transport_billing' AND policyname = 'Staff can view their own billing') THEN
    EXECUTE 'CREATE POLICY "Staff can view their own billing" ON transport_billing FOR SELECT USING (staff_id = auth.uid())';
  END IF;
END
$$;

-- Create RLS policies for transport_billing_rates
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transport_billing_rates' AND policyname = 'Users can view transport billing rates') THEN
    EXECUTE 'CREATE POLICY "Users can view transport billing rates" ON transport_billing_rates FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transport_billing_rates' AND policyname = 'Users can insert transport billing rates') THEN
    EXECUTE 'CREATE POLICY "Users can insert transport billing rates" ON transport_billing_rates FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transport_billing_rates' AND policyname = 'Users can update transport billing rates') THEN
    EXECUTE 'CREATE POLICY "Users can update transport billing rates" ON transport_billing_rates FOR UPDATE USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- Create RLS policies for transport_billing_usage
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transport_billing_usage' AND policyname = 'Users can view transport billing usage') THEN
    EXECUTE 'CREATE POLICY "Users can view transport billing usage" ON transport_billing_usage FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transport_billing_usage' AND policyname = 'Users can insert transport billing usage') THEN
    EXECUTE 'CREATE POLICY "Users can insert transport billing usage" ON transport_billing_usage FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transport_billing_usage' AND policyname = 'Users can update transport billing usage') THEN
    EXECUTE 'CREATE POLICY "Users can update transport billing usage" ON transport_billing_usage FOR UPDATE USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update timestamps
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_billing_periods_timestamp') THEN
    CREATE TRIGGER update_billing_periods_timestamp
    BEFORE UPDATE ON billing_periods
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_transport_billing_timestamp') THEN
    CREATE TRIGGER update_transport_billing_timestamp
    BEFORE UPDATE ON transport_billing
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_transport_billing_rates_timestamp') THEN
    CREATE TRIGGER update_transport_billing_rates_timestamp
    BEFORE UPDATE ON transport_billing_rates
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_transport_billing_usage_timestamp') THEN
    CREATE TRIGGER update_transport_billing_usage_timestamp
    BEFORE UPDATE ON transport_billing_usage
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
END
$$;

-- Add comments on tables for better documentation
COMMENT ON TABLE billing_periods IS 'Defines billing periods for all billing activities';
COMMENT ON TABLE transport_billing IS 'Records of transport billing for staff assigned to housing';
COMMENT ON TABLE transport_billing_rates IS 'Configurable rates for transport billing based on location and vehicle type';
COMMENT ON TABLE transport_billing_usage IS 'Detailed usage records for transport billing';

-- Create views for common queries

-- View for active billing periods
CREATE OR REPLACE VIEW active_billing_periods AS
SELECT 
  id,
  name,
  start_date,
  end_date,
  status,
  created_at
FROM billing_periods
WHERE status = 'ACTIVE';

-- View for staff transport billing with details
CREATE OR REPLACE VIEW staff_transport_billing_details AS
SELECT 
  tb.id AS billing_id,
  tb.billing_period_id,
  bp.name AS billing_period_name,
  bp.start_date AS period_start_date,
  bp.end_date AS period_end_date,
  tb.staff_id,
  COALESCE((u.raw_user_meta_data)::json->>'first_name', '') || ' ' || COALESCE((u.raw_user_meta_data)::json->>'last_name', '') AS staff_name,
  tb.location_id,
  cl.name AS location_name,
  tb.vehicle_id,
  v.make || ' ' || v.model || ' (' || v.license_plate || ')' AS vehicle_info,
  tb.amount,
  tb.status,
  tb.due_date,
  tb.paid_date,
  tb.payment_reference,
  tb.notes,
  tb.created_at
FROM transport_billing tb
JOIN billing_periods bp ON tb.billing_period_id = bp.id
JOIN auth.users u ON tb.staff_id = u.id
JOIN company_locations cl ON tb.location_id = cl.id
JOIN vehicles v ON tb.vehicle_id = v.id;

-- View for transport billing summary by location
CREATE OR REPLACE VIEW transport_billing_location_summary AS
SELECT 
  bp.id AS billing_period_id,
  bp.name AS billing_period_name,
  tb.location_id,
  cl.name AS location_name,
  COUNT(tb.id) AS total_billings,
  SUM(CASE WHEN tb.status = 'PAID' THEN tb.amount ELSE 0 END) AS total_paid,
  SUM(CASE WHEN tb.status = 'PENDING' OR tb.status = 'OVERDUE' THEN tb.amount ELSE 0 END) AS total_outstanding,
  SUM(tb.amount) AS total_amount
FROM transport_billing tb
JOIN billing_periods bp ON tb.billing_period_id = bp.id
JOIN company_locations cl ON tb.location_id = cl.id
GROUP BY bp.id, bp.name, tb.location_id, cl.name;
