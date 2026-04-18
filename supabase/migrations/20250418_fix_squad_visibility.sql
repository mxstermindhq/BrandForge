-- Fix squad visibility issues

-- Ensure all existing squads are public and active
UPDATE public.squads 
SET is_public = true, status = 'active' 
WHERE is_public IS NULL OR status IS NULL;

-- Ensure all squad_members have active status
UPDATE public.squad_members 
SET status = 'active' 
WHERE status IS NULL;

-- Fix the SELECT policy to show ALL squads to authenticated users (not just public)
DROP POLICY IF EXISTS "Public squads are viewable by everyone" ON public.squads;

CREATE POLICY "Squads are viewable by authenticated users"
  ON public.squads FOR SELECT
  TO authenticated
  USING (true);

-- Also allow anon users to see public squads
DROP POLICY IF EXISTS "Public squads viewable by anon" ON public.squads;

CREATE POLICY "Public squads viewable by anon"
  ON public.squads FOR SELECT
  TO anon
  USING (is_public = true AND status = 'active');

-- Ensure squad_members SELECT policy is permissive
DROP POLICY IF EXISTS "Squad members are viewable by everyone" ON public.squad_members;

CREATE POLICY "Squad members viewable by authenticated"
  ON public.squad_members FOR SELECT
  TO authenticated
  USING (true);

-- Debug: Check current squads
SELECT id, name, owner_id, is_public, status, created_at 
FROM public.squads 
ORDER BY created_at DESC 
LIMIT 10;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
