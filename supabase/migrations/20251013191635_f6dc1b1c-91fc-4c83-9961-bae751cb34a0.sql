-- Create licenses table for license key management
CREATE TABLE IF NOT EXISTS public.licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key text UNIQUE NOT NULL,
  is_used boolean DEFAULT false,
  company_id uuid,
  activated_at timestamp with time zone,
  activated_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  max_users integer DEFAULT 5,
  plan_type text DEFAULT 'basic' CHECK (plan_type IN ('basic', 'pro', 'enterprise')),
  notes text
);

-- Enable RLS
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- Anyone can check if a license key is valid (needed for signup)
CREATE POLICY "Anyone can validate unused licenses"
ON public.licenses
FOR SELECT
USING (is_used = false);

-- Users can view their own company license
CREATE POLICY "Users can view own company license"
ON public.licenses
FOR SELECT
USING (company_id IN (
  SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
));

-- Only admins can manage licenses
CREATE POLICY "Admins can manage licenses"
ON public.licenses
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Update handle_new_user function to validate and activate license
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  first_company_id uuid;
  provided_license_key text;
  license_record RECORD;
BEGIN
  -- Get license key from user metadata
  provided_license_key := NEW.raw_user_meta_data->>'license_key';
  
  -- Validate license key
  IF provided_license_key IS NULL OR provided_license_key = '' THEN
    RAISE EXCEPTION 'Lisenssinavain puuttuu';
  END IF;
  
  -- Check if license exists and is unused
  SELECT * INTO license_record
  FROM public.licenses
  WHERE license_key = provided_license_key
    AND is_used = false
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Virheellinen tai jo käytetty lisenssinavain';
  END IF;
  
  -- Check if license has expired
  IF license_record.expires_at IS NOT NULL AND license_record.expires_at < now() THEN
    RAISE EXCEPTION 'Lisenssinavain on vanhentunut';
  END IF;
  
  -- Create new company_id for this license
  first_company_id := gen_random_uuid();
  
  -- Mark license as used and link to company
  UPDATE public.licenses
  SET 
    is_used = true,
    company_id = first_company_id,
    activated_at = now(),
    activated_by = NEW.id
  WHERE license_key = provided_license_key;
  
  -- Insert profile with new company_id
  INSERT INTO public.profiles (user_id, email, full_name, company_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    first_company_id
  );
  
  -- First user with valid license gets admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin');
  
  RETURN NEW;
END;
$$;

-- Create function to check user count against license limit
CREATE OR REPLACE FUNCTION public.check_user_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  license_record RECORD;
  current_user_count INTEGER;
BEGIN
  -- Get license for this company
  SELECT * INTO license_record
  FROM public.licenses
  WHERE company_id = NEW.company_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lisenssiä ei löydy tälle yritykselle';
  END IF;
  
  -- Count current users in company
  SELECT COUNT(*) INTO current_user_count
  FROM public.profiles
  WHERE company_id = NEW.company_id;
  
  -- Check if limit exceeded
  IF current_user_count >= license_record.max_users THEN
    RAISE EXCEPTION 'Käyttäjämäärä ylitetty. Lisenssisi sallii enintään % käyttäjää', license_record.max_users;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add trigger to check user limit when new profiles are created
CREATE TRIGGER check_user_limit_on_profile_insert
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_user_limit();

-- Insert some example license keys for testing
INSERT INTO public.licenses (license_key, plan_type, max_users, notes)
VALUES 
  ('MOBILE-2024-DEMO0001', 'basic', 5, 'Demo license - Basic'),
  ('MOBILE-2024-PRO00001', 'pro', 20, 'Demo license - Pro'),
  ('MOBILE-2024-ENT00001', 'enterprise', 999, 'Demo license - Enterprise')
ON CONFLICT (license_key) DO NOTHING;