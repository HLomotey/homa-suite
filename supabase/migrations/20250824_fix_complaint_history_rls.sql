-- Fix RLS policies for complaint_history table to allow admin access
-- This migration adds admin bypass to complaint_history RLS policies

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "complaint_history_select_policy" ON complaint_history;
DROP POLICY IF EXISTS "complaint_history_insert_policy" ON complaint_history;
DROP POLICY IF EXISTS "complaint_history_update_policy" ON complaint_history;
DROP POLICY IF EXISTS "complaint_history_delete_policy" ON complaint_history;

-- Enable RLS on complaint_history table
ALTER TABLE complaint_history ENABLE ROW LEVEL SECURITY;

-- Create new policies with admin bypass
-- Allow users to view complaint history for complaints they have access to OR if they are admin
CREATE POLICY "complaint_history_select_policy" ON complaint_history
FOR SELECT USING (
  -- Admin users can see all complaint history
  EXISTS (
    SELECT 1 FROM profiles p 
    JOIN users u ON p.id = u.id 
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  )
  OR
  -- Regular users can see history for complaints they created or are assigned to
  EXISTS (
    SELECT 1 FROM complaints c 
    WHERE c.id = complaint_history.complaint_id 
    AND (c.created_by = auth.uid() OR c.assigned_to = auth.uid())
  )
);

-- Allow users to insert complaint history OR if they are admin
CREATE POLICY "complaint_history_insert_policy" ON complaint_history
FOR INSERT WITH CHECK (
  -- Admin users can insert any complaint history
  EXISTS (
    SELECT 1 FROM profiles p 
    JOIN users u ON p.id = u.id 
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  )
  OR
  -- Regular users can insert history for complaints they have access to
  EXISTS (
    SELECT 1 FROM complaints c 
    WHERE c.id = complaint_history.complaint_id 
    AND (c.created_by = auth.uid() OR c.assigned_to = auth.uid())
  )
);

-- Allow users to update complaint history OR if they are admin
CREATE POLICY "complaint_history_update_policy" ON complaint_history
FOR UPDATE USING (
  -- Admin users can update any complaint history
  EXISTS (
    SELECT 1 FROM profiles p 
    JOIN users u ON p.id = u.id 
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  )
  OR
  -- Regular users can update history they created
  user_id = auth.uid()
);

-- Allow users to delete complaint history OR if they are admin
CREATE POLICY "complaint_history_delete_policy" ON complaint_history
FOR DELETE USING (
  -- Admin users can delete any complaint history
  EXISTS (
    SELECT 1 FROM profiles p 
    JOIN users u ON p.id = u.id 
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  )
  OR
  -- Regular users can delete history they created
  user_id = auth.uid()
);
