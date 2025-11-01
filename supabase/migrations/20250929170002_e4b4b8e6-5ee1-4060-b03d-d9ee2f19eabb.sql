-- Create parts/inventory table for warehouse management
CREATE TABLE public.varaosat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nimi TEXT NOT NULL,
  kuvaus TEXT,
  hinta NUMERIC NOT NULL DEFAULT 0,
  saldo INTEGER NOT NULL DEFAULT 0,
  minimisaldo INTEGER DEFAULT 0,
  yksikko TEXT DEFAULT 'kpl',
  toimittaja TEXT,
  tuotekoodi TEXT,
  kategoria TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.varaosat ENABLE ROW LEVEL SECURITY;

-- Create policies for parts access
CREATE POLICY "Allow all access to parts in dev mode" 
ON public.varaosat 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_varaosat_updated_at
BEFORE UPDATE ON public.varaosat
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create a table to track parts used in services
CREATE TABLE public.huolto_varaosat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  huolto_id UUID NOT NULL,
  varaosa_id UUID NOT NULL,
  maara INTEGER NOT NULL DEFAULT 1,
  yksikkohinta NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for service parts
ALTER TABLE public.huolto_varaosat ENABLE ROW LEVEL SECURITY;

-- Create policies for service parts
CREATE POLICY "Allow all access to service parts in dev mode" 
ON public.huolto_varaosat 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create inventory setting to enable/disable inventory usage
CREATE TABLE public.varasto_asetukset (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  varasto_kaytossa BOOLEAN NOT NULL DEFAULT false,
  automaattinen_saldo_vahennys BOOLEAN NOT NULL DEFAULT true,
  varoita_matalasta_saldosta BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for inventory settings
ALTER TABLE public.varasto_asetukset ENABLE ROW LEVEL SECURITY;

-- Create policies for inventory settings
CREATE POLICY "Allow all access to inventory settings in dev mode" 
ON public.varasto_asetukset 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_varasto_asetukset_updated_at
BEFORE UPDATE ON public.varasto_asetukset
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default inventory settings (disabled by default)
INSERT INTO public.varasto_asetukset (varasto_kaytossa) VALUES (false);