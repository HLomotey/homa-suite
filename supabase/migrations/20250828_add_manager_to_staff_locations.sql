-- Add manager_id field to staff_locations table
ALTER TABLE staff_locations 
ADD COLUMN manager_id UUID REFERENCES external_staff(id);

-- Create staff_locations_history table for tracking changes
CREATE TABLE IF NOT EXISTS staff_locations_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_location_id UUID NOT NULL REFERENCES staff_locations(id),
  company_location_id UUID NOT NULL,
  location_code TEXT NOT NULL,
  location_description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL,
  external_staff_id UUID,
  manager_id UUID,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by UUID REFERENCES auth.users(id),
  change_type TEXT NOT NULL CHECK (change_type IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB
);

-- Enable RLS on staff_locations_history table
ALTER TABLE staff_locations_history ENABLE ROW LEVEL SECURITY;

-- Create policies for staff_locations_history
CREATE POLICY "Users can view staff locations history" 
ON staff_locations_history FOR SELECT USING (true);

CREATE POLICY "System can insert staff locations history" 
ON staff_locations_history FOR INSERT WITH CHECK (true);

-- Create function to track staff location changes
CREATE OR REPLACE FUNCTION track_staff_location_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT operations
  IF TG_OP = 'INSERT' THEN
    INSERT INTO staff_locations_history (
      staff_location_id,
      company_location_id,
      location_code,
      location_description,
      is_active,
      external_staff_id,
      manager_id,
      changed_by,
      change_type,
      new_values
    ) VALUES (
      NEW.id,
      NEW.company_location_id,
      NEW.location_code,
      NEW.location_description,
      NEW.is_active,
      NEW.external_staff_id,
      NEW.manager_id,
      auth.uid(),
      'INSERT',
      to_jsonb(NEW)
    );
    RETURN NEW;
  END IF;

  -- For UPDATE operations
  IF TG_OP = 'UPDATE' THEN
    -- Only insert history record if manager_id has changed
    IF OLD.manager_id IS DISTINCT FROM NEW.manager_id THEN
      INSERT INTO staff_locations_history (
        staff_location_id,
        company_location_id,
        location_code,
        location_description,
        is_active,
        external_staff_id,
        manager_id,
        changed_by,
        change_type,
        old_values,
        new_values
      ) VALUES (
        NEW.id,
        NEW.company_location_id,
        NEW.location_code,
        NEW.location_description,
        NEW.is_active,
        NEW.external_staff_id,
        NEW.manager_id,
        auth.uid(),
        'UPDATE',
        to_jsonb(OLD),
        to_jsonb(NEW)
      );
    END IF;
    RETURN NEW;
  END IF;

  -- For DELETE operations
  IF TG_OP = 'DELETE' THEN
    INSERT INTO staff_locations_history (
      staff_location_id,
      company_location_id,
      location_code,
      location_description,
      is_active,
      external_staff_id,
      manager_id,
      changed_by,
      change_type,
      old_values
    ) VALUES (
      OLD.id,
      OLD.company_location_id,
      OLD.location_code,
      OLD.location_description,
      OLD.is_active,
      OLD.external_staff_id,
      OLD.manager_id,
      auth.uid(),
      'DELETE',
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to track staff location changes
DROP TRIGGER IF EXISTS staff_location_changes_trigger ON staff_locations;
CREATE TRIGGER staff_location_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON staff_locations
  FOR EACH ROW EXECUTE FUNCTION track_staff_location_changes();

-- Add comments for documentation
COMMENT ON TABLE staff_locations_history IS 'History table tracking changes to staff locations, especially manager assignments';
COMMENT ON COLUMN staff_locations.manager_id IS 'Reference to external staff member who manages this location';
COMMENT ON COLUMN staff_locations_history.staff_location_id IS 'Reference to the staff location being tracked';
COMMENT ON COLUMN staff_locations_history.change_type IS 'Type of change: INSERT, UPDATE, or DELETE';
COMMENT ON COLUMN staff_locations_history.old_values IS 'Previous values before the change (JSON)';
COMMENT ON COLUMN staff_locations_history.new_values IS 'New values after the change (JSON)';
COMMENT ON COLUMN staff_locations_history.changed_by IS 'User who made the change';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_staff_locations_history_staff_location_id 
ON staff_locations_history(staff_location_id);

CREATE INDEX IF NOT EXISTS idx_staff_locations_history_changed_at 
ON staff_locations_history(changed_at);

CREATE INDEX IF NOT EXISTS idx_staff_locations_manager_id 
ON staff_locations(manager_id);
