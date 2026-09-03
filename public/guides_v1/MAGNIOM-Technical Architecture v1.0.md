# MAGNIOM
## Technical Architecture v1.0

**Document status:** Canonical architecture draft  
**Date:** 1 September 2026  
**Depends on:**  
Magniom Clinical & Scientific Specification v1.0  
Magniom Canonical Target Data Specification v1.0

**Initial clinical scope:** Major depressive disorder ± clinically significant anxious distress

**Primary application stack:**  
Next.js + TypeScript  
Supabase Postgres + Auth + Storage + Realtime + Queues  
Containerised Python neuroimaging compute plane

---

# 1. ARCHITECTURAL OBJECTIVE

Magniom must reliably convert:

**clinician-approved phenotype**

+

**versioned scientific evidence**

+

**patient structural MRI / resting-state fMRI**

+

**versioned connectome computation**

+

**target-reliability analysis**

+

**anatomical / electric-field constraints**

into:

# an auditable Target Slate

containing:

**up to 3 Primary Candidates**

and

**up to 2 Additional Candidates**

followed by:

# an independent Clinician Decision.

The architecture must guarantee that the final clinical target selection is never silently generated, mutated or substituted by the software.

---

# 2. ARCHITECTURAL PRINCIPLES

## 2.1 Clinical semantics before database convenience

The canonical objects define the system.

The relational schema implements those objects.

The database must not redefine their scientific meaning.

---

## 2.2 Human authority remains separate

The Target Engine creates:

**candidate targets.**

Only an authorised clinician creates:

**final target selection.**

---

## 2.3 Determinism before machine learning

Magniom v1 ranking must be:

- deterministic
- versioned
- reproducible
- explainable.

No opaque continuously learning model participates in Clinical Mode target ranking.

---

## 2.4 Compute is replaceable; provenance is permanent

fMRI preprocessing, parcellation, connectome calculation and E-field modelling will evolve.

Every output therefore carries:

- pipeline version
- container version
- input hashes
- configuration
- output hashes.

The scientific record remains reproducible even when the implementation changes.

---

## 2.5 Large binary artefacts do not belong in Postgres

Postgres stores:

- identity
- metadata
- relationships
- scientific measurements
- decisions
- hashes
- provenance.

Object storage stores:

- DICOM
- NIfTI
- CIFTI
- GIFTI
- surface meshes
- matrices
- E-field files
- reports.

---

## 2.6 Evidence and patient data remain separate domains

Published scientific knowledge is reusable across patients.

Patient observations are case-specific.

The architecture must prevent patient findings from silently becoming evidence-library facts.

---

## 2.7 Research Mode is structurally separated

Research hypotheses must not enter Clinical Mode simply because a frontend component displays them.

The separation must exist in:

- data
- APIs
- ranking rules
- permissions
- user interface
- audit trail.

---

# 3. REFERENCE ARCHITECTURE

```text
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS CLINICAL UI                     │
│                                                             │
│ Cases · Phenotype · Imaging · Connectome · Targets          │
│ Evidence · Review · Decision · Outcomes                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ authenticated clinical commands
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              MAGNIOM APPLICATION / API LAYER                │
│                                                             │
│ Next.js Server Components / Route Handlers                  │
│ Supabase Edge Functions                                     │
│ Domain command handlers                                     │
│ Validation · authorisation · workflow guards                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE PLATFORM                        │
│                                                             │
│ Auth                                                        │
│ PostgreSQL                                                  │
│ Row Level Security                                          │
│ Private Storage                                             │
│ Queues                                                      │
│ Realtime Broadcast                                          │
│ Audit / provenance                                          │
└───────────────┬─────────────────────────┬───────────────────┘
                │                         │
         job queue                         │ artefact metadata
                │                         │
                ▼                         ▼
┌──────────────────────────┐    ┌─────────────────────────────┐
│ NEUROCOMPUTE WORKERS     │    │ EVIDENCE KNOWLEDGE SYSTEM   │
│                          │    │                             │
│ BIDS                     │    │ EvidenceClaims              │
│ MRI preprocessing        │    │ TherapeuticCircuits         │
│ surfaces                 │    │ TargetFamilies              │
│ rs-fMRI                  │    │ Sources                     │
│ connectome               │    │ Governance versions         │
│ normative modelling      │    └─────────────────────────────┘
│ reliability              │
│ E-field                  │
└────────────┬─────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    TARGET ENGINE                            │
│                                                             │
│ Evidence gate                                               │
│ Phenotype prioritisation                                    │
│ Connectome refinement                                       │
│ Reliability qualification                                   │
│ Accessibility                                               │
│ E-field metrics                                             │
│ Diversity optimisation                                      │
│ Candidate explanation                                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
                   TARGET SLATE
                        │
                        ▼
                CLINICIAN REVIEW
                        │
                        ▼
                FINAL TARGET DECISION
```

---

# 4. TECHNOLOGY BASELINE

## 4.1 Next.js

Use:

# Next.js 16.3.x Active LTS

with the latest security patch available at deployment.

As of 1 September 2026, 16.3.3 is the current security-patched Active LTS release. Next.js App Router uses Server Components by default, with Client Components added where browser interaction is required.

Do not pin Magniom permanently to 16.3.3.

Production policy:

> **latest approved security-patched Active LTS release**

through controlled dependency updates.

---

# 5. NEXT.JS APPLICATION MODEL

Default to:

# Server Components

for:

- case pages
- phenotype summaries
- evidence displays
- target reports
- permission-aware navigation
- static scientific content.

Use:

# Client Components

only where required for:

- 3D cortical viewer
- interactive brain surface
- target comparison
- local form state
- drag/rotate/zoom
- complex charts
- live job progress
- decision interactions.

This limits the amount of patient data and JavaScript sent to the browser.

---

# 6. NEXT.JS MUTATION STRATEGY

Routine user mutations should use controlled server-side domain commands.

Examples:

```text
approve phenotype
request MRI processing
generate target slate
accept candidate
reject candidate
sign clinician decision
```

Do not allow generic client-generated table updates.

Next.js Route Handlers support standard HTTP request handling within App Router, while Server Functions can handle controlled server-side mutations.

For clinically significant commands, prefer:

# explicit application services

rather than putting domain logic directly inside page components.

---

# 7. REPOSITORY STRUCTURE

Recommended monorepo:

```text
magniom/
│
├── apps/
│   └── web/
│       ├── app/
│       ├── components/
│       ├── features/
│       └── lib/
│
├── packages/
│   ├── domain/
│   ├── schemas/
│   ├── evidence/
│   ├── target-engine/
│   ├── ui/
│   └── config/
│
├── services/
│   ├── neurocompute/
│   ├── efield/
│   └── worker/
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   ├── tests/
│   └── seed/
│
├── contracts/
│   ├── canonical/
│   └── api/
│
├── validation/
│
├── docs/
│
└── infra/
```

---

# 8. DOMAIN PACKAGE

`packages/domain` should contain the canonical TypeScript representations of:

- EvidenceClaim
- TherapeuticCircuit
- TargetFamily
- TargetCandidate
- TargetReliabilityProfile
- TargetSlate
- ClinicianDecision
- enums
- workflow states.

This package becomes:

# the single application-level semantic source of truth.

Generated database types do not replace it.

---

# 9. CONTRACT VALIDATION

Runtime inputs should be validated against explicit schemas.

Recommended:

# Zod

or another mature runtime TypeScript schema system.

Example conceptual flow:

```text
HTTP / Server Action payload
        ↓
runtime schema validation
        ↓
authenticated actor
        ↓
domain command
        ↓
workflow checks
        ↓
database transaction
```

Never trust:

- TypeScript types alone
- browser validation
- hidden form fields
- frontend route restrictions.

---

# 10. SUPABASE ROLE

Supabase serves as:

# Magniom's durable clinical system of record.

Use:

- PostgreSQL
- Auth
- Row Level Security
- Storage
- Queues
- Realtime
- Edge Functions where appropriate.

Supabase uses full PostgreSQL underneath its platform, allowing Magniom to use native constraints, indexes, triggers and extensions rather than treating the database as a generic document store.

---

# 11. DATABASE SCHEMA BOUNDARIES

Do not put every table directly into an exposed `public` schema.

Recommended logical schemas:

```text
identity
clinical
imaging
connectomics
evidence
targeting
treatment
outcomes
workflow
audit
system
api
```

Only carefully selected views/functions should be exposed through the Data API.

This reduces accidental surface area.

---

# 12. ORGANISATION MODEL

Magniom should be multi-tenant from inception even if RenovaTMS is initially the only organisation.

Core hierarchy:

```text
Organisation
    ↓
Site
    ↓
User Membership
    ↓
Clinical Case
```

Do not bind a patient directly to a global user account.

Patients may not be application users at all.

---

# 13. USER ROLES

Initial application roles:

### TMS Specialist

Can review cases, candidates and make final target decisions.

### Clinical Reviewer

Can review phenotype/imaging/evidence but cannot sign final target prescription unless separately authorised.

### Imaging Specialist

Can review MRI QC and imaging-derived outputs.

### Researcher

Can access approved de-identified research datasets and Research Mode according to project permissions.

### Evidence Curator

Can edit draft evidence objects.

### Evidence Approver

Can activate/promote scientific knowledge objects.

### Organisation Administrator

Manages users/sites but should not automatically gain clinical-data access.

### System Worker

Machine identity for compute processing.

### Platform Administrator

Operational role with tightly controlled privileged access.

Roles should represent capabilities, not only job titles.

---

# 14. AUTHENTICATION

Use Supabase Auth.

Require:

# MFA

for clinical users.

Enterprise deployments should support appropriate:

- SSO
- domain restrictions
- session controls
- device/session revocation.

Supabase Auth issues and validates authentication tokens integrated with the underlying Postgres authorization model.

---

# 15. AUTHORISATION

Use:

# database-enforced Row Level Security

as the final authorization boundary.

Frontend checks improve UX.

API checks provide application protection.

RLS provides database-level protection.

Supabase explicitly recommends enabling RLS and separately controlling Postgres grants; policies alone do not replace privilege management.

---

# 16. RLS PRINCIPLE

Every patient-related row must ultimately resolve to:

```text
organisation_id
```

and where appropriate:

```text
site_id
case_id
```

Example conceptual access:

```text
authenticated user
AND
active organisation membership
AND
membership has required permission
AND
case belongs to organisation
```

Do not rely solely on:

```text
user_id = created_by
```

because clinical cases are organisational resources.

---

# 17. POSTGRES GRANTS

Clinical tables should not automatically expose all standard CRUD operations to the authenticated role.

For example:

`clinician_decisions`

may allow:

- SELECT via policy
- controlled INSERT through command function

but not:

- generic DELETE
- unrestricted UPDATE.

For critical resources, application RPCs or server-side command handlers should be preferred over generic table mutation.

---

# 18. PRIVILEGED SERVICE ACCESS

Any server or worker using privileged database credentials bypassing RLS must:

- run only in trusted infrastructure
- authenticate machine-to-machine
- restrict its scope
- log all privileged actions.

Supabase service/secret credentials that bypass RLS must never be available to browser code.

---

# 19. CORE RELATIONAL MODEL

The canonical domain model maps approximately to:

```text
identity.organisations
identity.sites
identity.memberships
identity.roles

clinical.patients
clinical.cases
clinical.assessments
clinical.phenotype_snapshots
clinical.symptom_observations
clinical.functional_goals

imaging.studies
imaging.series
imaging.artifacts
imaging.qc_runs
imaging.transforms

connectomics.processing_runs
connectomics.parcellations
connectomics.connectivity_metrics
connectomics.normative_findings
connectomics.circuit_metrics

evidence.sources
evidence.claims
evidence.therapeutic_circuits
evidence.target_families
evidence.claim_sources
evidence.circuit_claims
evidence.family_claims

targeting.reliability_profiles
targeting.candidates
targeting.candidate_circuits
targeting.candidate_evidence
targeting.slates
targeting.slate_candidates
targeting.suppressed_candidates

targeting.clinician_decisions
targeting.candidate_decisions
targeting.final_targets

treatment.courses
treatment.sessions
treatment.actual_targets

outcomes.measurements
outcomes.followups

workflow.jobs
workflow.state_transitions

audit.events

system.algorithm_versions
system.pipeline_versions
system.normative_models
system.atlases
system.devices
system.coils
```

---

# 20. JSONB VS RELATIONAL DATA

Use relational columns for scientifically important searchable semantics.

Examples:

- evidence tier
- mode
- indication
- target family
- coordinates
- pipeline version
- decision status.

Use JSONB for:

- version-specific scientific feature collections
- noncanonical algorithm diagnostics
- structured extension metadata.

Do not hide core clinical meaning inside arbitrary JSON blobs.

---

# 21. SPATIAL COORDINATES

Store coordinates with:

- x
- y
- z
- unit
- coordinate-space ID
- orientation
- transform provenance.

Postgres row:

```text
target_region
    ↓
coordinate_space_id
    ↓
transform_chain
```

Do not store:

```text
(-42, 38, 30)
```

without explicit spatial context.

---

# 22. ARTIFACT REGISTRY

Every binary scientific artefact gets a database record.

Conceptual fields:

```text
artifact_id
case_id
artifact_type
storage_bucket
object_path
mime_type
sha256
size_bytes
source_artifact_ids
pipeline_run_id
created_at
immutable
```

Examples:

- original DICOM archive
- BIDS NIfTI
- preprocessed BOLD
- T1 reconstruction
- cortical surface
- CIFTI time series
- connectivity matrix
- QC image
- circuit map
- target ROI
- E-field mesh.

---

# 23. STORAGE ARCHITECTURE

Use private object storage.

No clinical MRI artefact should have a permanent public URL.

Supabase private buckets require authenticated download or time-limited signed access.

Recommended buckets:

```text
clinical-ingest
clinical-derived
clinical-reports
evidence-assets
research-derived
```

Research and clinical artefacts should remain distinct.

---

# 24. SIGNED ACCESS POLICY

Generate short-lived object access only when required.

Examples:

- browser needs a derived surface mesh
- compute worker needs MRI input
- clinician exports a report.

Do not persist signed URLs in the database.

Persist:

# object identity

not temporary access tokens.

---

# 25. LARGE MRI UPLOAD

The browser should upload large clinical imaging files through a controlled resumable upload flow rather than sending MRI files through a Next.js Server Action.

Next.js Server Actions have request body limits and are not the correct binary-ingest layer for multi-hundred-megabyte MRI datasets.

Architecture:

```text
Browser
   ↓
request authorised upload session
   ↓
private object storage
   ↓
upload complete event
   ↓
artifact registration
   ↓
ingest job
```

---

# 26. DICOM INGESTION

Initial MRI ingestion flow:

```text
DICOM upload
    ↓
malware / archive validation
    ↓
DICOM metadata extraction
    ↓
identity / study consistency checks
    ↓
de-identification rules where required
    ↓
BIDS conversion
    ↓
immutable raw input registration
```

Never modify the original uploaded object in place.

---

# 27. NEUROCOMPUTE BOUNDARY

Heavy neuroimaging must run outside:

- browser
- Next.js request lifecycle
- Supabase Edge Function runtime.

Create:

# Magniom NeuroCompute

as a separately deployable worker service.

Responsibilities:

- DICOM → BIDS
- MRI preprocessing
- T1 reconstruction
- cortical surfaces
- rs-fMRI denoising
- parcellation
- connectivity
- normative analysis
- circuit analysis
- reliability metrics.

---

# 28. NEUROCOMPUTE IMPLEMENTATION

Recommended stack:

# Python

with containerised, pinned scientific dependencies.

Likely components may include:

- dcm2niix
- BIDS tooling
- fMRIPrep
- FreeSurfer or FastSurfer
- ANTs
- nibabel
- nilearn
- NumPy
- SciPy
- pandas
- CIFTI/GIFTI tooling.

The exact pipeline becomes a separately versioned scientific artefact.

Do not allow operators to casually upgrade individual packages inside a Clinical Mode pipeline.

---

# 29. COMPUTE CONTAINER

Every Clinical Mode run records:

```text
container image digest
pipeline version
command configuration
input hashes
atlas versions
normative model version
CPU/GPU environment where relevant
started_at
completed_at
exit state
output hashes
```

The image digest matters more than a mutable Docker tag.

Good:

```text
sha256:...
```

Not sufficient alone:

```text
magniom-neurocompute:latest
```

---

# 30. PROCESSING PIPELINE

Canonical pipeline stages:

```text
INGEST
  ↓
BIDS_VALIDATE
  ↓
STRUCTURAL_PREPROCESS
  ↓
SURFACE_RECONSTRUCT
  ↓
BOLD_PREPROCESS
  ↓
BOLD_QC
  ↓
PARCELLATE
  ↓
CONNECTIVITY
  ↓
NORMATIVE_MODEL
  ↓
CIRCUIT_ANALYSIS
  ↓
TARGET_RELIABILITY
  ↓
CANDIDATE_FEATURES
  ↓
READY_FOR_TARGET_ENGINE
```

Each stage is independently inspectable.

---

# 31. PIPELINE FAILURE MODEL

A processing job may be:

```text
queued
claimed
running
succeeded
failed_retryable
failed_terminal
cancelled
superseded
```

A stage failure does not result in a partially valid clinical connectome.

Clinical Mode must explicitly mark:

# connectome unavailable

until all required gates succeed.

---

# 32. JOB QUEUE

Use a durable queue for compute orchestration.

Supabase Queues now provides Postgres-native durable message queues built on `pgmq`, including guaranteed delivery and message archiving.

Recommended queues:

```text
imaging-ingest
neurocompute
reliability
efield
target-generation
report-generation
```

Do not expose clinical compute queues directly to browser clients.

---

# 33. JOB MESSAGE DESIGN

Queue messages should contain identifiers, not patient payloads.

Good:

```json
{
  "job_id": "...",
  "case_id": "...",
  "processing_run_id": "..."
}
```

Avoid embedding:

- patient name
- symptoms
- raw MRI metadata
- credentials.

The worker retrieves authorised inputs using the job identity.

---

# 34. IDEMPOTENCY

Every long-running operation needs an idempotency key.

For example:

```text
connectome:
case + imaging_snapshot +
pipeline_version +
atlas_version +
normative_model_version
```

If the exact scientific computation already succeeded:

reuse the immutable result.

Do not create different scientific outputs merely because a user clicked:

**Generate**

twice.

---

# 35. COMPUTE CLAIM / LEASE

Workers should:

1. atomically claim a queue job;
2. establish a lease;
3. process;
4. periodically report heartbeat;
5. write outputs;
6. atomically mark result;
7. archive/delete queue message.

If a worker dies:

the job becomes eligible for retry after its visibility period.

---

# 36. NEUROCOMPUTE NETWORK SECURITY

Workers should not require broad public inbound access.

Preferred pattern:

```text
worker polls secure queue
       ↓
receives job identifier
       ↓
obtains temporary artefact access
       ↓
processes
       ↓
uploads outputs
       ↓
writes signed result manifest
```

Restrict outbound destinations where practical.

---

# 37. CONNECTOME RUN

A ConnectomeRun must reference:

- structural input
- BOLD inputs
- preprocessing run
- atlas
- motion/QC
- connectivity method
- version
- normative model
- all output artefacts.

Never overwrite a previous ConnectomeRun.

---

# 38. NORMATIVE MODEL SERVICE

Normative modelling should initially remain a deterministic compute module, not an online-learning service.

A `NormativeModel` is a versioned scientific package containing:

- reference population definition
- processing compatibility
- feature definitions
- model parameters
- validity scope
- version
- provenance.

Target generation explicitly references:

```text
normative_model_version
```

---

# 39. NORMATIVE MODEL INCOMPATIBILITY

The Target Engine must refuse a model when:

```text
patient pipeline ≠ validated normative pipeline
```

unless a formally validated harmonisation path exists.

Do not compare patient connectivity produced with one scientific pipeline against normative distributions generated with materially different preprocessing merely because both output matrices have the same dimensions.

---

# 40. TARGET RELIABILITY SERVICE

Reliability computation should be independent of candidate ranking.

Inputs:

- run A
- run B
- split halves
- candidate search method.

Outputs:

- cross-run spatial distance
- split-half spatial distance
- connectivity reproducibility
- target confidence region
- limiting factors
- reliability class.

This ensures the Target Engine cannot quietly redefine reliability to obtain a preferred candidate.

---

# 41. E-FIELD SERVICE

Architect:

# EField Compute

as a separate optional service.

Potential implementation:

SimNIBS-class modelling.

Inputs:

- subject anatomy
- cortical ROI
- device
- coil
- candidate pose constraints.

Outputs:

- coil centre
- orientation
- E-field mesh
- ROI field metrics
- off-target metrics
- pose sensitivity.

---

# 42. E-FIELD VERSIONING

Record separately:

```text
head-model version
segmentation version
conductivity model
coil model
solver version
optimisation algorithm
```

Do not treat “SimNIBS output” as sufficient provenance.

---

# 43. EVIDENCE KNOWLEDGE SYSTEM

Evidence lives primarily in relational Postgres.

Canonical entities:

```text
Source
EvidenceClaim
TherapeuticCircuit
TargetFamily
ProtocolPrecedent
```

The evidence library must be versioned as a coherent release.

Example:

```text
Evidence Library 1.0.0
```

A target slate never references:

# “current evidence”

It references:

# a specific evidence-library release.

---

# 44. EVIDENCE VERSION RELEASE

Draft evidence changes do not affect Clinical Mode.

Workflow:

```text
Draft EvidenceClaim
      ↓
Scientific review
      ↓
Evidence approval
      ↓
Library release candidate
      ↓
Validation
      ↓
Evidence Library v1.1.0
      ↓
Clinical activation
```

Historical target slates retain the previous version.

---

# 45. EVIDENCE SOURCE CONTENT

Store structured citation metadata.

Where licensing permits, store:

- abstract
- selected structured notes
- curator summary.

Do not build core Clinical Mode reasoning on dynamically fetched internet pages.

Production evidence must come from:

# curated, frozen, reviewed evidence releases.

---

# 46. OPTIONAL SEMANTIC SEARCH

`pgvector` may support:

- evidence curator search
- literature retrieval
- clinician navigation.

It must not determine evidence tier automatically.

Embeddings are:

# discovery infrastructure

not clinical evidence governance.

---

# 47. TARGET ENGINE BOUNDARY

The Target Engine consumes canonical inputs.

It does not directly:

- query arbitrary patient records
- crawl literature
- preprocess MRI
- decide the diagnosis
- prescribe stimulation protocol.

Inputs must already be frozen snapshots.

---

# 48. TARGET ENGINE INPUT

Conceptually:

```text
TargetEngineInput
│
├── case_id
├── phenotype_snapshot_id
├── evidence_library_version
├── permitted_target_families
├── connectome_run_id
├── reliability inputs
├── normative_model_version
├── device/coil context
└── engine_version
```

---

# 49. TARGET ENGINE STAGES

```text
1. Validate clinical scope
2. Load evidence-eligible TargetFamilies
3. Generate candidate locations
4. Calculate phenotype fit
5. Calculate therapeutic-circuit fit
6. Add normative context
7. Attach reliability
8. Apply accessibility constraints
9. Add E-field metrics if available
10. Apply evidence ceiling
11. Suppress ineligible candidates
12. Rank eligible candidates
13. Optimise target diversity
14. Calculate convergence
15. Calculate counterfactual comparison
16. Construct Target Slate
17. Generate structured explanations
```

---

# 50. TARGET ENGINE PURITY

Where possible, candidate ranking should behave like a pure function:

```text
f(
 phenotype snapshot,
 evidence version,
 connectome snapshot,
 reliability,
 anatomy,
 algorithm version
)
=
candidate result
```

No hidden:

- date-dependent logic
- user-specific preferences
- random numbers
- internet calls
- current evidence queries.

This dramatically improves reproducibility.

---

# 51. RANKING MODULES

Separate ranking into explicit modules:

```text
EvidenceGate
PhenotypeScorer
CircuitConcordance
NormativeContext
ReliabilityQualifier
AccessibilityGate
EFieldEvaluator
CandidateRanker
DiversityOptimizer
ConvergenceAnalyzer
CounterfactualAnalyzer
ExplanationBuilder
```

Each module has its own:

- input schema
- output schema
- version
- tests.

---

# 52. CLINICAL RANKING VS EXPLANATION

The ExplanationBuilder runs:

# after deterministic ranking.

It may generate templated prose from structured facts.

If an LLM is ever used to improve language:

- it receives structured approved facts;
- it cannot change rank;
- it cannot invent evidence;
- its output is labelled generated narrative;
- the canonical structured explanation remains authoritative.

---

# 53. LLM USE

LLMs may eventually assist with:

### permissible

- extracting symptoms from notes for clinician confirmation
- evidence-library search
- explaining structured candidate differences
- drafting reports.

### prohibited in Clinical Mode v1

- deciding diagnosis
- assigning evidence tier
- choosing target
- altering target rank
- selecting protocol
- changing safety state.

---

# 54. TARGET ENGINE RESULT

The engine writes:

- all generated candidates
- all suppressed candidates
- all ranking features
- eligibility results
- Target Slate
- abstention reason where relevant.

Do not only preserve:

# the five winning targets.

The rejected/suppressed hypothesis set is essential for audit and validation.

---

# 55. TARGET ENGINE TRANSACTION

Target generation should be atomic at the workflow level.

Either:

# complete immutable Target Slate

is published,

or:

# no new slate becomes active.

Partial candidates may exist in temporary compute tables but must not become visible as a ready clinical slate.

---

# 56. STATE MACHINE

Case targeting state:

```text
DRAFT
  ↓
PHENOTYPE_READY
  ↓
IMAGING_PENDING
  ↓
IMAGING_PROCESSING
  ↓
CONNECTOME_READY
  ↓
TARGET_GENERATION_PENDING
  ↓
TARGET_GENERATING
  ↓
TARGET_SLATE_READY
  ↓
CLINICIAN_REVIEW
  ↓
DECISION_SIGNED
```

Alternative states:

```text
IMAGING_FAILED
PERSONALISATION_ABSTAINED
TARGETING_ABSTAINED
DECISION_DEFERRED
SUPERSEDED
```

Transitions must be server-enforced.

---

# 57. WORKFLOW TRANSITIONS

Do not let the frontend directly set:

```text
status = DECISION_SIGNED
```

Use domain commands such as:

```text
signClinicianDecision(...)
```

which validate:

- actor permission
- slate state
- candidate review
- required attestation
- immutable snapshot
- audit event.

---

# 58. AUDIT ARCHITECTURE

Create an append-only:

```text
audit.events
```

table.

Fields should include:

```text
event_id
organisation_id
case_id
actor_type
actor_id
event_type
aggregate_type
aggregate_id
aggregate_version
occurred_at
request_id
correlation_id
previous_hash
event_hash
payload
```

---

# 59. TAMPER EVIDENCE

For critical clinical events, consider cryptographic hash chaining:

```text
event_hash =
SHA256(
 previous_hash +
 canonical_event_payload
)
```

This does not replace database security.

It provides additional evidence of tampering or accidental historical alteration.

---

# 60. AUDIT EVENTS

Examples:

```text
CASE_CREATED
PHENOTYPE_APPROVED
MRI_UPLOADED
IMAGING_QC_COMPLETED
CONNECTOME_GENERATED
TARGET_ENGINE_STARTED
CANDIDATE_GENERATED
CANDIDATE_SUPPRESSED
TARGET_SLATE_PUBLISHED
EVIDENCE_VIEWED
CANDIDATE_ACCEPTED
CANDIDATE_REJECTED
TARGET_MODIFIED
DECISION_SIGNED
DECISION_SUPERSEDED
REPORT_EXPORTED
```

---

# 61. AUDIT LOG IMMUTABILITY

Application roles receive:

# INSERT only through controlled system paths

for audit events.

No normal role receives:

- UPDATE
- DELETE.

Retention and archival are administrative governance operations, not ordinary CRUD.

---

# 62. CLINICAL SNAPSHOTS

Before target generation freeze:

### Phenotype Snapshot

Exactly what clinical state the engine saw.

### Imaging Snapshot

Exactly which imaging/connectome outputs were active.

### Evidence Snapshot

Evidence library version.

### Device Context Snapshot

Coils/devices available to the target engine.

The Target Slate references these snapshots.

---

# 63. SNAPSHOT STRATEGY

Do not copy every referenced row blindly.

A snapshot may contain:

- canonical structured JSON
- references to immutable objects
- cryptographic hash.

Example:

```text
phenotype_snapshot_id
schema_version
payload
sha256
created_at
approved_by
```

---

# 64. REALTIME UI

Use realtime events for:

- imaging upload completed
- compute job progress
- QC completed
- target generation finished
- collaborative review notifications.

Supabase recommends Broadcast for scalable secure change notification over direct Postgres Changes in many use cases.

Do not use Realtime as the authoritative state store.

The database remains authoritative.

---

# 65. NEXT.JS CLINICAL WORKSPACE

Primary route structure:

```text
/cases
/cases/[caseId]
/cases/[caseId]/phenotype
/cases/[caseId]/imaging
/cases/[caseId]/connectome
/cases/[caseId]/targets
/cases/[caseId]/decision
/cases/[caseId]/treatment
/cases/[caseId]/outcomes

/evidence
/evidence/circuits
/evidence/target-families

/research
/admin
```

---

# 66. CASE OVERVIEW

The case overview should answer:

### Clinical status

Where is the case in the workflow?

### Treatment objective

What are we trying to change?

### MRI state

Uploaded / processing / QC result.

### Connectome state

Available / unreliable / unavailable.

### Target state

Not generated / ready / reviewed.

### Clinical decision

Pending / signed / superseded.

No page should require users to infer workflow from scattered information.

---

# 67. PHENOTYPE WORKSPACE

Layout:

```text
┌─────────────────────────────┬──────────────────────────────┐
│ Clinical assessment         │ Treatment priorities         │
│                             │                              │
│ Diagnosis                   │ 1. Dysphoric burden          │
│ Symptoms                    │ 2. Anxious distress          │
│ Measures                    │ 3. Functional goal           │
│ Function                    │                              │
└─────────────────────────────┴──────────────────────────────┘
```

The specialist must explicitly:

# Approve Phenotype Snapshot

before target generation.

---

# 68. IMAGING WORKSPACE

Show:

- acquisition metadata
- structural images
- rs-fMRI runs
- motion
- usable minutes
- segmentation
- registration
- QC state.

Primary visual output:

# Connectome Quality Gate

```text
PASS
CONDITIONAL
FAIL
```

Do not bury failure information in technical tabs.

---

# 69. CONNECTOME WORKSPACE

The interface should separate:

### Observed patient connectivity

from:

### normative deviation

from:

### therapeutic-circuit concordance.

These are different scientific facts.

Views:

- network overview
- cortical surface
- therapeutic circuit
- seed connectivity
- normative deviations
- reliability.

---

# 70. 3D BRAIN VIEWER

The 3D viewer should operate on derived artefacts, not raw DICOM.

Potential frontend technologies:

- vtk.js
- Niivue
- React Three Fiber

depending on whether the representation is:

- cortical surfaces
- volumetric NIfTI
- E-field meshes.

Do not make one viewer responsible for every neuroimaging modality if specialised viewers provide better correctness.

---

# 71. VIEWER COORDINATE INTEGRITY

A displayed target must always expose:

- subject coordinate
- standard-space coordinate where available
- atlas label
- target confidence region.

The frontend must not transform coordinates independently with undocumented JavaScript math.

Spatial transforms belong to the scientific compute layer.

---

# 72. TARGET WORKSPACE

Recommended three-column desktop layout:

```text
┌─────────────────┬────────────────────────────┬──────────────────┐
│ CLINICAL        │ 3D BRAIN / NETWORK         │ TARGET SLATE     │
│                 │                            │                  │
│ Diagnosis       │ Patient surface            │ Primary 1        │
│ Symptoms        │ Therapeutic circuit        │ Primary 2        │
│ Priorities      │ Candidate ROI              │ Primary 3        │
│ Goals           │ E-field                    │ Alternative A    │
│                 │ Reliability region         │ Alternative B    │
└─────────────────┴────────────────────────────┴──────────────────┘
```

---

# 73. TARGET INTERACTION

Clicking a candidate updates the entire workspace.

Show:

# Why nominated

# Evidence

# Patient-specific finding

# Reliability

# Anatomical accessibility

# Counterfactual target

# Conflicting evidence

# Why it may be wrong

Do not default to a giant numeric score.

---

# 74. TARGET COMPARISON

Allow side-by-side comparison of:

- evidence tier
- symptom coverage
- therapeutic circuit
- patient FC
- normative context
- spatial reliability
- cortical distance
- E-field
- target displacement
- uncertainty.

The comparison screen should visibly identify:

# redundant candidates.

---

# 75. COUNTERFACTUAL VIEW

A core UI component:

```text
Evidence-only target
        ↔
Connectome-informed target
```

Show:

**distance moved**

**same target family?**

**same therapeutic circuit?**

**why moved?**

**what evidence is gained?**

**what uncertainty is introduced?**

This becomes one of Magniom's signature features.

---

# 76. CLINICIAN DECISION WORKSPACE

For each candidate:

```text
ACCEPT
REJECT
MODIFY
REPLACE
DEFER
```

Require structured reasoning.

Final target selection remains separate.

Before signing, display:

# Magniom Target Slate ≠ Treatment Prescription

---

# 77. DECISION SIGNING

The sign action must validate:

- actor is authorised TMS specialist
- target slate is current
- required candidates reviewed
- final targets explicitly selected
- evidence/reliability disclosures available
- clinician attestation accepted.

Then:

1. create immutable decision;
2. create audit event;
3. freeze dependent records;
4. generate signed decision snapshot.

---

# 78. SUPERSESSION

Once signed:

# never edit the clinical decision in place.

If new MRI or phenotype information changes the plan:

```text
old decision
   ↓
superseded
   ↓
new Target Slate
   ↓
new Clinician Decision
```

Both remain available.

---

# 79. API ARCHITECTURE

Prefer domain APIs.

Examples:

```text
POST /api/cases
POST /api/cases/:id/phenotype/approve

POST /api/cases/:id/imaging/upload-session
POST /api/cases/:id/imaging/process

POST /api/cases/:id/target-slates/generate

GET  /api/target-slates/:id

POST /api/target-candidates/:id/review

POST /api/target-slates/:id/decision
POST /api/clinician-decisions/:id/sign
```

Avoid exposing raw database-table CRUD as the clinical API design.

---

# 80. API COMMAND ENVELOPE

Clinically material commands should include:

```text
request_id
idempotency_key
actor context
expected aggregate version
payload
```

The expected version enables optimistic concurrency control.

---

# 81. CONCURRENCY

Example:

Clinician A opens slate v1.

Clinician B changes phenotype and generates slate v2.

Clinician A tries to sign v1.

System must respond:

# The target slate has been superseded.

Do not silently sign a stale target decision.

---

# 82. OPTIMISTIC LOCKING

Use:

```text
version integer
```

or immutable aggregate identifiers.

Critical writes assert:

```text
current_version = expected_version
```

before transaction completion.

---

# 83. ERROR MODEL

Machine-readable errors should use stable codes.

Example:

```text
CONNECTOME_QC_FAILED
TARGET_SLATE_SUPERSEDED
INSUFFICIENT_EVIDENCE
RESEARCH_TARGET_NOT_PERMITTED
CLINICIAN_PERMISSION_REQUIRED
DECISION_ALREADY_SIGNED
TARGET_RELIABILITY_TOO_LOW
```

User-visible explanations are mapped separately.

---

# 84. APPLICATION SECURITY

Security should use layered controls:

```text
Authentication
      ↓
MFA
      ↓
Organisation membership
      ↓
Role capability
      ↓
Application command check
      ↓
Postgres grant
      ↓
RLS
      ↓
Audit
```

No single layer carries the entire security model.

---

# 85. DATABASE SECURITY TESTING

Every RLS-protected table should have automated allow/deny tests.

Supabase explicitly recommends database tests for RLS policies, including checking operations against intended roles.

Security tests should cover:

- same organisation
- different organisation
- different site
- clinician
- admin
- researcher
- unauthenticated
- machine worker.

---

# 86. DATA API EXPOSURE

Prefer one of two patterns:

### Pattern A — Restricted Data API

Expose only safe views/RPC functions.

### Pattern B — Server-only application access

Keep most clinical schemas unexposed and mediate access through the Next.js/Supabase server tier.

Magniom should lean toward:

# Pattern B for high-risk clinical mutation

while still using RLS internally as defence in depth.

---

# 87. VIEW SECURITY

Any exposed database view must be deliberately configured to obey intended access restrictions.

Supabase documentation notes that ordinary Postgres views can bypass underlying RLS depending on how they are created; security-invoker views or equivalent restrictions should be used where appropriate.

---

# 88. PHI/PII SEPARATION

Where practical, separate:

### Identifying data

name  
date of birth  
contact details  
medical record number

from:

### scientific case data

phenotype  
MRI  
connectome  
target slate  
outcome.

Use pseudonymous:

```text
case_id
patient_id
```

through compute pipelines.

Workers generally do not need to know the patient's name.

---

# 89. LOGGING RULE

Application and compute logs must not casually contain:

- patient name
- date of birth
- full clinical note
- raw JWT
- signed URLs
- service keys.

Logs should favour:

```text
request_id
case_id
job_id
artifact_id
event type
status
duration
error code
```

---

# 90. SECRET MANAGEMENT

Separate:

- publishable browser credentials
- server secrets
- compute-worker credentials
- evidence pipeline secrets.

Do not reuse service credentials across environments.

Rotate according to operational policy.

---

# 91. DEPLOYMENT ENVIRONMENTS

Minimum:

```text
local
development
validation
production
```

I strongly recommend:

# validation

as a distinct environment.

It is where:

- frozen algorithms
- validation datasets
- regulatory tests
- reproducibility runs

can occur without contaminating production.

---

# 92. DATABASE MIGRATIONS

All schema changes:

- migration file
- code review
- automated test
- deployment pipeline.

No production schema editing through manual dashboard operations except controlled emergency procedure.

---

# 93. SCIENTIFIC MIGRATIONS

Database migration and scientific model migration are separate.

Example:

```text
Database schema: 1.8
Target Engine: 1.2
Evidence Library: 1.4
Neuro Pipeline: 2.0
Normative Model: 1.1
```

One can change without silently changing the others.

---

# 94. PRODUCTION RELEASE MANIFEST

Every production release should record:

```text
web version
database migration
target engine
neurocompute
efield engine
evidence library
normative model
atlas package
```

Example:

```text
Magniom Clinical Release 1.3.0

Web                 1.6.2
DB                  1.4.0
Target Engine       1.1.0
Neuro Pipeline      1.0.3
Evidence Library    1.2.0
Normative Model     1.0.0
EField              disabled
```

This makes “what version was running?” answerable.

---

# 95. CI/CD

Pipeline stages:

```text
lint
typecheck
unit tests
domain contract tests
database migration tests
RLS security tests
integration tests
target-engine golden tests
container provenance check
dependency/security scan
build
validation deployment
approval
production deployment
```

Clinical scientific releases may require additional governance approval beyond ordinary code review.

---

# 96. GOLDEN CASE TESTS

Create fixed synthetic/de-identified cases.

For each:

```text
input phenotype
input connectome metrics
evidence version
expected eligible candidates
expected suppressed candidates
expected slate
expected abstention
```

A Target Engine update must explain every changed golden-case result.

---

# 97. SCIENTIFIC SNAPSHOT TESTS

Do not merely test:

```text
function returned HTTP 200.
```

Test:

```text
same scientific inputs
+
same engine
=
same Target Slate
```

including:

- candidate order
- suppression
- evidence claims
- explanations
- counterfactual metrics.

---

# 98. COORDINATE TESTING

Build specialised tests for:

- coordinate-space conversions
- left/right orientation
- transform inversion
- subject → MNI
- MNI → neuronavigation
- atlas annotation.

A left/right spatial bug would be clinically serious.

These require dedicated validation beyond normal web testing.

---

# 99. NEUROIMAGING VALIDATION

Pipeline tests should use known datasets to verify:

- BIDS conversion
- registration
- segmentation
- surfaces
- motion metrics
- connectivity matrix
- candidate localisation
- reliability.

Container updates require reproducibility comparison.

---

# 100. TARGET ENGINE VALIDATION BOUNDARY

Software verification asks:

> Did the engine implement the specification correctly?

Clinical validation asks:

> Does the specified algorithm improve clinical decisions or outcomes?

These are different tests.

The technical architecture must support both.

---

# 101. OBSERVABILITY

Collect infrastructure metrics:

### Web

- request latency
- server errors
- auth failures.

### Database

- query latency
- locks
- connections
- RLS failures.

### Compute

- queue depth
- processing duration
- worker crashes
- retry counts
- memory/GPU utilisation.

### Scientific

- QC failure rate
- target reliability distribution
- abstention rate
- target convergence distribution
- clinician override rate.

Scientific operational metrics should not automatically become clinical evidence.

---

# 102. CORRELATION IDs

Every major workflow receives a correlation ID.

Example:

```text
MRI upload
→ processing job
→ connectome
→ target generation
→ Target Slate
```

The same correlation chain allows troubleshooting without exposing excessive patient detail.

---

# 103. ALERTING

High-priority alerts:

- failed database backup
- sustained queue failure
- compute pipeline corruption
- artifact hash mismatch
- unexpected production algorithm version
- audit insertion failure
- privilege-policy regression
- clinical storage unavailable.

---

# 104. BACKUPS

Postgres backups and file artefact backups require separate consideration.

Supabase notes that database backups protect the database itself, while Storage objects require their own storage protection strategy.

Therefore Magniom requires:

- database PITR/backup strategy
- object-storage durability strategy
- independent restore testing
- scientific artefact manifest integrity.

---

# 105. DISASTER RECOVERY

Define measurable:

**RPO — recovery point objective**

and:

**RTO — recovery time objective**

for:

- clinical database
- MRI storage
- evidence library
- target decisions
- audit events.

The clinically signed decision/audit record should receive particularly strong recovery guarantees.

---

# 106. DATA RETENTION

Retention periods should be policy-driven by:

- Australian clinical-record obligations
- research ethics requirements
- consent
- organisational policy.

Do not hard-code legal retention rules into general application logic.

Represent:

```text
retention_policy_id
```

and controlled archival state.

---

# 107. DATA DELETION

Clinical deletion must distinguish:

- patient-facing deletion request
- legal retention requirement
- research de-identification
- audit integrity
- object storage.

Do not use unrestricted:

```text
DELETE FROM patients
```

as a privacy workflow.

Use a governed lifecycle.

---

# 108. RESEARCH DATASET BUILDER

Research Mode should never directly query unrestricted clinical production data.

Create a controlled pipeline:

```text
approved protocol
    ↓
eligibility query
    ↓
de-identification
    ↓
dataset snapshot
    ↓
data quality checks
    ↓
locked research dataset
```

Each research dataset records:

- extraction query/version
- subjects
- variables
- date
- ethics/project ID
- hashes.

---

# 109. NO CONTINUOUS LEARNING

Research outcomes never directly alter:

```text
Target Engine production weights
```

Flow:

```text
Production outcomes
      ↓
Research dataset
      ↓
Analysis
      ↓
Proposed algorithm revision
      ↓
Validation
      ↓
Governance
      ↓
new Target Engine version
```

---

# 110. EVIDENCE CURATION UI

Create a separate Evidence Governance workspace.

Evidence curators can:

- add source
- draft EvidenceClaim
- link circuit
- link TargetFamily
- document limitations
- document conflicting evidence.

Approvers can:

- reject
- approve
- deprecate
- promote evidence tier.

No single paper automatically changes Clinical Mode.

---

# 111. RESEARCH MODE UI

Research Mode should have visibly different chrome.

For example:

# RESEARCH MODE

persistent header.

Candidate labels:

# Research hypothesis

Do not merely use a subtle colour variation that can be overlooked.

---

# 112. CLINICAL REPORT GENERATION

Generate reports server-side from canonical objects.

Report sections:

```text
Patient / case identity
Clinical phenotype
MRI quality
Connectomic findings
Evidence-supported targets
Target Slate
Reliability
Counterfactual comparison
Uncertainty
Clinician decision
Final target(s)
Evidence provenance
Version manifest
```

Avoid freehand report text becoming an alternative undocumented source of target truth.

---

# 113. NEURONAVIGATION EXPORT

This should be a dedicated adapter layer.

```text
Final Target Selection
      ↓
Navigation Adapter
      ↓
vendor-specific representation
```

Potential formats differ by systems such as:

- Localite
- Brainsight
- other neuronavigation platforms.

Canonical Magniom target data must remain vendor-neutral.

---

# 114. EXPORT VALIDATION

Before export:

- verify coordinate space
- verify subject identifier
- verify selected T1 reference
- verify transform chain
- verify laterality
- display human-readable confirmation.

An export adapter should never silently infer an unknown coordinate convention.

---

# 115. FUTURE DEVICE INTEGRATION

Do not directly integrate Magniom with a stimulator during v1 target-selection development.

First integration target:

# neuronavigation export.

Direct hardware control substantially changes the technical and regulatory risk boundary.

Architect interfaces so device integration remains possible later without making it part of v1.

---

# 116. FUTURE PROTOCOL MODULE

Keep future:

```text
ProtocolCandidate
ProtocolDecision
```

separate from:

```text
TargetCandidate
ClinicianDecision
```

Conceptually:

```text
Target selection
       ↓
Protocol evidence
       ↓
Protocol candidates
       ↓
clinician prescription
```

Do not overload `TargetCandidate` with treatment dose/frequency logic now.

---

# 117. FRONTEND DESIGN PRINCIPLE

Magniom should feel like:

# a scientific case conference

not:

# an analytics dashboard.

Prioritise:

- brain/network visualization
- clinical narrative
- evidence provenance
- comparison
- uncertainty.

Avoid:

- dozens of KPI tiles
- colourful scores
- “AI recommendation 94%”
- gamified target rankings.

---

# 118. ACCESSIBILITY

All critical scientific meaning must survive without:

- colour
- animation
- 3D interaction.

A clinician unable to use the 3D viewer must still be able to review:

- target identity
- coordinates
- evidence
- reliability
- uncertainty
- decision.

---

# 119. PERFORMANCE

The 3D application should not require raw imaging to be downloaded to render every target page.

Create web-optimised derivatives:

- cortical mesh
- reduced-resolution overlays
- target ROI
- network map
- E-field visualisation.

Raw MRI remains available through specialised viewers when needed.

---

# 120. CACHE POLICY

Clinical data should default to:

# dynamic / non-shared caching.

Avoid accidental cross-user caching.

Public scientific content may use controlled caching.

Next.js supports server-rendered and streamed application patterns, but Magniom should explicitly classify each route according to clinical sensitivity rather than rely on framework defaults blindly.

---

# 121. REQUEST CONTEXT

Every authenticated request should resolve a server-side context:

```text
user
organisation
site
roles
permissions
request ID
```

Do not trust an `organisation_id` supplied by the client to determine authorization.

It may identify intent.

Authorization is derived server-side.

---

# 122. MACHINE IDENTITIES

Use distinct machine identities for:

- NeuroCompute
- E-field
- report generator
- evidence importer.

Each receives only required permissions.

Do not give every worker unrestricted platform admin access.

---

# 123. API AUTHENTICATION FOR WORKERS

Worker calls should use machine credentials through server-side authenticated interfaces.

Supabase Edge Functions can enforce different authentication modes and can access Postgres with caller-scoped or privileged server clients.

Magniom should wrap privileged operations in narrow domain functions rather than giving workers arbitrary database mutation authority.

---

# 124. DATA INTEGRITY CONSTRAINTS

Use PostgreSQL constraints aggressively.

Examples:

```text
primary candidate count <= 3

additional candidate count <= 2

signed decision cannot have no clinician

clinical candidate cannot reference Research-only target family

coordinate unit must be mm

final target must reference target region

candidate mode must match slate mode
```

Do not rely on TypeScript to enforce database truth.

---

# 125. SIGNED DECISION PROTECTION

Recommended technical protection:

1. signed decision row becomes immutable;
2. child candidate decision rows become immutable;
3. final target rows become immutable;
4. relevant snapshots marked frozen;
5. mutation trigger raises exception;
6. supersession creates new aggregate.

---

# 126. DATABASE FUNCTIONS

Use carefully reviewed Postgres functions for operations requiring:

- atomic state transition
- append-only audit
- immutable aggregate creation
- security-sensitive multi-row updates.

Example:

```text
sign_clinician_decision(...)
```

should complete everything transactionally.

---

# 127. EVENT OUTBOX

For reliable downstream effects, use an outbox pattern.

Example:

Clinician signs decision.

Same transaction:

```text
insert clinician decision
insert audit event
insert outbox event
```

Then asynchronous worker handles:

- PDF report
- notifications
- research event stream.

Never make the clinical transaction depend on successful email/report generation.

---

# 128. EVENT TYPES

Domain events may include:

```text
PhenotypeSnapshotApproved
ImagingRunCompleted
ConnectomeQualified
PersonalisationAbstained
TargetSlateGenerated
ClinicianDecisionSigned
ClinicianDecisionSuperseded
TreatmentCourseCompleted
OutcomeRecorded
```

Events are facts.

Commands are requests.

Keep them distinct.

---

# 129. NOTIFICATIONS

Notifications should say:

> “Target Slate ready for review”

not expose sensitive clinical information unnecessarily in:

- email
- push notification
- generic system toast.

Opening the authenticated application reveals the details.

---

# 130. SECURITY PATCH POLICY

Framework dependencies used in a clinical platform require active maintenance.

Next.js issued critical security patches as recently as 25 August 2026, reinforcing the need for formal dependency monitoring rather than “set and forget” application infrastructure.

Policy:

- monitor security advisories;
- test patches in validation environment;
- deploy critical security updates promptly;
- preserve release manifest.

---

# 131. THREAT MODEL

Threat modelling should include:

### External attacker

Attempts to access patient data.

### Malicious authenticated user

Attempts cross-organisation access.

### Overprivileged administrator

Accesses clinical data unnecessarily.

### Compromised compute worker

Attempts to access unrelated cases.

### Supply-chain compromise

Scientific or web dependency compromised.

### Data poisoning

Invalid normative/evidence data introduced.

### Scientific integrity error

Wrong coordinate transform or evidence mapping.

### Automation bias

Clinician overtrusts ranked candidate.

Clinical safety includes both:

# cybersecurity risk

and:

# scientific-software risk.

---

# 132. SOFTWARE BILL OF MATERIALS

Maintain SBOMs for:

- web application
- NeuroCompute image
- E-field image.

This is especially important because neuroimaging pipelines can contain large dependency graphs and compiled libraries.

---

# 133. SCIENTIFIC PACKAGE LOCKING

Clinical compute containers should use exact versions.

Do not:

```text
pip install nilearn
```

without version constraint during production build.

Use locked:

- packages
- OS image
- binaries
- atlases
- model files.

---

# 134. REPRODUCIBILITY REPORT

Every Target Slate should be capable of producing a machine report such as:

```text
Target Engine        1.0.0
Evidence Library     1.0.0
Neuro Pipeline       1.0.2
Container Digest     sha256:...
HCP Atlas            MMP1.0
Normative Model      1.0.0
Input Hash           ...
Output Slate Hash    ...
```

---

# 135. ARCHITECTURE FOR VALIDATION

The validation system should be able to execute the Target Engine:

# offline

against frozen datasets.

Do not make validation dependent on:

- current UI state
- user session
- dynamic internet
- current evidence website.

A CLI/batch execution interface is required.

---

# 136. TARGET ENGINE CLI

Example conceptual command:

```text
magniom-target-engine run \
  --phenotype phenotype.json \
  --connectome connectome.json \
  --reliability reliability.json \
  --evidence evidence-library-1.0.0 \
  --engine 1.0.0
```

Produces:

```text
candidates.json
suppressed.json
slate.json
provenance.json
```

The server application should call the same underlying domain engine.

---

# 137. CONTRACT-FIRST DEVELOPMENT

Before implementing database tables:

1. freeze canonical JSON schemas;
2. create representative examples;
3. validate the ten canonical acceptance cases;
4. build target-engine interfaces;
5. then map to relational storage.

This avoids schema-driven scientific distortion.

---

# 138. FIRST IMPLEMENTATION MILESTONE

The first end-to-end system should use:

# synthetic connectome data.

Workflow:

```text
Create case
↓
Record phenotype
↓
Approve snapshot
↓
Attach synthetic ConnectomeRun
↓
Attach synthetic reliability
↓
Run Target Engine
↓
Display Target Slate
↓
Review target
↓
Sign Clinician Decision
↓
Generate report
```

This validates the entire semantic/workflow architecture before MRI processing complexity is introduced.

---

# 139. SECOND IMPLEMENTATION MILESTONE

Add:

# real structural MRI + precomputed connectome import.

This tests:

- artefact ingestion
- coordinates
- surfaces
- imaging viewer
- target overlays.

No native fMRI preprocessing yet.

---

# 140. THIRD IMPLEMENTATION MILESTONE

Add:

# native NeuroCompute pipeline.

DICOM → BIDS → preprocessing → connectome → reliability.

Validate against manually processed reference cases.

---

# 141. FOURTH IMPLEMENTATION MILESTONE

Add:

# normative modelling

and:

# patient-specific circuit analysis.

---

# 142. FIFTH IMPLEMENTATION MILESTONE

Add:

# E-field modelling.

Only once the basic scientific target reasoning is stable.

---

# 143. SIXTH IMPLEMENTATION MILESTONE

Begin:

# silent prospective validation.

At that stage the product should still avoid presenting Magniom Target Slates to treating clinicians if the study design requires blinding.

The architecture therefore needs feature-level access control for validation studies.

---

# 144. FEATURE FLAGS

Feature flags may control:

- E-field
- Research Mode
- experimental circuits
- structural connectivity
- target comparison methods.

But clinical scientific logic cannot be silently changed by a consumer-style remote feature flag.

Any flag affecting target generation must be:

- captured in Target Slate provenance;
- governed;
- versioned.

---

# 145. CONFIGURATION HIERARCHY

Separate:

### Operational configuration

log level  
timeouts  
queue concurrency

from:

### Scientific configuration

atlas  
motion threshold  
connectivity metric  
ranking coefficients  
target-family eligibility.

Scientific configuration requires scientific version control.

It is not an ordinary `.env` setting.

---

# 146. SYSTEM HEALTH VS CLINICAL VALIDITY

Display separately:

# System healthy

and:

# Connectome valid for personalisation.

A fully operational platform can still have:

- bad MRI
- unstable FC
- insufficient evidence.

Technical success does not imply scientific validity.

---

# 147. MAGNIOM ARCHITECTURAL INVARIANTS

The implementation must make the following conditions structurally difficult or impossible:

### No clinical target without evidence provenance.

### No connectome-derived candidate without reliability.

### No clinical use of Research-only evidence.

### No final target without clinician action.

### No silent replacement of signed decisions.

### No clinical target represented only by an unqualified coordinate.

### No MRI processing inside the browser/web request lifecycle.

### No large binary scientific data stored directly in ordinary Postgres rows.

### No dynamic literature search inside Clinical Mode ranking.

### No continuous automatic model retraining.

### No patient identity required by scientific compute workers.

### No stale Target Slate signed after supersession.

---

# 148. SECURITY INVARIANTS

### All clinical base tables protected by grants + RLS.

### No privileged secret available to browser code.

### Clinical artefacts private by default.

### Cross-organisation access denied at database layer.

### Signed clinical decisions immutable.

### Audit records append-only.

### Critical state transitions transactional.

### Production scientific versions identifiable.

---

# 149. SCIENTIFIC INVARIANTS

### Evidence constrains.

### Phenotype prioritises.

### Connectomics refines.

### Reliability qualifies.

### Anatomy constrains.

### E-field optimises.

### Alternatives expose uncertainty.

### Specialist decides.

The architecture must preserve this sequence.

If an implementation makes it easy for:

# connectomics to override evidence

or:

# ranking engine to become prescription

the architecture is wrong.

---

# 150. MAGNIOM V1 DEPLOYMENT TOPOLOGY

Recommended logical deployment:

```text
                 ┌──────────────────────┐
                 │ Next.js application │
                 └──────────┬───────────┘
                            │
                    secure application traffic
                            │
                 ┌──────────▼───────────┐
                 │ Supabase             │
                 │ Auth/Postgres        │
                 │ Storage/Queues       │
                 │ Realtime             │
                 └────┬───────────┬─────┘
                      │           │
              secure queue        │
                      │           │
          ┌───────────▼────┐      │
          │ NeuroCompute   │      │
          │ Worker Pool    │      │
          └───────┬────────┘      │
                  │               │
          ┌───────▼────────┐      │
          │ EField Service │      │
          │ optional v1+   │      │
          └────────────────┘      │
                                  │
                         evidence / target state
```

Deployment location should be selected according to:

- Australian healthcare privacy requirements
- contractual data residency requirements
- latency
- backup/disaster recovery design.

---

# 151. WHY THIS ARCHITECTURE

This design deliberately avoids a sprawling microservice architecture.

Magniom's complexity is primarily:

# scientific

not:

# high-volume consumer-scale traffic.

Therefore use:

### one modern clinical web application

### one strong relational clinical database

### one secure object store

### durable background queues

### a small number of specialised scientific workers.

Split a service only when:

- runtime requirements differ
- scientific versioning differs
- security boundary differs
- compute needs differ.

---

# 152. WHAT SUPABASE SHOULD NOT DO

Supabase should not:

- preprocess fMRI
- run FreeSurfer
- compute massive connectivity matrices inside Edge Functions
- perform E-field finite-element modelling
- hide scientific computation inside database triggers.

It should:

# coordinate and record those processes.

---

# 153. WHAT NEXT.JS SHOULD NOT DO

Next.js should not:

- calculate target coordinates
- process MRI
- implement scientific transforms in UI code
- maintain hidden ranking logic
- become the authoritative audit store.

It should:

# provide the clinical workspace and controlled application layer.

---

# 154. WHAT THE TARGET ENGINE SHOULD NOT DO

The Target Engine should not:

- browse literature dynamically
- change diagnosis
- decide TMS eligibility
- determine iTBS/cTBS automatically
- sign decisions
- retrain itself.

It should:

# transform approved structured inputs into explainable candidate hypotheses.

---

# 155. WHAT NEUROCOMPUTE SHOULD NOT DO

NeuroCompute should not:

- know which target the specialist prefers
- rank clinical evidence
- alter phenotype
- make treatment decisions.

It should:

# produce trustworthy scientific measurements.

---

# 156. CANONICAL SYSTEM CONTRACT

The full technical architecture can therefore be expressed as:

```text
CLINICIAN
defines clinical truth
        ↓
SUPABASE
records approved clinical state
        ↓
NEUROCOMPUTE
measures individual neurobiology
        ↓
EVIDENCE LIBRARY
defines permissible scientific claims
        ↓
TARGET ENGINE
constructs candidate hypotheses
        ↓
NEXT.JS WORKSPACE
makes reasoning visible
        ↓
CLINICIAN
accepts, modifies, rejects or replaces
        ↓
SUPABASE
stores immutable final decision and provenance
```

---

# 157. FINAL ARCHITECTURAL PRINCIPLE

Magniom should not be engineered as:

# an algorithm with a website around it.

It should be engineered as:

# a governed clinical reasoning system with deterministic scientific computation inside it.

The database preserves truth.

The compute layer preserves reproducibility.

The evidence layer constrains what can be claimed.

The Target Engine structures the decision.

The interface exposes the reasoning.

The audit layer preserves what happened.

And:

# the specialist remains the final clinical authority.

That is the Magniom Technical Architecture v1.0.