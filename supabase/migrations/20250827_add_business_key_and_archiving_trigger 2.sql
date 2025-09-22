-- Add business_key column to external_staff table for stable upserts
ALTER TABLE external_staff 
ADD COLUMN IF NOT EXISTS business_key TEXT;

-- Create unique index on business_key for upsert operations
CREATE UNIQUE INDEX IF NOT EXISTS idx_external_staff_business_key 
ON external_staff (business_key);

-- Populate business_key for existing records
UPDATE external_staff 
SET business_key = CASE 
  WHEN "POSITION ID" IS NOT NULL AND "POSITION ID" != '' THEN 
    "POSITION ID" || '_' || COALESCE("HIRE DATE", '')
  ELSE 
    LOWER(COALESCE("PAYROLL FIRST NAME", '')) || '_' || 
    LOWER(COALESCE("PAYROLL LAST NAME", '')) || '_' || 
    COALESCE("ASSOCIATE ID", '') || '_' || 
    COALESCE("HIRE DATE", '')
END
WHERE business_key IS NULL;

-- Make business_key NOT NULL after populating existing records
ALTER TABLE external_staff 
ALTER COLUMN business_key SET NOT NULL;

-- Create function to archive records before UPDATE/DELETE
CREATE OR REPLACE FUNCTION archive_external_staff_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only archive if this is an UPDATE or DELETE operation
  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    -- Insert the OLD version into history table
    INSERT INTO history_external_staff (
      "PAYROLL LAST NAME",
      "PAYROLL FIRST NAME", 
      "PAYROLL MIDDLE NAME",
      "GENERATION SUFFIX",
      "GENDER (SELF-ID)",
      "BIRTH DATE",
      "PRIMARY ADDRESS LINE 1",
      "PRIMARY ADDRESS LINE 2", 
      "PRIMARY ADDRESS LINE 3",
      "LIVED-IN STATE",
      "WORKED IN STATE",
      "PERSONAL E-MAIL",
      "WORK E-MAIL",
      "HOME PHONE",
      "WORK PHONE",
      "POSITION ID",
      "ASSOCIATE ID",
      "FILE NUMBER",
      "COMPANY CODE",
      "JOB TITLE",
      "BUSINESS UNIT",
      "HOME DEPARTMENT",
      "LOCATION",
      "WORKER CATEGORY",
      "POSITION STATUS",
      "HIRE DATE",
      "REHIRE DATE",
      "TERMINATION DATE",
      "YEARS OF SERVICE",
      "REPORTS TO NAME",
      "JOB CLASS",
      created_at,
      updated_at
    ) VALUES (
      OLD."PAYROLL LAST NAME",
      OLD."PAYROLL FIRST NAME",
      OLD."PAYROLL MIDDLE NAME", 
      OLD."GENERATION SUFFIX",
      OLD."GENDER (SELF-ID)",
      OLD."BIRTH DATE",
      OLD."PRIMARY ADDRESS LINE 1",
      OLD."PRIMARY ADDRESS LINE 2",
      OLD."PRIMARY ADDRESS LINE 3",
      OLD."LIVED-IN STATE",
      OLD."WORKED IN STATE",
      OLD."PERSONAL E-MAIL",
      OLD."WORK E-MAIL",
      OLD."HOME PHONE",
      OLD."WORK PHONE",
      OLD."POSITION ID",
      OLD."ASSOCIATE ID",
      OLD."FILE NUMBER",
      OLD."COMPANY CODE",
      OLD."JOB TITLE",
      OLD."BUSINESS UNIT",
      OLD."HOME DEPARTMENT",
      OLD."LOCATION",
      OLD."WORKER CATEGORY",
      OLD."POSITION STATUS",
      OLD."HIRE DATE",
      OLD."REHIRE DATE",
      OLD."TERMINATION DATE",
      OLD."YEARS OF SERVICE",
      OLD."REPORTS TO NAME",
      OLD."JOB CLASS",
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

-- Create trigger for automatic archiving
DROP TRIGGER IF EXISTS trigger_archive_external_staff_changes ON external_staff;
CREATE TRIGGER trigger_archive_external_staff_changes
  BEFORE UPDATE OR DELETE ON external_staff
  FOR EACH ROW
  EXECUTE FUNCTION archive_external_staff_changes();

-- Add comment explaining the archiving strategy
COMMENT ON TRIGGER trigger_archive_external_staff_changes ON external_staff IS 
'Automatically archives the previous version of a record to history_external_staff table before any UPDATE or DELETE operation';

COMMENT ON COLUMN external_staff.business_key IS 
'Stable business key for upsert operations. Format: POSITION_ID_HIRE_DATE or firstname_lastname_associate_id_hire_date';
