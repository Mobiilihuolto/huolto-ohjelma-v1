-- Fix infinite recursion in profiles RLS policy
-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view company profiles" ON public.profiles;

-- Create new policy using the existing get_user_company_id() security definer function
-- This prevents recursion because the function bypasses RLS
CREATE POLICY "Users can view company profiles" ON public.profiles
FOR SELECT USING (
  company_id = get_user_company_id()
);