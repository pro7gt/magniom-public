# MAGNIOM

# Target Engine & Ranking Algorithm Specification v2.1

**Document status:** Canonical multi-indication target-decision algorithm specification  
**Version:** 2.1  
**Supersedes:** MAGNIOM Target Engine & Ranking Algorithm Specification v2.0 for new development  
**Backward compatibility:** Historical v1.x and v2.0 Target Engine runs, Target Slates, manifests and clinician decisions remain immutable and reconstructable  
**Primary output:** A deterministic, evidence-traceable Target Slate containing up to 3 Primary Candidates and up to 2 Additional Candidates, with fewer or zero candidates when scientifically appropriate  
**Primary user:** Appropriately trained neuromodulation specialist  
**Clinical authority:** Human specialist clinician  
**Algorithm authority:** Approved `TargetEngineRelease` + `ScientificPolicyRelease` + `IndicationModuleRelease` + compatible scientific-provider releases  
**Execution modes:** Clinical Mode and Research Mode  
**Fundamental safety model:** Gates before scores; evidence before optimisation; reliability before personalisation; abstention before false precision  
**Major v2.1 change:** Explicit Systems Context Layer, candidate-role semantics, stronger refinement/counterfactual rules, capability-authority separation, richer convergence/contradiction handling, and formalised Target Slate information-value assembly

**Depends on:**

- MAGNIOM Canonical Multi-Indication Data Specification v2.0
- MAGNIOM Evidence Knowledge Graph & Therapeutic Circuit Library v2.0
- MAGNIOM Multi-Indication Technical & Scientific Architecture v2.x
- MAGNIOM Scientific Policy & Algorithm Configuration Specification v1.x
- MAGNIOM Neuroimaging & Functional Connectomics Pipeline Specification v1.1
- MAGNIOM Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0
- MAGNIOM Clinical Phenotype & Symptom-to-Circuit Ontology
- MAGNIOM Enterprise Verification, Testing & CI/CD Specification
- applicable indication-specific scientific modules

---

# 1. PURPOSE

MAGNIOM Target Engine v2.1 defines how immutable, governed scientific inputs are transformed into:

# an explainable Target Slate for specialist review.

The engine consumes:

- a clinician-confirmed case indication;
- clinician-approved clinical objectives;
- phenotype context;
- disease-stage context where relevant;
- lesion and anatomical context where relevant;
- treatment-context requirements where relevant;
- approved evidence paths;
- qualified patient-specific measurements;
- modality- and capability-specific reliability;
- therapeutic circuits;
- target families;
- target geometries;
- functional-connectomic information where permitted;
- Systems Context information where permitted;
- device and coil constraints;
- E-field information where permitted;
- indication-specific scientific rules;

and produces:

- candidate hypotheses;
- eligibility determinations;
- comparison-domain membership;
- ranking information;
- counterfactual/refinement decisions;
- redundancy relationships;
- convergence and contradiction profiles;
- objective coverage;
- a minimal useful Target Slate;
- structured explanations;
- warnings;
- abstention where appropriate;
- an immutable reproducibility manifest.

MAGNIOM SHALL NOT autonomously determine:

- diagnosis;
- whether TMS should be prescribed;
- stimulation protocol;
- pulse frequency;
- intensity;
- treatment duration;
- treatment scheduling;
- medication management;
- response probability unless separately validated and explicitly authorised;
- final clinical target;
- final clinical treatment decision.

The specialist decides.

---

# 2. CANONICAL v2.1 PRINCIPLE

The Target Engine SHALL reason:

```text
Evidence
   ↓
Scientific permission
   ↓
Clinical purpose
   ↓
Candidate hypothesis
   ↓
Patient-specific qualification
   ↓
Hard gates
   ↓
Scientifically valid comparison
   ↓
Counterfactual analysis
   ↓
Ranking within comparison domain
   ↓
Redundancy / convergence / coverage
   ↓
Minimal useful Target Slate
   ↓
Specialist review
```

It SHALL NOT reason:

```text
Diagnosis
   ↓
Brain scan
   ↓
Most abnormal region
   ↓
Best TMS target
```

Nor:

```text
Highest algorithm score
   ↓
treatment prescription
```

---

# 3. FOUNDATIONAL AXIOMS

The following are normative:

> **Evidence constrains.**

> **The indication module determines which scientific model applies.**

> **Phenotype identifies clinical relevance.**

> **Patient measurements may refine but do not create evidence.**

> **Reliability qualifies the authority of a measurement.**

> **Systems context informs interpretation before it earns ranking authority.**

> **Anatomy constrains.**

> **E-field modelling evaluates stimulability where applicable.**

> **Counterfactuals protect against personalisation for its own sake.**

> **Redundancy prevents duplicate candidates.**

> **Convergence increases interpretive coherence, not candidate count.**

> **Contradiction remains visible.**

> **Abstention is a valid output.**

> **The Target Slate exposes alternatives and uncertainty.**

> **The clinician decides.**

---

# 4. v2.1 ARCHITECTURAL CHANGE

v2.0 established:

```text
Deterministic Target Engine Core
              +
Indication Targeting Plugin
              +
Candidate Generators
              +
Scientific Policy
```

v2.1 preserves that architecture and adds:

```text
              SYSTEMS CONTEXT LAYER
                       │
                       ▼
Deterministic Target Engine Core
              +
Indication Targeting Plugin
              +
Candidate Generators
              +
Scientific Policy
              +
Evidence Library
```

The Systems Context Layer does not bypass any other layer.

It does not independently create evidence.

It does not automatically generate targets.

It does not automatically modify rank.

---

# 5. SYSTEM LAYERS

The canonical scientific layers are:

```text
┌──────────────────────────────────────────────┐
│ GOVERNANCE                                   │
│ Evidence · Scientific Policy · Releases      │
├──────────────────────────────────────────────┤
│ TARGET ENGINE CORE                           │
│ gates · comparison · ranking · slate         │
├──────────────────────────────────────────────┤
│ INDICATION TARGETING PLUGIN                  │
│ indication-specific scientific logic        │
├──────────────────────────────────────────────┤
│ CANDIDATE GENERATORS                         │
│ candidate hypothesis construction           │
├──────────────────────────────────────────────┤
│ QUALIFIED PATIENT MEASUREMENTS               │
│ imaging · physiology · anatomy · E-field     │
├──────────────────────────────────────────────┤
│ SYSTEMS CONTEXT                              │
│ network relationships · convergence context │
└──────────────────────────────────────────────┘
```

Authority flows downward from governance.

A lower layer cannot grant itself authority withheld by a higher layer.

---

# 6. WHAT THE CORE OWNS

The Target Engine Core SHALL own:

- request validation;
- immutable-input verification;
- release compatibility;
- Clinical/Research Mode enforcement;
- plugin registration verification;
- EvidencePath enforcement;
- evidence-ceiling enforcement;
- population compatibility;
- disease-stage compatibility;
- clinical-objective compatibility;
- treatment-context compatibility;
- measurement-capability qualification;
- reliability qualification;
- candidate-schema validation;
- geometry validation;
- hard gates;
- Systems Context authority enforcement;
- comparison-domain construction;
- ranking orchestration;
- counterfactual enforcement;
- refinement adoption;
- redundancy assessment;
- convergence assessment;
- contradiction preservation;
- objective coverage;
- role assignment;
- slate cardinality;
- abstention;
- deterministic tie resolution;
- explanation completeness;
- warning generation;
- output manifest;
- reproducibility hash.

---

# 7. WHAT THE INDICATION PLUGIN OWNS

An indication plugin MAY own:

- indication-specific interpretation of phenotype;
- indication-specific therapeutic-circuit interpretation;
- target-family logic;
- disease-stage logic;
- lesion-context interpretation;
- treatment-context interpretation;
- target-geometry semantics;
- indication-specific feature extraction;
- approved candidate-generator definitions;
- approved baseline definitions;
- patient-specific refinement strategies;
- comparison-domain proposals;
- counterfactual definitions;
- scientifically justified candidate-role proposals;
- Systems Context feature interpretation where permitted;
- modality-specific scientific semantics.

The plugin SHALL NOT grant itself final eligibility.

---

# 8. WHAT SCIENTIFIC POLICY OWNS

Scientific Policy SHALL govern:

- permitted indications;
- permitted modes;
- approved plugin versions;
- approved candidate generators;
- approved EvidencePaths;
- evidence classes;
- evidence ceilings;
- patient-population constraints;
- measurement requirements;
- capability requirements;
- reliability requirements;
- geometry constraints;
- accessibility requirements;
- Systems Context authority;
- normative-model authority;
- ranking profiles;
- refinement rules;
- counterfactual requirements;
- E-field roles;
- redundancy thresholds;
- convergence rules;
- contradiction warnings;
- candidate-role permissions;
- slate cardinality;
- abstention rules;
- explanation requirements.

Scientific parameters SHALL NOT be hidden in UI preferences or organisation settings.

---

# 9. PLUGIN AUTHORITY BOUNDARY

A plugin MAY return:

```text
CandidateDraft
```

It SHALL NOT authoritatively return:

```text
clinical_eligible = true
```

The core independently evaluates every draft.

Canonical principle:

```text
Plugin proposes.
Evidence constrains.
Policy permits.
Core verifies.
Slate communicates.
Clinician decides.
```

---

# 10. STATIC CLINICAL PLUGIN REGISTRATION

Clinical Mode SHALL NOT dynamically retrieve or execute arbitrary code.

Clinical plugins SHALL be:

- versioned;
- signed or otherwise release-controlled;
- hashed;
- compiled/package-pinned;
- present in the Target Engine manifest;
- explicitly allowed by Scientific Policy.

Runtime behaviour such as:

```text
download latest targeting plugin
```

is prohibited.

---

# 11. TARGET ENGINE REQUEST v2.1

```ts
interface MagniomTargetEngineRequestV21 {
  case_id: UUID;
  case_indication_id: UUID;

  mode:
    | "clinical"
    | "research";

  indication_module_release_id: UUID;
  phenotype_snapshot_id: UUID;
  clinical_objective_ids: UUID[];

  disease_stage_context_id?: UUID;
  lesion_context_ids?: UUID[];
  treatment_context_snapshot_id?: UUID;

  measurement_bundle_id: UUID;
  reliability_bundle_id?: UUID;

  systems_context_bundle_id?: UUID;

  evidence_library_release_id: UUID;
  scientific_policy_release_id: UUID;
  target_engine_release_id: UUID;

  device_context_ids?: UUID[];
  efield_context_id?: UUID;

  requested_at?: ISO8601UTC;
}
```

`requested_at` is operational metadata.

It SHALL NOT affect scientific output.

---

# 12. RESOLVED TARGETING CONTEXT

The scientific core SHALL operate on resolved immutable objects.

```ts
interface ResolvedTargetingContextV21 {
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

  systems_context?: SystemsContextBundle;

  evidence_paths: EvidencePath[];
  evidence_claims: EvidenceClaim[];
  therapeutic_circuits: TherapeuticCircuit[];
  target_families: TargetFamily[];

  scientific_policy: ScientificPolicyRelease;
  target_engine_release: TargetEngineRelease;

  device_context: DeviceContext[];
  efield_context?: EFieldContext;

  input_manifest: TargetGenerationInputManifestV21;
}
```

The core SHOULD NOT directly query mutable application state.

---

# 13. CORE PURITY

Scientific functions SHOULD be pure.

For example:

```ts
evaluateCandidateEligibility(
  candidate,
  context,
  policy
)
```

SHALL NOT:

- query Supabase directly;
- browse the web;
- use PubMed dynamically;
- call an LLM;
- inspect local clock time;
- inspect UI state;
- read arbitrary environment variables for scientific thresholds;
- mutate case data;
- alter patient records.

---

# 14. DETERMINISM

Identical frozen inputs SHALL result in identical:

- plugin selection;
- generator invocation;
- candidate drafts;
- geometries;
- extracted features;
- gates;
- comparison domains;
- ranking values;
- refinement decisions;
- counterfactual assessments;
- redundancy decisions;
- convergence profiles;
- contradiction profiles;
- objective coverage;
- candidate-role assignments;
- slate membership;
- slate order;
- explanations;
- warnings;
- abstention;
- result hash.

Parallel execution MAY occur.

Completion order SHALL NOT affect scientific output.

---

# 15. PROHIBITED DYNAMIC SCIENTIFIC INPUTS

Clinical Mode SHALL NOT depend upon:

```text
live internet
live PubMed
current date
current time
LLM output
browser state
UI state
random sampling
latest evidence query
organisation-specific hidden weighting
clinician ranking slider
developer feature toggle bypass
```

All scientific inputs SHALL be explicit and release-pinned.

---

# 16. COMPLETE v2.1 EXECUTION PIPELINE

```text
VERIFY INPUT MANIFEST
        ↓
VERIFY RELEASE COMPATIBILITY
        ↓
VERIFY EXECUTION MODE
        ↓
RESOLVE INDICATION PLUGIN
        ↓
LOAD APPROVED EVIDENCE PATHS
        ↓
VALIDATE POPULATION / OBJECTIVE / STAGE / CONTEXT
        ↓
QUALIFY PATIENT MEASUREMENT CAPABILITIES
        ↓
QUALIFY RELIABILITY
        ↓
QUALIFY SYSTEMS CONTEXT
        ↓
INVOKE PERMITTED CANDIDATE GENERATORS
        ↓
VALIDATE CANDIDATE DRAFTS
        ↓
ATTACH EVIDENCE
        ↓
ATTACH PATIENT-SPECIFIC FEATURES
        ↓
ATTACH SYSTEMS CONTEXT
        ↓
APPLY HARD GATES
        ↓
CREATE COMPARISON DOMAINS
        ↓
BUILD COUNTERFACTUAL PAIRS / SETS
        ↓
COMPUTE DOMAIN-SPECIFIC FEATURES
        ↓
EVALUATE PERSONALISATION INCREMENTAL VALUE
        ↓
RANK WITHIN COMPARISON DOMAINS
        ↓
ASSESS REDUNDANCY
        ↓
ASSESS CONVERGENCE
        ↓
ASSESS CONTRADICTIONS
        ↓
ASSESS OBJECTIVE COVERAGE
        ↓
ASSIGN CANDIDATE ROLES
        ↓
ASSEMBLE MINIMAL USEFUL SLATE
        ↓
GENERATE EXPLANATIONS / WARNINGS
        ↓
VERIFY OUTPUT MANIFEST
        ↓
RETURN IMMUTABLE RESULT
```

---

# 17. GATES BEFORE SCORES

A candidate failing a mandatory gate SHALL NOT survive because of a high ranking value elsewhere.

Prohibited:

```text
poor evidence
+
excellent connectivity
+
excellent E-field
=
high-ranked target
```

Instead:

```text
evidence gate fails
        ↓
candidate not clinically eligible
```

No compensatory weighted score may override a hard scientific failure.

---

# 18. v2.1 HARD-GATE FAMILIES

The core gate families are:

```text
G0  Input Integrity
G1  Mode / Release Compatibility
G2  Indication / Population Compatibility
G3  Evidence Eligibility
G4  Clinical Objective Compatibility
G5  Disease-Stage / Context Compatibility
G6  Measurement Capability
G7  Reliability
G8  Anatomical Validity
G9  Geometry Validity
G10 Device / Accessibility
G11 Treatment Context
G12 Personalisation Authority
G13 Systems Context Authority
G14 Research Leakage Prevention
```

Individual modules may define additional gates.

They may not disable universal safety gates.

---

# 19. G0 — INPUT INTEGRITY

The core SHALL verify:

- object identity;
- object hashes;
- case consistency;
- version consistency;
- required signatures where applicable;
- manifest completeness;
- laterality consistency where relevant;
- coordinate-space metadata;
- immutable snapshot state.

Critical input inconsistency SHALL cause fail-closed behaviour.

---

# 20. G1 — MODE / RELEASE COMPATIBILITY

Clinical Mode requires compatible:

```text
TargetEngineRelease
+
IndicationModuleRelease
+
ScientificPolicyRelease
+
EvidenceLibraryRelease
+
Measurement Provider Releases
```

Compatibility SHALL be explicit.

A release being newer does not imply compatibility.

---

# 21. G2 — INDICATION / POPULATION COMPATIBILITY

An EvidencePath or candidate generator SHALL be restricted to the population for which its scientific authority applies.

Possible dimensions include:

- indication;
- age range;
- diagnostic subtype;
- treatment-resistance status;
- disease stage;
- lesion type;
- laterality;
- prior treatment;
- comorbidity constraints;
- rehabilitation context.

The engine SHALL not silently generalise evidence across populations.

---

# 22. G3 — EVIDENCE ELIGIBILITY

Every Clinical candidate SHALL trace to at least one approved EvidencePath.

Canonical chain:

```text
EvidenceClaim
    ↓
TherapeuticCircuit / Target-System Hypothesis
    ↓
TargetFamily
    ↓
TargetingStrategy
    ↓
TargetGeometry
    ↓
Candidate
```

Patient-specific imaging cannot substitute for a missing EvidencePath.

---

# 23. EVIDENCE IS NOT A GENERIC SCORE

Evidence SHALL be represented as:

- eligibility;
- evidence tier/class;
- evidence ceiling;
- allowed clinical role;
- population applicability;
- outcome applicability;
- conflict status.

Evidence SHALL NOT be reduced to:

```text
evidence_score = 0.78
```

and combined indiscriminately with other features.

---

# 24. EVIDENCE CEILING

Every candidate has a maximum authority determined by its evidence.

A low-evidence candidate with excellent patient concordance cannot promote itself beyond the permitted evidence ceiling.

Conceptually:

```text
candidate authority
≤
evidence authority
```

Patient personalisation may refine an evidence-supported family.

It cannot manufacture clinical evidence.

---

# 25. NEGATIVE AND CONFLICTING EVIDENCE

The engine SHALL preserve:

- supporting evidence;
- neutral evidence;
- negative evidence;
- conflicting evidence;
- uncertainty;
- population mismatch.

Negative evidence SHALL NOT be omitted merely because positive evidence exists.

Where Scientific Policy requires:

```text
EVIDENCE_CONFLICT
```

shall be raised.

---

# 26. G4 — CLINICAL OBJECTIVE COMPATIBILITY

Every candidate SHALL specify which clinician-approved objectives it addresses.

For example:

```text
reduce dysphoric burden
improve anxious distress
improve hand motor recovery
reduce neuropathic hand pain
support language recovery
```

A candidate that addresses no approved objective SHALL not enter the Clinical slate merely because it is biologically interesting.

---

# 27. PHENOTYPE AUTHORITY

Phenotype determines:

```text
which evidence-supported therapeutic objectives matter
```

It SHALL NOT independently determine:

```text
which coordinate must be stimulated
```

Questionnaire scores are observations.

Clinician-approved objective priority remains the controlling clinical signal unless an indication-specific validated policy states otherwise.

---

# 28. CLINICAL PRIORITY

Clinical priority SHALL be represented explicitly.

Example:

```ts
interface ClinicalObjectivePriority {
  clinical_objective_id: UUID;

  priority:
    | "primary"
    | "secondary"
    | "contextual";

  clinician_approved: boolean;
}
```

The engine SHALL not infer all priority solely from symptom severity.

---

# 29. G5 — STAGE AND CONTEXT COMPATIBILITY

Where evidence depends on:

- acute vs chronic disease;
- lesion phase;
- rehabilitation phase;
- treatment sequence;
- previous treatment exposure;
- concurrent therapy;
- laterality;
- body region;

the relevant context SHALL be present and compatible.

Missing required context may result in:

```text
candidate_ineligible
```

or:

```text
candidate_conditionally_eligible
```

according to policy.

---

# 30. G6 — MEASUREMENT CAPABILITY

Measurement availability is not measurement authority.

Example:

```text
rs-fMRI exists
```

does not imply:

```text
connectome_refinement enabled
```

The corresponding measurement capability must be qualified.

Possible states:

```text
enabled
fallback_only
disabled
research_only
```

---

# 31. G7 — RELIABILITY

Reliability SHALL be:

- modality-specific;
- method-specific;
- capability-specific;
- version-specific.

Examples:

```text
FC measurement                  qualified
patient FC localisation         not qualified

motor hotspot measurement       qualified
motor-map edge definition       not qualified

lesion mask                     qualified
tract intersection              research only
```

The engine SHALL respect the capability-level result.

---

# 32. CONSERVATIVE RELIABILITY

Where an indication-specific method uses multiple critical reliability dimensions, Scientific Policy MAY use a conservative aggregator such as:

```text
R = min(
  acquisition/QC,
  localisation stability,
  connectivity stability
)
```

if validated for that capability.

The engine SHALL NOT invent an overall confidence percentage.

---

# 33. G8 — ANATOMICAL VALIDITY

A candidate SHALL be checked against applicable anatomical constraints.

Examples:

- tissue exists;
- target not destroyed by lesion;
- target belongs to required hemisphere;
- target geometry remains anatomically meaningful;
- surface correspondence is valid;
- structural distortion is acceptable;
- relevant anatomy is sufficiently reconstructed.

Functional interest cannot rescue invalid anatomy.

---

# 34. LESION-AWARE GATING

For lesion-containing brains, candidate status may include:

```text
outside lesion
adjacent to lesion
partially involved
substantially involved
tissue absent
not assessable
```

The engine SHALL NOT automatically "move" a candidate away from a lesion unless an approved scientific rule defines that operation.

---

# 35. G9 — TARGET GEOMETRY VALIDITY

Different target geometries SHALL remain distinct.

Possible geometries include:

```text
point
surface point
surface region
ROI
somatotopic region
field target
network-access node
distributed target representation
```

The engine SHALL NOT force all targets into a single XYZ coordinate representation.

---

# 36. G10 — DEVICE / ACCESSIBILITY

The engine SHALL determine whether a candidate is physically compatible with the relevant stimulation context.

Potential factors:

- coil/device support;
- target depth;
- scalp/cortex geometry;
- coil pose;
- anatomical accessibility;
- field coverage;
- hardware capability;
- validated neuronavigation export.

Scientific interest does not override physical impossibility.

---

# 37. G11 — TREATMENT CONTEXT

If evidence applies only under a particular treatment context, that requirement SHALL remain explicit.

Examples might include:

- concurrent rehabilitation;
- symptom provocation;
- task engagement;
- sequential treatment;
- device-specific implementation.

The Target Engine SHALL not itself prescribe the treatment protocol.

---

# 38. G12 — PERSONALISATION AUTHORITY

Patient-specific personalisation SHALL require:

1. an evidence-defined baseline;
2. a permitted personalisation method;
3. sufficient measurement quality;
4. sufficient reliability;
5. appropriate search-space restriction;
6. a scientifically comparable counterfactual;
7. meaningful incremental value;
8. acceptable anatomical/accessibility status;
9. acceptable evidence-transfer displacement;
10. no disqualifying contradiction.

Personalisation must earn influence.

---

# 39. G13 — SYSTEMS CONTEXT AUTHORITY

Systems Context may influence Clinical ranking only if Scientific Policy explicitly grants that authority.

Default v2.1 role:

```text
contextual
```

Other possible statuses:

```text
qualified_supportive
qualified_ranking_feature
research_only
not_assessable
```

For the Triple-Network layer, default Clinical authority is:

```text
contextual
```

unless an indication-specific validation program upgrades a specific feature.

---

# 40. G14 — RESEARCH LEAKAGE PREVENTION

A Research candidate, measurement, network feature or model SHALL NOT appear as a Clinical recommendation or Clinical alternative.

UI visibility does not grant scientific authority.

A research object MAY be shown in an explicitly separate research interface.

---

# 41. CANDIDATE GENERATOR REGISTRY

Every generator SHALL be registered.

```ts
interface CandidateGeneratorRegistration {
  generator_code: string;
  version: string;

  indication_module_id: UUID;

  allowed_modes:
    | ["clinical"]
    | ["research"]
    | ["clinical", "research"];

  required_evidence_path_types: string[];

  required_capabilities: string[];

  output_geometry_types: TargetGeometryType[];

  counterfactual_required: boolean;

  release_hash: SHA256;
}
```

---

# 42. CANDIDATE GENERATOR TYPES

Examples include:

```text
evidence_coordinate_generator
evidence_roi_generator
group_circuit_generator
individual_fc_refinement_generator
surface_cluster_generator
somatotopic_motor_generator
lesion_aware_generator
field_coverage_generator
task_localisation_generator
research_network_generator
```

A generator's existence does not imply Clinical permission.

---

# 43. CANDIDATE DRAFT

```ts
interface CandidateDraftV21 {
  id: UUID;

  generator_code: string;
  generator_version: string;

  target_family_id: UUID;
  therapeutic_circuit_ids: UUID[];

  evidence_path_ids: UUID[];

  target_geometry: TargetGeometry;

  clinical_objective_ids: UUID[];

  baseline_candidate_id?: UUID;
  refinement_of_candidate_id?: UUID;

  patient_specific_feature_refs: FeatureReference[];
  systems_context_refs?: FeatureReference[];

  proposed_comparison_domain_code: string;

  provenance: Provenance;
}
```

This object has not yet passed core gates.

---

# 44. TARGET CANDIDATE

After core evaluation:

```ts
interface TargetCandidateV21 {
  id: UUID;

  target_family_id: UUID;
  therapeutic_circuit_ids: UUID[];

  geometry: TargetGeometry;

  evidence_profile: CandidateEvidenceProfile;

  objective_profile: CandidateObjectiveProfile;

  measurement_profile: CandidateMeasurementProfile;

  reliability_profile: CandidateReliabilityProfile;

  anatomy_profile: CandidateAnatomyProfile;

  accessibility_profile?: CandidateAccessibilityProfile;

  efield_profile?: CandidateEFieldProfile;

  systems_context_profile?: CandidateSystemsContextProfile;

  convergence_profile?: CandidateConvergenceProfileV21;

  contradiction_profile?: CandidateContradictionProfile;

  counterfactual_profile?: CandidateCounterfactualProfile;

  eligibility: CandidateEligibility;

  comparison_domain_id?: UUID;

  ranking_profile?: CandidateRankingProfile;

  candidate_role?: TargetCandidateRole;

  nomination_rationale: StructuredExplanation;

  why_might_this_be_wrong: StructuredExplanation;

  warnings: EngineWarning[];

  provenance: Provenance;
}
```

---

# 45. CANDIDATE ELIGIBILITY

```ts
type CandidateEligibility =
  | "eligible"
  | "eligible_with_limitations"
  | "ineligible"
  | "research_only";
```

Eligibility SHALL include gate-level reasons.

The engine SHALL not expose only:

```text
eligible = false
```

without explanation.

---

# 46. SUPPRESSED CANDIDATES

A candidate may pass scientific eligibility but be excluded from the final slate because of:

- redundancy;
- lower utility within comparison domain;
- insufficient incremental information;
- duplicate objective coverage;
- slate cardinality;
- role conflict;
- stronger equivalent candidate.

Such candidates SHALL remain preserved as:

```text
suppressed
```

rather than deleted.

---

# 47. COMPARISON DOMAINS

Candidates SHALL only be ranked against scientifically comparable candidates.

A ComparisonDomain defines:

```text
which candidates may legitimately compete
```

Examples:

```text
left DLPFC focal targets
right DLPFC focal alternatives
M1 hand somatotopic targets
OCD field-target configurations
post-stroke language-node targets
```

A point target and a deep-TMS field target are not automatically comparable through one global utility score.

---

# 48. COMPARISON DOMAIN OBJECT

```ts
interface ComparisonDomain {
  id: UUID;
  code: string;

  indication_module_id: UUID;

  candidate_ids: UUID[];

  geometry_constraints: TargetGeometryType[];

  objective_scope: UUID[];

  evidence_scope: UUID[];

  ranking_profile_id: UUID;

  comparability_basis: string;
}
```

---

# 49. NO GLOBAL BRAIN RANK

MAGNIOM SHALL NOT produce:

```text
Target 1 = left DLPFC 0.91
Target 2 = M1 0.87
Target 3 = dmPFC 0.82
Target 4 = parietal cortex 0.79
```

from an unrestricted whole-brain competition.

Ranking occurs only inside scientifically valid comparison domains.

---

# 50. RANKING PHILOSOPHY

Ranking answers:

> Among scientifically eligible and meaningfully comparable candidates, which candidate best satisfies the approved purpose under the current Scientific Policy?

Ranking does NOT answer:

> Which brain region has the highest universal treatment score?

---

# 51. EVIDENCE STRATIFICATION BEFORE RANKING

The core SHALL first respect evidence eligibility/strata.

Example:

```text
Evidence Tier A candidates
        ↓
compare within permitted A domain

Evidence Tier B candidates
        ↓
compare only if policy allows role B
```

A Tier C candidate SHALL NOT outrank a Tier A candidate merely because its patient connectivity value is numerically larger unless a validated policy explicitly permits such a relationship.

---

# 52. DOMAIN-SPECIFIC FEATURE MODEL

Possible features include:

- phenotype concordance;
- therapeutic-circuit concordance;
- patient-specific FC;
- somatotopic concordance;
- lesion-context compatibility;
- anatomical accessibility;
- E-field quality;
- task localisation;
- motor-map fit;
- treatment-context compatibility;
- normative context;
- Systems Context;
- reliability;
- counterfactual improvement.

No feature is universally applicable to every indication.

---

# 53. UTILITY IS NOT EVIDENCE

Where a module uses an aggregate ranking utility:

```text
Utility(candidate)
```

evidence SHALL remain outside the generic compensable utility.

Canonical structure:

```text
Evidence gate / stratum
       ↓
Eligibility
       ↓
Comparison domain
       ↓
Domain-specific utility
```

not:

```text
Utility =
0.25 evidence
+ 0.20 phenotype
+ 0.30 connectivity
+ ...
```

---

# 54. GEOMETRIC UTILITY

For compatible domains, the Scientific Policy MAY specify a weighted geometric utility such as:

```text
U(c) =
Π f_i(c) ^ w_i
```

where:

- each `f_i` is normalised and scientifically interpretable;
- weights are policy-controlled;
- missing features follow explicit rules;
- hard gates have already passed.

The geometric form is useful because a very poor critical dimension cannot be fully rescued by unrelated high values.

It is not mandatory across every module.

---

# 55. FEATURE COMPLETENESS

A feature may participate in comparative ranking only when its completeness policy is satisfied.

Example:

```text
Candidate A has E-field
Candidate B lacks E-field
```

MAGNIOM SHALL NOT simply score B as zero unless Scientific Policy specifically validates that treatment.

Instead:

```text
all comparable candidates receive E-field
```

or:

```text
E-field omitted from comparative ranking
```

or:

```text
domain split
```

as scientifically appropriate.

---

# 56. MISSING IS NOT ZERO

The following are distinct:

```text
measurement absent
measurement failed
measurement not required
measurement research only
measurement qualified
measurement value = zero
```

The engine SHALL preserve the distinction.

---

# 57. PHENOTYPE CONCORDANCE

For phenotype-driven modules, an approved formulation may be:

```text
P(c) =
Σ W_d × Coverage(c,d)
──────────────────────
       Σ W_d
```

where:

- `d` is a clinician-approved phenotype/objective domain;
- `W_d` reflects approved priority;
- `Coverage(c,d)` derives from an evidence-supported relationship.

This represents concordance, not expected treatment response.

---

# 58. NO "NETWORK SYMPTOMS"

The engine SHALL NOT implement uncontrolled constructs such as:

```text
DMN symptoms
CEN symptoms
SN symptoms
```

unless a validated clinical ontology explicitly establishes them.

Clinical phenotype remains clinical.

Network measurements remain scientific observations.

Their relationship requires evidence.

---

# 59. SYSTEMS CONTEXT LAYER

v2.1 introduces a generic:

```text
SystemsContextBundle
```

A systems profile represents distributed relationships relevant to a candidate or therapeutic circuit.

Initial supported specialised implementation:

# Triple-Network Systems Context

covering:

- CEN;
- DMN;
- SN;
- CEN↔DMN;
- SN↔CEN;
- SN↔DMN;
- global segregation/integration where qualified.

---

# 60. SYSTEMS CONTEXT BUNDLE

```ts
interface SystemsContextBundle {
  id: UUID;
  case_id: UUID;

  provider_release_id: UUID;

  profiles: SystemsContextProfile[];

  capability_status:
    | "qualified"
    | "qualified_with_limits"
    | "research_only"
    | "not_qualified"
    | "not_assessable";

  provenance: Provenance;
}
```

---

# 61. TRIPLE-NETWORK INPUT

The Target Engine MAY receive a `TripleNetworkProfile` containing:

```text
CEN within-network integrity
DMN within-network integrity
SN within-network integrity

CEN-DMN coupling / segregation
SN-CEN coupling / segregation
SN-DMN coupling / segregation

global integration
global segregation

metric reliability
normative context
```

The Target Engine SHALL preserve the individual relationships.

---

# 62. NO TRIPLE-NETWORK SCORE

Prohibited:

```text
TripleNetworkScore = 78
```

and:

```text
U =
Evidence
+ Phenotype
+ FC
+ TripleNetworkScore
```

The Triple Network is relational.

Collapsing it into one generic scalar would erase scientifically material structure.

---

# 63. SYSTEMS CONTEXT AUTHORITY LEVELS

Each systems feature SHALL have one of:

```text
contextual
qualified_supportive
qualified_ranking_feature
research_only
prohibited
```

### `contextual`

May appear in explanation/convergence.

Cannot modify rank.

### `qualified_supportive`

May influence defined convergence/contradiction interpretation but not independently create or displace a target.

### `qualified_ranking_feature`

May enter a specific validated ranking model.

Requires explicit indication-specific Scientific Policy.

### `research_only`

Research interface only.

### `prohibited`

Not used.

---

# 64. DEFAULT TRIPLE-NETWORK AUTHORITY

Until a module-specific validation explicitly demonstrates otherwise:

```text
Triple-Network Profile
=
contextual
```

for Clinical Mode.

This means it can:

- explain target-network relationships;
- identify concordance;
- identify contradiction;
- contribute to convergence reporting;
- inform clinician interpretation.

It cannot:

- independently generate a candidate;
- grant eligibility;
- overcome low evidence;
- rescue unreliable FC;
- automatically change rank;
- determine stimulation direction;
- imply causal network correction.

---

# 65. NETWORK ≠ TARGET FAMILY

MAGNIOM SHALL NOT automatically create:

```text
TargetFamily: CEN
TargetFamily: DMN
TargetFamily: SN
```

merely because those networks are measurable.

A large-scale functional network is not necessarily a stimulation target.

A clinical target requires an EvidencePath linking:

```text
indication
→ objective
→ therapeutic model
→ target family
→ targeting strategy
```

---

# 66. NO SIMPLISTIC NETWORK CONTROL RULES

Clinical Mode SHALL prohibit generic rules such as:

```text
DMN high → inhibit DMN
CEN low → excite CEN
SN abnormal → stimulate SN
```

and:

```text
CEN-DMN dysconnectivity
→ choose the strongest CEN cortical node
```

unless a future indication-specific validated model explicitly establishes such a rule.

---

# 67. SYSTEMS CONTEXT FEATURE

```ts
interface CandidateSystemsContextProfile {
  profile_id: UUID;

  relationships: {
    system_a: string;
    system_b?: string;

    relationship_type: string;

    interpretation:
      | "supportive"
      | "neutral"
      | "contradictory"
      | "uncertain";

    authority:
      | "contextual"
      | "qualified_supportive"
      | "qualified_ranking_feature"
      | "research_only";

    reliability:
      | "high"
      | "moderate"
      | "low"
      | "not_assessable";

    evidence_claim_ids: UUID[];
  }[];

  overall_interpretation:
    | "supportive"
    | "neutral"
    | "contradictory"
    | "mixed"
    | "not_assessable";
}
```

---

# 68. THERAPEUTIC CIRCUIT FIRST

A Systems Context profile SHALL attach to:

```text
evidence-supported therapeutic circuit
```

or:

```text
candidate
```

It SHALL NOT reverse the scientific direction:

```text
network anomaly
→ invented therapeutic circuit
```

Patient imaging enters after evidence.

---

# 69. INDIVIDUAL CONNECTOME REFINEMENT

For an approved TargetFamily, connectomic personalisation may:

1. measure the relevant therapeutic relationship;
2. search within an approved region;
3. identify stable patient-specific clusters;
4. estimate localisation reliability;
5. compare with the evidence baseline;
6. determine whether refinement adds validated value.

It SHALL NOT conduct unrestricted whole-brain clinical optimisation.

---

# 70. SEARCH SPACE

Every personalised clinical generator SHALL define:

```text
approved TargetFamily
+
anatomical ROI
+
hemisphere
+
therapeutic circuit
+
permitted geometry
```

Whole-brain clinical argmax is prohibited unless a future separately validated strategy specifically permits it.

---

# 71. CLUSTER OVER ISOLATED EXTREMUM

Where functional localisation is used, stable clusters SHOULD generally be preferred over isolated single-vertex extrema.

Relevant information may include:

- peak;
- cluster centre;
- cluster extent;
- spatial dispersion;
- cross-run overlap;
- split-half overlap;
- preprocessing sensitivity.

Numerical peak precision does not equal biological certainty.

---

# 72. COUNTERFACTUAL REQUIREMENT

Every patient-specific refinement that could displace an evidence-defined baseline SHALL have a counterfactual.

Typical counterfactual:

```text
evidence-only candidate
```

The personalised candidate SHALL be evaluated against the scientific baseline that would have been selected if patient-specific refinement were unavailable.

---

# 73. COUNTERFACTUAL OBJECT

```ts
interface CandidateCounterfactualProfile {
  personalised_candidate_id: UUID;

  counterfactual_candidate_id: UUID;

  same_target_family: boolean;
  same_evidence_path: boolean;

  geometry_difference?: GeometryDifference;

  objective_difference?: FeatureDifference[];

  circuit_difference?: FeatureDifference[];

  reliability_difference?: FeatureDifference[];

  accessibility_difference?: FeatureDifference[];

  efield_difference?: FeatureDifference[];

  systems_context_difference?: FeatureDifference[];

  incremental_value:
    | "meaningful"
    | "marginal"
    | "none"
    | "negative"
    | "not_assessable";

  evidence_transfer:
    | "within_validated_range"
    | "conditionally_supported"
    | "outside_validated_range"
    | "not_assessable";

  adoption:
    | "adopt_refinement"
    | "retain_baseline"
    | "show_as_alternative"
    | "research_only";

  explanation: string;
}
```

---

# 74. PERSONALISATION ADOPTION TEST

A personalised candidate may displace its baseline only if all mandatory criteria pass.

Canonical criteria:

```text
same defensible evidence family
+
permitted patient-specific method
+
sufficient reliability
+
meaningful incremental concordance/value
+
acceptable anatomy
+
accessibility not materially worse
+
evidence-transfer policy satisfied
+
no disqualifying contradiction
```

If not:

```text
retain evidence baseline
```

---

# 75. INCREMENTAL VALUE

Personalisation SHALL demonstrate more than:

```text
different coordinate
```

Possible validated incremental value includes:

- better therapeutic-circuit concordance;
- better clinically relevant phenotype concordance;
- improved somatotopic fit;
- better reliable target engagement proxy;
- improved accessibility;
- better validated field coverage;
- validated network-linked fit.

The exact criterion is indication-specific.

---

# 76. LARGE DISPLACEMENT

A large personalised displacement from an evidence-defined baseline SHALL NOT automatically imply superior personalisation.

It may instead indicate:

- poor measurement;
- unstable localisation;
- different search basin;
- evidence-transfer failure;
- clinically meaningful alternative;
- scientific contradiction.

The engine SHALL raise:

```text
PERSONALISATION_MAJOR_DIVERGENCE
```

when applicable.

---

# 77. PERSONALISATION FAILURE DOES NOT DESTROY BASELINE

If personalised measurement is:

- missing;
- unreliable;
- inconsistent;
- incompatible;
- outside validated transfer rules;

then:

```text
personalised refinement disabled
```

The evidence-defined baseline may remain eligible if otherwise valid.

---

# 78. NORMATIVE MODELS

Normative information SHALL remain:

- model-specific;
- acquisition-compatible;
- processing-compatible;
- population-specific;
- feature-specific.

The engine SHALL NOT use a universal:

```text
brain abnormality score
```

as a clinical target feature.

---

# 79. NORMATIVE CONTEXT DEFAULT ROLE

Unless separately validated:

```text
normative deviation
=
contextual
```

A large normative deviation does not independently create a target.

---

# 80. NO ANOMALY-DRIVEN TARGETING BY DEFAULT

Prohibited Clinical flow:

```text
find largest normative abnormality
        ↓
find nearest stimulable cortex
        ↓
treat
```

Such a model would require its own evidence path and validation.

---

# 81. E-FIELD INTEGRATION

E-field information may have policy-defined roles:

```text
gate
ranking feature
tie-breaker
context only
research only
```

The role may differ by indication and geometry.

---

# 82. E-FIELD COMPLETENESS

Within a comparison domain:

```text
all candidates receive comparable E-field analysis
```

or:

```text
E-field is excluded from comparative ranking
```

unless a validated partial-data model specifies otherwise.

Missing E-field SHALL NOT selectively penalise one candidate.

---

# 83. FIELD TARGETS

For field-defined interventions, important properties may include:

- ROI field coverage;
- field magnitude distribution;
- field direction;
- spatial extent;
- deep/superficial coverage;
- off-target exposure;
- pose feasibility.

A field target SHALL NOT be treated as a point merely for algorithmic convenience.

---

# 84. GEOMETRY DIFFERENCE

```ts
interface GeometryDifference {
  metric_type:
    | "euclidean_mm"
    | "surface_geodesic_mm"
    | "roi_overlap"
    | "surface_overlap"
    | "hausdorff_mm"
    | "field_overlap"
    | "roi_field_coverage_difference"
    | "network_region_overlap"
    | "somatotopic_concordance"
    | string;

  value?: number;
  unit?: string;

  interpretation: string;
}
```

Euclidean distance is not universally appropriate.

---

# 85. RANKING PROFILE

```ts
interface RankingProfile {
  id: UUID;
  version: string;

  comparison_domain_code: string;

  required_features: string[];
  optional_features: string[];

  feature_rules: RankingFeatureRule[];

  aggregation_method:
    | "lexicographic"
    | "weighted_geometric"
    | "pairwise"
    | "rule_based"
    | "module_specific";

  tie_breaking_rules: TieBreakingRule[];

  missing_feature_policy: MissingFeaturePolicy;

  scientific_policy_release_id: UUID;
}
```

---

# 86. LEXICOGRAPHIC RANKING

Where evidence/science supports ordered priorities, an indication may use lexicographic ranking.

Example:

```text
1. required evidence stratum
2. required reliability class
3. objective concordance
4. accessibility
5. validated patient-specific benefit
```

This may be preferable to arbitrary weighted scoring.

---

# 87. TIE HANDLING

Ties SHALL be deterministic.

Possible policies:

- predefined stable ordering;
- evidence priority;
- reliability priority;
- lower-complexity candidate;
- baseline preference;
- candidate ID only as final deterministic technical fallback.

The UI SHALL not imply meaningful superiority where candidates are essentially tied.

---

# 88. REDUNDANCY

A Target Slate is not a list of the five highest-scoring coordinates.

The engine SHALL suppress scientifically redundant candidates.

Redundancy is:

# geometry-aware, objective-aware, evidence-aware and role-aware.

---

# 89. REDUNDANCY DOMAINS

Potential redundancy dimensions:

```text
spatial proximity
surface proximity
ROI overlap
E-field overlap
therapeutic-circuit similarity
objective overlap
target-family identity
network overlap
somatotopic identity
EvidencePath overlap
candidate role
```

No single universal threshold SHALL apply to all target types.

---

# 90. REDUNDANCY OBJECT

```ts
interface RedundancyAssessmentV21 {
  candidate_a_id: UUID;
  candidate_b_id: UUID;

  comparability:
    | "comparable"
    | "partially_comparable"
    | "not_comparable";

  geometry_relationship?: GeometryDifference[];

  target_family_overlap: boolean;

  therapeutic_circuit_overlap:
    | "high"
    | "moderate"
    | "low"
    | "none"
    | "not_assessable";

  objective_overlap:
    | "high"
    | "moderate"
    | "low"
    | "none";

  evidence_path_overlap: boolean;

  field_overlap?: number;

  systems_context_overlap?: string;

  redundancy:
    | "redundant"
    | "partially_redundant"
    | "distinct";

  policy_rule_id: UUID;

  explanation: string;
}
```

---

# 91. REDUNDANCY IS NOT DISTANCE ALONE

Prohibited:

```text
if distance < 20 mm:
    suppress
```

without consideration of target semantics.

Two nearby somatotopic M1 targets may be meaningfully distinct.

Two more distant candidates may still be scientifically redundant if they represent the same target family, objective and therapeutic circuit.

---

# 92. CONVERGENCE

Convergence describes independent scientific signals supporting the same candidate or target hypothesis.

Possible sources:

- evidence;
- phenotype;
- patient FC;
- task localisation;
- motor mapping;
- lesion context;
- normative context;
- Systems Context;
- E-field;
- structural connectivity;
- anatomy.

Convergence is reported.

It is not an excuse to generate duplicates.

---

# 93. CONVERGENCE PRINCIPLE

High convergence should normally produce:

```text
one stronger candidate
```

not:

```text
five variants of the same candidate
```

---

# 94. CONVERGENCE PROFILE v2.1

```ts
interface CandidateConvergenceProfileV21 {
  source_domains: string[];

  relationships: {
    source_a: string;
    source_b: string;

    relationship:
      | "strongly_convergent"
      | "convergent"
      | "neutral"
      | "divergent"
      | "not_assessable";

    reliability?: string;

    interpretation: string;
  }[];

  overall:
    | "high"
    | "moderate"
    | "low"
    | "mixed"
    | "not_assessable";

  explanation: string;
}
```

---

# 95. SYSTEMS CONTEXT AND CONVERGENCE

Triple-Network information MAY contribute to convergence when:

- the relevant relationship is qualified;
- the candidate has an evidence-supported circuit connection;
- the interpretation is policy-permitted.

Example:

```text
Evidence-supported DLPFC circuit
+
reliable patient FC concordance
+
CEN-DMN contextual concordance
```

may increase explanatory coherence.

It does NOT prove treatment superiority.

---

# 96. CONTRADICTION

v2.1 SHALL explicitly preserve contradiction rather than hiding it inside an average score.

Potential contradictions include:

```text
patient FC supports candidate
but
Systems Context is discordant
```

or:

```text
excellent anatomical accessibility
but
therapeutic-circuit fit is weak
```

or:

```text
personalised candidate differs materially
from strongly supported baseline
```

---

# 97. CONTRADICTION PROFILE

```ts
interface CandidateContradictionProfile {
  candidate_id: UUID;

  contradictions: {
    source_a: string;
    source_b: string;

    severity:
      | "minor"
      | "moderate"
      | "major";

    interpretation: string;

    gate_effect:
      | "none"
      | "warning"
      | "conditional"
      | "ineligible";
  }[];

  overall:
    | "none"
    | "minor"
    | "material"
    | "major";
}
```

---

# 98. LOW CONVERGENCE

Low convergence SHALL NOT automatically force abstention.

A valid slate may include:

```text
strong evidence baseline
+
credible divergent alternative
+
explicit uncertainty
```

Hard gates determine mandatory exclusion.

Convergence informs interpretation.

---

# 99. COVERAGE

Coverage asks:

> Does the Target Slate represent the clinically relevant scientific alternatives that remain after gating and redundancy?

Coverage does NOT mean:

> More targets are better.

---

# 100. OBJECTIVE COVERAGE

```ts
interface ObjectiveCoverage {
  clinical_objective_id: UUID;

  candidate_ids: UUID[];

  coverage:
    | "strong"
    | "partial"
    | "weak"
    | "none";

  evidence_basis: string;

  explanation: string;
}
```

Coverage SHALL be evidence-aware.

---

# 101. COVERAGE IS NOT EXPECTED EFFECT

A candidate covering two objective domains does not mean:

```text
twice the clinical effect
```

Coverage is a slate-construction concept.

It is not treatment-effect prediction.

---

# 102. CANDIDATE ROLES v2.1

The canonical slate roles are:

```text
P1 — Evidence Anchor
P2 — Clinically Distinct Therapeutic Alternative
P3 — Qualified Personalised / Mechanistic Refinement

A1 — Network / Mechanistic Alternative
A2 — Clinical / Technical Alternative
```

Roles are semantic.

They are not mandatory slots.

---

# 103. P1 — EVIDENCE ANCHOR

P1 SHOULD represent the strongest clinically relevant evidence-defined hypothesis available for the approved objective and context.

P1 is not necessarily:

```text
the candidate with the numerically highest personalised score
```

It anchors the specialist's interpretation against the strongest defensible baseline.

---

# 104. P2 — CLINICALLY DISTINCT THERAPEUTIC ALTERNATIVE

P2 requires materially distinct clinical/scientific information.

Examples:

- different supported therapeutic circuit;
- different evidence-supported target family;
- different relevant objective;
- different laterality strategy;
- meaningfully distinct field geometry.

Coordinate separation alone is insufficient.

---

# 105. P3 — QUALIFIED PERSONALISED / MECHANISTIC REFINEMENT

P3 MAY represent:

- a patient-specific refinement;
- a strongly supported mechanistic alternative;
- an additional clinically meaningful distinct hypothesis.

P3 SHALL NOT exist merely to fill a third slot.

A valid slate may contain only P1 and P2.

Or only P1.

---

# 106. A1 — NETWORK / MECHANISTIC ALTERNATIVE

A1 MAY expose a scientifically credible alternative that is useful for specialist review but does not warrant Primary status.

Examples:

- credible divergent patient FC hypothesis;
- network-linked alternative;
- alternative circuit hypothesis;
- patient-specific refinement that failed displacement criteria but remains informative.

Clinical evidence requirements still apply.

Research-only candidates cannot occupy A1 in Clinical Mode.

---

# 107. A2 — CLINICAL / TECHNICAL ALTERNATIVE

A2 MAY capture:

- different evidence-supported strategy;
- accessibility-driven alternative;
- device-compatible alternative;
- clinically relevant fallback;
- alternative geometry.

Again, no forced slot filling.

---

# 108. ROLE ASSIGNMENT

Role assignment occurs:

```text
after
eligibility
+
comparison
+
counterfactual
+
redundancy
+
coverage
```

not before.

A generator SHALL NOT permanently declare:

```text
I generated this as P1
```

The core assigns the final role.

---

# 109. ROLE INFORMATION VALUE

To occupy an additional slate role, a candidate SHOULD contribute meaningful information not already represented.

Possible information value includes:

- distinct therapeutic hypothesis;
- distinct objective coverage;
- distinct evidence-supported circuit;
- meaningful personalisation;
- clinically meaningful accessibility alternative;
- meaningful uncertainty representation.

If not, suppress as redundant.

---

# 110. MINIMAL USEFUL SLATE

The Target Engine SHALL construct:

# the smallest useful Target Slate.

Not:

# the fullest possible Target Slate.

Canonical cardinality:

```text
0–3 Primary Candidates
0–2 Additional Candidates
```

Total:

```text
0–5
```

Five is a maximum, not a target.

---

# 111. SLATE ASSEMBLY PRINCIPLE

Conceptually:

```text
eligible candidates
        ↓
remove scientific redundancy
        ↓
preserve meaningful alternatives
        ↓
evaluate objective coverage
        ↓
evaluate information value
        ↓
assign roles
        ↓
stop when additional candidates add insufficient value
```

---

# 112. SLATE ASSEMBLY PROFILE

```ts
interface SlateAssemblyProfileV21 {
  maximum_primary: number;
  maximum_additional: number;

  minimum_information_value_for_new_slot: string;

  require_evidence_anchor: boolean;

  allow_personalised_primary: boolean;

  redundancy_policy_id: UUID;

  objective_coverage_policy_id: UUID;

  role_assignment_policy_id: UUID;

  abstention_policy_id: UUID;
}
```

---

# 113. NO FORCED P3

If the engine finds no scientifically distinct third Primary Candidate:

```text
NO_THIRD_PRIMARY
```

SHALL be recorded.

The engine SHALL NOT manufacture P3.

---

# 114. NO FORCED ALTERNATIVES

If no meaningful Additional Candidate exists:

```text
Additional Candidates = 0
```

This is valid.

---

# 115. TARGET SLATE

```ts
interface TargetSlateV21 {
  id: UUID;

  case_id: UUID;
  case_indication_id: UUID;

  primary_candidate_ids: UUID[];
  additional_candidate_ids: UUID[];

  role_assignments: {
    candidate_id: UUID;
    role: TargetCandidateRole;
  }[];

  objective_coverage: ObjectiveCoverage[];

  slate_convergence_summary: string;

  slate_uncertainty_summary: string;

  warnings: EngineWarning[];

  abstention?: AbstentionProfileV21;

  target_engine_release_id: UUID;
  indication_module_release_id: UUID;
  scientific_policy_release_id: UUID;
  evidence_library_release_id: UUID;

  input_manifest_sha256: SHA256;
  output_manifest_sha256: SHA256;

  created_at: ISO8601UTC;
}
```

`created_at` SHALL NOT influence scientific content.

---

# 116. TARGET SLATE IS NOT A PRESCRIPTION

A Target Slate means:

```text
scientifically defensible candidate set
for specialist consideration
```

It does not mean:

```text
prescribed targets
```

---

# 117. ABSTENTION

MAGNIOM SHALL support:

```text
NO CLINICAL TARGET SLATE
```

and:

```text
EVIDENCE-ONLY TARGET SLATE
```

depending on the failure state.

Abstention is a successful scientific outcome when appropriate.

---

# 118. ABSTENTION PROFILE

```ts
interface AbstentionProfileV21 {
  type:
    | "no_clinical_target_slate"
    | "evidence_only_slate"
    | "personalisation_unavailable"
    | "insufficient_reliable_measurement"
    | "evidence_not_sufficient"
    | "context_incompatible"
    | "technical_constraint"
    | "research_only";

  reason_codes: string[];

  fallback_available: boolean;

  fallback_candidate_ids?: UUID[];

  clinician_message: string;
}
```

---

# 119. EXAMPLES OF ABSTENTION

### Imaging fails but evidence baseline remains valid

```text
EVIDENCE-ONLY TARGET SLATE
```

### Required evidence absent

```text
NO CLINICAL TARGET SLATE
```

### Required anatomy cannot be assessed

```text
NO CLINICAL TARGET SLATE
```

### Personalisation unreliable

```text
evidence baseline retained
```

---

# 120. ENGINE WARNINGS

Canonical warnings include:

```text
LOW_TARGET_CONVERGENCE
PERSONALISATION_MAJOR_DIVERGENCE
LIMITED_MEASUREMENT_RELIABILITY
LIMITED_FC_RELIABILITY
EVIDENCE_CONFLICT
OUTSIDE_STUDY_POPULATION
CONTEXT_LIMITATION
NORMATIVE_MODEL_LIMITATION
EFIELD_CONDITIONAL
NO_THIRD_PRIMARY
PERSONALISATION_NOT_ADOPTED
SYSTEMS_CONTEXT_LIMITED
TRIPLE_NETWORK_UNRELIABLE
TRIPLE_NETWORK_RESEARCH_ONLY
NETWORK_CONTEXT_CONTRADICTION
MULTIMODAL_DISAGREEMENT
TARGET_GEOMETRY_UNCERTAIN
```

Warnings SHALL have structured reasons.

---

# 121. EXPLANATION ARCHITECTURE

Every Clinical candidate SHALL answer:

1. Why does this target family exist?
2. What evidence supports it?
3. Which clinical objective does it address?
4. Why is this candidate relevant to this patient?
5. Which patient-specific measurements influenced it?
6. How reliable are those measurements?
7. Did personalisation change the evidence baseline?
8. What did the counterfactual show?
9. What Systems Context is relevant?
10. Is the target accessible?
11. What alternatives exist?
12. Why might this candidate be wrong?

---

# 122. "WHY MAGNIOM NOMINATED THIS TARGET"

Every candidate SHALL include a structured statement conceptually equivalent to:

```text
Why MAGNIOM nominated this target
```

The explanation SHALL derive from canonical facts.

It SHALL not be free-form AI reasoning.

---

# 123. "WHY THIS TARGET MAY BE WRONG"

Every Clinical candidate SHALL explicitly expose limitations.

Possible reasons:

- evidence uncertainty;
- population mismatch;
- measurement limitations;
- localisation instability;
- pipeline sensitivity;
- lesion uncertainty;
- Systems Context contradiction;
- normative incompatibility;
- accessibility assumptions;
- E-field uncertainty;
- large baseline displacement;
- limited direct clinical validation.

---

# 124. EXPLANATION FACTS BEFORE LANGUAGE

The engine SHALL first generate:

```text
StructuredExplanationFacts
```

Then deterministic templates may generate clinician-facing language.

An LLM MAY later be used for optional presentation rewriting only if:

- ranking is already frozen;
- facts are immutable;
- LLM cannot add facts;
- LLM cannot change candidate ordering;
- LLM output is clearly non-authoritative;
- safety validation permits it.

---

# 125. NO HIDDEN CHAIN-OF-THOUGHT REQUIREMENT

MAGNIOM explanations SHALL expose:

- evidence;
- features;
- rules;
- gate outcomes;
- comparisons;
- warnings;
- provenance.

They SHALL NOT depend on opaque internal narrative reasoning.

The required artifact is structured scientific justification.

---

# 126. PROVENANCE CHAIN

Every candidate SHALL be reconstructable through:

```text
CaseIndication
        ↓
IndicationModuleRelease
        ↓
ScientificPolicyRelease
        ↓
EvidencePath
        ↓
TherapeuticCircuit
        ↓
TargetFamily
        ↓
CandidateGenerator
        ↓
MeasurementBundle
        ↓
ReliabilityBundle
        ↓
SystemsContextBundle
        ↓
CandidateDraft
        ↓
Gate Results
        ↓
Comparison Domain
        ↓
Counterfactual
        ↓
Ranking
        ↓
Slate Role
```

---

# 127. REPRODUCIBILITY MANIFEST

The engine SHALL record:

```text
input object IDs
input object hashes
Target Engine release
plugin release
generator releases
Scientific Policy release
Evidence Library release
Measurement provider releases
Systems Context provider releases
ranking profile
refinement profile
redundancy profile
slate assembly profile
output hashes
```

---

# 128. TARGET ENGINE OUTPUT

```ts
interface TargetEngineResultV21 {
  run_id: UUID;

  status:
    | "completed"
    | "abstained"
    | "failed";

  generated_candidate_ids: UUID[];

  eligible_candidate_ids: UUID[];

  suppressed_candidate_ids: UUID[];

  target_slate_id?: UUID;

  generator_results: CandidateGeneratorResultSummary[];

  capability_status: CapabilityStatus[];

  refinement_results: RefinementDecision[];

  systems_context_summary?: SystemsContextEvaluationSummary;

  convergence_results: CandidateConvergenceProfileV21[];

  contradiction_results: CandidateContradictionProfile[];

  redundancy_results: RedundancyAssessmentV21[];

  abstention?: AbstentionProfileV21;

  warnings: EngineWarning[];

  target_engine_release_id: UUID;
  indication_module_release_id: UUID;
  scientific_policy_release_id: UUID;
  evidence_library_release_id: UUID;

  reproducibility_manifest_sha256: SHA256;
}
```

---

# 129. CLINICIAN DECISION BOUNDARY

After Target Slate publication, the specialist may:

```text
accept
reject
modify
replace
defer
```

The final clinical target may originate from:

```text
MAGNIOM candidate
clinician-defined target
standard target
other clinically justified strategy
```

MAGNIOM SHALL preserve the difference between:

```text
algorithmic nomination
```

and:

```text
clinical decision.
```

---

# 130. CLINICIAN OVERRIDE

A clinician may override MAGNIOM.

The system SHALL capture:

- which candidate was chosen;
- whether modified;
- clinician-defined replacement if applicable;
- structured reason;
- attestation;
- timestamp;
- responsible clinician.

The Target Engine SHALL NOT silently rewrite its own historical result to match the clinician.

---

# 131. CLINICIAN ATTESTATION

Recommended:

> I have independently reviewed the clinical context, evidence provenance, measurement reliability, target alternatives and limitations. The final target selection represents my clinical decision and not an autonomous MAGNIOM prescription.

---

# 132. MDD MODULE — v2.1 PRINCIPLES

For an MDD module compatible with the existing v1 architecture:

```text
Evidence
    ↓
DLPFC / other permitted therapeutic families
    ↓
clinician-approved dysphoric/anxiosomatic objectives
    ↓
evidence baseline
    ↓
qualified patient FC refinement
    ↓
Triple-Network contextual interpretation
    ↓
counterfactual comparison
    ↓
minimal slate
```

Triple-Network information does not independently create an MDD target.

---

# 133. MDD PHENOTYPE

Where the approved MDD module uses:

```text
dysphoric burden
anxiosomatic burden
```

these remain clinical phenotype domains.

They SHALL NOT be relabelled:

```text
DMN phenotype
CEN phenotype
SN phenotype
```

without separate evidence.

---

# 134. MDD CONNECTOME PERSONALISATION

An MDD personalised target SHALL retain an evidence-only baseline.

The personalised target may be adopted only if its validated refinement test passes.

No assumption:

```text
individual target = superior target
```

is permitted.

---

# 135. MDD TRIPLE-NETWORK CONTEXT

A candidate may display:

```text
CEN relevance
DMN relevance
SN relevance

CEN↔DMN relationship
SN↔CEN relationship
SN↔DMN relationship
```

with:

```text
supportive
neutral
contradictory
uncertain
```

interpretation.

Clinical language SHALL state that these relationships are contextual unless stronger authority is validated.

---

# 136. OCD MODULE PRINCIPLE

An OCD module may have target geometries or devices that differ materially from focal MDD targeting.

The engine SHALL not force:

```text
OCD target
=
focal connectome coordinate
```

where the evidence is fundamentally field- or network-defined.

E-field and ROI coverage may therefore have different authority.

---

# 137. NEUROPATHIC PAIN MODULE PRINCIPLE

For somatotopic pain targeting:

```text
affected body region
+
clinical objective
+
evidence-supported M1 strategy
+
qualified motor localisation where available
```

may matter more than resting-state FC.

No modality inheritance is allowed merely because MDD uses rs-fMRI.

---

# 138. STROKE MOTOR MODULE PRINCIPLE

Potential factors:

```text
lesion context
motor phenotype
affected side
motor mapping
MEP context
structural integrity
```

Patient-specific lesion information cannot automatically invent a new cortical target.

Module rules determine scientifically valid transformations.

---

# 139. POST-STROKE APHASIA PRINCIPLE

Potential inputs may include:

- lesion anatomy;
- language phenotype;
- task localisation;
- language-network measurement;
- treatment context.

The engine SHALL respect the validated role of each modality.

---

# 140. TBI MODULE PRINCIPLE

TBI requires particular attention to:

- structural distortion;
- skull/anatomy;
- registration reliability;
- lesion context;
- field modelling where relevant.

Template-derived targets SHALL not be assumed valid when anatomy makes correspondence unreliable.

---

# 141. PTSD MODULE PRINCIPLE

An MDD connectome rule SHALL NOT automatically transfer to PTSD merely because some anatomy or networks overlap.

Evidence transfer across indications requires explicit Scientific Policy.

---

# 142. TINNITUS MODULE PRINCIPLE

Tinnitus targeting may depend on:

- tinnitus phenotype;
- laterality;
- audiology;
- target strategy;
- evidence-supported auditory or non-auditory circuits.

MRI is not mandatory merely because MAGNIOM can process it.

---

# 143. NO MODALITY INHERITANCE

Prohibited:

```text
MDD uses rs-fMRI
→ every indication should use rs-fMRI
```

or:

```text
stroke uses lesion mapping
→ every neurological indication needs lesion mapping
```

Indication-specific evidence determines measurement requirements.

---

# 144. NO EVIDENCE TRANSFER BY ANATOMICAL OVERLAP

Prohibited:

```text
Target A works in MDD
Target A anatomically overlaps PTSD circuit
therefore Target A is evidence-supported for PTSD
```

Anatomical overlap is not evidence transfer.

---

# 145. NO PROTOCOL INFERENCE

The Target Engine ranks targets.

It SHALL NOT infer:

```text
hyperconnectivity → cTBS
hypoconnectivity → iTBS
```

or similar stimulation-protocol mappings without separately validated evidence and a distinct authorised protocol-decision system.

Target selection and protocol selection remain separate.

---

# 146. TREATMENT EFFECT PREDICTION

MAGNIOM v2.1 SHALL NOT expose response probabilities such as:

```text
82% chance of remission
```

unless a separately validated predictive model has:

- appropriate dataset;
- external validation;
- calibration;
- locked version;
- indication-specific authorisation;
- regulatory approval where required.

Target ranking is not response prediction.

---

# 147. RESEARCH MODE

Research Mode MAY permit:

- novel target families;
- exploratory network candidates;
- alternative ranking models;
- dynamic FC;
- novel normative models;
- multimodal fusion;
- experimental network metrics;
- novel personalisation;
- candidate-generating models not yet clinically authorised.

All outputs SHALL remain:

```text
RESEARCH
```

---

# 148. RESEARCH OUTPUT LABEL

Recommended:

> **RESEARCH HYPOTHESIS — NOT A VALIDATED CLINICAL TARGET RECOMMENDATION**

No Research output may silently appear on a Clinical Target Slate.

---

# 149. RESEARCH-TO-CLINICAL PROMOTION

A new algorithmic capability SHOULD progress through:

```text
Research implementation
        ↓
technical verification
        ↓
scientific reproducibility
        ↓
measurement reliability
        ↓
retrospective validation
        ↓
prospective / silent validation where required
        ↓
clinical utility assessment
        ↓
Scientific Policy approval
        ↓
Clinical release
```

No feature-flag shortcut.

---

# 150. SYSTEMS CONTEXT PROMOTION

For a Triple-Network feature to progress from:

```text
contextual
```

to:

```text
qualified_ranking_feature
```

the validation program SHOULD establish:

1. precise network definition;
2. acquisition compatibility;
3. preprocessing compatibility;
4. metric reproducibility;
5. population applicability;
6. indication-specific association;
7. incremental predictive/targeting value;
8. robustness to reasonable pipeline variation;
9. comparison against simpler baselines;
10. prospective or otherwise adequate validation;
11. clinically interpretable failure behaviour.

---

# 151. NO FEATURE PROMOTION BY PLAUSIBILITY

A biologically compelling finding is insufficient.

Prohibited:

```text
makes neuroscientific sense
→ activate in Clinical ranking
```

Promotion requires evidence and governance.

---

# 152. EXTERNAL ML MODELS

Any ML model that influences clinical target ranking SHALL be:

- fixed;
- versioned;
- reproducible;
- validated;
- deterministic or deterministically seeded;
- input-bounded;
- output-bounded;
- monitored for distribution shift where appropriate;
- explicitly permitted by Scientific Policy.

A generic LLM SHALL NOT rank targets.

---

# 153. BLACK-BOX MODELS

A model that cannot provide sufficient:

- provenance;
- validation;
- input definition;
- failure behaviour;
- reproducibility;

SHALL NOT receive Clinical ranking authority merely because its retrospective accuracy appears promising.

---

# 154. SITE-SPECIFIC SCIENTIFIC OVERRIDES

Ordinary organisation settings SHALL NOT allow:

```text
increase right-DLPFC weight
reduce reliability threshold
prefer our clinic's coordinate
ignore evidence tier B restriction
```

Site-specific scientific adaptation requires a separately governed validated configuration.

---

# 155. USER-EDITABLE WEIGHTING

Clinical users SHALL NOT have arbitrary ranking sliders such as:

```text
Connectivity importance: 100%
Evidence importance: 20%
```

Scientific weighting belongs to validated Scientific Policy.

Clinical users may define legitimate clinical priorities through controlled ontology objects, not manipulate algorithm mathematics ad hoc.

---

# 156. CHANGE CONTROL

Changes to any of the following MAY alter clinical output:

- gate logic;
- thresholds;
- plugin logic;
- candidate generators;
- EvidencePaths;
- ranking profile;
- refinement rules;
- Systems Context authority;
- network definitions;
- counterfactual logic;
- redundancy;
- convergence;
- role assignment;
- slate assembly;
- E-field role;
- tie-breaking.

Such changes SHALL create new controlled releases.

---

# 157. NO SILENT TARGET MOVEMENT

A software update SHALL NOT silently change a historical target.

Historical runs remain immutable.

New releases produce new Target Engine results.

---

# 158. SCIENTIFIC IMPACT ANALYSIS

For material algorithm changes, validation SHOULD measure:

```text
candidate-set changes
eligibility changes
rank-order changes
target displacement
role-assignment changes
personalisation adoption changes
redundancy changes
slate-size changes
abstention changes
warning changes
```

---

# 159. GOLDEN CASES

The Target Engine validation suite SHOULD include:

- evidence-only baseline case;
- high-quality personalisation case;
- unreliable personalisation case;
- major baseline divergence;
- low convergence;
- network contradiction;
- systems context unavailable;
- E-field unavailable;
- lesion-invalid target;
- geometry incompatibility;
- no-third-primary case;
- redundant-candidate case;
- research leakage attempt;
- incompatible release case;
- missing measurement case;
- equal-rank deterministic tie;
- multi-objective case;
- abstention case.

---

# 160. DETERMINISTIC GOLDEN TEST

For a frozen golden case:

```text
100 executions
```

SHALL yield scientifically equivalent:

```text
candidate set
gate results
rank order
refinement decisions
suppression
slate
warnings
explanations
hash
```

within defined numerical determinism tolerances.

---

# 161. MONOTONICITY TESTS

Where scientifically required, tests SHOULD confirm properties such as:

```text
worse reliability cannot improve qualification
```

```text
failed evidence cannot improve eligibility
```

```text
loss of a mandatory measurement cannot create personalisation
```

```text
adding contradictory evidence cannot silently increase certainty
```

---

# 162. COUNTERFACTUAL TESTS

Validation SHALL test:

- personalised clearly better;
- personalised marginally better;
- personalised worse;
- personalised inaccessible;
- personalised unreliable;
- personalised outside evidence-transfer range;
- baseline unavailable;
- incompatible comparison.

Expected adoption behaviour SHALL be fixed by policy.

---

# 163. REDUNDANCY TESTS

Cases SHALL include:

- spatially close but clinically distinct;
- spatially distant but scientifically redundant;
- high E-field overlap;
- low E-field overlap;
- same objective/different circuit;
- same circuit/different objective;
- same candidate from multiple generators.

---

# 164. CONVERGENCE TESTS

Tests SHOULD verify:

```text
multiple sources supporting same target
→ one candidate with richer convergence
```

not:

```text
multiple duplicate slate entries.
```

---

# 165. SYSTEMS CONTEXT TESTS

The engine SHALL test:

- Triple-Network qualified and supportive;
- qualified and contradictory;
- low reliability;
- unavailable;
- Research only;
- incompatible definition;
- ranking authority absent;
- ranking authority explicitly granted in synthetic future module.

Context-only features SHALL never alter rank.

---

# 166. EVIDENCE CEILING TEST

A lower-authority candidate with highly favourable patient features SHALL not exceed an evidence ceiling unless policy explicitly permits its role.

This is a critical safety invariant.

---

# 167. MODE-SEPARATION TEST

Every Research-only:

- candidate generator;
- feature;
- network metric;
- normative model;
- target family;

SHALL be tested against attempted Clinical execution.

Expected result:

```text
rejected
```

or:

```text
excluded from Clinical result
```

according to architecture.

---

# 168. LATERALITY TEST

For laterality-sensitive modules, test:

- input phenotype side;
- lesion side;
- target hemisphere;
- motor-map side;
- coordinate orientation;
- exported neuronavigation space.

Laterality inconsistency SHALL fail safely.

---

# 169. PROHIBITED ENGINE BEHAVIOURS

MAGNIOM v2.1 SHALL NOT:

```text
generate a target from diagnosis alone

rank unrestricted whole-brain abnormality

use unapproved evidence

create clinical evidence from patient imaging

transfer evidence between indications because anatomy overlaps

treat missing measurement as zero

treat unreliable measurement as weak-but-usable automatically

treat field targets as point targets

treat somatotopic targets as generic coordinates

move targets around lesions without approved logic

infer protocol from connectivity sign

use network abnormality as an autonomous clinical target rule

collapse Triple Network into a generic clinical score

allow contextual Systems Context to change rank

use failed E-field as ordinary low score

compare scientifically incompatible candidates globally

hide the evidence baseline when personalisation exists

hide negative evidence

hide algorithmic contradiction

hide suppressed candidates from provenance

allow Research candidate onto Clinical Slate

produce response probability without validation

fill all five Target Slate positions automatically

invent P3

use LLM output in deterministic ranking

use current internet evidence during target generation

allow clinic-specific secret weighting
```

---

# 170. CLINICAL SAFETY PRINCIPLES

# Evidence defines which paths may exist.

# Scientific Policy determines which paths are permitted.

# The indication module determines which scientific model applies.

# Plugins generate hypotheses; they do not grant authority.

# The core independently verifies every hypothesis.

# Measurement availability does not imply measurement authority.

# Reliability is capability-specific.

# Patient-specific refinement must earn influence.

# Systems context remains contextual until independently validated.

# Different target geometries require different comparison logic.

# Evidence is not a compensable generic score.

# Missing data are not zero.

# Convergence does not require duplicate candidates.

# Contradiction remains visible.

# Research availability never implies Clinical permission.

# Abstention remains valid.

# The smallest useful slate is preferred.

# Alternatives remain visible.

# The specialist decides.

---

# 171. v2.1 CANONICAL CONTRACT

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
CAPABILITY-SPECIFIC RELIABILITY
        +
QUALIFIED SYSTEMS CONTEXT
        +
ANATOMY / DEVICE / FIELD CONTEXT
        ↓
REGISTERED INDICATION PLUGIN
        ↓
APPROVED CANDIDATE GENERATORS
        ↓
CANDIDATE DRAFTS
        ↓
CORE HARD GATES
        ↓
SCIENTIFIC COMPARISON DOMAINS
        ↓
COUNTERFACTUAL / REFINEMENT ANALYSIS
        ↓
DOMAIN-SPECIFIC RANKING
        ↓
REDUNDANCY
        ↓
CONVERGENCE + CONTRADICTION
        ↓
OBJECTIVE COVERAGE
        ↓
ROLE ASSIGNMENT
        ↓
MINIMAL USEFUL TARGET SLATE
        ↓
STRUCTURED EXPLANATION
        ↓
SPECIALIST DECISION
```

---

# 172. v2.1 REFERENCE ALGORITHM

```ts
function generateTargetSlateV21(
  ctx: ResolvedTargetingContextV21
): TargetEngineResultV21 {

  verifyInputManifest(ctx);

  verifyReleaseCompatibility(ctx);

  verifyMode(ctx);

  const plugin =
    resolveRegisteredIndicationPlugin(ctx);

  const evidencePaths =
    resolvePermittedEvidencePaths(ctx);

  validatePopulationAndClinicalContext(
    ctx,
    evidencePaths
  );

  const capabilityStatus =
    qualifyMeasurementCapabilities(ctx);

  const reliabilityStatus =
    qualifyReliability(ctx);

  const systemsContextStatus =
    qualifySystemsContext(ctx);

  const drafts =
    invokePermittedCandidateGenerators(
      plugin,
      ctx,
      evidencePaths
    );

  const validatedDrafts =
    validateCandidateDraftSchemas(drafts);

  const candidates =
    validatedDrafts.map(draft =>
      enrichCandidate(
        draft,
        ctx,
        evidencePaths,
        systemsContextStatus
      )
    );

  const gated =
    candidates.map(candidate =>
      applyCoreHardGates(
        candidate,
        ctx
      )
    );

  const eligible =
    gated.filter(isClinicallyEligible);

  const domains =
    constructComparisonDomains(
      eligible,
      ctx
    );

  const counterfactuals =
    buildRequiredCounterfactuals(
      domains,
      ctx
    );

  const refined =
    evaluateRefinementAdoption(
      domains,
      counterfactuals,
      ctx
    );

  const ranked =
    rankWithinComparisonDomains(
      refined,
      ctx
    );

  const redundancy =
    assessRedundancy(
      ranked,
      ctx
    );

  const nonRedundant =
    suppressRedundantCandidates(
      ranked,
      redundancy
    );

  const convergence =
    assessConvergence(
      nonRedundant,
      ctx
    );

  const contradictions =
    assessContradictions(
      nonRedundant,
      ctx
    );

  const coverage =
    assessObjectiveCoverage(
      nonRedundant,
      ctx
    );

  const roles =
    assignCandidateRoles(
      nonRedundant,
      coverage,
      convergence,
      contradictions,
      ctx
    );

  const slate =
    assembleMinimalUsefulSlate(
      nonRedundant,
      roles,
      coverage,
      ctx
    );

  const explanations =
    generateStructuredExplanations(
      slate,
      ctx
    );

  verifyOutputManifest(
    slate,
    explanations
  );

  return publishImmutableResult(
    slate,
    explanations,
    ctx
  );
}
```

---

# 173. WHY v2.1 DOES NOT ADD A `TripleNetworkScore`

A generic Triple-Network score would imply that:

```text
CEN integrity
DMN integrity
SN integrity
CEN-DMN coupling
SN-CEN coupling
SN-DMN coupling
```

can be validly collapsed into one monotonic quantity with universal treatment meaning.

v2.1 does not make that assumption.

Instead, network-system information remains:

```text
relationship-specific
+
metric-specific
+
reliability-specific
+
evidence-specific
+
indication-specific
```

This preserves future scientific extensibility without prematurely encoding an unsupported control model.

---

# 174. WHY v2.1 PUTS COUNTERFACTUALS BEFORE PERSONALISATION ADOPTION

Without an explicit baseline comparison, MAGNIOM could mistake:

```text
difference
```

for:

```text
improvement.
```

Therefore patient-specific refinement must answer:

> What scientifically relevant value does the personalised candidate add over the evidence-defined candidate we would otherwise use?

This is the correct question.

Not:

> Can the software generate a different coordinate?

---

# 175. WHY v2.1 USES INFORMATION-VALUE SLATE ASSEMBLY

A five-slot output risks creating false precision and artificial diversity.

The Target Slate exists to support specialist judgement.

Therefore each additional candidate must justify its presence by contributing:

```text
new clinical information
or
new scientific information
or
meaningful uncertainty
or
a viable alternative
```

If it does not, it is suppressed.

---

# 176. WHY v2.1 SEPARATES CONVERGENCE AND CONTRADICTION

Scientific inputs may:

```text
agree
```

or:

```text
disagree.
```

A generic combined score can conceal disagreement.

v2.1 instead treats both as explicit properties.

This allows a candidate to be:

```text
high evidence
+
high reliability
+
patient FC supportive
+
network context contradictory
```

without forcing those facts into a misleading average.

---

# 177. WHY v2.1 PRESERVES THE EVIDENCE ANCHOR

As personalised neuroscience becomes more sophisticated, the system must preserve a stable comparator.

The Evidence Anchor prevents the clinician from losing sight of:

```text
what would have been defensible without personalisation.
```

This is essential for:

- interpretation;
- safety;
- validation;
- auditability;
- scientific learning;
- prospective comparison.

---

# 178. LEARNING SYSTEM BOUNDARY

MAGNIOM may collect:

- clinician choices;
- outcomes;
- target coordinates;
- reliability;
- slate composition;
- personalisation adoption;
- warnings;
- treatment results.

However, production Clinical ranking SHALL NOT self-modify automatically from accumulating outcomes.

New learning requires:

```text
analysis
↓
model development
↓
validation
↓
governance
↓
new release
```

No uncontrolled online learning.

---

# 179. OUTCOME FEEDBACK

Outcome data MAY support:

- validation;
- calibration research;
- algorithm comparison;
- hypothesis generation;
- evidence development;
- future module releases.

Historical outcome data SHALL not retroactively change old Target Slates.

---

# 180. AUDITABILITY

For every Target Slate, an auditor SHALL be able to determine:

- which indication module ran;
- which evidence release applied;
- which policy release applied;
- which candidate generators ran;
- which measurements were available;
- which measurements were qualified;
- which systems features were contextual;
- which gates passed/failed;
- which candidates were suppressed;
- why personalisation was or was not adopted;
- how each final role was assigned;
- why the engine stopped adding candidates.

---

# 181. CLINICIAN-FACING TARGET CARD

Recommended high-level card:

```text
TARGET CANDIDATE

Role
Evidence Anchor

Target
Left prefrontal candidate

Why nominated
Strong evidence-defined target family with good
fit to the clinician-approved treatment objective.

Patient-specific refinement
Available — not adopted

Reliability
Qualified

Network context
Supportive / contextual

Accessibility
Qualified

Why this may be wrong
Patient-specific connectivity differed from the
evidence baseline, but the displacement did not
meet validated incremental-value criteria.

Evidence
View provenance

Alternatives
View slate
```

---

# 182. NETWORK CONTEXT CARD

Recommended:

```text
NETWORK CONTEXT

CEN        relevant
DMN        relevant
SN         contextual

CEN ↔ DMN       altered
SN ↔ CEN        within reference
SN ↔ DMN        altered

Interpretation
This target engages an evidence-supported circuit
that intersects the patient's measured CEN–DMN
configuration.

These network measurements are contextual and do
not independently establish target superiority.
```

---

# 183. PERSONALISATION CARD

Recommended:

```text
PATIENT-SPECIFIC REFINEMENT

Evidence baseline
Target A

Patient-specific candidate
Target B

Displacement
8.3 mm surface geodesic

Reliability
Moderate

Incremental circuit concordance
Small

Accessibility
Similar

Decision
Baseline retained

Reason
Patient-specific displacement was measurable but
did not meet the validated threshold for meaningful
incremental value.
```

---

# 184. ABSTENTION CARD

Recommended:

```text
PATIENT-SPECIFIC TARGETING NOT QUALIFIED

Resting-state data were processed successfully,
but patient-specific target localisation was not
sufficiently reproducible across independent
measurements.

MAGNIOM has therefore not used functional
personalisation for ranking.

The evidence-defined target remains available
where otherwise clinically appropriate.
```

---

# 185. VERSIONING

Every clinical Target Engine result SHALL reference exact:

```text
TargetEngineRelease
IndicationModuleRelease
ScientificPolicyRelease
EvidenceLibraryRelease
MeasurementBundle
ReliabilityBundle
SystemsContextBundle
candidate-generator versions
ranking profile
refinement profile
redundancy profile
slate assembly profile
```

---

# 186. HISTORICAL RECONSTRUCTION

Historical v2.0 and v1.x runs SHALL remain reconstructable.

v2.1 SHALL NOT rewrite historical outputs using the new Systems Context semantics.

If historical scans are reprocessed:

```text
new MeasurementBundle
+
new Target Engine run
```

shall be created.

---

# 187. v2.0 → v2.1 MIGRATION

Existing v2.0 fields remain valid.

v2.1 adds principally:

```text
SystemsContextBundle
CandidateSystemsContextProfile
CandidateContradictionProfile
TargetCandidateRole semantics
information-value slate assembly
explicit systems-authority gate
enhanced counterfactual profile
```

No historical v2.0 record must be mutated.

---

# 188. v2.1 NON-GOALS

v2.1 does not attempt to:

- create universal neuroscience truth;
- infer causal brain mechanisms from correlation;
- automatically select protocol;
- autonomously prescribe;
- diagnose from imaging;
- replace specialist judgement;
- maximise number of targets;
- guarantee personalisation;
- guarantee response;
- create a universal brain-health score;
- fuse all modalities into one hidden model;
- make every measurable network clinically actionable.

---

# 189. CANONICAL SUMMARY

MAGNIOM Target Engine v2.1 may be summarised:

```text
Evidence constrains.

The indication module defines the scientific model.

Clinical objectives define what matters.

Candidate generators propose hypotheses.

Measurements describe the patient.

Reliability determines which measurements have authority.

Systems context describes distributed organisation.

Network context does not become a target by itself.

Hard gates remove scientifically invalid hypotheses.

Comparison domains prevent meaningless global ranking.

Personalisation must beat a counterfactual.

E-field and anatomy constrain what can be stimulated.

Redundancy removes duplicates.

Convergence strengthens interpretation.

Contradiction remains visible.

Coverage ensures meaningful alternatives are represented.

Roles communicate why each candidate matters.

The smallest useful slate is preferred.

Abstention is valid.

The specialist decides.
```

---

# 190. CANONICAL DEFINITION

The **MAGNIOM Target Engine & Ranking Algorithm v2.1** is:

> **A deterministic, version-pinned, multi-indication target-decision engine in which approved evidence defines which therapeutic hypotheses may exist; independently governed indication modules determine which scientific model applies; candidate generators propose target hypotheses; the Target Engine Core verifies every hypothesis against evidence, clinical purpose, measurement capability, reliability, anatomy, target geometry, device constraints and treatment context; patient-specific refinement must demonstrate validated incremental value over an explicit counterfactual; distributed Systems Context such as the CEN–DMN–SN Triple Network remains relational and contextual unless separately validated for ranking authority; scientifically incompatible candidates are never forced into a universal score; redundancy, convergence, contradiction and objective coverage are explicitly represented; and the engine constructs the smallest useful, evidence-traceable Target Slate for specialist review without converting algorithmic output into autonomous clinical authority.**

---

# 191. FINAL GOVERNING RULE

> **The plugin proposes.  
> The Evidence Library constrains.  
> Scientific Policy permits.  
> Patient measurements personalise only when qualified.  
> Systems Context informs without overclaiming.  
> The Target Engine Core gates, compares and assembles.  
> The Target Slate exposes evidence, alternatives and uncertainty.  
> The specialist decides.**