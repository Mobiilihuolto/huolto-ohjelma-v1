-- Create security definer function to check if users are in same company
CREATE OR REPLACE FUNCTION public.user_in_same_company(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p1
    CROSS JOIN public.profiles p2
    WHERE p1.user_id = auth.uid()
      AND p2.user_id = _user_id
      AND p1.company_id = p2.company_id
  )
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- Recreate policies with company check
CREATE POLICY "Admins can insert roles" ON public.user_roles
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND user_in_same_company(user_id)
);

CREATE POLICY "Admins can update roles" ON public.user_roles
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND user_in_same_company(user_id)
);

CREATE POLICY "Admins can delete roles" ON public.user_roles
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND user_in_same_company(user_id)
);