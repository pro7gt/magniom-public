-- 023_evidence_releases.sql
-- Evidence Library Releases and Release Membership
-- Conforms to Section 45, 46 of MAGNIOM-Supabase Database & Security Specification v1.0

CREATE TABLE IF NOT EXISTS evidence.library_releases (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  version TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL
    CHECK (status IN ('draft', 'validation', 'active', 'superseded')),
  manifest_sha256 BYTEA,
  approved_by UUID
    REFERENCES identity.clinicians(id) ON DELETE SET NULL,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS evidence.library_claims (
  library_release_id UUID NOT NULL
    REFERENCES evidence.library_releases(id) ON DELETE CASCADE,
  claim_version_id UUID NOT NULL
    REFERENCES evidence.claim_versions(id) ON DELETE RESTRICT,
  PRIMARY KEY (library_release_id, claim_version_id)
);

CREATE TABLE IF NOT EXISTS evidence.library_circuits (
  library_release_id UUID NOT NULL
    REFERENCES evidence.library_releases(id) ON DELETE CASCADE,
  circuit_version_id UUID NOT NULL
    REFERENCES evidence.circuit_versions(id) ON DELETE RESTRICT,
  PRIMARY KEY (library_release_id, circuit_version_id)
);

CREATE TABLE IF NOT EXISTS evidence.library_target_families (
  library_release_id UUID NOT NULL
    REFERENCES evidence.library_releases(id) ON DELETE CASCADE,
  target_family_version_id UUID NOT NULL
    REFERENCES evidence.target_family_versions(id) ON DELETE RESTRICT,
  PRIMARY KEY (library_release_id, target_family_version_id)
);

-- Trigger: Prevent modification of released active/superseded evidence releases
CREATE OR REPLACE FUNCTION evidence.prevent_active_release_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IN ('active', 'superseded') THEN
    -- Allow status transition from active to superseded only
    IF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status = 'superseded' THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Active and superseded evidence library releases are immutable.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_library_releases_immutable
  BEFORE UPDATE OR DELETE ON evidence.library_releases
  FOR EACH ROW EXECUTE FUNCTION evidence.prevent_active_release_mutation();

-- Enable RLS
ALTER TABLE evidence.library_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence.library_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence.library_circuits ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence.library_target_families ENABLE ROW LEVEL SECURITY;

CREATE POLICY "library_releases_read_policy" ON evidence.library_releases FOR SELECT TO authenticated USING (true);
CREATE POLICY "library_claims_read_policy" ON evidence.library_claims FOR SELECT TO authenticated USING (true);
CREATE POLICY "library_circuits_read_policy" ON evidence.library_circuits FOR SELECT TO authenticated USING (true);
CREATE POLICY "library_target_families_read_policy" ON evidence.library_target_families FOR SELECT TO authenticated USING (true);

CREATE POLICY "library_releases_write_policy" ON evidence.library_releases FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')));

CREATE POLICY "library_claims_write_policy" ON evidence.library_claims FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')));

CREATE POLICY "library_circuits_write_policy" ON evidence.library_circuits FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')));

CREATE POLICY "library_target_families_write_policy" ON evidence.library_target_families FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')));

-- RPC Function: Export an Evidence Release package as a complete self-contained JSON manifest
CREATE OR REPLACE FUNCTION api.export_evidence_release(p_version TEXT)
RETURNS JSONB AS $$
DECLARE
  v_release_id UUID;
  v_result JSONB;
BEGIN
  SELECT id INTO v_release_id
  FROM evidence.library_releases
  WHERE version = p_version;

  IF v_release_id IS NULL THEN
    RAISE EXCEPTION 'Evidence release version % not found.', p_version;
  END IF;

  SELECT jsonb_build_object(
    'releaseVersion', lr.version,
    'status', lr.status,
    'releasedAt', lr.released_at,
    'manifestSha256', encode(lr.manifest_sha256, 'hex'),
    'claims', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', cls.code,
          'version', clv.version,
          'mode', clv.mode,
          'tier', clv.evidence_tier,
          'claimType', clv.claim_type,
          'statement', clv.statement,
          'certainty', clv.certainty,
          'replicationStatus', clv.replication_status,
          'limitations', clv.limitations,
          'sources', (
            SELECT jsonb_agg(
              jsonb_build_object(
                'sourceId', s.id,
                'citation', s.citation_text,
                'doi', s.doi,
                'relationship', cs.relationship
              )
            )
            FROM evidence.claim_sources cs
            JOIN evidence.sources s ON s.id = cs.source_id
            WHERE cs.claim_version_id = clv.id
          )
        )
      )
      FROM evidence.library_claims lc
      JOIN evidence.claim_versions clv ON clv.id = lc.claim_version_id
      JOIN evidence.claim_series cls ON cls.id = clv.claim_series_id
      WHERE lc.library_release_id = lr.id
    ),
    'circuits', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', cs.code,
          'version', cv.version,
          'name', cv.name,
          'tier', cv.evidence_tier,
          'mode', cv.mode,
          'validationStatus', cv.validation_status,
          'circuitDefinition', cv.circuit_definition,
          'connectedClaimCodes', (
            SELECT jsonb_agg(cls.code)
            FROM evidence.circuit_claims cc
            JOIN evidence.claim_versions clv ON clv.id = cc.claim_version_id
            JOIN evidence.claim_series cls ON cls.id = clv.claim_series_id
            WHERE cc.circuit_version_id = cv.id
          )
        )
      )
      FROM evidence.library_circuits lcirc
      JOIN evidence.circuit_versions cv ON cv.id = lcirc.circuit_version_id
      JOIN evidence.circuit_series cs ON cs.id = cv.circuit_series_id
      WHERE lcirc.library_release_id = lr.id
    ),
    'targetFamilies', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', tfs.code,
          'version', tfv.version,
          'name', tfv.name,
          'laterality', tfv.laterality,
          'tier', tfv.evidence_tier,
          'mode', tfv.mode,
          'anatomicalDefinition', tfv.anatomical_definition,
          'candidateGenerationRules', tfv.candidate_generation_rules,
          'connectedCircuitCodes', (
            SELECT jsonb_agg(cs.code)
            FROM evidence.target_family_circuits tfc
            JOIN evidence.circuit_versions cv ON cv.id = tfc.circuit_version_id
            JOIN evidence.circuit_series cs ON cs.id = cv.circuit_series_id
            WHERE tfc.target_family_version_id = tfv.id
          )
        )
      )
      FROM evidence.library_target_families ltf
      JOIN evidence.target_family_versions tfv ON tfv.id = ltf.target_family_version_id
      JOIN evidence.target_family_series tfs ON tfs.id = tfv.target_family_series_id
      WHERE ltf.library_release_id = lr.id
    )
  ) INTO v_result
  FROM evidence.library_releases lr
  WHERE lr.id = v_release_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;
