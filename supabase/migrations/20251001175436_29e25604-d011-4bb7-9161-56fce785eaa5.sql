-- Create company settings table
CREATE TABLE IF NOT EXISTS public.yrityksen_asetukset (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  yrityksen_nimi text NOT NULL,
  osoite text,
  postinumero text,
  postitoimipaikka text,
  puhelin text,
  email text,
  y_tunnus text,
  alv_numero text,
  logo_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.yrityksen_asetukset ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all access to company settings in dev mode"
  ON public.yrityksen_asetukset
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for company logos
CREATE POLICY "Company logos are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'company-logos');

CREATE POLICY "Authenticated users can upload company logos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'company-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update company logos"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'company-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete company logos"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'company-logos' AND auth.role() = 'authenticated');

-- Add trigger for updated_at
CREATE TRIGGER update_yrityksen_asetukset_updated_at
  BEFORE UPDATE ON public.yrityksen_asetukset
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();