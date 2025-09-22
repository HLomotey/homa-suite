-- Create maintenance categories table
CREATE TABLE maintenance_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create maintenance priorities table
CREATE TABLE maintenance_priorities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  sla_hours INTEGER, -- Service Level Agreement in hours
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create maintenance requests table
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tenant_id UUID REFERENCES tenants(id),
  property_id UUID REFERENCES properties(id) NOT NULL,
  room_id UUID REFERENCES rooms(id),
  category_id UUID REFERENCES maintenance_categories(id) NOT NULL,
  priority_id UUID REFERENCES maintenance_priorities(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'new', -- new, assigned, in_progress, on_hold, completed, cancelled
  reported_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES users(id),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  is_emergency BOOLEAN DEFAULT FALSE,
  permission_to_enter BOOLEAN DEFAULT FALSE,
  tenant_available_times JSONB,
  images JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create maintenance comments table
CREATE TABLE maintenance_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES maintenance_requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  comment TEXT NOT NULL,
  is_private BOOLEAN DEFAULT FALSE, -- Private comments are only visible to staff
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create maintenance history table
CREATE TABLE maintenance_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES maintenance_requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  action TEXT NOT NULL, -- status_change, comment_added, assigned, etc.
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance attachments table
CREATE TABLE maintenance_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES maintenance_requests(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default maintenance categories
INSERT INTO maintenance_categories (name, description, icon) VALUES
('Plumbing', 'Water leaks, clogged drains, toilet issues', 'droplet'),
('Electrical', 'Power outages, faulty outlets, lighting issues', 'zap'),
('HVAC', 'Heating, ventilation, and air conditioning problems', 'thermometer'),
('Appliance', 'Issues with refrigerator, stove, dishwasher, etc.', 'refrigerator'),
('Structural', 'Walls, floors, ceilings, doors, windows', 'home'),
('Pest Control', 'Insects, rodents, and other pests', 'bug'),
('Locks/Keys', 'Lock replacements, key issues, access problems', 'key'),
('Common Areas', 'Issues in shared spaces like hallways or lobbies', 'users'),
('Exterior', 'Building exterior, parking lot, landscaping', 'tree'),
('Other', 'Miscellaneous maintenance issues', 'more-horizontal');

-- Insert default maintenance priorities
INSERT INTO maintenance_priorities (name, description, color, sla_hours) VALUES
('Emergency', 'Immediate attention required (fire, flood, no heat in winter)', 'red', 4),
('Urgent', 'Should be addressed within 24 hours', 'orange', 24),
('High', 'Should be addressed within 2-3 days', 'amber', 72),
('Medium', 'Should be addressed within 1 week', 'yellow', 168),
('Low', 'Can be addressed during routine maintenance', 'green', 336);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_maintenance_categories_timestamp
BEFORE UPDATE ON maintenance_categories
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_maintenance_priorities_timestamp
BEFORE UPDATE ON maintenance_priorities
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_maintenance_requests_timestamp
BEFORE UPDATE ON maintenance_requests
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_maintenance_comments_timestamp
BEFORE UPDATE ON maintenance_comments
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Create indexes for better query performance
CREATE INDEX idx_maintenance_requests_tenant_id ON maintenance_requests(tenant_id);
CREATE INDEX idx_maintenance_requests_property_id ON maintenance_requests(property_id);
CREATE INDEX idx_maintenance_requests_room_id ON maintenance_requests(room_id);
CREATE INDEX idx_maintenance_requests_category_id ON maintenance_requests(category_id);
CREATE INDEX idx_maintenance_requests_priority_id ON maintenance_requests(priority_id);
CREATE INDEX idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX idx_maintenance_requests_assigned_to ON maintenance_requests(assigned_to);

-- Create RLS policies for maintenance tables
ALTER TABLE maintenance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for maintenance_categories
CREATE POLICY "Allow all users to view maintenance categories"
  ON maintenance_categories FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to insert maintenance categories"
  ON maintenance_categories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update maintenance categories"
  ON maintenance_categories FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create policies for maintenance_priorities
CREATE POLICY "Allow all users to view maintenance priorities"
  ON maintenance_priorities FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to insert maintenance priorities"
  ON maintenance_priorities FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update maintenance priorities"
  ON maintenance_priorities FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create policies for maintenance_requests
CREATE POLICY "Allow tenants to view their own maintenance requests"
  ON maintenance_requests FOR SELECT
  USING (
    auth.uid() = tenant_id OR
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow tenants to insert their own maintenance requests"
  ON maintenance_requests FOR INSERT
  WITH CHECK (
    auth.uid() = tenant_id OR
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow tenants to update their own maintenance requests"
  ON maintenance_requests FOR UPDATE
  USING (
    auth.uid() = tenant_id OR
    auth.role() = 'authenticated'
  );

-- Create policies for maintenance_comments
CREATE POLICY "Allow users to view maintenance comments"
  ON maintenance_comments FOR SELECT
  USING (
    (NOT is_private) OR
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated users to insert maintenance comments"
  ON maintenance_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Create policies for maintenance_history
CREATE POLICY "Allow authenticated users to view maintenance history"
  ON maintenance_history FOR SELECT
  USING (
    auth.role() = 'authenticated'
  );

-- Create policies for maintenance_attachments
CREATE POLICY "Allow users to view maintenance attachments"
  ON maintenance_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM maintenance_requests mr
      WHERE mr.id = request_id AND
      (mr.tenant_id = auth.uid() OR auth.role() = 'authenticated')
    )
  );

CREATE POLICY "Allow authenticated users to insert maintenance attachments"
  ON maintenance_attachments FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by
  );
