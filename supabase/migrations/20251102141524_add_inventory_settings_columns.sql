/*
  # Add Missing Inventory Settings Columns
  
  1. Changes
    - Add `varasto_kaytossa` column to enable/disable inventory feature
    - Add `automaattinen_saldo_vahennys` column for automatic stock deduction
    - Add `varoita_matalasta_saldosta` column for low stock warnings
    - Map existing `ilmoita_alhaisesta_saldosta` functionality
  
  2. Migration Strategy
    - Add new columns with proper defaults
    - Preserve existing data
    - Update existing rows to use new column structure
  
  3. Security
    - No RLS changes needed (policies already exist)
*/

-- Add the missing columns to varasto_asetukset table
DO $$ 
BEGIN
  -- Add varasto_kaytossa column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'varasto_asetukset' AND column_name = 'varasto_kaytossa'
  ) THEN
    ALTER TABLE public.varasto_asetukset 
    ADD COLUMN varasto_kaytossa boolean DEFAULT false;
  END IF;

  -- Add automaattinen_saldo_vahennys column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'varasto_asetukset' AND column_name = 'automaattinen_saldo_vahennys'
  ) THEN
    ALTER TABLE public.varasto_asetukset 
    ADD COLUMN automaattinen_saldo_vahennys boolean DEFAULT true;
  END IF;

  -- Add varoita_matalasta_saldosta column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'varasto_asetukset' AND column_name = 'varoita_matalasta_saldosta'
  ) THEN
    ALTER TABLE public.varasto_asetukset 
    ADD COLUMN varoita_matalasta_saldosta boolean DEFAULT true;
  END IF;
END $$;

-- Update existing rows to sync old column value to new column
UPDATE public.varasto_asetukset 
SET varoita_matalasta_saldosta = COALESCE(ilmoita_alhaisesta_saldosta, true)
WHERE varoita_matalasta_saldosta IS NULL;

-- Set varasto_kaytossa to true for existing companies (they likely want it enabled)
UPDATE public.varasto_asetukset 
SET varasto_kaytossa = true
WHERE varasto_kaytossa IS NULL;