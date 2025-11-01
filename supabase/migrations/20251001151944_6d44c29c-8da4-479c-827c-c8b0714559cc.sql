-- Add late payment fee field to invoices
ALTER TABLE public.laskut 
ADD COLUMN IF NOT EXISTS viivastyskulut numeric DEFAULT 0;

-- Create settings table for invoice defaults
CREATE TABLE IF NOT EXISTS public.lasku_asetukset (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  oletusmaksuehto_paivat integer NOT NULL DEFAULT 14,
  oletusviivastyskulut numeric NOT NULL DEFAULT 5,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lasku_asetukset ENABLE ROW LEVEL SECURITY;

-- Create policy for invoice settings
CREATE POLICY "Allow all access to invoice settings in dev mode" 
ON public.lasku_asetukset 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Insert default settings
INSERT INTO public.lasku_asetukset (oletusmaksuehto_paivat, oletusviivastyskulut)
VALUES (14, 5)
ON CONFLICT DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_lasku_asetukset_updated_at
  BEFORE UPDATE ON public.lasku_asetukset
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();