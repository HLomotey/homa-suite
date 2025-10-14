-- Fix user login by adding them to external_staff table
-- Replace 'user@example.com' with the actual user email
-- Replace 'John Doe' with the actual user name

INSERT INTO external_staff (
  "EMPLOYEE ID",
  "PERSONAL E-MAIL", 
  "FULL NAME",
  "POSITION STATUS"
) VALUES (
  'EMP001', -- Generate unique employee ID
  'user@example.com', -- User's email (lowercase)
  'John Doe', -- User's full name
  'A - Active' -- Active status required for login
)
ON CONFLICT ("PERSONAL E-MAIL") 
DO UPDATE SET "POSITION STATUS" = 'A - Active';

-- Verify the user was added
SELECT * FROM external_staff WHERE "PERSONAL E-MAIL" = 'user@example.com';
