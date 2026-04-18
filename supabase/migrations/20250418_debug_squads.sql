-- Debug and fix squad visibility

-- 1. Check current squads and their status
SELECT 'SQUADS COUNT' as info, COUNT(*) as count FROM public.squads;
SELECT 'SQUAD_MEMBERS COUNT' as info, COUNT(*) as count FROM public.squad_members;

-- 2. Show recent squads
SELECT id, name, owner_id, is_public, status, created_at 
FROM public.squads 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Show recent squad_members
SELECT id, squad_id, member_id, user_id, role, status, joined_at
FROM public.squad_members
ORDER BY joined_at DESC
LIMIT 5;

-- 4. Fix any squads with missing status
UPDATE public.squads SET status = 'active' WHERE status IS NULL;
UPDATE public.squads SET is_public = true WHERE is_public IS NULL;

-- 5. Fix any squad_members with missing status
UPDATE public.squad_members SET status = 'active' WHERE status IS NULL;

-- 6. Ensure the owner is always a member (for any squads missing owner membership)
INSERT INTO public.squad_members (squad_id, member_id, user_id, role, status)
SELECT 
  s.id as squad_id,
  s.owner_id as member_id,
  s.owner_id as user_id,
  'owner' as role,
  'active' as status
FROM public.squads s
LEFT JOIN public.squad_members sm ON s.id = sm.squad_id AND sm.member_id = s.owner_id
WHERE sm.id IS NULL;

-- 7. Verify policies exist and are correct
-- Drop and recreate SELECT policy to ensure it's permissive
DROP POLICY IF EXISTS "Squads are viewable by authenticated users" ON public.squads;
DROP POLICY IF EXISTS "Public squads viewable by anon" ON public.squads;
DROP POLICY IF EXISTS "Public squads are viewable by everyone" ON public.squads;

-- Allow all authenticated users to see all squads
CREATE POLICY "Squads are viewable by authenticated users"
  ON public.squads FOR SELECT
  TO authenticated
  USING (true);

-- Allow anon users to see public active squads
CREATE POLICY "Public squads viewable by anon"
  ON public.squads FOR SELECT
  TO anon
  USING (is_public = true AND status = 'active');

-- Fix squad_members policies
DROP POLICY IF EXISTS "Squad members viewable by authenticated" ON public.squad_members;
DROP POLICY IF EXISTS "Squad members are viewable by everyone" ON public.squad_members;

-- Allow all authenticated users to see all squad members
CREATE POLICY "Squad members viewable by authenticated"
  ON public.squad_members FOR SELECT
  TO authenticated
  USING (true);

-- 8. Verify the trigger exists and is working
DROP TRIGGER IF EXISTS squad_owner_member ON public.squads;

-- Recreate the trigger function to ensure it's correct
CREATE OR REPLACE FUNCTION add_squad_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.squad_members (squad_id, member_id, user_id, role, status)
  VALUES (NEW.id, NEW.owner_id, NEW.owner_id, 'owner', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER squad_owner_member
  AFTER INSERT ON public.squads
  FOR EACH ROW
  EXECUTE FUNCTION add_squad_owner_as_member();

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Final verification
SELECT 'SQUADS AFTER FIX' as info, COUNT(*) as count FROM public.squads;
SELECT 'SQUAD_MEMBERS AFTER FIX' as info, COUNT(*) as count FROM public.squad_members;
