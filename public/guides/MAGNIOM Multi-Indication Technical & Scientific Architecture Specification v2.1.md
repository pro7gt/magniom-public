# MAGNIOM
## Multi-Indication Technical & Scientific Architecture Specification v2.1

**Document status:** Canonical Architecture Release  
**Supersedes:** MAGNIOM Multi-Indication Technical & Scientific Architecture Specification v2.0  
**Version:** 2.1  
**Date:** 11 September 2026  
**Product stage:** Functional MVP → multi-indication research, validation and controlled clinical-release platform  
**Primary purpose:** Connectome-, anatomy-, evidence-, phenotype- and systems-informed TMS target decision support  
**Primary user:** Appropriately trained neuromodulation specialist  
**Clinical authority:** Human clinician  
**Architecture class:** Governed multi-indication neuromodulation decision-support platform  

---

# 1. EXECUTIVE DEFINITION

MAGNIOM v2.1 extends the v2.0 modular architecture by introducing a first-class:

# **Triple-Network Systems Layer**

representing:

- Central Executive Network (CEN);
- Default Mode Network (DMN);
- Salience Network (SN);
- CEN–DMN interaction;
- SN–CEN interaction;
- SN–DMN interaction;
- network configuration;
- normative network context;
- network reliability;
- network evidence provenance;
- network interpretation;
- network-to-therapeutic-circuit relationships.

The fundamental MAGNIOM model remains:

```text
Evidence constrains.
Phenotype prioritises.
Therapeutic circuits define the clinical hypothesis.
Patient measurement refines.
Triple-network configuration provides systems context.
Reliability qualifies.
Anatomy constrains.
E-field characterises/optimises where validated.
Alternatives expose uncertainty.
The specialist decides.
```

The central v2.1 architectural addition is:

```text
Therapeutic Circuit
        ↓
Patient Connectomics
        ↓
Triple-Network Systems Layer
        ↓
Governed Context
        ↓
Target Engine
```

The Triple-Network Systems Layer SHALL NOT become an autonomous target generator.

---

# 2. v2.1 GOVERNING PRINCIPLE

MAGNIOM has:

# **one governance architecture, multiple indication models, and a shared systems-neuroscience layer whose clinical authority is independently governed.**

Shared across indications:

- provenance;
- evidence tiers;
- ScientificPolicyRelease;
- immutable snapshots;
- candidate explainability;
- measurement reliability;
- network reliability;
- Target Slate;
- uncertainty;
- clinician decision;
- audit;
- Research/Clinical separation;
- release governance;
- Triple-Network semantic infrastructure.

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
- outcome measures;
- permitted network relationships;
- permitted network features;
- network clinical authority.

---

# 3. CORE SCIENTIFIC MODEL

MAGNIOM SHALL maintain a strict distinction between:

```text
Clinical phenotype
```

```text
Therapeutic objective
```

```text
Therapeutic circuit
```

```text
Network configuration
```

```text
Stimulation target
```

These are different scientific objects.

The canonical relationship is:

```text
Clinical phenotype
        ↓
Therapeutic objective
        ↓
Evidence
        ↓
Therapeutic circuit
        ↓
Candidate target family
        ↓
Patient-specific measurement
        ↓
Network systems context
        ↓
Reliability / anatomy / E-field
        ↓
Target Slate
        ↓
Specialist decision
```

---

# 4. CRITICAL DISTINCTION — NETWORK ≠ TARGET

MAGNIOM SHALL NOT implement:

```text
network abnormality
        ↓
network target
        ↓
clinical recommendation
```

as a default Clinical Mode pathway.

In particular:

```text
CEN abnormality
    ≠
stimulate CEN
```

```text
DMN abnormality
    ≠
suppress DMN
```

```text
SN abnormality
    ≠
stimulate SN
```

Network systems are distributed biological systems.

A TMS target is an anatomical stimulation construct intended to engage a therapeutic circuit under a particular stimulation context.

Therefore:

```text
Network
    ≠
Therapeutic Circuit
    ≠
Target Geometry
```

---

# 5. NO DETERMINISTIC "SEESAW" MODEL

MAGNIOM SHALL NOT encode a simplistic causal model such as:

```text
DMN ↑
CEN ↓
SN dysfunctional
        ↓
stimulate CEN
        ↓
DMN turns off
        ↓
clinical improvement
```

as a Clinical Mode targeting rule.

The Triple-Network model is instead represented as:

```text
distributed network configuration
+
pairwise relationships
+
therapeutic circuit relationships
+
measurement reliability
+
evidence provenance
+
clinical context
```

This is a systems hypothesis, not a universal patient-specific causal controller.

---

# 6. ARCHITECTURAL LAYERS

MAGNIOM v2.1 SHALL contain the following logical layers:

```text
┌─────────────────────────────────────────────┐
│             CLINICAL APPLICATION             │
└───────────────────────┬─────────────────────┘
                        ↓
┌─────────────────────────────────────────────┐
│             CASE / PHENOTYPE LAYER           │
└───────────────────────┬─────────────────────┘
                        ↓
┌─────────────────────────────────────────────┐
│             INDICATION MODULE                │
└───────────────────────┬─────────────────────┘
                        ↓
┌─────────────────────────────────────────────┐
│             EVIDENCE KNOWLEDGE SYSTEM        │
└───────────────────────┬─────────────────────┘
                        ↓
┌─────────────────────────────────────────────┐
│             THERAPEUTIC CIRCUIT LAYER        │
└───────────────────────┬─────────────────────┘
                        ↓
┌─────────────────────────────────────────────┐
│             MEASUREMENT LAYER                │
└───────────────────────┬─────────────────────┘
                        ↓
┌─────────────────────────────────────────────┐
│       TRIPLE-NETWORK SYSTEMS LAYER           │
│                                               │
│ CEN       DMN       SN                       │
│    \       |       /                         │
│      pairwise relationships                  │
│                                               │
│ configuration · normative context            │
│ reliability · evidence provenance            │
└───────────────────────┬─────────────────────┘
                        ↓
┌─────────────────────────────────────────────┐
│             TARGET ENGINE                    │
└───────────────────────┬─────────────────────┘
                        ↓
┌─────────────────────────────────────────────┐
│       ANATOMY / E-FIELD / REDUNDANCY         │
└───────────────────────┬─────────────────────┘
                        ↓
┌─────────────────────────────────────────────┐
│               TARGET SLATE                   │
└───────────────────────┬─────────────────────┘
                        ↓
┌─────────────────────────────────────────────┐
│            SPECIALIST DECISION               │
└─────────────────────────────────────────────┘
```

---

# 7. PLATFORM SUPPORT IS NOT CLINICAL VALIDATION

The v2.0 rule remains unchanged.

A technically implemented network feature does not become clinically authorised merely because it exists.

The following states SHALL remain distinct:

```ts
type ScientificFeatureStatus =
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

This applies to:

- indication modules;
- network definitions;
- network metrics;
- normative models;
- network-target relationships;
- network ranking features.

---

# 8. INDICATION MODULE ARCHITECTURE

The canonical object remains:

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

  network_context_policy_id?: UUID;

  limitations: string[];

  validation_evidence_ids: UUID[];

  manifest_sha256: SHA256;
}
```

v2.1 adds:

```text
network_context_policy_id
```

This allows every indication to define whether and how Triple-Network context may be used.

---

# 9. INDICATION MODULE RELEASE

Modules remain immutable.

Examples:

```text
MAGNIOM-IND-MDD-1.0.0
MAGNIOM-IND-OCD-1.0.0
MAGNIOM-IND-PAIN-NP-1.0.0
MAGNIOM-IND-STROKE-MOTOR-1.0.0
MAGNIOM-IND-STROKE-APHASIA-1.0.0
MAGNIOM-IND-TBI-DEP-1.0.0
MAGNIOM-IND-TINNITUS-1.0.0
```

A network feature SHALL NOT become active for an indication unless the module release explicitly references an approved network policy.

---

# 10. MULTI-CONDITION CASES

A Case may contain:

```text
MDD
+
neuropathic pain
+
previous stroke
```

but MAGNIOM SHALL NOT merge those into one universal targeting objective.

Canonical representation:

```text
Case
├── CaseIndication A
├── CaseIndication B
└── CaseIndication C
```

Each Target Slate SHALL identify:

```text
one primary indication
+
one indication module release
+
one principal clinical objective set
```

The Triple-Network Profile may be shared as a measurement artifact where scientifically appropriate, but its interpretation SHALL remain indication-specific.

---

# 11. CLINICAL OBJECTIVE

The existing `ClinicalObjective` abstraction remains mandatory.

The architecture distinguishes:

```text
clinical objective
```

from:

```text
brain network
```

and:

```text
therapeutic circuit
```

Example:

```text
reduce depressive symptoms
        ↓
therapeutic circuit
        ↓
candidate target
```

not:

```text
CEN dysfunction
        ↓
clinical objective
```

---

# 12. DISEASE-STAGE CONTEXT

`DiseaseStageContext` remains indication-specific.

```ts
interface DiseaseStageContext {
  onset_date?: Date;

  current_stage: string;

  stage_definition_id: UUID;

  confidence: QualitativeConfidence;
}
```

Network interpretation MAY depend on disease stage, but this relationship must be explicitly represented in evidence.

MAGNIOM SHALL NOT assume that the same network configuration has the same therapeutic significance across:

- acute;
- subacute;
- chronic;
- remission;
- relapse;
- treatment-resistant;
- post-intervention

states.

---

# 13. LESION CONTEXT

Lesion-aware architecture remains unchanged.

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

A Triple-Network Profile generated from a substantially distorted brain SHALL explicitly incorporate structural-registration limitations.

---

# 14. TARGET GEOMETRY MODEL

v2.1 retains:

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

However:

# `NetworkTargetDefinition` SHALL NOT be interpreted as "stimulate a network."

It represents a formal definition of a target whose therapeutic rationale may be network-mediated.

Where possible, target geometry should remain anatomically explicit.

---

# 15. THERAPEUTIC CIRCUIT AS THE BRIDGE

The Therapeutic Circuit is the primary bridge between evidence and network systems.

Canonical:

```text
Evidence
    ↓
Therapeutic Circuit
    ↓
Network Context
    ↓
Target
```

A therapeutic circuit may have:

```text
primary network association
secondary network associations
network interaction relationships
evidence claims
clinical authority
```

---

# 16. THERAPEUTIC CIRCUIT NETWORK CONTEXT

New canonical object:

```ts
interface TherapeuticCircuitNetworkContext {
  id: UUID;

  therapeutic_circuit_id: UUID;

  network_system_id: UUID;

  relationship_type:
    | "embedded"
    | "intersects"
    | "connects"
    | "modulates"
    | "associated_with";

  indication_id?: UUID;

  clinical_objective_id?: UUID;

  evidence_claim_ids: UUID[];

  evidence_level:
    | "A"
    | "B"
    | "C"
    | "D"
    | "R";

  clinical_authority:
    | "clinical"
    | "contextual"
    | "research";
}
```

---

# 17. TRIPLE-NETWORK SYSTEMS LAYER

The new platform-level subsystem is:

# `TripleNetworkSystemsLayer`

It is responsible for:

1. network definitions;
2. network measurements;
3. pairwise relationships;
4. network configuration;
5. normative context;
6. reliability;
7. evidence provenance;
8. interpretation;
9. candidate contextualisation;
10. governed Target Engine integration.

---

# 18. CANONICAL NETWORK SYSTEMS

The initial canonical systems are:

```text
MAGNIOM-NET-CEN
MAGNIOM-NET-DMN
MAGNIOM-NET-SN
```

Each is a first-class `NetworkSystem`.

---

# 19. `NetworkSystem`

```ts
interface NetworkSystem {
  id: UUID;

  code:
    | "CEN"
    | "DMN"
    | "SN";

  name: string;

  description: string;

  definition_id: UUID;

  version: string;

  status:
    | "active"
    | "deprecated"
    | "research_only";
}
```

---

# 20. NETWORK DEFINITION

```ts
interface NetworkDefinition {
  id: UUID;

  network_system_id: UUID;

  version: string;

  atlas_id: UUID;

  atlas_version: string;

  membership_method: string;

  membership_parameters: JSON;

  source_evidence_claim_ids: UUID[];

  definition_hash: SHA256;

  effective_from: ISO8601UTC;

  status:
    | "validated"
    | "provisional"
    | "research";
}
```

Network definitions SHALL be versioned.

Changes to network membership create a new definition release.

---

# 21. CEN

The canonical CEN representation SHALL be distributed.

It may include:

- canonical parcels;
- cortical regions;
- network membership;
- hemispheric representation;
- reference connectivity;
- evidence provenance.

MAGNIOM SHALL NOT define CEN as a single anatomical coordinate.

---

# 22. DMN

The canonical DMN representation SHALL be distributed.

It may include:

- canonical parcels;
- cortical regions;
- network membership;
- reference connectivity;
- evidence provenance;
- uncertainty.

MAGNIOM SHALL NOT equate "DMN" with one region.

---

# 23. SN

The canonical SN representation SHALL be distributed.

It may include:

- canonical parcels;
- cortical regions;
- network membership;
- reference connectivity;
- evidence provenance;
- uncertainty.

MAGNIOM SHALL NOT equate "SN" with one stimulation target.

---

# 24. PAIRWISE NETWORK RELATIONSHIPS

Three canonical relationships are required:

```text
CEN ↔ DMN
SN  ↔ CEN
SN  ↔ DMN
```

These are first-class scientific relationships.

---

# 25. `NetworkRelationship`

```ts
interface NetworkRelationship {
  id: UUID;

  network_a_id: UUID;

  network_b_id: UUID;

  relationship_code:
    | "CEN_DMN"
    | "SN_CEN"
    | "SN_DMN";

  metric_code: string;

  metric_version: string;

  directionality:
    | "undirected"
    | "directed"
    | "not_applicable";

  normative_reference_id?: UUID;

  evidence_claim_ids: UUID[];

  status:
    | "validated"
    | "provisional"
    | "research";
}
```

---

# 26. WITHIN-NETWORK MEASUREMENTS

MAGNIOM may calculate:

```text
CEN within-network integrity
DMN within-network integrity
SN within-network integrity
```

and other approved network-specific measures.

However, the platform SHALL preserve:

```text
metric
+
method
+
raw value
+
normalisation
+
reliability
```

rather than reducing the network to an opaque score.

---

# 27. BETWEEN-NETWORK MEASUREMENTS

For each pair:

```text
CEN–DMN
SN–CEN
SN–DMN
```

MAGNIOM may calculate approved measures such as:

- mean cross-network connectivity;
- network coupling;
- segregation;
- integration;
- partial correlation;
- other explicitly versioned metrics.

Each metric SHALL retain its scientific definition.

---

# 28. `NetworkInteractionMeasurement`

```ts
interface NetworkInteractionMeasurement {
  id: UUID;

  relationship_id: UUID;

  metric_code: string;

  raw_value: number;

  normalized_value?: number;

  normative_deviation?: number;

  unit?: string;

  measurement_run_id: UUID;

  reliability_profile_id: UUID;

  interpretation_status:
    | "supportive"
    | "neutral"
    | "contradictory"
    | "uncertain"
    | "not_interpretable";
}
```

---

# 29. NETWORK CONFIGURATION

The principal systems-level object is:

# `NetworkConfiguration`

It represents the patient's relational network state.

It SHALL NOT be a single score.

```ts
interface NetworkConfiguration {
  id: UUID;

  case_id: UUID;

  connectome_run_id: UUID;

  network_definition_release_id: UUID;

  metric_release_id: UUID;

  within_network_measurements:
    NetworkMeasurement[];

  pairwise_relationships:
    NetworkInteractionMeasurement[];

  global_integration?: ScientificMeasurement;

  global_segregation?: ScientificMeasurement;

  normative_context?: NormativeNetworkContext;

  reliability_profile_id: UUID;

  interpretation_status:
    | "interpretable"
    | "partially_interpretable"
    | "uncertain"
    | "not_qualified";

  clinical_use:
    | "contextual"
    | "qualified_contextual"
    | "research_only";
}
```

---

# 30. NO `TRIPLE_NETWORK_SCORE`

MAGNIOM SHALL NOT create a canonical:

```text
TripleNetworkScore
```

for Clinical Mode.

The canonical patient representation is:

```text
CEN state
DMN state
SN state

CEN ↔ DMN
SN  ↔ CEN
SN  ↔ DMN

+
normative context
+
reliability
+
evidence provenance
```

This preserves the relational architecture.

---

# 31. `TripleNetworkProfile`

The clinician-facing canonical object is:

```ts
interface TripleNetworkProfile {
  id: UUID;

  case_id: UUID;

  network_configuration_id: UUID;

  network_definition_release_id: UUID;

  metric_release_id: UUID;

  cen: NetworkState;

  dmn: NetworkState;

  sn: NetworkState;

  cen_dmn: NetworkRelationshipState;

  sn_cen: NetworkRelationshipState;

  sn_dmn: NetworkRelationshipState;

  integration?: ScientificMeasurement;

  segregation?: ScientificMeasurement;

  reliability: NetworkReliabilityProfile;

  normative_context?: NormativeNetworkContext;

  evidence_context: NetworkEvidenceContext;

  interpretation: NetworkInterpretation;

  clinical_authority:
    | "contextual"
    | "qualified_contextual"
    | "research";

  version: string;

  profile_hash: SHA256;
}
```

---

# 32. NETWORK RELIABILITY

Network information SHALL never be treated as clinically meaningful without reliability qualification.

Canonical object:

```ts
interface NetworkReliabilityProfile {
  id: UUID;

  acquisition_quality: ReliabilityComponent;

  preprocessing_reliability: ReliabilityComponent;

  within_network_reliability: ReliabilityComponent;

  pairwise_reliability: {
    cen_dmn: ReliabilityComponent;
    sn_cen: ReliabilityComponent;
    sn_dmn: ReliabilityComponent;
  };

  normative_compatibility: ReliabilityComponent;

  atlas_sensitivity: ReliabilityComponent;

  preprocessing_sensitivity: ReliabilityComponent;

  cross_run_stability?: ReliabilityComponent;

  overall_status:
    | "high"
    | "moderate"
    | "limited"
    | "insufficient";

  clinical_qualification:
    | "qualified"
    | "qualified_with_caution"
    | "context_only"
    | "research_only";
}
```

---

# 33. RELIABILITY HIERARCHY

The architecture SHALL distinguish:

```text
Acquisition quality
        ↓
Preprocessing quality
        ↓
Measurement reliability
        ↓
Cross-run stability
        ↓
Atlas sensitivity
        ↓
Normative compatibility
        ↓
Clinical qualification
```

High numerical precision does not imply high biological reliability.

---

# 34. NETWORK EVIDENCE PROVENANCE

Every clinically interpretable network statement SHALL be traceable:

```text
Source
 ↓
EvidenceClaim
 ↓
NetworkEvidenceClaim
 ↓
NetworkSystem / Relationship
 ↓
NetworkConfiguration
 ↓
Interpretation
 ↓
Target Context
```

The evidence graph therefore becomes auditable from published source to clinician-facing statement.

---

# 35. `NetworkEvidenceClaim`

```ts
interface NetworkEvidenceClaim {
  id: UUID;

  evidence_claim_id: UUID;

  network_system_ids: UUID[];

  relationship_ids?: UUID[];

  indication_id?: UUID;

  clinical_objective_id?: UUID;

  claim_type:
    | "association"
    | "phenotype_relationship"
    | "circuit_relationship"
    | "target_relationship"
    | "mechanistic"
    | "predictive"
    | "causal"
    | "safety"
    | "negative"
    | "conflicting";

  evidence_level:
    | "A"
    | "B"
    | "C"
    | "D"
    | "R";

  population_scope: string;

  methodology: string;

  directionality?: string;

  applicability:
    | "direct"
    | "partial"
    | "indirect"
    | "research";

  provenance_refs: EvidenceProvenanceRef[];

  approved_for:
    | "clinical_context"
    | "clinical_refinement"
    | "research_only";
}
```

---

# 36. NETWORK EVIDENCE HIERARCHY

MAGNIOM SHALL distinguish:

### A — Network association

A disorder is associated with altered network organisation.

### B — Network–phenotype relationship

A network configuration is associated with a clinical phenotype.

### C — Network–therapeutic-circuit relationship

A therapeutic circuit has an evidence-supported relationship with a network configuration.

### D — Network-guided targeting

Patient-specific network configuration identifies a superior stimulation target.

### E — Mechanistic/causal evidence

Changing the network relationship produces a clinically meaningful therapeutic effect.

These claims are not interchangeable.

---

# 37. EVIDENCE CEILING

The Triple-Network layer inherits MAGNIOM's evidence ceiling principle.

A patient-specific network measurement SHALL NOT elevate weak literature into strong clinical evidence.

Therefore:

```text
excellent network measurement
+
research-level evidence
=
research interpretation
```

not:

```text
excellent network measurement
→ clinical target
```

---

# 38. NETWORK EVIDENCE CONFLICT

The system SHALL preserve:

- supporting claims;
- negative claims;
- conflicting claims;
- population mismatch;
- methodological limitations.

```ts
interface NetworkEvidenceContext {
  supporting_claim_ids: UUID[];

  negative_claim_ids: UUID[];

  conflicting_claim_ids: UUID[];

  evidence_level_ceiling:
    | "A"
    | "B"
    | "C"
    | "D"
    | "R";

  applicability:
    | "strong"
    | "moderate"
    | "limited"
    | "uncertain";

  interpretation: string;
}
```

---

# 39. NEUROIMAGING ARCHITECTURE

The v2 multimodal architecture remains:

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

The Triple-Network Systems Layer primarily consumes appropriately qualified functional-connectomic measurements but remains modality-agnostic at the platform level.

---

# 40. TRIPLE-NETWORK COMPUTATION PIPELINE

The neuroimaging pipeline SHALL include:

# **Large-Scale Network & Triple-Network Analysis**

Canonical sequence:

```text
BOLD
 ↓
QC
 ↓
Denoising
 ↓
Surface / parcel representation
 ↓
FC matrix
 ↓
Network definition mapping
 ↓
CEN measurements
DMN measurements
SN measurements
 ↓
CEN–DMN
SN–CEN
SN–DMN
 ↓
Network Configuration
 ↓
Normative Context
 ↓
Network Reliability
 ↓
Triple-Network Profile
```

---

# 41. NETWORK COMPUTATION SHALL USE FROZEN INPUTS

A Triple-Network Profile SHALL record:

```text
acquisition version
preprocessing version
denoising version
atlas version
network definition version
metric version
normative model version
reliability version
```

No target may silently move because the network computation pipeline changed.

---

# 42. DENOISING DEPENDENCE

Network measures are conditional on preprocessing.

Therefore:

```text
NetworkMetric(
    FC,
    preprocessing_release,
    network_definition,
    metric_release
)
```

is the canonical scientific object.

A metric calculated under one preprocessing pipeline SHALL NOT automatically be treated as equivalent to the same metric under another.

---

# 43. NORMATIVE NETWORK CONTEXT

Where validated:

```text
Patient measurement
        ↓
Approved normative model
        ↓
Normative deviation
        ↓
Network context
```

Normative deviation SHALL NOT automatically imply:

```text
pathology
```

and SHALL NOT automatically generate:

```text
target
```

---

# 44. NORMATIVE MODEL COMPATIBILITY

Each network normative model must define:

- population;
- acquisition;
- preprocessing;
- atlas;
- metric;
- age range;
- sex handling where applicable;
- statistical model;
- validity scope.

An incompatible normative model SHALL NOT be used for Clinical interpretation.

---

# 45. TARGET ENGINE v2.1

The Target Engine architecture becomes:

```text
TargetEngineCore
        +
IndicationModule
        +
ScientificPolicyRelease
        +
Evidence Knowledge System
        +
Measurement / Reliability Context
        +
Triple-Network Systems Context
        +
CandidateGenerator plugins
```

The core retains:

- evidence gating;
- determinism;
- provenance;
- ranking infrastructure;
- redundancy;
- alternatives;
- abstention;
- explanation;
- convergence;
- slate assembly.

---

# 46. RESOLVED TARGETING CONTEXT

The canonical execution context becomes:

```ts
interface ResolvedTargetingContext {
  case_id: UUID;

  indication_module_release_id: UUID;

  clinical_objective_snapshot_id: UUID;

  phenotype_snapshot_id: UUID;

  evidence_library_release_id: UUID;

  scientific_policy_release_id: UUID;

  measurement_bundle_id: UUID;

  reliability_bundle_id?: UUID;

  triple_network_profile_id?: UUID;

  target_engine_version_id: UUID;

  device_context?: DeviceContext[];
}
```

The Target Engine SHALL consume a frozen `TripleNetworkProfile`, not raw network parameters.

---

# 47. TRIPLE-NETWORK CONTEXT CONTRACT

```ts
interface TripleNetworkTargetContext {
  profile_id: UUID;

  configuration: NetworkConfiguration;

  reliability: NetworkReliabilityProfile;

  evidence_context: NetworkEvidenceContext;

  candidate_relationships:
    CandidateNetworkRelationship[];

  policy_status:
    | "contextual"
    | "qualified_contextual"
    | "research_only";
}
```

---

# 48. TARGET ENGINE PIPELINE v2.1

Canonical execution order:

```text
VERIFY INPUT MANIFEST
        ↓
RESOLVE INDICATION
        ↓
VERIFY POLICY
        ↓
VERIFY MODE
        ↓
CLINICAL OBJECTIVE
        ↓
EVIDENCE PATH
        ↓
THERAPEUTIC CIRCUIT
        ↓
CANDIDATE GENERATION
        ↓
PATIENT CONNECTOMICS
        ↓
TRIPLE-NETWORK CONTEXT
        ↓
RELIABILITY
        ↓
NORMATIVE CONTEXT
        ↓
ANATOMY
        ↓
E-FIELD
        ↓
EVIDENCE CEILING
        ↓
ROLE UTILITY
        ↓
PERSONALISATION
        ↓
NETWORK CONVERGENCE
        ↓
REDUNDANCY
        ↓
SLATE
        ↓
EXPLANATION
        ↓
IMMUTABLE PUBLISH
```

---

# 49. TRIPLE NETWORK IS NOT A CANDIDATE GENERATOR

Clinical Mode SHALL NOT permit:

```text
TripleNetworkSystemsLayer
        ↓
CandidateGenerator
```

directly.

Instead:

```text
CandidateGenerator
        ↓
candidate
        ↓
TripleNetworkSystemsLayer
        ↓
context
```

This ordering is mandatory.

---

# 50. GOVERNED CONTEXTUAL ROLE

The default Clinical Mode role of Triple-Network information is:

# **Governed Contextual Modifier**

It may contribute to:

- explanation;
- convergence;
- uncertainty;
- qualification;
- comparison;
- future validated ranking features;
- personalisation eligibility.

It SHALL NOT silently become a ranking score.

---

# 51. NO HIDDEN NETWORK SCORE

MAGNIOM SHALL NOT implement:

```text
TargetScore =
Evidence
+
Phenotype
+
Connectomics
+
TripleNetworkScore
+
EField
```

This would create an opaque and difficult-to-govern clinical ranking function.

Instead:

```text
Evidence
    → eligibility / ceiling

Phenotype
    → clinical relevance

Therapeutic Circuit
    → candidate generation

Individual Connectivity
    → patient refinement

Triple Network
    → systems context

Reliability
    → confidence

Anatomy / E-field
    → stimulability

Scientific Policy
    → permitted influence
```

---

# 52. NETWORK CONTEXT STATUS

Every candidate may have:

```text
network_context =
    supportive
    neutral
    contradictory
    uncertain
    unavailable
```

These statuses are descriptive and policy-governed.

---

# 53. `CandidateNetworkRelationship`

```ts
interface CandidateNetworkRelationship {
  id: UUID;

  candidate_id: UUID;

  network_system_id: UUID;

  relationship_type:
    | "direct"
    | "indirect"
    | "circuit_mediated"
    | "contextual"
    | "not_established";

  strength?: ScientificMeasurement;

  reliability: ReliabilityComponent;

  evidence_claim_ids: UUID[];

  interpretation:
    | "supportive"
    | "neutral"
    | "contradictory"
    | "uncertain";

  clinical_authority:
    | "clinical_context"
    | "qualified_context"
    | "research_only";
}
```

---

# 54. NETWORK CONVERGENCE

The Triple-Network layer extends MAGNIOM's convergence model.

Potential convergence sources:

```text
Evidence
Phenotype
Therapeutic Circuit
Individual Connectivity
Triple Network
Normative Context
Anatomy
E-field
```

High convergence means:

> independent information sources support a coherent candidate interpretation.

It does NOT mean:

> increased predicted treatment response.

---

# 55. CONVERGENCE SHALL NOT CREATE DUPLICATES

If:

```text
Evidence
+
Phenotype
+
Patient Connectivity
+
Triple Network
+
E-field
```

all converge on one target, MAGNIOM SHALL preferably produce:

```text
one target
+
strong convergence explanation
```

rather than multiple targets representing the same scientific conclusion.

---

# 56. NETWORK-AWARE REDUNDANCY

Redundancy may consider:

- spatial overlap;
- E-field overlap;
- therapeutic-circuit similarity;
- clinical objective;
- network overlap;
- pairwise network engagement.

However:

> Network overlap is not equivalent to therapeutic equivalence.

---

# 57. NETWORK OVERLAP MODEL

A candidate comparison may include:

```ts
interface NetworkOverlap {
  cen: number;
  dmn: number;
  sn: number;

  cen_dmn: number;
  sn_cen: number;
  sn_dmn: number;
}
```

These values are comparison features, not direct efficacy estimates.

---

# 58. PERSONALISATION

Personalisation must continue to earn its place.

Triple-Network context may support patient-specific refinement only when:

```text
same evidence family
+
qualified network reliability
+
validated relationship
+
meaningful incremental information
+
policy authorisation
+
no major contradiction
```

Otherwise:

```text
network = contextual only
```

---

# 59. PERSONALISATION MAJOR DIVERGENCE

If:

```text
Therapeutic Circuit
+
Individual FC
+
Triple-Network Configuration
```

materially disagree, MAGNIOM SHALL expose:

```text
PERSONALISATION_MAJOR_DIVERGENCE
```

rather than manufacture certainty.

---

# 60. NETWORK-BASED ABSTENTION

If network context is optional:

```text
network unavailable
        ↓
target generation continues
        ↓
network context omitted
```

If network information is mandatory under an approved evidence path:

```text
network unavailable
        ↓
required gate failure
```

The distinction SHALL be policy-defined.

---

# 61. NETWORK FAILURE STATES

Canonical warnings:

```text
TRIPLE_NETWORK_CONTEXT_UNAVAILABLE
TRIPLE_NETWORK_LOW_RELIABILITY
TRIPLE_NETWORK_PARTIAL
TRIPLE_NETWORK_EVIDENCE_LIMITED
TRIPLE_NETWORK_EVIDENCE_CONFLICT
TRIPLE_NETWORK_NORMATIVE_INCOMPATIBLE
TRIPLE_NETWORK_RESEARCH_ONLY
TRIPLE_NETWORK_FEATURE_POLICY_BLOCKED
TRIPLE_NETWORK_PERSONALISATION_NOT_QUALIFIED
TRIPLE_NETWORK_CONFIGURATION_UNCERTAIN
```

---

# 62. CLINICAL FALLBACK

When Triple-Network information fails but the evidence baseline remains valid:

```text
Evidence-based target
        +
network context unavailable
```

is acceptable.

MAGNIOM SHALL NOT manufacture a network-based alternative merely because the network layer is incomplete.

---

# 63. RESEARCH MODE

Research Mode may explore:

- network configurations;
- dynamic CEN/DMN/SN relationships;
- network state transitions;
- network-to-target relationships;
- network-guided target hypotheses;
- network mediation;
- target-induced network change;
- response prediction;
- longitudinal network trajectories.

All such features SHALL remain explicitly marked as Research unless independently validated.

---

# 64. RESEARCH LABEL

Research output SHALL state:

> **RESEARCH HYPOTHESIS — NOT A VALIDATED CLINICAL TARGET RECOMMENDATION**

This label SHALL remain persistent throughout the Research workflow.

---

# 65. NO RESEARCH → CLINICAL LEAKAGE

Promotion path:

```text
Research observation
        ↓
Evidence validation
        ↓
Scientific Policy
        ↓
Indication Module
        ↓
Clinical validation
        ↓
Clinical Release Candidate
        ↓
Clinical activation
```

No shortcut is permitted.

---

# 66. CLINICAL AUTHORITY MATRIX

| Feature | Research | Clinical Context | Clinical Ranking |
|---|---:|---:|---:|
| CEN state | Yes | Policy | Policy |
| DMN state | Yes | Policy | Policy |
| SN state | Yes | Policy | Policy |
| CEN–DMN | Yes | Policy | Policy |
| SN–CEN | Yes | Policy | Policy |
| SN–DMN | Yes | Policy | Policy |
| Network segregation | Yes | Policy | Policy |
| Network integration | Yes | Policy | Policy |
| Dynamic network state | Yes | Initially No | No |
| Network anomaly | Yes | Context | No |
| Network → target | Hypothesis | No | No |
| Network → explanation | Yes | Yes | N/A |
| Network → convergence | Yes | If qualified | N/A |

---

# 67. SCIENTIFIC POLICY EXTENSION

`ScientificPolicyRelease` SHALL explicitly govern network use.

```ts
interface TripleNetworkPolicy {
  enabled: boolean;

  allowed_network_definitions: UUID[];

  allowed_metric_releases: UUID[];

  minimum_reliability: ReliabilityLevel;

  allowed_clinical_roles:
    NetworkClinicalRole[];

  allowed_indications: UUID[];

  allowed_objectives: UUID[];

  dynamic_metrics_allowed: boolean;

  ranking_features:
    NetworkRankingFeaturePolicy[];
}
```

---

# 68. NETWORK FEATURE POLICY

```ts
interface NetworkRankingFeaturePolicy {
  feature_code: string;

  indication_id: UUID;

  clinical_objective_id?: UUID;

  evidence_ceiling: EvidenceLevel;

  minimum_reliability: ReliabilityLevel;

  allowed_role:
    | "context"
    | "tie_break"
    | "ranking_feature"
    | "candidate_refinement";

  validation_reference_ids: UUID[];

  policy_release_id: UUID;
}
```

No frontend may modify these parameters.

---

# 69. INDICATION-SPECIFIC NETWORK POLICY

A network relationship may be:

```text
Clinical Context
```

for one indication and:

```text
Research Only
```

for another.

For example:

```text
MDD
CEN–DMN → qualified contextual

Tinnitus
CEN–DMN → research only
```

This prevents cross-indication scientific leakage.

---

# 70. MULTI-INDICATION NETWORK REUSE

The anatomical/network definition may be shared.

The interpretation SHALL NOT automatically be shared.

Canonical distinction:

```text
Network Definition
        ↓
shared infrastructure

Network Evidence Claim
        ↓
indication-specific

Network Clinical Policy
        ↓
indication-specific
```

---

# 71. MDD

For MDD, the initial architecture may support:

```text
dysphoric phenotype
        ↓
dysphoric therapeutic circuit
        ↓
DLPFC-related therapeutic targeting
        ↓
Triple-Network context
```

and:

```text
anxiosomatic phenotype
        ↓
anxiosomatic therapeutic circuit
        ↓
appropriate target family
        ↓
Triple-Network context
```

The Triple-Network layer remains contextual unless and until specific network features earn Clinical authority.

---

# 72. NEUROPATHIC PAIN

The Pain Module remains:

```text
body region
        ↓
somatotopic M1
        ↓
patient motor map
        ↓
target
```

Pain-network findings may be represented within the systems layer.

They SHALL NOT independently generate Clinical prefrontal targets unless separately validated.

---

# 73. STROKE MOTOR

The architecture remains:

```text
lesion
+
stage
+
motor phenotype
+
motor map
+
CST context
        ↓
target strategy
```

Triple-Network context may provide research or qualified contextual information.

It SHALL NOT override lesion anatomy or validated motor evidence.

---

# 74. STROKE APHASIA

The architecture remains:

```text
language phenotype
+
lesion
+
stage
+
language network
+
speech-language therapy context
        ↓
target strategy
```

Triple-Network information may provide contextual systems interpretation.

---

# 75. OCD

OCD remains distinct:

```text
OCD phenotype
+
evidence
+
target family
+
coil/field geometry
+
provocation/context
```

Network information SHALL not replace CoilFieldTarget semantics.

---

# 76. TBI

TBI modules remain Research initially.

Triple-Network findings may be explored but SHALL NOT inherit Clinical MDD network-target logic.

---

# 77. TINNITUS

Tinnitus remains Research Mode.

Network analyses may be sophisticated but SHALL remain:

```text
research_only
```

until appropriate evidence and validation exist.

---

# 78. FIBROMYALGIA

Fibromyalgia remains separate from focal neuropathic pain.

Network findings must not cause automatic inheritance of either:

```text
neuropathic pain targeting
```

or:

```text
MDD targeting
```

---

# 79. MEASUREMENT BUNDLE

The v2 `MeasurementBundle` remains:

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

  qualification_status:
    MeasurementBundleStatus;
}
```

The Triple-Network Profile SHALL reference the specific connectome measurement used.

---

# 80. RELIABILITY BUNDLE

The v2 `ReliabilityBundle` remains:

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

  limiting_factors:
    ReliabilityLimitation[];
}
```

The Triple-Network Reliability Profile is a specialised child of this measurement-reliability architecture.

---

# 81. TARGET RELIABILITY

Target reliability remains separate from network reliability.

Therefore:

```text
TargetReliabilityProfile
```

and:

```text
NetworkReliabilityProfile
```

must not be merged into one scalar.

A target may be:

```text
high target localisation reliability
+
limited network reliability
```

and this distinction must remain visible.

---

# 82. E-FIELD RELATIONSHIP

The Triple-Network layer SHALL remain downstream of candidate generation and upstream of final target interpretation.

E-field modelling answers:

> Can the intended target/circuit region be meaningfully engaged under the specified device and geometry?

Triple-Network analysis answers:

> How does that therapeutic circuit relate to the patient's large-scale network configuration?

They are complementary, not interchangeable.

---

# 83. DEVICE / COIL CONTEXT

Network interpretation SHALL NOT override device constraints.

A network relationship may be scientifically attractive while the associated target is:

```text
inaccessible
poorly stimulable
incompatible with device
```

The candidate remains constrained by anatomy and E-field.

---

# 84. TARGET SLATE v2.1

The Target Slate remains:

```text
maximum 3 primary
+
maximum 2 additional
```

It may contain fewer.

No forced five-target output.

v2.1 adds:

```ts
interface TargetSlateV2_1 {
  indication_module_release_id: UUID;

  primary_clinical_objective_ids: UUID[];

  measurement_bundle_id: UUID;

  reliability_bundle_id?: UUID;

  triple_network_profile_id?: UUID;

  network_context_status?:
    | "supportive"
    | "neutral"
    | "contradictory"
    | "uncertain"
    | "unavailable";

  // existing Target Slate fields...
}
```

---

# 85. SLATE ROLES

Roles remain module-defined.

Available roles include:

```text
evidence_anchor
phenotype_specific
connectome_refinement
somatotopic_target
lesion_network_target
contralesional_strategy
ipsilesional_strategy
field_target
clinical_alternative
network_alternative
research_hypothesis
```

A `network_alternative` SHALL NOT mean:

> a target generated merely because a network is abnormal.

It must be supported by an approved indication-specific evidence path.

---

# 86. TARGET EXPLANATION

Each target should answer:

### Why this target?

```text
Evidence
Phenotype
Therapeutic Circuit
Connectomics
Network Context
Reliability
Anatomy
E-field
```

### Why this target may be wrong?

```text
Evidence limitations
Phenotype uncertainty
Connectivity uncertainty
Network reliability
Network evidence conflict
Anatomical limitations
E-field limitations
Population mismatch
```

---

# 87. NETWORK CONTEXT UI

The clinician workspace shall expose:

# Network Context

Example:

```text
CEN        Strong relevance
DMN        Moderate relevance
SN         Limited

CEN ↔ DMN  Altered
SN ↔ CEN   Within reference
SN ↔ DMN   Uncertain

Reliability
Moderate
```

Expanded:

```text
Interpretation

This candidate therapeutic circuit intersects
with the patient's measured CEN–DMN configuration.

Network findings provide contextual information
and do not independently establish target superiority.
```

---

# 88. PROGRESSIVE DISCLOSURE

The UX SHALL follow:

```text
Summary
   ↓
Interpretation
   ↓
Measurements
   ↓
Reliability
   ↓
Evidence
   ↓
Methodology
   ↓
Provenance
```

The clinician should not be forced to inspect raw network matrices to understand the primary conclusion.

---

# 89. NO NETWORK "HEATMAP THEATRE"

Visualisations must not create false scientific authority.

MAGNIOM SHALL avoid:

- dramatic brain heatmaps without scale;
- unexplained network colours;
- animated "brain activity" suggesting causality;
- single network scores;
- causal arrows without evidence;
- visually exaggerated abnormalities.

Visual prominence must reflect scientific importance, not aesthetic effect.

---

# 90. EVIDENCE GRAPH v2.1

The Evidence Knowledge Graph adds:

```text
NetworkSystem
NetworkDefinition
NetworkRelationship
NetworkEvidenceClaim
NetworkConfiguration
NetworkMetric
```

The expanded evidence path becomes:

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
NetworkSystem / Relationship
 ↓
TargetFamily
 ↓
TargetingStrategy
 ↓
TreatmentContext
 ↓
Outcome
```

The network layer therefore sits between therapeutic circuit and target interpretation rather than replacing either.

---

# 91. EVIDENCE CLAIM DISTINCTIONS

MAGNIOM SHALL distinguish:

```text
"Network X is associated with MDD."
```

from:

```text
"Network X is associated with phenotype Y."
```

from:

```text
"Therapeutic circuit Z intersects Network X."
```

from:

```text
"Network X identifies superior stimulation target Z."
```

from:

```text
"Changing Network X mediates clinical response."
```

These are separate claims requiring separate evidence.

---

# 92. NO CROSS-MODULE CONFIGURATION LEAKAGE

The following remain prohibited:

```text
MDD network reliability
→ stroke
```

```text
MDD network-target relationship
→ TBI
```

```text
Stroke network model
→ pain
```

```text
Research network biomarker
→ Clinical MDD ranking
```

unless explicitly approved by Scientific Policy and the relevant module.

---

# 93. DATABASE ARCHITECTURE v2.1

New or extended entities:

```text
evidence.network_systems
evidence.network_definitions
evidence.network_relationships
evidence.network_evidence_claims

connectomics.network_measurements
connectomics.network_interaction_measurements
connectomics.network_configurations
connectomics.triple_network_profiles
connectomics.network_reliability_profiles

targeting.candidate_network_relationships
targeting.network_context_snapshots
```

Existing v2 entities remain.

---

# 94. RELATIONAL VS JSON STORAGE

Clinically meaningful searchable semantics SHALL remain relational where practical.

Relational:

- network system;
- relationship;
- metric;
- indication;
- network definition;
- reliability status;
- policy;
- clinical authority.

JSON may contain:

- metric-specific parameters;
- algorithm configuration;
- auxiliary measurements;
- research annotations.

Do not place the entire Triple-Network ontology into a single `jsonb` payload.

---

# 95. REPOSITORY ARCHITECTURE v2.1

Recommended structure:

```text
packages/
├── domain/
├── schemas/
├── evidence/
├── scientific-policy/
├── target-engine/
├── indication-core/
│
├── networks/
│   ├── domain/
│   ├── definitions/
│   │   ├── cen/
│   │   ├── dmn/
│   │   └── sn/
│   ├── relationships/
│   ├── metrics/
│   ├── configuration/
│   ├── reliability/
│   ├── provenance/
│   ├── policy/
│   └── tests/
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

# 96. NEUROCOMPUTE STRUCTURE

```text
services/neurocompute/
├── ingestion/
├── structural/
├── bold/
├── connectivity/
├── normative/
├── networks/
│   ├── definitions/
│   ├── metrics/
│   ├── relationships/
│   ├── triple_network/
│   └── reliability/
├── candidate_features/
└── tests/
```

---

# 97. INDICATION PACKAGE

Each indication module retains:

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
network-policy.ts
golden-cases/
```

`network-policy.ts` SHALL describe how the module is permitted to consume Triple-Network context.

---

# 98. PLUGIN SAFETY

Indication plugins SHALL be registered through controlled release manifests.

Clinical Mode SHALL NOT dynamically download arbitrary:

- indication modules;
- network definitions;
- network metrics;
- ranking features.

---

# 99. DETERMINISM

Triple-Network computation SHALL be deterministic.

Identical:

```text
input MRI
+
processing version
+
atlas
+
network definition
+
metric release
+
normative model
+
policy
```

must produce:

```text
identical measurements
identical reliability
identical profile
identical interpretation
identical profile hash
```

The Target Engine then remains deterministic over the frozen context.

---

# 100. NETWORK PROFILE HASH

```text
TripleNetworkProfileHash =
SHA256(
  network_definition
  +
  metric_release
  +
  canonical_measurements
  +
  reliability
  +
  normative_context
  +
  evidence_context
  +
  policy_release
)
```

Canonical floating-point and serialisation rules SHALL be centrally defined.

---

# 101. IMMUTABILITY

Published network profiles SHALL be immutable.

Corrections use:

```text
Profile v1
   ↓
superseded by
   ↓
Profile v2
```

No silent mutation is permitted.

---

# 102. AUDIT EVENTS

The following events SHALL be auditable:

```text
NETWORK_DEFINITION_CREATED
NETWORK_DEFINITION_APPROVED
NETWORK_METRIC_RELEASED
NETWORK_PROFILE_CREATED
NETWORK_PROFILE_QUALIFIED
NETWORK_PROFILE_SUPERSEDED
NETWORK_RELIABILITY_FAILED
NETWORK_CONTEXT_ATTACHED
NETWORK_FEATURE_USED
NETWORK_FEATURE_BLOCKED
NETWORK_POLICY_CHANGED
NETWORK_RESEARCH_INTERPRETATION_CREATED
```

If a network feature influences a Clinical output, the audit trail must identify:

```text
network definition
metric release
profile
reliability
evidence claims
Scientific Policy
Target Engine release
```

---

# 103. SECURITY

Network profiles are clinical/scientific data.

They SHALL receive the same protections as patient connectomics:

- encryption in transit;
- encryption at rest;
- organisation isolation;
- case-level access;
- role-based permissions;
- append-only audit;
- immutable scientific artifacts;
- no unauthorised external processing.

Clinical network data SHALL NOT be transmitted to external generative AI systems for calculation or interpretation.

---

# 104. LLM PROHIBITION

LLMs SHALL NOT:

- calculate CEN/DMN/SN membership;
- calculate network metrics;
- determine network abnormalities;
- determine network reliability;
- alter evidence tiers;
- select network relationships;
- rank clinical targets;
- override Scientific Policy;
- convert network context into a treatment recommendation.

An LLM may eventually assist with wording **after deterministic scientific outputs exist**, subject to separate governance.

---

# 105. API

Canonical endpoint:

```text
GET /cases/:caseId/triple-network
```

Response:

```ts
interface TripleNetworkResponse {
  profile: TripleNetworkProfile;

  network_definitions: NetworkDefinition[];

  relationships: NetworkRelationship[];

  reliability: NetworkReliabilityProfile;

  evidence: NetworkEvidenceClaim[];

  candidate_context?: CandidateNetworkRelationship[];
}
```

The endpoint SHALL enforce:

```text
authentication
+
organisation access
+
case access
+
role capability
+
Clinical/Research authority
```

---

# 106. TARGET GENERATION API

Target generation accepts:

```text
triple_network_profile_id
```

not:

```text
cen_weight
dmn_weight
sn_weight
```

and not arbitrary network instructions from the frontend.

---

# 107. NETWORK POLICY VERSIONING

Any change to:

- network definition;
- network membership;
- network metric;
- preprocessing dependency;
- normative model;
- reliability model;
- network interpretation;
- Clinical ranking use

requires a new governed scientific release.

---

# 108. SCIENTIFIC COMPATIBILITY TUPLE v2.1

The compatibility tuple becomes:

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
NetworkDefinitionRelease(s)
×
NetworkMetricRelease(s)
×
NetworkPolicyRelease
×
Device/Coil capability where relevant
×
Indication
×
Mode
```

Clinical Mode requires an explicitly approved combination.

---

# 109. BACKWARD COMPATIBILITY

Existing MDD Target Slates SHALL remain unchanged.

Historical slates retain:

- original engine;
- original evidence;
- original policy;
- original pipeline;
- original target semantics.

Adding the Triple-Network layer SHALL NOT retroactively alter historical decisions.

---

# 110. MDD REGRESSION REQUIREMENT

Before activating v2.1:

```text
Every approved v1/v2 MDD Golden Case
```

must produce the approved baseline result under the compatibility pathway.

If Triple-Network context is optional and absent from historical inputs:

```text
baseline target output
=
target output without network context
```

apart from explicitly versioned presentation metadata.

---

# 111. SCIENTIFIC CHANGE IMPACT REVIEW

A v2.1 change requires Scientific Change Impact Review if it affects:

```text
network definition
network metric
network reliability
network interpretation
network-target relationship
network policy
ranking
candidate generation
convergence
redundancy
abstention
```

---

# 112. VALIDATION PYRAMID

Network features shall follow:

```text
Schema verification
        ↓
Synthetic Golden Cases
        ↓
Numerical verification
        ↓
Scientific implementation verification
        ↓
Retrospective dataset
        ↓
Silent prospective
        ↓
Clinician-assisted validation
        ↓
Clinical Release Candidate
```

No network feature skips validation because the core platform is already validated.

---

# 113. NETWORK-SPECIFIC VALIDATION

Validation SHALL test:

### Definition validity

Correct CEN/DMN/SN mapping.

### Metric validity

Correct computation.

### Relationship validity

Correct CEN–DMN, SN–CEN, SN–DMN measurements.

### Reliability validity

Unstable measurements are downgraded.

### Normative validity

Compatible normative models only.

### Evidence validity

Evidence claims are correctly linked.

### Policy validity

Unauthorised features are blocked.

### Clinical isolation

Research features cannot affect Clinical Mode.

---

# 114. GOLDEN CASES

Add:

```text
TN-GOLDEN-001
Normal triple-network configuration

TN-GOLDEN-002
Altered CEN–DMN relationship

TN-GOLDEN-003
Altered SN–CEN relationship

TN-GOLDEN-004
Altered SN–DMN relationship

TN-GOLDEN-005
Multiple pairwise alterations

TN-GOLDEN-006
Low network reliability

TN-GOLDEN-007
Strong circuit / weak network convergence

TN-GOLDEN-008
Strong network context / weak therapeutic evidence

TN-GOLDEN-009
Conflicting network evidence

TN-GOLDEN-010
Research-only network feature

TN-GOLDEN-011
Network profile missing

TN-GOLDEN-012
Network profile incompatible with policy

TN-GOLDEN-013
Atlas-sensitive configuration

TN-GOLDEN-014
Preprocessing-sensitive configuration

TN-GOLDEN-015
Network context agrees with evidence anchor

TN-GOLDEN-016
Network context contradicts personalised refinement
```

---

# 115. CRITICAL SAFETY TEST

Construct:

```text
Case A
excellent Triple-Network fit
weak therapeutic evidence

Case B
moderate Triple-Network fit
strong therapeutic evidence
```

Expected:

```text
Case A SHALL NOT displace Case B
solely because of stronger network fit.
```

---

# 116. CRITICAL CONVERGENCE TEST

Construct:

```text
Evidence
+
Phenotype
+
Therapeutic Circuit
+
Individual Connectivity
+
Triple Network
+
E-field
```

all converging on one target.

Expected:

```text
one candidate
+
strong convergence explanation
```

not multiple duplicate candidates.

---

# 117. CRITICAL DIVERGENCE TEST

Construct:

```text
Evidence Anchor
+
patient FC divergence
+
Triple-Network divergence
```

Expected:

```text
Evidence Anchor remains visible
+
personalisation downgraded
+
network contradiction disclosed
+
uncertainty increased
```

No automatic network-driven displacement.

---

# 118. CRITICAL MISSING-NETWORK TEST

Construct:

```text
valid Clinical evidence
+
valid candidate
+
network unavailable
```

Expected:

```text
candidate remains available
+
TRIPLE_NETWORK_CONTEXT_UNAVAILABLE
```

provided network context is not mandatory for that indication.

---

# 119. CRITICAL RESEARCH LEAKAGE TEST

Construct:

```text
Research-only network biomarker
```

and attempt to use it in Clinical Mode.

Expected:

```text
hard rejection
```

and:

```text
TRIPLE_NETWORK_FEATURE_POLICY_BLOCKED
```

---

# 120. CRITICAL EVIDENCE CEILING TEST

Construct:

```text
very strong individual network abnormality
+
weak/Research therapeutic evidence
```

Expected:

```text
network abnormality does not create Clinical target
```

---

# 121. CRITICAL DETERMINISM TEST

Run the same Triple-Network computation:

```text
100 times
```

Expected:

```text
identical profile
identical interpretation
identical hash
```

---

# 122. PROPERTY TEST — POLICY MONOTONICITY

If:

```text
network feature = disabled
```

then:

```text
network feature cannot alter Clinical ranking
```

---

# 123. PROPERTY TEST — RELIABILITY MONOTONICITY

Lower reliability SHALL NOT increase clinical authority.

Example:

```text
High reliability
→ qualified contextual

Low reliability
→ context only

Insufficient
→ research/unavailable
```

Never the reverse.

---

# 124. PROPERTY TEST — EVIDENCE MONOTONICITY

Stronger network fit SHALL NOT compensate for evidence below the Clinical evidence ceiling.

---

# 125. PROPERTY TEST — OPTIONAL CONTEXT INVARIANCE

Where network context is optional:

```text
TargetOutput(
network absent
)
```

must preserve the baseline target decision relative to:

```text
TargetOutput(
network context present
)
```

unless the network feature has been explicitly promoted to a policy-authorised clinical influence.

---

# 126. PROPERTY TEST — RESEARCH ISOLATION

No Research-only network field may influence:

- Clinical candidate generation;
- Clinical ranking;
- Clinical target suppression;
- Clinical slate assembly.

---

# 127. PROPERTY TEST — NETWORK DEFINITION VERSIONING

Changing:

```text
CEN definition
```

must produce:

```text
new NetworkDefinition release
```

and must not mutate historical profiles.

---

# 128. PROPERTY TEST — ATLAS SENSITIVITY

If network configuration changes materially under approved atlas alternatives:

```text
network interpretation
→ uncertainty / limited reliability
```

rather than false precision.

---

# 129. CLINICAL DECISION

The final clinical decision remains human.

The specialist may:

```text
accept
reject
modify
replace
defer
```

the MAGNIOM candidate.

The final target may be:

```text
MAGNIOM candidate
clinician-defined target
standard target
```

The Triple-Network Systems Layer does not alter this authority model.

---

# 130. CLINICIAN ATTESTATION

The final decision SHALL retain:

> **I have independently reviewed the clinical context, evidence provenance, target reliability, network context, alternatives and limitations. The final target selection represents my clinical decision and not an autonomous MAGNIOM prescription.**

---

# 131. TARGET SLATE IS NOT PRESCRIPTION

The system remains Target Decision Support.

It SHALL NOT autonomously prescribe:

- frequency;
- intensity;
- train structure;
- number of sessions;
- treatment schedule;
- medication;
- behavioural intervention.

Network information does not change this boundary.

---

# 132. REGULATORY ARCHITECTURE

MAGNIOM SHALL continue to be engineered conservatively as regulated SaMD unless specialist regulatory assessment establishes otherwise.

The architecture prioritises:

```text
safety
determinism
traceability
verification
validation
auditability
change control
cybersecurity
```

over development convenience.

---

# 133. SOUP / DEPENDENCY DISCIPLINE

MAGNIOM SHALL maintain:

- minimal audited dependency sets;
- SBOM;
- vulnerability scanning;
- pinned scientific libraries;
- controlled runtime versions;
- reproducible containers;
- no experimental browser features in clinical calculation.

Scientific network computation belongs in validated compute services, not client-side JavaScript.

---

# 134. DATABASE SECURITY

Tenant isolation remains enforced at the database layer.

Clinical network objects SHALL inherit:

```text
organisation isolation
+
case-level access
+
role permissions
+
default deny
```

Clinical immutability remains protected at the storage layer.

---

# 135. APPLICATION ARCHITECTURE

The application shell remains:

```text
Top Bar
Sidebar
Case Header
Main Canvas
```

The Case Header may expose:

```text
Indication
Mode
Network Context availability
```

but should not turn networks into primary navigation categories.

---

# 136. CASE NAVIGATION

Common:

```text
Overview
Assessment
Phenotype
Imaging
Connectome
Network Context
Target Slate
Compare
Decision
Audit
```

`Network Context` appears where:

- network data exists;
- the indication permits contextual network interpretation.

Research-only network content remains visibly separated.

---

# 137. RESEARCH VISUAL SAFETY

Research mode must persistently state:

```text
RESEARCH MODE

This network analysis is experimental.
It is not a validated Clinical Target recommendation.
```

Clinical users must never confuse a research hypothesis with an approved target.

---

# 138. CROSS-INDICATION REVIEW

Future `CrossIndicationTargetReview` may examine:

- shared network context;
- spatial convergence;
- overlapping target families;
- conflicting objectives;
- anatomical constraints.

It SHALL NOT create:

```text
universal optimal target
```

across indications.

---

# 139. NETWORK-LEVEL CROSS-INDICATION CONVERGENCE

A shared CEN/DMN/SN configuration may be reused as measurement context across indications where technically valid.

However:

```text
shared measurement
≠
shared therapeutic interpretation
```

The indication module determines interpretation authority.

---

# 140. NETWORK CONFIGURATION AND CLINICAL PHENOTYPE

The Clinical Phenotype Ontology SHALL NOT be reorganised into:

```text
CEN symptoms
DMN symptoms
SN symptoms
```

Clinical phenotype remains clinically grounded.

Instead:

```text
Clinical Phenotype
       ↓
Clinical Objective
       ↓
Therapeutic Circuit
       ↓
Network Context
```

This prevents circular reasoning.

---

# 141. NETWORK CONFIGURATION AND DYSHPHORIC / ANXIOSOMATIC DOMAINS

For MDD, network context may be attached to:

```text
Dysphoric therapeutic circuit
```

and:

```text
Anxiosomatic therapeutic circuit
```

but the clinical phenotype remains the source of clinical prioritisation.

Network measurements do not determine symptom priorities.

---

# 142. LONGITUDINAL NETWORK DATA

Future MAGNIOM versions may support:

```text
Baseline Network Profile
        ↓
Treatment
        ↓
Follow-up Network Profile
```

but post-treatment network change SHALL initially remain:

```text
research / outcome analysis
```

unless a validated therapeutic mechanism is established.

A post-treatment change SHALL NOT retrospectively prove that the target was correct.

---

# 143. NETWORK ENGAGEMENT VS NETWORK CHANGE

MAGNIOM SHALL distinguish:

```text
target engages network
```

from:

```text
network changed after stimulation
```

and from:

```text
network change caused clinical response
```

These are progressively stronger claims.

---

# 144. NETWORK CAUSALITY

Causal language SHALL require explicit evidence.

The system SHALL avoid automatically stating:

> "This target will normalise the patient's Triple Network."

Preferred:

> "This candidate's therapeutic circuit has a documented relationship with the measured network configuration."

---

# 145. NETWORK EXPLANATION LANGUAGE

Preferred:

> **Network context:** The candidate therapeutic circuit intersects with the patient's measured CEN–DMN configuration. The underlying network relationship is moderately reliable. SN-related measurements are less reliable and were not used to alter candidate ranking.

Avoid:

> "MAGNIOM identified a dysfunctional CEN and corrected it."

---

# 146. NETWORK UNCERTAINTY LANGUAGE

Preferred:

> **Uncertain:** The CEN–DMN relationship varies across independently analysed runs. Network context is therefore displayed for transparency but is not used to alter Clinical candidate ranking.

---

# 147. NETWORK EVIDENCE LANGUAGE

Preferred:

> **Evidence:** Published evidence supports an association between this therapeutic circuit and the specified network relationship.

Not:

> "The network proves this target works."

---

# 148. SYSTEM REQUIREMENT NAMESPACE

v2.1 introduces:

```text
MAG-TNS-xxx
```

for Triple-Network Systems requirements.

---

# 149. MAG-TNS-001

CEN, DMN and SN SHALL exist as canonical versioned `NetworkSystem` objects.

---

# 150. MAG-TNS-002

Every Clinical Triple-Network Profile SHALL reference an immutable network-definition release.

---

# 151. MAG-TNS-003

CEN–DMN, SN–CEN and SN–DMN SHALL be represented as first-class network relationships.

---

# 152. MAG-TNS-004

A Clinical Triple-Network Profile SHALL preserve individual network states and pairwise relationships rather than collapsing them into one universal Triple-Network score.

---

# 153. MAG-TNS-005

Every clinically interpretable network measurement SHALL have a reliability qualification.

---

# 154. MAG-TNS-006

Every clinically interpretable network statement SHALL have evidence provenance.

---

# 155. MAG-TNS-007

Triple-Network context SHALL NOT independently generate Clinical target candidates.

---

# 156. MAG-TNS-008

Triple-Network information SHALL NOT override evidence ceilings.

---

# 157. MAG-TNS-009

Research-only network features SHALL NOT influence Clinical Mode.

---

# 158. MAG-TNS-010

Network clinical authority SHALL be indication-specific and Scientific-Policy-controlled.

---

# 159. MAG-TNS-011

Network uncertainty SHALL remain visible to the clinician.

---

# 160. MAG-TNS-012

Network context SHALL NOT be represented as a universal causal "seesaw" controller.

---

# 161. MAG-TNS-013

Network context may contribute to convergence only when explicitly qualified by policy.

---

# 162. MAG-TNS-014

High network convergence SHALL NOT automatically create additional target candidates.

---

# 163. MAG-TNS-015

Network profile computation SHALL be deterministic.

---

# 164. MAG-TNS-016

Historical network profiles SHALL remain immutable.

---

# 165. MAG-TNS-017

Changes to network definitions, metrics, reliability or interpretation SHALL create versioned scientific releases.

---

# 166. MAG-TNS-018

Network features used in Clinical ranking SHALL identify their Scientific Policy release and validation evidence.

---

# 167. MAG-TNS-019

Network context SHALL NOT be accepted from arbitrary frontend parameters.

---

# 168. MAG-TNS-020

The specialist remains the final clinical authority over all target decisions.

---

# 169. CORE MULTI-INDICATION REQUIREMENTS

The v2 requirements remain:

```text
MAG-IND-001+
MAG-STR-001+
MAG-PAI-001+
MAG-TBI-001+
MAG-TIN-001+
```

v2.1 adds:

```text
MAG-TNS-001+
```

The complete system requirement set must be version-controlled.

---

# 170. DATABASE MIGRATION STRATEGY v2.1

The v2.0 additive migration strategy remains.

Add:

```text
v2_011_network_systems
v2_012_network_definitions
v2_013_network_relationships
v2_014_network_metrics
v2_015_network_measurements
v2_016_network_interaction_measurements
v2_017_network_reliability
v2_018_network_configurations
v2_019_triple_network_profiles
v2_020_network_evidence_claims
v2_021_network_policies
v2_022_candidate_network_relationships
v2_023_network_context_snapshots
```

Do not rewrite the v1/v2 database.

---

# 171. MIGRATION PRINCIPLE

Existing records remain valid under their original semantics.

Migration SHALL:

```text
preserve
+
annotate
+
version
```

rather than:

```text
rewrite
+
recalculate
+
silently replace
```

---

# 172. NETWORK BACKFILL

Historical MDD cases SHALL NOT automatically receive reconstructed Triple-Network Profiles unless:

- original compatible imaging exists;
- processing can be reproduced;
- network definition is known;
- metric is compatible;
- reliability can be established.

Otherwise:

```text
network_profile = unavailable
```

is the correct state.

---

# 173. RELEASE COMPATIBILITY

A Target Slate may reference:

```text
TargetEngine v2.0
```

without referencing:

```text
TripleNetworkProfile
```

Historical compatibility remains intact.

New v2.1 Clinical releases may require or permit network context according to policy.

---

# 174. MODULE VALIDATION IS NOT TRANSITIVE

The following remains mandatory:

```text
MDD validated
+
network model validated
≠
all indications validated
```

Each indication must independently establish:

- evidence validity;
- target validity;
- network relevance;
- measurement reliability;
- clinical interpretation;
- usability;
- intended claim.

---

# 175. REGULATORY RELEASE

Adding a clinically active network feature may alter:

- intended purpose;
- software functionality;
- risk controls;
- clinical claims;
- validation evidence;
- labelling;
- regulatory documentation.

Therefore:

# **Clinical activation of a Triple-Network feature is a controlled product release event.**

---

# 176. RISK CONTROLS

Important hazards include:

### H-TN-01
Network abnormality interpreted as therapeutic target.

### H-TN-02
Weak evidence overridden by network fit.

### H-TN-03
Unreliable FC presented as precise network configuration.

### H-TN-04
Research network biomarker leaks into Clinical Mode.

### H-TN-05
Network score creates hidden ranking behaviour.

### H-TN-06
Network relationship interpreted causally without evidence.

### H-TN-07
Network definition change silently alters target decisions.

### H-TN-08
Clinician assumes network convergence predicts treatment response.

---

# 177. RISK MITIGATIONS

Controls include:

```text
Evidence ceilings
+
Network authority policy
+
Reliability gates
+
Research/Clinical isolation
+
Explicit provenance
+
No universal network score
+
No autonomous network candidate generation
+
Versioned definitions
+
Immutable profiles
+
Deterministic computation
+
Clinician review
```

---

# 178. SCIENTIFIC COMPUTE ISOLATION

Triple-Network calculations SHALL occur in:

```text
services/neurocompute
```

or an independently validated scientific compute service.

The web application SHALL never perform clinical network calculations.

---

# 179. COMPUTE ARTIFACT PROVENANCE

Every network run SHALL record:

```text
input hashes
container digest
code release
dependency versions
atlas
network definition
metric
normative model
configuration
output hashes
```

---

# 180. NO ONLINE LEARNING

Clinical network features SHALL NOT:

- update weights from recent outcomes;
- learn from clinician acceptance;
- adapt thresholds automatically;
- alter network definitions automatically;
- retrain ranking models automatically.

Outcome learning remains a separately governed research process.

---

# 181. NETWORK FEATURE PROMOTION

A research network feature may become Clinical only through:

```text
scientific evidence
+
technical validation
+
reliability validation
+
clinical validation
+
policy approval
+
release governance
```

---

# 182. NO PATIENT-SPECIFIC NETWORK "DISCOVERY" AS EVIDENCE

A patient measurement may discover a novel pattern.

That does not make it evidence.

MAGNIOM SHALL distinguish:

```text
patient observation
```

from:

```text
validated scientific claim
```

---

# 183. NETWORK KNOWLEDGE MOAT

The Triple-Network layer creates a potentially valuable scientific asset because MAGNIOM can preserve a structured relationship between:

```text
phenotype
+
therapeutic circuits
+
individual connectomics
+
large-scale network configuration
+
target selection
+
clinician decision
+
outcome
```

However, this dataset must never be used to silently update Clinical algorithms.

Research learning remains separately governed.

---

# 184. FUTURE RESEARCH QUESTIONS

The architecture intentionally enables future investigation of:

```text
Does CEN–DMN configuration improve target localisation?
```

```text
Does SN configuration explain phenotype-specific target selection?
```

```text
Does network configuration improve prediction beyond therapeutic-circuit FC?
```

```text
Does network context improve target selection beyond evidence-defined targets?
```

```text
Does network-guided targeting outperform fixed targeting?
```

```text
Does target displacement interact with network configuration?
```

These are hypotheses to test—not assumptions encoded into the Clinical Engine.

---

# 185. FUTURE NETWORK BIOMARKER PROMOTION

A network biomarker should require evidence that it provides:

```text
incremental value
```

over:

```text
existing evidence
+
phenotype
+
therapeutic circuit
+
individual connectivity
```

A more complicated model is not automatically a better model.

---

# 186. NETWORK FEATURE VALUE TEST

A candidate network feature should demonstrate:

```text
reproducibility
+
incremental discrimination
+
clinical interpretability
+
generalisation
+
calibration
+
decision utility
```

before Clinical ranking authority is considered.

---

# 187. NETWORK LAYER PRINCIPLE

The Triple-Network Systems Layer should therefore be understood as:

# **a systems-neuroscience context engine**

not:

# **a target engine inside the Target Engine.**

---

# 188. FINAL v2.1 ARCHITECTURE

```text
                              MAGNIOM CORE
                                   │
              ┌────────────────────┼─────────────────────┐
              │                    │                     │
          Governance           Case Model            Security
              │                    │                     │
              └────────────────────┼─────────────────────┘
                                   │
                         Indication Module
                                   │
             ┌─────────────────────┼─────────────────────┐
             │          │          │          │           │
            MDD        OCD       PAIN       STROKE       TBI
                                      │
                              ┌───────┴───────┐
                              │               │
                            MOTOR           APHASIA
                                     
                         Research Modules
                       PTSD · Tinnitus · etc.
                                   │
                                   ▼
                         Scientific Policy
                                   │
                                   ▼
                         Evidence Eligibility
                                   │
                                   ▼
                       Clinical Objective
                                   │
                                   ▼
                       Therapeutic Circuit
                                   │
                                   ▼
                      Candidate Generation
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
          Patient Connectomics          Triple-Network Systems
                    │                             │
                    │                    ┌────────┼─────────┐
                    │                    │        │         │
                    │                   CEN      DMN        SN
                    │                    │        │         │
                    │                    └───┬────┴────┬────┘
                    │                        │         │
                    │                    pairwise relationships
                    │                        │
                    │                 network configuration
                    │                        │
                    │                    reliability
                    │                        │
                    │                  evidence provenance
                    │                        │
                    └──────────────┬─────────┘
                                   │
                                   ▼
                         Governed Context
                                   │
                         ┌─────────┴─────────┐
                         │                   │
                      Convergence       Explanation
                         │                   │
                         └─────────┬─────────┘
                                   ▼
                            Evidence Ceiling
                                   │
                                   ▼
                         Reliability / Anatomy
                                   │
                                   ▼
                              E-field
                                   │
                                   ▼
                       Personalisation Decision
                                   │
                                   ▼
                         Redundancy / Alternatives
                                   │
                                   ▼
                             Target Slate
                                   │
                                   ▼
                         Specialist Decision
```

---

# 189. THE v2.1 SCIENTIFIC HIERARCHY

MAGNIOM v2.1 SHALL be governed by:

```text
Evidence determines what is defensible.

Clinical phenotype determines what matters.

Therapeutic objective determines what is being pursued.

Therapeutic circuits determine what biological system is intended to be engaged.

Patient connectomics determines how that circuit is expressed in this patient.

Triple-Network analysis describes the large-scale systems context in which the circuit operates.

Reliability determines how much confidence can be placed in patient-specific measurements.

Normative models provide contextual comparison where validated.

Anatomy constrains what can be stimulated.

E-field modelling characterises how stimulation engages the intended region where validated.

Convergence determines how independently supported a candidate interpretation is.

Alternatives expose competing hypotheses.

Abstention prevents false precision.

Scientific Policy determines what the algorithm is permitted to do.

The specialist makes the final clinical decision.
```

---

# 190. WHAT v2.1 FUNDAMENTALLY ADDS

MAGNIOM v2.0 established:

```text
one governance architecture
+
multiple indication models
+
multimodal measurements
+
modality-specific reliability
+
indication-specific targeting
```

v2.1 adds:

```text
CEN
+
DMN
+
SN
+
CEN–DMN
+
SN–CEN
+
SN–DMN
+
network configuration
+
network reliability
+
network evidence provenance
+
governed network context
```

The critical change is not simply more data.

It is a new scientific abstraction:

# **MAGNIOM can now represent the patient as an interacting large-scale network configuration rather than as a collection of isolated connectivity abnormalities.**

---

# 191. WHAT v2.1 DOES NOT ADD

v2.1 does NOT add:

```text
a universal Triple-Network score
```

```text
CEN target
```

```text
DMN target
```

```text
SN target
```

```text
network abnormality → target
```

```text
hyperconnectivity → inhibitory protocol
```

```text
hypoconnectivity → excitatory protocol
```

```text
network fit → efficacy guarantee
```

```text
network convergence → more targets
```

---

# 192. FINAL GOVERNING RULE

> **MAGNIOM shall not ask "Which network is abnormal, and therefore where should we stimulate?"**
>
> **It shall ask which therapeutic objective is being pursued, what evidence supports that therapeutic circuit, how that circuit is expressed in this patient, what the patient's CEN–DMN–SN configuration looks like, how reliable those measurements are, whether the network context converges with or contradicts the therapeutic hypothesis, what can actually be stimulated, what the evidence permits MAGNIOM to conclude, and what uncertainty must remain visible to the specialist.**

---

# 193. MAGNIOM v2.1 MANIFESTO

# One platform, multiple indication models.

# One governance architecture, independently validated clinical scopes.

# One therapeutic-circuit architecture, indication-specific evidence paths.

# One Triple-Network Systems Layer, indication-specific clinical authority.

# CEN, DMN and SN are systems—not simplistic targets.

# Network configuration is relational, not one score.

# Network context informs; evidence governs.

# Reliability qualifies personalisation.

# A network abnormality is not automatically a therapeutic target.

# A precise coordinate is not biological certainty.

# A more personalised target is not automatically better.

# Convergence does not mean duplication.

# Research does not become Clinical by implementation.

# Negative evidence remains visible.

# Historical scientific decisions remain reproducible.

# Algorithms remain version-pinned.

# The specialist remains the final clinical authority.

---

# 194. FINAL ARCHITECTURAL STATEMENT

MAGNIOM v2.1 is therefore:

# **a governed multi-indication neuromodulation decision-support platform with an evidence-first Target Engine and a first-class Triple-Network Systems Layer that contextualises how therapeutic circuits operate within the patient's large-scale brain network configuration.**

Its architectural identity is:

> **Evidence constrains.  
> Phenotype prioritises.  
> Circuits define.  
> Connectomics personalises.  
> Triple-Network systems contextualise.  
> Reliability qualifies.  
> Anatomy constrains.  
> E-field characterises.  
> Convergence explains.  
> Alternatives expose uncertainty.  
> Policy governs.  
> The specialist decides.**

---

# 195. IMPLEMENTATION COMPLETION CRITERIA

v2.1 is architecturally complete only when:

- [ ] CEN is a canonical NetworkSystem.
- [ ] DMN is a canonical NetworkSystem.
- [ ] SN is a canonical NetworkSystem.
- [ ] NetworkDefinitions are versioned.
- [ ] CEN–DMN is a first-class relationship.
- [ ] SN–CEN is a first-class relationship.
- [ ] SN–DMN is a first-class relationship.
- [ ] Within-network measurements are preserved.
- [ ] Pairwise measurements are preserved.
- [ ] NetworkConfiguration exists.
- [ ] TripleNetworkProfile exists.
- [ ] NetworkReliabilityProfile exists.
- [ ] NetworkEvidenceClaim exists.
- [ ] Network provenance is auditable.
- [ ] Network clinical authority is policy-controlled.
- [ ] Network context is indication-specific.
- [ ] Triple-Network context enters Target Engine through frozen context.
- [ ] Triple-Network context cannot independently generate Clinical candidates.
- [ ] No universal TripleNetworkScore exists in Clinical Mode.
- [ ] Evidence ceilings remain binding.
- [ ] Network reliability is visible.
- [ ] Network uncertainty is visible.
- [ ] Research-only network features are blocked from Clinical Mode.
- [ ] Network context can participate in governed convergence.
- [ ] Network-aware redundancy is supported.
- [ ] Network explanations are generated deterministically.
- [ ] Historical network profiles are immutable.
- [ ] Network releases are versioned.
- [ ] 100-run deterministic reproducibility passes.
- [ ] Network golden cases pass.
- [ ] MDD regression baseline passes.
- [ ] No LLM participates in network calculation or target ranking.
- [ ] Clinical target selection remains specialist-controlled.

---

**End of MAGNIOM Multi-Indication Technical & Scientific Architecture Specification v2.1**