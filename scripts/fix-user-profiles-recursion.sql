/* SIMPLE FIX: Remove recursion from user_profiles policies */

-- ============================================
-- STEP 1: Drop ALL user_profiles policies
-- ============================================
DROP POLICY IF EXISTS "Users can view user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert users in their organization" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update users in their organization" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete users in their organization" ON user_profiles;

-- ============================================
-- STEP 2: Create SIMPLE policies without recursion
-- ============================================

-- Policy 1: Users can view and update their OWN profile (no recursion)
CREATE POLICY "Users can manage own profile"
  ON user_profiles
  FOR ALL
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- Policy 2: Allow service role full access (for API operations)
CREATE POLICY "Service role has full access"
  ON user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

