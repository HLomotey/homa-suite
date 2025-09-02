-- Create external_staff table
-- This table stores external staff information imported from HR systems

CREATE TABLE IF NOT EXISTS public.external_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "PAYROLL LAST NAME" TEXT,
  "PAYROLL FIRST NAME" TEXT,
  "PAYROLL MIDDLE NAME" TEXT,
  "PRIMARY ADDRESS LINE 1" TEXT,
  "PRIMARY ADDRESS LINE 2" TEXT,
  "PRIMARY ADDRESS LINE 3" TEXT,
  "LIVED-IN STATE" TEXT,
  "WORKED IN STATE" TEXT,
  "PERSONAL E-MAIL" TEXT,
  "WORK E-MAIL" TEXT,
  "HOME PHONE" TEXT,
  "WORK PHONE" TEXT,
  "POSITION ID" TEXT,
  "ASSOCIATE ID" TEXT,
  "FILE NUMBER" TEXT,
  "COMPANY CODE" TEXT,
  "JOB TITLE" TEXT,
  "BUSINESS UNIT" TEXT,
  "HOME DEPARTMENT" TEXT,
  "LOCATION" TEXT,
  "WORKER CATEGORY" TEXT,
  "POSITION STATUS" TEXT,
  "HIRE DATE" TEXT,
  "REHIRE DATE" TEXT,
  "TERMINATION DATE" TEXT,
  "YEARS OF SERVICE" TEXT,
  "REPORTS TO NAME" TEXT,
  "JOB CLASS" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_external_staff_payroll_names
  ON public.external_staff USING btree ("PAYROLL FIRST NAME", "PAYROLL LAST NAME");

CREATE INDEX IF NOT EXISTS idx_external_staff_work_email
  ON public.external_staff USING btree ("WORK E-MAIL");

CREATE INDEX IF NOT EXISTS idx_external_staff_personal_email
  ON public.external_staff USING btree ("PERSONAL E-MAIL");

CREATE INDEX IF NOT EXISTS idx_external_staff_location
  ON public.external_staff USING btree ("LOCATION");

CREATE INDEX IF NOT EXISTS idx_external_staff_job_title
  ON public.external_staff USING btree ("JOB TITLE");

CREATE INDEX IF NOT EXISTS idx_external_staff_hire_date
  ON public.external_staff USING btree ("HIRE DATE");

CREATE INDEX IF NOT EXISTS idx_external_staff_position_status
  ON public.external_staff USING btree ("POSITION STATUS");

CREATE INDEX IF NOT EXISTS idx_external_staff_termination_date
  ON public.external_staff USING btree ("TERMINATION DATE");

-- Create trigger to update updated_at
CREATE TRIGGER update_external_staff_updated_at
  BEFORE UPDATE ON public.external_staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.external_staff ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for authenticated users
CREATE POLICY "Allow all operations on external_staff" ON public.external_staff
  FOR ALL USING (auth.role() = 'authenticated');

-- Add comments
COMMENT ON TABLE public.external_staff IS 'External staff information imported from HR systems';
COMMENT ON COLUMN public.external_staff."PERSONAL E-MAIL" IS 'Personal email address used for account creation';
COMMENT ON COLUMN public.external_staff."WORK E-MAIL" IS 'Work email address';
COMMENT ON COLUMN public.external_staff."TERMINATION DATE" IS 'Date of termination (NULL for active staff)';
