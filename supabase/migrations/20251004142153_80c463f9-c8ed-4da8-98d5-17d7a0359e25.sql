-- Luo taulu laitevalmistajille
CREATE TABLE IF NOT EXISTS public.laite_valmistajat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nimi TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ota RLS käyttöön
ALTER TABLE public.laite_valmistajat ENABLE ROW LEVEL SECURITY;

-- Luo policy kehitystilaan
CREATE POLICY "Allow all access to manufacturers in dev mode"
ON public.laite_valmistajat
FOR ALL
USING (true)
WITH CHECK (true);

-- Lisää trigger updated_at-kentän päivitykseen
CREATE TRIGGER update_laite_valmistajat_updated_at
BEFORE UPDATE ON public.laite_valmistajat
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Lisää oletusarvoisesti yleisimmät valmistajat
INSERT INTO public.laite_valmistajat (nimi, order_index) VALUES
  ('Apple', 0),
  ('Samsung', 1),
  ('Huawei', 2),
  ('Xiaomi', 3),
  ('OnePlus', 4),
  ('Google', 5),
  ('Sony', 6),
  ('LG', 7),
  ('Nokia', 8),
  ('Motorola', 9),
  ('Asus', 10),
  ('Lenovo', 11),
  ('HP', 12),
  ('Dell', 13),
  ('Acer', 14);