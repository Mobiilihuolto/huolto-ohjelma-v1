-- First check the constraint
SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint 
WHERE conrelid = 'public.hinnoittelu_asetukset'::regclass 
AND contype = 'c';

-- Drop the check constraint that's causing issues
ALTER TABLE public.hinnoittelu_asetukset 
DROP CONSTRAINT IF EXISTS hinnoittelu_asetukset_oletushinnoittelu_tyyppi_check;

-- Add new columns
ALTER TABLE public.hinnoittelu_asetukset 
ADD COLUMN IF NOT EXISTS hinnoittelu_tyyppi text DEFAULT 'tuntiveloitus',
ADD COLUMN IF NOT EXISTS kiintea_hinta numeric;

-- Update existing record to have the new type
UPDATE public.hinnoittelu_asetukset 
SET hinnoittelu_tyyppi = 'tuntiveloitus' 
WHERE hinnoittelu_tyyppi IS NULL;

-- Insert fixed price settings
INSERT INTO public.hinnoittelu_asetukset (nimi, hinnoittelu_tyyppi, kiintea_hinta, is_active) VALUES
('Arviointipalvelu', 'kertamaksu', 25, true),
('Pieni korjaus', 'kertamaksu', 35, true),
('Datan palautus', 'kertamaksu', 30, true),
('Akun vaihto', 'kertamaksu', 30, true),
('Näytön vaihto', 'kertamaksu', 60, true),
('Akun ja näytön vaihto', 'kertamaksu', 80, true)
ON CONFLICT DO NOTHING;