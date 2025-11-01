-- Add sisaltaa_alv column to varaosat table for VAT handling
ALTER TABLE public.varaosat 
ADD COLUMN sisaltaa_alv boolean DEFAULT false;