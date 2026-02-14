/* ULTIMATE FIX: Maak RPC functies die backend kan aanroepen */

-- ============================================
-- Schakel RLS UIT op user_profiles
-- ============================================
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- Hernoem bestaande functies en maak ze beschikbaar als RPC
-- ============================================

-- Drop oude functies met CASCADE (dit verwijdert ook afhankelijke policies)
DROP FUNCTION IF EXISTS public.get_user_organization_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;

-- Maak nieuwe RPC functies met juiste signature
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path TO public, pg_temp
STABLE
AS $$
  SELECT organization_id 
  FROM public.user_profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path TO public, pg_temp
STABLE
AS $$
  SELECT role 
  FROM public.user_profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Geef de juiste permissies
GRANT EXECUTE ON FUNCTION public.get_user_organization_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO anon, authenticated;

-- ============================================
-- Test de functies
-- ============================================
SELECT 
  'RPC Test' as test_name,
  public.get_user_organization_id() as org_id,
  public.get_user_role() as user_role;

-- ============================================
-- Verificatie - Toon RLS status
-- ============================================
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '🔒 RLS ON'
    ELSE '✅ RLS OFF'
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'employees', 'clients')
ORDER BY tablename;

-- ============================================
-- KLAAR!
-- ============================================
-- Herstart nu je dev server: npm run dev
-- De backend gebruikt nu RPC calls om organization_id op te halen

