/*
  # Fix RLS Policies for Enhanced Security
  
  ## Changes
  
  1. **License Policies**
     - Replace `USING (true)` policy that allows viewing all licenses
     - Add company-scoped license viewing policy
     - Add company_id check to admin license management
  
  2. **Service Parts Policy**
     - Split "FOR ALL" policy into separate SELECT, INSERT, UPDATE, DELETE policies
     - Add WITH CHECK clauses for data modification policies
  
  3. **User Roles Policy** 
     - Add company_id validation to user_roles table
     - Ensure users can only manage roles within their company
  
  ## Security Impact
  
  - Prevents cross-company data leakage
  - Enforces company isolation in all operations
  - Follows principle of least privilege
*/

-- ============================================================================
-- 1. FIX LICENSE POLICIES
-- ============================================================================

-- Drop insecure license policies
DROP POLICY IF EXISTS "Users can view licenses" ON public.licenses;
DROP POLICY IF EXISTS "Admins can manage licenses" ON public.licenses;

-- Add company_id column to licenses if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'licenses' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE public.licenses 
    ADD COLUMN company_id uuid REFERENCES public.yritykset(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create secure license policies
CREATE POLICY "Users can view company licenses"
  ON public.licenses FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert company licenses"
  ON public.licenses FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update company licenses"
  ON public.licenses FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete company licenses"
  ON public.licenses FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'admin')
  );

-- ============================================================================
-- 2. FIX SERVICE PARTS POLICIES
-- ============================================================================

-- Drop the overly permissive "FOR ALL" policy
DROP POLICY IF EXISTS "Users can manage service parts" ON public.huolto_varaosat;

-- Create separate policies for each operation
CREATE POLICY "Users can insert service parts"
  ON public.huolto_varaosat FOR INSERT
  TO authenticated
  WITH CHECK (
    huolto_id IN (
      SELECT id FROM public.Huollot
      WHERE company_id IN (
        SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update service parts"
  ON public.huolto_varaosat FOR UPDATE
  TO authenticated
  USING (
    huolto_id IN (
      SELECT id FROM public.Huollot
      WHERE company_id IN (
        SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    huolto_id IN (
      SELECT id FROM public.Huollot
      WHERE company_id IN (
        SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete service parts"
  ON public.huolto_varaosat FOR DELETE
  TO authenticated
  USING (
    huolto_id IN (
      SELECT id FROM public.Huollot
      WHERE company_id IN (
        SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 3. FIX USER ROLES POLICIES
-- ============================================================================

-- Add company_id to user_roles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_roles' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE public.user_roles 
    ADD COLUMN company_id uuid REFERENCES public.yritykset(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Create company-scoped role policies
CREATE POLICY "Users can view company roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      company_id IN (
        SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
      )
      AND public.has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "Admins can insert company roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update company roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete company roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'admin')
  );
