-- Create assignments table for room assignments
-- This table tracks staff room assignments and housing arrangements

-- Only create table if it doesn't exist to preserve existing data
CREATE TABLE IF NOT EXISTS public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NULL REFERENCES external_staff(id) ON DELETE SET NULL,
  tenant_name varchar(255) NULL,
  property_id uuid NULL,
  property_name varchar(255) NULL,
  room_id uuid NULL,
  room_name varchar(255) NULL,
  status varchar(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Active', 'Inactive', 'Terminated')),
  start_date date NULL,
  end_date date NULL,
  rent_amount numeric(10,2) NOT NULL DEFAULT 0.00 CHECK (rent_amount >= 0),
  housing_agreement boolean DEFAULT FALSE,
  transportation_agreement boolean DEFAULT FALSE,
  flight_agreement boolean DEFAULT FALSE,
  bus_card_agreement boolean DEFAULT FALSE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_assignments_tenant_id ON assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assignments_property_id ON assignments(property_id);
CREATE INDEX IF NOT EXISTS idx_assignments_room_id ON assignments(room_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_start_date ON assignments(start_date);
CREATE INDEX IF NOT EXISTS idx_assignments_end_date ON assignments(end_date);

-- Add comments for documentation
COMMENT ON TABLE assignments IS 'Staff room assignments and housing arrangements';
COMMENT ON COLUMN assignments.tenant_id IS 'Reference to external staff member assigned to the room';
COMMENT ON COLUMN assignments.tenant_name IS 'Cached name of the tenant for display purposes';
COMMENT ON COLUMN assignments.property_id IS 'Reference to the property (may be UUID or string)';
COMMENT ON COLUMN assignments.property_name IS 'Cached name of the property for display purposes';
COMMENT ON COLUMN assignments.room_id IS 'Reference to the room (may be UUID or string)';
COMMENT ON COLUMN assignments.room_name IS 'Cached name of the room for display purposes';
COMMENT ON COLUMN assignments.status IS 'Current status of the assignment';
COMMENT ON COLUMN assignments.start_date IS 'Date when the assignment begins';
COMMENT ON COLUMN assignments.end_date IS 'Date when the assignment ends (NULL for ongoing)';
COMMENT ON COLUMN assignments.rent_amount IS 'Monthly rent amount for this assignment';
COMMENT ON COLUMN assignments.housing_agreement IS 'Whether the tenant has agreed to housing benefit terms';
COMMENT ON COLUMN assignments.transportation_agreement IS 'Whether the tenant has agreed to transportation benefit terms';
COMMENT ON COLUMN assignments.flight_agreement IS 'Whether the tenant has agreed to flight agreement benefit terms';
COMMENT ON COLUMN assignments.bus_card_agreement IS 'Whether the tenant has agreed to bus card benefit terms and conditions';

-- Enable RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view assignments" ON assignments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert assignments" ON assignments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update assignments" ON assignments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete assignments" ON assignments
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_assignments_updated_at();

-- No sample data insertion since table already contains data
