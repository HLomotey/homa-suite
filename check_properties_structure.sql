-- Check the actual structure of the properties table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'properties'
ORDER BY ordinal_position;

-- Also check if the table exists at all
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'properties'
) as properties_table_exists;

-- If properties table doesn't exist, we need to create it
-- Let's check what tables do exist that might be related
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name LIKE '%propert%'
ORDER BY table_name;