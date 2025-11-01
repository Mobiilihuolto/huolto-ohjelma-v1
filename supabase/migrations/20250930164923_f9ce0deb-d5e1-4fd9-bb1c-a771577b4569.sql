-- Add document type field to invoices table
ALTER TABLE public.laskut 
ADD COLUMN IF NOT EXISTS tositelaji text NOT NULL DEFAULT 'lasku' CHECK (tositelaji IN ('lasku', 'kuitti'));

-- Add comment to explain the field
COMMENT ON COLUMN public.laskut.tositelaji IS 'Document type: lasku (invoice - payment pending) or kuitti (receipt - already paid)';