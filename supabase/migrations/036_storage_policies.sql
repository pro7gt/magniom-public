-- 036_storage_policies.sql
-- Storage Buckets, Path Parsers, and Storage Access Policies
-- Conforms to Sections 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 109 of MAGNIOM-Supabase Database & Security Specification v1.0

-- ==========================================
-- 1. Register Private Storage Buckets
-- ==========================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
    INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
    VALUES
      ('clinical-ingest', 'clinical-ingest', false, false, 5368709120, NULL),
      ('clinical-derived', 'clinical-derived', false, false, 5368709120, NULL),
      ('clinical-reports', 'clinical-reports', false, false, 104857600, ARRAY['application/pdf', 'application/json']),
      ('evidence-assets', 'evidence-assets', false, false, 524288000, NULL),
      ('research-derived', 'research-derived', false, false, 5368709120, NULL)
    ON CONFLICT (id) DO UPDATE SET
      public = false,
      file_size_limit = EXCLUDED.file_size_limit;
  END IF;
END $$;

-- ==========================================
-- 2. Storage Path Parsers
-- ==========================================

CREATE OR REPLACE FUNCTION security.storage_org_id(
  p_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
DECLARE
  v_parts TEXT[];
BEGIN
  IF p_name IS NULL OR p_name = '' THEN
    RETURN NULL;
  END IF;

  v_parts := string_to_array(p_name, '/');

  IF array_length(v_parts, 1) < 2 OR v_parts[1] <> 'org' THEN
    RETURN NULL;
  END IF;

  RETURN v_parts[2]::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION security.storage_case_id(
  p_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
DECLARE
  v_parts TEXT[];
BEGIN
  IF p_name IS NULL OR p_name = '' THEN
    RETURN NULL;
  END IF;

  v_parts := string_to_array(p_name, '/');

  IF array_length(v_parts, 1) < 4 OR v_parts[1] <> 'org' OR v_parts[3] <> 'case' THEN
    RETURN NULL;
  END IF;

  RETURN v_parts[4]::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- Build Canonical Storage Path
CREATE OR REPLACE FUNCTION security.build_storage_path(
  p_org_id UUID,
  p_case_id UUID,
  p_sub_type TEXT,
  p_sub_id UUID,
  p_artifact_id UUID,
  p_filename TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
BEGIN
  IF p_sub_type IS NOT NULL AND p_sub_id IS NOT NULL THEN
    RETURN format('org/%s/case/%s/%s/%s/artifact/%s/%s',
      p_org_id, p_case_id, p_sub_type, p_sub_id, p_artifact_id, p_filename);
  ELSE
    RETURN format('org/%s/case/%s/artifact/%s/%s',
      p_org_id, p_case_id, p_artifact_id, p_filename);
  END IF;
END;
$$;

-- ==========================================
-- 3. Storage RLS Policies
-- ==========================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if any
    DROP POLICY IF EXISTS clinical_storage_read ON storage.objects;
    DROP POLICY IF EXISTS clinical_storage_insert ON storage.objects;
    DROP POLICY IF EXISTS service_worker_storage_all ON storage.objects;

    -- Clinical Storage Read Policy
    CREATE POLICY clinical_storage_read
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id IN ('clinical-ingest', 'clinical-derived', 'clinical-reports')
      AND security.has_permission(security.storage_org_id(name), 'case.read')
    );

    -- Clinical Storage Upload Policy
    CREATE POLICY clinical_storage_insert
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id IN ('clinical-ingest', 'clinical-derived', 'clinical-reports')
      AND (
        security.has_permission(security.storage_org_id(name), 'imaging.upload')
        OR security.has_permission(security.storage_org_id(name), 'target.generate')
        OR EXISTS (
          SELECT 1 FROM identity.memberships m
          WHERE m.user_id = auth.uid()
            AND m.organisation_id = security.storage_org_id(name)
            AND m.role = 'service_worker'
            AND m.active = true
        )
      )
    );

    -- Evidence Storage Read Policy (all authenticated users)
    DROP POLICY IF EXISTS evidence_storage_read ON storage.objects;
    CREATE POLICY evidence_storage_read
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'evidence-assets');

    -- Research Storage Policy
    DROP POLICY IF EXISTS research_storage_read ON storage.objects;
    CREATE POLICY research_storage_read
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'research-derived'
      AND security.has_permission(security.storage_org_id(name), 'research.read')
    );
  END IF;
END $$;
