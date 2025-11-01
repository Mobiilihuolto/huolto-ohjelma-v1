-- Lisätään varasto-ilmoitusten sähköpostiosoite ilmoitusasetuksiin
ALTER TABLE public.ilmoitus_asetukset 
ADD COLUMN IF NOT EXISTS varasto_varoitus_kaytossa boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS varasto_varoitus_email text;