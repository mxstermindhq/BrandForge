-- Fix squads and squad_members tables with proper structure

-- Drop existing tables to ensure clean setup (optional - remove if you want to keep data)
-- DROP TABLE IF EXISTS public.squad_members CASCADE;
-- DROP TABLE IF EXISTS public.squads CASCADE;

-- Create squads table
CREATE TABLE IF NOT EXISTS public.squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'groups',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members INTEGER DEFAULT 5,
  is_public BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disbanded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on squads
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public squads are viewable by everyone" ON public.squads;
DROP POLICY IF EXISTS "Squad owners can update their squads" ON public.squads;
DROP POLICY IF EXISTS "Squad owners can delete their squads" ON public.squads;
DROP POLICY IF EXISTS "Authenticated users can create squads" ON public.squads;

-- Create squads policies
CREATE POLICY "Public squads are viewable by everyone"
  ON public.squads FOR SELECT
  USING (is_public = true OR owner_id = auth.uid());

CREATE POLICY "Squad owners can update their squads"
  ON public.squads FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Squad owners can delete their squads"
  ON public.squads FOR DELETE
  USING (owner_id = auth.uid());

-- Allow authenticated users to create squads (permission check is in app logic)
CREATE POLICY "Authenticated users can create squads"
  ON public.squads FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create squad_members table (using member_id to match app code)
CREATE TABLE IF NOT EXISTS public.squad_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- kept for compatibility
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'officer', 'member')),
  status TEXT DEFAULT 'active',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(squad_id, member_id)
);

-- Enable RLS on squad_members
ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Squad members are viewable by squad members" ON public.squad_members;
DROP POLICY IF EXISTS "Users can join squads" ON public.squad_members;
DROP POLICY IF EXISTS "Users can leave squads" ON public.squad_members;
DROP POLICY IF EXISTS "Squad owners can manage members" ON public.squad_members;

-- Create squad_members policies
CREATE POLICY "Squad members are viewable by everyone"
  ON public.squad_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join public squads"
  ON public.squad_members FOR INSERT
  WITH CHECK (
    member_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.squads s 
      WHERE s.id = squad_id AND s.is_public = true AND s.status = 'active'
    )
  );

-- Update any existing squads to be public and active
UPDATE public.squads SET is_public = true WHERE is_public IS NULL;
UPDATE public.squads SET status = 'active' WHERE status IS NULL;
UPDATE public.squad_members SET status = 'active' WHERE status IS NULL;

CREATE POLICY "Users can leave squads"
  ON public.squad_members FOR DELETE
  USING (member_id = auth.uid());

CREATE POLICY "Squad owners can manage members"
  ON public.squad_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.squad_members sm 
      WHERE sm.squad_id = squad_id 
      AND sm.member_id = auth.uid() 
      AND sm.role = 'owner'
    )
  );

-- Create function to automatically add owner as member
CREATE OR REPLACE FUNCTION add_squad_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.squad_members (squad_id, member_id, user_id, role, status)
  VALUES (NEW.id, NEW.owner_id, NEW.owner_id, 'owner', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS squad_owner_member ON public.squads;

-- Create trigger
CREATE TRIGGER squad_owner_member
  AFTER INSERT ON public.squads
  FOR EACH ROW
  EXECUTE FUNCTION add_squad_owner_as_member();

-- Create function to update squad_members count or timestamp
CREATE OR REPLACE FUNCTION update_squad_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.squads SET updated_at = NOW() WHERE id = NEW.squad_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS squad_member_update ON public.squad_members;

-- Create trigger
CREATE TRIGGER squad_member_update
  AFTER INSERT OR DELETE ON public.squad_members
  FOR EACH ROW
  EXECUTE FUNCTION update_squad_timestamp();

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
