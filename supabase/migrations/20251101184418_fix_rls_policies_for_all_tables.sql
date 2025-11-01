/*
  # Fix RLS Policies for All Tables
  
  ## Changes
  
  Fix RLS policies to use profiles.user_id instead of profiles.id
  This fixes the issue where users cannot access their own data
  
  1. Drop existing incorrect policies
  2. Create new correct policies for:
     - yrityksen_asetukset
     - varasto_asetukset
     - All other tables that need company_id access
*/

-- Fix yrityksen_asetukset policies
DROP POLICY IF EXISTS "Users can view own company settings" ON yrityksen_asetukset;
DROP POLICY IF EXISTS "Users can create company settings" ON yrityksen_asetukset;
DROP POLICY IF EXISTS "Users can update own company settings" ON yrityksen_asetukset;

CREATE POLICY "Users can view own company settings"
  ON yrityksen_asetukset FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create company settings"
  ON yrityksen_asetukset FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own company settings"
  ON yrityksen_asetukset FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Fix varasto_asetukset policies
DROP POLICY IF EXISTS "Users can view inventory settings" ON varasto_asetukset;
DROP POLICY IF EXISTS "Users can create inventory settings" ON varasto_asetukset;
DROP POLICY IF EXISTS "Users can update inventory settings" ON varasto_asetukset;

CREATE POLICY "Users can view inventory settings"
  ON varasto_asetukset FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create inventory settings"
  ON varasto_asetukset FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update inventory settings"
  ON varasto_asetukset FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE user_id = auth.uid()
    )
  );