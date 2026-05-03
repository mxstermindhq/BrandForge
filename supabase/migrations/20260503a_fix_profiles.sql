-- Part 1: Fix profiles table columns only
-- Run this first in Supabase SQL Editor

DO $$
BEGIN
  -- Add open_to_offers column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'open_to_offers') THEN
    ALTER TABLE profiles ADD COLUMN open_to_offers BOOLEAN DEFAULT false;
  END IF;

  -- Add preferred_offer_types column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'preferred_offer_types') THEN
    ALTER TABLE profiles ADD COLUMN preferred_offer_types TEXT[] DEFAULT '{}'::TEXT[];
  END IF;

  -- Add min_budget column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'min_budget') THEN
    ALTER TABLE profiles ADD COLUMN min_budget INTEGER;
  END IF;

  -- Add preferred_duration column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'preferred_duration') THEN
    ALTER TABLE profiles ADD COLUMN preferred_duration TEXT;
  END IF;

  -- Add remote_only column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'remote_only') THEN
    ALTER TABLE profiles ADD COLUMN remote_only BOOLEAN DEFAULT false;
  END IF;

  -- Add willing_to_relocate column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'willing_to_relocate') THEN
    ALTER TABLE profiles ADD COLUMN willing_to_relocate BOOLEAN DEFAULT false;
  END IF;

  -- Add notice_period column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'notice_period') THEN
    ALTER TABLE profiles ADD COLUMN notice_period TEXT;
  END IF;

  -- Add desired_roles column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'desired_roles') THEN
    ALTER TABLE profiles ADD COLUMN desired_roles TEXT[] DEFAULT '{}'::TEXT[];
  END IF;

  -- Add portfolio column as JSONB
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'portfolio') THEN
    ALTER TABLE profiles ADD COLUMN portfolio JSONB DEFAULT '[]'::JSONB;
  END IF;
END $$;
