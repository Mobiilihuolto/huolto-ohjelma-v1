-- Add signature fields to Huollot table
ALTER TABLE "Huollot" 
ADD COLUMN teknikko_allekirjoitus TEXT,
ADD COLUMN asiakas_allekirjoitus TEXT;

COMMENT ON COLUMN "Huollot".teknikko_allekirjoitus IS 'Base64-encoded signature image from technician';
COMMENT ON COLUMN "Huollot".asiakas_allekirjoitus IS 'Base64-encoded signature image from customer';