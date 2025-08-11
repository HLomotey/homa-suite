-- Migration for Transport Module Tables with RLS
-- Created: 2025-08-11

-- Enable RLS on all tables by default
ALTER DATABASE postgres SET row_security = on;

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE vehicle_status AS ENUM ('Active', 'Inactive', 'Maintenance', 'Sold');
CREATE TYPE maintenance_category AS ENUM ('Routine', 'Repair', 'Emergency', 'Inspection', 'Upgrade');
CREATE TYPE transaction_status AS ENUM ('Completed', 'Scheduled', 'In Progress', 'Cancelled');
CREATE TYPE route_status AS ENUM ('active', 'inactive');
CREATE TYPE assignment_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE execution_status AS ENUM ('started', 'completed', 'delayed', 'cancelled');
CREATE TYPE weekday AS ENUM ('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state TEXT NOT NULL,
  address TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  vin TEXT NOT NULL UNIQUE,
  year INTEGER NOT NULL,
  color TEXT NOT NULL,
  license_plate TEXT NOT NULL,
  status vehicle_status NOT NULL DEFAULT 'Active',
  purchase_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create maintenance_types table
CREATE TABLE IF NOT EXISTS maintenance_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category maintenance_category NOT NULL,
  estimated_cost DECIMAL(10, 2) NOT NULL,
  estimated_duration DECIMAL(5, 2) NOT NULL, -- in hours
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create maintenance_transactions table
CREATE TABLE IF NOT EXISTS maintenance_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  maintenance_type_id UUID NOT NULL REFERENCES maintenance_types(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  issue TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  notes TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  status transaction_status NOT NULL DEFAULT 'Scheduled',
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create route_schedules table
CREATE TABLE IF NOT EXISTS route_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  day weekday NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create combined_routes table
CREATE TABLE IF NOT EXISTS combined_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status route_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create combined_route_details table
CREATE TABLE IF NOT EXISTS combined_route_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  combined_route_id UUID NOT NULL REFERENCES combined_routes(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  UNIQUE(combined_route_id, route_id)
);

-- Create route_assignments table
CREATE TABLE IF NOT EXISTS route_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  combined_route_id UUID NOT NULL REFERENCES combined_routes(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  status assignment_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create route_execution_logs table
CREATE TABLE IF NOT EXISTS route_execution_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_assignment_id UUID NOT NULL REFERENCES route_assignments(id) ON DELETE CASCADE,
  execution_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  status execution_status NOT NULL DEFAULT 'started',
  delay_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_vehicles_organization ON vehicles(organization_id);
CREATE INDEX idx_maintenance_types_organization ON maintenance_types(organization_id);
CREATE INDEX idx_maintenance_transactions_vehicle ON maintenance_transactions(vehicle_id);
CREATE INDEX idx_maintenance_transactions_organization ON maintenance_transactions(organization_id);
CREATE INDEX idx_routes_organization ON routes(organization_id);
CREATE INDEX idx_route_schedules_route ON route_schedules(route_id);
CREATE INDEX idx_route_schedules_organization ON route_schedules(organization_id);
CREATE INDEX idx_combined_routes_organization ON combined_routes(organization_id);
CREATE INDEX idx_combined_route_details_combined_route ON combined_route_details(combined_route_id);
CREATE INDEX idx_combined_route_details_organization ON combined_route_details(organization_id);
CREATE INDEX idx_route_assignments_combined_route ON route_assignments(combined_route_id);
CREATE INDEX idx_route_assignments_vehicle ON route_assignments(vehicle_id);
CREATE INDEX idx_route_assignments_driver ON route_assignments(driver_id);
CREATE INDEX idx_route_assignments_organization ON route_assignments(organization_id);
CREATE INDEX idx_route_execution_logs_assignment ON route_execution_logs(route_assignment_id);
CREATE INDEX idx_route_execution_logs_organization ON route_execution_logs(organization_id);

-- Enable Row Level Security on all tables
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE combined_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE combined_route_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_execution_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vehicles
CREATE POLICY vehicles_organization_isolation ON vehicles
  USING (organization_id IN (
    SELECT org_id FROM user_organizations WHERE user_id = auth.uid()
  ));

-- Create RLS policies for maintenance_types
CREATE POLICY maintenance_types_organization_isolation ON maintenance_types
  USING (organization_id IN (
    SELECT org_id FROM user_organizations WHERE user_id = auth.uid()
  ));

-- Create RLS policies for maintenance_transactions
CREATE POLICY maintenance_transactions_organization_isolation ON maintenance_transactions
  USING (organization_id IN (
    SELECT org_id FROM user_organizations WHERE user_id = auth.uid()
  ));

-- Create RLS policies for routes
CREATE POLICY routes_organization_isolation ON routes
  USING (organization_id IN (
    SELECT org_id FROM user_organizations WHERE user_id = auth.uid()
  ));

-- Create RLS policies for route_schedules
CREATE POLICY route_schedules_organization_isolation ON route_schedules
  USING (organization_id IN (
    SELECT org_id FROM user_organizations WHERE user_id = auth.uid()
  ));

-- Create RLS policies for combined_routes
CREATE POLICY combined_routes_organization_isolation ON combined_routes
  USING (organization_id IN (
    SELECT org_id FROM user_organizations WHERE user_id = auth.uid()
  ));

-- Create RLS policies for combined_route_details
CREATE POLICY combined_route_details_organization_isolation ON combined_route_details
  USING (organization_id IN (
    SELECT org_id FROM user_organizations WHERE user_id = auth.uid()
  ));

-- Create RLS policies for route_assignments
CREATE POLICY route_assignments_organization_isolation ON route_assignments
  USING (organization_id IN (
    SELECT org_id FROM user_organizations WHERE user_id = auth.uid()
  ));

-- Create RLS policies for route_execution_logs
CREATE POLICY route_execution_logs_organization_isolation ON route_execution_logs
  USING (organization_id IN (
    SELECT org_id FROM user_organizations WHERE user_id = auth.uid()
  ));

-- Create additional RLS policy for drivers to only see their own assignments
CREATE POLICY route_assignments_driver_access ON route_assignments
  FOR SELECT
  USING (
    driver_id = auth.uid() OR
    organization_id IN (
      SELECT org_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

-- Create additional RLS policy for drivers to update their own execution logs
CREATE POLICY route_execution_logs_driver_update ON route_execution_logs
  FOR UPDATE
  USING (
    route_assignment_id IN (
      SELECT id FROM route_assignments WHERE driver_id = auth.uid()
    )
  )
  WITH CHECK (
    route_assignment_id IN (
      SELECT id FROM route_assignments WHERE driver_id = auth.uid()
    )
  );

-- Create additional RLS policy for drivers to insert their own execution logs
CREATE POLICY route_execution_logs_driver_insert ON route_execution_logs
  FOR INSERT
  WITH CHECK (
    route_assignment_id IN (
      SELECT id FROM route_assignments WHERE driver_id = auth.uid()
    )
  );

-- Create stored procedures for common operations

-- Procedure to get all routes with their schedules
CREATE OR REPLACE FUNCTION get_routes_with_schedules(org_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  schedules JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.description,
    COALESCE(
      (SELECT json_agg(
        json_build_object(
          'id', rs.id,
          'day', rs.day,
          'startTime', rs.start_time,
          'endTime', rs.end_time
        )
      )
      FROM route_schedules rs
      WHERE rs.route_id = r.id
      ), '[]'::json
    ) as schedules
  FROM routes r
  WHERE r.organization_id = org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Procedure to get all combined routes with their details
CREATE OR REPLACE FUNCTION get_combined_routes_with_details(org_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  created_by UUID,
  status route_status,
  routes JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id,
    cr.name,
    cr.description,
    cr.created_by,
    cr.status,
    COALESCE(
      (SELECT json_agg(
        json_build_object(
          'id', crd.id,
          'routeId', crd.route_id,
          'routeName', r.name,
          'order', crd."order"
        ) ORDER BY crd."order"
      )
      FROM combined_route_details crd
      JOIN routes r ON crd.route_id = r.id
      WHERE crd.combined_route_id = cr.id
      ), '[]'::json
    ) as routes
  FROM combined_routes cr
  WHERE cr.organization_id = org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Procedure to get all route assignments with related info
CREATE OR REPLACE FUNCTION get_route_assignments_with_details(org_id UUID)
RETURNS TABLE (
  id UUID,
  combined_route_id UUID,
  combined_route_name TEXT,
  vehicle_id UUID,
  vehicle_info TEXT,
  driver_id UUID,
  driver_name TEXT,
  start_date DATE,
  end_date DATE,
  status assignment_status,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ra.id,
    ra.combined_route_id,
    cr.name as combined_route_name,
    ra.vehicle_id,
    (v.year::text || ' ' || v.make || ' ' || v.model || ' (' || v.license_plate || ')') as vehicle_info,
    ra.driver_id,
    (u.raw_user_meta_data->>'first_name' || ' ' || u.raw_user_meta_data->>'last_name') as driver_name,
    ra.start_date,
    ra.end_date,
    ra.status,
    ra.notes
  FROM route_assignments ra
  JOIN combined_routes cr ON ra.combined_route_id = cr.id
  JOIN vehicles v ON ra.vehicle_id = v.id
  JOIN auth.users u ON ra.driver_id = u.id
  WHERE ra.organization_id = org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Procedure to get driver's assignments
CREATE OR REPLACE FUNCTION get_driver_assignments(driver_uuid UUID)
RETURNS TABLE (
  id UUID,
  combined_route_id UUID,
  combined_route_name TEXT,
  vehicle_id UUID,
  vehicle_info TEXT,
  start_date DATE,
  end_date DATE,
  status assignment_status,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ra.id,
    ra.combined_route_id,
    cr.name as combined_route_name,
    ra.vehicle_id,
    (v.year::text || ' ' || v.make || ' ' || v.model || ' (' || v.license_plate || ')') as vehicle_info,
    ra.start_date,
    ra.end_date,
    ra.status,
    ra.notes
  FROM route_assignments ra
  JOIN combined_routes cr ON ra.combined_route_id = cr.id
  JOIN vehicles v ON ra.vehicle_id = v.id
  WHERE ra.driver_id = driver_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vehicles_timestamp
BEFORE UPDATE ON vehicles
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_maintenance_types_timestamp
BEFORE UPDATE ON maintenance_types
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_maintenance_transactions_timestamp
BEFORE UPDATE ON maintenance_transactions
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_routes_timestamp
BEFORE UPDATE ON routes
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_route_schedules_timestamp
BEFORE UPDATE ON route_schedules
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_combined_routes_timestamp
BEFORE UPDATE ON combined_routes
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_combined_route_details_timestamp
BEFORE UPDATE ON combined_route_details
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_route_assignments_timestamp
BEFORE UPDATE ON route_assignments
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_route_execution_logs_timestamp
BEFORE UPDATE ON route_execution_logs
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Add organization_id to all records when inserting
CREATE OR REPLACE FUNCTION set_organization_id()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT org_id INTO org_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1;
  NEW.organization_id := org_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_vehicles_organization_id
BEFORE INSERT ON vehicles
FOR EACH ROW EXECUTE FUNCTION set_organization_id();

CREATE TRIGGER set_maintenance_types_organization_id
BEFORE INSERT ON maintenance_types
FOR EACH ROW EXECUTE FUNCTION set_organization_id();

CREATE TRIGGER set_maintenance_transactions_organization_id
BEFORE INSERT ON maintenance_transactions
FOR EACH ROW EXECUTE FUNCTION set_organization_id();

CREATE TRIGGER set_routes_organization_id
BEFORE INSERT ON routes
FOR EACH ROW EXECUTE FUNCTION set_organization_id();

CREATE TRIGGER set_route_schedules_organization_id
BEFORE INSERT ON route_schedules
FOR EACH ROW EXECUTE FUNCTION set_organization_id();

CREATE TRIGGER set_combined_routes_organization_id
BEFORE INSERT ON combined_routes
FOR EACH ROW EXECUTE FUNCTION set_organization_id();

CREATE TRIGGER set_combined_route_details_organization_id
BEFORE INSERT ON combined_route_details
FOR EACH ROW EXECUTE FUNCTION set_organization_id();

CREATE TRIGGER set_route_assignments_organization_id
BEFORE INSERT ON route_assignments
FOR EACH ROW EXECUTE FUNCTION set_organization_id();

CREATE TRIGGER set_route_execution_logs_organization_id
BEFORE INSERT ON route_execution_logs
FOR EACH ROW EXECUTE FUNCTION set_organization_id();

-- Comment on tables and columns for documentation
COMMENT ON TABLE vehicles IS 'Stores information about vehicles in the transport fleet';
COMMENT ON TABLE maintenance_types IS 'Defines types of maintenance that can be performed on vehicles';
COMMENT ON TABLE maintenance_transactions IS 'Records of maintenance performed or scheduled for vehicles';
COMMENT ON TABLE routes IS 'Individual transport routes that can be combined into larger routes';
COMMENT ON TABLE route_schedules IS 'Schedule information for individual routes (days and times)';
COMMENT ON TABLE combined_routes IS 'Combinations of individual routes created by managers';
COMMENT ON TABLE combined_route_details IS 'Details of which routes are included in combined routes and their order';
COMMENT ON TABLE route_assignments IS 'Assignments of combined routes to vehicles and drivers';
COMMENT ON TABLE route_execution_logs IS 'Logs of route executions by drivers, including status updates';
