/*
  # Add Foreign Key Between huollot and laitteet

  1. Changes
    - Add foreign key constraint from huollot.laite_id to laitteet.id
    - This enables Supabase to recognize the relationship for JOIN queries
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'huollot_laite_id_fkey'
  ) THEN
    ALTER TABLE huollot 
    ADD CONSTRAINT huollot_laite_id_fkey 
    FOREIGN KEY (laite_id) 
    REFERENCES laitteet(id) 
    ON DELETE SET NULL;
  END IF;
END $$;