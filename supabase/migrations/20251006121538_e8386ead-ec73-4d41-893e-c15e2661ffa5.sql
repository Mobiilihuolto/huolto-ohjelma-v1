-- Create notification settings table
CREATE TABLE IF NOT EXISTS public.ilmoitus_asetukset (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  
  -- Service ready notification
  huolto_valmis_kaytossa BOOLEAN NOT NULL DEFAULT false,
  huolto_valmis_pohja TEXT NOT NULL DEFAULT 'Hei [Asiakas], laitteesi [Laite] on valmis noudettavaksi. Terv. [Yritys]',
  
  -- Overdue invoice notification
  lasku_eraantynyt_kaytossa BOOLEAN NOT NULL DEFAULT false,
  lasku_eraantynyt_paivat INTEGER NOT NULL DEFAULT 7,
  lasku_eraantynyt_pohja TEXT NOT NULL DEFAULT 'Hei [Asiakas], laskusi [Numero] on erääntynyt [Päivää] päivää sitten. Summa: [Summa]€. Terv. [Yritys]',
  
  -- Test email
  testiviesti_email TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ilmoitus_asetukset ENABLE ROW LEVEL SECURITY;

-- RLS policy for dev mode (allow all access)
CREATE POLICY "Allow all access to notification settings in dev mode"
  ON public.ilmoitus_asetukset
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_ilmoitus_asetukset_updated_at
  BEFORE UPDATE ON public.ilmoitus_asetukset
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();