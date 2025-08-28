-- Create history_external_staff table
-- This table stores historical records of external staff when key fields change

-- TABLE
create table if not exists public.history_external_staff (
  id uuid not null default gen_random_uuid (),
  "PAYROLL LAST NAME" text null,
  "PAYROLL FIRST NAME" text null,
  "PAYROLL MIDDLE NAME" text null,
  "GENERATION SUFFIX" text null,
  "GENDER (SELF-ID)" text null,
  "BIRTH DATE" text null,
  "PRIMARY ADDRESS LINE 1" text null,
  "PRIMARY ADDRESS LINE 2" text null,
  "PRIMARY ADDRESS LINE 3" text null,
  "LIVED-IN STATE" text null,
  "WORKED IN STATE" text null,
  "PERSONAL E-MAIL" text null,
  "WORK E-MAIL" text null,
  "HOME PHONE" text null,
  "WORK PHONE" text null,
  "POSITION ID" text null,
  "ASSOCIATE ID" text null,
  "FILE NUMBER" text null,
  "COMPANY CODE" text null,
  "JOB TITLE" text null,
  "BUSINESS UNIT" text null,
  "HOME DEPARTMENT" text null,
  "LOCATION" text null,
  "WORKER CATEGORY" text null,
  "POSITION STATUS" text null,
  "HIRE DATE" text null,
  "REHIRE DATE" text null,
  "TERMINATION DATE" text null,
  "YEARS OF SERVICE" text null,
  "REPORTS TO NAME" text null,
  "JOB CLASS" text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint history_external_staff_pkey primary key (id)
);

-- INDEXES (mirroring the original)
create index if not exists idx_history_external_staff_payroll_names
  on public.history_external_staff using btree ("PAYROLL FIRST NAME", "PAYROLL LAST NAME");

create index if not exists idx_history_external_staff_location
  on public.history_external_staff using btree ("LOCATION");

create index if not exists idx_history_external_staff_job_title
  on public.history_external_staff using btree ("JOB TITLE");

create index if not exists idx_history_external_staff_hire_date
  on public.history_external_staff using btree ("HIRE DATE");

-- TRIGGER to keep updated_at fresh (assumes update_updated_at_column() already exists)
create trigger update_history_external_staff_updated_at
before update on public.history_external_staff
for each row execute function update_updated_at_column();

-- Enable RLS
alter table public.history_external_staff enable row level security;

-- RLS Policies - Allow all operations for authenticated users
create policy "Allow all operations on history_external_staff" on public.history_external_staff
  for all using (auth.role() = 'authenticated');
