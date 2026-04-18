-- Create user_agents table for the agents marketplace
CREATE TABLE IF NOT EXISTS public.user_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'smart_toy',
  category TEXT DEFAULT 'creative',
  capabilities TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'idle' CHECK (status IN ('active', 'idle', 'busy', 'archived')),
  projects_completed INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  is_rentable BOOLEAN DEFAULT false,
  rent_price_honor INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_agents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own agents"
  ON public.user_agents FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can view rentable agents"
  ON public.user_agents FOR SELECT
  USING (is_rentable = true AND status != 'archived');

CREATE POLICY "Users can create agents"
  ON public.user_agents FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own agents"
  ON public.user_agents FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own agents"
  ON public.user_agents FOR DELETE
  USING (owner_id = auth.uid());

-- Create agent_rentals table
CREATE TABLE IF NOT EXISTS public.agent_rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  renter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.user_agents(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  price_honor INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.agent_rentals ENABLE ROW LEVEL SECURITY;

-- Create squads table
CREATE TABLE IF NOT EXISTS public.squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'groups',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members INTEGER DEFAULT 5,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;

-- Create squad_members table
CREATE TABLE IF NOT EXISTS public.squad_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'officer', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(squad_id, user_id)
);

-- Enable RLS
ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;

-- Squad policies
CREATE POLICY "Public squads are viewable by everyone"
  ON public.squads FOR SELECT
  USING (is_public = true);

CREATE POLICY "Squad owners can update their squads"
  ON public.squads FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Squad owners can delete their squads"
  ON public.squads FOR DELETE
  USING (owner_id = auth.uid());

-- Squad members policies
CREATE POLICY "Squad members are viewable by squad members"
  ON public.squad_members FOR SELECT
  USING (
    squad_id IN (
      SELECT squad_id FROM public.squad_members WHERE user_id = auth.uid()
    )
  );

-- Create function to refresh schema cache
CREATE OR REPLACE FUNCTION refresh_schema_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This forces Supabase to refresh its schema cache
  PERFORM pg_catalog.pg_reload_conf();
END;
$$;
