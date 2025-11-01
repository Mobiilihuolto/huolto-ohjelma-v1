-- Update RLS policies for laskut table to allow teknikko role

-- Drop old policies
DROP POLICY IF EXISTS "Only admin can view invoices" ON public.laskut;
DROP POLICY IF EXISTS "Only admin can insert invoices" ON public.laskut;
DROP POLICY IF EXISTS "Only admin can update invoices" ON public.laskut;
DROP POLICY IF EXISTS "Only admin can delete invoices" ON public.laskut;

-- Create new policies allowing both admin and teknikko
CREATE POLICY "Admin and teknikko can view invoices"
ON public.laskut
FOR SELECT
USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teknikko'::app_role))
);

CREATE POLICY "Admin and teknikko can insert invoices"
ON public.laskut
FOR INSERT
WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teknikko'::app_role))
);

CREATE POLICY "Admin and teknikko can update invoices"
ON public.laskut
FOR UPDATE
USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teknikko'::app_role))
);

CREATE POLICY "Only admin can delete invoices"
ON public.laskut
FOR DELETE
USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);