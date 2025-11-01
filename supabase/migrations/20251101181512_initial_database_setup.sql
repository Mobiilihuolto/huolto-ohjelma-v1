-- Complete database setup with all tables, functions, triggers and RLS policies
-- This creates the entire schema for the mobile repair service management system

-- Create enum type for user roles
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN CREATE TYPE public.app_role AS ENUM ('admin', 'teknikko', 'kayttaja'); END IF; END $$;

-- Drop existing tables if any
DROP TABLE IF EXISTS public.huolto_varaosat CASCADE;
DROP TABLE IF EXISTS public.laskut CASCADE;
DROP TABLE IF EXISTS public.Huollot CASCADE;
DROP TABLE IF EXISTS public.varaosat CASCADE;
DROP TABLE IF EXISTS public.Laitteet CASCADE;
DROP TABLE IF EXISTS public.asiakkaat CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.licenses CASCADE;
DROP TABLE IF EXISTS public.numerointi_asetukset CASCADE;
DROP TABLE IF EXISTS public.hinnoittelu_asetukset CASCADE;
DROP TABLE IF EXISTS public.alv_asetukset CASCADE;
DROP TABLE IF EXISTS public.lasku_asetukset CASCADE;
DROP TABLE IF EXISTS public.maksutavat CASCADE;
DROP TABLE IF EXISTS public.takuu_asetukset CASCADE;
DROP TABLE IF EXISTS public.varasto_asetukset CASCADE;
DROP TABLE IF EXISTS public.yrityksen_asetukset CASCADE;
DROP TABLE IF EXISTS public.ilmoitus_asetukset CASCADE;
DROP TABLE IF EXISTS public.service_statuses CASCADE;
DROP TABLE IF EXISTS public.tekniikat CASCADE;
DROP TABLE IF EXISTS public.laite_valmistajat CASCADE;

-- Create all tables
CREATE TABLE public.licenses (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), license_key text NOT NULL UNIQUE, company_id uuid, plan_type text DEFAULT 'basic', max_users integer DEFAULT 5, is_used boolean DEFAULT false, activated_by uuid, activated_at timestamptz, expires_at timestamptz, notes text, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.profiles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL UNIQUE, company_id uuid NOT NULL, email text, full_name text, role text DEFAULT 'user', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, role app_role NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id, role));
CREATE TABLE public.asiakkaat (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, user_id uuid, numero text, nimi text NOT NULL, tyyppi text, yrityksen_nimi text, y_tunnus text, alv_numero text, osoite text, puhelin text, email text, yksityiset_muistiinpanot text, created_at timestamptz DEFAULT now());
CREATE TABLE public.Laitteet (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, user_id uuid, asiakas_id uuid, merkki text, malli text, sarjanumero text, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.Huollot (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, user_id uuid, asiakas_id uuid DEFAULT gen_random_uuid(), laite_id uuid, teknikko_id uuid, numero text, merkki text, malli text, sarjanumero text, kuvaus text, status text NOT NULL DEFAULT 'odottaa', hinnoittelu_tyyppi text DEFAULT 'tuntiveloitus', hinnoittelu_nimi text, tuntihinta numeric, kiintea_hinta numeric, tyoaika_minuutit integer DEFAULT 0, arvioitu_tyoaika_minuutit integer, arvioitu_valmistumispvm date, ajanlaskuri_kaynnissa boolean DEFAULT false, ajanlaskuri_aloitettu_pvm timestamptz, tyotakuu_kuukautta integer, osatakuu_kuukautta integer, teknikon_muistiinpanot text, asiakas_allekirjoitus text, teknikko_allekirjoitus text, valmistunut_pvm timestamptz, luovutettu_pvm timestamptz, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.varaosat (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, user_id uuid, nimi text NOT NULL, kuvaus text, tuotekoodi text, kategoria text, toimittaja text, yksikko text DEFAULT 'kpl', hinta numeric NOT NULL DEFAULT 0, kustannushinta numeric, sisaltaa_alv boolean DEFAULT false, saldo integer NOT NULL DEFAULT 0, minimisaldo integer DEFAULT 0, is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.huolto_varaosat (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, huolto_id uuid NOT NULL, varaosa_id uuid NOT NULL, maara integer NOT NULL DEFAULT 1, yksikkohinta numeric NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.laskut (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, user_id uuid, asiakas_id uuid NOT NULL, huolto_id uuid, numero text, tositelaji text NOT NULL DEFAULT 'lasku', laskun_pvm date NOT NULL DEFAULT CURRENT_DATE, erapaiva date NOT NULL DEFAULT (CURRENT_DATE + interval '14 days'), maksuehto_paivat integer DEFAULT 14, maksettu_pvm date, status text NOT NULL DEFAULT 'lahetetty', maksutapa text, asiakas_nimi text NOT NULL, asiakas_yhteyshenkilo text, asiakas_y_tunnus text, asiakas_alv_numero text, asiakas_osoite text, asiakas_puhelin text, asiakas_email text, rivit jsonb NOT NULL DEFAULT '[]'::jsonb, alv_prosentti numeric DEFAULT 25.5, summa_ilman_alvia numeric NOT NULL DEFAULT 0, alv_summa numeric NOT NULL DEFAULT 0, kokonaissumma numeric NOT NULL DEFAULT 0, viivastyskulut numeric DEFAULT 0, muistutukset_lahetetty integer NOT NULL DEFAULT 0, huomautukset text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.numerointi_asetukset (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, user_id uuid, tyyppi text NOT NULL, prefiksi text NOT NULL DEFAULT 'A', vuosi_formaatti text NOT NULL DEFAULT 'YYYY', numeron_pituus integer NOT NULL DEFAULT 4, seuraava_numero integer NOT NULL DEFAULT 1, is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.hinnoittelu_asetukset (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, user_id uuid, nimi text NOT NULL, hinnoittelu_tyyppi text DEFAULT 'tuntiveloitus', oletushinnoittelu_tyyppi text DEFAULT 'tuntiveloitus', oletustuntihinta numeric, kiintea_hinta numeric, yksikko text DEFAULT 'työ', sisaltaa_alv boolean DEFAULT false, is_active boolean DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.alv_asetukset (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, user_id uuid, nimi text NOT NULL, alv_prosentti numeric NOT NULL, is_default boolean NOT NULL DEFAULT false, is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.lasku_asetukset (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, user_id uuid, nimi text NOT NULL, oletusmaksuehto_paivat integer NOT NULL DEFAULT 14, oletusviivastyskulut numeric NOT NULL DEFAULT 5, is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.maksutavat (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, user_id uuid, nimi text NOT NULL, order_index integer NOT NULL DEFAULT 0, is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.takuu_asetukset (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, user_id uuid, nimi text NOT NULL, kuvaus text, oletustyotakuu_kuukautta integer, oletusosatakuu_kuukautta integer, is_active boolean DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.varasto_asetukset (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, user_id uuid, varasto_kaytossa boolean NOT NULL DEFAULT false, automaattinen_saldo_vahennys boolean NOT NULL DEFAULT true, varoita_matalasta_saldosta boolean NOT NULL DEFAULT true, is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.yrityksen_asetukset (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, user_id uuid, yrityksen_nimi text NOT NULL, y_tunnus text, alv_numero text, osoite text, postinumero text, postitoimipaikka text, puhelin text, email text, logo_url text, is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.ilmoitus_asetukset (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, user_id uuid, huolto_valmis_kaytossa boolean NOT NULL DEFAULT false, huolto_valmis_pohja text NOT NULL DEFAULT 'Hei [Asiakas], laitteesi [Laite] on valmis noudettavaksi. Terv. [Yritys]', lasku_eraantynyt_kaytossa boolean NOT NULL DEFAULT false, lasku_eraantynyt_pohja text NOT NULL DEFAULT 'Hei [Asiakas], laskusi [Numero] on erääntynyt [Päivää] päivää sitten. Summa: [Summa]€. Terv. [Yritys]', lasku_eraantynyt_paivat integer NOT NULL DEFAULT 7, varasto_varoitus_kaytossa boolean NOT NULL DEFAULT false, varasto_varoitus_email text, testiviesti_email text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.service_statuses (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, user_id uuid, name text NOT NULL, color text NOT NULL DEFAULT '#6b7280', order_index integer NOT NULL DEFAULT 0, is_default boolean NOT NULL DEFAULT false, is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.tekniikat (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, user_id uuid, nimi text NOT NULL, is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.laite_valmistajat (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, user_id uuid, nimi text NOT NULL, order_index integer NOT NULL DEFAULT 0, is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());

-- Create helper functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.get_user_company_id() RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT company_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1; $$;

CREATE OR REPLACE FUNCTION public.user_in_same_company(_user_id_1 uuid, _user_id_2 uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.profiles p1 JOIN public.profiles p2 ON p1.company_id = p2.company_id WHERE p1.user_id = _user_id_1 AND p2.user_id = _user_id_2) $$;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ DECLARE first_company_id uuid; provided_license_key text; license_record RECORD; BEGIN provided_license_key := NEW.raw_user_meta_data->>'license_key'; IF provided_license_key IS NULL OR provided_license_key = '' THEN RAISE EXCEPTION 'Lisenssinavain puuttuu'; END IF; SELECT * INTO license_record FROM public.licenses WHERE license_key = provided_license_key AND is_used = false FOR UPDATE; IF NOT FOUND THEN RAISE EXCEPTION 'Virheellinen tai jo käytetty lisenssinavain'; END IF; IF license_record.expires_at IS NOT NULL AND license_record.expires_at < now() THEN RAISE EXCEPTION 'Lisenssinavain on vanhentunut'; END IF; first_company_id := gen_random_uuid(); UPDATE public.licenses SET is_used = true, company_id = first_company_id, activated_at = now(), activated_by = NEW.id WHERE license_key = provided_license_key; INSERT INTO public.profiles (user_id, email, full_name, company_id) VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), first_company_id); INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin'); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.generate_next_number(entity_type text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ DECLARE settings RECORD; next_num INTEGER; formatted_year TEXT; padded_number TEXT; result_number TEXT; BEGIN SELECT * INTO settings FROM public.numerointi_asetukset WHERE tyyppi = entity_type AND is_active = true LIMIT 1; IF NOT FOUND THEN RAISE EXCEPTION 'No active numbering settings found for type: %', entity_type; END IF; next_num := settings.seuraava_numero; UPDATE public.numerointi_asetukset SET seuraava_numero = next_num + 1, updated_at = now() WHERE id = settings.id; IF settings.vuosi_formaatti = 'YY' THEN formatted_year := EXTRACT(YEAR FROM now())::TEXT; formatted_year := RIGHT(formatted_year, 2); ELSE formatted_year := EXTRACT(YEAR FROM now())::TEXT; END IF; padded_number := LPAD(next_num::TEXT, settings.numeron_pituus, '0'); result_number := settings.prefiksi || formatted_year || '-' || padded_number; RETURN result_number; END; $$;

CREATE OR REPLACE FUNCTION public.set_automatic_number() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN IF TG_TABLE_NAME = 'asiakkaat' AND NEW.numero IS NULL THEN NEW.numero := generate_next_number('asiakas'); ELSIF TG_TABLE_NAME = 'Huollot' AND NEW.numero IS NULL THEN NEW.numero := generate_next_number('huolto'); ELSIF TG_TABLE_NAME = 'laskut' AND NEW.numero IS NULL THEN NEW.numero := generate_next_number('lasku'); END IF; RETURN NEW; END; $$;

-- Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS set_asiakas_numero ON public.asiakkaat;
CREATE TRIGGER set_asiakas_numero BEFORE INSERT ON public.asiakkaat FOR EACH ROW EXECUTE FUNCTION public.set_automatic_number();

DROP TRIGGER IF EXISTS set_huolto_numero ON public.Huollot;
CREATE TRIGGER set_huolto_numero BEFORE INSERT ON public.Huollot FOR EACH ROW EXECUTE FUNCTION public.set_automatic_number();

DROP TRIGGER IF EXISTS set_lasku_numero ON public.laskut;
CREATE TRIGGER set_lasku_numero BEFORE INSERT ON public.laskut FOR EACH ROW EXECUTE FUNCTION public.set_automatic_number();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_varaosat_updated_at BEFORE UPDATE ON public.varaosat FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_laskut_updated_at BEFORE UPDATE ON public.laskut FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_numerointi_updated_at BEFORE UPDATE ON public.numerointi_asetukset FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asiakkaat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Laitteet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Huollot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.varaosat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.huolto_varaosat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laskut ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.numerointi_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hinnoittelu_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alv_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lasku_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maksutavat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.takuu_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.varasto_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yrityksen_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ilmoitus_asetukset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tekniikat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laite_valmistajat ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for licenses
CREATE POLICY "Anyone can validate unused licenses" ON public.licenses FOR SELECT USING (is_used = false);
CREATE POLICY "Users can view own company license" ON public.licenses FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage licenses" ON public.licenses FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create RLS policies for profiles
CREATE POLICY "Users can view company profiles" ON public.profiles FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view company roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin') AND user_in_same_company(auth.uid(), user_id));

-- Create RLS policies for asiakkaat
CREATE POLICY "Admin and teknikko can view customers" ON public.asiakkaat FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Admin and teknikko can insert customers" ON public.asiakkaat FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Admin and teknikko can update customers" ON public.asiakkaat FOR UPDATE USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Only admin can delete customers" ON public.asiakkaat FOR DELETE USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));

-- Create RLS policies for Huollot
CREATE POLICY "Admins can view all company services" ON public.Huollot FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin and teknikko can insert services" ON public.Huollot FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));
CREATE POLICY "Admin and teknikko can update services" ON public.Huollot FOR UPDATE USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teknikko')));

-- Create RLS policies for other tables (same pattern)
CREATE POLICY "Users can view company parts" ON public.varaosat FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can view company numbering settings" ON public.numerointi_asetukset FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can view company service statuses" ON public.service_statuses FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));