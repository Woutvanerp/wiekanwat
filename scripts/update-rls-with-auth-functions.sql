/* Update RLS policies om de veilige auth functies te gebruiken */

-- ============================================
-- EMPLOYEES POLICIES - Gebruik auth functie
-- ============================================
DROP POLICY IF EXISTS "Users can view employees in their organization" ON employees;
DROP POLICY IF EXISTS "Users can insert employees in their organization" ON employees;
DROP POLICY IF EXISTS "Users can update employees in their organization" ON employees;
DROP POLICY IF EXISTS "Admins and managers can delete employees" ON employees;

CREATE POLICY "Users can view employees in their organization"
  ON employees FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can insert employees in their organization"
  ON employees FOR INSERT
  WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can update employees in their organization"
  ON employees FOR UPDATE
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Admins and managers can delete employees"
  ON employees FOR DELETE
  USING (
    organization_id = public.get_user_organization_id() 
    AND public.get_user_role() IN ('admin', 'manager')
  );

-- ============================================
-- CLIENTS POLICIES - Gebruik auth functie
-- ============================================
DROP POLICY IF EXISTS "Users can view clients in their organization" ON clients;
DROP POLICY IF EXISTS "Users can insert clients in their organization" ON clients;
DROP POLICY IF EXISTS "Users can update clients in their organization" ON clients;
DROP POLICY IF EXISTS "Admins and managers can delete clients" ON clients;

CREATE POLICY "Users can view clients in their organization"
  ON clients FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can insert clients in their organization"
  ON clients FOR INSERT
  WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can update clients in their organization"
  ON clients FOR UPDATE
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Admins and managers can delete clients"
  ON clients FOR DELETE
  USING (
    organization_id = public.get_user_organization_id() 
    AND public.get_user_role() IN ('admin', 'manager')
  );

-- ============================================
-- ORGANIZATIONS POLICIES - Gebruik auth functie
-- ============================================
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
DROP POLICY IF EXISTS "Admins can update their organization" ON organizations;

CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (id = public.get_user_organization_id());

CREATE POLICY "Admins can update their organization"
  ON organizations FOR UPDATE
  USING (
    id = public.get_user_organization_id() 
    AND public.get_user_role() = 'admin'
  );

-- ============================================
-- EMPLOYEE_CLIENTS POLICIES - Gebruik auth functie
-- ============================================
DROP POLICY IF EXISTS "Users can view assignments in their organization" ON employee_clients;
DROP POLICY IF EXISTS "Users can insert assignments in their organization" ON employee_clients;
DROP POLICY IF EXISTS "Users can update assignments in their organization" ON employee_clients;
DROP POLICY IF EXISTS "Admins and managers can delete assignments" ON employee_clients;

CREATE POLICY "Users can view assignments in their organization"
  ON employee_clients FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can insert assignments in their organization"
  ON employee_clients FOR INSERT
  WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can update assignments in their organization"
  ON employee_clients FOR UPDATE
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Admins and managers can delete assignments"
  ON employee_clients FOR DELETE
  USING (
    organization_id = public.get_user_organization_id() 
    AND public.get_user_role() IN ('admin', 'manager')
  );

-- Verifieer alle policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

