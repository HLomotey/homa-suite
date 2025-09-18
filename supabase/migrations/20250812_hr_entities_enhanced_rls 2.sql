-- Enhanced RLS policies for HR entities
-- Date: 2025-08-12

-- First, add organization_id column to tables that need organization-specific access
ALTER TABLE department ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES auth.organizations(id);
ALTER TABLE job_title ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES auth.organizations(id);
ALTER TABLE location ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES auth.organizations(id);

-- Create or replace function to get user's organization ID
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing RLS policies for department
DROP POLICY IF EXISTS "Authenticated read" ON department;
DROP POLICY IF EXISTS "Authenticated insert" ON department;
DROP POLICY IF EXISTS "Authenticated update" ON department;
DROP POLICY IF EXISTS "Authenticated delete" ON department;

-- Create enhanced RLS policies for department
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'department' AND policyname = 'Users can view departments') THEN
    EXECUTE 'CREATE POLICY "Users can view departments" ON department FOR SELECT USING (
      organization_id IS NULL OR organization_id = get_user_organization_id()
    )';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'department' AND policyname = 'Users can insert departments') THEN
    EXECUTE 'CREATE POLICY "Users can insert departments" ON department FOR INSERT WITH CHECK (
      auth.role() = ''authenticated'' AND 
      (organization_id IS NULL OR organization_id = get_user_organization_id())
    )';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'department' AND policyname = 'Users can update departments') THEN
    EXECUTE 'CREATE POLICY "Users can update departments" ON department FOR UPDATE USING (
      auth.role() = ''authenticated'' AND 
      (organization_id IS NULL OR organization_id = get_user_organization_id())
    )';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'department' AND policyname = 'Users can delete departments') THEN
    EXECUTE 'CREATE POLICY "Users can delete departments" ON department FOR DELETE USING (
      auth.role() = ''authenticated'' AND 
      (organization_id IS NULL OR organization_id = get_user_organization_id())
    )';
  END IF;
END
$$;

-- Drop existing RLS policies for job_title
DROP POLICY IF EXISTS "Authenticated read" ON job_title;
DROP POLICY IF EXISTS "Authenticated insert" ON job_title;
DROP POLICY IF EXISTS "Authenticated update" ON job_title;
DROP POLICY IF EXISTS "Authenticated delete" ON job_title;

-- Create enhanced RLS policies for job_title
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_title' AND policyname = 'Users can view job titles') THEN
    EXECUTE 'CREATE POLICY "Users can view job titles" ON job_title FOR SELECT USING (
      organization_id IS NULL OR organization_id = get_user_organization_id()
    )';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_title' AND policyname = 'Users can insert job titles') THEN
    EXECUTE 'CREATE POLICY "Users can insert job titles" ON job_title FOR INSERT WITH CHECK (
      auth.role() = ''authenticated'' AND 
      (organization_id IS NULL OR organization_id = get_user_organization_id())
    )';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_title' AND policyname = 'Users can update job titles') THEN
    EXECUTE 'CREATE POLICY "Users can update job titles" ON job_title FOR UPDATE USING (
      auth.role() = ''authenticated'' AND 
      (organization_id IS NULL OR organization_id = get_user_organization_id())
    )';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_title' AND policyname = 'Users can delete job titles') THEN
    EXECUTE 'CREATE POLICY "Users can delete job titles" ON job_title FOR DELETE USING (
      auth.role() = ''authenticated'' AND 
      (organization_id IS NULL OR organization_id = get_user_organization_id())
    )';
  END IF;
END
$$;

-- Drop existing RLS policies for location
DROP POLICY IF EXISTS "Authenticated read" ON location;
DROP POLICY IF EXISTS "Authenticated insert" ON location;
DROP POLICY IF EXISTS "Authenticated update" ON location;
DROP POLICY IF EXISTS "Authenticated delete" ON location;

-- Create enhanced RLS policies for location
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'location' AND policyname = 'Users can view locations') THEN
    EXECUTE 'CREATE POLICY "Users can view locations" ON location FOR SELECT USING (
      organization_id IS NULL OR organization_id = get_user_organization_id()
    )';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'location' AND policyname = 'Users can insert locations') THEN
    EXECUTE 'CREATE POLICY "Users can insert locations" ON location FOR INSERT WITH CHECK (
      auth.role() = ''authenticated'' AND 
      (organization_id IS NULL OR organization_id = get_user_organization_id())
    )';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'location' AND policyname = 'Users can update locations') THEN
    EXECUTE 'CREATE POLICY "Users can update locations" ON location FOR UPDATE USING (
      auth.role() = ''authenticated'' AND 
      (organization_id IS NULL OR organization_id = get_user_organization_id())
    )';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'location' AND policyname = 'Users can delete locations') THEN
    EXECUTE 'CREATE POLICY "Users can delete locations" ON location FOR DELETE USING (
      auth.role() = ''authenticated'' AND 
      (organization_id IS NULL OR organization_id = get_user_organization_id())
    )';
  END IF;
END
$$;

-- For reference tables that don't need organization-specific access, keep the existing policies
-- but make them more explicit with proper policy names

-- marital_status
DROP POLICY IF EXISTS "Authenticated read" ON marital_status;
DROP POLICY IF EXISTS "Authenticated insert" ON marital_status;
DROP POLICY IF EXISTS "Authenticated update" ON marital_status;
DROP POLICY IF EXISTS "Authenticated delete" ON marital_status;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marital_status' AND policyname = 'Users can view marital statuses') THEN
    EXECUTE 'CREATE POLICY "Users can view marital statuses" ON marital_status FOR SELECT USING (true)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marital_status' AND policyname = 'Users can insert marital statuses') THEN
    EXECUTE 'CREATE POLICY "Users can insert marital statuses" ON marital_status FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marital_status' AND policyname = 'Users can update marital statuses') THEN
    EXECUTE 'CREATE POLICY "Users can update marital statuses" ON marital_status FOR UPDATE USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marital_status' AND policyname = 'Users can delete marital statuses') THEN
    EXECUTE 'CREATE POLICY "Users can delete marital statuses" ON marital_status FOR DELETE USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- emergency_contact_relationship
DROP POLICY IF EXISTS "Authenticated read" ON emergency_contact_relationship;
DROP POLICY IF EXISTS "Authenticated insert" ON emergency_contact_relationship;
DROP POLICY IF EXISTS "Authenticated update" ON emergency_contact_relationship;
DROP POLICY IF EXISTS "Authenticated delete" ON emergency_contact_relationship;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'emergency_contact_relationship' AND policyname = 'Users can view emergency contact relationships') THEN
    EXECUTE 'CREATE POLICY "Users can view emergency contact relationships" ON emergency_contact_relationship FOR SELECT USING (true)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'emergency_contact_relationship' AND policyname = 'Users can insert emergency contact relationships') THEN
    EXECUTE 'CREATE POLICY "Users can insert emergency contact relationships" ON emergency_contact_relationship FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'emergency_contact_relationship' AND policyname = 'Users can update emergency contact relationships') THEN
    EXECUTE 'CREATE POLICY "Users can update emergency contact relationships" ON emergency_contact_relationship FOR UPDATE USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'emergency_contact_relationship' AND policyname = 'Users can delete emergency contact relationships') THEN
    EXECUTE 'CREATE POLICY "Users can delete emergency contact relationships" ON emergency_contact_relationship FOR DELETE USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- employment_status
DROP POLICY IF EXISTS "Authenticated read" ON employment_status;
DROP POLICY IF EXISTS "Authenticated insert" ON employment_status;
DROP POLICY IF EXISTS "Authenticated update" ON employment_status;
DROP POLICY IF EXISTS "Authenticated delete" ON employment_status;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employment_status' AND policyname = 'Users can view employment statuses') THEN
    EXECUTE 'CREATE POLICY "Users can view employment statuses" ON employment_status FOR SELECT USING (true)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employment_status' AND policyname = 'Users can insert employment statuses') THEN
    EXECUTE 'CREATE POLICY "Users can insert employment statuses" ON employment_status FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employment_status' AND policyname = 'Users can update employment statuses') THEN
    EXECUTE 'CREATE POLICY "Users can update employment statuses" ON employment_status FOR UPDATE USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employment_status' AND policyname = 'Users can delete employment statuses') THEN
    EXECUTE 'CREATE POLICY "Users can delete employment statuses" ON employment_status FOR DELETE USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- gender
DROP POLICY IF EXISTS "Authenticated read" ON gender;
DROP POLICY IF EXISTS "Authenticated insert" ON gender;
DROP POLICY IF EXISTS "Authenticated update" ON gender;
DROP POLICY IF EXISTS "Authenticated delete" ON gender;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gender' AND policyname = 'Users can view genders') THEN
    EXECUTE 'CREATE POLICY "Users can view genders" ON gender FOR SELECT USING (true)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gender' AND policyname = 'Users can insert genders') THEN
    EXECUTE 'CREATE POLICY "Users can insert genders" ON gender FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gender' AND policyname = 'Users can update genders') THEN
    EXECUTE 'CREATE POLICY "Users can update genders" ON gender FOR UPDATE USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gender' AND policyname = 'Users can delete genders') THEN
    EXECUTE 'CREATE POLICY "Users can delete genders" ON gender FOR DELETE USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- ethnicity
DROP POLICY IF EXISTS "Authenticated read" ON ethnicity;
DROP POLICY IF EXISTS "Authenticated insert" ON ethnicity;
DROP POLICY IF EXISTS "Authenticated update" ON ethnicity;
DROP POLICY IF EXISTS "Authenticated delete" ON ethnicity;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ethnicity' AND policyname = 'Users can view ethnicities') THEN
    EXECUTE 'CREATE POLICY "Users can view ethnicities" ON ethnicity FOR SELECT USING (true)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ethnicity' AND policyname = 'Users can insert ethnicities') THEN
    EXECUTE 'CREATE POLICY "Users can insert ethnicities" ON ethnicity FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ethnicity' AND policyname = 'Users can update ethnicities') THEN
    EXECUTE 'CREATE POLICY "Users can update ethnicities" ON ethnicity FOR UPDATE USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ethnicity' AND policyname = 'Users can delete ethnicities') THEN
    EXECUTE 'CREATE POLICY "Users can delete ethnicities" ON ethnicity FOR DELETE USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- veteran_status
DROP POLICY IF EXISTS "Authenticated read" ON veteran_status;
DROP POLICY IF EXISTS "Authenticated insert" ON veteran_status;
DROP POLICY IF EXISTS "Authenticated update" ON veteran_status;
DROP POLICY IF EXISTS "Authenticated delete" ON veteran_status;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'veteran_status' AND policyname = 'Users can view veteran statuses') THEN
    EXECUTE 'CREATE POLICY "Users can view veteran statuses" ON veteran_status FOR SELECT USING (true)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'veteran_status' AND policyname = 'Users can insert veteran statuses') THEN
    EXECUTE 'CREATE POLICY "Users can insert veteran statuses" ON veteran_status FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'veteran_status' AND policyname = 'Users can update veteran statuses') THEN
    EXECUTE 'CREATE POLICY "Users can update veteran statuses" ON veteran_status FOR UPDATE USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'veteran_status' AND policyname = 'Users can delete veteran statuses') THEN
    EXECUTE 'CREATE POLICY "Users can delete veteran statuses" ON veteran_status FOR DELETE USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- disability_status
DROP POLICY IF EXISTS "Authenticated read" ON disability_status;
DROP POLICY IF EXISTS "Authenticated insert" ON disability_status;
DROP POLICY IF EXISTS "Authenticated update" ON disability_status;
DROP POLICY IF EXISTS "Authenticated delete" ON disability_status;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'disability_status' AND policyname = 'Users can view disability statuses') THEN
    EXECUTE 'CREATE POLICY "Users can view disability statuses" ON disability_status FOR SELECT USING (true)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'disability_status' AND policyname = 'Users can insert disability statuses') THEN
    EXECUTE 'CREATE POLICY "Users can insert disability statuses" ON disability_status FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'disability_status' AND policyname = 'Users can update disability statuses') THEN
    EXECUTE 'CREATE POLICY "Users can update disability statuses" ON disability_status FOR UPDATE USING (auth.role() = ''authenticated'')';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'disability_status' AND policyname = 'Users can delete disability statuses') THEN
    EXECUTE 'CREATE POLICY "Users can delete disability statuses" ON disability_status FOR DELETE USING (auth.role() = ''authenticated'')';
  END IF;
END
$$;

-- Add comments for better documentation
COMMENT ON COLUMN department.organization_id IS 'Organization ID for organization-specific departments';
COMMENT ON COLUMN job_title.organization_id IS 'Organization ID for organization-specific job titles';
COMMENT ON COLUMN location.organization_id IS 'Organization ID for organization-specific locations';
