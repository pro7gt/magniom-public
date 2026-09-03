# MAGNIOM
## Scientific Policy & Algorithm Configuration Specification v1.0

**Document status:** Canonical scientific-governance and algorithm-configuration specification  
**Date:** 1 September 2026  
**Initial Clinical Mode indication:** Major depressive disorder ± clinically significant anxious distress  
**Primary purpose:** Define the versioned scientific policy that governs which validated evidence, algorithms, neuroimaging pipelines, normative models, electric-field models and ranking parameters may participate in a Magniom Target Slate  
**Clinical authority:** Specialist clinician  
**Scientific-policy authority:** Approved Magniom scientific governance process  
**Initial deployment status:** Research / validation  
**Target deployment status:** Regulated clinician-facing decision-support software

**Depends on:**

- Magniom Clinical & Scientific Specification v1.0
- Magniom Canonical Target Data Specification v1.0
- Magniom Target Engine & Ranking Algorithm Specification v1.0
- Magniom Neuroimaging & Functional Connectomics Pipeline Specification v1.0
- Magniom Evidence Knowledge Graph & Therapeutic Circuit Library v1.0
- Magniom Clinical Phenotype & Symptom-to-Circuit Ontology v1.0
- Magniom Technical Architecture v1.0
- Magniom Supabase Database & Security Specification v1.0
- Magniom Implementation & Validation Roadmap v1.0

---

# 1. PURPOSE

This specification defines the canonical representation and governance of:

# `ScientificPolicyRelease`

A `ScientificPolicyRelease` determines:

- which scientific component versions may operate together;
- for which clinical indication;
- in which Magniom mode;
- which evidence strata may generate which classes of candidate;
- when patient-specific connectomics may influence ranking;
- which reliability thresholds apply;
- which personalisation tests apply;
- which ranking dimensions and weights apply;
- which anatomical and E-field rules apply;
- which normative-model uses are permitted;
- which candidate-generation methods are permitted;
- which abstention and fallback rules apply;
- which parameter values and parameter bounds are valid;
- which combinations are prohibited;
- what validation evidence supports the configuration;
- whether the configuration is authorised for Research Mode, validation use or Clinical Mode.

The governing rule is:

# No clinically meaningful scientific behaviour exists outside a versioned Scientific Policy release.

---

# 2. WHY A SCIENTIFIC POLICY LAYER IS NECESSARY

Magniom contains several independently versioned scientific systems:

```text
Evidence Library
Target Engine
Neuroimaging Pipeline
Normative Model
E-field Engine
Phenotype Ontology
Scientific Policy
```

Each system can evolve.

A technically valid version of one component does not imply scientific compatibility with every version of every other component.

For example:

```text
Normative Model 1.0
```

may have been validated only against:

```text
Neuro Pipeline 1.0
```

Likewise:

```text
Target Engine 1.2
```

may have been validated only against:

```text
Scientific Policy 1.3
+
Evidence Library 1.4
```

Magniom therefore must never infer:

> active component + active component = valid clinical combination.

Instead it requires an explicit:

# validated compatibility relationship.

---

# 3. FUNDAMENTAL POLICY PRINCIPLE

Magniom must distinguish:

# scientific knowledge

from:

# scientific policy

from:

# scientific implementation

from:

# engineering configuration.

These are different classes of artefact.

They must never be collapsed into a generic:

```text
config.json
```

whose contents can be changed operationally.

---

# 4. SCIENTIFIC KNOWLEDGE

Scientific knowledge describes what Magniom believes the literature supports.

Examples:

- EvidenceClaims;
- TherapeuticCircuits;
- TargetFamilies;
- symptom-to-circuit evidence mappings;
- target definitions;
- targeting strategies;
- protocol precedents.

Scientific knowledge belongs primarily to:

# `EvidenceLibraryRelease`

and the associated canonical scientific ontologies.

Scientific Policy does not rewrite the literature.

It governs:

> how approved scientific knowledge is permitted to participate in Magniom decision support.

---

# 5. SCIENTIFIC POLICY

Scientific Policy defines controlled decisions such as:

- Tier A may generate a Clinical Mode evidence anchor;
- Tier B may generate a defined symptom-circuit candidate;
- Tier C may support or refine an eligible A/B family only where explicitly permitted;
- Tier D and Tier R may not enter Clinical Mode ranking;
- patient-specific FC may influence ranking only above a validated reliability threshold;
- a personalised candidate must demonstrate defined incremental value over its evidence-only counterfactual;
- E-field metrics may enter comparative ranking only under defined completeness and validation conditions;
- normative deviations may be displayed but may not independently create a Clinical Mode target;
- candidates below defined reliability may fall back to an evidence-only hypothesis;
- raw utility scores may not be compared across incompatible candidate classes.

These are:

# scientific governance decisions.

---

# 6. SCIENTIFIC IMPLEMENTATION

Scientific implementation is the executable implementation of an already-defined scientific method.

Examples:

### Target Engine

- algorithm source code;
- deterministic tie-breaking implementation;
- geometric-mean utility calculation;
- redundancy calculation;
- slate-assembly implementation.

Belongs to:

# `TargetEngineVersion`

### Neuroimaging

- fMRIPrep version;
- tedana version;
- nuisance regression implementation;
- surface mapping implementation;
- FC computation;
- reliability computation.

Belongs to:

# `PipelineVersion`

### Normative modelling

- reference dataset;
- fitted coefficients;
- feature transformations;
- normative distributions.

Belongs to:

# `NormativeModelVersion`

### E-field modelling

- solver;
- conductivity model;
- head-model procedure;
- coil model;
- optimisation implementation.

Belongs to:

# `EFieldEngineVersion`

Scientific Policy may authorise these artefacts.

It must not absorb their implementation details into itself.

---

# 7. ENGINEERING CONFIGURATION

Engineering configuration controls operation of the software without changing scientific meaning or scientific output.

Examples may include:

- queue concurrency;
- worker lease duration;
- retry timing;
- log verbosity;
- telemetry destination;
- cache lifetime;
- HTTP timeout;
- UI colour theme;
- report pagination;
- infrastructure scaling;
- non-scientific notification settings.

The governing test is:

> **Could changing this value alter candidate eligibility, candidate coordinates, reliability classification, ranking, suppression, abstention, clinical explanation, or the evidence path presented to the clinician?**

If:

# yes

then it is not ordinary engineering configuration.

It belongs to:

- Scientific Policy;
- a scientific implementation version;
- or another controlled scientific artefact.

---

# 8. SCIENTIFIC CONFIGURATION TEST

A configuration value is scientific when it can materially influence any of:

```text
candidate generated?
candidate eligible?
candidate suppressed?
candidate coordinate?
candidate role?
candidate rank?
candidate reliability?
personalisation adopted?
E-field influence?
normative interpretation?
abstention?
fallback?
clinical limitation?
```

Such values must not be:

- environment variables editable in production;
- unrestricted database rows;
- browser settings;
- organisation preferences;
- user preferences;
- feature flags;
- hidden developer constants.

They require controlled versioning.

---

# 9. THE CANONICAL SCIENTIFIC COMPATIBILITY TUPLE

Every Clinical Mode Target Slate must be reconstructable from an approved tuple:

```text
EvidenceLibraryRelease
        ×
TargetEngineVersion
        ×
PipelineVersion
        ×
NormativeModelVersion
        ×
EFieldEngineVersion
        ×
Indication
        ×
Mode
```

This is the:

# Magniom Scientific Compatibility Tuple.

---

# 10. COMPATIBILITY IS CONJUNCTIVE

Clinical compatibility means:

```text
Evidence Library compatible
AND
Target Engine compatible
AND
Pipeline compatible
AND
Normative Model compatible if used
AND
E-field Engine compatible if used
AND
Indication permitted
AND
Mode permitted
```

A single incompatible element invalidates that scientific configuration.

Compatibility is not inferred transitively.

For example:

```text
Pipeline A compatible with Normative Model B
```

and:

```text
Pipeline A compatible with Target Engine C
```

does not prove:

```text
Normative Model B + Target Engine C
```

has been validated as a complete clinical configuration.

The complete combination must be permitted by an approved Scientific Policy release.

---

# 11. OPTIONAL SCIENTIFIC COMPONENTS

Not every Target Slate requires all components.

Magniom therefore distinguishes:

```text
required
optional
disabled
not_applicable
```

For example:

### Evidence-only configuration

```text
EvidenceLibraryRelease     required
TargetEngineVersion        required
PipelineVersion            not_applicable
NormativeModelVersion      not_applicable
EFieldEngineVersion        disabled
```

### Connectome-refined configuration

```text
EvidenceLibraryRelease     required
TargetEngineVersion        required
PipelineVersion            required
NormativeModelVersion      optional or required by policy
EFieldEngineVersion        optional
```

Missing optional components must never be silently converted into neutral numerical values.

---

# 12. CAPABILITY PROFILE

A Scientific Policy release may contain several approved capability profiles.

Examples:

```text
EVIDENCE_ONLY
CONNECTOME_REFINED
CONNECTOME_PLUS_NORMATIVE_CONTEXT
CONNECTOME_PLUS_EFIELD
RESEARCH_EXPERIMENTAL
```

Each profile defines exactly which scientific components are:

- required;
- optional;
- disabled;
- prohibited.

---

# 13. CLINICAL MODE REQUIRES EXACT VERSION PINNING

Clinical Mode compatibility must reference:

# immutable component-version identifiers.

Do not use:

```text
latest
current
>=1.0
compatible
production
stable
```

as executable scientific version selectors.

Use:

```text
EvidenceLibraryRelease UUID
TargetEngineVersion UUID
PipelineVersion UUID
NormativeModelVersion UUID
EFieldEngineVersion UUID
```

where applicable.

Human-readable semantic versions may accompany them.

---

# 14. RESEARCH MODE VERSIONING

Research Mode may evaluate:

- candidate releases;
- validation releases;
- experimental pipelines;
- experimental normative models;
- research E-field methods;
- alternative Scientific Policies.

However:

# every research run still records the exact versions actually used.

Research Mode is not unversioned mode.

---

# 15. CANONICAL `ScientificPolicyRelease`

```ts
interface ScientificPolicyRelease {
  id: UUID;

  code: string;
  semantic_version: string;

  title: string;
  description: string;

  lifecycle_status: ScientificPolicyLifecycleStatus;
  validation_status: ScientificPolicyValidationStatus;

  mode_scope: MagniomMode[];
  indication_scope: ClinicalConceptRef[];

  compatibility_profiles: ScientificCompatibilityProfile[];

  evidence_policy: EvidenceEligibilityPolicy;

  imaging_policy: ImagingQualificationPolicy;

  reliability_policy: ReliabilityPolicy;

  personalisation_policy: PersonalisationPolicy;

  normative_policy: NormativeModelPolicy;

  accessibility_policy: AccessibilityPolicy;

  efield_policy: EFieldPolicy;

  ranking_policy: RankingPolicy;

  redundancy_policy: RedundancyPolicy;

  convergence_policy: ConvergencePolicy;

  abstention_policy: AbstentionPolicy;

  explanation_policy: ExplanationPolicy;

  parameters: ScientificPolicyParameter[];

  prohibited_configurations: ProhibitedConfiguration[];

  validation_evidence: ValidationEvidenceRef[];

  change_classification: ScientificChangeClass;

  supersedes_release_id?: UUID;

  policy_payload_sha256: SHA256;
  compatibility_manifest_sha256: SHA256;
  release_manifest_sha256: SHA256;

  approvals: ScientificPolicyApproval[];

  release_signatures: ReleaseSignature[];

  created_at: ISO8601UTC;
  submitted_for_review_at?: ISO8601UTC;
  validated_at?: ISO8601UTC;
  released_at?: ISO8601UTC;
  superseded_at?: ISO8601UTC;
  withdrawn_at?: ISO8601UTC;

  created_by: ActorRef;
}
```

---

# 16. SCIENTIFIC POLICY LIFECYCLE STATUS

```ts
type ScientificPolicyLifecycleStatus =
  | "draft"
  | "under_review"
  | "validation"
  | "release_candidate"
  | "active"
  | "superseded"
  | "withdrawn"
  | "archived";
```

---

# 17. DRAFT

A `draft` policy:

- may change;
- is not immutable;
- may be incomplete;
- may be used for engineering development;
- must not generate Clinical Mode Target Slates.

---

# 18. UNDER REVIEW

An `under_review` policy:

- has a fixed review candidate payload;
- undergoes scientific and technical review;
- may be returned to draft;
- has no Clinical Mode authority.

Any payload modification after review begins requires:

# a new review revision.

---

# 19. VALIDATION

A policy in `validation`:

- is frozen for the relevant validation exercise;
- may be used only in an authorised validation context;
- records the exact validation datasets and protocols;
- must not be silently tuned against the validation dataset.

If parameters are changed:

# a new policy release candidate must be created.

---

# 20. RELEASE CANDIDATE

A `release_candidate` has:

- complete configuration;
- complete compatibility manifest;
- complete hashes;
- required validation evidence;
- completed impact analysis;
- no unresolved release-blocking defect;
- required governance approvals pending or complete.

It is not yet clinically active.

---

# 21. ACTIVE

An `active` Scientific Policy release is:

- immutable;
- approved;
- signed;
- permitted for the exact scope recorded by its release package.

`active` does not by itself mean:

# authorised for every clinical use.

Clinical use additionally requires inclusion in an approved:

# Clinical Release Package.

---

# 22. SUPERSEDED

A `superseded` policy:

- remains scientifically valid for reconstruction of historical outputs;
- may not normally be selected for new Clinical Mode cases;
- remains immutable;
- retains all evidence, validation, approvals and signatures.

Supersession does not mean deletion.

---

# 23. WITHDRAWN

A policy is `withdrawn` when new information creates a safety, scientific or integrity concern significant enough to prohibit further use.

Examples:

- material evidence error;
- invalid compatibility assumption;
- unsafe reliability threshold;
- clinically important ranking defect;
- corrupted scientific asset;
- validation failure;
- discovered laterality or coordinate issue.

Historical outputs remain reconstructable.

---

# 24. VALIDATION STATUS IS SEPARATE FROM LIFECYCLE

Lifecycle answers:

> Where is this release operationally?

Validation status answers:

> What level of validation supports it?

These must not be collapsed.

---

# 25. SCIENTIFIC POLICY VALIDATION STATUS

```ts
type ScientificPolicyValidationStatus =
  | "design_only"
  | "engineering_verified"
  | "retrospective_validated"
  | "silent_prospective_validated"
  | "clinician_assisted_validated"
  | "clinical_release_qualified";
```

These statuses represent increasing validation maturity.

They are not claims of universal clinical efficacy.

---

# 26. DESIGN ONLY

`design_only` means:

- algorithmic policy specified;
- validation not completed.

Permitted use:

```text
M0–M2 development/research as authorised
```

Clinical treatment influence:

# prohibited.

---

# 27. ENGINEERING VERIFIED

Requires evidence that:

- policy schema validates;
- compatibility checks execute correctly;
- deterministic Target Engine behaviour is verified;
- Golden Cases behave as specified;
- prohibited configurations fail;
- Research/Clinical boundaries operate correctly.

This corresponds principally to:

# verification.

It is not clinical validation.

---

# 28. RETROSPECTIVE VALIDATED

Requires a locked retrospective protocol appropriate to the changed scientific behaviour.

The release records:

- dataset version;
- cohort definition;
- analysis plan;
- endpoints;
- validation report;
- deviations;
- results;
- limitations.

Parameters must not be repeatedly tuned against the locked validation cohort.

---

# 29. SILENT PROSPECTIVE VALIDATED

Requires use in a prospective environment where:

- Magniom generates outputs;
- treating clinicians do not see the outputs before treatment decisions;
- prospective workflow, reliability and scientific behaviour can be evaluated without influencing care.

---

# 30. CLINICIAN-ASSISTED VALIDATED

Applies when the Scientific Policy has been evaluated in an approved prospective context in which authorised clinicians may review Magniom output.

The exact evidentiary meaning depends on:

- protocol;
- intended purpose;
- endpoints;
- regulatory context.

---

# 31. CLINICAL RELEASE QUALIFIED

`clinical_release_qualified` means the policy component has satisfied the scientific-policy requirements necessary for inclusion in a Clinical Release Package.

It does not independently establish:

- regulatory authorisation;
- product release;
- superior treatment outcome;
- universal external validity.

---

# 32. VALIDATION EVIDENCE RECORD

```ts
interface ValidationEvidenceRef {
  id: UUID;

  validation_type:
    | "unit"
    | "integration"
    | "golden_case"
    | "scientific_verification"
    | "sensitivity_analysis"
    | "retrospective"
    | "silent_prospective"
    | "clinician_assisted"
    | "human_factors"
    | "security"
    | "regulatory";

  protocol_id: UUID;
  report_id: UUID;

  dataset_release_id?: UUID;

  passed: boolean;

  limitations: string[];

  completed_at: ISO8601UTC;
}
```

---

# 33. SCIENTIFIC COMPATIBILITY PROFILE

```ts
interface ScientificCompatibilityProfile {
  id: UUID;

  code: string;

  indication: ClinicalConceptRef;
  mode: MagniomMode;

  capability:
    | "evidence_only"
    | "connectome_refined"
    | "connectome_normative"
    | "connectome_efield"
    | "research_experimental";

  evidence_library_release_id: UUID;
  target_engine_version_id: UUID;

  pipeline: {
    requirement: "required" | "optional" | "disabled" | "not_applicable";
    permitted_version_ids: UUID[];
  };

  normative_model: {
    requirement: "required" | "optional" | "disabled" | "not_applicable";
    permitted_version_ids: UUID[];
  };

  efield_engine: {
    requirement: "required" | "optional" | "disabled" | "not_applicable";
    permitted_version_ids: UUID[];
  };

  phenotype_ontology_version_id: UUID;

  compatible: boolean;

  validation_evidence_ids: UUID[];

  limitations: string[];
}
```

---

# 34. COMPATIBILITY PROFILE IS A WHITELIST

Clinical Mode uses:

# positive compatibility.

The engine asks:

> Is this exact scientific combination explicitly allowed?

not:

> Can I find a reason why it should probably work?

If no matching approved profile exists:

```text
SCIENTIFIC_CONFIGURATION_INCOMPATIBLE
```

and the configuration cannot generate a Clinical Mode Target Slate.

---

# 35. COMPONENT STATUS REQUIREMENT

For Clinical Mode:

### EvidenceLibraryRelease

must be clinically active.

### TargetEngineVersion

must be clinically active and validated for the policy.

### PipelineVersion

where used, must be clinically active and validated.

### NormativeModelVersion

where used, must be clinically active and explicitly compatible with the processing pipeline.

### EFieldEngineVersion

where used in clinical reasoning, must be clinically active for the specified role.

Research-only versions cannot be imported merely because their API contract is compatible.

---

# 36. EVIDENCE ELIGIBILITY POLICY

Evidence permissions must be:

# role-aware.

Do not use a flat configuration such as:

```json
{
  "clinical_target_family_tiers": ["A", "B", "C"]
}
```

as the complete clinical rule.

Instead:

```ts
interface EvidenceTierPermission {
  tier: EvidenceTier;

  standalone_primary: boolean;
  standalone_additional: boolean;
  may_refine_parent_tiers: EvidenceTier[];
  may_supply_supporting_context: boolean;

  permitted_candidate_roles: CandidateRole[];
  permitted_generation_methods: TargetingStrategyRef[];
}
```

---

# 37. CLINICAL V1 EVIDENCE PRINCIPLE

For Clinical Mode v1:

### Tier A

May generate evidence-supported clinical candidates according to the TargetFamily's permitted role.

### Tier B

May generate defined clinical candidates according to approved evidence and role-specific rules.

### Tier C

Must not automatically become a standalone primary clinical target merely because Tier C is generally recognised.

Tier C may:

- supply supporting evidence;
- inform uncertainty;
- refine an already eligible Tier A/B TargetFamily;

only where the active Scientific Policy explicitly permits that role.

### Tier D

Clinical ranking prohibited.

### Tier R

Clinical ranking prohibited.

---

# 38. TARGETING METHOD PERMISSION

Evidence eligibility must apply not only to:

# TargetFamily

but also to:

# candidate-generation method.

For example, an Evidence Library may support:

```text
fixed_group_coordinate
```

without yet supporting:

```text
patient_specific_fc_peak
```

for the same TargetFamily.

Therefore Scientific Policy must validate:

```text
EvidenceClaim
+
TargetFamily
+
TargetingStrategy
+
mode
```

before that strategy can produce a clinical candidate.

---

# 39. IMAGING QUALIFICATION POLICY

Scientific Policy defines the clinical thresholds by which imaging/connectomics may influence targeting.

Parameter classes include:

- minimum usable resting-state duration;
- maximum or conditional motion criteria;
- required QC state;
- registration qualification;
- segmentation qualification;
- parcel-coverage qualification;
- sensitivity-analysis requirements;
- minimum reliability class.

The actual processing implementation remains in:

# `PipelineVersion`.

---

# 40. RELIABILITY POLICY

Scientific Policy defines the mapping between quantitative reliability measurements and clinical interpretation.

Conceptually:

```text
R ≥ THIGH
→ high

TMODERATE ≤ R < THIGH
→ moderate

TLOW ≤ R < TMODERATE
→ low

R < TLOW
→ unreliable
```

The thresholds are:

- versioned;
- scientifically justified;
- bounded;
- validated;
- immutable after activation.

The values are not defined by this schema specification.

They belong to each Scientific Policy release.

---

# 41. RELIABILITY IS NOT USER-ADJUSTABLE

A clinician may inspect reliability.

A clinician may disagree with the resulting recommendation.

A clinician may choose another target.

But the clinician cannot change:

```text
minimum_personalisation_reliability
```

for a case.

That would create an unvalidated algorithm variant.

---

# 42. PERSONALISATION POLICY

Personalisation must earn its place relative to an evidence-only counterfactual.

Scientific Policy defines:

- minimum reliability;
- permitted TargetFamilies;
- permitted search methods;
- maximum permitted search space;
- minimum improvement in circuit concordance where applicable;
- acceptable displacement logic;
- required counterfactual comparison;
- failure behaviour.

Patient-specific imaging does not receive priority merely because it exists.

---

# 43. PERSONALISATION FALLBACK

If personalisation qualification fails:

```text
patient-specific candidate
→ cannot displace evidence baseline
```

where clinically valid:

```text
Target Slate
→ evidence-supported candidate(s)
```

Output must state why personalisation was not used.

Failure of personalised imaging is not necessarily failure of the entire Target Slate.

---

# 44. NORMATIVE MODEL POLICY

Normative modelling is a separate scientific layer.

Scientific Policy must define whether normative information is:

```text
disabled
display_only
supporting_context
ranking_component
candidate_generation_component
```

Clinical Mode v1 should not allow normative abnormality alone to create an otherwise unsupported clinical TargetFamily.

---

# 45. NORMATIVE PIPELINE COMPATIBILITY

A NormativeModelVersion is valid only against explicitly compatible preprocessing.

Magniom must reject:

```text
patient PipelineVersion A
+
NormativeModel trained/validated on incompatible PipelineVersion B
```

unless a formally validated harmonisation path is itself versioned and approved.

Equivalent matrix dimensions do not establish scientific compatibility.

---

# 46. ACCESSIBILITY POLICY

Scientific Policy defines interpretation of:

```text
good
conditional
poor
```

accessibility.

Clinical Mode may define:

### good

eligible.

### conditional

eligible with explicit penalty and/or warning.

### poor

ineligible.

Exact rules belong to the active release.

---

# 47. E-FIELD POLICY

Scientific Policy defines whether E-field information is:

```text
disabled
display_only
pose_optimisation_only
accessibility_component
ranking_component
```

The default role must remain explicit.

E-field modelling is not automatically a clinical efficacy measure.

---

# 48. E-FIELD COMPLETENESS RULE

Within a scientifically comparable candidate group:

either:

```text
all candidates receive the required E-field evaluation
```

or:

```text
E-field does not contribute to comparative ranking.
```

A candidate must not receive ranking advantage merely because an E-field simulation happens to be available for it.

---

# 49. `EFieldEngineVersion`

Canonical representation:

```ts
interface EFieldEngineVersion {
  id: UUID;

  code: string;
  semantic_version: string;

  head_model_version: string;
  segmentation_version: string;

  conductivity_model_id: string;
  coil_model_version_ids: UUID[];

  solver_version: string;
  optimisation_algorithm_version?: string;

  container_digest: string;
  configuration_sha256: SHA256;

  mode: MagniomMode;

  validation_status: ComponentValidationStatus;
  lifecycle_status: ComponentLifecycleStatus;

  released_at?: ISO8601UTC;
}
```

The implementation may store this through a general pipeline/version registry.

Its canonical scientific identity remains:

# E-field engine version.

---

# 50. RANKING POLICY

Ranking parameters include, where applicable:

```text
wP
wC
wR
wA
wF
```

representing:

- phenotype concordance;
- therapeutic-circuit concordance;
- reliability;
- accessibility;
- E-field contribution.

Scientific Policy defines the approved values.

The Target Engine defines how those values are mathematically applied.

---

# 51. EVIDENCE DOES NOT BECOME A COMPENSABLE WEIGHT

Scientific Policy must not convert:

```text
Tier A
Tier B
Tier C
```

into arbitrary linear scores that can be compensated by connectomic features.

Evidence determines:

- eligibility;
- permitted role;
- ranking stratum;
- evidence ceiling.

This preserves:

# gates before scores.

---

# 52. ROLE-SPECIFIC UTILITY

Scientific Policy must specify which dimensions apply to each candidate class.

For example:

### Evidence Candidate

May use:

- phenotype;
- accessibility;
- permitted E-field information.

### Connectome-Refined Candidate

May additionally use:

- circuit concordance;
- reliability.

### Symptom-Circuit Candidate

May use:

- relevant clinical-domain priority;
- circuit concordance;
- reliability;
- accessibility.

Raw utility values across scientifically incompatible candidate classes must not be interpreted as universal scores.

---

# 53. PARAMETER OBJECT

Every scientific parameter must have canonical metadata.

```ts
interface ScientificPolicyParameter {
  code: string;

  group:
    | "evidence"
    | "imaging_qc"
    | "reliability"
    | "personalisation"
    | "ranking"
    | "redundancy"
    | "accessibility"
    | "efield"
    | "convergence"
    | "abstention"
    | "explanation";

  value_type:
    | "number"
    | "integer"
    | "boolean"
    | "enum"
    | "duration"
    | "distance"
    | "ratio"
    | "structured";

  value: unknown;

  unit?: string;

  bounds?: ParameterBounds;

  permitted_values?: string[];

  rationale: string;

  validation_basis: ValidationEvidenceRef[];

  safety_critical: boolean;

  change_impact_class: ScientificChangeClass;
}
```

---

# 54. PARAMETER BOUNDS

```ts
interface ParameterBounds {
  lower?: number;
  upper?: number;

  lower_inclusive?: boolean;
  upper_inclusive?: boolean;

  validated_lower?: number;
  validated_upper?: number;
}
```

A policy value must lie:

# inside its approved bounds.

---

# 55. BOUNDS ARE NOT CLAMPING RULES

If:

```text
configured value > validated upper bound
```

Magniom must not silently convert it to:

```text
validated upper bound.
```

Instead:

```text
POLICY_PARAMETER_OUT_OF_BOUNDS
```

and release activation must fail.

Silent clamping would create a configuration different from the signed policy.

---

# 56. SCIENTIFIC PARAMETER GROUPS

At minimum Scientific Policy controls:

### Evidence

- permitted tiers by candidate role;
- permitted targeting methods;
- evidence ceilings.

### Imaging

- minimum connectome QC;
- minimum scan duration;
- required sensitivity processing.

### Reliability

- reliability mappings;
- minimum personalisation reliability.

### Personalisation

- minimum circuit improvement;
- counterfactual comparison requirements;
- adoption thresholds.

### Ranking

- role-specific utility weights;
- conditional penalties.

### Candidate geometry

- cluster threshold;
- minimum cluster size.

### Redundancy

- spatial redundancy threshold;
- family/role redundancy rules.

### E-field

- permitted role;
- overlap threshold;
- completeness requirements.

### Convergence

- convergence thresholds.

### Counterfactual

- impact/displacement bands.

### Abstention

- hard-failure conditions;
- fallback permissions.

---

# 57. PARAMETERS MUST HAVE SCIENTIFIC RATIONALE

A parameter cannot enter an active Clinical Mode policy solely because:

> it seemed reasonable during development.

Each clinically material parameter must record:

- rationale;
- origin;
- development evidence;
- sensitivity analysis;
- validation evidence;
- known limitations.

Where empirical justification remains incomplete:

# Clinical Mode activation is blocked or the feature must remain non-influential.

---

# 58. NO PRODUCTION TUNING

Production users must not tune:

- utility weights;
- evidence eligibility;
- reliability thresholds;
- scan-duration thresholds;
- redundancy distances;
- personalisation thresholds;
- E-field thresholds;
- convergence thresholds.

No organisation-specific:

```text
“more aggressive personalisation”
```

setting is permitted unless separately specified, validated and released as its own Scientific Policy.

---

# 59. PROHIBITED CONFIGURATION CLASS

```ts
interface ProhibitedConfiguration {
  code: string;
  description: string;

  severity:
    | "clinical_block"
    | "scientific_block"
    | "validation_block";

  detection_rule: PolicyExpression;

  allowed_fallback?: FallbackAction;
}
```

---

# 60. ABSOLUTE CLINICAL PROHIBITIONS

Clinical Mode must reject configurations containing:

### Research evidence leakage

```text
Tier D/R as clinical-ranking basis
```

unless future formally validated governance changes the policy.

### Research-mode scientific object

```text
object.mode = research
```

used as a clinical component.

### Unsupported indication

A policy validated for MDD cannot generate a Clinical Mode slate for another indication.

### Unapproved component combination

No matching compatibility profile.

### Incompatible normative processing

Normative model and patient pipeline are scientifically incompatible.

### Unqualified FC personalisation

Patient-specific FC affects ranking below the required reliability/QC threshold.

### Partial E-field ranking

Some comparable candidates receive E-field advantage while others do not.

### Dynamic scientific input

Ranking depends on:

- live internet search;
- live PubMed search;
- current time;
- LLM output;
- undocumented user preference;
- random sampling.

### Uncontrolled parameter

A ranking-relevant parameter comes from outside the signed Scientific Policy.

### Out-of-bound parameter

Configured value falls outside approved bounds.

### Missing provenance

Required scientific component cannot be uniquely reconstructed.

---

# 61. ADDITIONAL PROHIBITIONS

Clinical Mode must not permit:

- `latest` scientific version selectors;
- automatic online learning;
- outcome-driven automatic weight updates;
- silent Evidence Library replacement;
- silent Policy replacement;
- silent pipeline upgrades;
- silent normative-model upgrades;
- silent E-field-engine upgrades;
- silent recalculation of historical Target Slates;
- unrestricted admin editing of scientific parameters;
- organisation-local scientific overrides;
- UI-controlled clinical thresholds;
- arbitrary developer feature flags that alter scientific output;
- unsupported TargetFamily generation;
- unsupported candidate-generation methods;
- cross-class utility comparisons without role logic;
- guessed personalised targets after failed imaging;
- clinical target creation from normative abnormality without an evidence path;
- treatment-protocol prescription by the Target Engine.

---

# 62. FAIL-CLOSED PRINCIPLE

Where a prohibited scientific combination is detected:

# Clinical Mode fails closed.

The system may use a defined fallback only if the active Scientific Policy explicitly permits it.

For example:

```text
FC qualification fails
+
evidence-only targeting remains valid
→ evidence-only Target Slate
```

But:

```text
unsupported indication
→ no Clinical Mode Target Slate
```

---

# 63. ABSTENTION POLICY

Scientific Policy defines which failures lead to:

### feature abstention

Example:

```text
personalised FC disabled
but evidence baseline remains valid
```

versus:

### Target Slate abstention

Example:

```text
clinical scope invalid
```

versus:

### complete processing failure

Example:

```text
scientific configuration integrity failure
```

Abstention is a valid Magniom output.

---

# 64. SCIENTIFIC POLICY PROMOTION

Canonical promotion:

```text
DRAFT
  ↓
SCIENTIFIC REVIEW
  ↓
TECHNICAL REVIEW
  ↓
VALIDATION
  ↓
IMPACT ANALYSIS
  ↓
RELEASE CANDIDATE
  ↓
GOVERNANCE APPROVAL
  ↓
SIGNATURE
  ↓
ACTIVE
```

Clinical use requires additional inclusion in an approved:

# Clinical Release Package.

---

# 65. RESEARCH-MODE PROMOTION

A Scientific Policy may become active for Research Mode before it qualifies for Clinical Mode.

Requirements still include:

- version identity;
- hashes;
- provenance;
- compatibility declaration;
- defined parameters;
- audit;
- appropriate scientific review.

Research activation does not imply clinical eligibility.

---

# 66. CLINICAL-MODE PROMOTION

Clinical promotion requires evidence that the complete scientific configuration satisfies the appropriate:

### Engineering / Security gate

### Scientific / Clinical gate

### Human-Factors gate

### Regulatory / Quality gate

according to the Magniom validation programme.

Clinical Mode is not activated by changing:

```text
mode = clinical
```

in a database.

---

# 67. SCIENTIFIC PROMOTION REQUIREMENTS

Before a Scientific Policy release may enter a Clinical Release Package:

- all critical parameters are defined;
- all parameters are within validated bounds;
- compatibility profiles are complete;
- scientific component versions are immutable;
- Golden Cases pass;
- deterministic behaviour is confirmed;
- Research/Clinical separation is verified;
- evidence eligibility has been independently reviewed;
- required reliability thresholds are empirically justified;
- candidate-generation methods are reproducible;
- relevant retrospective validation is complete;
- relevant prospective validation is complete to the level required by intended use;
- no unresolved critical scientific defect exists;
- risk impact is assessed;
- release approvals are complete;
- release signatures verify.

---

# 68. APPROVAL IS DIFFERENT FROM SIGNATURE

Magniom distinguishes:

# governance approval

from:

# cryptographic release signature.

Approval answers:

> Which authorised people accepted scientific responsibility for this release?

Signature answers:

> Can Magniom prove that the exact approved payload has not changed?

Both are required for Clinical Mode.

---

# 69. SCIENTIFIC POLICY APPROVAL

```ts
interface ScientificPolicyApproval {
  id: UUID;

  release_id: UUID;

  approver_id: UUID;

  approval_role:
    | "scientific"
    | "clinical"
    | "technical"
    | "quality_regulatory"
    | "security";

  decision:
    | "approved"
    | "rejected"
    | "approved_with_documented_limitation";

  reasoning: string;

  approved_manifest_sha256: SHA256;

  approved_at: ISO8601UTC;
}
```

---

# 70. MINIMUM CLINICAL APPROVAL MODEL

Clinical activation must not depend on one developer.

At minimum the Clinical Release Package should demonstrate approval appropriate to:

### Scientific

Connectomics/neuroimaging/scientific lead.

### Clinical

Qualified TMS clinical lead.

### Technical

Technical implementation lead.

### Quality / Regulatory

Quality or regulatory authority appropriate to the development stage.

Security approval may be managed at the Clinical Release Package level where security configuration has not changed.

Creator and final approver should be different people for clinically material policy changes.

---

# 71. RELEASE SIGNATURE

```ts
interface ReleaseSignature {
  id: UUID;

  release_id: UUID;

  signed_manifest_sha256: SHA256;

  signature_algorithm: string;

  signature_value: string;

  signing_key_id: string;

  signer_identity: ActorRef;

  signer_role: string;

  signed_at: ISO8601UTC;
}
```

This specification does not mandate one cryptographic signature algorithm.

The approved implementation must use a controlled, auditable signing mechanism appropriate to the quality/security framework.

---

# 72. WHAT IS SIGNED

The signed object is the:

# Scientific Policy Release Manifest.

The manifest contains hashes of:

- policy payload;
- compatibility profiles;
- parameter set;
- parameter bounds;
- prohibited-configuration rules;
- validation-evidence index;
- approval index;
- component-version identities.

Any alteration changes the manifest hash.

---

# 73. HASH STANDARD

Scientific configuration artefacts use:

# SHA-256

for integrity manifests unless superseded through controlled architecture change.

Store separately:

```text
policy_payload_sha256
compatibility_manifest_sha256
release_manifest_sha256
```

Do not rely only on:

```text
semantic_version = "1.2.0"
```

for integrity.

---

# 74. CANONICAL RELEASE MANIFEST

Conceptually:

```json
{
  "scientific_policy": "MAGNIOM-POLICY-1.0.0",

  "policy_id": "uuid",
  "policy_payload_sha256": "...",

  "compatibility_profiles_sha256": "...",

  "indication_scope": [
    "MDD"
  ],

  "mode_scope": [
    "research"
  ],

  "component_compatibility": [
    {
      "capability": "connectome_refined",
      "evidence_library_release_id": "uuid",
      "target_engine_version_id": "uuid",
      "pipeline_version_id": "uuid",
      "normative_model_version_id": "uuid-or-null",
      "efield_engine_version_id": "uuid-or-null"
    }
  ],

  "parameters_sha256": "...",
  "prohibited_configuration_rules_sha256": "...",
  "validation_evidence_index_sha256": "...",

  "release_manifest_sha256": "..."
}
```

The exact initial IDs and parameter values are not defined by this specification.

They must be supplied by a controlled release.

---

# 75. REPRODUCIBILITY MANIFEST

Every Target Slate must record enough information to reconstruct the exact scientific configuration.

At minimum:

```text
Scientific Policy Release
Evidence Library Release
Target Engine Version
Neuro Pipeline Version where used
Atlas Version
Normative Model Version where used
E-field Engine Version where used
Phenotype Ontology Version
Indication
Mode
```

The Target Slate records:

# reproducibility manifest hash.

---

# 76. SCIENTIFIC POLICY IMMUTABILITY

Once a Scientific Policy reaches:

```text
validation
```

its validation payload must remain frozen for that validation exercise.

Once:

```text
active
```

it is permanently immutable.

Changing any executable scientific content creates:

# a new ScientificPolicyRelease.

---

# 77. NO SILENT RECALCULATION

When Scientific Policy 1.1 supersedes 1.0:

historical:

```text
Target Slate
Scientific Policy 1.0
```

remains unchanged.

Do not silently regenerate it under 1.1.

A clinician or researcher may explicitly request a new comparative run.

That produces a new Target Slate with new provenance.

---

# 78. SUPERSESSION

A new policy may supersede an old policy because of:

- new validation;
- improved threshold;
- new Evidence Library;
- new Target Engine;
- pipeline change;
- normative model change;
- E-field change;
- scientific correction;
- safety restriction;
- indication expansion.

The new release records:

```text
supersedes_release_id
```

and a structured supersession reason.

---

# 79. WITHDRAWAL AND SAFETY RESPONSE

If a scientifically material defect is discovered:

```text
active
→ withdrawn
```

may occur without deleting history.

The system must identify:

- affected Clinical Release Packages;
- affected Target Slates;
- affected component tuples;
- affected cases where required;
- whether clinician notification or corrective action is required under the relevant quality process.

Withdrawal is not implemented by editing old Target Slates.

---

# 80. CHANGE CLASSIFICATION

```ts
type ScientificChangeClass =
  | "non_scientific"
  | "scientific_implementation"
  | "scientific_parameter"
  | "scientific_model"
  | "indication_scope";
```

---

# 81. NON-SCIENTIFIC CHANGE

Examples:

- formatting;
- nonclinical copy;
- infrastructure configuration that cannot influence scientific output.

Does not require a new Scientific Policy unless the signed release manifest explicitly includes the changed artefact.

---

# 82. SCIENTIFIC IMPLEMENTATION CHANGE

Example:

> Target Engine code changed but the intended scientific algorithm did not.

Requires:

- new TargetEngineVersion;
- regression verification;
- Golden Case comparison;
- compatibility reassessment.

A new Scientific Policy may be required to authorise the new TargetEngineVersion.

---

# 83. SCIENTIFIC PARAMETER CHANGE

Examples:

- reliability threshold;
- utility weight;
- minimum circuit improvement;
- redundancy distance;
- E-field threshold.

Requires:

# new ScientificPolicyRelease.

Also requires:

- sensitivity analysis;
- impact analysis;
- validation appropriate to risk.

Existing Target Slates remain unchanged.

---

# 84. SCIENTIFIC MODEL CHANGE

Examples:

- new ranking method;
- new candidate-generation method;
- new personalisation logic;
- new evidence role;
- normative abnormality becomes candidate-generating;
- E-field becomes major efficacy-ranking component.

Requires:

- formal scientific impact assessment;
- new Scientific Policy;
- likely new Target Engine and/or scientific component versions;
- validation proportionate to changed intended behaviour.

---

# 85. INDICATION-SCOPE CHANGE

Adding:

```text
OCD
PTSD
pain
tinnitus
stroke
```

is not a parameter adjustment.

It requires:

- new indication-specific scientific evidence;
- ontology extension;
- evidence release;
- TargetFamily review;
- Scientific Policy;
- validation;
- regulatory/clinical scope review.

No MDD policy automatically generalises to another indication.

---

# 86. SEMANTIC VERSIONING

Scientific Policy uses:

```text
MAJOR.MINOR.PATCH
```

### Patch

Non-behavioural correction that cannot change candidate generation, eligibility, ranking, suppression or abstention.

Example:

- spelling;
- non-executable rationale clarification.

### Minor

Controlled scientific change within the same basic intended algorithm/scope.

Examples:

- parameter revision;
- compatibility with a newly validated component version;
- evidence eligibility refinement.

### Major

Material scientific architecture or intended-scope change.

Examples:

- ranking architecture change;
- evidence-tier semantics change;
- new candidate-generation paradigm;
- new indication family.

Regardless of semantic label:

# any change capable of changing a Target Slate requires impact validation.

---

# 87. CHANGE IMPACT REPORT

Every clinically relevant proposed release must generate a:

# Scientific Policy Change Impact Report.

It should answer:

- Which parameters changed?
- Which bounds changed?
- Which compatibility tuples changed?
- Which TargetFamilies changed eligibility?
- Which candidate-generation methods changed?
- Which Golden Cases changed?
- Which historical validation cases changed?
- How many candidate ranks changed?
- How many Primary Candidate 1 selections changed?
- What was the coordinate displacement distribution?
- Did abstention rate change?
- Did personalisation adoption rate change?
- Did Research/Clinical classification change?
- Were new safety risks introduced?
- What validation is required?

---

# 88. EVIDENCE LIBRARY UPDATE

New scientific literature follows:

```text
source
↓
staging
↓
claim review
↓
Evidence Library release
↓
impact analysis
↓
Scientific Policy compatibility
↓
clinical activation
```

A new Evidence Library does not automatically become the active evidence source for existing Scientific Policies.

---

# 89. TARGET ENGINE UPDATE

New Target Engine version:

```text
code change
↓
verification
↓
Golden Cases
↓
determinism test
↓
scientific equivalence/impact analysis
↓
Scientific Policy compatibility
```

Only then may it participate in an approved Clinical Mode tuple.

---

# 90. PIPELINE UPDATE

A new neuroimaging pipeline requires:

- frozen container;
- version manifest;
- imaging validation;
- target-displacement analysis;
- reliability comparison;
- sensitivity review;
- compatibility reassessment with normative models;
- Scientific Policy compatibility.

A software package being newer is not sufficient.

---

# 91. NORMATIVE MODEL UPDATE

New NormativeModelVersion:

```text
1.0
→
1.1
```

does not alter old normative findings.

Compatibility must be reassessed against:

- pipeline;
- population;
- feature definitions;
- intended clinical role;
- Scientific Policy.

---

# 92. E-FIELD ENGINE UPDATE

New EFieldEngineVersion requires reassessment of:

- head model;
- segmentation;
- conductivity;
- device/coil model;
- solver;
- optimisation;
- field metrics;
- candidate ranking influence.

A new E-field engine cannot enter Clinical Mode because:

> it produces plausible-looking fields.

---

# 93. CLINICAL RELEASE PACKAGE RELATIONSHIP

The complete production release should bind:

```text
Application Version
Database Migration Version
Scientific Policy Release
Evidence Library Release
Target Engine Version
Neuro Pipeline Version
Normative Model Version
Atlas Version
E-field Engine Version
Phenotype Ontology Version
```

This creates the:

# Magniom Clinical Release Package.

Scientific Policy governs scientific compatibility inside that package.

---

# 94. RUNTIME POLICY SELECTION

Clinical users do not select Scientific Policy versions from a dropdown.

The production Clinical Release Package determines the active permitted policy.

A Target Slate-generation command may specify:

```text
scientific_policy_release_id
```

internally.

The server verifies that it is authorised by the installed Clinical Release Package.

---

# 95. NO ORGANISATION-SPECIFIC POLICY OVERRIDES

An organisation must not independently modify:

- evidence tiers;
- ranking weights;
- thresholds;
- candidate-generation rules.

If a scientifically distinct configuration is required:

# create and validate a separate ScientificPolicyRelease.

Local operational configuration is allowed only where it cannot change scientific output.

---

# 96. DATABASE REPRESENTATION

Canonical database implementation should separate:

```text
system.scientific_policy_releases
system.scientific_policy_parameters
system.scientific_policy_compatibility_profiles
system.scientific_policy_component_versions
system.scientific_policy_prohibitions
system.scientific_policy_validation_evidence
system.scientific_policy_approvals
system.scientific_policy_signatures
```

Core scientific meaning should not exist only inside one unrestricted JSON blob.

JSON may be used for structured version-specific payloads where appropriate.

---

# 97. MINIMUM RELEASE TABLE

Conceptually:

```sql
create table system.scientific_policy_releases (
  id uuid primary key,

  code text not null,
  semantic_version text not null unique,

  lifecycle_status text not null,
  validation_status text not null,

  policy_payload jsonb not null,

  policy_payload_sha256 bytea not null,
  compatibility_manifest_sha256 bytea not null,
  release_manifest_sha256 bytea not null,

  supersedes_release_id uuid,

  created_at timestamptz not null,
  validated_at timestamptz,
  released_at timestamptz,
  superseded_at timestamptz,
  withdrawn_at timestamptz
);
```

This is an implementation mapping.

The canonical semantics are defined by this document.

---

# 98. DATABASE ACTIVATION CONSTRAINT

A Clinical Mode Scientific Policy cannot become active unless:

```text
release_manifest_sha256 present
AND
required approvals present
AND
required signatures valid
AND
validation_status sufficient
AND
all compatibility references exist
AND
all parameter bounds valid
AND
no prohibited component state exists.
```

Activation must occur through:

# controlled domain command.

Not:

```sql
UPDATE scientific_policy_releases
SET lifecycle_status = 'active';
```

from a generic admin interface.

---

# 99. TARGET SLATE FOREIGN REFERENCES

Every Target Slate must reference:

```text
scientific_policy_release_id
evidence_library_release_id
target_engine_version_id
```

and where used:

```text
pipeline_version_id
normative_model_version_id
efield_engine_version_id
```

These references must agree with one approved compatibility profile.

---

# 100. POLICY INTEGRITY CHECK BEFORE ENGINE EXECUTION

Canonical sequence:

```text
LOAD SCIENTIFIC POLICY
        ↓
VERIFY RELEASE HASH
        ↓
VERIFY RELEASE SIGNATURE
        ↓
VERIFY STATUS / MODE
        ↓
VERIFY INDICATION
        ↓
VERIFY COMPONENT COMPATIBILITY
        ↓
VERIFY PARAMETER BOUNDS
        ↓
VERIFY PROHIBITED CONFIGURATIONS
        ↓
RUN TARGET ENGINE
```

Failure before engine execution means:

# no Clinical Mode ranking.

---

# 101. POLICY INTEGRITY CHECK AFTER ENGINE EXECUTION

Before publishing a Target Slate:

```text
engine version matches policy
evidence release matches policy
pipeline matches policy
normative model matches policy
E-field engine matches policy
mode matches policy
indication matches policy
reproducibility manifest complete
```

Only then may the slate become:

```text
ready_for_review
```

---

# 102. DETERMINISM REQUIREMENT

For identical:

- PhenotypeSnapshot;
- EvidenceLibraryRelease;
- ScientificPolicyRelease;
- TargetEngineVersion;
- Pipeline outputs;
- ReliabilityProfile;
- NormativeModelVersion;
- EFieldEngineVersion;
- device context;

Magniom must produce identical:

- candidate generation;
- eligibility;
- feature calculation;
- ranking;
- suppression;
- convergence;
- abstention;
- Target Slate.

Scientific Policy must not permit hidden nondeterministic inputs in Clinical Mode.

---

# 103. POLICY AUDIT EVENTS

Audit events include:

```text
POLICY_CREATED
POLICY_REVIEW_STARTED
POLICY_REVIEW_REJECTED
POLICY_VALIDATION_STARTED
POLICY_VALIDATION_COMPLETED
POLICY_APPROVED
POLICY_SIGNED
POLICY_ACTIVATED
POLICY_SUPERSEDED
POLICY_WITHDRAWN
POLICY_COMPATIBILITY_REJECTED
POLICY_INTEGRITY_FAILURE
```

Audit records must be append-only.

---

# 104. RELEASE SIGNATURE VERIFICATION FAILURE

If a Clinical Mode Scientific Policy fails signature or hash verification:

```text
SCIENTIFIC_POLICY_INTEGRITY_FAILURE
```

Clinical Target generation is blocked.

Do not:

- automatically repair;
- fall back to another Policy;
- silently select the newest Policy.

This is a high-severity system-integrity event.

---

# 105. POLICY VERSION NOT FOUND

If a historical Target Slate references a Policy no longer active:

the historical policy remains retrievable.

Historical reconstruction is permitted.

New clinical generation under the old policy is not permitted unless specifically authorised.

---

# 106. RESEARCH FLEXIBILITY

Research Mode may intentionally compare:

```text
Policy A
vs
Policy B
```

or:

```text
Pipeline A
vs
Pipeline B
```

or:

```text
Normative Model A
vs
Normative Model B.
```

Each output is stored separately.

Research comparison must never overwrite the canonical clinical result.

---

# 107. NO AUTOMATIC LEARNING

Clinical outcomes may enter:

```text
Research Dataset
```

They may support:

```text
analysis
↓
proposed parameter change
↓
new Scientific Policy
↓
validation
↓
future release
```

They must not cause:

```text
automatic utility-weight update
automatic reliability-threshold update
automatic evidence-tier update
automatic candidate-generation change.
```

Clinical Mode v1 is not continuously learning.

---

# 108. INITIAL CLINICAL POLICY SCOPE

The first intended Clinical Mode policy is deliberately narrow.

Primary indication:

# Major depressive disorder

with or without:

# clinically significant anxious distress.

It does not automatically support:

- OCD;
- PTSD;
- tinnitus;
- chronic pain;
- stroke;
- brain injury;
- unrelated transdiagnostic targeting.

---

# 109. INITIAL CLINICAL EVIDENCE POSTURE

Before prospective validation establishes otherwise:

### Evidence

Prefer Tier A/B clinical reasoning.

### Tier C

Use only in policy-defined supporting/refinement roles.

### Normative findings

May provide context but do not independently generate clinical target hypotheses.

### Personalisation

Must demonstrate defined incremental value over evidence baseline.

### Low reliability

Falls back to evidence-supported targeting where valid.

### E-field

Should initially serve accessibility/pose optimisation before becoming a strong efficacy-ranking component.

### Slate size

Do not fill empty candidate positions simply because the interface supports them.

These principles should be encoded explicitly in the first active policy release.

---

# 110. INITIAL POLICY VALUES

This specification intentionally does not invent numerical values for:

- reliability thresholds;
- scan-duration thresholds;
- minimum circuit improvement;
- utility weights;
- cluster thresholds;
- redundancy distance;
- E-field overlap;
- convergence thresholds.

Those values must be derived through:

- development;
- sensitivity analysis;
- retrospective validation;
- prospective validation where required.

The first executable Scientific Policy release must supply them.

---

# 111. INITIAL NON-ACTIVATABLE EXAMPLE

Illustrative only:

```json
{
  "code": "MAGNIOM-POLICY",
  "semantic_version": "1.0.0-draft",

  "lifecycle_status": "draft",
  "validation_status": "design_only",

  "indication_scope": [
    "major_depressive_disorder"
  ],

  "mode_scope": [
    "research"
  ],

  "evidence_policy": {
    "tier_A": {
      "standalone_primary": true
    },

    "tier_B": {
      "standalone_primary": true
    },

    "tier_C": {
      "standalone_primary": false,
      "may_refine_parent_tiers": ["A", "B"]
    },

    "tier_D": {
      "clinical_allowed": false
    },

    "tier_R": {
      "clinical_allowed": false
    }
  },

  "parameters": {
    "minimum_personalisation_reliability": "TO_BE_VALIDATED",
    "minimum_circuit_improvement": "TO_BE_VALIDATED",
    "spatial_redundancy_threshold_mm": "TO_BE_VALIDATED"
  },

  "clinical_activation": false
}
```

Because required parameters are unresolved:

# this payload cannot become an active Clinical Mode release.

---

# 112. POLICY VALIDATION TEST SUITE

Every Scientific Policy release candidate requires automated tests covering:

### Schema

All required fields valid.

### Parameter bounds

No parameter outside permitted range.

### Evidence ceilings

Prohibited evidence cannot generate clinical candidate.

### Mode separation

Research component cannot enter clinical tuple.

### Compatibility

Every permitted tuple succeeds.

Every prohibited tuple fails.

### Reliability

Boundary values behave exactly as specified.

### Personalisation

Adoption and rejection cases behave exactly as specified.

### Missingness

Missing optional features do not create ranking artefacts.

### E-field

Partial candidate availability cannot affect comparative ranking.

### Abstention

All defined hard failures produce correct result.

### Determinism

Repeated identical inputs generate identical slate.

---

# 113. GOLDEN POLICY CASES

Golden Cases should include:

```text
A-tier evidence baseline
B-tier symptom candidate
C-tier prohibited standalone candidate
C-tier permitted refinement
D-tier research candidate
R-tier research candidate

reliable connectome
moderate connectome
low-reliability connectome
failed connectome

normative-compatible case
normative-incompatible case

E-field complete candidate set
E-field incomplete candidate set

valid indication
invalid indication

valid Clinical tuple
Research component leakage

personalisation adopted
personalisation rejected

evidence-only fallback
full abstention
```

The expected output must be version-controlled.

---

# 114. BOUNDARY TESTING

Scientific parameters require explicit boundary tests.

For example:

```text
R = threshold - ε
R = threshold
R = threshold + ε
```

must produce defined behaviour.

Equivalent tests apply to:

- motion thresholds;
- minimum duration;
- spatial redundancy;
- circuit improvement;
- E-field threshold;
- convergence thresholds.

No boundary behaviour should depend on accidental floating-point or implementation semantics.

---

# 115. COMPATIBILITY TESTING

Every Clinical Mode compatibility profile requires:

### Positive tests

Approved exact tuple succeeds.

### Negative tests

At least:

- wrong Evidence Library;
- wrong Target Engine;
- wrong Pipeline;
- wrong Normative Model;
- wrong E-field Engine;
- wrong indication;
- wrong mode;

must fail.

---

# 116. RELEASE ACCEPTANCE CRITERIA

A Scientific Policy release may become active only when:

### Identity

Unique immutable ID assigned.

### Version

Semantic version assigned.

### Payload

Canonical payload complete.

### Bounds

All active parameters within validated bounds.

### Compatibility

All component tuples explicit.

### Validation

Required validation status achieved.

### Integrity

All hashes verified.

### Governance

Required approvals complete.

### Signature

Required release signatures valid.

### Audit

Activation event recorded.

### Clinical package

Where Clinical Mode is intended, policy is included in an approved Clinical Release Package.

---

# 117. FAILURE CODES

Minimum canonical errors:

```text
SCIENTIFIC_POLICY_NOT_FOUND

SCIENTIFIC_POLICY_NOT_ACTIVE

SCIENTIFIC_POLICY_MODE_MISMATCH

SCIENTIFIC_POLICY_INDICATION_MISMATCH

SCIENTIFIC_CONFIGURATION_INCOMPATIBLE

EVIDENCE_RELEASE_INCOMPATIBLE

TARGET_ENGINE_VERSION_INCOMPATIBLE

PIPELINE_VERSION_INCOMPATIBLE

NORMATIVE_MODEL_INCOMPATIBLE

EFIELD_ENGINE_INCOMPATIBLE

RESEARCH_COMPONENT_IN_CLINICAL_MODE

POLICY_PARAMETER_MISSING

POLICY_PARAMETER_OUT_OF_BOUNDS

POLICY_PROHIBITED_CONFIGURATION

POLICY_VALIDATION_INSUFFICIENT

POLICY_APPROVAL_INCOMPLETE

SCIENTIFIC_POLICY_INTEGRITY_FAILURE

SCIENTIFIC_POLICY_SIGNATURE_INVALID
```

These must be auditable.

---

# 118. EXPLANATION OF POLICY TO CLINICIANS

Clinicians should not need to read the full Scientific Policy payload during ordinary practice.

The workspace may display:

```text
Scientific configuration
Clinical Release 1.x
Evidence Library 1.x
Target Engine 1.x
Imaging Pipeline 1.x
```

and provide deeper provenance on demand.

Scientific parameters remain inspectable for governance and audit.

They are not presented as user controls.

---

# 119. POLICY TRANSPARENCY

For every Target Slate, an authorised reviewer must be able to answer:

### Which scientific evidence release was used?

### Which algorithm version was used?

### Which policy release was used?

### Which imaging pipeline produced the measurements?

### Which normative model was used?

### Did E-field influence ranking?

### Which reliability threshold applied?

### Why was personalisation accepted or rejected?

### Which evidence tiers were permitted?

### Which scientific limitations were mandatory?

This is:

# algorithmic inspectability.

---

# 120. CLINICIAN AUTHORITY REMAINS SEPARATE

Scientific Policy governs:

# what Magniom may calculate and present.

It does not govern:

# what the clinician must choose.

The final specialist may:

- choose Primary Candidate 1;
- choose another candidate;
- modify a candidate;
- choose an evidence-supported alternative;
- choose standard non-connectomic targeting;
- choose no target.

The ClinicianDecision remains a separate canonical object.

---

# 121. POLICY DOES NOT PRESCRIBE TREATMENT PROTOCOL

Scientific Policy v1 governs:

# candidate target selection.

It must not silently expand into a protocol engine.

It does not automatically select:

- high-frequency rTMS;
- low-frequency rTMS;
- iTBS;
- cTBS;
- dose;
- intensity;
- pulse number;
- intersession interval;
- accelerated schedule;
- number of treatment targets.

Supporting evidence may expose protocol precedent.

Protocol decision support would require:

# a separately specified and validated system.

---

# 122. SECURITY PRINCIPLE

Scientific Policy is:

# security-sensitive clinical configuration.

Write access must be restricted.

Production roles that manage:

- organisations;
- user invitations;
- billing;
- general settings;

must not automatically receive permission to modify scientific policy.

Scientific-policy mutation requires dedicated privileged workflow.

---

# 123. POLICY STORAGE PRINCIPLE

Active policy releases must be:

- immutable;
- hashed;
- auditable;
- recoverable;
- backed up;
- protected from ordinary CRUD mutation.

Direct browser mutation is prohibited.

---

# 124. SEPARATION OF DUTIES

Where practical:

```text
author
≠
independent reviewer
≠
final clinical/scientific approver
```

for clinically material releases.

The same person may hold multiple functions during early research development where organisational scale requires it.

Clinical release governance should progressively strengthen separation of duties.

---

# 125. SCIENTIFIC POLICY GOVERNANCE BOARD

Before Clinical Mode activation, governance should include functions covering:

- clinical TMS;
- neuroimaging/connectomics;
- scientific evidence;
- biostatistics where relevant;
- technical implementation;
- quality/regulatory.

Purpose:

- review scientific parameters;
- review compatibility;
- review evidence eligibility;
- review impact reports;
- review validation evidence;
- approve or reject activation.

---

# 126. POLICY DOWNGRADE

Science can require a more conservative policy.

Examples:

```text
minimum reliability increases
```

or:

```text
TargetFamily role removed
```

or:

```text
personalisation disabled
```

following new evidence.

Policy evolution is not necessarily feature expansion.

---

# 127. CONSERVATIVE SUPERSESSION

Where uncertainty exists about a new policy:

the existing validated Clinical Policy remains active.

The new policy stays:

```text
research
```

or:

```text
validation.
```

Do not promote merely because it appears scientifically more sophisticated.

---

# 128. NO NOVELTY BIAS

Scientific Policy must not favour:

- newer algorithm;
- longer graph;
- more personalised target;
- more complex normative model;
- more targets;
- more MRI-derived features;

merely because they are newer or more technologically advanced.

Clinical inclusion requires evidence and validation.

---

# 129. POLICY COMPATIBILITY WITH FUTURE COMPONENTS

Future components may include:

- structural connectomics;
- effective-connectivity models;
- MS-HBM;
- alternative cortical parcellations;
- predictive biomarkers;
- advanced E-field optimisation;
- protocol decision support;
- additional indications.

They must enter through:

```text
scientific component version
+
Scientific Policy compatibility
+
validation
+
release governance
```

not through ad hoc feature flags.

---

# 130. FINAL CANONICAL PRINCIPLES

# Scientific evidence defines what may be believed.

# Scientific Policy defines what Magniom may do with that evidence.

# The Target Engine implements the approved decision logic.

# The Neuroimaging Pipeline produces measurements; it does not define clinical authority.

# Normative models provide context only within their validated scope.

# E-field models influence decisions only in their approved role.

# Engineering configuration must not change scientific meaning.

# Every clinically meaningful parameter is versioned.

# Every parameter has bounds.

# Every active combination is explicitly compatible.

# Research combinations do not leak into Clinical Mode.

# Every Clinical Policy release is immutable.

# Every Clinical Policy release is approved.

# Every Clinical Policy release is integrity-verifiable.

# Every Target Slate records the policy that produced it.

# Historical Target Slates never silently change.

# Scientific updates require impact assessment.

# Outcome data do not automatically retrain the clinical algorithm.

# Failure to qualify personalisation can correctly produce an evidence-only result.

# Failure to establish scientific compatibility blocks clinical ranking.

# Clinical Mode is earned through validation and governance, not enabled by a feature flag.

# The clinician remains the final decision-maker.

---

# 131. CANONICAL DEFINITION

A:

# `ScientificPolicyRelease`

is:

> **An immutable, versioned, validated and governance-approved specification of the scientific rules, parameter values, parameter bounds and component compatibilities under which a defined Magniom configuration may generate target candidates for a defined indication and mode.**

It binds:

```text
EvidenceLibraryRelease
×
TargetEngineVersion
×
PipelineVersion
×
NormativeModelVersion
×
EFieldEngineVersion
×
Indication
×
Mode
```

into:

# one reproducible scientific decision environment.

That environment produces:

# a Target Slate for specialist review.

It does not produce:

# an autonomous treatment decision.

---

# MAGNIOM SCIENTIFIC POLICY GOVERNING RULE

> **No evidence release, algorithm, pipeline, normative model, E-field model or ranking parameter becomes clinically authoritative merely because it exists, executes successfully, or is technically compatible. It may influence Clinical Mode only through an explicitly validated, immutable and approved ScientificPolicyRelease whose complete scientific configuration can be reconstructed and verified.**