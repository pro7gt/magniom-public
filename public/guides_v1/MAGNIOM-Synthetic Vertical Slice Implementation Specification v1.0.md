# MAGNIOM
## Synthetic Vertical Slice Implementation Specification v1.0

**Document status:** Canonical first-build specification  
**Date:** 1 September 2026  
**Build identifier:** `MAGNIOM-VSLICE-0.1.0`  
**Target Engine:** `MAGNIOM-TARGET-ENGINE-0.1.0-SYNTHETIC`  
**Scientific Policy:** `MAGNIOM-POLICY-0.1.0-SYNTHETIC`  
**Evidence release:** `MAGNIOM-EVIDENCE-DEV-1.0.0`  
**Phenotype ontology:** `MAGNIOM-PHENOTYPE-1.0.0`  
**Deployment status:** Synthetic / engineering validation only  
**Clinical use:** Prohibited

---

# 1. PURPOSE

The Synthetic Vertical Slice is the first executable implementation of Magniom.

Its purpose is to prove that the entire clinical reasoning chain can function coherently before native neuroimaging processing is introduced:

```text
Synthetic patient
      ↓
Clinical assessment
      ↓
Phenotype formulation
      ↓
Clinician approval
      ↓
Pinned Evidence Library
      ↓
Synthetic connectome measurements
      ↓
Deterministic Target Engine
      ↓
Candidate generation
      ↓
Evidence ceiling
      ↓
Personalisation adoption
      ↓
Redundancy suppression
      ↓
Target Slate
      ↓
Evidence / uncertainty review
      ↓
Clinician decision
      ↓
Override / reject / defer
      ↓
Immutable sign-off
      ↓
Audit trail
```

The slice is successful when this entire chain works correctly for five canonical synthetic cases.

It is not successful merely because a web interface renders.

---

# 2. FUNDAMENTAL FIRST-BUILD RULE

The first build must contain:

# real clinical semantics

# real Target Engine semantics

# real Evidence Graph semantics

# real database immutability

# real RLS

# real clinician decision semantics

# real CI verification

but:

# synthetic patients

# synthetic connectome measurements

# no treatment use.

---

# 3. WHAT SLICE 1 EXCLUDES

The following are explicitly deferred:

- DICOM ingestion;
- BIDS;
- fMRIPrep;
- FreeSurfer;
- tedana;
- native resting-state FC;
- HCP-MMP processing;
- normative modelling;
- E-field modelling;
- neuronavigation export;
- real clinical patient data;
- real research participant data;
- full 3D cortical viewer;
- TMS protocol recommendation;
- outcome prediction;
- treatment scheduling;
- multi-indication support;
- Clinical Mode activation.

These become subsequent slices.

---

# 4. WHAT SLICE 1 MUST PROVE

The implementation must prove:

1. A clinician can create a case.

2. A clinician can formulate a phenotype.

3. A phenotype cannot drive targeting before approval.

4. Evidence objects are version-pinned.

5. Research-only evidence cannot enter a Clinical-style target slate.

6. The Target Engine is deterministic.

7. A patient-specific refinement must pass the personalisation adoption gate.

8. High connectivity cannot overcome low reliability.

9. The evidence-only target is always reconstructable.

10. An anxiosomatic target can appear as a distinct Primary 2 when clinically appropriate.

11. The engine may return fewer than five targets.

12. Candidates may be suppressed rather than deleted.

13. The clinician can reject Primary 1.

14. The clinician can choose no target.

15. The clinician's final decision is distinct from the Target Slate.

16. Signed decisions become immutable.

17. Historical outputs remain versioned.

18. All meaningful transitions are auditable.

19. Cross-organisation data access is denied.

20. The entire implementation passes CI from an empty database.

---

# 5. TECHNOLOGY BASELINE

Use:

### Web

Next.js `16.3.3`

App Router.

TypeScript strict mode.

Next.js 16.x is the current Active LTS line, and `16.3.3` is the August 2026 security-patched release.

### Database / Auth

Supabase.

PostgreSQL.

Supabase Auth.

RLS.

pgTAP.

Supabase CLI supports local database testing with `supabase test db`, while Supabase Branching provides isolated schema/data environments suitable for PR previews.

### Package manager

`pnpm`

### Monorepo

Turborepo.

### Runtime validation

Zod.

### TypeScript testing

Vitest.

### Property testing

fast-check.

### Browser testing

Playwright.

### CI

GitHub Actions.

### Container tooling

Docker / BuildKit.

---

# 6. VERSION POLICY FOR THE SLICE

The repository commits:

```text
pnpm-lock.yaml
```

All JavaScript dependencies are locked.

Supabase CLI is installed as a project dependency.

No:

```text
latest
```

scientific dependency is permitted.

The first slice does not yet need a Clinical Release attestation workflow, but the repository structure must permit one without restructuring.

---

# 7. MONOREPO

Create exactly:

```text
magniom/
│
├── apps/
│   └── web/
│       ├── app/
│       ├── components/
│       ├── features/
│       ├── lib/
│       ├── public/
│       ├── tests/
│       ├── package.json
│       └── next.config.ts
│
├── packages/
│   ├── domain/
│   ├── schemas/
│   ├── evidence/
│   ├── phenotype/
│   ├── scientific-policy/
│   ├── target-engine/
│   ├── presentation/
│   ├── ui/
│   └── test-fixtures/
│
├── supabase/
│   ├── migrations/
│   ├── seed/
│   │   ├── reference.sql
│   │   └── synthetic.sql
│   ├── tests/
│   │   └── database/
│   └── config.toml
│
├── validation/
│   └── golden-cases/
│       ├── G01/
│       ├── G02/
│       ├── G03/
│       ├── G04/
│       └── G05/
│
├── scientific-config/
│   └── synthetic-0.1.0/
│       └── target-policy.json
│
├── docs/
│
├── .github/
│   └── workflows/
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
└── README.md
```

---

# 8. PACKAGE OWNERSHIP

## `@magniom/domain`

Pure canonical TypeScript domain objects.

No:

- Supabase;
- React;
- Next.js.

---

## `@magniom/schemas`

Runtime Zod validation.

Canonical wire/data schemas.

---

## `@magniom/evidence`

Loads and traverses versioned Evidence Library bundles.

---

## `@magniom/phenotype`

Transforms approved phenotype objects into Target Engine phenotype input.

---

## `@magniom/scientific-policy`

Loads frozen policy configuration.

---

## `@magniom/target-engine`

Pure deterministic target-generation logic.

No database access.

No current time.

No network.

No React.

---

## `@magniom/presentation`

Turns canonical domain objects into view models.

No scientific recalculation.

---

## `@magniom/ui`

Generic UI primitives.

---

## `@magniom/test-fixtures`

Synthetic objects shared by:

- Vitest;
- Playwright;
- database integration tests.

---

# 9. ROOT PACKAGE SCRIPTS

Canonical `package.json` scripts:

```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test",

    "test:golden": "pnpm --filter @magniom/target-engine test:golden",
    "test:e2e": "pnpm --filter @magniom/web test:e2e",

    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:reset": "supabase db reset",
    "supabase:test": "supabase test db",
    "supabase:lint": "supabase db lint",

    "verify": "pnpm lint && pnpm typecheck && pnpm test",
    "verify:vertical-slice": "pnpm verify && pnpm supabase:reset && pnpm supabase:test && pnpm test:golden && pnpm build"
  }
}
```

---

# 10. TURBO PIPELINE

`turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

---

# 11. DATABASE SCHEMA

The first slice uses these PostgreSQL schemas:

```text
core
clinical
evidence
targeting
audit
app_private
```

`app_private` is never exposed through PostgREST.

---

# 12. MIGRATION SET

Create:

```text
supabase/migrations/
├── 202609010001_extensions_and_schemas.sql
├── 202609010002_identity.sql
├── 202609010003_clinical_cases.sql
├── 202609010004_phenotype.sql
├── 202609010005_evidence.sql
├── 202609010006_targeting.sql
├── 202609010007_decisions_and_audit.sql
├── 202609010008_state_functions.sql
├── 202609010009_rls.sql
└── 202609010010_api_views.sql
```

---

# 13. MIGRATION 001 — EXTENSIONS, SCHEMAS, TYPES

```sql
create extension if not exists pgcrypto;

create schema if not exists core;
create schema if not exists clinical;
create schema if not exists evidence;
create schema if not exists targeting;
create schema if not exists audit;
create schema if not exists app_private;

create type core.membership_role as enum (
  'tms_specialist',
  'clinical_reviewer',
  'imaging_specialist',
  'evidence_reviewer',
  'organisation_admin'
);

create type clinical.case_state as enum (
  'draft',
  'phenotype_ready',
  'phenotype_approved',
  'target_slate_ready',
  'decision_draft',
  'decision_signed',
  'deferred'
);

create type clinical.snapshot_state as enum (
  'draft',
  'approved',
  'superseded'
);

create type evidence.evidence_tier as enum (
  'A',
  'B',
  'C',
  'D',
  'R'
);

create type evidence.library_mode as enum (
  'development',
  'research',
  'clinical'
);

create type targeting.reliability_class as enum (
  'high',
  'moderate',
  'low',
  'unreliable',
  'not_applicable'
);

create type targeting.target_role as enum (
  'primary_1',
  'primary_2',
  'primary_3',
  'additional_a',
  'additional_b'
);

create type targeting.candidate_class as enum (
  'evidence_baseline',
  'connectome_refinement',
  'symptom_circuit',
  'alternative',
  'research'
);

create type targeting.slate_state as enum (
  'published',
  'superseded'
);

create type targeting.decision_state as enum (
  'draft',
  'signed',
  'superseded'
);

create type targeting.decision_action as enum (
  'accept',
  'reject',
  'modify',
  'replace',
  'defer'
);

create type targeting.magniom_influence as enum (
  'none',
  'minor',
  'moderate',
  'major'
);
```

---

# 14. MIGRATION 002 — IDENTITY

```sql
create table core.organisations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table core.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table core.memberships (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references core.organisations(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  role core.membership_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),

  unique (organisation_id, user_id, role)
);

create index memberships_user_idx
  on core.memberships(user_id)
  where active;

create index memberships_org_idx
  on core.memberships(organisation_id)
  where active;
```

Private authorization functions:

```sql
create or replace function app_private.has_org_access(
  p_org_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, core
as $$
  select exists (
    select 1
    from core.memberships m
    where m.organisation_id = p_org_id
      and m.user_id = auth.uid()
      and m.active
  );
$$;

create or replace function app_private.has_org_role(
  p_org_id uuid,
  p_roles core.membership_role[]
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, core
as $$
  select exists (
    select 1
    from core.memberships m
    where m.organisation_id = p_org_id
      and m.user_id = auth.uid()
      and m.active
      and m.role = any(p_roles)
  );
$$;
```

---

# 15. MIGRATION 003 — PATIENTS AND CASES

```sql
create table clinical.patients (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references core.organisations(id),
  display_label text not null,
  synthetic boolean not null default false,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table clinical.cases (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references core.organisations(id),
  patient_id uuid not null references clinical.patients(id),
  case_code text not null,
  primary_condition_code text not null,
  state clinical.case_state not null default 'draft',

  current_phenotype_snapshot_id uuid,
  current_target_slate_id uuid,

  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (organisation_id, case_code)
);

create index cases_org_idx
  on clinical.cases(organisation_id);

create index cases_patient_idx
  on clinical.cases(patient_id);
```

---

# 16. MIGRATION 004 — PHENOTYPE

```sql
create table clinical.phenotype_snapshots (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null references core.organisations(id),
  case_id uuid not null references clinical.cases(id),

  version integer not null check (version > 0),

  state clinical.snapshot_state not null default 'draft',

  schema_version text not null,
  ontology_version text not null,
  evidence_library_version text not null,

  payload jsonb not null,

  payload_sha256 text
    generated always as (
      encode(digest(payload::text, 'sha256'), 'hex')
    ) stored,

  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),

  approved_by uuid references auth.users(id),
  approved_at timestamptz,

  supersedes_id uuid references clinical.phenotype_snapshots(id),

  unique (case_id, version)
);

alter table clinical.cases
  add constraint cases_current_phenotype_fk
  foreign key (current_phenotype_snapshot_id)
  references clinical.phenotype_snapshots(id);
```

Protect approved payload:

```sql
create or replace function app_private.protect_phenotype_snapshot()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if old.state in ('approved', 'superseded') then
    if new.payload is distinct from old.payload
       or new.schema_version is distinct from old.schema_version
       or new.ontology_version is distinct from old.ontology_version
       or new.evidence_library_version is distinct from old.evidence_library_version
       or new.case_id is distinct from old.case_id then
      raise exception 'approved phenotype snapshot is immutable';
    end if;
  end if;

  if old.state = 'superseded' and new.state <> old.state then
    raise exception 'superseded phenotype snapshot cannot transition';
  end if;

  return new;
end;
$$;

create trigger phenotype_snapshot_immutability
before update on clinical.phenotype_snapshots
for each row execute function app_private.protect_phenotype_snapshot();
```

---

# 17. MIGRATION 005 — EVIDENCE LIBRARY

```sql
create table evidence.library_releases (
  id uuid primary key default gen_random_uuid(),

  code text not null unique,
  version text not null,
  mode evidence.library_mode not null,

  active boolean not null default false,
  clinical_eligible boolean not null default false,

  manifest jsonb not null,

  manifest_sha256 text
    generated always as (
      encode(digest(manifest::text, 'sha256'), 'hex')
    ) stored,

  created_at timestamptz not null default now()
);

create table evidence.sources (
  id uuid primary key,
  code text not null unique,
  title text not null,
  year integer,
  source_type text not null,
  pmid text,
  doi text,
  metadata jsonb not null default '{}'::jsonb
);

create table evidence.claims (
  id uuid primary key,
  code text not null unique,
  statement text not null,

  claim_type text not null,
  evidence_tier evidence.evidence_tier not null,
  mode evidence.library_mode not null,

  status text not null check (
    status in ('draft', 'approved', 'rejected', 'deprecated')
  ),

  limitations jsonb not null default '[]'::jsonb
);

create table evidence.circuits (
  id uuid primary key,
  code text not null unique,
  name text not null,
  evidence_tier evidence.evidence_tier not null,
  mode evidence.library_mode not null,
  description text not null
);

create table evidence.target_families (
  id uuid primary key,
  code text not null unique,
  name text not null,
  laterality text,
  evidence_tier evidence.evidence_tier not null,
  mode evidence.library_mode not null,
  description text not null
);

create table evidence.claim_sources (
  claim_id uuid not null references evidence.claims(id),
  source_id uuid not null references evidence.sources(id),

  relationship text not null check (
    relationship in ('supports', 'conflicts', 'limits')
  ),

  primary key (claim_id, source_id, relationship)
);

create table evidence.circuit_claims (
  circuit_id uuid not null references evidence.circuits(id),
  claim_id uuid not null references evidence.claims(id),
  primary key (circuit_id, claim_id)
);

create table evidence.target_family_circuits (
  target_family_id uuid not null references evidence.target_families(id),
  circuit_id uuid not null references evidence.circuits(id),

  relationship text not null check (
    relationship in (
      'belongs_to',
      'refines',
      'overlaps_with',
      'distinct_from'
    )
  ),

  primary key (
    target_family_id,
    circuit_id,
    relationship
  )
);

create table evidence.symptom_circuit_mappings (
  id uuid primary key,

  domain_code text not null,
  circuit_id uuid not null references evidence.circuits(id),

  mapping_strength text not null check (
    mapping_strength in ('direct', 'supportive', 'exploratory')
  ),

  evidence_tier evidence.evidence_tier not null,
  mode evidence.library_mode not null,

  limitations jsonb not null default '[]'::jsonb
);

create table evidence.release_claims (
  release_id uuid not null references evidence.library_releases(id),
  claim_id uuid not null references evidence.claims(id),
  primary key (release_id, claim_id)
);

create table evidence.release_circuits (
  release_id uuid not null references evidence.library_releases(id),
  circuit_id uuid not null references evidence.circuits(id),
  primary key (release_id, circuit_id)
);

create table evidence.release_target_families (
  release_id uuid not null references evidence.library_releases(id),
  target_family_id uuid not null references evidence.target_families(id),
  primary key (release_id, target_family_id)
);
```

---

# 18. MIGRATION 006 — TARGETING

Slice 1 uses precomputed synthetic connectome measurements.

```sql
create table targeting.connectome_inputs (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null references core.organisations(id),
  case_id uuid not null references clinical.cases(id),

  source_mode text not null check (
    source_mode in ('synthetic', 'precomputed', 'native')
  ),

  schema_version text not null,

  payload jsonb not null,

  payload_sha256 text
    generated always as (
      encode(digest(payload::text, 'sha256'), 'hex')
    ) stored,

  created_at timestamptz not null default now()
);
```

Target candidates:

```sql
create table targeting.target_candidates (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null references core.organisations(id),
  case_id uuid not null references clinical.cases(id),

  phenotype_snapshot_id uuid not null
    references clinical.phenotype_snapshots(id),

  evidence_release_id uuid not null
    references evidence.library_releases(id),

  candidate_code text not null,

  target_family_code text not null,

  candidate_class targeting.candidate_class not null,

  evidence_tier evidence.evidence_tier not null,

  eligible boolean not null,

  suppression_reason text,

  reliability targeting.reliability_class not null,

  subject_coordinate jsonb,
  mni_coordinate jsonb,

  metrics jsonb not null,
  explanation jsonb not null,

  created_at timestamptz not null default now(),

  unique (case_id, phenotype_snapshot_id, candidate_code)
);
```

Target Slate:

```sql
create table targeting.target_slates (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null references core.organisations(id),
  case_id uuid not null references clinical.cases(id),

  phenotype_snapshot_id uuid not null
    references clinical.phenotype_snapshots(id),

  evidence_release_id uuid not null
    references evidence.library_releases(id),

  connectome_input_id uuid
    references targeting.connectome_inputs(id),

  state targeting.slate_state not null default 'published',

  engine_version text not null,
  scientific_policy_version text not null,

  input_sha256 text not null,

  output_payload jsonb not null,

  output_sha256 text
    generated always as (
      encode(digest(output_payload::text, 'sha256'), 'hex')
    ) stored,

  requested_by uuid not null references auth.users(id),

  created_at timestamptz not null default now()
);

create table targeting.target_slate_items (
  target_slate_id uuid not null
    references targeting.target_slates(id),

  candidate_id uuid not null
    references targeting.target_candidates(id),

  role targeting.target_role not null,

  primary key (target_slate_id, role),
  unique (target_slate_id, candidate_id)
);

alter table clinical.cases
  add constraint cases_current_target_slate_fk
  foreign key (current_target_slate_id)
  references targeting.target_slates(id);
```

No `UPDATE` path will be provided for published candidates or Target Slates.

---

# 19. MIGRATION 007 — DECISION + AUDIT

```sql
create table targeting.clinician_decisions (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null references core.organisations(id),
  case_id uuid not null references clinical.cases(id),

  target_slate_id uuid not null
    references targeting.target_slates(id),

  state targeting.decision_state not null default 'draft',

  final_reasoning text,
  magniom_influence targeting.magniom_influence,

  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),

  signed_by uuid references auth.users(id),
  signed_at timestamptz,

  supersedes_id uuid references targeting.clinician_decisions(id)
);

create table targeting.clinician_decision_items (
  id uuid primary key default gen_random_uuid(),

  decision_id uuid not null
    references targeting.clinician_decisions(id),

  candidate_id uuid references targeting.target_candidates(id),

  action targeting.decision_action not null,

  clinician_coordinate jsonb,

  reason_codes text[] not null default '{}',
  rationale text,

  created_at timestamptz not null default now()
);
```

Audit:

```sql
create table audit.events (
  id uuid primary key default gen_random_uuid(),

  organisation_id uuid not null,
  case_id uuid,

  actor_user_id uuid,

  event_type text not null,

  entity_type text not null,
  entity_id uuid,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index audit_events_case_idx
  on audit.events(case_id, created_at);
```

Audit writer:

```sql
create or replace function app_private.write_audit_event(
  p_org_id uuid,
  p_case_id uuid,
  p_event_type text,
  p_entity_type text,
  p_entity_id uuid,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, audit
as $$
begin
  insert into audit.events (
    organisation_id,
    case_id,
    actor_user_id,
    event_type,
    entity_type,
    entity_id,
    metadata
  )
  values (
    p_org_id,
    p_case_id,
    auth.uid(),
    p_event_type,
    p_entity_type,
    p_entity_id,
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;
```

---

# 20. MIGRATION 008 — STATE-TRANSITION FUNCTIONS

## Approve phenotype

```sql
create or replace function clinical.approve_phenotype(
  p_snapshot_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, clinical, core, app_private
as $$
declare
  v_snapshot clinical.phenotype_snapshots%rowtype;
begin
  select *
  into v_snapshot
  from clinical.phenotype_snapshots
  where id = p_snapshot_id
  for update;

  if not found then
    raise exception 'phenotype snapshot not found';
  end if;

  if not app_private.has_org_role(
    v_snapshot.organisation_id,
    array['tms_specialist']::core.membership_role[]
  ) then
    raise exception 'not authorised';
  end if;

  if v_snapshot.state <> 'draft' then
    raise exception 'snapshot is not draft';
  end if;

  update clinical.phenotype_snapshots
  set state = 'superseded'
  where case_id = v_snapshot.case_id
    and state = 'approved';

  update clinical.phenotype_snapshots
  set
    state = 'approved',
    approved_by = auth.uid(),
    approved_at = now()
  where id = p_snapshot_id;

  update clinical.cases
  set
    current_phenotype_snapshot_id = p_snapshot_id,
    current_target_slate_id = null,
    state = 'phenotype_approved',
    updated_at = now()
  where id = v_snapshot.case_id;

  perform app_private.write_audit_event(
    v_snapshot.organisation_id,
    v_snapshot.case_id,
    'PHENOTYPE_APPROVED',
    'phenotype_snapshot',
    p_snapshot_id,
    '{}'::jsonb
  );

  return p_snapshot_id;
end;
$$;
```

---

# 21. PUBLISH TARGET ENGINE OUTPUT

All scientific computation occurs in `@magniom/target-engine`.

The database function only atomically persists the already-calculated result.

```sql
create or replace function targeting.publish_target_output(
  p_case_id uuid,
  p_snapshot_id uuid,
  p_evidence_release_id uuid,
  p_connectome_input_id uuid,
  p_engine_version text,
  p_policy_version text,
  p_input_sha256 text,
  p_output jsonb
)
returns uuid
language plpgsql
security definer
set search_path =
  pg_catalog,
  targeting,
  clinical,
  evidence,
  core,
  app_private
as $$
declare
  v_case clinical.cases%rowtype;
  v_slate_id uuid;
  v_candidate jsonb;
  v_candidate_id uuid;
  v_role targeting.target_role;
begin
  select *
  into v_case
  from clinical.cases
  where id = p_case_id
  for update;

  if not found then
    raise exception 'case not found';
  end if;

  if not app_private.has_org_role(
    v_case.organisation_id,
    array['tms_specialist']::core.membership_role[]
  ) then
    raise exception 'not authorised';
  end if;

  if v_case.current_phenotype_snapshot_id is distinct from p_snapshot_id then
    raise exception 'phenotype snapshot is stale';
  end if;

  if not exists (
    select 1
    from clinical.phenotype_snapshots ps
    where ps.id = p_snapshot_id
      and ps.state = 'approved'
  ) then
    raise exception 'phenotype must be approved';
  end if;

  update targeting.target_slates
  set state = 'superseded'
  where case_id = p_case_id
    and state = 'published';

  insert into targeting.target_slates (
    organisation_id,
    case_id,
    phenotype_snapshot_id,
    evidence_release_id,
    connectome_input_id,
    engine_version,
    scientific_policy_version,
    input_sha256,
    output_payload,
    requested_by
  )
  values (
    v_case.organisation_id,
    p_case_id,
    p_snapshot_id,
    p_evidence_release_id,
    p_connectome_input_id,
    p_engine_version,
    p_policy_version,
    p_input_sha256,
    p_output,
    auth.uid()
  )
  returning id into v_slate_id;

  for v_candidate
  in
    select *
    from jsonb_array_elements(p_output -> 'candidates')
  loop
    insert into targeting.target_candidates (
      organisation_id,
      case_id,
      phenotype_snapshot_id,
      evidence_release_id,
      candidate_code,
      target_family_code,
      candidate_class,
      evidence_tier,
      eligible,
      suppression_reason,
      reliability,
      subject_coordinate,
      mni_coordinate,
      metrics,
      explanation
    )
    values (
      v_case.organisation_id,
      p_case_id,
      p_snapshot_id,
      p_evidence_release_id,
      v_candidate ->> 'candidateCode',
      v_candidate ->> 'targetFamilyCode',
      (v_candidate ->> 'candidateClass')::targeting.candidate_class,
      (v_candidate ->> 'evidenceTier')::evidence.evidence_tier,
      (v_candidate ->> 'eligible')::boolean,
      v_candidate ->> 'suppressionReason',
      (v_candidate ->> 'reliability')::targeting.reliability_class,
      v_candidate -> 'subjectCoordinate',
      v_candidate -> 'mniCoordinate',
      v_candidate -> 'metrics',
      v_candidate -> 'explanation'
    )
    returning id into v_candidate_id;

    if v_candidate ? 'slateRole'
       and v_candidate ->> 'slateRole' is not null then

      v_role :=
        (v_candidate ->> 'slateRole')::targeting.target_role;

      insert into targeting.target_slate_items (
        target_slate_id,
        candidate_id,
        role
      )
      values (
        v_slate_id,
        v_candidate_id,
        v_role
      );
    end if;
  end loop;

  update clinical.cases
  set
    current_target_slate_id = v_slate_id,
    state = 'target_slate_ready',
    updated_at = now()
  where id = p_case_id;

  perform app_private.write_audit_event(
    v_case.organisation_id,
    p_case_id,
    'TARGET_SLATE_GENERATED',
    'target_slate',
    v_slate_id,
    jsonb_build_object(
      'engineVersion', p_engine_version,
      'policyVersion', p_policy_version
    )
  );

  return v_slate_id;
end;
$$;
```

---

# 22. CREATE DECISION

```sql
create or replace function targeting.create_decision(
  p_target_slate_id uuid
)
returns uuid
language plpgsql
security definer
set search_path =
  pg_catalog,
  targeting,
  clinical,
  core,
  app_private
as $$
declare
  v_slate targeting.target_slates%rowtype;
  v_decision_id uuid;
begin
  select *
  into v_slate
  from targeting.target_slates
  where id = p_target_slate_id;

  if not found or v_slate.state <> 'published' then
    raise exception 'current target slate not found';
  end if;

  if not app_private.has_org_role(
    v_slate.organisation_id,
    array['tms_specialist']::core.membership_role[]
  ) then
    raise exception 'not authorised';
  end if;

  if not exists (
    select 1
    from clinical.cases c
    where c.id = v_slate.case_id
      and c.current_target_slate_id = v_slate.id
      and c.current_phenotype_snapshot_id =
          v_slate.phenotype_snapshot_id
  ) then
    raise exception 'target slate is stale';
  end if;

  insert into targeting.clinician_decisions (
    organisation_id,
    case_id,
    target_slate_id,
    created_by
  )
  values (
    v_slate.organisation_id,
    v_slate.case_id,
    v_slate.id,
    auth.uid()
  )
  returning id into v_decision_id;

  update clinical.cases
  set state = 'decision_draft'
  where id = v_slate.case_id;

  return v_decision_id;
end;
$$;
```

---

# 23. SIGN DECISION

```sql
create or replace function targeting.sign_decision(
  p_decision_id uuid,
  p_final_reasoning text,
  p_magniom_influence targeting.magniom_influence
)
returns uuid
language plpgsql
security definer
set search_path =
  pg_catalog,
  targeting,
  clinical,
  core,
  app_private
as $$
declare
  v_decision targeting.clinician_decisions%rowtype;
begin
  select *
  into v_decision
  from targeting.clinician_decisions
  where id = p_decision_id
  for update;

  if not found then
    raise exception 'decision not found';
  end if;

  if v_decision.state <> 'draft' then
    raise exception 'decision is not draft';
  end if;

  if not app_private.has_org_role(
    v_decision.organisation_id,
    array['tms_specialist']::core.membership_role[]
  ) then
    raise exception 'not authorised';
  end if;

  if length(trim(coalesce(p_final_reasoning, ''))) < 20 then
    raise exception 'clinical reasoning is required';
  end if;

  if not exists (
    select 1
    from targeting.clinician_decision_items di
    where di.decision_id = p_decision_id
  ) then
    raise exception 'at least one candidate decision is required';
  end if;

  if not exists (
    select 1
    from clinical.cases c
    join targeting.target_slates ts
      on ts.id = v_decision.target_slate_id
    where c.id = v_decision.case_id
      and c.current_target_slate_id = ts.id
      and c.current_phenotype_snapshot_id =
          ts.phenotype_snapshot_id
  ) then
    raise exception 'target slate is stale';
  end if;

  update targeting.clinician_decisions
  set
    state = 'signed',
    final_reasoning = p_final_reasoning,
    magniom_influence = p_magniom_influence,
    signed_by = auth.uid(),
    signed_at = now()
  where id = p_decision_id;

  update clinical.cases
  set state = 'decision_signed'
  where id = v_decision.case_id;

  perform app_private.write_audit_event(
    v_decision.organisation_id,
    v_decision.case_id,
    'TARGET_DECISION_SIGNED',
    'clinician_decision',
    p_decision_id,
    '{}'::jsonb
  );

  return p_decision_id;
end;
$$;
```

---

# 24. SIGNED DECISION IMMUTABILITY

```sql
create or replace function app_private.protect_signed_decision()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if old.state in ('signed', 'superseded') then
    raise exception 'signed decision is immutable';
  end if;

  return new;
end;
$$;

create trigger decision_immutability
before update or delete on targeting.clinician_decisions
for each row execute function app_private.protect_signed_decision();
```

Decision items become immutable after parent signing:

```sql
create or replace function app_private.protect_signed_decision_item()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, targeting
as $$
declare
  v_state targeting.decision_state;
begin
  select state
  into v_state
  from targeting.clinician_decisions
  where id = coalesce(new.decision_id, old.decision_id);

  if v_state = 'signed' then
    raise exception 'signed decision items are immutable';
  end if;

  return coalesce(new, old);
end;
$$;
```

Attach for `UPDATE` and `DELETE`.

---

# 25. MIGRATION 009 — RLS

Enable RLS:

```sql
alter table core.organisations enable row level security;
alter table core.memberships enable row level security;

alter table clinical.patients enable row level security;
alter table clinical.cases enable row level security;
alter table clinical.phenotype_snapshots enable row level security;

alter table targeting.connectome_inputs enable row level security;
alter table targeting.target_candidates enable row level security;
alter table targeting.target_slates enable row level security;
alter table targeting.target_slate_items enable row level security;
alter table targeting.clinician_decisions enable row level security;
alter table targeting.clinician_decision_items enable row level security;

alter table audit.events enable row level security;
```

Representative policies:

```sql
create policy patient_org_read
on clinical.patients
for select
to authenticated
using (
  app_private.has_org_access(organisation_id)
);

create policy patient_clinician_insert
on clinical.patients
for insert
to authenticated
with check (
  app_private.has_org_role(
    organisation_id,
    array[
      'tms_specialist',
      'clinical_reviewer'
    ]::core.membership_role[]
  )
);

create policy cases_org_read
on clinical.cases
for select
to authenticated
using (
  app_private.has_org_access(organisation_id)
);

create policy phenotype_org_read
on clinical.phenotype_snapshots
for select
to authenticated
using (
  app_private.has_org_access(organisation_id)
);

create policy phenotype_clinician_insert
on clinical.phenotype_snapshots
for insert
to authenticated
with check (
  app_private.has_org_role(
    organisation_id,
    array['tms_specialist']::core.membership_role[]
  )
);

create policy target_candidates_read
on targeting.target_candidates
for select
to authenticated
using (
  app_private.has_org_access(organisation_id)
);

create policy target_slates_read
on targeting.target_slates
for select
to authenticated
using (
  app_private.has_org_access(organisation_id)
);

create policy decisions_read
on targeting.clinician_decisions
for select
to authenticated
using (
  app_private.has_org_access(organisation_id)
);

create policy audit_read
on audit.events
for select
to authenticated
using (
  app_private.has_org_access(organisation_id)
);
```

No direct client:

- `INSERT` into `target_candidates`;
- `INSERT` into `target_slates`;
- `UPDATE` published target objects;
- `DELETE` audit events.

All occur through controlled functions.

---

# 26. EVIDENCE TABLE RLS

Evidence scientific reference data are organisation-independent.

Authenticated users receive read access:

```sql
alter table evidence.library_releases enable row level security;
alter table evidence.sources enable row level security;
alter table evidence.claims enable row level security;
alter table evidence.circuits enable row level security;
alter table evidence.target_families enable row level security;

create policy evidence_release_read
on evidence.library_releases
for select
to authenticated
using (true);

create policy evidence_source_read
on evidence.sources
for select
to authenticated
using (true);

create policy evidence_claim_read
on evidence.claims
for select
to authenticated
using (true);

create policy evidence_circuit_read
on evidence.circuits
for select
to authenticated
using (true);

create policy evidence_target_family_read
on evidence.target_families
for select
to authenticated
using (true);
```

There are no authenticated write policies.

Evidence writes occur through controlled seed/release workflows.

---

# 27. TYPE DEFINITIONS

`packages/schemas/src/common.ts`:

```ts
import { z } from "zod";

export const EvidenceTierSchema =
  z.enum(["A", "B", "C", "D", "R"]);

export const ReliabilityClassSchema =
  z.enum([
    "high",
    "moderate",
    "low",
    "unreliable",
    "not_applicable",
  ]);

export const TargetRoleSchema =
  z.enum([
    "primary_1",
    "primary_2",
    "primary_3",
    "additional_a",
    "additional_b",
  ]);

export const CandidateClassSchema =
  z.enum([
    "evidence_baseline",
    "connectome_refinement",
    "symptom_circuit",
    "alternative",
    "research",
  ]);

export const CoordinateSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  z: z.number().finite(),

  unit: z.literal("mm"),

  space: z.string().min(1),
}).strict();

export type Coordinate =
  z.infer<typeof CoordinateSchema>;
```

---

# 28. PHENOTYPE SCHEMA

`packages/schemas/src/phenotype.ts`:

```ts
import { z } from "zod";

export const TherapeuticPrioritySchema =
  z.object({
    domainCode: z.string().min(1),

    priorityRank: z.number()
      .int()
      .positive(),

    clinicianWeight: z.number()
      .min(0)
      .max(1),

    evidenceMappability:
      z.enum(["direct", "partial", "none"]),

    rationale: z.string().min(1),
  })
  .strict();

export const PhenotypeSnapshotPayloadSchema =
  z.object({
    schemaVersion:
      z.literal("1.0"),

    ontologyVersion:
      z.literal("MAGNIOM-PHENOTYPE-1.0.0"),

    primaryDiagnosis: z.object({
      code: z.literal("MDD"),
      status: z.literal("confirmed"),
    }),

    episode: z.object({
      active: z.literal(true),

      severity:
        z.enum([
          "mild",
          "moderate",
          "severe",
        ]),
    }),

    safety: z.object({
      clearance:
        z.enum([
          "cleared",
          "requires_review",
          "deferred",
        ]),
    }),

    priorities:
      z.array(TherapeuticPrioritySchema)
        .min(1),

    phenotypeConfidence:
      z.enum(["high", "moderate", "low"]),

    clinicianSummary:
      z.string().min(10),
  })
  .strict();

export type PhenotypeSnapshotPayload =
  z.infer<
    typeof PhenotypeSnapshotPayloadSchema
  >;
```

---

# 29. SYNTHETIC CONNECTOME SCHEMA

The vertical slice does not pretend that precomputed values are an MRI.

```ts
export const SyntheticConnectomeCandidateSchema =
  z.object({
    candidateCode: z.string(),

    targetFamilyCode: z.string(),

    reliabilityScore:
      z.number().min(0).max(1),

    circuitConcordance:
      z.number().min(0).max(1),

    baselineCircuitConcordance:
      z.number().min(0).max(1),

    mniCoordinate:
      CoordinateSchema,

    accessibility:
      z.enum(["good", "conditional", "poor"]),
  })
  .strict();

export const SyntheticConnectomeInputSchema =
  z.object({
    schemaVersion:
      z.literal("synthetic-connectome/1.0"),

    quality:
      z.enum(["pass", "conditional", "fail"]),

    candidates:
      z.array(
        SyntheticConnectomeCandidateSchema
      ),
  })
  .strict();

export type SyntheticConnectomeInput =
  z.infer<
    typeof SyntheticConnectomeInputSchema
  >;
```

---

# 30. SCIENTIFIC POLICY SCHEMA

```ts
export const ScientificPolicySchema =
  z.object({
    version: z.string(),

    permittedClinicalEvidenceTiers:
      z.array(
        z.enum(["A", "B"])
      ),

    minimumPersonalisationReliability:
      z.number().min(0).max(1),

    minimumCircuitGain:
      z.number().min(0).max(1),

    redundancyDistanceMm:
      z.number().positive(),

    anxiosomaticPriorityThreshold:
      z.number().min(0).max(1),

    phenotypeConfidenceMinimum:
      z.enum(["moderate"]),
  })
  .strict();
```

Slice policy:

```json
{
  "version": "MAGNIOM-POLICY-0.1.0-SYNTHETIC",

  "permittedClinicalEvidenceTiers": [
    "A",
    "B"
  ],

  "minimumPersonalisationReliability": 0.65,

  "minimumCircuitGain": 0.10,

  "redundancyDistanceMm": 12,

  "anxiosomaticPriorityThreshold": 0.60,

  "phenotypeConfidenceMinimum": "moderate"
}
```

These numbers are:

# engineering-test parameters only.

They are not validated clinical thresholds.

---

# 31. TARGET CANDIDATE SCHEMA

```ts
export const TargetCandidateSchema =
  z.object({
    candidateCode: z.string(),

    targetFamilyCode: z.string(),

    candidateClass:
      CandidateClassSchema,

    evidenceTier:
      EvidenceTierSchema,

    eligible: z.boolean(),

    suppressionReason:
      z.string().nullable(),

    reliability:
      ReliabilityClassSchema,

    mniCoordinate:
      CoordinateSchema.nullable(),

    subjectCoordinate:
      CoordinateSchema.nullable(),

    metrics: z.object({
      phenotypeConcordance:
        z.number().min(0).max(1),

      circuitConcordance:
        z.number().min(0).max(1)
          .nullable(),

      baselineCircuitConcordance:
        z.number().min(0).max(1)
          .nullable(),

      reliabilityScore:
        z.number().min(0).max(1)
          .nullable(),

      counterfactualDistanceMm:
        z.number().nonnegative()
          .nullable(),
    }).strict(),

    explanation: z.object({
      whyNominated:
        z.array(z.string()),

      whatImagingChanged:
        z.array(z.string()),

      whyItMayBeWrong:
        z.array(z.string()),

      evidenceClaimCodes:
        z.array(z.string()),
    }).strict(),

    slateRole:
      TargetRoleSchema.nullable(),
  })
  .strict();

export type TargetCandidate =
  z.infer<typeof TargetCandidateSchema>;
```

---

# 32. TARGET ENGINE INPUT

```ts
export const TargetEngineInputSchema =
  z.object({
    caseCode: z.string(),

    mode:
      z.literal("synthetic_validation"),

    phenotype:
      PhenotypeSnapshotPayloadSchema,

    evidence:
      z.object({
        releaseCode: z.string(),
        releaseVersion: z.string(),

        claims:
          z.array(
            z.object({
              code: z.string(),
              evidenceTier:
                EvidenceTierSchema,
              statement: z.string(),
            })
          ),

        targetFamilies:
          z.array(
            z.object({
              code: z.string(),
              evidenceTier:
                EvidenceTierSchema,
              mode:
                z.enum([
                  "development",
                  "research",
                  "clinical",
                ]),
            })
          ),
      }),

    connectome:
      SyntheticConnectomeInputSchema
        .nullable(),

    policy:
      ScientificPolicySchema,
  })
  .strict();
```

---

# 33. TARGET ENGINE OUTPUT

```ts
export const TargetEngineOutputSchema =
  z.object({
    schemaVersion:
      z.literal("target-engine-output/1.0"),

    engineVersion:
      z.literal(
        "MAGNIOM-TARGET-ENGINE-0.1.0-SYNTHETIC"
      ),

    personalisationStatus:
      z.enum([
        "qualified",
        "limited",
        "not_available",
        "not_required",
      ]),

    convergence:
      z.enum([
        "high",
        "moderate",
        "low",
        "not_assessable",
      ]),

    candidates:
      z.array(TargetCandidateSchema),

    warnings:
      z.array(z.string()),

    abstention:
      z.object({
        code: z.string(),
        explanation: z.string(),
      }).nullable(),
  })
  .strict();
```

---

# 34. CLINICIAN DECISION SCHEMA

```ts
export const CandidateDecisionSchema =
  z.object({
    candidateCode:
      z.string().nullable(),

    action:
      z.enum([
        "accept",
        "reject",
        "modify",
        "replace",
        "defer",
      ]),

    reasonCodes:
      z.array(z.string()),

    rationale:
      z.string().optional(),

    clinicianCoordinate:
      CoordinateSchema.optional(),
  })
  .strict();

export const ClinicianDecisionSchema =
  z.object({
    targetSlateId: z.string().uuid(),

    items:
      z.array(
        CandidateDecisionSchema
      ).min(1),

    finalReasoning:
      z.string().min(20),

    magniomInfluence:
      z.enum([
        "none",
        "minor",
        "moderate",
        "major",
      ]),

    attestationAccepted:
      z.literal(true),
  })
  .strict();
```

---

# 35. EVIDENCE LIBRARY DEVELOPMENT RELEASE

Seed:

```text
MAGNIOM-EVIDENCE-DEV-1.0.0
```

Properties:

```text
mode = development
clinical_eligible = false
active = true
```

This deliberately prevents the first slice from masquerading as Clinical Mode.

---

# 36. MINIMUM SEEDED SOURCES

Seed only the sources required for G01–G05.

### S001

Siddiqi et al. 2020.

`PMID 32160765`

Distinct symptom-specific treatment targets.

The study identified reproducible dysphoric and anxiosomatic treatment-response circuit patterns across independent retrospective datasets.

### S002

Siddiqi et al. 2021.

`PMID 34239076`

Convergent depression circuit.

Lesions, TMS and DBS sites affecting depression converged on a related circuit across multiple datasets.

### S003

2026 connectivity-guided randomized trial.

`PMID 42340706`

Supports prospective convergent-circuit individualisation and provides target reproducibility evidence.

### S004

2026 dysphoric/anxiosomatic randomized trial.

`PMID 41912790`

Supports prospective differential symptom effects for the two circuit targets.

### S005

2025 personalised-rTMS meta-analysis.

`PMID 40194626`

Provides limiting evidence: ten randomized active-controlled trials, 647 participants, with no overall evidence of personalised rTMS superiority over fixed targeting.

### S006

Development-source placeholder for established left-prefrontal depression target-family evidence.

The production Evidence Library will replace this placeholder with the full reviewed Tier A evidence set.

---

# 37. SEEDED CLAIMS

```text
EC-MDD-LDLPFC-EFFICACY-001
Tier A
Clinical family evidence anchor.

EC-MDD-CONVERGENCE-001
Tier B
Depression lesions and stimulation sites converge on a
common therapeutic circuit.

EC-MDD-CONVERGENCE-RCT-001
Tier B
Individualised connectivity-guided targeting of the
convergent depression circuit has prospective randomized
support.

EC-MDD-DYSPHORIC-001
Tier B
A dysphoric treatment-response circuit is supported by
retrospective replication and prospective testing.

EC-MDD-ANXIOSOMATIC-001
Tier B
An anxiosomatic treatment-response circuit is supported
by retrospective replication and prospective testing.

EC-PERSONALISED-SUPERIORITY-LIMIT-001
Tier B
Current evidence does not establish universal superiority
of personalised targeting over fixed targeting.
```

The last claim is a:

# limitation claim

and must appear in personalised candidate explanations.

---

# 38. SEEDED CIRCUITS

```text
TC-MDD-LPFC-ESTABLISHED-001
Tier A

TC-MDD-CONVERGENT-001
Tier B

TC-MDD-DYSPHORIC-001
Tier B

TC-MDD-ANXIOSOMATIC-001
Tier B
```

---

# 39. SEEDED TARGET FAMILIES

```text
TF-MDD-LDLPFC-EST-001
Tier A
Evidence Anchor

TF-MDD-CONVERGENT-LDLPFC-001
Tier B
Refines established left-prefrontal family

TF-MDD-DYSPHORIC-001
Tier B
Overlaps established left-prefrontal family

TF-MDD-ANXIOSOMATIC-DMPFC-001
Tier B
Distinct symptom-circuit family
```

---

# 40. SEED UUID POLICY

Use stable UUIDs in reference seeds.

Example:

```text
10000000-0000-4000-8000-000000000001
```

IDs must not change every time:

```text
supabase db reset
```

runs.

Golden tests should therefore be reproducible.

---

# 41. REFERENCE SEED EXAMPLE

`supabase/seed/reference.sql`:

```sql
insert into evidence.sources (
  id,
  code,
  title,
  year,
  source_type,
  pmid
)
values
(
  '10000000-0000-4000-8000-000000000001',
  'S001',
  'Distinct Symptom-Specific Treatment Targets for Circuit-Based Neuromodulation',
  2020,
  'retrospective_replication',
  '32160765'
),
(
  '10000000-0000-4000-8000-000000000002',
  'S002',
  'Brain stimulation and brain lesions converge on common causal circuits in neuropsychiatric disease',
  2021,
  'multidataset_circuit_analysis',
  '34239076'
),
(
  '10000000-0000-4000-8000-000000000003',
  'S003',
  'Connectivity- vs Scalp-Based Targeting of Accelerated Transcranial Magnetic Stimulation for Depression',
  2026,
  'randomized_trial',
  '42340706'
),
(
  '10000000-0000-4000-8000-000000000004',
  'S004',
  'Circuit-targeted modulation of anxiety symptoms in individuals with major depression',
  2026,
  'randomized_trial',
  '41912790'
),
(
  '10000000-0000-4000-8000-000000000005',
  'S005',
  'Effectiveness of personalized repetitive transcranial magnetic stimulation for major depressive disorder',
  2025,
  'meta_analysis',
  '40194626'
);
```

---

# 42. CLAIM SEED EXAMPLE

```sql
insert into evidence.claims (
  id,
  code,
  statement,
  claim_type,
  evidence_tier,
  mode,
  status,
  limitations
)
values
(
  '11000000-0000-4000-8000-000000000001',
  'EC-MDD-LDLPFC-EFFICACY-001',
  'Repeated left-prefrontal stimulation is an established treatment approach for major depressive disorder.',
  'clinical_efficacy',
  'A',
  'development',
  'approved',
  '["Development release uses a deliberately abbreviated Tier A source set."]'
),
(
  '11000000-0000-4000-8000-000000000002',
  'EC-MDD-CONVERGENCE-RCT-001',
  'Patient-specific connectivity to a convergent depression circuit has prospective randomized targeting support.',
  'targeting_method_efficacy',
  'B',
  'development',
  'approved',
  '["Confirmatory efficacy evidence remains desirable."]'
),
(
  '11000000-0000-4000-8000-000000000003',
  'EC-MDD-DYSPHORIC-001',
  'A dysphoric symptom-response circuit has replicated retrospective and prospective support.',
  'symptom_specificity',
  'B',
  'development',
  'approved',
  '[]'
),
(
  '11000000-0000-4000-8000-000000000004',
  'EC-MDD-ANXIOSOMATIC-001',
  'An anxiosomatic symptom-response circuit has replicated retrospective and prospective support.',
  'symptom_specificity',
  'B',
  'development',
  'approved',
  '["This is not a universal target for primary anxiety disorders."]'
),
(
  '11000000-0000-4000-8000-000000000005',
  'EC-PERSONALISED-SUPERIORITY-LIMIT-001',
  'Current evidence does not establish that personalised TMS targeting is universally superior to fixed targeting.',
  'negative_evidence',
  'B',
  'development',
  'approved',
  '[]'
);
```

Continue with stable UUIDs for circuits and TargetFamilies.

---

# 43. EVIDENCE RELEASE

The release manifest contains:

```json
{
  "code": "MAGNIOM-EVIDENCE-DEV-1.0.0",
  "mode": "development",
  "clinicalEligible": false,

  "claimCodes": [
    "EC-MDD-LDLPFC-EFFICACY-001",
    "EC-MDD-CONVERGENCE-RCT-001",
    "EC-MDD-DYSPHORIC-001",
    "EC-MDD-ANXIOSOMATIC-001",
    "EC-PERSONALISED-SUPERIORITY-LIMIT-001"
  ],

  "circuitCodes": [
    "TC-MDD-LPFC-ESTABLISHED-001",
    "TC-MDD-CONVERGENT-001",
    "TC-MDD-DYSPHORIC-001",
    "TC-MDD-ANXIOSOMATIC-001"
  ],

  "targetFamilyCodes": [
    "TF-MDD-LDLPFC-EST-001",
    "TF-MDD-CONVERGENT-LDLPFC-001",
    "TF-MDD-DYSPHORIC-001",
    "TF-MDD-ANXIOSOMATIC-DMPFC-001"
  ]
}
```

---

# 44. SYNTHETIC TARGET COORDINATE RULE

G01–G04 use deliberately synthetic coordinates.

They are not published Magniom clinical target definitions.

Every fixture file must include:

```json
{
  "syntheticCoordinate": true
}
```

The UI displays:

# SYNTHETIC TARGET — NOT FOR CLINICAL USE

---

# 45. TARGET ENGINE PACKAGE

Directory:

```text
packages/target-engine/
├── src/
│   ├── index.ts
│   ├── build-target-slate.ts
│   ├── evidence.ts
│   ├── phenotype.ts
│   ├── personalisation.ts
│   ├── ranking.ts
│   ├── redundancy.ts
│   ├── convergence.ts
│   ├── explanations.ts
│   └── hash.ts
│
├── tests/
│   ├── unit/
│   ├── properties/
│   └── golden/
│
└── package.json
```

---

# 46. PUBLIC TARGET ENGINE API

Only this function is required by the first application:

```ts
export interface TargetEngine {
  buildTargetSlate(
    input: TargetEngineInput
  ): TargetEngineOutput;
}
```

Canonical implementation:

```ts
export function buildTargetSlate(
  rawInput: unknown
): TargetEngineOutput {
  const input =
    TargetEngineInputSchema.parse(rawInput);

  const output =
    buildValidatedTargetSlate(input);

  return TargetEngineOutputSchema.parse(
    output
  );
}
```

---

# 47. NO ASYNC TARGET ENGINE

The Target Engine itself is synchronous.

```ts
buildTargetSlate(input)
```

not:

```ts
await buildTargetSlate(input)
```

All inputs must already exist.

This reinforces purity.

---

# 48. EVIDENCE BASELINE API

```ts
export function createEvidenceBaseline(
  input: TargetEngineInput
): TargetCandidate;
```

For Slice 1 it generates:

```text
CAND-EVIDENCE-LDLPFC
```

from:

```text
TF-MDD-LDLPFC-EST-001
```

---

# 49. PERSONALISATION API

```ts
export interface PersonalisationDecision {
  adopted: boolean;

  status:
    | "qualified"
    | "low_reliability"
    | "low_incremental_value"
    | "not_available";

  circuitGain: number | null;
}

export function assessPersonalisation(
  baseline: TargetCandidate,
  personalised:
    SyntheticConnectomeCandidate | null,
  policy: ScientificPolicy
): PersonalisationDecision;
```

---

# 50. PERSONALISATION RULE — SLICE 1

Personalisation qualifies iff:

```text
Connectome quality != FAIL
AND
reliabilityScore >= 0.65
AND
circuitConcordance
  - baselineCircuitConcordance
  >= 0.10
AND
accessibility != poor
```

Again:

# test policy only.

---

# 51. RELIABILITY CLASSIFICATION

```ts
export function classifyReliability(
  score: number
): ReliabilityClass {
  if (score >= 0.80) return "high";
  if (score >= 0.65) return "moderate";
  if (score >= 0.40) return "low";
  return "unreliable";
}
```

These bands are:

# synthetic-engine fixtures,

not Clinical Mode thresholds.

---

# 52. PHENOTYPE INPUT

Slice 1 recognises two targetable domains:

```text
DOMAIN-MDD-DYSPHORIC-001
DOMAIN-MDD-ANXIOSOMATIC-001
```

Helper:

```ts
export function priorityWeight(
  phenotype: PhenotypeSnapshotPayload,
  domainCode: string
): number {
  return (
    phenotype.priorities.find(
      p => p.domainCode === domainCode
    )?.clinicianWeight ?? 0
  );
}
```

---

# 53. PRIMARY 1 ALGORITHM

```ts
function selectPrimary1(
  baseline: TargetCandidate,
  personalised:
    TargetCandidate | null,
  decision:
    PersonalisationDecision
): TargetCandidate {
  if (
    personalised &&
    decision.adopted
  ) {
    return {
      ...personalised,
      slateRole: "primary_1",
    };
  }

  return {
    ...baseline,
    slateRole: "primary_1",
  };
}
```

---

# 54. PRIMARY 2 ALGORITHM

Slice 1 only creates Primary 2 for the anxiosomatic circuit.

```ts
function selectPrimary2(
  input: TargetEngineInput,
  selected: TargetCandidate[]
): TargetCandidate | null {
  const weight = priorityWeight(
    input.phenotype,
    "DOMAIN-MDD-ANXIOSOMATIC-001"
  );

  if (
    weight <
    input.policy
      .anxiosomaticPriorityThreshold
  ) {
    return null;
  }

  return createAnxiosomaticCandidate(
    input,
    selected
  );
}
```

---

# 55. PRIMARY 3

Not generated in G01–G05.

The type supports it.

This is deliberate.

A vertical slice should prove that Magniom can return:

# fewer than three primaries.

---

# 56. ADDITIONAL A

When a personalised Primary 1 is adopted:

the evidence baseline becomes:

```text
Additional A
```

because it is the clinically important counterfactual.

---

# 57. REDUNDANCY

For Slice 1:

```ts
export function euclideanDistanceMm(
  a: Coordinate,
  b: Coordinate
): number {
  return Math.sqrt(
    (a.x - b.x) ** 2 +
    (a.y - b.y) ** 2 +
    (a.z - b.z) ** 2
  );
}
```

A candidate is redundant when:

```text
same therapeutic objective
AND
same TargetFamily
AND
distance < 12 mm
AND
adds no distinct clinical domain
```

---

# 58. CONVERGENCE

Slice implementation:

```text
HIGH
personalised/baseline distance < 12 mm

MODERATE
12–25 mm

LOW
>25 mm
```

These are synthetic validation thresholds only.

They exercise the UX and engine architecture.

---

# 59. EXPLANATION GENERATION

Structured facts only.

Example personalised candidate:

```ts
{
  whyNominated: [
    "The candidate remains within an evidence-supported left-prefrontal depression target family.",
    "Synthetic patient-specific connectivity shows greater concordance with the convergent depression circuit than the evidence-only reference."
  ],

  whatImagingChanged: [
    "The synthetic connectome moved the target 8.2 mm from the evidence-only reference."
  ],

  whyItMayBeWrong: [
    "The personalisation threshold used in this build is an engineering-validation parameter, not a validated clinical threshold.",
    "Current evidence does not establish universal superiority of personalised targeting."
  ],

  evidenceClaimCodes: [
    "EC-MDD-LDLPFC-EFFICACY-001",
    "EC-MDD-CONVERGENCE-RCT-001",
    "EC-PERSONALISED-SUPERIORITY-LIMIT-001"
  ]
}
```

No LLM.

---

# 60. DETERMINISTIC HASHING

Create:

```ts
export function canonicalJson(
  value: unknown
): string;
```

Requirements:

- recursively sort object keys;
- preserve array order;
- serialize finite numbers deterministically.

Then:

```ts
export function sha256Canonical(
  value: unknown
): string;
```

The Target Engine produces:

```text
inputHash
outputHash
```

for Golden Case verification.

---

# 61. GOLDEN CASE FORMAT

Each directory:

```text
validation/golden-cases/G01/
├── case.json
├── phenotype.json
├── connectome.json
├── expected-output.json
└── README.md
```

`connectome.json` may contain:

```json
null
```

---

# 62. G01 — EVIDENCE ONLY

Purpose:

# prove connectomics is optional.

Phenotype:

```json
{
  "schemaVersion": "1.0",
  "ontologyVersion":
    "MAGNIOM-PHENOTYPE-1.0.0",

  "primaryDiagnosis": {
    "code": "MDD",
    "status": "confirmed"
  },

  "episode": {
    "active": true,
    "severity": "severe"
  },

  "safety": {
    "clearance": "cleared"
  },

  "priorities": [
    {
      "domainCode":
        "DOMAIN-MDD-DYSPHORIC-001",
      "priorityRank": 1,
      "clinicianWeight": 0.90,
      "evidenceMappability": "direct",
      "rationale":
        "Dysphoric burden is the dominant synthetic treatment objective."
    },
    {
      "domainCode":
        "DOMAIN-MDD-ANXIOSOMATIC-001",
      "priorityRank": 2,
      "clinicianWeight": 0.20,
      "evidenceMappability": "direct",
      "rationale":
        "Low synthetic anxiosomatic burden."
    }
  ],

  "phenotypeConfidence": "high",

  "clinicianSummary":
    "Synthetic severe MDD case with predominantly dysphoric burden."
}
```

Connectome:

```json
null
```

Expected:

```text
Primary 1
CAND-EVIDENCE-LDLPFC

Personalisation
not_available

Primary 2
none

Primary 3
none

Additional A
none
```

---

# 63. G02 — HIGH-CONVERGENCE PERSONALISATION

Evidence baseline synthetic coordinate:

```text
[-38, 44, 30]
```

Personalised synthetic candidate:

```text
[-44, 40, 34]
```

Distance:

approximately:

```text
8.25 mm
```

Synthetic connectome:

```json
{
  "schemaVersion":
    "synthetic-connectome/1.0",

  "quality": "pass",

  "candidates": [
    {
      "candidateCode":
        "SYN-CONVERGENT-G02",

      "targetFamilyCode":
        "TF-MDD-CONVERGENT-LDLPFC-001",

      "reliabilityScore": 0.88,

      "circuitConcordance": 0.84,

      "baselineCircuitConcordance": 0.66,

      "mniCoordinate": {
        "x": -44,
        "y": 40,
        "z": 34,
        "unit": "mm",
        "space":
          "SYNTHETIC-MNI-LIKE"
      },

      "accessibility": "good"
    }
  ]
}
```

Gain:

```text
0.18
```

Expected:

```text
Primary 1
CAND-CONVERGENT-G02

Additional A
CAND-EVIDENCE-LDLPFC

Personalisation
qualified

Convergence
high
```

The evidence-only candidate remains visible.

---

# 64. G03 — RELIABLE BUT LOW INCREMENTAL VALUE

Personalised candidate:

```text
reliability = 0.88

baseline concordance = 0.70

personalised concordance = 0.76

gain = 0.06
```

Expected:

```text
Primary 1
CAND-EVIDENCE-LDLPFC

Personalised candidate
stored but suppressed

suppressionReason
LOW_INCREMENTAL_VALUE

Personalisation
limited
```

This is a crucial test.

Magniom must prove that:

# available personalisation ≠ adopted personalisation.

---

# 65. G04 — DRAMATIC BUT UNRELIABLE CONNECTOME

Synthetic target:

```text
[-58, 20, 40]
```

Reliability:

```text
0.42
```

Circuit concordance:

```text
0.95
```

Expected:

```text
Primary 1
CAND-EVIDENCE-LDLPFC

Personalised candidate
stored but clinically ineligible

suppressionReason
LOW_RELIABILITY

Personalisation
limited / not qualified

Warning
LIMITED_FC_RELIABILITY
```

The extreme connectivity result must not overpower reliability.

---

# 66. G05 — ANXIOSOMATIC-DOMINANT

Phenotype:

```text
Anxiosomatic weight  1.00
Dysphoric weight     0.70
```

Personalised convergent candidate:

reliable and qualified.

Anxiosomatic target family:

```text
TF-MDD-ANXIOSOMATIC-DMPFC-001
```

Group reference from the prospectively tested circuit-target study:

```text
MNI [0,48,46]
```

The 2026 randomized study prospectively tested this anxiosomatic coordinate against a dysphoric left-prefrontal coordinate in participants with MDD and significant anxiety.

Expected:

```text
Primary 1
Connectome-refined evidence anchor

Primary 2
Anxiosomatic circuit target

Primary 3
none

Additional A
Evidence-only left-prefrontal target
```

The interface must clearly state that Primary 2 represents:

# a distinct clinical hypothesis,

not simply a lower-ranked version of Primary 1.

---

# 67. GOLDEN TEST

```ts
describe.each(goldenCases)(
  "$caseCode",
  fixture => {
    it("matches canonical output", () => {
      const output =
        buildTargetSlate(
          fixture.input
        );

      expect(output)
        .toEqual(
          fixture.expectedOutput
        );
    });

    it("is deterministic", () => {
      const results =
        Array.from(
          { length: 100 },
          () =>
            sha256Canonical(
              buildTargetSlate(
                fixture.input
              )
            )
        );

      expect(
        new Set(results).size
      ).toBe(1);
    });
  }
);
```

---

# 68. PROPERTY TESTS

Required:

```ts
it("worse reliability cannot qualify personalisation");

it("research evidence cannot become Clinical-style Primary");

it("adding a redundant candidate cannot increase primary count");

it("failed connectome cannot produce a personalised Primary 1");

it("same input always yields same hash");

it("baseline target remains reconstructable when personalisation is adopted");
```

Use fast-check where practical.

---

# 69. NEXT.JS APPLICATION

Directory:

```text
apps/web/app/
├── (auth)/
│   └── login/
│       └── page.tsx
│
└── (workspace)/
    ├── layout.tsx
    ├── cases/
    │   ├── page.tsx
    │   └── [caseId]/
    │       ├── layout.tsx
    │       ├── page.tsx
    │       ├── assessment/
    │       │   └── page.tsx
    │       ├── phenotype/
    │       │   └── page.tsx
    │       ├── connectome/
    │       │   └── page.tsx
    │       ├── targets/
    │       │   └── page.tsx
    │       ├── compare/
    │       │   └── page.tsx
    │       ├── decision/
    │       │   └── page.tsx
    │       └── audit/
    │           └── page.tsx
    │
    └── evidence/
        ├── page.tsx
        ├── claims/
        │   └── [claimCode]/
        │       └── page.tsx
        └── circuits/
            └── [circuitCode]/
                └── page.tsx
```

---

# 70. SYNTHETIC BANNER

Every case screen displays:

```text
SYNTHETIC VALIDATION CASE
NOT FOR CLINICAL USE
```

Persistent.

It cannot be dismissed.

---

# 71. CASE WORKFLOW RAIL

```text
Assessment
Phenotype
Connectome
Targets
Decision
Audit
```

The first slice deliberately omits:

- treatment;
- outcomes.

---

# 72. CASE OVERVIEW COMPONENTS

```text
CaseStatusHeader
SyntheticCaseBanner
CaseWorkflowRail
ClinicalQuestionCard
PhenotypeStatusCard
ConnectomeStatusCard
TargetSlateStatusCard
DecisionStatusCard
VersionManifestCard
```

---

# 73. PHENOTYPE PAGE COMPONENTS

```text
PhenotypeDomainList
TherapeuticPriorityEditor
CircuitMappabilityBadge
PatientGoalPlaceholder
PhenotypeConfidencePanel
PhenotypeSummaryEditor
ApprovePhenotypeDialog
```

The G01–G05 seed creates draft snapshots ready for review.

---

# 74. PHENOTYPE APPROVAL ACTION

`apps/web/features/phenotype/actions.ts`:

```ts
"use server";

export async function approvePhenotypeAction(
  snapshotId: string
) {
  const supabase =
    await createUserSupabaseClient();

  const { data, error } =
    await supabase.rpc(
      "approve_phenotype",
      {
        p_snapshot_id:
          snapshotId,
      }
    );

  if (error) {
    throw new Error(
      error.message
    );
  }

  revalidatePath(
    "/cases",
    "layout"
  );

  return data;
}
```

No browser direct `UPDATE`.

---

# 75. CONNECTOME PAGE

Slice 1 shows structured synthetic measurements.

Example:

```text
SYNTHETIC CONNECTOME INPUT

Quality
PASS

Convergent depression circuit

Patient-specific concordance
0.84

Evidence-only concordance
0.66

Increment
+0.18

Reliability
High · 0.88

This is synthetic validation data.
No MRI was processed.
```

This teaches the eventual UI distinction between:

- measurement;
- reliability;
- recommendation.

---

# 76. GENERATE TARGET SLATE ACTION

```ts
"use server";

import {
  buildTargetSlate
} from "@magniom/target-engine";

export async function
generateTargetSlateAction(
  caseId: string
) {
  const supabase =
    await createUserSupabaseClient();

  const context =
    await loadTargetEngineContext(
      supabase,
      caseId
    );

  const output =
    buildTargetSlate(
      context.engineInput
    );

  const inputHash =
    sha256Canonical(
      context.engineInput
    );

  const { data, error } =
    await supabase.rpc(
      "publish_target_output",
      {
        p_case_id:
          caseId,

        p_snapshot_id:
          context.snapshotId,

        p_evidence_release_id:
          context.evidenceReleaseId,

        p_connectome_input_id:
          context.connectomeInputId,

        p_engine_version:
          output.engineVersion,

        p_policy_version:
          context.policy.version,

        p_input_sha256:
          inputHash,

        p_output:
          output
      }
    );

  if (error) {
    throw new Error(
      error.message
    );
  }

  revalidatePath(
    `/cases/${caseId}`,
    "layout"
  );

  return data;
}
```

---

# 77. CRITICAL SERVER RULE

`loadTargetEngineContext()` must load:

- current approved phenotype;
- pinned Evidence Library release;
- case-specific connectome fixture;
- frozen Scientific Policy.

It must not accept these objects from browser input.

The browser supplies only:

```text
caseId
```

---

# 78. TARGET PAGE

Layout:

```text
┌───────────────────┬───────────────────────────────────┐
│ CLINICAL CONTEXT  │ TARGET SLATE                      │
│                   │                                   │
│ MDD               │ Primary 1                         │
│                   │ ...                               │
│ Priorities        │                                   │
│ 1 Anxiosomatic    │ Primary 2                         │
│ 2 Dysphoric       │ ...                               │
│                   │                                   │
│ Synthetic input   │ Additional A                      │
└───────────────────┴───────────────────────────────────┘
```

No 3D viewer yet.

The central region planned for the future viewer instead contains:

# Spatial Comparison Panel.

---

# 79. SPATIAL COMPARISON PANEL

For Slice 1:

```text
Evidence-only coordinate
[-38,44,30]

Personalised coordinate
[-44,40,34]

Distance
8.25 mm

Coordinate space
Synthetic MNI-like

[SYNTHETIC TEST DATA]
```

This proves coordinate semantics without adding rendering complexity.

---

# 80. TARGET CARD

Component:

```text
TargetSlateCard
```

Required visible fields:

- role;
- target family;
- evidence status;
- clinical purpose;
- personalisation state;
- reliability;
- suppression state where applicable.

Expanded sections:

```text
Why nominated
What personalisation changed
Evidence basis
Why this may be wrong
Counterfactual
Technical detail
```

---

# 81. EVIDENCE DRAWER

Component:

```text
TargetEvidenceDrawer
```

For personalised candidate must show:

### Supporting

`EC-MDD-CONVERGENCE-RCT-001`

### Limiting

`EC-PERSONALISED-SUPERIORITY-LIMIT-001`

A candidate that exposes support but hides the limitation fails Slice 1 acceptance.

---

# 82. SUPPRESSED CANDIDATES

Provide:

```text
Show excluded hypotheses
```

G03:

```text
Connectome refinement

Excluded from Slate

Reason
Patient-specific connectivity did not add enough
incremental circuit information.
```

G04:

```text
Connectome refinement

Not used for ranking

Reason
Reliability below the synthetic validation threshold.
```

Suppressed candidates remain scientifically inspectable.

---

# 83. COMPARISON PAGE

Components:

```text
TargetComparisonTable
CounterfactualPanel
ConvergencePanel
UncertaintyMatrix
```

No:

```text
Winner
```

column.

---

# 84. DECISION PAGE

The candidate list begins with:

# no preselected action.

Actions:

```text
Accept
Reject
Modify
Replace
Defer
```

Also:

```text
No target selected / defer case
```

---

# 85. CANDIDATE DECISION COMPONENT

```text
CandidateDecisionForm
```

For every selected action require at least one:

```text
reasonCode
```

except where validation fixture explicitly allows otherwise.

---

# 86. FINAL REASONING

Must be manually entered.

No pre-filled Target Engine explanation.

Minimum:

```text
20 characters
```

for engineering validation.

Production requirement will be clinical rather than arbitrary character count.

---

# 87. ATTESTATION

Display:

> I have independently reviewed the clinical context, evidence basis, target reliability, alternatives and limitations. The final selection represents my decision and not an autonomous Magniom prescription.

Checkbox starts:

```text
unchecked
```

---

# 88. SIGNING

Button:

# Sign target decision

Never:

# Accept Magniom recommendation.

---

# 89. SIGNED VIEW

After signing:

```text
SIGNED TARGET DECISION

Final clinician decision
...

Magniom influence
Moderate

Clinical reasoning
...

Signed by
Synthetic Specialist

Signed at
...

Source Target Slate
...

Target Engine
...

Evidence Library
...
```

No edit controls.

---

# 90. AUDIT PAGE

Human-readable timeline:

```text
Phenotype snapshot created

Phenotype approved

Target Slate generated

Candidate decision recorded

Target decision signed
```

Expandable technical detail:

- IDs;
- hashes;
- versions.

---

# 91. SERVER/CLIENT BOUNDARY

Default:

# Server Components.

Client Components only for:

- phenotype editing;
- decision form;
- evidence drawer interaction;
- comparison selection.

Target Engine never ships into client JavaScript.

---

# 92. SERVER-ONLY MODULES

Mark:

```ts
import "server-only";
```

for:

- Target Engine context loader;
- Supabase server clients;
- policy loader;
- release loader.

---

# 93. CLIENT MUST NOT RECEIVE

Never serialize to browser:

- Supabase service-role key;
- private administrative database credentials;
- unpublished evidence objects;
- audit internals unrelated to authorised user.

---

# 94. SYNTHETIC AUTH USERS

Seed two organisations:

```text
ORG-A
ORG-B
```

Users:

```text
specialist-a@synthetic.magniom.test
reviewer-a@synthetic.magniom.test
specialist-b@synthetic.magniom.test
```

All UI shows:

# SYNTHETIC

where appropriate.

---

# 95. ORGANISATION ISOLATION FIXTURE

G01–G05 belong to:

```text
ORG-A
```

ORG-B contains:

```text
SYN-CROSS-ORG-001
```

used only for security tests.

`specialist-a` must receive:

```text
0 rows
```

when attempting to read it.

---

# 96. DATABASE TESTS

Directory:

```text
supabase/tests/database/
├── 001_schema.sql
├── 010_rls_cases.sql
├── 020_rls_cross_org.sql
├── 030_phenotype_immutability.sql
├── 040_target_immutability.sql
├── 050_signed_decision.sql
├── 060_research_boundary.sql
└── 070_audit.sql
```

---

# 97. PGTAP CROSS-ORG TEST

Conceptually:

```sql
begin;

select plan(1);

-- set JWT claims to synthetic specialist A

select set_config(
  'request.jwt.claim.sub',
  '<SPECIALIST_A_UUID>',
  true
);

select is(
  (
    select count(*)
    from clinical.cases
    where case_code =
      'SYN-CROSS-ORG-001'
  ),
  0::bigint,
  'ORG-A specialist cannot access ORG-B case'
);

select * from finish();

rollback;
```

Exact Auth/JWT helper implementation should be centralized in a test helper SQL file.

---

# 98. IMMUTABILITY DB TEST

1. Create approved phenotype.

2. Attempt:

```sql
update clinical.phenotype_snapshots
set payload =
  '{"tampered":true}'
where id = ...;
```

Expected:

# exception.

---

# 99. SIGNED DECISION TEST

1. Sign decision.

2. Attempt:

```sql
update targeting.clinician_decisions
set final_reasoning =
  'Changed after signing'
where id = ...;
```

Expected:

# exception.

---

# 100. TARGET DIRECT INSERT TEST

Authenticated browser role attempts:

```sql
insert into targeting.target_candidates ...
```

Expected:

# denied.

Only publication function may create candidates.

---

# 101. RESEARCH BOUNDARY TEST

Inject a development fixture candidate with:

```text
evidenceTier = R
```

Target Engine expected:

```text
eligible = false
```

and no `slateRole`.

This is tested both:

- in Target Engine;
- in persistence contract.

---

# 102. PLAYWRIGHT TEST CASES

```text
E2E-001
Login.

E2E-002
Open G01.

E2E-003
Approve phenotype.

E2E-004
Generate evidence-only slate.

E2E-005
G02 shows personalised Primary 1 +
counterfactual Additional A.

E2E-006
G03 explains why personalisation was not adopted.

E2E-007
G04 shows low reliability prominently.

E2E-008
G05 contains distinct Primary 2 anxiosomatic target.

E2E-009
Evidence drawer shows supporting and limiting evidence.

E2E-010
Reject Primary 1.

E2E-011
Select no target.

E2E-012
Sign decision.

E2E-013
Signed decision cannot be edited.

E2E-014
New phenotype makes prior slate stale.

E2E-015
ORG-A cannot navigate to ORG-B case.
```

---

# 103. AUTOMATION-BIAS E2E ASSERTIONS

Automated DOM assertions:

### No selected radio/button on decision entry.

### No text `Recommended Target`.

### No numeric `confidence %`.

### `Why this may be wrong` exists for every selected candidate.

### Counterfactual is present when personalisation is adopted.

### Reliability appears on personalised candidate card.

### Synthetic/Research warning remains visible.

---

# 104. TARGET ENGINE GOLDEN CI

`.github/workflows/golden-target-engine.yml`

```yaml
name: Golden Target Engine

on:
  pull_request:
  push:
    branches:
      - main

permissions:
  contents: read

jobs:
  golden:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm --filter @magniom/target-engine test:golden
```

Before Clinical Release infrastructure exists, major action tags are acceptable for the engineering slice; enterprise release workflows should subsequently pin approved actions to immutable SHAs as specified in the CI/CD specification.

---

# 105. STATIC + UNIT CI

`.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm lint

      - run: pnpm typecheck

      - run: pnpm test

      - run: pnpm build
```

---

# 106. DATABASE CI

`.github/workflows/database-tests.yml`

```yaml
name: Database Tests

on:
  pull_request:
  push:
    branches:
      - main

permissions:
  contents: read

jobs:
  database:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: supabase/setup-cli@v1

      - run: supabase start

      - run: supabase db reset

      - run: supabase db lint

      - run: supabase test db

      - if: always()
        run: supabase stop
```

Supabase's current CLI explicitly supports pgTAP database tests through this workflow model.

---

# 107. WEB E2E CI

`.github/workflows/web-e2e.yml`

```yaml
name: Web E2E

on:
  pull_request:

permissions:
  contents: read

jobs:
  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - uses: supabase/setup-cli@v1

      - run: pnpm install --frozen-lockfile

      - run: supabase start

      - run: supabase db reset

      - run: pnpm exec playwright install --with-deps chromium

      - run: pnpm --filter @magniom/web build

      - run: pnpm --filter @magniom/web test:e2e

      - if: always()
        run: supabase stop
```

The web package should use Playwright's `webServer` configuration to start the built Next.js application.

---

# 108. RELEASE-CANDIDATE BUILD

Even the synthetic slice should prove:

# build once.

Create:

`.github/workflows/release-candidate.yml`

Manual only:

```yaml
name: Synthetic Release Candidate

on:
  workflow_dispatch:

permissions:
  contents: read
  id-token: write
  attestations: write

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm verify:vertical-slice

      - run: pnpm build

      # Build immutable container/artifact here.
      # Clinical implementation later adds SBOM,
      # attestation and registry promotion.
```

GitHub artifact attestations can later bind build artifacts to the repository, commit and workflow and can also carry SBOM attestations.

---

# 109. NO REAL DATA IN CI

A CI policy test should grep/scan fixtures for:

- genuine-looking emails;
- DOBs;
- medical record numbers;
- names not beginning with synthetic test conventions.

All fixtures must clearly identify themselves as synthetic.

---

# 110. SYNTHETIC CASE SEED

`supabase/seed/synthetic.sql` creates:

```text
ORG-A

G01
G02
G03
G04
G05

ORG-B
SYN-CROSS-ORG-001
```

The actual phenotype/connectome JSON should be loaded from canonical fixture generation rather than maintained manually in both:

```text
validation/golden-cases/
```

and:

```text
seed SQL.
```

---

# 111. FIXTURE GENERATION

Create:

```text
packages/test-fixtures/src/generate-seed.ts
```

which reads canonical Golden JSON and produces:

```text
supabase/seed/generated-golden.sql
```

CI verifies generated file is current.

This prevents fixture drift.

---

# 112. SINGLE SOURCE OF TRUTH

Golden fixture JSON:

# authoritative.

Database synthetic seed:

# generated derivative.

Playwright expected fixture:

# imports same package.

No three independent copies.

---

# 113. EVIDENCE BUNDLE LOADER

```ts
export interface EvidenceReleaseBundle {
  releaseCode: string;

  version: string;

  claims: EvidenceClaim[];

  circuits: TherapeuticCircuit[];

  targetFamilies: TargetFamily[];

  symptomCircuitMappings:
    SymptomCircuitMapping[];
}

export async function
loadEvidenceReleaseBundle(
  supabase: SupabaseClient,
  releaseId: string
): Promise<EvidenceReleaseBundle>;
```

After loading, validate with Zod.

---

# 114. EVIDENCE CEILING

Target Engine helper:

```ts
export function isClinicalStyleEligible(
  tier: EvidenceTier,
  policy: ScientificPolicy
): boolean {
  return (
    policy
      .permittedClinicalEvidenceTiers
      .includes(tier)
  );
}
```

Even though the vertical slice uses a development Evidence Library, it exercises the same A/B ceiling.

---

# 115. TARGET FAMILY LOOKUP

No Target Engine switch statement such as:

```ts
if (code === "L8Av") researchOnly
```

Eligibility comes from:

```text
EvidenceReleaseBundle.
```

This proves the graph-driven architecture.

---

# 116. INPUT CONTEXT HASH

Before execution:

```ts
const inputHash =
  sha256Canonical({
    phenotype:
      phenotype.payloadSha256,

    evidence:
      evidence.manifestSha256,

    connectome:
      connectome?.payloadSha256 ?? null,

    policy:
      sha256Canonical(policy),

    engineVersion:
      TARGET_ENGINE_VERSION,
  });
```

Persist this.

---

# 117. STALE TARGET PROTECTION

When a new PhenotypeSnapshot is approved:

```text
cases.current_target_slate_id = null
```

The historical Target Slate remains in database.

The previous signed decision remains historical if one exists.

A new decision cannot be signed against the old Slate.

---

# 118. CASE VERSION DISPLAY

Every Target Slate view shows:

```text
Phenotype
Snapshot 2

Evidence
MAGNIOM-EVIDENCE-DEV-1.0.0

Target Engine
MAGNIOM-TARGET-ENGINE-0.1.0-SYNTHETIC

Scientific Policy
MAGNIOM-POLICY-0.1.0-SYNTHETIC
```

---

# 119. NO “AI”

The Synthetic Vertical Slice does not use an LLM.

Do not display:

- AI analysis;
- AI confidence;
- AI recommendation.

This first build proves that the core clinical system is deterministic and inspectable independently of generative AI.

---

# 120. ERROR HANDLING

Scientific validation errors use typed codes:

```ts
type TargetEngineErrorCode =
  | "PHENOTYPE_NOT_APPROVED"
  | "INDICATION_NOT_SUPPORTED"
  | "EVIDENCE_RELEASE_INVALID"
  | "CONNECTOME_SCHEMA_INVALID"
  | "NO_ELIGIBLE_TARGET_FAMILY"
  | "SCIENTIFIC_POLICY_INVALID";
```

Do not throw opaque:

```text
Something went wrong.
```

internally.

UI may render a clearer description.

---

# 121. LOGGING

Application logs may contain:

- synthetic case code;
- operation;
- release versions;
- correlation ID.

Never log full phenotype JSON by default.

The same design will later protect real PHI.

---

# 122. CORRELATION ID

Every target-generation request receives:

```text
correlationId
```

carried through:

- server action;
- Target Engine invocation;
- audit;
- errors.

---

# 123. SYNTHETIC AUDIT ACCEPTANCE

For G02, audit timeline must contain:

```text
PHENOTYPE_APPROVED
TARGET_SLATE_GENERATED
TARGET_DECISION_SIGNED
```

with:

- correct user;
- correct case;
- timestamps;
- entity IDs.

---

# 124. UI STATES TO IMPLEMENT

Every case route must support:

### Loading.

### Empty.

### Ready.

### Blocked.

### Stale.

### Signed.

Avoid only implementing the happy path.

---

# 125. BLOCKED PHENOTYPE STATE

Before phenotype approval:

Targets page:

```text
Target analysis unavailable

An approved Phenotype Snapshot is required before
Magniom can generate target hypotheses.

[Review phenotype]
```

No Generate button.

---

# 126. G03 UI ACCEPTANCE

Target page must say, substantively:

> Patient-specific connectivity was available and reliable, but the measured improvement over the evidence-only reference did not meet this synthetic build's incremental-value criterion.

This is one of the most important vertical-slice demonstrations.

---

# 127. G04 UI ACCEPTANCE

Must say:

> Patient-specific connectivity identified a different location, but the measurement did not meet the reliability criterion required to influence ranking.

The dramatic coordinate must not be highlighted more strongly than the retained evidence anchor.

---

# 128. G05 UI ACCEPTANCE

Must distinguish:

```text
Primary 1
Evidence anchor / connectome refinement

Primary 2
Anxiosomatic symptom-circuit hypothesis
```

Both are substantial cards.

Primary 2 must not appear as:

```text
second-best target.
```

---

# 129. NO PRIMARY 3 ACCEPTANCE

All five Golden Cases should show:

```text
Primary 3
No additional distinct primary hypothesis
```

or omit the empty card while explaining that no third primary was justified.

This proves:

# 3 is a maximum, not a quota.

---

# 130. ACCESSIBILITY ACCEPTANCE

Critical workflows pass:

- keyboard navigation;
- visible focus;
- semantic headings;
- form labels;
- error association;
- no colour-only meaning.

Target role and reliability must be available as text.

---

# 131. SECURITY ACCEPTANCE

The slice fails acceptance if any of these are possible:

### ORG-A reads ORG-B.

### Browser inserts TargetCandidate directly.

### Browser updates published Target Slate.

### Approved phenotype payload mutates.

### Signed decision mutates.

### Audit event deletes.

### Stale Slate signs.

### Research-tier candidate receives a clinical-style Slate role.

---

# 132. SCIENTIFIC ACCEPTANCE

The slice fails if:

### G01 cannot produce evidence-only targeting.

### G02 does not adopt qualified personalisation.

### G03 adopts low-incremental-value personalisation.

### G04 allows unreliable FC to override baseline.

### G05 does not generate distinct anxiosomatic Primary 2.

### Any Golden output is nondeterministic.

### Any candidate loses its evidence path.

### Personalised candidates omit the personalised-targeting limitation.

---

# 133. UX ACCEPTANCE

The slice fails if:

### Primary 1 is preselected for acceptance.

### The UI calls Primary 1 the recommended target.

### A numeric clinical confidence percentage appears.

### `Why this may be wrong` is absent.

### Evidence-only counterfactual is absent from G02.

### Research/Synthetic status can be mistaken for Clinical Mode.

### Clinician cannot reject Primary 1.

### Clinician cannot select no target.

---

# 134. DATABASE ACCEPTANCE

Required command:

```bash
supabase db reset
```

must reconstruct the complete working environment from:

- migrations;
- reference seed;
- generated synthetic seed.

No manual Dashboard operation.

---

# 135. CI ACCEPTANCE

A fresh clone must pass:

```bash
pnpm install --frozen-lockfile

pnpm verify:vertical-slice
```

without:

- local secrets beyond documented synthetic development settings;
- manual database operations;
- hand-created users/data.

---

# 136. VERTICAL SLICE ACCEPTANCE MATRIX

| ID | Requirement | Verification |
|---|---|---|
| VS-001 | Fresh repo builds | CI |
| VS-002 | DB reconstructs from zero | Supabase CI |
| VS-003 | G01 evidence-only | Golden |
| VS-004 | G02 qualified personalisation | Golden |
| VS-005 | G03 incremental-value rejection | Golden |
| VS-006 | G04 reliability rejection | Golden |
| VS-007 | G05 anxiosomatic Primary 2 | Golden |
| VS-008 | 100-run deterministic hash | Vitest |
| VS-009 | Research tier blocked | Property + DB |
| VS-010 | Cross-org read blocked | pgTAP |
| VS-011 | Direct target insert blocked | pgTAP |
| VS-012 | Approved phenotype immutable | pgTAP |
| VS-013 | Signed decision immutable | pgTAP |
| VS-014 | Stale Slate cannot sign | pgTAP + E2E |
| VS-015 | Counterfactual visible | Playwright |
| VS-016 | Reliability visible | Playwright |
| VS-017 | Conflicting evidence visible | Playwright |
| VS-018 | Primary 1 can be rejected | Playwright |
| VS-019 | No-target decision possible | Playwright |
| VS-020 | No candidate preselected | Playwright |
| VS-021 | No numeric clinical confidence | DOM test |
| VS-022 | Synthetic banner persistent | Playwright |
| VS-023 | Target versions visible | Playwright |
| VS-024 | Audit trail complete | integration |
| VS-025 | Candidate suppression retained | Golden + DB |
| VS-026 | Evidence path reconstructable | unit/integration |
| VS-027 | Target Engine absent from browser bundle | build inspection |
| VS-028 | No real patient data in fixture set | CI policy |
| VS-029 | Production/Clinical flag unavailable | configuration test |
| VS-030 | Release candidate package reproducible | CI |

---

# 137. DEFINITION OF DONE

The Synthetic Vertical Slice is complete only when:

```text
VS-001 through VS-030
=
PASS
```

and a TMS specialist can complete the following synthetic workflow unaided:

```text
Open G02
    ↓
Review assessment
    ↓
Approve phenotype
    ↓
Inspect synthetic connectome
    ↓
Generate Target Slate
    ↓
Understand why personalisation was adopted
    ↓
See evidence-only target
    ↓
See reliability
    ↓
See evidence limitation
    ↓
Reject or accept candidate
    ↓
Document alternative decision
    ↓
Sign
    ↓
Inspect immutable audit history
```

---

# 138. DEMONSTRATION SCENARIO

The first internal demonstration should not begin with G02.

Start with:

# G03.

Why?

Because the most convincing proof of Magniom's architecture is not:

> “Look, the software personalised the target.”

It is:

> **“The software had patient-specific connectivity available and deliberately refused to use it because it did not add enough scientifically defensible information.”**

Then show:

# G04

where a dramatic connectomic finding is rejected because reliability is inadequate.

Only then show:

# G02

where personalisation earns adoption.

This demonstrates Magniom's scientific philosophy much more powerfully than a simple recommendation demo.

---

# 139. SECOND IMPLEMENTATION SLICE

Only after this first slice passes should development proceed to:

# Magniom Precomputed Connectome Integration Slice v0.2

That build replaces hand-authored synthetic connectome objects with real, externally prepared de-identified connectomic outputs.

Everything downstream remains unchanged:

```text
Phenotype
Evidence
Target Engine
Target Slate
Clinician Decision
Audit
```

This tests the most important architectural property:

# neuroimaging is an input to Magniom, not the definition of Magniom.

---

# 140. THIRD IMPLEMENTATION SLICE

Then:

# Native NeuroCompute v0.3

introducing:

```text
DICOM
→ BIDS
→ structural processing
→ BOLD preprocessing
→ FC
→ circuit maps
→ reliability
→ existing ConnectomeTargetInput contract
```

If native NeuroCompute requires the Target Engine or UI to invent new clinical semantics:

# the architecture has failed.

---

# 141. FOURTH SLICE

Then:

# Spatial & 3D Review v0.4

introducing:

- subject cortical surface;
- target region;
- confidence region;
- circuit overlays;
- counterfactual target.

The clinical decision workflow remains unchanged.

---

# 142. WHY THIS BUILD ORDER MATTERS

After Slice 1, Magniom will already possess its defining characteristics:

### evidence-constrained reasoning;

### clinician-approved phenotype;

### patient-specific refinement;

### reliability gating;

### counterfactual target;

### competing hypotheses;

### explicit uncertainty;

### clinician override;

### immutable provenance.

Everything added afterward makes those conclusions:

# more scientifically informed,

not fundamentally different.

That is the correct implementation architecture.

---

# 143. FINAL IMPLEMENTATION PRINCIPLE

The first Magniom build should not try to prove:

> **“We can process an fMRI scan.”**

Many systems can process an fMRI scan.

It should prove:

> **“We can take a clinically governed phenotype, a versioned evidence model and patient-specific measurements; construct a deterministic set of defensible target hypotheses; refuse unjustified personalisation; show exactly what personalisation changed; expose the evidence against our own result; allow the specialist to disagree; and preserve the complete reasoning chain immutably.”**

Once that works with synthetic data, the neuroimaging pipeline has a precise and testable contract to fulfil.

---

# 144. MAGNIOM SYNTHETIC VERTICAL SLICE MANIFESTO

# Start without real patients.

# Start without native MRI.

# Start without an LLM.

# Start without a glowing brain.

# Prove the clinical semantics first.

# Prove the evidence ceiling first.

# Prove deterministic targeting first.

# Prove refusal to personalise first.

# Prove reliability can defeat connectivity.

# Prove five targets are never mandatory.

# Prove the evidence-only counterfactual survives personalisation.

# Prove the clinician can disagree.

# Prove the clinician can select nothing.

# Prove signing is immutable.

# Prove another organisation cannot see the case.

# Prove the database can be rebuilt from source.

# Prove every Golden Case in CI.

# Then connect Magniom to the brain.

That is the **Magniom Synthetic Vertical Slice Implementation Specification v1.0**.