-- Add yksikko (unit) column to hinnoittelu_asetukset table
ALTER TABLE "hinnoittelu_asetukset" 
ADD COLUMN "yksikko" text DEFAULT 'työ';