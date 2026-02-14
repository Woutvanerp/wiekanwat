/* FINAL FIX: Disable RLS op user_profiles, behoud RLS op business data */

-- ============================================
-- Schakel RLS UIT op user_profiles (metadata only)
-- ============================================
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- Zorg dat RLS AAN blijft op business data tabellen
-- ============================================
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_clients ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Verificatie - Check RLS status
-- ============================================
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '🔒 PROTECTED (RLS ON)'
    ELSE '⚠️ OPEN (RLS OFF)'
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'employees', 'clients', 'organizations', 'employee_clients')
ORDER BY tablename;

-- ============================================
-- Test: Kan je nu data ophalen?
-- ============================================
SELECT 
  'Test Result' as test,
  COUNT(*) as user_profiles_count
FROM user_profiles;

SELECT 
  'Your Profile' as info,
  email,
  role,
  organization_id
FROM user_profiles
WHERE email = 'w.vanerp@sparkeandkeane.nl';

-- ============================================
-- KLAAR! 
-- ============================================
-- Herstart nu je dev server en test de app
-- npm run dev

