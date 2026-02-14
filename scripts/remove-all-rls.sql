/* VERWIJDER ALLE RLS - Simpele oplossing */

-- ============================================
-- SCHAKEL RLS UIT OP ALLE TABELLEN
-- ============================================
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE employee_clients DISABLE ROW LEVEL SECURITY;

-- ============================================
-- VERWIJDER ALLE POLICIES
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
-- VERWIJDER HELPER FUNCTIES (optioneel)
-- ============================================
DROP FUNCTION IF EXISTS public.get_user_organization_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
DROP FUNCTION IF EXISTS get_user_organization_id() CASCADE;

-- ============================================
-- VERIFICATIE
-- ============================================
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '⚠️ RLS STILL ON'
    ELSE '✅ RLS DISABLED'
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'organizations', 'employees', 'clients', 'employee_clients')
ORDER BY tablename;

-- Check dat er geen policies meer zijn
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename;

-- ============================================
-- KLAAR! 
-- ============================================
-- RLS is nu volledig uitgeschakeld
-- Beveiliging wordt nu geregeld door:
-- 1. Backend code (organization_id filtering)
-- 2. Authenticatie (login vereist)
-- 3. Je API routes controleren organization context
-- 
-- Herstart server: npm run dev

