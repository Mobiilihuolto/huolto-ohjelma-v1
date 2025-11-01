-- Setup existing users with ON CONFLICT handling

DO $$
DECLARE
  new_company_id uuid := gen_random_uuid();
  license_key_value text := 'SETUP-2025-' || substring(gen_random_uuid()::text, 1, 8);
  rocksolid_user_id uuid := 'a23e60ea-5941-4de3-932f-b7974413f88f';
  testikodi_user_id uuid := '0ac42cea-8cf4-4c72-9cbc-6f28c42ca03d';
BEGIN
  -- Create and activate license
  INSERT INTO public.licenses (
    license_key,
    company_id,
    plan_type,
    max_users,
    is_used,
    activated_by,
    activated_at,
    notes
  ) VALUES (
    license_key_value,
    new_company_id,
    'professional',
    50,
    true,
    rocksolid_user_id,
    now(),
    'Setup migration for existing users'
  );

  -- Create profiles with ON CONFLICT
  INSERT INTO public.profiles (user_id, company_id, email, full_name)
  VALUES (rocksolid_user_id, new_company_id, 'rocksolid.nexus@gmail.com', 'Janne Pitkänen')
  ON CONFLICT (user_id) DO UPDATE SET company_id = EXCLUDED.company_id;

  INSERT INTO public.profiles (user_id, company_id, email, full_name)
  VALUES (testikodi_user_id, new_company_id, 'testikodi@gmail.com', 'Testi henkilö#1')
  ON CONFLICT (user_id) DO UPDATE SET company_id = EXCLUDED.company_id;

  -- Assign roles with ON CONFLICT
  INSERT INTO public.user_roles (user_id, role) VALUES (rocksolid_user_id, 'admin') ON CONFLICT DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (testikodi_user_id, 'teknikko') ON CONFLICT DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (testikodi_user_id, 'kayttaja') ON CONFLICT DO NOTHING;

  -- Default settings
  INSERT INTO public.numerointi_asetukset (company_id, tyyppi, prefiksi, vuosi_formaatti, numeron_pituus, seuraava_numero) VALUES 
    (new_company_id, 'asiakas', 'AS', 'YYYY', 4, 1),
    (new_company_id, 'huolto', 'HU', 'YYYY', 4, 1),
    (new_company_id, 'lasku', 'LA', 'YYYY', 4, 1);
  
  INSERT INTO public.alv_asetukset (company_id, nimi, alv_prosentti, is_default) VALUES (new_company_id, 'ALV 25.5%', 25.5, true);
  INSERT INTO public.lasku_asetukset (company_id, nimi) VALUES (new_company_id, 'Oletusasetukset');
  INSERT INTO public.maksutavat (company_id, nimi, order_index) VALUES (new_company_id, 'Käteinen', 1), (new_company_id, 'Pankkisiirto', 2), (new_company_id, 'Korttimaksu', 3);
  INSERT INTO public.hinnoittelu_asetukset (company_id, nimi, hinnoittelu_tyyppi, oletustuntihinta) VALUES (new_company_id, 'Tuntiveloitus', 'tuntiveloitus', 50);
  INSERT INTO public.takuu_asetukset (company_id, nimi, oletustyotakuu_kuukautta, oletusosatakuu_kuukautta) VALUES (new_company_id, 'Vakiotakuu', 12, 12);
  INSERT INTO public.varasto_asetukset (company_id, varasto_kaytossa) VALUES (new_company_id, true);
  INSERT INTO public.yrityksen_asetukset (company_id, yrityksen_nimi) VALUES (new_company_id, 'Yritys Oy');
  INSERT INTO public.ilmoitus_asetukset (company_id) VALUES (new_company_id);
  INSERT INTO public.service_statuses (company_id, name, color, order_index, is_default) VALUES 
    (new_company_id, 'Odottaa', '#6b7280', 1, true),
    (new_company_id, 'Työn alla', '#3b82f6', 2, false),
    (new_company_id, 'Valmis', '#10b981', 3, false);

END $$;