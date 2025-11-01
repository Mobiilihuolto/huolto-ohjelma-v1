/*
  # Fix RLS for Shared Tables
  
  Some tables like service_statuses, alv_asetukset, laskutus_asetukset
  are shared across companies and should be accessible to all authenticated users
  
  ## Tables Fixed
  - service_statuses (shared)
  - alv_asetukset (shared)
  - laskutus_asetukset (shared)
*/

-- SERVICE_STATUSES (shared table, no company_id)
DROP POLICY IF EXISTS "Authenticated users can view statuses" ON service_statuses;
DROP POLICY IF EXISTS "Authenticated users can manage statuses" ON service_statuses;
DROP POLICY IF EXISTS "Authenticated users can create statuses" ON service_statuses;
DROP POLICY IF EXISTS "Authenticated users can update statuses" ON service_statuses;
DROP POLICY IF EXISTS "Authenticated users can delete statuses" ON service_statuses;

CREATE POLICY "Authenticated users can view statuses" ON service_statuses 
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create statuses" ON service_statuses 
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update statuses" ON service_statuses 
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete statuses" ON service_statuses 
FOR DELETE TO authenticated USING (true);

-- ALV_ASETUKSET (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alv_asetukset') THEN
    DROP POLICY IF EXISTS "Authenticated users can view alv settings" ON alv_asetukset;
    DROP POLICY IF EXISTS "Authenticated users can create alv settings" ON alv_asetukset;
    DROP POLICY IF EXISTS "Authenticated users can update alv settings" ON alv_asetukset;
    DROP POLICY IF EXISTS "Authenticated users can delete alv settings" ON alv_asetukset;

    CREATE POLICY "Authenticated users can view alv settings" ON alv_asetukset 
    FOR SELECT TO authenticated USING (
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alv_asetukset' AND column_name = 'company_id')
        THEN company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
        ELSE true
      END
    );

    CREATE POLICY "Authenticated users can create alv settings" ON alv_asetukset 
    FOR INSERT TO authenticated WITH CHECK (
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alv_asetukset' AND column_name = 'company_id')
        THEN company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
        ELSE true
      END
    );

    CREATE POLICY "Authenticated users can update alv settings" ON alv_asetukset 
    FOR UPDATE TO authenticated USING (
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alv_asetukset' AND column_name = 'company_id')
        THEN company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
        ELSE true
      END
    ) WITH CHECK (
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alv_asetukset' AND column_name = 'company_id')
        THEN company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
        ELSE true
      END
    );

    CREATE POLICY "Authenticated users can delete alv settings" ON alv_asetukset 
    FOR DELETE TO authenticated USING (
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alv_asetukset' AND column_name = 'company_id')
        THEN company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
        ELSE true
      END
    );
  END IF;
END $$;

-- LASKUTUS_ASETUKSET (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'laskutus_asetukset') THEN
    DROP POLICY IF EXISTS "Authenticated users can view invoice settings" ON laskutus_asetukset;
    DROP POLICY IF EXISTS "Authenticated users can create invoice settings" ON laskutus_asetukset;
    DROP POLICY IF EXISTS "Authenticated users can update invoice settings" ON laskutus_asetukset;
    DROP POLICY IF EXISTS "Authenticated users can delete invoice settings" ON laskutus_asetukset;

    CREATE POLICY "Authenticated users can view invoice settings" ON laskutus_asetukset 
    FOR SELECT TO authenticated USING (
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'laskutus_asetukset' AND column_name = 'company_id')
        THEN company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
        ELSE true
      END
    );

    CREATE POLICY "Authenticated users can create invoice settings" ON laskutus_asetukset 
    FOR INSERT TO authenticated WITH CHECK (
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'laskutus_asetukset' AND column_name = 'company_id')
        THEN company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
        ELSE true
      END
    );

    CREATE POLICY "Authenticated users can update invoice settings" ON laskutus_asetukset 
    FOR UPDATE TO authenticated USING (
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'laskutus_asetukset' AND column_name = 'company_id')
        THEN company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
        ELSE true
      END
    ) WITH CHECK (
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'laskutus_asetukset' AND column_name = 'company_id')
        THEN company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
        ELSE true
      END
    );

    CREATE POLICY "Authenticated users can delete invoice settings" ON laskutus_asetukset 
    FOR DELETE TO authenticated USING (
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'laskutus_asetukset' AND column_name = 'company_id')
        THEN company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
        ELSE true
      END
    );
  END IF;
END $$;