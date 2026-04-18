-- Add missing member_id column to squad_members

-- Add member_id column if not exists
ALTER TABLE public.squad_members 
ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- If user_id exists and member_id is empty, copy user_id to member_id
UPDATE public.squad_members 
SET member_id = user_id 
WHERE member_id IS NULL AND user_id IS NOT NULL;

-- Make member_id NOT NULL after populating
ALTER TABLE public.squad_members 
ALTER COLUMN member_id SET NOT NULL;

-- Verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'squad_members';

-- Show sample data
SELECT * FROM public.squad_members LIMIT 5;

-- Refresh schema
NOTIFY pgrst, 'reload schema';
