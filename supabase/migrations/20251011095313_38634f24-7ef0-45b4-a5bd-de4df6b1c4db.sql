-- Allow technicians to insert themselves into the tekniikat table
CREATE POLICY "Teknikko can insert self"
ON public.tekniikat
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND company_id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE user_id = auth.uid()
  )
  AND public.has_role(auth.uid(), 'teknikko'::app_role)
);