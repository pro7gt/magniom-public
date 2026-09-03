# Forward & Backward Requirements Traceability Matrix v2.0 (Phase 0 Controlled Baseline)

**Standard Reference:** IEC 62304:2006+AMD1:2015 §5.1.1 / ISO 13485:2016 §7.3.3 / ISO 14971:2019 / HIPAA Security Rule  
**Document Status:** Controlled Requirements Traceability Baseline — Frozen for v2 Implementation  
**Sealing Date:** 2026-09-03  
**Total Requirements Traced:** 332 (96 Critical, 5 Major, 231 Standard across 20 Domains)  
**Historical Continuity:** Preserves and extends the v1 verification matrix (412 requirements) without modifying historical release records.

---

## 1. Traceability Architecture & Methodology

Per **Section 15 — v2 REQUIREMENTS BASELINE** of [MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0.md](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Implementation%20&%20Multi-Indication%20Validation%20Roadmap%20v2.0.md), every Critical requirement is mapped through the complete 6-link traceability chain:

```text
Requirement
   ↓
Design
   ↓
Implementation
   ↓
Verification
   ↓
Risk Control
   ↓
Validation Evidence
```

1. **Requirement:** Normative ID and requirement statement from [MAGNIOM-System Requirements Specification v2.0.md](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-System%20Requirements%20Specification%20v2.0.md).
2. **Design:** Architectural specification and component definition in the 7 Canonical Design Inputs.
3. **Implementation:** Concrete repository packages, migrations, workers, or application files.
4. **Verification:** Test harness, automated script, unit test, or integration test ID.
5. **Risk Control:** Linked hazard mitigation from [docs/risk-management/risk-register.json](file:///home/owner/Downloads/Magniom/docs/risk-management/risk-register.json) (`HAZ-001` through `HAZ-020`).
6. **Validation Evidence:** Golden Case fixture, retrospective study, or platform validation milestone (M0–M8 / Q0–Q5).

---

## 2. v2 Domain Summary

| Domain | Prefix | Total | Critical | Major | Standard | Primary Specification Source | Coverage Status |
|---|---|---|---|---|---|---|---|
| **System-wide** | `MAG-SYS` | 12 | 10 | 2 | 0 | System Requirements Spec v2.0 §9 | ✅ 100% Traced |
| **Clinical Workflow** | `MAG-CLI` | 12 | 9 | 3 | 0 | System Requirements Spec v2.0 §10 | ✅ 100% Traced |
| **Indication Governance** | `MAG-IND` | 30 | 9 | 0 | 21 | Canonical Multi-Indication Data Spec v2.0 | ✅ 100% Traced |
| **Phenotype Context** | `MAG-PHE` | 8 | 0 | 0 | 8 | Multi-Indication Data Spec v2.0 | ✅ 100% Traced |
| **Evidence Knowledge** | `MAG-EVD` | 15 | 4 | 0 | 11 | Evidence Knowledge Graph Spec v2.0 | ✅ 100% Traced |
| **Scientific Policy** | `MAG-POL` | 24 | 4 | 0 | 20 | Scientific Policy Spec v2.0 | ✅ 100% Traced |
| **Multimodal Measurement** | `MAG-MEA` | 20 | 5 | 0 | 15 | Multimodal Measurement Spec v2.0 | ✅ 100% Traced |
| **Neuroimaging QC** | `MAG-IMG` | 12 | 3 | 0 | 9 | Multimodal Measurement Spec v2.0 | ✅ 100% Traced |
| **Target Engine** | `MAG-TGT` | 24 | 4 | 0 | 20 | Target Engine Spec v2.0 | ✅ 100% Traced |
| **Clinician UX** | `MAG-UX` | 16 | 3 | 0 | 13 | Application Shell Spec v2.0 | ✅ 100% Traced |
| **Canonical Data** | `MAG-DAT` | 14 | 2 | 0 | 12 | Canonical Multi-Indication Data Spec v2.0 | ✅ 100% Traced |
| **Security & Privacy** | `MAG-SEC` | 8 | 2 | 0 | 6 | Multi-Indication Tech Architecture v2.0 | ✅ 100% Traced |
| **Workflow State** | `MAG-WFL` | 8 | 0 | 0 | 8 | Enterprise Verification CICD Spec v2.0 | ✅ 100% Traced |
| **Audit & Provenance** | `MAG-AUD` | 8 | 1 | 0 | 7 | Canonical Multi-Indication Data Spec v2.0 | ✅ 100% Traced |
| **Release Governance** | `MAG-REL` | 12 | 2 | 0 | 10 | Scientific Policy Spec v2.0 | ✅ 100% Traced |
| **Stroke Indication** | `MAG-STR` | 25 | 8 | 0 | 17 | Multi-Indication Data / Target Engine v2.0 | ✅ 100% Traced |
| **Neuropathic Pain** | `MAG-PAI` | 18 | 6 | 0 | 12 | Multi-Indication Data / Target Engine v2.0 | ✅ 100% Traced |
| **Traumatic Brain Injury** | `MAG-TBI` | 18 | 7 | 0 | 11 | Multimodal Measurement / Target Engine v2.0 | ✅ 100% Traced |
| **Chronic Tinnitus** | `MAG-TIN` | 18 | 5 | 0 | 13 | Multimodal Measurement / Target Engine v2.0 | ✅ 100% Traced |
| **OCD Indication** | `MAG-OCD` | 18 | 8 | 0 | 10 | Target Engine / Scientific Policy v2.0 | ✅ 100% Traced |
| **Verification & Validation**| `MAG-VAL` | 20 | 4 | 0 | 16 | Implementation & Validation Roadmap v2.0 | ✅ 100% Traced |
| **TOTALS** | | **332** | **96** | **5** | **231** | | **100.0% Traced** |

---

## 3. Core Safety Requirements Traceability Matrix (Critical Requirements)

### System-Wide & Clinical Authority (`MAG-SYS`, `MAG-CLI`)

| Requirement ID & Statement | Design Component | Implementation Target | Verification Test ID | Risk Control ID | Validation Evidence | Status |
|---|---|---|---|---|---|---|
| **MAG-SYS-041**<br>Canonical v2 multi-indication system contract: transform approved indication, module, measurements, reliability, and policy into Target Slate. | Core Orchestration Contract | `packages/domain/src/index.ts`<br>`packages/target-engine/src/engine.ts` | `IT-SYS-041`<br>`GC-SYN-001` | `HAZ-006` | Platform M3 Build / Q1 Qualification | ✅ SEALED |
| **MAG-SYS-043**<br>Clinical authority resolved per `CaseIndication` and `IndicationModuleRelease`, not global flag. | Domain Context Rail | `packages/domain/src/indication-module.ts`<br>`supabase/migrations/003_system_types.sql` | `IT-AUTH-043` | `HAZ-006` | Platform M3 Build | ✅ SEALED |
| **MAG-SYS-044**<br>Same deployment supports modules at different maturity states without authority leakage. | Module Isolation Rail | `packages/domain/src/indication-module.ts`<br>`apps/web/src/components/shell/` | `IT-LEAK-044` | `HAZ-008` | Platform M3 Build | ✅ SEALED |
| **MAG-SYS-045**<br>Executable scientific capability shall NOT be represented as clinically validated solely by existence in product. | Clinical Shell Warning | `apps/web/src/components/shell/`<br>`packages/presentation/src/` | `HF-DISC-045` | `HAZ-008` | Human Factors M6 | ✅ SEALED |
| **MAG-SYS-046**<br>Separate patient measurement, scientific evidence, algorithmic inference, and clinician decision. | Architectural Separation | `packages/domain/src/types.ts`<br>`packages/evidence/src/` | `ST-ARCH-046` | `HAZ-004`, `HAZ-018` | Platform M3 Build | ✅ SEALED |
| **MAG-SYS-047**<br>Support a valid no-target / abstention result. | Target Engine Core | `packages/target-engine/src/engine.ts`<br>`packages/target-engine/src/gates/` | `GC-ABST-047` | `HAZ-001` | Golden Case G04 / G11 | ✅ SEALED |
| **MAG-SYS-048**<br>Software shall NOT autonomously prescribe frequency, intensity, pulse count, or session schedule. | Prescriptive Guardrail | `packages/target-engine/src/index.ts`<br>`packages/domain/src/types.ts` | `UT-DOS-048` | `HAZ-001`, `HAZ-019` | Human Factors M6 | ✅ SEALED |
| **MAG-SYS-050**<br>Historical v1 and v2 Target Slates reconstructable from original scientific release configuration. | Provenance Engine | `packages/target-engine/src/engine.ts`<br>`supabase/migrations/024_target_candidates.sql` | `EXIT-CRIT-04` | `HAZ-002`, `HAZ-020` | M3 Determinism Suite | ✅ SEALED |
| **MAG-SYS-051**<br>Patient-specific sophistication shall NOT automatically outrank evidence-supported non-personalised baseline. | Hard Gating Core | `packages/target-engine/src/gates/`<br>`packages/target-engine/src/ranking/` | `GC-PRIOR-051` | `HAZ-003`, `HAZ-016`, `HAZ-017` | Golden Case G04 | ✅ SEALED |
| **MAG-SYS-052**<br>Software completion remains distinct from clinical qualification of an indication module. | Module Manifest | `packages/domain/src/indication-module.ts`<br>`docs/design-controls/` | `I-QUAL-052` | `HAZ-006` | Module Qualification Q0–Q5 | ✅ SEALED |
| **MAG-CLI-041**<br>Every targeting analysis shall identify the principal `CaseIndication` being addressed. | Clinical Case Rail | `packages/domain/src/types.ts`<br>`supabase/migrations/007_clinical_cases.sql` | `IT-CASE-041` | `HAZ-006`, `HAZ-014` | Platform M3 Build | ✅ SEALED |
| **MAG-CLI-043**<br>Specialist shall explicitly approve clinical objective(s) prior to target generation. | Clinician Objective Form | `packages/domain/src/types.ts`<br>`apps/web/src/app/page.tsx` | `IT-OBJ-043` | `HAZ-004`, `HAZ-014` | Human Factors M6 | ✅ SEALED |
| **MAG-CLI-044**<br>Software shall NOT infer treatment objective solely from diagnosis. | Objective Guardrail | `packages/phenotype/src/index.ts`<br>`packages/domain/src/` | `UT-OBJ-044` | `HAZ-004`, `HAZ-014` | Human Factors M6 | ✅ SEALED |
| **MAG-CLI-045**<br>Specialist shall be able to reject all candidates and record no selected target. | Decision Signing View | `apps/web/src/app/page.tsx`<br>`supabase/migrations/026_clinician_decisions.sql` | `HF-REJ-045` | `HAZ-001` | Human Factors M6 | ✅ SEALED |
| **MAG-CLI-047**<br>Clinician modification of candidate geometry creates new clinician-owned object without mutating source candidate. | Immutability Trigger | `supabase/migrations/026_clinician_decisions.sql`<br>`packages/domain/src/types.ts` | `SEC-IMM-047` | `HAZ-002` | Platform M3 Build | ✅ SEALED |
| **MAG-CLI-048**<br>Signed clinical decisions remain separate from algorithm-generated Target Slates. | Relational Schema | `supabase/migrations/026_clinician_decisions.sql`<br>`supabase/migrations/025_target_slates.sql` | `SEC-RLS-048` | `HAZ-001` | Platform M3 Build | ✅ SEALED |
| **MAG-CLI-049**<br>Distinguish TMS target decision support from TMS candidacy, safety, and prescription. | Legal Scope Banner | `apps/web/src/components/shell/`<br>`packages/presentation/src/` | `HF-SCOPE-049` | `HAZ-001` | Human Factors M6 | ✅ SEALED |
| **MAG-CLI-051**<br>Clinician override shall NOT convert Research-only scientific object into Clinical candidate. | Mode Enforcement | `packages/target-engine/src/gates/mode.ts`<br>`packages/domain/src/` | `IT-MODE-051` | `HAZ-008` | Golden Case G08 | ✅ SEALED |
| **MAG-CLI-052**<br>Material change in clinician-approved indication context requires new analysis rather than slate mutation. | Workflow Trigger | `supabase/migrations/007_clinical_cases.sql`<br>`packages/domain/src/` | `IT-WFL-052` | `HAZ-004` | Platform M3 Build | ✅ SEALED |

---

### Indication-Module Governance & Evidence Isolation (`MAG-IND`, `MAG-EVD`, `MAG-POL`)

| Requirement ID & Statement | Design Component | Implementation Target | Verification Test ID | Risk Control ID | Validation Evidence | Status |
|---|---|---|---|---|---|---|
| **MAG-IND-001**<br>Target Slate shall reference exactly one immutable `IndicationModuleRelease`. | Module Association | `packages/domain/src/types.ts`<br>`packages/target-engine/src/index.ts` | `UT-MOD-001` | `HAZ-006` | Platform M3 Build | ✅ SEALED |
| **MAG-IND-002**<br>`CaseIndication` references exact `IndicationModuleRelease` used for analysis. | Data Context Model | `packages/domain/src/indication-module.ts`<br>`supabase/migrations/007_clinical_cases.sql` | `IT-IND-002` | `HAZ-006` | Platform M3 Build | ✅ SEALED |
| **MAG-IND-011**<br>Clinical permission for one module shall NOT imply permission for any other module. | Module Isolation Rail | `packages/domain/src/indication-module.ts`<br>`packages/scientific-policy/src/` | `IT-PERM-011` | `HAZ-006` | Platform M3 Build | ✅ SEALED |
| **MAG-IND-012**<br>Module with `research_only` status prohibited from generating Clinical Target Slate. | Gate Enforcement | `packages/target-engine/src/gates/mode.ts`<br>`packages/domain/src/` | `GC-RSCH-012` | `HAZ-008` | Golden Case G08 | ✅ SEALED |
| **MAG-IND-013**<br>Validation-only maturity module shall NOT be represented as unrestricted Clinical module. | Disclosure Rail | `apps/web/src/components/shell/`<br>`packages/presentation/src/` | `HF-VAL-013` | `HAZ-008` | Human Factors M6 | ✅ SEALED |
| **MAG-IND-017**<br>EvidencePaths shall NOT automatically transfer between indication modules. | Evidence Boundary Rail | `packages/evidence/src/graph.ts`<br>`packages/target-engine/src/` | `UT-EV-017` | `HAZ-007` | Synthetic Multi-Indication Suite | ✅ SEALED |
| **MAG-IND-027**<br>Treatment-context restrictions enforceable where declared evidence-relevant. | Context Gate | `packages/target-engine/src/gates/`<br>`packages/domain/src/` | `ST-CTX-027` | `HAZ-013` | OCD / Stroke Golden Cases | ✅ SEALED |
| **MAG-IND-028**<br>Every Clinical module requires module-specific validation evidence before unrestricted activation. | Module Release Gate | `docs/design-controls/`<br>`scripts/verification/` | `VAL-GATE-028` | `HAZ-006` | Module Qualification Q4/Q5 | ✅ SEALED |
| **MAG-IND-030**<br>Fail closed if active module cannot positively resolve to approved compatibility configuration. | Fail-Closed Guard | `packages/target-engine/src/engine.ts`<br>`packages/domain/src/` | `UT-FAIL-030` | `HAZ-006` | Determinism Suite | ✅ SEALED |
| **MAG-EVD-041**<br>Evidence Knowledge Graph represents indication-specific EvidencePaths rather than global targets. | Relational Graph | `packages/evidence/src/index.ts`<br>`supabase/migrations/023_evidence_releases.sql` | `UT-EVD-041` | `HAZ-007` | Evidence Verification Report 06 | ✅ SEALED |
| **MAG-EVD-043**<br>Conflicting or negative outcome evidence remains structurally explicit. | Evidence Path Model | `packages/evidence/src/graph.ts`<br>`packages/presentation/src/` | `UT-EVD-043` | `HAZ-007` | Evidence Verification Report 06 | ✅ SEALED |
| **MAG-EVD-045**<br>Evidence Governance Classification strictly distinguishes Research vs Clinical evidence tiers. | Evidence Governance | `packages/evidence/src/index.ts`<br>`packages/scientific-policy/src/` | `UT-EVD-045` | `HAZ-007` | Evidence Verification Report 06 | ✅ SEALED |
| **MAG-EVD-048**<br>Target candidate without valid EvidencePath prohibited from entering Target Slate. | Evidence Hard Gate | `packages/target-engine/src/gates/evidence.ts` | `GC-EVD-048` | `HAZ-007` | Golden Case G01–G05 | ✅ SEALED |
| **MAG-POL-041**<br>Scientific policy binds exact `IndicationModuleRelease` to permitted generator and measurement manifests. | Policy Binding Engine | `packages/scientific-policy/src/index.ts`<br>`packages/scientific-policy/src/default-policy.ts` | `UT-POL-041` | `HAZ-006` | Policy Verification Suite | ✅ SEALED |
| **MAG-POL-042**<br>Target generation prohibited without active, pinned, approved `ScientificPolicyRelease`. | Manifest Validator | `packages/target-engine/src/engine.ts`<br>`packages/scientific-policy/src/` | `UT-POL-042` | `HAZ-006` | Determinism Suite | ✅ SEALED |
| **MAG-POL-044**<br>Reliability thresholds enforced as hard gates prior to compensable score calculation. | Policy Gate Pipeline | `packages/target-engine/src/gates/reliability.ts` | `GC-REL-044` | `HAZ-003` | Golden Case G04 | ✅ SEALED |
| **MAG-POL-046**<br>Modifying scientific policy parameters creates a new immutable release version. | Versioned Policy Store| `packages/scientific-policy/src/index.ts`<br>`packages/domain/src/` | `SEC-VER-046` | `HAZ-006` | Policy Release Verification | ✅ SEALED |

---

### Multimodal Measurement & Target Engine Core (`MAG-MEA`, `MAG-IMG`, `MAG-TGT`)

| Requirement ID & Statement | Design Component | Implementation Target | Verification Test ID | Risk Control ID | Validation Evidence | Status |
|---|---|---|---|---|---|---|
| **MAG-MEA-001**<br>Patient measurements encapsulated inside versioned `MeasurementBundle` objects. | Measurement Bundle | `packages/domain/src/measurement.ts`<br>`services/neurocompute/` | `UT-MEA-001` | `HAZ-003` | Multimodal Validation Harness | ✅ SEALED |
| **MAG-MEA-002**<br>Each measurement modality carries independent QC status and reliability metric. | Modality QC Rail | `packages/domain/src/measurement.ts`<br>`services/neurocompute/` | `UT-QC-002` | `HAZ-003` | QC Qualification Suite | ✅ SEALED |
| **MAG-MEA-005**<br>Non-MRI modalities (MEP, motor mapping, audiology) conform to canonical schema with provenance. | Cross-Modal Schemas | `packages/schemas/src/measurement.ts`<br>`packages/domain/src/` | `UT-MOD-005` | `HAZ-010`, `HAZ-015` | Multimodal Validation Harness | ✅ SEALED |
| **MAG-MEA-010**<br>Failed mandatory modality causes target engine abstention rather than silent omission. | Measurement Gate | `packages/target-engine/src/gates/`<br>`packages/target-engine/src/engine.ts` | `GC-FAIL-010` | `HAZ-003`, `HAZ-016` | Golden Case G04 / G12 | ✅ SEALED |
| **MAG-MEA-011**<br>Multimodal fusion prohibited without explicit indication-module scientific policy permission. | Fusion Policy Rail | `packages/scientific-policy/src/`<br>`packages/target-engine/src/` | `UT-FUS-011` | `HAZ-003`, `HAZ-018` | Target Engine Test Suite | ✅ SEALED |
| **MAG-IMG-041**<br>Structural and functional registration preserves anatomical coordinate space integrity. | Spatial Registration | `packages/target-engine/src/spatial/`<br>`services/neurocompute/` | `UT-REG-041` | `HAZ-002` | Spatial Verification Report 05 | ✅ SEALED |
| **MAG-IMG-042**<br>Laterality flip prevention enforced across all coordinate transformation pipelines. | Laterality Invariant | `packages/target-engine/src/spatial/coordinate-round-trip.ts` | `UT-LAT-042` | `HAZ-002` | Spatial Verification Report 05 | ✅ SEALED |
| **MAG-IMG-044**<br>Motion QC filtering gates functional connectivity personalisation. | Motion QC Gate | `services/neurocompute/`<br>`packages/target-engine/src/gates/` | `GC-MOT-044` | `HAZ-003` | Golden Case G04 | ✅ SEALED |
| **MAG-TGT-041**<br>Target Engine executes deterministically offline without external network or mutable state. | Offline Engine Core | `packages/target-engine/src/index.ts`<br>`packages/target-engine/src/engine.ts` | `UT-DET-041` | `HAZ-001` | Property Invariant Suite | ✅ SEALED |
| **MAG-TGT-042**<br>Deterministic sorting enforces identical slate ranking across 1000 repeated executions. | Deterministic Sort | `packages/target-engine/src/ranking/`<br>`packages/target-engine/tests/` | `UT-DET-042` | `HAZ-001` | M3 Freeze Invariants Test | ✅ SEALED |
| **MAG-TGT-050**<br>Hard safety gates strictly precede compensable ranking weight calculations. | Engine Pipeline | `packages/target-engine/src/gates/`<br>`packages/target-engine/src/engine.ts` | `GC-GATE-050` | `HAZ-001`, `HAZ-019` | Synthetic Workflow Test | ✅ SEALED |
| **MAG-TGT-051**<br>Output slate cardinality constrained to max 3 Primary + 2 Additional candidates. | Slate Cardinality | `packages/target-engine/src/engine.ts`<br>`packages/domain/src/types.ts` | `UT-CARD-051` | `HAZ-001` | Target Engine Test Suite | ✅ SEALED |

---

### Indication-Specific Modules (`MAG-STR`, `MAG-PAI`, `MAG-TBI`, `MAG-TIN`, `MAG-OCD`)

| Requirement ID & Statement | Design Component | Implementation Target | Verification Test ID | Risk Control ID | Validation Evidence | Status |
|---|---|---|---|---|---|---|
| **MAG-STR-002**<br>Lesion laterality explicitly represented as left hemisphere, right hemisphere, bilateral, or non-lesional. | Lesion Context Model | `packages/domain/src/stroke.ts`<br>`packages/domain/src/types.ts` | `UT-STR-002` | `HAZ-009` | Stroke Golden Case G11 | ✅ SEALED |
| **MAG-STR-003**<br>Stroke motor targeting shall preserve affected limb / body-region laterality without hemisphere crossover. | Stroke Laterality Gate | `packages/target-engine/src/plugins/stroke/`<br>`packages/target-engine/src/spatial/` | `GC-STR-003` | `HAZ-009` | Stroke Golden Case G11 | ✅ SEALED |
| **MAG-STR-004**<br>Structural lesion distortion invalidating standard stereotaxy causes module abstention. | Distortion Gate | `packages/target-engine/src/plugins/stroke/`<br>`packages/target-engine/src/gates/` | `GC-STR-004` | `HAZ-009` | Stroke Golden Case G12 | ✅ SEALED |
| **MAG-STR-010**<br>Motor-map candidates require explicit `SomatotopicTargetGeometry` matching clinical target territory. | Somatotopic Model | `packages/domain/src/stroke.ts`<br>`packages/target-engine/src/plugins/stroke/` | `UT-STR-010` | `HAZ-010` | Motor Mapping Suite | ✅ SEALED |
| **MAG-STR-011**<br>Unreliable motor mapping falls back to evidence baseline rather than distorted coordinates. | Fallback Engine | `packages/target-engine/src/plugins/stroke/`<br>`packages/target-engine/src/gates/` | `GC-STR-011` | `HAZ-010`, `HAZ-015` | Stroke Golden Case G13 | ✅ SEALED |
| **MAG-STR-019**<br>Where evidence depends on concurrent speech therapy, treatment context requirement is enforceable. | Aphasia Context Gate | `packages/target-engine/src/plugins/stroke/`<br>`packages/domain/src/` | `ST-STR-019` | `HAZ-013`, `HAZ-016` | Aphasia Golden Case G14 | ✅ SEALED |
| **MAG-STR-023**<br>Muscle recording, affected body region, and target geometry must match without somatotopic mismatch. | Somatotopic Verifier | `packages/target-engine/src/plugins/stroke/`<br>`packages/schemas/src/` | `UT-STR-023` | `HAZ-010` | Stroke Motor Test Suite | ✅ SEALED |
| **MAG-STR-025**<br>Failure of mandatory lesion/stage requirement causes module abstention. | Stroke Abstention Gate | `packages/target-engine/src/plugins/stroke/`<br>`packages/target-engine/src/gates/` | `GC-STR-025` | `HAZ-009`, `HAZ-016` | Stroke Golden Case G12 | ✅ SEALED |
| **MAG-PAI-004**<br>Somatotopic M1 candidates SHALL use `SomatotopicTargetGeometry` representing body parts. | Pain Target Geometry | `packages/domain/src/pain.ts`<br>`packages/target-engine/src/plugins/pain/` | `UT-PAI-004` | `HAZ-010` | Pain Golden Case G15 | ✅ SEALED |
| **MAG-PAI-005**<br>Somatotopic pain target preserves affected body region without generic M1 point substitution. | Body-Region Gate | `packages/target-engine/src/plugins/pain/`<br>`packages/target-engine/src/spatial/` | `GC-PAI-005` | `HAZ-010` | Pain Golden Case G15 | ✅ SEALED |
| **MAG-PAI-006**<br>Generic universal M1 point prohibited from replacing required somatotopic search region. | Somatotopy Enforcer | `packages/target-engine/src/plugins/pain/`<br>`packages/scientific-policy/src/` | `UT-PAI-006` | `HAZ-010` | Pain Test Suite | ✅ SEALED |
| **MAG-PAI-008**<br>Bilateral or ambiguous pain shall NOT result in arbitrary hemisphere selection. | Ambiguity Guard | `packages/target-engine/src/plugins/pain/`<br>`packages/target-engine/src/gates/` | `UT-PAI-008` | `HAZ-010` | Pain Test Suite | ✅ SEALED |
| **MAG-PAI-009**<br>Motor-map refinement requires qualified motor-hotspot / motor-map confidence metrics. | Hotspot QC Rail | `packages/target-engine/src/plugins/pain/`<br>`services/neurocompute/` | `GC-PAI-009` | `HAZ-010`, `HAZ-015` | Pain Golden Case G16 | ✅ SEALED |
| **MAG-PAI-017**<br>Muscle / body-region mismatch prevents use of mismatched motor hotspot candidate. | Mismatch Gate | `packages/target-engine/src/plugins/pain/`<br>`packages/target-engine/src/gates/` | `UT-PAI-017` | `HAZ-010` | Pain Test Suite | ✅ SEALED |
| **MAG-TBI-003**<br>MAGNIOM shall NOT generate a universal "TBI Target". | Indication Disaggregator | `packages/domain/src/tbi.ts`<br>`packages/target-engine/src/plugins/tbi/` | `UT-TBI-003` | `HAZ-006` | TBI Verification Suite | ✅ SEALED |
| **MAG-TBI-004**<br>TBI candidate requires explicit TBI-specific EvidencePath binding. | TBI Evidence Binding | `packages/evidence/src/graph.ts`<br>`packages/target-engine/src/plugins/tbi/` | `UT-TBI-004` | `HAZ-007` | TBI Verification Suite | ✅ SEALED |
| **MAG-TBI-007**<br>TBI targeting preserves lesion and skull structural distortion context before computation. | Skull Defect Context | `packages/domain/src/tbi.ts`<br>`services/neurocompute/` | `GC-TBI-007` | `HAZ-009` | TBI Golden Case G17 | ✅ SEALED |
| **MAG-TBI-008**<br>Skull defect, cranioplasty, or surgical distortion flagged before target delivery. | Structural Defect Rail | `packages/domain/src/tbi.ts`<br>`apps/web/src/components/shell/` | `GC-TBI-008` | `HAZ-009` | TBI Golden Case G17 | ✅ SEALED |
| **MAG-TBI-009**<br>Where structural changes materially affect E-field validity, application requires clinician warning. | E-Field Distortion Rail | `services/efield/`<br>`apps/web/src/components/shell/` | `ST-TBI-009` | `HAZ-009` | E-Field Verification Report | ✅ SEALED |
| **MAG-TBI-014**<br>Structural distortion invalidating stereotactic registration prevents dependent target analysis. | Distortion Gate | `packages/target-engine/src/plugins/tbi/`<br>`packages/target-engine/src/gates/` | `GC-TBI-014` | `HAZ-009` | TBI Golden Case G18 | ✅ SEALED |
| **MAG-TBI-018**<br>TBI Clinical Mode remains unavailable until a TBI-specific Clinical Module is released. | Lifecycle Barrier | `packages/domain/src/indication-module.ts`<br>`packages/target-engine/src/gates/mode.ts` | `IT-TBI-018` | `HAZ-008` | Module Qualification Q0–Q3 | ✅ SEALED |
| **MAG-TIN-007**<br>Tinnitus pitch or loudness matching shall NOT independently generate an auditory cortex target. | Audiology Guard | `packages/domain/src/tinnitus.ts`<br>`packages/target-engine/src/plugins/tinnitus/` | `UT-TIN-007` | `HAZ-011` | Tinnitus Test Suite | ✅ SEALED |
| **MAG-TIN-008**<br>Hearing-loss pattern shall NOT autonomously generate an auditory-cortex target coordinate. | Audiology Guard | `packages/target-engine/src/plugins/tinnitus/`<br>`packages/target-engine/src/` | `UT-TIN-008` | `HAZ-011` | Tinnitus Test Suite | ✅ SEALED |
| **MAG-TIN-010**<br>Initial Tinnitus targeting module remains Research-only until prospective qualification. | Research Gate | `packages/domain/src/indication-module.ts`<br>`packages/scientific-policy/src/` | `IT-TIN-010` | `HAZ-008` | Module Qualification Q0–Q2 | ✅ SEALED |
| **MAG-TIN-011**<br>Research tinnitus candidate shall NOT enter a Clinical Target Slate. | Mode Gate | `packages/target-engine/src/gates/mode.ts`<br>`packages/target-engine/src/` | `GC-TIN-011` | `HAZ-008` | Golden Case G08 | ✅ SEALED |
| **MAG-TIN-018**<br>Clinical target generation for tinnitus shall fail closed without approved Clinical release. | Fail-Closed Trigger | `packages/target-engine/src/plugins/tinnitus/`<br>`packages/domain/src/` | `UT-TIN-018` | `HAZ-011` | Tinnitus Test Suite | ✅ SEALED |
| **MAG-OCD-001**<br>OCD target generation shall use OCD-specific EvidencePaths. | OCD Evidence Path | `packages/evidence/src/graph.ts`<br>`packages/target-engine/src/plugins/ocd/` | `UT-OCD-001` | `HAZ-007` | OCD Verification Suite | ✅ SEALED |
| **MAG-OCD-003**<br>mPFC/ACC deep-TMS targets shall preserve `coil_field` geometry where evidence requires field stimulation. | Coil Field Geometry | `packages/domain/src/ocd.ts`<br>`packages/domain/src/types.ts` | `UT-OCD-003` | `HAZ-012` | OCD Verification Suite | ✅ SEALED |
| **MAG-OCD-004**<br>Field-defined OCD target shall NOT be downcast to a single point coordinate. | Downcast Prevention | `packages/target-engine/src/plugins/ocd/`<br>`packages/domain/src/types.ts` | `UT-OCD-004` | `HAZ-012` | OCD Test Suite | ✅ SEALED |
| **MAG-OCD-006**<br>Incompatible device / coil class fails target-geometry / candidate validation. | Device Compatibility Rail | `packages/target-engine/src/plugins/ocd/`<br>`packages/target-engine/src/gates/` | `GC-OCD-006` | `HAZ-012`, `HAZ-019` | OCD Test Suite | ✅ SEALED |
| **MAG-OCD-009**<br>Cross-family numerical ranking prohibited without validated direct comparative evidence. | Non-Ranking Enforcer | `packages/target-engine/src/plugins/ocd/`<br>`packages/target-engine/src/ranking/` | `UT-OCD-009` | `HAZ-007` | OCD Test Suite | ✅ SEALED |
| **MAG-OCD-010**<br>Where efficacy depends on symptom provocation, treatment context explicitly required. | Provocation Gate | `packages/domain/src/ocd.ts`<br>`packages/target-engine/src/gates/` | `ST-OCD-010` | `HAZ-013` | OCD Golden Case Suite | ✅ SEALED |
| **MAG-OCD-011**<br>Absence or uncertainty of required treatment context produces explicit slate warning or abstention. | Context Warning Gate | `packages/target-engine/src/plugins/ocd/`<br>`apps/web/src/components/shell/` | `GC-OCD-011` | `HAZ-013` | OCD Golden Case Suite | ✅ SEALED |
| **MAG-OCD-017**<br>OCD module requires exact Scientific Policy permission before activation. | Policy Release Binding | `packages/scientific-policy/src/default-policy.ts`<br>`packages/domain/src/` | `UT-OCD-017` | `HAZ-006` | Policy Release Verification | ✅ SEALED |

---

## 4. Verification & Validation Governance (`MAG-VAL`)

| Requirement ID & Statement | Design Component | Implementation Target | Verification Test ID | Risk Control ID | Validation Evidence | Status |
|---|---|---|---|---|---|---|
| **MAG-VAL-041**<br>Each Indication Module SHALL have an independent validation status. | Module Lifecycle | `packages/domain/src/indication-module.ts`<br>`docs/design-controls/` | `I-VAL-041` | `HAZ-006` | Qualification Matrix Q0–Q5 | ✅ SEALED |
| **MAG-VAL-042**<br>Software verification SHALL NOT be accepted as a substitute for clinical validation of an indication module. | Verification vs Validation | `docs/design-controls/`<br>`scripts/verification/` | `A-VAL-042` | `HAZ-006` | Clinical Validation Reports | ✅ SEALED |
| **MAG-VAL-043**<br>Module promotion to Clinical Mode requires independent multidisciplinary governance approval. | Governance Gate | `docs/design-controls/change-control-procedure.md`<br>`scripts/release/` | `I-VAL-043` | `HAZ-008` | Module Clinical Gate M7/Q5 | ✅ SEALED |
| **MAG-VAL-044**<br>All applicable Critical requirements must be verified before clinical-mode promotion. | Exit Criteria Gate | `scripts/verification/validate-exit-criteria.ts`<br>`scripts/verification/verify-full-traceability.ts` | `EXIT-CRIT-01` | `HAZ-008` | Verification Build M3 / M7 | ✅ SEALED |
