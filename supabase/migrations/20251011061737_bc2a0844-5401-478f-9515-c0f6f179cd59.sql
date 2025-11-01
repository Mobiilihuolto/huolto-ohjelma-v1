-- Step 1: Add company_id to profiles table
ALTER TABLE public.profiles ADD COLUMN company_id uuid;

-- Step 2: Create a company_id for the first user (admin) and assign it to all existing users
DO $$
DECLARE
  first_company_id uuid;
BEGIN
  -- Generate a new company_id
  first_company_id := gen_random_uuid();
  
  -- Set this company_id for all existing profiles
  UPDATE public.profiles SET company_id = first_company_id WHERE company_id IS NULL;
END $$;

-- Step 3: Make company_id NOT NULL now that all rows have a value
ALTER TABLE public.profiles ALTER COLUMN company_id SET NOT NULL;

-- Step 4: Add company_id to all data tables
ALTER TABLE public.asiakkaat ADD COLUMN company_id uuid;
ALTER TABLE public."Laitteet" ADD COLUMN company_id uuid;
ALTER TABLE public."Huollot" ADD COLUMN company_id uuid;
ALTER TABLE public.laskut ADD COLUMN company_id uuid;
ALTER TABLE public.varaosat ADD COLUMN company_id uuid;
ALTER TABLE public.huolto_varaosat ADD COLUMN company_id uuid;
ALTER TABLE public.yrityksen_asetukset ADD COLUMN company_id uuid;
ALTER TABLE public.alv_asetukset ADD COLUMN company_id uuid;
ALTER TABLE public.hinnoittelu_asetukset ADD COLUMN company_id uuid;
ALTER TABLE public.takuu_asetukset ADD COLUMN company_id uuid;
ALTER TABLE public.lasku_asetukset ADD COLUMN company_id uuid;
ALTER TABLE public.numerointi_asetukset ADD COLUMN company_id uuid;
ALTER TABLE public.ilmoitus_asetukset ADD COLUMN company_id uuid;
ALTER TABLE public.varasto_asetukset ADD COLUMN company_id uuid;
ALTER TABLE public.maksutavat ADD COLUMN company_id uuid;
ALTER TABLE public.laite_valmistajat ADD COLUMN company_id uuid;
ALTER TABLE public.service_statuses ADD COLUMN company_id uuid;
ALTER TABLE public.tekniikat ADD COLUMN company_id uuid;

-- Step 5: Migrate existing data - set company_id based on user_id
UPDATE public.asiakkaat SET company_id = (SELECT company_id FROM public.profiles WHERE user_id = asiakkaat.user_id LIMIT 1) WHERE company_id IS NULL;
UPDATE public."Laitteet" SET company_id = (SELECT company_id FROM public.profiles WHERE user_id = "Laitteet".user_id LIMIT 1) WHERE company_id IS NULL;
UPDATE public."Huollot" SET company_id = (SELECT company_id FROM public.profiles WHERE user_id = "Huollot".user_id LIMIT 1) WHERE company_id IS NULL;
UPDATE public.laskut SET company_id = (SELECT company_id FROM public.profiles WHERE user_id = laskut.user_id LIMIT 1) WHERE company_id IS NULL;
UPDATE public.varaosat SET company_id = (SELECT company_id FROM public.profiles WHERE user_id = varaosat.user_id LIMIT 1) WHERE company_id IS NULL;
UPDATE public.yrityksen_asetukset SET company_id = (SELECT company_id FROM public.profiles WHERE user_id = yrityksen_asetukset.user_id LIMIT 1) WHERE company_id IS NULL;
UPDATE public.alv_asetukset SET company_id = (SELECT company_id FROM public.profiles WHERE user_id = alv_asetukset.user_id LIMIT 1) WHERE company_id IS NULL;
UPDATE public.hinnoittelu_asetukset SET company_id = (SELECT company_id FROM public.profiles WHERE user_id = hinnoittelu_asetukset.user_id LIMIT 1) WHERE company_id IS NULL;
UPDATE public.takuu_asetukset SET company_id = (SELECT company_id FROM public.profiles WHERE user_id = takuu_asetukset.user_id LIMIT 1) WHERE company_id IS NULL;
UPDATE public.lasku_asetukset SET company_id = (SELECT company_id FROM public.profiles WHERE user_id = lasku_asetukset.user_id LIMIT 1) WHERE company_id IS NULL;
UPDATE public.numerointi_asetukset SET company_id = (SELECT company_id FROM public.profiles WHERE user_id = numerointi_asetukset.user_id LIMIT 1) WHERE company_id IS NULL;
UPDATE public.ilmoitus_asetukset SET company_id = (SELECT company_id FROM public.profiles WHERE user_id = ilmoitus_asetukset.user_id LIMIT 1) WHERE company_id IS NULL;
UPDATE public.varasto_asetukset SET company_id = (SELECT company_id FROM public.profiles WHERE user_id = varasto_asetukset.user_id LIMIT 1) WHERE company_id IS NULL;
UPDATE public.maksutavat SET company_id = (SELECT company_id FROM public.profiles WHERE user_id = maksutavat.user_id LIMIT 1) WHERE company_id IS NULL;
UPDATE public.laite_valmistajat SET company_id = (SELECT company_id FROM public.profiles WHERE user_id = laite_valmistajat.user_id LIMIT 1) WHERE company_id IS NULL;
UPDATE public.service_statuses SET company_id = (SELECT company_id FROM public.profiles WHERE user_id = service_statuses.user_id LIMIT 1) WHERE company_id IS NULL;
UPDATE public.tekniikat SET company_id = (SELECT company_id FROM public.profiles WHERE user_id = tekniikat.user_id LIMIT 1) WHERE company_id IS NULL;

-- huolto_varaosat needs special handling since it doesn't have user_id
UPDATE public.huolto_varaosat SET company_id = (
  SELECT company_id FROM public."Huollot" WHERE "Huollot".id = huolto_varaosat.huolto_id LIMIT 1
) WHERE company_id IS NULL;

-- Step 6: Make company_id NOT NULL on all tables
ALTER TABLE public.asiakkaat ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public."Laitteet" ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public."Huollot" ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.laskut ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.varaosat ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.huolto_varaosat ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.yrityksen_asetukset ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.alv_asetukset ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.hinnoittelu_asetukset ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.takuu_asetukset ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.lasku_asetukset ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.numerointi_asetukset ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.ilmoitus_asetukset ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.varasto_asetukset ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.maksutavat ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.laite_valmistajat ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.service_statuses ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.tekniikat ALTER COLUMN company_id SET NOT NULL;

-- Step 7: Drop old RLS policies and create new company-based ones

-- ASIAKKAAT
DROP POLICY IF EXISTS "Users can view own customers" ON public.asiakkaat;
DROP POLICY IF EXISTS "Users can insert own customers" ON public.asiakkaat;
DROP POLICY IF EXISTS "Users can update own customers" ON public.asiakkaat;
DROP POLICY IF EXISTS "Users can delete own customers" ON public.asiakkaat;

CREATE POLICY "Users can view company customers" ON public.asiakkaat
FOR SELECT USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Admin and teknikko can insert customers" ON public.asiakkaat
FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teknikko'::app_role))
);

CREATE POLICY "Admin and teknikko can update customers" ON public.asiakkaat
FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teknikko'::app_role))
);

CREATE POLICY "Only admin can delete customers" ON public.asiakkaat
FOR DELETE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- LAITTEET
DROP POLICY IF EXISTS "Users can view own devices" ON public."Laitteet";
DROP POLICY IF EXISTS "Users can insert own devices" ON public."Laitteet";
DROP POLICY IF EXISTS "Users can update own devices" ON public."Laitteet";
DROP POLICY IF EXISTS "Users can delete own devices" ON public."Laitteet";

CREATE POLICY "Users can view company devices" ON public."Laitteet"
FOR SELECT USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Admin and teknikko can insert devices" ON public."Laitteet"
FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teknikko'::app_role))
);

CREATE POLICY "Admin and teknikko can update devices" ON public."Laitteet"
FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teknikko'::app_role))
);

CREATE POLICY "Only admin can delete devices" ON public."Laitteet"
FOR DELETE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- HUOLLOT
DROP POLICY IF EXISTS "Users can view own services" ON public."Huollot";
DROP POLICY IF EXISTS "Users can insert own services" ON public."Huollot";
DROP POLICY IF EXISTS "Users can update own services" ON public."Huollot";
DROP POLICY IF EXISTS "Users can delete own services" ON public."Huollot";

CREATE POLICY "Users can view company services" ON public."Huollot"
FOR SELECT USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Admin and teknikko can insert services" ON public."Huollot"
FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teknikko'::app_role))
);

CREATE POLICY "Admin and teknikko can update services" ON public."Huollot"
FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teknikko'::app_role))
);

CREATE POLICY "Only admin can delete services" ON public."Huollot"
FOR DELETE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- LASKUT
DROP POLICY IF EXISTS "Users can view own invoices" ON public.laskut;
DROP POLICY IF EXISTS "Users can insert own invoices" ON public.laskut;
DROP POLICY IF EXISTS "Users can update own invoices" ON public.laskut;
DROP POLICY IF EXISTS "Users can delete own invoices" ON public.laskut;

CREATE POLICY "Users can view company invoices" ON public.laskut
FOR SELECT USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Only admin can insert invoices" ON public.laskut
FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only admin can update invoices" ON public.laskut
FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only admin can delete invoices" ON public.laskut
FOR DELETE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- VARAOSAT
DROP POLICY IF EXISTS "Users can view own parts" ON public.varaosat;
DROP POLICY IF EXISTS "Users can insert own parts" ON public.varaosat;
DROP POLICY IF EXISTS "Users can update own parts" ON public.varaosat;
DROP POLICY IF EXISTS "Users can delete own parts" ON public.varaosat;

CREATE POLICY "Users can view company parts" ON public.varaosat
FOR SELECT USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Admin and teknikko can insert parts" ON public.varaosat
FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teknikko'::app_role))
);

CREATE POLICY "Admin and teknikko can update parts" ON public.varaosat
FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teknikko'::app_role))
);

CREATE POLICY "Only admin can delete parts" ON public.varaosat
FOR DELETE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- HUOLTO_VARAOSAT (special: uses Huollot table for company_id check)
DROP POLICY IF EXISTS "Users can view service parts" ON public.huolto_varaosat;
DROP POLICY IF EXISTS "Users can insert service parts" ON public.huolto_varaosat;
DROP POLICY IF EXISTS "Users can update service parts" ON public.huolto_varaosat;
DROP POLICY IF EXISTS "Users can delete service parts" ON public.huolto_varaosat;

CREATE POLICY "Users can view company service parts" ON public.huolto_varaosat
FOR SELECT USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Admin and teknikko can insert service parts" ON public.huolto_varaosat
FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teknikko'::app_role))
);

CREATE POLICY "Admin and teknikko can update service parts" ON public.huolto_varaosat
FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teknikko'::app_role))
);

CREATE POLICY "Admin and teknikko can delete service parts" ON public.huolto_varaosat
FOR DELETE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teknikko'::app_role))
);

-- SETTINGS TABLES (all follow same pattern)
-- yrityksen_asetukset
DROP POLICY IF EXISTS "Users can view own company settings" ON public.yrityksen_asetukset;
DROP POLICY IF EXISTS "Users can insert own company settings" ON public.yrityksen_asetukset;
DROP POLICY IF EXISTS "Users can update own company settings" ON public.yrityksen_asetukset;
DROP POLICY IF EXISTS "Users can delete own company settings" ON public.yrityksen_asetukset;

CREATE POLICY "Users can view company settings" ON public.yrityksen_asetukset
FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage company settings" ON public.yrityksen_asetukset
FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- alv_asetukset
DROP POLICY IF EXISTS "Users can view own VAT settings" ON public.alv_asetukset;
DROP POLICY IF EXISTS "Users can insert own VAT settings" ON public.alv_asetukset;
DROP POLICY IF EXISTS "Users can update own VAT settings" ON public.alv_asetukset;
DROP POLICY IF EXISTS "Users can delete own VAT settings" ON public.alv_asetukset;

CREATE POLICY "Users can view company VAT settings" ON public.alv_asetukset
FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage VAT settings" ON public.alv_asetukset
FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- hinnoittelu_asetukset
DROP POLICY IF EXISTS "Users can view own pricing settings" ON public.hinnoittelu_asetukset;
DROP POLICY IF EXISTS "Users can insert own pricing settings" ON public.hinnoittelu_asetukset;
DROP POLICY IF EXISTS "Users can update own pricing settings" ON public.hinnoittelu_asetukset;
DROP POLICY IF EXISTS "Users can delete own pricing settings" ON public.hinnoittelu_asetukset;

CREATE POLICY "Users can view company pricing settings" ON public.hinnoittelu_asetukset
FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage pricing settings" ON public.hinnoittelu_asetukset
FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- takuu_asetukset
DROP POLICY IF EXISTS "Users can view own warranty settings" ON public.takuu_asetukset;
DROP POLICY IF EXISTS "Users can insert own warranty settings" ON public.takuu_asetukset;
DROP POLICY IF EXISTS "Users can update own warranty settings" ON public.takuu_asetukset;
DROP POLICY IF EXISTS "Users can delete own warranty settings" ON public.takuu_asetukset;

CREATE POLICY "Users can view company warranty settings" ON public.takuu_asetukset
FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage warranty settings" ON public.takuu_asetukset
FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- lasku_asetukset
DROP POLICY IF EXISTS "Users can view own invoice settings" ON public.lasku_asetukset;
DROP POLICY IF EXISTS "Users can insert own invoice settings" ON public.lasku_asetukset;
DROP POLICY IF EXISTS "Users can update own invoice settings" ON public.lasku_asetukset;
DROP POLICY IF EXISTS "Users can delete own invoice settings" ON public.lasku_asetukset;

CREATE POLICY "Users can view company invoice settings" ON public.lasku_asetukset
FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage invoice settings" ON public.lasku_asetukset
FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- numerointi_asetukset
DROP POLICY IF EXISTS "Users can view own numbering settings" ON public.numerointi_asetukset;
DROP POLICY IF EXISTS "Users can insert own numbering settings" ON public.numerointi_asetukset;
DROP POLICY IF EXISTS "Users can update own numbering settings" ON public.numerointi_asetukset;
DROP POLICY IF EXISTS "Users can delete own numbering settings" ON public.numerointi_asetukset;

CREATE POLICY "Users can view company numbering settings" ON public.numerointi_asetukset
FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage numbering settings" ON public.numerointi_asetukset
FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- ilmoitus_asetukset
DROP POLICY IF EXISTS "Users can view own notification settings" ON public.ilmoitus_asetukset;
DROP POLICY IF EXISTS "Users can insert own notification settings" ON public.ilmoitus_asetukset;
DROP POLICY IF EXISTS "Users can update own notification settings" ON public.ilmoitus_asetukset;
DROP POLICY IF EXISTS "Users can delete own notification settings" ON public.ilmoitus_asetukset;

CREATE POLICY "Users can view company notification settings" ON public.ilmoitus_asetukset
FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage notification settings" ON public.ilmoitus_asetukset
FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- varasto_asetukset
DROP POLICY IF EXISTS "Users can view own inventory settings" ON public.varasto_asetukset;
DROP POLICY IF EXISTS "Users can insert own inventory settings" ON public.varasto_asetukset;
DROP POLICY IF EXISTS "Users can update own inventory settings" ON public.varasto_asetukset;
DROP POLICY IF EXISTS "Users can delete own inventory settings" ON public.varasto_asetukset;

CREATE POLICY "Users can view company inventory settings" ON public.varasto_asetukset
FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage inventory settings" ON public.varasto_asetukset
FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- maksutavat
DROP POLICY IF EXISTS "Users can view own payment methods" ON public.maksutavat;
DROP POLICY IF EXISTS "Users can insert own payment methods" ON public.maksutavat;
DROP POLICY IF EXISTS "Users can update own payment methods" ON public.maksutavat;
DROP POLICY IF EXISTS "Users can delete own payment methods" ON public.maksutavat;

CREATE POLICY "Users can view company payment methods" ON public.maksutavat
FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage payment methods" ON public.maksutavat
FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- laite_valmistajat
DROP POLICY IF EXISTS "Users can view own manufacturers" ON public.laite_valmistajat;
DROP POLICY IF EXISTS "Users can insert own manufacturers" ON public.laite_valmistajat;
DROP POLICY IF EXISTS "Users can update own manufacturers" ON public.laite_valmistajat;
DROP POLICY IF EXISTS "Users can delete own manufacturers" ON public.laite_valmistajat;

CREATE POLICY "Users can view company manufacturers" ON public.laite_valmistajat
FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage manufacturers" ON public.laite_valmistajat
FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- service_statuses
DROP POLICY IF EXISTS "Users can view own service statuses" ON public.service_statuses;
DROP POLICY IF EXISTS "Users can insert own service statuses" ON public.service_statuses;
DROP POLICY IF EXISTS "Users can update own service statuses" ON public.service_statuses;
DROP POLICY IF EXISTS "Users can delete own service statuses" ON public.service_statuses;

CREATE POLICY "Users can view company service statuses" ON public.service_statuses
FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage service statuses" ON public.service_statuses
FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- tekniikat
DROP POLICY IF EXISTS "Users can view own technicians" ON public.tekniikat;
DROP POLICY IF EXISTS "Users can insert own technicians" ON public.tekniikat;
DROP POLICY IF EXISTS "Users can update own technicians" ON public.tekniikat;
DROP POLICY IF EXISTS "Users can delete own technicians" ON public.tekniikat;

CREATE POLICY "Users can view company technicians" ON public.tekniikat
FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Only admin can manage technicians" ON public.tekniikat
FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Step 8: Create helper function to get user's company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Step 9: Update handle_new_user trigger to assign company_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  first_company_id uuid;
BEGIN
  -- Check if this is the first user (will be admin)
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    -- First user: create new company_id
    first_company_id := gen_random_uuid();
    
    -- Insert profile with new company_id
    INSERT INTO public.profiles (user_id, email, full_name, company_id)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      first_company_id
    );
    
    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    -- Subsequent users: use existing company_id from first admin
    SELECT company_id INTO first_company_id 
    FROM public.profiles 
    WHERE user_id IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
    LIMIT 1;
    
    -- Insert profile with existing company_id
    INSERT INTO public.profiles (user_id, email, full_name, company_id)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      first_company_id
    );
    
    -- Assign kayttaja role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'kayttaja');
  END IF;
  
  RETURN NEW;
END;
$$;