-- Create J-1 Participants History Tracking System
-- This migration creates history tables and triggers to track changes to J-1 participant data
-- Similar to external_staff history tracking implementation

-- ============================================================================
-- PART 1: Create history tables
-- ============================================================================

-- Create history table for j1_participants
CREATE TABLE IF NOT EXISTS public.j1_participants_history (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  original_id UUID NOT NULL, -- Reference to the original participant record
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  country TEXT,
  gender TEXT,
  age INTEGER,
  employer TEXT,
  business_key TEXT, -- Copy of business key for reference
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT j1_participants_history_pkey PRIMARY KEY (id)
);

-- Create history table for j1_flow_status
CREATE TABLE IF NOT EXISTS public.j1_flow_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  original_id UUID NOT NULL, -- Reference to the original flow_status record
  participant_id UUID NOT NULL,
  
  -- Document & Visa Stage
  ds2019_start_date DATE,
  ds2019_end_date DATE,
  embassy_appointment_date DATE,
  
  -- Arrival & Onboarding Stage
  arrival_date DATE,
  onboarding_status TEXT,
  onboarding_scheduled_date DATE,
  onboarding_completed_date DATE,
  
  -- Employment Stage
  estimated_start_date DATE,
  actual_start_date DATE,
  estimated_end_date DATE,
  actual_end_date DATE,
  
  -- Exit Stage
  move_out_date DATE,
  completion_status TEXT,
  
  -- Metadata
  notes TEXT,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT j1_flow_status_history_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- PART 2: Create indexes for better query performance
-- ============================================================================

-- Indexes for j1_participants_history
CREATE INDEX IF NOT EXISTS idx_j1_participants_history_original_id
  ON public.j1_participants_history(original_id);

CREATE INDEX IF NOT EXISTS idx_j1_participants_history_names
  ON public.j1_participants_history(first_name, last_name);

CREATE INDEX IF NOT EXISTS idx_j1_participants_history_archived_at
  ON public.j1_participants_history(archived_at DESC);

CREATE INDEX IF NOT EXISTS idx_j1_participants_history_business_key
  ON public.j1_participants_history(business_key);

-- Indexes for j1_flow_status_history
CREATE INDEX IF NOT EXISTS idx_j1_flow_status_history_original_id
  ON public.j1_flow_status_history(original_id);

CREATE INDEX IF NOT EXISTS idx_j1_flow_status_history_participant_id
  ON public.j1_flow_status_history(participant_id);

CREATE INDEX IF NOT EXISTS idx_j1_flow_status_history_archived_at
  ON public.j1_flow_status_history(archived_at DESC);

-- ============================================================================
-- PART 3: Add business_key to j1_participants for stable upserts
-- ============================================================================

-- Add business_key column if it doesn't exist
ALTER TABLE j1_participants 
ADD COLUMN IF NOT EXISTS business_key TEXT;

-- Create unique index on business_key for upsert operations
CREATE UNIQUE INDEX IF NOT EXISTS idx_j1_participants_business_key 
ON j1_participants(business_key);

-- Populate business_key for existing records
-- Format: firstname_lastname_country_employer_ds2019start
UPDATE j1_participants p
SET business_key = LOWER(COALESCE(p.first_name, '')) || '_' || 
                   LOWER(COALESCE(p.last_name, '')) || '_' || 
                   LOWER(COALESCE(p.country, '')) || '_' || 
                   LOWER(COALESCE(p.employer, 'no_employer')) || '_' ||
                   COALESCE(
                     (SELECT TO_CHAR(f.ds2019_start_date, 'YYYYMMDD') 
                      FROM j1_flow_status f 
                      WHERE f.participant_id = p.id 
                      LIMIT 1), 
                     'no_date'
                   )
FROM j1_flow_status f
WHERE p.id = f.participant_id
  AND p.business_key IS NULL;

-- Handle participants without flow_status records
UPDATE j1_participants p
SET business_key = LOWER(COALESCE(p.first_name, '')) || '_' || 
                   LOWER(COALESCE(p.last_name, '')) || '_' || 
                   LOWER(COALESCE(p.country, '')) || '_' || 
                   LOWER(COALESCE(p.employer, 'no_employer')) || '_' ||
                   'no_date'
WHERE p.business_key IS NULL;

-- Make business_key NOT NULL after populating
ALTER TABLE j1_participants 
ALTER COLUMN business_key SET NOT NULL;

-- ============================================================================
-- PART 4: Create archive trigger functions
-- ============================================================================

-- Function to archive j1_participants changes
CREATE OR REPLACE FUNCTION archive_j1_participants_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only archive if this is an UPDATE or DELETE operation
  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    -- Insert the OLD version into history table
    INSERT INTO j1_participants_history (
      original_id,
      first_name,
      middle_name,
      last_name,
      country,
      gender,
      age,
      employer,
      business_key,
      created_at,
      updated_at
    ) VALUES (
      OLD.id,
      OLD.first_name,
      OLD.middle_name,
      OLD.last_name,
      OLD.country,
      OLD.gender,
      OLD.age,
      OLD.employer,
      OLD.business_key,
      OLD.created_at,
      OLD.updated_at
    );
  END IF;
  
  -- Return appropriate record based on operation
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to archive j1_flow_status changes
CREATE OR REPLACE FUNCTION archive_j1_flow_status_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only archive if this is an UPDATE or DELETE operation
  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    -- Insert the OLD version into history table
    INSERT INTO j1_flow_status_history (
      original_id,
      participant_id,
      ds2019_start_date,
      ds2019_end_date,
      embassy_appointment_date,
      arrival_date,
      onboarding_status,
      onboarding_scheduled_date,
      onboarding_completed_date,
      estimated_start_date,
      actual_start_date,
      estimated_end_date,
      actual_end_date,
      move_out_date,
      completion_status,
      notes,
      created_at,
      updated_at
    ) VALUES (
      OLD.id,
      OLD.participant_id,
      OLD.ds2019_start_date,
      OLD.ds2019_end_date,
      OLD.embassy_appointment_date,
      OLD.arrival_date,
      OLD.onboarding_status::TEXT,
      OLD.onboarding_scheduled_date,
      OLD.onboarding_completed_date,
      OLD.estimated_start_date,
      OLD.actual_start_date,
      OLD.estimated_end_date,
      OLD.actual_end_date,
      OLD.move_out_date,
      OLD.completion_status::TEXT,
      OLD.notes,
      OLD.created_at,
      OLD.updated_at
    );
  END IF;
  
  -- Return appropriate record based on operation
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 5: Create triggers for automatic archiving
-- ============================================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_archive_j1_participants_changes ON j1_participants;
DROP TRIGGER IF EXISTS trigger_archive_j1_flow_status_changes ON j1_flow_status;

-- Create trigger for j1_participants
CREATE TRIGGER trigger_archive_j1_participants_changes
  BEFORE UPDATE OR DELETE ON j1_participants
  FOR EACH ROW
  EXECUTE FUNCTION archive_j1_participants_changes();

-- Create trigger for j1_flow_status
CREATE TRIGGER trigger_archive_j1_flow_status_changes
  BEFORE UPDATE OR DELETE ON j1_flow_status
  FOR EACH ROW
  EXECUTE FUNCTION archive_j1_flow_status_changes();

-- ============================================================================
-- PART 6: Enable RLS and create policies
-- ============================================================================

-- Enable RLS on history tables
ALTER TABLE public.j1_participants_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.j1_flow_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all operations for authenticated users
CREATE POLICY "Allow all operations on j1_participants_history" 
  ON public.j1_participants_history
  FOR ALL 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations on j1_flow_status_history" 
  ON public.j1_flow_status_history
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- PART 7: Add helpful comments
-- ============================================================================

COMMENT ON TABLE j1_participants_history IS 
'Historical records of J-1 participants. Automatically populated by trigger when records are updated or deleted.';

COMMENT ON TABLE j1_flow_status_history IS 
'Historical records of J-1 flow status. Automatically populated by trigger when records are updated or deleted.';

COMMENT ON TRIGGER trigger_archive_j1_participants_changes ON j1_participants IS 
'Automatically archives the previous version of a J-1 participant record to j1_participants_history table before any UPDATE or DELETE operation';

COMMENT ON TRIGGER trigger_archive_j1_flow_status_changes ON j1_flow_status IS 
'Automatically archives the previous version of a J-1 flow status record to j1_flow_status_history table before any UPDATE or DELETE operation';

COMMENT ON COLUMN j1_participants.business_key IS 
'Stable business key for upsert operations. Format: firstname_lastname_country_employer_ds2019start';

-- ============================================================================
-- PART 8: Create helper function to view participant history
-- ============================================================================

CREATE OR REPLACE FUNCTION get_j1_participant_history(participant_uuid UUID)
RETURNS TABLE (
  change_date TIMESTAMP WITH TIME ZONE,
  change_type TEXT,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.archived_at as change_date,
    'participant_info' as change_type,
    'full_record' as field_name,
    jsonb_pretty(to_jsonb(h.*))::TEXT as old_value,
    NULL::TEXT as new_value
  FROM j1_participants_history h
  WHERE h.original_id = participant_uuid
  ORDER BY h.archived_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_j1_participant_history IS 
'Retrieves the complete history of changes for a specific J-1 participant';
