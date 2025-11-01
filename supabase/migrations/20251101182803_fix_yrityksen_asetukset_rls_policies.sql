/*
  # Fix RLS Policies for yrityksen_asetukset

  1. Security Changes
    - Add SELECT policy for authenticated users to read their company settings
    - Add INSERT policy for authenticated users to create settings
    - Add UPDATE policy for authenticated users to modify their company settings
    
  Important: Users should only access settings for their own company
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'yrityksen_asetukset' 
    AND policyname = 'Users can view own company settings'
  ) THEN
    CREATE POLICY "Users can view own company settings"
      ON yrityksen_asetukset FOR SELECT
      TO authenticated
      USING (company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'yrityksen_asetukset' 
    AND policyname = 'Users can create company settings'
  ) THEN
    CREATE POLICY "Users can create company settings"
      ON yrityksen_asetukset FOR INSERT
      TO authenticated
      WITH CHECK (company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'yrityksen_asetukset' 
    AND policyname = 'Users can update own company settings'
  ) THEN
    CREATE POLICY "Users can update own company settings"
      ON yrityksen_asetukset FOR UPDATE
      TO authenticated
      USING (company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      ))
      WITH CHECK (company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      ));
  END IF;
END $$;