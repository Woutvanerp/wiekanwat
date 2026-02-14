/* SNELLE FIX: Schakel RLS uit op user_profiles */

-- Dit lost de "No valid session or organization" error direct op
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Verifieer
SELECT 
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename = 'user_profiles' 
  AND schemaname = 'public';

-- Test: check of je nu je profile kunt ophalen
SELECT 
  id,
  organization_id,
  email,
  role
FROM user_profiles
WHERE email = 'w.vanerp@sparkeandkeane.nl';

