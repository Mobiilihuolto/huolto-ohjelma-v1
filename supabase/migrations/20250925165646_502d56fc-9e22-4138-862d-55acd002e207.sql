-- Luo tekniikoiden taulu
CREATE TABLE public.tekniikat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nimi TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Lisää teknikon muistiinpanot, teknikko ja arviointipäivä Huollot-tauluun
ALTER TABLE public."Huollot" 
ADD COLUMN teknikon_muistiinpanot TEXT,
ADD COLUMN teknikko_id UUID REFERENCES public.tekniikat(id),
ADD COLUMN arvioitu_valmistumispvm DATE;

-- Lisää trigger tekniikoiden päivittämiseen
CREATE TRIGGER update_tekniikat_updated_at
BEFORE UPDATE ON public.tekniikat
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Ota käyttöön RLS tekniikoille
ALTER TABLE public.tekniikat ENABLE ROW LEVEL SECURITY;

-- Luo RLS-policy tekniikoille (dev mode - salli kaikki)
CREATE POLICY "Allow all access to technicians in dev mode"
ON public.tekniikat 
FOR ALL 
USING (true) 
WITH CHECK (true);