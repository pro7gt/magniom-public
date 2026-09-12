# MAGNIOM

# Neuroimaging & Functional Connectomics Pipeline Specification v1.1

**Document status:** Canonical specialised scientific-measurement specification  
**Version:** 1.1  
**Purpose:** Resting-state fMRI, functional connectomics, therapeutic-circuit localisation, Triple-Network analysis and patient-specific functional-target reliability  
**Primary clinical consumer:** MAGNIOM Target Engine  
**Primary scientific consumer:** Indication-specific Targeting Modules  
**Clinical authority:** Specialist clinician  
**Scientific-compute authority:** Approved Pipeline Release + Scientific Policy + Indication Module compatibility  
**Supersedes:** MAGNIOM Neuroimaging & Functional Connectomics Pipeline Specification v1.0 for compatible rs-fMRI/connectomics workflows  
**Relationship to v2.0:** This document is the specialised rs-fMRI/connectomics provider specification within the broader MAGNIOM Neuroimaging, Neurophysiology & Multimodal Measurement Architecture v2.0.  
**Backward compatibility:** Historical v1.0 runs remain immutable and reproducible.  
**Primary modality:** Resting-state functional MRI  
**Supporting modalities:** Structural MRI, subject-native anatomy, surface reconstruction, atlas/parcellation, normative functional connectivity models and E-field-related anatomical inputs where separately qualified.

---

# 1. EXECUTIVE PURPOSE

MAGNIOM v1.1 defines the scientific and technical pipeline by which resting-state fMRI data may be converted into:

1. reproducible subject-native and standard-space functional measurements;
2. functional-connectivity matrices;
3. therapeutic-circuit connectivity measurements;
4. patient-specific functional localisation hypotheses;
5. Triple-Network Systems measurements;
6. normative functional-connectivity context;
7. target-localisation reliability estimates;
8. capability qualification for downstream Target Engine use.

The pipeline SHALL NOT determine:

- the patient's diagnosis;
- whether TMS is clinically indicated;
- the final treatment target;
- stimulation frequency;
- stimulation intensity;
- pulse number;
- treatment schedule;
- coil prescription;
- clinical efficacy;
- whether a functional abnormality is causal;
- whether a target will produce a clinical response.

The pipeline is a **measurement and scientific-inference service**, not a treatment-prescription engine.

The fundamental boundary remains:

```text
MRI acquisition
      ↓
versioned processing
      ↓
functional measurement
      ↓
QC
      ↓
reliability
      ↓
capability qualification
      ↓
Measurement Bundle
      ↓
Target Engine
      ↓
candidate target
      ↓
specialist review
```

The pipeline SHALL never output:

```text
best_target
```

or equivalent autonomous treatment conclusions.

---

# 2. VERSION 1.1 OBJECTIVE

v1.1 is not intended to replace the broader multimodal architecture introduced by MAGNIOM v2.0.

Instead:

```text
MAGNIOM Platform v2
        │
        ├── Structural Measurement Provider
        ├── Lesion Measurement Provider
        ├── rs-fMRI / Connectomics Provider ← THIS SPECIFICATION
        ├── Task-fMRI Provider
        ├── DWI Provider
        ├── Motor Mapping Provider
        ├── MEP Provider
        ├── Audiology Provider
        └── E-field Provider
```

The v1.1 pipeline therefore provides a highly controlled functional-connectomics capability that can be consumed by compatible indication modules.

The broader v2 architecture explicitly preserves rs-fMRI as a specialised Measurement Provider and retains the v1 architecture of structural processing, BOLD preprocessing, multi-echo denoising, nuisance regression/censoring, surface mapping, parcellation, functional connectivity, therapeutic-circuit maps and target reliability.

---

# 3. GOVERNING SCIENTIFIC PRINCIPLE

MAGNIOM SHALL distinguish:

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
measurement is qualified for a specific capability
```

from:

```text
measurement is permitted to influence Clinical Mode
```

These states are not interchangeable.

A technically successful fMRI processing run does not establish that its functional localisation is reliable.

A reliable functional measurement does not establish that the associated circuit is therapeutic.

A therapeutically supported circuit does not establish that a patient-specific deviation is causal.

A reproducible personalised target does not establish superiority over a standard target.

---

# 4. CORE SCIENTIFIC PRINCIPLE

MAGNIOM SHALL reason in the following order:

```text
Evidence
   ↓
Therapeutic circuit
   ↓
Clinical objective
   ↓
Candidate target family
   ↓
Patient functional measurement
   ↓
Reliability
   ↓
Patient-specific refinement
   ↓
Target Engine
```

NOT:

```text
Patient MRI
   ↓
abnormal connectivity
   ↓
interesting brain region
   ↓
clinical target
```

A patient-specific imaging finding cannot create its own therapeutic evidence.

The evidence path must exist independently of the imaging result.

---

# 5. v1.1 SCIENTIFIC EXTENSION

The principal scientific extension in v1.1 is the introduction of a:

# Triple-Network Systems Layer

covering:

- Central Executive Network (CEN);
- Default Mode Network (DMN);
- Salience Network (SN);
- CEN–DMN relationships;
- SN–CEN relationships;
- SN–DMN relationships;
- within-network integrity;
- between-network coupling;
- network segregation;
- network integration;
- normative context;
- reliability.

The Triple-Network layer SHALL be treated as:

```text
distributed systems context
```

rather than:

```text
three independent stimulation targets
```

The pipeline SHALL NOT implement:

```text
DMN abnormal
+
CEN abnormal
+
SN abnormal
        ↓
stimulate CEN
```

Nor:

```text
DMN hyperconnected → suppress DMN
CEN hypoconnected → stimulate CEN
SN abnormal → stimulate SN
```

Such rules would exceed the evidence represented by the measurement.

---

# 6. TRIPLE-NETWORK SCIENTIFIC MODEL

The canonical conceptual model is:

```text
                  ┌─────────────┐
                  │     DMN     │
                  └──────┬──────┘
                         │
                    CEN ↔ DMN
                         │
          ┌──────────────┴──────────────┐
          │                             │
      ┌───▼───┐                     ┌───▼───┐
      │  CEN  │ ◄──── SN ─────────► │  DMN  │
      └───────┘                     └───────┘
```

More accurately:

```text
CEN
 │ ╲
 │  ╲
 │   ╲
 │    DMN
 │   ╱
 │  ╱
SN
```

where each node and relationship represents a measurable network property rather than a discrete anatomical target.

The system SHALL preserve:

```text
within-network properties
```

and:

```text
between-network relationships
```

separately.

---

# 7. TRIPLE-NETWORK SYSTEM OBJECTS

v1.1 SHALL introduce or support the following canonical scientific objects.

## 7.1 NetworkSystem

Represents a large-scale functional network.

```ts
interface NetworkSystem {
  id: UUID;
  code: string;
  name: string;
  definition_version: string;
  atlas_reference_id: UUID;
  region_ids: UUID[];
  evidence_status:
    | "clinical_supported"
    | "validated_context"
    | "research";
}
```

Initial systems:

```text
CEN
DMN
SN
```

---

# 8. NETWORK DEFINITION

A network definition SHALL specify:

- constituent regions/parcels;
- atlas;
- hemisphere;
- network membership;
- network-definition source;
- version;
- inclusion/exclusion rules;
- spatial representation;
- analysis method.

A network SHALL NOT be defined merely by an informal label.

For example:

```text
DMN
```

is insufficient.

The system must know:

```text
which DMN definition
which atlas
which parcels
which version
which analytical method
```

were used.

---

# 9. NETWORK RELATIONSHIP

```ts
interface NetworkRelationship {
  id: UUID;

  network_a_id: UUID;
  network_b_id: UUID;

  relationship_type:
    | "within_network"
    | "between_network"
    | "coupling"
    | "segregation"
    | "integration";

  metric_code: string;
  metric_version: string;

  normative_model_id?: UUID;

  evidence_status:
    | "clinical_supported"
    | "validated_context"
    | "research";
}
```

Relationships SHALL be directional only where the underlying measurement is genuinely directional.

Ordinary resting-state correlation SHALL NOT be described as causal direction.

---

# 10. TRIPLE-NETWORK PROFILE

The canonical patient-level object is:

```ts
interface TripleNetworkProfile {
  id: UUID;
  case_id: UUID;

  connectome_run_id: UUID;

  network_definition_version: string;
  metric_version: string;

  cen: {
    within_network_integrity?: number;
    reliability?: ReliabilitySummary;
  };

  dmn: {
    within_network_integrity?: number;
    reliability?: ReliabilitySummary;
  };

  sn: {
    within_network_integrity?: number;
    reliability?: ReliabilitySummary;
  };

  cen_dmn?: {
    coupling?: number;
    segregation?: number;
    normative_context?: NormativeContext;
    reliability?: ReliabilitySummary;
  };

  sn_cen?: {
    coupling?: number;
    segregation?: number;
    normative_context?: NormativeContext;
    reliability?: ReliabilitySummary;
  };

  sn_dmn?: {
    coupling?: number;
    segregation?: number;
    normative_context?: NormativeContext;
    reliability?: ReliabilitySummary;
  };

  global_network_integration?: number;
  global_network_segregation?: number;

  dynamic_metrics?: DynamicNetworkMetrics;

  interpretation:
    | "supportive"
    | "neutral"
    | "contradictory"
    | "uncertain";

  clinical_use:
    | "contextual"
    | "qualified"
    | "research";
}
```

---

# 11. NO SINGLE "TRIPLE NETWORK SCORE"

MAGNIOM SHALL NOT collapse:

```text
CEN
DMN
SN
CEN–DMN
SN–CEN
SN–DMN
```

into:

```text
Triple Network Score = 0.74
```

Such a score would destroy the relational structure the system is intended to preserve.

The clinician should be able to see:

```text
CEN
Within-network integrity       moderate

DMN
Within-network integrity       altered

SN
Within-network integrity       within reference

CEN ↔ DMN
Coupling                       altered

SN ↔ CEN
Coupling                       within reference

SN ↔ DMN
Coupling                       altered
```

rather than a single opaque number.

---

# 12. ACQUISITION PROFILE

Each clinical rs-fMRI acquisition SHALL be associated with a versioned acquisition profile.

The v1.1 MDD-compatible profile retains the original preferred architecture:

```text
3T MRI
+
high-resolution T1
+
resting-state fMRI
```

Preferred characteristics include:

- T1 approximately ≤1 mm isotropic;
- multi-echo rs-fMRI where supported;
- approximately two independently analyzable rs-fMRI runs;
- approximately 15 minutes per run preferred;
- ≥12 minutes retained data as a provisional minimum for any FC personalisation capability;
- ≥3 echoes preferred, with 4 preferable where technically appropriate;
- TR approximately 1.2–1.5 s;
- approximately 2–2.5 mm isotropic BOLD resolution;
- whole-brain coverage;
- reliable distortion correction;
- physiological and motion-management capability.

These values SHALL reside in the acquisition-profile release.

They SHALL NOT be treated as universal biological thresholds.

---

# 13. ACQUISITION METADATA

The system SHALL capture, where available:

```text
scanner manufacturer
scanner model
field strength
software version
head coil
sequence name
TR
TE
echo spacing
flip angle
voxel dimensions
slice count
multiband factor
phase-encoding direction
distortion-correction acquisition
number of runs
number of volumes
echo count
acquisition duration
resting-state instruction
```

The acquisition profile SHALL be immutable after processing.

---

# 14. RESTING-STATE INSTRUCTION

The exact resting-state instruction SHALL be recorded.

Examples:

```text
eyes open
eyes closed
fixation
naturalistic rest
```

Different resting-state instructions SHALL NOT be silently pooled as identical acquisitions.

The instruction forms part of scientific provenance.

---

# 15. STRUCTURAL MRI PROCESSING

Structural processing SHALL establish the anatomical reference required for functional localisation.

Canonical sequence:

```text
T1
 ↓
metadata validation
 ↓
intensity processing
 ↓
bias correction
 ↓
brain extraction
 ↓
tissue segmentation
 ↓
surface reconstruction
 ↓
native-space anatomical reference
 ↓
standard-space transform
 ↓
QC
```

The system SHALL preserve:

- native anatomical image;
- reconstructed surfaces;
- segmentation;
- transform matrices/warps;
- standard-space representation;
- QC outputs.

---

# 16. SUBJECT-NATIVE SPACE FIRST

Functional localisation SHALL be established primarily in subject-native anatomical space.

Standard-space coordinates are derived representations.

MAGNIOM SHALL NOT assume that:

```text
MNI coordinate = biological target
```

A target represented as:

```text
[-32, 44, 34]
```

must retain:

- coordinate space;
- template;
- orientation;
- transform;
- hemisphere;
- precision;
- source measurement.

---

# 17. LATERALITY INVARIANT

Laterality SHALL be a hard validation requirement.

The pipeline SHALL automatically inspect:

```text
DICOM orientation
RAS/LPS conventions
hemisphere labels
surface correspondence
registration direction
coordinate transforms
```

A left/right inversion is a critical scientific failure.

No downstream target candidate may be generated from a run that fails the laterality invariant.

The v2 architecture explicitly preserves laterality as a cross-object consistency requirement.

---

# 18. FUNCTIONAL IMAGE PREPROCESSING

Canonical flow:

```text
BIDS BOLD
   ↓
metadata validation
   ↓
distortion correction
   ↓
motion correction
   ↓
multi-echo combination
   ↓
denoising
   ↓
nuisance modelling
   ↓
censoring
   ↓
registration
   ↓
surface projection
   ↓
parcellation
   ↓
functional connectivity
```

Where multi-echo data are unavailable, the pipeline SHALL use the validated single-echo pathway rather than silently applying a multi-echo assumption.

---

# 19. MULTI-ECHO DENOISING

Where multi-echo acquisition is available, the preferred clinical denoising pathway is:

# ME-ICA

The pipeline SHALL preserve:

- echo-specific data;
- echo combination;
- ICA components;
- component classification;
- denoising manifest;
- post-denoising QC.

Denoising decisions SHALL be deterministic for a frozen pipeline release.

---

# 20. PRIMARY DENOISING PROFILE

The canonical clinical denoising profile retains:

```text
ME-ICA
+
polynomial detrending
+
24-parameter motion model
+
WM nuisance
+
ventricular/CSF nuisance
+
GSR
+
censoring
+
validated temporal filtering
```

The v1.1 default frequency range remains approximately:

```text
0.009–0.08 Hz
```

where compatible with the validated acquisition and processing profile.

The exact implementation SHALL be encoded in the pipeline manifest.

---

# 21. GLOBAL SIGNAL REGRESSION

Global signal regression SHALL be treated as a versioned scientific choice.

Primary Clinical Pipeline:

```text
CD-1
GSR included
```

Sensitivity Pipeline:

```text
SD-1
GSR excluded
```

GSR SHALL NOT be interpreted as automatically producing:

```text
pathological anticorrelation
```

Differences between GSR and non-GSR analyses SHALL be treated as pipeline sensitivity.

---

# 22. MOTION

Motion is a first-class scientific variable.

The pipeline SHALL calculate at minimum:

```text
framewise displacement
motion parameters
censored volumes
retained volumes
percentage censored
maximum displacement
run-level motion summary
```

Where appropriate, additional measures may include:

```text
DVARS
echo-specific motion effects
motion–FC associations
```

Motion SHALL affect capability qualification.

A visually clean brain image does not imply valid functional connectivity.

---

# 23. MOTION THRESHOLDS

Numerical thresholds SHALL be version-controlled within the Scientific Policy / Acquisition Profile.

They SHALL NOT be hidden in source code.

Example configuration:

```yaml
rsfmri:
  maximum_framewise_displacement: <validated_value>
  maximum_censored_fraction: <validated_value>
  minimum_retained_minutes: <validated_value>
```

Changing a threshold constitutes a scientific configuration change.

---

# 24. CENSORING

Censoring SHALL be explicit.

The pipeline SHALL record:

```text
original volumes
censored volumes
retained volumes
censoring rule
censoring mask
```

The system SHALL never report only:

```text
15 minutes acquired
```

when the scientifically usable duration is materially shorter.

---

# 25. REGISTRATION

Functional data SHALL be registered to the subject's anatomical reference.

The pipeline SHALL preserve:

```text
BOLD → T1 transform
T1 → standard-space transform
surface mapping transform
inverse transforms
registration QC
```

Registration SHALL be evaluated independently of target localisation.

---

# 26. SURFACE REPRESENTATION

Where the validated pipeline supports cortical surface projection, the preferred representation is:

```text
subject-native surface
        ↓
registered cortical surface
        ↓
surface functional measurement
```

Surface projection SHALL retain:

- hemisphere;
- surface template;
- vertex identifier;
- surface coordinate;
- anatomical correspondence;
- transformation metadata.

A vertex coordinate SHALL never be presented as if it were inherently more biologically precise than the measurement warrants.

---

# 27. PARCELLATION

The canonical v1.1 cortical parcellation remains:

# HCP-MMP1.0

unless an indication-specific validated release explicitly specifies another atlas.

The system SHALL store:

```text
atlas name
atlas version
parcel identifier
parcel name
hemisphere
mapping method
surface/volume correspondence
```

Atlas boundaries are analytical constructs and SHALL NOT be treated as exact biological boundaries.

---

# 28. FUNCTIONAL CONNECTIVITY

The primary FC measure remains:

```text
Pearson correlation
```

transformed using:

```text
Fisher z
```

The system SHALL preserve:

```text
run 1 matrix
run 2 matrix
combined matrix
```

where applicable.

The complete matrix SHALL be an immutable scientific artifact.

---

# 29. CONNECTIVITY OBJECT

```ts
interface FunctionalConnectivityMeasurement {
  id: UUID;

  case_id: UUID;
  processing_run_id: UUID;

  atlas_id: UUID;
  atlas_version: string;

  metric:
    | "pearson_r"
    | "fisher_z"
    | string;

  matrix_artifact_id: UUID;

  node_timeseries_artifact_id?: UUID;

  run_scope:
    | "run_1"
    | "run_2"
    | "combined";

  preprocessing_profile_id: UUID;

  qc_status:
    | "pass"
    | "conditional"
    | "fail";

  provenance: Provenance;
}
```

---

# 30. THERAPEUTIC CIRCUIT MEASUREMENT

MAGNIOM SHALL not treat the full connectivity matrix as equally clinically meaningful.

The Evidence Knowledge Graph defines therapeutic circuits.

The functional-connectomics pipeline measures how the patient expresses those predefined circuits.

Canonical flow:

```text
Evidence
   ↓
TherapeuticCircuit
   ↓
TargetFamily
   ↓
Circuit measurement
   ↓
patient-specific connectivity
```

This preserves the principle that patient imaging enters after the evidence path.

---

# 31. CIRCUIT MAPS

Every therapeutic-circuit map SHALL have:

```text
circuit_id
version
source evidence
atlas
seed definition
target definition
connectivity metric
spatial representation
transformation method
SHA256
validation status
```

A circuit map SHALL never be silently changed.

A changed map creates:

```text
new circuit-map version
```

and therefore potentially:

```text
new ProcessingRun
new CandidateFeatureSet
new Target Slate
```

---

# 32. CIRCUIT SEED DEFINITION

A seed SHALL specify:

- anatomical location;
- atlas;
- parcel or surface region;
- hemisphere;
- radius where applicable;
- smoothing assumptions;
- coordinate space;
- transform;
- connectivity metric.

A seed SHALL NOT be represented only as:

```text
DLPFC
```

or:

```text
sgACC
```

without a formal definition.

---

# 33. SGACC CONNECTIVITY

For MDD-compatible pipelines, sgACC-related connectivity remains a key therapeutic-circuit measurement.

However:

```text
sgACC connectivity
```

is a therapeutic-circuit feature.

It is not:

```text
the entire target-selection algorithm.
```

The pipeline SHALL permit other evidence-supported therapeutic circuits.

It SHALL not reduce MDD targeting to:

```text
find the DLPFC point most anti-correlated with sgACC
```

unless a future indication-specific validated model explicitly defines such a transformation.

---

# 34. PATIENT-SPECIFIC FUNCTIONAL LOCALISATION

Patient-specific localisation SHALL be constrained by an evidence-defined TargetFamily.

Canonical flow:

```text
TargetFamily
      ↓
approved search space
      ↓
patient FC measurement
      ↓
candidate functional map
      ↓
local maxima / stable clusters
      ↓
cross-run reproducibility
      ↓
reliability qualification
```

The pipeline SHALL NOT perform:

```text
whole-brain argmax connectivity
```

for Clinical Mode target generation.

---

# 35. SEARCH SPACE CONSTRAINT

Every clinical patient-specific functional search SHALL have:

```text
TargetFamily ROI
+
therapeutic circuit definition
+
anatomical constraints
+
hemisphere constraints
```

The system SHALL document the search space.

A result outside the approved search space SHALL be:

```text
not a clinical candidate
```

unless a separate scientific policy permits it.

---

# 36. CLUSTER-BASED LOCALISATION

MAGNIOM SHALL prefer stable spatial clusters over isolated extrema.

The pipeline SHOULD therefore compute:

```text
local peak
cluster extent
cluster centre
cluster stability
cluster dispersion
```

rather than relying solely on:

```text
single highest-connectivity vertex
```

A one-vertex maximum is not inherently a superior target.

---

# 37. TARGET LOCALISATION OUTPUT

```ts
interface FunctionalLocalisation {
  id: UUID;

  target_family_id: UUID;

  circuit_id: UUID;

  hemisphere: "left" | "right" | "bilateral";

  peak_coordinate?: SpatialCoordinate;

  cluster_centre?: SpatialCoordinate;

  cluster_artifact_id?: UUID;

  search_space_id: UUID;

  localisation_method: string;
  method_version: string;

  run_id: UUID;

  spatial_uncertainty?: SpatialRegion;

  reliability_profile_id?: UUID;
}
```

---

# 38. CROSS-RUN REPRODUCIBILITY

Where two independent rs-fMRI runs exist, localisation SHALL be assessed independently.

At minimum:

```text
run 1 target
run 2 target
cross-run distance
```

The system SHOULD additionally calculate:

```text
cluster overlap
Dice coefficient
Jaccard similarity
spatial confidence region
```

where scientifically appropriate.

---

# 39. SPLIT-HALF ANALYSIS

Where sufficient data permit, MAGNIOM SHALL support:

```text
half A
half B
```

functional localisation.

The resulting:

```text
split-half target distance
```

shall be treated as a localisation-reproducibility measure.

It SHALL NOT be converted into an arbitrary:

```text
precision = 93%
```

unless a validated reference framework exists.

---

# 40. RELIABILITY MODEL

v1.1 retains the core reliability principle:

```text
R = min(
  data/QC reliability,
  spatial reliability,
  connectivity reliability
)
```

with additional sensitivity analysis where available.

The reliability profile SHALL include:

```text
data/QC
spatial stability
connectivity stability
pipeline sensitivity
atlas sensitivity
```

---

# 41. RELIABILITY OBJECT

```ts
interface TargetReliabilityProfile {
  id: UUID;

  target_localisation_id: UUID;

  qc_status:
    | "pass"
    | "conditional"
    | "fail";

  data_quality: ReliabilityMeasure[];
  spatial_reliability: ReliabilityMeasure[];
  connectivity_reliability: ReliabilityMeasure[];
  pipeline_sensitivity: ReliabilityMeasure[];
  atlas_sensitivity?: ReliabilityMeasure[];

  split_half_distance_mm?: number;
  cross_run_distance_mm?: number;

  cluster_dice?: number;
  cluster_jaccard?: number;

  reliability_class:
    | "high"
    | "moderate"
    | "low"
    | "unreliable"
    | "not_assessable";

  limiting_factors: string[];

  interpretation: string;

  pipeline_version_id: UUID;
}
```

---

# 42. RELIABILITY IS CAPABILITY-SPECIFIC

The same dataset may be:

```text
qualified for:
    broad circuit measurement
```

but:

```text
not qualified for:
    millimetre-level personalised localisation
```

For example:

```text
FC measurement       Qualified
Circuit measurement  Qualified
Network context      Qualified
Patient target       Not qualified
```

This is preferable to a single:

```text
overall reliability = 78%
```

The v2 architecture explicitly adopts this capability-specific approach.

---

# 43. PIPELINE SENSITIVITY

The pipeline SHALL support scientifically justified sensitivity analyses.

For rs-fMRI, potential sensitivity dimensions include:

```text
GSR vs no GSR
denoising model
motion threshold
censoring
smoothing
temporal filtering
registration
atlas
run selection
```

Sensitivity analyses exist to answer:

> How dependent is the functional localisation on reasonable analytical choices?

They SHALL NOT answer:

> Which preprocessing produces the target we prefer?

---

# 44. NO P-HACKING THROUGH PIPELINE SELECTION

Prohibited:

```text
Pipeline A → target X
Pipeline B → target Y
Pipeline C → target Z

choose pipeline B because Y looks clinically desirable
```

The primary pipeline SHALL be established prospectively.

Sensitivity pipelines SHALL be used to quantify robustness.

---

# 45. PREPROCESSING SENSITIVITY OUTPUT

```ts
interface PipelineSensitivityResult {
  baseline_pipeline_id: UUID;

  comparison_pipeline_id: UUID;

  target_distance_mm?: number;

  cluster_overlap?: number;

  circuit_measurement_difference?: number;

  network_measurement_difference?: number;

  reliability_impact:
    | "none"
    | "minor"
    | "material"
    | "major";

  interpretation: string;
}
```

---

# 46. NORMATIVE FUNCTIONAL CONNECTIVITY

Normative modelling MAY provide contextual information about patient-specific FC.

It SHALL require:

```text
population definition
+
acquisition compatibility
+
preprocessing compatibility
+
atlas compatibility
+
model version
+
validation scope
```

The v2 architecture explicitly requires these compatibility attributes before normative models are treated as compatible.

---

# 47. NORMATIVE DEVIATION

A normative deviation may be represented as:

```text
feature
+
reference distribution
+
patient value
+
standardised deviation
+
model compatibility
```

For example:

```text
patient FC
      ↓
normative model
      ↓
standardised deviation
```

The system SHALL NOT automatically interpret:

```text
>3 SD
```

as:

```text
clinical target
```

A 3-SD deviation may be useful exploratory context without being a therapeutic target.

---

# 48. NORMATIVE MODEL OBJECT

```ts
interface NormativeFCContext {
  normative_model_id: UUID;

  feature_id: UUID;

  patient_value: number;

  reference_value?: number;

  standardized_deviation?: number;

  percentile?: number;

  population_scope: PopulationDefinition;

  compatibility_status:
    | "compatible"
    | "conditionally_compatible"
    | "incompatible";

  interpretation:
    | "contextual"
    | "qualified"
    | "research";
}
```

---

# 49. TRIPLE-NETWORK ANALYSIS

The pipeline SHALL add a dedicated processing stage:

```text
CIRCUIT ANALYSIS
      ↓
TRIPLE-NETWORK ANALYSIS
      ↓
TARGET RELIABILITY
```

This stage SHALL calculate, where qualified:

### Within-network

```text
CEN integrity
DMN integrity
SN integrity
```

### Between-network

```text
CEN ↔ DMN
SN ↔ CEN
SN ↔ DMN
```

### Global network organisation

```text
integration
segregation
```

---

# 50. NETWORK METRICS

Potential static metrics include:

```text
within-network mean connectivity
within-network variance
network-to-network mean connectivity
network segregation
network integration
participation coefficient
modularity-related measures
```

Exact metrics SHALL be versioned.

No metric enters Clinical Mode merely because it can be calculated.

---

# 51. NETWORK RELIABILITY

Triple-Network metrics SHALL have their own reliability assessment.

Examples:

```text
CEN within-network reliability
DMN within-network reliability
SN within-network reliability

CEN-DMN coupling reliability
SN-CEN coupling reliability
SN-DMN coupling reliability
```

A reliable CEN metric does not imply a reliable CEN-DMN coupling estimate.

---

# 52. TRIPLE-NETWORK RELIABILITY OBJECT

```ts
interface NetworkReliabilityProfile {
  network_or_relationship_id: UUID;

  within_run_reliability?: ReliabilityMeasure[];
  cross_run_reliability?: ReliabilityMeasure[];
  split_half_reliability?: ReliabilityMeasure[];

  pipeline_sensitivity?: ReliabilityMeasure[];

  reliability_class:
    | "high"
    | "moderate"
    | "low"
    | "unreliable"
    | "not_assessable";

  limiting_factors: string[];
}
```

---

# 53. STATIC VERSUS DYNAMIC NETWORK ANALYSIS

v1.1 SHALL distinguish:

```text
static FC
```

from:

```text
dynamic FC
```

Dynamic functional connectivity may include:

```text
state transitions
dwell time
network switching
time-varying coupling
```

However:

# Dynamic Triple-Network analysis is Research Mode by default.

It SHALL NOT influence Clinical target ranking until separately validated.

---

# 54. NETWORK INTERPRETATION

The pipeline may produce descriptive statements such as:

> CEN–DMN coupling differs from the compatible normative reference.

or:

> The patient's CEN–DMN relationship was reproducible across independent runs.

It SHALL NOT automatically produce:

> This abnormality causes the patient's depression.

Nor:

> Stimulating CEN will normalise the patient's Triple Network.

---

# 55. TRIPLE-NETWORK ROLE IN TARGETING

The Triple-Network layer SHALL be available to the Target Engine as:

```text
context
+
convergence evidence
+
explanation
+
uncertainty
```

It SHALL NOT initially be used as an independent scoring axis.

Therefore:

```text
TargetScore =
    Evidence
  + Phenotype
  + FC
  + TripleNetwork
```

is PROHIBITED.

Instead:

```text
Evidence
    ↓
eligibility

Phenotype
    ↓
clinical relevance

Therapeutic circuit
    ↓
candidate generation

Patient FC
    ↓
patient-specific refinement

Triple-Network profile
    ↓
network context / convergence

Reliability
    ↓
confidence

Anatomy / E-field
    ↓
stimulability

Target Engine
    ↓
candidate ranking
```

---

# 56. NETWORK CONTEXT AT TARGET LEVEL

Every qualified patient-specific target MAY carry:

```ts
interface TargetNetworkContext {
  target_candidate_id: UUID;

  cen_relationship?: NetworkRelationshipSummary;
  dmn_relationship?: NetworkRelationshipSummary;
  sn_relationship?: NetworkRelationshipSummary;

  cen_dmn_relationship?: NetworkRelationshipSummary;
  sn_cen_relationship?: NetworkRelationshipSummary;
  sn_dmn_relationship?: NetworkRelationshipSummary;

  overall_interpretation:
    | "supportive"
    | "neutral"
    | "contradictory"
    | "uncertain";

  clinical_role:
    | "contextual"
    | "qualified"
    | "research";
}
```

---

# 57. EXAMPLE TARGET NETWORK CONTEXT

The clinician-facing representation may be:

```text
NETWORK CONTEXT

CEN       Strong relevance
DMN       Moderate relevance
SN        Contextual

CEN ↔ DMN       Altered
SN ↔ CEN        Within reference
SN ↔ DMN        Altered

INTERPRETATION

This target belongs to a therapeutic circuit whose
connectivity intersects the patient's CEN–DMN
network configuration.

Network findings are contextual and do not
independently establish target superiority.
```

---

# 58. FUNCTIONAL CONNECTOMICS AND PERSONALISATION

Personalisation is permitted only when:

1. the target family is evidence-supported;
2. the search space is predefined;
3. the functional data pass QC;
4. the functional localisation is sufficiently reproducible;
5. the patient-specific result adds meaningful information;
6. the resulting target remains anatomically accessible;
7. the displacement remains within the applicable evidence-transfer policy;
8. there is no major scientific contradiction.

Otherwise:

```text
evidence-defined target
```

remains the baseline.

---

# 59. PERSONALISATION IS NOT AUTOMATICALLY SUPERIOR

The pipeline SHALL never encode:

```text
individualised = better
```

The existence of an individual functional peak is not itself evidence of clinical superiority.

The v2 Target Engine architecture explicitly retains this distinction and requires a validated scientific basis before patient-specific measurements can displace evidence-defined baselines.

---

# 60. COUNTERFACTUAL ANALYSIS

For compatible targeting modules, the pipeline SHALL support comparison between:

```text
evidence-defined baseline
```

and:

```text
patient-specific functional refinement
```

The measurement system may report:

```text
baseline coordinate
personalised coordinate
distance
functional concordance
reliability
```

It SHALL NOT state:

```text
personalised target will work better
```

unless that inference belongs to a separately validated clinical model.

---

# 61. COORDINATE UNCERTAINTY

Every functional target coordinate SHALL have an associated uncertainty representation where feasible.

Possible forms:

```text
confidence region
cluster extent
cross-run dispersion
split-half dispersion
```

The system SHALL avoid false precision.

If the localisation varies by:

```text
10–15 mm
```

the interface SHALL not imply that:

```text
coordinate = ±1 mm
```

simply because the software stores coordinates to three decimal places.

---

# 62. SPATIAL PRECISION VERSUS BIOLOGICAL RELIABILITY

MAGNIOM SHALL explicitly distinguish:

```text
numerical coordinate precision
```

from:

```text
spatial localisation reliability
```

For example:

```text
x = -32.413
y = 44.821
z = 33.127
```

does not imply:

```text
biological target precision = 0.001 mm
```

---

# 63. E-FIELD INTERFACE

Where an E-field service is available, the rs-fMRI pipeline SHALL provide:

```text
candidate coordinate
subject-native anatomy
surface geometry
target orientation context
```

The E-field service SHALL return:

```text
field magnitude
field orientation
coverage
coil pose assumptions
```

The rs-fMRI pipeline SHALL NOT determine whether the E-field result is clinically acceptable.

That remains the Target Engine / clinical decision layer.

---

# 64. ANATOMICAL ACCESSIBILITY

Functional localisation SHALL be cross-checked against:

```text
cortical anatomy
sulcal geometry
surface topology
hemisphere
depth
structural abnormalities
```

A functionally reproducible point that cannot be appropriately stimulated remains:

```text
measurement-valid
target-ineligible
```

These are distinct states.

---

# 65. LESION / STRUCTURAL DISTORTION INTERFACE

If structural abnormalities exist, the functional pipeline SHALL recognise that:

```text
registration
surface reconstruction
parcellation
functional correspondence
```

may become less reliable.

For major structural distortion:

```text
standard template assumptions
```

must not silently dominate the analysis.

The broader v2 architecture explicitly requires native-space-first lesion representation and warns against reliance solely on warped template-space lesions when major distortion exists.

---

# 66. MULTIMODAL DISAGREEMENT

The rs-fMRI pipeline SHALL preserve disagreement with other modalities.

Examples:

```text
rs-fMRI localisation
        ≠
task-fMRI localisation
```

or:

```text
functional target
        ≠
motor hotspot
```

or:

```text
functional network estimate
        ≠
structural connectivity estimate
```

The measurement layer SHALL preserve both observations.

It SHALL NOT automatically average them.

The broader v2 architecture explicitly prohibits hidden multimodal fusion.

---

# 67. NO HIDDEN MULTIMODAL FUSION

Prohibited:

```text
T1
+
rs-fMRI
+
DWI
+
task fMRI
        ↓
secret fused coordinate
```

unless a separately versioned and validated scientific model defines the transformation.

Fusion is an algorithm.

Therefore:

```text
fusion
```

must be visible, versioned and testable.

It SHALL NOT be hidden inside preprocessing.

---

# 68. MEASUREMENT BUNDLE

The pipeline SHALL produce a versioned:

# Functional Connectomics Measurement Bundle

containing:

```text
Structural reference
BOLD acquisition
Processing Run
QC
FC matrices
Therapeutic circuit measurements
Functional localisation
Reliability
Normative context
Triple-Network Profile
Pipeline sensitivity
Capability qualification
Provenance
```

The bundle is a snapshot.

A subsequent scan SHALL produce:

```text
new MeasurementBundle
```

rather than modifying the old bundle.

---

# 69. FUNCTIONAL MEASUREMENT BUNDLE

```ts
interface FunctionalConnectomicsBundle {
  id: UUID;

  case_id: UUID;

  structural_measurement_id: UUID;

  bold_measurement_ids: UUID[];

  processing_run_ids: UUID[];

  connectivity_measurement_ids: UUID[];

  circuit_measurement_ids: UUID[];

  localisation_ids: UUID[];

  reliability_profile_ids: UUID[];

  normative_context_ids?: UUID[];

  triple_network_profile_id?: UUID;

  sensitivity_result_ids?: UUID[];

  capability_qualifications: CapabilityQualification[];

  pipeline_release_id: UUID;

  manifest_sha256: SHA256;

  status:
    | "processing"
    | "qualified"
    | "qualified_with_limits"
    | "not_qualified"
    | "research_only";
}
```

---

# 70. CAPABILITY QUALIFICATION

The final status SHALL distinguish:

```text
qualified
qualified_with_limits
not_qualified
research_only
not_assessable
```

The existence of a processed FC matrix is not sufficient.

Example:

```text
Structural localisation          Qualified
FC measurement                   Qualified
Triple-Network context           Qualified
Circuit measurement              Qualified
Individual FC refinement         Not qualified
Dynamic FC                       Research only
```

---

# 71. CAPABILITY MATRIX

The v1.1 capability matrix SHOULD include:

| Capability | Possible status |
|---|---|
| Anatomical registration | Qualified / limited / failed |
| Resting-state FC | Qualified / limited / failed |
| Therapeutic circuit measurement | Qualified / limited / failed |
| Triple-Network context | Qualified / limited / research |
| Patient-specific localisation | Qualified / limited / failed |
| Normative FC context | Qualified / limited / research |
| Dynamic FC | Research only by default |
| Whole-brain exploratory analysis | Research |
| E-field coupling | Separate provider |

---

# 72. CLINICAL MODE GATE

Clinical Mode SHALL use only:

```text
approved pipeline release
+
compatible acquisition profile
+
passed QC
+
required reliability
+
approved indication module
+
approved scientific policy
```

A research output SHALL never enter Clinical Mode because a developer enabled a feature flag.

---

# 73. RESEARCH MODE

Research Mode may expose:

```text
alternative preprocessing
dynamic FC
novel network definitions
alternative atlases
whole-brain exploratory maps
novel circuit maps
alternative normative models
experimental network metrics
multimodal fusion experiments
```

Every output SHALL be explicitly tagged:

```text
mode = research
```

No Research result influences Clinical target generation without formal promotion.

---

# 74. RESEARCH-TO-CLINICAL PROMOTION

The promotion pathway is:

```text
Research implementation
        ↓
technical verification
        ↓
measurement reliability
        ↓
indication-specific retrospective validation
        ↓
prospective/silent validation where required
        ↓
Scientific Policy approval
        ↓
Clinical capability
```

No shortcut SHALL be permitted.

The v2 measurement architecture uses this same promotion principle.

---

# 75. PROCESSING RUN

Every scientific execution SHALL create an immutable ProcessingRun.

```ts
interface ProcessingRun {
  id: UUID;

  case_id: UUID;

  modality: "resting_state_fmri";

  pipeline_version_id: UUID;

  acquisition_profile_id: UUID;

  input_artifact_ids: UUID[];

  configuration_sha256: SHA256;

  container_digest_sha256: SHA256;

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

The broader v2 architecture retains the immutable ProcessingRun contract.

---

# 76. IMMUTABILITY

Completed scientific runs SHALL never be overwritten.

If:

```text
denoising changes
```

then:

```text
new ProcessingRun
```

If:

```text
atlas changes
```

then:

```text
new ProcessingRun
```

If:

```text
circuit map changes
```

then:

```text
new scientific output version
```

Historical results remain reconstructable.

---

# 77. DETERMINISM

For identical:

```text
input artifacts
+
pipeline release
+
container digest
+
configuration
+
atlas
+
circuit maps
```

MAGNIOM SHALL produce identical scientific outputs within defined numerical reproducibility tolerances.

The system SHALL not use:

```text
random seeds without explicit control
current time
internet retrieval
LLM interpretation
```

in deterministic target-localisation calculations.

---

# 78. CONTAINERISATION

The rs-fMRI pipeline SHOULD run in a frozen scientific container.

Example:

```text
magniom-rsfmri:<release>
```

Clinical runs SHALL reference:

```text
immutable container digest
```

not:

```text
latest
```

or an unpinned tag.

The v2 architecture explicitly requires immutable container references for clinical scientific runs.

---

# 79. PIPELINE MANIFEST

Every run SHALL have a manifest containing:

```text
MAGNIOM pipeline version
container digest
software versions
external tool versions
acquisition profile
preprocessing profile
atlas
surface template
circuit maps
normative models
motion thresholds
censoring rules
filtering
smoothing
GSR status
random seeds
hardware/software environment
input hashes
output hashes
```

The manifest SHALL be cryptographically hashed.

---

# 80. EXTERNAL SOFTWARE

Updates to:

```text
fMRIPrep
AFNI
FSL
FreeSurfer
ANTs
MRtrix
Python
NumPy
SciPy
PyTorch
CUDA
```

or any other scientifically relevant dependency SHALL undergo change-impact assessment if they can alter scientific outputs.

An external dependency update SHALL NOT automatically enter Clinical Mode.

---

# 81. ACQUISITION CHANGE CONTROL

Changes to:

```text
scanner
scanner software
gradient hardware
coil
sequence
TR
TE
voxel size
multiband
phase encoding
resting-state instruction
```

may materially alter the measurement.

Such changes SHALL trigger:

```text
acquisition compatibility review
```

and, where necessary:

```text
site qualification
```

The broader v2 specification explicitly identifies scanner/software/hardware/sequence changes as requiring change-impact assessment.

---

# 82. SITE QUALIFICATION

Clinical imaging sites SHOULD be qualified using:

```text
scanner identity
software version
head coil
sequence parameters
phantom measurements where appropriate
test acquisition
processing compatibility
```

Site qualification SHALL be versioned.

---

# 83. DATA INGESTION

Canonical flow:

```text
DICOM
 ↓
secure upload
 ↓
artifact registration
 ↓
identity verification
 ↓
DICOM metadata validation
 ↓
BIDS conversion
 ↓
BIDS validation
 ↓
processing queue
```

Patient identifiers SHALL not be passed through scientific compute queues where unnecessary.

---

# 84. IDENTITY VALIDATION

Before processing, the system SHALL verify:

```text
case identity
study identity
series identity
modality
laterality where applicable
acquisition completeness
```

Mis-associated patient data is a critical failure.

No scientific processing SHALL proceed when identity association is uncertain.

---

# 85. BIDS VALIDATION

BIDS conversion SHALL validate:

```text
subject
session
task/rest label
run
echo
phase encoding
TR
TE
slice timing
intended-for relationships
fieldmaps
```

Invalid BIDS structure SHALL stop the pipeline or place the run into an explicitly limited state.

---

# 86. QUALITY CONTROL

QC SHALL occur at multiple levels:

```text
Level 1 — acquisition
Level 2 — preprocessing
Level 3 — registration
Level 4 — anatomical/surface
Level 5 — BOLD
Level 6 — connectivity
Level 7 — localisation
Level 8 — reliability
Level 9 — capability
```

Passing one level does not imply passing all levels.

---

# 87. QC REPORT

The v1.1 report SHALL contain:

```text
Acquisition
Processing
Motion
Distortion
Registration
Surface reconstruction
BOLD quality
Denoising
Censoring
Connectivity
Circuit measurements
Triple-Network measurements
Reliability
Sensitivity
Normative compatibility
Capability qualification
Limitations
```

---

# 88. CLINICIAN-FACING QUALITY LANGUAGE

Preferred:

> Resting-state connectivity measurement qualified.

> Patient-specific functional localisation qualified with limitations.

> Cross-run localisation was stable within the validated range.

> Functional localisation was not sufficiently reproducible for patient-specific target refinement.

Avoid:

> Good brain scan.

> Excellent brain.

> High-confidence target.

> Brain abnormality score: 91%.

---

# 89. FAILURE STATES

Canonical failures include:

```text
IDENTITY_MISMATCH
ORIENTATION_FAILURE
LATERALITY_FAILURE
BIDS_VALIDATION_FAILURE
STRUCTURAL_PROCESSING_FAILURE
SURFACE_RECONSTRUCTION_FAILURE
BOLD_QC_FAILURE
EXCESSIVE_MOTION
INSUFFICIENT_RETAINED_DATA
REGISTRATION_FAILURE
CONNECTIVITY_FAILURE
CIRCUIT_MAP_INCOMPATIBLE
NORMATIVE_MODEL_INCOMPATIBLE
TARGET_LOCALISATION_UNSTABLE
TRIPLE_NETWORK_UNRELIABLE
PIPELINE_SENSITIVITY_MATERIAL
CAPABILITY_NOT_QUALIFIED
```

Failures SHALL be explicit.

---

# 90. FALLBACK BEHAVIOUR

If individual FC localisation is not qualified:

```text
disable patient-specific FC refinement
```

but, where permitted:

```text
retain evidence-defined target baseline
```

If Triple-Network analysis fails:

```text
disable network context
```

without automatically invalidating a separately qualified therapeutic-circuit measurement.

If normative modelling fails:

```text
remove normative context
```

without corrupting the underlying patient FC measurement.

---

# 91. ABSTENTION

The pipeline SHALL support explicit abstention.

Examples:

```text
Individual FC refinement unavailable
```

or:

```text
Functional localisation not sufficiently reproducible
```

or:

```text
Triple-Network measurement not reliable enough for interpretation
```

Abstention is preferable to fabricated precision.

---

# 92. TARGET ENGINE INTERFACE

The rs-fMRI provider SHALL expose structured measurements, not recommendations.

Conceptually:

```ts
interface FunctionalConnectomicsProvider {
  getMeasurementBundle(
    caseId: UUID
  ): FunctionalConnectomicsBundle;

  getCircuitMeasurement(
    caseId: UUID,
    circuitId: UUID
  ): CircuitMeasurement;

  getFunctionalLocalisation(
    caseId: UUID,
    targetFamilyId: UUID
  ): FunctionalLocalisation;

  getTripleNetworkProfile(
    caseId: UUID
  ): TripleNetworkProfile;

  getReliability(
    measurementId: UUID
  ): TargetReliabilityProfile;
}
```

The provider SHALL NOT expose:

```ts
getBestTarget()
```

---

# 93. TARGET ENGINE CONSUMPTION

The Target Engine may consume:

```text
functional localisation
circuit concordance
FC measurement
network context
normative context
reliability
spatial uncertainty
```

The Target Engine determines whether these measurements are permitted to influence:

```text
candidate generation
ranking
personalisation
explanation
```

---

# 94. EVIDENCE CEILING

The functional pipeline SHALL carry evidence provenance but SHALL NOT elevate evidence.

If a target family has:

```text
Evidence Class B
```

then excellent patient FC cannot transform it into:

```text
Evidence Class A
```

Likewise:

```text
highly reproducible FC
```

does not establish:

```text
clinical efficacy.
```

---

# 95. TRIPLE-NETWORK EVIDENCE CEILING

Triple-Network evidence SHALL be represented at distinct levels.

### A — Network association

```text
MDD is associated with altered CEN/DMN/SN organisation.
```

### B — Network-linked therapeutic circuit

```text
A supported target engages a network configuration.
```

### C — Prospective targeting evidence

```text
A network-linked patient-specific feature has prospectively supported targeting value.
```

### D — Mechanistic evidence

```text
Modifying the network relationship contributes causally to outcome.
```

### R — Research hypothesis

```text
Exploratory patient-specific network configuration.
```

The pipeline SHALL not convert:

```text
A
```

into:

```text
C
```

through computation alone.

---

# 96. NO NETWORK-BASED AUTONOMOUS TARGET GENERATION

The following are prohibited in Clinical Mode:

```text
CEN abnormality → CEN stimulation target
```

```text
DMN abnormality → DMN suppression target
```

```text
SN abnormality → SN target
```

```text
CEN–DMN dysconnectivity → choose CEN coordinate
```

unless a separately validated Targeting Module explicitly establishes the evidence path.

---

# 97. NETWORK CONVERGENCE

Triple-Network information may contribute to convergence.

For example:

```text
Evidence-supported DLPFC circuit
        +
patient FC concordance
        +
CEN–DMN contextual concordance
        +
high localisation reliability
```

may constitute stronger explanatory convergence than any individual measurement.

But convergence SHALL not be interpreted as proof of efficacy.

---

# 98. NETWORK DISAGREEMENT

The system SHALL also represent contradiction.

Example:

```text
Therapeutic circuit concordance:
strong

Triple-Network contextual relationship:
discordant

FC reliability:
high
```

This should generate:

```text
NETWORK_CONTEXT_CONTRADICTION
```

rather than silently discarding the conflicting result.

---

# 99. WARNING CODES

v1.1 SHALL support:

```text
LOW_TARGET_CONVERGENCE
PERSONALISATION_MAJOR_DIVERGENCE
LIMITED_FC_RELIABILITY
EVIDENCE_CONFLICT
OUTSIDE_STUDY_POPULATION
NORMATIVE_MODEL_LIMITATION
TRIPLE_NETWORK_UNRELIABLE
TRIPLE_NETWORK_RESEARCH_ONLY
NETWORK_CONTEXT_CONTRADICTION
EFIELD_CONDITIONAL
NO_PERSONALISED_TARGET
NO_THIRD_PRIMARY
```

Warnings are information, not automatic treatment conclusions.

---

# 100. OUTPUT ARTIFACTS

A successful clinical-compatible run SHALL produce:

```text
1. BIDS dataset
2. structural reference
3. preprocessed BOLD
4. denoised BOLD
5. QC metrics
6. motion/censoring report
7. surface representation
8. parcellated time series
9. FC matrices
10. therapeutic-circuit maps
11. functional localisation
12. cross-run reliability
13. pipeline sensitivity
14. normative context where qualified
15. Triple-Network Profile
16. Measurement Quality Report
17. Measurement Bundle
18. capability qualification
```

---

# 101. PROVENANCE

Every derived scientific object SHALL be traceable to:

```text
raw acquisition
      ↓
processing run
      ↓
software
      ↓
configuration
      ↓
atlas
      ↓
circuit map
      ↓
measurement
      ↓
reliability
      ↓
capability
```

The clinician must be able to determine:

> Where did this coordinate come from?

---

# 102. HASHING

Where practical, SHA-256 SHALL be used for:

```text
raw inputs
configuration
container
pipeline manifest
atlas
circuit maps
normative models
major output artifacts
```

This permits:

```text
scientific provenance
+
reproducibility
+
change detection
```

---

# 103. SECURITY

Scientific compute SHALL be isolated from direct public internet access wherever practical.

The neuroimaging worker SHALL receive:

```text
artifact IDs
```

rather than unnecessary patient-identifying information.

The worker SHALL not have unrestricted access to the clinical database.

---

# 104. QUEUE ARCHITECTURE

Canonical queue:

```text
imaging_ingest
      ↓
neurocompute
      ↓
fc_reliability
      ↓
triple_network
      ↓
measurement_bundle
```

Queue payloads SHOULD contain identifiers rather than PII.

---

# 105. REPOSITORY ARCHITECTURE

Recommended:

```text
packages/
├── measurement-core/
│   ├── acquisition/
│   ├── preprocessing/
│   ├── qc/
│   ├── reliability/
│   ├── transforms/
│   ├── manifests/
│   └── bundles/
│
├── modalities/
│   └── resting-state/
│       ├── ingestion/
│       ├── preprocessing/
│       ├── connectivity/
│       ├── circuits/
│       ├── triple-network/
│       ├── normative/
│       └── localisation/
│
└── measurement-testkit/
    ├── synthetic/
    ├── known-answer/
    ├── transforms/
    ├── reliability/
    └── golden-cases/
```

This aligns with the broader v2 repository structure for modality-specific measurement providers.

---

# 106. TESTING ARCHITECTURE

Testing SHALL include:

### Unit tests

```text
coordinate transforms
FC calculations
Fisher transformation
cluster detection
network metrics
reliability metrics
```

### Integration tests

```text
DICOM → BIDS
BIDS → preprocessing
preprocessing → FC
FC → circuit
FC → Triple Network
```

### Scientific golden tests

```text
known acquisition
→ known pipeline
→ known outputs
```

### Regression tests

```text
pipeline release A
vs
pipeline release B
```

---

# 107. DETERMINISM TEST

Identical inputs SHALL be processed repeatedly.

Expected:

```text
same pipeline hash
same configuration hash
same output hashes
```

within explicitly defined floating-point tolerances where binary identity is not possible.

---

# 108. TRANSFORM TESTING

Every transformation SHALL have round-trip tests where mathematically applicable:

```text
native → standard → native
BOLD → T1 → BOLD
surface → volume → surface
```

Laterality SHALL be included in automated tests.

---

# 109. SCIENTIFIC PROPERTY TESTS

The pipeline SHALL test invariants such as:

```text
left remains left
right remains right
```

```text
FC matrix is symmetric
```

for symmetric FC measures.

```text
Fisher transform is monotonic
```

```text
coordinate transform preserves known landmarks
```

```text
circuit IDs remain version-consistent
```

```text
failed QC cannot become qualified
```

---

# 110. RELIABILITY TESTS

Known-answer datasets SHALL verify:

```text
cross-run distance
split-half distance
cluster overlap
pipeline sensitivity
reliability class
```

Boundary conditions SHALL be tested explicitly.

---

# 111. TRIPLE-NETWORK TESTS

The Triple-Network implementation SHALL test:

```text
CEN definition
DMN definition
SN definition
```

and:

```text
CEN–DMN relationship
SN–CEN relationship
SN–DMN relationship
```

including:

```text
missing data
partial data
low reliability
atlas mismatch
pipeline mismatch
```

No missing network measurement may silently become:

```text
normal
```

---

# 112. NETWORK DEFINITION VERSIONING TEST

If:

```text
CEN definition v1
```

changes to:

```text
CEN definition v2
```

then the resulting profile SHALL reference:

```text
network_definition_version = v2
```

and shall not overwrite historical v1 measurements.

---

# 113. GOLDEN CASES

MAGNIOM SHOULD maintain representative cases covering:

```text
high-quality MDD rs-fMRI
high-motion case
low-retained-duration case
highly reproducible localisation
poorly reproducible localisation
pipeline-sensitive localisation
strong CEN-DMN alteration
weak Triple-Network reliability
network contradiction
normative-model incompatibility
left/right transform failure
registration failure
```

---

# 114. CLINICAL SAFETY INVARIANTS

The following are hard invariants:

```text
No failed QC measurement influences Clinical Mode.
```

```text
No low-reliability personalised localisation silently replaces baseline.
```

```text
No network abnormality independently creates a target.
```

```text
No patient imaging result creates therapeutic evidence.
```

```text
No coordinate is clinically meaningful without coordinate-space provenance.
```

```text
No completed scientific run is overwritten.
```

```text
No research output silently enters Clinical Mode.
```

---

# 115. HUMAN FACTORS

The clinician interface SHALL distinguish:

```text
Measurement quality
```

from:

```text
Scientific evidence
```

from:

```text
Target Engine preference
```

For example:

> Resting-state functional localisation was highly reproducible.

does NOT mean:

> This target is proven clinically superior.

The v2 measurement architecture explicitly requires this distinction in clinician-facing presentation.

---

# 116. CLINICIAN MEASUREMENT VIEW

The default view SHOULD show:

```text
RESTING-STATE CONNECTOMICS

Acquisition             Qualified
BOLD QC                 Qualified
Functional connectivity Qualified
Therapeutic circuits    Qualified
Triple-Network          Qualified
Patient localisation    Qualified with limitations
Normative context       Available
Dynamic FC              Research only
```

Technical details SHALL be progressively disclosed.

---

# 117. MEASUREMENT DETAIL DRAWER

For each functional measurement, clinicians SHOULD be able to inspect:

```text
Acquisition
Processing
Motion
Denoising
Censoring
Registration
Atlas
Connectivity
Circuit definition
Triple-Network definition
Reliability
Sensitivity
Normative compatibility
Capability impact
Provenance
```

---

# 118. PATIENT-SPECIFIC TARGET VIEW

The functional localisation component SHOULD display:

```text
Evidence-defined family
        ↓
Patient-specific functional refinement
        ↓
Cross-run stability
        ↓
Spatial uncertainty
        ↓
Network context
        ↓
Clinical eligibility
```

Not simply:

```text
Recommended coordinate:
[-32,44,34]
```

---

# 119. EXPLANATION REQUIREMENT

For every patient-specific functional localisation, the system SHALL be able to answer:

### Why was this region examined?

```text
Because it belongs to an evidence-defined TargetFamily.
```

### Why was this point identified?

```text
Because the patient-specific functional measurement
identified a reproducible feature within the approved
search space.
```

### How reliable is it?

```text
Cross-run / split-half / sensitivity analysis.
```

### Why might it be wrong?

```text
Motion / limited data / pipeline sensitivity /
atlas uncertainty / weak reproducibility.
```

---

# 120. "WHY MIGHT THIS BE WRONG?"

Every clinically visible personalised functional result SHALL contain a limitation statement.

Examples:

```text
Why might this be wrong?

Localisation differed between independent runs by
8.7 mm and was moderately sensitive to preprocessing.
```

or:

```text
Why might this be wrong?

Functional localisation was reproducible, but the
patient-specific displacement from the evidence-defined
target exceeds the currently validated transfer range.
```

---

# 121. SCIENTIFIC LIMITATION LANGUAGE

The system SHALL favour:

```text
associated with
consistent with
measured
observed
reproducible
not reproducible
qualified
not qualified
contextual
research
```

and avoid unsupported causal language:

```text
causes
corrects
normalises
proves
guarantees
will respond
```

---

# 122. NO AUTOMATIC THERAPEUTIC INTERPRETATION

The pipeline may establish:

```text
patient-specific FC pattern
```

but SHALL NOT establish:

```text
clinical meaning
```

without an evidence-supported interpretation path.

This distinction is central to MAGNIOM's architecture.

---

# 123. CHANGE MANAGEMENT

A new pipeline release is required for changes to:

```text
preprocessing
denoising
motion thresholds
censoring
registration
smoothing
filtering
atlas
surface template
circuit maps
network definitions
network metrics
normative model
localisation algorithm
reliability algorithm
```

No silent changes.

---

# 124. SCIENTIFIC IMPACT REPORT

For clinically material changes, MAGNIOM SHALL generate an impact report covering:

```text
target displacement
circuit measurement changes
Triple-Network metric changes
reliability changes
capability qualification changes
candidate-set changes
```

The v2 architecture similarly requires scientific impact assessment when processing changes may materially alter localisation or qualification.

---

# 125. BACKWARD COMPATIBILITY

Historical v1.0 runs SHALL remain:

```text
readable
immutable
reproducible
traceable
```

A v1.1 run SHALL NOT masquerade as a v1.0 run.

The system SHALL retain:

```text
pipeline_version
```

for every historical output.

---

# 126. MIGRATION FROM v1.0

Existing v1.0 data MAY be represented within v1.1 using an explicit compatibility layer.

Migration SHALL preserve:

```text
original acquisition
original preprocessing
original FC
original target localisation
original reliability
original circuit maps
original coordinates
```

Triple-Network information SHALL be marked:

```text
not available
```

rather than backfilled retrospectively unless the original data are actually reprocessed.

---

# 127. v1.0 → v1.1 CONCEPTUAL CHANGE

The principal transformation is:

```text
v1.0

Structural MRI
      ↓
rs-fMRI
      ↓
FC
      ↓
therapeutic circuit
      ↓
target localisation
      ↓
reliability
```

becomes:

```text
v1.1

Structural MRI
      ↓
rs-fMRI
      ↓
validated preprocessing
      ↓
FC
      ├───────────────┐
      ↓               ↓
Therapeutic       Triple-Network
Circuit           Systems Layer
      ↓               ↓
patient-specific    network context
localisation          │
      └───────┬───────┘
              ↓
          Reliability
              ↓
       Capability Gate
              ↓
         Target Engine
```

---

# 128. WHAT v1.1 DOES NOT DO

v1.1 SHALL NOT:

- diagnose depression;
- identify psychiatric disease;
- autonomously prescribe TMS;
- choose stimulation frequency;
- choose stimulation intensity;
- choose treatment duration;
- determine treatment response;
- treat network abnormalities as diseases;
- treat CEN/DMN/SN as independent targets by default;
- use whole-brain anomaly detection to generate clinical targets;
- assume hyperconnectivity means inhibitory stimulation;
- assume hypoconnectivity means excitatory stimulation;
- assume individualisation is automatically superior;
- force exactly five targets;
- hide multimodal fusion;
- use unqualified normative deviations as clinical targets;
- allow unstable coordinates to masquerade as precise;
- use research metrics in Clinical Mode without promotion.

---

# 129. CANONICAL PIPELINE

The complete v1.1 clinical-compatible workflow is:

```text
                    RAW MRI
                       │
                       ▼
                INGEST / IDENTITY
                       │
                       ▼
                  BIDS VALIDATE
                       │
                       ▼
              STRUCTURAL PROCESSING
                       │
                       ▼
                 BOLD PREPROCESS
                       │
                       ▼
               MULTI-ECHO DENOISE
                       │
                       ▼
              MOTION / CENSORING
                       │
                       ▼
                  REGISTRATION
                       │
                       ▼
                SURFACE MAPPING
                       │
                       ▼
                  PARCELLATION
                       │
                       ▼
             FUNCTIONAL CONNECTIVITY
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
   THERAPEUTIC CIRCUITS      TRIPLE NETWORK
            │                     │
            ▼                     ▼
 PATIENT-SPECIFIC LOCALISATION  NETWORK PROFILE
            │                     │
            └──────────┬──────────┘
                       ▼
                 NORMATIVE CONTEXT
                       │
                       ▼
              RELIABILITY ANALYSIS
                       │
                       ▼
             PIPELINE SENSITIVITY
                       │
                       ▼
             CAPABILITY QUALIFICATION
                       │
                       ▼
            MEASUREMENT BUNDLE
                       │
                       ▼
                 TARGET ENGINE
```

---

# 130. SCIENTIFIC DECISION BOUNDARY

The most important architectural boundary is:

```text
Neuroimaging Pipeline
        │
        │ measures
        ▼
patient functional organisation
        │
        │ qualifies
        ▼
reliable scientific measurements
        │
        │ exposes
        ▼
Target Engine
        │
        │ reasons under evidence policy
        ▼
candidate target slate
        │
        │ reviewed by
        ▼
specialist clinician
```

The pipeline itself does not cross the final clinical decision boundary.

---

# 131. CORE DESIGN AXIOMS

MAGNIOM v1.1 SHALL preserve the following axioms:

> **Evidence before imaging.**

> **Clinical purpose before connectivity.**

> **Reliability before personalisation.**

> **Subject-native anatomy before template assumptions.**

> **Reproducibility before coordinate precision.**

> **Therapeutic circuits before arbitrary anomalies.**

> **Network context before network-target claims.**

> **Triple-Network relationships before Triple-Network scores.**

> **Alternatives before certainty.**

> **Abstention before false precision.**

> **Measurement before interpretation.**

> **Explanation before automation.**

> **The specialist decides.**

---

# 132. CANONICAL SCIENTIFIC MANIFESTO

The functional-connectomics layer of MAGNIOM can therefore be summarised as:

```text
Measure carefully.

Preserve native anatomy.

Control preprocessing.

Quantify motion.

Make denoising explicit.

Version every transformation.

Measure connectivity.

Anchor connectivity to evidence-defined circuits.

Test localisation reproducibility.

Quantify pipeline sensitivity.

Represent uncertainty.

Use normative models only when compatible.

Represent CEN, DMN and SN as a relational system.

Do not collapse the Triple Network into a score.

Do not turn network abnormalities into targets.

Do not confuse reproducibility with efficacy.

Do not confuse personalisation with superiority.

Do not hide multimodal fusion.

Do not allow research to leak into Clinical Mode.

Do not manufacture precision.

Abstain when qualification fails.

Expose the evidence.

Expose the measurement.

Expose the uncertainty.

Then let the Target Engine reason within policy.

Then let the specialist decide.
```

---

# 133. FINAL CANONICAL ARCHITECTURE

The definitive v1.1 relationship is:

```text
                 EVIDENCE KNOWLEDGE GRAPH
                           │
                           ▼
                    THERAPEUTIC CIRCUITS
                           │
                           ▼
                     TARGET FAMILIES
                           │
                           │ defines search space
                           ▼
┌─────────────────────────────────────────────────────┐
│       MAGNIOM FUNCTIONAL CONNECTOMICS                │
│                                                     │
│  Structural MRI                                     │
│       ↓                                             │
│  Resting-state fMRI                                 │
│       ↓                                             │
│  Controlled preprocessing                           │
│       ↓                                             │
│  Functional connectivity                            │
│       ├───────────────┐                             │
│       ▼               ▼                             │
│  Therapeutic      Triple-Network                     │
│  circuits         Systems Layer                     │
│       │               │                             │
│       ▼               ▼                             │
│  Patient FC       CEN / DMN / SN                    │
│  localisation     relationships                     │
│       │               │                             │
│       └───────┬───────┘                             │
│               ▼                                     │
│        Reliability / Sensitivity                    │
│               │                                     │
│               ▼                                     │
│        Capability Qualification                     │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
        FUNCTIONAL MEASUREMENT BUNDLE
                │
                ▼
          DETERMINISTIC TARGET
             ENGINE CORE
                │
                ▼
       TARGET CANDIDATE / SLATE
                │
                ▼
        CLINICIAN REVIEW
                │
                ▼
       FINAL CLINICAL DECISION
```

# 134. NORMATIVE CONCLUSION

MAGNIOM v1.1 establishes the functional-connectomics pipeline as a **measurement system rather than a target-selection system**.

Its principal scientific advance is not simply adding more connectivity metrics.

It is the creation of a structured hierarchy:

```text
Anatomy
   ↓
Functional measurement
   ↓
Therapeutic circuit
   ↓
Patient-specific expression
   ↓
Triple-Network context
   ↓
Reliability
   ↓
Capability qualification
   ↓
Target Engine
```

The Triple-Network Systems Layer is therefore deliberately positioned as a **distributed systems-level contextual layer**. It can strengthen explanation, convergence analysis and future scientific models without prematurely encoding an unsupported rule that a particular CEN, DMN or SN abnormality should itself determine a TMS target.

The governing principle is:

> **The brain measurement informs the candidate.  
> The evidence constrains the candidate.  
> Reliability qualifies the measurement.  
> The Target Engine applies scientific policy.  
> The specialist makes the treatment decision.**