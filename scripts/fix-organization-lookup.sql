/* ALTERNATIEVE FIX: Gebruik database functie voor organization lookup */

-- Maak een veilige functie die organization_id ophaalt zonder RLS problemen
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

-- Maak een veilige functie die user role ophaalt
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
GRANT EXECUTE ON FUNCTION public.get_user_organization_id() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated, anon;

-- Verifieer
SELECT 
  'public.get_user_organization_id' as function_name,
  public.get_user_organization_id() as result;

