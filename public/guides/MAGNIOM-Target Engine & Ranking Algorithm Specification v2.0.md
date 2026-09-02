# MAGNIOM

## Target Engine & Ranking Algorithm Specification v2.0

**Document status:** Canonical multi-indication algorithm specification
**Version:** 2.0
**Date:** 2 September 2026
**Supersedes:** MAGNIOM Target Engine & Ranking Algorithm Specification v1.0 for new development
**Backward compatibility:** v1 MDD Target Slates and historical algorithm manifests remain immutable and reconstructable
**Primary architectural change:** MDD-specific Target Engine → deterministic core + governed indication plugins
**Primary output:** Up to 3 Primary Target Candidates + up to 2 Additional Candidates unless a future validated module specification further restricts cardinality
**Clinical authority:** Specialist clinician
**Algorithm authority:** Approved `TargetEngineRelease` + `ScientificPolicyRelease` + `IndicationModuleRelease`

**Depends on:**

* MAGNIOM Canonical Multi-Indication Data Specification v2.0
* MAGNIOM Evidence Knowledge Graph & Therapeutic Circuit Library v2.0
* MAGNIOM Multi-Indication Technical & Scientific Architecture Specification v2.0
* MAGNIOM Scientific Policy & Algorithm Configuration Specification v1.0
* MAGNIOM System Requirements Specification v1.0
* MAGNIOM Target Engine & Ranking Algorithm Specification v1.0
* MAGNIOM Neuroimaging & Functional Connectomics Pipeline Specification v1.0

---

# 1. PURPOSE

This specification defines how MAGNIOM v2 converts:

* clinician-approved clinical objectives;
* indication-specific evidence;
* disease-stage context;
* lesion context;
* treatment context;
* multimodal patient measurements;
* modality-specific reliability;
* anatomy;
* device/coil constraints;
* E-field information where permitted;

into:

# a deterministic, explainable Target Slate.

The major architectural change is:

```text
v1

One Target Engine
     +
MDD-specific candidate logic
```

becomes:

```text
v2

Deterministic Target Engine Core
            +
Indication Targeting Plugin
            +
Module-specific Candidate Generators
            +
Versioned Scientific Policy
```

The core remains responsible for scientific governance, determinism, gating, ranking discipline, redundancy, slate assembly, explanation integrity and provenance.

Plugins are responsible only for the **indication-specific scientific transformations** that cannot sensibly be universalised.

The v1 principle that MAGNIOM uses gates before scores remains foundational. A candidate failing a mandatory gate cannot rescue itself through a high value in another feature. 

---

# 2. THE v2 TARGET ENGINE PRINCIPLE

MAGNIOM v2 SHALL NOT implement:

```text
diagnosis
   ↓
large switch statement
   ↓
different hard-coded coordinates
```

It SHALL implement:

```text
CaseIndication
      ↓
IndicationModuleRelease
      ↓
ScientificPolicyRelease
      ↓
approved EvidencePaths
      ↓
qualified patient context
      ↓
registered Candidate Generators
      ↓
candidate hypotheses
      ↓
CORE HARD GATES
      ↓
module-appropriate comparison
      ↓
counterfactual / refinement analysis
      ↓
redundancy + coverage
      ↓
Target Slate
      ↓
specialist decision
```

---

# 3. WHAT REMAINS UNCHANGED FROM v1

The following v1 requirements remain normative.

MAGNIOM SHALL:

* operate deterministically for frozen inputs;
* consume immutable snapshots rather than mutable clinical observations;
* use version-pinned evidence and scientific policy;
* avoid live PubMed/internet input;
* avoid LLM influence on clinical ranking;
* avoid random sampling in Clinical Mode;
* use evidence as a gate/stratum rather than a compensable scalar;
* preserve an evidence-only counterfactual where patient-specific refinement is being evaluated;
* require patient-specific measurement reliability before that measurement can materially influence ranking;
* preserve suppressed candidates;
* permit abstention;
* generate explanations from canonical structured facts;
* never return a treatment protocol prescription.

These are direct continuations of the v1 engine contract.  

---

# 4. WHAT CHANGES IN v2

v2 introduces:

```text
IndicationModuleRelease

Indication Targeting Plugin

Candidate Generator Registry

MeasurementBundle

ReliabilityBundle

DiseaseStageContext

LesionContext

TreatmentContextSnapshot

EvidencePath

TargetGeometry

ComparisonDomain

RankingProfile

RefinementProfile

SlateAssemblyProfile
```

The core algorithm becomes indication-neutral.

---

# 5. ARCHITECTURAL BOUNDARY

The v2 system consists of four scientific layers:

```text
┌────────────────────────────────────────────┐
│  TARGET ENGINE CORE                        │
│  gates · orchestration · ranking · slate   │
├────────────────────────────────────────────┤
│  INDICATION TARGETING PLUGIN               │
│  domain-specific scientific interpretation│
├────────────────────────────────────────────┤
│  CANDIDATE GENERATORS                      │
│  actual target hypothesis construction    │
├────────────────────────────────────────────┤
│  SCIENTIFIC POLICY + EVIDENCE              │
│  what is permitted                         │
└────────────────────────────────────────────┘
```

No lower layer may override the safety authority of a higher governance layer.

---

# 6. CORE VERSUS PLUGIN RESPONSIBILITY

## Target Engine Core owns

* input-integrity verification;
* release compatibility;
* mode enforcement;
* EvidencePath enforcement;
* candidate-schema validation;
* hard gates;
* measurement-capability qualification;
* reliability enforcement;
* accessibility enforcement;
* ranking orchestration;
* comparison-domain enforcement;
* refinement adoption;
* redundancy;
* clinical coverage;
* Target Slate cardinality;
* abstention;
* deterministic tie handling;
* explanation completeness;
* reproducibility manifest.

## Indication Plugin owns

* indication-specific context interpretation;
* indication-specific candidate generators;
* scientific feature extraction not meaningful globally;
* module-specific geometry handling requirements;
* module-specific counterfactual definitions;
* proposed comparison-domain membership.

## Scientific Policy owns

* which plugins/generators are allowed;
* exact parameters;
* gate thresholds;
* evidence permissions;
* role permissions;
* ranking profiles;
* refinement requirements;
* redundancy thresholds;
* slate rules.

---

# 7. PLUGINS DO NOT OWN CLINICAL AUTHORITY

A plugin SHALL NOT be able to declare:

```text
eligible = true
```

as an authoritative final decision.

It may produce:

```text
CandidateDraft
```

and supporting scientific facts.

The Target Engine Core independently evaluates the candidate against:

```text
EvidencePath
ScientificPolicy
IndicationModuleRelease
MeasurementBundle
ReliabilityBundle
anatomical constraints
mode
```

before assigning final candidate eligibility.

---

# 8. STATIC PLUGIN REGISTRATION

Clinical Mode SHALL NOT dynamically download, discover or execute arbitrary targeting plugins.

Clinical plugins SHALL be:

* compiled into the controlled build;
* versioned;
* hashed;
* present in the release manifest;
* whitelisted by Scientific Policy.

No:

```text
npm install latest-stroke-target-plugin
```

at runtime.

---

# 9. TARGET ENGINE REQUEST

The external orchestration contract is:

```ts
interface MagniomTargetEngineRequestV2 {
  case_id: UUID;
  case_indication_id: UUID;

  mode: "clinical" | "research";

  indication_module_release_id: UUID;

  phenotype_snapshot_id: UUID;
  clinical_objective_ids: UUID[];

  disease_stage_context_id?: UUID;
  lesion_context_ids?: UUID[];

  treatment_context_snapshot_id?: UUID;

  measurement_bundle_id: UUID;
  reliability_bundle_id?: UUID;

  evidence_library_release_id: UUID;

  scientific_policy_release_id: UUID;
  target_engine_release_id: UUID;

  device_context_ids?: UUID[];

  requested_at?: ISO8601UTC;
}
```

`requested_at` is operational metadata.

It SHALL NOT alter scientific output.

---

# 10. RESOLVED ENGINE CONTEXT

The scientific core should not query databases itself.

The application/orchestration layer resolves immutable objects before execution:

```ts
interface ResolvedTargetingContext {
  case_id: UUID;
  mode: MagniomMode;

  case_indication: CaseIndication;

  indication_module: IndicationModuleRelease;

  phenotype_snapshot: PhenotypeSnapshot;

  clinical_objectives: ClinicalObjective[];

  disease_stage?: DiseaseStageContext;

  lesion_contexts: LesionContext[];

  treatment_context?: TreatmentContextSnapshot;

  measurement_bundle: MeasurementBundle;

  reliability_bundle?: ReliabilityBundle;

  evidence_paths: EvidencePath[];

  evidence_claims: EvidenceClaimV2[];

  scientific_policy: ScientificPolicyRelease;

  target_engine_release: TargetEngineRelease;

  device_context: DeviceContext[];

  efield_context?: EFieldContext;

  input_manifest: TargetGenerationInputManifest;
}
```

---

# 11. CORE PURITY

Most Target Engine scientific functions SHALL be pure.

A function such as:

```ts
evaluateCandidateEligibility(
  candidate,
  context,
  policy
)
```

SHALL NOT:

* query Supabase;
* access the network;
* inspect wall-clock time;
* call an LLM;
* read environment-specific scientific parameters;
* mutate clinical records.

This directly extends the v1 purity requirement. 

---

# 12. TARGET ENGINE OUTPUT

```ts
interface MagniomTargetEngineOutputV2 {
  generated_candidate_ids: UUID[];

  eligible_candidate_ids: UUID[];

  suppressed_candidate_ids: UUID[];

  target_slate_id?: UUID;

  generator_results: CandidateGeneratorResultSummary[];

  capability_status: CapabilityStatus[];

  refinement_results: RefinementDecision[];

  abstention?: AbstentionProfileV2;

  warnings: EngineWarning[];

  target_engine_release_id: UUID;

  indication_module_release_id: UUID;

  scientific_policy_release_id: UUID;

  evidence_library_release_id: UUID;

  reproducibility_manifest_sha256: SHA256;
}
```

---

# 13. DETERMINISM

For identical canonical inputs, MAGNIOM SHALL produce:

* identical generator invocation set;
* identical generator inputs;
* identical candidate geometries;
* identical features;
* identical gate results;
* identical comparison domains;
* identical refinement decisions;
* identical suppression decisions;
* identical slate ordering;
* identical explanation facts;
* identical abstention;
* identical output hash.

Parallel execution MAY be used.

Completion order SHALL NOT influence results.

---

# 14. PROHIBITED DYNAMIC INPUTS

Clinical target generation SHALL NOT depend on:

```text
current internet state
current PubMed state
current date/time
LLM answer
UI state
browser state
current "latest" evidence
random number
user-editable ranking slider
organisation-local hidden weighting
```

All scientific inputs are explicit and frozen.

---

# 15. TARGET ENGINE v2 PIPELINE

Canonical execution sequence:

```text
VERIFY INPUT MANIFEST
        ↓
RESOLVE EXACT INDICATION PLUGIN
        ↓
VERIFY MODULE / POLICY / ENGINE COMPATIBILITY
        ↓
VERIFY MODE
        ↓
LOAD POLICY-PERMITTED EVIDENCE PATHS
        ↓
VALIDATE OBJECTIVES / POPULATION / STAGE / CONTEXT
        ↓
QUALIFY MEASUREMENT CAPABILITIES
        ↓
QUALIFY RELIABILITY CAPABILITIES
        ↓
INVOKE PERMITTED CANDIDATE GENERATORS
        ↓
VALIDATE CANDIDATE DRAFTS
        ↓
ATTACH EVIDENCE + PATIENT-SPECIFIC FEATURES
        ↓
APPLY HARD GATES
        ↓
CREATE COMPARISON DOMAINS
        ↓
CALCULATE DOMAIN-SPECIFIC RANKING FEATURES
        ↓
APPLY REFINEMENT / COUNTERFACTUAL TESTS
        ↓
SUPPRESS REDUNDANCY
        ↓
ASSESS CLINICAL OBJECTIVE COVERAGE
        ↓
ASSEMBLE MINIMAL USEFUL TARGET SLATE
        ↓
GENERATE STRUCTURED EXPLANATIONS
        ↓
VERIFY OUTPUT MANIFEST
        ↓
RETURN IMMUTABLE RESULT
```

The v1 engine used essentially the same discipline for MDD, including evidence-only candidate generation before connectome refinement and explicit counterfactual comparison. 

---

# 16. HARD-GATE ARCHITECTURE v2

v2 expands the v1 five-gate model into a more general set.

```text
G0  Input & Manifest Integrity
G1  Mode & Module Authority
G2  Evidence Path Eligibility
G3  Clinical Context Applicability
G4  Measurement Capability
G5  Reliability Qualification
G6  Anatomy / Lesion / Accessibility
G7  Geometry / Device Compatibility
G8  Treatment Context
G9  Generator-Specific Scientific Constraints
```

Not every gate applies to every candidate.

---

# 17. GATE RESULT

```ts
interface GateEvaluation {
  gate_code: string;

  applicability:
    | "applicable"
    | "not_applicable";

  result:
    | "pass"
    | "fail"
    | "conditional";

  reason_codes: string[];

  policy_rule_ids: UUID[];

  evidence_path_ids?: UUID[];

  interpretation: string;
}
```

Conditional status does not automatically mean eligibility.

Scientific Policy defines what a conditional gate permits.

---

# 18. G0 — INPUT INTEGRITY

The engine SHALL verify:

* all required objects exist;
* object hashes match;
* IDs agree with the Case;
* CaseIndication matches module;
* MeasurementBundle matches CaseIndication;
* ReliabilityBundle matches MeasurementBundle;
* evidence release matches input manifest;
* exact engine and plugin versions are available.

Failure:

```text
SCIENTIFIC_INPUT_INTEGRITY_FAILURE
```

Result:

# no Target Slate.

---

# 19. G1 — MODE AND MODULE AUTHORITY

Clinical candidate generation requires:

```text
IndicationModuleRelease
permits clinical
```

AND:

```text
ScientificPolicyRelease
permits this module in clinical mode
```

AND:

```text
TargetEngineRelease
contains compatible plugin.
```

For a Research-only tinnitus module:

```text
mode = clinical
```

must fail before candidate ranking.

---

# 20. G2 — EVIDENCE PATH ELIGIBILITY

v2 SHALL rank from:

# authorised `EvidencePath` objects,

not directly from papers and not merely from TargetFamily presence.

For Clinical Mode:

```text
EvidencePath.path_status
=
clinical_permitted
```

must hold.

For Validation Mode implemented through Research infrastructure:

```text
validation_permitted
```

may be used according to policy.

Research may traverse:

```text
research_permitted
validation_permitted
clinical_permitted
```

as explicitly configured.

The v1 graph already required a complete evidence path before a target could enter Clinical Mode. 

---

# 21. UNASSIGNED EVIDENCE CLASSIFICATION

A v2 staging claim may have:

```text
Governance Tier = unassigned
```

This is valid scientific-library content.

It SHALL NOT enter unrestricted Clinical Mode.

Research/validation ranking may use it only where:

```text
EvidencePath.path_status
```

and Scientific Policy explicitly permit.

The Target Engine SHALL NOT assign the missing Tier itself.

---

# 22. EVIDENCE REMAINS NON-COMPENSABLE

Evidence does not become:

```text
A = 1.0
B = 0.8
C = 0.6
```

inside a universal target score.

Evidence determines:

* whether the candidate may exist in the mode;
* its permitted candidate role;
* its evidence stratum;
* which targeting method is permitted;
* which population/stage/context it applies to.

This directly preserves the v1 algorithm rule. 

---

# 23. G3 — CLINICAL CONTEXT APPLICABILITY

The engine evaluates applicable:

* indication;
* population;
* clinical objective;
* disease stage;
* phenotype subtype;
* body region;
* laterality;
* other evidence-defined contextual constraints.

Example:

```text
Evidence Path:
chronic non-fluent post-stroke aphasia

Patient:
acute fluent aphasia
```

Result:

```text
G3 = FAIL
```

unless another appropriate EvidencePath exists.

---

# 24. G4 — MEASUREMENT CAPABILITY

Candidate generators declare required capabilities.

Example:

```text
generator:
PainMotorMapRefinementGenerator

requires:
motor_mapping
```

The engine queries the frozen `MeasurementBundle`.

It SHALL NOT infer:

```text
motor mapping missing
→ normal motor map.
```

---

# 25. CAPABILITY STATUS

```ts
interface CapabilityStatus {
  capability_code: string;

  status:
    | "qualified"
    | "qualified_with_limits"
    | "unavailable"
    | "failed"
    | "not_required";

  measurement_ids: UUID[];

  reliability_ids: UUID[];

  interpretation: string;
}
```

---

# 26. G5 — RELIABILITY

Patient-specific measurement may materially influence Clinical Mode only where:

```text
ReliabilityBundle
qualifies the relevant capability.
```

Examples:

```text
individual_fc_refinement
motor_hotspot_targeting
lesion_network_targeting
structural_connectivity_refinement
efield_optimisation
```

A general:

```text
patient data quality = good
```

is insufficient.

---

# 27. RELIABILITY FAILURE DOES NOT NECESSARILY END THE RUN

Example:

```text
rs-fMRI refinement = not qualified
```

may yield:

```text
MDD evidence baseline = still eligible
```

Likewise:

```text
motor map failed
```

may permit an anatomical evidence baseline if the relevant Pain Module and Scientific Policy allow it.

Fallback is explicit.

Never guessed.

---

# 28. G6 — ANATOMY / LESION / ACCESSIBILITY

The engine evaluates:

* target tissue existence;
* cortical accessibility;
* registration validity;
* lesion relationship;
* structural distortion;
* required cortical coverage;
* scalp/cortex/device interaction where relevant.

For lesion-dependent modules, a target may be:

```text
outside_lesion
adjacent
partially_involved
substantially_involved
destroyed_or_absent
not_assessable
```

Policy determines candidate consequences.

---

# 29. DESTROYED TARGET REGION

If:

```text
target_relationship = destroyed_or_absent
```

MAGNIOM SHALL NOT:

```text
move coordinate 20 mm
until intact cortex is found.
```

unless an explicitly validated generator defines such a scientific transformation.

Default:

```text
candidate = ineligible
```

with structured explanation.

---

# 30. G7 — GEOMETRY AND DEVICE COMPATIBILITY

The engine verifies that the generator's output geometry is permitted by:

* TargetFamily;
* IndicationModuleRelease;
* Scientific Policy;
* configured device/coil.

Examples:

```text
point
surface_roi
volumetric_roi
somatotopic
coil_field
network
```

An OCD deep-field evidence path cannot silently become a focal point target.

---

# 31. G8 — TREATMENT CONTEXT

Where an EvidencePath requires:

```text
speech-language therapy
symptom provocation
rehabilitation
specific coil class
```

the TreatmentContextSnapshot is evaluated.

Possible outcomes:

```text
full_match
partial_match
mismatch
unknown
not_applicable
```

Scientific Policy determines whether partial/unknown context:

* blocks;
* downgrades applicability;
* allows candidate with limitation;
* restricts to Research Mode.

---

# 32. G9 — GENERATOR-SPECIFIC CONSTRAINTS

Candidate generators MAY define additional scientifically necessary constraints.

Examples:

* affected body region must resolve to known somatotopic representation;
* lesion laterality required;
* valid language-region search space required;
* field-target generator requires compatible coil geometry.

These constraints SHALL be declared in the generator manifest.

No hidden `if` conditions.

---

# 33. INDICATION PLUGIN CONTRACT

```ts
interface IndicationTargetingPlugin {
  manifest: IndicationTargetingPluginManifest;

  generators(): CandidateGenerator[];

  featureProviders(): CandidateFeatureProvider[];

  comparisonProfiles(): ComparisonDomainDefinition[];

  refinementProfiles(): RefinementProfileDefinition[];

  slateProfile(): SlateAssemblyProfileDefinition;

  validateModuleContext(
    context: ResolvedTargetingContext
  ): ModuleContextValidation;
}
```

---

# 34. PLUGIN MANIFEST

```ts
interface IndicationTargetingPluginManifest {
  id: UUID;

  code: string;
  semantic_version: string;

  indication_module_release_ids: UUID[];

  permitted_modes: MagniomMode[];

  generator_descriptors: CandidateGeneratorDescriptor[];

  feature_provider_versions: string[];

  comparison_profile_ids: UUID[];

  refinement_profile_ids: UUID[];

  slate_profile_id: UUID;

  required_domain_schema_version: string;
  required_policy_schema_version: string;

  code_commit: string;
  package_digest_sha256: SHA256;

  scientific_configuration_sha256: SHA256;
}
```

---

# 35. CANDIDATE GENERATOR CONTRACT

```ts
interface CandidateGenerator {
  descriptor: CandidateGeneratorDescriptor;

  generate(
    context: CandidateGenerationContext
  ): CandidateGeneratorResult;
}
```

---

# 36. GENERATOR DESCRIPTOR

```ts
interface CandidateGeneratorDescriptor {
  id: UUID;

  code: string;
  semantic_version: string;

  indication_module_release_ids: UUID[];

  candidate_roles: CandidateRole[];

  target_family_scope_ids: UUID[];

  evidence_path_status_scope: (
    | "clinical_permitted"
    | "validation_permitted"
    | "research_permitted"
  )[];

  permitted_modes: MagniomMode[];

  required_capabilities: string[];
  optional_capabilities: string[];

  permitted_geometry_types: TargetGeometryType[];

  baseline_relationship:
    | "none"
    | "creates_baseline"
    | "refines_baseline"
    | "alternative_to_baseline";

  deterministic: true;

  generator_failure_policy:
    | "required_fail_run"
    | "omit_generator_with_warning"
    | "research_optional";

  configuration_sha256: SHA256;
}
```

---

# 37. CANDIDATE GENERATION CONTEXT

The generator receives only its authorised scientific subset:

```ts
interface CandidateGenerationContext {
  case_id: UUID;

  case_indication: CaseIndication;

  module: IndicationModuleRelease;

  mode: MagniomMode;

  phenotype_snapshot: PhenotypeSnapshot;

  clinical_objectives: ClinicalObjective[];

  disease_stage?: DiseaseStageContext;

  lesion_contexts: LesionContext[];

  treatment_context?: TreatmentContextSnapshot;

  measurement_bundle: MeasurementBundle;

  reliability_bundle?: ReliabilityBundle;

  permitted_evidence_paths: EvidencePath[];

  permitted_target_families: TargetFamilyV2[];

  scientific_policy: ScientificPolicyRelease;

  device_context: DeviceContext[];

  relevant_measurements: MeasurementRef[];
}
```

---

# 38. GENERATOR OUTPUT

```ts
interface CandidateGeneratorResult {
  generator_id: UUID;
  generator_version: string;

  status:
    | "generated"
    | "no_candidate"
    | "abstained"
    | "failed";

  candidates: CandidateDraft[];

  abstention?: GeneratorAbstention;

  diagnostics: GeneratorDiagnostic[];
}
```

---

# 39. CANDIDATE DRAFT

A generator SHALL return:

```ts
interface CandidateDraft {
  draft_id: UUID;

  generator_id: UUID;

  target_family_id: UUID;

  proposed_role: CandidateRole;

  target_geometry: TargetGeometry;

  evidence_path_ids: UUID[];

  clinical_objective_ids: UUID[];

  relied_on_measurement_ids: UUID[];

  relied_on_reliability_ids: UUID[];

  lineage?: CandidateLineage;

  raw_scientific_features: ScientificFeatureValue[];

  generator_limitations: string[];

  generator_trace: GeneratorTrace;
}
```

A generator SHALL NOT return final:

```text
rank = 1
clinical_eligible = true
response_probability = 0.81
```

---

# 40. CANDIDATE LINEAGE

```ts
interface CandidateLineage {
  lineage_type:
    | "evidence_baseline"
    | "measurement_refinement"
    | "anatomy_constrained_variant"
    | "efield_pose_variant"
    | "clinical_alternative"
    | "research_hypothesis";

  parent_candidate_draft_id?: UUID;

  baseline_candidate_draft_id?: UUID;

  refinement_kind?:
    | "functional_connectivity"
    | "motor_mapping"
    | "structural_connectivity"
    | "lesion_aware"
    | "efield"
    | "other";
}
```

This generalises the v1 evidence-baseline-versus-personalised relationship.

---

# 41. WHY LINEAGE MATTERS

MAGNIOM must distinguish:

```text
new independent therapeutic hypothesis
```

from:

```text
patient-specific refinement
of an already evidence-supported hypothesis.
```

Those have different evidence implications.

A 12 mm patient-specific shift within an approved family is not automatically a new TargetFamily.

Nor is a new network target automatically a refinement.

---

# 42. MODULE-SPECIFIC GENERATORS

v2 initially defines generator families for:

```text
MDD
OCD
Neuropathic Pain
Stroke Motor
Stroke Aphasia
TBI
PTSD
Tinnitus
```

Not every generator is Clinical Mode eligible.

Compilation into MAGNIOM does not confer clinical authority.

---

# 43. MDD PLUGIN

Canonical code:

```text
MAGNIOM-PLUGIN-MDD
```

The v2 MDD plugin SHALL preserve validated v1 behaviour through a compatibility profile before any scientific redesign.

Initial generator set:

```text
MddEvidenceAnchorGenerator

MddConnectomeRefinementGenerator

MddPhenotypeCircuitGenerator

MddClinicalAlternativeGenerator

MddResearchNetworkGenerator
```

---

# 44. MDD EVIDENCE ANCHOR GENERATOR

`MddEvidenceAnchorGenerator` creates the evidence-only candidate against which patient-specific refinement may be compared.

Inputs:

* approved MDD indication;
* clinical objectives;
* permitted MDD EvidencePath;
* TargetFamily baseline definition;
* structural anatomy;
* device capability.

It does not require rs-fMRI.

Output:

```text
candidate_role = evidence_anchor
```

---

# 45. MDD CONNECTOME REFINEMENT GENERATOR

Requires:

```text
individual_fc_refinement = qualified
```

It may search only inside:

```text
EvidencePath-permitted TargetFamily search space.
```

It SHALL NOT:

```text
search whole brain
for strongest abnormality.
```

The personalised candidate remains paired with its evidence baseline.

---

# 46. MDD PHENOTYPE CIRCUIT GENERATOR

This generator creates phenotype-specific alternatives only where:

* clinician-approved objective maps to an approved circuit;
* EvidencePath permits the target;
* Scientific Policy permits the role.

It SHALL NOT convert arbitrary questionnaire scores directly into target coordinates.

---

# 47. MDD REGRESSION REQUIREMENT

Before v2 MDD release:

all applicable v1 golden cases SHALL reproduce the approved v1 result under the v1 compatibility profile.

A difference is a:

# scientific change,

not merely a software upgrade.

---

# 48. OCD PLUGIN

Canonical code:

```text
MAGNIOM-PLUGIN-OCD
```

Candidate generators may include:

```text
OcdMpfcAccFieldGenerator

OcdPreSmaSmaGenerator

OcdDlpfcGenerator

OcdResearchAlternativeGenerator
```

Availability depends on EvidencePath and Scientific Policy.

---

# 49. OCD mPFC/ACC FIELD GENERATOR

This generator SHALL output:

```text
geometry_type = coil_field
```

where the evidence path is device/field based.

It SHALL preserve:

* coil class;
* intended field region;
* placement definition;
* device compatibility;
* target-field provenance.

It SHALL NOT fabricate a focal MNI coordinate as the scientific target.

---

# 50. OCD FIELD CANDIDATE RANKING

Within one validated field-target comparison domain, candidate variants MAY be compared on:

* evidence applicability;
* field coverage;
* treatment-context compatibility;
* anatomical/device feasibility;
* pose robustness.

They SHALL NOT be globally compared with a focal pre-SMA candidate merely by one numeric score unless a future validated comparison profile explicitly permits this.

---

# 51. OCD PRE-SMA/SMA GENERATOR

This generator may produce point or surface-ROI geometry according to the evidence path.

It SHALL bind:

```text
target family
+
targeting strategy
+
geometry
+
protocol precedent
```

without returning a protocol prescription.

---

# 52. NEUROPATHIC PAIN PLUGIN

Canonical code:

```text
MAGNIOM-PLUGIN-PAIN-NP
```

Initial generators:

```text
PainM1SomatotopicBaselineGenerator

PainMotorMapRefinementGenerator

PainResearchNetworkGenerator
```

---

# 53. PAIN SOMATOTOPIC BASELINE GENERATOR

Inputs include:

* painful body region;
* affected body side;
* evidence-permitted M1 TargetFamily;
* patient anatomy.

Output:

```text
candidate_role = somatotopic_target

geometry_type = somatotopic
```

The generator SHALL preserve the relation:

```text
clinical body region
       ↓
contralateral cortical representation
```

---

# 54. PAIN LATERALITY RULE

For unilateral pain:

the evidence-defined hemispheric relationship may be deterministic.

For bilateral or ambiguous pain:

the generator SHALL NOT arbitrarily choose a hemisphere.

Permitted outcomes may include:

* multiple scientifically distinct candidates;
* conditional candidate;
* abstention;
* specialist review requirement.

Scientific Policy determines the approved behaviour.

---

# 55. PAIN MOTOR-MAP REFINEMENT

Where qualified motor mapping exists:

```text
PainMotorMapRefinementGenerator
```

may refine the somatotopic baseline.

Required:

```text
motor_hotspot_targeting = qualified
```

The refined candidate remains linked to:

```text
baseline_candidate_draft_id
```

and its incremental value is explicitly tested.

---

# 56. STROKE MOTOR PLUGIN

Canonical code:

```text
MAGNIOM-PLUGIN-STROKE-MOTOR
```

Initial generators:

```text
StrokeContralesionalM1Generator

StrokeIpsilesionalM1Generator

StrokeBilateralStrategyGenerator

StrokeMotorMapRefinementGenerator

StrokeCompensatoryPremotorResearchGenerator
```

Each is enabled only by appropriate EvidencePath.

---

# 57. STROKE CONTRALESIONAL GENERATOR

Inputs require:

* lesion laterality;
* disease stage;
* motor objective;
* target-family evidence;
* structural anatomy.

The generator identifies the evidence-defined contralesional M1 hypothesis.

It SHALL NOT encode:

```text
contralesional hemisphere = pathological
```

as a universal fact.

The scientific explanation SHALL preserve the relevant mechanistic uncertainty.

---

# 58. STROKE IPSILESIONAL GENERATOR

This generator produces the evidence-defined ipsilesional M1 hypothesis where permitted.

It must evaluate:

* lesion relationship;
* tissue integrity;
* target-region availability;
* stage applicability.

If the relevant cortex is substantially destroyed:

the candidate SHALL not be casually moved outside the evidence-defined family.

---

# 59. STROKE BILATERAL STRATEGY

A bilateral evidence strategy may justify multiple target hypotheses.

The Target Engine SHALL NOT convert this into:

# an autonomous bilateral treatment protocol.

The engine remains a target-decision system.

Protocol sequencing and stimulation direction remain outside v2 target authority.

---

# 60. STROKE MOTOR-MAP REFINEMENT

Qualified motor mapping may refine an evidence-defined M1 candidate.

Relevant features may include:

* hotspot concordance;
* body-region concordance;
* map reliability;
* target-to-hotspot distance;
* lesion relationship;
* accessibility.

No universal MDD connectivity metric is reused.

---

# 61. STROKE COMPENSATORY RESEARCH GENERATOR

Where an approved Research EvidencePath exists, MAGNIOM may expose alternative compensatory motor-system hypotheses such as premotor involvement.

These SHALL remain:

```text
generation_status = research_only
```

unless independently promoted.

---

# 62. POST-STROKE APHASIA PLUGIN

Canonical code:

```text
MAGNIOM-PLUGIN-STROKE-APHASIA
```

Initial generators:

```text
AphasiaRightIfgGenerator

AphasiaIpsilesionalLanguageGenerator

AphasiaBilateralResearchGenerator
```

---

# 63. APHASIA RIGHT-IFG GENERATOR

This generator requires:

* appropriate aphasia phenotype;
* disease stage;
* lesion context;
* applicable EvidencePath.

Where the evidence path is limited to:

```text
chronic non-fluent aphasia
```

the generator SHALL NOT automatically operate for:

```text
acute fluent aphasia.
```

---

# 64. APHASIA TREATMENT CONTEXT

Where the EvidencePath relies on:

```text
speech-language therapy
```

the generator's candidate cannot be interpreted without the corresponding TreatmentContext evaluation.

A context mismatch may:

* block;
* downgrade applicability;
* restrict to Research/Validation;
* show a material limitation;

according to Scientific Policy.

---

# 65. APHASIA IPSILESIONAL GENERATOR

This generator may use:

* residual intact language anatomy;
* lesion constraints;
* task-fMRI or network measurement where separately qualified;
* evidence-defined search spaces.

It SHALL NOT infer:

```text
remaining left-hemisphere activity
= therapeutic target
```

without a supporting EvidencePath.

---

# 66. TBI PLUGIN

Canonical code:

```text
MAGNIOM-PLUGIN-TBI
```

TBI requires especially conservative architecture because the v2 Evidence Library intentionally permits claims to exist before target specificity has been established.

Therefore initial generators should include:

```text
TbiEvidenceBoundTargetGenerator

TbiResearchNetworkGenerator
```

rather than:

```text
TbiUniversalDlpfcGenerator.
```

---

# 67. TBI EVIDENCE-BOUND GENERATOR

This generator may create a candidate only when an EvidencePath explicitly binds:

```text
TBI objective
→ TargetFamily
→ TargetingStrategy
```

If current evidence says:

```text
rTMS may improve cognition
```

but does not provide an approved target-specific path:

result:

```text
no_candidate
```

not:

```text
use DLPFC because cognition is prefrontal.
```

---

# 68. TBI RESEARCH NETWORK GENERATOR

Research Mode may evaluate:

* frontoparietal hypotheses;
* lesion-network hypotheses;
* structural-connectivity hypotheses;

only through explicit Research EvidencePaths.

Every candidate SHALL state:

```text
RESEARCH HYPOTHESIS
```

and retain lesion/skull context.

---

# 69. TBI STRUCTURAL SAFETY

Candidate generation may require evaluation of:

* encephalomalacia;
* skull defect;
* cranioplasty;
* surgical changes;
* structural distortion;
* field-model relevance.

Generator logic SHALL NOT replace TMS safety assessment.

It may only qualify target-generation feasibility.

---

# 70. PTSD PLUGIN

Canonical code:

```text
MAGNIOM-PLUGIN-PTSD
```

Potential generators:

```text
PtsdRightDlpfcGenerator

PtsdLeftDlpfcGenerator

PtsdDmPfcResearchGenerator
```

Their availability remains EvidencePath- and policy-dependent.

---

# 71. PTSD POPULATION APPLICABILITY

The plugin SHALL preserve population-specific applicability.

Example:

a general PTSD EvidencePath may have:

```text
clinical_applicability = partial
```

for a combat-related population where important conflicting sham-controlled evidence exists.

The engine SHALL not erase this by high anatomical or connectomic fit.

---

# 72. PTSD DLPFC IS NOT MDD DLPFC

Even where anatomical regions overlap:

```text
TF-PTSD-RDLPFC
```

is not:

```text
TF-MDD-DLPFC.
```

Separate:

* EvidencePath;
* clinical objective;
* role;
* ranking features;
* explanation.

Cross-indication anatomical overlap does not imply scientific inheritance.

---

# 73. TINNITUS PLUGIN

Canonical code:

```text
MAGNIOM-PLUGIN-TINNITUS
```

Initial state:

# Research only.

Possible research generators:

```text
TinnitusTemporalAuditoryResearchGenerator

TinnitusTemporoparietalResearchGenerator

TinnitusNetworkResearchGenerator
```

---

# 74. TINNITUS CLINICAL GATE

A Clinical Mode request SHALL fail unless a future:

```text
IndicationModuleRelease
+
EvidencePath
+
ScientificPolicyRelease
```

explicitly permits tinnitus Clinical Mode.

Presence of generators in the codebase is irrelevant.

---

# 75. TINNITUS EVIDENCE-CONFLICT PRESENTATION

A tinnitus research candidate SHALL carry material:

* supporting claims;
* negative claims;
* conflicting syntheses;
* durability uncertainty.

The ranking engine SHALL NOT suppress negative evidence because a candidate has an attractive network fit.

---

# 76. TINNITUS NETWORK GENERATOR

A network abnormality may be used only to refine or formulate:

```text
research_hypothesis
```

where permitted.

No:

```text
most abnormal auditory node
→ target
```

shortcut is allowed.

---

# 77. CANDIDATE FEATURE ARCHITECTURE

v1 used the dimensions:

```text
P = phenotype concordance
C = circuit concordance
R = reliability
A = accessibility
F = E-field
```

and a policy-weighted geometric mean for compatible candidates. 

v2 retains that model where appropriate but SHALL NOT force those dimensions onto every indication.

---

# 78. SCIENTIFIC FEATURE VALUE

```ts
interface ScientificFeatureValue {
  feature_code: string;

  raw_value?: number;
  raw_unit?: string;

  ordinal_value?: string;

  normalized_value?: number;

  interpretation: string;

  source_object_ids: UUID[];

  method_code: string;
  method_version: string;

  policy_parameter_refs: UUID[];
}
```

---

# 79. FEATURE PROVIDER

```ts
interface CandidateFeatureProvider {
  id: UUID;

  code: string;
  version: string;

  supported_feature_codes: string[];

  calculate(
    candidate: CandidateDraft,
    context: ResolvedTargetingContext
  ): ScientificFeatureValue[];
}
```

Feature providers SHALL be deterministic and versioned.

---

# 80. MODULE-SPECIFIC FEATURES

Examples:

### MDD

```text
phenotype_concordance
therapeutic_circuit_concordance
FC reliability
accessibility
E-field
```

### Neuropathic pain

```text
body_region_concordance
motor_map_concordance
motor_map_reliability
accessibility
```

### Stroke motor

```text
stage_applicability
lesion_compatibility
motor_map_concordance
MEP/corticospinal context where validated
reliability
accessibility
```

### OCD

```text
target-family applicability
field coverage
pose robustness
device compatibility
treatment-context match
```

No single feature list is universal.

---

# 81. GATES VERSUS FEATURES

Some scientific facts SHOULD usually be hard gates rather than soft scores.

Examples:

```text
wrong indication
wrong disease stage
Research-only evidence
destroyed target cortex
incompatible device
failed reliability
mandatory treatment context absent
```

A high utility score cannot compensate for these.

---

# 82. COMPARISON DOMAIN

v2 introduces:

```ts
interface ComparisonDomain {
  id: UUID;

  code: string;

  indication_module_release_id: UUID;

  candidate_ids: UUID[];

  comparison_basis:
    | "same_target_family_variants"
    | "same_candidate_role"
    | "same_target_strategy"
    | "scientifically_validated_cross_family";

  ranking_profile_id: UUID;

  comparable: boolean;

  reason_if_not_comparable?: string;
}
```

---

# 83. WHY COMPARISON DOMAINS ARE REQUIRED

It is scientifically invalid to assume:

```text
M1 pain utility 0.82
>
OCD field-target utility 0.77
```

means anything.

Even within one indication:

```text
OCD mPFC field target
```

and:

```text
OCD pre-SMA focal target
```

may not admit a meaningful common scalar.

The core therefore ranks:

# only inside validated comparison domains.

---

# 84. NO GLOBAL TARGET SCORE

v2 SHALL NOT produce:

```text
global_candidate_score
```

across scientifically incompatible roles or geometries.

Target Slate assembly uses:

```text
evidence/role eligibility
+
within-domain ordering
+
clinical-objective coverage
+
redundancy/diversity
```

rather than one universal leaderboard.

---

# 85. RANKING PROFILE

```ts
interface RankingProfile {
  id: UUID;

  code: string;
  version: string;

  indication_module_release_id: UUID;

  applicable_comparison_domain_codes: string[];

  ranking_model:
    | "lexicographic"
    | "weighted_geometric_mean"
    | "ordered_rules";

  evidence_stratification_rule_id: UUID;

  feature_definitions: RankingFeatureDefinition[];

  tie_policy: TiePolicy;

  scientific_policy_release_id: UUID;
}
```

---

# 86. WEIGHTED GEOMETRIC MEAN

Where a module validates the v1-style model:

$$
U(c)=
\exp\left[
\frac{\sum_jw_j\ln(\max(s_j,\epsilon))}
{\sum_jw_j}
\right]
$$

may continue to be used.

However:

* included feature set is module-specific;
* weights are module/policy-specific;
* only scientifically comparable candidates are scored together;
* hard gates remain prior;
* evidence remains outside the compensable score.

---

# 87. LEXICOGRAPHIC RANKING

Some modules may be better represented by deterministic ordered rules.

Example:

```text
1. valid EvidencePath stratum
2. disease-stage applicability
3. anatomy intact
4. measurement reliability
5. somatotopic concordance
6. accessibility
```

This may be safer than manufacturing a weighted utility.

Scientific Policy chooses the model.

---

# 88. EVIDENCE STRATA

For Clinical Mode, an assigned governance classification may define an evidence ordering stratum.

For Research/Validation Mode, Scientific Policy may define ordering based on:

* path status;
* claim maturity;
* research role.

The Target Engine SHALL NOT infer:

```text
unassigned tier = low numeric tier.
```

---

# 89. MISSING FEATURE POLICY

If a feature is not scientifically applicable:

```text
not_applicable
```

is the correct state.

Do not assign:

```text
0
```

unless zero is scientifically defined.

The v1 engine already prohibited penalising an evidence-only candidate simply because it lacks an individual-connectivity feature. 

---

# 90. PATIENT-SPECIFIC REFINEMENT v2

v1's personalisation rule becomes a general:

# refinement adoption framework.

Possible refinement types:

```text
functional_connectivity
motor_mapping
structural_connectivity
lesion_aware
efield_pose
other
```

A patient-specific measurement does not automatically displace its evidence baseline.

---

# 91. REFINEMENT PROFILE

```ts
interface RefinementProfileDefinition {
  id: UUID;

  code: string;

  refinement_kind: string;

  baseline_role: CandidateRole;

  refined_role: CandidateRole;

  required_capabilities: string[];

  adoption_rules: RefinementAdoptionRule[];

  displacement_metric: GeometryDistanceMetric;

  scientific_policy_release_id: UUID;
}
```

---

# 92. REFINEMENT ADOPTION TEST

Generic structure:

```text
Baseline B
Refined candidate P
```

P may become preferred only if all relevant conditions pass.

Canonical conditions include:

1. same authorised evidence relationship;
2. permitted refinement method;
3. required measurement available;
4. required reliability qualified;
5. meaningful incremental value;
6. no material loss of accessibility;
7. no unacceptable evidence-transfer distance/geometry change;
8. no lesion/anatomical invalidation;
9. no material treatment-context mismatch.

---

# 93. INCREMENTAL VALUE

Incremental value SHALL be module-specific.

Examples:

### MDD

```text
Δ therapeutic-circuit concordance
```

### Pain

```text
improved motor-map/body-region concordance
```

### Stroke

```text
improved patient-specific motor localisation
while preserving evidence-defined strategy
```

### OCD field targeting

```text
better validated field coverage / pose robustness
```

A generic:

```text
personalisation improvement score
```

is prohibited.

---

# 94. REFINEMENT DOES NOT HAVE TO WIN

Possible outcomes:

```ts
type RefinementDecisionStatus =
  | "adopted"
  | "baseline_retained"
  | "equivalent"
  | "not_qualified"
  | "not_available"
  | "not_applicable";
```

The refined candidate may remain visible as an alternative where scientifically useful.

---

# 95. COUNTERFACTUAL GENERALISATION

The v1 evidence-only counterfactual remains mandatory where a patient-specific refinement is being evaluated.

v2 broadens the meaning.

Examples:

```text
MDD:
evidence baseline
vs
FC-refined target

Pain:
anatomical somatotopic baseline
vs
motor-map-refined target

Stroke:
evidence-defined M1 target
vs
qualified patient-specific motor-map refinement

OCD:
evidence-defined field placement
vs
E-field-optimised pose
```

---

# 96. COUNTERFACTUAL OBJECT

```ts
interface RefinementDecision {
  baseline_candidate_id: UUID;
  refined_candidate_id: UUID;

  refinement_kind: string;

  geometry_difference: GeometryDifference;

  feature_differences: FeatureDifference[];

  adoption_conditions: GateEvaluation[];

  status: RefinementDecisionStatus;

  interpretation: string;
}
```

---

# 97. GEOMETRY-AWARE DIFFERENCE

Do not assume Euclidean point distance is always meaningful.

Possible metrics:

```text
point-to-point Euclidean
surface geodesic
ROI overlap
surface overlap
Hausdorff distance
body-region concordance
coil-field overlap
ROI field coverage
network-region overlap
```

Scientific Policy selects appropriate metrics.

---

# 98. REDUNDANCY v2

The engine suppresses scientifically redundant candidates.

Redundancy is:

# geometry- and role-aware.

It is not just:

```text
distance < X mm.
```

---

# 99. REDUNDANCY COMPARATOR

```ts
interface RedundancyAssessment {
  candidate_a_id: UUID;
  candidate_b_id: UUID;

  comparability:
    | "comparable"
    | "partially_comparable"
    | "not_comparable";

  spatial_relationship?: GeometryDifference;

  target_family_overlap: boolean;

  objective_overlap: boolean;

  evidence_path_overlap: boolean;

  field_overlap?: number;

  redundancy:
    | "redundant"
    | "partially_redundant"
    | "distinct";

  policy_rule_id: UUID;

  explanation: string;
}
```

---

# 100. SOMATOTOPIC REDUNDANCY

Two M1 candidates separated by only a small spatial distance may still be scientifically distinct if they represent different:

```text
body regions.
```

Conversely, two slightly separated M1 candidates serving the same body-region/objective may be redundant.

The geometry alone does not decide.

---

# 101. COIL-FIELD REDUNDANCY

For field targets, redundancy may depend more on:

```text
E-field overlap
+
therapeutic ROI coverage
```

than coil-centre distance.

---

# 102. NETWORK-TARGET REDUNDANCY

Research network candidates may require:

* overlapping accessible nodes;
* same circuit;
* same clinical objective;
* same EvidencePath;

before being considered redundant.

No arbitrary point-distance rule is appropriate.

---

# 103. CONVERGENCE

Convergence remains:

# a reported scientific property,

not automatically a reason to generate more targets.

v1 correctly treated multiple evidence paths as convergence rather than separate target slots. 

---

# 104. CONVERGENCE PROFILE v2

```ts
interface CandidateConvergenceProfileV2 {
  source_domains: string[];

  relationships: {
    source_a: string;
    source_b: string;

    relationship:
      | "high"
      | "moderate"
      | "low"
      | "not_assessable";

    spatial_metric?: GeometryDifference;

    interpretation: string;
  }[];

  overall:
    | "high"
    | "moderate"
    | "low"
    | "not_assessable";

  interpretation: string;
}
```

---

# 105. LOW CONVERGENCE

Low convergence SHALL NOT automatically cause abstention.

A valid slate may deliberately show:

```text
strong evidence baseline
+
credible but divergent patient-specific hypothesis
+
explicit uncertainty.
```

Only defined hard gates cause mandatory abstention.

This preserves the v1 rule. 

---

# 106. E-FIELD INTEGRATION

The v1 completeness principle remains:

within a comparison domain:

```text
all candidates receive the comparative E-field feature
```

or:

```text
E-field is omitted from comparative ranking.
```

Missing E-field information SHALL NOT accidentally penalise only one candidate. 

---

# 107. E-FIELD ROLES

Scientific Policy may assign E-field one of:

```text
disabled
display_only
pose_optimisation_only
accessibility_component
ranking_component
```

Role may differ by indication module.

For v2, E-field should generally remain more readily permitted for:

* accessibility;
* field coverage;
* pose optimisation;

than as an assumed efficacy surrogate.

---

# 108. NORMATIVE MODEL ROLE

Normative abnormalities SHALL NOT independently generate a Clinical candidate unless a future validated module/policy explicitly permits that role.

Normative context may:

* annotate;
* contextualise;
* contribute a supporting feature;
* support Research candidate generation;

according to policy.

---

# 109. STRUCTURAL CONNECTIVITY

Structural connectivity may be:

```text
display/context
refinement
candidate-generation input
```

only as authorised per module.

A structural-connectivity model validated in MDD does not become a stroke or TBI model automatically.

---

# 110. SLATE ASSEMBLY

After ranking within valid comparison domains, the engine constructs:

# the smallest useful set of competing hypotheses.

Default cardinality remains:

```text
1–3 Primary Candidates
0–2 Additional Candidates
```

The engine SHALL NOT fill unused slots merely because they exist.

The v1 Target Slate had the same restraint. 

---

# 111. SLATE ASSEMBLY PROFILE

```ts
interface SlateAssemblyProfileDefinition {
  id: UUID;

  indication_module_release_id: UUID;

  max_primary: number;
  max_additional: number;

  role_priorities: SlateRolePriority[];

  objective_coverage_rules: ClinicalCoverageRule[];

  diversity_rules: DiversityRule[];

  mandatory_baseline_visibility?: boolean;

  allow_zero_candidate_abstention: boolean;

  scientific_policy_release_id: UUID;
}
```

For v2:

```text
max_primary <= 3
max_additional <= 2
```

unless a future controlled specification changes the canonical product rule.

---

# 112. NO UNIVERSAL PRIMARY-1 RULE

v1 MDD may favour an evidence anchor for Primary 1 under its policy.

v2 SHALL NOT hard-code:

```text
Primary 1 = evidence anchor
```

for all indications.

Examples:

```text
Pain:
Primary 1 may be somatotopic target.

Stroke:
Primary 1 may be a stage-appropriate motor strategy.

OCD:
Primary 1 may be field target or another permitted target family.
```

Role selection remains module/policy-specific.

---

# 113. CLINICAL COVERAGE

The Slate Assembly stage asks:

> Does each additional candidate add a genuinely distinct clinically relevant hypothesis?

It should not ask:

> Which are the five highest-scoring points?

Coverage uses:

* clinical objective;
* TargetFamily;
* candidate role;
* evidence path;
* geometry;
* redundancy.

---

# 114. CANDIDATE SUPPRESSION

Standard v2 suppression reasons:

```text
EVIDENCE_PATH_NOT_PERMITTED
MODE_INCOMPATIBLE
MODULE_INCOMPATIBLE
POPULATION_MISMATCH
DISEASE_STAGE_MISMATCH
TREATMENT_CONTEXT_MISMATCH
MEASUREMENT_UNAVAILABLE
LOW_RELIABILITY
TARGET_ANATOMY_INVALID
LESION_CONFLICT
DEVICE_INCOMPATIBLE
GEOMETRY_INCOMPATIBLE
FAILED_REFINEMENT_TEST
LOW_INCREMENTAL_VALUE
REDUNDANT
ROLE_ALREADY_COVERED
NO_ADDITIONAL_CLINICAL_COVERAGE
RESEARCH_ONLY
GENERATOR_CONSTRAINT_FAILED
```

Suppressed candidates remain persisted for validation/audit.

---

# 115. RESEARCH CANDIDATES

Research candidates SHALL NOT be hidden merely because they are ineligible for Clinical Mode.

Research Mode may display them explicitly.

However, Clinical Mode SHALL not allow a Research candidate to enter the clinical slate.

The v1 system had the same strict asymmetry: Research Mode may consider Clinical targets, but Clinical Mode cannot consume Research-only TargetFamilies. 

---

# 116. ABSTENTION

Abstention remains a scientifically valid engine result.

v2 abstention categories include:

```text
unsupported_indication
module_not_permitted
no_permitted_evidence_path
clinical_context_mismatch
mandatory_measurement_missing
reliability_failure
lesion_registration_failure
target_region_invalid
no_device_compatible_geometry
treatment_context_mismatch
generator_failure
scientific_configuration_invalid
no_nonredundant_candidate
```

---

# 117. FEATURE-LEVEL VERSUS SLATE-LEVEL ABSTENTION

MAGNIOM SHALL distinguish:

```text
connectome refinement abstained
```

from:

```text
whole Target Slate abstained.
```

Example:

```text
MDD
FC unreliable
→ no FC refinement
→ evidence baseline still valid
```

is not a total failure.

---

# 118. GENERATOR FAILURE POLICY

A generator failure SHALL be handled according to its controlled descriptor.

### Required generator

```text
required_fail_run
```

may abort slate creation.

### Optional generator

```text
omit_generator_with_warning
```

allows remaining valid paths.

### Research-only optional generator

may fail without affecting Clinical candidates.

Failure policy SHALL NOT be invented at runtime.

---

# 119. CANDIDATE EXPLANATION v2

Each candidate SHALL generate structured explanation data including:

```ts
interface CandidateExplanationV2 {
  short_summary: string;

  clinical_objective: ExplanationFact[];

  evidence_basis: EvidencePathExplanation[];

  why_nominated: ExplanationFact[];

  patient_specific_contribution: ExplanationFact[];

  disease_stage_context?: ExplanationFact[];

  lesion_context?: ExplanationFact[];

  treatment_context?: ExplanationFact[];

  reliability: ExplanationFact[];

  geometry: ExplanationFact[];

  accessibility: ExplanationFact[];

  counterfactual?: ExplanationFact[];

  material_conflicts: ExplanationFact[];

  why_it_may_be_wrong: ExplanationFact[];

  alternatives: CandidateReference[];

  uncertainties: UncertaintyItem[];
}
```

---

# 120. EVIDENCE-CONFLICT EXPLANATION

Material conflicting evidence identified in the Evidence Library SHALL be retrievable from the candidate explanation.

The Target Engine SHALL NOT decide to omit it because the candidate otherwise ranks highly.

For Research-heavy modules such as tinnitus and TBI, conflicting evidence may be one of the dominant explanation elements.

---

# 121. DETERMINISTIC EXPLANATION

Clinical explanation should continue to derive from:

# structured facts and controlled templates.

An LLM MAY later rewrite approved facts for readability.

It SHALL NOT:

* change rank;
* add evidence;
* delete material conflict;
* change uncertainty;
* reclassify mode;
* invent mechanism;
* infer protocol.

The v1 engine already established this boundary. 

---

# 122. SCIENTIFIC TIES

When two candidates are scientifically indistinguishable under the ranking profile:

MAGNIOM SHOULD represent:

```text
scientific_tie = true
```

rather than pretending tiny floating-point differences establish superiority.

A deterministic presentation order is still required.

---

# 123. TIE-BREAKING

Suggested sequence:

```text
1. scientific comparison result
2. role priority where policy defines one
3. evidence stratum
4. validated ranking features
5. lower uncertainty where legitimately comparable
6. canonical TargetFamily code
7. canonical geometry hash
```

Steps 6–7 are:

# deterministic presentation tie-breakers,

not scientific superiority.

The UI should not imply otherwise.

---

# 124. FLOATING-POINT POLICY

The engine SHALL define:

* floating representation;
* normalization;
* epsilon;
* rounding;
* stable sorting;
* tolerance for equality.

Scientific ranking must not change unpredictably because of machine-level noise.

---

# 125. ENGINE RELEASE

```ts
interface TargetEngineRelease {
  id: UUID;

  semantic_version: string;

  core_version: string;

  core_code_commit: string;

  container_digest_sha256: SHA256;

  domain_schema_version: string;

  plugin_manifests: {
    plugin_id: UUID;
    plugin_version: string;
    plugin_digest_sha256: SHA256;
  }[];

  validated_golden_suite_ids: UUID[];

  configuration_sha256: SHA256;

  lifecycle_status:
    | "draft"
    | "validation"
    | "active"
    | "superseded"
    | "withdrawn";

  approved_at?: ISO8601UTC;
}
```

---

# 126. PLUGIN VERSION IS SCIENTIFIC VERSION

Changing:

```text
PainMotorMapRefinementGenerator
```

so that it selects a different cortical location is a scientific algorithm change.

It requires:

* new generator version;
* impact assessment;
* regression testing;
* potentially new Scientific Policy;
* potentially new TargetEngineRelease.

It is not merely refactoring.

---

# 127. ENGINE VERSIONING

### Patch

Implementation correction intended not to change scientific output.

### Minor

Controlled scientific implementation change within validated architecture.

### Major

Material algorithm architecture or semantics change.

Any change that actually alters Target Slates requires:

# change-impact review

regardless of semantic label.

---

# 128. REPRODUCIBILITY MANIFEST

Every run SHALL hash at least:

```text
CaseIndication
IndicationModuleRelease
phenotype snapshot
clinical objectives
disease-stage context
lesion contexts
treatment-context snapshot
MeasurementBundle
ReliabilityBundle
Evidence Library
permitted EvidencePaths
Scientific Policy
Target Engine Release
plugin manifests
generator versions
device context
E-field context
```

Output:

```text
TargetGenerationInputHash
```

The completed Target Slate receives:

```text
TargetSlateHash.
```

---

# 129. CANDIDATE TRACE

For every generated candidate persist:

```text
plugin
generator
generator version
EvidencePath(s)
TargetFamily
clinical objectives
source measurements
source reliability
target geometry
raw scientific features
normalized ranking features
gate evaluations
comparison domain
rank before refinement
refinement result
redundancy result
final inclusion/suppression
explanation facts
```

This is mandatory for scientific verification.

---

# 130. AUDIT EVENTS

Suggested semantic events:

```text
TARGET_ENGINE_STARTED

TARGET_PLUGIN_RESOLVED

TARGET_GENERATOR_STARTED

TARGET_GENERATOR_ABSTAINED

TARGET_CANDIDATE_GENERATED

TARGET_CANDIDATE_GATE_FAILED

TARGET_REFINEMENT_ADOPTED

TARGET_REFINEMENT_REJECTED

TARGET_CANDIDATE_SUPPRESSED

TARGET_SLATE_GENERATED

TARGET_ENGINE_ABSTAINED

TARGET_ENGINE_COMPLETED
```

High-volume vertex calculations need not become clinical audit rows.

---

# 131. REPOSITORY ARCHITECTURE

Recommended v2 package layout:

```text
packages/
│
├── target-engine-core/
│   ├── orchestration/
│   ├── integrity/
│   ├── gates/
│   ├── capabilities/
│   ├── features/
│   ├── ranking/
│   ├── refinement/
│   ├── geometry/
│   ├── redundancy/
│   ├── slate/
│   ├── explanation/
│   └── manifests/
│
├── target-engine-sdk/
│   ├── plugin-contract.ts
│   ├── generator-contract.ts
│   ├── feature-contract.ts
│   ├── geometry-contract.ts
│   └── test-contract.ts
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
└── target-engine-testkit/
    ├── synthetic-contexts/
    ├── golden-cases/
    ├── invariants/
    └── deterministic-snapshots/
```

---

# 132. INDICATION PACKAGE STRUCTURE

Each indication package SHOULD contain:

```text
manifest.ts

context/
  schemas.ts
  validators.ts

generators/
  *.generator.ts

features/
  *.feature.ts

comparison/
  profiles.ts

refinement/
  profiles.ts

slate/
  profile.ts

explanation/
  facts.ts

tests/
  unit/
  golden/
  boundary/
```

---

# 133. NO DUPLICATED CORE LOGIC

Plugins SHALL NOT independently implement their own:

* mode gate;
* evidence release loader;
* Scientific Policy loader;
* global slate cardinality;
* audit framework;
* hashing system;
* generic suppression lifecycle.

Those belong in the core.

---

# 134. NO `any` IN SCIENTIFIC CONTRACTS

Canonical engine and plugin interfaces SHALL avoid uncontrolled `any`.

Scientific units should use explicit branded types where practical:

```ts
type Millimetres = number & { readonly __unit: "mm" };

type NormalizedScore =
  number & { readonly __range: "0..1" };
```

Runtime validation remains mandatory.

---

# 135. PARALLEL GENERATOR EXECUTION

Generators that do not depend on one another MAY execute concurrently.

However:

```text
Promise completion order
```

SHALL NOT determine:

* candidate order;
* rank;
* Candidate ID derivation;
* slate position.

Results are canonicalised before comparison.

---

# 136. CANDIDATE ID DERIVATION

Candidate identity SHOULD be immutable and reproducible from controlled run context where appropriate.

At minimum, the engine SHALL not assign semantic meaning based on creation order such as:

```text
candidate_1
```

before ranking.

Stable IDs and separate slate positions are required.

---

# 137. CORE CONTRACT TESTS

Every plugin SHALL pass a common conformance suite.

Tests include:

```text
deterministic output

no network access

no DB access

correct module identity

correct EvidencePath provenance

permitted geometry only

no final rank from generator

no Clinical candidate from Research-only path

required measurement declarations complete

candidate lineage valid

units valid
```

---

# 138. CORE INVARIANT TEST — RESEARCH LEAKAGE

Attempt:

```text
Tinnitus Research generator
+
Clinical request
```

Expected:

```text
hard failure before Clinical slate assembly.
```

---

# 139. CORE INVARIANT TEST — CROSS-INDICATION LEAKAGE

Attempt:

```text
TBI depression
→ reuse MDD DLPFC EvidencePath
```

Expected:

```text
EVIDENCE_PATH_INCOMPATIBLE
```

even if the anatomical region is identical.

---

# 140. CORE INVARIANT TEST — GEOMETRY LEAKAGE

Attempt:

```text
OCD coil-field EvidencePath
→ PointTargetGeometry
```

Expected:

```text
TARGET_GEOMETRY_NOT_PERMITTED.
```

---

# 141. CORE INVARIANT TEST — MISSING RELIABILITY

Attempt:

```text
motor-map-refined pain candidate
without qualified motor-map reliability
```

Expected:

```text
refinement rejected
baseline considered according to policy.
```

---

# 142. CORE INVARIANT TEST — E-FIELD MISSINGNESS

Three otherwise comparable candidates:

```text
A E-field available
B E-field available
C E-field unavailable
```

If policy requires complete-domain E-field comparison:

```text
E-field removed from comparative ranking
```

or domain fails according to policy.

Candidate C SHALL not receive an accidental disadvantage merely because data are absent.

---

# 143. MDD GOLDEN REGRESSION SUITE

Retain all v1 Golden Cases covering:

* strong evidence/connectome convergence;
* large evidence/personalisation displacement;
* reliable but non-material refinement;
* poor imaging fallback;
* one strong candidate only;
* distinct symptom-circuit alternative;
* Research anomaly;
* clinician override workflow support;
* unranked evidence target selection;
* historical evidence-release change.

The canonical v1 data model already used cases of this type as acceptance tests. 

---

# 144. PAIN GOLDEN CASES

### P01 — unilateral neuropathic hand pain

Expected:

```text
contralateral somatotopic M1 baseline
```

No generic DLPFC candidate.

### P02 — qualified motor mapping

Expected:

```text
motor-map refinement generated
counterfactual preserved
```

### P03 — unreliable motor mapping

Expected:

```text
refinement rejected
baseline preserved where permitted
```

### P04 — bilateral pain

Expected:

```text
no arbitrary hemisphere selection.
```

---

# 145. STROKE MOTOR GOLDEN CASES

### S01 — subacute left stroke, right hand paresis

Expected:

* correct lesion laterality;
* correct module EvidencePaths;
* applicable motor-strategy candidates.

### S02 — target cortex destroyed

Expected:

```text
candidate ineligible
```

with lesion explanation.

### S03 — disease-stage mismatch

Expected:

```text
stage-specific EvidencePath rejected.
```

### S04 — qualified motor map

Expected:

patient-specific refinement only inside permitted strategy.

### S05 — compensatory Research hypothesis

Expected:

visible only in Research Mode.

---

# 146. APHASIA GOLDEN CASES

### A01 — chronic non-fluent aphasia

Expected:

right-IFG path considered where permitted.

### A02 — same anatomy, fluent aphasia

Expected:

non-fluent-specific path not silently applied.

### A03 — required SLT context absent

Expected:

context limitation or gate according to policy.

### A04 — ipsilesional language Research path

Expected:

Research-only unless separately promoted.

---

# 147. OCD GOLDEN CASES

### O01 — permitted deep-field target

Expected:

```text
coil_field geometry
```

not fictitious focal coordinate.

### O02 — incompatible coil

Expected:

device/geometry gate failure.

### O03 — mPFC/ACC and pre-SMA alternatives

Expected:

kept in distinct comparison domains unless validated cross-family comparator exists.

### O04 — Research target path

Expected:

cannot enter Clinical slate.

---

# 148. TBI GOLDEN CASES

### TBI-01 — pooled cognition signal but no target-specific EvidencePath

Expected:

```text
no candidate
```

rather than inferred DLPFC.

### TBI-02 — explicit Research target path

Expected:

Research candidate with full provenance.

### TBI-03 — skull defect

Expected:

structural/E-field context surfaced and required policy gates applied.

### TBI-04 — attempt to inherit MDD target

Expected:

hard rejection.

---

# 149. PTSD GOLDEN CASES

### PTSD-01 — general PTSD population

Expected:

permitted target family according to active EvidencePath.

### PTSD-02 — combat-related population

Expected:

population applicability/conflict visible.

### PTSD-03 — overlapping MDD anatomy

Expected:

PTSD evidence path preserved; no MDD evidence inheritance.

---

# 150. TINNITUS GOLDEN CASES

### TN-01 — Research request

Expected:

auditory/temporoparietal hypotheses may be generated where Research paths permit.

### TN-02 — Clinical request

Expected:

hard module/mode rejection.

### TN-03 — strong imaging abnormality

Expected:

does not override Research-only evidence status.

### TN-04 — evidence explanation

Expected:

major negative/conflicting evidence present.

---

# 151. BOUNDARY TESTING

Every numerical Scientific Policy threshold requires:

```text
threshold - ε
threshold
threshold + ε
```

testing.

Examples:

* reliability threshold;
* refinement-improvement threshold;
* lesion-distance criterion;
* ROI overlap threshold;
* E-field coverage threshold;
* redundancy threshold.

No untested edge behaviour.

---

# 152. METAMORPHIC TESTS

Useful deterministic scientific tests include:

### Increase irrelevant metadata

Result:

```text
no scientific change.
```

### Add Research-only EvidencePath in Clinical run

Result:

```text
no clinical ranking change.
```

### Change UI ordering

Result:

```text
no Target Slate change.
```

### Add optional unused measurement

Result:

```text
no change unless policy/generator consumes it.
```

### Replace equivalent object ordering in input arrays

Result:

```text
identical output hash.
```

---

# 153. NEGATIVE TESTS

The engine SHALL explicitly test:

```text
wrong CaseIndication

wrong module

wrong policy

wrong evidence release

wrong plugin version

wrong disease stage

missing required lesion context

Research EvidencePath in Clinical Mode

wrong geometry

incompatible device

measurement from another case

ReliabilityBundle from another MeasurementBundle

unassigned evidence classification used as Clinical authority

unsigned policy manifest

plugin digest mismatch
```

---

# 154. SCIENTIFIC VALIDATION IS MODULE-SPECIFIC

Passing Target Engine Core verification does not clinically validate:

* stroke;
* pain;
* OCD;
* TBI;
* PTSD;
* tinnitus.

Each indication module must independently validate:

* correct candidate generation;
* applicability logic;
* measurement reliability;
* target reproducibility;
* ranking behaviour;
* human interpretation;
* clinical usefulness.

---

# 155. MODULE PROMOTION

A generator may progress:

```text
research-only
     ↓
validation-permitted
     ↓
clinical-permitted
```

without changing its code if the evidence, validation and Scientific Policy justify promotion.

But the promotion itself requires:

# a new controlled scientific release configuration.

No database toggle alone.

---

# 156. NO ONLINE LEARNING

Clinical Target Engine plugins SHALL NOT:

* update weights from recent outcomes;
* retrain candidate selection automatically;
* alter thresholds by site performance;
* learn from clinician acceptance rate.

Outcome learning follows:

```text
Outcome Dataset
      ↓
Research analysis
      ↓
Proposed change
      ↓
Validation
      ↓
new algorithm/policy release.
```

---

# 157. NO SITE-SPECIFIC SCIENTIFIC OVERRIDES

An organisation may not set:

```text
our clinic prefers right DLPFC +20%
```

or:

```text
reduce reliability threshold for our scanner
```

through ordinary settings.

Site-specific scientific adaptation requires a separately controlled validated configuration.

---

# 158. MODULE-SPECIFIC SCIENTIFIC POLICY

Scientific Policy parameters SHOULD use namespaces such as:

```text
mdd.connectome.minimum_reliability

mdd.connectome.minimum_incremental_concordance

pain.motor_map.minimum_reliability

stroke_motor.lesion.minimum_registration_quality

stroke_motor.motor_map.minimum_reliability

ocd.field.minimum_roi_coverage

aphasia.context.slt_requirement

tinnitus.mode.clinical_enabled
```

The last value remains false until formally authorised.

---

# 159. PROHIBITED ENGINE BEHAVIOURS

MAGNIOM v2 SHALL NOT:

```text
generate a target from diagnosis alone

rank the whole brain for abnormality

use an unapproved EvidencePath in Clinical Mode

transfer evidence between indications because anatomy overlaps

treat unassigned evidence as an implicit low Tier

treat missing measurements as zero

treat field targets as point targets

treat somatotopic targets as generic M1 coordinates

move a target out of destroyed tissue without an approved scientific rule

convert rehabilitation context into protocol prescription

use failed patient-specific data

use unreliable refinement because it looks biologically interesting

globally compare incompatible candidate classes

hide evidence baseline because personalisation exists

hide negative evidence

use Research target as Clinical alternative

return response probability without validation

fill all five Target Slate positions automatically
```

---

# 160. ALGORITHM SAFETY PRINCIPLES

# Evidence defines which scientific paths may exist.

# The Indication Module defines which scientific model applies.

# The plugin defines how an indication-specific target hypothesis is constructed.

# The core verifies every hypothesis.

# Measurement availability does not imply measurement authority.

# Reliability is capability-specific.

# Patient-specific refinement must earn influence.

# Different target geometries require different comparison logic.

# Different indications require different scientific features.

# Evidence never becomes a compensable generic score.

# Research availability never implies Clinical permission.

# Abstention remains valid.

# Alternatives remain visible.

# The clinician decides.

---

# 161. TARGET ENGINE v2 CANONICAL CONTRACT

The complete execution contract is:

```text
IMMUTABLE CASE CONTEXT
         +
INDICATION MODULE
         +
APPROVED EVIDENCE PATHS
         +
SCIENTIFIC POLICY
         +
QUALIFIED PATIENT MEASUREMENTS
         +
RELIABILITY
         +
DEVICE / ANATOMY
         ↓
REGISTERED INDICATION PLUGIN
         ↓
MODULE-SPECIFIC CANDIDATE GENERATORS
         ↓
CANDIDATE DRAFTS
         ↓
CORE SCIENTIFIC GATES
         ↓
SCIENTIFICALLY VALID COMPARISON DOMAINS
         ↓
MODULE-SPECIFIC RANKING
         ↓
REFINEMENT / COUNTERFACTUAL ANALYSIS
         ↓
REDUNDANCY + COVERAGE
         ↓
MINIMAL TARGET SLATE
         ↓
STRUCTURED EXPLANATION
         ↓
SPECIALIST DECISION
```

---

# 162. CANONICAL DEFINITION

The **MAGNIOM Target Engine v2.0** is:

> **A deterministic, version-pinned target-decision engine in which a common safety and governance core orchestrates independently governed indication-specific candidate generators, verifies every candidate against approved evidence paths, clinical context, measurement capability, reliability, anatomy, treatment context and device constraints, compares only scientifically compatible hypotheses, requires patient-specific refinement to demonstrate validated incremental value over an appropriate counterfactual, and constructs the smallest useful Target Slate without converting algorithmic output into autonomous clinical authority.**

---

# 163. FINAL GOVERNING RULE

> **An indication plugin may know how to generate a stroke, pain, OCD, PTSD, TBI or tinnitus target hypothesis, but it may never decide by itself that the hypothesis deserves clinical authority. The plugin proposes; the Evidence Library constrains; Scientific Policy permits; the Target Engine Core verifies and compares; the Target Slate exposes alternatives and uncertainty; the specialist decides.**

