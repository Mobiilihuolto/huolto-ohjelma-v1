-- Delete the duplicate test row with rocksolid.nexus email
DELETE FROM ilmoitus_asetukset 
WHERE varasto_varoitus_email = 'rocksolid.nexus@gmail.com';