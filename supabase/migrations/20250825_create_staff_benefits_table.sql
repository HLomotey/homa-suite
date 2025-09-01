-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Create benefit_type enum
CREATE TYPE benefit_type AS ENUM ('housing', 'transportation') -- Create benefit_status enum  
CREATE TYPE benefit_status AS ENUM ('active', 'inactive', 'pending', 'suspended');
-- Create staff_benefits table
CREATE TABLE staff_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL,
  staff_location_id UUID,
  benefit_type benefit_type NOT NULL,
  status benefit_status DEFAULT 'pending',
  -- General fields
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  notes TEXT,
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  -- Constraints
  CONSTRAINT staff_benefits_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES external_staff(id),
  CONSTRAINT staff_benefits_staff_location_id_fkey FOREIGN KEY (staff_location_id) REFERENCES staff_locations(id),
  CONSTRAINT staff_benefits_effective_expiry_check CHECK (
    expiry_date IS NULL
    OR expiry_date > effective_date
  )
);
-- Create indexes for better performance
CREATE INDEX idx_staff_benefits_staff_id ON staff_benefits(staff_id);
CREATE INDEX idx_staff_benefits_staff_location_id ON staff_benefits(staff_location_id);
CREATE INDEX idx_staff_benefits_benefit_type ON staff_benefits(benefit_type);
CREATE INDEX idx_staff_benefits_status ON staff_benefits(status);
CREATE INDEX idx_staff_benefits_effective_date ON staff_benefits(effective_date);
ALTER TABLE staff_benefits ENABLE ROW LEVEL SECURITY;
-- Create policies for staff_benefits
DO $$ BEGIN -- Check if the policy exists before creating it
IF NOT EXISTS (
  SELECT 1
  FROM pg_policies
  WHERE tablename = 'staff_benefits'
    AND policyname = 'Users can view Housing & Transportation'
) THEN EXECUTE 'CREATE POLICY "Users can view Housing & Transportation" ON staff_benefits FOR SELECT USING (auth.role() = ''authenticated'')';
END IF;
IF NOT EXISTS (
  SELECT 1
  FROM pg_policies
  WHERE tablename = 'staff_benefits'
    AND policyname = 'Users can insert Housing & Transportation'
) THEN EXECUTE 'CREATE POLICY "Users can insert Housing & Transportation" ON staff_benefits FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
END IF;
IF NOT EXISTS (
  SELECT 1
  FROM pg_policies
  WHERE tablename = 'staff_benefits'
    AND policyname = 'Users can update Housing & Transportation'
) THEN EXECUTE 'CREATE POLICY "Users can update Housing & Transportation" ON staff_benefits FOR UPDATE USING (auth.role() = ''authenticated'')';
END IF;
IF NOT EXISTS (
  SELECT 1
  FROM pg_policies
  WHERE tablename = 'staff_benefits'
    AND policyname = 'Users can delete Housing & Transportation'
) THEN EXECUTE 'CREATE POLICY "Users can delete Housing & Transportation" ON staff_benefits FOR DELETE USING (auth.role() = ''authenticated'')';
END IF;
END $$;
-- Create trigger to update timestamps and user tracking
CREATE OR REPLACE FUNCTION update_staff_benefits_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
NEW.updated_by = auth.uid();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_staff_benefits_timestamp BEFORE
UPDATE ON staff_benefits FOR EACH ROW EXECUTE FUNCTION update_staff_benefits_timestamp();
-- Create trigger to set created_by on insert
CREATE OR REPLACE FUNCTION set_staff_benefits_created_by() RETURNS TRIGGER AS $$ BEGIN NEW.created_by = auth.uid();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_staff_benefits_created_by BEFORE
INSERT ON staff_benefits FOR EACH ROW EXECUTE FUNCTION set_staff_benefits_created_by();
-- Add comments on table and columns for better documentation
COMMENT ON TABLE staff_benefits IS 'Housing & Transportation tracking housing and transportation requirements';
COMMENT ON COLUMN staff_benefits.staff_id IS 'Reference to external staff member (external_staff.id)';
COMMENT ON COLUMN staff_benefits.staff_location_id IS 'Reference to staff location where benefits apply';
COMMENT ON COLUMN staff_benefits.benefit_type IS 'Type of benefit required: housing or transportation (mutually exclusive)';
COMMENT ON COLUMN staff_benefits.status IS 'Current status of the benefit requirement';
COMMENT ON COLUMN staff_benefits.effective_date IS 'Date when the benefit becomes effective';
COMMENT ON COLUMN staff_benefits.expiry_date IS 'Date when the benefit expires (optional)';