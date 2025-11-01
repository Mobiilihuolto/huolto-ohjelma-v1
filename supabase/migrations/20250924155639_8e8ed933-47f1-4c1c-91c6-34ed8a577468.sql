-- Add status fields to Huollot table
ALTER TABLE public."Huollot" 
ADD COLUMN status TEXT NOT NULL DEFAULT 'odottaa',
ADD COLUMN valmistunut_pvm TIMESTAMP WITH TIME ZONE,
ADD COLUMN luovutettu_pvm TIMESTAMP WITH TIME ZONE;

-- Add check constraint for valid status values
ALTER TABLE public."Huollot" 
ADD CONSTRAINT huollot_status_check 
CHECK (status IN ('odottaa', 'työn alla', 'valmis', 'luovutettu'));

-- Create index for better status filtering performance
CREATE INDEX idx_huollot_status ON public."Huollot"(status);

-- Update existing records to have 'työn alla' status
UPDATE public."Huollot" SET status = 'työn alla' WHERE status = 'odottaa';