-- Add new fields to asiakkaat table for company information and private notes
ALTER TABLE public.asiakkaat 
ADD COLUMN yksityiset_muistiinpanot TEXT,
ADD COLUMN y_tunnus TEXT,
ADD COLUMN alv_numero TEXT;

-- Add pricing and warranty fields to Huollot table (note the capital H)
ALTER TABLE public."Huollot" 
ADD COLUMN hinnoittelu_tyyppi TEXT DEFAULT 'tuntiveloitus' CHECK (hinnoittelu_tyyppi IN ('tuntiveloitus', 'kertamaksu')),
ADD COLUMN tuntihinta DECIMAL(10,2),
ADD COLUMN kiintea_hinta DECIMAL(10,2),
ADD COLUMN tyoaika_minuutit INTEGER DEFAULT 0,
ADD COLUMN tyotakuu_kuukautta INTEGER,
ADD COLUMN osatakuu_kuukautta INTEGER,
ADD COLUMN ajanlaskuri_kaynnissa BOOLEAN DEFAULT false,
ADD COLUMN ajanlaskuri_aloitettu_pvm TIMESTAMP WITH TIME ZONE;

-- Create pricing settings table
CREATE TABLE public.hinnoittelu_asetukset (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nimi TEXT NOT NULL,
  oletustuntihinta DECIMAL(10,2),
  oletushinnoittelu_tyyppi TEXT DEFAULT 'tuntiveloitus' CHECK (oletushinnoittelu_tyyppi IN ('tuntiveloitus', 'kertamaksu')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on pricing settings
ALTER TABLE public.hinnoittelu_asetukset ENABLE ROW LEVEL SECURITY;

-- Create policy for pricing settings
CREATE POLICY "Allow all access to pricing settings in dev mode" 
ON public.hinnoittelu_asetukset 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create warranty settings table
CREATE TABLE public.takuu_asetukset (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nimi TEXT NOT NULL,
  oletustyotakuu_kuukautta INTEGER,
  oletusosatakuu_kuukautta INTEGER,
  kuvaus TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on warranty settings
ALTER TABLE public.takuu_asetukset ENABLE ROW LEVEL SECURITY;

-- Create policy for warranty settings
CREATE POLICY "Allow all access to warranty settings in dev mode" 
ON public.takuu_asetukset 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add trigger for warranty settings updated_at
CREATE TRIGGER update_takuu_asetukset_updated_at
BEFORE UPDATE ON public.takuu_asetukset
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for pricing settings updated_at
CREATE TRIGGER update_hinnoittelu_asetukset_updated_at
BEFORE UPDATE ON public.hinnoittelu_asetukset
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default pricing setting
INSERT INTO public.hinnoittelu_asetukset (nimi, oletustuntihinta, oletushinnoittelu_tyyppi) 
VALUES ('Oletushinnoittelu', 50.00, 'tuntiveloitus');

-- Insert default warranty settings
INSERT INTO public.takuu_asetukset (nimi, oletustyotakuu_kuukautta, oletusosatakuu_kuukautta, kuvaus) 
VALUES 
('Normaali takuu', 6, 12, 'Normaali työ- ja osatakuu'),
('Pikatakuu', 3, 6, 'Lyhyempi takuu pikatöille'),
('Pidennetty takuu', 12, 24, 'Pidennetty takuu premium-asiakkaille');