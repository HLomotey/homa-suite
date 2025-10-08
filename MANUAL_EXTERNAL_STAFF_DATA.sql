-- Manual SQL to add test data to external_staff table
-- Run this in your Supabase SQL editor to add test data for sign up validation

INSERT INTO public.external_staff (
  "PAYROLL LAST NAME",
  "PAYROLL FIRST NAME", 
  "PERSONAL E-MAIL",
  "WORK E-MAIL",
  "JOB TITLE",
  "HOME DEPARTMENT",
  "LOCATION",
  "POSITION STATUS",
  "HIRE DATE",
  "POSITION ID",
  "ASSOCIATE ID",
  "BUSINESS UNIT"
) VALUES 
(
  'Pimbumu',
  'Nana',
  'npimbumu@gmail.com',
  'npimbumu@company.com',
  'Software Engineer',
  'Engineering',
  'Accra',
  'Active',
  '2024-01-15',
  'ENG001',
  'A12345',
  'Technology'
),
(
  'Test',
  'User',
  'test@gmail.com',
  'test@company.com',
  'Operations Manager',
  'Operations',
  'Remote',
  'Active',
  '2023-06-10',
  'OPS001',
  'A12346',
  'Operations'
)
ON CONFLICT DO NOTHING;

-- Update business_key for the new records if the column exists
UPDATE public.external_staff 
SET business_key = "POSITION ID" || '_' || COALESCE("HIRE DATE", '')
WHERE business_key IS NULL;
