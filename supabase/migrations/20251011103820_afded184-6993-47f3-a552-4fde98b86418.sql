-- Poistetaan vanha käytäntö joka antoi kaikille pääsyn
DROP POLICY IF EXISTS "Users can view company customers" ON public.asiakkaat;

-- Luodaan uusi käytäntö: vain admin ja teknikko voivat nähdä asiakastiedot
CREATE POLICY "Admin and teknikko can view customers"
ON public.asiakkaat
FOR SELECT
USING (
  company_id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE user_id = auth.uid()
  )
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'teknikko'::app_role)
  )
);