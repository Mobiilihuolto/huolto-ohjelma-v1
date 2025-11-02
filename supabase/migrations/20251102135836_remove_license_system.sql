/*
  # Remove License System

  1. Changes
    - Drop yritys_lisenssit table if it exists
    - Remove license-related columns from companies table if they exist

  2. Security
    - No RLS changes needed as tables are being removed

  3. Notes
    - This migration safely removes the license system
    - Uses IF EXISTS to prevent errors if tables/columns don't exist
*/

-- Drop the yritys_lisenssit table if it exists
DROP TABLE IF EXISTS yritys_lisenssit CASCADE;

-- Remove license-related columns from companies if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'license_key'
  ) THEN
    ALTER TABLE companies DROP COLUMN license_key;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'license_expires_at'
  ) THEN
    ALTER TABLE companies DROP COLUMN license_expires_at;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'license_status'
  ) THEN
    ALTER TABLE companies DROP COLUMN license_status;
  END IF;
END $$;
