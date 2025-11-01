-- Create table for custom service statuses
CREATE TABLE public.service_statuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6b7280', -- hex color
  order_index INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_statuses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all access to service statuses in dev mode" 
ON public.service_statuses 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Insert default statuses
INSERT INTO public.service_statuses (name, color, order_index, is_default) VALUES
('odottaa', '#6b7280', 1, false),
('työn alla', '#f59e0b', 2, true),
('valmis', '#10b981', 3, false),
('luovutettu', '#8b5cf6', 4, false);

-- Create trigger for updating timestamps
CREATE TRIGGER update_service_statuses_updated_at
BEFORE UPDATE ON public.service_statuses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();