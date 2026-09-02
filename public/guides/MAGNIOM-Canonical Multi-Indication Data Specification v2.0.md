# MAGNIOM

## Canonical Multi-Indication Data Specification v2.0

**Document status:** Canonical domain/data specification
**Version:** 2.0
**Date:** 2 September 2026
**Supersedes:** MAGNIOM Canonical Target Data Specification v1.0 for new development
**Backward compatibility:** Historical v1 objects remain valid and immutable
**Primary purpose:** Canonical representation of multi-indication TMS target-decision support
**Primary user:** Appropriately trained neuromodulation specialist
**Clinical authority:** Human clinician
**Implementation independence:** Database-, API-, frontend- and compute-framework independent

**Depends on:**

* MAGNIOM Clinical & Scientific Specification v1.0
* MAGNIOM Canonical Target Data Specification v1.0
* MAGNIOM Evidence Knowledge Graph & Therapeutic Circuit Library v1.0
* MAGNIOM Neuroimaging & Functional Connectomics Pipeline Specification v1.0
* MAGNIOM Target Engine & Ranking Algorithm Specification v1.0
* MAGNIOM Scientific Policy & Algorithm Configuration Specification v1.0
* MAGNIOM System Requirements Specification v1.0
* MAGNIOM Multi-Indication Technical & Scientific Architecture Specification v2.0

---

# 1. PURPOSE

This specification defines the canonical v2 data model by which MAGNIOM represents:

* different clinical indications;
* indication-specific scientific modules;
* clinical objectives;
* disease stage;
* lesions and structural distortion;
* multimodal measurements;
* modality-specific reliability;
* evidence-dependent treatment context;
* multiple target geometries;
* patient-specific target candidates;
* multi-indication Target Slates;
* clinician decisions.

The principal new canonical objects are:

```text
IndicationModuleRelease
CaseIndication
ClinicalObjective
DiseaseStageContext
LesionContext
MeasurementBundle
MeasurementReliability
ReliabilityBundle
TreatmentContextRequirement
TreatmentContextSnapshot
TargetGeometry
```

Existing v1 objects remain fundamental:

```text
EvidenceClaim
TherapeuticCircuit
TargetFamily
TargetCandidate
TargetSlate
ClinicianDecision
```

---

# 2. v2 CORE DOMAIN PRINCIPLE

MAGNIOM must continue to preserve four distinct information classes:

# scientific evidence

# patient-specific observation

# algorithmic inference

# clinician decision.

Multi-indication support does not change this.

It adds a fifth explicit contextual layer:

# indication-specific scientific governance.

The v2 reconstruction chain becomes:

```text
IndicationModuleRelease
        +
ScientificPolicyRelease
        +
EvidenceLibraryRelease
        +
Clinician-approved phenotype/objective
        +
Disease / lesion context
        +
Qualified measurements
        +
Measurement reliability
        +
Anatomical / stimulation constraints
        ↓
TargetCandidate
        ↓
TargetSlate
        ↓
ClinicianDecision
```

No part of this chain may be silently inferred from diagnosis alone.

---

# 3. ONE PLATFORM — MULTIPLE SCIENTIFIC MODELS

MAGNIOM v2 SHALL use:

# one canonical platform model

with:

# independently governed indication modules.

Do not implement:

```text
if diagnosis == stroke:
    use stroke tables

if diagnosis == pain:
    use different target tables
```

Instead:

```text
Case
  ↓
CaseIndication
  ↓
IndicationModuleRelease
  ↓
canonical objects
```

This prevents architectural fragmentation.

---

# 4. v2 CANONICAL OBJECT GRAPH

```text
                          EvidenceClaim
                                │
                                ▼
                       TherapeuticCircuit
                                │
                                ▼
                           TargetFamily
                                │
                                │
IndicationModuleRelease ────────┤
           │                    │
           ▼                    │
     CaseIndication             │
           │                    │
           ├──── ClinicalObjective
           │
           ├──── DiseaseStageContext
           │
           ├──── LesionContext
           │
           ├──── PhenotypeSnapshot
           │
           ├──── TreatmentContextSnapshot
           │
           ├──── MeasurementBundle
           │             │
           │             ▼
           │       ReliabilityBundle
           │
           └────────────────────┐
                                ▼
                         TargetCandidate
                                │
                                ▼
                           TargetSlate
                                │
                                ▼
                       ClinicianDecision
```

---

# 5. DESIGN REQUIREMENTS

Every canonical v2 object SHALL support, where relevant:

### Immutable identity

Globally unique ID.

### Explicit version identity

Historical scientific decisions must remain reconstructable.

### Provenance

Who or what created the object, when and from which source.

### Indication scope

Which indication/module the object belongs to.

### Mode scope

Clinical / Research.

### Population scope

Where scientific applicability is population-dependent.

### Temporal validity

Where disease stage or clinical context matters.

### Data quality

Verified, reviewed, incomplete etc.

### Uncertainty

Explicit and typed where possible.

### Supersession

Historical objects remain recoverable.

### Scientific compatibility

No uncontrolled cross-module inheritance.

---

# 6. UNIVERSAL IDENTIFIER TYPES

Canonical implementation language may use aliases:

```ts
type UUID = string;
type ISO8601UTC = string;
type SHA256 = string;

type MagniomMode =
  | "clinical"
  | "research";

type DataQualityState =
  | "verified"
  | "reviewed"
  | "unverified"
  | "incomplete"
  | "invalid";

type QualitativeConfidence =
  | "high"
  | "moderate"
  | "low"
  | "not_assessable";
```

---

# 7. INDICATION CONCEPT

`Indication` represents the clinical condition/problem for which a specific MAGNIOM targeting analysis is being performed.

```ts
interface IndicationRef {
  concept_id: string;
  label: string;

  coding_system?: string;
  code?: string;
}
```

Examples:

```text
Major depressive disorder
Obsessive-compulsive disorder
Neuropathic pain
Stroke — motor rehabilitation
Stroke — aphasia
Traumatic brain injury — depression
Chronic tinnitus
```

---

# 8. INDICATION IS NOT CASE DIAGNOSIS

A patient may have:

```text
MDD
+
neuropathic pain
+
previous stroke
```

But a Target Slate is not generated from an undifferentiated diagnosis list.

Each targeting analysis SHALL identify:

# the therapeutic indication currently being addressed.

---

# 9. CASE INDICATION

```ts
interface CaseIndication {
  id: UUID;
  version: string;

  case_id: UUID;

  indication: IndicationRef;

  indication_module_release_id: UUID;

  status:
    | "proposed"
    | "confirmed"
    | "inactive"
    | "superseded";

  clinical_role:
    | "primary_targeting_indication"
    | "secondary_condition"
    | "contextual_comorbidity";

  confirmation_source_ids: UUID[];

  confirmed_by?: UUID;
  confirmed_at?: ISO8601UTC;

  data_quality: DataQualityState;

  provenance: Provenance;
}
```

---

# 10. ONE TARGET SLATE — ONE PRINCIPAL INDICATION MODULE

Every Target Slate SHALL reference exactly one:

```text
CaseIndication
```

and one:

```text
IndicationModuleRelease.
```

This prevents:

```text
MDD science
+
pain science
+
stroke science
→ one opaque universal score.
```

Cross-indication comparison is a separate operation.

---

# 11. `IndicationModuleRelease`

## Definition

An `IndicationModuleRelease` is the immutable scientific-domain definition that tells MAGNIOM:

> what clinical problem is being analysed and what categories of evidence, phenotype, measurement and targeting logic are permitted for that problem.

It does not itself contain executable ranking code.

---

# 12. INDICATION MODULE INTERFACE

```ts
interface IndicationModuleRelease {
  id: UUID;

  code: string;
  semantic_version: string;

  title: string;
  description: string;

  indication: IndicationRef;

  lifecycle_status:
    | "draft"
    | "validation"
    | "active"
    | "superseded"
    | "withdrawn"
    | "archived";

  module_status:
    | "research_only"
    | "evidence_staging"
    | "validation_candidate"
    | "retrospective_validation"
    | "silent_prospective"
    | "clinical_release_candidate"
    | "clinical_active";

  permitted_modes: MagniomMode[];

  intended_population: PopulationDefinition;

  excluded_populations?: PopulationDefinition[];

  phenotype_schema_version_id: UUID;

  clinical_objective_definition_ids: UUID[];

  disease_stage_definition_ids?: UUID[];

  evidence_scope_id: UUID;

  permitted_target_family_ids: UUID[];

  permitted_candidate_generation_method_ids: UUID[];

  measurement_requirements: MeasurementRequirement[];

  reliability_policy_refs: UUID[];

  permitted_target_geometry_types: TargetGeometryType[];

  treatment_context_requirement_ids?: UUID[];

  device_requirements?: DeviceCapabilityRequirement[];

  scientific_policy_compatibility_refs: UUID[];

  known_limitations: string[];

  validation_evidence_ids: UUID[];

  payload_sha256: SHA256;
  manifest_sha256: SHA256;

  created_at: ISO8601UTC;
  released_at?: ISO8601UTC;
  supersedes_release_id?: UUID;

  provenance: Provenance;
}
```

---

# 13. MODULE CODES

Recommended module identities:

```text
MAGNIOM-IND-MDD
MAGNIOM-IND-OCD
MAGNIOM-IND-PAIN-NP
MAGNIOM-IND-STROKE-MOTOR
MAGNIOM-IND-STROKE-APHASIA
MAGNIOM-IND-TBI-DEP
MAGNIOM-IND-TBI-COG
MAGNIOM-IND-TINNITUS
```

Human-readable codes are secondary to immutable IDs.

---

# 14. INDICATION MODULE IMMUTABILITY

Once active for a validation or clinical release:

# `IndicationModuleRelease` is immutable.

Changing:

* allowed TargetFamilies;
* required measurements;
* target geometry;
* population scope;
* stage logic;
* treatment-context requirement;

creates a new release.

---

# 15. MODULE STATUS IS NOT EVIDENCE TIER

Do not confuse:

```text
module_status = clinical_active
```

with:

```text
EvidenceTier = A.
```

Module status describes MAGNIOM governance maturity.

Evidence Tier describes the scientific evidence associated with a particular claim/target relationship.

---

# 16. CLINICAL OBJECTIVE

## Definition

A `ClinicalObjective` describes what the treating specialist is trying to improve.

This replaces the MDD-centric assumption that all targeting priorities are symptom-domain priorities.

Examples:

```text
reduce depressive burden
reduce compulsive symptoms
improve upper-limb motor function
improve naming
reduce neuropathic hand pain
reduce tinnitus distress
```

---

# 17. CLINICAL OBJECTIVE INTERFACE

```ts
interface ClinicalObjective {
  id: UUID;

  case_indication_id: UUID;

  objective_definition_id: UUID;

  concept: ClinicalConceptRef;

  priority_rank: number;

  clinician_priority?: number;
  patient_priority?: number;

  current_burden?: MeasurementValue;

  functional_impact?: MeasurementValue;

  target_mappability:
    | "clinically_supported"
    | "supporting_only"
    | "research_only"
    | "not_evidence_mappable";

  confidence: QualitativeConfidence;

  rationale?: string;

  approved_by?: UUID;
  approved_at?: ISO8601UTC;

  provenance: Provenance;
}
```

---

# 18. OBJECTIVE DEFINITION

Reusable scientific definitions SHALL remain separate:

```ts
interface ClinicalObjectiveDefinition {
  id: UUID;
  version: string;

  indication_module_release_id: UUID;

  concept: ClinicalConceptRef;

  description: string;

  evidence_mappability:
    | "clinical"
    | "supporting"
    | "research"
    | "none";

  evidence_claim_ids: UUID[];

  provenance: Provenance;
}
```

---

# 19. DISEASE STAGE CONTEXT

## Definition

`DiseaseStageContext` captures disease/recovery timing where clinical evidence is stage-dependent.

This is particularly important for:

* stroke;
* TBI;
* postoperative/injury states;
* potentially other future neurological conditions.

---

# 20. STAGE CONTEXT INTERFACE

```ts
interface DiseaseStageContext {
  id: UUID;
  version: string;

  case_indication_id: UUID;

  stage_definition_id: UUID;

  onset_date?: string;

  calculated_duration_days?: number;

  current_stage_code: string;
  current_stage_label: string;

  determination_method:
    | "date_based"
    | "clinician_assessed"
    | "combined";

  confidence: QualitativeConfidence;

  data_quality: DataQualityState;

  approved_by?: UUID;
  approved_at?: ISO8601UTC;

  provenance: Provenance;
}
```

---

# 21. STAGE DEFINITION

```ts
interface DiseaseStageDefinition {
  id: UUID;
  version: string;

  indication_module_release_id: UUID;

  code: string;
  label: string;

  temporal_bounds?: {
    minimum_days?: number;
    maximum_days?: number;
  };

  description: string;

  evidence_claim_ids?: UUID[];

  provenance: Provenance;
}
```

---

# 22. STAGE MUST NOT BE SILENTLY GUESSED

If stroke onset is uncertain:

MAGNIOM SHALL represent:

```text
confidence = low
```

or:

```text
stage = not_assessable
```

where appropriate.

It SHALL NOT silently classify a patient into a treatment-relevant stage from incomplete dates.

---

# 23. LESION CONTEXT

## Definition

`LesionContext` represents clinically and spatially relevant structural pathology that may alter:

* target existence;
* cortical anatomy;
* registration;
* connectivity;
* E-field;
* target accessibility.

It is not itself a target.

---

# 24. LESION CONTEXT INTERFACE

```ts
interface LesionContext {
  id: UUID;
  version: string;

  case_indication_id: UUID;

  lesion_type:
    | "ischemic"
    | "hemorrhagic"
    | "traumatic"
    | "post_surgical"
    | "encephalomalacic"
    | "multifocal"
    | "other";

  lesion_laterality:
    | "left"
    | "right"
    | "bilateral"
    | "midline"
    | "multifocal"
    | "not_assessable";

  lesion_mask_artifact_id?: UUID;

  source_imaging_study_ids: UUID[];

  lesion_volume_cm3?: number;

  cortical_regions_affected: AtlasRegionRef[];

  subcortical_regions_affected: AtlasRegionRef[];

  tract_findings?: LesionTractFinding[];

  skull_abnormality?: SkullContext;

  structural_distortion: QualitativeConfidence;

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

  efield_relevance:
    | "none_known"
    | "potential"
    | "material"
    | "not_assessable";

  target_region_exclusions?: SpatialRegion[];

  data_quality: DataQualityState;

  interpretation: string;

  provenance: Provenance;
}
```

---

# 25. LESION TRACT FINDING

```ts
interface LesionTractFinding {
  tract: AtlasTractRef;

  involvement:
    | "none"
    | "partial"
    | "substantial"
    | "complete"
    | "uncertain";

  measurement_method?: string;

  source_measurement_id?: UUID;

  confidence: QualitativeConfidence;
}
```

---

# 26. SKULL CONTEXT

Important particularly for TBI and postoperative cases:

```ts
interface SkullContext {
  skull_defect_present: boolean;

  cranioplasty_present: boolean;

  intracranial_hardware_present: boolean;

  details?: string;

  efield_modelling_required?: boolean;
}
```

This object does not replace standard TMS safety assessment.

---

# 27. LESION HARD INVARIANT

A target SHALL NOT be treated as ordinary intact cortical anatomy when its target region is:

* absent;
* severely structurally distorted;
* invalidly registered;
* excluded by the active scientific policy.

Candidate status SHALL reflect the limitation.

---

# 28. MEASUREMENT ARCHITECTURE

v1 implicitly privileged:

```text
structural MRI
+
resting-state fMRI.
```

v2 generalises patient-specific evidence into:

# Measurement objects.

Possible modalities:

```ts
type MeasurementModality =
  | "structural_mri"
  | "resting_state_fmri"
  | "task_fmri"
  | "diffusion_mri"
  | "motor_mapping"
  | "motor_evoked_potential"
  | "eeg"
  | "tms_eeg"
  | "audiology"
  | "clinical_neurophysiology"
  | "efield"
  | "other";
```

---

# 29. MEASUREMENT REFERENCE

```ts
interface MeasurementRef {
  measurement_id: UUID;

  modality: MeasurementModality;

  version: string;

  status:
    | "available"
    | "qualified"
    | "qualified_with_limits"
    | "failed"
    | "not_applicable";

  acquisition_time?: ISO8601UTC;

  pipeline_version_ids?: UUID[];

  artifact_ids?: UUID[];
}
```

---

# 30. MEASUREMENT REQUIREMENT

Defined by the Indication Module:

```ts
interface MeasurementRequirement {
  code: string;

  modality: MeasurementModality;

  requirement:
    | "required"
    | "required_for_personalisation"
    | "optional"
    | "research_only"
    | "not_applicable";

  purpose:
    | "anatomical_localisation"
    | "candidate_generation"
    | "candidate_refinement"
    | "qualification"
    | "reliability"
    | "context"
    | "efield";

  minimum_quality_policy_ref?: UUID;

  missing_data_behaviour:
    | "block_target_generation"
    | "disable_personalisation"
    | "fallback"
    | "allow_with_limitation";

  fallback_rule_ref?: UUID;

  rationale: string;
}
```

---

# 31. `MeasurementBundle`

## Definition

A `MeasurementBundle` is the immutable case-level set of patient measurements made available to one targeting analysis.

It answers:

> Which patient-specific measurements were actually available when this Target Slate was generated?

---

# 32. MEASUREMENT BUNDLE INTERFACE

```ts
interface MeasurementBundle {
  id: UUID;
  version: string;

  case_id: UUID;
  case_indication_id: UUID;

  indication_module_release_id: UUID;

  phenotype_snapshot_id: UUID;

  disease_stage_context_id?: UUID;
  lesion_context_ids?: UUID[];

  measurements: MeasurementRef[];

  qualification_status:
    | "qualified"
    | "qualified_with_limits"
    | "insufficient"
    | "invalid";

  requirement_evaluations: MeasurementRequirementEvaluation[];

  limiting_factors: string[];

  created_at: ISO8601UTC;

  payload_sha256: SHA256;

  provenance: Provenance;
}
```

---

# 33. REQUIREMENT EVALUATION

```ts
interface MeasurementRequirementEvaluation {
  requirement_code: string;

  satisfied: boolean;

  satisfying_measurement_ids: UUID[];

  resulting_capability:
    | "enabled"
    | "disabled"
    | "fallback_only"
    | "research_only";

  explanation: string;
}
```

---

# 34. MEASUREMENT BUNDLE IS A SNAPSHOT

If a new motor map is acquired tomorrow:

the historical MeasurementBundle remains unchanged.

A future Target Slate uses:

```text
MeasurementBundle B
```

not a mutated historical:

```text
MeasurementBundle A.
```

---

# 35. EXAMPLE — MDD MEASUREMENT BUNDLE

```text
Structural MRI         qualified
Resting-state fMRI     qualified
E-field                optional / unavailable
```

Possible capability:

```text
connectome_refinement = enabled
```

---

# 36. EXAMPLE — STROKE MOTOR BUNDLE

```text
Structural MRI         qualified
Lesion mask            qualified
Motor mapping          qualified
MEP                    available
Diffusion MRI          research only
Resting-state fMRI     optional
```

---

# 37. EXAMPLE — PAIN BUNDLE

```text
Structural MRI         qualified
Pain body map          approved clinical context
Motor mapping          qualified
rs-fMRI                unavailable
```

This may still support a valid somatotopic M1 analysis.

---

# 38. RELIABILITY v2

v1 `TargetReliabilityProfile` was primarily a functional-connectomics reliability object. 

v2 generalises this into two levels:

### `MeasurementReliability`

How much should MAGNIOM trust a specific patient-specific measurement?

### `ReliabilityBundle`

Which reliability evidence qualifies the complete patient-specific targeting analysis?

---

# 39. MEASUREMENT RELIABILITY

```ts
interface MeasurementReliability {
  id: UUID;
  version: string;

  case_id: UUID;

  measurement_id: UUID;

  modality: MeasurementModality;

  method_code: string;
  method_version: string;

  qc_status:
    | "pass"
    | "conditional"
    | "fail";

  metrics: ReliabilityMeasure[];

  reproducibility?: {
    within_run?: ReliabilityMeasure[];
    cross_run?: ReliabilityMeasure[];
    cross_method?: ReliabilityMeasure[];
  };

  spatial_reliability?: {
    split_half_distance_mm?: number;
    cross_run_distance_mm?: number;
    confidence_region?: SpatialRegion;
  };

  pipeline_sensitivity?: ReliabilityMeasure[];

  reliability_class:
    | "high"
    | "moderate"
    | "low"
    | "unreliable"
    | "not_assessable";

  limiting_factors: string[];

  interpretation: string;

  pipeline_version_ids: UUID[];

  provenance: Provenance;
}
```

---

# 40. RELIABILITY MEASURE

Preserve the v1 concept:

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

  reference_range_id?: UUID;
}
```

---

# 41. MODALITY-SPECIFIC RELIABILITY

MAGNIOM SHALL NOT force all modalities into rs-fMRI metrics.

Examples:

### rs-fMRI

```text
split-half localisation
cross-run localisation
usable minutes
motion
pipeline sensitivity
```

### motor mapping

```text
hotspot reproducibility
map centre reproducibility
threshold stability
MEP response stability
```

### diffusion MRI

```text
tract reconstruction reproducibility
model sensitivity
tract coverage
```

### lesion segmentation

```text
segmentation agreement
registration quality
manual-review status
```

### audiology

```text
test validity
repeatability
laterality consistency
```

---

# 42. `ReliabilityBundle`

```ts
interface ReliabilityBundle {
  id: UUID;
  version: string;

  case_id: UUID;
  case_indication_id: UUID;

  indication_module_release_id: UUID;

  measurement_bundle_id: UUID;

  component_reliability_ids: UUID[];

  capability_qualification: ReliabilityCapabilityQualification[];

  overall_qualification:
    | "qualified"
    | "qualified_with_limits"
    | "not_qualified";

  limiting_factors: string[];

  interpretation: string;

  payload_sha256: SHA256;

  provenance: Provenance;
}
```

---

# 43. RELIABILITY CAPABILITY QUALIFICATION

```ts
interface ReliabilityCapabilityQualification {
  capability_code: string;

  e.g?: never;

  status:
    | "qualified"
    | "qualified_with_limits"
    | "not_qualified";

  relied_on_measurement_ids: UUID[];

  relied_on_reliability_ids: UUID[];

  policy_rule_id: UUID;

  explanation: string;
}
```

Example capability codes:

```text
individual_fc_refinement
motor_hotspot_targeting
lesion_network_analysis
structural_connectivity_refinement
efield_optimisation
```

---

# 44. RELIABILITY IS CAPABILITY-SPECIFIC

A case may simultaneously have:

```text
structural localisation       qualified

motor mapping                 qualified

rs-fMRI personalisation       not qualified
```

MAGNIOM SHALL NOT collapse this into:

```text
overall patient data quality = 71%.
```

---

# 45. v1 RELIABILITY BACKWARD COMPATIBILITY

Existing:

```text
TargetReliabilityProfile
```

shall be retained as:

# a valid specialised v1 functional-connectomics reliability representation.

v2 migration MAY map it conceptually to:

```text
MeasurementReliability
modality = resting_state_fmri
```

plus appropriate `ReliabilityBundle`.

Historical records SHALL NOT be rewritten merely for schema uniformity.

---

# 46. TREATMENT CONTEXT

## Scientific distinction

MAGNIOM v2 must represent:

# the context under which evidence was demonstrated

without turning MAGNIOM into an autonomous protocol prescriber.

Examples:

* concurrent speech-language therapy;
* motor rehabilitation;
* OCD symptom provocation;
* device/coil type;
* stimulation strategy precedent.

---

# 47. `TreatmentContextRequirement`

Reusable scientific object:

```ts
interface TreatmentContextRequirement {
  id: UUID;
  version: string;

  indication_module_release_id: UUID;

  code: string;
  label: string;

  context_type:
    | "concurrent_rehabilitation"
    | "behavioural_activation"
    | "symptom_provocation"
    | "task_state"
    | "device_class"
    | "coil_class"
    | "protocol_precedent"
    | "other";

  role:
    | "required_by_evidence"
    | "recommended_by_evidence"
    | "context_only";

  description: string;

  evidence_claim_ids: UUID[];

  absence_behaviour:
    | "ineligible"
    | "downgrade_evidence_applicability"
    | "show_limitation"
    | "research_only";

  provenance: Provenance;
}
```

---

# 48. `TreatmentContextSnapshot`

Patient/case instance:

```ts
interface TreatmentContextSnapshot {
  id: UUID;
  version: string;

  case_indication_id: UUID;

  requirement_evaluations: TreatmentContextEvaluation[];

  approved_by?: UUID;
  approved_at?: ISO8601UTC;

  payload_sha256: SHA256;

  provenance: Provenance;
}
```

---

# 49. TREATMENT CONTEXT EVALUATION

```ts
interface TreatmentContextEvaluation {
  treatment_context_requirement_id: UUID;

  status:
    | "present"
    | "planned"
    | "absent"
    | "unknown"
    | "not_applicable";

  evidence?: string;

  data_quality: DataQualityState;

  interpretation?: string;
}
```

---

# 50. TREATMENT CONTEXT IS NOT PROTOCOL PRESCRIPTION

The data model MAY represent:

```text
Evidence supporting this target was obtained with concurrent
speech-language rehabilitation.
```

It SHALL NOT automatically generate:

```text
prescribe specific stimulation frequency/intensity/dose
```

unless a separately validated future protocol-selection specification exists.

---

# 51. PROTOCOL REMAINS SEPARATE

Preserve the v1 boundary:

```text
TargetCandidate
      ↓
Clinician target decision
      ↓
future ProtocolCandidate
      ↓
Clinician protocol decision
```

The distinction between:

# where to stimulate

and:

# how to stimulate

remains canonical.

---

# 52. TARGET GEOMETRY v2

v1 correctly rejected the assumption that a target is merely an MNI coordinate. 

v2 formalises target geometry using a discriminated union.

```ts
type TargetGeometry =
  | PointTargetGeometry
  | SurfaceROITargetGeometry
  | VolumetricROITargetGeometry
  | SomatotopicTargetGeometry
  | CoilFieldTargetGeometry
  | NetworkTargetGeometry;
```

---

# 53. TARGET GEOMETRY TYPE

```ts
type TargetGeometryType =
  | "point"
  | "surface_roi"
  | "volumetric_roi"
  | "somatotopic"
  | "coil_field"
  | "network";
```

---

# 54. COMMON GEOMETRY CONTRACT

Every target geometry SHALL contain:

```ts
interface TargetGeometryBase {
  geometry_type: TargetGeometryType;

  coordinate_space: CoordinateSpaceRef;

  laterality:
    | "left"
    | "right"
    | "bilateral"
    | "midline"
    | "not_applicable";

  source_method: string;

  source_method_version: string;

  provenance: Provenance;
}
```

---

# 55. POINT TARGET

```ts
interface PointTargetGeometry extends TargetGeometryBase {
  geometry_type: "point";

  centre: Coordinate3D;

  optional_roi?: SpatialRegion;

  surface_vertex_id?: string;

  normal_vector?: Vector3D;
}
```

Appropriate for focal neuronavigated target centres.

---

# 56. SURFACE ROI TARGET

```ts
interface SurfaceROITargetGeometry extends TargetGeometryBase {
  geometry_type: "surface_roi";

  surface_id: UUID;

  vertex_ids?: string[];

  mesh_artifact_id?: UUID;

  centre?: Coordinate3D;

  area_mm2?: number;

  confidence_region?: SpatialRegion;
}
```

---

# 57. VOLUMETRIC ROI TARGET

```ts
interface VolumetricROITargetGeometry extends TargetGeometryBase {
  geometry_type: "volumetric_roi";

  mask_artifact_id: UUID;

  centre?: Coordinate3D;

  volume_mm3?: number;

  atlas_annotations?: AtlasAnnotation[];
}
```

---

# 58. SOMATOTOPIC TARGET

Required for motor/pain applications.

```ts
interface SomatotopicTargetGeometry extends TargetGeometryBase {
  geometry_type: "somatotopic";

  cortical_region: AtlasRegionRef;

  body_region: BodyRegionRef;

  affected_body_side?:
    | "left"
    | "right"
    | "bilateral"
    | "midline"
    | "not_applicable";

  stimulation_hemisphere:
    | "left"
    | "right"
    | "bilateral";

  motor_mapping_run_id?: UUID;

  mapped_hotspot?: Coordinate3D;

  mapped_surface_region?: SpatialRegion;

  mapping_reliability_id?: UUID;
}
```

---

# 59. BODY REGION REFERENCE

```ts
interface BodyRegionRef {
  code: string;

  label: string;

  parent_code?: string;
}
```

Example hierarchy:

```text
upper limb
 └── hand
     ├── thumb
     └── fingers

lower limb
face
trunk
```

A generic uncontrolled free-text body site should not be sufficient where somatotopy determines the target.

---

# 60. COIL-FIELD TARGET

Required for targeting strategies defined by a distributed field rather than a single cortical coordinate.

```ts
interface CoilFieldTargetGeometry extends TargetGeometryBase {
  geometry_type: "coil_field";

  coil_model_id: UUID;

  device_model_id?: UUID;

  placement: CoilPlacement;

  intended_field_region: SpatialRegion;

  therapeutic_region_ids: UUID[];

  efield_run_id?: UUID;

  field_coverage_metrics?: EFieldMetric[];

  pose_tolerance?: PoseTolerance;

  point_coordinate_is_representative_only: boolean;
}
```

---

# 61. COIL PLACEMENT

```ts
interface CoilPlacement {
  scalp_coordinate?: Coordinate3D;

  orientation_degrees?: number;

  coil_to_scalp_distance_mm?: number;

  placement_coordinate_system: CoordinateSpaceRef;

  placement_description?: string;
}
```

---

# 62. COIL-FIELD INVARIANT

For a `coil_field` target:

a representative centre coordinate SHALL NOT be presented as though it fully defines the scientific target.

This is particularly important for:

* deep TMS;
* broad-field coils;
* field-volume hypotheses.

---

# 63. NETWORK TARGET GEOMETRY

For research or future validated applications:

```ts
interface NetworkTargetGeometry extends TargetGeometryBase {
  geometry_type: "network";

  therapeutic_circuit_ids: UUID[];

  accessible_node_regions: SpatialRegion[];

  preferred_stimulation_region?: SpatialRegion;

  network_definition_version_id: UUID;

  network_measurement_source_ids?: UUID[];
}
```

Clinical use requires explicit module/policy permission.

---

# 64. SPATIAL REGION REMAINS CANONICAL

Existing `SpatialRegion` continues to underpin:

* ROI geometry;
* confidence regions;
* lesion exclusions;
* target family search spaces;
* E-field regions.

The richer `TargetGeometry` defines:

# what the target means.

`SpatialRegion` defines:

# where a spatial object exists.

---

# 65. COORDINATE SPACE

Every coordinate SHALL identify:

```ts
interface CoordinateSpaceRef {
  id: string;

  name: string;

  version?: string;

  orientation?: string;

  subject_specific: boolean;
}
```

Examples:

```text
subject_T1
fsnative
fsLR
MNI152NLin2009cAsym
```

---

# 66. NO COORDINATE WITHOUT TRANSFORM PROVENANCE

When both subject and standard-space positions are stored, the transform chain SHALL remain reconstructable.

```ts
interface SpatialTransformRef {
  transform_id: UUID;

  from_space: CoordinateSpaceRef;
  to_space: CoordinateSpaceRef;

  method: string;
  method_version: string;

  artifact_sha256: SHA256;
}
```

---

# 67. TARGET FAMILY v2 EXTENSION

Existing `TargetFamily` remains reusable but receives additive multi-indication semantics.

Conceptually:

```ts
interface TargetFamilyV2 extends TargetFamily {
  permitted_indication_module_release_ids: UUID[];

  permitted_target_geometry_types: TargetGeometryType[];

  permitted_candidate_generation_method_ids: UUID[];

  treatment_context_requirement_ids?: UUID[];

  required_measurement_capabilities?: string[];

  disease_stage_constraints?: DiseaseStageConstraint[];
}
```

---

# 68. TARGET FAMILY IS NOT UNIVERSALLY CLINICAL

Example:

```text
M1
```

does not carry one universal MAGNIOM evidence status.

It may be:

* clinically supported for one pain population;
* supported differently in stroke motor rehabilitation;
* exploratory for another condition.

Evidence applicability is contextual.

---

# 69. EVIDENCE PROFILE v2

```ts
interface TargetEvidenceProfileV2 {
  highest_evidence_tier: EvidenceTier;

  indication_match: boolean;

  indication_module_match: boolean;

  population_match: boolean;

  disease_stage_match:
    | "match"
    | "mismatch"
    | "not_applicable"
    | "uncertain";

  target_family_match: boolean;

  targeting_method_match: boolean;

  target_geometry_match: boolean;

  treatment_context_match?:
    | "match"
    | "partial"
    | "mismatch"
    | "unknown";

  evidence_claim_ids: UUID[];

  conflicting_evidence_claim_ids?: UUID[];

  evidence_confidence: QualitativeConfidence;

  applicability_limitations: string[];

  evidence_summary: string;
}
```

---

# 70. TARGET CANDIDATE v2

## Definition

A `TargetCandidate` remains:

> a patient-specific, anatomically defined, evidence-traceable stimulation hypothesis generated for specialist review.

v2 expands the contextual information required to interpret it.

---

# 71. TARGET CANDIDATE INTERFACE v2

```ts
interface TargetCandidateV2 {
  id: UUID;
  version: string;

  case_id: UUID;
  case_indication_id: UUID;

  assessment_id: UUID;

  mode: MagniomMode;

  indication_module_release_id: UUID;

  scientific_policy_release_id: UUID;

  generation_status:
    | "generated"
    | "eligible"
    | "ineligible"
    | "suppressed"
    | "research_only";

  candidate_role: CandidateRole;

  target_family_id: UUID;

  therapeutic_circuit_ids: UUID[];

  clinical_objective_ids: UUID[];

  target_geometry: TargetGeometry;

  standard_space_geometry?: TargetGeometry;

  atlas_annotations: AtlasAnnotation[];

  clinical_evidence: TargetEvidenceProfileV2;

  phenotype_fit: PhenotypeFitProfile;

  disease_stage_context_id?: UUID;

  lesion_context_ids?: UUID[];

  measurement_bundle_id: UUID;

  reliability_bundle_id?: UUID;

  relied_on_measurement_ids: UUID[];

  relied_on_reliability_ids: UUID[];

  connectome_fit?: ConnectomeFitProfile;

  structural_connectivity_fit?: StructuralConnectivityFitProfile;

  motor_mapping_fit?: MotorMappingFitProfile;

  lesion_relationship?: LesionTargetRelationship;

  normative_context?: NormativeContextProfile;

  accessibility: TargetAccessibilityProfile;

  efield?: EFieldProfile;

  treatment_context_evaluation?: TargetTreatmentContextEvaluation;

  counterfactual?: CounterfactualTargetComparison;

  convergence?: CandidateConvergenceProfile;

  uncertainty: UncertaintyProfile;

  nomination_rationale: string;

  counterarguments: string[];

  supporting_evidence_claim_ids: UUID[];

  conflicting_evidence_claim_ids: UUID[];

  internal_ranking_features?: RankingFeatureVector;

  target_engine_version_id: UUID;
  evidence_library_release_id: UUID;

  provenance: Provenance;
}
```

---

# 72. CANDIDATE ROLE v2

```ts
type CandidateRole =
  | "evidence_anchor"
  | "phenotype_specific"
  | "connectome_refinement"
  | "somatotopic_target"
  | "ipsilesional_strategy"
  | "contralesional_strategy"
  | "lesion_network_target"
  | "field_target"
  | "network_alternative"
  | "clinical_alternative"
  | "research_hypothesis";
```

Roles SHALL be permitted by the active indication module and Scientific Policy.

---

# 73. MDD COMPATIBILITY

Existing v1 roles map directly:

```text
symptom_circuit
→ phenotype_specific
```

while:

```text
evidence_anchor
connectome_refinement
network_alternative
clinical_alternative
research_hypothesis
```

remain semantically compatible.

Migration need not rename historical rows.

---

# 74. LESION-TARGET RELATIONSHIP

```ts
interface LesionTargetRelationship {
  lesion_context_id: UUID;

  target_relationship:
    | "outside_lesion"
    | "adjacent"
    | "partially_involved"
    | "substantially_involved"
    | "destroyed_or_absent"
    | "not_assessable";

  minimum_distance_to_lesion_mm?: number;

  tissue_integrity:
    | "apparently_intact"
    | "altered"
    | "severely_altered"
    | "not_assessable";

  interpretation: string;
}
```

---

# 75. MOTOR MAPPING FIT

```ts
interface MotorMappingFitProfile {
  motor_mapping_run_id: UUID;

  relevant_body_region: BodyRegionRef;

  hotspot_coordinate?: Coordinate3D;

  candidate_to_hotspot_distance_mm?: number;

  map_overlap?: number;

  map_reliability_id?: UUID;

  interpretation: string;
}
```

---

# 76. STRUCTURAL CONNECTIVITY FIT

Preserve the v1 future extension but formalise it:

```ts
interface StructuralConnectivityFitProfile {
  source_measurement_id: UUID;

  tract_ids: UUID[];

  connectivity_metrics: Record<string, number>;

  method: string;
  model_version: string;

  reliability_id?: UUID;

  interpretation: string;
}
```

---

# 77. TARGET TREATMENT CONTEXT EVALUATION

```ts
interface TargetTreatmentContextEvaluation {
  treatment_context_snapshot_id: UUID;

  required_context_ids: UUID[];

  matched_context_ids: UUID[];

  applicability:
    | "full"
    | "partial"
    | "limited"
    | "not_applicable";

  limitations: string[];

  interpretation: string;
}
```

---

# 78. CANDIDATE HARD INVARIANTS

A Clinical Mode candidate cannot become eligible unless:

```text
case_indication matches module
```

AND:

```text
IndicationModuleRelease permits Clinical Mode
```

AND:

```text
ScientificPolicyRelease permits exact module configuration
```

AND:

```text
evidence eligibility passes
```

AND:

```text
target family/method/geometry are permitted
```

AND:

```text
mandatory measurement requirements are satisfied
```

AND:

```text
required reliability capabilities are qualified
```

AND:

```text
anatomical accessibility passes
```

AND:

where applicable:

```text
disease-stage criteria pass
```

AND:

where applicable:

```text
lesion constraints pass
```

AND:

where evidence requires it:

```text
treatment context is sufficiently matched.
```

---

# 79. MISSING MEASUREMENT DOES NOT EQUAL ZERO

If rs-fMRI is unavailable:

do not set:

```text
connectome_fit = 0
```

and penalise an evidence-only candidate.

Instead:

```text
capability = unavailable
```

and use module-defined fallback behaviour.

---

# 80. MISSING LESION DATA

For a module requiring qualified lesion assessment:

```text
LesionContext missing
```

may cause:

```text
candidate generation blocked
```

rather than guessing normal anatomy.

---

# 81. TARGET SLATE v2

## Definition

A `TargetSlate` remains:

> the smallest useful set of competing target hypotheses for specialist review.

The 1–3 Primary / 0–2 Additional principle remains valid unless a future module-specific validated specification changes it.

---

# 82. TARGET SLATE INTERFACE v2

```ts
interface TargetSlateV2 {
  id: UUID;
  version: string;

  case_id: UUID;
  case_indication_id: UUID;

  assessment_id: UUID;

  mode: MagniomMode;

  indication_module_release_id: UUID;

  scientific_policy_release_id: UUID;

  status:
    | "draft"
    | "generated"
    | "ready_for_review"
    | "reviewed"
    | "superseded"
    | "abstained";

  generated_at: ISO8601UTC;

  phenotype_snapshot_id: UUID;

  clinical_objective_ids: UUID[];

  disease_stage_context_id?: UUID;

  lesion_context_ids?: UUID[];

  measurement_bundle_id: UUID;

  reliability_bundle_id?: UUID;

  evidence_library_release_id: UUID;
  target_engine_version_id: UUID;

  pipeline_version_ids: UUID[];

  normative_model_version_ids?: UUID[];

  efield_engine_version_id?: UUID;

  primary_candidates: SlateCandidateRefV2[];

  additional_candidates: SlateCandidateRefV2[];

  slate_convergence: SlateConvergenceProfileV2;

  clinical_coverage: ClinicalCoverageProfileV2;

  counterfactual_summary?: SlateCounterfactualSummary;

  abstention?: AbstentionProfileV2;

  global_uncertainty: UncertaintyProfile;

  generation_summary: string;

  scientific_limitations: string[];

  payload_sha256: SHA256;

  provenance: Provenance;
}
```

---

# 83. SLATE CANDIDATE REFERENCE v2

```ts
interface SlateCandidateRefV2 {
  target_candidate_id: UUID;

  position:
    | "primary_1"
    | "primary_2"
    | "primary_3"
    | "additional_a"
    | "additional_b";

  role: CandidateRole;

  rank_within_role?: number;

  inclusion_reason: string;

  redundancy_with?: UUID[];
}
```

---

# 84. SLATE POSITIONS ARE NOT SCIENTIFIC ROLES

Do not encode:

```text
Primary 2 = symptom circuit
```

as a universal v2 rule.

`position` answers:

> where is it shown?

`role` answers:

> why does it exist scientifically?

For stroke:

```text
primary_1
role = contralesional_strategy
```

may be valid.

For pain:

```text
primary_1
role = somatotopic_target
```

may be valid.

---

# 85. CLINICAL COVERAGE v2

```ts
interface ClinicalCoverageProfileV2 {
  objectives: {
    clinical_objective_id: UUID;

    priority_rank: number;

    covered_by_candidate_ids: UUID[];

    coverage:
      | "strong"
      | "partial"
      | "none"
      | "not_evidence_mappable";

    interpretation?: string;
  }[];

  redundancy_summary: string;
}
```

---

# 86. CONVERGENCE v2

```ts
interface SlateConvergenceProfileV2 {
  compared_sources: string[];

  pairwise_relationships: {
    source_a: string;
    source_b: string;

    spatial_agreement_mm?: number;

    agreement:
      | "high"
      | "moderate"
      | "low"
      | "not_assessable";

    interpretation?: string;
  }[];

  overall:
    | "high"
    | "moderate"
    | "low"
    | "not_assessable";

  interpretation: string;
}
```

This avoids assuming every indication has:

```text
symptom vs connectome
```

as its primary comparison.

---

# 87. ABSTENTION v2

```ts
interface AbstentionProfileV2 {
  abstention_type:
    | "unsupported_indication"
    | "module_not_clinically_qualified"
    | "insufficient_evidence"
    | "measurement_failure"
    | "reliability_failure"
    | "lesion_registration_failure"
    | "target_anatomy_invalid"
    | "disease_stage_mismatch"
    | "treatment_context_mismatch"
    | "device_incompatibility"
    | "scientific_configuration_invalid"
    | "no_nonredundant_candidate"
    | "other";

  reason_codes: string[];

  explanation: string;

  affected_capabilities?: string[];

  fallback_options: string[];
}
```

---

# 88. ABSTENTION CAN BE PARTIAL

Example:

```text
rs-fMRI unreliable
```

may yield:

```text
connectome personalisation abstains
```

while:

```text
evidence-supported somatotopic target
```

remains valid.

MAGNIOM SHALL distinguish:

# feature abstention

from:

# complete Target Slate abstention.

---

# 89. MULTI-INDICATION CROSS-REVIEW

Optional new object:

```ts
interface CrossIndicationTargetReview {
  id: UUID;

  case_id: UUID;

  target_slate_ids: UUID[];

  spatial_relationships: CrossSlateSpatialRelationship[];

  overlapping_target_family_ids: UUID[];

  conflicting_objectives: ClinicalObjectiveConflict[];

  summary: string;

  mode: MagniomMode;

  provenance: Provenance;
}
```

---

# 90. CROSS-INDICATION REVIEW IS NOT A NEW SLATE

The presence of:

```text
MDD slate
+
pain slate
```

does not justify creating:

```text
universal Combined Target Slate
```

unless a future separately validated policy explicitly supports it.

---

# 91. EXAMPLE — MDD + PAIN

A patient may have:

```text
CaseIndication A
MDD

CaseIndication B
Neuropathic pain
```

MAGNIOM can generate:

```text
MDD Target Slate
```

and:

```text
Pain Target Slate.
```

Cross-review may note:

```text
two target regions are spatially distinct
```

or:

```text
field overlap is substantial.
```

The clinician decides how this affects treatment planning.

---

# 92. SCIENTIFIC POLICY COMPATIBILITY v2

Every Clinical Target Slate SHALL satisfy a complete compatibility tuple containing at least:

```text
EvidenceLibraryRelease
×
IndicationModuleRelease
×
ScientificPolicyRelease
×
TargetEngineVersion
×
relevant PipelineVersion(s)
×
relevant NormativeModelVersion(s)
×
EFieldEngineVersion where used
×
device/coil capability where required
×
mode
```

No compatibility may be inferred from component activity alone.

---

# 93. DEVICE CAPABILITY REQUIREMENT

```ts
interface DeviceCapabilityRequirement {
  device_class?: string;

  coil_class?: string;

  capability_code: string;

  requirement:
    | "required"
    | "optional";

  rationale: string;
}
```

Useful for:

* deep-TMS evidence;
* focal figure-of-eight targeting;
* field-shape-specific target families.

---

# 94. CLINICIAN DECISION REMAINS UNCHANGED IN PRINCIPLE

The clinician decision remains a separate canonical object.

It SHALL identify:

* Target Slate;
* reviewed candidates;
* accepted/rejected/modified status;
* final selected target(s);
* reasoning;
* clinician identity;
* signing state.

No multi-indication extension places the clinical decision inside the Target Engine.

---

# 95. FINAL TARGET MUST PRESERVE GEOMETRY

If the clinician selects a:

```text
SomatotopicTargetGeometry
```

the final selected target SHALL not be reduced to:

```text
[x,y,z]
```

alone.

Likewise a:

```text
CoilFieldTargetGeometry
```

must preserve:

* coil;
* placement;
* intended field region;
* orientation where relevant.

---

# 96. MODIFIED TARGET

Where the clinician modifies a candidate:

the original target remains immutable.

Create a new clinician-selected geometry:

```ts
interface ClinicianModifiedTarget {
  source_target_candidate_id: UUID;

  modified_geometry: TargetGeometry;

  modification_distance_mm?: number;

  modification_reason: string;

  created_by: UUID;

  created_at: ISO8601UTC;
}
```

---

# 97. TARGET GEOMETRY COMPARISON

Geometry comparison SHALL be type-aware.

Examples:

### point ↔ point

```text
Euclidean/surface distance
```

### ROI ↔ ROI

```text
overlap
surface distance
```

### somatotopic ↔ somatotopic

```text
body-region concordance
spatial distance
```

### coil-field ↔ coil-field

```text
field overlap
ROI coverage
pose differences
```

No universal comparison metric is required.

---

# 98. DATA QUALITY

Preserve v1 states:

```ts
type DataQualityState =
  | "verified"
  | "reviewed"
  | "unverified"
  | "incomplete"
  | "invalid";
```

Multi-indication extensions SHALL not confuse:

# unavailable

with:

# normal.

---

# 99. PROVENANCE

Canonical provenance SHOULD support:

```ts
interface Provenance {
  created_by_type:
    | "clinician"
    | "system"
    | "worker"
    | "curator"
    | "researcher";

  created_by_id?: UUID;

  created_at: ISO8601UTC;

  source_object_ids?: UUID[];

  source_artifact_ids?: UUID[];

  source_version_ids?: UUID[];

  software_version_ids?: UUID[];

  notes?: string;
}
```

---

# 100. VERSION MANIFEST

Each Target Slate SHALL permit reconstruction of:

```text
Case indication
Indication Module
Phenotype Snapshot
Clinical objectives
Disease-stage context
Lesion context
Treatment context
Measurement Bundle
Reliability Bundle
Evidence Library
Scientific Policy
Target Engine
Pipelines
Normative Models
E-field Engine
Device/coil context
Generated candidates
Suppressed candidates
```

---

# 101. SNAPSHOT RULE

Clinically material mutable state becomes immutable input before target generation.

Examples:

```text
PhenotypeSnapshot
DiseaseStageContext
LesionContext
TreatmentContextSnapshot
MeasurementBundle
ReliabilityBundle
```

Historical Target Slates SHALL never resolve these through:

```text
latest(...)
```

queries.

---

# 102. OWNERSHIP BOUNDARIES

### Evidence Governance owns

```text
IndicationModuleRelease scientific definitions
EvidenceClaim
TherapeuticCircuit
TargetFamily
ClinicalObjectiveDefinition
TreatmentContextRequirement
DiseaseStageDefinition
```

### Clinical workflow owns

```text
CaseIndication
ClinicalObjective
PhenotypeSnapshot
DiseaseStageContext
TreatmentContextSnapshot
```

### Scientific computation owns

```text
MeasurementBundle
MeasurementReliability
ReliabilityBundle
TargetCandidate
TargetSlate
```

### Authorised clinician owns

```text
ClinicianDecision
ClinicianModifiedTarget
FinalTarget
```

---

# 103. FRONTEND MUST NOT RECONSTRUCT SEMANTICS

The frontend SHALL NOT infer:

* module clinical status;
* evidence eligibility;
* disease-stage eligibility;
* reliability qualification;
* lesion compatibility;
* target role;
* target geometry semantics;
* treatment-context applicability.

Canonical server objects SHALL provide these meanings.

---

# 104. NO BLACK-BOX UNIVERSAL SCORE

v2 SHALL NOT introduce:

```text
multi_indication_target_score
```

or:

```text
brain_treatment_match = 94%
```

The reasons are stronger in v2 than v1:

the meaning of relevant features differs fundamentally between:

* MDD;
* pain;
* stroke;
* OCD;
* TBI;
* tinnitus.

---

# 105. NO DIAGNOSIS-TO-TARGET SHORTCUT

Prohibited:

```text
stroke → right M1
```

```text
pain → M1
```

```text
tinnitus → auditory cortex
```

without:

* indication-specific evidence;
* clinical objective;
* population/stage context;
* target-family eligibility;
* relevant patient measurements;
* module policy.

---

# 106. RESEARCH EXTENSION

Existing research semantics remain:

```ts
interface ResearchTargetExtension {
  hypothesis_id: UUID;

  exploratory_features: Record<string, unknown>;

  novel_circuit_id?: UUID;

  anomaly_driven: boolean;

  experimental_protocol_hypothesis?: string;

  ethics_protocol_id?: string;

  research_project_id?: string;
}
```

Research data SHALL not replace canonical clinical candidate fields.

---

# 107. DATABASE MAPPING PRINCIPLE

Recommended relational domains:

```text
clinical.indication_modules
clinical.indication_module_releases
clinical.case_indications
clinical.clinical_objectives
clinical.disease_stage_contexts
clinical.lesion_contexts
clinical.treatment_context_snapshots

measurement.measurement_bundles
measurement.measurement_bundle_members
measurement.measurement_reliability
measurement.reliability_bundles

targeting.target_geometries
targeting.target_candidates
targeting.target_slates

evidence.treatment_context_requirements
evidence.clinical_objective_definitions
evidence.disease_stage_definitions
```

Exact Supabase schema belongs in a separate database specification.

---

# 108. TARGET GEOMETRY STORAGE

Avoid one enormous polymorphic JSON object where important relationships become unqueryable.

Recommended model:

```text
target_geometries
   │
   ├── point_target_geometries
   ├── surface_roi_geometries
   ├── volumetric_roi_geometries
   ├── somatotopic_geometries
   ├── coil_field_geometries
   └── network_target_geometries
```

or a rigorously typed equivalent.

---

# 109. JSON USE

JSON is acceptable for:

* version-specific metrics;
* modality-specific extended metadata;
* research-only exploratory outputs.

Core clinical semantics such as:

* indication;
* stage;
* lesion laterality;
* geometry type;
* body region;
* mode;
* clinical status;

SHOULD remain strongly typed.

---

# 110. API CONTRACT PRINCIPLE

Prefer domain commands:

```text
POST /cases/{caseId}/indications
POST /case-indications/{id}/approve-objectives
POST /case-indications/{id}/freeze-measurement-bundle
POST /case-indications/{id}/generate-target-slate
POST /target-slates/{id}/review
POST /clinician-decisions/{id}/sign
```

not generic CRUD against scientific aggregates.

---

# 111. TARGET ENGINE INPUT v2

```ts
interface TargetEngineInputV2 {
  case_id: UUID;
  case_indication_id: UUID;

  mode: MagniomMode;

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

  target_engine_version_id: UUID;

  device_context_ids?: UUID[];
}
```

---

# 112. TARGET ENGINE OUTPUT v2

```ts
interface TargetEngineOutputV2 {
  generated_candidate_ids: UUID[];

  eligible_candidate_ids: UUID[];

  suppressed_candidate_ids: UUID[];

  target_slate_id?: UUID;

  abstention?: AbstentionProfileV2;

  warnings: string[];

  reproducibility_manifest_sha256: SHA256;
}
```

The engine SHALL NOT return an autonomous treatment protocol.

---

# 113. CANONICAL VALIDATION — `IndicationModuleRelease`

Before activation verify:

* unique module/version;
* indication present;
* population defined;
* permitted modes defined;
* phenotype schema present;
* objective definitions resolve;
* measurement requirements valid;
* target geometry types valid;
* candidate-generation methods resolve;
* Scientific Policy compatibility exists;
* payload hash valid;
* required validation evidence present.

---

# 114. VALIDATION — `DiseaseStageContext`

Verify:

* belongs to same CaseIndication;
* valid stage definition;
* temporal calculations reproducible;
* confidence present;
* clinician approval where required.

---

# 115. VALIDATION — `LesionContext`

Verify:

* source imaging references resolve;
* lesion laterality valid;
* lesion mask coordinate space known;
* registration state present;
* segmentation state present;
* target exclusions use explicit coordinate space;
* provenance complete.

---

# 116. VALIDATION — `MeasurementBundle`

Verify:

* case/indication consistency;
* immutable bundle membership;
* all measurement IDs resolve;
* module measurement requirements evaluated;
* no Research measurement satisfies Clinical requirement unless explicitly permitted;
* payload hash valid.

---

# 117. VALIDATION — `ReliabilityBundle`

Verify:

* references same MeasurementBundle;
* every component reliability resolves;
* capability qualification uses policy-defined rule;
* failed reliability cannot produce qualified capability;
* interpretation present.

---

# 118. VALIDATION — TARGET GEOMETRY

All target geometries must validate:

* permitted type for active module;
* coordinate space;
* laterality;
* provenance.

Type-specific validation:

### Point

centre present.

### Surface ROI

surface identity / spatial region present.

### Volumetric ROI

mask present.

### Somatotopic

body region and stimulation laterality present.

### Coil field

coil model and intended field region present.

### Network

therapeutic circuit/network definition present.

---

# 119. VALIDATION — TARGET CANDIDATE

Clinical candidate must have:

* case;
* CaseIndication;
* IndicationModuleRelease;
* ScientificPolicyRelease;
* TargetFamily;
* permitted target geometry;
* evidence profile;
* clinical objective;
* MeasurementBundle;
* required ReliabilityBundle;
* accessibility;
* uncertainty;
* nomination rationale;
* counterarguments;
* engine/evidence versions.

---

# 120. VALIDATION — TARGET SLATE

Verify:

* all candidates belong to same CaseIndication;
* all candidates use compatible scientific configuration;
* no Research-only candidate in Clinical Mode;
* no duplicate IDs;
* maximum role/position cardinality respected;
* MeasurementBundle matches candidates;
* ReliabilityBundle matches where required;
* stale dependencies are detected;
* manifest hash valid.

---

# 121. CROSS-CASE INTEGRITY

No patient-specific object may reference:

```text
Case A measurement
```

from:

```text
Case B.
```

Database implementation SHALL enforce this structurally, not merely through frontend assumptions.

---

# 122. CROSS-INDICATION INTEGRITY

A Target Candidate created under:

```text
MAGNIOM-IND-STROKE-MOTOR
```

cannot be inserted into a Target Slate generated under:

```text
MAGNIOM-IND-MDD.
```

Even if the cortical coordinates happen to coincide.

---

# 123. MODULE VERSION INTEGRITY

If a Case was initially evaluated under:

```text
STROKE-MOTOR 1.0.0
```

and version 1.1.0 becomes active:

historical slates remain pinned to:

```text
1.0.0.
```

New analysis produces a new Target Slate.

---

# 124. v1 BACKWARD-COMPATIBILITY RULE

Historical v1 MDD objects SHALL remain semantically valid.

Do not require historical reserialization into every v2 field.

A compatibility adapter MAY expose:

```text
case_indication_id
indication_module_release_id
measurement_bundle_id
```

for v1 records through a documented migration/adapter layer.

---

# 125. v1 MDD MIGRATION

For new v2 MDD cases:

```text
IndicationModuleRelease =
MAGNIOM-IND-MDD-2.x
```

or an explicitly compatible MDD release.

Existing v1 MDD cases retain their original data contracts unless explicitly reanalysed.

---

# 126. NO SILENT HISTORICAL MIGRATION

Database schema migration may add structural columns.

It SHALL NOT imply:

# scientific reinterpretation.

For example, a historical v1 `TargetReliabilityProfile` may be referenced from a compatibility view without claiming that it passed a newly introduced v2 reliability policy.

---

# 127. EXAMPLE — NEUROPATHIC HAND PAIN

Conceptual canonical package:

```text
CaseIndication
  Neuropathic pain

ClinicalObjective
  Reduce right-hand neuropathic pain

MeasurementBundle
  Structural MRI
  Left M1 motor map

ReliabilityBundle
  Motor hotspot reproducibility = qualified

TargetCandidate
  role = somatotopic_target

TargetGeometry
  body_region = right hand
  stimulation hemisphere = left
  motor hotspot = subject-space coordinate
```

This requires no rs-fMRI object.

---

# 128. EXAMPLE — STROKE MOTOR RECOVERY

```text
CaseIndication
  Stroke — motor rehabilitation

DiseaseStageContext
  subacute

LesionContext
  left hemispheric ischemic lesion

ClinicalObjective
  improve right upper-limb motor function

MeasurementBundle
  structural MRI
  lesion mask
  motor mapping
  MEP

TargetCandidates
  ipsilesional strategy
  contralesional strategy
```

Each candidate carries its own evidence and lesion relationship.

---

# 129. EXAMPLE — DESTROYED TARGET REGION

If a candidate TargetFamily maps to cortex substantially destroyed by lesion:

```text
lesion_relationship =
destroyed_or_absent
```

Then Scientific Policy may require:

```text
generation_status = ineligible
```

with explanation:

> The evidence-defined target region is not anatomically represented as intact stimulatable cortex in this patient.

No substitute coordinate is guessed automatically.

---

# 130. EXAMPLE — OCD DEEP-TMS TARGET

```text
CaseIndication
  OCD

TargetCandidate
  role = field_target

TargetGeometry
  geometry_type = coil_field

coil_model
  H-coil class/model

intended_field_region
  medial prefrontal / ACC target volume
```

A single MNI centre MAY be displayed for orientation but is marked:

```text
representative only.
```

---

# 131. EXAMPLE — TINNITUS RESEARCH

```text
IndicationModuleRelease
  Tinnitus 1.0
  module_status = research_only

TargetCandidate
  generation_status = research_only

TargetSlate
  mode = research
```

Clinical signing is prohibited independently of how interesting the imaging finding appears.

---

# 132. EXAMPLE — FAILED rs-fMRI, VALID MDD BASELINE

```text
Structural MRI       qualified
rs-fMRI              failed
```

Measurement requirement evaluation:

```text
anatomical targeting       enabled
connectome refinement      disabled
```

ReliabilityBundle:

```text
individual_fc_refinement = not_qualified
```

Target Slate:

```text
evidence-only candidate(s)
```

This remains a scientifically valid result.

---

# 133. CANONICAL EXPORT PACKAGE v2

Every completed analysis should be exportable as:

```text
case metadata
CaseIndication
IndicationModuleRelease
clinical objectives
phenotype snapshot
disease-stage context
lesion context
treatment-context snapshot
MeasurementBundle
measurement provenance
ReliabilityBundle
EvidenceLibraryRelease
ScientificPolicyRelease
TherapeuticCircuits
TargetFamilies
all generated candidates
all suppressed candidates
TargetSlate
ClinicianDecision
FinalTarget
audit history
scientific manifest hashes
```

---

# 134. HUMAN-READABLE REPORT v2

The report may adapt by module but should derive from canonical data.

Common structure:

### Clinical indication

### Therapeutic objective

### Disease stage / relevant structural context

### Evidence-supported target hypotheses

### Patient-specific measurements

### Measurement reliability

### Primary candidate(s)

### Alternatives

### Relevant treatment context

### Major uncertainty

### Specialist decision

### Scientific provenance

---

# 135. REPORTS ARE DERIVED VIEWS

A PDF or clinical report is not independently authoritative.

Canonical objects remain the source of truth.

If report text differs from canonical objects:

# the report is defective.

---

# 136. MULTI-INDICATION ACCEPTANCE CASES

The schema SHALL represent all of the following without structural redesign:

### MI-01 — MDD

Standard v1-equivalent case.

### MI-02 — Neuropathic hand pain

Somatotopic M1 target.

### MI-03 — Bilateral neuropathic pain

No false unilateral simplification.

### MI-04 — Subacute motor stroke

Stage + lesion + motor mapping.

### MI-05 — Chronic motor stroke

Different stage evidence applicability.

### MI-06 — Stroke aphasia

Language objective + rehabilitation treatment context.

### MI-07 — Destroyed cortical target region

Candidate excluded with explanation.

### MI-08 — OCD deep TMS

Coil-field target rather than fictitious point target.

### MI-09 — TBI with skull defect

Lesion/skull context + E-field relevance.

### MI-10 — TBI cognitive research hypothesis

Research-only module.

### MI-11 — Chronic tinnitus

Audiology context + Research-only candidate.

### MI-12 — MDD + pain

Two CaseIndications; two separately governed analyses.

### MI-13 — Missing optional measurement

Valid fallback.

### MI-14 — Missing mandatory measurement

Abstention.

### MI-15 — Module upgrade after historical decision

Old slate remains immutable.

---

# 137. DATA-SPECIFICATION ACCEPTANCE CRITERION

v2 is sufficiently canonical if the implementation can represent:

```text
point-based psychiatric targeting
somatotopic motor targeting
lesion-aware neurological targeting
field-volume deep TMS targeting
multimodal measurements
partial measurement failure
stage-dependent eligibility
treatment-context-dependent evidence
research-only indications
cross-indication comorbidity
```

without changing the fundamental:

```text
TargetCandidate
→ TargetSlate
→ ClinicianDecision
```

decision architecture.

---

# 138. PROHIBITED CANONICAL FIELDS

Continue to prohibit unvalidated constructs such as:

```text
optimal_target = true

brain_abnormality_score = 93

expected_response_probability = 87%

recommended_protocol = "10 Hz"

global_tms_suitability_score = 91%

multi_indication_target_score = 0.94

stroke_recovery_probability = 76%
```

unless a future separately validated specification explicitly defines them.

---

# 139. DOMAIN LANGUAGE v2

Prefer:

### `IndicationModuleRelease`

not:

> disorder plugin.

### `MeasurementBundle`

not:

> brain data pack.

### `ReliabilityBundle`

not:

> confidence score.

### `LesionContext`

not:

> damaged brain score.

### `SomatotopicTargetGeometry`

not:

> motor coordinate.

### `CoilFieldTargetGeometry`

not:

> deep target coordinate.

### `TreatmentContext`

not:

> protocol recommendation.

---

# 140. CANONICAL SCIENTIFIC CONTRACT v2

# Evidence constrains.

Represented by:

```text
EvidenceClaim
TherapeuticCircuit
TargetFamily
IndicationModuleRelease
```

↓

# Clinical purpose prioritises.

Represented by:

```text
ClinicalObjective
PhenotypeSnapshot
```

↓

# Disease context qualifies applicability.

Represented by:

```text
DiseaseStageContext
LesionContext
TreatmentContextSnapshot
```

↓

# Patient measurement refines.

Represented by:

```text
MeasurementBundle
```

↓

# Reliability qualifies.

Represented by:

```text
MeasurementReliability
ReliabilityBundle
```

↓

# Geometry expresses what is actually being stimulated.

Represented by:

```text
TargetGeometry
```

↓

# Anatomy constrains.

Represented by:

```text
TargetAccessibilityProfile
LesionTargetRelationship
```

↓

# E-field characterises or optimises where permitted.

Represented by:

```text
EFieldProfile
CoilFieldTargetGeometry
```

↓

# Alternatives expose uncertainty.

Represented by:

```text
TargetSlate
```

↓

# The specialist decides.

Represented by:

```text
ClinicianDecision
```

---

# 141. FINAL DATA PRINCIPLES

## One platform does not mean one disease model.

## One patient may have several indications, but one Target Slate has one principal indication module.

## No indication inherits another indication's scientific rules by convenience.

## No patient measurement creates clinical efficacy evidence.

## No lesion automatically becomes a therapeutic target.

## No missing measurement becomes a zero score.

## No target is reduced to an MNI coordinate when its scientific meaning is an ROI, somatotopic map or coil field.

## No deep-TMS field target masquerades as a point target.

## No somatotopic target loses its body-region relationship.

## No stage-dependent evidence ignores disease stage.

## No treatment-context-dependent evidence silently discards that context.

## No modality-specific reliability is flattened into a universal confidence number.

## No Research module can publish a Clinical Target Slate.

## No cross-indication comorbidity creates a universal target score.

## No historical Target Slate changes because a module, model or measurement becomes newer.

## No target candidate becomes a treatment prescription.

## The clinician decision remains independent.

---

# 142. CANONICAL v2 OBJECT SUMMARY

### `IndicationModuleRelease`

**Which scientific MAGNIOM model is permitted for this clinical problem?**

### `CaseIndication`

**Which condition/objective is this particular targeting analysis addressing?**

### `ClinicalObjective`

**What are we trying to improve?**

### `DiseaseStageContext`

**At what disease/recovery stage is the patient?**

### `LesionContext`

**What structural pathology may alter target validity or stimulation physics?**

### `TreatmentContextSnapshot`

**Which contextual conditions relevant to the evidence are present?**

### `MeasurementBundle`

**Which patient-specific measurements were available for this analysis?**

### `MeasurementReliability`

**How trustworthy is each relevant measurement?**

### `ReliabilityBundle`

**Which patient-specific targeting capabilities are sufficiently reliable to influence the analysis?**

### `TargetGeometry`

**What type of spatial stimulation hypothesis is this actually?**

### `TargetCandidate`

**What is the patient-specific, evidence-traceable stimulation hypothesis?**

### `TargetSlate`

**What is the smallest useful set of competing hypotheses?**

### `ClinicianDecision`

**What did the specialist decide, and why?**

---

# 143. FINAL CANONICAL DEFINITION

MAGNIOM v2 canonical data shall support:

> **A versioned, indication-specific and multimodal clinical reasoning chain in which scientific evidence defines which target hypotheses are permissible, clinician-approved objectives define what matters, disease and lesion context constrain applicability, qualified patient measurements may refine those hypotheses, modality-specific reliability determines how much that refinement can be trusted, target geometry represents what would actually be stimulated, uncertainty and alternatives remain explicit, and the final treatment decision remains with the specialist.**

---

# MAGNIOM v2 GOVERNING DATA RULE

> **The canonical model shall be sufficiently general that depression, OCD, neuropathic pain, stroke rehabilitation, brain injury and tinnitus can use different scientific models, measurements and target geometries without fragmenting the core MAGNIOM decision architecture or allowing one indication's assumptions to leak silently into another.**

A particularly important architectural choice here is the transition from the v1 `TargetReliabilityProfile` into **`MeasurementReliability` + `ReliabilityBundle`**. The v1 profile was explicitly about reproducibility/trustworthiness of patient-specific imaging localisation—not treatment efficacy—and required FC-derived candidates to carry reliability.  v2 preserves that exact principle, but makes it applicable to motor mapping, diffusion MRI, lesion segmentation and future modalities without pretending they share the same reliability metrics.

Likewise, `TargetCandidate` remains recognisably the v1 object—it still carries TargetFamily, evidence, phenotype fit, anatomy, uncertainty, rationale, counterarguments and algorithm provenance—but now references an immutable indication, MeasurementBundle and explicit `TargetGeometry`. That is consistent with the original requirement that a candidate is **not a prescription, proof of optimality, protocol, or simply an MNI coordinate**. 
