/*
  # Update ALV rates to 25.5%

  1. Changes
    - Add is_default column to alv_asetukset table
    - Remove old ALV rates (10%, 14%, 24%)
    - Add new default 25.5% ALV rate for all existing companies

  2. Security
    - Maintains existing RLS policies
*/

-- Add is_default column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'alv_asetukset' AND column_name = 'is_default'
  ) THEN
    ALTER TABLE alv_asetukset ADD COLUMN is_default boolean DEFAULT false;
  END IF;
END $$;

-- Delete old ALV rates (10%, 14%, 24%)
DELETE FROM alv_asetukset WHERE prosentti IN (10, 14, 24);

-- Insert new 25.5% ALV rate for each company
INSERT INTO alv_asetukset (company_id, nimi, prosentti, is_active, is_default)
SELECT DISTINCT company_id, 'Suomi ALV 25,5%', 25.5, true, true
FROM alv_asetukset
ON CONFLICT DO NOTHING;

-- If no companies exist yet, we'll handle it in the application
-- The migration above only adds for existing companies