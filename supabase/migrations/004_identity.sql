-- 004_identity.sql
-- Core organisations, sites, user profiles, clinicians, memberships
-- Conforms to Sections 11, 12, 13, 14, 15 of MAGNIOM-Supabase Database & Security Specification v1.0

CREATE TABLE IF NOT EXISTS identity.organisations (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS identity.sites (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  organisation_id UUID NOT NULL
    REFERENCES identity.organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Australia/Melbourne',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (organisation_id, name)
);

CREATE TABLE IF NOT EXISTS identity.user_profiles (
  user_id UUID PRIMARY KEY
    REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS identity.clinicians (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  organisation_id UUID NOT NULL
    REFERENCES identity.organisations(id) ON DELETE RESTRICT,
  user_id UUID
    REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  professional_type TEXT NOT NULL DEFAULT 'Psychiatrist',
  registration_identifier TEXT,
  tms_signing_authority BOOLEAN NOT NULL DEFAULT false,
  is_verified_specialist BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS identity.memberships (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  organisation_id UUID NOT NULL
    REFERENCES identity.organisations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL
    REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID
    REFERENCES identity.sites(id) ON DELETE SET NULL,
  role identity.app_role NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (organisation_id, user_id, site_id, role)
);

CREATE INDEX IF NOT EXISTS idx_memberships_user ON identity.memberships(user_id) WHERE active;
CREATE INDEX IF NOT EXISTS idx_memberships_org ON identity.memberships(organisation_id) WHERE active;
CREATE INDEX IF NOT EXISTS idx_clinicians_user ON identity.clinicians(user_id) WHERE active;
CREATE INDEX IF NOT EXISTS idx_clinicians_org ON identity.clinicians(organisation_id) WHERE active;

