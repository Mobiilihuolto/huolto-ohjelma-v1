-- Vaihe 1: Tyhjennä tietokanta ja poista RLS väliaikaisesti
-- Säilytetään admin-käyttäjä: a23e60ea-5941-4de3-932f-b7974413f88f

-- Tyhjennä kaikki data
DELETE FROM huolto_varaosat;
DELETE FROM laskut;
DELETE FROM huollot;
DELETE FROM laitteet;
DELETE FROM varaosat;
DELETE FROM asiakkaat;
DELETE FROM yrityksen_asetukset;
DELETE FROM service_statuses;
DELETE FROM hinnoittelu_asetukset;
DELETE FROM takuu_asetukset;
DELETE FROM tekniikat;
DELETE FROM laite_valmistajat;
DELETE FROM alv_asetukset;
DELETE FROM maksutavat;
DELETE FROM lasku_asetukset;
DELETE FROM numerointi_asetukset;
DELETE FROM varasto_asetukset;
DELETE FROM ilmoitus_asetukset;
DELETE FROM user_roles WHERE user_id != 'a23e60ea-5941-4de3-932f-b7974413f88f';
DELETE FROM profiles WHERE user_id != 'a23e60ea-5941-4de3-932f-b7974413f88f';

-- Poista RLS väliaikaisesti varmuuskopion palauttamista varten
ALTER TABLE asiakkaat DISABLE ROW LEVEL SECURITY;
ALTER TABLE laitteet DISABLE ROW LEVEL SECURITY;
ALTER TABLE huollot DISABLE ROW LEVEL SECURITY;
ALTER TABLE laskut DISABLE ROW LEVEL SECURITY;
ALTER TABLE varaosat DISABLE ROW LEVEL SECURITY;
ALTER TABLE huolto_varaosat DISABLE ROW LEVEL SECURITY;
ALTER TABLE yrityksen_asetukset DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_statuses DISABLE ROW LEVEL SECURITY;
ALTER TABLE hinnoittelu_asetukset DISABLE ROW LEVEL SECURITY;
ALTER TABLE takuu_asetukset DISABLE ROW LEVEL SECURITY;
ALTER TABLE tekniikat DISABLE ROW LEVEL SECURITY;
ALTER TABLE laite_valmistajat DISABLE ROW LEVEL SECURITY;
ALTER TABLE alv_asetukset DISABLE ROW LEVEL SECURITY;
ALTER TABLE maksutavat DISABLE ROW LEVEL SECURITY;
ALTER TABLE lasku_asetukset DISABLE ROW LEVEL SECURITY;
ALTER TABLE numerointi_asetukset DISABLE ROW LEVEL SECURITY;
ALTER TABLE varasto_asetukset DISABLE ROW LEVEL SECURITY;
ALTER TABLE ilmoitus_asetukset DISABLE ROW LEVEL SECURITY;