# MAGNIOM
## Supabase Database & Security Specification v1.0

**Document status:** Canonical implementation specification  
**Date:** 1 September 2026  
**Platform:** Supabase PostgreSQL / Auth / Storage / Queues / Realtime  
**Depends on:**
- Magniom Clinical & Scientific Specification v1.0
- Magniom Canonical Target Data Specification v1.0
- Magniom Technical Architecture v1.0

---

# 1. PURPOSE

This specification translates Magniom's canonical scientific domain into a concrete Supabase implementation.

It defines:

- PostgreSQL schemas
- PostgreSQL enums
- primary and foreign keys
- clinical tables
- scientific-version tables
- immutable snapshots
- target candidate storage
- Target Slate representation
- clinician decisions
- application roles
- permissions
- RLS
- database grants
- security helper functions
- clinical state transitions
- immutable clinical signing
- audit/event architecture
- Storage buckets and paths
- Storage RLS
- durable queue contracts
- job orchestration
- idempotency
- scientific-version releases
- database testing requirements.

The governing principle is:

# Database security and scientific integrity must survive a compromised or defective frontend.

Next.js improves usability.

It is not the ultimate enforcement boundary.

---

# 2. SECURITY MODEL

Magniom uses several independent layers:

```text
Supabase Auth
      ↓
Authenticated identity
      ↓
Organisation membership
      ↓
Application role / permissions
      ↓
Command-level authorisation
      ↓
PostgreSQL grants
      ↓
Row Level Security
      ↓
Database constraints
      ↓
Immutable clinical transitions
      ↓
Audit trail
```

No single layer should be treated as sufficient.

---

# 3. DATABASE SCHEMA TOPOLOGY

Create these PostgreSQL schemas:

```sql
create schema if not exists identity;
create schema if not exists clinical;
create schema if not exists imaging;
create schema if not exists connectomics;
create schema if not exists evidence;
create schema if not exists targeting;
create schema if not exists treatment;
create schema if not exists outcomes;
create schema if not exists workflow;
create schema if not exists audit;
create schema if not exists system;
create schema if not exists security;
create schema if not exists api;
```

---

# 4. SCHEMA RESPONSIBILITIES

## `identity`

Organisations, sites, users, memberships and clinicians.

## `clinical`

Patients, cases, assessments, phenotype observations and immutable phenotype snapshots.

## `imaging`

MRI studies, series, artefact metadata, transforms and QC.

## `connectomics`

Versioned preprocessing/connectome runs and derived connectivity findings.

## `evidence`

Curated scientific knowledge:

- EvidenceClaims
- TherapeuticCircuits
- TargetFamilies
- source literature
- Evidence Library releases.

## `targeting`

Patient-specific:

- TargetCandidates
- TargetReliabilityProfiles
- TargetSlates
- candidate reviews
- ClinicianDecisions
- final targets.

## `treatment`

Actual treatment delivered.

## `outcomes`

Clinical measurements and follow-up.

## `workflow`

Jobs, state transitions, idempotency and asynchronous dispatch.

## `audit`

Immutable semantic audit events.

## `system`

Scientific software versions, atlases, normative models, devices, coils and configuration releases.

## `security`

Private database security helpers.

## `api`

Explicit Data API surface where direct Supabase Data API access is desired.

---

# 5. DATA API STRATEGY

Do **not** expose the scientific and clinical base schemas directly through PostgREST by default.

Preferred exposed schema:

```text
api
```

Internal schemas remain private.

The `api` schema may contain:

- security-invoker views
- safe read functions
- narrow mutation functions.

High-risk clinical commands should normally pass through:

# Next.js server-side application services

or:

# narrowly granted PostgreSQL RPCs.

Do not expose generic CRUD access simply because Supabase makes it convenient.

---

# 6. DEFAULT PRIVILEGES

Revoke permissive defaults.

Example baseline:

```sql
revoke all on schema identity from anon, authenticated;
revoke all on schema clinical from anon, authenticated;
revoke all on schema imaging from anon, authenticated;
revoke all on schema connectomics from anon, authenticated;
revoke all on schema evidence from anon, authenticated;
revoke all on schema targeting from anon, authenticated;
revoke all on schema treatment from anon, authenticated;
revoke all on schema outcomes from anon, authenticated;
revoke all on schema workflow from anon, authenticated;
revoke all on schema audit from anon, authenticated;
revoke all on schema system from anon, authenticated;
revoke all on schema security from anon, authenticated;
```

Explicitly grant only required objects.

For future functions:

```sql
alter default privileges
in schema api
revoke execute on functions from public, anon, authenticated;
```

Then selectively grant execution.

---

# 7. EXTENSIONS

Initial database extensions:

```sql
create extension if not exists pgcrypto;
create extension if not exists pgmq;
```

Optional later:

```sql
create extension if not exists vector;
```

`vector` may support evidence discovery.

It must not determine evidence grade or target ranking.

---

# 8. UUID STANDARD

Use:

```sql
uuid primary key default gen_random_uuid()
```

for domain entities.

Avoid serial integer IDs for clinically meaningful aggregates.

---

# 9. CORE ENUMS

Create important enums centrally.

```sql
create type system.magniom_mode as enum (
  'clinical',
  'research'
);

create type system.lifecycle_status as enum (
  'draft',
  'active',
  'deprecated',
  'superseded',
  'archived'
);

create type system.evidence_tier as enum (
  'A',
  'B',
  'C',
  'D',
  'R'
);

create type system.qualitative_confidence as enum (
  'high',
  'moderate',
  'low',
  'not_assessable'
);

create type system.data_quality_state as enum (
  'verified',
  'reviewed',
  'unverified',
  'incomplete',
  'invalid'
);
```

---

# 10. CLINICAL ROLE ENUM

Application roles:

```sql
create type identity.app_role as enum (
  'tms_specialist',
  'clinical_reviewer',
  'imaging_specialist',
  'researcher',
  'evidence_curator',
  'evidence_approver',
  'organisation_admin'
);
```

Platform infrastructure identities are not ordinary application roles.

---

# 11. ORGANISATIONS

```sql
create table identity.organisations (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  status text not null default 'active'
    check (status in ('active', 'suspended', 'archived')),

  created_at timestamptz not null default now()
);
```

---

# 12. SITES

```sql
create table identity.sites (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null
    references identity.organisations(id),

  name text not null,

  timezone text not null default 'Australia/Melbourne',

  status text not null default 'active'
    check (status in ('active', 'inactive')),

  created_at timestamptz not null default now(),

  unique (organisation_id, name)
);
```

---

# 13. USER PROFILES

Supabase Auth remains identity authority.

Application profile:

```sql
create table identity.user_profiles (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  display_name text,

  created_at timestamptz not null default now()
);
```

Do not reproduce:

- passwords
- authentication secrets
- JWT information

inside application tables.

---

# 14. MEMBERSHIPS

```sql
create table identity.memberships (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null
    references identity.organisations(id),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  site_id uuid
    references identity.sites(id),

  role identity.app_role not null,

  active boolean not null default true,

  created_at timestamptz not null default now(),

  unique (
    organisation_id,
    user_id,
    site_id,
    role
  )
);
```

A person may have more than one role.

---

# 15. CLINICIANS

Clinical professional identity must survive deletion or disabling of a login account.

```sql
create table identity.clinicians (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null
    references identity.organisations(id),

  user_id uuid
    references auth.users(id)
    on delete set null,

  full_name text not null,

  professional_type text not null,

  registration_identifier text,

  tms_signing_authority boolean not null default false,

  active boolean not null default true,

  created_at timestamptz not null default now()
);
```

A signed target decision references:

```text
clinician.id
```

not merely:

```text
auth.users.id
```

---

# 16. PERMISSION MODEL

Application roles map to explicit capabilities.

Representative capabilities:

```text
case.read
case.create
case.update

phenotype.edit
phenotype.approve

imaging.read
imaging.upload
imaging.qc_review

connectome.read

target.generate
target.read
target.review

decision.create
decision.sign

treatment.read
treatment.write

outcome.read
outcome.write

evidence.read
evidence.draft
evidence.approve

research.read
research.export

organisation.manage
```

The canonical permissions should be stored in migration-controlled tables rather than arbitrary user-generated strings.

---

# 17. PERMISSION TABLES

```sql
create table identity.permissions (
  code text primary key,
  description text not null
);

create table identity.role_permissions (
  role identity.app_role not null,
  permission_code text not null
    references identity.permissions(code),

  primary key (role, permission_code)
);
```

Seed through migrations.

Do not let ordinary organisation administrators redefine scientific permissions.

---

# 18. SECURITY HELPER

Central helper:

```sql
create or replace function security.has_permission(
  p_organisation_id uuid,
  p_permission text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from identity.memberships m
    join identity.role_permissions rp
      on rp.role = m.role
    where m.user_id = auth.uid()
      and m.organisation_id = p_organisation_id
      and m.active = true
      and rp.permission_code = p_permission
  );
$$;
```

Because it is `SECURITY DEFINER`, every relation is schema-qualified and the search path is explicitly empty.

---

# 19. SITE-LEVEL ACCESS

Optional helper:

```sql
create or replace function security.can_access_site(
  p_organisation_id uuid,
  p_site_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from identity.memberships m
    where m.user_id = auth.uid()
      and m.organisation_id = p_organisation_id
      and m.active = true
      and (
        m.site_id is null
        or m.site_id = p_site_id
      )
  );
$$;
```

A `NULL` membership site can represent organisation-wide access where role policy permits it.

---

# 20. PATIENT IDENTITY

```sql
create table clinical.patients (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null
    references identity.organisations(id),

  site_id uuid
    references identity.sites(id),

  external_record_number text,

  given_name text,
  family_name text,
  date_of_birth date,

  status text not null default 'active'
    check (status in ('active', 'inactive', 'archived')),

  created_at timestamptz not null default now(),

  unique (organisation_id, external_record_number)
);
```

Where stronger identifier separation is required, direct identifiers can later move into a dedicated encrypted identity subsystem without changing case IDs.

---

# 21. CLINICAL CASE

```sql
create type clinical.case_state as enum (
  'draft',
  'phenotype_ready',
  'imaging_pending',
  'imaging_processing',
  'connectome_ready',
  'target_generation_pending',
  'target_generating',
  'target_slate_ready',
  'clinician_review',
  'decision_signed',
  'personalisation_abstained',
  'targeting_abstained',
  'decision_deferred',
  'superseded',
  'closed'
);
```

```sql
create table clinical.cases (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null
    references identity.organisations(id),

  site_id uuid
    references identity.sites(id),

  patient_id uuid not null
    references clinical.patients(id),

  state clinical.case_state not null default 'draft',

  indication_code text not null,

  mode system.magniom_mode not null default 'clinical',

  version integer not null default 1,

  created_by uuid references auth.users(id),

  created_at timestamptz not null default now(),

  closed_at timestamptz
);
```

---

# 22. CASE VERSION

`clinical.cases.version` is an optimistic-concurrency version.

Every clinical state transition increments it.

Example:

```text
expected version = 7
actual version = 8
```

must cause the command to fail as stale.

---

# 23. ASSESSMENTS

```sql
create table clinical.assessments (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,
  case_id uuid not null
    references clinical.cases(id),

  clinician_id uuid
    references identity.clinicians(id),

  status text not null
    check (status in ('draft', 'completed', 'superseded')),

  created_at timestamptz not null default now(),
  completed_at timestamptz,

  foreign key (organisation_id)
    references identity.organisations(id)
);
```

---

# 24. CLINICAL OBSERVATIONS

A generic but governed observation table is useful for:

- symptom scores
- severity
- functional burden
- priority.

```sql
create table clinical.observations (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,
  case_id uuid not null references clinical.cases(id),

  assessment_id uuid references clinical.assessments(id),

  concept_code text not null,

  observation_type text not null,

  numeric_value numeric,
  text_value text,
  boolean_value boolean,

  unit text,
  instrument text,

  quality_state system.data_quality_state
    not null default 'unverified',

  observed_at timestamptz not null,

  entered_by uuid references auth.users(id),

  created_at timestamptz not null default now(),

  check (
    num_nonnulls(
      numeric_value,
      text_value,
      boolean_value
    ) = 1
  )
);
```

---

# 25. FUNCTIONAL GOALS

```sql
create table clinical.functional_goals (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,
  case_id uuid not null references clinical.cases(id),

  description text not null,

  patient_priority smallint
    check (patient_priority between 1 and 5),

  clinician_priority smallint
    check (clinician_priority between 1 and 5),

  active boolean not null default true,

  created_at timestamptz not null default now()
);
```

---

# 26. PHENOTYPE SNAPSHOTS

Target generation must never query an evolving assessment directly.

Create immutable snapshots:

```sql
create table clinical.phenotype_snapshots (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,
  case_id uuid not null references clinical.cases(id),

  schema_version text not null,

  payload jsonb not null,

  payload_sha256 bytea not null,

  approved_by_clinician_id uuid not null
    references identity.clinicians(id),

  created_at timestamptz not null default now()
);
```

Once inserted:

# immutable.

---

# 27. PHENOTYPE SNAPSHOT HASH

Hash canonical JSON at the application layer or through a controlled database function.

Conceptually:

```text
SHA256(canonical JSON representation)
```

Canonical JSON serialisation must be deterministic.

Raw PostgreSQL `jsonb::text` should not be relied upon across every future implementation as the long-term external canonicalisation standard without explicit validation.

---

# 28. IMAGING STUDIES

```sql
create type imaging.study_status as enum (
  'uploaded',
  'validated',
  'processing',
  'qc_pass',
  'qc_conditional',
  'qc_fail',
  'superseded'
);
```

```sql
create table imaging.studies (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,
  case_id uuid not null references clinical.cases(id),

  study_uid text,

  scanner_field_strength_t numeric,

  acquired_at timestamptz,

  status imaging.study_status not null,

  created_at timestamptz not null default now()
);
```

---

# 29. MRI SERIES

```sql
create table imaging.series (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,
  imaging_study_id uuid not null
    references imaging.studies(id),

  series_type text not null
    check (
      series_type in (
        'T1w',
        'rest_bold',
        'fieldmap',
        'dwi',
        'other'
      )
    ),

  series_uid text,

  run_number integer,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);
```

---

# 30. ARTIFACT REGISTRY

Supabase Storage is binary storage.

Magniom maintains its own scientific artefact registry:

```sql
create table imaging.artifacts (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,
  case_id uuid not null references clinical.cases(id),

  imaging_study_id uuid
    references imaging.studies(id),

  artifact_type text not null,

  bucket text not null,
  object_path text not null,

  mime_type text,

  sha256 bytea not null,
  size_bytes bigint,

  immutable boolean not null default true,

  processing_run_id uuid,

  created_at timestamptz not null default now(),

  unique (bucket, object_path),

  unique (sha256, artifact_type, case_id)
);
```

---

# 31. ARTIFACT LINEAGE

```sql
create table imaging.artifact_lineage (
  parent_artifact_id uuid not null
    references imaging.artifacts(id),

  child_artifact_id uuid not null
    references imaging.artifacts(id),

  relationship text not null,

  primary key (
    parent_artifact_id,
    child_artifact_id
  )
);
```

This allows reconstruction:

```text
DICOM
 ↓
BIDS NIfTI
 ↓
preprocessed BOLD
 ↓
CIFTI
 ↓
connectivity matrix
 ↓
target ROI
```

---

# 32. IMAGING QC RUNS

```sql
create table imaging.qc_runs (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,
  imaging_study_id uuid not null
    references imaging.studies(id),

  pipeline_version_id uuid not null,

  status text not null
    check (status in ('pass', 'conditional', 'fail')),

  usable_rest_minutes numeric,
  mean_fd_mm numeric,
  censored_fraction numeric,

  registration_quality system.qualitative_confidence,
  segmentation_quality system.qualitative_confidence,
  parcel_coverage_quality system.qualitative_confidence,

  metrics jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);
```

---

# 33. PIPELINE VERSIONS

```sql
create table system.pipeline_versions (
  id uuid primary key default gen_random_uuid(),

  pipeline_type text not null,

  semantic_version text not null,

  container_digest text,

  configuration_sha256 bytea,

  status system.lifecycle_status not null,

  released_at timestamptz,

  unique (pipeline_type, semantic_version)
);
```

Examples:

```text
neurocompute 1.0.0
target-reliability 1.0.0
efield 0.9.0
```

---

# 34. ATLAS VERSIONS

```sql
create table system.atlases (
  id uuid primary key default gen_random_uuid(),

  code text not null,

  version text not null,

  coordinate_space text not null,

  artifact_id uuid references imaging.artifacts(id),

  status system.lifecycle_status not null,

  unique (code, version)
);
```

---

# 35. NORMATIVE MODELS

```sql
create table system.normative_models (
  id uuid primary key default gen_random_uuid(),

  code text not null,
  version text not null,

  compatible_pipeline_version_id uuid not null
    references system.pipeline_versions(id),

  population_description jsonb not null,

  model_manifest jsonb not null,

  manifest_sha256 bytea not null,

  status system.lifecycle_status not null,

  released_at timestamptz,

  unique (code, version)
);
```

Clinical Target Engine must check processing compatibility.

---

# 36. CONNECTOME PROCESSING RUN

```sql
create type connectomics.run_status as enum (
  'queued',
  'running',
  'succeeded',
  'failed',
  'superseded'
);
```

```sql
create table connectomics.processing_runs (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,
  case_id uuid not null references clinical.cases(id),

  imaging_study_id uuid not null
    references imaging.studies(id),

  pipeline_version_id uuid not null
    references system.pipeline_versions(id),

  atlas_id uuid not null
    references system.atlases(id),

  normative_model_id uuid
    references system.normative_models(id),

  status connectomics.run_status not null,

  input_manifest jsonb not null,
  input_manifest_sha256 bytea not null,

  output_manifest jsonb,
  output_manifest_sha256 bytea,

  started_at timestamptz,
  completed_at timestamptz,

  created_at timestamptz not null default now()
);
```

---

# 37. CONNECTIVITY METRICS

Do not necessarily store a full 377 × 377 matrix as one relational row per edge unless scientifically/operationally justified.

Store the full matrix as immutable artefact.

Store clinically queried derived metrics relationally:

```sql
create table connectomics.connectivity_metrics (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,

  processing_run_id uuid not null
    references connectomics.processing_runs(id),

  feature_code text not null,

  source_region_code text,
  target_region_code text,

  metric_type text not null,
  metric_value double precision not null,

  created_at timestamptz not null default now(),

  unique (
    processing_run_id,
    feature_code
  )
);
```

---

# 38. NORMATIVE FINDINGS

```sql
create table connectomics.normative_findings (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,

  processing_run_id uuid not null
    references connectomics.processing_runs(id),

  feature_code text not null,

  raw_value double precision,

  z_score double precision,
  percentile double precision,

  direction text
    check (direction in ('higher', 'lower')),

  relevance text
    check (
      relevance in (
        'supportive',
        'neutral',
        'contradictory',
        'uncertain'
      )
    ),

  unique (
    processing_run_id,
    feature_code
  )
);
```

---

# 39. CIRCUIT METRICS

```sql
create table connectomics.circuit_metrics (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,

  processing_run_id uuid not null
    references connectomics.processing_runs(id),

  therapeutic_circuit_version_id uuid not null,

  candidate_region_code text,

  metric_code text not null,

  metric_value double precision,

  interpretation text,

  created_at timestamptz not null default now()
);
```

---

# 40. EVIDENCE SOURCE

```sql
create table evidence.sources (
  id uuid primary key default gen_random_uuid(),

  source_type text not null,

  title text not null,

  authors text[],
  journal text,
  publication_year integer,

  doi text,
  pubmed_id text,

  citation_text text not null,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);
```

---

# 41. VERSIONED SCIENTIFIC OBJECT PATTERN

Scientific knowledge uses:

```text
logical object identity
+
immutable version row
+
release membership
```

Example:

```sql
create table evidence.claim_series (
  id uuid primary key default gen_random_uuid(),
  code text not null unique
);
```

Then:

```sql
create table evidence.claim_versions (
  id uuid primary key default gen_random_uuid(),

  claim_series_id uuid not null
    references evidence.claim_series(id),

  version text not null,

  mode system.magniom_mode not null,

  evidence_tier system.evidence_tier not null,

  claim_type text not null,

  statement text not null,

  certainty system.qualitative_confidence not null,

  population jsonb not null,

  intervention jsonb,
  comparator jsonb,
  outcomes jsonb not null,

  replication_status text not null,

  applicability_constraints jsonb not null default '[]',
  limitations jsonb not null default '[]',

  payload_sha256 bytea not null,

  created_at timestamptz not null default now(),

  unique (claim_series_id, version)
);
```

A version row is immutable.

---

# 42. THERAPEUTIC CIRCUIT VERSIONS

```sql
create table evidence.circuit_series (
  id uuid primary key default gen_random_uuid(),
  code text not null unique
);
```

```sql
create table evidence.circuit_versions (
  id uuid primary key default gen_random_uuid(),

  circuit_series_id uuid not null
    references evidence.circuit_series(id),

  version text not null,

  mode system.magniom_mode not null,
  evidence_tier system.evidence_tier not null,

  name text not null,
  description text not null,

  validation_status text not null,

  circuit_definition jsonb not null,

  limitations jsonb not null default '[]',

  payload_sha256 bytea not null,

  created_at timestamptz not null default now(),

  unique (circuit_series_id, version)
);
```

---

# 43. TARGET FAMILY VERSIONS

```sql
create table evidence.target_family_series (
  id uuid primary key default gen_random_uuid(),
  code text not null unique
);
```

```sql
create table evidence.target_family_versions (
  id uuid primary key default gen_random_uuid(),

  target_family_series_id uuid not null
    references evidence.target_family_series(id),

  version text not null,

  mode system.magniom_mode not null,
  evidence_tier system.evidence_tier not null,

  name text not null,
  description text not null,

  laterality text not null,

  anatomical_definition jsonb not null,
  candidate_generation_rules jsonb not null,

  limitations jsonb not null default '[]',

  payload_sha256 bytea not null,

  created_at timestamptz not null default now(),

  unique (target_family_series_id, version)
);
```

---

# 44. SCIENTIFIC RELATIONSHIPS

```sql
create table evidence.circuit_claims (
  circuit_version_id uuid not null
    references evidence.circuit_versions(id),

  claim_version_id uuid not null
    references evidence.claim_versions(id),

  primary key (
    circuit_version_id,
    claim_version_id
  )
);
```

```sql
create table evidence.target_family_circuits (
  target_family_version_id uuid not null
    references evidence.target_family_versions(id),

  circuit_version_id uuid not null
    references evidence.circuit_versions(id),

  primary key (
    target_family_version_id,
    circuit_version_id
  )
);
```

```sql
create table evidence.claim_sources (
  claim_version_id uuid not null
    references evidence.claim_versions(id),

  source_id uuid not null
    references evidence.sources(id),

  relationship text not null
    check (
      relationship in (
        'supporting',
        'conflicting',
        'context'
      )
    ),

  primary key (
    claim_version_id,
    source_id,
    relationship
  )
);
```

---

# 45. EVIDENCE LIBRARY RELEASES

Clinical target generation does not consume arbitrary latest rows.

Create coherent releases:

```sql
create table evidence.library_releases (
  id uuid primary key default gen_random_uuid(),

  version text not null unique,

  status text not null
    check (
      status in (
        'draft',
        'validation',
        'active',
        'superseded'
      )
    ),

  manifest_sha256 bytea,

  approved_by uuid
    references identity.clinicians(id),

  released_at timestamptz
);
```

---

# 46. RELEASE MEMBERSHIP

```sql
create table evidence.library_claims (
  library_release_id uuid not null
    references evidence.library_releases(id),

  claim_version_id uuid not null
    references evidence.claim_versions(id),

  primary key (
    library_release_id,
    claim_version_id
  )
);
```

Equivalent relationship tables exist for:

- circuit versions
- target-family versions.

A Target Slate references exactly one:

```text
evidence.library_release_id
```

---

# 47. SCIENTIFIC OBJECT IMMUTABILITY

Once a version is included in an:

```text
active
```

Evidence Library release:

its scientific payload becomes immutable.

Changes require a new version.

Example:

```text
EC-CONNECTIVITY-PERSONALISATION
v1.0
```

becomes:

```text
v1.1
```

Historical v1.0 remains intact.

---

# 48. TARGET RELIABILITY PROFILE

```sql
create type targeting.reliability_class as enum (
  'high',
  'moderate',
  'low',
  'unreliable'
);
```

```sql
create table targeting.reliability_profiles (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,
  case_id uuid not null references clinical.cases(id),

  imaging_study_id uuid not null
    references imaging.studies(id),

  connectome_run_id uuid not null
    references connectomics.processing_runs(id),

  qc_status text not null
    check (qc_status in ('pass', 'conditional', 'fail')),

  usable_rest_minutes numeric,

  mean_fd_mm numeric,
  censored_fraction numeric,

  cross_run_distance_mm numeric,
  split_half_distance_mm numeric,

  connectivity_reliability_metric numeric,
  connectivity_reliability_method text,

  reliability_class targeting.reliability_class not null,

  confidence_region jsonb,

  limiting_factors jsonb not null default '[]',

  interpretation text not null,

  pipeline_version_id uuid not null
    references system.pipeline_versions(id),

  created_at timestamptz not null default now()
);
```

Immutable once used by a published Target Slate.

---

# 49. TARGET ENGINE VERSION

```sql
create table system.target_engine_versions (
  id uuid primary key default gen_random_uuid(),

  semantic_version text not null unique,

  code_commit text not null,

  container_digest text,

  scientific_configuration jsonb not null,

  configuration_sha256 bytea not null,

  status system.lifecycle_status not null,

  validated_at timestamptz,
  released_at timestamptz
);
```

A production Target Slate may only reference:

```text
status = active
```

unless operating in an authorised validation/research context.

---

# 50. TARGET CANDIDATE

```sql
create type targeting.candidate_status as enum (
  'generated',
  'eligible',
  'ineligible',
  'suppressed',
  'research_only'
);
```

```sql
create type targeting.candidate_role as enum (
  'evidence_anchor',
  'symptom_circuit',
  'connectome_refinement',
  'network_alternative',
  'clinical_alternative',
  'research_hypothesis'
);
```

```sql
create table targeting.candidates (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,
  case_id uuid not null references clinical.cases(id),

  assessment_id uuid not null
    references clinical.assessments(id),

  phenotype_snapshot_id uuid not null
    references clinical.phenotype_snapshots(id),

  mode system.magniom_mode not null,

  generation_status targeting.candidate_status not null,

  candidate_role targeting.candidate_role not null,

  target_family_version_id uuid not null
    references evidence.target_family_versions(id),

  subject_target jsonb not null,
  standard_space_target jsonb,

  phenotype_fit jsonb not null,
  connectome_fit jsonb,
  normative_context jsonb,

  reliability_profile_id uuid
    references targeting.reliability_profiles(id),

  accessibility jsonb not null,
  efield_profile jsonb,

  counterfactual jsonb,
  convergence jsonb,

  uncertainty jsonb not null,

  nomination_rationale text not null,

  counterarguments jsonb not null,

  internal_ranking_features jsonb,

  target_engine_version_id uuid not null
    references system.target_engine_versions(id),

  evidence_library_release_id uuid not null
    references evidence.library_releases(id),

  created_at timestamptz not null default now()
);
```

---

# 51. COUNTERARGUMENT REQUIREMENT

Database constraint:

```sql
alter table targeting.candidates
add constraint candidate_counterarguments_required
check (
  jsonb_typeof(counterarguments) = 'array'
  and jsonb_array_length(counterarguments) >= 1
);
```

No Clinical Mode candidate may appear without:

# Why it may be wrong.

---

# 52. CONNECTOME REQUIREMENT

If candidate role is:

```text
connectome_refinement
```

then:

```sql
alter table targeting.candidates
add constraint connectome_candidate_requires_reliability
check (
  candidate_role <> 'connectome_refinement'
  or reliability_profile_id is not null
);
```

---

# 53. EVIDENCE LINKS

```sql
create table targeting.candidate_claims (
  target_candidate_id uuid not null
    references targeting.candidates(id),

  claim_version_id uuid not null
    references evidence.claim_versions(id),

  relationship text not null
    check (
      relationship in (
        'supporting',
        'conflicting'
      )
    ),

  primary key (
    target_candidate_id,
    claim_version_id,
    relationship
  )
);
```

---

# 54. TARGET SLATE

```sql
create type targeting.slate_status as enum (
  'draft',
  'generated',
  'ready_for_review',
  'reviewed',
  'superseded',
  'abstained'
);
```

```sql
create table targeting.slates (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,
  case_id uuid not null references clinical.cases(id),

  assessment_id uuid not null
    references clinical.assessments(id),

  phenotype_snapshot_id uuid not null
    references clinical.phenotype_snapshots(id),

  mode system.magniom_mode not null,

  status targeting.slate_status not null,

  target_engine_version_id uuid not null
    references system.target_engine_versions(id),

  evidence_library_release_id uuid not null
    references evidence.library_releases(id),

  connectome_run_id uuid
    references connectomics.processing_runs(id),

  normative_model_id uuid
    references system.normative_models(id),

  slate_convergence jsonb not null,
  clinical_coverage jsonb not null,

  counterfactual_summary jsonb,
  abstention jsonb,

  global_uncertainty jsonb not null,

  generation_summary text not null,

  scientific_limitations jsonb not null,

  generated_at timestamptz not null default now(),

  payload_sha256 bytea not null,

  supersedes_id uuid
    references targeting.slates(id)
);
```

---

# 55. SLATE MEMBERS

Do not store five foreign-key columns.

Use:

```sql
create type targeting.slate_position as enum (
  'primary_1',
  'primary_2',
  'primary_3',
  'additional_a',
  'additional_b'
);
```

```sql
create table targeting.slate_candidates (
  slate_id uuid not null
    references targeting.slates(id),

  target_candidate_id uuid not null
    references targeting.candidates(id),

  position targeting.slate_position not null,

  inclusion_reason text not null,

  redundancy_with uuid[],

  primary key (slate_id, position),

  unique (
    slate_id,
    target_candidate_id
  )
);
```

Maximum cardinality is inherently five because positions are unique.

---

# 56. SUPPRESSED CANDIDATES

```sql
create table targeting.suppressed_candidates (
  slate_id uuid not null
    references targeting.slates(id),

  target_candidate_id uuid not null
    references targeting.candidates(id),

  reason_code text not null,

  explanation text not null,

  primary key (
    slate_id,
    target_candidate_id
  )
);
```

Preserve candidates removed because of:

- evidence ceiling
- redundancy
- reliability
- poor accessibility
- Research Mode restriction.

---

# 57. CLINICIAN DECISION

```sql
create type targeting.decision_status as enum (
  'in_review',
  'completed',
  'deferred',
  'superseded'
);
```

```sql
create table targeting.clinician_decisions (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,

  case_id uuid not null
    references clinical.cases(id),

  target_slate_id uuid not null
    references targeting.slates(id),

  clinician_id uuid not null
    references identity.clinicians(id),

  decision_status targeting.decision_status
    not null default 'in_review',

  overall_reasoning text,

  magniom_influence text
    check (
      magniom_influence in (
        'none',
        'minor',
        'moderate',
        'major'
      )
    ),

  disagreement_with_magniom text,

  signed_at timestamptz,

  attestation_version text,

  attestation_text text,

  payload_sha256 bytea,

  created_at timestamptz not null default now(),

  supersedes_id uuid
    references targeting.clinician_decisions(id)
);
```

---

# 58. CANDIDATE DECISION

```sql
create type targeting.candidate_decision_type as enum (
  'accept',
  'reject',
  'modify',
  'replace',
  'defer'
);
```

```sql
create table targeting.candidate_decisions (
  id uuid primary key default gen_random_uuid(),

  clinician_decision_id uuid not null
    references targeting.clinician_decisions(id),

  target_candidate_id uuid not null
    references targeting.candidates(id),

  decision targeting.candidate_decision_type not null,

  reason_codes text[] not null,

  free_text_reason text,

  modified_target jsonb,

  replacement_candidate_id uuid
    references targeting.candidates(id),

  evidence_reviewed boolean not null default false,
  reliability_reviewed boolean not null default false,
  counterarguments_reviewed boolean not null default false,

  unique (
    clinician_decision_id,
    target_candidate_id
  )
);
```

---

# 59. FINAL TARGETS

```sql
create table targeting.final_targets (
  id uuid primary key default gen_random_uuid(),

  clinician_decision_id uuid not null
    references targeting.clinician_decisions(id),

  sequence_order integer,

  source text not null
    check (
      source in (
        'magniom_candidate',
        'clinician_defined',
        'standard_target'
      )
    ),

  source_candidate_id uuid
    references targeting.candidates(id),

  target_region jsonb not null,

  therapeutic_objectives jsonb not null,

  created_at timestamptz not null default now()
);
```

Target does not yet include:

- frequency
- dose
- iTBS/cTBS
- session schedule.

Those belong to the future Protocol specification.

---

# 60. IMMUTABLE TABLE CLASSES

Immediately immutable after insert:

- phenotype snapshots
- scientific version rows
- audit events
- completed processing manifests.

Immutable after publication:

- TargetCandidates attached to published slate
- published TargetSlate
- TargetReliabilityProfiles attached to published slate.

Immutable after signing:

- ClinicianDecision
- CandidateDecisions
- FinalTargets.

---

# 61. GENERIC IMMUTABILITY FUNCTION

For fully immutable tables:

```sql
create or replace function security.reject_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception
    'Immutable record cannot be modified';
end;
$$;
```

Example:

```sql
create trigger phenotype_snapshot_no_update
before update or delete
on clinical.phenotype_snapshots
for each row
execute function security.reject_mutation();
```

---

# 62. CONDITIONAL IMMUTABILITY

For Target Slates:

```sql
create or replace function targeting.guard_slate_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status in (
    'ready_for_review',
    'reviewed',
    'superseded',
    'abstained'
  ) then
    raise exception
      'Published Target Slate is immutable';
  end if;

  return new;
end;
$$;
```

Better still:

publish by inserting a new immutable row rather than extensively updating a mutable draft.

---

# 63. SIGNED DECISION GUARD

```sql
create or replace function targeting.guard_signed_decision()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.signed_at is not null then
    raise exception
      'Signed clinician decision is immutable';
  end if;

  return new;
end;
$$;
```

Apply to:

- clinician decision
- related candidate decisions
- final targets.

Child-table guards should check the parent's signed state.

---

# 64. RLS POLICY MODEL

Every patient-related table contains:

```text
organisation_id
```

where practical.

This intentionally duplicates organisation ownership along the aggregate to simplify:

- RLS
- auditing
- validation
- query performance.

Database constraints or insertion functions ensure consistency with parent case.

---

# 65. CASE READ POLICY

Example:

```sql
alter table clinical.cases enable row level security;

create policy case_read
on clinical.cases
for select
to authenticated
using (
  security.has_permission(
    organisation_id,
    'case.read'
  )
);
```

---

# 66. PATIENT READ POLICY

```sql
alter table clinical.patients enable row level security;

create policy patient_read
on clinical.patients
for select
to authenticated
using (
  security.has_permission(
    organisation_id,
    'case.read'
  )
);
```

If site restrictions apply:

```sql
and security.can_access_site(
  organisation_id,
  site_id
)
```

---

# 67. NO GENERIC CLINICAL WRITES

For high-risk clinical tables, do not grant:

```text
INSERT / UPDATE / DELETE
```

directly through the exposed API.

Example:

`targeting.clinician_decisions`

may have `SELECT` access but mutation only via:

# explicit signed domain function.

---

# 68. ROLE MATRIX

| Capability | TMS Specialist | Clinical Reviewer | Imaging Specialist | Researcher | Evidence Curator | Evidence Approver | Org Admin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Read clinical case | ✓ | ✓ | Limited | De-ID only | — | — | Not automatically |
| Edit phenotype | ✓ | ✓ | — | — | — | — | — |
| Approve phenotype | ✓ | configurable | — | — | — | — | — |
| Review MRI QC | ✓ | Read | ✓ | Research | — | — | — |
| View targets | ✓ | ✓ | Imaging detail | Research | — | — | — |
| Review target | ✓ | ✓ | — | — | — | — | — |
| Sign final target | **✓ authorised only** | — | — | — | — | — | — |
| Draft evidence | — | — | — | optional | ✓ | ✓ | — |
| Approve evidence | — | — | — | — | — | **✓** | — |
| User management | — | — | — | — | — | — | ✓ |

Organisation administrators do not automatically receive patient access.

Administrative authority and clinical-data access are separate.

---

# 69. TMS SIGNING AUTHORITY

Signing function must require:

```text
role = tms_specialist
```

and:

```text
identity.clinicians.tms_signing_authority = true
```

Do not derive signing authority only from a role label in the JWT.

---

# 70. RLS FOR TARGET CANDIDATES

```sql
alter table targeting.candidates
enable row level security;

create policy candidate_read
on targeting.candidates
for select
to authenticated
using (
  security.has_permission(
    organisation_id,
    'target.read'
  )
);
```

No ordinary client-side insert.

Target Engine writes through privileged server/workflow interface.

---

# 71. RESEARCH MODE RLS

Research users should not simply see Clinical Mode records because:

```text
mode = research
```

exists.

Research access occurs through:

- approved research dataset
- de-identified snapshot
- research project membership.

Clinical production tables remain protected.

---

# 72. RESEARCH PROJECT TABLE

```sql
create table identity.research_projects (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,

  name text not null,

  ethics_reference text,

  status text not null,

  created_at timestamptz not null default now()
);
```

Dataset grants are explicit.

---

# 73. STATE-TRANSITION FUNCTIONS

Clinically meaningful state changes use narrow functions.

Required initial functions:

```text
clinical.approve_phenotype
workflow.request_neurocompute
workflow.complete_neurocompute
targeting.request_target_generation
targeting.publish_target_slate
targeting.begin_clinician_review
targeting.save_candidate_review
targeting.sign_clinician_decision
targeting.supersede_decision
```

---

# 74. SECURITY DEFINER RULE

Default:

# `SECURITY INVOKER`

Use `SECURITY DEFINER` only where a transaction requires privileges the caller must not possess directly.

Every definer function must:

- `set search_path = ''`
- fully qualify all objects
- explicitly check user identity
- explicitly check permission
- restrict EXECUTE grants
- write an audit event.

---

# 75. APPROVE PHENOTYPE FUNCTION

Conceptually:

```sql
create or replace function api.approve_phenotype(
  p_case_id uuid,
  p_expected_case_version integer,
  p_schema_version text,
  p_payload jsonb,
  p_payload_sha256 bytea
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_case clinical.cases%rowtype;
  v_clinician_id uuid;
  v_snapshot_id uuid;
begin

  select *
  into v_case
  from clinical.cases
  where id = p_case_id
  for update;

  if v_case.version <> p_expected_case_version then
    raise exception 'STALE_CASE_VERSION';
  end if;

  if not security.has_permission(
    v_case.organisation_id,
    'phenotype.approve'
  ) then
    raise exception 'PERMISSION_DENIED';
  end if;

  select id
  into v_clinician_id
  from identity.clinicians
  where user_id = auth.uid()
    and organisation_id = v_case.organisation_id
    and active = true
  limit 1;

  if v_clinician_id is null then
    raise exception 'CLINICIAN_REQUIRED';
  end if;

  insert into clinical.phenotype_snapshots (
    organisation_id,
    case_id,
    schema_version,
    payload,
    payload_sha256,
    approved_by_clinician_id
  )
  values (
    v_case.organisation_id,
    p_case_id,
    p_schema_version,
    p_payload,
    p_payload_sha256,
    v_clinician_id
  )
  returning id into v_snapshot_id;

  update clinical.cases
  set
    state = 'phenotype_ready',
    version = version + 1
  where id = p_case_id;

  perform audit.append_domain_event(...);

  return v_snapshot_id;
end;
$$;
```

The actual migration must replace `...` with canonical audit fields.

---

# 76. TARGET GENERATION REQUEST

The request function:

1. checks Clinical Mode indication;
2. verifies active phenotype snapshot;
3. verifies permitted evidence release;
4. determines whether connectome is available;
5. creates `workflow.jobs`;
6. sends queue message;
7. updates case state;
8. writes audit event.

The browser never calls `pgmq.send()` directly.

---

# 77. SIGN CLINICIAN DECISION

This is among the highest-risk database operations.

It must:

1. lock clinician decision;
2. lock Target Slate;
3. confirm Slate is current;
4. ensure Slate is not superseded;
5. confirm clinician signing authority;
6. verify candidate reviews;
7. verify final target exists or explicit no-target decision exists;
8. verify attestation version;
9. generate immutable canonical payload;
10. hash payload;
11. write signed timestamp;
12. mark Target Slate reviewed;
13. move case to `decision_signed`;
14. append audit event;
15. emit outbox event.

All in:

# one PostgreSQL transaction.

---

# 78. STALE SLATE PROTECTION

Before signing:

```sql
if exists (
  select 1
  from targeting.slates newer
  where newer.case_id = v_slate.case_id
    and newer.generated_at > v_slate.generated_at
    and newer.status in (
      'ready_for_review',
      'reviewed'
    )
) then
  raise exception 'TARGET_SLATE_SUPERSEDED';
end if;
```

A more robust production implementation should maintain an explicit:

```text
clinical.cases.current_target_slate_id
```

or workflow aggregate reference.

---

# 79. CURRENT OBJECT REFERENCES

For efficient workflow, `clinical.cases` may include nullable references:

```sql
current_phenotype_snapshot_id uuid,
current_imaging_study_id uuid,
current_connectome_run_id uuid,
current_target_slate_id uuid,
current_clinician_decision_id uuid
```

These are navigation pointers.

They do not replace historical immutable records.

---

# 80. AUDIT ARCHITECTURE

Magniom uses semantic audit events rather than relying solely on database logging.

Core table:

```sql
create table audit.events (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,

  case_id uuid,

  actor_type text not null,
  actor_user_id uuid,
  actor_clinician_id uuid,
  actor_service text,

  event_type text not null,

  aggregate_type text not null,
  aggregate_id uuid not null,

  aggregate_sequence bigint not null,

  occurred_at timestamptz not null default now(),

  request_id uuid,
  correlation_id uuid,

  payload jsonb not null,

  previous_hash bytea,
  event_hash bytea not null,

  unique (
    aggregate_type,
    aggregate_id,
    aggregate_sequence
  )
);
```

---

# 81. AGGREGATE AUDIT HEAD

To hash-chain without global contention:

```sql
create table audit.aggregate_heads (
  aggregate_type text not null,
  aggregate_id uuid not null,

  last_sequence bigint not null default 0,
  last_hash bytea,

  primary key (
    aggregate_type,
    aggregate_id
  )
);
```

The chain is per clinical aggregate.

This avoids attempting a single globally serialized audit chain.

---

# 82. APPEND AUDIT EVENT

`audit.append_domain_event()`:

1. locks aggregate head;
2. increments sequence;
3. canonicalises event payload;
4. hashes:

```text
previous_hash
+
aggregate sequence
+
event type
+
canonical payload
```

5. inserts event;
6. updates head.

Only trusted command functions may execute it.

---

# 83. AUDIT EVENT HASH

Conceptually:

```text
SHA256(
  previous_hash ||
  aggregate_type ||
  aggregate_id ||
  sequence ||
  event_type ||
  occurred_at ||
  canonical_payload
)
```

This makes unauthorised alteration detectable.

It does not replace:

- backups
- access control
- PostgreSQL security.

---

# 84. AUDIT IMMUTABILITY

```sql
revoke update, delete
on audit.events
from public, anon, authenticated;
```

No application role gets ordinary mutation permission.

Apply trigger:

```sql
create trigger audit_event_no_mutation
before update or delete
on audit.events
for each row
execute function security.reject_mutation();
```

---

# 85. AUDIT TRIGGERS

Semantic domain functions create the main audit trail.

Additionally, install low-level mutation auditing on particularly sensitive configuration tables:

- role permissions
- clinicians/signing authority
- algorithm activation
- Evidence Library activation
- normative-model activation.

These record administrative configuration changes even outside ordinary clinical workflows.

---

# 86. ROW CHANGE AUDIT

A separate:

```text
audit.configuration_changes
```

may record:

- table
- primary key
- old row
- new row
- actor
- timestamp.

Do not put full patient clinical rows into generic configuration audit payloads unnecessarily.

---

# 87. OUTBOX TABLE

For reliable asynchronous side effects:

```sql
create table workflow.outbox (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid,

  aggregate_type text not null,
  aggregate_id uuid not null,

  event_type text not null,
  payload jsonb not null,

  created_at timestamptz not null default now(),

  published_at timestamptz,

  attempts integer not null default 0
);
```

Inserted within the same transaction as the clinical event.

---

# 88. WORKFLOW JOBS

```sql
create type workflow.job_status as enum (
  'queued',
  'claimed',
  'running',
  'succeeded',
  'failed_retryable',
  'failed_terminal',
  'cancelled',
  'superseded'
);
```

```sql
create table workflow.jobs (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,
  case_id uuid references clinical.cases(id),

  job_type text not null,

  status workflow.job_status not null default 'queued',

  idempotency_key text not null,

  input_reference jsonb not null,

  worker_id text,

  attempt_count integer not null default 0,

  max_attempts integer not null default 3,

  created_at timestamptz not null default now(),

  claimed_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,

  last_heartbeat_at timestamptz,

  error_code text,
  error_detail jsonb,

  unique (
    organisation_id,
    job_type,
    idempotency_key
  )
);
```

---

# 89. QUEUE DEFINITIONS

Use durable **basic** queues.

Create:

```sql
select pgmq.create('imaging_ingest');
select pgmq.create('neurocompute');
select pgmq.create('target_reliability');
select pgmq.create('efield');
select pgmq.create('target_generation');
select pgmq.create('report_generation');
select pgmq.create('outbox_dispatch');
```

Do not use unlogged queues for core clinical/scientific work.

---

# 90. QUEUE CONTRACT PRINCIPLE

A queue message contains:

# identifiers and versioned instructions

not patient PHI.

Canonical envelope:

```json
{
  "schema_version": "1.0",
  "job_id": "uuid",
  "organisation_id": "uuid",
  "case_id": "uuid",
  "correlation_id": "uuid",
  "requested_operation": "neurocompute",
  "created_at": "2026-09-01T09:00:00Z"
}
```

---

# 91. NEUROCOMPUTE MESSAGE

```json
{
  "schema_version": "1.0",
  "job_id": "uuid",
  "organisation_id": "uuid",
  "case_id": "uuid",
  "processing_run_id": "uuid",
  "pipeline_version_id": "uuid",
  "imaging_study_id": "uuid",
  "correlation_id": "uuid"
}
```

No:

- patient name
- DOB
- clinical narrative.

---

# 92. TARGET GENERATION MESSAGE

```json
{
  "schema_version": "1.0",
  "job_id": "uuid",
  "organisation_id": "uuid",
  "case_id": "uuid",
  "phenotype_snapshot_id": "uuid",
  "connectome_run_id": "uuid",
  "target_engine_version_id": "uuid",
  "evidence_library_release_id": "uuid",
  "correlation_id": "uuid"
}
```

---

# 93. QUEUE CONSUMPTION

Workers use:

```sql
pgmq.read(
  queue_name,
  visibility_timeout_seconds,
  quantity
)
```

or long-poll equivalent.

Do **not** use destructive `pop()` for scientific jobs.

Workflow:

```text
read
↓
claim workflow.jobs
↓
perform job
↓
commit scientific output
↓
mark workflow job succeeded
↓
archive queue message
```

If worker crashes:

message becomes visible after the visibility timeout.

---

# 94. QUEUE ARCHIVING

Successful messages:

```sql
select pgmq.archive(
  'neurocompute',
  p_message_id
);
```

This retains dispatch history.

Failed terminal jobs may also be archived after state has been persisted in `workflow.jobs`.

---

# 95. QUEUES ARE NOT THE SYSTEM OF RECORD

`workflow.jobs` is authoritative for job state.

PGMQ provides dispatch and durable delivery.

The scientific record remains:

- processing run
- artefacts
- manifests
- hashes.

---

# 96. IDEMPOTENCY KEY

Example NeuroCompute key:

```text
SHA256(
  imaging snapshot +
  pipeline version +
  atlas version +
  normative model version
)
```

Target generation:

```text
SHA256(
  phenotype snapshot +
  connectome run +
  target engine version +
  evidence library version +
  device context
)
```

Identical scientific request should reuse an existing successful result.

---

# 97. STORAGE BUCKETS

Create private buckets:

```text
clinical-ingest
clinical-derived
clinical-reports
evidence-assets
research-derived
```

No clinical bucket is public.

---

# 98. STORAGE PATH STANDARD

Clinical ingest:

```text
org/{organisation_id}/
case/{case_id}/
study/{imaging_study_id}/
artifact/{artifact_id}/
{filename}
```

Flattened example:

```text
org/6e.../
case/43.../
study/a9.../
artifact/71.../
dicom.zip
```

---

# 99. DERIVED STORAGE

Example:

```text
org/{org_id}/
case/{case_id}/
run/{processing_run_id}/
artifact/{artifact_id}/
preprocessed_bold.nii.gz
```

Target derived output:

```text
org/{org_id}/
case/{case_id}/
slate/{slate_id}/
candidate/{candidate_id}/
target_roi.func.gii
```

---

# 100. REPORT STORAGE

```text
org/{org_id}/
case/{case_id}/
decision/{decision_id}/
report/{artifact_id}/
magniom-target-review.pdf
```

Signed reports should reference:

- Decision ID
- Target Slate ID
- version manifest.

---

# 101. RESEARCH STORAGE

Research artefacts use:

```text
project/{research_project_id}/
dataset/{dataset_id}/
...
```

Do not mirror production clinical folder names containing direct patient identifiers.

---

# 102. STORAGE OBJECT ACCESS

Use RLS on:

```text
storage.objects
```

and ordinary Storage API operations.

Do not directly insert, update or delete Supabase's `storage` metadata tables using SQL application logic.

---

# 103. STORAGE PATH PARSER

Private helper:

```sql
create or replace function security.storage_org_id(
  p_name text
)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
declare
  parts text[];
begin
  parts := storage.foldername(p_name);

  if array_length(parts, 1) < 2
     or parts[1] <> 'org'
  then
    return null;
  end if;

  return parts[2]::uuid;
exception
  when others then
    return null;
end;
$$;
```

Equivalent case parser validates:

```text
parts[3] = 'case'
parts[4] = case UUID
```

---

# 104. CLINICAL STORAGE READ POLICY

Conceptual:

```sql
create policy clinical_storage_read
on storage.objects
for select
to authenticated
using (
  bucket_id in (
    'clinical-ingest',
    'clinical-derived',
    'clinical-reports'
  )
  and security.has_permission(
    security.storage_org_id(name),
    'case.read'
  )
);
```

For stricter security, also validate the case in the path belongs to the parsed organisation.

---

# 105. STORAGE UPLOAD POLICY

Do not allow arbitrary upload paths.

Upload session is first created by server.

The server determines:

- bucket
- organisation
- case
- artifact ID
- filename.

RLS verifies the organisation/case access.

User does not select their own organisation ID in an unconstrained path.

---

# 106. SIGNED URL POLICY

Use signed URLs only when necessary.

Preferred expiry:

# very short

for clinical artefacts.

Example:

```text
60–300 seconds
```

depending on viewer requirement.

Never persist signed URLs in:

- database
- reports
- logs.

Persist only:

- bucket
- object path
- artefact ID.

---

# 107. WORKER STORAGE ACCESS

Compute worker receives temporary access only to artefacts referenced by its assigned job.

It should not have a reusable browser-style URL permitting general bucket traversal.

---

# 108. HASH VERIFICATION

Every scientific artefact must be hashed after upload.

Before processing:

```text
expected SHA-256
=
observed SHA-256
```

If not:

```text
ARTIFACT_HASH_MISMATCH
```

and processing stops.

---

# 109. STORAGE DELETE POLICY

Clinical raw/derived artefacts should not be deletable from ordinary browser UI.

Deletion/archival requires:

- retention workflow
- policy check
- audit event
- appropriate Storage API operation.

Do not delete only the metadata row.

---

# 110. REALTIME SECURITY

Realtime is used only for UX notifications.

Examples:

```text
JOB_PROGRESS
QC_READY
TARGET_SLATE_READY
```

Do not broadcast:

- diagnosis
- patient name
- target coordinates

unless clinically justified and protected.

The receiving client reloads authoritative data through normal permission-controlled access.

---

# 111. CURRENT CASE VERSION FUNCTION

Provide narrow read helper:

```sql
api.get_case_workspace(p_case_id uuid)
```

returning a curated case workspace.

Prefer this to allowing the browser to independently join twenty clinical schemas.

---

# 112. API VIEWS

Example:

```sql
create view api.case_summaries
with (security_invoker = true)
as
select
  c.id,
  c.organisation_id,
  c.site_id,
  c.patient_id,
  c.state,
  c.mode,
  c.version,
  c.created_at
from clinical.cases c;
```

Any exposed view must use the appropriate invoker/RLS model.

---

# 113. DATABASE INDEXES

At minimum:

```sql
create index cases_org_idx
on clinical.cases(organisation_id);

create index cases_patient_idx
on clinical.cases(patient_id);

create index candidates_case_idx
on targeting.candidates(case_id);

create index slates_case_idx
on targeting.slates(case_id);

create index jobs_status_type_idx
on workflow.jobs(status, job_type);

create index artifacts_case_idx
on imaging.artifacts(case_id);

create index observations_case_concept_idx
on clinical.observations(case_id, concept_code);

create index audit_aggregate_idx
on audit.events(
  aggregate_type,
  aggregate_id,
  aggregate_sequence
);
```

RLS lookup columns must be indexed.

---

# 114. SOFT DELETE VS IMMUTABILITY

Do not add generic:

```text
deleted_at
```

to every table.

Use domain-specific states:

- archived
- superseded
- inactive.

Scientific and clinical history should generally be retained rather than silently hidden through generic soft deletion.

---

# 115. FOREIGN KEY DELETE POLICY

Use deletion semantics deliberately.

Examples:

Auth user:

```text
user profile → CASCADE
```

Clinician historical identity:

```text
user deleted → clinician.user_id SET NULL
```

Patient:

should generally not cascade-delete:

- Target Slates
- Decisions
- outcomes.

Clinical deletion/retention is a governed lifecycle.

---

# 116. CASE ORGANISATION CONSISTENCY

Because many child tables duplicate `organisation_id`, enforce consistency through:

- controlled insert functions
- composite foreign keys where practical
- verification triggers.

Example composite unique parent:

```sql
alter table clinical.cases
add constraint cases_org_id_unique
unique (organisation_id, id);
```

Then child:

```sql
foreign key (
  organisation_id,
  case_id
)
references clinical.cases (
  organisation_id,
  id
)
```

This is recommended for all critical case-bound tables.

---

# 117. CLINICAL MODE CONSTRAINT

Clinical Target Slate must not include Research-only candidate.

Create deferred constraint trigger that validates when Slate candidate is inserted:

```text
slate.mode = clinical
AND candidate.mode = research
→ reject
```

Also reject:

```text
candidate.generation_status = research_only
```

---

# 118. EVIDENCE CEILING CONSTRAINT

Target Engine must enforce evidence ceiling algorithmically.

Database should additionally validate:

Clinical Mode candidate cannot reference a TargetFamily version where:

```text
mode = research
```

or:

```text
evidence_tier in ('D', 'R')
```

unless future governance explicitly changes the allowed clinical threshold.

Do not bury allowed tiers in code only.

Create versioned scientific policy configuration.

---

# 119. SCIENTIFIC POLICY RELEASE

```sql
create table system.scientific_policy_releases (
  id uuid primary key default gen_random_uuid(),

  version text not null unique,

  configuration jsonb not null,
  configuration_sha256 bytea not null,

  status system.lifecycle_status not null,

  released_at timestamptz
);
```

May define:

```json
{
  "clinical_target_family_tiers": ["A", "B", "C"],
  "research_target_family_tiers": ["A", "B", "C", "D", "R"],
  "connectome_refinement_min_reliability": "moderate"
}
```

Target Slate stores the policy release used.

---

# 120. NO MAGIC PRODUCTION CONFIGURATION

Parameters such as:

- reliability thresholds
- spatial redundancy threshold
- minimum scan duration
- ranking weights
- evidence tiers

must never be ordinary editable rows changed from an admin dashboard.

They belong to:

# versioned scientific configuration releases.

---

# 121. REPRODUCIBILITY MANIFEST

Every Target Slate should reference or contain:

```json
{
  "target_engine": "1.0.0",
  "scientific_policy": "1.0.0",
  "evidence_library": "1.0.0",
  "neurocompute_pipeline": "1.0.0",
  "atlas": "HCP-MMP1.0",
  "normative_model": "1.0.0",
  "efield_engine": null
}
```

Hash this manifest.

---

# 122. DATABASE CONSTRAINT: TARGET SLATE HASH

Before a Target Slate becomes:

```text
ready_for_review
```

it must have:

```text
payload_sha256 IS NOT NULL
```

and all candidate references must exist.

---

# 123. DATABASE CONSTRAINT: SIGNING

Before decision can be signed:

```text
overall_reasoning IS NOT NULL
```

and:

```text
attestation_version IS NOT NULL
```

and:

```text
attestation_text IS NOT NULL
```

and either:

- ≥1 final target

or:

- explicit no-target reason in canonical decision representation.

---

# 124. NO-TARGET DECISION

Do not force a target simply to satisfy a schema requirement.

Add to decision:

```sql
no_target_selected boolean not null default false,
no_target_reason text
```

Constraint:

```text
no_target_selected = true
→ no final targets required

no_target_selected = false
→ at least one final target required at signing
```

Use signing function to enforce cross-table cardinality.

---

# 125. OUTCOME TABLE

```sql
create table outcomes.measurements (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,
  case_id uuid not null references clinical.cases(id),

  treatment_course_id uuid,

  concept_code text not null,

  instrument text,

  numeric_value numeric,
  text_value text,

  timepoint text,

  measured_at timestamptz not null,

  quality_state system.data_quality_state
    not null default 'reviewed',

  created_at timestamptz not null default now()
);
```

These data may later support validation.

They do not retrain Target Engine automatically.

---

# 126. TREATMENT COURSE

```sql
create table treatment.courses (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,
  case_id uuid not null references clinical.cases(id),

  clinician_decision_id uuid not null
    references targeting.clinician_decisions(id),

  started_at timestamptz,
  completed_at timestamptz,

  status text not null,

  created_at timestamptz not null default now()
);
```

Future Protocol Specification will expand this substantially.

---

# 127. ACTUAL TARGET DELIVERY

```sql
create table treatment.actual_targets (
  id uuid primary key default gen_random_uuid(),

  treatment_course_id uuid not null
    references treatment.courses(id),

  final_target_id uuid
    references targeting.final_targets(id),

  actual_target_region jsonb not null,

  device_id uuid,
  coil_id uuid,

  navigation_export_id uuid,

  created_at timestamptz not null default now()
);
```

This enables future comparison:

```text
recommended candidate
vs
clinician-selected target
vs
actually delivered target.
```

---

# 128. DATA ACCESS FROM WORKERS

Workers should not use an unrestricted browser credential.

Preferred order:

### Option A

Dedicated least-privilege Postgres worker role over secure server connection.

### Option B

Narrow server-to-server RPC/Edge Function interface.

### Avoid

General-purpose `service_role` access from every compute component.

Where `service_role` is operationally necessary, it must be isolated and audited because it can bypass normal RLS protections.

---

# 129. WORKER OPERATIONS

NeuroCompute needs only:

- read assigned job metadata
- create temporary artefact access
- write processing result
- register artefacts
- update its processing run
- heartbeat job.

It does **not** need:

- edit phenotype
- read clinical notes
- approve evidence
- sign target decision.

---

# 130. EVIDENCE CURATOR RLS

Draft evidence can be edited by:

```text
evidence_curator
```

Active Evidence Library release objects become immutable.

Only:

```text
evidence_approver
```

can execute:

```text
evidence.publish_library_release
```

through controlled function.

---

# 131. EVIDENCE APPROVAL SEPARATION

Prefer separate users for:

- authoring
- final approval

where governance requires it.

A future four-eyes rule may enforce:

```text
created_by <> approved_by
```

for Evidence Library releases.

Architecture supports this from v1.

---

# 132. ADMINISTRATOR BOUNDARY

Organisation admin may:

- invite users
- deactivate membership
- assign allowed application roles
- manage sites.

They may **not automatically**:

- read patient files
- view MRI
- inspect Target Slates.

This limits unnecessary privileged access.

---

# 133. LOGICAL DELETE OF USER

Disabling membership:

```text
identity.memberships.active = false
```

immediately removes RLS access.

Historical:

- audit events
- signed decisions
- clinician records

remain.

---

# 134. BREAK-GLASS ACCESS

If future clinical operations require emergency privileged access:

implement explicit:

# break-glass workflow

with:

- reason
- duration
- user
- patient/case scope
- audit event
- alert.

Do not create a hidden “super clinician” role.

---

# 135. DATABASE TESTING

Every RLS-protected resource requires automated:

### Allow tests

correct organisation + correct permission.

### Deny tests

wrong organisation.

### Deny tests

correct organisation + insufficient role.

### Deny tests

unauthenticated.

### Deny tests

inactive membership.

### Deny tests

researcher against production PHI.

### Deny tests

organisation administrator without clinical permission.

---

# 136. SUPABASE TEST STRUCTURE

Recommended:

```text
supabase/tests/
  identity_rls.sql
  clinical_rls.sql
  imaging_rls.sql
  targeting_rls.sql
  evidence_rls.sql
  storage_rls.sql
  workflow_security.sql
  immutability.sql
  decision_signing.sql
  evidence_release.sql
```

Run:

```text
supabase test db
```

in CI.

---

# 137. SECURITY REGRESSION TEST

Every migration changing:

- grants
- RLS
- functions
- exposed schemas
- Storage policies

must cause security test suite execution.

A migration is not production-ready simply because it applies successfully.

---

# 138. STORAGE RLS TESTS

Test attempts to access:

```text
org A / case A
```

as:

```text
user org A
```

→ allowed where permission exists.

Then:

```text
user org B
```

→ denied.

Also test malicious paths:

```text
org/{orgA}/case/{caseB}/...
```

The path parser must check both organisation and case ownership.

---

# 139. SECURITY DEFINER TESTS

Every `SECURITY DEFINER` function receives:

- permission test
- cross-organisation denial test
- stale-version test
- malformed input test.

Definer functions are explicitly reviewed because they can bypass ordinary caller privileges.

---

# 140. IMMUTABILITY TESTS

Automated tests attempt:

```text
UPDATE signed decision
DELETE signed decision
UPDATE phenotype snapshot
UPDATE active Evidence Claim version
UPDATE published Target Slate
```

All must fail.

---

# 141. TARGET SLATE SCIENTIFIC TESTS

Database-level validation tests include:

### Five-position maximum.

### Research candidate cannot enter Clinical Slate.

### Connectome-refinement candidate requires reliability profile.

### Candidate requires counterargument.

### Published Slate requires version manifest/hash.

### Signed decision cannot reference superseded Slate.

---

# 142. REQUEST / CORRELATION CONTEXT

At application entry create:

```text
request_id
```

For long workflows create:

```text
correlation_id
```

Carry them into:

- workflow jobs
- audit events
- logs
- compute manifests.

Do not use patient names for tracing.

---

# 143. DATABASE ERROR CODES

Functions should return stable machine-readable codes.

Examples:

```text
MAGN-SEC-001 PERMISSION_DENIED
MAGN-CASE-001 STALE_CASE_VERSION
MAGN-IMG-001 IMAGING_QC_FAILED
MAGN-TGT-001 TARGET_SLATE_SUPERSEDED
MAGN-TGT-002 RESEARCH_TARGET_NOT_PERMITTED
MAGN-TGT-003 TARGET_RELIABILITY_TOO_LOW
MAGN-DEC-001 CLINICIAN_SIGNING_AUTHORITY_REQUIRED
MAGN-DEC-002 DECISION_ALREADY_SIGNED
MAGN-EVD-001 EVIDENCE_RELEASE_NOT_ACTIVE
```

Do not expose raw internal database exceptions unnecessarily.

---

# 144. TRANSACTION ISOLATION

Critical operations requiring state consistency should use:

- row locks
- optimistic versions
- transaction boundaries.

Examples:

- approve phenotype
- publish Target Slate
- sign decision
- activate Evidence Library.

Do not rely on multiple independent HTTP calls to create a clinically coherent transaction.

---

# 145. TARGET SLATE PUBLICATION TRANSACTION

Publication must atomically:

1. verify engine/scientific versions;
2. insert immutable candidates;
3. insert suppressed candidates;
4. insert Slate;
5. add Slate members;
6. calculate/verify canonical payload hash;
7. mark Slate `ready_for_review`;
8. update case current Slate;
9. increment case version;
10. append audit event;
11. insert outbox event.

Failure anywhere:

# rollback all.

---

# 146. EVIDENCE RELEASE TRANSACTION

Publishing Evidence Library:

1. validate every claim version;
2. validate every circuit version;
3. validate every TargetFamily version;
4. ensure no prohibited Clinical Mode relationships;
5. construct release manifest;
6. hash manifest;
7. record approver;
8. mark release active;
9. supersede prior active release if applicable;
10. audit.

Never partially activate scientific evidence.

---

# 147. SCIENTIFIC RELEASE PINNING

A case does not automatically migrate to a newer Evidence Library halfway through review.

Once Target Slate generated:

it remains pinned to:

```text
Evidence Library X
```

New evidence requires:

- new Target Slate generation
- explicit supersession.

---

# 148. DATABASE BACKUP PRIORITIES

Highest integrity priority:

1. signed clinician decisions
2. final target selections
3. audit events
4. scientific version manifests
5. Target Slates
6. clinical snapshots
7. outcome data
8. artefact metadata.

Binary Storage requires a separate durability/restore strategy.

---

# 149. STORAGE BACKUP PRINCIPLE

PostgreSQL backup alone does not recreate MRI objects.

Maintain independent controls for:

- object durability
- artefact hashes
- restore testing
- source/derived classification.

Raw imaging may be reproducible only if source data remain retained.

---

# 150. SECURITY MONITORING

Monitor:

- repeated RLS denials
- cross-organisation access attempts
- failed signing attempts
- use of privileged worker functions
- changes in signing authority
- evidence release changes
- scientific-policy activation
- Storage anomalies
- unusual report downloads.

---

# 151. HIGH-RISK ADMIN EVENTS

Immediately audit:

```text
TMS_SIGNING_AUTHORITY_GRANTED
TMS_SIGNING_AUTHORITY_REVOKED

ROLE_GRANTED
ROLE_REVOKED

EVIDENCE_LIBRARY_ACTIVATED

TARGET_ENGINE_ACTIVATED

NORMATIVE_MODEL_ACTIVATED

SCIENTIFIC_POLICY_ACTIVATED

BREAK_GLASS_ACCESS_GRANTED
```

---

# 152. APPLICATION DATABASE CLIENTS

Use separate Supabase clients:

### Browser client

Authenticated user's JWT.

Limited Data API access.

### Next.js server user client

User JWT preserved; RLS applies.

### Next.js privileged client

Only for narrow server operations where necessary.

Never forwarded to browser.

### Worker client

Dedicated machine path.

### Migration/admin client

Deployment-only privileges.

Do not casually reuse one privileged client everywhere.

---

# 153. RLS FIRST, PRIVILEGED CLIENT SECOND

If a server query can safely execute under the authenticated user's RLS identity:

prefer that.

Privileged service access should be reserved for:

- background processing
- transactional domain functions
- scientific publication
- administrative operations.

---

# 154. DATA CLASSIFICATION

Every table/artefact should be classified:

### Restricted clinical

Patient identity, MRI, Target Slates, decisions.

### Clinical operational

Case IDs, workflow state.

### Scientific internal

Evidence Library, algorithms, normative models.

### Research restricted

Approved de-identified research data.

### Public scientific

Public evidence summaries where deliberately published.

This classification should inform:

- access
- logs
- backups
- exports.

---

# 155. PHI IN JSONB

Avoid placing large uncontrolled clinical notes into arbitrary JSONB fields.

Canonical JSON payloads should have schemas.

Free text should be:

- purpose-specific
- limited
- protected
- never sent to compute workers unnecessarily.

---

# 156. SEARCH

Patient search should operate through a purpose-built API function.

Do not expose unrestricted:

```text
ILIKE '%...%'
```

over clinical patient tables.

Search response contains minimal identifying information needed to locate a case.

---

# 157. EXPORTS

Every clinical export records:

```text
who
what
when
case
format
purpose where appropriate
```

Reports receive immutable artefact IDs.

Bulk exports require elevated permission and audit.

---

# 158. RESEARCH EXTRACTION

Production clinical users cannot simply run arbitrary SQL exports for research.

Research pipeline:

```text
Approved research project
      ↓
dataset specification
      ↓
authorised extraction
      ↓
de-identification
      ↓
immutable dataset snapshot
      ↓
research Storage
```

---

# 159. NO SELF-LEARNING DATABASE TRIGGER

There must never be a trigger such as:

```text
after outcome insert
update target ranking weights
```

Outcome data are research inputs.

Scientific algorithms change only through controlled releases.

---

# 160. SCHEMA MIGRATION ORDER

Initial implementation migrations:

```text
001_extensions.sql
002_schemas.sql
003_system_types.sql
004_identity.sql
005_permissions.sql
006_security_helpers.sql
007_clinical.sql
008_imaging.sql
009_connectomics.sql
010_evidence.sql
011_targeting.sql
012_treatment_outcomes.sql
013_workflow.sql
014_audit.sql
015_rls.sql
016_storage_policies.sql
017_queues.sql
018_domain_functions.sql
019_immutability.sql
020_seed_permissions.sql
021_security_tests.sql
```

Do not create everything manually in the Dashboard.

---

# 161. MVP DATABASE SUBSET

For the first synthetic-data prototype, implement fully:

### Identity
- organisations
- memberships
- clinicians

### Clinical
- patients
- cases
- assessments
- observations
- phenotype snapshots

### Evidence
- source
- claim versions
- circuit versions
- TargetFamily versions
- Evidence Library release

### Targeting
- TargetCandidates
- ReliabilityProfiles
- TargetSlates
- ClinicianDecisions
- FinalTargets

### Workflow
- jobs
- outbox

### Audit
- events.

Imaging detail can initially enter through synthetic/precomputed manifests.

---

# 162. SECOND DATABASE MILESTONE

Add:

- imaging studies
- artefact registry
- Storage
- processing runs
- QC
- real surfaces/connectome inputs.

---

# 163. THIRD DATABASE MILESTONE

Add:

- full native connectomics
- normative model
- circuit metric tables
- reliability computation
- Queue worker integration.

---

# 164. FOURTH DATABASE MILESTONE

Add:

- E-field
- actual treatment
- neuronavigation export
- outcome research datasets.

---

# 165. MAGNIOM DATABASE INVARIANTS

The database must enforce, directly or through narrowly controlled transactional functions:

# A clinical case belongs to exactly one organisation.

# Cross-organisation access is denied.

# Clinical Target Slates cannot contain Research-only candidates.

# Published scientific object versions do not mutate.

# Phenotype snapshots do not mutate.

# Published Target Slates do not mutate.

# Signed clinician decisions do not mutate.

# A signed decision must identify an authorised clinician.

# A signed decision must reference a current Target Slate.

# Connectome-derived clinical candidates require reliability data.

# Target candidates must include counterarguments.

# Queue messages do not contain unnecessary PHI.

# Scientific computation is version-pinned.

# Evidence is version-pinned.

# Every signed clinical decision remains reconstructable.

---

# 166. SECURITY INVARIANTS

# `anon` has no clinical-data access.

# `authenticated` receives no blanket table access.

# RLS applies to every exposed patient-related relation.

# Admin status does not automatically imply clinical access.

# Service credentials never enter browser code.

# Storage is private.

# Signed URLs are temporary.

# Privileged functions have explicit EXECUTE grants.

# `SECURITY DEFINER` functions use a fixed/empty search path.

# Audit events cannot be updated or deleted by application users.

# Signed decisions are immutable.

---

# 167. SCIENTIFIC INVARIANTS

Database structure must preserve:

# Evidence constrains.

Through:

`EvidenceClaim`  
`TherapeuticCircuit`  
`TargetFamily`  
`Evidence Library Release`

↓

# Phenotype prioritises.

Through:

`PhenotypeSnapshot`

↓

# Connectomics refines.

Through:

`ConnectomeRun`  
`connectome_fit`

↓

# Reliability qualifies.

Through:

`TargetReliabilityProfile`

↓

# Anatomy constrains.

Through:

`TargetCandidate.accessibility`

↓

# E-field optimises.

Through:

`EFieldProfile`

↓

# Alternatives expose uncertainty.

Through:

`TargetSlate`  
`suppressed_candidates`

↓

# Specialist decides.

Through:

`ClinicianDecision`  
`FinalTarget`

---

# 168. CANONICAL DATABASE FLOW

```text
Auth User
   ↓
Organisation Membership
   ↓
Clinical Case
   ↓
Assessment
   ↓
Phenotype Snapshot ───────────────┐
                                  │
MRI Study                         │
   ↓                              │
Processing Run                    │
   ↓                              │
Connectome                        │
   ↓                              │
Reliability Profile ──────────────┤
                                  │
Evidence Library Release ─────────┤
                                  ▼
                           Target Engine
                                  ↓
                       Target Candidates
                         ↙            ↘
                 Included          Suppressed
                     ↓
                 Target Slate
                     ↓
              Clinician Review
                     ↓
             Clinician Decision
                     ↓
                Final Target
                     ↓
              Treatment Course
                     ↓
                  Outcomes
```

All major transitions generate:

```text
Audit Event
```

and where asynchronous work follows:

```text
Outbox / Queue Event.
```

---

# 169. WHY THIS SUPABASE DESIGN IS APPROPRIATE

Magniom does not require a distributed database architecture.

It requires:

# strong relational integrity.

PostgreSQL is unusually well suited because the system consists primarily of:

- linked scientific concepts
- immutable versions
- clinical workflow
- permissions
- provenance
- state transitions
- audit relationships.

Supabase adds useful managed infrastructure around that core:

- Auth
- RLS-aware Data API
- private Storage
- Realtime
- durable queues.

The scientific compute plane remains separate.

---

# 170. WHAT MUST NEVER HAPPEN

The implementation must make these errors structurally difficult:

> A frontend developer can update a signed target.

> An organisation administrator can browse MRI merely because they administer users.

> A Research target accidentally becomes Primary 1.

> The latest evidence silently changes an existing patient's Target Slate.

> An MRI processing update silently moves a historic target.

> A failed fMRI scan still produces a high-confidence personalised target.

> A queue worker obtains every patient's identity.

> A service-role key reaches the browser.

> A signed URL is treated as a permanent file URL.

> A deleted Auth account destroys historical clinician attribution.

> Target-ranking coefficients are changed from an admin dashboard.

> A patient outcome automatically retrains the ranking engine.

> A database migration edits historical scientific truth.

---

# 171. IMPLEMENTATION STANDARD

Every production migration should answer:

### Security

What new data becomes accessible?

### Clinical integrity

Can this alter a signed decision?

### Scientific integrity

Does this change target-generation semantics?

### Provenance

Can historical cases still be reconstructed?

### RLS

Which allow/deny tests accompany this migration?

### Versioning

Does this require:

- database version
- algorithm version
- Evidence Library version
- scientific-policy version?

If these questions are unanswered:

# the migration is incomplete.

---

# 172. FINAL DATABASE PRINCIPLE

Magniom's Supabase backend should not behave like a CRUD application database.

It should behave like:

# a versioned clinical-scientific record.

Supabase Auth establishes identity.

PostgreSQL establishes truth.

RLS establishes boundaries.

Scientific releases establish what the algorithm was permitted to know.

Snapshots establish what the algorithm actually saw.

TargetCandidates preserve computational reasoning.

TargetSlates preserve competing hypotheses.

ClinicianDecisions preserve human authority.

Audit events preserve history.

Storage preserves scientific artefacts.

Queues coordinate computation without becoming the record.

That is the Magniom Supabase Database & Security Specification v1.0.