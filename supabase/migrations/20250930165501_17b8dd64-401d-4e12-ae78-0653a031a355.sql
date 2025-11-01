-- Add payment method field to invoices table
ALTER TABLE public.laskut 
ADD COLUMN IF NOT EXISTS maksutapa text;

-- Add comment to explain the field
COMMENT ON COLUMN public.laskut.maksutapa IS 'Payment method: MobilePay, käteinen, kortti, tilisiirto, etc.';