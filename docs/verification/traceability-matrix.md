# Forward & Backward Requirements Traceability Matrix v1.0

**Standard Reference:** IEC 62304 Section 5.1.1 / ISO 13485  
**Document Status:** Controlled Engineering Baseline  

---

## Traceability Mapping Table

| Requirement ID | Statement Summary | Design Component | Implementation Target | Verification Test ID | Risk Control ID | Validation Milestone |
|---|---|---|---|---|---|---|
| `MAG-SYS-001` | 3 Primary + 2 Additional Target Slate rule | Domain Model / Engine | `packages/domain/src/types.ts`<br>`packages/target-engine/src/index.ts` | `UT-DOM-001` | `HAZ-001` | M1 (Engineering Prototype) |
| `MAG-CLI-001` | Mandatory confirmed PhenotypeSnapshot | Clinical Workflow Rail | `packages/phenotype/src/index.ts`<br>`supabase/migrations/007_clinical.sql` | `IT-CLI-001` | `HAZ-004` | M1 (Engineering Prototype) |
| `MAG-CLI-002` | Human clinician sole prescriptive authority | Decision Signing View | `packages/domain/src/types.ts`<br>`apps/web/src/app/page.tsx` | `HF-UX-001` | `HAZ-001` | M6 (Clinician Validation) |
| `MAG-PHE-001` | Structured DSM-5 phenotype & symptom scores | Phenotype Ontology | `packages/phenotype/src/index.ts` | `UT-PHE-001` | `HAZ-004` | M1 (Engineering Prototype) |
| `MAG-EVD-001` | Evidence ceiling on target candidates | Evidence Knowledge Store | `packages/evidence/src/index.ts` | `UT-EVD-001` | `HAZ-003` | M1 (Engineering Prototype) |
| `MAG-POL-001` | Target generation bound to ScientificPolicyRelease | Scientific Policy Module | `packages/scientific-policy/src/index.ts` | `UT-POL-001` | `HAZ-003` | M1 (Engineering Prototype) |
| `MAG-IMG-001` | Motion QC qualification (FD < 0.25mm) | Neurocompute Pipeline | `services/neurocompute/magniom_neuro/qc/` | `GC-IMG-001` | `HAZ-003` | M2 (Research Prototype) |
| `MAG-TGT-001` | Deterministic offline target engine execution | Target Engine Core | `packages/target-engine/src/index.ts` | `UT-TGT-001` | `HAZ-002` | M1 (Engineering Prototype) |
| `MAG-UX-031` | No preselected candidate in workspace | Clinician Decision Form | `apps/web/src/app/page.tsx` | `HF-UX-002` | `HAZ-001` | M6 (Clinician Validation) |
| `MAG-DAT-004` | Coordinate space metadata & checksums | Canonical Primitives | `packages/domain/src/types.ts` | `UT-DAT-001` | `HAZ-002` | M1 (Engineering Prototype) |
| `MAG-SEC-012` | Multi-tenant PostgreSQL RLS isolation | Supabase Security Core | `supabase/migrations/006_security_helpers.sql` | `SEC-RLS-001` | `HAZ-005` | M1 (Engineering Prototype) |
| `MAG-WFL-001` | Strict state transitions on clinical cases | Database Triggers / API | `supabase/migrations/004_identity.sql` | `IT-WFL-001` | `HAZ-004` | M1 (Engineering Prototype) |
| `MAG-AUD-001` | Immutable audit trail of clinical actions | Audit Logging Module | `supabase/migrations/002_schemas.sql` | `IT-AUD-001` | `HAZ-001`, `HAZ-005` | M1 (Engineering Prototype) |
| `MAG-REL-001` | Versioned scientific release manifests | Release Governance | `packages/scientific-policy/src/index.ts` | `UT-REL-001` | `HAZ-003` | M1 (Engineering Prototype) |
| `MAG-VAL-001` | Automated regression against Golden Cases G01–G05 | Golden Case Harness | `packages/test-fixtures/src/index.ts` | `GC-REG-001` | `HAZ-002`, `HAZ-003` | M1 (Engineering Prototype) |
