-- Add foreign key constraint from huolto_varaosat to varaosat
-- This will enable Supabase to understand the relationship between tables

ALTER TABLE public.huolto_varaosat
DROP CONSTRAINT IF EXISTS huolto_varaosat_varaosa_id_fkey;

ALTER TABLE public.huolto_varaosat
ADD CONSTRAINT huolto_varaosat_varaosa_id_fkey 
FOREIGN KEY (varaosa_id) 
REFERENCES public.varaosat(id) 
ON DELETE CASCADE;

-- Also add foreign key for huolto_id if not exists
ALTER TABLE public.huolto_varaosat
DROP CONSTRAINT IF EXISTS huolto_varaosat_huolto_id_fkey;

ALTER TABLE public.huolto_varaosat
ADD CONSTRAINT huolto_varaosat_huolto_id_fkey 
FOREIGN KEY (huolto_id) 
REFERENCES public."Huollot"(id) 
ON DELETE CASCADE;