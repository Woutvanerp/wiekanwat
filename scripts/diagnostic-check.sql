/* Quick Diagnostic - Check wat er aan de hand is */

-- Check 1: Bestaan de functies?
SELECT 
  routine_name, 
  routine_type,
  routine_schema
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_user_organization_id', 'get_user_role');

-- Check 2: Welke policies zijn er op user_profiles?
SELECT policyname, cmd
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Check 3: Is RLS enabled?
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'employees', 'clients')
  AND schemaname = 'public';

-- Check 4: Test of je user profile bestaat
SELECT 
  id,
  organization_id,
  email,
  role
FROM user_profiles
WHERE email = 'w.vanerp@sparkeandkeane.nl';

