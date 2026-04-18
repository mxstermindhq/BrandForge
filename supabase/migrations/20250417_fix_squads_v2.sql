-- Fix squads and squad_members tables - ADD STATUS COLUMN

-- Add status column to squad_members if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'squad_members' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.squad_members ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
END $$;

-- Add status column to squads if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'squads' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.squads ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disbanded'));
  END IF;
END $$;

-- Update existing rows to have status = 'active'
UPDATE public.squad_members SET status = 'active' WHERE status IS NULL;
UPDATE public.squads SET status = 'active' WHERE status IS NULL;

-- Recreate policies to use correct column names
DROP POLICY IF EXISTS "Squad members are viewable by everyone" ON public.squad_members;
DROP POLICY IF EXISTS "Users can join public squads" ON public.squad_members;
DROP POLICY IF EXISTS "Users can leave squads" ON public.squad_members;
DROP POLICY IF EXISTS "Squad owners can manage members" ON public.squad_members;

CREATE POLICY "Squad members are viewable by everyone"
  ON public.squad_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join public squads"
  ON public.squad_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.squads s 
      WHERE s.id = squad_id AND s.is_public = true AND s.status = 'active'
    )
  );

CREATE POLICY "Users can leave squads"
  ON public.squad_members FOR DELETE
  USING (user_id = auth.uid());

-- Fix squads policies too
DROP POLICY IF EXISTS "Public squads are viewable by everyone" ON public.squads;
DROP POLICY IF EXISTS "Squad owners can update their squads" ON public.squads;
DROP POLICY IF EXISTS "Squad owners can delete their squads" ON public.squads;

CREATE POLICY "Public squads are viewable by everyone"
  ON public.squads FOR SELECT
  USING (is_public = true OR owner_id = auth.uid());

CREATE POLICY "Squad owners can update their squads"
  ON public.squads FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Squad owners can delete their squads"
  ON public.squads FOR DELETE
  USING (owner_id = auth.uid());

-- Refresh schema
NOTIFY pgrst, 'reload schema';
