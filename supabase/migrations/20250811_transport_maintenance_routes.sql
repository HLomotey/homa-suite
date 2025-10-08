-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types if they don't exist
DO $$ 
BEGIN
  -- Create maintenance category enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'maintenance_category') THEN
    CREATE TYPE maintenance_category AS ENUM ('Preventive', 'Corrective', 'Predictive');
  END IF;
  
  -- Create transaction status enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
    CREATE TYPE transaction_status AS ENUM ('Scheduled', 'In Progress', 'Completed', 'Cancelled');
  END IF;
  
  -- Create route status enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'route_status') THEN
    CREATE TYPE route_status AS ENUM ('active', 'inactive');
  END IF;
  
  -- Create assignment status enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'assignment_status') THEN
    CREATE TYPE assignment_status AS ENUM ('scheduled', 'active', 'completed', 'cancelled');
  END IF;
  
  -- Create execution status enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'execution_status') THEN
    CREATE TYPE execution_status AS ENUM ('started', 'completed', 'delayed', 'cancelled');
  END IF;
  
  -- Create weekday enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'weekday') THEN
    CREATE TYPE weekday AS ENUM ('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
  END IF;
END
$$;

-- Create maintenance_types table
CREATE TABLE IF NOT EXISTS maintenance_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category maintenance_category NOT NULL,
  estimated_cost DECIMAL(10, 2) NOT NULL,
  estimated_duration DECIMAL(5, 2) NOT NULL, -- in hours
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
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
  updated_at TIMESTAMPTZ
);

-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create route_schedules table
CREATE TABLE IF NOT EXISTS route_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  day weekday NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create combined_routes table
CREATE TABLE IF NOT EXISTS combined_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status route_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create combined_route_details table
CREATE TABLE IF NOT EXISTS combined_route_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  combined_route_id UUID NOT NULL REFERENCES combined_routes(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_maintenance_transactions_vehicle ON maintenance_transactions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_route_schedules_route ON route_schedules(route_id);
CREATE INDEX IF NOT EXISTS idx_combined_route_details_combined_route ON combined_route_details(combined_route_id);
CREATE INDEX IF NOT EXISTS idx_route_assignments_vehicle ON route_assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_route_assignments_driver ON route_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_route_execution_logs_assignment ON route_execution_logs(route_assignment_id);

-- Enable RLS on all tables
ALTER TABLE maintenance_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE combined_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE combined_route_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_execution_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for maintenance_types
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'maintenance_types' AND policyname = 'Users can view maintenance types') THEN
    EXECUTE 'CREATE POLICY "Users can view maintenance types" ON maintenance_types FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'maintenance_types' AND policyname = 'Users can insert maintenance types') THEN
    EXECUTE 'CREATE POLICY "Users can insert maintenance types" ON maintenance_types FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'maintenance_types' AND policyname = 'Users can update maintenance types') THEN
    EXECUTE 'CREATE POLICY "Users can update maintenance types" ON maintenance_types FOR UPDATE USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'maintenance_types' AND policyname = 'Users can delete maintenance types') THEN
    EXECUTE 'CREATE POLICY "Users can delete maintenance types" ON maintenance_types FOR DELETE USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- Create RLS policies for maintenance_transactions
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'maintenance_transactions' AND policyname = 'Users can view maintenance transactions') THEN
    EXECUTE 'CREATE POLICY "Users can view maintenance transactions" ON maintenance_transactions FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'maintenance_transactions' AND policyname = 'Users can insert maintenance transactions') THEN
    EXECUTE 'CREATE POLICY "Users can insert maintenance transactions" ON maintenance_transactions FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'maintenance_transactions' AND policyname = 'Users can update maintenance transactions') THEN
    EXECUTE 'CREATE POLICY "Users can update maintenance transactions" ON maintenance_transactions FOR UPDATE USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'maintenance_transactions' AND policyname = 'Users can delete maintenance transactions') THEN
    EXECUTE 'CREATE POLICY "Users can delete maintenance transactions" ON maintenance_transactions FOR DELETE USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- Create RLS policies for routes and related tables
DO $$ 
BEGIN
  -- Routes
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'routes' AND policyname = 'Users can view routes') THEN
    EXECUTE 'CREATE POLICY "Users can view routes" ON routes FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'routes' AND policyname = 'Users can insert routes') THEN
    EXECUTE 'CREATE POLICY "Users can insert routes" ON routes FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  -- Route schedules
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'route_schedules' AND policyname = 'Users can view route schedules') THEN
    EXECUTE 'CREATE POLICY "Users can view route schedules" ON route_schedules FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'route_schedules' AND policyname = 'Users can insert route schedules') THEN
    EXECUTE 'CREATE POLICY "Users can insert route schedules" ON route_schedules FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  -- Combined routes
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'combined_routes' AND policyname = 'Users can view combined routes') THEN
    EXECUTE 'CREATE POLICY "Users can view combined routes" ON combined_routes FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'combined_routes' AND policyname = 'Users can insert combined routes') THEN
    EXECUTE 'CREATE POLICY "Users can insert combined routes" ON combined_routes FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  -- Combined route details
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'combined_route_details' AND policyname = 'Users can view combined route details') THEN
    EXECUTE 'CREATE POLICY "Users can view combined route details" ON combined_route_details FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'combined_route_details' AND policyname = 'Users can insert combined route details') THEN
    EXECUTE 'CREATE POLICY "Users can insert combined route details" ON combined_route_details FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- Create RLS policies for route assignments and execution logs
DO $$ 
BEGIN
  -- Route assignments
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'route_assignments' AND policyname = 'Users can view route assignments') THEN
    EXECUTE 'CREATE POLICY "Users can view route assignments" ON route_assignments FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'route_assignments' AND policyname = 'Users can insert route assignments') THEN
    EXECUTE 'CREATE POLICY "Users can insert route assignments" ON route_assignments FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'route_assignments' AND policyname = 'Drivers can view only their assignments') THEN
    EXECUTE 'CREATE POLICY "Drivers can view only their assignments" ON route_assignments FOR SELECT USING (driver_id = auth.uid())';
  END IF;
  
  -- Route execution logs
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'route_execution_logs' AND policyname = 'Users can view route execution logs') THEN
    EXECUTE 'CREATE POLICY "Users can view route execution logs" ON route_execution_logs FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'route_execution_logs' AND policyname = 'Users can insert route execution logs') THEN
    EXECUTE 'CREATE POLICY "Users can insert route execution logs" ON route_execution_logs FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'route_execution_logs' AND policyname = 'Drivers can view only their execution logs') THEN
    EXECUTE 'CREATE POLICY "Drivers can view only their execution logs" ON route_execution_logs FOR SELECT USING (route_assignment_id IN (SELECT id FROM route_assignments WHERE driver_id = auth.uid()))';
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
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_maintenance_types_timestamp') THEN
    CREATE TRIGGER update_maintenance_types_timestamp
    BEFORE UPDATE ON maintenance_types
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_maintenance_transactions_timestamp') THEN
    CREATE TRIGGER update_maintenance_transactions_timestamp
    BEFORE UPDATE ON maintenance_transactions
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_routes_timestamp') THEN
    CREATE TRIGGER update_routes_timestamp
    BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_route_schedules_timestamp') THEN
    CREATE TRIGGER update_route_schedules_timestamp
    BEFORE UPDATE ON route_schedules
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_combined_routes_timestamp') THEN
    CREATE TRIGGER update_combined_routes_timestamp
    BEFORE UPDATE ON combined_routes
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_combined_route_details_timestamp') THEN
    CREATE TRIGGER update_combined_route_details_timestamp
    BEFORE UPDATE ON combined_route_details
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_route_assignments_timestamp') THEN
    CREATE TRIGGER update_route_assignments_timestamp
    BEFORE UPDATE ON route_assignments
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_route_execution_logs_timestamp') THEN
    CREATE TRIGGER update_route_execution_logs_timestamp
    BEFORE UPDATE ON route_execution_logs
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
END
$$;

-- Add comments on tables for better documentation
COMMENT ON TABLE maintenance_types IS 'Types of maintenance that can be performed on vehicles';
COMMENT ON TABLE maintenance_transactions IS 'Records of maintenance performed on vehicles';
COMMENT ON TABLE routes IS 'Individual routes that can be combined into route assignments';
COMMENT ON TABLE route_schedules IS 'Schedule for when routes are typically run';
COMMENT ON TABLE combined_routes IS 'Combinations of routes that can be assigned together';
COMMENT ON TABLE combined_route_details IS 'Details of which routes are included in a combined route';
COMMENT ON TABLE route_assignments IS 'Assignments of combined routes to vehicles and drivers';
COMMENT ON TABLE route_execution_logs IS 'Logs of route executions by drivers, including status updates';

-- Create views for common queries

-- View for active vehicles with their maintenance history and location
CREATE OR REPLACE VIEW active_vehicles_with_maintenance AS
SELECT 
  v.id AS vehicle_id,
  v.make,
  v.model,
  v.year,
  v.license_plate,
  v.status,
  cl.name AS location_name,
  cl.city AS location_city,
  cl.state AS location_state,
  COALESCE(
    (SELECT json_agg(
      json_build_object(
        'id', mt.id,
        'date', mt.date,
        'type', mtype.name,
        'amount', mt.amount,
        'status', mt.status
      ) ORDER BY mt.date DESC
    ) FROM maintenance_transactions mt
    JOIN maintenance_types mtype ON mt.maintenance_type_id = mtype.id
    WHERE mt.vehicle_id = v.id
    ), '[]'::json
  ) AS maintenance_history
FROM vehicles v
JOIN company_locations cl ON v.location_id = cl.id
WHERE v.status != 'Sold';

-- View for active routes with their schedules
CREATE OR REPLACE VIEW active_routes_with_schedules AS
SELECT 
  r.id AS route_id,
  r.name AS route_name,
  r.description,
  COALESCE(
    (SELECT json_agg(
      json_build_object(
        'id', rs.id,
        'day', rs.day,
        'startTime', rs.start_time,
        'endTime', rs.end_time
      ) ORDER BY 
        CASE rs.day
          WHEN 'Sunday' THEN 1
          WHEN 'Monday' THEN 2
          WHEN 'Tuesday' THEN 3
          WHEN 'Wednesday' THEN 4
          WHEN 'Thursday' THEN 5
          WHEN 'Friday' THEN 6
          WHEN 'Saturday' THEN 7
        END
    ) FROM route_schedules rs
    WHERE rs.route_id = r.id
    ), '[]'::json
  ) AS schedules
FROM routes r;

-- View for active combined routes with their details
CREATE OR REPLACE VIEW active_combined_routes_with_details AS
SELECT 
  cr.id AS combined_route_id,
  cr.name AS combined_route_name,
  cr.description,
  cr.status,
  COALESCE((u.raw_user_meta_data)::json->>'first_name', '') || ' ' || COALESCE((u.raw_user_meta_data)::json->>'last_name', '') AS created_by_name,
  COALESCE(
    (SELECT json_agg(
      json_build_object(
        'id', crd.id,
        'routeId', crd.route_id,
        'routeName', r.name,
        'order', crd."order"
      ) ORDER BY crd."order"
    ) FROM combined_route_details crd
    JOIN routes r ON crd.route_id = r.id
    WHERE crd.combined_route_id = cr.id
    ), '[]'::json
  ) AS routes
FROM combined_routes cr
JOIN auth.users u ON cr.created_by = u.id
WHERE cr.status = 'active';

-- View for current route assignments with vehicle and driver info
CREATE OR REPLACE VIEW current_route_assignments AS
SELECT 
  ra.id AS assignment_id,
  ra.combined_route_id,
  cr.name AS combined_route_name,
  ra.vehicle_id,
  v.make || ' ' || v.model || ' (' || v.license_plate || ')' AS vehicle_info,
  cl.name AS vehicle_location,
  ra.driver_id,
  COALESCE((u.raw_user_meta_data)::json->>'first_name', '') || ' ' || COALESCE((u.raw_user_meta_data)::json->>'last_name', '') AS driver_name,
  ra.start_date,
  ra.end_date,
  ra.status,
  ra.notes
FROM route_assignments ra
JOIN combined_routes cr ON ra.combined_route_id = cr.id
JOIN vehicles v ON ra.vehicle_id = v.id
JOIN company_locations cl ON v.location_id = cl.id
JOIN auth.users u ON ra.driver_id = u.id
WHERE (ra.end_date IS NULL OR ra.end_date >= CURRENT_DATE)
  AND ra.status IN ('scheduled', 'active');

-- Create notification functions for real-time updates

-- Function to notify when a route assignment is created or updated
CREATE OR REPLACE FUNCTION notify_route_assignment_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'route_assignment_change',
    json_build_object(
      'id', NEW.id,
      'combined_route_id', NEW.combined_route_id,
      'vehicle_id', NEW.vehicle_id,
      'driver_id', NEW.driver_id,
      'status', NEW.status,
      'operation', TG_OP
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify when a route execution log is created or updated
CREATE OR REPLACE FUNCTION notify_route_execution_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'route_execution_change',
    json_build_object(
      'id', NEW.id,
      'route_assignment_id', NEW.route_assignment_id,
      'status', NEW.status,
      'operation', TG_OP
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for notifications
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'notify_route_assignment_change') THEN
    CREATE TRIGGER notify_route_assignment_change
    AFTER INSERT OR UPDATE ON route_assignments
    FOR EACH ROW EXECUTE FUNCTION notify_route_assignment_change();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'notify_route_execution_change') THEN
    CREATE TRIGGER notify_route_execution_change
    AFTER INSERT OR UPDATE ON route_execution_logs
    FOR EACH ROW EXECUTE FUNCTION notify_route_execution_change();
  END IF;
END
$$;
