-- Remove outdated CHECK constraint that limits status values to only 4 old statuses
-- This allows all current statuses (7 total) and any future statuses to be used
-- The application validates statuses through the service_statuses table instead
ALTER TABLE "Huollot" DROP CONSTRAINT IF EXISTS "huollot_status_check";