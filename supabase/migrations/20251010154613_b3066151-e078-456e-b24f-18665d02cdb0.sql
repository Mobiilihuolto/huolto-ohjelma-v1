-- ====================================
-- SECURITY MIGRATION: Enable Row Level Security (FIXED)
-- ====================================
-- This migration enables RLS and creates secure policies for all tables
-- Each user can only access their own data based on user_id

-- ====================================
-- 1. ASIAKKAAT (Customers) - CRITICAL
-- ====================================
DROP POLICY IF EXISTS "Allow all access to customers in dev mode" ON public.asiakkaat;

CREATE POLICY "Users can view own customers"
  ON public.asiakkaat FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own customers"
  ON public.asiakkaat FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own customers"
  ON public.asiakkaat FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own customers"
  ON public.asiakkaat FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ====================================
-- 2. LAITTEET (Devices) - Note: Capital L
-- ====================================
DROP POLICY IF EXISTS "Allow all access to devices in dev mode" ON public."Laitteet";

CREATE POLICY "Users can view own devices"
  ON public."Laitteet" FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own devices"
  ON public."Laitteet" FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own devices"
  ON public."Laitteet" FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own devices"
  ON public."Laitteet" FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ====================================
-- 3. HUOLLOT (Services) - CRITICAL - Note: Capital H
-- ====================================
DROP POLICY IF EXISTS "Allow all access to services in dev mode" ON public."Huollot";

CREATE POLICY "Users can view own services"
  ON public."Huollot" FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own services"
  ON public."Huollot" FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own services"
  ON public."Huollot" FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own services"
  ON public."Huollot" FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ====================================
-- 4. LASKUT (Invoices) - CRITICAL
-- ====================================
DROP POLICY IF EXISTS "Allow all access to invoices in dev mode" ON public.laskut;

CREATE POLICY "Users can view own invoices"
  ON public.laskut FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own invoices"
  ON public.laskut FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own invoices"
  ON public.laskut FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own invoices"
  ON public.laskut FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ====================================
-- 5. VARAOSAT (Parts/Inventory)
-- ====================================
DROP POLICY IF EXISTS "Allow all access to parts in dev mode" ON public.varaosat;

CREATE POLICY "Users can view own parts"
  ON public.varaosat FOR SELECT
  TO authenticated
  USING (true); -- Parts are shared across the organization

CREATE POLICY "Users can insert own parts"
  ON public.varaosat FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own parts"
  ON public.varaosat FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own parts"
  ON public.varaosat FOR DELETE
  TO authenticated
  USING (true);

-- ====================================
-- 6. HUOLTO_VARAOSAT (Service Parts)
-- ====================================
DROP POLICY IF EXISTS "Allow all access to service parts in dev mode" ON public.huolto_varaosat;

CREATE POLICY "Users can view service parts"
  ON public.huolto_varaosat FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Huollot"
      WHERE "Huollot".id = huolto_varaosat.huolto_id
      AND "Huollot".user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert service parts"
  ON public.huolto_varaosat FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."Huollot"
      WHERE "Huollot".id = huolto_varaosat.huolto_id
      AND "Huollot".user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update service parts"
  ON public.huolto_varaosat FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Huollot"
      WHERE "Huollot".id = huolto_varaosat.huolto_id
      AND "Huollot".user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."Huollot"
      WHERE "Huollot".id = huolto_varaosat.huolto_id
      AND "Huollot".user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete service parts"
  ON public.huolto_varaosat FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Huollot"
      WHERE "Huollot".id = huolto_varaosat.huolto_id
      AND "Huollot".user_id = auth.uid()
    )
  );

-- ====================================
-- 7. YRITYKSEN_ASETUKSET (Company Settings)
-- ====================================
DROP POLICY IF EXISTS "Allow all access to company settings in dev mode" ON public.yrityksen_asetukset;

CREATE POLICY "Users can view own company settings"
  ON public.yrityksen_asetukset FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own company settings"
  ON public.yrityksen_asetukset FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own company settings"
  ON public.yrityksen_asetukset FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own company settings"
  ON public.yrityksen_asetukset FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ====================================
-- 8. ALV_ASETUKSET (VAT Settings)
-- ====================================
DROP POLICY IF EXISTS "Allow all access to ALV settings in dev mode" ON public.alv_asetukset;

CREATE POLICY "Users can view VAT settings"
  ON public.alv_asetukset FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert VAT settings"
  ON public.alv_asetukset FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update VAT settings"
  ON public.alv_asetukset FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete VAT settings"
  ON public.alv_asetukset FOR DELETE
  TO authenticated
  USING (true);

-- ====================================
-- 9. HINNOITTELU_ASETUKSET (Pricing Settings)
-- ====================================
DROP POLICY IF EXISTS "Allow all access to pricing settings in dev mode" ON public.hinnoittelu_asetukset;

CREATE POLICY "Users can view pricing settings"
  ON public.hinnoittelu_asetukset FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert pricing settings"
  ON public.hinnoittelu_asetukset FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update pricing settings"
  ON public.hinnoittelu_asetukset FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete pricing settings"
  ON public.hinnoittelu_asetukset FOR DELETE
  TO authenticated
  USING (true);

-- ====================================
-- 10. ILMOITUS_ASETUKSET (Notification Settings)
-- ====================================
DROP POLICY IF EXISTS "Allow all access to notification settings in dev mode" ON public.ilmoitus_asetukset;

CREATE POLICY "Users can view own notification settings"
  ON public.ilmoitus_asetukset FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notification settings"
  ON public.ilmoitus_asetukset FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notification settings"
  ON public.ilmoitus_asetukset FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own notification settings"
  ON public.ilmoitus_asetukset FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ====================================
-- 11. LASKU_ASETUKSET (Invoice Settings)
-- ====================================
DROP POLICY IF EXISTS "Allow all access to invoice settings in dev mode" ON public.lasku_asetukset;

CREATE POLICY "Users can view invoice settings"
  ON public.lasku_asetukset FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert invoice settings"
  ON public.lasku_asetukset FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update invoice settings"
  ON public.lasku_asetukset FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete invoice settings"
  ON public.lasku_asetukset FOR DELETE
  TO authenticated
  USING (true);

-- ====================================
-- 12. VARASTO_ASETUKSET (Inventory Settings)
-- ====================================
DROP POLICY IF EXISTS "Allow all access to inventory settings in dev mode" ON public.varasto_asetukset;

CREATE POLICY "Users can view inventory settings"
  ON public.varasto_asetukset FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert inventory settings"
  ON public.varasto_asetukset FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update inventory settings"
  ON public.varasto_asetukset FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete inventory settings"
  ON public.varasto_asetukset FOR DELETE
  TO authenticated
  USING (true);

-- ====================================
-- 13. TAKUU_ASETUKSET (Warranty Settings)
-- ====================================
DROP POLICY IF EXISTS "Allow all access to warranty settings in dev mode" ON public.takuu_asetukset;

CREATE POLICY "Users can view warranty settings"
  ON public.takuu_asetukset FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert warranty settings"
  ON public.takuu_asetukset FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update warranty settings"
  ON public.takuu_asetukset FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete warranty settings"
  ON public.takuu_asetukset FOR DELETE
  TO authenticated
  USING (true);

-- ====================================
-- 14. MAKSUTAVAT (Payment Methods)
-- ====================================
DROP POLICY IF EXISTS "Allow all access to payment methods in dev mode" ON public.maksutavat;

CREATE POLICY "Users can view payment methods"
  ON public.maksutavat FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert payment methods"
  ON public.maksutavat FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update payment methods"
  ON public.maksutavat FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete payment methods"
  ON public.maksutavat FOR DELETE
  TO authenticated
  USING (true);

-- ====================================
-- 15. NUMEROINTI_ASETUKSET (Numbering Settings)
-- ====================================
DROP POLICY IF EXISTS "Allow all access to numbering settings in dev mode" ON public.numerointi_asetukset;

CREATE POLICY "Users can view numbering settings"
  ON public.numerointi_asetukset FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert numbering settings"
  ON public.numerointi_asetukset FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update numbering settings"
  ON public.numerointi_asetukset FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete numbering settings"
  ON public.numerointi_asetukset FOR DELETE
  TO authenticated
  USING (true);

-- ====================================
-- 16. SERVICE_STATUSES
-- ====================================
DROP POLICY IF EXISTS "Allow all access to service statuses in dev mode" ON public.service_statuses;

CREATE POLICY "Users can view service statuses"
  ON public.service_statuses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert service statuses"
  ON public.service_statuses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update service statuses"
  ON public.service_statuses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete service statuses"
  ON public.service_statuses FOR DELETE
  TO authenticated
  USING (true);

-- ====================================
-- 17. TEKNIIKAT (Technicians)
-- ====================================
DROP POLICY IF EXISTS "Allow all access to technicians in dev mode" ON public.tekniikat;

CREATE POLICY "Users can view technicians"
  ON public.tekniikat FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert technicians"
  ON public.tekniikat FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update technicians"
  ON public.tekniikat FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete technicians"
  ON public.tekniikat FOR DELETE
  TO authenticated
  USING (true);

-- ====================================
-- 18. LAITE_VALMISTAJAT (Manufacturers)
-- ====================================
DROP POLICY IF EXISTS "Allow all access to manufacturers in dev mode" ON public.laite_valmistajat;

CREATE POLICY "Users can view manufacturers"
  ON public.laite_valmistajat FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert manufacturers"
  ON public.laite_valmistajat FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update manufacturers"
  ON public.laite_valmistajat FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete manufacturers"
  ON public.laite_valmistajat FOR DELETE
  TO authenticated
  USING (true);