-- 009_phenotype_ontology.sql
-- Phenotype symptom-to-circuit ontology reference models and seed domains
-- Conforms to MAGNIOM-Clinical Phenotype & Symptom-to-Circuit Ontology v1.0

CREATE TABLE IF NOT EXISTS phenotype.instruments (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  total_items INTEGER NOT NULL,
  max_score NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS phenotype.domains (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  primary_circuit_code TEXT NOT NULL,
  evidence_tier evidence.evidence_tier NOT NULL DEFAULT 'T1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS phenotype.symptom_mappings (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  symptom_concept_code TEXT NOT NULL,
  domain_code TEXT NOT NULL
    REFERENCES phenotype.domains(code) ON DELETE CASCADE,
  instrument TEXT NOT NULL,
  item_identifier TEXT NOT NULL,
  mapping_strength NUMERIC NOT NULL DEFAULT 1.0
    CHECK (mapping_strength >= 0 AND mapping_strength <= 1.0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed standardized clinical rating instruments
INSERT INTO phenotype.instruments (code, name, version, total_items, max_score) VALUES
  ('MADRS', 'Montgomery-Åsberg Depression Rating Scale', '1.0', 10, 60),
  ('PHQ-9', 'Patient Health Questionnaire-9', '1.0', 9, 27),
  ('GAD-7', 'Generalized Anxiety Disorder 7-item scale', '1.0', 7, 21),
  ('HAM-D-17', 'Hamilton Depression Rating Scale 17-item', '1.0', 17, 52)
ON CONFLICT (code) DO NOTHING;

-- Seed canonical depression symptom domains
INSERT INTO phenotype.domains (code, name, description, primary_circuit_code, evidence_tier) VALUES
  ('DOMAIN-MDD-DYSPHORIC-001', 'Dysphoric / Low Mood', 'Core depressed mood, sadness, and negative affect mediated by DLPFC-sgACC connectivity', 'CIRCUIT-MDD-LDLPFC-001', 'T1'),
  ('DOMAIN-MDD-ANXIOSOMATIC-001', 'Anxiosomatic / Somatic Tension', 'Anxiety symptoms, autonomic arousal, and somatic tension mediated by fronto-insular and DMPFC connectivity', 'CIRCUIT-MDD-ANXIOSOMATIC-001', 'T1'),
  ('DOMAIN-MDD-ANHEDONIA-001', 'Anhedonia / Reward Deficit', 'Loss of pleasure, interest, and positive affect mediated by striatal-prefrontal reward pathways', 'CIRCUIT-MDD-REWARD-001', 'T2'),
  ('DOMAIN-MDD-RUMINATION-001', 'Rumination / Default Mode Hyperconnectivity', 'Repetitive negative self-referential thought mediated by default mode network and medial prefrontal hubs', 'CIRCUIT-MDD-DMN-001', 'T2')
ON CONFLICT (code) DO NOTHING;

-- Seed symptom item mappings
INSERT INTO phenotype.symptom_mappings (symptom_concept_code, domain_code, instrument, item_identifier, mapping_strength) VALUES
  ('SYM-MDD-REPORTED-SADNESS', 'DOMAIN-MDD-DYSPHORIC-001', 'MADRS', 'item_1_apparent_sadness', 1.0),
  ('SYM-MDD-APPARENT-SADNESS', 'DOMAIN-MDD-DYSPHORIC-001', 'MADRS', 'item_2_reported_sadness', 1.0),
  ('SYM-MDD-INNER-TENSION', 'DOMAIN-MDD-ANXIOSOMATIC-001', 'MADRS', 'item_3_inner_tension', 1.0),
  ('SYM-MDD-ANHEDONIA', 'DOMAIN-MDD-ANHEDONIA-001', 'MADRS', 'item_8_inability_to_feel', 1.0),
  ('SYM-MDD-SOMATIC-ANXIETY', 'DOMAIN-MDD-ANXIOSOMATIC-001', 'GAD-7', 'item_1_nervous_anxious', 0.9),
  ('SYM-MDD-RESTLESSNESS', 'DOMAIN-MDD-ANXIOSOMATIC-001', 'GAD-7', 'item_5_restless', 0.85)
ON CONFLICT DO NOTHING;
