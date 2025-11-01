-- Drop old policy that only allows users to see their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create new policy that allows users to view all profiles within their company
CREATE POLICY "Users can view company profiles" ON public.profiles
FOR SELECT USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);