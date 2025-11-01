-- ========================================
-- VAIHE 3: RLS-päivitykset (Vaihtoehto B)
-- Teknikko näkee vain omat huollot
-- Vain admin näkee laskut ja hinnoittelut
-- ========================================

-- 1. HUOLLOT: Jaa SELECT-policy kolmeen osaan
-- ========================================

-- Poista vanha policy
DROP POLICY IF EXISTS "Users can view company services" ON public."Huollot";

-- Admin näkee kaikki yrityksen huollot
CREATE POLICY "Admins can view all company services"
ON public."Huollot"
FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Teknikko näkee vain omat huollot (missä teknikko_id = oma id)
CREATE POLICY "Technicians can view own services"
ON public."Huollot"
FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND has_role(auth.uid(), 'teknikko'::app_role)
  AND teknikko_id = auth.uid()
);

-- Käyttäjä näkee kaikki huollot (read-only)
CREATE POLICY "Users can view all company services"
ON public."Huollot"
FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND has_role(auth.uid(), 'kayttaja'::app_role)
);

-- ========================================
-- 2. LASKUTUS: Vain admin näkee laskut
-- ========================================

DROP POLICY IF EXISTS "Users can view company invoices" ON public.laskut;

CREATE POLICY "Only admin can view invoices"
ON public.laskut
FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- ========================================
-- 3. HINNOITTELU: Vain admin näkee hinnoittelut
-- ========================================

DROP POLICY IF EXISTS "Users can view company pricing settings" ON public.hinnoittelu_asetukset;

CREATE POLICY "Only admin can view pricing settings"
ON public.hinnoittelu_asetukset
FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND has_role(auth.uid(), 'admin'::app_role)
);