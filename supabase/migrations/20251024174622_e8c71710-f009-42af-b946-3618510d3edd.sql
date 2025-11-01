-- Clean database while preserving admin user (rocksolid.nexus@gmail.com)
-- User ID: a23e60ea-5941-4de3-932f-b7974413f88f

-- Step 1: Delete business data (in correct order due to foreign keys)
DELETE FROM huolto_varaosat;
DELETE FROM laskut;
DELETE FROM huollot;
DELETE FROM laitteet;
DELETE FROM varaosat;
DELETE FROM asiakkaat;

-- Step 2: Delete all settings
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

-- Step 3: Delete test user roles and profile (keep admin)
DELETE FROM user_roles WHERE user_id != 'a23e60ea-5941-4de3-932f-b7974413f88f';
DELETE FROM profiles WHERE user_id != 'a23e60ea-5941-4de3-932f-b7974413f88f';