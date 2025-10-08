-- Create permissions tables
create table roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table permissions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  resource text not null,
  action text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(resource, action)
);

create table role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(role_id, permission_id)
);

create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, role_id)
);

-- Create RPC function to get user's effective permissions
create or replace function get_user_effective_permissions(p_user_id uuid)
returns table (permission_name text, resource text, action text) as $$
begin
  return query
  select distinct p.name as permission_name, p.resource, p.action
  from permissions p
  join role_permissions rp on p.id = rp.permission_id
  join roles r on rp.role_id = r.id
  join user_roles ur on r.id = ur.role_id
  where ur.user_id = p_user_id;
end;
$$ language plpgsql security definer;

-- Add RLS policies
alter table roles enable row level security;
alter table permissions enable row level security;
alter table role_permissions enable row level security;
alter table user_roles enable row level security;

-- Basic RLS policies for read access
create policy "Authenticated users can read roles"
  on roles for select
  using (auth.uid() is not null);

create policy "Authenticated users can read permissions"
  on permissions for select
  using (auth.uid() is not null);

create policy "Authenticated users can read role_permissions"
  on role_permissions for select
  using (auth.uid() is not null);

create policy "Users can read their own user_roles"
  on user_roles for select
  using (auth.uid() = user_id or auth.role() = 'service_role');

-- Insert initial roles and permissions
insert into roles (name, description) values
  ('admin', 'Administrator with full system access'),
  ('manager', 'Manager with department-level access'),
  ('user', 'Regular user with limited access');

-- Insert sample permissions
insert into permissions (name, resource, action) values
  ('view_dashboard', 'dashboard', 'view'),
  ('manage_users', 'users', 'manage'),
  ('view_reports', 'reports', 'view'),
  ('create_reports', 'reports', 'create'),
  ('manage_transport', 'transport', 'manage');
