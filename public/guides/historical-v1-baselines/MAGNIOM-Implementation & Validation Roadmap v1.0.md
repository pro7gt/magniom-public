# MAGNIOM
## Implementation & Validation Roadmap v1.0

**Document status:** Canonical implementation programme  
**Date:** 1 September 2026  
**Initial indication:** Major depressive disorder ± clinically significant anxious distress  
**Initial deployment status:** Research / validation system  
**Target deployment status:** Regulated clinician-facing decision-support software for specialist TMS target selection

**Depends on:**

- Magniom Clinical & Scientific Specification v1.0
- Magniom Canonical Target Data Specification v1.0
- Magniom Technical Architecture v1.0
- Magniom Supabase Database & Security Specification v1.0
- Magniom Target Engine & Ranking Algorithm Specification v1.0
- Magniom Neuroimaging & Functional Connectomics Pipeline Specification v1.0
- Magniom Evidence Knowledge Graph & Therapeutic Circuit Library v1.0
- Magniom Clinical Phenotype & Symptom-to-Circuit Ontology v1.0
- Magniom Clinician Workspace & UX Specification v1.0

---

# 1. PURPOSE

This document defines how Magniom moves from specification to a validated clinical product.

It covers:

- repository architecture;
- package boundaries;
- Supabase migration sequence;
- implementation order;
- synthetic golden cases;
- neuroimaging validation datasets;
- NeuroCompute containers;
- evidence-library seeding;
- Target Engine implementation;
- UX prototype sequence;
- unit testing;
- integration testing;
- security testing;
- scientific verification;
- reproducibility testing;
- human-factors validation;
- retrospective clinical validation;
- prospective silent validation;
- clinician-assisted validation;
- regulatory preparation;
- promotion from Research Mode to Clinical Mode.

The governing principle is:

# Software completion is not clinical validation.

Magniom may be technically complete while remaining unsuitable for clinical target guidance.

---

# 2. DEVELOPMENT PHILOSOPHY

Magniom should be built from the centre outward.

The centre is:

```text
Canonical scientific objects
        ↓
Deterministic Target Engine
        ↓
Immutable Target Slate
        ↓
Clinician Decision
```

MRI processing, evidence curation and sophisticated visualisation should then connect to this already functioning semantic core.

The wrong development sequence would be:

```text
Build impressive 3D brain viewer
        ↓
Build MRI pipeline
        ↓
Add AI
        ↓
Decide later what a target means
```

Magniom has deliberately already done the reverse:

```text
Clinical semantics
        ↓
Canonical data
        ↓
Scientific architecture
        ↓
Database/security
        ↓
Target Engine
        ↓
Imaging specification
        ↓
Evidence ontology
        ↓
Phenotype ontology
        ↓
UX
        ↓
Implementation
```

That sequence should now remain intact.

---

# 3. PRODUCT MATURITY STATES

Magniom should have explicit maturity states.

## M0 — Design

Specifications exist.

No executable clinical system.

## M1 — Engineering Prototype

Canonical objects and workflows execute using synthetic data.

Not for patient use.

## M2 — Research Prototype

Can process de-identified real MRI and generate research targets.

Not used to guide treatment.

## M3 — Verification Build

Software and scientific algorithms are frozen sufficiently for formal verification.

## M4 — Retrospective Validation Build

Runs against locked historical datasets.

No clinical influence.

## M5 — Silent Prospective Build

Runs prospectively but clinicians do not see recommendations before treatment decisions.

## M6 — Clinician-Assisted Validation Build

Clinicians may use the system within an approved prospective study / controlled evaluation.

## M7 — Clinical Release Candidate

Technical, scientific, human-factors, security and regulatory gates satisfied.

## M8 — Clinical Mode

Approved deployment according to defined intended purpose.

---

# 4. RESEARCH MODE DOES NOT MEAN LOW QUALITY

Research Mode still requires:

- authentication;
- provenance;
- immutable outputs;
- versioning;
- audit;
- data security;
- scientific reproducibility.

The distinction is:

# whether Magniom output is permitted to influence clinical treatment.

Research Mode must not become a loophole for deploying an unvalidated algorithm clinically.

---

# 5. REGULATORY DEVELOPMENT ASSUMPTION

Magniom should be developed on the conservative assumption that its intended clinical function is:

# regulated software-based medical device / SaMD.

This is because it directly analyses medical imaging and generates patient-specific target recommendations intended to influence treatment planning.

Current TGA guidance states that the simplified CDSS exemption requires, among other things, that the software **not directly process or analyse a medical image or signal**, and notes that advanced CDSS specifying or customising treatment is unlikely to qualify.

Software meeting the medical-device definition generally requires appropriate regulatory authorisation unless excluded or exempt.

Final classification must be confirmed with qualified Australian regulatory advice.

---

# 6. QUALITY SYSTEM FROM DAY ONE

Do not postpone design control until clinical validation.

The implementation programme should be structured so records can later support:

- IEC 62304-style software lifecycle documentation;
- ISO 14971-style risk management;
- IEC 62366-1 usability engineering;
- ISO 13485-compatible quality processes;
- IEC 81001-5-1 / equivalent cybersecurity lifecycle controls.

TGA currently identifies IEC 62304 and IEC 62366-1 among key software-device standards and lists ISO 14971, ISO 13485 and IEC 81001-5-1 among relevant supporting standards.

---

# 7. DOCUMENT HIERARCHY

Create a controlled documentation repository:

```text
docs/
├── product/
├── clinical/
├── scientific/
├── architecture/
├── software-requirements/
├── risk-management/
├── verification/
├── validation/
├── human-factors/
├── cybersecurity/
├── regulatory/
├── evidence/
├── release/
└── change-control/
```

Existing canonical Magniom specifications become controlled design inputs.

---

# 8. REQUIREMENTS TRACEABILITY

Create requirement IDs immediately.

Examples:

```text
MAG-CLI-001
Confirmed phenotype required before target generation.

MAG-TGT-014
A Clinical connectome-refined candidate requires a
TargetReliabilityProfile.

MAG-UX-031
No target candidate is preselected for clinician acceptance.

MAG-SEC-012
Cross-organisation clinical data access must be denied by RLS.

MAG-IMG-028
Target reliability must include split-half localisation
when technically applicable.
```

---

# 9. TRACEABILITY MATRIX

Every requirement eventually maps:

```text
Requirement
    ↓
Design component
    ↓
Implementation
    ↓
Verification test
    ↓
Risk control
    ↓
Validation evidence
```

Example:

```text
MAG-UX-031
No preselected acceptance
        ↓
CandidateDecisionForm
        ↓
decision-form.tsx
        ↓
UX-UNIT-044
        ↓
Automation-bias risk AB-03
        ↓
Human Factors Scenario HF-07
```

---

# 10. MONOREPO

Recommended repository:

```text
magniom/
│
├── apps/
│   └── web/
│
├── packages/
│   ├── domain/
│   ├── schemas/
│   ├── phenotype/
│   ├── evidence/
│   ├── target-engine/
│   ├── scientific-policy/
│   ├── presentation/
│   ├── ui/
│   └── test-fixtures/
│
├── services/
│   ├── neurocompute/
│   ├── efield/
│   ├── report-worker/
│   └── workflow-worker/
│
├── supabase/
│   ├── migrations/
│   ├── seed/
│   ├── functions/
│   └── tests/
│
├── evidence/
│   ├── sources/
│   ├── claims/
│   ├── circuits/
│   ├── maps/
│   └── releases/
│
├── scientific-config/
│
├── validation/
│   ├── golden-cases/
│   ├── imaging/
│   ├── target-engine/
│   ├── retrospective/
│   └── prospective/
│
├── docs/
│
├── infra/
│
└── scripts/
```

---

# 11. PACKAGE — `domain`

`packages/domain`

contains canonical TypeScript types and behaviour for:

- TherapeuticCircuit;
- TargetFamily;
- EvidenceClaim;
- TargetCandidate;
- TargetReliabilityProfile;
- TargetSlate;
- ClinicianDecision;
- PhenotypeSnapshot;
- scientific enums;
- workflow states.

It must have:

# no Supabase dependency.

The domain must be independently testable.

---

# 12. PACKAGE — `schemas`

Contains runtime schemas for:

- API commands;
- queue contracts;
- canonical JSON;
- scientific manifests;
- snapshots.

Recommended:

# Zod

with generated JSON Schema where useful.

Canonical TypeScript and runtime validation must not drift.

---

# 13. PACKAGE — `phenotype`

Responsibilities:

- phenotype domain calculations;
- symptom-domain mapping;
- snapshot validation;
- circuit eligibility input preparation.

It must not:

- generate targets;
- query MRI;
- assign Evidence Tier.

---

# 14. PACKAGE — `evidence`

Responsibilities:

- Evidence Library loading;
- graph traversal;
- evidence-path resolution;
- evidence-ceiling calculation;
- conflict retrieval;
- external-validity queries.

No patient-specific target ranking.

---

# 15. PACKAGE — `target-engine`

The deterministic core.

Inputs:

- approved phenotype snapshot;
- pinned evidence release;
- connectome measurements;
- target reliability;
- accessibility;
- policy release.

Outputs:

- all candidates;
- suppressed candidates;
- Target Slate;
- explanations;
- reproducibility manifest.

It should run:

# without Next.js

# without Supabase

# without internet.

---

# 16. PACKAGE — `scientific-policy`

Contains versioned policy definitions such as:

- permitted Evidence Tiers;
- reliability thresholds;
- ranking weights;
- redundancy rules;
- convergence rules;
- personalisation-adoption thresholds.

Scientific configuration is separate from application configuration.

---

# 17. PACKAGE — `presentation`

Transforms canonical scientific objects into UI view models.

Examples:

```text
TargetCandidate
↓
TargetCandidateViewModel
```

This package contains formatting.

It must not recalculate scientific classes.

---

# 18. PACKAGE — `ui`

Reusable visual components:

- buttons;
- panels;
- forms;
- dialogs;
- typography;
- tables;
- evidence badges;
- scientific warning components.

The 3D brain viewer may remain a feature-specific component rather than becoming an overly generic design-system component.

---

# 19. PACKAGE — `test-fixtures`

Contains synthetic:

- cases;
- phenotypes;
- connectome measurements;
- targets;
- evidence releases.

Fixtures are version-controlled and contain no patient data.

---

# 20. NEUROCOMPUTE REPOSITORY STRUCTURE

```text
services/neurocompute/
├── magniom_neuro/
│   ├── ingest/
│   ├── structural/
│   ├── bold/
│   ├── denoise/
│   ├── surface/
│   ├── parcellation/
│   ├── connectome/
│   ├── circuits/
│   ├── normative/
│   ├── candidates/
│   ├── reliability/
│   ├── qc/
│   └── manifests/
│
├── containers/
├── tests/
└── validation/
```

Python should own scientific imaging calculations.

Do not reimplement these in TypeScript.

---

# 21. CONTAINER ARCHITECTURE

Do not begin with one enormous mutable image if scientific components can be meaningfully separated.

Recommended eventual images:

```text
magniom-neuro-base
magniom-neuro-structural
magniom-neuro-bold
magniom-neuro-connectome
magniom-neuro-targeting
magniom-efield
```

However, early development may use fewer images if dependency management is simpler.

Release builds must remain immutable and digest-pinned.

---

# 22. `magniom-neuro-base`

Contains:

- OS;
- Python runtime;
- dcm2niix;
- nibabel;
- NumPy;
- SciPy;
- core utilities;
- BIDS tooling;
- manifests.

No clinical scientific configuration is downloaded at runtime.

---

# 23. `magniom-neuro-structural`

Contains pinned:

- fMRIPrep dependencies;
- FreeSurfer/FastSurfer where applicable;
- ANTs;
- Connectome Workbench;
- templates.

Produces:

- structural derivatives;
- surfaces;
- transform graph.

---

# 24. `magniom-neuro-bold`

Contains:

- BOLD preprocessing;
- tedana;
- Magniom CD-1 denoising;
- sensitivity pipeline.

Produces:

- denoised time series;
- censor masks;
- QC.

---

# 25. `magniom-neuro-connectome`

Produces:

- parcel time series;
- run matrices;
- combined connectivity;
- normative features;
- therapeutic-circuit time series/maps.

---

# 26. `magniom-neuro-targeting`

Produces:

- TargetFamily search surfaces;
- candidate clusters;
- run-level candidate localisations;
- split-half candidate localisations;
- pipeline-sensitivity localisations;
- TargetReliabilityProfile.

It does not create the clinical Target Slate.

---

# 27. `magniom-efield`

Initially separate because:

- different dependencies;
- large computational requirements;
- separate scientific validation;
- future optionality.

E-field should not delay the core MVP.

---

# 28. CONTAINER RELEASE MANIFEST

Every scientific container release records:

```text
container name
semantic version
Git commit
base-image digest
package lock hash
scientific resources
resource hashes
SBOM
build date
verification result
```

---

# 29. SUPABASE MIGRATION SEQUENCE

Recommended exact initial sequence:

```text
001_extensions.sql
002_schemas.sql
003_core_types.sql
004_identity.sql
005_permissions.sql
006_security_helpers.sql

007_clinical_cases.sql
008_clinical_assessment.sql
009_phenotype_ontology.sql
010_phenotype_snapshots.sql

011_system_versions.sql

012_imaging_studies.sql
013_imaging_artifacts.sql
014_imaging_qc.sql

015_connectome_runs.sql
016_connectome_metrics.sql
017_reliability.sql

018_evidence_sources.sql
019_evidence_claims.sql
020_evidence_circuits.sql
021_evidence_target_families.sql
022_evidence_graph.sql
023_evidence_releases.sql

024_target_candidates.sql
025_target_slates.sql
026_clinician_decisions.sql

027_treatment.sql
028_outcomes.sql

029_workflow_jobs.sql
030_outbox.sql
031_audit.sql

032_domain_functions.sql
033_immutability.sql
034_rls.sql
035_api_views.sql
036_storage_policies.sql
037_queues.sql

038_seed_permissions.sql
039_seed_scientific_reference.sql
040_security_tests.sql
```

---

# 30. MIGRATION PRINCIPLE

Do not implement scientific tables in the order they were conceived.

Implement:

# identity and immutable clinical snapshots first,

then:

# evidence and target semantics,

then:

# imaging compute.

This permits synthetic end-to-end development before real MRI processing exists.

---

# 31. MIGRATION TEST GATE

Every migration must pass:

- clean database rebuild;
- forward migration;
- database tests;
- RLS tests;
- domain integrity tests.

No migration should depend on manual Dashboard changes.

---

# 32. DEVELOPMENT DATABASE

Synthetic data only.

Never import real clinical data into:

- local developer database;
- ordinary preview environments;
- CI.

---

# 33. VALIDATION ENVIRONMENT

Create a separate:

# validation Supabase project / equivalent isolated environment.

Used for:

- de-identified validation datasets;
- frozen release candidates;
- human-factors studies;
- retrospective validation.

It should not be casually altered by daily development migrations.

---

# 34. PRODUCTION ENVIRONMENT

Production exists only once:

- information-security review;
- regulatory strategy;
- operational procedures;
- clinical governance

are sufficiently mature.

Do not use production as validation infrastructure.

---

# 35. EVIDENCE-LIBRARY SEEDING

Evidence Library 1.0 should be seeded manually and deliberately.

Do not begin with hundreds of papers.

Initial seed should focus on:

### Established depression evidence

- RANZCP guidance;
- major left-DLPFC sham-controlled trials;
- THREE-D.

### sgACC circuit evidence

- Fox 2012;
- Fox 2013;
- Weigand 2018;
- larger multisample stimulation-site connectivity analysis;
- SNT.

### Convergent circuit evidence

- lesion/TMS/DBS convergence;
- 2026 connectivity-guided trial.

### Symptom circuits

- Siddiqi 2020;
- 2026 prospective dysphoric/anxiosomatic trial.

### Contradictory/general evidence

- BRIGhTMIND;
- 2025 personalised-targeting meta-analysis.

### Cingulum Research Mode

- MDD proof-of-concept;
- anxiety;
- sleep;
- safety;
- selected research applications.

---

# 36. EVIDENCE SEED PROCEDURE

For every source:

```text
Bibliographic verification
        ↓
Source object
        ↓
Candidate EvidenceClaims
        ↓
Population
        ↓
Outcome
        ↓
Circuit relationship
        ↓
TargetFamily relationship
        ↓
Supporting/conflicting edges
        ↓
Reviewer 1
        ↓
Reviewer 2
        ↓
Evidence approver
```

---

# 37. NO AUTO-SEED FROM LLM

LLM extraction may generate:

# drafts.

It may not produce the active Evidence Library directly.

The v1 release should be sufficiently small that every clinical claim is manually verified.

---

# 38. EVIDENCE GOLDEN QUERIES

Before Evidence Library 1.0 activates, tests must prove that:

```text
MDD
→ established left DLPFC
```

works.

```text
MDD + anxious phenotype
→ anxiosomatic circuit
```

works.

```text
L8Av anomaly
→ Research only
```

works.

```text
personalised targeting
→ positive AND negative/limiting evidence
```

works.

---

# 39. SYNTHETIC GOLDEN CASE LIBRARY

Create:

```text
validation/golden-cases/
```

Each case contains:

```text
case.json
phenotype.json
connectome.json
reliability.json
evidence-release.json
expected-candidates.json
expected-suppressed.json
expected-slate.json
expected-explanations.json
```

---

# 40. GOLDEN CASE G01 — EVIDENCE ONLY

**Phenotype**

MDD, dysphoric dominant.

**Connectome**

Unavailable.

**Expected**

- Evidence Anchor exists.
- No personalised refinement.
- Personalisation status = not available.
- Valid Clinical Target Slate.

Purpose:

prove Magniom works without fMRI personalisation.

---

# 41. G02 — HIGH-CONVERGENCE PERSONALISATION

Evidence baseline and personalised convergent-circuit target differ modestly.

Reliability:

High.

Expected:

- personalised variant qualifies;
- Primary 1 becomes personalised;
- baseline retained as counterfactual;
- convergence = high.

---

# 42. G03 — LOW INCREMENTAL VALUE

Personalised target reliable but provides little circuit improvement.

Expected:

- evidence baseline remains Primary 1;
- personalised candidate stored;
- suppression/alternative reason = low incremental value.

---

# 43. G04 — UNRELIABLE CONNECTOME

FC suggests dramatic target shift.

Reliability:

Unreliable.

Expected:

- FC cannot influence ranking;
- evidence baseline remains Primary 1;
- contextual FC candidate clearly nonclinical.

---

# 44. G05 — ANXIOSOMATIC-DOMINANT

MDD plus high clinician-approved anxiosomatic priority.

Expected:

- Primary 1 evidence anchor;
- Primary 2 anxiosomatic target;
- no arbitrary third target.

---

# 45. G06 — DYSPHORIC-DOMINANT

Minimal anxiety.

Expected:

- dysphoric/evidence pathways converge;
- redundant nearby candidates collapse;
- no unnecessary Primary 2.

---

# 46. G07 — MIXED PHENOTYPE

Both targetable domains high priority.

Expected:

- at least two distinct clinical hypotheses if anatomically/scientifically distinct.

---

# 47. G08 — RESEARCH ANOMALY

Large L8Av normative deviation.

Expected:

- Research candidate visible only in Research Mode;
- Clinical Slate unchanged.

---

# 48. G09 — MAJOR FC DIVERGENCE

Reliable FC target 30+ mm from baseline.

Expected:

- `MAJOR_DIVERGENCE`;
- no automatic displacement of evidence anchor where evidence-transfer rule fails.

---

# 49. G10 — REDUNDANT FIVE-CANDIDATE SET

Many eligible nearby targets.

Expected:

- redundancy suppression;
- fewer than five Slate positions filled.

---

# 50. G11 — ANATOMICAL INACCESSIBILITY

Highest-connectivity candidate fails stimulability.

Expected:

- candidate suppressed;
- next eligible candidate considered.

---

# 51. G12 — NO CLINICAL TARGET

All clinically permissible candidates fail.

Expected:

# complete abstention.

No fallback invented.

---

# 52. G13 — RESEARCH-CLINICAL LEAKAGE ATTACK

Input deliberately attempts to place Research-only TargetFamily in Clinical Slate.

Expected:

- Target Engine rejects;
- database constraint rejects;
- security/scientific test passes.

---

# 53. G14 — STALE PHENOTYPE

Target Slate references Snapshot 1 while Snapshot 2 is current.

Expected:

- signing prohibited.

---

# 54. G15 — CONFLICTING EVIDENCE

Candidate has strong supporting and conflicting claims.

Expected:

- both evidence paths visible;
- limitations cannot be omitted.

---

# 55. G16 — EVIDENCE RELEASE CHANGE

Same patient:

Evidence 1.0 versus 1.1.

Expected:

- deterministic but potentially different slates;
- historical 1.0 unchanged;
- change report explains result.

---

# 56. G17 — PIPELINE VERSION CHANGE

Same connectomic measurements recomputed under pipeline v2.

Expected:

- explicit new ConnectomeRun;
- no mutation of previous Target Slate.

---

# 57. G18 — EXACT TIE

Candidates scientifically equivalent under current engine.

Expected:

- deterministic tie-break;
- `SCIENTIFICALLY_EQUIVALENT` warning;
- no fabricated confidence difference.

---

# 58. G19 — NO-TARGET CLINICIAN DECISION

Valid Target Slate exists.

Clinician selects:

# no target / defer.

Expected:

- valid signed decision;
- no forced final target.

---

# 59. G20 — CLINICIAN OVERRIDE

Clinician chooses a non-Primary target.

Expected:

- original Slate immutable;
- override rationale saved;
- final target separately stored.

---

# 60. TARGET ENGINE TEST PYRAMID

## Unit tests

Every gate, calculation and transformation.

## Property tests

Scientific invariants.

## Golden-case tests

End-to-end deterministic outputs.

## Sensitivity tests

Parameter perturbation.

## Regression tests

Previous version comparison.

## Scientific validation

Historical/clinical outcome relationships.

---

# 61. TARGET ENGINE UNIT TESTS

Required coverage includes:

- evidence gate;
- Clinical/Research separation;
- phenotype concordance;
- circuit normalization;
- reliability qualification;
- accessibility gate;
- geometric utility;
- personalisation adoption;
- redundancy;
- convergence;
- counterfactual displacement;
- role selection;
- abstention;
- explanation facts.

---

# 62. PROPERTY TESTS

Examples:

```text
Worse reliability must not improve personalised ranking.

Research evidence must never outrank eligible Clinical
evidence because of connectivity magnitude.

Adding a redundant candidate must not force an additional
Slate position.

Same input must always produce same output.

Failed connectome must not produce a personalised Primary.

More target candidates must not necessarily increase
Slate cardinality.
```

---

# 63. NUMERICAL TESTING

Test:

- edge values 0 and 1;
- floating-point near thresholds;
- NaN;
- Infinity;
- missing values;
- exact ties.

Scientific ranking must fail safely on invalid numbers.

---

# 64. TARGET ENGINE GOLDEN HASH

Each Golden Case contains:

```text
expected_slate_sha256
```

A candidate engine release that changes the hash must produce a documented:

# Golden Case Impact Report.

---

# 65. SUPABASE TEST PLAN

Required categories:

### Schema integrity

### RLS allow/deny

### Immutability

### State transitions

### Signing

### Evidence release

### Storage security

### Queue security

### Cross-organisation isolation

### Privileged-function security.

---

# 66. SECURITY TESTS

At minimum:

- organisation A cannot access organisation B patient;
- inactive user loses access;
- organisation administrator without clinical permission cannot view MRI;
- researcher cannot read identifiable clinical case;
- browser cannot insert TargetCandidate;
- browser cannot sign decision by direct table mutation;
- signed decision cannot update;
- expired/invalid upload paths rejected;
- worker cannot access unrelated cases.

---

# 67. ADVERSARIAL DATABASE TEST

Actively attempt:

```text
SET organisation_id = another organisation
```

through client payload.

Expected:

RLS and server command derive actual organisation independently and deny attack.

---

# 68. API CONTRACT TESTS

Every endpoint/command tests:

- valid payload;
- invalid schema;
- unauthenticated;
- wrong organisation;
- insufficient role;
- stale version;
- idempotent replay;
- database rollback.

---

# 69. QUEUE TESTS

Simulate:

- worker crash;
- duplicate message;
- delayed retry;
- stale job;
- terminal error;
- queue replay.

Expected:

scientific outputs are not duplicated or corrupted.

---

# 70. STORAGE TESTS

Test:

- permitted upload;
- wrong-org upload path;
- wrong-case path;
- forged artifact ID;
- signed URL expiry;
- signed URL logging prevention;
- artefact hash mismatch.

---

# 71. WEB TESTING

Use:

### component tests

for forms and clinical components.

### integration tests

for Server Actions/domain commands.

### end-to-end tests

for complete case workflow.

Critical browser E2E scenarios must include:

- phenotype approval;
- Target Slate review;
- evidence drawer;
- rejecting Primary 1;
- no-target decision;
- stale-slate block;
- decision signing.

---

# 72. VISUAL REGRESSION

Use screenshot regression for:

- evidence labels;
- reliability warnings;
- Research Mode banner;
- decision page;
- stale-state warning.

Not every pixel change should block release, but safety-critical visual changes deserve review.

---

# 73. ACCESSIBILITY TESTS

Automated:

- keyboard;
- labels;
- ARIA;
- contrast;
- focus.

Manual:

- screen reader;
- no-colour interpretation;
- keyboard-only decision signing;
- text equivalent of 3D target.

Target:

# WCAG 2.2 AA.

---

# 74. NEUROIMAGING VALIDATION LIBRARY

Separate from synthetic Golden Cases.

Create:

```text
validation/imaging/
```

with de-identified or properly consented/reference datasets.

---

# 75. IMAGING DATASET I01 — LOW MOTION

Purpose:

baseline reproducibility.

Expected:

- all QC pass;
- high FC stability;
- stable candidate localisation.

---

# 76. I02 — MODERATE MOTION

Tests:

- censoring;
- retained duration;
- reliability degradation.

---

# 77. I03 — MOTION FAILURE

Expected:

- personalised FC abstention.

---

# 78. I04 — STRUCTURAL RECONSTRUCTION CHALLENGE

Tests:

- segmentation failure;
- target search mask;
- manual correction workflow if permitted.

---

# 79. I05 — ATLAS BOUNDARY

Candidate near HCP-MMP boundary.

Tests:

- atlas uncertainty;
- no overconfident parcel naming.

---

# 80. I06 — GSR-SENSITIVE TARGET

CD-1 versus SD-1 target shifts substantially.

Expected:

- pipeline-sensitivity metric elevated;
- reliability appropriately affected.

---

# 81. I07 — HIGHLY STABLE TARGET

Two runs and split halves tightly converge.

Purpose:

positive-control reliability case.

---

# 82. I08 — SIGNAL DROPOUT

Circuit-specific signal dropout.

Expected:

- affected circuit invalid;
- unaffected circuit may remain valid.

---

# 83. I09 — MULTI-SCANNER

Same or comparable participant scanned across scanner conditions where feasible.

Tests site/scanner stability.

---

# 84. I10 — REPEAT SESSION

Separate-day repeat.

This is crucial for establishing whether individual localisation reflects:

# person-specific signal

rather than:

# one-session noise.

---

# 85. NEUROCOMPUTE UNIT TESTS

Test small deterministic functions such as:

- censor mask construction;
- parcel extraction;
- Fisher transform;
- matrix combination;
- circuit-weight calculation;
- candidate clustering;
- coordinate conversion;
- distance;
- reliability metrics;
- manifest hashes.

---

# 86. NEUROCOMPUTE INTEGRATION TESTS

Run controlled mini-datasets through:

```text
BIDS
→ structural
→ BOLD
→ denoise
→ surface
→ FC
→ circuit
→ candidate
→ reliability
```

Compare expected outputs.

---

# 87. SCIENTIFIC REPRODUCIBILITY TEST

Same:

- input;
- container;
- hardware class where required;
- configuration

should produce scientifically equivalent results.

Byte-identical output is desirable where achievable but may not be realistic for every external neuroimaging dependency.

Define numerical tolerances explicitly.

---

# 88. CROSS-HARDWARE TEST

Before Clinical Mode:

compare supported hardware environments.

Measure:

- matrix differences;
- target displacement;
- cluster identity;
- reliability.

If hardware materially changes targets:

hardware becomes part of validated deployment configuration.

---

# 89. PIPELINE UPGRADE TEST

Every new pipeline candidate reports:

```text
FC matrix correlation vs previous
circuit-map correlation
target displacement
candidate cluster overlap
QC changes
abstention changes
```

No “dependency update” enters Clinical Mode without this analysis.

---

# 90. SCAN-DURATION VALIDATION

Acquire long datasets and truncate to:

```text
6
9
12
15
20
25
30 minutes
```

For each TargetFamily calculate:

- cross-half distance;
- target convergence;
- reliability;
- candidate-family stability.

This produces empirical Magniom thresholds.

---

# 91. MOTION VALIDATION

Quantify interaction:

```text
retained minutes × motion
```

rather than evaluating one threshold independently.

Example question:

> Is 15 minutes at mean FD 0.25 mm more reliable than 10 minutes at 0.10 mm?

Let validation data answer this.

---

# 92. DENOISING VALIDATION

Compare predefined:

```text
CD-1
SD-1
```

and selected research variants.

Outcome measures:

- target displacement;
- circuit-map similarity;
- run-to-run reliability.

Do not select the pipeline because it produces the most clinically appealing coordinate.

---

# 93. EVIDENCE KNOWLEDGE TESTING

Every release requires automated graph validation.

Test:

- orphan claims;
- missing sources;
- Research leakage;
- missing search spaces;
- missing population;
- missing conflicts;
- invalid circuit-map hash;
- coordinate-space omissions.

---

# 94. EVIDENCE REVIEW AUDIT

Evidence Library 1.0 activation requires:

- source list;
- claim list;
- reviewers;
- conflicts;
- release manifest;
- signed scientific approval.

---

# 95. UX PROTOTYPE SEQUENCE

Do not start with polished 3D graphics.

Prototype in six levels.

---

# 96. UX P0 — STATIC WIREFRAMES

Build:

- Case Overview;
- Phenotype;
- Target Slate;
- Comparison;
- Decision.

Use synthetic text only.

Goal:

validate information hierarchy.

---

# 97. UX P1 — CLICKABLE LOW-FIDELITY

Clinician can:

- reorder priorities;
- approve phenotype;
- inspect candidates;
- reject candidate;
- sign synthetic decision.

No brain viewer.

Goal:

validate workflow and automation-bias safeguards.

---

# 98. UX P2 — FUNCTIONAL WEB PROTOTYPE

Connected to Supabase synthetic database.

Implements:

- Auth;
- roles;
- immutable snapshots;
- Target Engine synthetic execution;
- audit.

This becomes Engineering Prototype M1.

---

# 99. UX P3 — STATIC BRAIN VIEWER

Add:

- subject/synthetic surface;
- target overlays;
- counterfactual;
- uncertainty region.

Goal:

validate coordinate comprehension.

---

# 100. UX P4 — REAL CONNECTOME VIEWER

Integrate de-identified real:

- cortical surface;
- circuit map;
- target clusters;
- reliability.

Still Research Mode.

---

# 101. UX P5 — HUMAN-FACTORS PROTOTYPE

Freeze enough UI for formal formative testing.

It must include realistic:

- warnings;
- conflicting evidence;
- Research candidates;
- failed personalisation;
- clinician override.

---

# 102. UX P6 — SUMMATIVE / RELEASE-CANDIDATE UI

Only after formative findings are resolved.

Changes to critical decision interactions after summative usability validation should trigger impact assessment and potentially revalidation.

---

# 103. IMPLEMENTATION SPRINT MODEL

Use:

# two-week engineering sprints

with scientific milestones spanning multiple sprints.

The roadmap below is sequencing guidance, not a promise that clinical validation follows engineering calendar time.

---

# 104. SPRINT 0 — CONTROLLED DEVELOPMENT FOUNDATION

Deliver:

- repository;
- CI;
- coding standards;
- requirement IDs;
- design-control templates;
- risk register;
- environment strategy;
- basic Next.js app;
- Supabase local environment.

Exit:

# reproducible clean build.

---

# 105. SPRINT 1 — DOMAIN CORE

Implement:

- canonical objects;
- enums;
- schemas;
- scientific version objects;
- Golden Case fixtures G01–G05.

Exit:

Target Slate objects can be created/validated without database.

---

# 106. SPRINT 2 — TARGET ENGINE SKELETON

Implement:

- gates;
- evidence baseline;
- phenotype concordance;
- role-based Slate assembly;
- abstention;
- deterministic manifest.

No connectome yet.

Exit:

G01 and basic non-imaging Golden Cases pass.

---

# 107. SPRINT 3 — SUPABASE IDENTITY + CLINICAL CORE

Implement migrations:

001–010.

Deliver:

- Auth;
- organisation/site;
- memberships;
- clinician identity;
- patients;
- cases;
- assessments;
- phenotype snapshots;
- RLS foundation.

Exit:

approved synthetic phenotype stored immutably.

---

# 108. SPRINT 4 — EVIDENCE GRAPH

Implement migrations:

018–023.

Seed:

- first clinical claims;
- circuits;
- target families;
- sources.

Integrate graph traversal into Target Engine.

Exit:

Evidence Ceiling works from database-derived release package.

---

# 109. SPRINT 5 — TARGETING + DECISIONS

Implement:

024–026 plus audit foundation.

Deliver:

- TargetCandidate persistence;
- TargetSlate;
- clinician review;
- immutable sign-off;
- stale protection.

Exit:

synthetic end-to-end workflow works.

This is the first true:

# Magniom Engineering Prototype.

---

# 110. SPRINT 6 — CLINICIAN UX P2

Deliver:

- case shell;
- workflow rail;
- phenotype workspace;
- Target Slate;
- evidence drawer;
- comparison;
- decision screen.

No real MRI.

Begin formative clinician review.

---

# 111. SPRINT 7 — WORKFLOW / QUEUES / STORAGE

Implement:

- artifact registry;
- private buckets;
- jobs;
- queues;
- outbox;
- worker authentication;
- progress reporting.

Exit:

synthetic background job can generate and publish Target Slate securely.

---

# 112. SPRINT 8 — NEUROCOMPUTE INGEST + STRUCTURAL

Implement:

- DICOM/BIDS ingestion;
- manifests;
- structural processing;
- surfaces;
- QC;
- artifact hashes.

Research Mode only.

---

# 113. SPRINT 9 — BOLD + DENOISING

Implement:

- fMRIPrep pipeline;
- multi-echo;
- tedana;
- CD-1;
- motion censoring;
- retained time;
- functional QC.

Exit:

validated BOLD time series produced.

---

# 114. SPRINT 10 — CONNECTOME + CIRCUITS

Implement:

- surface projection;
- HCP-MMP reference mapping;
- parcel series;
- run FC;
- combined FC;
- sgACC;
- convergent circuit;
- symptom circuits.

Exit:

real patient/reference data can produce versioned circuit measurements.

---

# 115. SPRINT 11 — TARGET RELIABILITY

Implement:

- cross-run;
- split-half;
- CD-1/SD-1 sensitivity;
- map similarity;
- cluster overlap;
- reliability profile.

This sprint is a hard prerequisite for any claim of personalised targeting.

---

# 116. SPRINT 12 — REAL TARGET ENGINE INTEGRATION

Replace synthetic connectome inputs with NeuroCompute contract.

Run:

- G02–G18;
- imaging validation cases.

Exit:

Research Prototype M2.

---

# 117. SPRINT 13 — 3D CLINICAL VIEWER

Add:

- subject surface;
- target ROI;
- counterfactual;
- confidence region;
- circuit overlays;
- comparison.

Validate coordinate round trip.

---

# 118. SPRINT 14 — SECURITY HARDENING

Deliver:

- full RLS suite;
- worker permissions;
- penetration-test preparation;
- threat model;
- SBOM;
- secret rotation;
- logging controls;
- backup/restore testing.

---

# 119. SPRINT 15 — VALIDATION BUILD FREEZE

Freeze:

- Target Engine;
- Evidence Library;
- Phenotype Ontology;
- Neuro Pipeline;
- Scientific Policy;
- UX version.

Generate:

# Verification Build M3.

No feature work enters this branch without change-control assessment.

---

# 120. ENGINEERING COMPLETION GATE

At the end of implementation sprints, Magniom should be:

# technically feature-complete for v1.

This is not permission for clinical deployment.

The programme now shifts from:

# build

to:

# demonstrate.

---

# 121. FORMAL SOFTWARE VERIFICATION

Verification asks:

> Did we build Magniom according to its specifications?

Required reports:

### Software Requirements Verification

### Database Verification

### Security Verification

### Target Engine Verification

### NeuroCompute Verification

### Evidence Graph Verification

### UX Critical Task Verification.

---

# 122. VERIFICATION EXIT CRITERIA

Before retrospective validation:

- all critical requirements traced;
- no open critical software defects;
- all Golden Cases pass;
- deterministic engine confirmed;
- RLS tests pass;
- signed decisions immutable;
- coordinate laterality tests pass;
- scientific manifests reproducible;
- Research/Clinical separation verified.

---

# 123. DEFECT CLASSIFICATION

## Critical

Potential wrong clinical target, cross-patient data leak, wrong laterality, failed clinical/research boundary.

Release blocked.

## Major

Could materially mislead interpretation or corrupt important workflow.

Release normally blocked.

## Minor

No meaningful clinical/scientific impact.

May be accepted with documented rationale.

---

# 124. RETROSPECTIVE VALIDATION — PURPOSE

First major clinical-scientific validation should ask:

> If Magniom had existed before these patients were treated, what would it have generated?

The system must be blinded to outcomes during target generation.

---

# 125. RETROSPECTIVE DATASET

Prefer cases with:

- MDD;
- detailed baseline symptoms;
- treatment targets;
- treatment protocol;
- outcomes;
- structural MRI;
- rs-fMRI where available.

Where historical rs-fMRI is not acquisition-compatible:

use separate cohorts for:

- phenotype/target reasoning validation;
- imaging reliability validation.

Do not pretend heterogeneous historical scans satisfy the prospective Clinical Pipeline.

---

# 126. LOCKED RETROSPECTIVE DATASET

Before analysis:

freeze:

```text
participants
inclusion/exclusion
primary endpoints
analysis plan
engine version
evidence version
policy version
```

Avoid tuning the engine repeatedly against outcomes.

---

# 127. RETROSPECTIVE DEVELOPMENT VS VALIDATION

At minimum split:

```text
development cohort
validation cohort
```

Parameters may be adjusted using development data.

The validation cohort must remain untouched until algorithm freeze.

---

# 128. RETROSPECTIVE PRIMARY ENDPOINTS

Initially focus on scientifically interpretable endpoints.

### Target reproducibility

### Distance between Magniom candidate and delivered target

### Target-family concordance

### Circuit concordance

### Clinician/Magniom agreement

### Candidate rank versus historical outcome

### Personalisation effect size versus baseline-target relationship.

---

# 129. RETROSPECTIVE OUTCOME ANALYSIS

Potential hypotheses:

> Better concordance between delivered TMS E-field/location and higher-ranked Magniom candidate is associated with greater symptom improvement.

> Delivered sites closer to the patient-specific convergent-circuit target have better outcomes than sites farther away.

> Dysphoric/anxiosomatic target relationships differ by domain-specific outcome.

These should be prospectively specified.

---

# 130. RETROSPECTIVE RESULT INTERPRETATION

Even a strong retrospective relationship does not establish:

# Magniom-guided treatment superiority.

It establishes:

# justification for prospective testing.

---

# 131. RETROSPECTIVE FAILURE CRITERIA

Pause clinical advancement if:

- targets are poorly reproducible;
- candidate ranking shows no meaningful relationship to scientifically relevant endpoints;
- major subgroups show systematic target instability;
- evidence-only targeting performs as well or better without added complexity and no incremental decision value is apparent.

The goal is not to force validation success.

---

# 132. HUMAN-FACTORS PROGRAMME

Human-factors validation proceeds alongside retrospective scientific validation.

TGA currently identifies IEC 62366-1-style usability engineering as relevant to software medical devices.

---

# 133. FORMATIVE HUMAN-FACTORS ROUND 1

Participants:

approximately 5–8 representative TMS clinicians can be sufficient for early formative discovery, though exact study design should be determined by the human-factors plan.

Tasks:

- phenotype approval;
- evidence inspection;
- understanding personalisation;
- rejecting target.

Goal:

identify gross conceptual problems.

---

# 134. FORMATIVE ROUND 2

Use more realistic cases.

Deliberately include:

- misleading attractive personalised target;
- Research anomaly;
- low reliability;
- evidence conflict.

Measure:

- missed limitations;
- inappropriate acceptance;
- workflow burden.

---

# 135. FORMATIVE ROUND 3

Near-final UI.

Test:

- full target decision;
- stale Slate;
- override;
- no target;
- coordinate-space comprehension.

Resolve safety-critical usability findings before summative study.

---

# 136. SUMMATIVE / VALIDATION HUMAN-FACTORS STUDY

Use representative intended users without coaching them during tasks.

Critical endpoints:

- correct identification of evidence basis;
- correct reliability interpretation;
- correct distinction of Research target;
- ability to reject Primary 1;
- ability to detect stale Slate;
- safe final sign-off;
- no systematic assumption that Primary 1 is automatically correct.

---

# 137. AUTOMATION-BIAS ENDPOINT

A dedicated scenario should intentionally make:

# Magniom Primary 1 inappropriate given supplied clinical context.

The clinician should be able to reject it.

If trained specialists systematically fail:

the UI safety architecture is inadequate even if the algorithm is technically correct.

---

# 138. SILENT PROSPECTIVE VALIDATION

This is the first prospective patient-stage evaluation.

Workflow:

```text
Patient assessed
        ↓
Clinician chooses target through existing standard practice
        ↓
Decision frozen
        ↓
Magniom independently processes same case
        ↓
Magniom Target Slate frozen
        ↓
Magniom result hidden from treating clinician
        ↓
Treatment delivered normally
        ↓
Outcomes collected
        ↓
Predetermined analysis
```

This is the safest initial prospective test.

---

# 139. WHY SILENT PROSPECTIVE COMES FIRST

It avoids:

- automation bias;
- changing treatment prematurely;
- contaminating validation;
- clinician choosing the target to agree with Magniom.

It also tests the real:

- acquisition workflow;
- processing time;
- QC;
- abstention rate;
- target reproducibility.

---

# 140. SILENT PROSPECTIVE ENDPOINTS

## Operational

- proportion successfully processed;
- processing failures;
- target-generation completion;
- QC pass/conditional/fail;
- abstention.

## Scientific

- target reproducibility;
- Magniom/clinician distance;
- target-family agreement;
- convergence;
- personalisation displacement.

## Clinical association

- outcome by Magniom/actual-target concordance;
- symptom-specific associations.

---

# 141. PROSPECTIVE PRE-REGISTRATION

Before patient enrolment:

freeze:

- study protocol;
- primary endpoints;
- secondary endpoints;
- algorithm;
- Evidence Library;
- imaging pipeline;
- statistical analysis plan.

Do not upgrade the engine mid-study unless protocol explicitly defines how.

---

# 142. STUDY VERSIONING

If Magniom 1.1 emerges during validation:

patients already enrolled remain analysed under:

# Magniom 1.0

unless the study protocol prospectively permits transition.

---

# 143. CLINICAL TRIAL GOVERNANCE

Australian studies using an unapproved software medical device may require CTN or CTA arrangements, depending on the study and regulatory pathway.

In addition:

- HREC/ethics approval;
- site governance;
- participant consent;
- privacy;
- GCP considerations

must be addressed appropriately.

---

# 144. SILENT PROSPECTIVE PROMOTION GATE

Proceed to clinician-assisted testing only if:

### Technical

Processing is operationally reliable.

### Scientific

Target reproducibility is acceptable.

### Safety

No unexplained systematic laterality/coordinate/QC failures.

### Algorithmic

Abstention works appropriately.

### Clinical association

Results are at least sufficiently promising to justify exposing the Target Slate.

No single p-value should define this gate.

---

# 145. CLINICIAN-ASSISTED PROSPECTIVE VALIDATION

Next stage:

Magniom Target Slate is shown to clinicians within an approved protocol.

Clinician remains free to:

- accept;
- reject;
- modify;
- ignore.

Measure the effect of Magniom on decisions.

---

# 146. PRIMARY DECISION-UTILITY ENDPOINTS

Potential endpoints:

- change from clinician's pre-Magniom target;
- decision time;
- inter-clinician agreement;
- evidence review behaviour;
- confidence;
- override;
- target-selection consistency;
- error rates.

---

# 147. PRE-MAGNIOM DECISION CAPTURE

For validation:

clinician first records:

```text
intended TargetFamily
approximate target
clinical rationale
confidence
```

before seeing Magniom.

Then Magniom is revealed.

This quantifies:

# actual decision influence.

---

# 148. POST-MAGNIOM CAPTURE

Record:

```text
final target
whether changed
distance changed
reason
Magniom influence
agreement/disagreement
```

This produces high-value validation data.

---

# 149. CLINICIAN-ASSISTED SAFETY ENDPOINTS

Monitor:

- inappropriate reliance on low-reliability target;
- failure to identify evidence conflict;
- Research/Clinical confusion;
- failure to recognise stale data;
- inappropriate treatment of all Slate targets.

---

# 150. CLINICAL PERFORMANCE STUDY

Eventually ask the key causal question:

# Does Magniom-assisted target selection improve clinically meaningful outcomes compared with high-quality standard target selection?

Preferred study design:

# randomized prospective comparison

where feasible.

---

# 151. CONTROL CONDITION

The comparator must be credible.

Do not compare Magniom to deliberately poor:

# 5-cm targeting

if modern high-quality standard care is the intended alternative.

Potential comparator:

- MRI-neuronavigated Beam F3;
- another accepted evidence-based targeting workflow.

This makes the result commercially and scientifically meaningful.

---

# 152. ISOLATE TARGETING EFFECT

Where practical, treatment arms should keep comparable:

- stimulation device;
- coil;
- protocol;
- session schedule;
- concomitant care.

Otherwise improvement cannot confidently be attributed to:

# target selection.

---

# 153. CLINICAL ENDPOINTS

Possible primary outcomes:

- MADRS change;
- remission;
- response.

Important secondary outcomes:

- BDI/PHQ;
- BAI/GAD;
- dysphoric-domain change;
- anxiosomatic-domain change;
- function;
- durability;
- safety.

---

# 154. TARGETING-SPECIFIC ENDPOINTS

Also measure:

- actual delivered E-field/target;
- Magniom candidate rank;
- target-to-circuit concordance;
- personalisation displacement;
- reliability;
- convergence.

Otherwise clinical outcome cannot be meaningfully related back to the targeting mechanism.

---

# 155. CLAIM LADDER

Magniom should progressively earn claims.

## Claim Level 0

Magniom generates reproducible scientific target candidates.

Requires technical verification.

## Claim Level 1

Magniom makes evidence and patient connectomics reviewable in one workflow.

Requires usability validation.

## Claim Level 2

Magniom changes clinician target decisions in a controlled, understandable way.

Requires clinician-assisted validation.

## Claim Level 3

Higher Magniom-ranked target concordance is associated with better outcome.

Requires clinical validation.

## Claim Level 4

Magniom-assisted targeting improves outcomes versus high-quality standard targeting.

Requires appropriately controlled prospective clinical evidence.

Never market Claim Level 4 while possessing only Level 1 or 2 evidence.

---

# 156. RESEARCH MODE → CLINICAL MODE GATES

Clinical Mode requires four independent gates:

```text
GATE A — Engineering / Security
GATE B — Scientific / Clinical
GATE C — Human Factors
GATE D — Regulatory / Quality
```

All must pass.

---

# 157. GATE A — ENGINEERING

Required:

### Canonical data contracts frozen.

### All critical verification tests pass.

### Golden Case suite passes.

### Target Engine deterministic.

### Cross-organisation security tested.

### Signed decisions immutable.

### Storage private.

### Artifact hashing functioning.

### NeuroCompute version-pinned.

### Backup/restore tested.

### No open critical cybersecurity defect.

---

# 158. GATE A — SCIENTIFIC SOFTWARE INTEGRITY

Additionally:

### No known laterality error.

### Coordinate transforms validated.

### Search masks validated.

### Clinical/Research separation tested.

### Connectome failure produces abstention rather than guessed target.

### Evidence-only path remains available.

---

# 159. GATE B — SCIENTIFIC

Required:

### Target localisation reproducibility established.

### Reliability thresholds empirically justified.

### Scan-duration requirement empirically justified.

### Denoising sensitivity characterised.

### Evidence Library independently reviewed.

### Candidate search methods reproducible.

### Retrospective validation completed.

### Silent prospective validation completed.

### No major unexplained scientific failure pattern.

---

# 160. GATE B — CLINICAL PERFORMANCE

Before full Clinical Mode, at least one prospectively designed study should establish that Magniom's output is clinically meaningful for its intended use.

The strength required depends on the precise regulatory claim.

A product intended to:

# organise evidence and provide reviewable candidate targets

may require a different evidentiary package from one claiming:

# superior remission rates.

Intended purpose and claims must therefore remain deliberately narrow during early deployment.

TGA requires sufficient clinical evidence to demonstrate that a device achieves its intended purpose and that claims about safety/performance are supported by appropriate evidence.

---

# 161. GATE C — HUMAN FACTORS

Required:

### Intended users identified.

### Critical tasks documented.

### Use-related hazards analysed.

### Formative testing complete.

### Critical UX issues resolved.

### Summative/usability validation complete where required.

### Clinicians reliably distinguish Target Slate from prescription.

### Research Mode understood.

### Reliability limitations understood.

### Target rejection/override demonstrated.

### Stale Target Slates recognised.

---

# 162. GATE D — REGULATORY / QUALITY

Required according to the final pathway:

### Intended purpose frozen.

### Device classification/regulatory strategy documented.

### QMS sufficiently implemented.

### Risk-management file current.

### Software lifecycle documentation complete.

### Verification and validation evidence assembled.

### Clinical evaluation complete for intended claims.

### Cybersecurity documentation complete.

### Human-factors file complete.

### Labelling / IFU defined.

### Version/build identification controlled.

### Appropriate TGA authorisation / ARTG pathway satisfied before commercial supply where required.

---

# 163. CLINICAL MODE MUST NOT BE A FEATURE FLAG ALONE

Changing:

```text
mode = research
```

to:

```text
mode = clinical
```

in a database is not product promotion.

Clinical activation requires a:

# Clinical Release Package

approved through governance.

---

# 164. CLINICAL RELEASE PACKAGE

Must contain:

```text
Web release
Database migration version
Target Engine version
Scientific Policy version
Phenotype Ontology version
Evidence Library version
Neuro Pipeline version
Normative Model version
Circuit artifact manifest
Security verification
Scientific verification
Clinical validation evidence
Human Factors report
Risk-management approval
Regulatory status
```

---

# 165. RELEASE SIGN-OFF

Suggested authorities:

### Engineering

Technical lead.

### Scientific

Connectomics/neuroimaging lead.

### Clinical

TMS specialist/clinical lead.

### Quality

Quality/regulatory lead.

### Security

Security owner.

No single developer activates Clinical Mode.

---

# 166. LIMITED CLINICAL RELEASE

The first Clinical Mode should be intentionally narrow.

Recommended intended population:

# adults with clinician-confirmed MDD undergoing specialist TMS target planning.

Recommended initial functionality:

- phenotype formulation;
- evidence-supported target families;
- patient-specific FC refinement where qualified;
- reliability display;
- Target Slate;
- clinician sign-off.

Avoid initially claiming support for:

- OCD;
- PTSD;
- tinnitus;
- pain;
- stroke;
- brain injury.

Those become separate indication expansions.

---

# 167. INITIAL CLINICAL CLAIM

A conservative first intended-purpose formulation could conceptually be:

> Magniom is intended to support qualified TMS specialists in reviewing evidence-supported cortical target candidates for adults with major depressive disorder by integrating clinician-approved phenotype information, structural MRI, resting-state functional connectivity and target-reliability measurements. Magniom does not autonomously prescribe treatment and final target selection remains the responsibility of the treating clinician.

Final regulatory wording requires specialist review.

---

# 168. CLAIMS TO AVOID AT LAUNCH

Do not initially claim:

### Finds the optimal TMS target.

### Predicts treatment response.

### Improves remission by X%.

### Diagnoses dysfunctional brain networks.

### Determines which protocol to use.

### Selects multiple targets automatically.

### Replaces clinician judgement.

Each creates a much stronger evidentiary burden and may be scientifically unjustified.

---

# 169. POST-MARKET / POST-DEPLOYMENT VALIDATION

Clinical Mode is not the end of validation.

Continue collecting:

- target reliability;
- override rate;
- treatment outcomes;
- target displacement;
- adverse events;
- processing failures;
- evidence conflicts;
- software incidents.

---

# 170. NO AUTOMATIC LEARNING

Post-deployment data enter:

```text
Research Dataset
    ↓
Analysis
    ↓
Proposed algorithm change
    ↓
Validation
    ↓
Scientific Policy / Engine release
```

Never:

```text
Outcome
    ↓
automatic weight update.
```

---

# 171. ALGORITHM CHANGE CONTROL

Changes categorised:

## Non-scientific

UI copy, nonclinical formatting.

## Scientific implementation

Same intended algorithm but implementation changes.

Requires regression testing.

## Scientific parameter

Threshold/weight changes.

Requires scientific impact validation.

## Scientific model

New circuit, new TargetFamily, new ranking method.

Requires formal validation.

---

# 172. EVIDENCE UPDATE CONTROL

New paper alone does not change patients.

Flow:

```text
new source
↓
staging
↓
claim review
↓
new Evidence Library release
↓
impact analysis
↓
clinical activation
```

---

# 173. CHANGE IMPACT REPORT

Every scientific release should answer:

### Which Golden Cases changed?

### Which historical validation cases changed?

### How many Primary 1 targets changed?

### Median coordinate shift?

### Abstention rate change?

### Evidence Tier changes?

### New risks?

### Does clinical validation remain applicable?

---

# 174. VALIDATION DASHBOARD

Internal—not clinician-facing—dashboard should track:

```text
build/version
Golden Case pass rate
RLS/security pass rate
pipeline reproducibility
target reliability
abstention
retrospective performance
silent prospective enrolment/results
human-factors findings
open critical risks
```

---

# 175. STOP CONDITIONS

Magniom development should pause clinical promotion if any of the following emerge:

### Personalised targets routinely unstable.

### Preprocessing choice dominates patient-specific signal.

### Between-pipeline displacement approaches or exceeds between-person variation.

### Clinicians systematically misunderstand Target Slate as prescription.

### Research targets leak into Clinical decisions.

### Evidence paths cannot be reliably reconstructed.

### Clinical outcomes show no plausible incremental utility while workflow burden is substantial.

### Security model cannot adequately protect imaging/clinical data.

A useful scientific project must be able to conclude:

# the current concept is not yet clinically ready.

---

# 176. PROGRAMME SUCCESS METRICS — ENGINEERING

Before Clinical Mode:

```text
100% Golden critical cases pass
100% critical RLS tests pass
0 unresolved critical defects
100% signed-decision immutability tests pass
100% laterality/coordinate critical tests pass
```

These are reasonable hard engineering expectations.

---

# 177. PROGRAMME SUCCESS METRICS — SCIENCE

Do not predeclare arbitrary clinical success numbers before statistical planning.

However validation must demonstrate convincingly that:

### Individual target localisation is reproducible.

### The reliability metric discriminates stable from unstable cases.

### Personalisation changes targets only when supported by reliable signal.

### Candidate ranking behaves as scientifically specified.

### The engine appropriately abstains.

### Clinical evidence paths remain accurate.

Specific thresholds belong in locked validation protocols.

---

# 178. PROGRAMME SUCCESS METRICS — HUMAN FACTORS

Critical safety tasks should have:

# no unacceptable residual use-related risk.

The objective is not merely:

> users like the interface.

It is:

> intended clinicians can correctly understand and safely act on the information.

---

# 179. PROGRAMME SUCCESS METRICS — CLINICAL

The initial goal should be:

# demonstrate clinical decision utility

before:

# demonstrate outcome superiority.

Decision utility includes:

- more explicit evidence review;
- more reproducible target reasoning;
- better documentation;
- interpretable target changes;
- reduced unexplained clinician disagreement.

---

# 180. INDICATIVE PROGRAMME PHASES

The full programme can be understood as:

```text
PHASE 0
Controlled foundations

PHASE 1
Canonical engine + synthetic workflow

PHASE 2
Research product + real imaging

PHASE 3
Technical/scientific verification

PHASE 4
Retrospective validation

PHASE 5
Human-factors validation

PHASE 6
Silent prospective validation

PHASE 7
Clinician-assisted prospective validation

PHASE 8
Regulatory Clinical Release

PHASE 9
Post-market evidence generation
```

These phases may overlap where scientifically appropriate, but their gates must not be skipped.

---

# 181. CRITICAL PATH

The critical path is not the 3D viewer.

It is:

```text
Canonical Domain
        ↓
Target Engine
        ↓
Evidence Library
        ↓
Phenotype Snapshot
        ↓
Immutable workflow
        ↓
NeuroCompute
        ↓
Target Reliability
        ↓
Scientific verification
        ↓
Prospective validation
```

Everything else should be prioritised around this.

---

# 182. WHAT CAN RUN IN PARALLEL

Once the canonical domain is stable:

### Stream A — Web/backend

Supabase + Next.js.

### Stream B — Target Engine

Deterministic scientific logic.

### Stream C — NeuroCompute

MRI/connectomics.

### Stream D — Evidence Library

Scientific curation.

### Stream E — Clinical/Human Factors

Workflow design and clinician testing.

These streams integrate at defined milestones.

---

# 183. WHAT SHOULD NOT RUN INDEPENDENTLY

Do not let:

### Neuroimaging team

invent new TargetCandidate semantics.

### Frontend team

invent evidence categories.

### Database team

simplify away versioning.

### Evidence team

create new clinical TargetFamilies without algorithm impact review.

### Target Engine team

invent clinical phenotype concepts.

The canonical specifications remain the interface contracts.

---

# 184. MINIMUM TEAM FUNCTIONS

The programme needs expertise covering:

### Clinical TMS

### Functional neuroimaging/connectomics

### Scientific evidence/governance

### Backend/database/security

### Next.js/frontend

### Python neuroimaging engineering

### Human factors/UX

### Biostatistics

### Quality/regulatory

Some individuals may cover multiple functions early, but the functions themselves should not disappear.

---

# 185. CLINICAL ADVISORY PANEL

Before prospective validation, establish a small panel including:

- TMS psychiatrists;
- neuroimaging/connectomics specialist;
- independent scientific reviewer.

Purpose:

- review evidence tiers;
- review clinical workflows;
- assess Golden Cases;
- approve validation hypotheses.

---

# 186. STATISTICAL ANALYSIS ROLE

A biostatistician should become involved:

# before retrospective validation protocol is frozen,

not after results exist.

Responsibilities:

- endpoint definitions;
- sample-size reasoning;
- analysis plan;
- missing data;
- multiplicity;
- validation split;
- calibration.

---

# 187. REGULATORY ROLE

Engage regulatory expertise before:

- silent prospective study finalisation;
- intended-purpose language;
- classification assumptions;
- commercial deployment planning.

Do not wait until software is complete.

---

# 188. HUMAN FACTORS ROLE

Human-factors work should begin around:

# UX P1/P2,

not just before release.

Automation bias is a design problem, not a final testing problem.

---

# 189. CYBERSECURITY ROLE

Threat modelling should begin before real clinical data are introduced.

Security verification intensifies before M3.

---

# 190. DEFINITION OF MVP

Magniom MVP is **not**:

> a complete clinical product.

The first meaningful MVP is:

# Synthetic Clinical Reasoning MVP.

It contains:

- phenotype;
- Evidence Library;
- Target Engine;
- Target Slate;
- clinician decision;
- audit.

No MRI required.

This proves the conceptual system works.

---

# 191. DEFINITION OF RESEARCH MVP

Research MVP adds:

- real/de-identified MRI;
- connectome;
- target reliability;
- cortical visualisation.

It can answer:

> Can Magniom reproducibly calculate patient-specific target hypotheses?

Still no clinical use.

---

# 192. DEFINITION OF CLINICAL MVP

Clinical MVP requires:

- full Research MVP;
- validation;
- human factors;
- security;
- regulatory pathway;
- quality-system controls.

The difference between Research MVP and Clinical MVP is primarily:

# evidence,

not code quantity.

---

# 193. FIRST BUILD PRIORITY

The immediate implementation task should therefore be:

# Magniom Synthetic Vertical Slice.

Build one complete synthetic case from:

```text
new patient
↓
assessment
↓
phenotype approval
↓
synthetic connectome
↓
Evidence Library
↓
Target Engine
↓
Target Slate
↓
evidence review
↓
clinician override
↓
signed decision
↓
audit
```

Before building native MRI.

---

# 194. SYNTHETIC VERTICAL SLICE ACCEPTANCE

It is complete when:

### A clinician can formulate and approve a phenotype.

### The system generates deterministic candidates.

### Evidence paths are inspectable.

### A personalised candidate has a reliability profile.

### The evidence-only counterfactual is visible.

### Redundant targets are suppressed.

### The clinician can reject Primary 1.

### The clinician can select no target.

### The decision becomes immutable after signing.

### Every action is auditable.

That one workflow validates the architecture far more effectively than building disconnected infrastructure.

---

# 195. SECOND BUILD PRIORITY

After Synthetic Vertical Slice:

# Precomputed Connectome Import Mode.

Accept:

- T1;
- cortical surface;
- parcel data;
- FC metrics;
- externally computed target/reliability inputs.

This allows real imaging UX and engine validation before native NeuroCompute is complete.

---

# 196. THIRD BUILD PRIORITY

Then:

# Native NeuroCompute.

This deliberately delays the most technically complex subsystem until Magniom already knows exactly what scientific outputs it needs.

---

# 197. VALIDATION PRINCIPLE

Every development stage must make it possible to reject the next stage.

Examples:

### Synthetic stage can reveal ontology failure.

### Imaging stage can reveal unreliability.

### Retrospective stage can reveal lack of useful association.

### Human-factors stage can reveal unsafe automation bias.

### Silent prospective stage can reveal poor real-world feasibility.

### Clinical trial can reveal no outcome advantage.

This is scientific discipline.

---

# 198. FINAL PROMOTION MATRIX

| Requirement | Engineering Prototype | Research Mode | Silent Prospective | Clinical Mode |
|---|---:|---:|---:|---:|
| Synthetic Target Engine | ✓ | ✓ | ✓ | ✓ |
| Real MRI | — | ✓ | ✓ | ✓ |
| Target reliability | Synthetic | ✓ | ✓ | ✓ |
| Evidence governance | Draft | ✓ | ✓ | ✓ |
| Immutable audit | ✓ | ✓ | ✓ | ✓ |
| Clinician may see targets | Synthetic only | Research only | **No** | ✓ |
| Target may guide treatment | No | No | No | **Yes** |
| Formal verification | Partial | Increasing | Complete | Complete |
| Retrospective validation | — | Required | Complete | Complete |
| Silent prospective | — | — | ✓ | Complete |
| Human-factors validation | Formative | Formative | Near-final | Complete |
| Regulatory authorisation | — | Research governance | Trial governance | Required as applicable |
| QMS | Foundation | Active | Active | Production-ready |

---

# 199. CLINICAL MODE PROMOTION DECISION

The Clinical Release Board should answer five questions:

### 1. Does the software implement the specification correctly?

### 2. Are the neuroimaging measurements reproducible enough to support the intended claim?

### 3. Is there clinical evidence that the resulting Target Slate is useful for its intended purpose?

### 4. Can clinicians understand, challenge and safely override the system?

### 5. Is deployment legally, operationally and regulatorily appropriate?

If any answer is:

# no,

Magniom remains Research Mode.

---

# 200. FINAL ROADMAP PRINCIPLE

Magniom should not be developed toward:

> **“When can we turn on the Clinical button?”**

It should be developed toward:

> **“What evidence would justify allowing this particular software release, with this particular Target Engine, Evidence Library, MRI pipeline, interface and intended claim, to influence a specialist's treatment decision?”**

The answer must remain:

# version-specific,

# evidence-specific,

# indication-specific,

and:

# independently reviewable.

---

# 201. MAGNIOM IMPLEMENTATION MANIFESTO

# Build semantics before infrastructure.

# Build the Target Engine before the MRI machinery.

# Build synthetic Golden Cases before real patients.

# Treat the Evidence Library as code.

# Treat scientific configuration as a controlled release.

# Treat preprocessing changes as potential algorithm changes.

# Make target reliability a release gate.

# Make abstention a tested feature.

# Make security a database property, not a frontend promise.

# Make clinician disagreement possible.

# Test automation bias deliberately.

# Freeze algorithms before validation.

# Separate development data from validation data.

# Run silently before allowing clinical influence.

# Demonstrate decision utility before claiming outcome superiority.

# Never let retrospective association masquerade as prospective validation.

# Never let a successful software build masquerade as a validated medical device.

# Promote Research Mode to Clinical Mode only when engineering, science, human factors and regulatory governance independently justify it.

That is the **Magniom Implementation & Validation Roadmap v1.0**.