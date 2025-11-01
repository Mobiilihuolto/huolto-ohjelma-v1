-- Add contact person field to invoices table
ALTER TABLE public.laskut 
ADD COLUMN IF NOT EXISTS asiakas_yhteyshenkilo text;

COMMENT ON COLUMN public.laskut.asiakas_yhteyshenkilo IS 'Contact person name for company invoices';