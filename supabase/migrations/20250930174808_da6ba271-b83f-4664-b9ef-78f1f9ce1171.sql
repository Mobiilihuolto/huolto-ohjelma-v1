-- Update the status check constraint to include 'avoin'
ALTER TABLE public.laskut 
DROP CONSTRAINT IF EXISTS laskut_status_check;

ALTER TABLE public.laskut 
ADD CONSTRAINT laskut_status_check 
CHECK (status = ANY (ARRAY['luonnos'::text, 'avoin'::text, 'lahetetty'::text, 'maksettu'::text, 'myohassa'::text, 'peruutettu'::text]));