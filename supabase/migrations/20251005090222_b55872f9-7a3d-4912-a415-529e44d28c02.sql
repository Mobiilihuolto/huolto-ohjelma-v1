-- Add nimi column to lasku_asetukset
ALTER TABLE public.lasku_asetukset
ADD COLUMN IF NOT EXISTS nimi text NOT NULL DEFAULT 'Oletusasetus';

-- Update existing settings without a custom name
UPDATE public.lasku_asetukset
SET nimi = 'Oletusasetus'
WHERE nimi = 'Oletusasetus';

-- Remove the default value after migration
ALTER TABLE public.lasku_asetukset
ALTER COLUMN nimi DROP DEFAULT;