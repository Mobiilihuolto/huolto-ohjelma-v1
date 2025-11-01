-- Add company name field to customers table
ALTER TABLE public.asiakkaat 
ADD COLUMN yrityksen_nimi TEXT;