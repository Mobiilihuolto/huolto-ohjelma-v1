/*
  # Master Database Migration - Service Management System

  This migration creates the complete database schema for a service management system
  with multi-company support, user roles, invoicing, inventory, and warranty tracking.

  ## 1. Core Tables

  ### profiles
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `company_id` (uuid, references yritykset)
  - `email` (text)
  - `full_name` (text)
  - `role` (text, default 'user')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### yritykset (companies)
  - `id` (uuid, primary key)
  - `nimi` (text, company name)
  - `y_tunnus` (text, business ID)
  - `osoite` (text)
  - Other company details

  ### asiakkaat (customers)
  - `id` (uuid, primary key)
  - `company_id` (uuid)
  - `user_id` (uuid)
  - `numero` (text, auto-generated)
  - `nimi` (text, customer name)
  - Contact information

  ### Laitteet (devices)
  - `id` (uuid, primary key)
  - `company_id` (uuid)
  - `asiakas_id` (uuid, references asiakkaat)
  - Device details (brand, model, serial)

  ### Huollot (services)
  - `id` (uuid, primary key)
  - `company_id` (uuid)
  - `asiakas_id` (uuid)
  - `laite_id` (uuid)
  - `teknikko_id` (uuid)
  - Service details, status, pricing
  - Time tracking

  ## 2. Settings Tables

  - `yrityksen_asetukset` - Company settings
  - `lasku_asetukset` - Invoice settings
  - `numerointi_asetukset` - Numbering settings for customers, services, invoices
  - `hinnoittelu_asetukset` - Pricing settings
  - `takuu_asetukset` - Warranty settings
  - `varasto_asetukset` - Inventory settings
  - `ilmoitus_asetukset` - Notification settings
  - `alv_asetukset` - VAT settings
  - `service_statuses` - Custom service statuses
  - `maksutavat` - Payment methods
  - `laite_valmistajat` - Device manufacturers

  ## 3. Operational Tables

  - `laskut` - Invoices
  - `varaosat` - Spare parts inventory
  - `huolto_varaosat` - Service-parts relationship
  - `tekniikat` - Technicians
  - `user_roles` - User role assignments
  - `licenses` - License management

  ## 4. Security

  - RLS enabled on all tables
  - Company-based data isolation
  - Role-based access control (admin, teknikko, kayttaja)
  - Policies for authenticated users

  ## 5. Automation

  - Auto-numbering for customers, services, invoices
  - Automatic timestamp updates
  - User profile creation trigger
  - Role assignment for new users
*/

-- ============================================================================
-- 1. CUSTOM TYPES
-- ============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'teknikko', 'kayttaja');
  END IF;
END $$;

-- ============================================================================
-- 2. CORE TABLES
-- ============================================================================

-- Companies table
CREATE TABLE IF NOT EXISTS public.yritykset (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nimi text NOT NULL,
  y_tunnus text,
  alv_numero text,
  osoite text,
  postinumero text,
  postitoimipaikka text,
  puhelin text,
  email text,
  verkkosivut text,
  logo_url text,
  pankkitili text,
  bic text,
  viitteen_prefiksi text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES public.yritykset(id) ON DELETE CASCADE,
  email text,
  full_name text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- User roles table (for granular role management)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Customers table
CREATE TABLE IF NOT EXISTS public.asiakkaat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.yritykset(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  numero text,
  nimi text NOT NULL,
  tyyppi text,
  yrityksen_nimi text,
  y_tunnus text,
  alv_numero text,
  osoite text,
  puhelin text,
  email text,
  yksityiset_muistiinpanot text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Devices table
CREATE TABLE IF NOT EXISTS public.Laitteet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.yritykset(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  asiakas_id uuid REFERENCES public.asiakkaat(id) ON DELETE CASCADE,
  merkki text,
  malli text,
  sarjanumero text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Services table
CREATE TABLE IF NOT EXISTS public.Huollot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.yritykset(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  asiakas_id uuid REFERENCES public.asiakkaat(id) ON DELETE CASCADE,
  laite_id uuid REFERENCES public.Laitteet(id) ON DELETE SET NULL,
  teknikko_id uuid,
  numero text,
  merkki text,
  malli text,
  sarjanumero text,
  kuvaus text,
  status text DEFAULT 'odottaa' NOT NULL,
  hinnoittelu_tyyppi text DEFAULT 'tuntiveloitus',
  hinnoittelu_nimi text,
  tuntihinta numeric,
  kiintea_hinta numeric,
  tyoaika_minuutit integer DEFAULT 0,
  arvioitu_tyoaika_minuutit integer,
  arvioitu_valmistumispvm date,
  ajanlaskuri_kaynnissa boolean DEFAULT false,
  ajanlaskuri_aloitettu_pvm timestamptz,
  tyotakuu_kuukautta integer,
  osatakuu_kuukautta integer,
  teknikon_muistiinpanot text,
  asiakas_allekirjoitus text,
  teknikko_allekirjoitus text,
  valmistunut_pvm timestamptz,
  luovutettu_pvm timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- 3. SETTINGS TABLES
-- ============================================================================

-- Company settings
CREATE TABLE IF NOT EXISTS public.yrityksen_asetukset (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.yritykset(id) ON DELETE CASCADE NOT NULL UNIQUE,
  oletusviesti_huoltolomakkeelle text,
  oletus_maksuehto_paivat integer DEFAULT 14,
  oletus_alv_prosentti numeric DEFAULT 24,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Invoice settings
CREATE TABLE IF NOT EXISTS public.lasku_asetukset (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.yritykset(id) ON DELETE CASCADE NOT NULL UNIQUE,
  maksuehto_paivat integer DEFAULT 14,
  viivastyskorko numeric DEFAULT 8,
  muistutuskulut numeric DEFAULT 5,
  perintakulut numeric DEFAULT 0,
  lisatiedot text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Numbering settings
CREATE TABLE IF NOT EXISTS public.numerointi_asetukset (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.yritykset(id) ON DELETE CASCADE,
  tyyppi text NOT NULL CHECK (tyyppi IN ('asiakas', 'huolto', 'lasku')),
  prefiksi text DEFAULT '',
  vuosi_formaatti text DEFAULT 'YYYY',
  numeron_pituus integer DEFAULT 4,
  seuraava_numero integer DEFAULT 1,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (company_id, tyyppi)
);

-- Pricing settings
CREATE TABLE IF NOT EXISTS public.hinnoittelu_asetukset (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.yritykset(id) ON DELETE CASCADE NOT NULL,
  nimi text NOT NULL,
  tyyppi text NOT NULL CHECK (tyyppi IN ('tuntiveloitus', 'kiintea')),
  tuntihinta numeric,
  kiintea_hinta numeric,
  kuvaus text,
  is_active boolean DEFAULT true NOT NULL,
  jarjestys integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Warranty settings
CREATE TABLE IF NOT EXISTS public.takuu_asetukset (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.yritykset(id) ON DELETE CASCADE NOT NULL UNIQUE,
  oletus_tyotakuu_kuukautta integer DEFAULT 3,
  oletus_osatakuu_kuukautta integer DEFAULT 12,
  takuuteksti text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Inventory settings
CREATE TABLE IF NOT EXISTS public.varasto_asetukset (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.yritykset(id) ON DELETE CASCADE NOT NULL UNIQUE,
  ilmoita_alhaisesta_saldosta boolean DEFAULT true,
  minimisaldon_kerroin numeric DEFAULT 1.0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Notification settings
CREATE TABLE IF NOT EXISTS public.ilmoitus_asetukset (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.yritykset(id) ON DELETE CASCADE NOT NULL UNIQUE,
  laheta_huolto_valmis_email boolean DEFAULT true,
  laheta_lasku_email boolean DEFAULT true,
  laheta_myohastynyt_lasku_email boolean DEFAULT false,
  myohastynyt_lasku_email_paivat integer DEFAULT 7,
  laheta_matala_varasto_email boolean DEFAULT true,
  email_osoite text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- VAT settings
CREATE TABLE IF NOT EXISTS public.alv_asetukset (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.yritykset(id) ON DELETE CASCADE NOT NULL,
  nimi text NOT NULL,
  prosentti numeric NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Service statuses
CREATE TABLE IF NOT EXISTS public.service_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.yritykset(id) ON DELETE CASCADE NOT NULL,
  nimi text NOT NULL,
  vari text DEFAULT '#6366f1',
  jarjestys integer DEFAULT 0,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Payment methods
CREATE TABLE IF NOT EXISTS public.maksutavat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.yritykset(id) ON DELETE CASCADE NOT NULL,
  nimi text NOT NULL,
  kuvaus text,
  is_active boolean DEFAULT true NOT NULL,
  jarjestys integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Device manufacturers
CREATE TABLE IF NOT EXISTS public.laite_valmistajat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.yritykset(id) ON DELETE CASCADE NOT NULL,
  nimi text NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- 4. OPERATIONAL TABLES
-- ============================================================================

-- Invoices
CREATE TABLE IF NOT EXISTS public.laskut (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.yritykset(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  numero text,
  huolto_id uuid REFERENCES public.Huollot(id) ON DELETE SET NULL,
  asiakas_id uuid REFERENCES public.asiakkaat(id) ON DELETE CASCADE NOT NULL,
  laskun_pvm date DEFAULT CURRENT_DATE NOT NULL,
  erapaiva date DEFAULT (CURRENT_DATE + INTERVAL '14 days') NOT NULL,
  rivit jsonb DEFAULT '[]'::jsonb NOT NULL,
  alv_prosentti numeric DEFAULT 24,
  summa_ilman_alvia numeric DEFAULT 0 NOT NULL,
  alv_summa numeric DEFAULT 0 NOT NULL,
  kokonaissumma numeric DEFAULT 0 NOT NULL,
  status text DEFAULT 'lahetetty' NOT NULL CHECK (status IN ('luonnos', 'lahetetty', 'maksettu', 'myohassa', 'peruutettu')),
  maksettu_pvm date,
  maksuehto_paivat integer DEFAULT 14,
  asiakas_nimi text NOT NULL,
  asiakas_osoite text,
  asiakas_email text,
  asiakas_puhelin text,
  asiakas_y_tunnus text,
  huomautukset text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Spare parts
CREATE TABLE IF NOT EXISTS public.varaosat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.yritykset(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  nimi text NOT NULL,
  kuvaus text,
  tuotekoodi text,
  kategoria text,
  toimittaja text,
  yksikko text DEFAULT 'kpl',
  hinta numeric DEFAULT 0 NOT NULL,
  kustannushinta numeric,
  sisaltaa_alv boolean DEFAULT false,
  saldo integer DEFAULT 0 NOT NULL,
  minimisaldo integer DEFAULT 0,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Service-parts relationship
CREATE TABLE IF NOT EXISTS public.huolto_varaosat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  huolto_id uuid REFERENCES public.Huollot(id) ON DELETE CASCADE NOT NULL,
  varaosa_id uuid REFERENCES public.varaosat(id) ON DELETE CASCADE NOT NULL,
  maara integer DEFAULT 1 NOT NULL,
  yksikkohinta numeric NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Technicians
CREATE TABLE IF NOT EXISTS public.tekniikat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.yritykset(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  nimi text NOT NULL,
  email text,
  puhelin text,
  erikoisosaaminen text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Licenses
CREATE TABLE IF NOT EXISTS public.licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key text UNIQUE NOT NULL,
  company_id uuid REFERENCES public.yritykset(id) ON DELETE SET NULL,
  plan_type text DEFAULT 'basic',
  max_users integer DEFAULT 5,
  is_used boolean DEFAULT false,
  activated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  activated_at timestamptz,
  expires_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- 5. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_asiakkaat_company_id ON public.asiakkaat(company_id);
CREATE INDEX IF NOT EXISTS idx_laitteet_company_id ON public.Laitteet(company_id);
CREATE INDEX IF NOT EXISTS idx_laitteet_asiakas_id ON public.Laitteet(asiakas_id);
CREATE INDEX IF NOT EXISTS idx_huollot_company_id ON public.Huollot(company_id);
CREATE INDEX IF NOT EXISTS idx_huollot_asiakas_id ON public.Huollot(asiakas_id);
CREATE INDEX IF NOT EXISTS idx_huollot_status ON public.Huollot(status);
CREATE INDEX IF NOT EXISTS idx_laskut_company_id ON public.laskut(company_id);
CREATE INDEX IF NOT EXISTS idx_laskut_status ON public.laskut(status);
CREATE INDEX IF NOT EXISTS idx_varaosat_company_id ON public.varaosat(company_id);

-- ============================================================================
-- 6. FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to generate next number for auto-numbering
CREATE OR REPLACE FUNCTION public.generate_next_number(_tyyppi text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  settings_rec RECORD;
  next_num INTEGER;
  year_str TEXT;
  padded_num TEXT;
  final_number TEXT;
BEGIN
  -- Get the current company_id from profiles
  SELECT company_id INTO settings_rec
  FROM public.profiles
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF settings_rec.company_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Get numbering settings
  SELECT * INTO settings_rec
  FROM public.numerointi_asetukset
  WHERE tyyppi = _tyyppi
    AND company_id = settings_rec.company_id
    AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Get next number and increment
  next_num := settings_rec.seuraava_numero;

  UPDATE public.numerointi_asetukset
  SET seuraava_numero = seuraava_numero + 1
  WHERE id = settings_rec.id;

  -- Format year based on format setting
  IF settings_rec.vuosi_formaatti = 'YYYY' THEN
    year_str := TO_CHAR(CURRENT_DATE, 'YYYY');
  ELSIF settings_rec.vuosi_formaatti = 'YY' THEN
    year_str := TO_CHAR(CURRENT_DATE, 'YY');
  ELSE
    year_str := '';
  END IF;

  -- Pad number with zeros
  padded_num := LPAD(next_num::text, settings_rec.numeron_pituus, '0');

  -- Construct final number
  final_number := settings_rec.prefiksi || year_str || padded_num;

  RETURN final_number;
END;
$$;

-- Function to set automatic number on insert
CREATE OR REPLACE FUNCTION public.set_automatic_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'asiakkaat' AND NEW.numero IS NULL THEN
    NEW.numero := generate_next_number('asiakas');
  ELSIF TG_TABLE_NAME = 'Huollot' AND NEW.numero IS NULL THEN
    NEW.numero := generate_next_number('huolto');
  ELSIF TG_TABLE_NAME = 'laskut' AND NEW.numero IS NULL THEN
    NEW.numero := generate_next_number('lasku');
  END IF;

  RETURN NEW;
END;
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );

  -- Assign role: first user = admin, others = kayttaja
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'kayttaja');
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- 7. TRIGGERS
-- ============================================================================

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_yritykset_updated_at
  BEFORE UPDATE ON public.yritykset
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_yrityksen_asetukset_updated_at
  BEFORE UPDATE ON public.yrityksen_asetukset
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lasku_asetukset_updated_at
  BEFORE UPDATE ON public.lasku_asetukset
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_takuu_asetukset_updated_at
  BEFORE UPDATE ON public.takuu_asetukset
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_varasto_asetukset_updated_at
  BEFORE UPDATE ON public.varasto_asetukset
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ilmoitus_asetukset_updated_at
  BEFORE UPDATE ON public.ilmoitus_asetukset
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_laskut_updated_at
  BEFORE UPDATE ON public.laskut
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_varaosat_updated_at
  BEFORE UPDATE ON public.varaosat
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Triggers for automatic numbering
CREATE TRIGGER set_automatic_customer_number
  BEFORE INSERT ON public.asiakkaat
  FOR EACH ROW
  EXECUTE FUNCTION public.set_automatic_number();

CREATE TRIGGER set_automatic_service_number
  BEFORE INSERT ON public.Huollot
  FOR EACH ROW
  EXECUTE FUNCTION public.set_automatic_number();

CREATE TRIGGER set_automatic_invoice_number
  BEFORE INSERT ON public.laskut
  FOR EACH ROW
  EXECUTE FUNCTION public.set_automatic_number();

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.yritykset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asiakkaat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Laitteet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Huollot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yrityksen_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lasku_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.numerointi_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hinnoittelu_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.takuu_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.varasto_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ilmoitus_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alv_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maksutavat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laite_valmistajat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laskut ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.varaosat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.huolto_varaosat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tekniikat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. RLS POLICIES
-- ============================================================================

-- Profiles policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Companies policies
CREATE POLICY "Users can view own company"
ON public.yritykset FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage company"
ON public.yritykset FOR ALL
TO authenticated
USING (
  id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND public.has_role(auth.uid(), 'admin')
);

-- Customers policies
CREATE POLICY "Users can view company customers"
ON public.asiakkaat FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert customers"
ON public.asiakkaat FOR INSERT
TO authenticated
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update customers"
ON public.asiakkaat FOR UPDATE
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete customers"
ON public.asiakkaat FOR DELETE
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Devices policies (same pattern as customers)
CREATE POLICY "Users can view company devices"
ON public.Laitteet FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert devices"
ON public.Laitteet FOR INSERT
TO authenticated
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update devices"
ON public.Laitteet FOR UPDATE
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete devices"
ON public.Laitteet FOR DELETE
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Services policies (same pattern)
CREATE POLICY "Users can view company services"
ON public.Huollot FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert services"
ON public.Huollot FOR INSERT
TO authenticated
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update services"
ON public.Huollot FOR UPDATE
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete services"
ON public.Huollot FOR DELETE
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Settings tables policies (apply same company-based pattern to all)
CREATE POLICY "Users can view company settings"
ON public.yrityksen_asetukset FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage company settings"
ON public.yrityksen_asetukset FOR ALL
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND public.has_role(auth.uid(), 'admin')
);

-- Apply similar policies to other settings tables
CREATE POLICY "Users can view invoice settings"
ON public.lasku_asetukset FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage invoice settings"
ON public.lasku_asetukset FOR ALL
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can view numbering settings"
ON public.numerointi_asetukset FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage numbering settings"
ON public.numerointi_asetukset FOR ALL
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can view pricing settings"
ON public.hinnoittelu_asetukset FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage pricing settings"
ON public.hinnoittelu_asetukset FOR ALL
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can view warranty settings"
ON public.takuu_asetukset FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage warranty settings"
ON public.takuu_asetukset FOR ALL
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can view inventory settings"
ON public.varasto_asetukset FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage inventory settings"
ON public.varasto_asetukset FOR ALL
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can view notification settings"
ON public.ilmoitus_asetukset FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage notification settings"
ON public.ilmoitus_asetukset FOR ALL
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can view VAT settings"
ON public.alv_asetukset FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage VAT settings"
ON public.alv_asetukset FOR ALL
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can view service statuses"
ON public.service_statuses FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage service statuses"
ON public.service_statuses FOR ALL
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can view payment methods"
ON public.maksutavat FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage payment methods"
ON public.maksutavat FOR ALL
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can view manufacturers"
ON public.laite_valmistajat FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage manufacturers"
ON public.laite_valmistajat FOR ALL
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND public.has_role(auth.uid(), 'admin')
);

-- Invoices policies
CREATE POLICY "Users can view company invoices"
ON public.laskut FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert invoices"
ON public.laskut FOR INSERT
TO authenticated
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update invoices"
ON public.laskut FOR UPDATE
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete invoices"
ON public.laskut FOR DELETE
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Spare parts policies
CREATE POLICY "Users can view company parts"
ON public.varaosat FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert parts"
ON public.varaosat FOR INSERT
TO authenticated
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update parts"
ON public.varaosat FOR UPDATE
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete parts"
ON public.varaosat FOR DELETE
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Service-parts relationship policies
CREATE POLICY "Users can view service parts"
ON public.huolto_varaosat FOR SELECT
TO authenticated
USING (
  huolto_id IN (
    SELECT id FROM public.Huollot
    WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can manage service parts"
ON public.huolto_varaosat FOR ALL
TO authenticated
USING (
  huolto_id IN (
    SELECT id FROM public.Huollot
    WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

-- Technicians policies
CREATE POLICY "Users can view company technicians"
ON public.tekniikat FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage technicians"
ON public.tekniikat FOR ALL
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND public.has_role(auth.uid(), 'admin')
);

-- Licenses policies
CREATE POLICY "Users can view licenses"
ON public.licenses FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage licenses"
ON public.licenses FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 10. DEFAULT DATA
-- ============================================================================

-- Insert default service statuses for new companies
-- (These will be inserted when a company is created through the application)

-- Insert default numbering settings
-- (These will be inserted when a company is created through the application)

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================