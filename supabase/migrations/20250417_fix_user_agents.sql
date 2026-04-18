-- Fix user_agents table - add missing columns

-- First, ensure the table exists with all required columns
DO $$
BEGIN
  -- Create table if not exists
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
    rent_price_honor INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Add config_json column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_agents' 
    AND column_name = 'config_json'
  ) THEN
    ALTER TABLE public.user_agents ADD COLUMN config_json JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- Add system_prompt column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_agents' 
    AND column_name = 'system_prompt'
  ) THEN
    ALTER TABLE public.user_agents ADD COLUMN system_prompt TEXT DEFAULT '';
  END IF;

  -- Add renter_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_agents' 
    AND column_name = 'renter_id'
  ) THEN
    ALTER TABLE public.user_agents ADD COLUMN renter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  -- Add rented_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_agents' 
    AND column_name = 'rented_at'
  ) THEN
    ALTER TABLE public.user_agents ADD COLUMN rented_at TIMESTAMPTZ;
  END IF;
END $$;

-- Enable RLS (if not already enabled)
ALTER TABLE public.user_agents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own agents" ON public.user_agents;
DROP POLICY IF EXISTS "Users can view rentable agents" ON public.user_agents;
DROP POLICY IF EXISTS "Users can create agents" ON public.user_agents;
DROP POLICY IF EXISTS "Users can update their own agents" ON public.user_agents;
DROP POLICY IF EXISTS "Users can delete their own agents" ON public.user_agents;

-- Create policies
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

-- Create squad_members table if not exists
CREATE TABLE IF NOT EXISTS public.squad_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'officer', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(squad_id, user_id)
);

-- Enable RLS on squad_members
ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;

-- Drop existing squad_members policies
DROP POLICY IF EXISTS "Squad members are viewable by squad members" ON public.squad_members;

-- Create squad_members policies
CREATE POLICY "Squad members are viewable by squad members"
  ON public.squad_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.squad_members sm 
      WHERE sm.squad_id = squad_id AND sm.user_id = auth.uid()
    )
  );

-- Create squads table if not exists
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

-- Enable RLS on squads
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;

-- Drop existing squads policies
DROP POLICY IF EXISTS "Public squads are viewable by everyone" ON public.squads;
DROP POLICY IF EXISTS "Squad owners can update their squads" ON public.squads;
DROP POLICY IF EXISTS "Squad owners can delete their squads" ON public.squads;

-- Create squads policies
CREATE POLICY "Public squads are viewable by everyone"
  ON public.squads FOR SELECT
  USING (is_public = true);

CREATE POLICY "Squad owners can update their squads"
  ON public.squads FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Squad owners can delete their squads"
  ON public.squads FOR DELETE
  USING (owner_id = auth.uid());

-- Create agent_rentals table if not exists
CREATE TABLE IF NOT EXISTS public.agent_rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  renter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.user_agents(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  price_honor INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on agent_rentals
ALTER TABLE public.agent_rentals ENABLE ROW LEVEL SECURITY;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
