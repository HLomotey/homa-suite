-- Add Job Orders module to role permissions system
-- This enables the Job Orders module to appear in the sidebar and be assigned to roles

-- Insert Job Orders module
INSERT INTO public.modules (name, display_name, description, sort_order) VALUES
('job-orders', 'Job Orders', 'Job order tracking and management', 145)
ON CONFLICT (name) DO NOTHING;

-- Generate permissions for the job-orders module with all actions
DO $$
DECLARE
    job_orders_module_id UUID;
    action_rec RECORD;
BEGIN
    -- Get the job-orders module ID
    SELECT id INTO job_orders_module_id FROM public.modules WHERE name = 'job-orders';
    
    -- Create permissions for each action
    FOR action_rec IN SELECT id, name, display_name FROM public.actions LOOP
        INSERT INTO public.permissions (
            module_id, 
            action_id, 
            permission_key, 
            display_name, 
            description
        )
        VALUES (
            job_orders_module_id, 
            action_rec.id, 
            'job-orders:' || action_rec.name, 
            'Job Orders - ' || action_rec.display_name,
            'Permission to ' || action_rec.display_name || ' in Job Orders'
        )
        ON CONFLICT (module_id, action_id) DO NOTHING;
    END LOOP;
END $$;

-- Assign job-orders permissions to relevant roles
DO $$
DECLARE
    admin_role_id UUID;
    hr_officer_role_id UUID;
    manager_role_id UUID;
    staff_role_id UUID;
    role_permissions_table_exists BOOLEAN;
BEGIN
    -- Check if role_permissions table exists and get its structure
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'role_permissions'
    ) INTO role_permissions_table_exists;
    
    IF NOT role_permissions_table_exists THEN
        RAISE NOTICE 'role_permissions table does not exist, skipping permission assignment';
        RETURN;
    END IF;
    
    -- Get role IDs (handle case where roles might not exist)
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
    SELECT id INTO hr_officer_role_id FROM public.roles WHERE name = 'hr_officer';
    SELECT id INTO manager_role_id FROM public.roles WHERE name = 'manager';
    SELECT id INTO staff_role_id FROM public.roles WHERE name = 'staff';
    
    -- Admin gets all job-orders permissions (already has all permissions via admin role)
    -- HR Officer permissions - full access to job orders
    IF hr_officer_role_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT hr_officer_role_id, p.id 
        FROM public.permissions p
        JOIN public.modules m ON p.module_id = m.id
        WHERE m.name = 'job-orders'
        ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;
    
    -- Manager permissions - view, edit, create, approve job orders
    IF manager_role_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT manager_role_id, p.id 
        FROM public.permissions p
        JOIN public.modules m ON p.module_id = m.id
        JOIN public.actions a ON p.action_id = a.id
        WHERE m.name = 'job-orders' 
        AND a.name IN ('view', 'edit', 'create', 'approve')
        ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;
    
    -- Staff permissions - view and create job orders
    IF staff_role_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT staff_role_id, p.id 
        FROM public.permissions p
        JOIN public.modules m ON p.module_id = m.id
        JOIN public.actions a ON p.action_id = a.id
        WHERE m.name = 'job-orders' 
        AND a.name IN ('view', 'create')
        ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;
END $$;

-- Verify the module was added
DO $$
DECLARE
    module_count INTEGER;
    permission_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO module_count FROM public.modules WHERE name = 'job-orders';
    SELECT COUNT(*) INTO permission_count FROM public.permissions p 
    JOIN public.modules m ON p.module_id = m.id 
    WHERE m.name = 'job-orders';
    
    RAISE NOTICE 'Job Orders module added: % modules, % permissions created', module_count, permission_count;
END $$;
