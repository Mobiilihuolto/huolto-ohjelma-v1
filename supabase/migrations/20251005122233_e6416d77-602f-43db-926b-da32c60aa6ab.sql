-- Poista tyhjä lasku L2025-0004 jos se on olemassa
DELETE FROM laskut 
WHERE numero = 'L2025-0004' 
  AND kokonaissumma = 0 
  AND rivit = '[]'::jsonb;