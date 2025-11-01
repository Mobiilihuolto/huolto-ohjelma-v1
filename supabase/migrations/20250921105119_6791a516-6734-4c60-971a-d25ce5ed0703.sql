-- Temporarily modify RLS policies to allow development mode access

-- Drop existing policies for asiakkaat table
DROP POLICY IF EXISTS "Users can view own customers" ON public.asiakkaat;
DROP POLICY IF EXISTS "Users can insert own customers" ON public.asiakkaat;
DROP POLICY IF EXISTS "Users can update own customers" ON public.asiakkaat;
DROP POLICY IF EXISTS "Users can delete own customers" ON public.asiakkaat;

-- Create new permissive policies for asiakkaat table (development mode)
CREATE POLICY "Allow all access to customers in dev mode" 
ON public.asiakkaat 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Drop existing policies for Laitteet table (with correct case)
DROP POLICY IF EXISTS "Users can view own devices" ON public."Laitteet";
DROP POLICY IF EXISTS "Users can insert own devices" ON public."Laitteet";
DROP POLICY IF EXISTS "Users can update own devices" ON public."Laitteet";
DROP POLICY IF EXISTS "Users can delete own devices" ON public."Laitteet";

-- Create new permissive policies for Laitteet table (development mode)
CREATE POLICY "Allow all access to devices in dev mode" 
ON public."Laitteet"
FOR ALL 
USING (true)
WITH CHECK (true);

-- Drop existing policies for Huollot table (with correct case)
DROP POLICY IF EXISTS "Users can view own services" ON public."Huollot";
DROP POLICY IF EXISTS "Users can insert own services" ON public."Huollot";
DROP POLICY IF EXISTS "Users can update own services" ON public."Huollot";
DROP POLICY IF EXISTS "Users can delete own services" ON public."Huollot";

-- Create new permissive policies for Huollot table (development mode)
CREATE POLICY "Allow all access to services in dev mode" 
ON public."Huollot"
FOR ALL 
USING (true)
WITH CHECK (true);