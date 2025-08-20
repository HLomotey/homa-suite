-- Create notifications table
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  message text not null,
  type text not null default 'info', -- info, success, warning, error
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add indexes for better query performance
create index notifications_user_id_idx on notifications(user_id);
create index notifications_is_read_idx on notifications(is_read);
create index notifications_created_at_idx on notifications(created_at desc);

-- Update function for updated_at timestamp
create or replace function update_modified_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_notifications_updated_at
before update on notifications
for each row
execute function update_modified_column();

-- Add RLS policies
alter table notifications enable row level security;

-- Users can only see their own notifications
create policy "Users can view own notifications"
  on notifications for select
  using (auth.uid() = user_id);

-- Users can only update their own notifications (e.g., mark as read)
create policy "Users can update own notifications"
  on notifications for update
  using (auth.uid() = user_id);

-- Only allow authenticated server functions to insert notifications
create policy "Service role can insert notifications"
  on notifications for insert
  with check (auth.role() = 'service_role' or auth.role() = 'supabase_admin');
