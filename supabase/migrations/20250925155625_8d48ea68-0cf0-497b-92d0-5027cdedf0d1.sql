-- Add numbering columns to customers and services
ALTER TABLE asiakkaat ADD COLUMN numero TEXT;
ALTER TABLE "Huollot" ADD COLUMN numero TEXT;

-- Create numbering settings table
CREATE TABLE public.numerointi_asetukset (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tyyppi TEXT NOT NULL, -- 'asiakas' or 'huolto'
  prefiksi TEXT NOT NULL DEFAULT 'A',
  vuosi_formaatti TEXT NOT NULL DEFAULT 'YYYY', -- YYYY or YY
  numeron_pituus INTEGER NOT NULL DEFAULT 4,
  seuraava_numero INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.numerointi_asetukset ENABLE ROW LEVEL SECURITY;

-- Create policy for numbering settings
CREATE POLICY "Allow all access to numbering settings in dev mode" 
ON public.numerointi_asetukset 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Insert default numbering settings
INSERT INTO public.numerointi_asetukset (tyyppi, prefiksi, vuosi_formaatti, numeron_pituus, seuraava_numero)
VALUES 
  ('asiakas', 'A', 'YYYY', 4, 1),
  ('huolto', 'H', 'YYYY', 4, 1);

-- Create function to generate next number
CREATE OR REPLACE FUNCTION public.generate_next_number(entity_type TEXT)
RETURNS TEXT AS $$
DECLARE
  settings RECORD;
  next_num INTEGER;
  formatted_year TEXT;
  padded_number TEXT;
  result_number TEXT;
BEGIN
  -- Get settings for entity type
  SELECT * INTO settings 
  FROM public.numerointi_asetukset 
  WHERE tyyppi = entity_type AND is_active = true 
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active numbering settings found for type: %', entity_type;
  END IF;
  
  -- Get current next number and increment it
  next_num := settings.seuraava_numero;
  
  -- Update the next number
  UPDATE public.numerointi_asetukset 
  SET seuraava_numero = next_num + 1,
      updated_at = now()
  WHERE id = settings.id;
  
  -- Format year
  IF settings.vuosi_formaatti = 'YY' THEN
    formatted_year := EXTRACT(YEAR FROM now())::TEXT;
    formatted_year := RIGHT(formatted_year, 2);
  ELSE
    formatted_year := EXTRACT(YEAR FROM now())::TEXT;
  END IF;
  
  -- Pad number with zeros
  padded_number := LPAD(next_num::TEXT, settings.numeron_pituus, '0');
  
  -- Create final number
  result_number := settings.prefiksi || formatted_year || '-' || padded_number;
  
  RETURN result_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add trigger for automatic numbering on insert
CREATE OR REPLACE FUNCTION public.set_automatic_number()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'asiakkaat' AND NEW.numero IS NULL THEN
    NEW.numero := generate_next_number('asiakas');
  ELSIF TG_TABLE_NAME = 'Huollot' AND NEW.numero IS NULL THEN
    NEW.numero := generate_next_number('huolto');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers
CREATE TRIGGER set_customer_number
  BEFORE INSERT ON public.asiakkaat
  FOR EACH ROW
  EXECUTE FUNCTION public.set_automatic_number();

CREATE TRIGGER set_service_number
  BEFORE INSERT ON public."Huollot"
  FOR EACH ROW
  EXECUTE FUNCTION public.set_automatic_number();

-- Add trigger for numbering settings updated_at
CREATE TRIGGER update_numerointi_asetukset_updated_at
  BEFORE UPDATE ON public.numerointi_asetukset
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();