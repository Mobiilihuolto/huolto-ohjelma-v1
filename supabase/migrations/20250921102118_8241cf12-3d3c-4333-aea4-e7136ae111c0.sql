-- Enable Row Level Security on all tables
ALTER TABLE public.asiakkaat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Laitteet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Huollot ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for asiakkaat table
CREATE POLICY "Allow all operations on asiakkaat" ON public.asiakkaat
FOR ALL USING (true) WITH CHECK (true);

-- Create basic RLS policies for Laitteet table  
CREATE POLICY "Allow all operations on Laitteet" ON public.Laitteet
FOR ALL USING (true) WITH CHECK (true);

-- Create basic RLS policies for Huollot table
CREATE POLICY "Allow all operations on Huollot" ON public.Huollot
FOR ALL USING (true) WITH CHECK (true);