-- Marital Status
create table marital_status (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text
);

insert into marital_status (name) values
  ('Single'), ('Married'), ('Domestic Partner'), ('Separated'), ('Divorced'), ('Widowed');

-- Emergency Contact Relationship
create table emergency_contact_relationship (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text
);

insert into emergency_contact_relationship (name) values
  ('Spouse/Partner'), ('Parent'), ('Child'), ('Sibling'), ('Guardian'), ('Relative'), ('Friend'), ('Other');

-- Department
create table department (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text
);

insert into department (name) values
  ('Engineering'), ('Product'), ('Sales'), ('Marketing'), ('HR'), ('Finance'), ('Operations'), ('Customer Support'), ('IT'), ('Legal'), ('Admin');

-- Job Title
create table job_title (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department_id uuid references department(id),
  description text
);

insert into job_title (name, department_id) values
  ('Software Engineer', (select id from department where name='Engineering')),
  ('Data Analyst', (select id from department where name='Engineering')),
  ('Product Manager', (select id from department where name='Product')),
  ('Sales Associate', (select id from department where name='Sales')),
  ('HR Generalist', (select id from department where name='HR')),
  ('Accountant', (select id from department where name='Finance')),
  ('Operations Coordinator', (select id from department where name='Operations')),
  ('Support Specialist', (select id from department where name='Customer Support')),
  ('IT Administrator', (select id from department where name='IT')),
  ('Legal Counsel', (select id from department where name='Legal'));

-- Location
create table location (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text
);

insert into location (name) values
  ('New York'), ('San Francisco'), ('Remote'), ('London'), ('Accra'), ('Lagos'), ('Berlin');

-- Employment Status
create table employment_status (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text
);

insert into employment_status (name) values
  ('Full-time'), ('Part-time'), ('Contractor'), ('Intern'), ('Temporary'), ('Seasonal'), ('On Leave'), ('Terminated');

-- Gender
create table gender (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text
);

insert into gender (name) values
  ('Female'), ('Male'), ('Non-binary'), ('Prefer not to say'), ('Self-describe');

-- Ethnicity/Race
create table ethnicity (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text
);

insert into ethnicity (name) values
  ('Asian'), ('Black or African American'), ('Hispanic or Latino'), ('Middle Eastern or North African'),
  ('Native American or Alaska Native'), ('Native Hawaiian or Other Pacific Islander'), ('White'),
  ('Two or More Races'), ('Prefer not to say'), ('Self-describe');

-- Veteran Status
create table veteran_status (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text
);

insert into veteran_status (name) values
  ('Yes'), ('No'), ('Prefer not to say');

-- Disability Status
create table disability_status (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text
);

insert into disability_status (name) values
  ('Yes'), ('No'), ('Prefer not to say');

-- Enable RLS and add policies for all tables
do $$
declare
  tbl text;
begin
  for tbl in
    select table_name from information_schema.tables
    where table_schema = 'public'
      and table_name in (
        'marital_status', 'emergency_contact_relationship', 'department', 'job_title',
        'location', 'employment_status', 'gender', 'ethnicity', 'veteran_status', 'disability_status'
      )
  loop
    execute format('alter table %I enable row level security;', tbl);
    execute format('create policy "Authenticated read" on %I for select using (auth.uid() is not null);', tbl);
    execute format('create policy "Authenticated insert" on %I for insert with check (auth.uid() is not null);', tbl);
    execute format('create policy "Authenticated update" on %I for update using (auth.uid() is not null);', tbl);
    execute format('create policy "Authenticated delete" on %I for delete using (auth.uid() is not null);', tbl);
  end loop;
end $$;
