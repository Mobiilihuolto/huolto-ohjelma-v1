-- Luo oletusasetukset kaikille yrityksille joilla ne puuttuvat

-- 1. Varasto-asetukset
INSERT INTO varasto_asetukset (
  company_id,
  varasto_kaytossa,
  automaattinen_saldo_vahennys,
  varoita_matalasta_saldosta,
  is_active
)
SELECT DISTINCT
  p.company_id,
  false,
  true,
  true,
  true
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM varasto_asetukset va
  WHERE va.company_id = p.company_id AND va.is_active = true
);

-- 2. Yrityksen asetukset
INSERT INTO yrityksen_asetukset (
  company_id,
  yrityksen_nimi,
  is_active
)
SELECT DISTINCT
  p.company_id,
  'Yrityksen nimi',
  true
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM yrityksen_asetukset ya
  WHERE ya.company_id = p.company_id AND ya.is_active = true
);

-- 3. Ilmoitusasetukset
INSERT INTO ilmoitus_asetukset (
  company_id,
  huolto_valmis_kaytossa,
  huolto_valmis_pohja,
  lasku_eraantynyt_kaytossa,
  lasku_eraantynyt_paivat,
  lasku_eraantynyt_pohja,
  varasto_varoitus_kaytossa
)
SELECT DISTINCT
  p.company_id,
  false,
  'Hei [Asiakas], laitteesi [Laite] on valmis noudettavaksi. Terv. [Yritys]',
  false,
  7,
  'Hei [Asiakas], laskusi [Numero] on erääntynyt [Päivää] päivää sitten. Summa: [Summa]€. Terv. [Yritys]',
  false
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM ilmoitus_asetukset ia
  WHERE ia.company_id = p.company_id
);

-- 4. ALV-asetukset (oletuksena 25.5% ALV)
INSERT INTO alv_asetukset (
  company_id,
  nimi,
  alv_prosentti,
  is_default,
  is_active
)
SELECT DISTINCT
  p.company_id,
  'ALV 25.5%',
  25.5,
  true,
  true
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM alv_asetukset aa
  WHERE aa.company_id = p.company_id AND aa.is_active = true
);

-- 5. Laskuasetukset
INSERT INTO lasku_asetukset (
  company_id,
  nimi,
  oletusmaksuehto_paivat,
  oletusviivastyskulut,
  is_active
)
SELECT DISTINCT
  p.company_id,
  'Oletuslasku',
  14,
  5.0,
  true
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM lasku_asetukset la
  WHERE la.company_id = p.company_id AND la.is_active = true
);