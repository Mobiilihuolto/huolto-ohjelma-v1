-- Korjaa H2025-0003 huoltotyön hinnoittelu_nimi
-- Hae oikea nimi hinnoittelu_asetuksista ja päivitä se

UPDATE "Huollot"
SET hinnoittelu_nimi = (
  SELECT nimi 
  FROM hinnoittelu_asetukset 
  WHERE hinnoittelu_tyyppi = 'kertamaksu' 
    AND kiintea_hinta = "Huollot".kiintea_hinta
    AND is_active = true
  LIMIT 1
)
WHERE numero = 'H2025-0003' 
  AND hinnoittelu_tyyppi = 'kertamaksu'
  AND hinnoittelu_nimi IS NULL;