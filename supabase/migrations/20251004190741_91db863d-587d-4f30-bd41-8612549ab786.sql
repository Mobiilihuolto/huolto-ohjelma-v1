-- Add kustannushinta (cost price) column to varaosat table
ALTER TABLE public.varaosat 
ADD COLUMN kustannushinta numeric DEFAULT NULL;

COMMENT ON COLUMN public.varaosat.kustannushinta IS 'Cost price of the part (optional)';