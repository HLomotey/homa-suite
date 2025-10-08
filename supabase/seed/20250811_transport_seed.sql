-- Seed data for Transport Module
-- Created: 2025-08-11

-- Insert sample organization if not exists
DO $$
DECLARE
  org_id UUID;
BEGIN
  -- Check if we have at least one organization
  SELECT id INTO org_id FROM organizations LIMIT 1;
  
  -- If no organization exists, create a sample one
  IF org_id IS NULL THEN
    INSERT INTO organizations (id, name, created_at, updated_at)
    VALUES (uuid_generate_v4(), 'Sample Organization', NOW(), NOW())
    RETURNING id INTO org_id;
    
    -- Create a sample user and link to organization
    -- Note: In a real environment, this would be handled by the auth system
    INSERT INTO user_organizations (user_id, org_id, role, created_at)
    VALUES (auth.uid(), org_id, 'manager', NOW());
  END IF;
END
$$;

-- Get the first organization ID for seeding
DO $$
DECLARE
  org_id UUID;
  manager_id UUID;
  driver1_id UUID;
  driver2_id UUID;
  vehicle1_id UUID;
  vehicle2_id UUID;
  vehicle3_id UUID;
  maint_type1_id UUID;
  maint_type2_id UUID;
  maint_type3_id UUID;
  route1_id UUID;
  route2_id UUID;
  route3_id UUID;
  combined_route1_id UUID;
  combined_route2_id UUID;
  assignment1_id UUID;
  assignment2_id UUID;
BEGIN
  -- Get organization ID
  SELECT id INTO org_id FROM organizations LIMIT 1;
  
  -- Get or create manager and driver users
  -- In a real environment, these would be actual auth users
  SELECT id INTO manager_id FROM auth.users WHERE email = 'manager@example.com' LIMIT 1;
  IF manager_id IS NULL THEN
    -- This is a placeholder. In a real environment, users would be created through auth
    -- and this would be handled differently
    manager_id := uuid_generate_v4();
  END IF;
  
  SELECT id INTO driver1_id FROM auth.users WHERE email = 'driver1@example.com' LIMIT 1;
  IF driver1_id IS NULL THEN
    driver1_id := uuid_generate_v4();
  END IF;
  
  SELECT id INTO driver2_id FROM auth.users WHERE email = 'driver2@example.com' LIMIT 1;
  IF driver2_id IS NULL THEN
    driver2_id := uuid_generate_v4();
  END IF;
  
  -- Insert vehicles
  INSERT INTO vehicles (id, state, address, make, model, vin, year, color, license_plate, status, purchase_date, organization_id)
  VALUES 
    (uuid_generate_v4(), 'CA', '123 Main St, San Francisco, CA', 'Toyota', 'Hiace', 'JT3HP10V5N0123456', 2023, 'White', 'ABC123', 'Active', '2023-01-15', org_id),
    (uuid_generate_v4(), 'CA', '456 Oak Ave, Oakland, CA', 'Ford', 'Transit', '1FTBW3XM6HKA78901', 2022, 'Silver', 'XYZ789', 'Active', '2022-06-10', org_id),
    (uuid_generate_v4(), 'CA', '789 Pine St, San Jose, CA', 'Mercedes', 'Sprinter', 'WDAPF4CC8KT012345', 2021, 'Black', 'DEF456', 'Maintenance', '2021-03-22', org_id)
  RETURNING id INTO vehicle1_id, vehicle2_id, vehicle3_id;
  
  -- Insert maintenance types
  INSERT INTO maintenance_types (id, name, description, category, estimated_cost, estimated_duration, organization_id)
  VALUES 
    (uuid_generate_v4(), 'Oil Change', 'Regular oil and filter change', 'Routine', 75.00, 1.0, org_id),
    (uuid_generate_v4(), 'Tire Rotation', 'Rotate tires for even wear', 'Routine', 50.00, 0.5, org_id),
    (uuid_generate_v4(), 'Brake Replacement', 'Replace brake pads and inspect rotors', 'Repair', 350.00, 2.5, org_id)
  RETURNING id INTO maint_type1_id, maint_type2_id, maint_type3_id;
  
  -- Insert maintenance transactions
  INSERT INTO maintenance_transactions (id, vehicle_id, maintenance_type_id, date, issue, amount, notes, performed_by, status, organization_id)
  VALUES 
    (uuid_generate_v4(), vehicle1_id, maint_type1_id, '2025-07-15', 'Regular maintenance', 80.00, 'Completed as scheduled', 'John Mechanic', 'Completed', org_id),
    (uuid_generate_v4(), vehicle2_id, maint_type2_id, '2025-07-20', 'Uneven tire wear noticed', 55.00, 'Rotated tires and checked alignment', 'Mike Technician', 'Completed', org_id),
    (uuid_generate_v4(), vehicle3_id, maint_type3_id, '2025-08-05', 'Squeaking when braking', 375.00, 'Replacing front brake pads', 'John Mechanic', 'In Progress', org_id),
    (uuid_generate_v4(), vehicle1_id, maint_type2_id, '2025-08-20', 'Scheduled rotation', 50.00, 'Regular maintenance', 'Mike Technician', 'Scheduled', org_id);
  
  -- Insert routes
  INSERT INTO routes (id, name, description, organization_id)
  VALUES 
    (uuid_generate_v4(), 'Downtown Loop', 'Route through downtown area with major stops', org_id),
    (uuid_generate_v4(), 'Airport Shuttle', 'Direct route to and from the airport', org_id),
    (uuid_generate_v4(), 'School Route', 'Morning and afternoon school pickup/dropoff', org_id)
  RETURNING id INTO route1_id, route2_id, route3_id;
  
  -- Insert route schedules
  INSERT INTO route_schedules (id, route_id, day, start_time, end_time, organization_id)
  VALUES 
    (uuid_generate_v4(), route1_id, 'Monday', '08:00', '10:00', org_id),
    (uuid_generate_v4(), route1_id, 'Wednesday', '08:00', '10:00', org_id),
    (uuid_generate_v4(), route1_id, 'Friday', '08:00', '10:00', org_id),
    (uuid_generate_v4(), route2_id, 'Monday', '12:00', '14:00', org_id),
    (uuid_generate_v4(), route2_id, 'Tuesday', '12:00', '14:00', org_id),
    (uuid_generate_v4(), route2_id, 'Wednesday', '12:00', '14:00', org_id),
    (uuid_generate_v4(), route2_id, 'Thursday', '12:00', '14:00', org_id),
    (uuid_generate_v4(), route2_id, 'Friday', '12:00', '14:00', org_id),
    (uuid_generate_v4(), route3_id, 'Monday', '07:00', '08:30', org_id),
    (uuid_generate_v4(), route3_id, 'Monday', '15:00', '16:30', org_id),
    (uuid_generate_v4(), route3_id, 'Tuesday', '07:00', '08:30', org_id),
    (uuid_generate_v4(), route3_id, 'Tuesday', '15:00', '16:30', org_id),
    (uuid_generate_v4(), route3_id, 'Wednesday', '07:00', '08:30', org_id),
    (uuid_generate_v4(), route3_id, 'Wednesday', '15:00', '16:30', org_id),
    (uuid_generate_v4(), route3_id, 'Thursday', '07:00', '08:30', org_id),
    (uuid_generate_v4(), route3_id, 'Thursday', '15:00', '16:30', org_id),
    (uuid_generate_v4(), route3_id, 'Friday', '07:00', '08:30', org_id),
    (uuid_generate_v4(), route3_id, 'Friday', '15:00', '16:30', org_id);
  
  -- Insert combined routes
  INSERT INTO combined_routes (id, name, description, created_by, status, organization_id)
  VALUES 
    (uuid_generate_v4(), 'Morning School Route', 'Morning school pickup followed by downtown loop', manager_id, 'active', org_id),
    (uuid_generate_v4(), 'Afternoon Airport & School', 'Afternoon airport shuttle followed by school dropoff', manager_id, 'active', org_id)
  RETURNING id INTO combined_route1_id, combined_route2_id;
  
  -- Insert combined route details
  INSERT INTO combined_route_details (id, combined_route_id, route_id, "order", organization_id)
  VALUES 
    (uuid_generate_v4(), combined_route1_id, route3_id, 1, org_id),
    (uuid_generate_v4(), combined_route1_id, route1_id, 2, org_id),
    (uuid_generate_v4(), combined_route2_id, route2_id, 1, org_id),
    (uuid_generate_v4(), combined_route2_id, route3_id, 2, org_id);
  
  -- Insert route assignments
  INSERT INTO route_assignments (id, combined_route_id, vehicle_id, driver_id, start_date, end_date, status, notes, organization_id)
  VALUES 
    (uuid_generate_v4(), combined_route1_id, vehicle1_id, driver1_id, '2025-08-01', '2025-08-31', 'in_progress', 'Regular morning route for August', org_id),
    (uuid_generate_v4(), combined_route2_id, vehicle2_id, driver2_id, '2025-08-01', '2025-08-31', 'scheduled', 'Regular afternoon route for August', org_id)
  RETURNING id INTO assignment1_id, assignment2_id;
  
  -- Insert route execution logs
  INSERT INTO route_execution_logs (id, route_assignment_id, execution_date, start_time, end_time, status, notes, organization_id)
  VALUES 
    (uuid_generate_v4(), assignment1_id, '2025-08-01', '07:00', '10:15', 'completed', 'Completed without issues', org_id),
    (uuid_generate_v4(), assignment1_id, '2025-08-02', '07:00', '10:30', 'delayed', 'Traffic delay on highway', org_id),
    (uuid_generate_v4(), assignment1_id, '2025-08-05', '07:00', '10:10', 'completed', 'Completed without issues', org_id),
    (uuid_generate_v4(), assignment1_id, '2025-08-06', '07:00', '10:05', 'completed', 'Completed without issues', org_id),
    (uuid_generate_v4(), assignment1_id, '2025-08-07', '07:00', '10:20', 'completed', 'Slight delay due to construction', org_id),
    (uuid_generate_v4(), assignment1_id, '2025-08-08', '07:00', '10:00', 'completed', 'Completed without issues', org_id),
    (uuid_generate_v4(), assignment1_id, '2025-08-09', '07:00', null, 'started', 'In progress', org_id);
END
$$;
