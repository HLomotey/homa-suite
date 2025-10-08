-- Sample data for external_staff table for testing sign up functionality
-- Insert test staff records with personal emails for sign up validation

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
  'Doe',
  'John',
  'john.doe@personal.com',
  'john.doe@company.com',
  'Software Engineer',
  'Engineering',
  'New York',
  'Active',
  '2023-01-15',
  'ENG001',
  'A12345',
  'Technology'
),
(
  'Smith',
  'Jane',
  'jane.smith@gmail.com',
  'jane.smith@company.com',
  'HR Manager',
  'Human Resources',
  'San Francisco',
  'Active',
  '2022-03-20',
  'HR001',
  'A12346',
  'Corporate'
),
(
  'Johnson',
  'Mike',
  'mike.johnson@yahoo.com',
  'mike.johnson@company.com',
  'Operations Manager',
  'Operations',
  'Remote',
  'Active',
  '2023-06-10',
  'OPS001',
  'A12347',
  'Operations'
),
(
  'Williams',
  'Sarah',
  'sarah.williams@outlook.com',
  'sarah.williams@company.com',
  'Finance Analyst',
  'Finance',
  'London',
  'Terminated',
  '2021-08-05',
  'FIN001',
  'A12348',
  'Finance'
);

-- Update business_key for the sample records
UPDATE public.external_staff 
SET business_key = "POSITION ID" || '_' || COALESCE("HIRE DATE", '')
WHERE business_key IS NULL;
