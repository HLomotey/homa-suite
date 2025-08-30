-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create report_status enum
CREATE TYPE report_status AS ENUM ('draft', 'submitted', 'approved');

-- Create action_item_status enum  
CREATE TYPE action_item_status AS ENUM ('open', 'in_progress', 'done');

-- Create month_end_reports table
CREATE TABLE month_end_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Meta information
  property_id UUID,
  property_name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  prepared_by UUID,
  status report_status DEFAULT 'draft',
  
  -- Summary tab
  headline VARCHAR(120) NOT NULL,
  narrative TEXT NOT NULL,
  key_risks TEXT[],
  key_wins TEXT[],
  
  -- Hotel Occupancy tab
  occupancy_start_pct DECIMAL(5,3) CHECK (occupancy_start_pct >= 0 AND occupancy_start_pct <= 100),
  occupancy_end_pct DECIMAL(5,3) CHECK (occupancy_end_pct >= 0 AND occupancy_end_pct <= 100),
  avg_occupancy_pct DECIMAL(5,3) CHECK (avg_occupancy_pct >= 0 AND avg_occupancy_pct <= 100),
  occupancy_notes TEXT,
  
  -- Guest Room Cleanliness tab
  cleanliness_score DECIMAL(4,3) CHECK (cleanliness_score >= 0 AND cleanliness_score <= 1),
  inspection_count INTEGER DEFAULT 0 CHECK (inspection_count >= 0),
  issues_found INTEGER DEFAULT 0 CHECK (issues_found >= 0),
  cleanliness_comments TEXT,
  
  -- Staffing & Notes tab
  training_updates TEXT,
  absenteeism_notes TEXT,
  incidents TEXT,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT month_end_reports_end_date_check CHECK (end_date >= start_date),
  CONSTRAINT month_end_reports_headline_length CHECK (char_length(headline) >= 10 AND char_length(headline) <= 120),
  CONSTRAINT month_end_reports_narrative_length CHECK (char_length(narrative) >= 50 AND char_length(narrative) <= 3000)
);

-- Create groups_in_house table for dynamic group list
CREATE TABLE month_end_report_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL,
  group_name VARCHAR(255) NOT NULL,
  arrival_date DATE NOT NULL,
  departure_date DATE NOT NULL,
  rooms_blocked INTEGER DEFAULT 0 CHECK (rooms_blocked >= 0),
  notes TEXT,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT month_end_report_groups_report_id_fkey FOREIGN KEY (report_id) REFERENCES month_end_reports(id) ON DELETE CASCADE,
  CONSTRAINT month_end_report_groups_departure_check CHECK (departure_date >= arrival_date)
);

-- Create action_items table for dynamic checklist
CREATE TABLE month_end_report_action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  owner VARCHAR(255),
  due_date DATE,
  status action_item_status DEFAULT 'open',
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT month_end_report_action_items_report_id_fkey FOREIGN KEY (report_id) REFERENCES month_end_reports(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_month_end_reports_property_id ON month_end_reports(property_id);
CREATE INDEX idx_month_end_reports_status ON month_end_reports(status);
CREATE INDEX idx_month_end_reports_start_date ON month_end_reports(start_date);
CREATE INDEX idx_month_end_reports_end_date ON month_end_reports(end_date);
CREATE INDEX idx_month_end_reports_prepared_by ON month_end_reports(prepared_by);

CREATE INDEX idx_month_end_report_groups_report_id ON month_end_report_groups(report_id);
CREATE INDEX idx_month_end_report_groups_arrival_date ON month_end_report_groups(arrival_date);

CREATE INDEX idx_month_end_report_action_items_report_id ON month_end_report_action_items(report_id);
CREATE INDEX idx_month_end_report_action_items_status ON month_end_report_action_items(status);
CREATE INDEX idx_month_end_report_action_items_due_date ON month_end_report_action_items(due_date);

-- Enable RLS
ALTER TABLE month_end_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE month_end_report_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE month_end_report_action_items ENABLE ROW LEVEL SECURITY;

-- Create policies for month_end_reports
DO $$ 
BEGIN
  -- Check if the policy exists before creating it
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'month_end_reports' AND policyname = 'Users can view month end reports') THEN
    EXECUTE 'CREATE POLICY "Users can view month end reports" ON month_end_reports FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'month_end_reports' AND policyname = 'Users can insert month end reports') THEN
    EXECUTE 'CREATE POLICY "Users can insert month end reports" ON month_end_reports FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'month_end_reports' AND policyname = 'Users can update month end reports') THEN
    EXECUTE 'CREATE POLICY "Users can update month end reports" ON month_end_reports FOR UPDATE USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'month_end_reports' AND policyname = 'Users can delete month end reports') THEN
    EXECUTE 'CREATE POLICY "Users can delete month end reports" ON month_end_reports FOR DELETE USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- Create policies for month_end_report_groups
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'month_end_report_groups' AND policyname = 'Users can view report groups') THEN
    EXECUTE 'CREATE POLICY "Users can view report groups" ON month_end_report_groups FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'month_end_report_groups' AND policyname = 'Users can insert report groups') THEN
    EXECUTE 'CREATE POLICY "Users can insert report groups" ON month_end_report_groups FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'month_end_report_groups' AND policyname = 'Users can update report groups') THEN
    EXECUTE 'CREATE POLICY "Users can update report groups" ON month_end_report_groups FOR UPDATE USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'month_end_report_groups' AND policyname = 'Users can delete report groups') THEN
    EXECUTE 'CREATE POLICY "Users can delete report groups" ON month_end_report_groups FOR DELETE USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- Create policies for month_end_report_action_items
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'month_end_report_action_items' AND policyname = 'Users can view action items') THEN
    EXECUTE 'CREATE POLICY "Users can view action items" ON month_end_report_action_items FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'month_end_report_action_items' AND policyname = 'Users can insert action items') THEN
    EXECUTE 'CREATE POLICY "Users can insert action items" ON month_end_report_action_items FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'month_end_report_action_items' AND policyname = 'Users can update action items') THEN
    EXECUTE 'CREATE POLICY "Users can update action items" ON month_end_report_action_items FOR UPDATE USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'month_end_report_action_items' AND policyname = 'Users can delete action items') THEN
    EXECUTE 'CREATE POLICY "Users can delete action items" ON month_end_report_action_items FOR DELETE USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- Create trigger functions and triggers for timestamp updates
CREATE OR REPLACE FUNCTION update_month_end_reports_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_month_end_reports_timestamp
BEFORE UPDATE ON month_end_reports
FOR EACH ROW EXECUTE FUNCTION update_month_end_reports_timestamp();

-- Create trigger to set created_by on insert
CREATE OR REPLACE FUNCTION set_month_end_reports_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by = auth.uid();
  NEW.prepared_by = COALESCE(NEW.prepared_by, auth.uid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_month_end_reports_created_by
BEFORE INSERT ON month_end_reports
FOR EACH ROW EXECUTE FUNCTION set_month_end_reports_created_by();

-- Create timestamp triggers for related tables
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_month_end_report_groups_timestamp
BEFORE UPDATE ON month_end_report_groups
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_month_end_report_action_items_timestamp
BEFORE UPDATE ON month_end_report_action_items
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Add comments on tables and columns for better documentation
COMMENT ON TABLE month_end_reports IS 'Month-end reports capturing recurring indicators and operational data';
COMMENT ON COLUMN month_end_reports.property_id IS 'Reference to property (optional, can be new property)';
COMMENT ON COLUMN month_end_reports.property_name IS 'Name of the property for the report';
COMMENT ON COLUMN month_end_reports.start_date IS 'Start date of the reporting window';
COMMENT ON COLUMN month_end_reports.end_date IS 'End date of the reporting window';
COMMENT ON COLUMN month_end_reports.prepared_by IS 'User who prepared the report';
COMMENT ON COLUMN month_end_reports.status IS 'Current status: draft, submitted, or approved';
COMMENT ON COLUMN month_end_reports.headline IS 'Short summary headline (10-120 characters)';
COMMENT ON COLUMN month_end_reports.narrative IS 'Detailed narrative (50-3000 characters)';
COMMENT ON COLUMN month_end_reports.occupancy_start_pct IS 'Occupancy percentage at start of period (0-100)';
COMMENT ON COLUMN month_end_reports.occupancy_end_pct IS 'Occupancy percentage at end of period (0-100)';
COMMENT ON COLUMN month_end_reports.avg_occupancy_pct IS 'Average occupancy percentage for period (0-100)';
COMMENT ON COLUMN month_end_reports.cleanliness_score IS 'Guest room cleanliness score (0-1.0)';

COMMENT ON TABLE month_end_report_groups IS 'Groups in-house during the reporting period';
COMMENT ON COLUMN month_end_report_groups.report_id IS 'Reference to the parent month-end report';
COMMENT ON COLUMN month_end_report_groups.group_name IS 'Name of the group';
COMMENT ON COLUMN month_end_report_groups.arrival_date IS 'Group arrival date';
COMMENT ON COLUMN month_end_report_groups.departure_date IS 'Group departure date';
COMMENT ON COLUMN month_end_report_groups.rooms_blocked IS 'Number of rooms blocked for the group';

COMMENT ON TABLE month_end_report_action_items IS 'Action items checklist for the month-end report';
COMMENT ON COLUMN month_end_report_action_items.report_id IS 'Reference to the parent month-end report';
COMMENT ON COLUMN month_end_report_action_items.title IS 'Action item title/description';
COMMENT ON COLUMN month_end_report_action_items.owner IS 'Person responsible for the action item';
COMMENT ON COLUMN month_end_report_action_items.due_date IS 'Due date for the action item';
COMMENT ON COLUMN month_end_report_action_items.status IS 'Status: open, in_progress, or done';
