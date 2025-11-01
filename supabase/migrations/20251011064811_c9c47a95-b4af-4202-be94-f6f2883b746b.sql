-- Drop existing policies first
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Now drop old function
DROP FUNCTION IF EXISTS public.user_in_same_company(uuid);

-- Create new function that takes both user_ids as parameters
CREATE OR REPLACE FUNCTION public.user_in_same_company(_user_id_1 uuid, _user_id_2 uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p1
    JOIN public.profiles p2 ON p1.company_id = p2.company_id
    WHERE p1.user_id = _user_id_1
      AND p2.user_id = _user_id_2
  )
$$;

-- Recreate INSERT/UPDATE/DELETE policies with corrected function
CREATE POLICY "Admins can insert roles" ON public.user_roles
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND user_in_same_company(auth.uid(), user_id)
);

CREATE POLICY "Admins can update roles" ON public.user_roles
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND user_in_same_company(auth.uid(), user_id)
);

CREATE POLICY "Admins can delete roles" ON public.user_roles
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND user_in_same_company(auth.uid(), user_id)
);

-- Create SELECT policies
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view company roles" ON public.user_roles
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND user_in_same_company(auth.uid(), user_id)
);