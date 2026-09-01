-- seed.sql
-- Synthetic test organization and demo clinician seed data

INSERT INTO identity.organizations (id, name, slug, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Magniom Neuromodulation Research Clinic (Synthetic)',
  'magniom-research-clinic',
  true
) ON CONFLICT (slug) DO NOTHING;
