# MAGNIOM

## Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0

**Document status:** Canonical multimodal scientific-measurement specification
**Version:** 2.0
**Date:** 2 September 2026
**Supersedes:** MAGNIOM Neuroimaging & Functional Connectomics Pipeline Specification v1.0 for new development
**Backward compatibility:** Historical v1 imaging/connectome runs remain immutable and reproducible
**Primary architectural change:** rs-fMRI-centric NeuroCompute → modular multimodal measurement platform
**Primary purpose:** Produce versioned, QC-qualified patient measurements for indication-specific MAGNIOM Target Engine plugins
**Clinical authority:** Specialist clinician
**Scientific-compute authority:** Approved pipeline releases + Scientific Policy + Indication Module compatibility
**Modalities covered:** Structural MRI, lesion mapping, resting-state fMRI, task fMRI, diffusion MRI/tractography, motor mapping, motor-evoked potentials, audiology, E-field-related anatomical inputs
**Future-compatible modalities:** EEG, TMS-EEG, additional neurophysiology

---

## 1. PURPOSE

MAGNIOM v2 extends the original neuroimaging pipeline into a general:

# Multimodal Measurement Architecture.

The v1 system correctly separated **measurement precision from measurement reliability**, required patient-specific functional localisation to demonstrate reproducibility before influencing Clinical Mode, and treated NeuroCompute as a measurement service rather than the clinical Target Engine. Those principles remain unchanged. 

v2 must answer a broader set of questions:

### Anatomy

What anatomy does the patient actually have?

### Lesions

Has disease or injury removed, distorted or displaced relevant tissue?

### Functional organisation

What reproducible functional relationships or task activations are measurable?

### Structural connectivity

Which white-matter pathways can be reconstructed, and how reliable is that reconstruction?

### Motor physiology

Where is the relevant motor representation, and how reproducibly can it be stimulated?

### Corticospinal function

Are reproducible motor-evoked responses detectable?

### Audiology

What tinnitus/hearing phenotype has been objectively characterised?

### Stimulation physics

What anatomical and field-model constraints affect accessibility?

And critically:

# How trustworthy is each of these measurements for the particular targeting capability MAGNIOM proposes to use?

---

# 2. GOVERNING PRINCIPLE

MAGNIOM v2 SHALL distinguish:

```text
measurement exists
```

from:

```text
measurement passed QC
```

from:

```text
measurement is reproducible
```

from:

```text
measurement is qualified for this scientific capability
```

from:

```text
measurement is permitted to influence Clinical Mode.
```

These are different states.

---

# 3. MULTIMODAL SCIENTIFIC CONTRACT

The canonical relationship is:

```text
RAW ACQUISITION
      ↓
VERSIONED PROCESSING
      ↓
MEASUREMENT
      ↓
QC
      ↓
RELIABILITY
      ↓
CAPABILITY QUALIFICATION
      ↓
MeasurementBundle
      ↓
ReliabilityBundle
      ↓
Target Engine
```

The measurement system SHALL NOT itself determine:

* treatment indication;
* final target rank;
* treatment protocol;
* clinical efficacy;
* whether an observed abnormality is causal.

The v1 pipeline already explicitly prohibited NeuroCompute from outputting `best_target`; v2 preserves this boundary across every modality. 

---

# 4. WHY v2 MUST BE MULTIMODAL

The original MDD architecture could reasonably prioritise:

```text
Structural MRI
+
resting-state fMRI.
```

That assumption does not generalise.

For example:

### Neuropathic pain

Somatotopic motor mapping may be more directly relevant than rs-fMRI.

### Stroke

Lesion anatomy, motor physiology, disease stage and corticospinal integrity may matter more than depression-style resting-state targeting.

### Aphasia

Task-based language localisation may become relevant.

### TBI

Structural distortion and skull changes may dominate measurement validity.

### Tinnitus

Audiology is a necessary clinical measurement domain.

Therefore:

# no modality is universally privileged across MAGNIOM v2.

---

# 5. MEASUREMENT PROVIDER ARCHITECTURE

Each modality SHALL implement a common conceptual contract:

```ts
interface MeasurementProvider {
  manifest: MeasurementProviderManifest;

  validateAcquisition(
    acquisition: AcquisitionRecord
  ): AcquisitionValidation;

  process(
    acquisition: AcquisitionRecord,
    context: MeasurementProcessingContext
  ): ProcessingResult;

  evaluateQuality(
    result: ProcessingResult
  ): QualityAssessment;

  calculateReliability?(
    result: ProcessingResult,
    context: ReliabilityContext
  ): MeasurementReliability;

  buildCanonicalMeasurement(
    result: ProcessingResult
  ): CanonicalMeasurement;
}
```

---

# 6. MEASUREMENT PROVIDER MANIFEST

```ts
interface MeasurementProviderManifest {
  id: UUID;

  code: string;
  semantic_version: string;

  modality: MeasurementModality;

  pipeline_version_id: UUID;

  supported_acquisition_profile_ids: UUID[];

  supported_indication_module_release_ids: UUID[];

  supported_capability_codes: string[];

  container_digest_sha256?: SHA256;

  configuration_sha256: SHA256;

  normative_model_compatibility_ids?: UUID[];

  atlas_version_ids?: UUID[];

  lifecycle_status:
    | "draft"
    | "validation"
    | "active"
    | "superseded"
    | "withdrawn";
}
```

---

# 7. SUPPORTED v2 MODALITIES

```ts
type MeasurementModality =
  | "structural_mri"
  | "lesion_mapping"
  | "resting_state_fmri"
  | "task_fmri"
  | "diffusion_mri"
  | "structural_connectivity"
  | "motor_mapping"
  | "motor_evoked_potential"
  | "audiology"
  | "efield_anatomical_model"
  | "eeg"
  | "tms_eeg"
  | "other";
```

`EEG` and `TMS-EEG` are schema-compatible but need not be implemented in the first v2 release.

---

# 8. CANONICAL MEASUREMENT

```ts
interface CanonicalMeasurement {
  id: UUID;
  version: string;

  case_id: UUID;

  modality: MeasurementModality;

  acquisition_id?: UUID;
  processing_run_id: UUID;

  status:
    | "generated"
    | "qualified"
    | "qualified_with_limits"
    | "failed"
    | "research_only";

  capability_codes: string[];

  acquisition_profile_id?: UUID;

  pipeline_version_id: UUID;

  source_artifact_ids: UUID[];

  derivative_artifact_ids: UUID[];

  coordinate_space_refs?: CoordinateSpaceRef[];

  qc_assessment_id: UUID;

  measurement_manifest_sha256: SHA256;

  mode: "clinical" | "research";

  provenance: Provenance;
}
```

---

# 9. ACQUISITION IS SEPARATE FROM PROCESSING

MAGNIOM SHALL distinguish:

```text
what was acquired
```

from:

```text
how it was processed.
```

A raw MRI acquisition does not become a new acquisition merely because another pipeline processes it.

Likewise, one motor-mapping session may generate multiple derived analyses.

---

# 10. ACQUISITION PROFILE

```ts
interface AcquisitionProfile {
  id: UUID;

  code: string;
  version: string;

  modality: MeasurementModality;

  parameters: AcquisitionParameterDefinition[];

  intended_capabilities: string[];

  validated_site_ids?: UUID[];

  validation_status:
    | "design_only"
    | "research_validated"
    | "clinical_qualified";

  limitations: string[];

  provenance: Provenance;
}
```

---

# 11. NO UNIVERSAL MRI PROTOCOL

v2 SHALL NOT require every indication to undergo:

```text
T1
+
30 min multi-echo rs-fMRI
+
DWI
+
task fMRI
```

merely because MAGNIOM supports those modalities.

The Indication Module determines required measurements.

---

# 12. STRUCTURAL MRI REMAINS FOUNDATIONAL

Structural MRI continues to support:

* neuronavigation;
* cortical reconstruction;
* subject-space targeting;
* lesion mapping;
* functional registration;
* diffusion registration;
* scalp modelling;
* E-field modelling.

The v1 T1 requirement and emphasis on whole-brain/scalp coverage remain appropriate as the structural baseline. 

---

# 13. STRUCTURAL MRI OBJECT

```ts
interface StructuralMRIMeasurement
  extends CanonicalMeasurement {

  modality: "structural_mri";

  t1w_artifact_id: UUID;

  t2w_artifact_id?: UUID;

  brain_mask_artifact_id: UUID;

  segmentation_artifact_ids: UUID[];

  cortical_surface_artifact_ids: UUID[];

  scalp_surface_artifact_id?: UUID;

  native_coordinate_space: CoordinateSpaceRef;

  registration_manifest_id: UUID;

  structural_qc: StructuralQualityMetrics;
}
```

---

# 14. STRUCTURAL QC

Required QC domains:

```text
coverage
motion artefact
tissue contrast
segmentation quality
surface reconstruction quality
registration quality
scalp reconstruction
gross distortion
```

A technically successful command exit code does not equal:

```text
structural QC pass.
```

---

# 15. ANATOMICAL ABNORMALITY

The structural pipeline MAY identify:

* prior surgery;
* encephalomalacia;
* infarct;
* haemorrhage;
* mass-related distortion;
* skull defect;
* cranioplasty.

It SHALL NOT automatically determine clinical diagnosis from those findings.

---

# 16. LESION MAPPING

Lesion mapping becomes a first-class v2 pipeline.

Canonical flow:

```text
Structural MRI
      ↓
Lesion candidate segmentation
      ↓
Manual / expert review where required
      ↓
Lesion mask
      ↓
Native-space validation
      ↓
Atlas / surface intersection
      ↓
White-matter relationship
      ↓
Structural distortion assessment
      ↓
Target-family relationship
      ↓
LesionContext
```

---

# 17. LESION SEGMENTATION SOURCES

A lesion mask MAY arise from:

```text
manual segmentation
semi-automated segmentation
validated automated segmentation
clinical segmentation imported from another system
```

The method SHALL be explicit.

---

# 18. LESION MASK IS NOT AUTHORITATIVE MERELY BECAUSE AUTOMATED

For Clinical Mode, lesion-segmentation methods SHALL have:

* method identity;
* version;
* validation evidence;
* QC;
* reviewer status where required.

High Dice score in a research dataset does not automatically establish clinical suitability for every lesion type.

---

# 19. LESION MEASUREMENT

```ts
interface LesionMeasurement
  extends CanonicalMeasurement {

  modality: "lesion_mapping";

  lesion_mask_artifact_ids: UUID[];

  lesion_type: string;

  laterality: Laterality;

  volume_cm3?: number;

  cortical_intersections: AtlasRegionIntersection[];

  subcortical_intersections: AtlasRegionIntersection[];

  tract_intersections?: TractIntersection[];

  structural_distortion_metrics: StructuralDistortionMetric[];

  target_family_relationships?: TargetFamilyLesionRelationship[];

  segmentation_method: string;

  segmentation_review_status:
    | "unreviewed"
    | "reviewed"
    | "adjudicated";

  lesion_qc: LesionMappingQC;
}
```

---

# 20. LESION MAPPING SHALL REMAIN NATIVE-SPACE FIRST

Lesion definition should be established primarily in:

# subject-native anatomy.

Standard-space representations are derived.

MAGNIOM SHALL NOT depend solely on:

```text
warped lesion in template space
```

for target-validity decisions when major structural distortion exists.

---

# 21. LESION REGISTRATION PROBLEM

Large lesions can cause:

* nonlinear-registration error;
* cortical correspondence failure;
* parcel misassignment;
* surface reconstruction failure.

Therefore lesion-containing brains may require:

```text
lesion-aware registration
```

or:

```text
registration exclusion/masking strategies
```

depending on the validated pipeline.

Exact method is pipeline-versioned.

---

# 22. LESION RELATIONSHIP TO TARGET

For each relevant TargetFamily, the lesion pipeline may compute:

```text
target outside lesion
target adjacent
target partially involved
target substantially involved
target tissue absent
not assessable
```

The Target Engine, not the lesion pipeline, determines the clinical implication.

---

# 23. LESION MAPPING RELIABILITY

Reliability domains include:

```text
segmentation repeatability
inter-rater agreement where applicable
registration sensitivity
atlas intersection sensitivity
target-to-lesion distance stability
```

A lesion boundary represented to 1 mm does not imply biological boundary certainty of 1 mm.

---

# 24. RESTING-STATE fMRI

v2 preserves the v1 rs-fMRI architecture as a specialised Measurement Provider.

The v1 pipeline used:

* structural processing;
* BOLD preprocessing;
* multi-echo denoising;
* nuisance regression/censoring;
* surface mapping;
* parcellation;
* functional connectivity;
* therapeutic-circuit maps;
* target reliability. 

That pipeline remains valid for compatible indication modules.

---

# 25. v1 RS-FMRI PROFILE PRESERVATION

Existing validated/provisional v1 acquisition profiles SHALL remain versioned.

A v2 release SHALL NOT silently change:

* resting state instruction;
* run duration;
* denoising model;
* motion threshold;
* smoothing;
* atlas;
* circuit maps.

Those changes require a new pipeline/acquisition release.

---

# 26. RS-FMRI PROCESSING

Canonical flow:

```text
BIDS BOLD
   ↓
distortion correction
   ↓
motion correction
   ↓
multi-echo combination where applicable
   ↓
denoising
   ↓
nuisance modelling
   ↓
censoring
   ↓
surface projection
   ↓
parcel/circuit timeseries
   ↓
connectivity measurement
   ↓
candidate-region measurement
   ↓
reliability analysis
```

---

# 27. RETAINED TIME REMAINS MORE IMPORTANT THAN ACQUIRED TIME

The v1 specification correctly distinguished:

* acquired duration;
* retained duration;
* minimum usable duration. 

v2 retains this.

Do not report:

```text
30-minute scan
```

as if 30 minutes were usable when heavy censoring leaves substantially less.

---

# 28. RS-FMRI CAPABILITIES

Possible capability codes:

```text
resting_state_connectivity
therapeutic_circuit_concordance
individual_fc_refinement
normative_fc_context
network_research_hypothesis
```

An rs-fMRI scan may qualify some but not all.

---

# 29. RS-FMRI RELIABILITY

Retain:

* cross-run localisation;
* split-half localisation;
* preprocessing sensitivity;
* motion;
* retained time;
* parcel/circuit coverage.

The v1 pipeline explicitly treated reproducibility, not visual appearance, as the central precision-targeting validation question. 

---

# 30. TASK fMRI

Task fMRI becomes a separate provider.

Potential v2 uses include:

* language localisation in post-stroke aphasia;
* motor activation mapping;
* research-level functional localisation;
* future individually validated task-dependent target refinement.

It SHALL NOT automatically outrank resting-state or anatomical evidence.

---

# 31. TASK fMRI OBJECT

```ts
interface TaskFMriMeasurement
  extends CanonicalMeasurement {

  modality: "task_fmri";

  task_definition_id: UUID;

  task_version: string;

  paradigm_type: string;

  behavioural_performance?: TaskPerformanceSummary;

  contrast_definitions: TaskContrastDefinition[];

  activation_map_artifact_ids: UUID[];

  thresholding_manifest_id: UUID;

  registration_manifest_id: UUID;

  task_qc: TaskFMRIQualityMetrics;

  usable_for_capabilities: string[];
}
```

---

# 32. TASK PARADIGM IS SCIENTIFIC INPUT

A task is not adequately described as:

```text
language task
```

or:

```text
motor task.
```

Store:

* instructions;
* timing;
* blocks/events;
* stimuli;
* response modality;
* language;
* performance metrics;
* contrast definitions;
* software version.

---

# 33. TASK PERFORMANCE IS PART OF QC

If a patient:

* did not understand the task;
* did not perform it;
* fell asleep;
* produced unusable behavioural data;

the pipeline SHALL NOT interpret an absent activation as:

```text
functional area absent.
```

Task compliance and neuroimaging signal are distinct.

---

# 34. APHASIA TASK fMRI

For aphasia, candidate paradigms may eventually include:

* picture naming;
* verb generation;
* semantic decision;
* auditory comprehension;
* sentence completion.

But v2 SHALL NOT designate one universal language paradigm.

Paradigm selection and clinical qualification require module-specific validation.

---

# 35. TASK fMRI LATERALISATION

Task fMRI MAY measure:

```text
activation laterality
regional activation
residual network engagement
```

but these are patient measurements.

They SHALL NOT independently create a Clinical target without an EvidencePath and approved candidate generator.

---

# 36. TASK fMRI RELIABILITY

Reliability may include:

```text
test-retest activation overlap
contrast stability
laterality stability
activation-centre displacement
threshold sensitivity
task-performance consistency
pipeline sensitivity
```

One activation map is not inherently a precision target.

---

# 37. THRESHOLD DEPENDENCE

Task activation may move materially according to:

* statistical threshold;
* cluster threshold;
* smoothing;
* preprocessing;
* model choice.

MAGNIOM SHALL store the thresholding/model manifest.

A visually appealing activation map SHALL NOT become the canonical target solely because a particular display threshold was chosen.

---

# 38. DIFFUSION MRI

Diffusion MRI becomes a first-class v2 Research/Validation provider.

v1 explicitly reserved architecture for future DWI and prohibited casually combining structural and functional connectivity into one score. 

v2 implements that extension while preserving the prohibition.

---

# 39. DIFFUSION MRI PURPOSE

DWI may support measurement of:

* corticospinal tract integrity;
* structural connectivity between candidate cortex and therapeutic network;
* lesion-related tract disruption;
* target-to-network structural pathways;
* research-level individualised targeting.

It SHALL NOT be treated as deterministic axonal ground truth.

---

# 40. DWI ACQUISITION PROFILE

Each validated DWI profile SHALL explicitly capture:

```text
field strength
gradient directions
b-values / shells
voxel size
phase encoding
distortion correction acquisitions
number of volumes
multiband factor where used
scanner
gradient hardware
coil
```

No universal numerical values are mandated by this specification.

Those belong in validated acquisition profiles.

---

# 41. DIFFUSION PROCESSING

Canonical pipeline:

```text
DWI
 ↓
metadata validation
 ↓
denoising where validated
 ↓
artefact correction
 ↓
motion / eddy-current correction
 ↓
susceptibility correction
 ↓
bias-field correction
 ↓
brain/tissue modelling
 ↓
fibre-orientation estimation
 ↓
tractography / tract reconstruction
 ↓
tract-specific metrics
 ↓
target/network structural connectivity
 ↓
reliability / sensitivity
```

Exact tools and algorithms are release-controlled.

---

# 42. STRUCTURAL CONNECTIVITY OBJECT

```ts
interface StructuralConnectivityMeasurement
  extends CanonicalMeasurement {

  modality: "structural_connectivity";

  diffusion_measurement_id: UUID;

  model_type: string;

  tractography_method: string;

  tractography_version: string;

  tract_definition_ids: UUID[];

  tract_metrics: TractMetric[];

  target_connectivity_metrics?: StructuralTargetConnectivityMetric[];

  streamline_artifact_id?: UUID;

  tract_density_artifact_ids?: UUID[];

  structural_connectivity_qc: StructuralConnectivityQC;
}
```

---

# 43. STREAMLINE COUNT IS NOT AXON COUNT

MAGNIOM SHALL NOT report:

```text
10,000 streamlines
=
10,000 fibres.
```

Tractography outputs are reconstruction-model-dependent.

Clinician-facing language should say:

```text
tractography-derived structural connectivity
```

not:

```text
number of neural fibres.
```

---

# 44. TRACT INTEGRITY

Stroke/TBI modules may eventually use tract-related features such as:

```text
corticospinal tract involvement
tract volume
anisotropy-derived measures
tractography overlap
lesion load
```

No single measure SHALL be assumed to be a validated clinical targeting biomarker without module-specific evidence.

---

# 45. STRUCTURAL CONNECTIVITY RELIABILITY

Possible reliability dimensions:

```text
tract reconstruction repeatability
seed/ROI sensitivity
model sensitivity
angular-model sensitivity
tractography-parameter sensitivity
registration sensitivity
lesion-mask sensitivity
```

This is distinct from rs-fMRI reliability.

---

# 46. NO 50/50 MULTIMODAL SCORE

Prohibited:

```text
0.5 × FC
+
0.5 × tractography
```

unless a future Scientific Policy contains a validated multimodal model.

v1 explicitly rejected such an unvalidated mixture; v2 preserves that decision. 

---

# 47. MOTOR MAPPING

TMS motor mapping becomes a canonical neurophysiology provider.

It may support:

* motor hotspot identification;
* somatotopic localisation;
* corticospinal excitability context;
* motor-map geometry;
* target refinement for pain or stroke modules.

---

# 48. MOTOR MAPPING IS NOT THE SAME AS MEP MEASUREMENT

Separate:

```text
MotorMappingRun
```

from:

```text
MotorEvokedPotentialMeasurement.
```

A motor map is spatial.

An MEP is a physiological response.

They are related but not interchangeable.

---

# 49. MOTOR MAPPING SESSION

```ts
interface MotorMappingRun
  extends CanonicalMeasurement {

  modality: "motor_mapping";

  muscle_targets: MuscleTarget[];

  stimulation_device_id: UUID;
  coil_id: UUID;

  navigation_system_id?: UUID;

  scalp_coordinate_system: CoordinateSpaceRef;

  cortical_coordinate_system?: CoordinateSpaceRef;

  stimulation_points: MotorMappingPoint[];

  hotspot_results: MotorHotspotResult[];

  motor_map_regions: MotorMapRegion[];

  motor_threshold_refs?: UUID[];

  mapping_protocol_id: UUID;

  mapping_qc: MotorMappingQC;
}
```

---

# 50. MOTOR MAPPING POINT

```ts
interface MotorMappingPoint {
  id: UUID;

  scalp_position: Coordinate3D;

  cortical_projection?: Coordinate3D;

  coil_orientation_deg?: number;

  stimulation_intensity: number;
  intensity_unit: string;

  trial_ids: UUID[];

  response_summary: MEPResponseSummary;

  valid: boolean;

  exclusion_reason?: string;
}
```

---

# 51. MOTOR HOTSPOT

A hotspot SHALL be a defined measurement result.

Store:

```ts
interface MotorHotspotResult {
  muscle: MuscleTarget;

  coordinate: Coordinate3D;

  coordinate_space: CoordinateSpaceRef;

  method_code: string;

  method_version: string;

  neighbourhood_region?: SpatialRegion;

  reproducibility_id?: UUID;

  interpretation: string;
}
```

Avoid ambiguous labels such as:

```text
the hand area
```

without method/provenance.

---

# 52. MOTOR MAP REGION

```ts
interface MotorMapRegion {
  muscle: MuscleTarget;

  spatial_region: SpatialRegion;

  centre_of_gravity?: Coordinate3D;

  hotspot?: Coordinate3D;

  map_area_mm2?: number;

  response_weighting_method: string;

  threshold_definition: string;
}
```

---

# 53. MOTOR MAPPING CAPABILITIES

Potential:

```text
motor_hotspot_localisation
motor_somatotopy
pain_m1_refinement
stroke_motor_refinement
corticospinal_function_context
```

Each requires module/policy permission.

---

# 54. MOTOR MAPPING RELIABILITY

Evaluate where technically feasible:

```text
repeat hotspot distance
within-session hotspot stability
between-session hotspot stability
centre-of-gravity stability
motor-map overlap
threshold stability
orientation sensitivity
response variability
```

An apparently precise navigated coordinate does not imply reproducible physiology.

---

# 55. MOTOR-EVOKED POTENTIALS

MEP measurements capture stimulation-evoked peripheral muscle responses.

They may provide:

* presence/absence of corticospinal response;
* amplitude;
* latency;
* trial variability;
* motor threshold context.

MAGNIOM SHALL retain raw/derived provenance.

---

# 56. MEP OBJECT

```ts
interface MotorEvokedPotentialMeasurement
  extends CanonicalMeasurement {

  modality: "motor_evoked_potential";

  stimulation_device_id: UUID;
  coil_id: UUID;

  muscle: MuscleTarget;

  stimulation_site?: Coordinate3D;

  stimulation_intensity: number;
  intensity_unit: string;

  resting_or_active_state:
    | "resting"
    | "active";

  trials: MEPTrial[];

  amplitude_summary?: DistributionSummary;
  latency_summary?: DistributionSummary;

  response_present: boolean;

  threshold_measurement_id?: UUID;

  mep_qc: MEPQualityMetrics;
}
```

---

# 57. MEP TRIAL

```ts
interface MEPTrial {
  trial_id: UUID;

  amplitude?: number;
  amplitude_unit?: string;

  latency_ms?: number;

  background_emg_valid: boolean;

  artefact_status:
    | "clean"
    | "questionable"
    | "invalid";

  exclusion_reason?: string;
}
```

---

# 58. MEP ABSENCE IS CONTEXTUAL

An absent MEP may reflect:

* severe corticospinal impairment;
* insufficient stimulation;
* coil-position issue;
* muscle/EMG problem;
* state-dependent variability.

MAGNIOM SHALL NOT automatically encode:

```text
MEP absent
=
tract destroyed.
```

---

# 59. MOTOR THRESHOLD

If motor threshold is recorded:

```ts
interface MotorThresholdMeasurement {
  id: UUID;

  case_id: UUID;

  muscle: MuscleTarget;

  threshold_type:
    | "resting"
    | "active";

  method_definition_id: UUID;

  threshold_value: number;
  threshold_unit: string;

  coil_id: UUID;
  stimulation_site: Coordinate3D;

  measurement_quality: DataQualityState;

  provenance: Provenance;
}
```

The threshold is not itself a target-ranking score.

---

# 60. MOTOR PHYSIOLOGY IN STROKE

Stroke Motor Module may use motor physiology as:

```text
context
reliability
candidate refinement
stratification
```

only where Scientific Policy permits.

The measurement platform SHALL not assume:

```text
MEP present → ipsilesional stimulation
MEP absent → contralesional stimulation.
```

That would be a scientific decision rule belonging in a validated Target Engine policy, not in Neurophysiology.

---

# 61. MOTOR PHYSIOLOGY IN PAIN

Neuropathic Pain Module may use motor mapping to refine the evidence-defined:

```text
somatotopic M1 target.
```

Again:

```text
motor hotspot
```

is a patient-specific measurement,

not efficacy evidence.

---

# 62. AUDIology

Audiology becomes a canonical measurement domain for tinnitus modules.

This is deliberately different from neuroimaging.

MAGNIOM v2 therefore becomes:

# a multimodal clinical measurement platform,

not merely an MRI platform.

---

# 63. AUDIOLOGY OBJECT

```ts
interface AudiologyAssessment
  extends CanonicalMeasurement {

  modality: "audiology";

  assessment_type_ids: UUID[];

  pure_tone_audiometry?: PureToneAudiogram;

  speech_audiometry?: SpeechAudiometry;

  tympanometry?: TympanometryResult;

  otoacoustic_emissions?: OAEAssessment;

  tinnitus_matching?: TinnitusMatchingAssessment;

  hyperacusis_assessment?: HyperacusisAssessment;

  audiology_qc: AudiologyQualityAssessment;
}
```

---

# 64. PURE-TONE AUDIOGRAM

```ts
interface PureToneAudiogram {
  left_ear: HearingThresholdSeries;
  right_ear: HearingThresholdSeries;

  conduction_methods: (
    | "air"
    | "bone"
  )[];

  test_standard_ref?: string;

  transducer_ref?: string;

  masking_used?: boolean;

  interpretation?: string;
}
```

---

# 65. TINNITUS MATCHING

```ts
interface TinnitusMatchingAssessment {
  perceived_laterality:
    | "left"
    | "right"
    | "bilateral"
    | "central"
    | "variable";

  matched_frequency_hz?: number;

  matched_loudness_db?: number;

  minimum_masking_level_db?: number;

  residual_inhibition?: string;

  repeatability?: QualitativeConfidence;

  interpretation: string;
}
```

---

# 66. SUBJECTIVE TINNITUS MEASURES ARE NOT AUDIOLOGY SIGNALS

Separate:

```text
THI
TFI
distress ratings
```

from:

```text
audiogram
frequency matching
loudness matching.
```

Clinical phenotype and audiologic measurement remain different canonical domains.

---

# 67. AUDIOLOGY CAPABILITIES

Potential capability codes:

```text
hearing_loss_context
tinnitus_laterality_context
tinnitus_frequency_context
auditory_target_research_context
tinnitus_module_eligibility
```

Initial tinnitus Target Engine use remains Research-governed.

---

# 68. AUDIOLOGY RELIABILITY

Relevant domains may include:

```text
test completion validity
threshold consistency
repeat testing
tinnitus-match consistency
laterality consistency
transducer calibration
equipment calibration state
```

Tinnitus matching can be intrinsically variable; that variability should be represented rather than hidden.

---

# 69. AUDIOLOGY DOES NOT CREATE AUDITORY-CORTEX TARGET

Prohibited:

```text
8 kHz tinnitus match
       ↓
8 kHz auditory cortex coordinate
       ↓
clinical target.
```

Any such mapping requires:

* EvidencePath;
* validated targeting method;
* Target Engine generator;
* Research/Clinical permission.

---

# 70. MULTIMODAL `MeasurementBundle`

The v2 canonical data specification introduced `MeasurementBundle`.

The measurement platform is responsible for producing its component measurements, but the bundle itself is assembled under indication-specific requirements.

Conceptual:

```text
Case
 ↓
Indication Module
 ↓
Measurement Requirements
 ↓
Available Measurements
 ↓
Qualification
 ↓
MeasurementBundle
```

---

# 71. EXAMPLE — MDD BUNDLE

```text
Structural MRI            Qualified
rs-fMRI                   Qualified
E-field model             Optional
```

Capabilities:

```text
anatomical_localisation      enabled
individual_fc_refinement     enabled
```

---

# 72. EXAMPLE — PAIN BUNDLE

```text
Structural MRI            Qualified
Motor mapping             Qualified
MEP                       Available
rs-fMRI                   Not required
```

Capabilities:

```text
anatomical_localisation
motor_somatotopy
motor_hotspot_refinement
```

---

# 73. EXAMPLE — STROKE MOTOR BUNDLE

```text
Structural MRI            Qualified
Lesion mapping            Qualified
Motor mapping             Qualified
MEP                       Qualified
DWI/CST                   Research / available
rs-fMRI                   Optional
```

This does not imply every component influences ranking.

---

# 74. EXAMPLE — APHASIA BUNDLE

Potential:

```text
Structural MRI            Qualified
Lesion mapping            Qualified
Task fMRI                 Qualified / Research
rs-fMRI                   Optional
DWI                       Optional / Research
```

Treatment-context data such as SLT lives outside the measurement bundle.

---

# 75. EXAMPLE — TINNITUS BUNDLE

```text
Audiology                 Qualified
Structural MRI            Optional / Research
rs-fMRI                   Research
```

No unnecessary MRI should be made mandatory merely because MAGNIOM can process it.

---

# 76. MEASUREMENT REQUIREMENT EVALUATION

For every bundle, MAGNIOM SHALL generate:

```ts
interface MeasurementRequirementEvaluation {
  requirement_code: string;

  modality: MeasurementModality;

  requirement_type:
    | "required"
    | "required_for_personalisation"
    | "optional"
    | "research_only";

  status:
    | "satisfied"
    | "satisfied_with_limits"
    | "missing"
    | "failed"
    | "not_applicable";

  measurement_ids: UUID[];

  resulting_capability:
    | "enabled"
    | "disabled"
    | "fallback_only"
    | "research_only";

  explanation: string;
}
```

---

# 77. RELIABILITY BUNDLE

`ReliabilityBundle` consolidates:

# capability-specific reliability,

not a single generic confidence score.

Example:

```text
Anatomical localisation        Qualified
Motor hotspot localisation     Qualified
Individual FC refinement       Not qualified
DWI tract refinement           Research only
```

This is preferable to:

```text
overall reliability = 78%.
```

---

# 78. RELIABILITY PROVIDER CONTRACT

```ts
interface ReliabilityProvider {
  code: string;
  version: string;

  modality: MeasurementModality;

  capability_codes: string[];

  evaluate(
    measurement: CanonicalMeasurement,
    context: ReliabilityContext
  ): MeasurementReliability;
}
```

---

# 79. RELIABILITY SHALL BE METHOD-SPECIFIC

A reliability class has meaning only with:

* method;
* metric;
* pipeline;
* threshold;
* capability.

For example:

```text
High reliability
```

without indicating whether this means:

* rs-fMRI target stability;
* motor-hotspot stability;
* lesion-segmentation stability;

is insufficient.

---

# 80. MULTIMODAL DISAGREEMENT

Different modalities may disagree.

Example:

```text
Task fMRI language localisation
        ≠
resting-state language-network estimate
```

or:

```text
motor hotspot
        ≠
anatomical hand-knob estimate.
```

The measurement layer SHALL preserve both.

It SHALL NOT automatically average them.

---

# 81. MULTIMODAL CONVERGENCE

The measurement layer MAY compute descriptive relationships:

```text
distance
overlap
laterality agreement
body-region agreement
network concordance
```

The Target Engine determines whether convergence influences candidate selection.

---

# 82. NO HIDDEN FUSION

Prohibited pipeline behaviour:

```text
structural MRI
+
rs-fMRI
+
DWI
+
task fMRI
→ proprietary fused target coordinate
```

unless a separately versioned and validated multimodal scientific model explicitly defines that transformation.

Fusion is an algorithm.

It must not hide inside preprocessing.

---

# 83. NORMATIVE MODELS

Normative models become modality-specific.

Possible:

```text
resting-state FC normative model

DWI tract normative model

motor-map normative reference

audiologic age-adjusted reference
```

but each requires:

* population definition;
* acquisition compatibility;
* processing compatibility;
* validation scope.

---

# 84. NORMATIVE MODEL CONTRACT

```ts
interface NormativeModelCompatibility {
  normative_model_version_id: UUID;

  modality: MeasurementModality;

  compatible_acquisition_profile_ids: UUID[];

  compatible_pipeline_version_ids: UUID[];

  population_scope: PopulationDefinition;

  harmonisation_method_id?: UUID;

  status:
    | "compatible"
    | "conditionally_compatible"
    | "incompatible";
}
```

---

# 85. NO UNIVERSAL NORMATIVE BRAIN SCORE

MAGNIOM SHALL NOT create:

```text
global brain abnormality = 92%
```

from heterogeneous modalities.

Normative measures remain:

* modality-specific;
* feature-specific;
* population-specific.

---

# 86. HARMONISATION

Multi-site development may require harmonisation.

Any harmonisation method capable of changing clinically relevant measurement outputs SHALL be:

* versioned;
* validated;
* included in the pipeline manifest.

Harmonisation SHALL NOT be silently performed because scanner/site differs.

---

# 87. SITE QUALIFICATION

A clinical imaging acquisition profile SHOULD be site-qualified.

Site qualification may include:

```text
scanner identity
software version
head coil
sequence parameters
phantom measurements where applicable
test subject / validation acquisition
processing compatibility
```

The v1 specification already treated scanner upgrades as possible acquisition-domain changes requiring review. 

---

# 88. SCANNER UPGRADE

Changes such as:

* scanner software;
* gradient hardware;
* head coil;
* reconstruction version;
* sequence revision;

may affect scientific compatibility.

They SHALL trigger change-impact assessment.

---

# 89. NON-IMAGING EQUIPMENT QUALIFICATION

The same principle applies to:

### Motor physiology

* TMS device;
* coil;
* neuronavigation system;
* EMG system;
* amplifier;
* filters.

### Audiology

* audiometer;
* transducer;
* calibration status.

Clinical measurement provenance SHALL identify relevant equipment.

---

# 90. EQUIPMENT OBJECT

```ts
interface MeasurementDevice {
  id: UUID;

  manufacturer: string;
  model: string;

  device_type: string;

  serial_or_pseudonymous_identifier?: string;

  software_version?: string;

  calibration_record_id?: UUID;

  site_id: UUID;
}
```

---

# 91. CALIBRATION

Where measurement validity depends on calibration:

the run SHALL reference the relevant calibration state.

Expired or invalid calibration MAY make a measurement:

```text
conditional
```

or:

```text
invalid
```

according to policy.

---

# 92. COORDINATE SYSTEMS

Spatial modalities SHALL declare coordinate space.

Possible:

```text
DICOM patient space
T1 native
surface native
fsLR
MNI space
neuronavigation space
scalp navigation space
```

No coordinate may be exported without coordinate-system provenance.

---

# 93. TRANSFORM GRAPH

v2 SHOULD maintain an explicit transform graph:

```text
DICOM
 ↓
T1 native
 ↓
surface native
 ↓
standard space

T1 native
 ↓
neuronavigation

DWI native
 ↓
T1 native

task-fMRI native
 ↓
T1 native
```

Every transform is versioned and hashed.

---

# 94. ROUND-TRIP VALIDATION

The v1 requirement for target-coordinate export/import round-trip remains mandatory for neuronavigation interfaces. 

v2 extends round-trip verification to any relevant:

* motor-mapping import;
* neuronavigation export;
* lesion overlay;
* field-model coordinate transformation.

---

# 95. LATERALITY INVARIANT

Left/right errors remain critical.

Automated validation SHALL inspect:

```text
orientation
hemisphere
coordinate conventions
DICOM orientation
RAS/LPS interpretation
surface correspondence
```

The v1 pipeline already specified a hard laterality invariant. 

---

# 96. LATERALITY BECOMES MORE IMPORTANT IN v2

Laterality affects:

* stroke lesion side;
* affected limb;
* pain side;
* contralateral M1 selection;
* tinnitus laterality;
* aphasia lesion hemisphere.

Cross-object consistency SHALL be validated.

Example:

```text
Pain:
affected hand = right

Somatotopic M1 target:
left hemisphere
```

where that relationship is required by the evidence-defined strategy.

---

# 97. BODY-REGION CONSISTENCY

For somatotopic targeting:

```text
clinical body region
motor mapping muscle
MEP muscle
TargetGeometry.body_region
```

SHALL be semantically reconcilable.

A hand target cannot silently inherit a lower-limb motor map.

---

# 98. MUSCLE ONTOLOGY

Motor mapping and MEP objects SHOULD use controlled muscle identifiers.

```ts
interface MuscleTarget {
  code: string;
  label: string;

  body_region: BodyRegionRef;

  laterality:
    | "left"
    | "right";
}
```

Avoid uncontrolled strings such as:

```text
hand muscle
```

where scientific interpretation depends on which muscle was recorded.

---

# 99. PIPELINE RUN

Every processing operation creates an immutable run.

```ts
interface ProcessingRun {
  id: UUID;

  case_id: UUID;

  modality: MeasurementModality;

  pipeline_version_id: UUID;

  input_artifact_ids: UUID[];

  configuration_sha256: SHA256;

  container_digest_sha256?: SHA256;

  status:
    | "queued"
    | "running"
    | "succeeded"
    | "failed"
    | "superseded";

  started_at: ISO8601UTC;
  completed_at?: ISO8601UTC;

  output_artifact_ids: UUID[];

  run_manifest_sha256?: SHA256;
}
```

---

# 100. COMPLETED RUNS ARE IMMUTABLE

The v1 rule remains:

```text
never overwrite completed scientific output.
```

A different preprocessing model creates:

```text
new ProcessingRun.
```

Historical output remains available. 

---

# 101. PRIMARY VERSUS SENSITIVITY PIPELINE

For modalities susceptible to meaningful pipeline dependence, MAGNIOM MAY define:

```text
Primary Clinical Pipeline
```

and:

```text
Sensitivity Pipeline(s).
```

Sensitivity processing exists to measure robustness.

It SHALL NOT be used to:

# choose whichever pipeline produces the preferred target.

---

# 102. RS-FMRI SENSITIVITY

Retain v1 concepts such as:

* alternative nuisance treatment;
* alternative denoising;
* smoothing sensitivity;
* target displacement.

---

# 103. DWI SENSITIVITY

Potential comparisons include:

```text
tractography model
seeding
threshold
registration
lesion exclusion
```

Only scientifically justified sensitivity analyses are required.

---

# 104. TASK-fMRI SENSITIVITY

Potential:

```text
statistical threshold
smoothing
contrast definition
motion model
```

The sensitivity result becomes part of reliability.

---

# 105. LESION SENSITIVITY

Potential:

```text
manual vs validated automated segmentation
registration approach
lesion-mask dilation/erosion sensitivity
```

where clinically meaningful.

---

# 106. MOTOR-MAPPING SENSITIVITY

Potential:

```text
stimulation intensity
coil orientation
number of trials
hotspot derivation method
mapping-grid density
```

Exact protocols require validation rather than arbitrary experimentation during Clinical runs.

---

# 107. MODALITY QUALIFICATION STATUS

Every measurement SHALL resolve to:

```ts
type MeasurementQualification =
  | "qualified"
  | "qualified_with_limits"
  | "not_qualified"
  | "research_only"
  | "not_assessable";
```

This status is distinct from raw QC.

---

# 108. WHY QC AND RELIABILITY ARE DISTINCT

Example:

```text
Task fMRI image quality = good

but

repeat localisation stability = poor.
```

Or:

```text
motor mapping session technically clean

but

hotspot varies 18 mm between repeats.
```

Good QC does not guarantee reliable localisation.

---

# 109. QUALITY REPORT v2

The v1 `Magniom Connectome Quality Report` becomes:

# MAGNIOM Measurement Quality Report.

Sections vary by modality.

Shared header:

```text
Acquisition
Processing
QC
Reliability
Capability Qualification
Scientific Limitations
Clinical/Research eligibility
```

---

# 110. CLINICIAN-FACING SUMMARY

Preferred language:

```text
Motor hotspot localisation qualified

Repeated hotspot localisation was stable within the
validated range for this measurement protocol.

This motor map may be used by the Neuropathic Pain module
for patient-specific M1 refinement.
```

Not:

```text
Precision score 92%.
```

---

# 111. CONDITIONAL SUMMARY

Example:

```text
Task-fMRI language localisation qualified with limitations

Behavioural task performance was adequate, but activation
laterality was sensitive to thresholding.

The measurement may be displayed for context but is not
permitted to alter Clinical target ranking.
```

---

# 112. FAILED SUMMARY

Example:

```text
Patient-specific motor mapping not qualified

Motor responses were inconsistent across repeated mapping
locations.

MAGNIOM will not use this motor map for target refinement.
```

The system may still use another valid evidence baseline if Scientific Policy permits.

---

# 113. MEASUREMENT LANGUAGE SHALL DESCRIBE MEASUREMENT

Avoid:

```text
bad brain scan
abnormal network failure
motor cortex missing
```

unless literal anatomy supports such interpretation.

Prefer:

```text
registration not reliable
motor hotspot not reproducible
functional localisation not qualified
```

The v1 terminology policy already required this distinction. 

---

# 114. CAPABILITY MATRIX

A canonical v2 mapping might be:

| Modality       | Potential capability              | Typical initial module |
| -------------- | --------------------------------- | ---------------------- |
| Structural MRI | navigation/anatomy                | all imaging modules    |
| Lesion mapping | lesion-aware target qualification | stroke/TBI             |
| rs-fMRI        | network refinement                | MDD, research modules  |
| Task fMRI      | functional localisation           | aphasia/motor research |
| DWI            | tract integrity/connectivity      | stroke/TBI research    |
| Motor mapping  | somatotopic refinement            | pain/stroke            |
| MEP            | corticospinal context             | stroke                 |
| Audiology      | tinnitus/hearing context          | tinnitus               |
| E-field model  | accessibility/pose/field coverage | OCD, TBI, others       |

This table defines architecture, not Clinical Mode permission.

---

# 115. INDICATION-SPECIFIC DEFAULTS

## MDD

Primary multimodal sequence remains:

```text
Structural MRI
→ rs-fMRI
→ FC reliability
```

Additional modalities remain separately validated.

---

# 116. OCD

Potential measurement architecture:

```text
Structural MRI
→ field/head-model anatomy
→ E-field where applicable
```

rs-fMRI may remain research/supporting depending on policy.

Deep-TMS target evidence should not require artificial focal FC localisation if the evidence is fundamentally field-defined.

---

# 117. NEUROPATHIC PAIN

Preferred architecture:

```text
Structural MRI
+
pain body-region phenotype
+
motor mapping where available
+
MEP/motor physiology context where useful
```

rs-fMRI may remain optional/research.

---

# 118. STROKE MOTOR

Preferred architecture:

```text
Structural MRI
+
Lesion mapping
+
motor phenotype
+
motor mapping / MEP
```

with optional/research:

```text
DWI
rs-fMRI
```

until independently validated.

---

# 119. POST-STROKE APHASIA

Potential:

```text
Structural MRI
+
Lesion mapping
+
language phenotype
+
Task fMRI / language-network measurements
```

with rs-fMRI/DWI initially depending on validation status.

---

# 120. TBI

Initial architecture emphasises:

```text
Structural MRI
+
Lesion/skull context
```

Potential research extensions:

```text
DWI
rs-fMRI
task fMRI
E-field
```

Structural distortion may make standard-template assumptions particularly unsafe.

---

# 121. PTSD

Potential:

```text
Structural MRI
+
rs-fMRI Research/Validation
```

No MDD connectome pipeline automatically transfers to PTSD.

---

# 122. TINNITUS

Initial architecture:

```text
Audiology
+
tinnitus phenotype
```

Research extension:

```text
structural MRI
rs-fMRI
auditory task fMRI
```

No MRI finding is required merely because the Research platform can generate one.

---

# 123. NO MODALITY INHERITANCE

Prohibited:

```text
MDD uses rs-fMRI
→ every indication should use rs-fMRI.
```

Likewise:

```text
stroke uses lesion mapping
→ all TBI lesions can use the identical pipeline.
```

Compatibility is explicit.

---

# 124. MODALITY-SPECIFIC SCIENTIFIC POLICY

Scientific Policy should reference parameters such as:

```text
mdd.rsfc.minimum_retained_duration
mdd.rsfc.minimum_target_reliability

stroke_motor.lesion.minimum_registration_quality
stroke_motor.motor_map.minimum_hotspot_reliability

pain.motor_map.minimum_reliability

aphasia.taskfmri.minimum_task_validity

tbi.lesion.minimum_segmentation_quality

tinnitus.audiology.required_assessments
```

Numeric values SHALL be validated rather than invented in this canonical schema specification.

---

# 125. ACQUISITION COMPATIBILITY

A measurement provider SHALL verify the acquisition against:

```text
supported acquisition profile
```

before claiming Clinical qualification.

An arbitrary hospital sequence may still be:

```text
research_compatible
```

without being:

```text
clinical_qualified.
```

---

# 126. INPUT VALIDATION

Every acquisition ingestion SHALL validate relevant:

```text
file integrity
metadata
patient/case association
laterality/orientation
modality
device/scanner
protocol identity
acquisition completeness
```

Mis-associated patient data is a critical failure.

---

# 127. DICOM/BIDS

For MRI, DICOM ingestion → validated BIDS conversion remains the preferred data-management architecture.

v2 SHOULD extend BIDS-compatible handling to:

* structural;
* BOLD;
* DWI;
* task metadata.

Where another standard is required for neurophysiology/audiology, use an explicit adapter rather than pretending all modalities are MRI.

---

# 128. SOURCE DATA IMMUTABILITY

Preserve original acquired data wherever retention policy permits.

At minimum retain sufficient provenance to know exactly:

```text
what the processing run received.
```

Derived files SHALL NOT overwrite raw sources.

---

# 129. RAW DATA HASHING

Clinically consequential source files SHOULD have content hashes or immutable object-store provenance.

This is especially important for:

* DICOM;
* lesion masks;
* EMG/MEP recordings;
* motor-map coordinate exports;
* audiograms imported from external systems.

---

# 130. COMPUTE SECURITY

The v1 principle remains:

NeuroCompute requires:

* pseudonymous Case ID;
* scientific artefact IDs;
* required measurement data.

It does not generally require:

* patient address;
* full clinical notes;
* unrelated identifiers. 

---

# 131. OFFLINE EXECUTION

Clinical scientific compute SHOULD support network-isolated operation.

Required:

```text
containers
atlases
templates
normative models
tract definitions
circuit maps
```

are preloaded and hash-verified.

No:

```text
download latest atlas
```

during a clinical run.

This extends the v1 offline-resource policy. 

---

# 132. WORKER ARCHITECTURE

Recommended workers:

```text
StructuralWorker
LesionWorker
RestingStateWorker
TaskFMRIWorker
DiffusionWorker
MotorMappingWorker
NeurophysiologyWorker
AudiologyAdapter
EFieldWorker
ReliabilityWorker
MeasurementBundleAssembler
```

Workers do scientific computation.

They do not make final clinical decisions.

---

# 133. PROCESSING ORCHESTRATION

Conceptual:

```text
Acquisition registered
      ↓
measurement requirements resolved
      ↓
required processing jobs scheduled
      ↓
provider-specific pipelines
      ↓
QC
      ↓
reliability
      ↓
qualification
      ↓
MeasurementBundle frozen
```

Jobs that are not required should not be run by default.

---

# 134. JOB IDEMPOTENCY

Identical:

```text
input hash
+
pipeline version
+
configuration hash
```

SHOULD resolve to scientifically identical processing output.

Duplicate job submission SHALL NOT create scientifically divergent results.

---

# 135. PIPELINE FAILURE

A scientific pipeline failure SHALL produce:

```text
failed ProcessingRun
```

and:

```text
no qualified measurement
```

not a partially complete object presented as valid.

---

# 136. PARTIAL MULTIMODAL FAILURE

If:

```text
DWI failed
```

but:

```text
Structural MRI qualified
Motor mapping qualified
```

the complete Case need not fail.

The `MeasurementBundle` reflects:

```text
structural localisation      enabled
motor-map refinement         enabled
DWI refinement               disabled
```

---

# 137. NO SILENT FALLBACK

If a preferred measurement fails and an alternative is used:

the fallback SHALL be explicit.

Example:

```text
Motor-map refinement unavailable.
Evidence-defined anatomical somatotopic baseline used.
```

---

# 138. DATA RETENTION

Retention policy SHOULD consider:

### MRI

* original DICOM/BIDS;
* key derivatives;
* transforms;
* surfaces;
* masks.

### Motor mapping

* stimulation coordinates;
* responses;
* raw EMG where feasible;
* mapping protocol.

### Audiology

* original test record;
* derived structured results.

Historical Target Slates remain valid records even if exact recomputation later becomes impossible because raw data were legitimately deleted; that limitation must be documented, as already specified in v1. 

---

# 139. ARTIFACT MANIFEST

Every measurement SHOULD maintain:

```ts
interface MeasurementArtifactManifest {
  measurement_id: UUID;

  input_artifacts: ArtifactManifestEntry[];

  output_artifacts: ArtifactManifestEntry[];

  pipeline_version_id: UUID;

  configuration_sha256: SHA256;

  manifest_sha256: SHA256;
}
```

---

# 140. TARGET ENGINE PAYLOAD

The Target Engine SHALL receive structured references, not every binary artefact.

Example:

```ts
interface MeasurementTargetEnginePayload {
  measurement_bundle_id: UUID;

  capability_statuses: CapabilityStatus[];

  relevant_measurement_ids: UUID[];

  reliability_bundle_id?: UUID;

  lesion_context_ids?: UUID[];

  modality_feature_refs: ModalityFeatureRef[];

  transform_manifest_ids: UUID[];

  artifact_manifest_ids: UUID[];
}
```

---

# 141. TARGET ENGINE DOES NOT RECEIVE “BEST TARGET”

A provider may return:

```text
motor hotspot location
```

or:

```text
highest-concordance region within authorised search space
```

or:

```text
task activation centre.
```

It SHALL NOT return:

```text
best clinical target.
```

---

# 142. FEATURE SEMANTICS

A feature must declare what it means.

For example:

```ts
interface ModalityFeatureRef {
  feature_code: string;

  measurement_id: UUID;

  value?: number;
  unit?: string;

  categorical_value?: string;

  method_code: string;
  method_version: string;

  interpretation: string;
}
```

Avoid unlabeled arrays such as:

```text
features = [0.72, 4.1, 0.16].
```

---

# 143. CLINICIAN-FACING MULTIMODAL VIEW

The clinician should see:

```text
Structural anatomy             Qualified
Lesion mapping                 Qualified
Motor mapping                  Qualified
Resting-state connectivity     Not acquired
DWI                            Research only
```

not an overwhelming technical pipeline tree by default.

Technical detail remains progressively available.

---

# 144. MEASUREMENT DETAIL DRAWER

Each modality view SHOULD allow inspection of:

* acquisition;
* pipeline;
* QC;
* reliability;
* limitations;
* capability effect;
* technical provenance.

This integrates with the MAGNIOM shell specification.

---

# 145. MEASUREMENT VERSUS CLINICAL INTERPRETATION

Example:

```text
MEASUREMENT:
Left M1 hotspot reproducibly localised.

TARGET ENGINE:
This may refine the evidence-defined M1 target for right-hand pain.

CLINICIAN:
Chooses whether to use that target.
```

These layers SHALL remain visually and canonically distinct.

---

# 146. RESEARCH MODE

Research Mode may expose:

* alternative rs-fMRI pipelines;
* novel tractography;
* lesion-network mapping;
* new task paradigms;
* experimental motor-map metrics;
* auditory-network hypotheses;
* multimodal fusion.

Every output remains tagged:

```text
mode = research.
```

No Research measurement influences Clinical target generation without explicit promotion.

---

# 147. RESEARCH-TO-CLINICAL PROMOTION

A modality capability progresses:

```text
Research implementation
   ↓
technical verification
   ↓
measurement reliability study
   ↓
indication-specific retrospective validation
   ↓
prospective/silent validation where required
   ↓
Scientific Policy approval
   ↓
Clinical capability
```

No feature flag bypass.

---

# 148. VALIDATION PROGRAM — STRUCTURAL MRI

Must establish:

* segmentation performance;
* surface reconstruction;
* coordinate transforms;
* laterality;
* neuronavigation round trip;
* scanner/site compatibility.

---

# 149. VALIDATION PROGRAM — LESION MAPPING

Must assess:

```text
segmentation validity
inter/intra-rater reliability where applicable
registration robustness
lesion-volume reproducibility
target-family intersection accuracy
lesion-distance stability
```

Separate lesion types may require separate validation.

---

# 150. VALIDATION PROGRAM — RS-FMRI

Retain v1 requirements:

* acquisition qualification;
* motion;
* retained duration;
* cross-run stability;
* split-half stability;
* pipeline sensitivity;
* circuit-map versioning;
* target localisation reproducibility.

The v1 specification already required candidate-surface reproducibility and quantified preprocessing sensitivity before clinical release. 

---

# 151. VALIDATION PROGRAM — TASK fMRI

Must assess:

* paradigm compliance;
* behavioural validity;
* activation reproducibility;
* laterality reproducibility;
* registration;
* threshold sensitivity;
* clinically relevant localisation stability.

---

# 152. VALIDATION PROGRAM — DWI

Must assess:

* acquisition reproducibility;
* distortion correction;
* tract reconstruction stability;
* tract-specific validity;
* lesion sensitivity;
* model sensitivity;
* target-related feature reproducibility.

A tractography pipeline should not enter Clinical ranking merely because it produces anatomically plausible bundles.

---

# 153. VALIDATION PROGRAM — MOTOR MAPPING

Must assess:

* hotspot repeatability;
* motor-map centre repeatability;
* spatial coverage;
* orientation effects;
* threshold stability;
* inter-session reproducibility;
* mapping protocol completeness.

Where used clinically, validation should consider the actual TMS system and navigation workflow.

---

# 154. VALIDATION PROGRAM — MEP

Must assess:

* EMG signal quality;
* response detection;
* latency/amplitude measurement;
* background activity;
* trial-repeatability;
* threshold measurement reproducibility.

---

# 155. VALIDATION PROGRAM — AUDIOLOGY

Must assess:

* equipment calibration;
* threshold measurement consistency;
* laterality;
* tinnitus-match repeatability where used;
* structured import correctness;
* clinical-record reconciliation.

---

# 156. CROSS-MODALITY VALIDATION

Where an algorithm uses more than one modality, validation must test the:

# combined scientific workflow.

It is insufficient that each component works independently.

Example:

```text
Structural MRI valid
+
motor mapping valid
```

does not automatically establish:

```text
motor-map-to-cortical-surface transform valid.
```

---

# 157. TRANSFORM VALIDATION

Every cross-modal transform SHALL undergo dedicated validation.

Examples:

```text
DWI → T1
BOLD → T1
task fMRI → T1
motor navigation → T1
lesion mask → surface
```

---

# 158. CROSS-MODALITY ERROR BUDGET

MAGNIOM SHOULD eventually quantify the localisation uncertainty contributed by:

```text
acquisition
processing
registration
mapping
measurement variability
coordinate export
```

where feasible.

But v2 SHALL NOT simply sum heterogeneous uncertainties into a fake universal confidence interval without validated methodology.

---

# 159. UNCERTAINTY MODEL

Each measurement may contribute:

```ts
interface MeasurementUncertainty {
  measurement_id: UUID;

  uncertainty_sources: UncertaintySource[];

  spatial_uncertainty_region?: SpatialRegion;

  qualitative_interpretation: string;
}
```

---

# 160. CLINICAL CAPABILITY, NOT MODALITY, IS THE RELEASE UNIT

A clinically qualified rs-fMRI pipeline for:

```text
MDD FC refinement
```

does not imply qualification for:

```text
PTSD network targeting.
```

Likewise:

```text
motor mapping technically valid
```

does not imply:

```text
stroke motor targeting clinically validated.
```

The release unit is:

```text
Measurement Provider
+
Capability
+
Indication Module
+
Scientific Policy.
```

---

# 161. INITIAL v2 CAPABILITY POSTURE

Recommended starting position:

| Capability                       | Suggested initial state                |
| -------------------------------- | -------------------------------------- |
| Structural MRI / neuronavigation | Core                                   |
| MDD rs-fMRI refinement           | Preserve existing validation pathway   |
| Lesion mapping                   | Validation                             |
| Motor mapping                    | Validation                             |
| MEP context                      | Validation / Research depending module |
| DWI structural connectivity      | Research / validation                  |
| Task fMRI                        | Research / validation                  |
| Audiology structured measurement | Core for tinnitus research workflow    |
| Tinnitus network imaging         | Research                               |
| Lesion-network targeting         | Research                               |
| Multimodal fusion                | Research only                          |

This is an engineering maturity recommendation, not a clinical claim.

---

# 162. NEW SYSTEM REQUIREMENTS

The future v2 SRS should add requirements such as:

### MAG-MEA-001

Every patient-specific measurement SHALL reference a versioned Measurement Provider and ProcessingRun.

### MAG-MEA-002

A measurement SHALL NOT influence Clinical target generation unless its required capability is qualified.

### MAG-MEA-003

Measurement QC and measurement reliability SHALL remain distinct.

### MAG-MEA-004

Missing measurement data SHALL NOT be interpreted as normal measurement.

### MAG-MEA-005

Multimodal measurements SHALL NOT be fused into a clinical target unless a validated Scientific Policy explicitly defines the fusion.

### MAG-MEA-006

Cross-modal coordinate transforms SHALL be versioned and verified.

### MAG-MEA-007

Research-only measurement capabilities SHALL NOT influence Clinical Target Slates.

---

# 163. LESION REQUIREMENTS

### MAG-LES-001

Lesion-dependent indication modules SHALL reference an approved `LesionContext`.

### MAG-LES-002

Lesion masks SHALL retain native-space provenance.

### MAG-LES-003

A substantially destroyed target region SHALL NOT be treated as normal intact cortex.

### MAG-LES-004

Target/lesion relationships SHALL use validated coordinate transformations.

### MAG-LES-005

Lesion segmentation uncertainty SHALL remain visible.

---

# 164. DWI REQUIREMENTS

### MAG-DWI-001

Diffusion processing SHALL reference an immutable acquisition and pipeline version.

### MAG-DWI-002

Tractography outputs SHALL NOT be represented as direct axonal counts.

### MAG-DWI-003

Structural-connectivity features SHALL require module-specific Scientific Policy permission before influencing Clinical ranking.

### MAG-DWI-004

DWI failure SHALL NOT invalidate unrelated qualified modalities unless the active module requires DWI.

---

# 165. MOTOR REQUIREMENTS

### MAG-MOT-001

Motor mapping SHALL preserve stimulation location, orientation, intensity, muscle and response provenance.

### MAG-MOT-002

Somatotopic target refinement SHALL require body-region consistency.

### MAG-MOT-003

Motor hotspot localisation used clinically SHALL have applicable reliability qualification.

### MAG-MOT-004

Motor-map failure SHALL NOT result in a guessed patient-specific hotspot.

---

# 166. MEP REQUIREMENTS

### MAG-MEP-001

MEP trials SHALL retain artefact/validity status.

### MAG-MEP-002

Absence of MEP SHALL NOT automatically be interpreted as absence of corticospinal anatomy.

### MAG-MEP-003

MEP-derived scientific features SHALL require indication-specific policy permission.

---

# 167. TASK fMRI REQUIREMENTS

### MAG-TFM-001

Task-fMRI interpretation SHALL retain paradigm and behavioural-performance provenance.

### MAG-TFM-002

Failure to perform a task SHALL NOT be represented as absence of cortical function.

### MAG-TFM-003

Task-fMRI target influence SHALL require reproducibility/qualification appropriate to the intended capability.

---

# 168. AUDIOLOGY REQUIREMENTS

### MAG-AUD-001

Tinnitus measurement workflows SHALL preserve hearing and tinnitus laterality separately.

### MAG-AUD-002

Audiologic measurements SHALL identify equipment/calibration provenance where clinically relevant.

### MAG-AUD-003

Tinnitus pitch/loudness matching SHALL NOT independently generate a Clinical target.

### MAG-AUD-004

Research auditory-network targeting SHALL remain structurally distinct from routine audiologic assessment.

---

# 169. GOLDEN MULTIMODAL CASES

### MM-01 — MDD, qualified rs-fMRI

Expected:

```text
individual_fc_refinement = qualified
```

### MM-02 — MDD, failed rs-fMRI

Expected:

```text
FC refinement disabled
evidence baseline preserved
```

### MM-03 — Stroke, large lesion

Expected:

```text
LesionContext generated
target-family intersections identified
```

### MM-04 — Stroke, destroyed M1 target region

Expected:

measurement reports structural invalidity; Target Engine determines candidate suppression.

### MM-05 — Pain, reproducible hand hotspot

Expected:

```text
motor_hotspot_targeting = qualified
```

### MM-06 — Pain, unstable hotspot

Expected:

refinement not qualified.

### MM-07 — Aphasia, successful task performance

Expected:

qualified task measurement if all other criteria pass.

### MM-08 — Aphasia, failed task performance

Expected:

no false “language cortex absent” conclusion.

### MM-09 — TBI, skull defect

Expected:

structural/skull context available for E-field workflow.

### MM-10 — DWI tractography instability

Expected:

structural-connectivity refinement not qualified.

### MM-11 — Tinnitus, complete audiology

Expected:

tinnitus research measurement bundle qualified.

### MM-12 — Tinnitus pitch match + no clinical EvidencePath

Expected:

no Clinical target generation.

---

# 170. SECURITY GOLDEN CASE

Attempt:

```text
Case A DWI
+
Case B lesion mask
```

Expected:

# hard cross-case rejection.

No scientific bundle can contain patient data from different Cases.

---

# 171. LATERALITY GOLDEN CASE

Attempt:

```text
right-hand pain
+
right M1 contralateral strategy
```

where policy requires the opposite hemisphere.

Expected:

structured inconsistency detection.

No silent hemisphere correction.

---

# 172. TRANSFORM GOLDEN CASE

Deliberately invert RAS/LPS convention.

Expected:

```text
spatial validation failure
```

before Target Engine use.

---

# 173. REPRODUCIBILITY GOLDEN CASE

Run identical source data under identical:

```text
pipeline
configuration
software
atlas
```

Expected:

scientifically equivalent canonical measurement and matching manifest.

---

# 174. PIPELINE-UPGRADE GOLDEN CASE

Process same acquisition with:

```text
Pipeline 2.0
vs
Pipeline 2.1
```

Measure:

* localisation change;
* tract change;
* lesion-boundary change;
* reliability change;
* capability qualification change.

If clinically material:

a formal scientific impact report is required.

---

# 175. REPOSITORY v2

Recommended:

```text
packages/
├── measurement-core/
│   ├── acquisition/
│   ├── processing/
│   ├── qc/
│   ├── reliability/
│   ├── transforms/
│   ├── manifests/
│   └── bundles/
│
├── modalities/
│   ├── structural-mri/
│   ├── lesion-mapping/
│   ├── resting-state/
│   ├── task-fmri/
│   ├── diffusion/
│   ├── motor-mapping/
│   ├── mep/
│   ├── audiology/
│   └── efield/
│
└── measurement-testkit/
    ├── synthetic/
    ├── known-answer/
    ├── transform-tests/
    ├── reliability/
    └── golden-cases/
```

---

# 176. CONTAINER ARCHITECTURE

Where appropriate, scientific pipelines SHOULD run inside frozen containers.

Separate containers are preferable where modality stacks materially differ:

```text
magniom-structural
magniom-rsfmri
magniom-taskfmri
magniom-diffusion
magniom-lesion
magniom-efield
```

Motor mapping/audiology may involve device adapters rather than container-only pipelines.

---

# 177. CONTAINER DIGEST

Clinical runs SHALL reference immutable image digest.

Do not rely solely on:

```text
magniom-diffusion:latest
```

or:

```text
fmriprep:stable.
```

---

# 178. EXTERNAL TOOLCHAIN UPDATES

Updates to:

* MRI preprocessing;
* tractography;
* segmentation;
* surface reconstruction;
* task analysis;
* lesion models;

may materially alter targets.

They SHALL not automatically enter Clinical environments.

---

# 179. VALIDATED RELEASE MANIFEST

A Multimodal Measurement Release should identify:

```text
structural provider
lesion provider
rs-fMRI provider
task-fMRI provider
diffusion provider
motor-map adapter
MEP adapter
audiology adapter
E-field provider
atlas versions
normative models
transform libraries
acquisition profiles
reliability methods
```

---

# 180. MEASUREMENT RELEASE COMPATIBILITY

Clinical compatibility is explicit.

Example:

```text
StrokeMotorModule 1.0
+
StructuralProvider 2.0
+
LesionProvider 1.0
+
MotorMapProvider 1.1
+
ScientificPolicy 2.0
```

may be validated.

It does not follow that:

```text
LesionProvider 1.2
```

is automatically compatible.

---

# 181. HUMAN FACTORS

Clinicians must be able to distinguish:

```text
measurement quality
```

from:

```text
target evidence
```

from:

```text
Target Engine preference.
```

For example:

> Motor mapping is highly reproducible

does not mean:

> This target is proven clinically superior.

---

# 182. UI STATUS LANGUAGE

Recommended:

```text
Available
Processing
Qualified
Qualified with limitations
Not qualified
Research only
Not required
```

Avoid:

```text
Good brain
Bad scan
Weak patient
High-confidence treatment
```

---

# 183. VISUALISATION

Modality visualisations may include:

### Structural

surface/anatomy.

### Lesion

mask + target relationship.

### rs-fMRI

circuit/concordance overlays.

### Task fMRI

activation maps.

### DWI

tracts/tract-density maps.

### Motor mapping

stimulation-response maps.

### Audiology

audiogram/tinnitus profile.

Visualisation is not the scientific data source.

Canonical measurements remain authoritative.

---

# 184. NO HEATMAP AUTHORITY

A colourful heatmap SHALL NOT carry more clinical authority than the underlying measurement warrants.

Particularly:

* task activation;
* FC map;
* tract density;
* motor response maps.

Visual intensity is not automatically treatment relevance.

---

# 185. CLINICAL EXPORT

Only after clinician target selection should MAGNIOM produce the appropriate navigation/export artefact.

Export may incorporate:

```text
subject anatomy
selected target geometry
coil field/pose where applicable
coordinate transforms
```

Measurement providers prepare the spatial basis.

They do not select the target.

---

# 186. PROTOCOL BOUNDARY

Even motor physiology does not authorise automatic protocol generation.

The measurement layer may record:

```text
RMT
AMT
MEP
```

but does not autonomously determine:

```text
frequency
train duration
pulse count
session schedule.
```

Target selection and protocol selection remain separate domains.

---

# 187. RETROSPECTIVE VALIDATION DATASETS

Each modality should have:

```text
development dataset
locked validation dataset
```

appropriate to its intended capability.

One dataset should not be repeatedly tuned against until it becomes de facto training data.

---

# 188. PROSPECTIVE VALIDATION

Where patient-specific measurement affects target choice, silent prospective validation should measure:

```text
measurement success rate
qualification rate
repeatability
target displacement
fallback rate
processing failure
site effects
clinician interpretation
```

before unrestricted clinical influence.

---

# 189. SITE DRIFT MONITORING

Post-release surveillance SHOULD monitor:

* acquisition drift;
* processing failure rate;
* reliability distribution;
* scanner upgrades;
* calibration issues;
* motor-map variability;
* audiology import errors.

Operational drift is not automatically scientific evidence.

---

# 190. NO AUTOMATIC RETUNING

If reliability degrades at one site:

MAGNIOM SHALL NOT automatically lower:

```text
minimum reliability threshold
```

to preserve throughput.

Investigate the acquisition/pipeline first.

---

# 191. MEASUREMENT CHANGE CLASSES

### Non-scientific implementation

Intended no output change.

### Measurement implementation

May alter derived measurement.

### Measurement parameter

Changes threshold/model/configuration.

### Measurement model

Changes scientific method.

### Acquisition profile

Changes input domain.

Each carries progressively greater validation implications.

---

# 192. SCIENTIFIC CHANGE IMPACT

For any clinically material modality update ask:

```text
Which cases changed?

Which measurements moved?

Which capabilities changed qualification?

Which TargetCandidates changed?

Which Primary 1 candidates changed?

How large were spatial shifts?

Did fallback rates change?

Did laterality ever change?

Did abstention change?
```

---

# 193. DATA CONTRACT WITH v2 TARGET ENGINE

The Target Engine shall receive:

```text
qualified scientific facts
```

rather than rerun measurement algorithms itself.

This preserves package boundaries.

Example:

```text
MotorMapProvider
→ MotorHotspotResult

Target Engine
→ decides whether generator may use it.
```

---

# 194. NO DUPLICATE SCIENTIFIC IMPLEMENTATION

The Target Engine SHALL NOT independently reimplement:

* lesion segmentation;
* FC computation;
* tractography;
* task GLM;
* motor-hotspot derivation;
* audiometric interpretation.

It consumes versioned canonical results.

---

# 195. DATABASE DOMAIN RECOMMENDATION

Suggested schemas/tables:

```text
measurement.acquisitions
measurement.processing_runs
measurement.measurements
measurement.quality_assessments
measurement.reliability_assessments
measurement.measurement_bundles
measurement.bundle_members
measurement.capability_qualifications

imaging.structural_measurements
imaging.lesion_measurements
imaging.rsfmri_measurements
imaging.taskfmri_measurements
imaging.diffusion_measurements
imaging.structural_connectivity_measurements

neurophysiology.motor_mapping_runs
neurophysiology.motor_mapping_points
neurophysiology.motor_hotspots
neurophysiology.mep_measurements
neurophysiology.mep_trials
neurophysiology.motor_thresholds

audiology.assessments
audiology.audiograms
audiology.tinnitus_matching
```

Exact relational implementation belongs in the Supabase v2 specification.

---

# 196. DO NOT OVER-JSON

Strongly typed/searchable fields should include:

```text
modality
laterality
body region
muscle
lesion type
processing status
QC status
reliability class
capability status
coordinate space
pipeline version
```

Extended model-specific metrics may use structured JSON where necessary.

---

# 197. V2 MEASUREMENT PIPELINE

The overall canonical algorithm becomes:

```text
CLINICAL INDICATION MODULE
          ↓
MEASUREMENT REQUIREMENTS
          ↓
ACQUISITION INGESTION
          ↓
SOURCE INTEGRITY
          ↓
MODALITY-SPECIFIC PROCESSING
          ↓
QUALITY CONTROL
          ↓
RELIABILITY ANALYSIS
          ↓
CAPABILITY QUALIFICATION
          ↓
CROSS-MODAL TRANSFORM VALIDATION
          ↓
MEASUREMENT BUNDLE
          ↓
RELIABILITY BUNDLE
          ↓
TARGET ENGINE
```

---

# 198. THE MULTIMODAL PIPELINE MUST NEVER

### infer clinical indication from imaging alone;

### search the whole brain for the most abnormal location and call it a target;

### interpret a lesion as a target merely because it is abnormal;

### treat tractography as direct axonal ground truth;

### treat task activation as causal treatment evidence;

### infer absent function from failed task performance;

### treat MEP absence as automatic tract destruction;

### turn motor-map precision into efficacy evidence;

### turn tinnitus pitch matching into auditory-cortex target selection;

### silently combine modalities into a universal target score;

### use incompatible normative models;

### ignore laterality inconsistency;

### hide processing sensitivity;

### call an unstable patient-specific coordinate “precision targeting”;

### change scientific software silently;

### use Research measurements as Clinical authority without promotion;

### rank targets itself.

---

# 199. v2 SCIENTIFIC DIFFERENTIATOR

A conventional imaging workflow may produce:

# a coordinate.

A conventional motor-mapping system may produce:

# a hotspot.

A conventional DWI workflow may produce:

# a tract.

A conventional audiology system may produce:

# an audiogram.

MAGNIOM v2 produces something more useful:

```text
Measurement
+
method
+
provenance
+
QC
+
reliability
+
capability qualification
+
scientific scope.
```

That package allows the Target Engine to know not merely:

> what was measured?

but:

> **whether this measurement is trustworthy enough, and scientifically authorised enough, to influence this particular targeting decision.**

---

# 200. FINAL MULTIMODAL PRINCIPLES

# Structural anatomy establishes where the patient's anatomy actually is.

# Lesion mapping establishes where anatomy has been altered.

# rs-fMRI measures functional relationships.

# Task fMRI measures task-dependent functional responses.

# DWI estimates structural pathways.

# Motor mapping measures stimulation-responsive somatotopy.

# MEPs measure evoked corticospinal physiology.

# Audiology characterises hearing and tinnitus context.

# E-field modelling estimates stimulation physics.

# None of these measurements independently establishes clinical efficacy.

# None independently establishes the final target.

# Each modality has its own QC.

# Each modality has its own reliability model.

# Reliability is capability-specific.

# Missing data are not normal data.

# Failed measurement is not a negative biological finding.

# Technical precision is not biological certainty.

# More modalities do not automatically improve targeting.

# Multimodal disagreement remains visible.

# Multimodal convergence is described, not overinterpreted.

# Modality fusion requires explicit scientific validation.

# Clinical use is indication-specific.

# Research use never silently becomes Clinical use.

# The Target Engine receives qualified measurements.

# The specialist receives competing hypotheses.

# The specialist decides.

---

# 201. CANONICAL DEFINITION

The **MAGNIOM Neuroimaging, Neurophysiology & Multimodal Measurement System v2.0** is:

> **A versioned, modality-aware scientific measurement architecture that converts imaging, neurophysiology and audiologic acquisitions into reproducible, provenance-complete and capability-qualified patient measurements, while explicitly separating acquisition quality, measurement reliability, scientific interpretation and clinical target authority.**

---

# 202. FINAL GOVERNING RULE

> **MAGNIOM shall never permit a measurement to influence a target merely because that measurement can be computed. Structural MRI, lesion maps, functional connectivity, task activation, tractography, motor hotspots, MEPs, audiology and E-field models must each demonstrate appropriate acquisition validity, processing integrity, reliability and indication-specific scientific permission before they can contribute to Target Engine reasoning. The measurement system measures; Scientific Policy qualifies; the Target Engine constructs hypotheses; the specialist decides.**

