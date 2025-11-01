-- Add RLS policies for company-logos storage bucket

-- Allow all access to company logos in dev mode
CREATE POLICY "Allow all uploads to company-logos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'company-logos');

CREATE POLICY "Allow all updates to company-logos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'company-logos');

CREATE POLICY "Allow all deletes from company-logos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'company-logos');

CREATE POLICY "Allow all reads from company-logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'company-logos');