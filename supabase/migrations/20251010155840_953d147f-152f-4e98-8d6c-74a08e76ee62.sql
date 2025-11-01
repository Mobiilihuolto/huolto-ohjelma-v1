-- Palauta kaikki olemassa olevat tiedot käyttäjälle a23e60ea-5941-4de3-932f-b7974413f88f
-- Tämä päivittää user_id:n kaikille tiedoille joilla se puuttuu

-- Päivitä asiakkaat
UPDATE asiakkaat 
SET user_id = 'a23e60ea-5941-4de3-932f-b7974413f88f' 
WHERE user_id IS NULL;

-- Päivitä laitteet
UPDATE "Laitteet" 
SET user_id = 'a23e60ea-5941-4de3-932f-b7974413f88f' 
WHERE user_id IS NULL;

-- Päivitä huollot
UPDATE "Huollot" 
SET user_id = 'a23e60ea-5941-4de3-932f-b7974413f88f' 
WHERE user_id IS NULL;

-- Päivitä laskut
UPDATE laskut 
SET user_id = 'a23e60ea-5941-4de3-932f-b7974413f88f' 
WHERE user_id IS NULL;

-- Päivitä yrityksen asetukset
UPDATE yrityksen_asetukset 
SET user_id = 'a23e60ea-5941-4de3-932f-b7974413f88f' 
WHERE user_id IS NULL;

-- Päivitä ilmoitusasetukset
UPDATE ilmoitus_asetukset 
SET user_id = 'a23e60ea-5941-4de3-932f-b7974413f88f' 
WHERE user_id IS NULL;