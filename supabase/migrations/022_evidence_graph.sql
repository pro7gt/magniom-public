-- 022_evidence_graph.sql
-- Search Spaces, Target Definitions, Graph Traversal Functions, and Views
-- Conforms to Section 116-121, 134-137 of MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v1.0

CREATE TABLE IF NOT EXISTS evidence.search_spaces (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  target_family_series_id UUID NOT NULL
    REFERENCES evidence.target_family_series(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hemisphere TEXT NOT NULL CHECK (hemisphere IN ('L', 'R', 'bilateral')),
  coordinate_space TEXT NOT NULL DEFAULT 'MNI152NLin2009cAsym',
  description TEXT NOT NULL,
  mask_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS evidence.target_definitions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  target_family_series_id UUID NOT NULL
    REFERENCES evidence.target_family_series(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_type TEXT NOT NULL
    CHECK (target_type IN ('group_reference', 'individualized_rule', 'anatomical_landmark', 'scalp_landmark')),
  mni_coordinate JSONB NOT NULL,
  hcp_parcel TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE evidence.search_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence.target_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "search_spaces_read_policy" ON evidence.search_spaces FOR SELECT TO authenticated USING (true);
CREATE POLICY "target_definitions_read_policy" ON evidence.target_definitions FOR SELECT TO authenticated USING (true);

CREATE POLICY "search_spaces_write_policy" ON evidence.search_spaces FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')));

CREATE POLICY "target_definitions_write_policy" ON evidence.target_definitions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')));

-- Function: Compute Evidence Ceiling for a given Target Family Code
CREATE OR REPLACE FUNCTION evidence.get_evidence_ceiling(p_family_code TEXT)
RETURNS evidence.evidence_tier AS $$
DECLARE
  v_tier evidence.evidence_tier;
BEGIN
  -- Determine highest evidence tier across connected circuits and claims
  SELECT tfv.evidence_tier INTO v_tier
  FROM evidence.target_family_series tfs
  JOIN evidence.target_family_versions tfv ON tfv.target_family_series_id = tfs.id
  WHERE tfs.code = p_family_code
  ORDER BY tfv.created_at DESC
  LIMIT 1;

  IF v_tier IS NULL THEN
    RETURN 'T_EXP'::evidence.evidence_tier;
  END IF;

  RETURN v_tier;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Retrieve full structured Evidence Path for a Target Family
CREATE OR REPLACE FUNCTION evidence.get_evidence_path(p_family_code TEXT)
RETURNS TABLE (
  target_family_code TEXT,
  target_family_name TEXT,
  circuit_code TEXT,
  circuit_name TEXT,
  claim_code TEXT,
  claim_statement TEXT,
  claim_tier evidence.evidence_tier,
  source_citation TEXT,
  source_doi TEXT,
  relationship TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tfs.code AS target_family_code,
    tfv.name AS target_family_name,
    cs.code AS circuit_code,
    cv.name AS circuit_name,
    cls.code AS claim_code,
    clv.statement AS claim_statement,
    clv.evidence_tier AS claim_tier,
    s.citation_text AS source_citation,
    s.doi AS source_doi,
    csource.relationship
  FROM evidence.target_family_series tfs
  JOIN evidence.target_family_versions tfv ON tfv.target_family_series_id = tfs.id
  JOIN evidence.target_family_circuits tfc ON tfc.target_family_version_id = tfv.id
  JOIN evidence.circuit_versions cv ON cv.id = tfc.circuit_version_id
  JOIN evidence.circuit_series cs ON cs.id = cv.circuit_series_id
  JOIN evidence.circuit_claims cclm ON cclm.circuit_version_id = cv.id
  JOIN evidence.claim_versions clv ON clv.id = cclm.claim_version_id
  JOIN evidence.claim_series cls ON cls.id = clv.claim_series_id
  JOIN evidence.claim_sources csource ON csource.claim_version_id = clv.id
  JOIN evidence.sources s ON s.id = csource.source_id
  WHERE tfs.code = p_family_code
  ORDER BY clv.evidence_tier ASC, s.publication_year DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- View: Active Evidence Knowledge Graph
CREATE OR REPLACE VIEW evidence.v_active_graph AS
SELECT
  tfs.code AS target_family_code,
  tfv.name AS target_family_name,
  tfv.evidence_tier AS target_family_tier,
  tfv.mode AS target_family_mode,
  cs.code AS circuit_code,
  cv.name AS circuit_name,
  cv.evidence_tier AS circuit_tier,
  cls.code AS claim_code,
  clv.statement AS claim_statement,
  clv.evidence_tier AS claim_tier,
  clv.certainty AS claim_certainty,
  s.id AS source_id,
  s.citation_text AS source_citation,
  s.doi AS source_doi,
  csource.relationship AS source_relationship
FROM evidence.target_family_series tfs
JOIN evidence.target_family_versions tfv ON tfv.target_family_series_id = tfs.id
LEFT JOIN evidence.target_family_circuits tfc ON tfc.target_family_version_id = tfv.id
LEFT JOIN evidence.circuit_versions cv ON cv.id = tfc.circuit_version_id
LEFT JOIN evidence.circuit_series cs ON cs.id = cv.circuit_series_id
LEFT JOIN evidence.circuit_claims cclm ON cclm.circuit_version_id = cv.id
LEFT JOIN evidence.claim_versions clv ON clv.id = cclm.claim_version_id
LEFT JOIN evidence.claim_series cls ON cls.id = clv.claim_series_id
LEFT JOIN evidence.claim_sources csource ON csource.claim_version_id = clv.id
LEFT JOIN evidence.sources s ON s.id = csource.source_id;
