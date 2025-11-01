-- Add ALV inclusion flag to pricing settings
ALTER TABLE public.hinnoittelu_asetukset 
ADD COLUMN IF NOT EXISTS sisaltaa_alv boolean DEFAULT false;

-- Update existing fixed price entries to include ALV by default (since they are end prices)
UPDATE public.hinnoittelu_asetukset 
SET sisaltaa_alv = true 
WHERE hinnoittelu_tyyppi = 'kertamaksu';

-- Keep hourly rates as net prices (ALV calculated separately)
UPDATE public.hinnoittelu_asetukset 
SET sisaltaa_alv = false 
WHERE hinnoittelu_tyyppi = 'tuntiveloitus';