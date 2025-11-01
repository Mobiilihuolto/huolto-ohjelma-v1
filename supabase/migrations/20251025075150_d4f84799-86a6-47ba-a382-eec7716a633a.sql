-- Korjaa company_id kaikissa tauluissa
-- Päivitä väärä company_id oikeaksi kaikissa tauluissa

-- Asetustaulut
UPDATE hinnoittelu_asetukset 
SET company_id = 'c30a8c09-262e-4903-8dff-2917175e6f6b'
WHERE company_id = '5c1d2894-9cb0-4aa8-b506-8119e23ebc69';

UPDATE takuu_asetukset 
SET company_id = 'c30a8c09-262e-4903-8dff-2917175e6f6b' 
WHERE company_id = '5c1d2894-9cb0-4aa8-b506-8119e23ebc69';

UPDATE numerointi_asetukset 
SET company_id = 'c30a8c09-262e-4903-8dff-2917175e6f6b' 
WHERE company_id = '5c1d2894-9cb0-4aa8-b506-8119e23ebc69';

UPDATE maksutavat 
SET company_id = 'c30a8c09-262e-4903-8dff-2917175e6f6b' 
WHERE company_id = '5c1d2894-9cb0-4aa8-b506-8119e23ebc69';

UPDATE laite_valmistajat 
SET company_id = 'c30a8c09-262e-4903-8dff-2917175e6f6b' 
WHERE company_id = '5c1d2894-9cb0-4aa8-b506-8119e23ebc69';

UPDATE service_statuses 
SET company_id = 'c30a8c09-262e-4903-8dff-2917175e6f6b' 
WHERE company_id = '5c1d2894-9cb0-4aa8-b506-8119e23ebc69';

UPDATE varasto_asetukset 
SET company_id = 'c30a8c09-262e-4903-8dff-2917175e6f6b' 
WHERE company_id = '5c1d2894-9cb0-4aa8-b506-8119e23ebc69';

UPDATE yrityksen_asetukset 
SET company_id = 'c30a8c09-262e-4903-8dff-2917175e6f6b' 
WHERE company_id = '5c1d2894-9cb0-4aa8-b506-8119e23ebc69';

UPDATE ilmoitus_asetukset 
SET company_id = 'c30a8c09-262e-4903-8dff-2917175e6f6b' 
WHERE company_id = '5c1d2894-9cb0-4aa8-b506-8119e23ebc69';

UPDATE alv_asetukset 
SET company_id = 'c30a8c09-262e-4903-8dff-2917175e6f6b' 
WHERE company_id = '5c1d2894-9cb0-4aa8-b506-8119e23ebc69';

UPDATE lasku_asetukset 
SET company_id = 'c30a8c09-262e-4903-8dff-2917175e6f6b' 
WHERE company_id = '5c1d2894-9cb0-4aa8-b506-8119e23ebc69';

-- Päädatataulut
UPDATE asiakkaat 
SET company_id = 'c30a8c09-262e-4903-8dff-2917175e6f6b' 
WHERE company_id = '5c1d2894-9cb0-4aa8-b506-8119e23ebc69';

UPDATE laitteet 
SET company_id = 'c30a8c09-262e-4903-8dff-2917175e6f6b' 
WHERE company_id = '5c1d2894-9cb0-4aa8-b506-8119e23ebc69';

UPDATE "Laitteet" 
SET company_id = 'c30a8c09-262e-4903-8dff-2917175e6f6b' 
WHERE company_id = '5c1d2894-9cb0-4aa8-b506-8119e23ebc69';

UPDATE huollot 
SET company_id = 'c30a8c09-262e-4903-8dff-2917175e6f6b' 
WHERE company_id = '5c1d2894-9cb0-4aa8-b506-8119e23ebc69';

UPDATE "Huollot" 
SET company_id = 'c30a8c09-262e-4903-8dff-2917175e6f6b' 
WHERE company_id = '5c1d2894-9cb0-4aa8-b506-8119e23ebc69';

UPDATE laskut 
SET company_id = 'c30a8c09-262e-4903-8dff-2917175e6f6b' 
WHERE company_id = '5c1d2894-9cb0-4aa8-b506-8119e23ebc69';

UPDATE varaosat 
SET company_id = 'c30a8c09-262e-4903-8dff-2917175e6f6b' 
WHERE company_id = '5c1d2894-9cb0-4aa8-b506-8119e23ebc69';

UPDATE huolto_varaosat 
SET company_id = 'c30a8c09-262e-4903-8dff-2917175e6f6b' 
WHERE company_id = '5c1d2894-9cb0-4aa8-b506-8119e23ebc69';

UPDATE tekniikat 
SET company_id = 'c30a8c09-262e-4903-8dff-2917175e6f6b' 
WHERE company_id = '5c1d2894-9cb0-4aa8-b506-8119e23ebc69';