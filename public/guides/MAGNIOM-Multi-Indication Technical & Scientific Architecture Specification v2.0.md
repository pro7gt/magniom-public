# MAGNIOM
## Multi-Indication Technical & Scientific Architecture Specification v2.0

**Document status:** Canonical v2 architecture expansion  
**Date:** 2 September 2026  
**Product stage:** Functional MVP → multi-indication research/validation platform  
**Primary purpose:** Connectome-, anatomy-, evidence- and phenotype-informed TMS target decision support  
**Primary user:** Appropriately trained neuromodulation specialist  
**Clinical authority:** Human clinician  
**Core architectural change:** MDD-specific application → governed multi-indication platform

---

# 1. EXECUTIVE DEFINITION

MAGNIOM v2.0 extends the v1 platform from:

```text
MDD-specific Target Decision Support
```

to:

# a modular multi-indication neuromodulation decision-support architecture.

The fundamental scientific model remains:

```text
Evidence constrains.
Phenotype prioritises.
Patient measurement refines.
Reliability qualifies.
Anatomy constrains.
E-field characterises/optimises where validated.
Alternatives expose uncertainty.
The specialist decides.
```

However, v2 recognises that:

# different disorders require different scientific inputs, target geometries, clinical objectives, neuroimaging modalities, reliability measures and evidence models.

MAGNIOM SHALL therefore not implement:

```text
diagnosis
    ↓
reuse MDD Target Engine
    ↓
different coordinate
```

Instead:

```text
Case
  ↓
Indication
  ↓
IndicationModuleRelease
  ↓
indication-specific phenotype
  ↓
indication-specific evidence
  ↓
indication-appropriate measurements
  ↓
indication-specific candidate generation
  ↓
common MAGNIOM governance
  ↓
Target Slate
  ↓
specialist decision
```

---

# 2. v2.0 GOVERNING PRINCIPLE

The central v2 rule is:

# MAGNIOM has one governance architecture but multiple indication models.

Shared across indications:

- provenance;
- evidence tiers;
- ScientificPolicyRelease;
- immutable snapshots;
- candidate explainability;
- target reliability;
- Target Slate;
- uncertainty;
- clinician decision;
- audit;
- Research/Clinical separation;
- release governance.

Different by indication:

- clinical phenotype;
- therapeutic objective;
- evidence graph;
- candidate-generation method;
- target geometry;
- required measurements;
- reliability model;
- laterality logic;
- stimulation-context evidence;
- outcome measures.

---

# 3. PLATFORM SUPPORT IS NOT CLINICAL VALIDATION

MAGNIOM v2.0 may technically support an indication without that indication being permitted in Clinical Mode.

The following states SHALL be distinct:

```ts
type IndicationModuleStatus =
  | "research_only"
  | "evidence_staging"
  | "validation_candidate"
  | "retrospective_validation"
  | "silent_prospective"
  | "clinical_release_candidate"
  | "clinical_active"
  | "suspended"
  | "withdrawn";
```

A functioning:

```text
Stroke Target Module
```

does not mean:

> MAGNIOM is clinically validated for stroke.

Likewise:

```text
Tinnitus Research Module
```

does not constitute a treatment recommendation system.

---

# 4. PROVISIONAL v2 INDICATION PORTFOLIO

The following is the recommended v2 technical portfolio.

| Module | Proposed v2 platform state | Initial target domain |
|---|---|---|
| MDD ± anxious distress | Existing core / validation pathway | prefrontal therapeutic circuits |
| OCD | Validation candidate | dmPFC/ACC, pre-SMA/SMA, selected prefrontal target families |
| Chronic neuropathic pain | Validation candidate | somatotopic M1 |
| Stroke — motor recovery | Validation candidate | ipsilesional / contralesional motor systems |
| Stroke — aphasia | Validation candidate / Research | language-network targets |
| Fibromyalgia | Validation candidate / Research | M1 ± selected prefrontal hypotheses |
| PTSD | Research / validation | right DLPFC, dmPFC and related circuits |
| TBI — depression | Research | DLPFC-based target families |
| TBI — cognition | Research | frontoparietal/prefrontal hypotheses |
| TBI — pain/headache | Research | symptom-specific network hypotheses |
| Chronic tinnitus | Research only | auditory/temporoparietal ± network targets |
| Parkinson-related modules | Research staging | motor/SMA and non-motor targets |
| Other neurological rehabilitation | Research staging | indication-specific |

These are platform-development states, not final Evidence Tiers.

---

# 5. EVIDENCE READINESS — CHRONIC NEUROPATHIC PAIN

Chronic neuropathic pain is one of the strongest non-MDD candidates for MAGNIOM expansion.

European evidence-based rTMS recommendations assigned Level A evidence to high-frequency M1 stimulation contralateral to the painful side for neuropathic pain. Other clinical recommendations are more conservative regarding routine positioning and protocol standardisation, illustrating exactly why MAGNIOM should preserve evidence provenance and limitations rather than merely label the technique “effective.”

The v2 Pain Module should therefore begin around:

# primary motor cortex targeting.

But target semantics must become:

# somatotopic.

Not merely:

```text
M1 coordinate
```

---

# 6. EVIDENCE READINESS — STROKE MOTOR RECOVERY

Stroke is technically and scientifically different from MDD.

The 2020 expert guideline found strong evidence for low-frequency stimulation of contralesional M1 in post-acute motor stroke and probable efficacy for high-frequency ipsilesional M1. A 2025 meta-analysis restricted to RCTs with low risk of bias found improvement in upper-limb motor outcomes, particularly in acute/subacute patients and those with greater initial motor impairment. A 2026 meta-analysis of neuronavigated rTMS found modest improvement in motor and disability outcomes but stated that larger comparative trials are still required to establish the added value of navigated targeting.

Therefore:

# stroke deserves a serious v2 validation module,

but:

# MAGNIOM should not pretend that individual connectomic optimisation of stroke targets is already validated.

---

# 7. EVIDENCE READINESS — POST-STROKE APHASIA

Post-stroke aphasia should be represented separately from stroke motor recovery.

A 2025 meta-analysis covering 30 RCTs and 1,597 patients reported improved multiple language domains when rTMS was paired with speech-language therapy. Recent meta-analyses continue to find positive effects but also demonstrate substantial protocol and hemispheric heterogeneity.

The implication for MAGNIOM is important:

# Stroke is not one indication module.

Instead:

```text
Stroke
├── Motor Recovery
├── Aphasia
├── Dysphagia
├── Neglect
├── Post-stroke depression
└── other research modules
```

Each requires different:

- phenotype;
- target family;
- outcome domain;
- adjunctive rehabilitation context.

---

# 8. EVIDENCE READINESS — OCD

OCD is an especially important psychiatric v2 candidate because TMS already has established target/protocol precedent distinct from depression.

Deep TMS targeting medial prefrontal/anterior cingulate regions with the H7 coil received FDA clearance for OCD, and updated reviews continue to support several target classes including mPFC/ACC, DLPFC and SMA/pre-SMA, although protocol heterogeneity remains substantial.

MAGNIOM therefore needs to support:

# stimulation volumes and coil-field distributions,

not merely:

# point coordinates.

That is a major v2 canonical-data change.

---

# 9. EVIDENCE READINESS — TRAUMATIC BRAIN INJURY

TBI remains scientifically promising but heterogeneous.

A recent systematic review/meta-analysis of seven randomized trials reported improvements in pooled cognitive and pain outcomes, while prior evidence suggests possible short-term benefit for post-TBI depression. However, optimal targets, parameters, durability and patient selection remain insufficiently established.

MAGNIOM v2 SHALL therefore classify:

```text
TBI — Depression
TBI — Cognition
TBI — Pain / Headache
```

as:

# Research Mode modules initially.

TBI must not become:

```text
MDD targeting + TBI label.
```

---

# 10. EVIDENCE READINESS — TINNITUS

Tinnitus is a good example of why MAGNIOM's evidence-governance architecture matters.

A 2025 meta-analysis reported some short-term benefit, but a 2026 synthesis of randomized trials reported no significant pooled benefit for rTMS, while established tinnitus guidance has recommended against routine TMS use for persistent bothersome tinnitus.

Therefore v2:

# MAY implement sophisticated tinnitus research targeting,

but:

# SHALL keep tinnitus Research Mode only

until stronger evidence supports a specific clinical MAGNIOM target strategy.

---

# 11. EVIDENCE READINESS — PTSD

PTSD remains another useful Research/Validation module.

Meta-analyses have suggested benefit for several rTMS approaches, particularly right-DLPFC protocols, but recent combat-related sham-controlled pooled data did not show a statistically significant advantage over sham.

Accordingly:

```text
PTSD
→ Research / controlled validation
```

not routine Clinical Mode v2.

---

# 12. NEW CANONICAL OBJECT — `IndicationModule`

The most important v2 object is:

```ts
interface IndicationModule {
  id: UUID;

  code: string;
  version: string;

  indication: ClinicalConceptRef;

  title: string;

  status: IndicationModuleStatus;

  intended_population: PopulationDefinition;

  allowed_modes: MagniomMode[];

  phenotype_schema_version_id: UUID;

  evidence_scope_id: UUID;

  clinical_objectives: ClinicalObjectiveDefinition[];

  candidate_generation_methods: TargetingStrategyRef[];

  measurement_requirements: MeasurementRequirement[];

  target_geometry_types: TargetGeometryType[];

  reliability_policy_refs: UUID[];

  scientific_policy_compatibility: UUID[];

  adjunctive_context_requirements: TreatmentContextRequirement[];

  limitations: string[];

  validation_evidence_ids: UUID[];

  manifest_sha256: SHA256;
}
```

---

# 13. `IndicationModuleRelease`

Modules are released immutably:

```text
MAGNIOM-IND-MDD-1.0.0

MAGNIOM-IND-OCD-1.0.0

MAGNIOM-IND-PAIN-NP-1.0.0

MAGNIOM-IND-STROKE-MOTOR-1.0.0

MAGNIOM-IND-STROKE-APHASIA-1.0.0

MAGNIOM-IND-TBI-DEP-1.0.0

MAGNIOM-IND-TINNITUS-1.0.0
```

A Target Slate SHALL reference exactly one principal:

# `IndicationModuleRelease`.

---

# 14. CASES MAY HAVE MULTIPLE CONDITIONS

A Case may contain:

```text
MDD
+
neuropathic pain
+
previous stroke
```

But MAGNIOM SHALL NOT merge all conditions into one unvalidated universal ranking function.

Canonical model:

```text
Case
├── CaseIndication A
├── CaseIndication B
└── CaseIndication C
```

Each Target Slate is generated under:

# one primary therapeutic indication/module.

---

# 15. CROSS-INDICATION REVIEW

v2 MAY later create:

# `CrossIndicationTargetReview`

to identify:

- spatial convergence;
- overlapping target families;
- conflicting stimulation objectives;
- common anatomical constraints.

It SHALL NOT automatically create:

```text
one universal optimal target
```

across indications.

---

# 16. NEW OBJECT — `ClinicalObjective`

MDD v1 largely used symptom priorities.

v2 requires broader therapeutic objectives.

Examples:

### Stroke

```text
upper_limb_motor_recovery
hand_dexterity
gait
language_naming
functional_communication
```

### Pain

```text
reduce_neuropathic_pain
reduce_evoked_pain
improve_function
```

### Tinnitus

```text
reduce_tinnitus_distress
reduce_perceived_loudness
improve_tinnitus_functional_impact
```

### OCD

```text
reduce_obsession_compulsion_burden
improve_function
```

The object SHALL distinguish:

```text
clinical objective
```

from:

```text
brain circuit.
```

---

# 17. NEW OBJECT — `DiseaseStageContext`

Many new indications depend critically on disease stage.

```ts
interface DiseaseStageContext {
  onset_date?: Date;
  current_stage: string;
  stage_definition_id: UUID;
  confidence: QualitativeConfidence;
}
```

Examples:

```text
stroke:
acute
subacute
chronic
```

```text
TBI:
acute
post-acute
chronic
```

Evidence eligibility MAY differ by stage.

---

# 18. NEW OBJECT — `LesionContext`

Stroke and TBI require lesion-aware architecture.

```ts
interface LesionContext {
  lesion_type: string;

  lesion_laterality:
    | "left"
    | "right"
    | "bilateral"
    | "multifocal";

  lesion_mask_artifact_id?: UUID;

  cortical_regions_affected: AtlasRegionRef[];

  subcortical_regions_affected: AtlasRegionRef[];

  tract_involvement?: TractFinding[];

  lesion_volume_cm3?: number;

  mass_effect?: boolean;

  cavity_present?: boolean;

  structural_distortion: QualitativeConfidence;

  registration_confidence: QualitativeConfidence;
}
```

---

# 19. LESION-AWARE TARGETING

MAGNIOM v2 SHALL NOT assume:

```text
normal template brain
+
coordinate transform
=
valid patient target
```

when a major structural lesion exists.

Lesion-aware processing SHALL assess:

- tissue absence;
- deformation;
- cortical displacement;
- abnormal segmentation;
- tract disruption;
- E-field distortion;
- registration reliability.

---

# 20. NEW TARGET GEOMETRY MODEL

v1 centred largely on cortical coordinates/ROIs.

v2 SHALL support:

```ts
type TargetGeometry =
  | PointTarget
  | SurfaceTarget
  | SurfaceROI
  | VolumetricROI
  | SomatotopicTarget
  | CoilFieldTarget
  | NetworkTargetDefinition;
```

---

# 21. POINT TARGET

Appropriate for:

- neuronavigated focal figure-of-eight stimulation;
- candidate cortical centre.

Still stores:

```text
coordinate
space
orientation
surface
provenance
```

---

# 22. SOMATOTOPIC TARGET

Required for pain and motor indications.

```ts
interface SomatotopicTarget {
  cortical_region: AtlasRegionRef;

  functional_body_region:
    | "face"
    | "upper_limb"
    | "hand"
    | "trunk"
    | "lower_limb"
    | "other";

  laterality: Laterality;

  motor_mapping_run_id?: UUID;

  target_surface_region: SurfaceROI;
}
```

A painful hand and a painful lower limb are not scientifically interchangeable M1 targets.

---

# 23. COIL-FIELD TARGET

Required particularly for deep TMS.

```ts
interface CoilFieldTarget {
  coil_model_id: UUID;

  placement_definition: CoilPlacement;

  intended_field_region: VolumetricROI;

  field_distribution_model_id?: UUID;

  target_network_refs: TherapeuticCircuitRef[];

  field_coverage_metrics?: EFieldMetric[];
}
```

An H-coil intervention SHALL NOT be misrepresented as:

```text
one MNI coordinate.
```

---

# 24. NEW OBJECT — `TreatmentContextRequirement`

Several new indications have evidence that depends on concurrent behavioural/rehabilitation context.

Examples include:

- speech-language therapy with post-stroke aphasia;
- motor rehabilitation with stroke;
- symptom provocation/ERP context for OCD protocols;
- cognitive rehabilitation for TBI research.

```ts
interface TreatmentContextRequirement {
  context_type: string;

  role:
    | "required_by_evidence"
    | "recommended_by_evidence"
    | "context_only";

  description: string;

  evidence_claim_ids: UUID[];
}
```

---

# 25. TARGET EVIDENCE MUST INCLUDE TREATMENT CONTEXT

v2 changes the canonical evidence path from:

```text
condition
→ circuit
→ target
→ outcome
```

to:

```text
condition
→ population
→ clinical objective
→ therapeutic circuit
→ target family
→ stimulation strategy
→ treatment context
→ outcome
```

because a target cannot always be interpreted independently of:

- frequency;
- laterality;
- coil type;
- concurrent rehabilitation;
- provocation/task state.

---

# 26. MAGNIOM STILL DOES NOT AUTONOMOUSLY PRESCRIBE PROTOCOL

Even though protocol context becomes scientifically necessary:

# MAGNIOM remains Target Decision Support.

The Target Slate MAY state:

> Evidence for this target family derives principally from high-frequency contralateral M1 protocols.

It SHALL NOT automatically convert this into:

> Prescribe 10 Hz at 110% RMT for 20 sessions.

Protocol prescription remains a separate future specification.

---

# 27. MULTIMODAL MEASUREMENT ARCHITECTURE

v1 prioritised:

```text
structural MRI
+
resting-state fMRI.
```

v2 SHALL support modular measurement providers.

Canonical classes:

```text
StructuralMRI
RestingStateFMRI
TaskFMRI
DiffusionMRI
MotorMapping
MotorEvokedPotentials
EEG
TMSEEG
Audiology
ClinicalNeurophysiology
EField
```

Not every indication requires every modality.

---

# 28. `MeasurementBundle`

```ts
interface MeasurementBundle {
  case_id: UUID;
  indication_module_release_id: UUID;

  structural_mri?: MeasurementRef;

  resting_state_fmri?: MeasurementRef;

  task_fmri?: MeasurementRef;

  diffusion_mri?: MeasurementRef;

  motor_mapping?: MeasurementRef;

  motor_evoked_potentials?: MeasurementRef;

  eeg?: MeasurementRef;

  audiology?: MeasurementRef;

  efield?: MeasurementRef;

  qualification_status: MeasurementBundleStatus;
}
```

---

# 29. MODULE-SPECIFIC MEASUREMENT REQUIREMENTS

Example:

### MDD

```text
structural MRI           required for navigation
rs-fMRI                  optional/required for personalisation
E-field                  optional
```

### Stroke motor

```text
structural MRI           required
lesion mask              required
motor phenotype          required
motor mapping            valuable
MEP/CST information      valuable
diffusion MRI            optional/research initially
rs-fMRI                  optional/research
```

### Neuropathic pain

```text
pain phenotype           required
pain laterality/body map required
motor map                valuable
structural MRI           required for navigation
rs-fMRI                  secondary
```

### Tinnitus

```text
audiology                required
tinnitus phenotype       required
structural MRI           research-dependent
rs-fMRI                  research
```

---

# 30. RELIABILITY BECOMES MODALITY-SPECIFIC

`TargetReliabilityProfile` SHALL evolve into:

# measurement-specific reliability components.

Examples:

### rs-fMRI

- split-half localisation;
- cross-run distance;
- preprocessing sensitivity.

### diffusion MRI

- tract reconstruction stability;
- streamline/tract sensitivity;
- model sensitivity.

### motor mapping

- hotspot reproducibility;
- map-centre reproducibility;
- threshold stability.

### lesion mapping

- segmentation confidence;
- registration quality.

### audiology

- test validity;
- laterality consistency;
- hearing-threshold reliability.

---

# 31. NEW `ReliabilityBundle`

```ts
interface ReliabilityBundle {
  id: UUID;
  case_id: UUID;
  indication_module_release_id: UUID;

  components: MeasurementReliability[];

  overall_qualification:
    | "qualified"
    | "qualified_with_limits"
    | "not_qualified";

  limiting_factors: ReliabilityLimitation[];
}
```

The overall status SHALL be policy-defined.

---

# 32. TARGET ENGINE v2

The Target Engine becomes:

```text
TargetEngineCore
        +
IndicationModule
        +
ScientificPolicyRelease
        +
CandidateGenerator plugins
```

The core engine retains:

- evidence gating;
- determinism;
- provenance;
- ranking infrastructure;
- redundancy;
- alternatives;
- abstention;
- explanation;
- slate assembly.

---

# 33. INDICATION CANDIDATE GENERATORS

Conceptual API:

```ts
interface CandidateGenerator {
  code: string;

  supported_indication_module_ids: UUID[];

  generate(
    context: IndicationTargetingContext
  ): TargetCandidateDraft[];
}
```

Examples:

```text
MddEvidenceAnchorGenerator

MddConnectomeRefinementGenerator

OcdDeepFieldTargetGenerator

PainSomatotopicM1Generator

StrokeIpsilesionalM1Generator

StrokeContralesionalM1Generator

StrokeLanguageNetworkGenerator

TbiPrefrontalResearchGenerator

TinnitusAuditoryResearchGenerator
```

---

# 34. INDICATION ENGINE CONTRACT

```ts
interface IndicationTargetingContext {
  case_id: UUID;

  indication_module_release_id: UUID;

  clinical_objective_snapshot_id: UUID;

  phenotype_snapshot_id: UUID;

  evidence_library_release_id: UUID;

  scientific_policy_release_id: UUID;

  measurement_bundle_id: UUID;

  reliability_bundle_id?: UUID;

  target_engine_version_id: UUID;

  device_context?: DeviceContext[];
}
```

---

# 35. SCIENTIFIC COMPATIBILITY TUPLE v2

The v1 tuple becomes:

```text
EvidenceLibraryRelease
×
IndicationModuleRelease
×
ScientificPolicyRelease
×
TargetEngineVersion
×
PipelineVersion(s)
×
NormativeModelVersion(s)
×
EFieldEngineVersion
×
Device/Coil capability where relevant
×
Indication
×
Mode
```

Clinical Mode requires an explicit approved combination.

---

# 36. NO CROSS-MODULE CONFIGURATION LEAKAGE

Examples of prohibited behaviour:

```text
MDD reliability thresholds
→ automatically applied to stroke
```

```text
MDD DLPFC ranking weights
→ automatically applied to pain
```

```text
stroke interhemispheric model
→ automatically applied to TBI
```

```text
pain M1 somatotopy
→ automatically applied to fibromyalgia
```

Each module owns its validated scientific rules.

---

# 37. CHRONIC NEUROPATHIC PAIN MODULE

Canonical code:

```text
MAGNIOM-IND-PAIN-NP
```

Required phenotype:

- neuropathic pain diagnosis/phenotype;
- central versus peripheral origin;
- duration;
- affected body region;
- laterality;
- pain intensity;
- evoked/spontaneous characteristics;
- functional burden;
- prior therapy;
- therapeutic objective.

---

# 38. PAIN TARGET FAMILY

Initial target family:

# contralateral primary motor cortex representation associated with the painful body region.

The module SHALL support:

```text
body region
        ↓
somatotopic motor representation
        ↓
patient motor map where available
        ↓
candidate cortical region
```

It SHALL NOT reduce this to one generic M1 coordinate.

---

# 39. PAIN CONNECTOMICS

Connectomics MAY later refine:

- motor network;
- salience network;
- thalamocortical relationships;
- descending pain-modulatory systems.

Initially, these SHOULD remain:

# secondary/research features

unless specifically validated to alter target choice.

---

# 40. PAIN TARGET SLATE

Possible roles:

```text
Primary 1
Evidence-supported somatotopic M1 target

Primary 2
Alternative M1 representation if mapping uncertainty exists

Additional
Network-informed research candidate
```

Do not generate unrelated prefrontal targets merely because pain correlates with prefrontal activity.

---

# 41. STROKE MOTOR MODULE

Canonical code:

```text
MAGNIOM-IND-STROKE-MOTOR
```

Required context:

- stroke type;
- lesion side;
- lesion location;
- time since stroke;
- motor deficit;
- affected limb;
- Fugl-Meyer or equivalent function;
- rehabilitation state;
- corticospinal integrity where available;
- motor-evoked potential status where available.

---

# 42. STROKE TARGET FAMILIES

Initial evidence-derived families may include:

### Ipsilesional motor cortex

Potential excitatory targeting context.

### Contralesional motor cortex

Potential inhibitory targeting context.

### Bilateral motor strategy

Where supported by evidence.

These SHALL remain:

# target-strategy families,

not automatic protocol instructions.

---

# 43. STROKE STAGE DEPENDENCY

Candidate eligibility MAY depend on:

```text
acute
subacute
chronic
```

because efficacy evidence is not uniform across recovery stages.

`DiseaseStageContext` SHALL therefore participate in evidence eligibility.

---

# 44. STROKE MOTOR MAPPING

Where feasible:

```text
MotorMappingRun
```

should provide:

- motor hotspot;
- motor threshold;
- map centre;
- affected muscle;
- MEP presence;
- map area;
- reproducibility.

This may be more clinically relevant than rs-fMRI for some stroke target questions.

---

# 45. CORTICOSPINAL TRACT CONTEXT

Diffusion MRI MAY provide:

```text
corticospinal tract integrity
```

as a future target-selection or stratification measurement.

Clinical influence requires separate validation.

---

# 46. STROKE APHASIA MODULE

Canonical code:

```text
MAGNIOM-IND-STROKE-APHASIA
```

Required phenotype:

- aphasia type;
- fluency;
- naming;
- comprehension;
- repetition;
- functional communication;
- language dominance;
- lesion context;
- stage;
- concurrent speech-language therapy.

---

# 47. APHASIA TARGET FAMILIES

Candidate families may include:

- contralesional inferior frontal language-region targets;
- ipsilesional residual language-network targets;
- bilateral/network alternatives.

Target eligibility SHALL depend on:

- lesion anatomy;
- language phenotype;
- evidence-defined protocol;
- rehabilitation context.

---

# 48. SPEECH-LANGUAGE THERAPY CONTEXT

Because much of the aphasia evidence evaluates rTMS:

# in conjunction with speech-language therapy,

MAGNIOM SHALL not represent the target evidence as if stimulation occurred in isolation.

---

# 49. OCD MODULE

Canonical code:

```text
MAGNIOM-IND-OCD
```

Required phenotype:

- confirmed OCD;
- Y-BOCS or validated symptom severity;
- obsession/compulsion dimensions;
- treatment resistance/history;
- ERP/CBT history;
- comorbidity;
- current therapeutic objective.

---

# 50. OCD TARGET GEOMETRY

OCD requires support for at least:

```text
mPFC / ACC field target
pre-SMA / SMA target
selected DLPFC target families
```

Deep-TMS families SHALL use:

# CoilFieldTarget

where appropriate.

---

# 51. OCD PROVOCATION CONTEXT

Where the evidence basis depends on symptom provocation before stimulation, that context SHALL be represented in:

```text
ProtocolPrecedent
```

and:

```text
TreatmentContextRequirement.
```

MAGNIOM SHALL NOT reduce the evidence to:

```text
ACC coordinate works.
```

---

# 52. TBI MODULE FAMILY

TBI should initially be an umbrella with submodules:

```text
TBI
├── Depression
├── Cognitive impairment
├── Post-traumatic pain/headache
└── other research phenotypes
```

Do not build:

# one “TBI target”.

---

# 53. TBI LESION SAFETY

TBI target generation SHALL account for:

- encephalomalacia;
- skull defects;
- cranioplasty;
- intracranial hardware;
- prior surgery;
- hemosiderin/structural abnormalities;
- seizure history;
- altered head conductivity.

Standard TMS clinical safety assessment remains clinician-controlled.

But these factors may affect:

- E-field;
- localisation;
- processing;
- eligibility.

---

# 54. TBI DEPRESSION MODULE

The TBI depression module MAY start with:

```text
prefrontal depression target families
```

as Research hypotheses.

It SHALL distinguish:

```text
primary MDD
```

from:

```text
depressive syndrome following TBI.
```

External evidence does not automatically make the MDD module transferable.

---

# 55. TBI COGNITION MODULE

Possible Research objectives:

- attention;
- working memory;
- executive function;
- processing efficiency.

Possible research target families:

- DLPFC;
- frontoparietal control networks.

Clinical target generation remains prohibited until validation.

---

# 56. TINNITUS MODULE

Canonical code:

```text
MAGNIOM-IND-TINNITUS
```

Status:

# Research Mode only.

Required phenotype:

- subjective/objective classification;
- duration;
- unilateral/bilateral;
- perceived laterality;
- tinnitus frequency where measured;
- loudness;
- distress;
- THI/TFI;
- hearing loss;
- hyperacusis;
- audiometry;
- relevant otologic diagnosis.

---

# 57. TINNITUS RESEARCH TARGET FAMILIES

Research families may include:

- auditory cortex;
- temporoparietal cortex;
- auditory-network targets;
- prefrontal-auditory combinations.

Every candidate SHALL display:

# RESEARCH HYPOTHESIS — NOT A VALIDATED CLINICAL TARGET.

---

# 58. TINNITUS NEGATIVE-EVIDENCE REQUIREMENT

Because the evidence is conflicting:

# conflicting and negative evidence must be prominent,

not hidden in a secondary drawer.

The tinnitus module is an excellent test of MAGNIOM's scientific-governance philosophy.

---

# 59. PTSD MODULE

Canonical code:

```text
MAGNIOM-IND-PTSD
```

Initial status:

```text
research_only
or
validation_candidate
```

according to Scientific Policy.

Initial candidate families may include:

- right DLPFC;
- selected left DLPFC hypotheses;
- dmPFC;
- fronto-limbic network candidates.

The evidence graph SHALL explicitly preserve:

- positive trials;
- neutral sham-controlled findings;
- protocol differences.

---

# 60. FIBROMYALGIA MODULE

Fibromyalgia can be staged behind neuropathic pain.

Evidence supports investigation of:

- M1;
- selected DLPFC strategies.

However the module SHALL distinguish fibromyalgia from:

# focal neuropathic pain.

The somatotopic body-region model used for unilateral neuropathic pain cannot simply be inherited.

---

# 61. PHENOTYPE ONTOLOGY v2

The v1 phenotype hierarchy becomes:

```text
Core Clinical Phenotype
        +
Indication-Specific Phenotype Extension
```

Core fields:

- diagnosis;
- severity;
- function;
- goals;
- priorities;
- comorbidities;
- safety;
- uncertainty.

Extension fields vary by module.

---

# 62. PHENOTYPE EXTENSION CONTRACT

```ts
interface IndicationPhenotypeExtension {
  indication_module_release_id: UUID;

  schema_version: string;

  payload: unknown;

  validation_status: DataQualityState;

  approved_by: UUID;

  approved_at: ISO8601UTC;

  payload_sha256: SHA256;
}
```

Clinically important extension semantics SHALL have typed schemas.

---

# 63. EVIDENCE KNOWLEDGE GRAPH v2

Add explicit nodes:

```text
Indication
DiseaseStage
ClinicalObjective
PatientSubpopulation
LesionPhenotype
BodyRegion
TreatmentContext
StimulationStrategy
CoilClass
TargetGeometryClass
OutcomeDomain
```

The graph becomes:

```text
Source
 ↓
EvidenceClaim
 ↓
Population
 ↓
Indication
 ↓
DiseaseStage
 ↓
ClinicalObjective
 ↓
TherapeuticCircuit
 ↓
TargetFamily
 ↓
TargetingStrategy
 ↓
TreatmentContext
 ↓
Outcome
```

---

# 64. TARGET FAMILY EVIDENCE IS CONTEXTUAL

A TargetFamily SHALL NOT have one universal evidence tier.

Evidence governance must be able to distinguish:

```text
M1
for neuropathic pain

M1
for stroke motor recovery

M1
for fibromyalgia

M1
for another indication
```

These are different clinical evidence claims.

---

# 65. DEVICE AND COIL BECOME MORE IMPORTANT

v2 SHALL treat:

```text
device
coil
field geometry
```

as scientific context where target evidence depends on them.

Especially:

- deep TMS;
- broad-field coils;
- figure-of-eight focal targeting;
- motor-system protocols.

---

# 66. E-FIELD ENGINE v2

E-field modelling becomes more important in:

- lesioned brains;
- skull defects;
- deep TMS;
- unusual anatomy;
- target-volume comparison.

The E-field service SHALL support:

```text
lesion-aware head model
coil-specific geometry
conductivity-model provenance
field coverage of ROI
off-target field metrics
```

where technically validated.

---

# 67. NORMATIVE MODELS v2

Normative modelling SHALL become indication- and modality-specific.

Do not create:

# one universal “brain abnormality model”.

Possible models:

```text
MDD connectivity normative model
Stroke motor-network reference
TBI structural/connectomic research model
Pain-network research model
```

Each retains its own:

- population;
- acquisition compatibility;
- preprocessing compatibility;
- validity scope.

---

# 68. DATABASE v2 — NEW CORE TABLES

Recommended additions:

```text
clinical.indications
clinical.case_indications
clinical.indication_snapshots
clinical.clinical_objectives

clinical.lesion_contexts
clinical.stroke_profiles
clinical.pain_profiles
clinical.tbi_profiles
clinical.tinnitus_profiles
clinical.ocd_profiles

evidence.indication_modules
evidence.indication_module_versions
evidence.outcome_domains
evidence.treatment_contexts
evidence.stimulation_strategies

neurophysiology.motor_mapping_runs
neurophysiology.mep_measurements

audiology.assessments

imaging.lesion_masks
connectomics.structural_connectivity_runs

targeting.target_geometries
```

---

# 69. DO NOT OVER-JSON THE NEW MODULES

Module extensibility does not justify putting every new clinical construct inside:

```text
jsonb payload
```

Clinically meaningful searchable semantics SHALL remain relational where practical.

Examples:

- indication;
- stroke laterality;
- affected body region;
- disease stage;
- aphasia domain;
- tinnitus laterality;
- target geometry type;
- treatment context.

---

# 70. TARGET SLATE v2

The canonical Target Slate remains.

New fields:

```ts
interface TargetSlateV2 {
  indication_module_release_id: UUID;

  primary_clinical_objective_ids: UUID[];

  measurement_bundle_id: UUID;

  reliability_bundle_id?: UUID;

  // existing v1 slate fields...
}
```

---

# 71. SLATE ROLES BECOME MODULE-DEFINED

The v1 roles:

```text
Evidence Anchor
Symptom Circuit
Connectome Refinement
```

are excellent for MDD but should not be forced on every indication.

v2:

```ts
type CandidateRole =
  | "evidence_anchor"
  | "phenotype_specific"
  | "connectome_refinement"
  | "somatotopic_target"
  | "lesion_network_target"
  | "contralesional_strategy"
  | "ipsilesional_strategy"
  | "field_target"
  | "clinical_alternative"
  | "network_alternative"
  | "research_hypothesis";
```

Scientific Policy determines allowed roles per module.

---

# 72. COMPARISON DIMENSIONS ARE MODULE-SPECIFIC

Core dimensions remain:

- evidence;
- reliability;
- accessibility;
- uncertainty.

Additional comparison dimensions may include:

### Stroke

- lesion relationship;
- corticospinal integrity;
- hemisphere;
- motor-map concordance.

### Pain

- painful-body-region correspondence;
- motor somatotopy.

### OCD

- field coverage;
- target network;
- coil compatibility.

### Tinnitus

- auditory-network concordance;
- audiologic phenotype.

No single universal utility vector is required.

---

# 73. TARGET ENGINE CORE REMAINS DETERMINISTIC

Clinical modules SHALL retain:

```text
same frozen inputs
+
same module
+
same Scientific Policy
+
same Target Engine
=
same Target Slate.
```

Research algorithms may explore alternatives but each run remains versioned.

---

# 74. ABSTENTION EXPANDS IN v2

New abstention classes:

```text
unsupported_indication
unsupported_disease_stage
lesion_registration_failure
motor_map_unreliable
target_region_destroyed_by_lesion
protocol_context_missing
body_region_mapping_uncertain
audiology_incomplete
coil_not_compatible
field_model_unreliable
module_not_clinically_qualified
```

---

# 75. MODULE-SPECIFIC FALLBACK

Example:

### Stroke

If patient-specific motor mapping fails:

```text
fallback may be evidence-defined anatomical strategy
```

only if Scientific Policy permits.

### Pain

If somatotopic localisation is inadequate:

```text
specialist anatomical/motor mapping review
```

may be required.

### Tinnitus

Research module failure:

```text
no target
```

rather than guessed auditory coordinate.

---

# 76. APPLICATION SHELL REMAINS STABLE

The v2 application shell does not need redesign around diagnoses.

Global architecture remains:

```text
Top Bar
Sidebar
Case Header
Main Canvas
```

The Case Header gains:

```text
Indication Module
```

where appropriate.

---

# 77. CASE NAVIGATION BECOMES MODULE-AWARE

Common navigation:

```text
Overview
Assessment
Phenotype
Target Slate
Compare
Decision
Audit
```

Module-specific workspaces appear contextually.

### MDD

```text
Imaging
Connectome
```

### Stroke

```text
Lesion
Motor System
Connectome
```

### Pain

```text
Pain Map
Motor Mapping
```

### Tinnitus

```text
Audiology
Auditory Network
```

---

# 78. THE SIDEBAR SHALL NOT LIST DIAGNOSES

Do not create:

```text
Depression
OCD
Stroke
Pain
Tinnitus
TBI
```

as global navigation destinations for ordinary clinicians.

The primary object remains:

# Case.

Indication determines the workspace after the Case is opened.

---

# 79. CASE CREATION v2

New-case workflow:

```text
Create Case
    ↓
Select/confirm clinical indication
    ↓
Select appropriate Indication Module
    ↓
confirm intended clinical objective
    ↓
load indication-specific assessment
```

The user SHALL know whether the module is:

```text
Clinical
Validation
Research
```

before any target generation.

---

# 80. RESEARCH MODULE VISUAL SAFETY

Research-only modules SHALL trigger persistent shell treatment:

```text
RESEARCH MODE

This indication is not enabled for Clinical MAGNIOM targeting.
Outputs are experimental and cannot be signed as a Clinical Target Slate.
```

---

# 81. SCIENTIFIC POLICY v2

`ScientificPolicyRelease` SHALL now authorise:

```text
IndicationModuleRelease
```

in addition to scientific component versions.

Example:

```text
MAGNIOM-POLICY-2.0.0

MDD module                clinical
OCD module                validation
Neuropathic Pain module   validation
Stroke Motor module       validation
Stroke Aphasia module     research
TBI modules               research
Tinnitus module           research
```

---

# 82. MODULE-SPECIFIC PARAMETER SETS

Never use one global:

```text
reliability threshold
```

for every indication.

Instead:

```text
MDD.rsFC.minimum_reliability

Stroke.motor_map.minimum_reliability

Pain.motor_map.minimum_reliability

Stroke.lesion_registration.minimum_quality
```

etc.

---

# 83. v2 SYSTEM REQUIREMENT NAMESPACE

Add:

```text
MAG-IND-xxx
```

for multi-indication architecture.

Recommended requirements:

### MAG-IND-001

Every non-MDD target generation SHALL reference an immutable `IndicationModuleRelease`.

### MAG-IND-002

An Indication Module SHALL NOT inherit another module's scientific policy unless explicitly authorised.

### MAG-IND-003

A Case MAY contain multiple diagnoses but every Target Slate SHALL identify one primary indication module.

### MAG-IND-004

Research-only Indication Modules SHALL NOT publish Clinical Target Slates.

### MAG-IND-005

Disease-stage-dependent evidence SHALL be evaluated against the patient's approved DiseaseStageContext.

### MAG-IND-006

Lesion-dependent modules SHALL require a qualified LesionContext where specified.

### MAG-IND-007

Module-specific measurement requirements SHALL be satisfied before patient-specific refinement.

### MAG-IND-008

Target geometry SHALL support module-specific geometry types rather than assuming every target is a point coordinate.

### MAG-IND-009

Evidence derived from adjunctive rehabilitation or behavioural context SHALL retain that treatment context.

### MAG-IND-010

Cross-indication target convergence SHALL NOT automatically create a combined clinical recommendation.

---

# 84. STROKE REQUIREMENTS

Add:

```text
MAG-STR-001+
```

Examples:

### MAG-STR-001

Stroke Target Slates SHALL identify lesion laterality.

### MAG-STR-002

Stroke Target Slates SHALL identify recovery stage.

### MAG-STR-003

Lesion anatomy SHALL be considered before cortical target eligibility.

### MAG-STR-004

A target region materially destroyed or inaccessible because of the lesion SHALL NOT be presented as an ordinary stimulatable target.

### MAG-STR-005

Stroke motor and stroke aphasia SHALL use separate Indication Modules.

---

# 85. PAIN REQUIREMENTS

Add:

```text
MAG-PAI-001+
```

### MAG-PAI-001

Neuropathic Pain targeting SHALL identify painful body region and laterality.

### MAG-PAI-002

M1 candidates SHALL preserve somatotopic relationship to the clinical pain phenotype.

### MAG-PAI-003

Generic M1 coordinates SHALL NOT replace body-region-specific target definition where somatotopy is clinically required.

### MAG-PAI-004

Research pain-network abnormalities SHALL NOT independently create Clinical Mode targets.

---

# 86. TBI REQUIREMENTS

Add:

```text
MAG-TBI-001+
```

### MAG-TBI-001

TBI target generation SHALL preserve injury type, severity and chronicity.

### MAG-TBI-002

Structural distortion SHALL be assessed before assuming standard-space target validity.

### MAG-TBI-003

TBI depression and TBI cognitive targeting SHALL be treated as separate scientific objectives.

### MAG-TBI-004

TBI modules SHALL remain Research Mode until module-specific validation criteria are satisfied.

---

# 87. TINNITUS REQUIREMENTS

Add:

```text
MAG-TIN-001+
```

### MAG-TIN-001

Tinnitus Research targeting SHALL require an approved tinnitus phenotype.

### MAG-TIN-002

Audiologic context SHALL be available before target analysis.

### MAG-TIN-003

Tinnitus target candidates SHALL remain Research Mode in the initial v2 release.

### MAG-TIN-004

Negative and conflicting tinnitus evidence SHALL be displayed prominently.

---

# 88. v2 GOLDEN CASE SUITE

The existing MDD Golden Cases remain.

Add:

### G20 — Neuropathic hand pain

Expected:

- contralateral M1 somatotopic candidate;
- no generic DLPFC candidate;
- body-region mapping visible.

### G21 — Bilateral neuropathic pain

Expected:

- laterality complexity visible;
- no arbitrary single-hemisphere answer.

### G22 — Subacute unilateral motor stroke

Expected:

- lesion side/stage visible;
- approved stroke strategies generated;
- no MDD target family leakage.

### G23 — Stroke with destroyed cortical candidate region

Expected:

- affected target suppressed;
- anatomy explanation.

### G24 — Post-stroke aphasia

Expected:

- language phenotype;
- treatment-context evidence;
- separate aphasia module.

### G25 — OCD deep-TMS candidate

Expected:

- field/coil target;
- not misleading point coordinate.

### G26 — TBI depression with skull defect

Expected:

- Research Mode;
- E-field/anatomy warning;
- no routine Clinical candidate.

### G27 — TBI cognitive hypothesis

Expected:

- Research only;
- no depression-target inheritance.

### G28 — Chronic tinnitus

Expected:

- prominent evidence conflict;
- Research Mode;
- clinical signing unavailable.

### G29 — MDD + neuropathic pain comorbidity

Expected:

- two indication contexts;
- no universal score;
- separate Target Slates or explicit cross-indication review.

### G30 — Research/Clinical leakage attempt

Expected:

- hard rejection.

---

# 89. SCIENTIFIC VALIDATION ORDER

Recommended v2 validation priority:

```text
1. Preserve MDD regression baseline

2. Neuropathic Pain
   somatotopic M1 module

3. Stroke Motor Recovery
   lesion-aware motor module

4. OCD
   field/coil-target architecture

5. Post-stroke Aphasia

6. Fibromyalgia

7. PTSD

8. TBI modules

9. Tinnitus
```

This is an engineering/scientific priority recommendation, not a commercial order.

---

# 90. WHY PAIN + STROKE SHOULD COME EARLY

These modules force MAGNIOM to solve the most important architectural generalisation problems:

### Pain forces:

```text
somatotopy
```

### Stroke forces:

```text
lesions
disease stage
laterality
motor mapping
rehabilitation context
```

### OCD forces:

```text
field/coil targets rather than point coordinates
```

Once these work correctly, MAGNIOM is genuinely:

# multi-indication.

Not merely:

# depression software with extra labels.

---

# 91. REPOSITORY v2

Recommended extension:

```text
packages/
├── domain/
├── schemas/
├── evidence/
├── scientific-policy/
├── target-engine/
│
├── indication-core/
│
├── indications/
│   ├── mdd/
│   ├── ocd/
│   ├── neuropathic-pain/
│   ├── stroke-motor/
│   ├── stroke-aphasia/
│   ├── fibromyalgia/
│   ├── ptsd/
│   ├── tbi/
│   └── tinnitus/
│
└── test-fixtures/
```

---

# 92. INDICATION MODULE PACKAGE

Each module contains:

```text
manifest.ts
schemas.ts
phenotype.ts
objectives.ts
evidence-contract.ts
candidate-generators.ts
measurement-requirements.ts
reliability.ts
comparison.ts
abstention.ts
presentation.ts
golden-cases/
```

It SHALL NOT own:

- authentication;
- audit;
- database authorisation;
- global Target Slate semantics.

Those remain platform core.

---

# 93. PLUGIN SAFETY

Indication plugins SHALL register through a controlled compile-time/release manifest.

Clinical Mode SHALL NOT dynamically download arbitrary targeting modules.

---

# 94. DATABASE MIGRATION STRATEGY

Do not rewrite the v1 database.

Use additive migrations:

```text
v2_001_indication_modules

v2_002_case_indications

v2_003_clinical_objectives

v2_004_target_geometry

v2_005_lesion_context

v2_006_motor_mapping

v2_007_audiology

v2_008_measurement_bundles

v2_009_reliability_bundles

v2_010_scientific_policy_module_compatibility
```

MDD v1 objects should migrate deterministically into:

```text
MAGNIOM-IND-MDD-1.0.0.
```

---

# 95. BACKWARD COMPATIBILITY

Existing MDD Target Slates SHALL remain unchanged.

Do not regenerate them merely because:

```text
Target Engine v2
```

exists.

Historical v1 slates retain their original:

- engine;
- evidence;
- policy;
- pipeline;
- semantics.

---

# 96. TARGET ENGINE v2 REGRESSION GATE

Before v2 integration:

# every v1 MDD Golden Case must produce the approved v1-equivalent result

under the compatibility pathway intended to preserve v1 behaviour.

Any change requires explicit Scientific Change Impact Review.

---

# 97. v2 VALIDATION PYRAMID

Each module progresses:

```text
schema verification
      ↓
synthetic Golden Cases
      ↓
scientific implementation verification
      ↓
retrospective dataset
      ↓
silent prospective
      ↓
controlled clinician-assisted validation
      ↓
Clinical Release Candidate
```

No module skips this because the core MAGNIOM platform has already been validated elsewhere.

---

# 98. MODULE VALIDATION IS NOT TRANSITIVE

If:

```text
MAGNIOM MDD = clinically validated
```

and:

```text
stroke literature = supports rTMS
```

it does not follow that:

```text
MAGNIOM Stroke = clinically validated.
```

MAGNIOM-specific validation must establish that:

- correct evidence is selected;
- correct targets are generated;
- patient measurement behaves reproducibly;
- uncertainty is presented safely;
- clinicians understand the output;
- the intended clinical claim is supported.

---

# 99. MULTI-INDICATION REGULATORY PRINCIPLE

Every indication expansion MAY alter:

- intended purpose;
- intended population;
- clinical evidence package;
- risk analysis;
- software configuration;
- labelling;
- regulatory scope.

Therefore:

# indication activation is a controlled product release event.

---

# 100. v2 CLINICAL-MODE PHILOSOPHY

MAGNIOM v2 SHOULD permit different modules to coexist at different maturity states.

Example:

```text
MDD
CLINICAL

Neuropathic Pain
VALIDATION

Stroke Motor
VALIDATION

OCD
VALIDATION

TBI
RESEARCH

Tinnitus
RESEARCH
```

The shell, database and Target Engine SHALL enforce those boundaries.

---

# 101. NO GLOBAL “CLINICAL MODE”

At a technical level, v2 should think of Clinical permission as:

```text
Clinical Release
+
Indication Module
+
Scientific Policy
```

rather than:

```text
application.clinical_mode = true
```

One deployed MAGNIOM installation may contain:

- clinically authorised MDD;
- research stroke;
- research tinnitus

simultaneously.

---

# 102. FINAL v2 ARCHITECTURE

```text
                         MAGNIOM CORE
                              │
           ┌──────────────────┼───────────────────┐
           │                  │                   │
       Governance         Case Model          Security
           │                  │                   │
           └──────────────────┼───────────────────┘
                              │
                    Indication Module
                              │
       ┌──────────────┬───────┼────────┬───────────────┐
       │              │       │        │               │
      MDD            OCD    PAIN    STROKE            TBI
                                        │
                                  ┌─────┴─────┐
                                  │           │
                                MOTOR       APHASIA

                   additional Research modules
                              │
                     PTSD · Tinnitus · etc.
                              │
                              ▼
                      Scientific Policy
                              │
                              ▼
                      Evidence eligibility
                              │
                              ▼
                      Measurement Bundle
                              │
                              ▼
                      Reliability Bundle
                              │
                              ▼
                       Candidate Generators
                              │
                              ▼
                         Target Engine
                              │
                              ▼
                          Target Slate
                              │
                              ▼
                     Specialist Decision
```

---

# 103. WHAT MUST NOT CHANGE FROM v1

The following MAGNIOM principles survive unchanged:

# Patient imaging does not create clinical evidence.

# Evidence ceilings remain binding.

# A more personalised target is not automatically better.

# Reliability remains visible beside personalisation.

# Negative evidence remains visible.

# Research output remains distinct.

# A precise coordinate does not imply biological certainty.

# Target Slate is not prescription.

# The specialist may reject every candidate.

# Historical scientific decisions remain reproducible.

# Algorithms remain version-pinned.

# Clinical Mode requires evidence and governance.

---

# 104. WHAT FUNDAMENTALLY CHANGES IN v2

v2 adds:

# Indication Modules

# lesion-aware targeting

# disease-stage semantics

# somatotopic targets

# field/coil target geometry

# treatment-context evidence

# multimodal measurements

# motor mapping and neurophysiology

# audiology

# structural-connectivity support

# modality-specific reliability

# module-specific candidate roles

# module-specific Scientific Policy

and:

# independently releasable clinical scopes.

---

# 105. MEDICAL DEVICE ENGINEERING & TECHNOLOGY STACK CONSERVATISM

MAGNIOM operates as a **Class IIb / Class B Medical Device Software as a Medical Device (SaMD)** under IEC 62304:2006+AMD1:2015, ISO 14971:2019, and ISO 13485:2016. In regulated clinical neuromodulation decision support, architectural and technology stack choices are governed by **safety, determinism, auditability, and regulatory verifiability**, not transient web development trends.

### A. SOUP Management & Dependency Discipline (IEC 62304 §5.3.3)
Software of Unknown Provenance (SOUP) introduces uncontrolled transitive failure modes. Bleeding-edge JavaScript libraries and fast-churning frameworks frequently introduce breaking API mutations, security vulnerabilities, and non-deterministic behavior. MAGNIOM mandates:
- Minimal, audited third-party dependency sets tracked in a formal Software Bill of Materials (SBOM) and verified via automated vulnerability probes (`npm run sbom:verify`).
- Long-Term Support (LTS) runtimes (Node.js >= 20.0.0, Python >= 3.10) with pinned cryptographic package digests.
- Zero reliance on experimental browser runtime features for clinical calculation.

### B. Storage-Level Row-Level Security (RLS) vs. Client-Side ORMs
Modern web applications frequently adopt client-side ORMs (e.g., Prisma, Drizzle). MAGNIOM deliberately enforces tenant isolation and clinical decision immutability **at the PostgreSQL storage engine level** via native DDL migrations (`supabase/migrations/001_...` through `042_...`) and PL/pgSQL database triggers (`targeting.guard_signed_decision`):
- **Fail-Closed Security**: Client-side ORMs run in application process memory; if an API worker is compromised or suffers parameter pollution, an ORM cannot prevent cross-tenant data leakage. Database-level RLS guarantees default-deny isolation under HIPAA §164.312 and GDPR Art. 32.
- **Cryptographic Immutability**: Signed clinician decisions and sealed Target Slates are protected by database triggers that reject any `UPDATE` or `DELETE` at the SQL engine level, guaranteeing tamper-evident audit trails compliant with FDA 21 CFR Part 11.

### C. Scientific Compute Isolation in Validated Neuroimaging Runtimes
Voxel-wise MRI processing, non-linear coordinate warps, and tractography require validated, compiled scientific libraries (BLAS/LAPACK, NiBabel, Nilearn, SciPy). These cannot be safely or accurately replaced by client-side JavaScript or WebAssembly:
- Scientific compute is strictly partitioned into containerized POSIX services ([`services/neurocompute`](file:///home/owner/Downloads/Magniom/services/neurocompute)), maintaining clean architectural boundaries between web presentation and numerical matrix processing.
- Input/output boundaries across compute services are governed by immutable JSON schemas and SHA-256 content addressing.

### D. Pure Mathematical Determinism vs. Probabilistic Generative AI
Consumer applications frequently employ large language models (LLMs) and probabilistic heuristic agents. In MAGNIOM, **probabilistic generative AI is strictly prohibited from clinical target calculation and ranking** (SRS §37, Target Engine §159):
- The Target Engine core is a mathematically pure function: identical patient inputs, evidence libraries, and policy releases produce 100% bit-for-bit identical coordinates and SHA-256 digests across repeated executions.
- Target coordinates are derived solely from stereotactically validated evidence, anatomical constraints, and calibrated multimodal measurements to eliminate seizure induction and adverse stimulation risks.

---

# 106. FINAL v2 GOVERNING RULE

> **MAGNIOM v2 shall not ask “where should this diagnosis be stimulated?” It shall ask which therapeutic objective is being pursued, what evidence supports stimulation for that objective in this population and disease stage, what target geometry that evidence actually used, what patient-specific measurements can validly refine that target, how reliable those measurements are, what contextual treatment assumptions apply, and what competing target hypotheses should remain visible to the specialist.**

That is the architectural transition from:

# an MDD connectome-targeting MVP

to:

# a general, scientifically governed TMS target-decision platform.

---

# 107. MAGNIOM v2 MANIFESTO

# One platform, multiple indication models.

# One Target Slate concept, multiple target geometries.

# One evidence architecture, indication-specific evidence paths.

# One governance system, independently validated modules.

# Never inherit MDD science into another indication by convenience.

# Never turn a lesion into a target merely because it is visible.

# Never turn a network abnormality into efficacy evidence.

# Never reduce somatotopic targeting to a generic coordinate.

# Never reduce deep TMS to a fictitious point target.

# Never separate a target from treatment context when the evidence depends on that context.

# Never make Research Mode look Clinical.

# Never allow one validated indication to legitimise another.

# Let each indication earn Clinical Mode independently.

# Preserve the specialist as the final clinical authority.

That is **MAGNIOM Multi-Indication Technical & Scientific Architecture Specification v2.0**.