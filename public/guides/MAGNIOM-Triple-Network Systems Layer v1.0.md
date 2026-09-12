# MAGNIOM

## Triple-Network Systems Layer & Governed Target Engine Integration Specification v1.0

**Document status:** Canonical Scientific Architecture Specification
**Version:** 1.0
**Date:** 11 September 2026
**Applies to:** MAGNIOM Multi-Indication Architecture v2.x
**Primary initial indication:** Major depressive disorder
**Authority:** Scientific Architecture + Scientific Policy + Target Engine Core
**Clinical authority:** Specialist clinician
**Mode:** Clinical / Research with explicit authority separation

---

# 1. EXECUTIVE PURPOSE

This specification establishes the:

# **MAGNIOM Triple-Network Systems Layer**

as a first-class architectural component of the MAGNIOM scientific platform.

The layer represents:

1. **Central Executive Network (CEN)**
2. **Default Mode Network (DMN)**
3. **Salience Network (SN)**
4. CEN–DMN interaction
5. SN–CEN interaction
6. SN–DMN interaction
7. within-network integrity
8. between-network coupling/segregation
9. network configuration
10. normative context
11. measurement and network reliability
12. evidence provenance
13. interpretation and uncertainty
14. relationship to therapeutic circuits and candidate targets.

It connects to the MAGNIOM Target Engine as a:

# **Governed Contextual Scientific Layer**

rather than as an autonomous target generator.

The architecture is therefore:

```text
Clinical Objective
       ↓
Evidence
       ↓
Therapeutic Circuit
       ↓
Candidate Target Family
       ↓
Patient Connectomics
       ↓
┌──────────────────────────────────────┐
│     TRIPLE-NETWORK SYSTEMS LAYER     │
│                                      │
│  CEN       DMN       SN              │
│    \        |        /               │
│     \       |       /                │
│   pairwise interactions              │
│                                      │
│   network configuration              │
│   normative context                  │
│   reliability                        │
│   evidence provenance                │
└──────────────────────────────────────┘
       ↓
Context / Convergence / Explanation
       ↓
Target Engine
       ↓
Reliability + Anatomy + E-field
       ↓
Ranked Target Slate
       ↓
Specialist Review
```

---

# 2. ARCHITECTURAL DECISION

MAGNIOM SHALL distinguish three fundamentally different concepts:

### A. Network state

> **What large-scale network configuration is observed in this patient?**

### B. Therapeutic circuit

> **What circuit is supported by evidence as relevant to the clinical objective?**

### C. Stimulation target

> **What accessible anatomical stimulation site can plausibly engage that therapeutic circuit?**

These must never be conflated.

Therefore:

```text
Network abnormality
        ≠
Therapeutic circuit
        ≠
Stimulation target
```

And:

```text
CEN dysfunction
        ↓
does not automatically imply
        ↓
stimulate CEN
```

Likewise:

```text
DMN hyperconnectivity
        ↓
does not automatically imply
        ↓
suppress DMN
```

And:

```text
SN abnormality
        ↓
does not automatically imply
        ↓
stimulate SN
```

The Triple-Network Systems Layer provides **systems context** for therapeutic targeting.

---

# 3. RELATIONSHIP TO MAGNIOM v2

MAGNIOM v2 already establishes that the Target Engine is a deterministic core with indication-specific modules, evidence paths, scientific policy and governed candidate generators. 

The Triple-Network layer SHALL therefore be implemented as a **platform-level scientific capability**, not duplicated inside each indication plugin.

The architecture becomes:

```text
MAGNIOM PLATFORM SCIENTIFIC LAYERS

Evidence Knowledge System
        │
Clinical Phenotype
        │
Therapeutic Circuit Library
        │
Neuroimaging / Connectomics
        │
Triple-Network Systems Layer
        │
Target Engine Core
        │
Indication Plugins
```

The layer is reusable across indications.

However:

> **Its clinical authority remains indication-specific.**

A network relationship validated for MDD SHALL NOT automatically become clinically actionable for PTSD, OCD, stroke, pain or TBI.

This preserves the v2 rule that one validated indication cannot legitimise another. 

---

# 4. SCIENTIFIC GOVERNING PRINCIPLE

The Triple Network SHALL be represented as a:

# **distributed relational system**

rather than a three-node causal model.

MAGNIOM SHALL NOT encode:

```text
DMN ↑
CEN ↓
SN abnormal
      ↓
stimulate CEN
      ↓
DMN decreases
      ↓
depression improves
```

as a clinical algorithm.

That would incorrectly convert a systems-level association into a patient-specific causal intervention rule.

Instead:

```text
Clinical phenotype
       +
Evidence-supported therapeutic circuit
       +
Patient network configuration
       +
Individual circuit connectivity
       +
Reliability
       +
Anatomical stimulability
       ↓
Governed target interpretation
```

The Triple Network therefore functions as **contextual evidence about the systems in which a candidate therapeutic circuit operates**.

---

# 5. DESIGN OBJECTIVES

The Triple-Network Systems Layer SHALL:

### 5.1 Represent network systems explicitly

CEN, DMN and SN must be canonical scientific objects.

### 5.2 Represent relationships explicitly

The system must represent:

```text
CEN ↔ DMN
SN ↔ CEN
SN ↔ DMN
```

rather than merely storing three independent network scores.

### 5.3 Preserve raw measurements

Raw network measurements must remain accessible and immutable.

### 5.4 Preserve reliability

Every clinically interpretable network feature must carry reliability metadata.

### 5.5 Preserve evidence provenance

Every interpretation must be traceable to its evidence claims.

### 5.6 Separate measurement from interpretation

Observed:

```text
CEN-DMN coupling = X
```

must remain distinct from:

```text
CEN-DMN coupling is clinically meaningful for MDD
```

### 5.7 Prevent network-driven overreach

A network abnormality must not independently create a Clinical Mode target.

### 5.8 Support future validation

The architecture must allow future prospective validation without requiring structural redesign.

---

# 6. CANONICAL NETWORK ONTOLOGY

MAGNIOM SHALL introduce the following canonical entities.

```text
NetworkSystem
NetworkDefinition
NetworkNode
NetworkRelationship
NetworkEvidenceClaim
NetworkConfiguration
TripleNetworkProfile
NetworkReliabilityProfile
NetworkInterpretation
```

---

# 7. `NetworkSystem`

Represents a canonical large-scale functional network.

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

Initial systems:

```text
MAGNIOM-NET-CEN
MAGNIOM-NET-DMN
MAGNIOM-NET-SN
```

---

# 8. CEN DEFINITION

## Central Executive Network

Canonical conceptual role:

* goal-directed cognition;
* executive control;
* working memory;
* cognitive flexibility;
* externally oriented control.

MAGNIOM SHALL NOT reduce CEN to a single anatomical location.

The CEN definition SHALL contain:

```text
canonical parcels
canonical cortical regions
hemispheric representation
network membership rules
parcellation version
reference connectivity profile
evidence claims
uncertainty
```

The system must allow multiple anatomical representations because network definitions are atlas- and methodology-dependent.

---

# 9. DMN DEFINITION

## Default Mode Network

Canonical conceptual role includes internally oriented cognition and self-referential processing.

MAGNIOM SHALL represent DMN as a distributed network rather than a single "DMN region."

Its definition SHALL include:

```text
canonical parcels
canonical regions
network membership
parcellation version
reference connectivity
evidence provenance
uncertainty
```

---

# 10. SN DEFINITION

## Salience Network

Canonical conceptual role includes detection/integration of salient internal and external information and coordination between large-scale systems.

Again:

```text
SN ≠ single anatomical target
```

The canonical definition must preserve distributed network membership.

---

# 11. NETWORK DEFINITIONS ARE VERSIONED

A network definition is never implicitly permanent.

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

Changing:

* atlas;
* parcel membership;
* network assignment;
* preprocessing;
* reference cohort;
* network construction method

requires a new definition version.

---

# 12. NETWORK RELATIONSHIPS

MAGNIOM SHALL represent pairwise network relationships as first-class scientific objects.

Canonical relationships:

```text
CEN ↔ DMN
SN  ↔ CEN
SN  ↔ DMN
```

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

# 13. WITHIN-NETWORK MEASURES

For each network:

```text
CEN integrity
DMN integrity
SN integrity
```

MAGNIOM may calculate measures such as:

* within-network connectivity;
* internal coherence;
* network integrity;
* participation;
* network segregation;
* network-specific variance.

However, these SHALL remain metric-specific.

MAGNIOM SHALL NOT collapse all measurements into:

```text
CEN score
DMN score
SN score
```

unless the aggregation itself has been validated and explicitly governed by Scientific Policy.

---

# 14. BETWEEN-NETWORK MEASURES

The primary pairwise relationships are:

```text
CEN ↔ DMN
SN  ↔ CEN
SN  ↔ DMN
```

Possible measurements include:

```text
mean cross-network FC
network-to-network connectivity
segregation
integration
partial correlation
canonical correlation
other validated metrics
```

The metric itself must be stored.

For example:

```ts
interface NetworkInteractionMeasurement {
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

# 15. NETWORK CONFIGURATION

The most important architectural addition is:

# `NetworkConfiguration`

This represents the patient's **relational network state**.

It is not a single score.

```ts
interface NetworkConfiguration {
  id: UUID;

  case_id: UUID;

  connectome_run_id: UUID;

  network_definition_release_id: UUID;

  metric_release_id: UUID;

  within_network_measurements: NetworkMeasurement[];

  pairwise_relationships: NetworkInteractionMeasurement[];

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

# 16. NO SINGLE "TRIPLE NETWORK SCORE"

MAGNIOM SHALL explicitly prohibit:

```text
TripleNetworkScore = f(CEN, DMN, SN)
```

as the canonical patient representation.

Likewise, it SHALL NOT create:

```text
TripleNetworkDysfunction = 0.83
```

and use that number directly for target ranking.

The system must preserve the relational structure.

The scientifically useful object is:

```text
CEN state
DMN state
SN state

CEN ↔ DMN
SN  ↔ CEN
SN  ↔ DMN

+
reliability
+
normative context
+
evidence
```

---

# 17. NETWORK CONFIGURATION EXAMPLE

A patient could have:

```text
CEN integrity
    moderately reduced

DMN integrity
    within reference range

SN integrity
    uncertain

CEN ↔ DMN
    reduced segregation

SN ↔ CEN
    within reference range

SN ↔ DMN
    increased coupling
```

MAGNIOM must preserve that exact configuration.

It must **not** translate it automatically into:

> "Stimulate CEN."

Instead, it may report:

> The patient's network configuration shows altered CEN–DMN relationship with limited confidence in SN-related measures. This network context intersects with the connectivity profile of candidate therapeutic circuit X.

---

# 18. NETWORK RELIABILITY

Network information is only useful if the underlying measurement is trustworthy.

Therefore every network configuration SHALL have a:

# `NetworkReliabilityProfile`

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

# 19. RELIABILITY IS MULTIDIMENSIONAL

MAGNIOM SHALL distinguish:

```text
Data quality
      ↓
Preprocessing reliability
      ↓
Network measurement reliability
      ↓
Cross-run stability
      ↓
Atlas sensitivity
      ↓
Normative compatibility
```

A network measurement can therefore be:

```text
high numerical precision
+
low biological reliability
```

and must not be presented as highly trustworthy.

This follows the existing MAGNIOM principle that imaging precision and imaging reliability are different concepts. 

---

# 20. TRIPLE-NETWORK PROFILE

The principal patient-facing scientific object SHALL be:

```ts
interface TripleNetworkProfile {
  id: UUID;

  case_id: UUID;

  network_configuration_id: UUID;

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

# 21. EVIDENCE PROVENANCE

The Triple-Network layer must be connected directly to the MAGNIOM Evidence Knowledge System.

Every clinically meaningful network interpretation must answer:

> **Where did this knowledge come from?**

The provenance chain SHALL be:

```text
Source
 ↓
Evidence Claim
 ↓
Network Evidence Claim
 ↓
Network Relationship
 ↓
Network Configuration Interpretation
 ↓
Candidate Context
 ↓
Clinician Explanation
```

---

# 22. NETWORK EVIDENCE CLAIM

Introduce:

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

# 23. FIVE DIFFERENT CLAIM LEVELS

MAGNIOM SHALL explicitly distinguish:

### Level A — Network association

> MDD is associated with altered CEN/DMN/SN organisation.

### Level B — Network–phenotype relationship

> A particular network configuration is associated with a particular clinical phenotype.

### Level C — Network–therapeutic circuit relationship

> A therapeutic circuit interacts with a particular network configuration.

### Level D — Network-guided targeting evidence

> A patient-specific network configuration can identify a superior stimulation target.

### Level E — Causal/mechanistic evidence

> Modifying the network relationship produces a clinically meaningful therapeutic effect.

These are **not interchangeable**.

A Level A claim cannot justify a Level D clinical target.

---

# 24. EVIDENCE CEILING

The existing MAGNIOM evidence hierarchy remains authoritative.

Therefore:

```text
Network observation
       ↓
cannot exceed
       ↓
underlying evidence level
```

A strong patient-specific network measurement cannot upgrade weak literature.

For example:

```text
Excellent CEN-DMN measurement
+
Research-only evidence
=
Research interpretation
```

not:

```text
Excellent CEN-DMN measurement
→ Clinical target
```

---

# 25. NETWORK EVIDENCE CONFLICT

The layer SHALL explicitly support conflicting evidence.

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

Attractive patient-specific network fit must never erase negative evidence.

This directly follows the v2 principle that network attractiveness cannot override evidence conflict. 

---

# 26. NETWORK COMPUTATION PIPELINE

The Neuroimaging Pipeline SHALL be extended from:

```text
GLOBAL NETWORK METRICS
```

to:

# **LARGE-SCALE NETWORK & TRIPLE-NETWORK ANALYSIS**

Canonical pipeline:

```text
BOLD
 ↓
QC
 ↓
denoising
 ↓
surface / parcel representation
 ↓
FC matrix
 ↓
network definition mapping
 ↓
within-network measurements
 ↓
CEN-DMN
SN-CEN
SN-DMN
 ↓
network configuration
 ↓
normative comparison
 ↓
network reliability
 ↓
Triple-Network Profile
```

The existing pipeline already explicitly retains network-level FC as a distinct representation and warns against prematurely collapsing different connectivity representations into one number. 

This specification therefore formalises that capability rather than inventing an unrelated parallel system.

---

# 27. INPUTS

Triple-Network computation may consume:

```text
T1 MRI
rs-fMRI
surface representation
HCP-MMP1.0
network definition release
FC matrix
normative reference
preprocessing metadata
motion/QC
run structure
```

The system SHALL record:

```text
acquisition
scanner
sequence
preprocessing release
denoising release
atlas release
network definition release
metric release
normative model release
```

---

# 28. NETWORK MEASUREMENT MODES

MAGNIOM SHALL support:

### Clinical Static Mode

Validated static network measurements only.

### Clinical Qualified Context Mode

Validated network measurements may appear as contextual evidence where policy permits.

### Research Dynamic Mode

May explore:

* dynamic functional connectivity;
* network state transitions;
* temporal segregation/integration;
* state-specific coupling;
* time-varying CEN/DMN/SN relationships.

Dynamic metrics SHALL initially remain:

# **Research Mode only**

unless independently validated and promoted through Scientific Policy.

---

# 29. NORMATIVE NETWORK CONTEXT

Where an approved normative model exists:

```text
patient measurement
       ↓
normative comparison
       ↓
deviation
       ↓
network contextual interpretation
```

Normative deviation SHALL NOT itself be treated as therapeutic abnormality.

For example:

```text
large deviation
≠
pathological mechanism
≠
best stimulation target
```

The existing architecture already specifies normative comparison as contextual rather than as an automatic target generator. 

---

# 30. CONNECTION TO THERAPEUTIC CIRCUITS

This is where the Triple-Network layer becomes strategically valuable.

The relationship should be:

```text
Clinical Objective
       ↓
Therapeutic Circuit
       ↓
Network Context
```

not:

```text
Network abnormality
       ↓
target
```

A therapeutic circuit may be annotated with:

```text
primary network context
secondary network context
network relationships
expected network engagement
evidence provenance
```

---

# 31. THERAPEUTIC CIRCUIT EXTENSION

Add to `TherapeuticCircuit`:

```ts
interface TherapeuticCircuitNetworkContext {
  therapeutic_circuit_id: UUID;

  network_system_id: UUID;

  relationship_type:
    | "embedded"
    | "intersects"
    | "connects"
    | "modulates"
    | "associated_with";

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

This allows MAGNIOM to say:

> Candidate X belongs to therapeutic circuit Y, which has an evidence-supported relationship with CEN/DMN organisation.

rather than:

> Candidate X is a CEN target.

---

# 32. TARGET ENGINE INTEGRATION

The Target Engine SHALL consume the Triple-Network Systems Layer through a new context object:

```ts
interface TripleNetworkTargetContext {
  profile_id: UUID;

  configuration: NetworkConfiguration;

  reliability: NetworkReliabilityProfile;

  evidence_context: NetworkEvidenceContext;

  candidate_relationships: CandidateNetworkRelationship[];

  policy_status:
    | "contextual"
    | "qualified_contextual"
    | "research_only";
}
```

This is added to:

```ts
interface ResolvedTargetingContext {
  ...
  triple_network_context?: TripleNetworkTargetContext;
}
```

The existing v2 architecture resolves immutable scientific objects before execution and passes them into a pure engine context. 

The Triple-Network context follows exactly the same pattern.

---

# 33. TARGET ENGINE POSITION

The canonical pipeline becomes:

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
PATIENT CONNECTOME
        ↓
TRIPLE-NETWORK CONTEXT
        ↓
RELIABILITY
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
REDUNDANCY
        ↓
CONVERGENCE
        ↓
SLATE
```

---

# 34. CRITICAL RULE — TRIPLE NETWORK DOES NOT CREATE CLINICAL TARGETS

The Triple-Network layer SHALL NOT independently invoke:

```text
CandidateGenerator
```

in Clinical Mode.

It may:

* contextualise a candidate;
* provide a convergence relationship;
* qualify interpretation;
* contribute a policy-approved feature;
* expose uncertainty;
* support explanation.

It cannot independently create:

```text
TargetCandidate
```

for Clinical Mode.

---

# 35. NETWORK CONTEXTUAL MODIFIER

The default Clinical Mode role is:

# **Contextual Modifier**

A candidate may receive:

```text
network_context = supportive
network_context = neutral
network_context = contradictory
network_context = uncertain
```

This does not automatically change rank.

Instead, Scientific Policy may permit network context to affect:

* explanation;
* convergence;
* tie-breaking;
* confidence qualification;
* personalisation eligibility;
* comparison-domain interpretation.

---

# 36. NETWORK CONTEXT MUST NOT BECOME A HIDDEN SCORE

MAGNIOM SHALL NOT implement:

```text
TargetScore =
Evidence
+ Phenotype
+ Connectomics
+ TripleNetworkScore
+ EField
```

This would make the network layer an opaque ranking feature.

Instead:

```text
Evidence
    ↓
eligibility / ceiling

Phenotype
    ↓
clinical relevance

Therapeutic Circuit
    ↓
candidate generation

Individual FC
    ↓
patient-specific refinement

Triple Network
    ↓
context / relationship / convergence

Reliability
    ↓
confidence

Anatomy + E-field
    ↓
stimulability

Scientific Policy
    ↓
permitted ranking behaviour
```

---

# 37. QUALIFIED NETWORK FEATURE

A future validated network feature may be allowed in ranking only if Scientific Policy explicitly declares:

```ts
interface NetworkFeaturePolicy {
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

No network feature may become clinically active merely because engineers implement it.

---

# 38. NETWORK CONVERGENCE

The Triple-Network layer becomes especially powerful within MAGNIOM's existing convergence architecture.

For a candidate:

```text
Evidence
    ↓
supports target family

Phenotype
    ↓
supports therapeutic objective

Individual FC
    ↓
supports patient-specific circuit fit

Triple Network
    ↓
supports network-system concordance

E-field
    ↓
supports practical engagement
```

These are **independent scientific domains**.

When several converge:

> convergence increases interpretability.

It does **not** mean:

> generate more targets.

This preserves the existing v2 rule that convergence is a scientific property rather than a reason to create additional target slots. 

---

# 39. NETWORK CONVERGENCE OBJECT

Extend:

```ts
interface CandidateConvergenceProfileV2 {
  source_domains: string[];

  relationships: ...

  overall: ...
}
```

with:

```text
triple_network_context
```

as a source domain.

Example:

```text
source_domains:

- evidence
- phenotype
- therapeutic_circuit
- individual_connectivity
- triple_network
- normative
- anatomy
- efield
```

---

# 40. NETWORK–CANDIDATE RELATIONSHIP

Introduce:

```ts
interface CandidateNetworkRelationship {
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

# 41. NETWORK CONTEXT FOR A TARGET

Every clinically generated target may display:

```text
NETWORK CONTEXT

CEN
Strong relevance

DMN
Moderate relevance

SN
Contextual

CEN ↔ DMN
Altered

SN ↔ CEN
Within reference

SN ↔ DMN
Uncertain

Reliability
Moderate

Interpretation
The candidate therapeutic circuit intersects
with the patient's altered CEN–DMN configuration.

Network findings provide contextual evidence only
and do not independently establish target superiority.
```

---

# 42. "WHY MAGNIOM NOMINATED THIS TARGET"

The existing target-card philosophy should be extended.

A target explanation may include:

### Evidence

Why this target family is clinically defensible.

### Phenotype

Why the therapeutic objective matters for this patient.

### Circuit

Why the candidate belongs to the relevant therapeutic circuit.

### Connectomics

How the patient's connectivity relates to that circuit.

### Triple Network

How the candidate's circuit sits within the patient's CEN/DMN/SN configuration.

### Reliability

How trustworthy those patient-specific findings are.

### Anatomy

Whether the target is realistically stimulable.

### E-field

How the intended region can be engaged under the specified device context.

---

# 43. "WHY THIS TARGET MAY BE WRONG"

The Triple-Network layer must also contribute to uncertainty.

Examples:

```text
CEN-DMN relationship is unstable across runs.
```

```text
SN measurements did not meet clinical reliability criteria.
```

```text
Network definition changes materially across atlas representations.
```

```text
The network relationship is supported primarily by indirect evidence.
```

```text
Patient-specific network configuration diverges from the population
in which the therapeutic relationship was established.
```

This prevents network sophistication from creating false certainty.

---

# 44. NETWORK-BASED ABSTENTION

Network uncertainty alone should generally **not** cause complete target abstention if the evidence baseline remains valid.

For example:

```text
Triple Network unreliable
        ↓
network context unavailable
        ↓
Evidence-based target remains valid
```

The engine may issue:

```text
TRIPLE_NETWORK_CONTEXT_UNAVAILABLE
```

or:

```text
TRIPLE_NETWORK_LOW_RELIABILITY
```

rather than:

```text
NO TARGET
```

unless a future validated evidence path explicitly requires network information.

---

# 45. CLINICAL MODE GATES

Clinical Mode SHALL distinguish:

### Required network data

If a future indication specifically requires network data:

```text
network missing
→ hard gate
```

### Optional contextual network data

If network context is optional:

```text
network missing
→ continue
→ omit network interpretation
```

### Unreliable network data

```text
network present
+
reliability insufficient
→ network cannot influence Clinical ranking
```

---

# 46. RESEARCH MODE

Research Mode may permit substantially broader exploration.

Examples:

```text
CEN-DMN configuration
        ↓
candidate response hypothesis
```

```text
SN-CEN relationship
        ↓
phenotype stratification hypothesis
```

```text
network configuration
        ↓
target displacement hypothesis
```

```text
dynamic network state
        ↓
candidate targeting hypothesis
```

All such outputs SHALL carry:

> **RESEARCH HYPOTHESIS — NOT A VALIDATED CLINICAL TARGET RECOMMENDATION**

---

# 47. NO RESEARCH LEAKAGE

Research-only network features SHALL NEVER:

```text
Research Mode
   ↓
Clinical Target Engine
```

without explicit promotion through:

```text
Evidence validation
        ↓
Scientific Policy
        ↓
Indication Module
        ↓
Clinical validation
        ↓
approved release
```

This follows the existing plugin conformance rule that Research-only paths cannot produce Clinical candidates. 

---

# 48. TRIPLE-NETWORK FEATURE AUTHORITY MATRIX

| Feature               |     Research | Clinical Context | Clinical Ranking |
| --------------------- | -----------: | ---------------: | ---------------: |
| CEN integrity         |            ✓ |   ✓ if qualified |           Policy |
| DMN integrity         |            ✓ |   ✓ if qualified |           Policy |
| SN integrity          |            ✓ |   ✓ if qualified |           Policy |
| CEN–DMN coupling      |            ✓ |   ✓ if qualified |           Policy |
| SN–CEN coupling       |            ✓ |   ✓ if qualified |           Policy |
| SN–DMN coupling       |            ✓ |   ✓ if qualified |           Policy |
| Network segregation   |            ✓ |   ✓ if qualified |           Policy |
| Dynamic FC            |            ✓ |     Initially no |               No |
| Network anomaly       |            ✓ |     Context only |               No |
| Network → target      | ✓ hypothesis |               No |               No |
| Network → explanation |            ✓ |                ✓ |              N/A |
| Network → convergence |            ✓ |   ✓ if qualified |              N/A |

---

# 49. SCIENTIFIC POLICY INTEGRATION

Scientific Policy becomes the only authority capable of promoting a network feature.

Example:

```ts
interface ScientificPolicyRelease {
  ...
  triple_network_policy: TripleNetworkPolicy;
}
```

```ts
interface TripleNetworkPolicy {
  enabled: boolean;

  allowed_network_definitions: UUID[];

  allowed_metric_releases: UUID[];

  minimum_reliability: ReliabilityLevel;

  allowed_clinical_roles: NetworkClinicalRole[];

  allowed_indications: UUID[];

  allowed_objectives: UUID[];

  dynamic_metrics_allowed: boolean;

  ranking_features: NetworkRankingFeaturePolicy[];
}
```

---

# 50. DETERMINISM

Triple-Network processing SHALL obey all existing Target Engine determinism requirements.

Identical:

```text
MRI
+
processing release
+
network definition
+
metric release
+
normative model
+
Scientific Policy
```

must produce:

```text
identical measurements
identical configuration
identical reliability
identical interpretations
identical hashes
```

The existing v2 architecture requires identical canonical inputs to produce identical generator inputs, features, gates, suppression, slate ordering, explanations and output hash. 

---

# 51. NETWORK HASHING

The Triple-Network Profile SHALL have a deterministic hash.

```text
TripleNetworkProfileHash =
SHA256(
    canonical_network_definition
    +
    canonical_measurements
    +
    reliability
    +
    normative_context
    +
    evidence_context
    +
    metric_version
    +
    pipeline_version
)
```

Floating-point canonicalisation rules SHALL be defined centrally.

---

# 52. IMMUTABILITY

Published network profiles SHALL be immutable.

If a pipeline defect is discovered:

```text
Profile v1
   ↓
superseded
   ↓
Profile v2
```

not:

```text
Profile v1
   ↓
silently modified
```

This is consistent with the existing MAGNIOM principle that changes to preprocessing, atlas, registration or target-search algorithms create a new version and existing targets are not silently recalculated. 

---

# 53. DATA MODEL RELATIONSHIP

Canonical lineage becomes:

```text
Case
 ↓
Clinical Assessment
 ↓
Phenotype Snapshot
 ↓
Clinical Objective
 ↓
Evidence Claim
 ↓
Therapeutic Circuit
 ↓
Network Evidence Claim
 ↓
Network Definition
 ↓
Patient Connectome
 ↓
Network Configuration
 ↓
Triple-Network Profile
 ↓
Target Candidate
 ↓
Candidate Network Relationship
 ↓
Target Slate
 ↓
Clinician Decision
```

This is a major improvement in scientific traceability.

---

# 54. DATABASE ENTITIES

The Supabase model should add:

```text
evidence.network_system
evidence.network_definition
evidence.network_relationship
evidence.network_evidence_claim

connectomics.network_measurement
connectomics.network_interaction_measurement
connectomics.network_configuration
connectomics.triple_network_profile
connectomics.network_reliability_profile

targeting.candidate_network_relationship
targeting.network_context_snapshot
```

Exact physical schema names may be adjusted to match the existing v2 database naming conventions, but semantic separation SHALL remain.

---

# 55. ROW-LEVEL SECURITY

Network data SHALL inherit the same tenant isolation model as clinical connectomics.

Rules:

```text
organisation isolation
+
case access
+
role capability
+
clinical/research mode separation
```

Research network datasets must never become visible to unauthorised Clinical users.

---

# 56. AUDIT EVENTS

The following events SHALL be auditable:

```text
NETWORK_DEFINITION_CREATED
NETWORK_DEFINITION_APPROVED
NETWORK_METRIC_RELEASED
NETWORK_PROFILE_CREATED
NETWORK_PROFILE_QUALIFIED
NETWORK_PROFILE_SUPERSEDED
NETWORK_RELIABILITY_FAILED
NETWORK_CONTEXT_ATTACHED_TO_TARGET
NETWORK_FEATURE_USED_IN_RANKING
NETWORK_FEATURE_BLOCKED_BY_POLICY
NETWORK_RESEARCH_INTERPRETATION_CREATED
```

If a network feature affects a Clinical target ranking, the exact policy release and feature version must be reconstructable.

---

# 57. UX — NETWORK CONTEXT PANEL

The clinician workspace should introduce:

# **Network Context**

with progressive disclosure.

Initial view:

```text
NETWORK CONTEXT

CEN        Strong
DMN        Moderate
SN         Limited

CEN ↔ DMN  Altered
SN ↔ CEN   Within reference
SN ↔ DMN   Uncertain

Reliability
Moderate
```

Then:

> **View interpretation**

Then:

> **View measurements**

Then:

> **View evidence**

Then:

> **View methodology**

Then:

> **View provenance**

This is exactly the kind of progressive disclosure appropriate to Magniom: clinically useful at first glance, scientifically inspectable underneath.

---

# 58. NETWORK VISUALISATION

The UX may use a simple relational representation:

```text
             DMN
            /   \
           /     \
        CEN ----- SN
```

But visual prominence must not imply causal hierarchy.

The interface should make clear:

> **Network relationships shown here describe measured or evidence-supported relationships. They do not represent a causal treatment model.**

---

# 59. CANDIDATE CARD INTEGRATION

Every candidate may display:

```text
TARGET 01
Evidence Anchor

Evidence       Strong
Phenotype      Strong
Circuit        Strong
Connectomics   Moderate
Network        Supportive
Reliability    High
E-field        Good
```

Expanding Network:

```text
CEN
Strong relevance

DMN
Moderate relevance

SN
Contextual

CEN ↔ DMN
Concordant with candidate circuit context

SN ↔ CEN
Not materially informative

SN ↔ DMN
Uncertain
```

---

# 60. NETWORK CONTEXT MUST NOT DOMINATE THE UI

The clinician must not leave the interface thinking:

> "MAGNIOM found a CEN/DMN/SN abnormality and therefore selected this target."

Instead the hierarchy should visually communicate:

```text
WHY THIS TARGET

1. Evidence
2. Therapeutic circuit
3. Clinical objective
4. Patient-specific refinement
5. Network context
6. Reliability
7. Stimulability
```

The network is important—but it is not the clinical authority.

---

# 61. TRIPLE-NETWORK + PHENOTYPE

The Clinical Phenotype Ontology SHALL NOT introduce:

```text
CEN symptoms
DMN symptoms
SN symptoms
```

Clinical phenotype remains clinically grounded.

Instead:

```text
clinical phenotype
       ↓
clinical objective
       ↓
therapeutic circuit
       ↓
network context
```

This avoids circular reasoning.

---

# 62. TRIPLE-NETWORK + DYSHPHORIC / ANXIOSOMATIC CIRCUITS

For MDD, the architecture can eventually represent:

```text
Dysphoric phenotype
       ↓
Dysphoric therapeutic circuit
       ↓
Triple-network context
```

and:

```text
Anxiosomatic phenotype
       ↓
Anxiosomatic therapeutic circuit
       ↓
Triple-network context
```

The network layer should therefore help MAGNIOM answer:

> Does the patient's large-scale network configuration provide context that is concordant, neutral or contradictory to the therapeutic circuit being considered?

It should not answer:

> Which network should be stimulated?

---

# 63. PERSONALISATION INTEGRATION

The existing MAGNIOM personalisation principle requires that personalisation earn its place.

The Triple-Network layer reinforces this.

A network-informed refinement may only influence Clinical Mode when:

```text
same evidence family
+
qualified network reliability
+
validated network relationship
+
meaningful incremental information
+
no major contradiction
+
Scientific Policy permits use
```

Otherwise:

```text
network = contextual only
```

---

# 64. PERSONALISATION MAJOR DIVERGENCE

If:

```text
therapeutic circuit
        +
patient FC
        +
network configuration
```

strongly disagree, MAGNIOM should not manufacture consensus.

It should expose:

```text
PERSONALISATION_MAJOR_DIVERGENCE
```

with:

> The patient-specific network configuration does not strongly converge with the evidence-defined therapeutic circuit. The evidence-based candidate remains visible as the reference target hypothesis.

---

# 65. NETWORK UNCERTAINTY

A network interpretation must contain:

```ts
interface NetworkInterpretation {
  summary: string;

  confidence:
    | "high"
    | "moderate"
    | "limited"
    | "uncertain";

  supporting_facts: UUID[];

  contradictory_facts: UUID[];

  limitations: string[];

  clinical_implication:
    | "supportive_context"
    | "neutral_context"
    | "uncertain_context"
    | "contradictory_context"
    | "research_only";
}
```

---

# 66. NETWORK REDUNDANCY

The Triple-Network layer must also improve redundancy analysis.

Two candidates should not be considered distinct merely because:

```text
different coordinates
```

if they engage:

```text
same therapeutic circuit
+
same network context
+
same clinical objective
+
same E-field
```

Conversely, two spatially similar candidates may be meaningfully different if their therapeutic network engagement differs.

This extends the existing v2 principle that redundancy must be geometry- and role-aware rather than a simple distance threshold. 

---

# 67. NETWORK-AWARE REDUNDANCY FEATURE

Add:

```ts
network_overlap: {
  cen: number;
  dmn: number;
  sn: number;
  pairwise_relationship_overlap: number;
}
```

This remains a **suppression/context feature**, not a therapeutic efficacy measure.

---

# 68. NETWORK-AWARE CONVERGENCE

A candidate can now show:

```text
EVIDENCE                 HIGH
PHENOTYPE               HIGH
THERAPEUTIC CIRCUIT     HIGH
PATIENT CONNECTIVITY    MODERATE
TRIPLE NETWORK          HIGH
NORMATIVE CONTEXT       MODERATE
E-FIELD                 HIGH
```

This is much more informative than a single composite score.

---

# 69. IMPORTANT: CONVERGENCE ≠ TREATMENT EFFECT

MAGNIOM SHALL explicitly distinguish:

```text
scientific convergence
```

from:

```text
predicted treatment response
```

High convergence means:

> Multiple independent information sources support the same candidate interpretation.

It does not mean:

> The patient will respond.

---

# 70. FAILURE MODES

The system SHALL detect:

### TN-001

Network definition unavailable.

### TN-002

Network measurement incomplete.

### TN-003

CEN reliability insufficient.

### TN-004

DMN reliability insufficient.

### TN-005

SN reliability insufficient.

### TN-006

CEN–DMN relationship unstable.

### TN-007

SN–CEN relationship unstable.

### TN-008

SN–DMN relationship unstable.

### TN-009

Atlas-sensitive network configuration.

### TN-010

Normative model incompatible.

### TN-011

Evidence insufficient for clinical interpretation.

### TN-012

Research-only network feature requested in Clinical Mode.

### TN-013

Network feature not authorised by Scientific Policy.

### TN-014

Network interpretation exceeds evidence ceiling.

---

# 71. STANDARD WARNINGS

Recommended engine warnings:

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
```

---

# 72. CLINICAL ABSTENTION RULE

The presence of Triple-Network uncertainty must not create false clinical abstention.

For example:

```text
Evidence baseline valid
+
network unreliable
```

produces:

```text
Evidence-based candidate
+
network context unavailable
```

not:

```text
No target
```

Conversely:

```text
network is mandatory under approved EvidencePath
+
network unavailable
```

produces:

```text
mandatory gate failure
```

---

# 73. TESTING REQUIREMENTS

The new layer requires deterministic scientific tests.

### Definition tests

Verify:

```text
CEN membership
DMN membership
SN membership
```

against frozen canonical definitions.

### Relationship tests

Verify:

```text
CEN-DMN
SN-CEN
SN-DMN
```

are computed correctly.

### Reliability tests

Verify low-quality measurements cannot become clinically active.

### Evidence tests

Verify research evidence cannot be promoted automatically.

### Policy tests

Verify unauthorised network features cannot influence ranking.

### Determinism tests

Run identical network input:

```text
100 times
```

Expected:

```text
identical profile
identical hash
```

---

# 74. PROPERTY TESTS

The system SHALL test:

### Reliability monotonicity

Lower reliability cannot increase clinical authority.

### Evidence monotonicity

Lower evidence cannot be compensated for by stronger network fit.

### Policy monotonicity

A disabled network feature cannot affect output.

### Missing-network invariance

Where network context is optional:

```text
target output without network
=
baseline target output
```

apart from explicit contextual fields.

### Research isolation

Research-only network features cannot produce Clinical candidates.

---

# 75. GOLDEN CASES

Create canonical synthetic cases:

```text
TN-GOLDEN-001
Normal triple-network configuration

TN-GOLDEN-002
Altered CEN-DMN relationship

TN-GOLDEN-003
Altered SN-CEN relationship

TN-GOLDEN-004
Altered SN-DMN relationship

TN-GOLDEN-005
Multi-relationship alteration

TN-GOLDEN-006
Low network reliability

TN-GOLDEN-007
Strong therapeutic-circuit / weak network convergence

TN-GOLDEN-008
Strong network context / weak therapeutic evidence

TN-GOLDEN-009
Network evidence conflict

TN-GOLDEN-010
Research-only network feature
```

---

# 76. CRITICAL GOLDEN TEST

Construct:

```text
Case A:
excellent Triple-Network fit
weak evidence

Case B:
moderate Triple-Network fit
strong evidence
```

Expected:

> Case B must not be displaced merely because Case A has a stronger network profile.

This is a fundamental safety property.

---

# 77. SECOND CRITICAL TEST

Construct:

```text
Evidence target
+
patient-specific FC
+
Triple Network context
```

where all three converge.

Expected:

```text
one candidate
+
high convergence explanation
```

not:

```text
three candidates
```

This reinforces the existing MAGNIOM principle that convergence should not create artificial target multiplicity.

---

# 78. THIRD CRITICAL TEST

Construct:

```text
Evidence target
+
strong patient FC divergence
+
strong Triple-Network divergence
```

Expected:

```text
Evidence Anchor remains visible
+
personalisation downgraded
+
uncertainty disclosed
```

not automatic displacement.

---

# 79. API CONTRACT

The clinical application API should expose:

```ts
GET /cases/:caseId/triple-network
```

returning:

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

Target generation accepts:

```ts
triple_network_profile_id?: UUID
```

rather than arbitrary network parameters.

---

# 80. NO RAW NETWORK OVERRIDES

The Target Engine SHALL NOT accept:

```text
cen_weight = 0.8
dmn_weight = 0.5
sn_weight = 0.9
```

from the frontend.

Nor:

```text
"prioritise CEN"
```

from a clinician UI slider.

All scientific weighting is controlled by:

```text
ScientificPolicyRelease
```

The v2 architecture already explicitly prohibits user-editable ranking sliders and hidden organisation-local weights. 

---

# 81. LLM PROHIBITION

LLMs SHALL NOT:

* calculate network metrics;
* classify CEN/DMN/SN membership;
* determine network abnormality;
* select network relationships;
* change network reliability;
* determine target rank;
* override evidence ceilings;
* convert network context into clinical recommendations.

An LLM may eventually assist with:

```text
presentation wording
```

after deterministic scientific facts have already been generated.

---

# 82. SECURITY

Network profiles constitute clinical/scientific data and must receive the same protection as other patient-derived connectomics.

Requirements:

```text
encrypted at rest
encrypted in transit
tenant isolation
case-level authorisation
immutable audit
versioned scientific artifacts
no public exposure
```

No network profile may be sent to an external AI API in Clinical Mode.

---

# 83. VERSION COMPATIBILITY

A `TripleNetworkProfile` must record:

```text
pipeline_version
network_definition_version
atlas_version
metric_version
normative_model_version
reliability_method_version
scientific_policy_version
```

Target Engine compatibility must be explicit.

Example:

```ts
interface TripleNetworkCompatibility {
  profile_version: string;

  compatible_target_engine_major: number;

  compatible_policy_releases: UUID[];

  compatible_indication_modules: UUID[];
}
```

---

# 84. RELEASE MANAGEMENT

A change to:

```text
network definition
metric
preprocessing
denoising
atlas
normative model
reliability calculation
network interpretation logic
```

requires:

```text
new release
+
validation
+
regression testing
+
scientific impact assessment
```

It must never silently alter historical target decisions.

---

# 85. REPOSITORY ARCHITECTURE

Add:

```text
packages/
  networks/
    domain/
    definitions/
      cen/
      dmn/
      sn/
    relationships/
    metrics/
    reliability/
    configuration/
    provenance/
    policy/
    tests/

packages/
  target-engine-core/
    network-context/
    convergence/
    explanation/
```

Scientific compute:

```text
services/neurocompute/
  networks/
    definitions/
    metrics/
    triple_network/
    reliability/
```

Evidence:

```text
packages/evidence/
  networks/
    claims/
    provenance/
```

---

# 86. NO DUPLICATION

Network definitions SHALL be centrally governed.

MDD must not contain:

```text
MDD_CEN
MDD_DMN
MDD_SN
```

unless these represent genuinely indication-specific definitions.

The canonical objects are:

```text
CEN
DMN
SN
```

and indication-specific evidence relationships are layered above them.

---

# 87. MULTI-INDICATION EXTENSIBILITY

The architecture supports future:

```text
MDD
OCD
PTSD
TBI
stroke
pain
```

without assuming that the same Triple-Network relationship has the same clinical meaning.

For each indication:

```text
NetworkSystem
       ↓
EvidencePath
       ↓
Clinical objective
       ↓
permitted relationship
```

must be explicitly approved.

---

# 88. FUTURE ADVANCED NETWORK FEATURES

The architecture should reserve support for:

### Network controllability

Research only initially.

### Dynamic network states

Research only.

### Effective connectivity

Research only unless separately validated.

### Network mediation

Research only.

### Target-induced network change

Research only.

### Longitudinal network trajectories

Potential future clinical/research feature.

### Network response biomarkers

Research until prospective validation.

---

# 89. WHAT MAGNIOM SHOULD EVENTUALLY BE ABLE TO SAY

The mature system should be capable of a statement like:

> **The selected candidate belongs to an evidence-supported therapeutic circuit relevant to the patient's clinical objective. In this patient, the circuit shows moderate concordance with the measured CEN–DMN configuration. The underlying network relationship is reproducible across runs and compatible with the approved processing and network-definition releases. SN-related measures are less reliable and therefore were not used to alter candidate ranking. The network findings provide contextual support but do not independently establish target superiority.**

That is scientifically much stronger than:

> "The patient's CEN is dysfunctional, so MAGNIOM selected a CEN target."

---

# 90. FINAL TARGET ENGINE ARCHITECTURE

The mature MAGNIOM architecture should therefore be understood as:

```text
                    ┌─────────────────────┐
                    │   CLINICAL OBJECTIVE │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │      EVIDENCE       │
                    │   Evidence Paths    │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ THERAPEUTIC CIRCUIT │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ CANDIDATE GENERATOR │
                    └──────────┬──────────┘
                               ↓
             ┌─────────────────┴──────────────────┐
             │                                    │
             ↓                                    ↓
 ┌───────────────────────┐             ┌────────────────────────┐
 │ PATIENT CONNECTOMICS  │             │ TRIPLE-NETWORK SYSTEM  │
 │                       │             │                        │
 │ therapeutic FC        │             │ CEN                    │
 │ circuit FC            │             │ DMN                    │
 │ normative deviation   │             │ SN                     │
 │ reliability           │             │ CEN ↔ DMN              │
 └───────────┬───────────┘             │ SN ↔ CEN               │
             │                         │ SN ↔ DMN               │
             │                         │ configuration           │
             │                         │ reliability             │
             │                         │ evidence provenance     │
             │                         └────────────┬───────────┘
             │                                      │
             └────────────────┬─────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │ GOVERNED CONTEXT    │
                    │ + CONVERGENCE       │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │   EVIDENCE CEILING  │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ ANATOMY / E-FIELD   │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ REDUNDANCY / SLATE  │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ TARGET SLATE        │
                    │                     │
                    │ ≤3 Primary          │
                    │ ≤2 Additional       │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ SPECIALIST DECISION │
                    └─────────────────────┘
```

# 91. CANONICAL MAGNIOM PRINCIPLE

The Triple-Network Systems Layer introduces a new governing principle:

> **Network configuration provides systems context; it does not replace therapeutic evidence.**

And the broader Magniom hierarchy becomes:

> **Evidence determines what is clinically defensible.**
> **Clinical objectives determine what matters.**
> **Therapeutic circuits determine what should be engaged.**
> **Connectomics determines how that circuit is expressed in this patient.**
> **Triple-Network analysis describes the large-scale systems context in which that circuit operates.**
> **Reliability determines how much trust can be placed in patient-specific measurements.**
> **Anatomy and E-field determine what can actually be stimulated.**
> **Convergence determines how independently supported the candidate is.**
> **Uncertainty determines what must remain visible.**
> **Scientific Policy determines what the algorithm is permitted to do.**
> **The specialist makes the final clinical decision.**

---

# 92. FINAL GOVERNING RULE

MAGNIOM SHALL **not** ask:

> **"Is this patient's CEN, DMN or SN abnormal, and therefore where should we stimulate?"**

It SHALL ask:

> **"What clinically relevant therapeutic circuit is supported by the evidence, how is that circuit expressed in this patient, what is the patient's CEN–DMN–SN network configuration, how reliable are those measurements, how does that network context converge or conflict with the therapeutic hypothesis, what can actually be stimulated, and what does the evidence permit MAGNIOM to conclude?"**

That distinction is the architectural safeguard that makes the Triple-Network layer scientifically valuable rather than merely fashionable.

---

# 93. ACCEPTANCE CRITERIA

This specification is considered implemented only when:

* [ ] CEN is a canonical `NetworkSystem`.
* [ ] DMN is a canonical `NetworkSystem`.
* [ ] SN is a canonical `NetworkSystem`.
* [ ] network definitions are versioned.
* [ ] CEN–DMN is a first-class relationship.
* [ ] SN–CEN is a first-class relationship.
* [ ] SN–DMN is a first-class relationship.
* [ ] within-network measures are preserved.
* [ ] pairwise measurements are preserved.
* [ ] `NetworkConfiguration` exists.
* [ ] `TripleNetworkProfile` exists.
* [ ] network reliability is explicit.
* [ ] network evidence provenance is explicit.
* [ ] normative context is versioned.
* [ ] Research/Clinical authority is explicit.
* [ ] Target Engine receives network context through its resolved context.
* [ ] Triple Network cannot independently generate a Clinical candidate.
* [ ] network evidence cannot exceed its evidence ceiling.
* [ ] unreliable network measurements cannot influence Clinical ranking.
* [ ] network context can contribute to governed convergence.
* [ ] network context appears in candidate explanations.
* [ ] "Why this target may be wrong" includes network limitations where relevant.
* [ ] network features are controlled by Scientific Policy.
* [ ] deterministic network computation is verified.
* [ ] Research-only network features are blocked from Clinical Mode.
* [ ] historical network profiles are immutable.
* [ ] changes create versioned scientific releases.
* [ ] network-aware redundancy is supported.
* [ ] network-aware golden cases pass.
* [ ] 100-run deterministic reproducibility passes.
* [ ] no LLM participates in network calculation or target ranking.

---

## Architectural conclusion

I would make this specification a **core v2.x architectural amendment**, not an optional research appendix.

The important change is not simply adding CEN, DMN and SN to Magniom's database. It is introducing a new conceptual layer:

```text
                    MAGNIOM

Clinical Phenotype
       ↓
Therapeutic Evidence
       ↓
Therapeutic Circuit
       ↓
Patient Connectome
       ↓
┌───────────────────────────────┐
│ TRIPLE-NETWORK SYSTEMS LAYER  │
│                               │
│ CEN                           │
│ DMN                           │
│ SN                            │
│ CEN ↔ DMN                     │
│ SN ↔ CEN                      │
│ SN ↔ DMN                      │
│ Network Configuration         │
│ Reliability                   │
│ Evidence Provenance           │
└───────────────┬───────────────┘
                ↓
       Governed Context
                ↓
       Target Engine
                ↓
          Target Slate
```

This is, in my view, the **right architectural elevation**: the Triple Network becomes a genuine scientific differentiator for MAGNIOM without turning the platform into a simplistic "network abnormality → stimulation target" system. It also fits cleanly into the existing v2 architecture rather than fighting it: the current Target Engine already separates candidate generation, evidence governance, feature calculation, convergence, redundancy and final slate assembly. 
