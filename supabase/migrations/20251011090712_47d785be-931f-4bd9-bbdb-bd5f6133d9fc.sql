-- ========================================
-- VAIHE 3B: Korjaa hinnoittelu_asetukset RLS
-- Anna teknikoille READ-ONLY pääsy hinnoitteluihin
-- ========================================

-- Poista vanha "vain admin" SELECT policy
DROP POLICY IF EXISTS "Only admin can view pricing settings" ON public.hinnoittelu_asetukset;

-- Admin näkee hinnoittelut
CREATE POLICY "Admin can view pricing settings"
ON public.hinnoittelu_asetukset
FOR SELECT
TO authenticated
USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Teknikot näkevät hinnoittelut (READ-ONLY)
CREATE POLICY "Teknikko can view pricing settings"
ON public.hinnoittelu_asetukset
FOR SELECT
TO authenticated
USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'teknikko'::app_role)
);

-- INSERT/UPDATE/DELETE pysyy admin-only (olemassa oleva policy: "Only admin can manage pricing settings")