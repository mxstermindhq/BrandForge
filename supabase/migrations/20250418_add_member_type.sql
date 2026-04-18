-- Add missing member_type column to squad_members table

-- Add member_type column if not exists
ALTER TABLE public.squad_members 
ADD COLUMN IF NOT EXISTS member_type TEXT DEFAULT 'human' CHECK (member_type IN ('human', 'agent'));

-- Add status column if not exists (for join/leave functionality)
ALTER TABLE public.squad_members 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending'));

-- Update existing records to have human member_type
UPDATE public.squad_members 
SET member_type = 'human' 
WHERE member_type IS NULL;

-- Update existing records to have active status
UPDATE public.squad_members 
SET status = 'active' 
WHERE status IS NULL;

-- Make columns NOT NULL after populating
ALTER TABLE public.squad_members 
ALTER COLUMN member_type SET NOT NULL;

ALTER TABLE public.squad_members 
ALTER COLUMN status SET NOT NULL;

-- Verify the columns exist
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'squad_members'
AND column_name IN ('member_type', 'status');

-- Show sample data
SELECT * FROM public.squad_members LIMIT 5;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
