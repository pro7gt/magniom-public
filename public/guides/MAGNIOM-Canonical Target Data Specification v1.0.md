# MAGNIOM
## Canonical Target Data Specification v1.0

**Document status:** Canonical foundation draft  
**Date:** 1 September 2026  
**Depends on:** Magniom Clinical & Scientific Specification v1.0  
**Applies to:** Clinical Mode v1.0 + explicitly segregated Research Mode extensions  
**Initial indication:** Major depressive disorder ± clinically significant anxious distress

---

# 1. PURPOSE

This specification defines the canonical data representation for Magniom’s target-selection domain.

It establishes exactly how Magniom represents:

- `TherapeuticCircuit`
- `TargetFamily`
- `TargetCandidate`
- `TargetReliabilityProfile`
- `EvidenceClaim`
- `TargetSlate`
- `ClinicianDecision`

It also defines the supporting primitives required to make these objects:

- scientifically interpretable
- machine-readable
- versionable
- reproducible
- auditable
- explainable
- compatible with future regulatory controls.

The specification is deliberately independent of:

- Supabase table layout
- API implementation
- frontend component structure
- neuroimaging compute framework
- ranking-engine implementation language.

Those systems must conform to this model.

---

# 2. CORE DOMAIN PRINCIPLE

Magniom must preserve the distinction between:

# scientific evidence

# patient-specific observation

# algorithmic inference

# clinician decision.

These are four different classes of information.

They must never be collapsed into a single opaque:

> “Target score”.

A target candidate must always be reconstructable from:

**clinical evidence**

+

**clinical phenotype**

+

**patient-specific connectomics**

+

**reliability**

+

**anatomical / stimulation constraints**

+

**algorithm version**

with the clinician decision stored separately.

---

# 3. CANONICAL OBJECT GRAPH

The principal relationship is:

```text
EvidenceClaim
      │
      ▼
TherapeuticCircuit
      │
      ▼
TargetFamily
      │
      ▼
TargetCandidate
      │
      ├──────────► TargetReliabilityProfile
      │
      ▼
TargetSlate
      │
      ▼
ClinicianDecision
```

Patient-specific context sits outside this specification but is referenced by:

```text
Case
 ├─ ClinicalPhenotype
 ├─ ImagingStudy
 ├─ ConnectomeRun
 └─ Assessment
```

A `TargetCandidate` must never exist without a case context.

A `TherapeuticCircuit`, `TargetFamily`, and `EvidenceClaim` may exist independently as reusable scientific knowledge.

---

# 4. DESIGN REQUIREMENTS

Every canonical object must support:

### Unique identity

Globally unique immutable identifier.

### Version identity

The exact version used in a historical decision must remain recoverable.

### Provenance

Who or what created it, when, and from which source.

### Scope

What clinical indication and population it applies to.

### Status

Draft, active, deprecated, superseded or research-only.

### Evidence linkage

No clinical target can exist without traceable evidence provenance.

### Uncertainty

Where uncertainty exists, its type must be identifiable.

### Mode separation

Clinical Mode and Research Mode content must not be interchangeable.

---

# 5. IDENTIFIER STANDARD

All primary domain objects use immutable UUIDs.

Example:

```text
c3acbc8d-6ef8-4c23-8810-f994c6b32183
```

Human-readable codes may be added but are not primary keys.

Example:

```text
TC-MDD-DYSPHORIC-001
TF-LDLPFC-CONVERGENT-001
```

IDs must never encode mutable facts.

Do not use:

```text
target-left-dlpfc-v2-final
```

as an identifier.

---

# 6. TIME STANDARD

All machine timestamps:

```text
ISO 8601 UTC
```

Example:

```text
2026-09-01T09:44:00Z
```

Clinical display may convert to local timezone.

Historical event time and database write time should remain separable where relevant.

---

# 7. VERSION STANDARD

Use semantic versioning for scientific and algorithmic artefacts where meaningful:

```text
1.0.0
1.1.0
2.0.0
```

Store:

- object version
- evidence-library version
- target-engine version
- preprocessing-pipeline version
- atlas version
- normative-model version
- E-field-engine version where applicable.

Historical target slates are immutable with respect to these versions.

---

# 8. MODE ENUM

Every scientific or target object capable of affecting ranking must include:

```ts
type MagniomMode =
  | "clinical"
  | "research";
```

Research objects must not enter Clinical Mode ranking unless formally promoted through governance and version release.

---

# 9. EVIDENCE TIER ENUM

```ts
type EvidenceTier =
  | "A"
  | "B"
  | "C"
  | "D"
  | "R";
```

Meaning:

### A

Established clinical target family.

### B

Prospectively supported therapeutic circuit / target.

### C

Replicated retrospective or observational evidence.

### D

Proof-of-concept evidence.

### R

Research hypothesis.

Do not infer numerical differences between tiers.

They are ordinal governance categories.

---

# 10. CONFIDENCE ENUM

Until probability calibration has been prospectively validated, Magniom must use:

```ts
type QualitativeConfidence =
  | "high"
  | "moderate"
  | "low"
  | "not_assessable";
```

Do not represent:

```text
93% confidence
```

unless the value has a validated probabilistic interpretation.

---

# 11. STATUS ENUM

```ts
type LifecycleStatus =
  | "draft"
  | "active"
  | "deprecated"
  | "superseded"
  | "archived";
```

Deprecated and superseded scientific objects remain queryable for historical reconstruction.

---

# 12. COMMON PROVENANCE OBJECT

All major objects should support:

```ts
interface Provenance {
  created_at: string;
  created_by_type:
    | "clinician"
    | "system"
    | "researcher"
    | "governance_process";

  created_by_id?: string;

  source_object_ids?: string[];

  software_component?: string;
  software_version?: string;

  evidence_library_version?: string;
  algorithm_version?: string;

  notes?: string;
}
```

---

# 13. SPATIAL COORDINATE PRIMITIVE

Magniom must never store a coordinate without its coordinate system.

```ts
interface SpatialCoordinate {
  x: number;
  y: number;
  z: number;

  unit: "mm";

  space:
    | "MNI152NLin2009cAsym"
    | "MNI152NLin6Asym"
    | "subject_T1"
    | "subject_surface"
    | "scanner"
    | "neuronavigation";

  orientation?: "RAS" | "LAS" | "LPS";

  transform_id?: string;

  precision_mm?: number;
}
```

The MNI template version is mandatory.

Never use generic:

```text
MNI
```

without specifying which MNI space.

---

# 14. SPATIAL REGION PRIMITIVE

Because a therapeutic target should not be reduced to a point:

```ts
interface SpatialRegion {
  region_type:
    | "point"
    | "sphere"
    | "surface_patch"
    | "parcel"
    | "volume_roi"
    | "confidence_region";

  centre?: SpatialCoordinate;

  radius_mm?: number;

  atlas_id?: string;
  parcel_id?: string;

  mask_artifact_id?: string;
  surface_artifact_id?: string;

  area_mm2?: number;
  volume_mm3?: number;
}
```

---

# 15. ATLAS REFERENCE

```ts
interface AtlasReference {
  atlas_id: string;
  name: string;
  version: string;

  parcellation_type:
    | "cortical"
    | "subcortical"
    | "network"
    | "multimodal";

  coordinate_space: string;

  citation_ids?: string[];
}
```

Example:

```text
HCP-MMP1.0
```

---

# 16. CLINICAL CONCEPT REFERENCE

This supports future ontology normalization.

```ts
interface ClinicalConceptRef {
  concept_id: string;
  label: string;

  ontology?:
    | "magniom_internal"
    | "SNOMED_CT"
    | "ICD_10"
    | "DSM_5_TR";

  external_code?: string;
}
```

---

# 17. UNCERTAINTY OBJECT

Magniom must separate uncertainty domains.

```ts
interface UncertaintyProfile {
  evidence: QualitativeConfidence;
  phenotype: QualitativeConfidence;
  connectome: QualitativeConfidence;
  spatial: QualitativeConfidence;
  normative_model: QualitativeConfidence;
  stimulation_access: QualitativeConfidence;
  external_validity: QualitativeConfidence;

  summary: string;

  limiting_factors?: string[];
}
```

This is preferable to:

```text
confidence = 0.72
```

---

# 18. THERAPEUTIC CIRCUIT

## Definition

A `TherapeuticCircuit` represents a distributed brain network for which stimulation of one or more accessible cortical nodes has evidence of association with a defined therapeutic effect.

It is not:

- a diagnosis
- a single target coordinate
- a resting-state network label alone
- a patient's individual connectome abnormality.

---

# 19. THERAPEUTIC CIRCUIT INTERFACE

```ts
interface TherapeuticCircuit {
  id: string;
  code: string;
  version: string;

  name: string;
  description: string;

  mode: MagniomMode;
  status: LifecycleStatus;

  evidence_tier: EvidenceTier;

  indication_scope: ClinicalConceptRef[];
  symptom_domains: ClinicalConceptRef[];
  therapeutic_objectives: ClinicalConceptRef[];

  circuit_definition: CircuitDefinition;

  evidence_claim_ids: string[];

  target_family_ids: string[];

  validation_status: CircuitValidationStatus;

  evidence_summary: string;
  limitations: string[];

  provenance: Provenance;
}
```

---

# 20. CIRCUIT DEFINITION

```ts
interface CircuitDefinition {
  definition_type:
    | "seed_connectivity"
    | "whole_brain_map"
    | "lesion_network_map"
    | "stimulation_response_map"
    | "multimodal_convergent_map"
    | "atlas_network"
    | "composite";

  coordinate_space: string;

  seed_regions?: SpatialRegion[];

  map_artifact_ids?: string[];

  map_directionality?:
    | "positive"
    | "negative"
    | "bidirectional"
    | "not_applicable";

  threshold_definition?: string;

  derived_from_population?: PopulationDescriptor;

  derivation_method_summary: string;
}
```

---

# 21. CIRCUIT VALIDATION STATUS

```ts
type CircuitValidationStatus =
  | "established_target_family"
  | "prospectively_supported"
  | "replicated_retrospective"
  | "single_cohort"
  | "proof_of_concept"
  | "research_hypothesis";
```

---

# 22. THERAPEUTIC CIRCUIT EXAMPLE

Conceptual example:

```json
{
  "code": "TC-MDD-ANXIOSOMATIC-001",
  "name": "Anxiosomatic treatment circuit",
  "mode": "clinical",
  "evidence_tier": "B",
  "indication_scope": [
    {
      "concept_id": "mdd",
      "label": "Major depressive disorder"
    }
  ],
  "symptom_domains": [
    {
      "concept_id": "anxious_distress",
      "label": "Anxious distress"
    },
    {
      "concept_id": "somatic_burden",
      "label": "Somatic symptom burden"
    }
  ],
  "validation_status": "prospectively_supported"
}
```

---

# 23. THERAPEUTIC CIRCUIT INVARIANTS

A Clinical Mode circuit must have:

1. at least one clinical indication;
2. at least one evidence claim;
3. an evidence tier of A, B or permitted C;
4. explicit derivation methodology;
5. explicit validation status;
6. at least one permissible target family;
7. active governance approval.

A Research Mode circuit may omit a validated target family.

---

# 24. TARGET FAMILY

## Definition

A `TargetFamily` represents a clinically meaningful class of accessible cortical stimulation locations associated with one or more therapeutic circuits.

Examples:

- left prefrontal depression target family
- sgACC-connected left DLPFC target family
- dorsomedial anxiosomatic target family.

A TargetFamily is broader than a patient-specific coordinate.

---

# 25. TARGET FAMILY INTERFACE

```ts
interface TargetFamily {
  id: string;
  code: string;
  version: string;

  name: string;
  description: string;

  mode: MagniomMode;
  status: LifecycleStatus;

  evidence_tier: EvidenceTier;

  indication_scope: ClinicalConceptRef[];

  therapeutic_circuit_ids: string[];

  anatomical_definition: TargetFamilyAnatomy;

  laterality:
    | "left"
    | "right"
    | "midline"
    | "bilateral"
    | "variable";

  candidate_generation_rules: CandidateGenerationRule[];

  protocol_precedent_ids?: string[];

  evidence_claim_ids: string[];

  limitations: string[];

  provenance: Provenance;
}
```

---

# 26. TARGET FAMILY ANATOMY

```ts
interface TargetFamilyAnatomy {
  broad_region: string;

  atlas_regions?: {
    atlas_id: string;
    parcel_ids: string[];
  }[];

  canonical_regions?: SpatialRegion[];

  allowed_search_space_artifact_id?: string;

  excluded_regions_artifact_id?: string;

  notes?: string;
}
```

A search space is preferable to one hard-coded coordinate.

---

# 27. CANDIDATE GENERATION RULE

```ts
interface CandidateGenerationRule {
  rule_id: string;

  rule_type:
    | "fixed_coordinate"
    | "parcel_search"
    | "surface_search"
    | "max_connectivity"
    | "min_connectivity"
    | "max_circuit_concordance"
    | "normative_deviation"
    | "efield_optimised"
    | "composite";

  description: string;

  permitted_mode: MagniomMode;

  parameters: Record<string, unknown>;

  algorithm_component_version: string;
}
```

No rule may be represented only as prose in production.

---

# 28. TARGET FAMILY INVARIANTS

A Clinical Mode TargetFamily must:

- belong to a clinical indication;
- link to at least one eligible TherapeuticCircuit;
- define an anatomical search space;
- define how patient-level candidates may be generated;
- carry evidence provenance;
- identify relevant limitations.

A TargetFamily must never encode:

> `hyperconnectivity => cTBS`

because target family and protocol prescription remain separate.

---

# 29. EVIDENCE CLAIM

## Definition

An `EvidenceClaim` is the smallest structured scientific assertion that Magniom permits to influence clinical reasoning.

Examples:

> Stimulation of target family X is associated with improvement in major depression.

> Target A produced greater anxiety improvement than Target B in a prospective randomized study.

> Individual sgACC connectivity has been associated with antidepressant treatment response.

EvidenceClaim prevents vague statements such as:

> “Research supports this target.”

---

# 30. EVIDENCE CLAIM INTERFACE

```ts
interface EvidenceClaim {
  id: string;
  code: string;
  version: string;

  mode: MagniomMode;
  status: LifecycleStatus;

  claim_type:
    | "efficacy"
    | "comparative_efficacy"
    | "symptom_specificity"
    | "target_association"
    | "connectivity_association"
    | "safety"
    | "durability"
    | "mechanism"
    | "feasibility"
    | "target_reliability";

  statement: string;

  evidence_tier: EvidenceTier;

  indication_scope: ClinicalConceptRef[];

  symptom_scope?: ClinicalConceptRef[];

  circuit_ids?: string[];
  target_family_ids?: string[];

  population: PopulationDescriptor;

  intervention?: InterventionDescriptor;
  comparator?: ComparatorDescriptor;

  outcome: OutcomeDescriptor[];

  supporting_source_ids: string[];
  conflicting_source_ids?: string[];

  replication_status:
    | "multiple_independent"
    | "replicated"
    | "single_study"
    | "mixed"
    | "not_applicable";

  certainty: QualitativeConfidence;

  applicability_constraints: string[];
  limitations: string[];

  reviewed_at: string;
  next_review_due?: string;

  provenance: Provenance;
}
```

---

# 31. POPULATION DESCRIPTOR

```ts
interface PopulationDescriptor {
  diagnosis?: ClinicalConceptRef[];

  age_range?: {
    minimum?: number;
    maximum?: number;
  };

  treatment_resistance_definition?: string;

  major_inclusion_features?: string[];
  major_exclusion_features?: string[];

  sample_size?: number;

  setting?: string[];

  notes?: string;
}
```

---

# 32. INTERVENTION DESCRIPTOR

```ts
interface InterventionDescriptor {
  target_description?: string;

  target_family_id?: string;

  coil_type?: string;
  device?: string;

  frequency_hz?: number;
  pulse_pattern?: string;

  pulses_per_session?: number;

  sessions_per_day?: number;
  total_sessions?: number;

  intensity_definition?: string;

  targeting_method?: string;

  behavioural_context?: string;

  protocol_id?: string;
}
```

This records research precedent.

It does not automatically become a patient prescription.

---

# 33. OUTCOME DESCRIPTOR

```ts
interface OutcomeDescriptor {
  domain: string;

  measure?: string;

  outcome_type:
    | "continuous"
    | "response"
    | "remission"
    | "functional"
    | "safety"
    | "durability";

  timepoint?: string;

  direction:
    | "favours_intervention"
    | "favours_comparator"
    | "no_difference"
    | "mixed"
    | "not_applicable";

  effect_summary?: string;
}
```

---

# 34. EVIDENCE CLAIM RULES

Clinical Mode EvidenceClaims must:

- identify the relevant population;
- identify what was actually tested;
- identify outcome domain;
- preserve conflicting evidence;
- avoid generalising across different target/protocol combinations without explicit justification.

A clinical claim must not state:

> “Personalised TMS is superior”

if the evidence library contains materially conflicting RCT/meta-analysis evidence.

Instead:

```text
replication_status = mixed
```

and the statement should reflect that uncertainty.

---

# 35. TARGET RELIABILITY PROFILE

## Definition

A `TargetReliabilityProfile` represents how reproducible and trustworthy the patient-specific imaging-derived target localisation is.

It measures:

# reliability of the measurement

not:

# efficacy of the treatment.

---

# 36. TARGET RELIABILITY INTERFACE

```ts
interface TargetReliabilityProfile {
  id: string;
  version: string;

  case_id: string;
  imaging_study_id: string;
  connectome_run_id: string;

  target_candidate_id?: string;

  qc_status:
    | "pass"
    | "conditional"
    | "fail";

  usable_resting_state_minutes?: number;

  mean_framewise_displacement_mm?: number;
  censored_volume_fraction?: number;

  registration_quality:
    | "high"
    | "moderate"
    | "low"
    | "fail";

  segmentation_quality:
    | "high"
    | "moderate"
    | "low"
    | "fail";

  parcel_coverage_quality:
    | "high"
    | "moderate"
    | "low"
    | "fail";

  cross_run_spatial_distance_mm?: number;
  split_half_spatial_distance_mm?: number;

  connectivity_reliability_metric?: number;
  connectivity_reliability_method?: string;

  atlas_concordance?: ReliabilityMeasure;

  pipeline_sensitivity?: ReliabilityMeasure;

  target_confidence_region?: SpatialRegion;

  reliability_class:
    | "high"
    | "moderate"
    | "low"
    | "unreliable";

  limiting_factors: string[];

  interpretation: string;

  pipeline_version: string;
  atlas_versions: string[];
  normative_model_version?: string;

  provenance: Provenance;
}
```

---

# 37. RELIABILITY MEASURE

```ts
interface ReliabilityMeasure {
  metric_name: string;
  value?: number;
  unit?: string;

  interpretation:
    | "high"
    | "moderate"
    | "low"
    | "not_assessable";

  method: string;
}
```

---

# 38. RELIABILITY PROFILE RULE

A candidate generated using individual functional connectivity must never be displayed without its reliability profile.

If:

```text
qc_status = fail
```

then individual FC may not affect Clinical Mode ranking.

If:

```text
reliability_class = unreliable
```

then the candidate may remain visible only as:

# patient-specific imaging hypothesis

and ranking must fall back to evidence-based target-family logic.

---

# 39. TARGET CANDIDATE

## Definition

A `TargetCandidate` is a patient-specific, anatomically defined, evidence-traceable cortical stimulation hypothesis generated for specialist review.

It is not:

- a prescription
- proof of optimality
- a protocol
- simply an MNI coordinate.

---

# 40. TARGET CANDIDATE INTERFACE

```ts
interface TargetCandidate {
  id: string;
  version: string;

  case_id: string;
  assessment_id: string;

  mode: MagniomMode;

  generation_status:
    | "generated"
    | "eligible"
    | "ineligible"
    | "suppressed"
    | "research_only";

  slate_role_candidate:
    | "evidence_anchor"
    | "symptom_circuit"
    | "connectome_refinement"
    | "network_alternative"
    | "clinical_alternative"
    | "research_hypothesis";

  target_family_id: string;

  therapeutic_circuit_ids: string[];

  therapeutic_objectives: ClinicalConceptRef[];
  symptom_domains: ClinicalConceptRef[];

  subject_target: SpatialRegion;

  standard_space_target?: SpatialRegion;

  atlas_annotations: AtlasAnnotation[];

  clinical_evidence: TargetEvidenceProfile;

  phenotype_fit: PhenotypeFitProfile;

  connectome_fit?: ConnectomeFitProfile;

  normative_context?: NormativeContextProfile;

  reliability_profile_id?: string;

  accessibility: TargetAccessibilityProfile;

  efield?: EFieldProfile;

  counterfactual?: CounterfactualTargetComparison;

  convergence?: CandidateConvergenceProfile;

  uncertainty: UncertaintyProfile;

  nomination_rationale: string;

  counterarguments: string[];

  supporting_evidence_claim_ids: string[];
  conflicting_evidence_claim_ids?: string[];

  internal_ranking_features?: RankingFeatureVector;

  algorithm_version: string;
  evidence_library_version: string;

  provenance: Provenance;
}
```

---

# 41. ATLAS ANNOTATION

```ts
interface AtlasAnnotation {
  atlas_id: string;
  atlas_version: string;

  parcel_id?: string;
  parcel_label?: string;

  overlap_fraction?: number;

  hemisphere?: string;

  confidence?: QualitativeConfidence;
}
```

---

# 42. TARGET EVIDENCE PROFILE

```ts
interface TargetEvidenceProfile {
  highest_evidence_tier: EvidenceTier;

  indication_match: boolean;

  target_family_match: boolean;

  evidence_claim_ids: string[];

  evidence_confidence: QualitativeConfidence;

  evidence_summary: string;

  external_validity_notes?: string[];
}
```

---

# 43. PHENOTYPE FIT PROFILE

```ts
interface PhenotypeFitProfile {
  relevant_domains: {
    symptom_domain: ClinicalConceptRef;

    severity?: number;
    severity_scale?: string;

    functional_burden?: number;
    functional_scale?: string;

    clinician_priority?: number;
    patient_priority?: number;

    circuit_evidence_strength: EvidenceTier;
  }[];

  overall_interpretation: string;

  confidence: QualitativeConfidence;
}
```

Numerical symptom values must retain their original scale.

Do not normalize silently without preserving raw value and transformation.

---

# 44. CONNECTOME FIT PROFILE

```ts
interface ConnectomeFitProfile {
  therapeutic_circuit_concordance?: number;

  circuit_concordance_method: string;

  seed_connectivity_metrics?: {
    seed_id: string;
    value: number;
    metric: string;
  }[];

  whole_brain_similarity?: number;

  connectivity_direction?: string;

  fit_interpretation: string;

  confidence: QualitativeConfidence;

  source_connectome_run_id: string;
}
```

The numeric value must not be presented as clinical probability unless validated.

---

# 45. NORMATIVE CONTEXT PROFILE

```ts
interface NormativeContextProfile {
  normative_model_id: string;
  normative_model_version: string;

  deviation_metrics: {
    feature_id: string;

    raw_value?: number;

    z_score?: number;

    percentile?: number;

    direction?: "higher" | "lower";

    interpretation?: string;
  }[];

  most_extreme_deviation_z?: number;

  anomaly_threshold_used?: number;

  normative_relevance:
    | "supportive"
    | "neutral"
    | "contradictory"
    | "uncertain";

  limitations?: string[];
}
```

Magniom must retain the continuous deviation.

Do not store only:

```text
abnormal = true
```

---

# 46. TARGET ACCESSIBILITY PROFILE

```ts
interface TargetAccessibilityProfile {
  scalp_to_cortex_distance_mm?: number;

  cortical_surface_accessible: boolean;

  device_compatibility?: {
    device_id: string;
    coil_id: string;
    status:
      | "compatible"
      | "conditional"
      | "not_compatible";
  }[];

  positioning_constraints?: string[];

  accessibility_class:
    | "good"
    | "conditional"
    | "poor";

  interpretation: string;
}
```

---

# 47. E-FIELD PROFILE

```ts
interface EFieldProfile {
  model_id: string;
  model_version: string;

  coil_id: string;
  device_id: string;

  coil_centre: SpatialCoordinate;

  coil_orientation_degrees?: number;

  target_mean_efield_v_per_m?: number;
  target_peak_efield_v_per_m?: number;

  target_engagement_fraction?: number;

  off_target_peak_region?: SpatialRegion;

  pose_sensitivity?: ReliabilityMeasure;

  optimisation_method?: string;

  interpretation: string;

  artifact_ids?: string[];
}
```

The existence of an E-field simulation does not automatically mean the predicted field is clinically optimal.

---

# 48. COUNTERFACTUAL TARGET COMPARISON

```ts
interface CounterfactualTargetComparison {
  baseline_strategy:
    | "evidence_only"
    | "standard_anatomical"
    | "beam_f3"
    | "fixed_coordinate"
    | "other";

  baseline_target: SpatialRegion;

  personalised_target: SpatialRegion;

  displacement_mm: number;

  same_target_family: boolean;

  same_therapeutic_circuit: boolean;

  change_interpretation:
    | "minimal"
    | "modest_refinement"
    | "material_shift"
    | "major_divergence";

  reasons_for_change: string[];

  evidence_transfer_note: string;
}
```

This is one of Magniom's core validation objects.

---

# 49. CANDIDATE CONVERGENCE PROFILE

```ts
interface CandidateConvergenceProfile {
  sources_considered: (
    | "evidence_anchor"
    | "symptom_circuit"
    | "individual_fc"
    | "normative_model"
    | "efield"
    | "structural_connectivity"
  )[];

  spatial_agreement_mm?: number;

  circuit_agreement:
    | "high"
    | "moderate"
    | "low";

  convergence_class:
    | "high"
    | "moderate"
    | "low"
    | "not_assessable";

  interpretation: string;
}
```

---

# 50. RANKING FEATURE VECTOR

The internal ranking representation may contain:

```ts
interface RankingFeatureVector {
  evidence_gate_pass: boolean;

  evidence_ordinal?: number;

  phenotype_concordance?: number;

  therapeutic_circuit_concordance?: number;

  normative_relevance?: number;

  reliability_factor?: number;

  accessibility_factor?: number;

  efield_factor?: number;

  redundancy_penalty?: number;

  uncertainty_penalty?: number;

  raw_internal_utility?: number;
}
```

Important:

These values are algorithm internals.

They must not be presented to clinicians as calibrated probabilities.

---

# 51. TARGET CANDIDATE HARD INVARIANTS

A Clinical Mode candidate cannot become eligible unless:

```text
indication_match = true
```

and:

```text
target_family evidence tier >= permitted clinical threshold
```

and:

```text
target is anatomically stimulatable
```

and:

if individual FC influences ranking:

```text
connectome QC != fail
```

and:

```text
reliability != unreliable
```

unless FC contribution is automatically disabled.

---

# 52. REQUIRED TARGET EXPLANATION

Every eligible candidate must generate two distinct explanations:

## Nomination rationale

Why this candidate was selected.

## Counterarguments

Why this candidate may not be correct.

Example:

### Why nominated

> The target lies within an evidence-supported left-prefrontal depression target family, shows strong patient-specific concordance with the convergent depression circuit, and is spatially stable across both resting-state runs.

### Why it may be wrong

> Clinical evidence for this exact individual-connectivity selection method remains mixed, and the personalised coordinate lies 19 mm from the evidence-only target.

---

# 53. TARGET SLATE

## Definition

A `TargetSlate` is Magniom's case-level decision-support output containing the smallest useful set of ranked target hypotheses.

It may contain:

- 1–3 Primary Candidates
- 0–2 Additional Candidates

It must never create candidates solely to fill all five positions.

---

# 54. TARGET SLATE INTERFACE

```ts
interface TargetSlate {
  id: string;
  version: string;

  case_id: string;
  assessment_id: string;

  mode: MagniomMode;

  status:
    | "draft"
    | "generated"
    | "ready_for_review"
    | "reviewed"
    | "superseded"
    | "abstained";

  generated_at: string;

  target_engine_version: string;
  evidence_library_version: string;
  phenotype_model_version: string;
  connectome_pipeline_version?: string;
  normative_model_version?: string;
  efield_engine_version?: string;

  primary_candidates: SlateCandidateRef[];
  additional_candidates: SlateCandidateRef[];

  slate_convergence: SlateConvergenceProfile;

  clinical_coverage: ClinicalCoverageProfile;

  counterfactual_summary?: SlateCounterfactualSummary;

  abstention?: AbstentionProfile;

  global_uncertainty: UncertaintyProfile;

  generation_summary: string;

  scientific_limitations: string[];

  provenance: Provenance;
}
```

---

# 55. SLATE CANDIDATE REFERENCE

```ts
interface SlateCandidateRef {
  target_candidate_id: string;

  position:
    | "primary_1"
    | "primary_2"
    | "primary_3"
    | "additional_a"
    | "additional_b";

  role:
    | "evidence_anchor"
    | "symptom_circuit"
    | "connectome_refinement"
    | "network_alternative"
    | "clinical_alternative";

  rank_within_role?: number;

  inclusion_reason: string;

  redundancy_with?: string[];
}
```

---

# 56. SLATE CONVERGENCE PROFILE

```ts
interface SlateConvergenceProfile {
  evidence_vs_connectome:
    | "high"
    | "moderate"
    | "low"
    | "not_assessable";

  symptom_vs_connectome:
    | "high"
    | "moderate"
    | "low"
    | "not_assessable";

  overall:
    | "high"
    | "moderate"
    | "low";

  interpretation: string;
}
```

---

# 57. CLINICAL COVERAGE PROFILE

```ts
interface ClinicalCoverageProfile {
  priority_domains: {
    domain: ClinicalConceptRef;

    priority_rank: number;

    covered_by_candidate_ids: string[];

    coverage:
      | "strong"
      | "partial"
      | "none"
      | "not_evidence_mappable";
  }[];

  redundancy_summary: string;

  unresolved_priorities?: ClinicalConceptRef[];
}
```

This supports the principle:

# optimize useful clinical coverage, not five highest scores.

---

# 58. SLATE COUNTERFACTUAL SUMMARY

```ts
interface SlateCounterfactualSummary {
  evidence_only_primary_target?: SpatialRegion;

  connectome_informed_primary_target?: SpatialRegion;

  displacement_mm?: number;

  changed_target_family: boolean;

  changed_therapeutic_circuit: boolean;

  personalisation_impact:
    | "none"
    | "minor"
    | "moderate"
    | "major";

  explanation: string;
}
```

---

# 59. ABSTENTION PROFILE

```ts
interface AbstentionProfile {
  abstention_type:
    | "no_clinical_target_slate"
    | "no_personalised_refinement"
    | "insufficient_evidence"
    | "imaging_qc_failure"
    | "target_instability"
    | "clinical_scope_mismatch"
    | "safety_priority"
    | "technical_failure";

  reason_codes: string[];

  explanation: string;

  fallback_options?: (
    | "evidence_only_target"
    | "standard_targeting"
    | "repeat_imaging"
    | "specialist_review"
    | "research_mode"
    | "no_tms_target"
  )[];
}
```

---

# 60. TARGET SLATE INVARIANTS

Clinical Mode slate rules:

### Rule 1

At most three primary candidates.

### Rule 2

At most two additional candidates.

### Rule 3

Zero candidates is valid.

### Rule 4

Primary 1 should normally represent the strongest evidence anchor unless the system explicitly documents why another evidence-supported candidate supersedes it.

### Rule 5

Primary 2 and Primary 3 must add clinically meaningful information.

### Rule 6

Do not create spatially adjacent duplicate targets merely to populate positions.

### Rule 7

Research-only targets may not occupy Clinical Mode slate positions.

### Rule 8

A slate must always include global limitations.

---

# 61. EXAMPLE SLATE

```text
PRIMARY 1
Connectome-refined left-prefrontal depression target
Role: Evidence Anchor
Evidence: A
Reliability: High

PRIMARY 2
Dorsomedial anxiosomatic circuit target
Role: Symptom Circuit
Evidence: B
Reliability: High

PRIMARY 3
Not populated
Reason: Dysphoric target converges with Primary 1.

ADDITIONAL A
Evidence-only left-prefrontal reference target

ADDITIONAL B
Alternative reliable left-prefrontal cortical node
```

This is preferable to inventing five unique coordinates.

---

# 62. CLINICIAN DECISION

## Definition

A `ClinicianDecision` records how the specialist interpreted the Magniom Target Slate.

It is legally and scientifically distinct from algorithm output.

---

# 63. CLINICIAN DECISION INTERFACE

```ts
interface ClinicianDecision {
  id: string;
  version: string;

  case_id: string;
  assessment_id: string;
  target_slate_id: string;

  clinician_id: string;

  decision_status:
    | "in_review"
    | "completed"
    | "deferred"
    | "superseded";

  candidate_decisions: CandidateDecision[];

  final_target_selection: FinalTargetSelection;

  overall_reasoning: string;

  magniom_influence:
    | "none"
    | "minor"
    | "moderate"
    | "major";

  disagreement_with_magniom?: string;

  additional_information_required?: string[];

  signed_at?: string;

  attestation?: ClinicianAttestation;

  provenance: Provenance;
}
```

---

# 64. CANDIDATE DECISION

```ts
interface CandidateDecision {
  target_candidate_id: string;

  decision:
    | "accept"
    | "reject"
    | "modify"
    | "replace"
    | "defer";

  structured_reason_codes: ClinicianReasonCode[];

  free_text_reason?: string;

  modified_target?: SpatialRegion;

  replacement_target_candidate_id?: string;

  evidence_reviewed?: boolean;

  reliability_reviewed?: boolean;

  counterarguments_reviewed?: boolean;
}
```

---

# 65. CLINICIAN REASON CODES

```ts
type ClinicianReasonCode =
  | "strong_clinical_fit"
  | "weak_clinical_fit"
  | "prior_positive_response"
  | "prior_non_response"
  | "connectome_support"
  | "connectome_conflict"
  | "low_imaging_reliability"
  | "anatomical_constraint"
  | "poor_accessibility"
  | "efield_concern"
  | "evidence_strength"
  | "evidence_conflict"
  | "phenotype_priority"
  | "comorbidity"
  | "tolerability"
  | "patient_preference"
  | "clinician_judgement"
  | "other";
```

---

# 66. FINAL TARGET SELECTION

```ts
interface FinalTargetSelection {
  selected_targets: {
    source:
      | "magniom_candidate"
      | "clinician_defined"
      | "standard_target";

    target_candidate_id?: string;

    target: SpatialRegion;

    intended_therapeutic_objective: ClinicalConceptRef[];

    sequence_order?: number;
  }[];

  no_target_selected: boolean;

  no_target_reason?: string;
}
```

This specification deliberately stops at target selection.

It does not yet define:

- iTBS
- cTBS
- frequency
- intensity
- pulse dose
- treatment schedule.

Those belong to the future:

# Magniom Protocol Data Specification.

---

# 67. CLINICIAN ATTESTATION

```ts
interface ClinicianAttestation {
  statement_version: string;

  statement:
    "I have independently reviewed the clinical context, evidence provenance, target reliability, alternatives and limitations. The final target selection represents my clinical decision and not an autonomous Magniom prescription.";

  accepted: boolean;

  accepted_at: string;
}
```

---

# 68. HUMAN OVERRIDE PRINCIPLE

The specialist may override any Magniom recommendation.

Magniom should never:

- block a clinically defensible override solely because it differs from the ranking;
- silently rewrite the clinician decision;
- automatically treat override as an error.

Override becomes structured validation data.

---

# 69. ALGORITHM OUTPUT VS CLINICAL DECISION

The database must preserve:

```text
what Magniom recommended
```

separately from:

```text
what the clinician selected.
```

Do not mutate a TargetCandidate after clinician modification.

Instead:

Candidate:

```text
[-42, 38, 30]
```

Clinician final target:

```text
[-40, 42, 32]
```

Both are preserved.

---

# 70. IMMUTABILITY MODEL

The following objects become immutable once referenced by a signed clinical decision:

- `TargetSlate`
- `TargetCandidate`
- `TargetReliabilityProfile`
- algorithm versions
- evidence-library version references
- relevant evidence claims.

Corrections require:

# superseding objects

not in-place historical editing.

---

# 71. SUPERSESSION MODEL

Every versionable canonical object should permit:

```ts
supersedes_id?: string;
superseded_by_id?: string;
```

Example:

Evidence Claim v1:

> connectivity personalisation may improve response.

New evidence emerges.

Evidence Claim v2:

> comparative evidence is mixed.

Historical decisions remain linked to v1.

Current decisions use v2.

---

# 72. SOURCE ARTIFACT REFERENCES

Large data artefacts should not live in canonical JSON.

Instead reference immutable files:

- NIfTI
- GIFTI
- CIFTI
- connectivity matrices
- circuit maps
- ROI masks
- E-field outputs
- QC reports.

Use:

```ts
interface ArtifactRef {
  artifact_id: string;

  artifact_type: string;

  mime_type?: string;

  sha256: string;

  size_bytes?: number;

  storage_uri: string;

  generated_by_version?: string;
}
```

Hashing is essential for reproducibility.

---

# 73. AUDIT EVENTS

Every clinically relevant transition should create an immutable audit event.

Examples:

```text
TARGET_SLATE_GENERATED
TARGET_CANDIDATE_VIEWED
EVIDENCE_OPENED
RELIABILITY_REVIEWED
CANDIDATE_ACCEPTED
CANDIDATE_REJECTED
TARGET_MODIFIED
DECISION_SIGNED
DECISION_SUPERSEDED
```

The event should record:

- actor
- timestamp
- object
- previous state where applicable
- new state
- reason.

---

# 74. TARGET SLATE LIFECYCLE

```text
Case ready
   ↓
Clinical entry gate passed
   ↓
Imaging QC
   ↓
Candidate generation
   ↓
Evidence gating
   ↓
Reliability assessment
   ↓
Slate assembly
   ↓
ready_for_review
   ↓
Clinician review
   ↓
ClinicianDecision
   ↓
signed
```

If QC fails:

```text
Imaging QC
   ↓
no_personalised_refinement
   ↓
Evidence-only slate
```

or:

```text
abstain
```

---

# 75. CANDIDATE GENERATION STATES

A candidate can be:

### Generated

Algorithm produced it.

### Eligible

Passed clinical evidence and technical gates.

### Ineligible

Failed a mandatory gate.

### Suppressed

Scientifically plausible but intentionally excluded from the clinical slate because of redundancy, reliability or slate logic.

### Research only

Visible only in Research Mode.

This permits Magniom to explain:

> “Candidate X existed but was not included.”

---

# 76. WHY SUPPRESSED CANDIDATES MATTER

Magniom should preserve the highest-scoring excluded hypotheses.

Example:

Candidate B:

excellent connectomic fit.

Suppressed because:

**Evidence Tier D.**

Candidate C:

strong evidence.

Suppressed because:

**85% E-field overlap with Primary 1 and no additional clinical coverage.**

This improves explainability and algorithm validation.

---

# 77. CLINICAL EVIDENCE BOUNDARY

The canonical data model should enforce:

```text
EvidenceClaim.evidence_tier
```

as an upper bound on clinical use.

Example:

TargetCandidate derives from:

Tier D only.

Then:

```text
generation_status = research_only
```

irrespective of:

- z-score
- network abnormality
- E-field quality
- clinician curiosity.

A clinician may separately enter a research protocol workflow if appropriate governance exists.

---

# 78. RESEARCH MODE EXTENSIONS

Research Mode may add:

```ts
interface ResearchTargetExtension {
  hypothesis_id: string;

  exploratory_features: Record<string, unknown>;

  novel_circuit_id?: string;

  anomaly_driven: boolean;

  experimental_protocol_hypothesis?: string;

  ethics_protocol_id?: string;

  research_project_id?: string;
}
```

The Research Mode object must never replace the Clinical Mode candidate record.

---

# 79. NOMINATED TARGET VS STIMULATION SOLUTION

The model must support future evolution from:

# coordinate-based target

to:

# stimulation solution.

Eventually a candidate may include:

```text
therapeutic ROI
+
coil centre
+
coil orientation
+
predicted E-field
+
pose tolerance
```

Therefore `SpatialRegion` rather than a single coordinate is canonical.

---

# 80. REQUIRED DISPLAY FIELDS

The clinician-facing TargetCandidate view must always expose:

### Identity

Target role and target family.

### Clinical purpose

What are we trying to improve?

### Evidence

Why is this target clinically defensible?

### Patient-specific finding

What did the individual's connectome contribute?

### Reliability

How stable is that finding?

### Anatomy

Where is the target?

### Accessibility

Can it be stimulated appropriately?

### Counterfactual

What would we have chosen without the fMRI?

### Uncertainty

Where could this reasoning fail?

### Alternatives

What other target is reasonable?

---

# 81. PROHIBITED FRONTEND DERIVATIONS

The frontend may not infer:

- evidence tier from colour
- clinical suitability from ranking
- prescription from candidate role
- confidence from numeric utility
- protocol from connectivity direction.

All clinical semantics must come from canonical domain objects.

---

# 82. EXAMPLE COMPLETE TARGET CANDIDATE

Illustrative only:

```json
{
  "id": "candidate-001",
  "case_id": "case-123",
  "mode": "clinical",

  "generation_status": "eligible",

  "slate_role_candidate": "connectome_refinement",

  "target_family_id": "TF-LDLPFC-CONVERGENT-001",

  "therapeutic_circuit_ids": [
    "TC-MDD-CONVERGENT-001"
  ],

  "therapeutic_objectives": [
    {
      "concept_id": "depressive_symptom_reduction",
      "label": "Reduction in depressive symptom burden"
    }
  ],

  "subject_target": {
    "region_type": "confidence_region",
    "centre": {
      "x": -41.2,
      "y": 38.6,
      "z": 32.1,
      "unit": "mm",
      "space": "subject_T1",
      "orientation": "RAS"
    }
  },

  "clinical_evidence": {
    "highest_evidence_tier": "A",
    "indication_match": true,
    "target_family_match": true,
    "evidence_claim_ids": [
      "EC-MDD-LPFC-001",
      "EC-CONVERGENT-CIRCUIT-002"
    ],
    "evidence_confidence": "high",
    "evidence_summary": "Candidate lies within an established left-prefrontal depression target family and is refined using a therapeutic depression circuit."
  },

  "connectome_fit": {
    "therapeutic_circuit_concordance": 0.81,
    "circuit_concordance_method": "versioned spatial correlation method",
    "fit_interpretation": "Strong patient-specific concordance with the therapeutic depression circuit.",
    "confidence": "high",
    "source_connectome_run_id": "conn-run-001"
  },

  "reliability_profile_id": "reliability-001",

  "accessibility": {
    "scalp_to_cortex_distance_mm": 16.8,
    "cortical_surface_accessible": true,
    "accessibility_class": "good",
    "interpretation": "Target is readily accessible with the configured treatment coil."
  },

  "counterfactual": {
    "baseline_strategy": "evidence_only",
    "displacement_mm": 10.4,
    "same_target_family": true,
    "same_therapeutic_circuit": true,
    "change_interpretation": "modest_refinement",
    "reasons_for_change": [
      "Individual functional connectivity produced a more strongly circuit-concordant location."
    ],
    "evidence_transfer_note": "Personalisation remains within the established left-prefrontal target family."
  },

  "nomination_rationale": "Strong evidence anchor, high patient-specific circuit concordance, reliable target localisation and good cortical accessibility.",

  "counterarguments": [
    "Personalised functional-connectivity targeting has not shown universal superiority over high-quality fixed targeting.",
    "The clinical advantage of this 10.4 mm displacement is not established for this individual."
  ],

  "algorithm_version": "1.0.0",
  "evidence_library_version": "1.0.0"
}
```

---

# 83. EXAMPLE RELIABILITY PROFILE

```json
{
  "id": "reliability-001",
  "case_id": "case-123",
  "imaging_study_id": "mri-001",
  "connectome_run_id": "conn-run-001",

  "qc_status": "pass",

  "usable_resting_state_minutes": 23.8,

  "mean_framewise_displacement_mm": 0.14,
  "censored_volume_fraction": 0.07,

  "registration_quality": "high",
  "segmentation_quality": "high",
  "parcel_coverage_quality": "high",

  "cross_run_spatial_distance_mm": 4.9,
  "split_half_spatial_distance_mm": 6.1,

  "reliability_class": "high",

  "limiting_factors": [],

  "interpretation": "Patient-specific target localisation is reproducible across independent resting-state partitions.",

  "pipeline_version": "1.0.0",
  "atlas_versions": [
    "HCP-MMP1.0"
  ],
  "normative_model_version": "1.0.0"
}
```

---

# 84. EXAMPLE ABSTENTION

```json
{
  "status": "abstained",

  "abstention": {
    "abstention_type": "target_instability",

    "reason_codes": [
      "CROSS_RUN_DISPLACEMENT_EXCEEDS_VALIDATED_THRESHOLD",
      "INSUFFICIENT_RELIABLE_FC"
    ],

    "explanation": "Individual functional-connectivity localisation is insufficiently stable for clinical refinement.",

    "fallback_options": [
      "evidence_only_target",
      "repeat_imaging",
      "specialist_review"
    ]
  }
}
```

This should be considered a scientifically valid Magniom result.

---

# 85. FUTURE SUPABASE MAPPING PRINCIPLE

The future relational schema should approximately map:

```text
therapeutic_circuits
target_families
evidence_claims

target_candidates
target_reliability_profiles
target_slates
clinician_decisions
```

Supporting one-to-many or many-to-many tables will represent:

- indication scope
- symptom scope
- evidence links
- circuits
- candidate roles
- atlas annotations
- selected targets.

However:

# do not denormalise the canonical scientific semantics simply to make the first database implementation easier.

---

# 86. FUTURE API PRINCIPLE

The API should expose domain actions rather than raw database mutations.

Prefer:

```text
POST /cases/{id}/generate-target-slate
POST /target-slates/{id}/review
POST /target-candidates/{id}/decision
POST /clinician-decisions/{id}/sign
```

rather than:

```text
PATCH /target_candidates
```

for clinically significant workflow.

---

# 87. FUTURE RANKING ENGINE CONTRACT

The ranking engine should accept:

```ts
interface TargetEngineInput {
  case_id: string;

  phenotype_snapshot_id: string;

  evidence_library_version: string;

  permitted_target_family_ids: string[];

  imaging_snapshot_id?: string;
  connectome_run_id?: string;
  normative_model_version?: string;

  device_context?: string[];
}
```

And return:

```ts
interface TargetEngineOutput {
  target_candidate_ids: string[];

  suppressed_candidate_ids: string[];

  target_slate_id: string;

  warnings: string[];

  abstention?: AbstentionProfile;

  engine_version: string;
}
```

The engine must never directly return a treatment protocol prescription.

---

# 88. FUTURE RANKING ENGINE EXPLAINABILITY

For every included and suppressed candidate, preserve:

- eligibility gates
- feature values
- penalties
- redundancy determination
- rank before diversity optimization
- rank after diversity optimization.

This allows full reconstruction of:

# why Primary 2 was chosen instead of candidate 4.

---

# 89. CANONICAL VALIDATION RULES

Before any object can enter production, validate:

### TherapeuticCircuit

- evidence tier valid
- circuit definition present
- indication scope present
- evidence links resolve.

### TargetFamily

- target search space defined
- circuit relation valid
- clinical mode compatible.

### EvidenceClaim

- population defined
- claim scope explicit
- sources present
- review date valid.

### ReliabilityProfile

- pipeline version present
- QC state present
- interpretation present.

### TargetCandidate

- case context present
- evidence profile present
- target region defined
- uncertainty present
- counterarguments non-empty.

### TargetSlate

- no duplicate target IDs
- maximum 3 primary
- maximum 2 additional
- no research-only candidate in Clinical Mode
- abstention rules valid.

### ClinicianDecision

- clinician identity present
- target slate version present
- every reviewed candidate has explicit decision
- final selection is separate from slate
- signed decision immutable.

---

# 90. NO DUPLICATE TARGET RULE

Two candidates should be flagged as potentially redundant when:

- cortical centres are within a versioned spatial threshold;
- target ROIs overlap substantially;
- E-fields substantially overlap;
- they serve the same therapeutic circuit and clinical objective.

The exact thresholds must be validated.

They should not be hard-coded into this canonical specification.

---

# 91. DATA QUALITY STATES

Patient-derived data should use:

```ts
type DataQualityState =
  | "verified"
  | "reviewed"
  | "unverified"
  | "incomplete"
  | "invalid";
```

Examples:

MRI metadata:

`verified`

Patient-entered historical medication:

`unverified`

Clinician-reviewed treatment history:

`reviewed`

This prevents uncertain source data from appearing equivalent to validated information.

---

# 92. CLINICAL SNAPSHOTS

Target generation must reference immutable snapshots of:

- phenotype
- imaging
- evidence library.

If a clinician later changes:

**anxiety priority**

from:

`moderate`

to:

`high`

the existing slate is not silently mutated.

A new target slate should be generated.

---

# 93. WHY SNAPSHOTS MATTER

Without snapshots, Magniom could become impossible to audit:

> “Why did the software recommend this target last Tuesday?”

The system must answer exactly.

---

# 94. CANONICAL TRACEABILITY CHAIN

Every clinical target must permit reconstruction:

```text
Clinician assessment
        ↓
Phenotype snapshot
        ↓
Evidence Claim
        ↓
Therapeutic Circuit
        ↓
Target Family
        ↓
Patient Connectome
        ↓
Reliability Profile
        ↓
Target Candidate
        ↓
Target Slate
        ↓
Clinician Decision
```

This chain is non-negotiable.

---

# 95. MINIMUM EXPLAINABILITY STANDARD

A specialist should be able to understand any recommendation without reading source code.

The system must answer:

# Why this target?

# Why not the standard target?

# Which symptoms does it address?

# Which circuit supports it?

# Which studies support that circuit?

# What did the patient's MRI add?

# How reliable is the MRI result?

# How far did personalisation move the target?

# What alternative did the system consider?

# What is the strongest reason this recommendation could be wrong?

---

# 96. PROHIBITED CANONICAL FIELDS

Do not create fields such as:

```text
optimal_target = true
```

```text
brain_abnormality_score = 93
```

```text
expected_response_probability = 87%
```

```text
recommended_protocol = iTBS
```

unless a later validated specification explicitly supports them.

---

# 97. NAMING STANDARD

Prefer scientifically descriptive names.

Good:

```text
therapeutic_circuit_concordance
cross_run_spatial_distance_mm
evidence_tier
counterfactual_displacement_mm
```

Avoid:

```text
brain_score
AI_confidence
target_magic
precision_score
wellness_index
```

---

# 98. MAGNIOM DOMAIN LANGUAGE

The system should consistently use:

### “Candidate”

not:

“recommended treatment target”

until clinician sign-off.

### “Connectome-informed”

rather than:

“connectome-determined”.

### “Evidence-supported”

rather than:

“proven”.

### “Spatial stability”

rather than:

“precision”.

### “Therapeutic circuit concordance”

rather than:

“correct network”.

### “Normative deviation”

rather than:

“brain abnormality”.

---

# 99. CANONICAL OBJECT OWNERSHIP

Scientific knowledge objects:

- TherapeuticCircuit
- TargetFamily
- EvidenceClaim

are controlled through:

# Evidence Governance.

Patient-specific computational objects:

- TargetCandidate
- TargetReliabilityProfile
- TargetSlate

are controlled through:

# Target Engine + Clinical Workflow.

Human decision object:

- ClinicianDecision

is controlled by:

# authorised clinician only.

These ownership boundaries should later map to database permissions.

---

# 100. GOVERNANCE STATE CHANGE

Promoting:

```text
Evidence Tier D
```

to:

```text
Evidence Tier B
```

must require a governance process.

It cannot occur automatically because:

- a new paper appeared
- local outcomes looked promising
- an LLM classified the literature differently.

---

# 101. EXTENSION TO FUTURE INDICATIONS

The specification must remain reusable for:

- OCD
- PTSD
- chronic pain
- stroke rehabilitation
- brain injury
- tinnitus

without rewriting the target object.

A future OCD module should simply add:

new:

- TherapeuticCircuits
- TargetFamilies
- EvidenceClaims
- phenotype mappings

while retaining:

the same:

- TargetCandidate
- ReliabilityProfile
- TargetSlate
- ClinicianDecision.

That is the purpose of the canonical model.

---

# 102. EXTENSION TO STRUCTURAL CONNECTOMICS

Future target candidates may include:

```ts
structural_connectivity_fit?: {
  tract_ids: string[];
  connectivity_metrics: Record<string, number>;
  method: string;
  model_version: string;
  interpretation: string;
}
```

This should augment, not mutate, the functional-connectivity representation.

---

# 103. EXTENSION TO EFFECTIVE CONNECTIVITY

Likewise:

```ts
effective_connectivity_fit?: {
  model_type: string;
  directional_metrics: Record<string, number>;
  model_version: string;
  interpretation: string;
}
```

Clinical use requires separate validation.

---

# 104. EXTENSION TO LONGITUDINAL CONNECTOMES

Future Magniom may compare:

baseline

versus:

post-treatment connectome.

This should create separate:

`ConnectomeRun`

objects.

Never overwrite baseline.

Potential use:

- mechanistic research
- network change
- outcome association

not automatic retreatment targeting without validation.

---

# 105. EXTENSION TO PROTOCOL SELECTION

A future `ProtocolCandidate` should be a separate object.

Conceptually:

```text
TargetCandidate
      ↓
Clinician target decision
      ↓
ProtocolCandidate
      ↓
Clinician protocol decision
```

Do not combine them now.

This preserves the scientifically important distinction:

# where to stimulate

versus:

# how to stimulate.

---

# 106. MAGNIOM V1 CANONICAL DATA PACKAGE

For every completed case, Magniom should be able to export a machine-readable package containing:

```text
case metadata
clinical phenotype snapshot
imaging QC summary
connectome version
evidence library version
therapeutic circuits considered
target families considered
all generated candidates
suppressed candidates
target reliability profiles
final target slate
clinician decisions
final selected targets
audit history
```

Sensitive identifying data may be separated according to export purpose.

---

# 107. HUMAN-READABLE CASE REPORT

The same canonical objects should generate a clinical report:

# Magniom Target Review

### Clinical objective

### Evidence-supported target families

### Connectome quality

### Patient-specific network findings

### Primary Candidate 1

### Primary Candidate 2

### Primary Candidate 3

### Additional Candidates

### Target convergence

### Counterfactual target

### Major uncertainties

### Specialist decision

### Final selected target(s)

### Evidence references

This report is derived from canonical data.

It is not separately authored clinical truth.

---

# 108. SCIENTIFIC REPRODUCIBILITY PACKAGE

For research or audit, a case should also expose:

- artifact hashes
- preprocessing version
- transform versions
- candidate-generation rules
- ranking features
- evidence claims
- algorithm version
- software/container versions.

The objective:

# an authorised reviewer should be able to regenerate the target slate from the original inputs.

---

# 109. DATA SPECIFICATION ACCEPTANCE TEST

Before engineering begins, we should be able to represent the following without changing the schema:

### Case A

Strong standard-target / connectome convergence.

### Case B

Evidence target and FC target differ by 30 mm.

### Case C

High-quality MRI but no meaningful personalisation.

### Case D

Poor-quality MRI requiring evidence-only targeting.

### Case E

One strong target and no meaningful second/third target.

### Case F

Two clinically distinct symptom circuits.

### Case G

Interesting Cingulum-style anomaly that is Research Mode only.

### Case H

Clinician rejects Magniom Primary 1.

### Case I

Clinician selects an unranked standard evidence target.

### Case J

Evidence library changes after the patient's historical decision.

If all ten cases can be represented cleanly:

the canonical model is sufficiently mature for database design.

---

# 110. CANONICAL SCIENTIFIC CONTRACT

The model encodes the Magniom scientific architecture directly:

# Evidence constrains.

Represented by:

`EvidenceClaim`  
`TherapeuticCircuit`  
`TargetFamily`

↓

# Phenotype prioritises.

Represented inside:

`TargetCandidate.phenotype_fit`

↓

# Connectomics refines.

Represented inside:

`TargetCandidate.connectome_fit`

↓

# Reliability qualifies.

Represented by:

`TargetReliabilityProfile`

↓

# Anatomy constrains.

Represented by:

`TargetAccessibilityProfile`

↓

# E-field optimises.

Represented by:

`EFieldProfile`

↓

# Alternatives expose uncertainty.

Represented by:

`TargetSlate`

↓

# The specialist decides.

Represented by:

`ClinicianDecision`

---

# 111. FINAL DATA PRINCIPLES

## No recommendation without provenance.

## No personalised target without reliability.

## No clinical candidate beyond its evidence ceiling.

## No coordinate without coordinate space.

## No biological precision implied by atlas precision.

## No anomaly interpreted automatically as a therapeutic target.

## No candidate mistaken for a prescription.

## No forced five-target slate.

## No silent algorithm changes.

## No silent evidence changes.

## No historical object mutation after clinical sign-off.

## No black-box “AI confidence”.

## No clinical decision hidden inside the ranking engine.

---

# 112. CANONICAL SUMMARY

The seven core Magniom objects serve seven distinct purposes:

### `EvidenceClaim`

**What does the literature actually support?**

### `TherapeuticCircuit`

**Which distributed therapeutic network is relevant?**

### `TargetFamily`

**Which accessible cortical regions can defensibly engage that circuit?**

### `TargetCandidate`

**Where, in this patient, is a defensible stimulation hypothesis?**

### `TargetReliabilityProfile`

**How much should we trust the individual localisation?**

### `TargetSlate`

**What is the smallest useful set of competing target hypotheses?**

### `ClinicianDecision`

**What did the specialist ultimately decide, and why?**

Together they create the semantic bridge between:

# neuroscience

and:

# software engineering

without allowing either to erase the role of clinical judgement.

That is the Magniom Canonical Target Data Specification v1.0.