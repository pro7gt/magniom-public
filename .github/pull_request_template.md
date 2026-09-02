## Summary & Motivation

<!-- What changed and why? -->

## Change Classification

<!-- Select all that apply per MAGNIOM Verification Spec Section 15 -->

- [ ] `C0_DOCS` (Documentation, non-code changes)
- [ ] `C1_PRESENTATION` (UI / Layout / Styling)
- [ ] `C2_APPLICATION` (Application flow, routing, state)
- [ ] `C3_DATABASE_RLS` (Supabase migrations, security policies, SQL triggers)
- [ ] `C4_TARGET_ENGINE` (Deterministic scoring, candidate ranking)
- [ ] `C5_SCIENTIFIC_POLICY` (Evidence thresholds, confidence intervals)
- [ ] `C6_PHENOTYPE_ONTOLOGY` (Symptom-to-circuit mapping)
- [ ] `C7_NEUROCOMPUTE` (MRI / BIDS / connectome processing)
- [ ] `C8_SECURITY_INFRA` (Auth, SBOM, CI/CD workflows, secrets)
- [ ] `C9_WORKFLOW_WORKER` (Asynchronous processing, queue contracts)
- [ ] `C10_CLINICAL_RELEASE` (Release candidate tag, promotion manifest)

## Traceability Links

- **Linked Requirements:** <!-- e.g., MAG-TGT-001, MAG-SEC-009, MAG-UX-041 -->
- **Linked Hazards / Risks:** <!-- e.g., HAZ-001, HAZ-004, AB-03 Automation Bias -->

## Scientific Materiality Gating (S0–S3)

- [ ] **Scientific Change Declared:** Yes / No
- **Expected Golden Case Impact:** <!-- None / List cases: G01, G02, G04, G05, G07 -->
- **Spatial Shift (Δmm):** <!-- Expected maximum coordinate shift -->
- **Score Shift (Δscore):** <!-- Expected maximum score shift -->

## Impact Checklist

- [ ] **Database Migration:** Migrations audited from zero state; RLS enabled and tested.
- [ ] **Security & Secret Hygiene:** No secrets committed; SBOM and CVE checks pass.
- [ ] **Target Engine Determinism:** No `Math.random()`, `Date.now()`, or network calls in pure domain.
- [ ] **Human Factors / Visual Safety:** Anti-bias layout preserved; no default candidate pre-selection.
- [ ] **Unit & Property Tests:** Vitest unit tests and fast-check invariants pass.
- [ ] **Rollback Plan:** Release manifest / backward compatibility considered.
