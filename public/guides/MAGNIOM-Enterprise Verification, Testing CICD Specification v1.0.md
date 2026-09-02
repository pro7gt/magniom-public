# MAGNIOM
## Enterprise Verification, Testing & CI/CD Specification v1.0

**Document status:** Canonical engineering, verification and controlled-release specification  
**Date:** 1 September 2026  
**System:** Magniom  
**Primary implementation:** Next.js + Supabase + deterministic Target Engine + Python NeuroCompute services  
**Initial deployment mode:** Research / validation  
**Ultimate deployment mode:** Controlled Clinical Mode

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
- Magniom Implementation & Validation Roadmap v1.0

---

# 1. PURPOSE

This specification defines how every Magniom change is:

- developed;
- reviewed;
- tested;
- scientifically evaluated;
- security-scanned;
- built;
- identified;
- attested;
- promoted;
- deployed;
- verified;
- monitored;
- rolled back or superseded;
- traced into the quality system.

It applies not only to application source code.

It applies equally to:

- database migrations;
- Row Level Security policies;
- Target Engine logic;
- Target Engine parameters;
- Scientific Policy;
- phenotype ontology;
- Evidence Library;
- Evidence Tier changes;
- therapeutic-circuit maps;
- target search masks;
- atlases;
- normative models;
- NeuroCompute algorithms;
- preprocessing configuration;
- dependency updates;
- container images;
- deployment infrastructure;
- clinician-facing UX;
- report templates.

The governing principle is:

# No clinically meaningful change is “just configuration.”

---

# 2. CI/CD PHILOSOPHY

For Magniom:

# CI/CD means Continuous Integration, Continuous Verification and Controlled Delivery.

It does **not** mean:

# Continuous automatic deployment to Clinical Mode.

Normal software changes should be integrated rapidly.

Clinical releases should be:

- deliberate;
- evidence-backed;
- reproducible;
- independently approved.

---

# 3. PRIMARY RELEASE PRINCIPLE

The core deployment rule is:

# Build once.

# Test the built artifact.

# Promote the identical artifact by cryptographic digest.

Do not:

```text
Build staging image
       ↓
test staging
       ↓
rebuild "same version"
       ↓
deploy production
```

Instead:

```text
Canonical source
       ↓
Controlled build
       ↓
Immutable artifact
       ↓
Verification
       ↓
Scientific Validation
       ↓
Clinical Staging
       ↓
Clinical Production
```

The digest remains unchanged throughout promotion.

---

# 4. CLINICAL RELEASE IS A SYSTEM CONFIGURATION

A Magniom Clinical Release is not only:

```text
web application version
```

It is the combination:

```text
Web Application
+
Database Schema
+
Target Engine
+
Scientific Policy
+
Phenotype Ontology
+
Evidence Library
+
Therapeutic Circuit Artifacts
+
Atlas Versions
+
Normative Model
+
NeuroCompute Pipeline
+
E-field Pipeline where applicable
+
UX release
+
Infrastructure configuration
```

This combination receives one canonical:

# Clinical Release Manifest.

---

# 5. CANONICAL RELEASE IDENTITY

Example:

```text
MAGNIOM-1.0.0

Web
1.0.0
sha256:...

Workflow Worker
1.0.0
sha256:...

Target Engine
1.0.0
sha256:...

Scientific Policy
1.0.0
sha256:...

Phenotype Ontology
1.0.0
sha256:...

Evidence Library
1.0.0
sha256:...

NeuroCompute
1.0.0
sha256:...

Normative Model
1.0.0
sha256:...

Circuit Artifact Set
1.0.0
sha256:...

Database Migration Head
20260901_040

Git Commit
abc123...

Build Attestation
...

SBOM
sha256:...
```

---

# 6. RELEASE REPRODUCIBILITY

Given the Clinical Release Manifest, Magniom must be able to determine:

### Which source commit was used?

### Which build workflow created the artifact?

### Which dependencies were included?

### Which database schema was active?

### Which Evidence Library was active?

### Which circuit maps were used?

### Which scientific thresholds were used?

### Which NeuroCompute image processed the MRI?

### Which tests were performed?

### Who approved release?

### Which patients/cases were processed under that release?

This is mandatory for clinical traceability.

---

# 7. SOURCE CONTROL PLATFORM

Recommended:

# GitHub Enterprise Cloud

or an equivalently governed enterprise source-control and CI platform.

Required capabilities:

- protected branches;
- CODEOWNERS;
- required checks;
- protected environments;
- deployment approvals;
- audit logs;
- short-lived deployment credentials;
- artifact provenance;
- secret scanning;
- dependency scanning.

---

# 8. REPOSITORY MODEL

Recommended monorepo:

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
│   ├── scientific-policy/
│   ├── target-engine/
│   ├── presentation/
│   ├── ui/
│   └── test-fixtures/
│
├── services/
│   ├── neurocompute/
│   ├── workflow-worker/
│   ├── report-worker/
│   └── efield/
│
├── supabase/
│   ├── migrations/
│   ├── seed/
│   ├── tests/
│   └── config.toml
│
├── evidence/
│
├── scientific-config/
│
├── validation/
│
├── infra/
│
├── docs/
│
└── .github/
```

---

# 9. BRANCH STRATEGY

Recommended:

# trunk-based development with short-lived feature branches.

Primary protected branch:

```text
main
```

Release tags:

```text
magniom-v1.0.0
magniom-v1.0.1
```

Do not maintain long-running:

```text
develop
```

unless operational complexity genuinely requires it.

---

# 10. FEATURE BRANCHES

Naming:

```text
feature/...
fix/...
scientific/...
evidence/...
security/...
migration/...
validation/...
```

Branches are short-lived.

All clinically relevant history is preserved in commits, PRs and controlled release records.

---

# 11. DIRECT PUSH

Direct push to:

```text
main
```

is prohibited.

All changes require:

# Pull Request.

Emergency exceptions require:

- documented incident;
- authorised role;
- retrospective review.

---

# 12. FORCE PUSH

Force push to protected branches:

# prohibited.

---

# 13. CODEOWNERS

Define owners by safety domain.

Example:

```text
/packages/target-engine/         @target-engine @clinical-science
/scientific-config/              @clinical-science @quality
/evidence/                       @evidence-governance
/services/neurocompute/          @neuroimaging
/supabase/migrations/            @backend @database-security
/supabase/tests/                 @backend @quality
/apps/web/**/decision/            @frontend @clinical-human-factors
/packages/ui/                    @frontend
/infra/                          @platform-security
/.github/workflows/              @platform-security @quality
```

---

# 14. REVIEW INDEPENDENCE

Certain changes require independent approval.

Examples:

## Target Engine scientific logic

Developer approval alone is insufficient.

Requires:

- engineering reviewer;
- scientific reviewer.

## Evidence Tier change

Requires:

- evidence reviewer;
- scientific/clinical approver.

## Clinical production release

Initiator must not be sole approver.

---

# 15. CHANGE CLASSIFICATION

Every Pull Request receives a machine-readable classification.

Canonical classes:

```text
C0_DOCS
C1_PRESENTATION
C2_APPLICATION
C3_DATABASE
C4_SECURITY
C5_CLINICAL_WORKFLOW
C6_EVIDENCE
C7_SCIENTIFIC_POLICY
C8_TARGET_ENGINE
C9_NEUROCOMPUTE
C10_SCIENTIFIC_ARTIFACT
C11_INFRASTRUCTURE
C12_REGULATORY
```

More than one class may apply.

---

# 16. AUTOMATIC CHANGE DETECTION

CI determines change classes from path rules.

Example:

```text
packages/target-engine/**
→ C8

scientific-config/**
→ C7

evidence/**
→ C6

services/neurocompute/**
→ C9

supabase/migrations/**
→ C3

apps/web/**/decision/**
→ C5
```

The developer may add a higher classification.

They may not downgrade an automatically detected high-risk classification without authorised review.

---

# 17. SCIENTIFIC CHANGE

Any change capable of altering:

- candidate eligibility;
- candidate coordinates;
- Evidence Tier;
- target ranking;
- reliability;
- personalisation;
- Target Slate composition;
- abstention;
- clinical explanation semantics

is:

# a Scientific Change.

Scientific Changes receive additional verification regardless of whether implemented in:

- TypeScript;
- Python;
- SQL;
- JSON;
- NIfTI;
- YAML.

---

# 18. EXAMPLES OF SCIENTIFIC CHANGES

The following are Scientific Changes:

```text
Reliability threshold 0.65 → 0.60

New therapeutic circuit

Changed sgACC ROI

New NIfTI circuit map

Changed search-space mask

Changed candidate clustering rule

Changed GSR policy

Changed motion threshold

Changed temporal filtering

Changed atlas

Changed normative model

Evidence Tier B → A

Changed phenotype-to-circuit mapping

Changed ranking weight

Changed redundancy threshold
```

---

# 19. NON-SCIENTIFIC CHANGE

Example:

```text
button padding 12px → 14px
```

may be non-scientific.

But:

```text
Primary 1 card made visually dominant
```

is potentially a:

# Human Factors / Clinical Workflow Change.

Risk classification depends on effect, not programming effort.

---

# 20. PULL REQUEST TEMPLATE

Every PR must state:

### What changed?

### Why?

### Change classification.

### Requirements affected.

### Risks affected.

### Scientific output expected to change?

### Database migration?

### Security impact?

### Human-factors impact?

### Evidence impact?

### Tests added/updated.

### Validation impact.

### Rollback considerations.

---

# 21. SCIENTIFIC PR DECLARATION

Scientific changes additionally answer:

> **Which Golden Cases should change?**

If answer:

```text
None
```

but CI detects changed Golden output:

# PR fails pending investigation.

---

# 22. REQUIREMENT TRACEABILITY

PRs reference requirement IDs such as:

```text
MAG-TGT-032
MAG-IMG-018
MAG-UX-041
MAG-SEC-009
```

CI validates references for higher-risk change classes.

---

# 23. RISK TRACEABILITY

Clinically significant changes should reference risk controls.

Example:

```text
Risk:
AB-03 Automation bias

Control:
MAG-UX-031 No default candidate acceptance

Verification:
HF-TEST-017
```

---

# 24. ENVIRONMENT TOPOLOGY

Magniom uses seven logical environments.

```text
LOCAL
PR PREVIEW
INTEGRATION
SCIENTIFIC VALIDATION
RESEARCH
CLINICAL STAGING
CLINICAL PRODUCTION
```

These are not interchangeable.

---

# 25. LOCAL

Data:

# synthetic only.

Purpose:

- developer work;
- unit tests;
- local Supabase;
- local containers.

No:

- real patient data;
- research clinical data.

---

# 26. PR PREVIEW

Ephemeral per-PR environment.

Contains:

- synthetic database;
- synthetic Auth users;
- synthetic Storage;
- synthetic Target Slates.

Purpose:

- UI review;
- integration tests;
- migration testing.

No production data.

---

# 27. INTEGRATION

Persistent controlled environment.

Contains:

- synthetic data;
- approved non-clinical reference data.

Purpose:

- service-to-service integration;
- queue testing;
- workflow;
- release candidate integration.

---

# 28. SCIENTIFIC VALIDATION

Highly controlled.

Contains:

- de-identified validation imaging;
- approved scientific reference datasets;
- locked Golden Imaging cases.

Purpose:

- scientific verification;
- NeuroCompute regression;
- Target Engine impact analysis;
- reproducibility.

Not a clinician treatment environment.

---

# 29. RESEARCH

Approved Research Mode.

May contain:

- consented/approved research data;
- de-identified or identifiable data according to approved governance.

Magniom output may be investigated.

It may not automatically become routine treatment guidance.

---

# 30. CLINICAL STAGING

Production-equivalent application and infrastructure configuration.

Data:

- synthetic Clinical Mode cases;
- approved dedicated validation fixtures.

Purpose:

- exact release rehearsal;
- deployment verification;
- production smoke testing.

Clinical patient data should not normally be required.

---

# 31. CLINICAL PRODUCTION

Contains real clinical records.

Only approved Clinical Releases may operate here.

No experimental builds.

No developer debugging deployments.

---

# 32. ENVIRONMENT ISOLATION

Each environment must have separate:

- database;
- storage;
- credentials;
- service identities;
- signing/deployment authority;
- secrets.

Never use:

# production service-role credential

inside validation.

---

# 33. PRODUCTION DATA IN PREVIEW ENVIRONMENTS

Prohibited.

Supabase preview branches should be:

# data-less by default

and populated from synthetic seeds.

---

# 34. CI RUNNER CLASSES

Use separate runner classes.

## Standard CI Runner

For:

- build;
- lint;
- unit tests;
- synthetic integration;
- Supabase local;
- security scanning.

May use hosted runners.

## Scientific Validation Runner

For:

- de-identified MRI;
- high-memory/GPU workloads;
- full NeuroCompute.

Must be tightly controlled.

---

# 35. UNTRUSTED PR RULE

Untrusted or fork-originated PR code must never execute on a runner that has access to:

- research clinical datasets;
- Scientific Validation datasets requiring controlled access;
- production networks;
- production credentials.

This is a hard security boundary.

---

# 36. SCIENTIFIC RUNNER SECURITY

Scientific Validation runners should use:

- isolated network segment;
- ephemeral execution where feasible;
- minimal outbound internet;
- no persistent deployment secrets;
- approved mounted datasets;
- audit logging;
- artifact allow-list.

---

# 37. DATA IN CI

Ordinary CI may use only:

- synthetic clinical cases;
- synthetic connectivity matrices;
- synthetic cortical meshes;
- legally redistributable reference assets;
- tiny constructed imaging fixtures.

Clinical patient data are forbidden.

---

# 38. WORKFLOW GOVERNANCE

CI workflow files themselves are high-risk code.

Changes to:

```text
.github/workflows/**
```

require review from:

- platform/security owner;
- quality/release owner.

---

# 39. THIRD-PARTY ACTIONS

Third-party CI actions should be:

- deliberately approved;
- pinned to immutable commit SHA for controlled workflows;
- periodically reviewed.

Avoid:

```text
uses: random/action@main
```

in release workflows.

---

# 40. DEPENDENCY LOCKING

JavaScript:

- lockfile committed;
- frozen install in CI.

Python:

- reproducible lock/constraints;
- hashes where feasible.

Containers:

- base images referenced by immutable digest for Clinical Release builds.

Scientific assets:

- referenced by version + SHA-256.

---

# 41. “LATEST” PROHIBITION

Clinical Release build definitions must not use unbounded dependencies such as:

```text
fmriprep:latest
python:latest
node:latest
```

Every clinically meaningful dependency is pinned.

---

# 42. DEPENDENCY UPDATE BOT

Automated update tooling may open PRs.

It may not merge scientific/runtime dependency upgrades automatically.

Updates trigger:

- ordinary regression;
- scientific regression where relevant.

---

# 43. CI PIPELINE OVERVIEW

Canonical PR pipeline:

```text
PR OPENED
   ↓
Change Classification
   ↓
Policy Validation
   ↓
Static Verification
   ↓
Unit Tests
   ↓
Property / Invariant Tests
   ↓
Database Rebuild + DB Tests
   ↓
Integration Tests
   ↓
Golden Cases
   ↓
Security / Supply Chain
   ↓
Web E2E
   ↓
Scientific Impact Gate if applicable
   ↓
PR Preview
   ↓
Required Human Review
```

---

# 44. STAGE 0 — PR POLICY

Checks:

- PR template complete;
- linked requirement;
- change class;
- scientific declaration if needed;
- migration naming;
- forbidden file rules;
- CODEOWNERS.

Failure blocks further promotion.

---

# 45. STAGE 1 — STATIC VERIFICATION

TypeScript:

- formatting;
- ESLint;
- `tsc --noEmit`;
- strict mode;
- unused exports where practical.

Python:

- formatting;
- lint;
- type check;
- import validation.

SQL:

- migration syntax;
- database linting.

---

# 46. TARGET ENGINE STATIC RULES

Prohibit:

- `Math.random()` in Clinical Target Engine;
- current-time-dependent ranking;
- external network requests;
- untyped `any` in scientific domain logic;
- hidden runtime feature flags altering ranking.

A custom static rule/test may enforce these.

---

# 47. STAGE 2 — UNIT TESTS

Run:

```text
packages/domain
packages/schemas
packages/phenotype
packages/evidence
packages/target-engine
packages/presentation
apps/web
services
```

Tests should be:

- deterministic;
- isolated;
- fast.

---

# 48. UNIT TEST COVERAGE

Do not use one simplistic line-coverage number as the safety criterion.

Critical requirements must have:

# explicit requirement-to-test traceability.

Coverage metrics may identify gaps.

They do not prove adequate verification.

---

# 49. STAGE 3 — PROPERTY TESTS

Target Engine property tests include:

### Lower reliability cannot improve personalisation eligibility.

### Failed QC cannot improve ranking.

### Research-only evidence cannot enter Clinical Mode.

### Adding a duplicate candidate cannot create a new Primary role.

### Candidate count cannot force Slate count.

### Same canonical input produces same result.

### Evidence baseline remains reconstructable.

### Signed decision cannot mutate.

---

# 50. PROPERTY-BASED TOOLING

Recommended:

TypeScript:

# fast-check

Python:

# Hypothesis

These complement example tests.

---

# 51. STAGE 4 — DATABASE FROM ZERO

CI must create a fresh Supabase/Postgres environment and run:

```text
migration 001
migration 002
...
migration current
```

No hidden manual schema state is permitted.

---

# 52. SUPABASE DATABASE TESTS

Use:

```text
supabase test db
```

with pgTAP for:

- schema;
- constraints;
- RLS;
- permissions;
- functions;
- immutability;
- transition rules.

---

# 53. DATABASE TEST GROUPS

Canonical:

```text
supabase/tests/database/
├── identity/
├── clinical/
├── phenotype/
├── evidence/
├── imaging/
├── targeting/
├── workflow/
├── audit/
├── security/
├── storage/
└── migrations/
```

---

# 54. RLS ALLOW TEST

Example:

```text
Clinician organisation A
+
case organisation A
+
case.read permission
→ SELECT allowed.
```

---

# 55. RLS DENY TESTS

Mandatory:

```text
Organisation A user
→ Organisation B patient
DENIED

Organisation admin
without clinical permission
→ patient MRI
DENIED

Researcher
→ identifiable Clinical Production case
DENIED

Inactive membership
→ case
DENIED

Anonymous user
→ clinical table
DENIED
```

---

# 56. PRIVILEGE ESCALATION TEST

Attempt to forge:

- organisation ID;
- clinician ID;
- role;
- Target Slate ID.

Authoritative server/database identity must override user input.

---

# 57. IMMUTABILITY TESTS

CI attempts:

```text
UPDATE phenotype snapshot

UPDATE published Target Slate

DELETE published Target Slate

UPDATE signed ClinicianDecision

DELETE audit event

UPDATE active EvidenceClaim version
```

Every prohibited operation must fail.

---

# 58. STATE-TRANSITION TESTS

Test valid and invalid transitions.

Example:

```text
draft
→ phenotype_ready
VALID

draft
→ decision_signed
INVALID
```

---

# 59. CONCURRENCY TESTS

Test:

- simultaneous phenotype approval;
- duplicate target-generation request;
- double decision sign;
- duplicate queue worker;
- stale expected case version.

Clinical workflow must remain coherent.

---

# 60. MIGRATION TEST — CLEAN BUILD

Every PR with DB change must pass:

```text
supabase db reset
```

or equivalent clean reconstruction.

---

# 61. MIGRATION TEST — UPGRADE

Also test from:

# currently released schema

to:

# proposed schema.

A migration that works on an empty database may still fail against historical data.

---

# 62. PRODUCTION-LIKE MIGRATION FIXTURES

Maintain synthetic historical datasets representing:

- old cases;
- signed decisions;
- older Evidence Library versions;
- superseded Target Slates.

Apply migration and verify preservation.

---

# 63. DESTRUCTIVE MIGRATION DETECTION

CI flags:

```text
DROP COLUMN
DROP TABLE
ALTER TYPE
NOT NULL without backfill
destructive enum changes
```

for mandatory senior review.

---

# 64. EXPAND–MIGRATE–CONTRACT

Preferred database change pattern:

```text
Release N
Add new schema capability
       ↓
Release N/N+1
Backfill / dual-read if needed
       ↓
Verify
       ↓
Later Release
Remove obsolete structure
```

Avoid destructive single-step deployments.

---

# 65. HISTORICAL CLINICAL DATA

Never rewrite historical scientific meaning merely to simplify a migration.

Example:

Do not update every historical target to:

```text
Evidence Library = 2.0
```

because the current release uses 2.0.

Historical objects remain pinned.

---

# 66. STAGE 5 — GOLDEN TARGET ENGINE

Execute canonical Synthetic Golden Cases.

Minimum initial suite:

```text
G01–G20
```

from the Implementation Roadmap.

Every case compares:

- candidate list;
- suppression;
- Primary roles;
- counterfactual;
- warnings;
- abstention;
- explanations;
- manifest;
- Slate hash.

---

# 67. GOLDEN CASE OUTPUT TYPES

For each case store:

```text
expected/
  candidates.json
  suppressed.json
  slate.json
  warnings.json
  explanation-facts.json
  manifest.json
  slate.sha256
```

---

# 68. GOLDEN CHANGE DETECTION

If actual output differs:

CI generates:

# Scientific Golden Diff.

Example:

```text
G05 ANXIOSOMATIC-DOMINANT

BEFORE
Primary 1: CAND-17
Primary 2: CAND-31

AFTER
Primary 1: CAND-31
Primary 2: CAND-17

Cause candidate
scientific-policy reliability threshold change
```

The PR cannot hide this inside ordinary test output.

---

# 69. GOLDEN OUTPUT UPDATE

Developers cannot merely:

```text
update snapshots
```

to make CI pass.

Scientific Golden updates require:

- reason;
- Scientific Impact Report;
- authorised review.

---

# 70. STAGE 6 — APPLICATION INTEGRATION

Execute commands against ephemeral Supabase:

```text
create case
→ enter assessment
→ approve phenotype
→ generate synthetic Target Slate
→ review candidate
→ select target
→ sign
```

Verify DB + domain + API integration.

---

# 71. CONTRACT TESTING

Validate contracts among:

```text
Web ↔ Server
Server ↔ Supabase
Workflow ↔ Queue
Worker ↔ DB
NeuroCompute ↔ Target Engine
Evidence Release ↔ Target Engine
```

Schema drift should fail CI.

---

# 72. QUEUE CONTRACT TEST

Every message validates against versioned schema.

Unknown required version:

# reject/fail safely.

Do not let workers silently ignore new fields.

---

# 73. IDEMPOTENCY TEST

Send the same target-generation message twice.

Expected:

- same scientific result;
- no duplicate published Slates;
- idempotent workflow state.

---

# 74. WORKER CRASH TEST

Simulate worker crash after:

- reading message;
- beginning computation;
- before acknowledgment.

Expected:

- job recoverable;
- message redelivered after visibility timeout;
- no corrupt partial scientific record.

---

# 75. STAGE 7 — BROWSER E2E

Recommended:

# Playwright.

Critical scenarios:

```text
E2E-01 login / authorisation
E2E-02 phenotype approval
E2E-03 evidence-only target
E2E-04 personalised target review
E2E-05 counterfactual
E2E-06 conflicting evidence
E2E-07 reject Primary 1
E2E-08 modify target
E2E-09 no-target decision
E2E-10 stale Slate
E2E-11 signing
E2E-12 Research Mode boundary
```

---

# 76. E2E TARGET ASSERTIONS

Do not test only that:

```text
page loaded
```

Test clinical semantics.

Example:

When target reliability is:

```text
unreliable
```

browser must display:

```text
Not used for clinical ranking
```

and no normal acceptance workflow for the personalised refinement.

---

# 77. VISUAL SAFETY REGRESSION

Safety-relevant components receive screenshot/DOM regression.

Examples:

- Research Mode banner;
- stale warning;
- unreliable target label;
- conflicting evidence;
- sign attestation;
- no-target option.

---

# 78. VISUAL CHANGE REVIEW

A visual diff affecting a safety-critical area requires:

- frontend review;
- clinical/human-factors review where material.

---

# 79. ACCESSIBILITY CI

Automated tests check:

- accessible names;
- form labels;
- landmarks;
- focus;
- colour contrast;
- keyboard interactions.

Critical clinical tasks also require manual accessibility validation.

---

# 80. STAGE 8 — SECURITY ANALYSIS

Every PR runs appropriate:

- SAST;
- dependency scan;
- secret scan;
- container scan where built;
- licence policy check.

---

# 81. SECRET SCANNING

CI/repository controls must prevent:

- Supabase service-role keys;
- database passwords;
- private signing keys;
- cloud credentials;
- patient access tokens

from entering source history.

---

# 82. DEPLOYMENT CREDENTIALS

Prefer:

# OIDC / workload identity federation

for cloud deployment.

Avoid long-lived deployment credentials stored in repository secrets where platform support exists.

---

# 83. LEAST-PRIVILEGE CI IDENTITY

The job that:

```text
runs unit tests
```

does not require:

# production deployment privileges.

Production credentials become available only after protected-environment gates have passed.

---

# 84. SOFTWARE COMPOSITION ANALYSIS

Maintain inventory of:

- JavaScript dependencies;
- Python packages;
- OS packages;
- neuroimaging binaries;
- container base layers.

---

# 85. SBOM

Every release artifact generates a Software Bill of Materials.

Accepted formats may include:

- CycloneDX;
- SPDX.

Release manifest references SBOM hash.

---

# 86. SCIENTIFIC ASSET BOM

Magniom additionally needs a:

# Scientific Asset Manifest.

Includes:

```text
HCP-MMP atlas
MNI template
sgACC masks
convergent circuit map
dysphoric circuit map
anxiosomatic circuit map
normative model
search masks
scientific policy
```

Each receives:

- identifier;
- version;
- SHA-256;
- provenance;
- licence status.

---

# 87. WHY SCIENTIFIC ASSET BOM MATTERS

Traditional SBOM answers:

> Which software did we ship?

Magniom also needs to answer:

> Which scientific representations did the algorithm use?

Both are needed to reconstruct clinical behaviour.

---

# 88. VULNERABILITY GATES

Policy should classify vulnerabilities by:

- severity;
- exploitability;
- exposure;
- clinical impact;
- availability of mitigation.

Do not use CVSS score alone without context.

---

# 89. CRITICAL VULNERABILITY

An exploitable critical vulnerability affecting Clinical Production:

# blocks release

unless a formal risk-acceptance/compensating-control process explicitly authorises otherwise.

---

# 90. VULNERABILITY EXCEPTION

Must include:

- vulnerability ID;
- affected component;
- exposure assessment;
- compensating controls;
- expiry/review date;
- approver.

No permanent undocumented ignore list.

---

# 91. CONTAINER IMAGE SCANNING

Scan:

- OS packages;
- language packages;
- embedded tools.

Release must record scan result.

---

# 92. CONTAINER HARDENING

Clinical containers should:

- use minimal base;
- run non-root where technically feasible;
- have read-only filesystem where possible;
- use explicit writable working directories;
- exclude compilers/debug tools when unnecessary;
- contain no secrets.

---

# 93. ARTIFACT BUILD

Merged source eligible for release enters the controlled build workflow.

Outputs:

- web application image/artifact;
- workflow-worker image;
- report-worker image;
- Target Engine package;
- NeuroCompute images;
- E-field image where applicable.

---

# 94. BUILD PROVENANCE

Each releasable artifact receives an attestation describing:

- source repository;
- commit;
- build workflow;
- builder;
- inputs;
- artifact digest.

---

# 95. SLSA TARGET

Magniom should progressively target:

# SLSA Build Level 3-compatible release provenance

where practical.

At minimum:

- automated provenance;
- hosted/controlled builder;
- signed/verified provenance;
- isolated/hardened release build.

---

# 96. ARTIFACT SIGNING / ATTESTATION

Production deployment verifies:

```text
artifact digest
+
approved provenance
+
expected source repository
+
expected release workflow
```

before deployment.

An artifact existing in a registry is not sufficient.

---

# 97. ARTIFACT REGISTRY

Clinical artifacts live in a controlled registry.

Tags are convenience labels.

Deployment uses:

# immutable digest.

Example:

```text
magniom-web@sha256:...
```

not merely:

```text
magniom-web:1.0.0
```

---

# 98. TAG IMMUTABILITY

Release tags must not be overwritten.

If `1.0.0` is defective:

publish:

```text
1.0.1
```

Do not repoint `1.0.0`.

---

# 99. RELEASE CANDIDATE

A release candidate is identified:

```text
MAGNIOM-1.0.0-rc.1
```

It references exact artifact digests.

No code changes occur between scientific validation and production without creating:

# rc.2.

---

# 100. SCIENTIFIC CHANGE PIPELINE

If PR class includes:

```text
C6–C10
```

run:

```text
Scientific Change Gate
```

in addition to standard CI.

---

# 101. SCIENTIFIC IMPACT REPORT

Automatically generated report contains:

```text
Change identifier
Before scientific versions
After scientific versions

Golden cases changed
Primary 1 changes
Primary 2 changes
Primary 3 changes
Slate cardinality changes
Abstention changes
Personalisation qualification changes
Median coordinate displacement
Reliability-class changes
Evidence Tier changes
Warnings added/removed
```

---

# 102. EXAMPLE SCIENTIFIC IMPACT REPORT

```text
CHANGE
minimum FC reliability:
0.65 → 0.60

GOLDEN CASES
20 total
4 affected

PRIMARY 1
2 changed

PERSONALISATION
Qualified:
8 → 11

ABSTENTION
18% → 12%

MAX COORDINATE CHANGE
13.2 mm

CLASSIFICATION
Material Scientific Change

STATUS
Clinical promotion blocked pending scientific review
```

---

# 103. SCIENTIFIC MATERIALITY

Classify:

## S0 — No scientific output change

## S1 — Numerical/nonmaterial change

Outputs differ but clinical interpretation does not.

## S2 — Material candidate change

Candidate metrics/locations materially change.

## S3 — Material Target Slate change

Primary roles/eligibility/abstention changes.

## S4 — Intended-purpose / scientific-model change

New indication, new circuit class, new fundamental algorithm.

---

# 104. S2–S4

Require:

- scientific review;
- risk impact assessment;
- validation impact assessment.

S3/S4 generally require new controlled scientific release.

---

# 105. EVIDENCE LIBRARY CI

Evidence PR pipeline validates:

- citation metadata;
- duplicate sources;
- claim structure;
- population;
- evidence relationships;
- conflicts;
- Clinical/Research mode;
- Evidence Tier;
- circuit links;
- TargetFamily links.

---

# 106. EVIDENCE CLAIM PROMOTION

Evidence Tier changes cannot merge on ordinary editorial approval.

Require:

- evidence reviewer;
- scientific/clinical approver.

---

# 107. EVIDENCE RELEASE BUILD

Evidence Library is built into an immutable release artifact:

```text
MAGNIOM-EVIDENCE-1.1.0
```

Manifest includes all version IDs + hashes.

Target Engine consumes:

# release artifact

not arbitrary live draft rows.

---

# 108. CIRCUIT ARTIFACT CI

For NIfTI/CIFTI/GIFTI/mask changes:

validate:

- file integrity;
- dimensions;
- coordinate space;
- orientation;
- expected hemisphere;
- value range;
- hash;
- visual reference snapshots.

---

# 109. LATERALITY TEST

Every clinical TargetFamily artifact with defined laterality gets an automated anatomical assertion.

Example:

```text
TF-MDD-LDLPFC
expected hemisphere = left
```

A right-dominant mapped mask:

# release failure.

---

# 110. SEARCH-SPACE REGRESSION

Compare new search mask with old:

- overlap;
- Dice;
- volume/area;
- centroid;
- hemisphere.

Material changes trigger Scientific Impact Review.

---

# 111. NORMATIVE MODEL CI

Normative model release must record:

- training/reference dataset manifest;
- preprocessing compatibility;
- feature definition;
- model coefficients/artifact;
- validation metrics;
- hash.

A changed normative model receives a new version.

---

# 112. SCIENTIFIC CONFIG AS CODE

Scientific Policy must live in controlled versioned files.

Example:

```text
scientific-config/
  1.0.0/
    evidence-policy.yaml
    reliability.yaml
    ranking.yaml
    redundancy.yaml
    convergence.yaml
```

Not edited through an admin dashboard.

---

# 113. CONFIG SCHEMA VALIDATION

CI validates:

- field types;
- allowed ranges;
- internal consistency;
- missing parameters;
- unknown parameters.

Scientific configuration cannot silently ignore typos.

---

# 114. CONFIG BOUNDARY TESTS

For every threshold, test values:

```text
threshold - epsilon
threshold
threshold + epsilon
```

Ensure expected deterministic behaviour.

---

# 115. NEUROCOMPUTE TEST MODEL

NeuroCompute has:

# Fast Verification

and:

# Full Scientific Verification.

These serve different purposes.

---

# 116. NEUROCOMPUTE FAST VERIFICATION

Runs on relevant PRs using:

- small synthetic NIfTI;
- small BOLD samples;
- precomputed reference outputs;
- short deterministic datasets.

Tests:

- file handling;
- transforms;
- time-series calculations;
- candidate clustering;
- manifest production;
- coordinate conventions.

---

# 117. FULL SCIENTIFIC VERIFICATION

Runs on:

- nightly/controlled schedule;
- scientific release candidate;
- dependency upgrade;
- pipeline change.

Uses controlled Golden Imaging Library.

---

# 118. GOLDEN IMAGING LIBRARY

At minimum:

```text
I01 low motion
I02 moderate motion
I03 motion failure
I04 structural reconstruction challenge
I05 atlas boundary
I06 GSR-sensitive target
I07 highly stable target
I08 signal dropout
I09 multi-scanner
I10 repeat session
```

---

# 119. FULL PIPELINE REPORT

For each dataset report:

```text
QC status
retained minutes
FC matrix summary
circuit map correlations
candidate coordinates
candidate cluster area
cross-run distance
split-half distance
pipeline sensitivity distance
reliability class
```

---

# 120. NEUROCOMPUTE BASELINE COMPARISON

New pipeline vs released pipeline:

```text
FC matrix correlation
target displacement
surface map correlation
cluster Dice
QC state change
clinical eligibility change
```

---

# 121. PIPELINE CHANGE EXAMPLE

```text
fMRIPrep dependency update

I01:
target shift 0.9 mm

I02:
target shift 1.2 mm

I06:
target shift 17.8 mm
reliability moderate → low

RESULT:
Material scientific impact.

Clinical release blocked.
```

A successful program execution does not make the update acceptable.

---

# 122. SCIENTIFIC TOLERANCES

Tolerance must be:

- metric-specific;
- scientifically justified;
- version-controlled.

Do not use:

```text
all arrays equal within 0.001
```

as a universal scientific criterion.

---

# 123. BYTE REPRODUCIBILITY

Where outputs can be byte-reproducible:

prefer it.

Where external numerical libraries/hardware prevent byte identity:

define:

# scientific equivalence tolerance.

---

# 124. CROSS-HARDWARE VERIFICATION

For validated deployment hardware, test:

- supported CPU;
- GPU;
- architecture.

If different hardware materially moves targets:

hardware becomes part of:

# validated system configuration.

---

# 125. GPU NONDETERMINISM

Any GPU algorithm affecting clinical result must be assessed for:

- nondeterministic operations;
- reproducibility;
- seed behaviour.

If deterministic execution cannot be guaranteed:

the output variation must be bounded and validated.

---

# 126. RESEARCH ALGORITHM CI

Research Mode may permit experimental algorithms.

They must still:

- identify version;
- preserve provenance;
- remain isolated from Clinical release.

---

# 127. RESEARCH → CLINICAL PROMOTION

Code does not become clinical merely by moving from:

```text
research/
```

to:

```text
clinical/
```

Promotion requires:

- Evidence Governance;
- scientific validation;
- risk assessment;
- release approval.

---

# 128. SECURITY PENETRATION TESTING

Beyond automated CI, periodic independent/manual testing should cover:

- authentication;
- authorization;
- RLS;
- IDOR;
- Storage;
- signed URLs;
- worker interfaces;
- queue manipulation;
- API abuse;
- dependency exposure;
- deployment controls.

---

# 129. THREAT MODEL

Maintain structured threats including:

```text
cross-tenant access
clinical record tampering
scientific configuration tampering
circuit map substitution
Target Slate mutation
worker credential theft
artifact registry compromise
supply-chain compromise
malicious CI workflow
MRI upload manipulation
report substitution
```

---

# 130. SCIENTIFIC INTEGRITY AS SECURITY

Security scope includes not merely patient confidentiality.

It includes:

# scientific integrity.

Example attack:

Replace:

```text
convergent-depression-map.nii.gz
```

with a modified file.

Even if no patient data leaks:

# patient targeting could be corrupted.

Therefore scientific assets require cryptographic verification.

---

# 131. SCIENTIFIC ARTIFACT VERIFICATION

Before Clinical Target Engine use:

```text
expected SHA-256
=
loaded SHA-256
```

Mismatch:

# Clinical Mode fails closed.

---

# 132. DATABASE EVIDENCE RELEASE VERIFICATION

Production startup/health check verifies:

- active Evidence Library manifest;
- expected release hash;
- Target Engine compatibility.

If mismatch:

clinical target generation disabled.

---

# 133. TARGET ENGINE COMPATIBILITY

Every Target Engine release declares compatible:

- phenotype ontology;
- Evidence Library schema;
- Scientific Policy schema;
- candidate schema;
- NeuroCompute output contract.

Incompatible combination:

# cannot start Clinical Mode.

---

# 134. RELEASE COMPATIBILITY MATRIX

Example:

```text
Target Engine 1.0.x
Phenotype Ontology 1.x
Evidence schema 1.x
Scientific Policy 1.0.x
Connectome contract 1.x
```

Enforced automatically.

---

# 135. RELEASE BUILD WORKFLOW

Only protected release workflow may generate:

# Clinical Release candidate artifacts.

Normal PR builds are not promotable even if identical source.

---

# 136. RELEASE WORKFLOW INPUTS

Explicit:

```text
release version
source commit
Evidence Library
Scientific Policy
Phenotype Ontology
Neuro Pipeline
Normative Model
Circuit Artifact Set
```

No implicit:

```text
use latest evidence
```

---

# 137. RELEASE BUILD STEPS

```text
Verify source/tag
      ↓
Resolve locked dependencies
      ↓
Build web/workers
      ↓
Build scientific containers
      ↓
Generate SBOM
      ↓
Generate Scientific Asset Manifest
      ↓
Generate provenance attestations
      ↓
Sign/attest artifacts
      ↓
Run release test suite
      ↓
Generate Release Candidate Manifest
```

---

# 138. RELEASE TEST SUITE

Release Candidate must pass:

### Full unit suite.

### Full property suite.

### All Golden Cases.

### Clean DB migration.

### Upgrade migration test.

### Full RLS/security suite.

### E2E critical workflows.

### Accessibility critical workflows.

### Supply-chain scan.

### Full required NeuroCompute scientific suite.

### Scientific Impact Report.

---

# 139. RELEASE QUALIFICATION PACKAGE

Automatically assemble:

```text
release/
  manifest.json
  artifact-provenance/
  sbom/
  scientific-assets/
  test-reports/
  golden-cases/
  db/
  security/
  neurocompute/
  human-factors-reference/
  requirements-trace/
  risk-impact/
  approvals/
```

---

# 140. REQUIREMENTS TEST REPORT

CI exports:

```text
Requirement ID
Verification Test ID
Test result
Build ID
Date
Artifact version
```

This reduces manual regulatory evidence reconstruction.

---

# 141. RELEASE EVIDENCE IMMUTABILITY

Release evidence should be stored in:

- immutable object storage;
- controlled quality repository;
- or another tamper-resistant archival system.

Do not rely only on transient CI logs.

---

# 142. CI LOG RETENTION

Release-related CI logs need controlled retention appropriate to:

- quality system;
- investigation;
- regulatory requirements.

Ordinary development logs may have shorter retention.

---

# 143. LOG REDACTION

CI logs must never contain:

- patient names;
- DOB;
- clinical notes;
- production access tokens;
- signed URLs;
- private keys.

---

# 144. CLINICAL STAGING PROMOTION

The exact Release Candidate artifacts are deployed to Clinical Staging.

Run:

- migration rehearsal;
- startup verification;
- synthetic clinical case;
- queue smoke test;
- Storage test;
- version-manifest test.

---

# 145. CLINICAL STAGING REPRESENTATIVE CASE

Maintain a dedicated:

# synthetic system tenant.

Run:

```text
create synthetic patient
→ approve phenotype
→ generate known Target Slate
→ review
→ sign
→ report
```

Expected result hash is known.

---

# 146. PRODUCTION RELEASE GATE

Clinical Production requires explicit approvals.

Recommended approval domains:

```text
Engineering
Scientific
Clinical
Quality / Regulatory
Security
```

Depending on organisation size, roles may overlap but responsibilities remain distinct.

---

# 147. APPROVAL MATRIX

## Engineering

Confirms:

- artifacts;
- migrations;
- operational readiness.

## Scientific

Confirms:

- scientific impact acceptable;
- validation remains applicable.

## Clinical

Confirms:

- intended clinical workflow and claims.

## Quality/Regulatory

Confirms:

- release documentation;
- change control;
- regulatory status.

## Security

Confirms:

- security posture;
- unresolved vulnerabilities acceptable.

---

# 148. NO SELF-APPROVAL

Clinical Production environment should prevent:

# initiator-only deployment approval.

At least one independent authorised reviewer must approve.

---

# 149. MANUAL DECISION, AUTOMATED EXECUTION

Recommended:

# human-controlled release decision

followed by:

# fully automated deployment.

Avoid:

- manual SSH;
- copied SQL;
- developer laptop deployments.

---

# 150. DEPLOYMENT AUTHENTICATION

Deployment workflow obtains short-lived credentials only after protected-environment approval.

Prefer workload identity/OIDC.

---

# 151. DEPLOYMENT CONCURRENCY

Only one Clinical Production deployment at a time.

Use deployment-level concurrency lock.

---

# 152. DATABASE BEFORE APPLICATION

Deployment ordering depends on compatibility design.

For expand-compatible releases:

```text
Backup / recovery-point verification
       ↓
Expand schema migration
       ↓
DB verification
       ↓
Deploy compatible application
       ↓
Post-deploy checks
```

---

# 153. POINT-IN-TIME RECOVERY

Before production DB migration, verify:

- backup/PITR operational;
- restore process recently tested;
- recovery point known.

A backup that has never been restored is not a demonstrated recovery strategy.

---

# 154. MIGRATION DRY RUN

Apply candidate production migration to:

# production-like schema/data fixture

before production.

Capture:

- duration;
- locks;
- row counts;
- failures;
- post-migration invariants.

---

# 155. LONG MIGRATION

Large backfills should not occur as opaque blocking schema migrations where avoidable.

Use:

- expand;
- controlled batch migration;
- progress;
- validation;
- contract later.

---

# 156. DATABASE ROLLBACK PRINCIPLE

Do not automatically reverse destructive data migrations merely because application deployment fails.

In clinical record systems:

# forward correction is often safer.

Every migration requires a recovery strategy.

---

# 157. APPLICATION ROLLBACK

Application image can usually roll back when:

- previous image remains schema-compatible;
- no scientific output produced under defective version requires special handling.

---

# 158. SCIENTIFIC ROLLBACK

Scientific changes require a different concept:

# supersession.

Example:

Target Engine 1.2 found defective.

Process:

```text
disable 1.2 for new generation
       ↓
reactivate validated 1.1 if compatible
       ↓
identify all cases generated by 1.2
       ↓
clinical impact assessment
       ↓
recompute where appropriate
       ↓
clinician re-review if required
```

The old Target Slate is not erased.

---

# 159. RELEASE RECALL CAPABILITY

Database must support query:

```text
Find every Target Slate created with:
Target Engine 1.2.0
```

or:

```text
Circuit Artifact hash X
```

or:

```text
Neuro Pipeline 1.3
```

This is mandatory for corrective action.

---

# 160. AFFECTED-CASE INDEX

Each Target Slate already stores/version-links:

- engine;
- Evidence Library;
- phenotype;
- connectome;
- policy;
- normative model.

This becomes the foundation for:

# affected-case analysis.

---

# 161. POST-DEPLOY SMOKE TEST

Immediately after Clinical Production deployment run only synthetic/system-tenant checks:

### Auth.

### Version manifest.

### DB schema head.

### Evidence manifest.

### Target Engine health.

### Queue health.

### Storage.

### Audit.

### Known synthetic Target Slate.

---

# 162. PRODUCTION SCIENTIFIC VERSION CHECK

System verifies:

```text
Running Target Engine Digest
=
Approved Release Digest

Active Evidence Hash
=
Approved Release Hash

Active Scientific Policy
=
Approved Version

DB Schema Head
=
Approved Head
```

Mismatch:

# disable Clinical target generation.

---

# 163. FAIL-CLOSED MODE

If scientific release integrity cannot be established:

the system may allow:

- read-only historical case review

but should block:

# generation of new Clinical Target Slates.

---

# 164. POST-DEPLOY OBSERVABILITY

Monitor:

- HTTP errors;
- DB errors;
- queue backlog;
- worker failures;
- Storage failures;
- RLS denials;
- target-generation failures;
- imaging QC distributions;
- abstention rate;
- version mismatch.

---

# 165. SCIENTIFIC OPERATIONS MONITORING

Monitor for unexpected shifts after release:

```text
FC QC pass rate
target reliability distribution
personalisation qualification rate
abstention rate
Primary target family distribution
```

A sudden change may indicate:

- acquisition change;
- software issue;
- scanner change;
- scientific pipeline regression.

---

# 166. NO ONLINE ALGORITHM DRIFT

Monitoring data do not automatically alter algorithm thresholds.

They trigger:

# investigation.

---

# 167. RELEASE HEALTH WINDOW

After Clinical release, perform heightened review of:

- system errors;
- clinical incidents;
- scientific outliers;
- unexpected Target Slate patterns.

No arbitrary fixed duration is required in this specification.

---

# 168. DEPLOYMENT INCIDENT

If a serious issue occurs:

1. stop new affected processing if needed;
2. preserve evidence;
3. identify affected release;
4. determine affected cases;
5. assess clinical significance;
6. contain technical issue;
7. implement corrected release;
8. determine clinician/patient follow-up obligations;
9. document CAPA/problem resolution where appropriate.

---

# 169. PROBLEM CLASSIFICATION

## Operational

Service unavailable.

## Security

Confidentiality/integrity exposure.

## Scientific

Incorrect algorithmic result.

## Clinical UX

Interface may mislead clinician.

## Data integrity

Record/history corruption.

Incidents may belong to multiple categories.

---

# 170. SCIENTIFIC DEFECT

Examples:

- wrong sgACC mask;
- left/right inversion;
- incorrect MNI transform;
- reliability calculation error;
- incorrect Evidence Tier lookup;
- redundancy bug;
- wrong circuit map loaded.

These demand:

# clinical impact analysis

not only software patching.

---

# 171. CAPA / PROBLEM RESOLUTION LINK

Release and incident records should integrate with the quality-system problem-resolution process.

Trace:

```text
Incident
→ root cause
→ corrective action
→ code/scientific change
→ verification
→ release
→ effectiveness review
```

---

# 172. EMERGENCY PATCH

Emergency clinical patch process may shorten normal lead time.

It may not eliminate:

- test requirements;
- independent review;
- release identification;
- impact assessment.

---

# 173. EMERGENCY UI FIX

If safety-critical wording is wrong:

a rapid UI patch may be justified.

Still:

- version;
- test;
- approve;
- deploy by immutable artifact.

---

# 174. FEATURE FLAGS

Ordinary UI features may use controlled flags.

Scientific behaviour should generally **not** be controlled by hidden runtime feature flags.

---

# 175. SCIENTIFIC FEATURE FLAG

If absolutely necessary for staged validation:

flag state must be:

- versioned;
- auditable;
- included in release manifest;
- immutable for a given Target Slate.

---

# 176. CLINICAL MODE FLAG

Clinical Mode cannot be enabled by ordinary:

```text
ENABLE_CLINICAL=true
```

alone.

The runtime must verify:

- approved release;
- compatible scientific artifacts;
- environment;
- organisational authorisation.

---

# 177. RESEARCH FEATURE LEAKAGE

CI and runtime both verify:

```text
Research TargetFamily
+
Clinical case
→ prohibited.
```

Defense in depth:

- evidence graph;
- Target Engine;
- DB constraint;
- UI.

---

# 178. PR PREVIEW SUPABASE

Where Supabase Branching is used:

- separate database;
- separate credentials;
- data-less by default;
- synthetic seed.

PR closure removes ephemeral environment where appropriate.

---

# 179. PREVIEW MIGRATION TEST

For DB PR:

preview branch must:

- apply migration;
- run seed;
- run DB tests;
- support E2E.

---

# 180. REMOTE DATABASE EDITING

Once migration-based development is adopted:

# production/staging schema must not be manually edited through the dashboard.

All persistent schema changes go through version-controlled migrations.

---

# 181. EMERGENCY DATABASE CHANGE

If unavoidable:

- change documented immediately;
- migration reproducing exact state created;
- migration history reconciled;
- incident/change-control record opened.

---

# 182. SEEDS

Separate:

```text
seed-reference.sql
seed-synthetic.sql
```

Reference seed:

- controlled non-patient scientific metadata.

Synthetic seed:

- fake users;
- fake patients;
- Golden Cases.

Never seed clinical production with test patients.

---

# 183. TEST DATA LABELING

Synthetic cases use unmistakable identifiers:

```text
SYNTHETIC-MAGNIOM-001
```

Reports display:

# SYNTHETIC / NOT A PATIENT RECORD.

---

# 184. TEST ISOLATION

Application tests should create unique test scopes and clean up safely.

No test should rely on execution order.

---

# 185. PERFORMANCE TESTING

Enterprise verification includes:

- API latency;
- database queries;
- concurrent case review;
- queue throughput;
- Storage;
- report generation.

Scientific compute performance is measured separately from correctness.

---

# 186. PERFORMANCE ≠ SCIENTIFIC VALIDITY

A target produced in:

# 30 seconds

is not better than one produced in:

# 5 minutes.

Performance optimisations must preserve output within validated equivalence.

---

# 187. TARGET ENGINE PERFORMANCE CHANGE

If optimisation changes floating-point order or output:

Scientific Impact Gate applies.

---

# 188. LOAD TESTING

Before production-scale deployment, test realistic:

- concurrent users;
- case reads;
- evidence drawer;
- 3D asset delivery;
- background job submission.

Do not test clinical MRI jobs by uncontrolled mass duplication if expensive external dependencies distort results.

---

# 189. DATABASE PERFORMANCE

Monitor RLS policy query plans.

Security must not be disabled to improve performance.

Use appropriate indexes.

---

# 190. NEUROCOMPUTE CAPACITY

Test:

- job concurrency;
- queue backlog;
- memory exhaustion;
- GPU failure;
- disk exhaustion.

Failure should:

- preserve source data;
- preserve job state;
- never publish partial clinical results.

---

# 191. CHAOS / FAILURE TESTING

Simulate:

- worker dies;
- database temporarily unavailable;
- Storage timeout;
- queue duplication;
- report service failure.

Clinical record consistency must remain intact.

---

# 192. PARTIAL SCIENTIFIC PIPELINE FAILURE

If NeuroCompute reaches:

```text
circuit map generation
```

but reliability stage fails:

# no Clinical Target Slate may be published from partial data.

---

# 193. TIMEOUTS

Every external/system operation has:

- timeout;
- retry policy;
- terminal failure path.

Avoid infinite retry on corrupted input.

---

# 194. RETRY SAFETY

Retryable operations must be:

# idempotent.

---

# 195. RELEASE TEST DATA FREEZE

Golden Cases and Golden Imaging datasets used for formal release verification are themselves versioned.

Changing validation fixtures requires review.

---

# 196. GOLDEN CASE CORRECTION

If a Golden expected result is discovered to be wrong:

create:

- fixture change;
- rationale;
- review.

Do not silently edit expected output while reviewing another scientific change.

---

# 197. VALIDATION DATA INDEPENDENCE

Development datasets and validation datasets remain separated.

CI may run development Golden fixtures frequently.

Locked clinical validation datasets have controlled access and cannot be freely tuned against.

---

# 198. HUMAN-FACTORS REGRESSION

Changes affecting:

- target ordering;
- colour semantics;
- evidence presentation;
- uncertainty;
- decision workflow;
- sign-off

must be classified for human-factors impact.

---

# 199. HUMAN-FACTORS UNIT / E2E CONTROLS

Automated checks can enforce:

```text
No candidate preselected.

Research banner present.

Uncertainty section present.

Counterargument section present.

Stale decision signing disabled.
```

They complement—not replace—human-factors studies.

---

# 200. HIGH-RISK UX CHANGE

Example:

Changing target cards from equal-weight presentation to:

```text
large green recommended target
+
small grey alternatives
```

is a material human-factors change even if all functional tests pass.

---

# 201. CLINICAL COPY

Safety-relevant clinical wording should be version-controlled.

Examples:

- attestation;
- Research Mode warning;
- reliability warning;
- abstention language.

Changes may require clinical review.

---

# 202. REPORT TESTING

Signed clinical report testing verifies:

- correct patient/case;
- correct final target;
- Magniom candidate vs clinician decision distinction;
- coordinate space;
- evidence version;
- reliability;
- release manifest;
- clinician identity.

---

# 203. PDF/REPORT REGRESSION

If PDF generation changes:

test against synthetic signed cases.

A report that visually clips:

# target coordinate space

is potentially clinically significant.

---

# 204. DEPLOYMENT POLICY AS CODE

Where possible, protect production with machine-enforced rules:

- approved branch/tag;
- required artifact provenance;
- required scans;
- required approvals;
- single deployment concurrency.

---

# 205. CLINICAL RELEASE APPROVAL RECORD

Capture:

```text
Release
Approver
Role
Decision
Timestamp
Comments
Scientific Impact Report ID
Risk Assessment ID
```

---

# 206. VERSION ENDPOINT

Magniom should expose an authorised:

```text
/system/version
```

returning non-sensitive release information:

```text
Magniom 1.0.0
Target Engine 1.0.0
Evidence Library 1.0.0
Neuro Pipeline 1.0.0
Database schema ...
```

---

# 207. CASE-LEVEL VERSION VIEW

Every Target Slate permanently stores its exact version manifest.

The current running version does not replace historical version context.

---

# 208. PRODUCTION DRIFT DETECTION

Regular job verifies:

# deployed state = approved release manifest.

Detect:

- manually changed environment variable;
- unexpected DB schema;
- wrong container digest;
- wrong Evidence Library activation.

---

# 209. CONFIGURATION DRIFT RESPONSE

Critical scientific drift:

# disable new Clinical target generation until reconciled.

---

# 210. ENVIRONMENT CONFIG AS CODE

Track:

- Supabase config;
- deployment configuration;
- network policy;
- storage configuration;
- runtime variables where non-secret.

Secrets remain outside Git.

---

# 211. SECRET ROTATION

Support periodic/emergency rotation of:

- database credentials;
- service identities;
- signing credentials.

Rotation should not require source-code change.

---

# 212. SIGNING KEY MANAGEMENT

If external signing keys are used:

- store in managed KMS/HSM-class system where appropriate;
- limit release workflow access;
- audit signing.

Private signing keys never stored in repository.

---

# 213. ATTESTATION VERIFICATION BEFORE DEPLOYMENT

Clinical deploy job verifies artifact provenance before pulling/running it.

If provenance cannot be verified:

# deployment fails.

---

# 214. SBOM RETENTION

SBOM archived with each Clinical Release.

It enables later query:

> Which Magniom releases contain vulnerable dependency X?

---

# 215. SCIENTIFIC ASSET RETENTION

Likewise query:

> Which releases used sgACC seed version X?

This supports scientific recall.

---

# 216. THIRD-PARTY LICENCE CONTROL

CI checks dependencies/scientific assets for licence policy.

Especially important for:

- atlas resources;
- instrument content;
- circuit maps;
- neuroimaging software.

---

# 217. VENDOR SERVICE DEPENDENCY

If Magniom uses external managed services:

document:

- service;
- criticality;
- data classification;
- outage behaviour;
- fallback.

---

# 218. SUPABASE OUTAGE

If Supabase unavailable:

do not attempt to run offline Target Engine and later guess how to reconcile clinical records.

Clinical workflow becomes unavailable/read-only according to architecture.

---

# 219. FAIL-SAFE REPORTING

If Target Engine unavailable:

UI says:

# Target analysis unavailable.

Not:

# use last generated target

unless that historical target is explicitly current and being reviewed as such.

---

# 220. DISASTER RECOVERY TEST

Periodically test:

- database restore;
- object restore;
- scientific artifact registry restore;
- release-manifest restore.

Record:

- recovery time;
- data integrity;
- application compatibility.

---

# 221. CLINICAL RECORD RESTORE TEST

After restore verify:

- signed decisions;
- audit events;
- Target Slate hashes;
- evidence-version links.

---

# 222. SCIENTIFIC ARTIFACT RESTORE

Verify restored:

- circuit maps;
- normative model;
- search masks

match stored SHA-256.

---

# 223. RELEASE FREQUENCY

Research releases may occur relatively frequently.

Clinical releases should be:

# need-driven and controlled.

Do not impose monthly clinical releases merely because SaaS teams usually ship monthly.

---

# 224. PATCH RELEASE

Patch may include:

- security fix;
- non-scientific bug;
- clinically nonmaterial UI defect.

Still passes all applicable clinical release gates.

---

# 225. MINOR RELEASE

Potentially includes:

- new non-breaking capability;
- Scientific Policy change;
- evidence update.

Scientific impact determines validation burden.

---

# 226. MAJOR RELEASE

Examples:

- new clinical indication;
- major Target Engine redesign;
- protocol recommendation module;
- new clinical decision model.

Requires substantial validation impact assessment.

---

# 227. VERSION NUMBER DOES NOT DETERMINE VALIDATION

A one-line change can require more validation than a 5,000-line refactor.

Validation burden follows:

# risk and scientific impact.

---

# 228. CLINICAL RELEASE FREEZE

Before formal prospective validation:

freeze relevant:

- Target Engine;
- Evidence Library;
- Scientific Policy;
- Neuro Pipeline;
- phenotype ontology.

Only essential controlled fixes are allowed.

---

# 229. VALIDATION BUILD

The exact release used in a study must be identifiable.

Every participant/case records algorithm version.

---

# 230. STUDY ALGORITHM UPDATE

If a scientific algorithm must change during prospective study:

handle under:

- study protocol;
- ethics/regulatory governance;
- predefined analysis strategy.

Do not silently upgrade participants mid-study.

---

# 231. QUALITY RECORD GENERATION

CI/CD should automatically generate evidence useful to the QMS.

Examples:

```text
software verification report
scientific regression report
RLS verification
SBOM
vulnerability report
build attestation
release manifest
migration record
requirements trace report
```

---

# 232. AUTOMATION DOES NOT REMOVE REVIEW

Automatically generated reports remain subject to appropriate review/approval.

CI is evidence generation.

It is not the regulatory decision-maker.

---

# 233. REQUIRED CI WORKFLOWS

Recommended GitHub workflow files:

```text
.github/workflows/
  pr-policy.yml
  static-analysis.yml
  unit-tests.yml
  domain-property-tests.yml
  database-tests.yml
  integration-tests.yml
  web-e2e.yml
  accessibility.yml
  security.yml
  scientific-golden.yml
  neurocompute-fast.yml
  neurocompute-full.yml
  evidence-validation.yml
  scientific-impact.yml
  build-release.yml
  attest-release.yml
  clinical-staging.yml
  clinical-production.yml
  post-deploy-verification.yml
```

---

# 234. REUSABLE WORKFLOWS

Critical build/deployment logic should use centrally controlled reusable workflows.

Benefits:

- standard permissions;
- standard provenance;
- fewer duplicated deployment implementations.

---

# 235. DEFAULT GITHUB TOKEN PERMISSIONS

Set repository/workflow defaults:

# read-only.

Grant write privileges per-job only when required.

---

# 236. RELEASE WORKFLOW PERMISSIONS

Only release job receives:

- artifact attestation permission;
- registry push permission;
- OIDC token permission;
- deployment environment access.

---

# 237. FORK PR SECURITY

Fork PRs:

- receive no secrets;
- cannot use privileged runners;
- cannot trigger deployments.

---

# 238. CACHES

CI caches are performance aids.

Do not trust cache contents as release provenance.

Release builds must validate inputs and lockfiles.

---

# 239. BUILD CACHE POISONING

Where BuildKit or package caches are used:

- scope appropriately;
- avoid untrusted cross-repository writes;
- verify resulting artifact provenance.

---

# 240. TEST FLAKINESS

Flaky tests are treated as engineering defects.

Do not develop a culture of:

```text
rerun until green.
```

Safety-critical tests must be deterministic or the nondeterminism must be understood.

---

# 241. QUARANTINED TEST

A safety-critical test may not remain indefinitely quarantined.

If temporarily disabled:

- reason;
- risk assessment;
- owner;
- resolution deadline.

---

# 242. CI FAILURE OVERRIDE

Production release cannot bypass a failed mandatory gate merely by administrator click.

Exceptional override requires:

- formal documented risk acceptance;
- authorised governance.

Certain failures should be:

# non-overridable.

---

# 243. NON-OVERRIDABLE FAILURES

Examples:

- artifact provenance mismatch;
- wrong scientific hash;
- cross-tenant RLS failure;
- laterality test failure;
- Research→Clinical leakage;
- signed-decision mutability;
- corrupted release manifest.

---

# 244. RELEASE ACCEPTANCE MATRIX

| Gate | Research | Clinical |
|---|---:|---:|
| Static verification | Required | Required |
| Unit tests | Required | Required |
| DB/RLS | Required | Required |
| Golden Target Engine | Required | Required |
| E2E critical workflow | Required | Required |
| Security scans | Required | Required |
| SBOM | Recommended/Required by policy | Required |
| Build provenance | Required | Required |
| Scientific Impact Review | For scientific changes | Required for scientific changes |
| Full NeuroCompute regression | As applicable | Required for affected scientific release |
| Human approval | Research governance | Clinical Release Board |
| Clinical validation applicability | — | Required |
| Regulatory/QMS readiness | Research governance | Required |

---

# 245. RESEARCH RELEASE

Research release may tolerate:

- experimental TargetFamilies;
- experimental algorithms.

But these must be:

- clearly marked;
- isolated;
- versioned;
- non-clinical.

---

# 246. CLINICAL RELEASE

Must contain only:

# Clinical-approved objects.

Research code may exist in repository/application.

Clinical Release manifest explicitly excludes Research scientific artifacts from eligibility.

---

# 247. CLINICAL PRODUCTION DATABASE

No automatic Evidence Library activation merely because evidence code deployed.

Activation is a separately controlled scientific release transaction.

---

# 248. TARGET ENGINE DEPLOYMENT

Deploying Target Engine binary and activating it are distinct.

Possible flow:

```text
deploy Engine 1.1
       ↓
verify
       ↓
remain inactive
       ↓
Scientific Release approval
       ↓
activate for new Clinical Slates
```

---

# 249. SCIENTIFIC CANARY

Traditional canary deployments that send random clinical patients to an unvalidated new Target Engine are:

# prohibited.

Scientific algorithm experimentation belongs in:

- validation;
- Research Mode;
- approved prospective studies.

---

# 250. INFRASTRUCTURE CANARY

Infrastructure/web changes with no scientific semantic effect may use conventional canary/blue-green strategies if appropriate.

---

# 251. BLUE-GREEN DEPLOYMENT

Useful for:

- web;
- API;
- worker infrastructure.

Both environments must use the same approved scientific release configuration.

---

# 252. DATABASE BLUE-GREEN LIMITATION

Clinical PostgreSQL state makes full DB blue-green switching more complex.

Use migration compatibility discipline rather than pretending DB is stateless.

---

# 253. POST-DEPLOY GOLDEN SMOKE

Production system tenant should generate a small deterministic synthetic Target Slate.

Compare hash to expected release value.

Failure:

# stop/disable new Clinical generation.

---

# 254. OBSERVABILITY RELEASE TAGGING

Every:

- error;
- job;
- audit event;
- processing run

should be attributable to:

# Magniom release version.

---

# 255. METRICS BY RELEASE

Compare:

```text
release 1.0 vs 1.1
```

for:

- errors;
- QC;
- personalisation;
- abstention;
- TargetFamily frequency.

Investigate unexpected changes.

---

# 256. POST-MARKET SCIENTIFIC SIGNAL

If after release:

```text
personalisation qualification drops from 70% to 25%
```

without expected clinical/acquisition change:

trigger scientific incident investigation.

---

# 257. SCANNER CHANGE

A scanner software/hardware upgrade may change imaging behaviour without Magniom code changing.

Treat relevant acquisition environment as:

# external scientific configuration.

Sites must report scanner/acquisition changes.

---

# 258. SITE COMPATIBILITY

Clinical processing can verify scanner/acquisition profile against approved compatibility registry.

Unknown material acquisition configuration:

- Conditional;
- Research;
- or blocked

according to policy.

---

# 259. EXTERNAL ENVIRONMENT DRIFT

Clinical release integrity therefore includes:

- Magniom code;
- scientific assets;
- validated acquisition/deployment environment.

---

# 260. AUDIT OF RELEASE ACTIONS

Audit:

```text
RELEASE_CANDIDATE_CREATED
SCIENTIFIC_APPROVAL_GRANTED
CLINICAL_APPROVAL_GRANTED
RELEASE_DEPLOYED
SCIENTIFIC_VERSION_ACTIVATED
RELEASE_ROLLED_BACK
RELEASE_SUPERSEDED
```

---

# 261. AUDIT SEPARATION

Application clinical audit and DevOps release audit may live in different technical systems.

They must remain linkable by:

# Release ID.

---

# 262. TEST RESULT IDENTIFIERS

Each formal test result should capture:

- Test ID;
- release;
- commit;
- environment;
- timestamp;
- runner;
- input fixture;
- output;
- pass/fail.

---

# 263. FORMAL TEST DEFINITIONS

Safety-critical tests should have controlled test descriptions independent of test implementation.

Example:

```text
TEST MAG-SEC-RLS-014

Requirement
Users must not access patients belonging to another organisation.

Precondition
User A belongs only to Organisation A.
Patient B belongs to Organisation B.

Procedure
Attempt SELECT through normal authenticated application role.

Expected
No row returned / permission denied.

Automated implementation
supabase/tests/security/cross_org.sql
```

---

# 264. TEST CODE REVIEW

Test changes require review.

A developer must not “fix” a failing clinical test merely by weakening the assertion.

---

# 265. MUTATION TESTING

Consider targeted mutation testing for:

- Target Engine gates;
- RLS/security helpers;
- critical workflow conditions.

Purpose:

confirm tests would actually detect incorrect logic.

---

# 266. FUZZ TESTING

Useful for:

- API schemas;
- queue envelopes;
- scientific JSON;
- upload metadata.

Malformed input must fail safely.

---

# 267. SCIENTIFIC INPUT FUZZING

Examples:

- NaN FC;
- impossible coordinate;
- inverted laterality;
- empty TargetFamily;
- negative retained minutes;
- malformed normative percentile.

Target Engine must reject invalid scientific objects.

---

# 268. DATA VALIDATION BOUNDARY

All untrusted external data undergo runtime schema validation before entering canonical domain objects.

---

# 269. DICOM INGEST SECURITY

Imaging uploads should be tested for:

- malformed archive;
- unexpected files;
- path traversal;
- oversized payload;
- metadata inconsistencies.

---

# 270. FILE PARSER ISOLATION

Complex medical file parsing should occur in constrained compute environments rather than trusted web application process.

---

# 271. PERFORMANCE BUDGET

Set budgets for:

- case page load;
- target workspace;
- viewer start;
- evidence retrieval;
- decision signing.

These are usability/service objectives, not clinical claims.

---

# 272. SERVICE LEVEL OBJECTIVES

Clinical deployment should define:

- availability;
- queue-processing performance;
- incident response.

Exact values belong in operational plan.

---

# 273. SCIENTIFIC LATENCY

No safety-critical shortcut should activate because a computation exceeds an arbitrary SLA.

Example prohibited:

> full reliability calculation is slow, so use unreliability-unchecked target.

---

# 274. TIMEOUT RESULT

If processing cannot complete:

# no personalised Target Slate.

Fallback to evidence-only should occur only through explicit scientifically defined workflow.

---

# 275. DATABASE SCHEMA VERSION

Expose canonical migration head in release manifest.

Deployment refuses incompatible application/schema combination.

---

# 276. BACKWARD COMPATIBILITY

Web version may need to read historical:

- TargetCandidate schema v1;
- v2.

Do not migrate historical meaning into current representation merely for UI convenience.

Use version-aware presentation adapters.

---

# 277. API VERSIONING

Stable internal contracts receive schema versions.

Queues always include:

```text
schema_version
```

---

# 278. NEUROCOMPUTE API VERSIONING

Output contract:

```text
connectome-output/1.0
```

Target Engine declares supported versions.

---

# 279. EVIDENCE GRAPH SCHEMA VERSION

Evidence release manifest includes:

```text
graph_schema_version
```

---

# 280. RELEASE ARCHIVE

Maintain an archive for every Clinical Release with:

- exact source tag;
- release manifest;
- images/artifacts;
- scientific asset manifests;
- SBOM;
- provenance;
- test evidence;
- approvals.

---

# 281. REPRODUCIBILITY TEST AFTER ARCHIVE

Periodically select a historical release and confirm:

- artifacts can still be verified;
- manifest interpretable;
- historical Target Slate reconstructable.

---

# 282. END-OF-LIFE

When a release is no longer permitted for new processing:

mark:

```text
deprecated / superseded.
```

Historical cases remain readable.

---

# 283. DEPENDENCY EOL

Monitor end-of-life status of:

- Node;
- Next.js;
- PostgreSQL;
- Python;
- neuroimaging tools;
- operating system images.

Upgrade through controlled process.

---

# 284. SECURITY PATCH VS SCIENTIFIC VALIDATION

A security patch in a scientific dependency may require expedited update.

Still quantify:

# whether scientific output changed.

Security urgency does not eliminate scientific verification.

---

# 285. BASE-IMAGE SECURITY PATCH

If OS patch does not alter scientific outputs:

Scientific Impact may be S0.

Still document regression result.

---

# 286. NEXT.JS SECURITY UPDATE

Apply through standard release process.

If no clinical semantic changes:

may require reduced scientific testing but full web/security verification.

---

# 287. SUPABASE PLATFORM CHANGE

Managed service changes are external dependencies.

Maintain:

- service monitoring;
- compatibility testing;
- release notes review for material changes.

---

# 288. DB EXTENSION VERSION

Extensions affecting scientific/security functionality should be identified where relevant.

---

# 289. POSTGRES MAJOR UPGRADE

Requires:

- staging rehearsal;
- query/RLS regression;
- performance;
- restoration;
- clinical workflow test.

---

# 290. RELEASE READINESS DASHBOARD

Internal dashboard should show:

```text
Release Candidate        1.1.0-rc.2

Static                    PASS
Unit                      PASS
Database                  PASS
RLS                       PASS
Golden Cases              PASS
Web E2E                   PASS
Security                  PASS
SBOM                      COMPLETE
Provenance                VERIFIED
NeuroCompute              PASS
Scientific Impact         APPROVED
Human Factors Impact      NONE/MANAGED
Clinical Approval         PENDING
Quality Approval          PENDING

Clinical Production
BLOCKED
```

---

# 291. GREEN CI ≠ RELEASE APPROVAL

Green automated tests mean:

> automated requirements passed.

They do not mean:

> software is clinically approved.

---

# 292. CLINICAL RELEASE BOARD

Clinical Production gate is organisational governance.

CI provides:

# evidence.

Humans provide:

# accountability and approval.

---

# 293. MINIMUM CLINICAL RELEASE CONDITIONS

At minimum:

```text
No critical test failure
No unresolved critical defect
Artifact provenance verified
Scientific hashes verified
Golden Cases approved
DB/RLS verified
Security review complete
Scientific validation applicable
Human-factors impact acceptable
Clinical intended-use approval
Quality/regulatory approval
```

---

# 294. REJECTION

Release Board must be able to conclude:

# Do not release.

No schedule should override an unresolved clinical safety concern.

---

# 295. RELEASE NOTES

Clinical release notes distinguish:

### User-visible changes.

### Scientific changes.

### Evidence changes.

### Security changes.

### Known limitations.

---

# 296. CLINICIAN CHANGE NOTICE

If a Clinical Release materially changes interpretation:

clinicians should receive concise change notice.

Example:

> Target reliability now incorporates preprocessing-sensitivity analysis. Some cases previously considered Moderate may now be classified Low.

---

# 297. NO SILENT SCIENTIFIC CHANGE

Clinicians should not discover major algorithm changes merely because Target Slate looks different.

---

# 298. IMPLEMENTATION TOOLCHAIN

Recommended baseline:

```text
SCM
GitHub Enterprise Cloud

CI/CD
GitHub Actions

JS package management
pnpm

Monorepo orchestration
Turborepo

TypeScript tests
Vitest

Property testing
fast-check

Browser E2E
Playwright

Database
Supabase CLI + pgTAP

Python tests
pytest

Python property testing
Hypothesis

Python typing
pyright or mypy

Containers
Docker / BuildKit

SBOM
CycloneDX/SPDX-compatible tooling

SAST
CodeQL + language-specific analysis

Container/SCA
enterprise-approved scanning tooling

Provenance
artifact attestations / SLSA-compatible provenance

Deployment identity
OIDC/workload identity
```

Tools can change.

Required controls cannot.

---

# 299. ENTERPRISE PLATFORM REQUIREMENT

The chosen platform must support, directly or through companion tooling:

- protected private repositories;
- audit;
- required reviewers;
- artifact provenance;
- protected environments.

---

# 300. REGULATORY TRACEABILITY MAPPING

This CI/CD system should support evidence for:

## Software lifecycle

- requirements;
- architecture;
- implementation;
- verification;
- release;
- maintenance;
- problem resolution.

## Risk management

- hazard controls;
- verification of controls;
- change impact.

## Usability engineering

- safety-critical UI controls;
- human-factors regression.

## Cybersecurity

- threat model;
- dependency monitoring;
- secure build;
- vulnerability management;
- update mechanisms.

---

# 301. IEC 62304-STYLE ALIGNMENT

Without prejudging final conformity strategy, the pipeline supports principles including:

```text
software development planning
requirements
architecture
unit implementation
integration
system testing
release
configuration management
problem resolution
maintenance
```

---

# 302. ISO 14971-STYLE ALIGNMENT

Risk controls link to:

```text
requirement
→ implementation
→ automated/manual verification
→ residual-risk review
```

---

# 303. IEC 62366-1-STYLE ALIGNMENT

Human-factors critical UI tests are identified separately from generic web functionality.

Automation-bias safeguards are treated as safety controls.

---

# 304. CYBERSECURITY LIFECYCLE ALIGNMENT

CI/CD supports:

- vulnerability identification;
- secure build;
- SBOM;
- provenance;
- controlled patches;
- post-market monitoring;
- incident response.

---

# 305. ENTERPRISE DEFINITION OF DONE — ORDINARY PR

An ordinary application PR is complete when:

- requirements identified;
- review complete;
- static checks pass;
- unit tests pass;
- DB/integration where affected pass;
- E2E where affected pass;
- security checks pass;
- documentation updated.

---

# 306. DEFINITION OF DONE — SCIENTIFIC PR

Additionally:

- Scientific Impact Report;
- Golden Case results;
- scientific review;
- version increment where required;
- validation-impact assessment;
- risk assessment where material.

---

# 307. DEFINITION OF DONE — RELEASE CANDIDATE

Additionally:

- immutable artifacts built;
- SBOM;
- provenance;
- full release verification;
- Clinical Staging rehearsal;
- release package archived.

---

# 308. DEFINITION OF DONE — CLINICAL RELEASE

Additionally:

- independent approvals;
- regulatory/quality gate;
- production deploy;
- post-deploy verification;
- release record closed.

---

# 309. ABSOLUTE RULES

The following are non-negotiable:

# No real patient data in ordinary PR CI.

# No direct production schema editing.

# No unversioned scientific configuration.

# No unverified scientific-artifact substitution.

# No rebuild between validation and production.

# No Research algorithm entering Clinical Mode through a flag.

# No production deployment from a developer laptop.

# No hidden scientific parameter changes.

# No arbitrary “latest” scientific/runtime dependencies.

# No automatic database destructive rollback.

# No silent historical target mutation.

# No CI bypass for laterality, RLS or scientific integrity failures.

# No automatic Clinical deployment simply because `main` is green.

---

# 310. CANONICAL PIPELINE

```text
Developer change
        ↓
Pull Request
        ↓
Automatic change classification
        ↓
Static verification
        ↓
Unit + property tests
        ↓
Database rebuild / RLS
        ↓
Golden Cases
        ↓
Integration / E2E
        ↓
Security / supply chain
        ↓
Scientific verification when applicable
        ↓
Required review
        ↓
Merge
        ↓
Controlled Release Candidate build
        ↓
SBOM + provenance + attestations
        ↓
Release qualification suite
        ↓
Scientific Validation
        ↓
Clinical Staging
        ↓
Clinical Release Board
        ↓
Production approval
        ↓
Promote identical artifacts by digest
        ↓
Post-deploy verification
        ↓
Monitoring
```

---

# 311. MAGNIOM CI/CD SAFETY PRINCIPLE

The central question for every change is not:

> **“Did the pipeline pass?”**

It is:

> **“Can we demonstrate what changed, whether any clinically meaningful output changed, whether the change remains within the validated system, and exactly what artifact is being allowed to influence treatment?”**

---

# 312. FINAL ENTERPRISE PRINCIPLE

A mature Magniom release process should allow an auditor, engineer, scientist or clinician to choose any historical Target Slate and reconstruct:

### which source code created it;

### which database schema stored it;

### which phenotype generated it;

### which Evidence Library constrained it;

### which circuit files were used;

### which MRI pipeline produced the connectome;

### which Target Engine ranked candidates;

### which tests qualified that release;

### which vulnerabilities were known;

### which people approved deployment;

### whether that exact artifact passed Scientific Validation;

### and whether any later problem affected that case.

If this cannot be done:

# the CI/CD system is not yet enterprise-grade enough for Magniom.

---

# 313. MAGNIOM ENTERPRISE VERIFICATION MANIFESTO

# Treat scientific configuration as code.

# Treat evidence as a controlled dependency.

# Treat circuit maps as executable scientific assets.

# Treat database migrations as clinical-record changes.

# Treat RLS failures as release blockers.

# Treat target displacement as a regression signal.

# Treat preprocessing upgrades as possible algorithm changes.

# Build once and promote by digest.

# Generate provenance for every releasable artifact.

# Generate an SBOM for every release.

# Never put clinical data on ordinary CI runners.

# Never expose privileged scientific runners to untrusted PR code.

# Make every scientific output difference visible.

# Make every Clinical release independently approvable.

# Make production scientific drift detectable.

# Make defective releases traceable to every affected case.

# Roll software back when appropriate.

# Supersede scientific conclusions rather than rewriting history.

# Let automation produce evidence.

# Let governance decide whether that evidence justifies release.

That is the **Magniom Enterprise Verification, Testing & CI/CD Specification v1.0**.