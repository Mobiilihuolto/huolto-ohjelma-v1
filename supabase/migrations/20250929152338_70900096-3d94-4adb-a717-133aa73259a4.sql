-- Create invoices table for billing
CREATE TABLE public.laskut (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT,
  huolto_id UUID REFERENCES public."Huollot"(id),
  asiakas_id UUID REFERENCES public.asiakkaat(id) NOT NULL,
  
  -- Invoice details
  laskun_pvm DATE NOT NULL DEFAULT CURRENT_DATE,
  erapaiva DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '14 days'),
  
  -- Amounts
  rivit JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of invoice line items
  alv_prosentti NUMERIC DEFAULT 24,
  summa_ilman_alvia NUMERIC NOT NULL DEFAULT 0,
  alv_summa NUMERIC NOT NULL DEFAULT 0,
  kokonaissumma NUMERIC NOT NULL DEFAULT 0,
  
  -- Status and payment
  status TEXT NOT NULL DEFAULT 'lahetetty' CHECK (status IN ('luonnos', 'lahetetty', 'maksettu', 'myohassa', 'peruutettu')),
  maksettu_pvm DATE,
  maksuehto_paivat INTEGER DEFAULT 14,
  
  -- Customer details at time of invoice (for historical accuracy)
  asiakas_nimi TEXT NOT NULL,
  asiakas_osoite TEXT,
  asiakas_email TEXT,
  asiakas_puhelin TEXT,
  asiakas_y_tunnus TEXT,
  
  -- Metadata
  huomautukset TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID
);

-- Enable RLS
ALTER TABLE public.laskut ENABLE ROW LEVEL SECURITY;

-- Create policy for development
CREATE POLICY "Allow all access to invoices in dev mode" 
ON public.laskut 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_laskut_updated_at
  BEFORE UPDATE ON public.laskut
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add automatic numbering trigger  
CREATE TRIGGER set_automatic_invoice_number
  BEFORE INSERT ON public.laskut
  FOR EACH ROW
  EXECUTE FUNCTION public.set_automatic_number();

-- Add invoice numbering settings if not exists
INSERT INTO public.numerointi_asetukset (tyyppi, prefiksi, vuosi_formaatti, numeron_pituus, seuraava_numero, is_active)
SELECT 'lasku', 'L', 'YYYY', 4, 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.numerointi_asetukset WHERE tyyppi = 'lasku');

-- Update automatic numbering function to handle invoices
CREATE OR REPLACE FUNCTION public.set_automatic_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF TG_TABLE_NAME = 'asiakkaat' AND NEW.numero IS NULL THEN
    NEW.numero := generate_next_number('asiakas');
  ELSIF TG_TABLE_NAME = 'Huollot' AND NEW.numero IS NULL THEN
    NEW.numero := generate_next_number('huolto');
  ELSIF TG_TABLE_NAME = 'laskut' AND NEW.numero IS NULL THEN
    NEW.numero := generate_next_number('lasku');
  END IF;
  
  RETURN NEW;
END;
$function$;