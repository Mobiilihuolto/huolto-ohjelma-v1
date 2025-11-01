-- Create payment methods table
CREATE TABLE public.maksutavat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nimi TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maksutavat ENABLE ROW LEVEL SECURITY;

-- Create policy for full access in dev mode
CREATE POLICY "Allow all access to payment methods in dev mode"
ON public.maksutavat
FOR ALL
USING (true)
WITH CHECK (true);

-- Insert default payment methods
INSERT INTO public.maksutavat (nimi, order_index) VALUES
  ('Käteinen', 1),
  ('Kortti', 2),
  ('Tilisiirto', 3),
  ('MobilePay', 4);

-- Create trigger for updated_at
CREATE TRIGGER update_maksutavat_updated_at
BEFORE UPDATE ON public.maksutavat
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();