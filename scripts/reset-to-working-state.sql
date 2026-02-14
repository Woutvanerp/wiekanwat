-- ============================================
-- RESET DATABASE TO WORKING STATE
-- ============================================
-- This script resets the database to how it was working before today
-- It disables RLS which was causing access issues

-- ============================================
-- STEP 1: Drop all existing RLS policies
-- ============================================

-- User Profiles policies
DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles CASCADE;
DROP POLICY IF EXISTS "Service role has full access" ON user_profiles CASCADE;
DROP POLICY IF EXISTS "Users can view user profiles" ON user_profiles CASCADE;
DROP POLICY IF EXISTS "Users can update user profiles" ON user_profiles CASCADE;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles CASCADE;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON user_profiles CASCADE;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles CASCADE;
DROP POLICY IF EXISTS "Admins can insert users in their organization" ON user_profiles CASCADE;
DROP POLICY IF EXISTS "Admins can update users in their organization" ON user_profiles CASCADE;
DROP POLICY IF EXISTS "Admins can delete users in their organization" ON user_profiles CASCADE;

-- Organizations policies
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations CASCADE;
DROP POLICY IF EXISTS "Admins can update their organization" ON organizations CASCADE;

-- Employees policies
DROP POLICY IF EXISTS "Users can view employees in their organization" ON employees CASCADE;
DROP POLICY IF EXISTS "Users can insert employees in their organization" ON employees CASCADE;
DROP POLICY IF EXISTS "Users can update employees in their organization" ON employees CASCADE;
DROP POLICY IF EXISTS "Admins and managers can delete employees" ON employees CASCADE;

-- Clients policies
DROP POLICY IF EXISTS "Users can view clients in their organization" ON clients CASCADE;
DROP POLICY IF EXISTS "Users can insert clients in their organization" ON clients CASCADE;
DROP POLICY IF EXISTS "Users can update clients in their organization" ON clients CASCADE;
DROP POLICY IF EXISTS "Admins and managers can delete clients" ON clients CASCADE;

-- Employee Clients policies
DROP POLICY IF EXISTS "Users can view assignments in their organization" ON employee_clients CASCADE;
DROP POLICY IF EXISTS "Users can insert assignments in their organization" ON employee_clients CASCADE;
DROP POLICY IF EXISTS "Users can update assignments in their organization" ON employee_clients CASCADE;
DROP POLICY IF EXISTS "Admins and managers can delete assignments" ON employee_clients CASCADE;

-- ============================================
-- STEP 2: Disable RLS on all tables
-- ============================================
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE employee_clients DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: Grant proper permissions
-- ============================================
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON organizations TO authenticated;
GRANT ALL ON employees TO authenticated;
GRANT ALL ON clients TO authenticated;
GRANT ALL ON employee_clients TO authenticated;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- STEP 4: Ensure helper functions exist and are accessible
-- ============================================

-- Create or replace the helper function for getting user organization
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM public.user_profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the helper function for getting user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.user_profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on these functions
GRANT EXECUTE ON FUNCTION public.get_user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;

-- ============================================
-- STEP 5: Verification
-- ============================================

-- Check RLS status
SELECT 
  '=== RLS STATUS ===' as section,
  tablename,
  CASE 
    WHEN rowsecurity THEN '⚠️ RLS ENABLED'
    ELSE '✅ RLS DISABLED'
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'organizations', 'employees', 'clients', 'employee_clients')
ORDER BY tablename;

-- Check policies (should be empty)
SELECT 
  '=== POLICIES ===' as section,
  tablename,
  policyname
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'organizations', 'employees', 'clients', 'employee_clients');

-- Check user info
SELECT 
  '=== USER INFO ===' as section,
  u.email,
  up.role,
  up.organization_id,
  o.name as organization_name,
  o.slug as organization_slug
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
LEFT JOIN organizations o ON up.organization_id = o.id
WHERE u.email = 'test123@test.com';

-- Check data counts per organization
SELECT 
  '=== DATA COUNTS ===' as section,
  o.name as organization,
  (SELECT COUNT(*) FROM employees WHERE organization_id = o.id) as employees_count,
  (SELECT COUNT(*) FROM clients WHERE organization_id = o.id) as clients_count,
  (SELECT COUNT(*) FROM user_profiles WHERE organization_id = o.id) as users_count
FROM organizations o
ORDER BY o.created_at;

-- ============================================
-- DONE!
-- ============================================
SELECT 
  '✅ RESET COMPLETE' as status,
  'Database reset to working state' as message,
  'RLS is disabled - access controlled by backend code' as security_model,
  'All authenticated users have access to tables' as permissions,
  'Data isolation maintained via organization_id in API routes' as isolation;

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- 1. RLS is now DISABLED on all tables
-- 2. Security is handled by:
--    - Backend API routes (organization context)
--    - Authentication (login required)
--    - Server-side filtering by organization_id
--
-- 3. Users should now be able to access:
--    - Personen (employees)
--    - Organisatiestructuur (organizational structure)
--    - Klanten (clients)
--
-- 4. If issues persist:
--    - Log out and log back in
--    - Clear browser cache
--    - Restart the Next.js dev server: npm run dev
--
-- 5. To verify access is working:
--    - Login as test123@test.com
--    - Navigate to /organizational-chart (Personen)
--    - Navigate to /organizational-structure (Organisatiestructuur)
--    - Navigate to /clients (Klanten)

