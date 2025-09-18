-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS email_schedules CASCADE;
DROP TABLE IF EXISTS email_analytics CASCADE;
DROP TABLE IF EXISTS email_delivery_logs CASCADE;
DROP TABLE IF EXISTS notification_group_members CASCADE;
DROP TABLE IF EXISTS notification_groups CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS notification_history CASCADE;
DROP TYPE IF EXISTS notification_status CASCADE;

-- Create notification_status enum
CREATE TYPE notification_status AS ENUM ('sent', 'failed', 'pending');

-- Create notification_history table
CREATE TABLE notification_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_type TEXT NOT NULL,
    form_id TEXT,
    recipients TEXT[] NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    form_data JSONB,
    template_id TEXT,
    variables JSONB,
    status notification_status NOT NULL DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id)
);

-- Create email_templates table for reusable templates
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    form_type TEXT NOT NULL,
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id)
);

-- Create notification_groups table for recipient groups
CREATE TABLE notification_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    form_types TEXT[] DEFAULT '{}', -- Which form types this group applies to
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id)
);

-- Create notification_group_members table
CREATE TABLE notification_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES notification_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    added_by UUID REFERENCES auth.users(id),
    UNIQUE(group_id, user_id)
);

-- Create email_delivery_logs table
CREATE TABLE email_delivery_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id TEXT,
    status TEXT NOT NULL,
    recipients TEXT[] NOT NULL,
    delivery_time INTEGER,
    attempt INTEGER,
    provider TEXT,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create email_analytics table
CREATE TABLE email_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_id TEXT,
    form_type TEXT,
    status TEXT NOT NULL,
    delivery_time INTEGER,
    recipient_count INTEGER,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create email_schedules table
CREATE TABLE email_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_request JSONB NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_history_form_type ON notification_history(form_type);
CREATE INDEX IF NOT EXISTS idx_notification_history_status ON notification_history(status);
CREATE INDEX IF NOT EXISTS idx_notification_history_created_at ON notification_history(created_at);
CREATE INDEX IF NOT EXISTS idx_notification_history_sent_at ON notification_history(sent_at);

CREATE INDEX IF NOT EXISTS idx_email_templates_form_type ON email_templates(form_type);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_notification_groups_active ON notification_groups(is_active);
CREATE INDEX IF NOT EXISTS idx_notification_group_members_group ON notification_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_notification_group_members_user ON notification_group_members(user_id);

-- Add RLS policies
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_group_members ENABLE ROW LEVEL SECURITY;

-- Policies for notification_history
CREATE POLICY notification_history_select_policy ON notification_history
    FOR SELECT TO authenticated USING (true);

CREATE POLICY notification_history_insert_policy ON notification_history
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY notification_history_update_policy ON notification_history
    FOR UPDATE TO authenticated USING (true);

-- Policies for email_templates
CREATE POLICY email_templates_select_policy ON email_templates
    FOR SELECT TO authenticated USING (true);

CREATE POLICY email_templates_insert_policy ON email_templates
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY email_templates_update_policy ON email_templates
    FOR UPDATE TO authenticated USING (true);

-- Policies for notification_groups
CREATE POLICY notification_groups_select_policy ON notification_groups
    FOR SELECT TO authenticated USING (true);

CREATE POLICY notification_groups_insert_policy ON notification_groups
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY notification_groups_update_policy ON notification_groups
    FOR UPDATE TO authenticated USING (true);

-- Policies for notification_group_members
CREATE POLICY notification_group_members_select_policy ON notification_group_members
    FOR SELECT TO authenticated USING (true);

CREATE POLICY notification_group_members_insert_policy ON notification_group_members
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY notification_group_members_delete_policy ON notification_group_members
    FOR DELETE TO authenticated USING (true);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_notification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_history_timestamp
    BEFORE UPDATE ON notification_history
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_timestamp();

CREATE TRIGGER update_email_templates_timestamp
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_timestamp();

CREATE TRIGGER update_notification_groups_timestamp
    BEFORE UPDATE ON notification_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_timestamp();

-- Insert default email templates
INSERT INTO email_templates (name, form_type, subject_template, body_template, variables, description) VALUES
('Projection Created', 'projection', 'New Projection: {{title}}', 
'A new projection has been created.

Details:
- Title: {{title}}
- Location: {{location_description}}
- Expected Revenue: ${{expected_revenue}}
- Expected Hours: {{expected_hours}}
- Status: {{status}}
- Created: {{created_at}}

{{custom_message}}

Please review this projection in the system.', 
ARRAY['title', 'location_description', 'expected_revenue', 'expected_hours', 'status', 'created_at', 'custom_message'],
'Default template for single projection creation notifications'),

('Bulk Projections Created', 'bulk-projection', 'Bulk Projections: {{count}} projections created', 
'{{count}} new projections have been created.

Summary:
- Number of Projections: {{count}}
- Created: {{created_at}}

{{projection_list}}

{{custom_message}}

Please review these projections in the system.',
ARRAY['count', 'created_at', 'projection_list', 'custom_message'],
'Default template for bulk projection creation notifications');

-- Add RBAC permissions for notifications module
INSERT INTO modules (name, display_name, description, is_active) VALUES 
('notifications', 'Notifications', 'Email notifications and templates management', true)
ON CONFLICT (name) DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Create actions for notifications module
INSERT INTO actions (name, display_name, description) VALUES
('notify.view', 'View Notifications', 'View notification history and analytics'),
('notify.send', 'Send Notifications', 'Send individual and bulk notifications'),
('notify.tpl.view', 'View Templates', 'View email templates'),
('notify.tpl.create', 'Create Templates', 'Create new email templates'),
('notify.tpl.edit', 'Edit Templates', 'Edit existing email templates'),
('notify.tpl.delete', 'Delete Templates', 'Delete email templates'),
('notify.grp.view', 'View Groups', 'View notification groups'),
('notify.grp.create', 'Create Groups', 'Create notification groups'),
('notify.grp.edit', 'Edit Groups', 'Edit notification groups'),
('notify.grp.delete', 'Delete Groups', 'Delete notification groups'),
('notify.set.view', 'View Settings', 'View notification settings'),
('notify.set.edit', 'Edit Settings', 'Edit notification settings and SMTP configuration'),
('notify.analytics', 'View Analytics', 'View email analytics and reports'),
('notify.schedule', 'Schedule Emails', 'Schedule emails for future delivery')
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description;

-- Create permissions for notifications module
DO $$
DECLARE
    notifications_module_id UUID;
    action_record RECORD;
BEGIN
    SELECT id INTO notifications_module_id FROM modules WHERE name = 'notifications';
    
    -- Insert permissions for each action
    FOR action_record IN 
        SELECT id, name, display_name, description FROM actions WHERE name LIKE 'notify.%'
    LOOP
        INSERT INTO permissions (module_id, action_id, permission_key, display_name, description)
        VALUES (
            notifications_module_id, 
            action_record.id, 
            action_record.name,
            action_record.display_name,
            action_record.description
        )
        ON CONFLICT (permission_key) DO UPDATE SET
            module_id = EXCLUDED.module_id,
            action_id = EXCLUDED.action_id,
            display_name = EXCLUDED.display_name,
            description = EXCLUDED.description;
    END LOOP;
END $$;

-- Assign notifications permissions to roles using direct queries
-- Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('Admin', 'Administrator')
AND p.permission_key LIKE 'notify.%'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Manager gets most permissions (except settings management)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('Manager', 'Properties Manager')
AND p.permission_key LIKE 'notify.%'
AND p.permission_key NOT IN ('notify.set.edit')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- HR Officer gets view and send permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('HR Officer', 'HR Manager')
AND p.permission_key IN (
    'notify.view',
    'notify.send',
    'notify.tpl.view',
    'notify.grp.view',
    'notify.analytics'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign notifications module to roles
INSERT INTO role_modules (role_id, module_id)
SELECT r.id, m.id
FROM roles r, modules m
WHERE r.name IN ('Admin', 'Administrator', 'Manager', 'Properties Manager', 'HR Officer', 'HR Manager') 
AND m.name = 'notifications'
ON CONFLICT (role_id, module_id) DO NOTHING;


-- Insert default notification groups
INSERT INTO notification_groups (name, description, form_types) VALUES
('Finance Team', 'All finance department members', ARRAY['projection', 'bulk-projection', 'invoice', 'budget']),
('Management Team', 'All managers and supervisors', ARRAY['projection', 'bulk-projection', 'staff-benefit', 'property']),
('System Administrators', 'System administrators and IT staff', ARRAY['user-management', 'system-config']);

-- Add comments
COMMENT ON TABLE notification_history IS 'Stores history of all email notifications sent from the system';
COMMENT ON TABLE email_templates IS 'Reusable email templates for different form types';
COMMENT ON TABLE notification_groups IS 'Groups of users for bulk email notifications';
COMMENT ON TABLE notification_group_members IS 'Members of notification groups';
