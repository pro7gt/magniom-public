# MAGNIOM

## Enterprise Verification, Testing & CI/CD Specification v2.0

**Document status:** Canonical enterprise verification, software-testing, scientific-regression and controlled-delivery specification
**Version:** 2.0
**Date:** 2 September 2026
**Supersedes:** v1 enterprise verification/testing/CI-CD architecture for new multi-indication development
**Applies to:** MAGNIOM platform, indication modules, scientific libraries, Target Engine, multimodal measurement services, database, web application, workers, deployment infrastructure and Clinical Release Packages
**Primary architectural change:** Single scientific regression pipeline → platform-wide CI/CD with independently verified and promotable `IndicationModuleRelease` configurations
**Clinical authority:** Specialist clinician
**Release authority:** Controlled engineering + scientific + clinical + quality governance
**Core rule:** **CI/CD may automate verification and deployment preparation. It SHALL NOT autonomously confer Clinical Mode authority.**

**Normative dependencies:**

* MAGNIOM System Requirements Specification v2.0
* MAGNIOM Implementation & Multi-Indication Validation Roadmap v2.0
* MAGNIOM Scientific Policy & Algorithm Configuration Specification v2.0
* MAGNIOM Target Engine & Ranking Algorithm Specification v2.0
* MAGNIOM Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0
* MAGNIOM Evidence Knowledge Graph & Therapeutic Circuit Library v2.0
* MAGNIOM Canonical Multi-Indication Data Specification v2.0
* MAGNIOM Supabase Database & Security Specification v1.0 pending v2 successor
* MAGNIOM Technical Architecture v1.0 pending v2 successor

The original architecture already established the essential CI sequence of linting, type checking, unit and domain tests, migration and RLS testing, integration testing, Target Engine Golden Cases, container provenance, dependency/security scanning, build, validation deployment, approval and production deployment.  v1 also required a Verification Build to freeze the Target Engine, Evidence Library, phenotype ontology, neuro pipeline, Scientific Policy and UX before formal verification. 

v2 makes that framework substantially stricter because MAGNIOM now contains scientific modules at different qualification levels.

---

# 1. PURPOSE

This specification defines how MAGNIOM shall prove continuously that:

### the software is correct;

### scientific behaviour is deterministic;

### indication boundaries remain intact;

### Research science cannot leak into Clinical operation;

### patient data remain isolated;

### multimodal measurements retain scientific provenance;

### scientific configuration cannot change silently;

### deployment artefacts are reproducible and signed;

### every Clinical release can be reconstructed exactly.

The system must answer after any proposed change:

> **What changed, which requirements are affected, which scientific modules are affected, which Golden Cases changed, which Target Slates changed, which validation evidence remains applicable, and is this exact release still permitted to enter the destination environment?**

---

# 2. GOVERNING PRINCIPLE

MAGNIOM SHALL distinguish:

```text
Code passed CI
        ≠
Scientific algorithm verified

Scientific algorithm verified
        ≠
Indication clinically validated

Indication clinically validated
        ≠
Release approved

Release approved
        ≠
Deployment successfully installed

Deployment installed
        ≠
Clinical authority verified at runtime
```

Every layer requires its own evidence.

---

# 3. CI/CD IS PART OF THE SAFETY ARCHITECTURE

For MAGNIOM, CI/CD is not merely developer convenience.

It is a control system preventing:

* incorrect code;
* incorrect scientific configuration;
* cross-indication leakage;
* Research/Clinical crossover;
* unreviewed evidence changes;
* unsafe database migrations;
* coordinate/laterality regression;
* supply-chain compromise;
* unsigned scientific releases;
* accidental clinical deployment of Research modules.

---

# 4. CENTRAL v2 RELEASE MODEL

MAGNIOM has four distinct release concepts.

```text
ApplicationRelease

ScientificRelease

IndicationModuleRelease

ClinicalReleasePackage
```

They SHALL NOT be collapsed into one version number.

---

# 5. `ApplicationRelease`

Contains software infrastructure such as:

```text
web
backend
database schema
workers
UI
infrastructure
```

Example:

```text
MAGNIOM App 2.4.3
```

---

# 6. `ScientificRelease`

Contains:

```text
ScientificPolicyRelease
EvidenceLibraryRelease
TargetEngineRelease
MeasurementProvider releases
Reliability methods
atlases
normative models
E-field resources
```

Example:

```text
MAGNIOM Science R2026.09.02
```

---

# 7. `IndicationModuleRelease`

Examples:

```text
MDD-2.0.0

OCD-1.0.0

PAIN-NP-1.0.0

STROKE-MOTOR-1.0.0

STROKE-APHASIA-1.0.0

TBI-COGNITION-0.3.0

TINNITUS-0.4.0
```

Each carries independent scientific maturity.

---

# 8. `ClinicalReleasePackage`

The actual Clinical authority unit is:

```text
ApplicationRelease
        ×
ScientificRelease
        ×
IndicationModuleRelease
        ×
validated deployment configuration
```

signed and approved through governance.

---

# 9. ONE BUILD MAY SUPPORT DIFFERENT MODULE STATES

Example:

```text
MAGNIOM App 2.4.3

MDD                  Clinical
Pain                 Validation
Stroke Motor         Validation
OCD                  Research
TBI                  Research
Tinnitus             Research
```

The CI/CD system SHALL preserve these distinctions.

---

# 10. CI/CD SHALL NOT SET CLINICAL AUTHORITY DIRECTLY

A deployment pipeline SHALL NOT execute:

```text
UPDATE indication_modules
SET clinical = true;
```

as the mechanism of product promotion.

Clinical authority must originate from an approved:

```text
ClinicalReleasePackage
```

with signed scientific configuration.

The original roadmap likewise stated that changing a mode flag is not Clinical Mode promotion and that Clinical activation requires a governed release package. 

---

# 11. REPOSITORY MODEL

Recommended v2 monorepo:

```text
magniom/
│
├── apps/
│   └── web/
│
├── packages/
│   ├── domain/
│   ├── schemas/
│   ├── scientific-policy/
│   ├── evidence/
│   ├── target-engine-core/
│   ├── target-engine-sdk/
│   ├── measurement-core/
│   ├── presentation/
│   ├── ui/
│   └── testkit/
│
├── indications/
│   ├── mdd/
│   ├── ocd/
│   ├── neuropathic-pain/
│   ├── stroke-motor/
│   ├── stroke-aphasia/
│   ├── tbi/
│   ├── ptsd/
│   └── tinnitus/
│
├── services/
│   ├── structural/
│   ├── lesion/
│   ├── rsfmri/
│   ├── taskfmri/
│   ├── diffusion/
│   ├── efield/
│   ├── workflow-worker/
│   └── report-worker/
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   ├── tests/
│   └── seed/
│
├── scientific-config/
│   ├── policy/
│   ├── compatibility/
│   ├── parameters/
│   └── manifests/
│
├── evidence/
│   ├── sources/
│   ├── findings/
│   ├── claims/
│   ├── syntheses/
│   ├── paths/
│   └── releases/
│
├── validation/
│   ├── golden/
│   ├── measurements/
│   ├── retrospective/
│   ├── prospective/
│   └── human-factors/
│
├── docs/
├── infra/
├── scripts/
└── .github/
    └── workflows/
```

The v1 roadmap already required a monorepo separating domain, scientific policy, evidence, Target Engine, services, Supabase, scientific configuration and validation assets. 

---

# 12. PROTECTED SCIENTIFIC PATHS

The following SHOULD be classified as:

# Scientific Controlled Paths

```text
scientific-config/**

evidence/releases/**

evidence/claims/**

evidence/paths/**

packages/scientific-policy/**

packages/target-engine-core/**

indications/**/generators/**

indications/**/ranking/**

indications/**/refinement/**

services/**/scientific-config/**

validation/golden/**
```

Changes receive stricter review than ordinary UI code.

---

# 13. CODE OWNERSHIP

Protected paths SHALL require appropriate CODEOWNERS or equivalent approval.

Suggested responsibilities:

```text
Target Engine science       Scientific + Engineering

Evidence paths              Scientific/Evidence governance

Indication plugin           Module clinical/scientific lead + Engineering

Database security           Backend/Security

Clinical UX                 Clinical/HF + Frontend

Scientific Policy           Scientific governance

Release manifests           Quality/Release authority
```

---

# 14. NO SINGLE-PERSON CLINICAL SCIENTIFIC RELEASE

One developer SHALL NOT be able to:

```text
edit scientific algorithm
+
approve review
+
merge
+
deploy
+
activate Clinical authority
```

without independent controls.

---

# 15. BRANCH MODEL

A simple protected-main workflow is preferred.

```text
feature/*
fix/*
science/*
validation/*
        ↓
pull request
        ↓
main
```

Release tags/branches are then generated from reviewed immutable commits.

Avoid long-lived divergence between scientific and production code.

---

# 16. VALIDATION BRANCHES

Formal studies SHOULD use immutable study tags or release branches such as:

```text
validation/mdd/2.0.0
validation/pain/1.0.0
validation/stroke-motor/1.0.0
```

No ordinary feature development is merged after study freeze.

---

# 17. ENVIRONMENTS

Minimum:

```text
local

development

preview

integration

validation

clinical-staging

production
```

---

# 18. DEVELOPMENT ENVIRONMENT

Permitted:

* synthetic data;
* test fixtures;
* experimental plugins;
* Research policies.

Prohibited:

* identifiable clinical production data.

The v1 roadmap explicitly prohibited real clinical data in ordinary developer or CI environments. 

---

# 19. PREVIEW ENVIRONMENTS

Preview deployments MAY be automatically created per PR.

They SHALL use:

* synthetic data;
* isolated database;
* no production credentials;
* no real PHI;
* no Clinical scientific authority.

---

# 20. INTEGRATION ENVIRONMENT

Used for:

* cross-service tests;
* queue tests;
* complete workflow;
* scientific artefact orchestration;
* migration tests;
* multi-module integration.

---

# 21. VALIDATION ENVIRONMENT

Validation SHALL be isolated from ordinary development.

Used for:

* frozen validation releases;
* de-identified approved datasets;
* retrospective validation;
* scientific reproducibility;
* human-factors studies where suitable.

The v1 roadmap explicitly required a distinct validation environment that daily development does not casually mutate. 

---

# 22. CLINICAL STAGING

Should reproduce production architecture sufficiently to verify:

* deployment;
* secrets;
* database migrations;
* scientific manifests;
* module permissions;
* monitoring;
* rollback.

Use synthetic or specifically governed validation data only.

---

# 23. PRODUCTION

Production deployment requires:

# an approved release object.

Not merely:

```text
main branch green.
```

---

# 24. CI PIPELINE CLASSES

MAGNIOM SHALL implement at least:

```text
PR Fast Pipeline

PR Scientific Pipeline

Merge Pipeline

Nightly Scientific Pipeline

Release Candidate Pipeline

Validation Freeze Pipeline

Clinical Release Pipeline

Post-Deployment Verification Pipeline
```

---

# 25. PR FAST PIPELINE

Runs on nearly every pull request.

Suggested stages:

```text
repository policy
lint
format check
typecheck
unit tests
schema tests
affected package tests
migration lint
secret scan
dependency scan
build
```

Goal:

# rapid developer feedback.

---

# 26. PR SCIENTIFIC PIPELINE

Triggered when controlled scientific paths change.

Adds:

```text
ScientificPolicy validation

Evidence graph validation

Target Engine invariants

affected indication Golden Cases

geometry tests

laterality tests

reliability tests

scientific snapshot comparison

Scientific Change Impact Report
```

---

# 27. MERGE PIPELINE

After merge to protected main:

```text
clean environment build

full unit suite

integration suite

database rebuild

migration tests

RLS tests

API tests

queue/storage tests

all critical Golden Cases

security scans

container builds

SBOM generation

provenance metadata

integration deployment

smoke tests
```

---

# 28. NIGHTLY SCIENTIFIC PIPELINE

Suitable for expensive workloads:

```text
all module Golden Cases

full measurement reference datasets

cross-container reproducibility

cross-hardware checks where configured

full E2E browser suite

accessibility suite

large database security suite

performance regression

scientific differential analysis
```

---

# 29. RELEASE CANDIDATE PIPELINE

Runs only against a candidate release commit/tag.

It SHALL:

* rebuild from clean source;
* verify all lockfiles;
* rebuild containers;
* verify hashes;
* run full platform verification;
* run included module suites;
* produce SBOMs;
* create release manifest;
* sign artefacts;
* deploy to validation/staging.

---

# 30. VALIDATION FREEZE PIPELINE

Creates an immutable:

```text
ValidationBuild
```

including exact:

```text
commit
application build
DB migrations
ScientificPolicy
EvidenceLibrary
TargetEngine
IndicationModuleRelease
plugin digest
measurement containers
atlases
normative models
parameters
```

No moving dependencies.

---

# 31. CLINICAL RELEASE PIPELINE

Clinical release requires:

```text
technical pipeline success
        +
approved verification evidence
        +
approved module validation status
        +
approved risk state
        +
approved ClinicalReleasePackage
```

Only then may a production deployment approval be issued.

---

# 32. POST-DEPLOYMENT VERIFICATION

After deployment verify:

```text
application version

database migration version

scientific release hash

Scientific Policy signature

module permissions

plugin digests

container versions

health endpoints

database connectivity

queue connectivity

storage access

audit operation

mode banner state
```

If mismatch exists:

# fail deployment.

---

# 33. TEST PYRAMID v2

MAGNIOM should not rely mainly on browser E2E.

Testing layers:

```text
Static Verification

Unit Tests

Property / Invariant Tests

Contract Tests

Integration Tests

Scientific Golden Tests

Measurement Validation Tests

Security Tests

Workflow E2E

Human Factors

Clinical Validation
```

---

# 34. STATIC VERIFICATION

At minimum:

```text
TypeScript strict type checking

Python static checks

schema generation/validation

linting

dependency graph validation

unused scientific configuration detection

forbidden-import checks
```

---

# 35. FORBIDDEN IMPORT BOUNDARIES

Examples:

```text
target-engine-core
SHALL NOT import
Supabase client
```

```text
scientific-policy
SHALL NOT depend on UI package
```

```text
indication generator
SHALL NOT perform network access
```

```text
measurement pipeline
SHALL NOT import clinician-decision logic
```

---

# 36. UNIT TESTS

Required for deterministic scientific primitives such as:

* coordinate conversion;
* geometry distance;
* ROI overlap;
* laterality functions;
* normalisation;
* ranking functions;
* eligibility gates;
* reliability metric calculations;
* redundancy;
* EvidencePath matching;
* manifest hashing.

---

# 37. NUMERICAL BOUNDARY TESTING

All scientific thresholds require:

```text
threshold - ε
threshold
threshold + ε
```

Also test:

```text
NaN
Infinity
-Infinity
null
undefined
0
negative values
extreme values
exact ties
```

The v1 programme already required explicit scientific numeric-edge testing and safe handling of invalid numbers. 

---

# 38. PROPERTY TESTS

Scientific invariants SHOULD be tested beyond examples.

Examples:

```text
Adding a Research EvidencePath
must not alter Clinical results.

Permuting candidate input order
must not alter final Slate.

Adding irrelevant metadata
must not alter scientific output.

Removing optional non-consumed measurement
must not alter output.

Duplicate queue delivery
must not duplicate final Target Slate.
```

---

# 39. METAMORPHIC TESTS

MAGNIOM SHOULD use metamorphic scientific tests where no single exact output is sufficient.

Examples:

### Lower reliability

Should never increase permission of a refinement.

### Remove Clinical EvidencePath

Should never create more Clinical candidates.

### Mark module Research-only

Should never preserve Clinical Slate generation.

### Introduce device incompatibility

Should never improve candidate eligibility.

---

# 40. DOMAIN CONTRACT TESTS

Canonical schemas SHALL be tested for:

```text
valid objects

missing required fields

unknown enum values

version mismatch

invalid UUID relationships

wrong TargetGeometry subtype

cross-case references

cross-module references
```

---

# 41. API CONTRACT TESTS

Every clinical command tests:

* correct request;
* malformed request;
* unauthenticated;
* unauthorised role;
* wrong organisation;
* wrong Case;
* stale version;
* invalid state;
* idempotent replay;
* transaction rollback.

---

# 42. DATABASE MIGRATION TESTS

Every migration SHALL pass:

```text
empty database rebuild

forward migration from supported baseline

migration idempotency where relevant

constraint verification

function verification

RLS verification

rollback/recovery procedure validation
```

The original roadmap already required every migration to pass clean rebuild, forward migration, database, RLS and domain integrity tests. 

---

# 43. NO MANUAL PRODUCTION SCHEMA EDITING

Production schema modification outside controlled migrations is prohibited except under a documented emergency procedure.

Emergency changes must later be:

* codified;
* reviewed;
* tested;
* reconciled.

---

# 44. STRUCTURAL DATA-INTEGRITY TESTS

Test:

```text
organisation consistency

Case ownership

CaseIndication ownership

MeasurementBundle ownership

ReliabilityBundle relationship

TargetCandidate → CaseIndication relationship

TargetSlate → Case relationship

ClinicianDecision → TargetSlate relationship
```

---

# 45. RLS SECURITY SUITE

At minimum:

```text
Organisation A cannot read Organisation B case

Organisation A cannot write Organisation B case

Researcher cannot access unauthorised identifying data

inactive user denied

browser cannot insert TargetCandidate directly

browser cannot mutate signed decision

worker cannot read unrelated case

organisation administrator cannot bypass Clinical role
```

---

# 46. ADVERSARIAL TENANCY TESTING

Actively attempt client-controlled spoofing:

```text
organisation_id = other_org

case_id = other_org_case

user_id = another_user
```

Backend/database SHALL derive authority independently.

v1 explicitly required adversarial organisation-ID tampering tests. 

---

# 47. QUEUE TESTS

Simulate:

```text
worker crash

duplicate delivery

retry

out-of-order delivery

expired job

stale scientific version

terminal failure

poison message

concurrent processing
```

Expected:

# no scientific-output duplication or corruption.

---

# 48. STORAGE TESTS

Test:

* wrong organisation path;
* wrong Case path;
* forged artefact identifier;
* hash mismatch;
* expired signed URL;
* storage policy violation;
* unauthorised download;
* accidental signed-URL logging.

---

# 49. SCIENTIFIC MANIFEST TESTS

Every scientific run SHALL verify:

```text
expected policy hash

expected EvidenceLibrary hash

expected module release

expected TargetEngine release

expected plugin digest

expected MeasurementProvider versions

expected atlas/normative resources
```

---

# 50. TARGET ENGINE CORE TEST SUITE

Required categories:

```text
input integrity

mode gate

module gate

EvidencePath gate

clinical-context gate

measurement capability

reliability

anatomy/lesion

geometry/device

treatment context

candidate comparison

refinement

redundancy

Slate assembly

abstention

explanation provenance
```

---

# 51. DETERMINISM TEST

Canonical assertion:

```text
same canonical input
+
same exact scientific configuration
=
same scientific output
```

including:

```text
candidate generation
candidate geometry
eligibility
suppression
rank/order
refinement
abstention
explanation facts
```

v1 already required scientific snapshot testing of the complete Target Slate rather than checking only that an API returned successfully. 

---

# 52. GOLDEN CASE HASH

Every controlled Golden Case SHOULD contain:

```text
input_manifest_sha256

expected_scientific_result_sha256
```

A changed expected hash requires a:

# Scientific Golden Case Impact Report.

---

# 53. GOLDEN HASH IS NOT BLINDLY AUTHORITATIVE

A hash change is:

# a signal requiring explanation.

It does not mean the new algorithm is automatically wrong.

The release must state:

* what changed;
* why;
* which requirement changed;
* validation impact.

---

# 54. CORE SAFETY INVARIANTS

These should pass for every build:

```text
Research path cannot create Clinical candidate.

Research module cannot generate Clinical Slate.

Cross-indication EvidencePath is rejected.

Wrong Case measurement is rejected.

Failed required reliability cannot improve ranking.

Invalid laterality blocks dependent target.

No forced five-candidate Slate.

Candidate suppression remains reconstructable.

Same input always produces same output.
```

---

# 55. MDD CI SUITE

At minimum:

```text
MDD-GC-01  evidence baseline

MDD-GC-02  reliable FC refinement

MDD-GC-03  unreliable FC

MDD-GC-04  non-material refinement

MDD-GC-05  large target displacement

MDD-GC-06  one meaningful candidate

MDD-GC-07  Research anomaly

MDD-GC-08  Evidence Library version change
```

---

# 56. OCD CI SUITE

```text
OCD-GC-01  field geometry preserved

OCD-GC-02  incompatible coil blocked

OCD-GC-03  pre-SMA alternative

OCD-GC-04  field-to-point coercion rejected

OCD-GC-05  treatment-context mismatch

OCD-GC-06  Research candidate blocked clinically

OCD-GC-07  conflicting evidence visible
```

---

# 57. PAIN CI SUITE

```text
PAI-GC-01  right hand pain → correct hemisphere

PAI-GC-02  left lower-limb somatotopy

PAI-GC-03  qualified motor-map refinement

PAI-GC-04  unreliable motor map

PAI-GC-05  bilateral ambiguity

PAI-GC-06  wrong muscle/body-region

PAI-GC-07  no forced alternate target
```

---

# 58. STROKE MOTOR CI SUITE

```text
STRM-GC-01  stage-compatible EvidencePath

STRM-GC-02  disease-stage mismatch

STRM-GC-03  destroyed target cortex

STRM-GC-04  lesion laterality conflict

STRM-GC-05  qualified motor mapping

STRM-GC-06  unreliable motor mapping

STRM-GC-07  MEP does not autonomously choose strategy

STRM-GC-08  Research compensatory target blocked clinically
```

---

# 59. STROKE APHASIA CI SUITE

```text
STRA-GC-01  chronic non-fluent path

STRA-GC-02  fluent mismatch

STRA-GC-03  stage mismatch

STRA-GC-04  SLT context present

STRA-GC-05  SLT context absent

STRA-GC-06  task-fMRI success

STRA-GC-07  failed task does not mean absent function

STRA-GC-08  Research language target blocked clinically
```

---

# 60. TBI CI SUITE

```text
TBI-GC-01  evidence signal without target specificity → abstain

TBI-GC-02  explicit Research target

TBI-GC-03  MDD EvidencePath inheritance rejected

TBI-GC-04  skull defect context

TBI-GC-05  cranioplasty context

TBI-GC-06  invalid registration

TBI-GC-07  multimodal fusion prohibited

TBI-GC-08  Clinical request denied for Research module
```

---

# 61. PTSD CI SUITE

```text
PTSD-GC-01  target-family distinction

PTSD-GC-02  combat applicability limitation

PTSD-GC-03  MDD evidence inheritance rejected

PTSD-GC-04  Research connectome refinement

PTSD-GC-05  conflicting evidence visible
```

---

# 62. TINNITUS CI SUITE

```text
TIN-GC-01  audiology valid

TIN-GC-02  tinnitus laterality

TIN-GC-03  pitch does not generate target

TIN-GC-04  hearing loss does not generate target

TIN-GC-05  imaging abnormality does not confer authority

TIN-GC-06  negative evidence visible

TIN-GC-07  Research candidate

TIN-GC-08  Clinical request rejected
```

---

# 63. INDICATION MODULE MATRIX TEST

Every build SHOULD generate a machine-readable matrix:

| Module       | Plugin found | Policy binding | Evidence paths | Golden suite | Permitted mode      |
| ------------ | -----------: | -------------: | -------------: | -----------: | ------------------- |
| MDD          |            ✓ |              ✓ |              ✓ |            ✓ | Clinical/Research   |
| Pain         |            ✓ |              ✓ |              ✓ |            ✓ | Validation/Research |
| Stroke Motor |            ✓ |              ✓ |              ✓ |            ✓ | Validation/Research |
| Tinnitus     |            ✓ |              ✓ |              ✓ |            ✓ | Research            |

Mismatch blocks relevant release.

---

# 64. RESEARCH / CLINICAL ISOLATION TESTS

Attempt all combinations:

```text
Research module + Clinical mode

Research EvidencePath + Clinical module

Research measurement + Clinical ranking

Research generator + Clinical policy

Research normative model + Clinical configuration

Research fusion model + Clinical module
```

Expected:

# denial.

---

# 65. WRONG-MODULE TESTING

Examples:

```text
MDD case + Stroke plugin

Pain case + MDD EvidencePath

TBI case + MDD generator

OCD case + generic point geometry

Stroke case + Pain somatotopy
```

Every combination SHALL fail deterministically.

---

# 66. MEASUREMENT PROVIDER TESTING

Each provider must test:

```text
input validation

source integrity

processing success

processing failure

QC

reliability

capability qualification

version manifest

case identity

mode
```

---

# 67. STRUCTURAL MRI TESTS

Include:

* correct orientation;
* segmentation;
* surface generation;
* coordinate transforms;
* structural failure;
* abnormal anatomy;
* laterality.

---

# 68. LESION-MAPPING TESTS

Include:

```text
known lesion mask

boundary variation

registration sensitivity

wrong laterality

target overlap

target destroyed

manual/automatic disagreement

multi-lesion case
```

---

# 69. rs-fMRI TESTS

Retain v1 scientific validation concepts:

```text
low motion

moderate motion

motion failure

split-half stability

cross-run stability

pipeline sensitivity

dropout

scanner variation

repeat session
```

The original validation library explicitly called for low-motion, motion-failure, pipeline-sensitivity, scanner and repeat-session cases. 

---

# 70. TASK-fMRI TESTS

Test:

```text
valid task performance

poor task performance

no response data

motion failure

activation threshold sensitivity

laterality stability

failed registration
```

A failed task SHALL never produce an “absent cortex” interpretation.

---

# 71. DWI TESTS

Test:

```text
distortion correction

eddy/motion correction

known tract reconstruction

parameter sensitivity

lesion overlap

tractography instability

registration failure
```

Never compare streamline counts as if direct biological ground truth.

---

# 72. MOTOR MAPPING TESTS

Test:

```text
stable hotspot

unstable hotspot

wrong muscle

wrong side

duplicate stimulation points

orientation variation

missing responses

invalid trials

coordinate transform
```

---

# 73. MEP TESTS

Test:

```text
valid response

absent response

artefact

high variability

background EMG contamination

resting/active state mismatch

threshold reproducibility
```

---

# 74. AUDIOLOGY TESTS

Test:

```text
left/right audiogram

missing frequencies

calibration metadata

tinnitus laterality

pitch-match variability

speech audiometry import

malformed source record
```

---

# 75. CROSS-MODAL TRANSFORM TESTS

Critical paths include:

```text
DWI → T1

BOLD → T1

task fMRI → T1

lesion → T1/surface

motor navigation → T1

T1 → neuronavigation
```

---

# 76. LATERALITY TESTING IS RELEASE-BLOCKING

Dedicated test datasets SHALL contain deliberate left/right traps.

Test:

```text
RAS/LPS

DICOM orientation

surface hemispheres

lesion side

affected limb

pain laterality

tinnitus laterality

navigation export
```

Any unexplained laterality failure:

# Critical defect.

---

# 77. COORDINATE ROUND-TRIP

For point/spatial outputs:

```text
MAGNIOM
→ export
→ neuronavigation/import format
→ reimport
```

must remain within validated tolerance and preserve laterality.

---

# 78. TARGET GEOMETRY TESTING

Separate fixtures for:

```text
PointTargetGeometry

SurfaceROITargetGeometry

VolumetricROITargetGeometry

SomatotopicTargetGeometry

CoilFieldTargetGeometry

NetworkTargetGeometry
```

No automatic lossy conversion.

---

# 79. GEOMETRY SERIALISATION TEST

Round trip:

```text
canonical object
→ JSON
→ database
→ API
→ frontend
→ export
```

must preserve target semantics.

---

# 80. EVIDENCE GRAPH TESTS

Every Evidence Library release SHALL validate:

```text
orphan SourceFinding

claim without sources

unresolved broken references

missing population

missing indication

missing objective

missing TargetFamily

missing treatment context where required

missing conflict relationships

Research path labelled Clinical

unassigned classification used clinically

invalid EvidencePath
```

v1 already required automated evidence-graph checks for orphan claims, missing sources/populations/conflicts, Research leakage and resource-hash problems. 

---

# 81. EVIDENCE CHANGE DIFFERENTIAL

For every Evidence Library candidate release generate:

```text
added Sources

removed Sources

new Findings

new Claims

modified Claims

new Conflicts

resolved Conflicts

changed classifications

changed EvidencePaths

changed module permissions
```

---

# 82. SCIENTIFIC POLICY TESTS

Validate:

```text
schema

parameter completeness

bounds

module binding

EvidencePath permission

generator permission

geometry permission

measurement permission

reliability method

ranking profile

fallback

abstention

compatibility tuple

signature/hash
```

---

# 83. SCIENTIFIC POLICY NEGATIVE TESTS

At minimum reject:

```text
missing module

wrong module version

unknown generator

out-of-bound parameter

wrong target geometry

Research measurement in Clinical tuple

incompatible normative model

incompatible E-field engine

incompatible device

missing signature
```

---

# 84. SCIENTIFIC CONFIGURATION SNAPSHOT

Each integration run SHOULD emit a canonical sorted configuration manifest.

Tests compare:

```text
expected manifest
vs
actual manifest.
```

---

# 85. DATABASE SCIENCE / SCHEMA SEPARATION

CI SHALL recognise that:

```text
database migration
```

and:

```text
scientific release
```

are separate change streams.

The v1 technical architecture explicitly required separate scientific and database versioning. 

---

# 86. WEB COMPONENT TESTS

Safety-relevant components include:

* mode banner;
* module indicator;
* case header;
* phenotype approval;
* reliability panel;
* Evidence Drawer;
* Target Slate;
* candidate comparison;
* decision sign-off.

---

# 87. E2E CLINICAL WORKFLOW

Critical browser E2E:

```text
login

open Case

review CaseIndication

approve phenotype/objective

review measurements

review Target Slate

open Evidence Drawer

inspect reliability

reject Primary 1

select alternate

choose no target

detect stale Slate

sign decision
```

This continues the v1 E2E requirement. 

---

# 88. MULTI-INDICATION E2E

Additional cases:

```text
switch MDD Case → Pain Case

open Research Tinnitus Case

open Clinical MDD Case

attempt Clinical sign-off in Research Tinnitus

open Stroke case with failed lesion mapping

open OCD field target
```

The app shell must update mode/module context correctly.

---

# 89. AUTOMATION-BIAS UI TEST

Construct a case where:

```text
Primary 1
```

is deliberately inappropriate given visible clinical context.

Test that:

* no candidate is preselected;
* clinician can reject it;
* decision workflow does not steer automatically toward acceptance.

---

# 90. VISUAL REGRESSION

Safety-critical screenshots include:

```text
Research banner

Clinical mode indicator

stale Slate warning

low reliability

failed measurement

field-target presentation

lesion warning

negative evidence

no-target decision

signed decision
```

---

# 91. ACCESSIBILITY

Automated:

* semantics;
* focus;
* labels;
* contrast;
* keyboard.

Manual:

* keyboard-only target review;
* screen reader;
* no-colour comprehension;
* 3D viewer textual equivalent;
* decision signing.

Target:

# WCAG 2.2 AA

unless a controlled accessibility requirement supersedes it.

The v1 programme already targeted WCAG 2.2 AA and required manual as well as automated accessibility testing. 

---

# 92. PERFORMANCE TESTING

Performance shall be tested separately from scientific correctness.

Track:

```text
web latency

database latency

Target Engine runtime

queue latency

measurement processing duration

artifact loading

3D viewer responsiveness
```

Performance degradation SHALL NOT justify bypassing scientific gates.

---

# 93. LOAD TESTING

Enterprise load scenarios should include:

```text
multiple clinics

concurrent Case review

concurrent MRI uploads

multiple NeuroCompute jobs

queue backlog

large Evidence Library queries

simultaneous Target Slate review
```

---

# 94. SCIENTIFIC LOAD CONSISTENCY

Under concurrency:

```text
candidate result
```

must remain identical.

Load must not cause:

* missing generator output;
* altered ranking;
* partial Slate;
* wrong Case result.

---

# 95. RESILIENCE TESTING

Inject:

```text
database transient failure

storage timeout

queue worker termination

GPU worker crash

container failure

network partition

duplicate message

stale retry
```

Scientific output must be:

* valid and complete;
* or failed/abstained;

never partially authoritative.

---

# 96. CHAOS TESTING BOUNDARY

Chaos testing SHOULD occur in controlled non-production environments.

Production fault injection involving live clinical workflows requires separate governance.

---

# 97. BACKUP VERIFICATION

CI/CD or scheduled verification SHALL test:

```text
database backup

object storage recovery

scientific manifests

audit records

signed decisions
```

Backup success logs alone are insufficient.

Perform actual restore tests.

---

# 98. RESTORE SCIENTIFIC INTEGRITY

After restore:

* Target Slate hashes;
* decision signatures;
* Evidence Library hashes;
* policy hashes

must remain valid.

---

# 99. SECURITY SCANNING

Pipeline SHOULD include:

```text
secret scanning

dependency vulnerability scanning

SAST

container scanning

IaC scanning

licence policy scanning

malicious-package checks where available
```

---

# 100. DYNAMIC SECURITY TESTING

Before major Clinical releases:

* authenticated DAST;
* API security testing;
* privilege-escalation testing;
* tenancy isolation;
* storage access;
* session/auth controls.

---

# 101. PENETRATION TESTING

Independent penetration testing SHOULD occur:

* before first production Clinical release;
* after major security architecture change;
* periodically according to risk.

CI does not replace expert penetration testing.

---

# 102. SOFTWARE SUPPLY CHAIN

Every distributable artefact SHALL be traceable to:

```text
source commit

build workflow

dependencies

container base image

compiler/runtime versions

build timestamp

SBOM
```

---

# 103. SBOM

Generate an SBOM for:

* web/backend;
* worker containers;
* scientific containers;
* E-field container;
* database extension dependencies where feasible.

v1 already required SBOM generation as part of security hardening and container release manifests.  

---

# 104. BUILD PROVENANCE

Clinical release artefacts SHOULD include signed build provenance sufficient to establish:

```text
what source produced this binary/container?
```

---

# 105. IMMUTABLE CONTAINER REFERENCES

Clinical environments SHALL reference:

```text
image@sha256:<digest>
```

or equivalent immutable identifier.

Never scientific runtime:

```text
image:latest
```

---

# 106. BASE-IMAGE UPDATES

Even a security-driven base-image upgrade may affect scientific numerical behaviour.

Scientific containers therefore require:

* security comparison;
* reproducibility comparison;
* target impact analysis.

---

# 107. SCIENTIFIC REPRODUCIBILITY

For identical:

```text
input
container
configuration
resource versions
```

scientifically equivalent output is required.

Byte-identical output is preferred where practical but not universally assumed for every third-party numerical pipeline.

The v1 programme already required explicit tolerances where external numerical dependencies prevent byte-identical reproducibility. 

---

# 108. CROSS-HARDWARE VERIFICATION

For supported compute platforms compare:

```text
derived matrices

target geometry

candidate identity

rank

reliability

abstention
```

If hardware causes clinically material difference:

# hardware becomes part of the validated scientific compatibility tuple.

---

# 109. GPU / CPU DIFFERENTIAL

Scientific pipeline tests SHOULD detect unacceptable differences caused by:

* CPU architecture;
* GPU;
* CUDA/runtime;
* BLAS;
* floating-point implementation.

---

# 110. TOLERANCE POLICY

Numerical tolerance SHALL be:

* explicit;
* scientific-feature-specific;
* versioned;
* justified.

Never:

```text
approximately equal enough
```

without definition.

---

# 111. DEPENDENCY UPDATE BOT POLICY

Automated dependency PRs are permitted.

They SHALL NOT automatically merge into Clinical scientific code merely because:

```text
unit tests passed.
```

Affected scientific packages require impact classification.

---

# 112. SCIENTIFIC CHANGE CLASSIFIER

CI SHOULD automatically detect changes touching:

```text
Evidence Library

Scientific Policy

Target Engine

indication plugin

candidate generator

measurement pipeline

reliability

atlas

normative model

E-field
```

and escalate the pipeline.

---

# 113. CHANGE IMPACT LEVELS

Recommended:

```text
C0  no scientific impact expected

C1  scientific implementation, intended same output

C2  potential numerical/scientific output change

C3  intended target/ranking behaviour change

C4  intended-use / indication / Clinical authority change
```

---

# 114. C0

Examples:

* documentation;
* non-critical CSS;
* internal refactor proven output-equivalent.

Normal CI.

---

# 115. C1

Requires:

* scientific snapshots;
* full affected Golden Suite;
* output equivalence report.

---

# 116. C2

Requires:

* scientific differential report;
* all affected module suites;
* measurement regression;
* validation impact assessment.

---

# 117. C3

Requires:

* new scientific release;
* formal review;
* retrospective validation impact;
* likely new Scientific Policy/algorithm version.

---

# 118. C4

Requires:

# formal design and clinical governance.

CI can prepare evidence but cannot approve the change.

---

# 119. SCIENTIFIC DIFFERENTIAL REPORT

Every C1+ change SHOULD report:

```text
modules affected

cases tested

candidate counts changed

eligibility changed

Primary ordering changed

candidate geometry changed

suppression changed

refinement changed

abstention changed

explanation facts changed

measurement qualification changed
```

---

# 120. SPATIAL DIFFERENTIAL

Where targets are spatial:

```text
point displacement

surface geodesic displacement

ROI overlap

field overlap

somatotopic category change
```

depending on geometry type.

---

# 121. CLINICAL SIGNIFICANCE OF DIFF

CI SHALL NOT automatically infer:

```text
2 mm = safe
```

or:

```text
10 mm = unsafe.
```

Interpretation depends on validated module policy.

---

# 122. RELEASE DEFECT CLASSIFICATION

## Critical

Potential:

* wrong patient;
* wrong indication;
* wrong target;
* wrong hemisphere;
* Research leakage;
* clinical-signature corruption;
* cross-tenant disclosure.

Release blocked.

## Major

Potential materially misleading clinical/scientific behaviour.

Release normally blocked.

## Minor

No expected clinically material impact.

May be accepted through documented governance.

This is the same core defect philosophy established in the v1 roadmap. 

---

# 123. FLAKY TEST POLICY

Safety-critical tests SHALL NOT be routinely retried until they happen to pass.

A flaky Critical test is itself a release defect.

---

# 124. QUARANTINING TESTS

A test may be quarantined only if:

* rationale recorded;
* requirement impact assessed;
* risk evaluated;
* owner assigned;
* expiry/review date established.

Critical coverage cannot disappear silently.

---

# 125. TEST COVERAGE

Code coverage percentages SHALL NOT serve as the primary enterprise release metric.

More important:

```text
100% applicable Critical requirements
have verified test evidence.
```

Coverage may still identify untested implementation areas.

---

# 126. REQUIREMENTS TRACEABILITY AUTOMATION

CI SHOULD generate:

```text
SRS requirement
↓
test IDs
↓
latest result
↓
implementation references
↓
risk-control references
```

for each release.

---

# 127. TRACEABILITY FAILURE

A Clinical release SHALL fail if an applicable Critical requirement has:

```text
no verification evidence.
```

---

# 128. TEST ID CONVENTION

Suggested:

```text
UT-TGT-0042

IT-SEC-0113

GC-MDD-0007

GC-STRM-0004

SV-OCD-0021

E2E-CLI-0017

HF-TIN-0003
```

---

# 129. TEST RESULT IMMUTABILITY

Formal release verification results SHOULD be stored as immutable signed artefacts.

Do not rely solely on transient CI console history.

---

# 130. RELEASE EVIDENCE BUNDLE

Every candidate release SHOULD produce:

```text
verification-summary.json

requirements-traceability.csv

golden-case-report.json

scientific-diff-report.json

security-report.json

SBOM

container-provenance.json

migration-report.json

accessibility-report.json

release-manifest.json
```

plus human-readable summaries.

---

# 131. RELEASE MANIFEST v2

```ts
interface MagniomReleaseManifestV2 {
  release_id: string;

  application_release: string;
  source_commit: string;

  database_migration_version: string;

  scientific_policy_release_id: UUID;
  evidence_library_release_id: UUID;
  target_engine_release_id: UUID;

  indication_modules: {
    indication_module_release_id: UUID;
    qualification_level: string;
    permitted_modes: string[];
    plugin_digest: SHA256;
  }[];

  measurement_providers: ComponentReleaseRef[];

  reliability_methods: ComponentReleaseRef[];

  normative_models: ComponentReleaseRef[];

  atlas_releases: ComponentReleaseRef[];

  efield_releases: ComponentReleaseRef[];

  sbom_digests: SHA256[];

  test_evidence_digest: SHA256;

  manifest_sha256: SHA256;

  signatures: ReleaseSignature[];
}
```

---

# 132. CLINICAL MODULE MATRIX IN MANIFEST

Example:

```text
MDD-2.0.0
Q8
Clinical + Research

PAIN-NP-1.0.0
Q5
Research / Validation

STROKE-MOTOR-1.0.0
Q4
Research / Validation

TINNITUS-0.4.0
Q2
Research only
```

---

# 133. RELEASE SIGNATURES

Recommended Clinical release approvals:

```text
Engineering

Scientific

Indication-specific Clinical

Quality/Regulatory
```

Different signers may approve different aspects.

---

# 134. ARTIFACT SIGNING

Production binaries, containers and scientific manifests SHOULD be cryptographically signed or otherwise integrity-attested.

Deployment verifies signatures.

---

# 135. SEPARATION OF BUILD AND DEPLOY

Prefer:

```text
build once
        ↓
verify artefact
        ↓
promote same artefact
```

Do not rebuild separately for validation and production if avoidable.

---

# 136. ENVIRONMENT PROMOTION

Preferred:

```text
development
    ↓
integration
    ↓
validation
    ↓
clinical staging
    ↓
production
```

The same immutable release artefact should move forward.

---

# 137. NO `MAIN → PROD` DIRECT DEPLOYMENT

Protected production should not be deployed automatically from every `main` merge.

Production requires controlled release promotion.

---

# 138. DEPLOYMENT APPROVALS

Human approval is required for:

* Clinical scientific release;
* production migration with material risk;
* module Clinical activation.

Routine low-risk non-scientific releases may use risk-based automation once governance permits.

---

# 139. DATABASE DEPLOYMENT

Before production migration:

```text
backup verified

migration rehearsed

locks/impact analysed

RLS verified

rollback/recovery plan available
```

---

# 140. SCIENTIFIC CONFIGURATION DEPLOYMENT

Scientific artefacts SHALL be deployed separately but atomically from the perspective of clinical compatibility.

Do not expose:

```text
new Target Engine
+
old Scientific Policy
```

if the tuple is not approved.

---

# 141. ATOMIC SCIENTIFIC ACTIVATION

Activation transaction should ensure:

```text
policy
module
evidence
engine
plugin
measurement compatibility
```

become active as one coherent approved configuration.

---

# 142. PARTIAL DEPLOYMENT FAILURE

If one scientific component fails deployment:

# the new scientific configuration SHALL NOT activate.

Previous known-good Clinical configuration remains active where safe.

---

# 143. BLUE/GREEN OR EQUIVALENT

Production MAY use:

* blue/green;
* staged rollout;
* canary;

provided patient scientific consistency is preserved.

---

# 144. CLINICAL CANARY CAUTION

A/B testing scientific target algorithms on clinical patients without appropriate study governance is prohibited.

Infrastructure canary deployment is not equivalent to scientific experimentation.

---

# 145. RUNTIME RELEASE VERIFICATION

On service startup and periodically:

verify:

```text
release manifest

Scientific Policy signature

module state

plugin digest

container/resource hashes
```

Clinical functionality SHALL fail closed on critical mismatch.

---

# 146. HEALTH CHECKS

Distinguish:

```text
service healthy
```

from:

```text
clinical scientific configuration valid.
```

Provide separate readiness signals.

---

# 147. EXAMPLE

```text
/web/health
healthy

/science/readiness
invalid ScientificPolicy signature
```

Result:

web may remain available,

but Clinical target generation is disabled.

---

# 148. POST-DEPLOY SCIENTIFIC SMOKE TESTS

Run synthetic canonical cases against production scientific services.

Never require real patient data for deployment validation.

---

# 149. MODULE-SPECIFIC PRODUCTION SMOKE TEST

For every Clinical-enabled module:

* resolve module;
* resolve policy;
* run one synthetic Golden Case;
* verify expected hash;
* verify Clinical/Research permission.

---

# 150. OBSERVABILITY

Operational metrics:

```text
request failures

database errors

queue depth

worker failures

processing duration

storage failures
```

Scientific operational metrics:

```text
QC failure

reliability qualification

fallback

abstention

candidate distributions

module usage

clinician override
```

The v1 architecture already distinguished scientific operational metrics from clinical evidence and warned against treating them as outcome evidence automatically. 

---

# 151. SCIENTIFIC DRIFT MONITORING

Monitor for unexpected changes in:

```text
candidate-family distribution

abstention

refinement adoption

measurement reliability

target displacement

module failure
```

Drift is:

# an investigation signal,

not automatically an adaptive-learning trigger.

---

# 152. NO ONLINE RETUNING

Monitoring SHALL NOT automatically alter:

* weights;
* thresholds;
* evidence permissions;
* candidate generators.

Any change follows controlled science release workflow.

---

# 153. ALERTS

Critical alerts should include:

```text
Scientific Policy integrity failure

plugin digest mismatch

cross-org access anomaly

wrong-case artefact reference

repeated laterality validation failure

Research/Clinical boundary failure

signed decision integrity failure

backup restore failure

Clinical module compatibility failure
```

---

# 154. CORRELATION IDS

Every scientific workflow should preserve:

```text
request_id

case_id

job_id

processing_run_id

target_generation_run_id

target_slate_id
```

without unnecessary patient identifiers in logs.

v1 likewise recommended pseudonymous correlation identifiers rather than clinical identifiers in compute logs. 

---

# 155. LOGGING PROHIBITIONS

Do not log casually:

```text
patient name

DOB

full clinical notes

access tokens

service keys

signed storage URLs

raw sensitive imaging metadata beyond need
```

---

# 156. SECRET MANAGEMENT

Separate credentials for:

```text
browser

backend

database privileged functions

compute workers

evidence pipeline

CI build

deployment
```

No shared global service credential.

---

# 157. CI SECRET ACCESS

PR code from untrusted contexts SHALL NOT have access to production secrets.

Clinical signing keys SHALL never be exposed to ordinary PR workflows.

---

# 158. RELEASE SIGNING KEY CONTROL

Release signing should occur in a:

# protected release job

after required approvals.

---

# 159. INFRASTRUCTURE AS CODE

Infrastructure changes should use version-controlled IaC where feasible.

Test:

* configuration;
* policy;
* network exposure;
* secrets references;
* storage access;
* deployment configuration.

---

# 160. CONFIGURATION DRIFT

Production infrastructure SHOULD be checked for drift from approved IaC.

Unapproved drift triggers investigation.

---

# 161. CLINICAL ENVIRONMENT CONFIGURATION

The release manifest SHOULD record relevant:

```text
region

database version

runtime

worker hardware class

scientific container digests

GPU/runtime where applicable
```

if they can affect validated behaviour.

---

# 162. PERFORMANCE SLOs

Operational service-level objectives SHOULD be defined separately for:

* web;
* database;
* workflow jobs;
* scientific processing.

This specification deliberately does not invent universal latency numbers.

---

# 163. SCIENTIFIC TIMEOUT

A timeout SHALL NOT convert into:

```text
best available partial target.
```

A scientific run is either:

* valid and complete;
* or explicitly failed/abstained.

---

# 164. DATASET GOVERNANCE IN CI

Formal validation datasets SHALL NOT be copied into ordinary CI runners.

Use controlled validation infrastructure.

CI may invoke approved validation jobs without exposing the dataset to ordinary developers.

---

# 165. VALIDATION DATASET ACCESS

Require:

* access control;
* audit;
* purpose limitation;
* dataset version;
* immutable study manifest.

---

# 166. OUTCOME BLINDING

Where retrospective outcome validation is blinded, ordinary scientific development jobs SHALL NOT expose outcomes to the target-generation process.

CI architecture should support physically/logically separated:

```text
target generation
```

and:

```text
outcome analysis.
```

---

# 167. VALIDATION FREEZE ENFORCEMENT

Once study configuration is frozen:

CI SHALL reject or clearly invalidate a study result generated with a different:

```text
module

policy

engine

evidence release

measurement pipeline
```

unless protocol permits the change.

---

# 168. MODULE QUALIFICATION GATES IN CI/CD

CI/CD supports Q-level progression but does not decide it.

---

# 169. Q1 — SYNTHETIC IMPLEMENTATION

Required automated evidence:

```text
domain tests

plugin contract tests

synthetic Golden Cases

basic workflow E2E
```

---

# 170. Q2 — RESEARCH CAPABLE

Add:

```text
real de-identified measurement processing

Research environment security

scientific manifests

module Research isolation
```

---

# 171. Q3 — VERIFICATION QUALIFIED

Required:

```text
100% applicable Critical SRS requirements verified

all Critical Golden Cases pass

no unresolved Critical defects

scientific determinism verified

security isolation verified

compatibility manifest verified
```

---

# 172. Q4 — RETROSPECTIVE

CI/CD freezes and reproduces the exact retrospective validation configuration.

Clinical-statistical conclusions remain outside automated CI.

---

# 173. Q5 — SILENT PROSPECTIVE

CI/CD verifies:

* study configuration;
* version freeze;
* prospective run integrity;
* outcome blinding;
* audit.

It does not determine whether clinical results justify promotion.

---

# 174. Q6 — CLINICIAN-ASSISTED

CI verifies study software and critical workflow.

Human-factors and clinician decision-utility results require governed analysis.

---

# 175. Q7 — CLINICAL RELEASE CANDIDATE

Requires complete enterprise release evidence bundle.

---

# 176. Q8 — CLINICAL

Production activation requires approved Clinical Release Package.

CI/CD only installs what governance has authorised.

---

# 177. CRITICAL RELEASE EXPECTATIONS

Before Q8:

```text
100% applicable Critical Golden Cases PASS

100% Critical RLS/isolation tests PASS

100% Critical laterality tests PASS

100% Research/Clinical leakage tests PASS

100% signed-decision immutability tests PASS

0 unresolved Critical defects
```

The v1 roadmap already defined comparable absolute engineering expectations before Clinical Mode. 

---

# 178. MAJOR DEFECT POLICY

Normally block release.

Exception requires:

* documented risk assessment;
* defined scope;
* quality approval;
* justification that intended Clinical use remains acceptably safe.

---

# 179. SCIENTIFIC GOLDEN CHANGE POLICY

No one shall “update snapshots” to make CI green without:

```text
Scientific Change Impact Report
```

and required scientific review.

---

# 180. UI SNAPSHOT CHANGE POLICY

Safety-critical visual snapshots cannot be bulk-updated without review of:

* warnings;
* mode;
* reliability;
* evidence;
* decision controls.

---

# 181. EMERGENCY PATCHES

Emergency production patch workflow may be accelerated for:

* critical cybersecurity issue;
* patient-safety defect;
* severe availability problem.

It SHALL still require:

* change record;
* applicable tests;
* independent approval;
* post-release reconciliation.

---

# 182. EMERGENCY SCIENTIFIC MITIGATION

Safer emergency response may be:

```text
disable affected module
```

rather than rapidly modifying its scientific algorithm.

---

# 183. MODULE KILL SWITCH

Production SHALL support governed suspension of:

```text
one IndicationModuleRelease
```

without shutting down unaffected modules.

---

# 184. KILL SWITCH REQUIREMENTS

Suspension SHALL:

* deny new Clinical runs;
* preserve existing records;
* display appropriate state;
* audit activation;
* require authorised control.

---

# 185. ROLLBACK

Rollback shall restore:

# a complete known-compatible configuration.

Never rollback only the Target Engine while leaving incompatible policy/evidence active.

---

# 186. RELEASE ROLLBACK MANIFEST

Rollback identifies exact:

```text
app
DB compatibility
policy
evidence
engine
modules
plugins
containers
```

---

# 187. DATABASE ROLLBACK CAUTION

Not all schema migrations should be mechanically reversed.

For data-preserving migrations, controlled forward recovery may be safer.

Rollback strategy SHALL be migration-specific.

---

# 188. INCIDENT REPRODUCTION

Given an incident Target Slate, engineering SHALL be able to reproduce the relevant scientific run using:

```text
input manifest
scientific release
module
measurement bundle
reliability bundle
engine
plugin
```

or explain why reproduction is impossible.

---

# 189. CYBERSECURITY INCIDENTS

Security incidents affecting scientific integrity must assess:

```text
Could policy have been modified?

Could Evidence Library have changed?

Could Candidate data be altered?

Could signed decisions be altered?

Could cross-case data have mixed?
```

---

# 190. RELEASE EVIDENCE RETENTION

Clinical release evidence SHOULD be retained according to applicable QMS/regulatory record-retention policy.

At minimum enough to prove:

```text
what was released

what tests passed

who approved it

what scientific configuration it contained
```

---

# 191. ENTERPRISE TEST DASHBOARD

Internal dashboard should display:

```text
Current app release

Scientific release

Module qualification matrix

Critical test status

Golden Case status by module

RLS/security status

Scientific differential status

Measurement regression status

Open Critical defects

SBOM/security findings

Release approvals
```

Not clinician-facing.

---

# 192. REQUIRED CI WORKFLOW FAMILY

Recommended workflow files:

```text
ci-pr.yml

ci-scientific.yml

ci-main.yml

ci-nightly.yml

ci-security.yml

ci-measurements.yml

ci-golden-matrix.yml

release-validation.yml

release-clinical.yml

deploy-staging.yml

deploy-production.yml

postdeploy-verify.yml
```

Exact CI platform may change.

The semantics SHALL remain.

---

# 193. CONCEPTUAL `ci-pr`

```text
checkout
   ↓
dependency lock verification
   ↓
lint
   ↓
typecheck
   ↓
unit tests
   ↓
domain/schema tests
   ↓
affected module tests
   ↓
database static checks
   ↓
security scan
   ↓
build
```

---

# 194. CONCEPTUAL `ci-scientific`

```text
detect scientific paths
   ↓
resolve affected modules
   ↓
ScientificPolicy validation
   ↓
Evidence Graph validation
   ↓
Target Engine invariants
   ↓
affected Golden Suites
   ↓
scientific differential
   ↓
impact report
```

---

# 195. CONCEPTUAL `release-clinical`

```text
resolve approved release candidate
        ↓
verify commit/tag
        ↓
full clean build
        ↓
all Critical verification
        ↓
SBOM + provenance
        ↓
sign binaries/containers
        ↓
verify ClinicalReleasePackage
        ↓
required governance approvals
        ↓
deploy exact artefacts
        ↓
post-deployment verification
        ↓
activate signed compatibility manifest
```

---

# 196. PROHIBITED CI/CD PRACTICES

MAGNIOM SHALL NOT:

```text
deploy production from an unreviewed branch

use production PHI in normal CI

use mutable scientific container tags

silently update Evidence Library

silently update Scientific Policy

auto-promote a Research module

auto-merge scientific snapshot changes

lower reliability thresholds to make tests pass

skip failed Golden Cases

retry flaky Critical tests until green

run unreviewed migrations manually

use UI state as Clinical authority

expose signing keys to PR builds

rebuild a different artefact for production

allow module permissions to drift from release manifest

treat green CI as proof of clinical validity
```

---

# 197. ENTERPRISE VERIFICATION PRINCIPLE

MAGNIOM verification asks:

> **Did the system implement its controlled requirements correctly?**

Scientific validation asks:

> **Does the specified scientific behaviour justify its intended clinical role?**

Clinical validation asks:

> **Does exposing that behaviour to clinicians provide appropriate clinical utility and safety?**

CI/CD supports the first and preserves the artefacts needed for the others.

It does not collapse the three.

The v1 technical architecture already made this distinction explicitly between Target Engine software verification and clinical validation. 

---

# 198. MULTI-INDICATION DIFFERENTIATOR

The important v2 CI property is not:

> all modules are green.

It is:

> **every module is green only against the scientific authority it has actually earned.**

For example:

```text
TINNITUS Research Golden Suite        PASS

TINNITUS Clinical Permission Test     PASS
because expected result = DENIED
```

A denied Clinical request can therefore be:

# a successful safety test.

---

# 199. RELEASE SUCCESS IS NOT MAXIMUM CAPABILITY

A safe release may intentionally show:

```text
MDD               Clinical

Pain              Validation

Stroke            Validation

TBI               Research

Tinnitus          Research
```

The CI/CD system should confirm that those boundaries are enforced exactly.

---

# 200. CANONICAL ENTERPRISE QUALITY GATE

Before any production Clinical release, MAGNIOM SHALL demonstrate:

```text
Requirements complete
        ↓
Implementation verified
        ↓
Scientific configuration immutable
        ↓
Security verified
        ↓
Scientific regression understood
        ↓
Module qualification valid
        ↓
Clinical Release Package approved
        ↓
Artefacts signed
        ↓
Deployment reproducible
        ↓
Runtime configuration verified
```

---

# 201. FINAL ENTERPRISE TESTING PRINCIPLES

# Every safety-critical rule should exist as executable verification where technically possible.

# Every scientific release should be diffable.

# Every Clinical Target Slate should be reproducible.

# Every indication must have its own Golden Suite.

# Every Research/Clinical boundary should be tested negatively.

# Every cross-indication boundary should be tested adversarially.

# Every measurement should fail safely.

# Every spatial pipeline should test laterality explicitly.

# Every scientific dependency should be immutable.

# Every production artefact should be traceable to source.

# Every Clinical release should be signed.

# Every Critical requirement should have verification evidence.

# Every scientific change should have an impact report.

# Every module can be suspended independently.

# Every fallback must be validated.

# Every abstention path must be tested.

# No failed scientific computation should produce a partial authoritative target.

# No dependency update is scientifically trivial merely because the application still builds.

# No CI system should acquire clinical authority.

---

# 202. CANONICAL DEFINITION

The **MAGNIOM Enterprise Verification, Testing & CI/CD System v2.0** is:

> **A controlled, reproducible and security-hardened software and scientific delivery system that continuously verifies MAGNIOM's shared platform, independently exercises every indication module against its own evidence, measurement, geometry and policy invariants, detects and characterises scientific-output changes, produces immutable verification and supply-chain evidence, and promotes only signed, positively authorised application/scientific configurations through isolated development, validation, staging and production environments.**

---

# 203. FINAL GOVERNING RULE

> **MAGNIOM shall automate everything that can safely be automated—building, static analysis, unit testing, scientific regression, Golden Cases, database security, supply-chain verification, reproducibility checks, release-manifest generation and controlled deployment—but it shall never automate away scientific accountability. A green pipeline proves that the tested release satisfied its defined verification gates; it does not prove that a new indication, targeting method, measurement capability or algorithm deserves clinical authority. Clinical authority remains attached to the exact validated `IndicationModuleRelease` and its complete signed scientific compatibility configuration.**

The defining v2 enterprise principle is therefore:

# **Build automatically.

Test relentlessly.
Diff scientifically.
Sign immutably.
Deploy reproducibly.
Promote clinically only through governance.**
