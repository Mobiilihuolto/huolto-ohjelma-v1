-- Add reminder tracking and estimated time fields
-- 1. Add reminder counter to invoices
ALTER TABLE public.laskut 
ADD COLUMN IF NOT EXISTS muistutukset_lahetetty INTEGER DEFAULT 0 NOT NULL;

-- 2. Add estimated work time to services (correct table name: Huollot)
ALTER TABLE public."Huollot" 
ADD COLUMN IF NOT EXISTS arvioitu_tyoaika_minuutit INTEGER;