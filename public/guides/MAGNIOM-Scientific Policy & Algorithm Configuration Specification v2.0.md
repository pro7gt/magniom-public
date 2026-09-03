# MAGNIOM

## Scientific Policy & Algorithm Configuration Specification v2.0

**Document status:** Canonical multi-indication scientific-governance specification
**Version:** 2.0
**Date:** 2 September 2026
**Supersedes:** MAGNIOM Scientific Policy & Algorithm Configuration Specification v1.0 for new multi-indication development
**Backward compatibility:** Historical v1 Scientific Policy releases remain immutable and authoritative for historical v1 Target Slates
**Primary architectural change:** indication as a simple scope variable → immutable `IndicationModuleRelease` as a first-class member of the scientific compatibility configuration
**Primary purpose:** Define exactly which scientific components, algorithms, measurements, evidence paths and parameters may influence a MAGNIOM targeting analysis
**Clinical authority:** Specialist clinician
**Scientific-release authority:** Controlled scientific, clinical, engineering and quality governance

**Depends on:**

* MAGNIOM Clinical & Scientific Specification v1.0
* MAGNIOM Scientific Policy & Algorithm Configuration Specification v1.0
* MAGNIOM Canonical Multi-Indication Data Specification v2.0
* MAGNIOM Evidence Knowledge Graph & Therapeutic Circuit Library v2.0
* MAGNIOM Target Engine & Ranking Algorithm Specification v2.0
* MAGNIOM Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0
* MAGNIOM System Requirements Specification v1.0
* MAGNIOM Application Shell, Navigation & Clinical Context Specification v1.0

The v1 architecture already required clinically meaningful thresholds, ranking weights, redundancy rules and evidence permissions to reside in a versioned Scientific Policy rather than ordinary application configuration.  The database architecture likewise treated scientific configuration as immutable release data rather than editable production settings. 

---

# 1. PURPOSE

MAGNIOM v2 supports multiple indications whose scientific models are materially different.

Therefore a scientific policy can no longer mean merely:

```text
MDD
+
Target Engine 1.0
+
Evidence Library 1.0
+
Pipeline 1.0
```

It must answer:

> **Which exact indication model is being used, what evidence paths are permitted for that indication, which candidate generators may run, which patient measurements may influence them, which reliability requirements apply, which target geometries are allowed, which device/coil dependencies matter, how candidates may be compared, when personalisation may displace an evidence baseline, and whether the resulting configuration is permitted in Research, Validation or Clinical use?**

The canonical v2 authority object remains:

# `ScientificPolicyRelease`

but its central unit of scientific scope becomes:

# `IndicationModuleRelease`.

---

# 2. v2 GOVERNING PRINCIPLE

MAGNIOM v2 SHALL implement:

```text
One governance framework
        +
Multiple independently governed indication models.
```

A deployed MAGNIOM installation may simultaneously contain:

```text
MDD
Clinical

Neuropathic Pain
Validation

Stroke Motor
Validation

OCD
Validation

TBI
Research

Tinnitus
Research
```

without allowing the maturity of one module to confer authority on another.

---

# 3. CENTRAL v2 RULE

> **No indication becomes clinically authoritative merely because MAGNIOM contains code capable of generating targets for it.**

Clinical target generation requires an explicitly approved combination of:

```text
CaseIndication
×
IndicationModuleRelease
×
EvidenceLibraryRelease
×
EvidencePath permissions
×
ScientificPolicyRelease
×
TargetEngineRelease
×
Indication Plugin
×
Candidate Generator versions
×
Measurement capability configuration
×
Reliability configuration
×
Normative/E-field/device components where applicable
×
Mode
```

---

# 4. `IndicationModuleRelease` BECOMES FIRST-CLASS

v1 policies effectively treated indication as a relatively simple scope predicate.

v2 replaces this with:

```text
indication
→ IndicationModuleRelease
```

because a clinically meaningful indication model now contains:

* intended population;
* clinical objectives;
* phenotype schema;
* disease-stage definitions;
* target-family scope;
* target geometry scope;
* measurement requirements;
* treatment-context requirements;
* permitted candidate-generation methods;
* validation maturity.

This is the core scientific-policy change in v2.

---

# 5. POLICY IS NOT THE INDICATION MODULE

The two objects have different responsibilities.

### `IndicationModuleRelease`

Defines:

> **what the scientific model for this indication is.**

### `ScientificPolicyRelease`

Defines:

> **which parts of that model may currently influence a particular MAGNIOM mode and under exactly which validated configuration.**

Therefore:

```text
IndicationModule exists
```

does not imply:

```text
IndicationModule clinically enabled.
```

---

# 6. POLICY IS ALSO NOT THE EVIDENCE LIBRARY

The Evidence Library answers:

> What does the scientific literature support, challenge or leave unresolved?

Scientific Policy answers:

> Which approved EvidencePaths may affect MAGNIOM target generation in this release?

This separation becomes especially important in v2 because claims may legitimately exist with:

```text
MAGNIOM evidence tier = unassigned
```

while remaining useful for Research or Validation.

---

# 7. POLICY IS NOT THE TARGET ENGINE

Target Engine implements deterministic scientific operations.

Scientific Policy determines:

* whether those operations are permitted;
* with which parameters;
* for which indication module;
* in which mode;
* using which measurements and evidence paths.

The engine SHALL NOT decide its own scientific authority.

---

# 8. POLICY IS NOT APPLICATION CONFIGURATION

Ordinary application configuration may govern:

```text
queue concurrency
cache TTL
logging verbosity
UI feature presentation
worker timeout
```

Scientific Policy governs:

```text
evidence eligibility
candidate-generation eligibility
measurement capability
reliability threshold
ranking profile
refinement adoption
redundancy
abstention
E-field role
normative role
```

The distinction from v1 remains absolute. 

---

# 9. SCIENTIFIC-CONFIGURATION TEST

Any configuration value SHALL be considered scientific if changing it could alter:

* whether a candidate exists;
* target location;
* target geometry;
* candidate role;
* evidence applicability;
* eligibility;
* rank/order;
* refinement adoption;
* suppression;
* abstention;
* uncertainty;
* treatment-context interpretation;
* clinically material explanation.

If yes:

# it belongs under controlled scientific configuration.

---

# 10. CANONICAL COMPATIBILITY MODEL v2

The v2 scientific compatibility relationship is:

```text
ScientificPolicyRelease
        ↓ authorises
ScientificCompatibilityConfiguration
```

Each configuration represents an exact positive whitelist.

Conceptually:

```text
ScientificPolicyRelease
×
IndicationModuleRelease
×
EvidenceLibraryRelease
×
TargetEngineRelease
×
IndicationTargetingPluginRelease
×
CandidateGeneratorReleaseSet
×
MeasurementProviderReleaseSet
×
ReliabilityMethodReleaseSet
×
AtlasReleaseSet
×
NormativeModelReleaseSet
×
EFieldEngineRelease
×
DeviceCapabilityProfile
×
Mode
```

with optional elements explicitly represented as:

```text
optional
disabled
not_applicable
```

rather than omitted ambiguously.

---

# 11. EXACT COMPATIBILITY IS POSITIVE, NOT NEGATIVE

MAGNIOM SHALL not reason:

```text
Nothing says StrokePlugin 1.1 is incompatible,
therefore allow it.
```

Instead:

```text
StrokePlugin 1.1 is explicitly authorised
for StrokeMotorModule 1.0
under ScientificPolicy 2.0
```

must be present.

No positive match:

# fail closed.

---

# 12. COMPATIBILITY IS CONJUNCTIVE

Every required member must match.

If:

```text
IndicationModule        compatible
Evidence Library        compatible
Target Engine           compatible
Measurement Providers   compatible
Normative Model         incompatible
```

then a profile requiring that normative model is:

# incompatible.

Other policy-defined fallback profiles may still exist.

---

# 13. COMPATIBILITY IS NON-TRANSITIVE

If:

```text
A compatible with B
B compatible with C
```

MAGNIOM SHALL NOT infer:

```text
A compatible with C.
```

Examples:

```text
StrokeModule 1.0
compatible with
MotorMapProvider 1.1

MotorMapProvider 1.1
compatible with
NavigationAdapter 2.0
```

does not automatically prove the full three-component clinical combination.

---

# 14. CANONICAL `ScientificPolicyReleaseV2`

```ts
interface ScientificPolicyReleaseV2 {
  id: UUID;

  code: string;
  semantic_version: string;

  title: string;
  description: string;

  lifecycle_status:
    | "draft"
    | "under_review"
    | "validation"
    | "release_candidate"
    | "active"
    | "superseded"
    | "withdrawn"
    | "archived";

  validation_status:
    | "design_only"
    | "engineering_verified"
    | "retrospective_validated"
    | "silent_prospective_validated"
    | "clinician_assisted_validated"
    | "clinical_release_qualified";

  scope:
    | "single_indication"
    | "multi_indication";

  indication_policy_bindings:
    IndicationPolicyBinding[];

  compatibility_configurations:
    ScientificCompatibilityConfiguration[];

  global_prohibitions:
    ProhibitedScientificConfiguration[];

  parameter_definitions:
    ScientificPolicyParameter[];

  validation_evidence_ids: UUID[];

  change_classification:
    ScientificChangeClassification;

  supersedes_release_id?: UUID;

  payload_sha256: SHA256;
  compatibility_manifest_sha256: SHA256;
  release_manifest_sha256: SHA256;

  approvals: ScientificPolicyApproval[];

  signatures: ScientificPolicySignature[];

  created_at: ISO8601UTC;
  released_at?: ISO8601UTC;
}
```

---

# 15. `IndicationPolicyBinding`

```ts
interface IndicationPolicyBinding {
  id: UUID;

  indication_module_release_id: UUID;

  module_permission:
    | "research_only"
    | "validation_only"
    | "clinical_permitted"
    | "disabled";

  permitted_modes: MagniomMode[];

  evidence_policy_id: UUID;

  measurement_policy_id: UUID;

  reliability_policy_id: UUID;

  candidate_generation_policy_id: UUID;

  ranking_policy_id: UUID;

  refinement_policy_id: UUID;

  geometry_policy_id: UUID;

  treatment_context_policy_id?: UUID;

  normative_policy_id?: UUID;

  efield_policy_id?: UUID;

  redundancy_policy_id: UUID;

  slate_assembly_policy_id: UUID;

  abstention_policy_id: UUID;

  explanation_policy_id: UUID;

  permitted_compatibility_configuration_ids: UUID[];

  limitations: string[];
}
```

---

# 16. THE BINDING IS THE UNIT OF INDICATION AUTHORITY

A module existing in the release manifest is insufficient.

For clinical authority there must be:

```text
ScientificPolicyRelease
       ↓
IndicationPolicyBinding
       ↓
module_permission = clinical_permitted
```

plus a compatible exact configuration.

---

# 17. MODULE MATURITY CANNOT BE UPGRADED BY POLICY ALONE

If:

```text
IndicationModuleRelease.module_status
=
research_only
```

Scientific Policy SHALL NOT set:

```text
clinical_permitted
```

and override it.

Clinical permission requires both objects to permit Clinical use.

Effective authority is:

```text
minimum authority
across
Module + Policy + EvidencePath + Component validation.
```

---

# 18. MODULE AND POLICY STATUS ARE DIFFERENT

Example:

```text
StrokeMotorModule
module_status = validation_candidate
```

and:

```text
Policy
module_permission = validation_only
```

are consistent.

A future module version may become:

```text
clinical_release_candidate
```

and a later policy may activate it.

Historical policies remain unchanged.

---

# 19. SCIENTIFIC COMPATIBILITY CONFIGURATION

```ts
interface ScientificCompatibilityConfiguration {
  id: UUID;

  code: string;
  version: string;

  scientific_policy_release_id: UUID;

  indication_module_release_id: UUID;

  mode:
    | "clinical"
    | "research";

  evidence_library_release_id: UUID;

  target_engine_release_id: UUID;

  targeting_plugin: ComponentReleaseRef;

  candidate_generators:
    ComponentReleaseRef[];

  measurement_providers:
    ComponentRequirementRef[];

  reliability_methods:
    ComponentRequirementRef[];

  phenotype_ontology_release_id: UUID;

  atlas_releases:
    ComponentRequirementRef[];

  normative_models:
    ComponentRequirementRef[];

  efield_engine?:
    ComponentRequirementRef;

  device_capability_profiles:
    ComponentRequirementRef[];

  acquisition_profiles:
    ComponentRequirementRef[];

  compatibility_status:
    | "draft"
    | "validated"
    | "approved"
    | "suspended"
    | "withdrawn";

  validation_evidence_ids: UUID[];

  configuration_sha256: SHA256;
}
```

---

# 20. COMPONENT REQUIREMENT STATE

```ts
interface ComponentRequirementRef {
  component_type: string;

  component_id?: UUID;
  component_version?: string;

  requirement:
    | "required"
    | "optional"
    | "disabled"
    | "not_applicable";

  purpose?: string;
}
```

This prevents ambiguity between:

```text
not provided
```

and:

```text
scientifically disabled.
```

---

# 21. CORE V2 COMPATIBILITY EXAMPLE — MDD

Conceptually:

```text
Configuration:
MDD-CONNECTOME-CLINICAL-2.0

IndicationModule       MDD 2.0
EvidenceLibrary        2.0
TargetEngine           2.0
Plugin                 MDD Plugin 2.0
Structural Provider    required
rs-fMRI Provider       required
FC Reliability         required
Normative Model        optional/contextual
E-field                optional/display/accessibility
Mode                   clinical
```

This is one exact scientific environment.

---

# 22. EXAMPLE — MDD EVIDENCE-ONLY

A second valid configuration may be:

```text
MDD-EVIDENCE-BASELINE-2.0
```

with:

```text
rs-fMRI                disabled
individual FC          disabled
evidence baseline      enabled
```

This provides a legitimate fallback/counterfactual pathway.

---

# 23. EXAMPLE — NEUROPATHIC PAIN

```text
PAIN-MOTOR-MAP-VALIDATION-2.0

IndicationModule       Neuropathic Pain
Structural MRI         required
Motor Mapping          required for refinement
MEP                    optional/context
rs-fMRI                disabled
Pain Plugin            exact version
Somatotopic Generator  exact version
MotorMap Refinement    exact version
Mode                   research/validation
```

A future Clinical configuration is separately authorised.

---

# 24. EXAMPLE — STROKE MOTOR

```text
STROKE-MOTOR-LESION-MAP-VALIDATION-2.0

IndicationModule        Stroke Motor
Structural MRI          required
Lesion Mapping          required
Motor Mapping           optional/refinement
MEP                     optional/context
DWI                     research_only
rs-fMRI                 optional/research
Stroke Plugin           exact version
Mode                    research/validation
```

---

# 25. EXAMPLE — OCD FIELD TARGET

```text
OCD-FIELD-VALIDATION-2.0

IndicationModule        OCD
OCD Plugin              exact version
mPFC/ACC Generator      exact version
Target geometry         coil_field
Compatible coil class   required
E-field                 required or optional
                        according to validated profile
Symptom provocation     treatment-context governed
Mode                    research/validation
```

---

# 26. EXAMPLE — TINNITUS

```text
TINNITUS-RESEARCH-2.0

IndicationModule       Tinnitus
module permission       research_only
Audiology              required
Structural MRI         optional
rs-fMRI                research
Tinnitus Plugin         exact version
Clinical mode           prohibited
```

No configuration can publish a Clinical Target Slate until a future controlled release explicitly enables it.

---

# 27. CAPABILITY PROFILE v2

v1 capability concepts such as Evidence-only, Connectome-refined and E-field-assisted configurations should evolve into indication-aware profiles.

Examples:

```text
EVIDENCE_BASELINE
RSFC_REFINED
SOMATOTOPIC_BASELINE
MOTOR_MAP_REFINED
LESION_AWARE
TASK_FMRI_CONTEXTUAL
STRUCTURAL_CONNECTIVITY_RESEARCH
FIELD_TARGET
FIELD_POSE_OPTIMISED
MULTIMODAL_RESEARCH
```

A profile name is only an identifier.

Its exact meaning comes from the policy release.

---

# 28. CAPABILITIES ARE NOT GLOBAL

```text
MOTOR_MAP_REFINED
```

for neuropathic pain may mean something entirely different from:

```text
MOTOR_MAP_REFINED
```

for stroke.

Canonical identity therefore includes:

```text
IndicationModuleRelease
+
CapabilityProfile.
```

---

# 29. EVIDENCE POLICY v2

The v2 Evidence Library separates:

```text
EvidenceClaim
```

from:

```text
EvidenceGovernanceClassification
```

and:

```text
EvidencePath.
```

Scientific Policy SHALL operate primarily on:

# permitted EvidencePaths,

not merely Evidence Tier.

---

# 30. `EvidencePathPermission`

```ts
interface EvidencePathPermission {
  evidence_path_id: UUID;

  permitted_modes: MagniomMode[];

  candidate_roles: CandidateRole[];

  candidate_generation_method_ids: UUID[];

  standalone_primary: boolean;

  standalone_additional: boolean;

  supporting_context: boolean;

  refinement_parent_path_ids?: UUID[];

  population_constraints?: UUID[];

  disease_stage_constraints?: UUID[];

  treatment_context_constraints?: UUID[];

  target_geometry_types:
    TargetGeometryType[];

  limitations: string[];
}
```

---

# 31. EVIDENCE TIER REMAINS USEFUL BUT NOT SUFFICIENT

MAGNIOM Tier remains a governance attribute where assigned.

But:

```text
Tier B
```

alone does not answer:

* which indication?
* which population?
* which stage?
* which target?
* which targeting method?
* which geometry?
* which treatment context?
* which candidate role?

Therefore Clinical permission is path-specific.

---

# 32. UNASSIGNED TIER

If a v2 claim is:

```text
classification_status = unassigned
```

Scientific Policy SHALL NOT invent a Tier.

Such evidence may participate only in explicitly permitted:

* staging;
* Research;
* Validation

workflows.

---

# 33. NO TIER COERCION

Prohibited:

```text
unassigned → R
```

merely for computational convenience.

`unassigned` and `R` have different meanings.

`R` is a governance classification.

`unassigned` means governance has not yet assigned one.

---

# 34. ROLE-AWARE EVIDENCE POLICY

Clinical eligibility remains role-aware.

An EvidencePath may permit:

```text
supporting_context = true
```

while:

```text
standalone_primary = false.
```

This preserves the v1 principle that lower-maturity evidence may refine or contextualise stronger evidence without automatically becoming an independent Primary candidate.

---

# 35. TARGETING METHOD IS PART OF EVIDENCE PERMISSION

Evidence for:

```text
fixed anatomical target
```

does not automatically validate:

```text
patient-specific FC optimisation.
```

Likewise:

```text
deep-TMS field targeting
```

does not automatically validate:

```text
focal point-coordinate targeting.
```

Policy SHALL verify targeting method explicitly.

---

# 36. TARGET GEOMETRY POLICY

v2 must authorise geometry class.

```ts
interface TargetGeometryPolicy {
  indication_module_release_id: UUID;

  target_family_permissions: {
    target_family_id: UUID;

    permitted_geometry_types:
      TargetGeometryType[];

    permitted_generator_ids: UUID[];

    transformation_rules?: UUID[];
  }[];
}
```

---

# 37. NO GEOMETRY DOWNCASTING

Prohibited:

```text
coil_field
→ point
```

or:

```text
somatotopic target
→ generic M1 point
```

unless an explicitly validated transformation exists.

Scientific Policy SHALL enforce that geometry semantics survive candidate generation.

---

# 38. MEASUREMENT POLICY v2

The v2 multimodal architecture distinguishes:

```text
measurement exists
measurement passed QC
measurement reproducible
capability qualified
clinical permission
```

as separate states. 

Scientific Policy controls the last two.

---

# 39. `MeasurementPolicy`

```ts
interface MeasurementPolicy {
  indication_module_release_id: UUID;

  requirements:
    MeasurementCapabilityPolicy[];

  multimodal_fusion_policy:
    | "prohibited"
    | "descriptive_only"
    | "validated_model_only";

  fallback_rules:
    MeasurementFallbackRule[];
}
```

---

# 40. `MeasurementCapabilityPolicy`

```ts
interface MeasurementCapabilityPolicy {
  capability_code: string;

  modality: MeasurementModality;

  requirement:
    | "required"
    | "required_for_refinement"
    | "optional"
    | "research_only"
    | "disabled";

  permitted_candidate_roles:
    CandidateRole[];

  permitted_generator_ids: UUID[];

  minimum_qc_rule_id?: UUID;

  minimum_reliability_rule_id?: UUID;

  missing_measurement_behaviour:
    | "block"
    | "disable_capability"
    | "fallback"
    | "allow_with_limitation";

  limitations: string[];
}
```

---

# 41. NO MODALITY PRIVILEGE

Policy SHALL NOT assume:

```text
rs-fMRI
```

must influence every indication simply because it is central to MDD.

Likewise:

* DWI is not automatically necessary for stroke;
* task fMRI is not automatically necessary for aphasia;
* MRI is not automatically necessary for tinnitus Research.

The Indication Module defines requirements; Scientific Policy authorises actual use.

---

# 42. RELIABILITY POLICY v2

Reliability is now:

# capability-specific,

not a universal patient score.

Policy may separately govern:

```text
individual_fc_refinement
motor_hotspot_targeting
lesion_mapping
structural_connectivity_refinement
task_fmri_localisation
efield_optimisation
```

---

# 43. `ReliabilityPolicy`

```ts
interface ReliabilityPolicy {
  indication_module_release_id: UUID;

  capability_rules:
    ReliabilityCapabilityRule[];

  cross_measurement_rules?: UUID[];

  overall_bundle_behaviour:
    | "capability_specific"
    | "module_defined";
}
```

---

# 44. `ReliabilityCapabilityRule`

```ts
interface ReliabilityCapabilityRule {
  capability_code: string;

  reliability_method_ids: UUID[];

  minimum_parameter_refs:
    UUID[];

  required_measurement_count?: number;

  cross_run_required?: boolean;

  split_half_required?: boolean;

  sensitivity_analysis_required?: boolean;

  failure_behaviour:
    | "disable_capability"
    | "fallback"
    | "block_module";

  limitations: string[];
}
```

---

# 45. NUMERICAL THRESHOLDS ARE NOT INVENTED HERE

This specification deliberately does not define universal values for:

* rs-fMRI retained duration;
* split-half localisation;
* cross-run displacement;
* motor-hotspot reproducibility;
* lesion-registration quality;
* tractography stability;
* task-fMRI reproducibility;
* E-field coverage;
* target redundancy.

Values become controlled `ScientificPolicyParameter` instances only after empirical justification.

---

# 46. NO CROSS-MODAL RELIABILITY SCORE

Prohibited:

```text
MRI reliability       0.8
motor mapping         0.7
audiology             0.9

overall reliability = 0.8
```

unless a future validated model explicitly establishes the aggregation.

The current v2 model is capability-specific.

---

# 47. MULTIMODAL FUSION POLICY

The multimodal specification explicitly prohibits hidden fusion of structural MRI, rs-fMRI, DWI and task fMRI into an opaque coordinate unless a separately validated scientific model defines the transformation. 

Scientific Policy SHALL therefore default to:

```text
multimodal_fusion_policy = prohibited
```

or:

```text
descriptive_only.
```

---

# 48. A FUSION MODEL IS A SCIENTIFIC COMPONENT

If future MAGNIOM develops:

```text
Stroke Multimodal Target Model 1.0
```

combining:

```text
lesion
+
MEP
+
DWI
+
motor mapping
```

it becomes:

* versioned;
* validated;
* explicitly compatible;
* governed by Scientific Policy.

It SHALL not hide inside a MeasurementBundle.

---

# 49. TARGET ENGINE PLUGIN POLICY

v2 Target Engine uses a common core plus indication plugins.

Scientific Policy SHALL authorise:

* exact plugin version;
* exact generator set;
* permitted modes;
* permitted roles;
* permitted target families;
* permitted measurement capabilities.

---

# 50. `CandidateGenerationPolicy`

```ts
interface CandidateGenerationPolicy {
  indication_module_release_id: UUID;

  plugin_release_id: UUID;

  generators: CandidateGeneratorPermission[];
}
```

---

# 51. `CandidateGeneratorPermission`

```ts
interface CandidateGeneratorPermission {
  generator_id: UUID;
  generator_version: string;

  status:
    | "required"
    | "permitted"
    | "research_only"
    | "disabled";

  candidate_roles:
    CandidateRole[];

  evidence_path_ids: UUID[];

  target_family_ids: UUID[];

  geometry_types:
    TargetGeometryType[];

  required_capability_codes: string[];

  fallback_generator_ids?: UUID[];
}
```

---

# 52. CODE PRESENCE ≠ PERMISSION

If MAGNIOM build contains:

```text
TinnitusNetworkResearchGenerator
```

that does not mean it can execute in Clinical Mode.

Runtime checks shall require:

```text
generator in build
+
generator in compatibility manifest
+
generator in module
+
generator in policy
+
mode permitted.
```

---

# 53. PLUGIN DIGEST

Clinical/validation policy SHOULD pin:

```text
plugin package digest
```

not just semantic version.

A different build with the same display version but different scientific code is incompatible.

---

# 54. CANDIDATE-GENERATOR CHANGES

Changing a generator so that it produces a different target geometry/location is:

# a scientific change.

It may require:

* new generator version;
* new TargetEngineRelease;
* new ScientificPolicyRelease;
* new validation evidence.

---

# 55. RANKING POLICY v2

v2 no longer assumes all indications use the same Candidate Utility Vector.

Scientific Policy defines:

```text
ComparisonDomain
+
RankingProfile.
```

Candidate ordering is only meaningful inside a scientifically valid comparison domain.

---

# 56. `RankingPolicy`

```ts
interface RankingPolicy {
  indication_module_release_id: UUID;

  comparison_domain_permissions:
    ComparisonDomainPermission[];

  ranking_profiles:
    RankingProfileRef[];

  cross_domain_scalar_ranking:
    | "prohibited"
    | "explicitly_validated_only";
}
```

---

# 57. CROSS-DOMAIN RANKING DEFAULT

Default:

```text
cross_domain_scalar_ranking = prohibited.
```

For example:

```text
OCD coil-field candidate
```

and:

```text
OCD focal pre-SMA candidate
```

shall not be forced into one universal score unless a validated profile permits it.

---

# 58. INTERNAL SCORE IS NOT BIOLOGICAL TRUTH

The v1 clinical/scientific specification already required any internal composite to have frozen, version-controlled, sensitivity-tested and validated weights, and warned against exposing it as biological truth. 

v2 preserves that requirement.

---

# 59. RANKING MODEL TYPES

Permitted policy-defined models may include:

```text
lexicographic
weighted geometric mean
ordered deterministic rules
```

No unconstrained machine-learning ranker enters Clinical Mode without a separately governed future specification.

---

# 60. MODULE-SPECIFIC RANKING

Examples:

### MDD

May use:

```text
phenotype concordance
circuit concordance
reliability
accessibility
E-field
```

within compatible strata.

### Pain

May use:

```text
body-region concordance
motor-map concordance
reliability
accessibility
```

### Stroke Motor

May use:

```text
stage applicability
lesion compatibility
motor-map concordance
reliability
accessibility
```

### OCD field target

May use:

```text
EvidencePath applicability
field coverage
pose robustness
device compatibility
```

Scientific Policy owns the exact profile.

---

# 61. REFINEMENT POLICY v2

v1 used a personalisation-adoption rule requiring patient-specific connectivity to earn its place over an evidence baseline.

v2 generalises this to:

# `RefinementPolicy`.

Possible refinement types:

```text
functional_connectivity
motor_mapping
structural_connectivity
lesion_aware
task_functional
efield_pose
multimodal_validated
```

---

# 62. `RefinementPolicy`

```ts
interface RefinementPolicy {
  indication_module_release_id: UUID;

  profiles:
    RefinementPolicyProfile[];
}
```

---

# 63. `RefinementPolicyProfile`

```ts
interface RefinementPolicyProfile {
  id: UUID;

  refinement_kind: string;

  baseline_role: CandidateRole;

  refined_role: CandidateRole;

  required_capability_codes: string[];

  permitted_target_family_ids: UUID[];

  minimum_incremental_value_parameter_refs: UUID[];

  maximum_transfer_distance_parameter_refs?: UUID[];

  accessibility_loss_rule_id?: UUID;

  geometry_change_rule_id?: UUID;

  adoption_behaviour:
    | "prefer_if_all_pass"
    | "show_as_alternative"
    | "research_only";

  fallback_behaviour:
    | "retain_baseline"
    | "abstain"
    | "module_defined";
}
```

---

# 64. REFINEMENT MUST EARN INFLUENCE

Clinical refinement SHALL NOT win merely because it is:

```text
more personalised
```

or:

```text
more technologically sophisticated.
```

The refined candidate must satisfy its policy-defined incremental-value test.

This preserves the core v1 scientific caution around personalised targeting.

---

# 65. COUNTERFACTUAL POLICY

Where refinement is permitted, Scientific Policy SHALL define the appropriate counterfactual.

Examples:

### MDD

```text
evidence baseline
vs
FC-refined target
```

### Pain

```text
somatotopic evidence baseline
vs
motor-map refinement
```

### Stroke

```text
evidence-defined motor strategy
vs
patient motor-map refinement
```

### OCD

```text
evidence-defined coil placement
vs
E-field pose optimisation
```

---

# 66. NO REFINEMENT WITHOUT BASELINE WHERE BASELINE IS REQUIRED

A refinement plugin SHALL NOT create:

```text
personalised target
```

without a traceable:

```text
baseline target/evidence hypothesis
```

where the policy defines the operation as refinement.

---

# 67. LESION POLICY

For lesion-dependent modules, policy determines:

* whether lesion mapping is mandatory;
* minimum registration/segmentation quality;
* target/lesion relationship permitted;
* when a target is suppressed;
* whether any evidence-defined fallback exists.

---

# 68. DESTROYED TARGET DEFAULT

Unless a validated module-specific rule states otherwise:

```text
target_relationship = destroyed_or_absent
```

shall result in:

# candidate ineligibility.

Policy SHALL NOT permit arbitrary coordinate displacement to nearby intact tissue.

---

# 69. DISEASE-STAGE POLICY

Where evidence applicability depends on stage:

`DiseaseStageContext` becomes a gate.

Policy SHALL specify:

```text
EvidencePath
×
allowed stage definition(s)
```

Examples:

```text
post-acute stroke
chronic aphasia
```

A stage mismatch cannot be compensated by an attractive patient measurement.

---

# 70. TREATMENT-CONTEXT POLICY

Treatment context may include:

* rehabilitation;
* speech-language therapy;
* symptom provocation;
* task state;
* device/coil class;
* other evidence-bound context.

Policy determines the consequence of:

```text
present
planned
absent
unknown.
```

---

# 71. TREATMENT-CONTEXT FAILURE BEHAVIOURS

Possible configured actions:

```text
ineligible
validation_only
research_only
show_limitation
downgrade_applicability
```

The behaviour must be explicit.

---

# 72. PROTOCOL BOUNDARY REMAINS

Scientific Policy MAY govern whether a target's EvidencePath depends on a particular stimulation precedent.

It SHALL NOT autonomously prescribe:

* frequency;
* pulse number;
* intensity;
* schedule;
* session count.

The v1 Target Engine explicitly separated target selection from protocol prescription. 

---

# 73. NORMATIVE MODEL POLICY v2

Normative models become indication- and modality-specific.

```ts
interface NormativePolicy {
  indication_module_release_id: UUID;

  models: {
    normative_model_release_id: UUID;

    modality: MeasurementModality;

    role:
      | "disabled"
      | "display_only"
      | "supporting_context"
      | "ranking_feature"
      | "research_candidate_generation";

    permitted_capabilities: string[];

    compatibility_configuration_ids: UUID[];
  }[];
}
```

---

# 74. NORMATIVE ABNORMALITY DEFAULT

Default v2 rule remains:

> **Normative abnormality is not an independent Clinical Target generator.**

A future module may change this only through separate evidence, validation and policy.

---

# 75. E-FIELD POLICY v2

```ts
interface EFieldPolicy {
  indication_module_release_id: UUID;

  role:
    | "disabled"
    | "display_only"
    | "accessibility"
    | "pose_optimisation"
    | "field_target_definition"
    | "ranking_component";

  required_geometry_types:
    TargetGeometryType[];

  permitted_device_profiles: UUID[];

  completeness_policy:
    | "all_comparable_candidates"
    | "not_required_for_comparison";

  validation_evidence_ids: UUID[];
}
```

---

# 76. E-FIELD DOES NOT MEAN EFFICACY

E-field optimisation may legitimately improve:

* target coverage;
* coil pose;
* accessibility.

It does not automatically prove improved clinical response.

The v1 system already recommended using E-field first for accessibility/pose optimisation before treating it as a major efficacy-ranking dimension. 

---

# 77. FIELD-TARGET MODULES

For field-based indications such as certain OCD implementations:

E-field/coil geometry may be part of:

# target definition,

rather than merely an optional feature.

Scientific Policy SHALL therefore distinguish:

```text
field defines target
```

from:

```text
field helps optimise a point/ROI target.
```

---

# 78. DEVICE AND COIL POLICY

v2 permits evidence paths to be device-/coil-dependent.

Policy must therefore be capable of requiring:

```text
device class
coil class
field geometry
navigation capability
```

where scientific transfer to other hardware is not established.

---

# 79. DEVICE COMPATIBILITY IS SCIENTIFIC WHERE IT CHANGES TARGET SEMANTICS

A device substitution becomes scientifically relevant if it changes:

* spatial field distribution;
* target geometry;
* evidence applicability;
* accessible cortex.

It is not merely inventory management.

---

# 80. REDUNDANCY POLICY v2

Redundancy becomes geometry-aware.

Scientific Policy may define different comparators for:

```text
point ↔ point
ROI ↔ ROI
somatotopic ↔ somatotopic
coil-field ↔ coil-field
network ↔ network
```

No universal millimetre threshold applies to all.

---

# 81. `RedundancyPolicy`

```ts
interface RedundancyPolicy {
  indication_module_release_id: UUID;

  comparators:
    RedundancyComparatorPolicy[];

  cross_geometry_rules:
    CrossGeometryRedundancyRule[];
}
```

---

# 82. CLINICAL DIVERSITY RULE

The Target Slate should retain candidates that add:

# distinct clinical information,

not simply ranks 1–5.

This principle is inherited from the v1 clinical/scientific architecture. 

---

# 83. SLATE-ASSEMBLY POLICY

```ts
interface SlateAssemblyPolicy {
  indication_module_release_id: UUID;

  max_primary: number;
  max_additional: number;

  role_priorities:
    CandidateRolePriority[];

  objective_coverage_rules:
    UUID[];

  diversity_rules:
    UUID[];

  mandatory_counterfactual_visibility?: boolean;

  permit_empty_slate: boolean;

  permit_partial_slate: boolean;
}
```

---

# 84. CARDINALITY DEFAULT

For v2:

```text
maximum Primary = 3
maximum Additional = 2
```

continues unless a future controlled product specification changes it.

Policy SHALL NOT require all positions to be filled.

---

# 85. NO GLOBAL PRIMARY-1 SEMANTIC

Scientific Policy SHALL NOT assume:

```text
Primary 1 = Evidence Anchor
```

for every indication.

That may remain appropriate for a particular MDD policy.

Other modules may assign different roles.

---

# 86. ABSTENTION POLICY

```ts
interface AbstentionPolicy {
  indication_module_release_id: UUID;

  conditions: AbstentionCondition[];

  partial_capability_failure_behaviour:
    | "fallback"
    | "module_defined";

  complete_abstention_permitted: true;
}
```

MAGNIOM SHALL always be capable of returning:

# no valid target.

The v1 safety framework explicitly required abstention and fewer-than-five candidate outputs. 

---

# 87. PARTIAL ABSTENTION

Examples:

```text
FC refinement unavailable
→ MDD evidence baseline remains
```

```text
DWI research capability failed
→ Stroke anatomical/motor pathway remains
```

```text
mandatory lesion mapping failed
→ Stroke targeting blocked
```

The relevant policy defines which outcome applies.

---

# 88. EXPLANATION POLICY

Scientific Policy SHALL define required explanation dimensions by module.

Common minimum:

* clinical objective;
* EvidencePath;
* target family;
* candidate role;
* patient-specific contribution;
* reliability;
* geometry;
* material uncertainty;
* strongest counterargument;
* alternative/counterfactual.

---

# 89. MODULE-SPECIFIC EXPLANATION

### Stroke

also include:

* disease stage;
* lesion relationship.

### Pain

also include:

* body-region/somatotopic relationship.

### OCD field targets

also include:

* field geometry/device context.

### Aphasia

also include:

* language phenotype;
* rehabilitation context.

### Tinnitus

also include:

* major negative/conflicting evidence.

---

# 90. SCIENTIFIC POLICY PARAMETERS

```ts
interface ScientificPolicyParameter {
  id: UUID;

  code: string;

  namespace: string;

  parameter_group: string;

  value_type:
    | "number"
    | "integer"
    | "boolean"
    | "enum"
    | "string"
    | "structured";

  value: unknown;

  unit?: string;

  minimum?: number;
  maximum?: number;

  permitted_values?: string[];

  rationale: string;

  validation_basis: string;

  safety_critical: boolean;

  change_impact_class:
    | "low"
    | "moderate"
    | "high"
    | "critical";
}
```

---

# 91. PARAMETER BOUNDS ARE VALIDATION, NOT CLAMPING

If:

```text
value > maximum validated bound
```

MAGNIOM SHALL NOT silently apply:

```text
value = maximum.
```

The configuration is:

# invalid.

This preserves the v1 fail-closed policy concept.

---

# 92. MODULE-SPECIFIC PARAMETER NAMESPACES

Recommended pattern:

```text
mdd.*
ocd.*
pain_np.*
stroke_motor.*
stroke_aphasia.*
tbi_dep.*
tbi_cog.*
ptsd.*
tinnitus.*
```

Examples:

```text
mdd.rsfc.minimum_reliability

pain_np.motor_map.minimum_reliability

stroke_motor.lesion.minimum_registration_quality

stroke_motor.motor_map.minimum_hotspot_reliability

ocd.field.minimum_target_roi_coverage

stroke_aphasia.treatment_context.slt_requirement

tinnitus.mode.clinical_permission
```

---

# 93. NO PARAMETER INHERITANCE BY NAME

If:

```text
mdd.rsfc.minimum_reliability
```

exists, it SHALL NOT automatically populate:

```text
ptsd.rsfc.minimum_reliability.
```

Identically named concepts across indications may require separate validation.

---

# 94. DEFAULT INHERITANCE RULE

Default:

# no scientific parameter inheritance across Indication Modules.

Any shared parameter requires explicit:

```text
shared_parameter_binding
```

and documented justification.

---

# 95. SHARED CORE PARAMETERS

Some engineering-scientific invariants may legitimately be global.

Examples:

* hash algorithm;
* deterministic sorting mechanics;
* coordinate-space validation rules;
* maximum canonical slate cardinality.

But anything that changes scientific interpretation remains module-scoped unless validated as truly universal.

---

# 96. MODULE-SPECIFIC CLINICAL AUTHORITY

Clinical permission SHALL be evaluated as:

```text
CaseIndication
        ↓
IndicationModuleRelease
        ↓
IndicationPolicyBinding
        ↓
ScientificCompatibilityConfiguration
        ↓
Clinical permission
```

not:

```text
application is in Clinical Mode
→ everything clinical.
```

---

# 97. THERE IS NO SINGLE GLOBAL v2 `clinical_mode = true`

A deployment-level UI may display:

```text
CLINICAL MODE
```

for an active case.

But server authority must resolve:

```text
this CaseIndication
+
this module
+
this policy
+
this compatibility configuration
=
clinical_permitted.
```

---

# 98. EXAMPLE — MIXED-MATURITY INSTALLATION

The same installation may lawfully contain:

```text
MDD
clinical_permitted

Stroke Motor
validation_only

TBI
research_only
```

A clinician opening a Stroke Case SHALL not gain MDD-level Clinical authority merely because the product has Clinical MDD capability.

---

# 99. RESEARCH MODE PERMISSION

Research policy may authorise:

* unassigned evidence classifications;
* Research EvidencePaths;
* experimental generators;
* alternative pipelines;
* structural connectivity;
* network hypotheses;
* experimental multimodal fusion.

Every actual Research run still records exact versions.

---

# 100. RESEARCH DOES NOT MEAN UNCONTROLLED

Research Mode remains:

* versioned;
* reproducible;
* provenance-complete;
* mode-labelled.

It is broader scientifically, not arbitrary.

---

# 101. VALIDATION MODE

Although the canonical end-user modes remain Clinical and Research, policy should support:

# validation permission

as a scientific maturity dimension.

A generator/EvidencePath may be:

```text
validation_permitted
```

while actual execution occurs within a controlled Research/Validation environment.

---

# 102. VALIDATION CONFIGURATION

A Validation configuration SHALL identify:

* dataset/study scope;
* module;
* policy;
* evidence release;
* engine;
* plugin;
* measurement providers;
* parameters;
* exact analysis plan where relevant.

This prevents retrospective tuning.

---

# 103. PROHIBITED CONFIGURATIONS — GLOBAL

Clinical Mode SHALL reject at minimum:

```text
Research-only IndicationModule

Research-only EvidencePath

unassigned evidence used as Clinical authority

unapproved targeting plugin

unapproved candidate generator

generator/module mismatch

module/indication mismatch

unapproved target geometry

Research measurement used as Clinical capability

failed required reliability

incompatible measurement provider

incompatible acquisition profile

incompatible normative model

incompatible E-field engine

incompatible device/coil

out-of-bounds scientific parameter

missing scientific provenance

unsigned/invalid policy release

latest/unpinned scientific selector

dynamic internet/PubMed scientific input

LLM-generated ranking input

runtime-random scientific input

automatic online-learning weights

organisation-local scientific override

UI-controlled scientific threshold
```

---

# 104. PROHIBITED CROSS-INDICATION CONFIGURATIONS

Explicitly reject:

```text
MDD EvidencePath
→ TBI candidate
```

```text
MDD FC reliability threshold
→ Stroke FC targeting
```

```text
Pain somatotopy rule
→ Fibromyalgia automatically
```

```text
Stroke interhemispheric rule
→ TBI
```

```text
OCD field evidence
→ focal MNI point
```

without direct controlled compatibility.

---

# 105. PROHIBITED MEASUREMENT SHORTCUTS

Reject:

```text
most abnormal parcel = target

task activation = treatment target

tractography streamline maximum = target

MEP absent = contralesional target

tinnitus pitch = auditory cortical target

lesion = target

motor hotspot = clinically superior target
```

unless a future approved scientific model explicitly establishes the inference.

---

# 106. PROHIBITED FUSION

Reject hidden:

```text
rs-fMRI + DWI + lesion + task fMRI
→ fused clinical score
```

unless a validated Multimodal Scientific Model is explicitly present in the compatibility configuration.

---

# 107. PROHIBITED SCORE TRANSFER

Reject:

```text
Evidence Tier A = 1.0
Tier B = 0.8
```

as a universal compensable scoring model.

Evidence remains principally an eligibility/governance construct.

---

# 108. PROHIBITED AUTO-LEARNING

Clinical outcomes SHALL NOT update:

* ranking weights;
* reliability thresholds;
* evidence permissions;
* candidate-generation rules;

automatically.

The v1 roadmap already required outcomes to pass through a Research Dataset → analysis → proposed change → validation → new release pathway. 

---

# 109. PROHIBITED ADMIN OVERRIDES

Ordinary administrators SHALL NOT be able to edit:

```text
minimum reliability

permitted EvidencePaths

module clinical status

ranking weights

refinement threshold

redundancy threshold

E-field role

clinical candidate generators
```

through a generic settings panel.

---

# 110. SCIENTIFIC CONFIGURATION FAILURE IS FAIL-CLOSED

If MAGNIOM cannot prove that a scientific configuration is permitted:

# it SHALL NOT generate an authoritative Clinical Target Slate.

Possible fallback is used only if explicitly defined in policy.

---

# 111. FALLBACK IS NOT EXCEPTION HANDLING

Scientific fallback means:

```text
validated alternate scientific pathway.
```

Example:

```text
MDD FC unreliable
→ MDD evidence baseline.
```

It does not mean:

```text
try something reasonable.
```

---

# 112. FALLBACK CHAIN

Policy may define:

```ts
interface ScientificFallbackRule {
  triggering_condition_code: string;

  from_capability: string;

  fallback_configuration_id?: UUID;

  resulting_capability_state:
    | "fallback_only"
    | "disabled"
    | "abstain";

  explanation_template_id: UUID;
}
```

---

# 113. MDD FALLBACK

Example:

```text
FC reliability fails
        ↓
disable individual_fc_refinement
        ↓
use EVIDENCE_BASELINE configuration
```

where permitted.

---

# 114. PAIN FALLBACK

Example:

```text
motor mapping unreliable
        ↓
disable motor-map refinement
        ↓
use evidence-defined somatotopic anatomical baseline
```

only if independently validated.

---

# 115. STROKE FALLBACK

If lesion mapping is mandatory and fails:

```text
no lesion-aware targeting
```

may mean:

# complete module abstention,

not an automatic template-space target.

---

# 116. TINNITUS FALLBACK

A failed Research imaging measurement does not justify:

```text
generic auditory cortex target.
```

Correct result may simply be:

# no Research target generated.

---

# 117. POLICY LIFECYCLE

Canonical lifecycle:

```text
DRAFT
  ↓
SCIENTIFIC REVIEW
  ↓
TECHNICAL REVIEW
  ↓
VALIDATION
  ↓
CHANGE-IMPACT ANALYSIS
  ↓
RELEASE CANDIDATE
  ↓
GOVERNANCE APPROVAL
  ↓
SIGNATURE
  ↓
ACTIVE
```

Clinical configurations require the full release path.

---

# 118. LIFECYCLE STATUS AND VALIDATION STATUS REMAIN SEPARATE

Example:

```text
lifecycle_status = active

validation_status = retrospective_validated
```

may be legitimate for a Research/Validation policy.

It does not mean:

```text
clinical_release_qualified.
```

---

# 119. CLINICAL ACTIVATION REQUIREMENT

A clinical IndicationPolicyBinding requires:

```text
ScientificPolicy.validation_status
=
clinical_release_qualified
```

or an equivalent explicitly governed release state.

Additionally, the bound Indication Module must itself have sufficient clinical release maturity.

---

# 120. INDICATION-SPECIFIC VALIDATION EVIDENCE

Validation is not transferable across modules.

A policy may include:

```text
MDD binding:
clinical_release_qualified

Stroke binding:
retrospective_validated

Tinnitus binding:
engineering_verified
```

within one multi-indication policy release.

---

# 121. APPROVALS

Approval represents:

# accountable human governance.

Recommended clinical activation approvals:

* scientific lead;
* relevant indication clinical lead;
* technical lead;
* quality/regulatory lead.

Additional specialist approval may be required depending on module.

---

# 122. MODULE-SPECIFIC CLINICAL REVIEW

Examples:

### Stroke

stroke rehabilitation / neurology expertise.

### Pain

pain medicine / relevant neuromodulation expertise.

### Aphasia

stroke/language rehabilitation expertise.

### Tinnitus

audiology/otology expertise.

### OCD/PTSD

psychiatric neuromodulation expertise.

One MDD specialist approval does not automatically approve every module.

---

# 123. APPROVAL OBJECT

```ts
interface ScientificPolicyApproval {
  id: UUID;

  policy_release_id: UUID;

  indication_module_release_id?: UUID;

  approval_role:
    | "scientific"
    | "clinical"
    | "technical"
    | "quality_regulatory"
    | "specialty_reviewer";

  approver_id: UUID;

  decision:
    | "approved"
    | "approved_with_conditions"
    | "rejected";

  rationale?: string;

  approved_at: ISO8601UTC;
}
```

---

# 124. SIGNATURE IS DIFFERENT FROM APPROVAL

Approval means:

> A responsible person accepted the scientific release.

Signature means:

> The approved digital artefact can be integrity-verified.

Both are required for high-assurance clinical release.

---

# 125. SIGNED RELEASE MANIFEST

The signed manifest SHOULD cover:

```text
ScientificPolicyRelease payload hash
compatibility configuration hashes
IndicationModuleRelease IDs/hashes
EvidenceLibraryRelease
TargetEngineRelease
plugin digests
generator versions
measurement provider releases
reliability methods
atlas/normative/E-field components
parameter manifest
```

---

# 126. POLICY INTEGRITY FAILURE

If runtime verification finds:

```text
stored payload hash
≠
recomputed payload hash
```

Clinical execution SHALL fail.

No attempt should be made to “repair” the policy automatically.

---

# 127. POLICY SIGNATURE FAILURE

Invalid or absent required signature:

```text
SCIENTIFIC_POLICY_SIGNATURE_INVALID
```

Clinical generation SHALL be blocked.

---

# 128. RELEASE MANIFEST v2

```ts
interface ScientificPolicyReleaseManifestV2 {
  scientific_policy_release_id: UUID;

  indication_module_release_ids: UUID[];

  compatibility_configuration_ids: UUID[];

  evidence_library_release_ids: UUID[];

  target_engine_release_ids: UUID[];

  plugin_release_refs: ComponentReleaseRef[];

  generator_release_refs: ComponentReleaseRef[];

  measurement_provider_release_refs: ComponentReleaseRef[];

  reliability_method_refs: ComponentReleaseRef[];

  phenotype_ontology_release_ids: UUID[];

  atlas_release_refs: ComponentReleaseRef[];

  normative_model_release_refs: ComponentReleaseRef[];

  efield_release_refs: ComponentReleaseRef[];

  device_capability_profile_ids: UUID[];

  parameter_ids: UUID[];

  manifest_sha256: SHA256;
}
```

---

# 129. RUNTIME POLICY RESOLUTION

Canonical runtime:

```text
Case
 ↓
CaseIndication
 ↓
IndicationModuleRelease
 ↓
requested mode
 ↓
ScientificPolicyRelease
 ↓
IndicationPolicyBinding
 ↓
compatible ScientificConfiguration
 ↓
verify exact component manifests
 ↓
verify evidence permissions
 ↓
verify measurement/reliability capabilities
 ↓
Target Engine execution
```

---

# 130. RUNTIME VALIDATION SEQUENCE

Before target generation:

1. Verify policy exists.
2. Verify lifecycle status.
3. Verify policy hash.
4. Verify policy signature.
5. Verify CaseIndication.
6. Verify `IndicationModuleRelease`.
7. Verify module status.
8. Verify mode.
9. Verify exact compatibility configuration.
10. Verify EvidenceLibraryRelease.
11. Verify EvidencePath permissions.
12. Verify TargetEngineRelease.
13. Verify plugin digest.
14. Verify generator set.
15. Verify measurement providers.
16. Verify reliability methods.
17. Verify normative/E-field/device components.
18. Verify parameter completeness.
19. Verify parameter bounds.
20. Verify prohibited configurations.
21. Execute Target Engine.
22. Verify output manifest references the same configuration.

---

# 131. POST-EXECUTION VERIFICATION

The published Target Slate SHALL identify:

```text
indication_module_release_id

scientific_policy_release_id

scientific_compatibility_configuration_id

evidence_library_release_id

target_engine_release_id

plugin release

generator versions

measurement bundle

reliability bundle

relevant normative/E-field components
```

No reconstruction should depend on querying “current” components.

---

# 132. HISTORICAL RECONSTRUCTION

Given a historical Target Slate, MAGNIOM must answer:

> Exactly which scientific indication model and configuration produced this slate?

including:

```text
MDD Module 2.0.0
not merely
MDD.
```

---

# 133. NO `LATEST`

Clinical scientific manifests SHALL NOT contain selectors such as:

```text
latest

current_default

most_recent_validated

active_module
```

as runtime scientific references.

Resolve exact immutable IDs before execution.

---

# 134. CASES DO NOT AUTO-MIGRATE MODULES

If:

```text
StrokeMotorModule 1.1
```

becomes active, a historical Case using:

```text
StrokeMotorModule 1.0
```

remains historically associated with 1.0.

A new analysis may deliberately use 1.1.

---

# 135. POLICY UPDATE DOES NOT ALTER HISTORICAL SLATES

Similarly:

```text
ScientificPolicy 2.0
→ 2.1
```

does not recalculate old Target Slates.

Existing clinician decisions remain bound to their original scientific configuration.

---

# 136. CHANGE CLASSIFICATION v2

```ts
type ScientificChangeClassification =
  | "non_scientific"
  | "scientific_implementation"
  | "scientific_parameter"
  | "scientific_model"
  | "indication_module"
  | "measurement_capability"
  | "evidence_path"
  | "target_geometry"
  | "device_dependency"
  | "intended_use_scope";
```

---

# 137. `INDICATION_MODULE` CHANGE

Changing any of:

* intended population;
* clinical objective model;
* permitted target families;
* disease-stage definitions;
* required measurements;
* target geometry types;
* treatment-context requirements;

is a high-impact scientific change.

---

# 138. EVIDENCE-PATH CHANGE

Changing:

```text
validation_permitted
→ clinical_permitted
```

is clinically material even if:

* no code changes;
* no parameters change;
* target coordinates remain identical.

It requires governance and validation impact review.

---

# 139. MEASUREMENT-CAPABILITY CHANGE

Changing:

```text
DWI = research_only
```

to:

```text
DWI = ranking_feature
```

is a scientific-model change.

It requires validation specific to the indication/module.

---

# 140. TARGET-GEOMETRY CHANGE

Changing:

```text
surface ROI
→ point target
```

or:

```text
field target
→ focal coordinate
```

may materially change clinical interpretation.

Treat as scientific change, not UI formatting.

---

# 141. PARAMETER CHANGE IMPACT

Every ranking-relevant parameter change SHALL trigger an impact report.

Questions include:

```text
Which Golden Cases changed?

Which candidate geometries changed?

Which Primary 1 positions changed?

Which refinements changed from retained baseline to adopted?

Which cases moved from target to abstention?

Which module(s) were affected?

How did fallback rates change?
```

The v1 roadmap already required scientific releases to answer this kind of change-impact question. 

---

# 142. MODULE-SPECIFIC IMPACT ANALYSIS

For Pain:

* changed somatotopic targets?
* motor-map adoption rate?

For Stroke:

* changed ipsi/contralesional candidate availability?
* lesion exclusions?
* stage-specific eligibility?

For OCD:

* field coverage?
* device compatibility?

For Tinnitus:

* Research candidate composition?

---

# 143. SEMVER DOES NOT DETERMINE VALIDATION BURDEN

A patch that unexpectedly changes 20% of clinical Target Slates is not low risk because it is:

```text
2.0.1.
```

Observed scientific impact governs validation requirements.

---

# 144. GOLDEN POLICY TEST — MDD

Request:

```text
MDD
Clinical
qualified rs-fMRI
```

Expected:

* MDD module resolves;
* Clinical MDD binding resolves;
* MDD Connectome configuration selected;
* MDD FC refinement generator permitted;
* v1-compatible clinical rules preserved where designated.

---

# 145. GOLDEN POLICY TEST — MDD FC FAILURE

Input:

```text
MDD
FC reliability fails.
```

Expected:

```text
Connectome capability disabled
→ approved evidence-baseline fallback
```

if active policy permits.

---

# 146. GOLDEN POLICY TEST — PAIN

Input:

```text
Neuropathic hand pain
qualified motor mapping.
```

Expected:

* Pain Module resolves;
* somatotopic target generation permitted;
* motor-map refinement only if reliability rule passes;
* rs-fMRI not required unless policy says so.

---

# 147. GOLDEN POLICY TEST — STROKE

Input:

```text
Stroke Motor
required LesionContext absent.
```

Expected:

```text
module blocked or abstained
```

according to policy.

No normal-template fallback unless explicitly validated.

---

# 148. GOLDEN POLICY TEST — APHASIA

Input:

```text
EvidencePath requires chronic non-fluent aphasia
patient has incompatible stage/phenotype.
```

Expected:

# EvidencePath not eligible.

---

# 149. GOLDEN POLICY TEST — OCD

Input:

```text
coil-field EvidencePath
+
point-target generator.
```

Expected:

```text
TARGET_GEOMETRY_POLICY_VIOLATION.
```

---

# 150. GOLDEN POLICY TEST — TBI

Attempt:

```text
TBI depression
+
MDD EvidencePath
+
MDD DLPFC generator.
```

Expected:

# hard cross-indication rejection.

---

# 151. GOLDEN POLICY TEST — PTSD

Input:

```text
combat-related PTSD
+
general PTSD EvidencePath with partial applicability.
```

Expected:

* population applicability retained;
* no hidden upgrade to full applicability;
* policy determines Research/Validation permission.

---

# 152. GOLDEN POLICY TEST — TINNITUS

Request:

```text
Tinnitus
mode = clinical.
```

with current Research-only module.

Expected:

```text
INDICATION_MODULE_NOT_CLINICALLY_PERMITTED.
```

No candidate generation.

---

# 153. GOLDEN POLICY TEST — RESEARCH MEASUREMENT LEAKAGE

Input:

```text
Clinical Stroke configuration
+
research-only DWI structural-connectivity feature.
```

Expected:

```text
RESEARCH_COMPONENT_IN_CLINICAL_CONFIGURATION.
```

---

# 154. GOLDEN POLICY TEST — UNASSIGNED EVIDENCE

Input:

```text
EvidenceClaim classification = unassigned
+
Clinical candidate request.
```

Expected:

# cannot establish Clinical EvidencePath authority.

---

# 155. GOLDEN POLICY TEST — MODULE VERSION

Policy authorises:

```text
PainModule 1.0.0
```

runtime provides:

```text
PainModule 1.1.0.
```

Expected:

```text
INDICATION_MODULE_VERSION_INCOMPATIBLE.
```

No inference of compatibility.

---

# 156. GOLDEN POLICY TEST — PLUGIN DIGEST

Same version string, altered plugin digest.

Expected:

# integrity failure.

---

# 157. GOLDEN POLICY TEST — OUT-OF-BOUNDS PARAMETER

Configured value lies outside validated policy bounds.

Expected:

```text
POLICY_PARAMETER_OUT_OF_BOUNDS.
```

Do not clamp.

---

# 158. GOLDEN POLICY TEST — MULTIMODAL FUSION

Attempt:

```text
rs-fMRI
+
DWI
+
task fMRI
→ combined target score
```

without an approved multimodal model.

Expected:

# prohibited scientific configuration.

---

# 159. FAILURE CODES v2

Retain and extend the v1 policy-failure vocabulary.

```text
SCIENTIFIC_POLICY_NOT_FOUND
SCIENTIFIC_POLICY_NOT_ACTIVE
SCIENTIFIC_POLICY_MODE_MISMATCH
SCIENTIFIC_POLICY_INTEGRITY_FAILURE
SCIENTIFIC_POLICY_SIGNATURE_INVALID

INDICATION_MODULE_NOT_FOUND
INDICATION_MODULE_VERSION_INCOMPATIBLE
INDICATION_MODULE_MODE_MISMATCH
INDICATION_MODULE_NOT_CLINICALLY_PERMITTED

INDICATION_POLICY_BINDING_NOT_FOUND

SCIENTIFIC_CONFIGURATION_INCOMPATIBLE

EVIDENCE_RELEASE_INCOMPATIBLE
EVIDENCE_PATH_NOT_PERMITTED
EVIDENCE_CLASSIFICATION_INSUFFICIENT
EVIDENCE_CLASSIFICATION_UNASSIGNED

TARGET_ENGINE_VERSION_INCOMPATIBLE
TARGET_PLUGIN_INCOMPATIBLE
TARGET_PLUGIN_INTEGRITY_FAILURE
CANDIDATE_GENERATOR_NOT_PERMITTED

MEASUREMENT_PROVIDER_INCOMPATIBLE
MEASUREMENT_CAPABILITY_NOT_PERMITTED
MEASUREMENT_REQUIREMENT_UNSATISFIED

RELIABILITY_METHOD_INCOMPATIBLE
RELIABILITY_REQUIREMENT_NOT_MET

TARGET_GEOMETRY_NOT_PERMITTED

DISEASE_STAGE_INCOMPATIBLE
LESION_CONTEXT_REQUIRED
TREATMENT_CONTEXT_INCOMPATIBLE

NORMATIVE_MODEL_INCOMPATIBLE
EFIELD_ENGINE_INCOMPATIBLE
DEVICE_CAPABILITY_INCOMPATIBLE

RESEARCH_COMPONENT_IN_CLINICAL_CONFIGURATION

MULTIMODAL_FUSION_NOT_PERMITTED

POLICY_PARAMETER_MISSING
POLICY_PARAMETER_OUT_OF_BOUNDS

POLICY_PROHIBITED_CONFIGURATION

POLICY_VALIDATION_INSUFFICIENT
POLICY_APPROVAL_INCOMPLETE
```

---

# 160. ERROR MESSAGES MUST BE SCIENTIFICALLY MEANINGFUL

Clinician-facing:

> Patient-specific motor-map refinement is unavailable because the motor localisation did not meet the validated reliability requirement. The evidence-supported baseline remains available.

Not:

```text
ERR_POLICY_402.
```

Technical error code remains in audit/logs.

---

# 161. DATABASE MODEL

Recommended high-level tables:

```text
scientific_policy.policy_releases
scientific_policy.indication_bindings
scientific_policy.compatibility_configurations
scientific_policy.parameters
scientific_policy.evidence_path_permissions
scientific_policy.measurement_policies
scientific_policy.reliability_policies
scientific_policy.generator_permissions
scientific_policy.ranking_profiles
scientific_policy.refinement_profiles
scientific_policy.geometry_policies
scientific_policy.treatment_context_policies
scientific_policy.normative_policies
scientific_policy.efield_policies
scientific_policy.redundancy_policies
scientific_policy.slate_policies
scientific_policy.abstention_policies
scientific_policy.approvals
scientific_policy.signatures
```

Exact SQL belongs in the v2 Supabase specification.

---

# 162. RELATIONAL SEMANTICS SHOULD NOT BE HIDDEN ENTIRELY IN JSON

Critical searchable relationships should remain explicit:

```text
policy ↔ indication module

policy ↔ evidence path

policy ↔ generator

policy ↔ measurement capability

policy ↔ compatibility configuration

policy ↔ Clinical/Research permission
```

JSON may store controlled parameter payloads where appropriate.

---

# 163. DATABASE IMMUTABILITY

An active ScientificPolicyRelease SHALL NOT be updated in place.

Change requires:

```text
new ScientificPolicyRelease.
```

The same applies to active compatibility configurations.

---

# 164. ACTIVATION TRANSACTION

Activation should be atomic.

Either:

```text
policy release
+
bindings
+
compatibility configurations
+
approvals
+
signatures
```

become active together,

or none do.

No partially active scientific release.

---

# 165. PRIVILEGE BOUNDARY

Ordinary application administrators SHALL NOT have direct unrestricted mutation privileges over active scientific-policy tables.

Activation requires dedicated controlled authority.

---

# 166. SCIENTIFIC RELEASE WORKFLOW

Recommended:

```text
scientist proposes
        ↓
domain specialist reviews
        ↓
engineering verifies implementability
        ↓
validation evidence attached
        ↓
change impact assessed
        ↓
quality/regulatory review
        ↓
release manifest frozen
        ↓
approvals recorded
        ↓
manifest signed
        ↓
activation transaction
```

---

# 167. CLINICAL RELEASE PACKAGE v2

A Clinical Release Package must identify exact:

```text
Application build

Database migration

System Requirements baseline

ScientificPolicyRelease

IndicationModuleRelease(s)

EvidenceLibraryRelease

EvidencePath permissions

TargetEngineRelease

Indication plugin releases

Candidate generator releases

Measurement provider releases

Reliability method releases

Phenotype ontology release

Atlas releases

Normative model releases

E-field engine/model where used

Device capability profiles

Human Factors evidence

Scientific verification

Clinical validation evidence

Risk-management approval

Regulatory status
```

The v1 roadmap already required a similarly explicit release package and prohibited a single developer from activating Clinical Mode. 

---

# 168. CLINICAL RELEASE PACKAGE MAY HAVE DIFFERENT MODULE STATES

Example:

```text
MAGNIOM Clinical Release 2.3

MDD               Clinical
Pain              Validation
Stroke Motor      Validation
OCD               Research/Validation
TBI               Research
Tinnitus          Research
```

The package manifest records those boundaries explicitly.

---

# 169. MODULE PROMOTION IS A RELEASE EVENT

Promotion:

```text
Stroke Motor
validation_only
→ clinical_permitted
```

requires:

* relevant validation;
* risk impact;
* clinical review;
* Scientific Policy change;
* release approval.

It is not:

```text
UPDATE modules
SET clinical = true.
```

---

# 170. MODULE SUSPENSION

Scientific governance SHALL support rapid:

```text
suspended
```

state when:

* material new safety concern;
* invalidated evidence;
* algorithm defect;
* measurement reliability problem;
* device incompatibility;
* regulatory issue

requires preventing new use.

Historical records remain reconstructable.

---

# 171. SUSPENSION DOES NOT DELETE HISTORY

A withdrawn/suspended module or configuration remains available for:

* audit;
* historical reconstruction;
* incident investigation.

It is unavailable for new affected target generation.

---

# 172. EVIDENCE UPDATE CONTROL v2

New publication:

```text
Source
 ↓
SourceFinding
 ↓
EvidenceClaim
 ↓
Evidence synthesis
 ↓
Governance classification
 ↓
EvidenceLibraryRelease
 ↓
EvidencePath update
 ↓
Scientific Policy impact assessment
 ↓
possible policy release
```

No literature ingestion automatically changes Clinical ranking.

---

# 173. MODULE EVIDENCE DOWNGRADE

If evidence becomes less favourable:

Policy SHALL support:

```text
clinical_permitted
→ validation_only
```

or:

```text
suspended.
```

MAGNIOM evidence can strengthen or weaken.

---

# 174. NEGATIVE EVIDENCE CAN ALTER PERMISSION

A clinically permitted TargetFamily may remain technically implemented while Scientific Policy disables:

* standalone Primary use;
* a particular population;
* a particular targeting method;

after new evidence.

Code deletion is unnecessary.

Policy authority is the correct control.

---

# 175. REPRODUCIBILITY REQUIREMENT

Given:

```text
same Case snapshot
same IndicationModuleRelease
same MeasurementBundle
same ReliabilityBundle
same Evidence Library
same Scientific Policy
same Target Engine
same plugin/generator set
same component versions
```

MAGNIOM SHALL reconstruct the same scientific decision environment.

---

# 176. POLICY UNIT TESTS

Test:

* parameter schema;
* missing parameter;
* bound violation;
* duplicate binding;
* conflicting module permission;
* invalid EvidencePath;
* generator not in plugin;
* unsupported geometry;
* incompatible measurement requirement.

---

# 177. POLICY INTEGRATION TESTS

Test the complete chain:

```text
CaseIndication
→ Module
→ Policy Binding
→ Compatibility Configuration
→ Target Engine
```

for every active module.

---

# 178. POLICY SECURITY TESTS

Verify:

* ordinary clinician cannot edit policy;
* ordinary admin cannot activate policy;
* cross-organisation roles cannot alter global scientific authority;
* browser credentials cannot mutate protected scientific releases;
* signed active release is immutable.

---

# 179. POLICY SCIENTIFIC VERIFICATION

For each compatibility configuration:

independent reviewers should be able to answer:

### Why is this indication enabled?

### Which EvidencePaths can generate targets?

### Which candidate generators are active?

### Which measurements can influence ranking?

### Which reliability rules apply?

### Which fallback exists?

### Which target geometries are legal?

### Which parameters can change ordering?

### What prevents Research leakage?

If any cannot be reconstructed:

# configuration fails scientific verification.

---

# 180. HUMAN-FACTORS CONSEQUENCE

Scientific Policy status should be reflected in the application shell.

Examples:

```text
CLINICAL MODE
MDD Module
```

versus:

```text
RESEARCH MODE
Tinnitus Module
Not permitted for treatment decisions
```

The frontend displays canonical policy state.

It does not determine it.

---

# 181. NO UI MODE OVERRIDE

A developer SHALL NOT implement:

```text
?mode=clinical
```

or:

```text
clinicalMode=true
```

as sufficient authority to enable a module.

The UI can request a mode.

Server-side policy determines whether that mode is valid.

---

# 182. CLINICIAN OVERRIDE DOES NOT OVERRIDE SCIENTIFIC POLICY

Clinicians may:

* reject candidates;
* choose another clinically permitted candidate;
* modify/replace according to controlled workflow;
* choose no target.

A clinician SHALL NOT use an ordinary override control to convert:

```text
Research-only TargetCandidate
```

into:

```text
Clinical TargetCandidate.
```

Clinical judgement and system scientific authority remain distinct.

---

# 183. SCIENTIFIC POLICY DOES NOT OVERRIDE CLINICIAN

Conversely, Scientific Policy defines:

# what MAGNIOM may propose.

It does not force:

# what the specialist must choose.

This preserves final human authority.

---

# 184. INITIAL v2 MODULE POSTURE

A sensible initial v2 scientific policy posture is:

| Module                 | Policy posture                                |
| ---------------------- | --------------------------------------------- |
| MDD ± anxious distress | preserve existing validation/clinical pathway |
| Neuropathic pain       | Research/Validation                           |
| Stroke Motor           | Research/Validation                           |
| Stroke Aphasia         | Research/Validation                           |
| OCD                    | Research/Validation                           |
| PTSD                   | Research/Validation                           |
| TBI submodules         | Research                                      |
| Tinnitus               | Research                                      |

These states are development governance recommendations, not evidence-tier assignments.

---

# 185. INITIAL MDD POLICY

Preserve v1 conservatism:

* established evidence baseline;
* patient-specific FC only when reliability qualified;
* personalisation requires incremental value;
* normative abnormalities not independent Clinical candidate generators;
* E-field primarily accessibility/pose unless stronger role separately validated;
* do not force third Primary candidate.

This is consistent with the existing v1 Target Engine policy. 

---

# 186. INITIAL PAIN POLICY

Suggested validation posture:

```text
Evidence-supported somatotopic M1 baseline:
enabled for validation

Motor-map refinement:
validation only

rs-fMRI network refinement:
research

normative pain-network abnormalities:
research

multimodal fusion:
disabled
```

No numerical thresholds are specified here.

---

# 187. INITIAL STROKE-MOTOR POLICY

Suggested:

```text
LesionContext:
required

disease stage:
required

evidence-defined motor strategies:
validation

motor-map refinement:
validation if qualified

MEP:
context/validation feature only

DWI/CST:
research or validation study

rs-fMRI:
research/validation

lesion-network targeting:
research
```

---

# 188. INITIAL APHASIA POLICY

Suggested:

```text
aphasia phenotype:
required

disease stage:
required where path-specific

lesion mapping:
required

right-IFG evidence path:
validation where appropriate

speech-language therapy context:
explicitly evaluated

task fMRI:
Research/Validation

patient-specific language-network optimisation:
Research
```

---

# 189. INITIAL OCD POLICY

Suggested:

```text
field-target evidence path:
validation

coil/device dependence:
enforced

pre-SMA/SMA focal alternatives:
separate EvidencePaths

symptom-provocation context:
explicit where evidence depends on it

rs-fMRI personalisation:
Research unless separately validated

cross-family universal score:
prohibited
```

---

# 190. INITIAL TBI POLICY

Suggested:

```text
all modules:
Research

lesion/skull context:
required where relevant

MDD target inheritance:
prohibited

target-specific candidate generation:
requires explicit TBI EvidencePath

DWI / rs-fMRI / task fMRI:
Research

multimodal fusion:
Research only
```

---

# 191. INITIAL PTSD POLICY

Suggested:

```text
target families:
Research/Validation

population applicability:
explicit

MDD evidence inheritance:
prohibited

connectome personalisation:
Research unless separately validated

conflicting population evidence:
must remain visible
```

---

# 192. INITIAL TINNITUS POLICY

Suggested:

```text
clinical permission:
disabled

research module:
enabled

audiology:
required

auditory/temporoparietal candidates:
Research only

imaging abnormalities:
cannot create Clinical targets

negative/conflicting evidence:
mandatory explanation content
```

---

# 193. v2 POLICY REQUIREMENT IDS

The future SRS v2 should include at least:

### MAG-POL-041

Every Target Slate SHALL reference exactly one `IndicationModuleRelease`.

### MAG-POL-042

Every scientific compatibility configuration SHALL explicitly identify its `IndicationModuleRelease`.

### MAG-POL-043

Compatibility between Scientific Policy and `IndicationModuleRelease` SHALL be positive-whitelist based.

### MAG-POL-044

Clinical permission for one Indication Module SHALL NOT confer Clinical permission on another.

### MAG-POL-045

Scientific parameters SHALL NOT inherit across Indication Modules unless explicitly approved.

### MAG-POL-046

An EvidencePath SHALL NOT influence Clinical Mode unless explicitly authorised for the active Indication Module.

### MAG-POL-047

Candidate generators SHALL be authorised by exact module, plugin version and Scientific Policy.

### MAG-POL-048

Measurement capabilities SHALL be authorised per Indication Module.

### MAG-POL-049

Research-only measurements SHALL NOT satisfy Clinical capability requirements.

### MAG-POL-050

Clinical Mode authority SHALL NOT be determined by a single application-level mode flag.

---

# 194. ADDITIONAL REQUIREMENTS

### MAG-POL-051

Target geometry permissions SHALL be module- and TargetFamily-specific.

### MAG-POL-052

Patient-specific refinement SHALL use a module-specific validated refinement policy.

### MAG-POL-053

A module may define an evidence-baseline fallback only through an explicit scientific fallback rule.

### MAG-POL-054

Multimodal fusion SHALL be prohibited unless explicitly represented as a validated scientific model.

### MAG-POL-055

Unassigned Evidence Governance classifications SHALL NOT be automatically converted to MAGNIOM Evidence Tiers.

### MAG-POL-056

Clinical module activation SHALL require module-specific validation evidence.

### MAG-POL-057

Superseding an `IndicationModuleRelease` SHALL NOT alter historical Target Slates.

### MAG-POL-058

A Clinical Release Package SHALL identify the exact module-level scientific permission state.

---

# 195. POLICY GOLDEN-SUITE REQUIREMENT

Every active or validation module SHALL have:

* at least one normal-path case;
* evidence failure case;
* measurement failure case;
* reliability failure case;
* mode-leakage case;
* wrong-module case;
* incompatible-version case;
* abstention/fallback case.

Additional cases depend on the module.

---

# 196. CHANGE-IMPACT REPORT v2

Every scientific release SHOULD produce a matrix:

| Module | Cases tested | Slate changed | Primary 1 changed | Abstention changed | Mean/median spatial change | New/removed candidates |
| ------ | -----------: | ------------: | ----------------: | -----------------: | -------------------------: | ---------------------: |
| MDD    |            … |             … |                 … |                  … |                          … |                      … |
| Pain   |            … |             … |                 … |                  … |                          … |                      … |
| Stroke |            … |             … |                 … |                  … |                          … |                      … |
| OCD    |            … |             … |                 … |                  … |                          … |                      … |

Research modules can report analogous Research outputs.

---

# 197. SCIENTIFIC POLICY PACKAGE

Recommended repository:

```text
packages/scientific-policy/
├── core/
│   ├── policy-release.ts
│   ├── compatibility.ts
│   ├── parameters.ts
│   ├── validation.ts
│   └── manifests.ts
│
├── evidence/
├── measurements/
├── reliability/
├── generators/
├── ranking/
├── refinement/
├── geometry/
├── efield/
├── normative/
├── slate/
├── abstention/
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
└── tests/
```

---

# 198. POLICY CONFIGURATION FILES

Conceptually:

```text
scientific-config/
├── releases/
│   └── 2.0.0/
│
├── indications/
│   ├── mdd/
│   ├── pain/
│   ├── stroke-motor/
│   └── ...
│
├── compatibility/
├── parameters/
├── manifests/
├── signatures/
└── validation/
```

Clinical artefacts are generated from controlled source files and hashed.

---

# 199. POLICY-AS-CODE PRINCIPLE

Scientific policy SHOULD be reviewable as code/configuration.

Benefits:

* diffable;
* testable;
* versioned;
* reproducible;
* code-reviewed;
* signed.

But policy-as-code does not mean:

# developers own scientific policy.

Scientific governance owns the meaning.

---

# 200. FINAL SCIENTIFIC POLICY MODEL

```text
                           ScientificPolicyRelease
                                      │
                ┌─────────────────────┼─────────────────────┐
                │                     │                     │
         MDD Binding            Pain Binding          Stroke Binding
                │                     │                     │
      IndicationModule       IndicationModule       IndicationModule
                │                     │                     │
       Evidence Paths          Evidence Paths          Evidence Paths
                │                     │                     │
        Generators              Generators              Generators
                │                     │                     │
       Measurements            Measurements            Measurements
                │                     │                     │
       Reliability             Reliability             Reliability
                │                     │                     │
       Ranking/Refine          Ranking/Refine          Ranking/Refine
                │                     │                     │
                └──────────────┬──────┴──────────────┬─────┘
                               │                     │
                      Exact Compatibility      Clinical/Research
                           Configuration             Authority
```

---

# 201. CANONICAL v2 SCIENTIFIC COMPATIBILITY RULE

The scientific compatibility tuple is now:

```text
ScientificPolicyRelease
×
IndicationModuleRelease
×
EvidenceLibraryRelease
×
EvidencePath permissions
×
TargetEngineRelease
×
IndicationTargetingPluginRelease
×
CandidateGeneratorReleaseSet
×
MeasurementProviderReleaseSet
×
ReliabilityMethodReleaseSet
×
PhenotypeOntologyRelease
×
AtlasReleaseSet
×
NormativeModelReleaseSet
×
EFieldEngineRelease where applicable
×
DeviceCapabilityProfile where applicable
×
AcquisitionProfileSet where applicable
×
Mode
```

The tuple must be explicitly approved.

---

# 202. WHY `IndicationModuleRelease` CHANGES EVERYTHING

Without the module in the tuple, MAGNIOM could know:

```text
which engine
which evidence
which pipeline
```

but still fail to know:

> **which scientific interpretation of those components is actually authorised for this disease, therapeutic objective, disease stage, target geometry and measurement architecture.**

`IndicationModuleRelease` supplies that missing scientific scope.

---

# 203. v2 SCIENTIFIC POLICY MANIFESTO

# One platform does not mean one scientific policy.

# Every indication earns its own authority.

# Code capability is not clinical permission.

# Evidence availability is not clinical permission.

# Module availability is not clinical permission.

# Measurement availability is not clinical permission.

# Reliability is capability-specific.

# Target geometry is scientific meaning, not presentation detail.

# A device may be part of the evidence path.

# Treatment context may be part of the evidence path.

# Disease stage may be part of the evidence path.

# Research evidence remains Research unless explicitly promoted.

# A new paper cannot change Clinical output automatically.

# A new plugin cannot change Clinical output automatically.

# A new measurement modality cannot change Clinical output automatically.

# A new module cannot change Clinical output automatically.

# A numerical parameter cannot change silently.

# A site cannot weaken scientific thresholds to improve throughput.

# A clinician can override a candidate, but cannot turn Research science into Clinical authority.

# Historical science remains reconstructable.

# Every clinically meaningful scientific combination is positively authorised.

# If authority cannot be proved, MAGNIOM fails closed.

---

# 204. CANONICAL DEFINITION

The **MAGNIOM Scientific Policy & Algorithm Configuration System v2.0** is:

> **An immutable, versioned, indication-aware and governance-approved scientific authority layer that binds each `IndicationModuleRelease` to the exact evidence paths, Target Engine components, indication plugins, candidate generators, measurement capabilities, reliability methods, target geometries, ranking/refinement rules, normative models, E-field components, devices and parameters permitted to influence MAGNIOM output in a defined mode.**

---

# 205. FINAL GOVERNING RULE

> **No Evidence Library release, Indication Module, Target Engine, plugin, candidate generator, imaging or neurophysiology pipeline, normative model, E-field model, device capability or ranking parameter becomes clinically authoritative merely because it exists, executes successfully, produces plausible output, or is technically compatible. It may influence Clinical Mode only when the exact `IndicationModuleRelease` and complete scientific configuration are explicitly authorised by an immutable, validated and approved `ScientificPolicyRelease`, and that authority can be reconstructed and cryptographically verified for the resulting Target Slate.**

This is the central v2 transition: **Clinical authority becomes indication-specific rather than application-wide.** MAGNIOM can therefore expand rapidly into pain, stroke, OCD, TBI, PTSD, tinnitus and later applications while preserving the narrow, deterministic and auditable scientific boundaries that made the original MDD architecture defensible.
