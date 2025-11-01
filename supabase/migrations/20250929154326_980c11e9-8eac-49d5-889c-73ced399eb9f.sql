-- Create ALV settings table
CREATE TABLE public.alv_asetukset (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nimi TEXT NOT NULL,
  alv_prosentti NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.alv_asetukset ENABLE ROW LEVEL SECURITY;

-- Create policy for ALV settings access
CREATE POLICY "Allow all access to ALV settings in dev mode" 
ON public.alv_asetukset 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_alv_asetukset_updated_at
BEFORE UPDATE ON public.alv_asetukset
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default Finnish VAT setting
INSERT INTO public.alv_asetukset (nimi, alv_prosentti, is_active, is_default) 
VALUES ('Suomi ALV', 25.5, true, true);

-- Update default VAT percentage in invoices table from 24% to 25.5%
ALTER TABLE public.laskut 
ALTER COLUMN alv_prosentti SET DEFAULT 25.5;