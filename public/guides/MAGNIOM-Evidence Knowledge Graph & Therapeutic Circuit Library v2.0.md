# MAGNIOM

## Evidence Knowledge Graph & Therapeutic Circuit Library v2.0

**Document status:** Canonical multi-indication scientific knowledge specification
**Version:** 2.0
**Date:** 2 September 2026
**Supersedes:** MAGNIOM Evidence Knowledge Graph & Therapeutic Circuit Library v1.0 for new evidence development
**Knowledge implementation:** Versioned relational knowledge graph
**Primary consumers:** Evidence Governance, Target Engine, Scientific Policy, clinician Evidence Workspace, validation tooling
**Clinical authority:** Specialist clinician
**Scientific authority:** Approved Evidence Governance process
**Initial v2 seed indications:** OCD, neuropathic pain, stroke motor recovery, post-stroke aphasia, TBI, PTSD, chronic tinnitus
**MDD status:** Existing v1 evidence library preserved; migration into v2 semantics is separately controlled

**Depends on:**

* MAGNIOM Canonical Multi-Indication Data Specification v2.0
* MAGNIOM Multi-Indication Technical & Scientific Architecture Specification v2.0
* MAGNIOM Scientific Policy & Algorithm Configuration Specification v1.0
* MAGNIOM System Requirements Specification v1.0
* MAGNIOM Evidence Knowledge Graph & Therapeutic Circuit Library v1.0
* MAGNIOM Target Engine & Ranking Algorithm Specification v1.0
* MAGNIOM Neuroimaging & Functional Connectomics Pipeline Specification v1.0

---

# 1. PURPOSE

The MAGNIOM Evidence Knowledge Graph converts scientific literature into:

# narrow, versioned, contestable scientific propositions

that constrain patient-specific TMS reasoning.

For every proposed target hypothesis the graph should ultimately be able to answer:

```text
What exactly has been demonstrated?

In which population?

For which indication?

At which disease stage?

For which clinical objective?

At which target family?

Using which stimulation strategy?

With which target geometry?

Under which treatment context?

Against what comparator?

For which outcome?

For how long?

What evidence supports that proposition?

What evidence conflicts with it?

What is still unknown?

Has MAGNIOM governance classified the claim?

What clinical role, if any, has Scientific Policy permitted?
```

The graph exists to prevent:

```text
interesting paper
      ↓
interesting brain region
      ↓
clinical target
```

without an explicit scientific bridge.

---

# 2. v2 FUNDAMENTAL EVIDENCE PRINCIPLE

MAGNIOM v2 SHALL reason:

```text
Source
   ↓
SourceFinding
   ↓
EvidenceClaim
   ↓
Population
   ↓
Indication
   ↓
DiseaseStage
   ↓
ClinicalObjective / OutcomeDomain
   ↓
TherapeuticCircuit or Target-System Hypothesis
   ↓
TargetFamily
   ↓
TargetingStrategy
   ↓
TargetGeometry
   ↓
TreatmentContext
   ↓
Evidence Governance Classification
   ↓
Scientific Policy permission
   ↓
Patient-specific TargetCandidate
```

Patient imaging enters:

# after the evidence path,

not before it.

This extends rather than replaces the v1 safety rule that a patient imaging finding cannot create its own clinical evidence. 

---

# 3. CLAIM-CENTRIC, NOT PAPER-CENTRIC

The v1 principle remains canonical:

# papers are sources; claims are scientific propositions.

One paper may support:

* efficacy;
* safety;
* durability;
* a target family;
* a treatment context;
* a population boundary;

while simultaneously failing to support:

* superiority over another targeting method;
* individualised target selection;
* long-term durability.

The graph must preserve those distinctions.

---

# 4. v2 CRITICAL CHANGE — TIER IS GOVERNANCE, NOT CLAIM IDENTITY

v1 placed:

```ts
evidence_tier: EvidenceTier
```

inside `EvidenceClaim`.

v2 separates:

```text
EvidenceClaim
```

from:

```text
EvidenceGovernanceClassification.
```

The scientific proposition can therefore exist while its MAGNIOM Tier remains:

```text
unassigned
```

or:

```text
deferred.
```

This is essential for newly seeded indications.

---

# 5. WHY THIS CHANGE IS NECESSARY

Consider a current literature set containing:

```text
positive RCTs
+
positive meta-analysis
+
negative meta-analysis
+
older guideline
+
newer heterogeneous studies.
```

Assigning:

```text
Tier B
```

during ingestion would collapse scientific synthesis and clinical governance into one step.

Instead:

```text
literature
   ↓
claims
   ↓
claim synthesis
   ↓
governance review
   ↓
tier
   ↓
Scientific Policy
   ↓
clinical role.
```

---

# 6. `EvidenceClaimV2`

```ts
interface EvidenceClaimV2 {
  id: UUID;
  code: string;
  version: string;

  lifecycle_status:
    | "draft"
    | "under_review"
    | "approved_scientific_claim"
    | "rejected"
    | "deprecated"
    | "superseded";

  claim_type:
    | "clinical_efficacy"
    | "comparative_efficacy"
    | "target_outcome_association"
    | "targeting_method_efficacy"
    | "target_specificity"
    | "symptom_specificity"
    | "circuit_validity"
    | "mechanistic"
    | "safety"
    | "durability"
    | "treatment_context"
    | "external_validity"
    | "negative_evidence"
    | "methodological_limitation";

  statement: string;

  direction:
    | "supports"
    | "does_not_support"
    | "mixed"
    | "context_dependent"
    | "uncertain";

  indication_ids: UUID[];

  clinical_objective_definition_ids?: UUID[];
  outcome_domain_ids: UUID[];

  population_ids: UUID[];

  disease_stage_definition_ids?: UUID[];

  therapeutic_circuit_ids?: UUID[];

  target_family_ids?: UUID[];

  targeting_strategy_ids?: UUID[];

  target_geometry_class_ids?: UUID[];

  treatment_context_requirement_ids?: UUID[];

  intervention_descriptor?: InterventionDescriptor;
  comparator_descriptor?: ComparatorDescriptor;

  source_contributions: SourceContribution[];

  synthesis_id?: UUID;

  applicability_constraints: string[];
  limitations: string[];

  reviewed_at?: ISO8601UTC;
  next_review_due?: ISO8601UTC;

  provenance: Provenance;
}
```

There is deliberately:

# no mandatory Tier field.

---

# 7. `EvidenceGovernanceClassification`

```ts
interface EvidenceGovernanceClassification {
  id: UUID;

  evidence_claim_id: UUID;
  claim_version: string;

  classification_status:
    | "unassigned"
    | "under_review"
    | "assigned"
    | "deferred"
    | "withdrawn";

  magniom_evidence_tier?:
    | "A"
    | "B"
    | "C"
    | "D"
    | "R";

  permitted_roles?: {
    standalone_primary: boolean;
    standalone_additional: boolean;
    supporting_context: boolean;
    refinement_of_parent_claims: boolean;
    research_candidate_generation: boolean;
  };

  reviewer_ids: UUID[];

  rationale?: string;

  supporting_synthesis_id?: UUID;

  assigned_at?: ISO8601UTC;

  supersedes_classification_id?: UUID;

  provenance: Provenance;
}
```

---

# 8. SEEDING RULE

For the seven new v2 indications defined in this document:

```text
EvidenceClaim
→ may be seeded
```

but initial:

```text
EvidenceGovernanceClassification.classification_status
=
unassigned
```

unless separately approved by the MAGNIOM governance process.

This document SHALL NOT silently promote any seeded claim into Clinical Mode.

---

# 9. EXTERNAL GUIDELINE GRADES ARE NOT MAGNIOM TIERS

A source may state:

```text
Level A efficacy
```

or:

```text
Level B probable efficacy.
```

MAGNIOM stores that finding verbatim as source metadata.

It SHALL NOT automatically translate:

```text
external Level A
```

into:

```text
MAGNIOM Tier A.
```

The grading frameworks, dates, evidentiary scope and MAGNIOM intended claims differ.

---

# 10. SOURCE FINDING

A single source may generate multiple `SourceFinding` objects.

```ts
interface SourceFinding {
  id: UUID;

  source_id: UUID;

  finding_type:
    | "primary_outcome"
    | "secondary_outcome"
    | "subgroup"
    | "target_comparison"
    | "safety"
    | "durability"
    | "guideline_recommendation"
    | "meta_analytic_estimate"
    | "null_result"
    | "limitation";

  finding_statement: string;

  effect_estimate?: EffectEstimate;

  population_id?: UUID;

  target_family_ids?: UUID[];

  treatment_context_ids?: UUID[];

  followup_interval?: DurationDescriptor;

  extraction_status:
    | "single_curator"
    | "double_checked"
    | "adjudicated";

  provenance: Provenance;
}
```

---

# 11. SOURCE CONTRIBUTION

```ts
interface SourceContribution {
  source_id: UUID;
  source_finding_ids: UUID[];

  relationship:
    | "supports"
    | "partially_supports"
    | "conflicts"
    | "does_not_support"
    | "limits_generalisation";

  independence:
    | "independent"
    | "partially_overlapping"
    | "overlapping_dataset"
    | "unknown";

  relevance:
    | "direct"
    | "indirect"
    | "contextual";

  curator_note?: string;
}
```

---

# 12. CLAIM SYNTHESIS

```ts
interface ClaimEvidenceSynthesis {
  id: UUID;

  evidence_claim_id: UUID;

  directness:
    | "strong"
    | "moderate"
    | "limited"
    | "uncertain";

  replication:
    | "multiple_independent"
    | "replicated"
    | "single_source"
    | "mixed"
    | "not_assessable";

  study_design_strength:
    | "strong"
    | "moderate"
    | "limited"
    | "uncertain";

  sample_support:
    | "strong"
    | "moderate"
    | "limited"
    | "uncertain";

  consistency:
    | "consistent"
    | "mostly_consistent"
    | "mixed"
    | "mostly_negative"
    | "uncertain";

  clinical_applicability:
    | "direct"
    | "partial"
    | "limited"
    | "uncertain";

  target_specificity:
    | "specific"
    | "moderate"
    | "broad"
    | "uncertain";

  treatment_context_dependence:
    | "material"
    | "possible"
    | "minimal"
    | "unknown";

  synthesis_statement: string;

  governance_tier_recommendation?: EvidenceTier;

  // Advisory only. Cannot activate clinical eligibility.
}
```

The dimensional model extends the v1 approach in which directness, replication, design strength, sample support, consistency, applicability, target specificity and independence informed governance without mechanically calculating the Tier. 

---

# 13. CORE v2 NODE TYPES

```text
Source
SourceFinding
EvidenceClaim
ClaimEvidenceSynthesis
EvidenceGovernanceClassification

Population
Indication
DiseaseStageDefinition
ClinicalObjectiveDefinition
OutcomeDomain

TherapeuticCircuit
CircuitArtifact
TargetFamily
TargetDefinition
TargetGeometryClass
BodyRegion
TargetingStrategy
SearchSpace

TreatmentContextRequirement
ProtocolPrecedent
DeviceClass
CoilClass

EvidenceLibraryRelease
IndicationModuleRelease
```

Patient-specific objects remain outside the Evidence Graph.

---

# 14. v2 EDGE ONTOLOGY

Retain v1:

```text
SUPPORTS
CONFLICTS_WITH
DERIVED_FROM
VALIDATES
REPLICATES
PARTIALLY_REPLICATES
APPLIES_TO
ADDRESSES
MEASURES
ENGAGES
TARGETS
REFINES
BELONGS_TO
ALTERNATIVE_TO
SUPERSEDES
USES_MAP
USES_SEED
USES_SEARCH_SPACE
USES_PROTOCOL
HAS_PRECEDENT
HAS_LIMITATION
```

Add:

```text
APPLIES_AT_STAGE
SUPPORTS_OBJECTIVE
REQUIRES_CONTEXT
WAS_TESTED_WITH
USES_TARGET_GEOMETRY
USES_DEVICE_CLASS
USES_COIL_CLASS
MAPS_TO_BODY_REGION
REQUIRES_LESION_CONTEXT
LIMITS_GENERALISATION
DOES_NOT_SUPPORT
HAS_NULL_EVIDENCE
```

---

# 15. NO `PROVES` EDGE

MAGNIOM SHALL continue avoiding:

```text
PROVES
```

as a routine scientific edge.

Use:

```text
SUPPORTS
VALIDATES
REPLICATES
DOES_NOT_SUPPORT
CONFLICTS_WITH
```

Scientific uncertainty belongs in the graph.

---

# 16. THERAPEUTIC CIRCUIT v2

`TherapeuticCircuit` now requires a maturity descriptor independent of MAGNIOM Evidence Tier.

```ts
interface TherapeuticCircuitV2 {
  id: UUID;
  code: string;
  version: string;

  name: string;

  indication_scope_ids: UUID[];

  clinical_objective_definition_ids: UUID[];

  circuit_kind:
    | "therapeutic_network"
    | "target_system"
    | "interhemispheric_model"
    | "functional_network"
    | "lesion_network"
    | "mechanistic_hypothesis";

  scientific_status:
    | "treatment_effect_linked"
    | "prospectively_tested"
    | "replicated_association"
    | "mechanistic"
    | "hypothesis";

  circuit_definition: CircuitDefinition;

  circuit_artifact_ids?: UUID[];

  supporting_evidence_claim_ids: UUID[];

  conflicting_evidence_claim_ids: UUID[];

  limitations: string[];

  provenance: Provenance;
}
```

---

# 17. CIRCUIT NOMENCLATURE SAFETY

Where evidence supports:

# stimulation of a region

but does not establish:

# a distributed therapeutic circuit,

MAGNIOM SHOULD create:

```text
circuit_kind = target_system
```

rather than inventing a mechanistic network.

This matters particularly for:

* neuropathic pain;
* TBI;
* tinnitus.

---

# 18. TARGET FAMILY v2

```ts
interface TargetFamilyV2 {
  id: UUID;
  code: string;
  version: string;

  name: string;

  indication_scope_ids: UUID[];

  clinical_objective_definition_ids: UUID[];

  therapeutic_circuit_ids: UUID[];

  anatomy: TargetFamilyAnatomy;

  permitted_target_geometry_types: TargetGeometryType[];

  evidence_claim_ids: UUID[];

  candidate_generation_method_ids: UUID[];

  treatment_context_requirement_ids?: UUID[];

  disease_stage_constraints?: UUID[];

  governance_status:
    | "staging"
    | "research"
    | "validation"
    | "clinical_permitted"
    | "suspended";

  limitations: string[];

  provenance: Provenance;
}
```

`clinical_permitted` cannot be set by evidence ingestion.

---

# 19. CLAIM ↔ TARGET BINDING

A strong efficacy claim for an intervention does not automatically validate every targeting method used to reach that anatomy.

Use:

```ts
interface ClaimTargetBinding {
  evidence_claim_id: UUID;

  target_family_id: UUID;

  targeting_strategy_id?: UUID;

  geometry_class?: TargetGeometryType;

  relationship:
    | "directly_tested"
    | "consistent_with"
    | "indirectly_supports"
    | "not_tested";

  limitations: string[];
}
```

---

# 20. TREATMENT CONTEXT IS FIRST-CLASS

The v2 graph SHALL distinguish:

```text
Target
```

from:

```text
Target + stimulation strategy + rehabilitation/behavioural context.
```

This is particularly important for:

* post-stroke motor rehabilitation;
* aphasia + speech-language therapy;
* OCD symptom provocation;
* target evidence obtained with specific coil classes.

---

# 21. EVIDENCE STAGING RULE

New indication evidence follows:

```text
Source ingestion
      ↓
SourceFinding extraction
      ↓
EvidenceClaim creation
      ↓
support/conflict linking
      ↓
claim synthesis
      ↓
scientific review
      ↓
governance classification
      ↓
EvidenceLibraryRelease
      ↓
ScientificPolicy permission
```

Do not skip:

# claim synthesis

and jump from publication to Tier.

---

# 22. INITIAL v2 SOURCE SNAPSHOT

The following seeds are based on a current literature snapshot through September 2026.

They are:

# starting evidence objects,

not:

# a completed systematic review.

Formal clinical promotion requires source-level extraction, duplicate checking, risk-of-bias appraisal and governance review.

---

# 23. SOURCE REGISTRY — CROSS-INDICATION GUIDELINE

### `SRC-TMS-GUIDE-2020-LEFAUCHEUR`

**Type:** evidence-based expert guideline/update
**Source:** Lefaucheur et al., *Clinical Neurophysiology*, 2020.

Relevant external findings include:

* high-frequency contralateral M1 rTMS for neuropathic pain received the guideline's Level A designation;
* low-frequency contralesional M1 for post-acute hand motor recovery after stroke received Level A;
* high-frequency ipsilesional M1 for post-acute motor recovery received Level B;
* high-frequency right DLPFC for PTSD received Level B;
* low-frequency right inferior frontal gyrus for chronic post-stroke non-fluent aphasia received Level B.

The authors explicitly note that their efficacy grades are based on replicated real-versus-sham differences and do **not** necessarily mean that the benefit reaches clinical relevance. ([PubMed][1])

MAGNIOM interpretation:

```text
Store external grade.
Do not convert it automatically to MAGNIOM Tier.
```

---

# 24. OCD MODULE — SEED SCOPE

```text
COND-OCD-001
Obsessive-compulsive disorder
```

Initial objectives:

```text
OBJ-OCD-CORE-001
reduce obsessive-compulsive symptom burden

OBJ-OCD-FUNCTION-001
improve OCD-related functional impairment
```

Initial target systems/families for evidence staging:

```text
TC-OCD-CSTC-001
cortico-striato-thalamo-cortical treatment-system hypothesis

TF-OCD-MPFC-ACC-FIELD-001
mPFC / ACC field-target family

TF-OCD-PRESMA-SMA-001
pre-SMA / SMA target family

TF-OCD-DLPFC-001
DLPFC target family

TF-OCD-OFC-001
orbitofrontal target family
```

These target families begin with:

```text
governance_status = staging
```

not automatically clinical.

---

# 25. OCD SOURCE — REGULATORY PRECEDENT

### `SRC-OCD-FDA-DTMS-2018`

The US FDA permitted marketing of the BrainsWay Deep TMS system for treatment of OCD in 2018. This is direct evidence of a regulated OCD TMS indication for the specific cleared system/context, but regulatory authorisation is not itself proof that every OCD TMS target or targeting method is equivalent. ([U.S. Food and Drug Administration][2])

---

# 26. OCD CLAIM EC-OCD-001

```text
EC-OCD-MPFC-ACC-DTMS-001
```

**Claim:**

> Deep TMS engaging medial prefrontal/anterior cingulate regions has clinical treatment precedent for OCD.

```text
type                clinical_efficacy
direction           supports
target_family       TF-OCD-MPFC-ACC-FIELD-001
target_geometry     coil_field
tier                UNASSIGNED
```

Supporting sources:

```text
SRC-OCD-FDA-DTMS-2018
```

Limitations:

* applies to the cleared device/coil/treatment context;
* does not validate arbitrary point-coordinate mPFC targeting;
* does not establish superiority over other OCD target families.

---

# 27. OCD CLAIM EC-OCD-002

```text
EC-OCD-MULTITARGET-META-001
```

**Claim:**

> Sham-controlled literature supports therapeutic effects across more than one OCD target family rather than identifying one universally superior cortical target.

A 2024 network meta-analysis found superior-to-sham effects for several approaches involving bilateral DLPFC, right DLPFC, bilateral mPFC/ACC and bilateral SMA, but noted modest study sizes and risk-of-bias concerns. ([PubMed][3])

```text
direction      supports
scope          comparative target evidence
tier           UNASSIGNED
```

Implication:

# MAGNIOM should expose competing OCD target hypotheses rather than invent one universal OCD coordinate.

---

# 28. OCD CLAIM EC-OCD-003

```text
EC-OCD-RCT-META-2025-001
```

**Claim:**

> Updated randomized evidence supports symptom reductions for some DLPFC and mPFC/ACC approaches, but overall effect magnitude, protocol heterogeneity and clinically meaningful change require careful interpretation.

A 2025 meta-analysis of 31 trials reported significant Y-BOCS reductions for left DLPFC and mPFC/ACC subgroups; the overall repeated-rTMS reduction was below the cited minimal clinically important difference in that review. ([PubMed][4])

```text
direction      context_dependent
tier           UNASSIGNED
```

---

# 29. OCD CLAIM EC-OCD-004 — CONFLICT PATH

```text
EC-OCD-LF-SURFACE-NULL-001
```

**Claim:**

> Low-frequency non-neuronavigated surface-coil rTMS, considered as a class, has not shown a statistically significant pooled benefit over sham in a recent analysis.

A 2026 meta-analysis of 14 RCTs reported a non-significant pooled Y-BOCS difference and emphasised that its null finding should not be generalised to approved deep-TMS or neuronavigated approaches. ([PubMed][5])

Relationship:

```text
CONFLICTS_WITH
overbroad claim:
"rTMS to DLPFC/SMA is uniformly effective for OCD"
```

This is a model example of why:

# protocol and target geometry must remain in the evidence path.

---

# 30. OCD INITIAL GRAPH

```text
OCD
 │
 ├─ EC-OCD-MPFC-ACC-DTMS-001
 │      ↓
 │   mPFC/ACC field target
 │      ↓
 │   coil-field geometry
 │
 ├─ EC-OCD-MULTITARGET-META-001
 │      ├─ DLPFC
 │      ├─ SMA/pre-SMA
 │      └─ mPFC/ACC
 │
 └─ EC-OCD-LF-SURFACE-NULL-001
        ↓
     limits broad generalisation
```

---

# 31. NEUROPATHIC PAIN MODULE — SEED SCOPE

```text
COND-PAIN-NP-001
Chronic neuropathic pain
```

Initial objective:

```text
OBJ-PAIN-REDUCTION-001
reduce neuropathic pain intensity/burden
```

Initial target-system hypothesis:

```text
TC-PAIN-M1-MODULATION-001
M1-engaged pain-modulatory target system
```

Initial target family:

```text
TF-PAIN-M1-SOMATO-001
somatotopic M1 contralateral to painful body region
```

Target geometry:

```text
somatotopic
```

---

# 32. PAIN CLAIM EC-PAIN-001

```text
EC-PAIN-HF-M1-001
```

**Claim:**

> High-frequency rTMS delivered to M1 contralateral to the painful side has replicated analgesic efficacy in neuropathic-pain literature.

The 2020 European guideline assigned this intervention its external Level A designation. ([PubMed][1])

```text
direction      supports
target_family  TF-PAIN-M1-SOMATO-001
tier           UNASSIGNED
```

MAGNIOM does not automatically map:

```text
external Level A
→ MAGNIOM Tier A.
```

---

# 33. PAIN CLAIM EC-PAIN-002

```text
EC-PAIN-RTMS-SHAM-META-001
```

**Claim:**

> Across heterogeneous neuropathic-pain studies, active rTMS has shown greater pain reduction than sham, while treatment effect varies with stimulation frequency, site and lesion location.

A systematic review/meta-analysis of 38 studies reported a pooled effect favouring active rTMS and identified frequency, intervention site and lesion location as relevant moderators. ([PubMed][6])

Implication:

```text
BodyRegion
Laterality
Pain mechanism
Targeting site
```

must remain explicit graph nodes.

---

# 34. PAIN CLAIM EC-PAIN-003 — LIMITATION

```text
EC-PAIN-M1-HETEROGENEITY-001
```

**Claim:**

> M1 rTMS analgesia is heterogeneous and evidence does not justify treating every neuropathic-pain phenotype or body distribution as the same target problem.

A systematic review of chronic neuropathic pain found significant but often transient effects, with low/very-low certainty for several evidence strata and substantial study heterogeneity. ([PubMed][7])

```text
direction      limits_generalisation
tier           UNASSIGNED
```

---

# 35. PAIN CLAIM EC-PAIN-004 — CLINICAL CONTEXT

```text
EC-PAIN-RMTS-CARE-POSITION-001
```

A French systematic guideline recommended high-frequency motor-cortex rTMS only weakly as a third-line treatment option for neuropathic pain in its broader therapeutic algorithm. ([PubMed][8])

This does not conflict directly with the European neurophysiology efficacy grade.

It demonstrates different questions:

```text
Does a protocol outperform sham?
```

versus:

```text
Where should it sit in routine care?
```

The graph SHALL preserve both.

---

# 36. STROKE MOTOR MODULE — SEED SCOPE

```text
COND-STROKE-MOTOR-001
Stroke with motor impairment
```

Clinical objectives:

```text
OBJ-STROKE-UE-001
improve upper-limb motor function

OBJ-STROKE-HAND-001
improve hand function

OBJ-STROKE-ADL-001
improve functional independence
```

Stage nodes:

```text
acute
subacute / post-acute
chronic
```

Initial target-system hypotheses:

```text
TC-STROKE-MOTOR-IHI-001
interhemispheric motor-balance model

TC-STROKE-MOTOR-RESERVE-001
structural reserve / compensatory motor-network model
```

---

# 37. STROKE MOTOR TARGET FAMILIES

```text
TF-STROKE-MOTOR-CM1-001
contralesional M1

TF-STROKE-MOTOR-IM1-001
ipsilesional M1

TF-STROKE-MOTOR-BILAT-001
bilateral motor strategy

TF-STROKE-MOTOR-CPMD-RES-001
contralesional dorsal premotor compensatory hypothesis
```

All begin in evidence staging.

---

# 38. STROKE MOTOR CLAIM EC-STR-001

```text
EC-STR-CM1-LF-POSTACUTE-001
```

**Claim:**

> Low-frequency rTMS of contralesional M1 has replicated real-versus-sham efficacy for post-acute hand motor recovery.

The 2020 guideline assigned this intervention external Level A evidence. ([PubMed][1])

Graph requirements:

```text
APPLIES_AT_STAGE → post_acute
TARGETS → contralesional M1
MEASURES → hand motor recovery
```

MAGNIOM Tier:

```text
UNASSIGNED
```

---

# 39. STROKE MOTOR CLAIM EC-STR-002

```text
EC-STR-IM1-HF-POSTACUTE-001
```

**Claim:**

> High-frequency ipsilesional M1 stimulation has evidence supporting post-acute motor recovery, though the external guideline classified it less strongly than contralesional low-frequency stimulation.

The 2020 guideline assigned this approach external Level B. ([PubMed][1])

---

# 40. STROKE MOTOR CLAIM EC-STR-003

```text
EC-STR-MOTOR-RCTMETA-2025-001
```

**Claim:**

> In a meta-analysis restricted to randomized trials with low risk of bias, rTMS improved upper-extremity motor outcomes, with significant effects particularly in acute/subacute patients and those with greater baseline motor impairment.

The analysis included 37 articles and 48 comparisons; pooled FMA-UE results favoured rTMS. ([PubMed][9])

Graph consequences:

```text
DiseaseStage
BaselineSeverity
OutcomeDomain
```

are evidence-relevant.

---

# 41. STROKE MOTOR CLAIM EC-STR-004 — MECHANISTIC LIMITATION

```text
EC-STR-IHI-NOT-UNIVERSAL-001
```

**Claim:**

> The simple model that contralesional motor cortex is uniformly maladaptive may not generalise to severely affected patients with substantial ipsilesional pathway damage.

Mechanistic work has proposed that severely affected patients may rely more heavily on undamaged contralesional motor/premotor systems, challenging a one-size-fits-all inhibitory model. ([PubMed][10])

```text
claim_type       mechanistic
direction        limits_generalisation
target_family    TF-STROKE-MOTOR-CM1-001
tier             UNASSIGNED
```

This claim SHALL be visible whenever a candidate is justified merely as:

> suppress the contralesional hemisphere.

---

# 42. STROKE MOTOR CIRCUIT PRINCIPLE

MAGNIOM SHALL NOT encode:

```text
contralesional activity = pathological
```

as a universal biological fact.

The graph should instead encode competing mechanistic models:

```text
interhemispheric competition
versus
compensatory recruitment / structural reserve.
```

Target eligibility remains evidence- and policy-governed.

---

# 43. POST-STROKE APHASIA MODULE — SEED SCOPE

```text
COND-STROKE-APHASIA-001
Post-stroke aphasia
```

Objectives:

```text
OBJ-PSA-NAMING-001
improve naming

OBJ-PSA-COMP-001
improve comprehension

OBJ-PSA-REPETITION-001
improve repetition

OBJ-PSA-FUNCTION-001
improve functional communication
```

Initial target-system hypothesis:

```text
TC-PSA-BILATERAL-LANGUAGE-001
bilateral post-stroke language-network recovery system
```

---

# 44. APHASIA TARGET FAMILIES

```text
TF-PSA-RIFG-001
right inferior frontal / Broca-homologue region

TF-PSA-ILES-LANG-001
ipsilesional residual language-network region

TF-PSA-BILAT-001
bilateral language strategy
```

Candidate generation requires lesion and language context.

---

# 45. APHASIA CLAIM EC-PSA-001

```text
EC-PSA-RIFG-LF-CHRONIC-001
```

**Claim:**

> Low-frequency stimulation of the right inferior frontal gyrus has replicated evidence for chronic post-stroke non-fluent aphasia.

The 2020 European guideline assigned this protocol an external Level B designation. ([PubMed][1])

Graph scope must retain:

```text
chronic
non-fluent aphasia
right IFG
low-frequency precedent
```

It SHALL NOT be generalised automatically to every aphasia phenotype.

---

# 46. APHASIA CLAIM EC-PSA-002

```text
EC-PSA-RTMS-SLT-META-001
```

**Claim:**

> rTMS combined with speech-language therapy has shown improvements across several language domains compared with sham plus SLT or SLT alone in pooled randomized evidence.

A 2025 meta-analysis of 30 RCTs involving 1,597 patients reported improvements in auditory comprehension, naming, repetition and spontaneous speech. ([PubMed][11])

This claim SHALL link to:

```text
REQUIRES_CONTEXT
→ speech_language_therapy
```

because the evidence should not be represented as if stimulation occurred independently of rehabilitation.

---

# 47. APHASIA CLAIM EC-PSA-003

```text
EC-PSA-OVERALL-RCTMETA-2026-001
```

A 2026 meta-analysis of 26 RCTs found a significant pooled positive effect of rTMS on language recovery and explicitly examined stimulation site, chronicity, protocol direction and individualised targeting as potential moderators. ([PubMed][12])

MAGNIOM implication:

# target and disease-stage semantics must remain granular.

---

# 48. APHASIA CLAIM EC-PSA-004 — PROTOCOL HETEROGENEITY

```text
EC-PSA-CONTEXT-HETEROGENEITY-001
```

A 2026 network meta-analysis found different TMS+SLT strategies ranking differently across immediate and long-term language domains; evidence for some newer high-ranked combinations was low or very low because of indirectness and imprecision. ([PubMed][13])

Therefore the graph SHALL NOT encode:

```text
best aphasia TMS protocol
```

as one universal proposition.

---

# 49. TBI MODULE — UMBRELLA CONDITION

TBI SHALL NOT be represented as one target indication.

```text
COND-TBI-001
Traumatic brain injury
```

Sub-objectives:

```text
OBJ-TBI-PAIN-001
post-TBI neuropathic pain

OBJ-TBI-COG-001
post-TBI cognitive impairment

OBJ-TBI-DEP-001
post-TBI depressive symptoms

OBJ-TBI-PCS-001
post-concussive symptom burden
```

These must retain separate evidence paths.

---

# 50. TBI TARGET FAMILY POLICY

The initial v2 seed SHALL NOT assign one universal:

```text
TF-TBI-TARGET
```

because current pooled evidence often aggregates different objectives and protocols.

Where source-level primary-study extraction has not yet established a defensible target-family relationship:

```text
target_family_ids = []
```

is the correct canonical representation.

# Missing target specificity is evidence information.

It is not a schema failure.

---

# 51. TBI CLAIM EC-TBI-001

```text
EC-TBI-META2025-COG-001
```

A 2025 meta-analysis of seven randomized trials reported a significant pooled improvement in cognition after rTMS compared with control. ([PubMed][14])

```text
objective        cognition
direction        supports
target_family    PENDING_PRIMARY_STUDY_EXTRACTION
tier             UNASSIGNED
```

---

# 52. TBI CLAIM EC-TBI-002

```text
EC-TBI-META2025-PAIN-001
```

The same analysis reported a significant pooled reduction in pain. ([PubMed][14])

Again:

```text
clinical efficacy signal ≠ validated MAGNIOM target family.
```

Target linkage requires extraction of the underlying intervention sites and protocols.

---

# 53. TBI CLAIM EC-TBI-003 — NULL DEPRESSION

```text
EC-TBI-META2025-DEP-NULL-001
```

The 2025 pooled analysis found no significant difference for depressive symptoms. ([PubMed][14])

Relationship:

```text
CONFLICTS_WITH
EC-TBI-EARLIER-DEP-POSITIVE
```

where applicable.

---

# 54. TBI CLAIM EC-TBI-004 — CONFLICTING SYNTHESIS

An earlier meta-analysis of randomized non-invasive brain-stimulation studies found short-term benefit for rTMS in post-TBI depression, while durability was uncertain. ([PubMed][15])

The graph therefore encodes:

```text
post-TBI depression
    ↓
mixed pooled evidence
```

not:

```text
DLPFC is validated for TBI depression.
```

---

# 55. TBI CLAIM EC-TBI-005 — 2026 UPDATE

A 2026 meta-analysis/trial-sequential analysis found short-term neuropathic-pain benefit and possible post-concussive symptom reduction, but no significant effects on cognition or depressive symptoms in that synthesis. ([PubMed][16])

This directly conflicts with the 2025 pooled cognitive result.

MAGNIOM synthesis:

```text
consistency = mixed
```

for cognition.

This is precisely why v2 seeds:

# claims first, Tier later.

---

# 56. TBI CIRCUIT POLICY

Until primary evidence is extracted and independently reviewed:

do not create authoritative:

```text
therapeutic circuit for TBI cognition
```

merely because prefrontal stimulation was used in some trials.

Use:

```text
circuit_kind = mechanistic_hypothesis
```

or leave circuit binding absent.

---

# 57. TBI STRUCTURAL CONTEXT

TBI evidence paths SHOULD eventually permit constraints involving:

```text
skull defect
cranioplasty
lesion location
injury severity
injury chronicity
seizure history
structural distortion
```

These are not efficacy claims, but they affect population applicability, safety interpretation and future E-field reasoning.

---

# 58. PTSD MODULE — SEED SCOPE

```text
COND-PTSD-001
Post-traumatic stress disorder
```

Objectives:

```text
OBJ-PTSD-CORE-001
reduce core PTSD symptom burden

OBJ-PTSD-DEP-001
reduce comorbid depressive symptoms
```

Initial target-system hypothesis:

```text
TC-PTSD-FRONTOLIMBIC-001
prefrontal/frontolimbic treatment-system hypothesis
```

Initial target families:

```text
TF-PTSD-RDLPFC-001
right DLPFC

TF-PTSD-LDLPFC-001
left DLPFC

TF-PTSD-DMPFC-001
dmPFC research family
```

---

# 59. PTSD CLAIM EC-PTSD-001

```text
EC-PTSD-RDLPFC-HF-001
```

**Claim:**

> High-frequency right-DLPFC rTMS has replicated sham-controlled efficacy evidence for PTSD.

The 2020 European guideline assigned this approach external Level B evidence. ([PubMed][1])

MAGNIOM classification remains:

```text
UNASSIGNED
```

pending v2 governance.

---

# 60. PTSD CLAIM EC-PTSD-002

A 2024 meta-analysis reported substantial symptom improvement across randomized PTSD trials and suggested durability after treatment, but the evidence base remained relatively small. ([PubMed][17])

This supports:

```text
therapeutic signal
```

but does not by itself determine the optimal target.

---

# 61. PTSD CLAIM EC-PTSD-003 — TARGET-SPECIFIC COMPARISON

A systematic review/network analysis found that among randomized comparisons, high-frequency right-DLPFC stimulation showed a significant advantage over sham, whereas low-frequency right-DLPFC stimulation showed only a trend. ([PubMed][18])

This illustrates why:

```text
TargetFamily
+
StimulationStrategy
```

must remain distinct evidence nodes.

---

# 62. PTSD CLAIM EC-PTSD-004 — COMBAT-RELATED CONFLICT

A 2026 meta-analysis focused on combat-related PTSD found large within-group symptom changes but a non-significant pooled active-versus-sham difference across the randomized comparisons available. ([PubMed][19])

Therefore:

```text
EC-PTSD-RDLPFC-HF-001
```

must carry population-specific conflicting evidence.

MAGNIOM SHALL NOT extrapolate:

```text
general PTSD literature
→ guaranteed combat-related efficacy.
```

---

# 63. PTSD GRAPH PRINCIPLE

The graph should represent:

```text
PTSD
 ├─ trauma population
 ├─ target side
 ├─ stimulation strategy
 ├─ comorbid depression
 ├─ sham-controlled outcome
 └─ durability
```

rather than storing simply:

```text
rTMS works for PTSD.
```

---

# 64. TINNITUS MODULE — SEED SCOPE

```text
COND-TINNITUS-001
Chronic subjective tinnitus
```

Objectives:

```text
OBJ-TIN-DISTRESS-001
reduce tinnitus-related distress/handicap

OBJ-TIN-LOUDNESS-001
reduce perceived tinnitus loudness
```

These objectives SHALL remain separate because trial results often differ by outcome measure.

---

# 65. TINNITUS TARGET-SYSTEM HYPOTHESES

Initial Research-only staging:

```text
TC-TIN-AUDITORY-001
auditory/temporoparietal target-system hypothesis

TC-TIN-FRONTOTEMPORAL-001
combined frontal-auditory network hypothesis
```

Initial target families:

```text
TF-TIN-TEMPORAL-001
temporal / auditory cortex

TF-TIN-TPJ-001
temporoparietal region

TF-TIN-FRONTOTEMP-001
combined frontal-temporal strategy
```

All SHALL initially remain:

```text
governance_status = research
```

unless separately changed through governance.

---

# 66. TINNITUS CLAIM EC-TIN-001 — GUIDELINE NEGATIVE

```text
EC-TIN-ROUTINE-TMS-GUIDELINE-NEG-001
```

The AAO-HNS clinical practice guideline recommended against routine transcranial magnetic stimulation for persistent bothersome tinnitus. ([PubMed][20])

```text
claim_type       negative_evidence
direction        does_not_support
scope            routine treatment
tier             UNASSIGNED
```

This claim SHALL be prominently retrievable.

---

# 67. TINNITUS CLAIM EC-TIN-002 — NULL META-ANALYSIS

A 2020 systematic review/meta-analysis of ten RCTs found no significant benefit of low-frequency rTMS over sham for THI, TQ or loudness across examined follow-up periods. ([PubMed][21])

This supports:

```text
low-frequency tinnitus rTMS
→ negative pooled evidence
```

for that evidence set.

---

# 68. TINNITUS CLAIM EC-TIN-003 — POSITIVE SHORT-TERM SIGNAL

A 2025 meta-analysis of 16 RCTs and 1,105 participants found some short-term benefit on THI/VAS outcomes, but no positive six-month THI effect and no significant immediate benefit on some other tinnitus measures. ([PubMed][22])

```text
direction = mixed
```

is more accurate than:

```text
supports
```

or:

```text
does_not_support
```

alone.

---

# 69. TINNITUS CLAIM EC-TIN-004 — 2026 SYNTHESIS

A 2026 systematic review/meta-analysis of neuromodulation trials found the pooled rTMS effect on chronic subjective tinnitus to be non-significant in its comparable randomized-trial subset. ([PubMed][23])

Therefore the initial MAGNIOM synthesis should read:

```text
clinical efficacy:
mixed / unresolved

durability:
uncertain

target specificity:
unresolved

clinical target generation:
not justified by this document
```

---

# 70. TINNITUS CLAIM EC-TIN-005 — CONTRADICTORY RECENT SYNTHESIS

Another 2026 meta-analysis reported a modest short-term THI benefit for rTMS but inconsistent secondary outcomes and attenuation by six months. ([PubMed][24])

The graph SHALL store both 2026 syntheses.

It SHALL NOT choose one because:

* it is newer by several weeks;
* its result is more positive;
* its result is more negative.

Differences in inclusion criteria and analysis require curator review.

---

# 71. TINNITUS IS A GOLDEN EVIDENCE-GOVERNANCE CASE

Tinnitus should become a canonical Evidence Graph stress test because it contains:

```text
guideline recommendation against routine use
+
positive individual studies
+
negative randomized trials
+
positive meta-analyses
+
negative meta-analyses
+
different outcome measures
+
uncertain durability
+
heterogeneous target strategies.
```

If MAGNIOM can represent that honestly:

# the evidence architecture is working.

---

# 72. INITIAL SOURCE MANIFEST

Recommended seed IDs:

| Seed ID                         | Domain           | Source role                           |
| ------------------------------- | ---------------- | ------------------------------------- |
| `SRC-TMS-GUIDE-2020-LEFAUCHEUR` | cross-indication | therapeutic rTMS guideline            |
| `SRC-OCD-FDA-DTMS-2018`         | OCD              | regulatory/device precedent           |
| `SRC-OCD-NMA-2024`              | OCD              | comparative target synthesis          |
| `SRC-OCD-META-2025`             | OCD              | updated RCT synthesis                 |
| `SRC-OCD-LFNULL-2026`           | OCD              | conflicting/null protocol synthesis   |
| `SRC-PAIN-META-2021`            | pain             | pooled efficacy/moderators            |
| `SRC-PAIN-SR-M1-2020`           | pain             | M1 certainty/heterogeneity            |
| `SRC-PAIN-FRENCH-GUIDE-2020`    | pain             | routine-care context                  |
| `SRC-STROKE-MOTOR-META-2025`    | stroke           | low-risk RCT synthesis                |
| `SRC-STROKE-IHI-LIMIT-2017`     | stroke           | mechanistic limitation                |
| `SRC-PSA-META-2025`             | aphasia          | rTMS + SLT synthesis                  |
| `SRC-PSA-META-2026`             | aphasia          | target/stage moderator synthesis      |
| `SRC-PSA-NMA-2026`              | aphasia          | treatment-context comparison          |
| `SRC-TBI-META-2025`             | TBI              | cognition/pain/depression synthesis   |
| `SRC-TBI-META-TSA-2026`         | TBI              | conflicting updated synthesis         |
| `SRC-TBI-DEP-META-2023`         | TBI              | depression synthesis                  |
| `SRC-PTSD-META-2024`            | PTSD             | efficacy/durability synthesis         |
| `SRC-PTSD-NMA-2024`             | PTSD             | target/frequency comparison           |
| `SRC-PTSD-COMBAT-2026`          | PTSD             | population-specific conflict          |
| `SRC-TIN-GUIDELINE-AAO-2014`    | tinnitus         | negative practice recommendation      |
| `SRC-TIN-META-2020`             | tinnitus         | negative LF-rTMS synthesis            |
| `SRC-TIN-META-2025`             | tinnitus         | mixed short-term synthesis            |
| `SRC-TIN-META-2026-A`           | tinnitus         | non-significant pooled rTMS synthesis |
| `SRC-TIN-META-2026-B`           | tinnitus         | modest short-term positive synthesis  |

---

# 73. SOURCE REGISTRY SHALL NOT STOP AT META-ANALYSES

These sources are:

# evidence-seeding anchors.

Before any new module receives a clinical MAGNIOM classification, Evidence Governance SHOULD extract relevant:

* pivotal RCTs;
* replication RCTs;
* target-comparison trials;
* negative trials;
* device-specific evidence;
* mechanistic studies relevant to target selection;
* methodological targeting studies.

A meta-analysis alone is not a complete TargetFamily evidence path.

---

# 74. PRIMARY-STUDY EXTRACTION PRIORITY

Priority order:

### OCD

Extract:

* pivotal deep-TMS mPFC/ACC trial(s);
* SMA/pre-SMA sham-controlled trials;
* DLPFC trials;
* target-comparison evidence.

### Neuropathic pain

Extract:

* M1 randomized sham-controlled studies;
* somatotopy/body-region detail;
* central versus peripheral neuropathic-pain populations.

### Stroke motor

Extract:

* contralesional LF M1;
* ipsilesional HF M1;
* bilateral strategies;
* stage/severity interactions.

### Aphasia

Extract:

* right IFG LF trials;
* ipsilesional/bilateral trials;
* concurrent SLT conditions.

### TBI

Extract all underlying RCTs before binding target families.

### PTSD

Extract right/left DLPFC sham-controlled trials and trauma-population differences.

### Tinnitus

Extract major positive and negative multicentre RCTs and exact temporal/temporoparietal targeting methods.

---

# 75. NEW OBJECT — `EvidenceQuestion`

To prevent random accumulation of literature, v2 SHOULD define explicit evidence questions.

```ts
interface EvidenceQuestion {
  id: UUID;

  indication_id: UUID;

  population: PopulationDescriptor;

  clinical_objective_id: UUID;

  intervention?: InterventionDescriptor;

  target_family_id?: UUID;

  targeting_strategy_id?: UUID;

  treatment_context_id?: UUID;

  comparator?: ComparatorDescriptor;

  outcome_domains: UUID[];

  question: string;

  status:
    | "open"
    | "under_review"
    | "answered_provisionally"
    | "closed";
}
```

Example:

> In adults with post-acute stroke and upper-limb paresis, does low-frequency contralesional M1 rTMS plus rehabilitation improve FMA-UE compared with sham plus equivalent rehabilitation?

This is much more useful than:

> Search stroke TMS.

---

# 76. OUTCOME DOMAINS v2

Initial additions:

### OCD

```text
Y-BOCS symptom burden
response
remission
function
durability
```

### Neuropathic pain

```text
pain intensity
pain interference
function
quality of life
durability
```

### Stroke motor

```text
FMA-UE
ARAT
dexterity
ADL
global disability
```

### Aphasia

```text
naming
comprehension
repetition
spontaneous speech
functional communication
```

### TBI

```text
cognition
post-concussive symptoms
depression
pain
function
```

### PTSD

```text
CAPS
PCL
depression
anxiety
function
durability
```

### Tinnitus

```text
THI
TFI
TQ
perceived loudness
distress
quality of life
durability
```

Outcome domains SHALL not be collapsed into generic:

```text
improved = true.
```

---

# 77. POPULATION BOUNDARIES

Every claim should explicitly capture population differences relevant to interpretation.

Examples:

```text
neuropathic pain:
central vs peripheral

stroke:
ischemic vs haemorrhagic
acute/subacute/chronic
mild/moderate/severe motor impairment

aphasia:
fluent/non-fluent
lesion hemisphere
chronicity

TBI:
severity
time since injury
structural lesion
post-TBI symptom phenotype

PTSD:
combat-related
civilian trauma
comorbid depression

tinnitus:
subjective
persistent/chronic
unilateral/bilateral
hearing loss
```

---

# 78. TARGET FAMILY DOES NOT INHERIT EFFICACY FROM ANATOMY

If:

```text
M1
```

has evidence for:

```text
neuropathic pain
```

and:

```text
stroke motor recovery,
```

these are two evidence paths.

Do not create:

```text
TF-M1-UNIVERSAL
evidence = strong.
```

Anatomical overlap does not merge indications.

This preserves the v1 rule that multiple propositions sharing Area 46, for example, remain scientifically distinct. 

---

# 79. SAME TARGET, DIFFERENT SCIENTIFIC PROPOSITION

Conceptually:

```text
M1
├── neuropathic pain
│      ↓
│   analgesic target hypothesis
│
├── stroke motor recovery
│      ↓
│   motor-recovery target hypothesis
│
└── fibromyalgia
       ↓
    separate evidence path
```

Same anatomy.

Different claims.

Different population.

Different objective.

Different treatment context.

---

# 80. CIRCUIT VERSUS TARGET EVIDENCE

A source may support:

```text
stimulation of right DLPFC improved PTSD
```

without validating:

```text
a specific frontolimbic circuit map
```

Therefore the graph SHALL allow:

```text
EvidenceClaim
→ TargetFamily
```

without requiring:

```text
EvidenceClaim
→ TherapeuticCircuit.
```

This prevents invented mechanistic precision.

---

# 81. CIRCUIT ARTIFACT RULE

If a therapeutic-circuit map is used:

it SHALL have:

```text
source
version
coordinate space
construction method
artifact hash
population
validation status
```

A literature diagram is not automatically a Clinical CircuitArtifact.

---

# 82. TARGET DEFINITION RULE

Evidence may support:

```text
right DLPFC
```

without supporting:

```text
MNI [x,y,z].
```

Do not synthesize a precise coordinate merely to satisfy the software.

Use the most faithful evidence representation:

```text
anatomical region
surface ROI
somatotopic region
coil field
search space
```

as appropriate.

---

# 83. OCD FIELD-TARGET RULE

For deep-TMS OCD evidence:

```text
TargetFamily
→ coil-field target
```

is preferable to:

```text
TargetFamily
→ single representative MNI coordinate.
```

The evidence path must retain coil/device dependence.

---

# 84. PAIN SOMATOTOPY RULE

For neuropathic-pain M1 evidence, candidate generation SHALL be capable of preserving:

```text
painful body region
→ contralateral motor representation
```

rather than representing:

```text
M1
```

as one universal point target.

---

# 85. STROKE LESION-CONTEXT RULE

Stroke evidence paths MAY require:

```text
REQUIRES_LESION_CONTEXT
```

because:

* lesion location;
* corticospinal reserve;
* severity;
* disease stage

may alter target applicability.

The graph SHALL be able to state:

> evidence supports this population-level strategy, but applicability to this lesion phenotype remains uncertain.

---

# 86. APHASIA TREATMENT-CONTEXT RULE

Where evidence was generated with:

```text
rTMS + speech-language therapy
```

the graph SHALL not simplify the claim to:

```text
rTMS alone improves aphasia.
```

Treatment context is part of the proposition.

---

# 87. TBI MISSING-TARGET-SPECIFICITY RULE

For claims where the pooled literature supports:

```text
some rTMS effect
```

but extraction has not yet established:

```text
which target family produced that effect,
```

use:

```text
target_specificity = uncertain
```

and:

```text
target_family_ids = []
```

Do not infer DLPFC or M1 from disease analogy.

---

# 88. PTSD POPULATION TRANSFER RULE

Evidence in broad PTSD populations SHALL not automatically receive full applicability to:

```text
combat-related PTSD
```

when contemporary sham-controlled pooled data for that subgroup are neutral or uncertain. ([PubMed][19])

---

# 89. TINNITUS NEGATIVE-EVIDENCE RULE

Any tinnitus evidence view SHALL retrieve:

# both supportive and negative syntheses

before permitting a target hypothesis to be described as supported.

Do not bury:

```text
guideline recommendation against routine use
```

behind an optional “conflicting evidence” disclosure.

For this module, the conflict is central to scientific interpretation.

---

# 90. `ClaimConflictSet`

```ts
interface ClaimConflictSet {
  id: UUID;

  subject_claim_id: UUID;

  supporting_claim_ids: UUID[];
  conflicting_claim_ids: UUID[];

  conflict_type:
    | "effect_direction"
    | "effect_magnitude"
    | "population"
    | "target"
    | "protocol"
    | "durability"
    | "outcome_definition"
    | "methodology";

  reconciliation_status:
    | "unresolved"
    | "partially_explained"
    | "resolved";

  explanation?: string;

  reviewed_by?: UUID[];

  provenance: Provenance;
}
```

---

# 91. CONFLICT IS NOT AN ERROR

A graph containing:

```text
supportive claim
+
conflicting claim
```

is not internally inconsistent.

It is a scientifically faithful representation of uncertainty.

Database validation SHALL reject:

# missing conflict relationships

not:

# the existence of conflict.

---

# 92. EVIDENCE GOVERNANCE WORKFLOW

For each new claim:

```text
Draft
  ↓
Source extraction
  ↓
Independent source check
  ↓
Claim wording review
  ↓
Population/outcome review
  ↓
Support/conflict review
  ↓
Synthesis
  ↓
Governance classification review
```

Classification reviewers should answer:

1. Is the claim worded no broader than the evidence?
2. Are relevant negative sources included?
3. Is the population defined?
4. Is the target actually tested?
5. Is the targeting method actually tested?
6. Is treatment context preserved?
7. Is the outcome clinically relevant?
8. Is durability known?
9. Is independent replication present?
10. What role, if any, should the claim be permitted to play?

---

# 93. DUAL APPROVAL FOR CLINICALLY MATERIAL CLASSIFICATION

Promotion into a clinically usable evidence path SHOULD require at least:

```text
scientific reviewer
+
clinical reviewer
```

with additional specialist review where relevant:

* stroke rehabilitation;
* pain medicine;
* neuropsychology;
* audiology/otology;
* OCD/PTSD psychiatry.

One evidence curator should not unilaterally create clinical authority.

---

# 94. CLINICAL ELIGIBILITY IS NOT STORED ON SOURCE

Do not create:

```text
Source.clinical = true
```

A single paper is never the clinical permission object.

Clinical eligibility arises from:

```text
approved Claim
+
Governance Classification
+
TargetFamily binding
+
Indication Module
+
Scientific Policy.
```

---

# 95. `EvidencePath`

```ts
interface EvidencePath {
  id: UUID;

  indication_module_release_id: UUID;

  evidence_claim_ids: UUID[];

  population_id: UUID;

  clinical_objective_id: UUID;

  disease_stage_id?: UUID;

  therapeutic_circuit_id?: UUID;

  target_family_id: UUID;

  targeting_strategy_id: UUID;

  target_geometry_type: TargetGeometryType;

  treatment_context_requirement_ids?: UUID[];

  governance_classification_ids: UUID[];

  path_status:
    | "staging"
    | "research_permitted"
    | "validation_permitted"
    | "clinical_permitted"
    | "suspended";

  scientific_policy_release_id?: UUID;

  provenance: Provenance;
}
```

---

# 96. PATH STATUS CANNOT BE INFERRED

The database SHALL NOT infer:

```text
all claims approved
→ clinical_permitted
```

Clinical path activation requires explicit governance + Scientific Policy.

---

# 97. GRAPH QUERY — WHY THIS TARGET?

v2 query:

```text
TargetCandidate
      ↓
TargetFamily
      ↓
EvidencePath
      ↓
EvidenceClaim
      ↓
SourceFinding
      ↓
Source
```

plus:

```text
EvidenceClaim
      ↓
ClaimConflictSet
      ↓
Conflicting Claims / Sources.
```

Return:

* strongest direct support;
* most material conflict;
* population applicability;
* stage applicability;
* targeting method;
* treatment context;
* uncertainty.

---

# 98. QUERY — WHAT EXACTLY IS CLINICALLY PERMITTED?

```text
IndicationModuleRelease
       ↓
ScientificPolicyRelease
       ↓
EvidencePath[path_status = clinical_permitted]
       ↓
TargetFamily
       ↓
TargetingStrategy
       ↓
TargetGeometry
```

The query SHALL NOT filter merely by high Evidence Tier.

---

# 99. QUERY — WHAT DOES THE EVIDENCE SAY, WITHOUT A TIER?

This is new and important.

```text
EvidenceClaim
      ↓
ClaimEvidenceSynthesis
```

may return:

```text
directness             strong
replication            multiple independent
consistency            mixed
target specificity     specific
clinical applicability partial
governance tier        unassigned
```

This is a valid state.

---

# 100. QUERY — WHAT TARGETS ARE ONLY STAGING?

Example:

```text
Indication = tinnitus
```

Return:

```text
temporal / auditory
temporoparietal
combined frontal-temporal

governance:
research / staging

clinical permission:
none
```

This prevents knowledge availability from being mistaken for clinical authority.

---

# 101. QUERY — WHICH CLAIMS HAVE IMPORTANT NULL EVIDENCE?

Graph:

```text
EvidenceClaim
→ HAS_NULL_EVIDENCE
→ SourceFinding
```

This should be a first-class clinician/scientist query.

---

# 102. QUERY — WHAT CHANGED?

Evidence Library comparison SHALL return:

```text
new Sources
new SourceFindings
new Claims
changed claim wording
new conflicts
resolved conflicts
changed syntheses
new governance classifications
withdrawn classifications
changed target bindings
changed EvidencePaths
```

Do not summarise only:

```text
Tier changed B → A.
```

---

# 103. EVIDENCE RELEASE v2

Example:

```text
MAGNIOM-EVIDENCE-2.0.0-STAGING
```

may contain:

* MDD migrated objects;
* OCD staging claims;
* pain staging claims;
* stroke staging claims;
* TBI staging claims;
* PTSD staging claims;
* tinnitus Research claims.

An Evidence Library release may therefore contain objects at different governance maturity levels.

---

# 104. RELEASE MANIFEST

```ts
interface EvidenceLibraryReleaseV2 {
  id: UUID;

  code: string;
  semantic_version: string;

  lifecycle_status:
    | "draft"
    | "validation"
    | "active"
    | "superseded"
    | "withdrawn";

  source_version_ids: UUID[];
  source_finding_ids: UUID[];
  evidence_claim_ids: UUID[];

  synthesis_ids: UUID[];
  governance_classification_ids: UUID[];

  therapeutic_circuit_ids: UUID[];
  target_family_ids: UUID[];
  target_definition_ids: UUID[];
  targeting_strategy_ids: UUID[];
  treatment_context_requirement_ids: UUID[];

  evidence_path_ids: UUID[];

  manifest_sha256: SHA256;

  released_at?: ISO8601UTC;

  provenance: Provenance;
}
```

---

# 105. ACTIVE LIBRARY DOES NOT MEAN ALL CONTENT IS CLINICAL

An active library may contain:

```text
Clinical MDD paths
Validation stroke paths
Research TBI claims
Research tinnitus claims
```

The relevant filter is:

```text
EvidencePath
+
ScientificPolicy
+
IndicationModuleRelease
```

not simply:

```text
library.active = true.
```

---

# 106. MDD v1 MIGRATION

Existing v1 MDD claims with assigned Tier remain historically valid.

Migration should create:

```text
EvidenceGovernanceClassification
```

representing the historical v1 Tier assignment.

Do not reclassify them merely because the storage model changed.

---

# 107. v1 ADAPTER

Conceptually:

```text
v1 EvidenceClaim.evidence_tier
        ↓
v2 EvidenceGovernanceClassification
```

with:

```text
classification_basis = migrated_v1_governance
```

Historical Target Slates retain original release identity.

---

# 108. NEW-INDICATION SEED MANIFEST

Initial proposed staging content:

```text
OCD
  4+ EvidenceClaims
  4 TargetFamilies

Neuropathic pain
  4+ EvidenceClaims
  1 primary somatotopic TargetFamily

Stroke motor
  4+ EvidenceClaims
  3 primary strategy TargetFamilies
  1 compensatory research family

Stroke aphasia
  4+ EvidenceClaims
  3 TargetFamilies

TBI
  5+ EvidenceClaims
  target bindings intentionally incomplete pending extraction

PTSD
  4+ EvidenceClaims
  2–3 TargetFamilies

Tinnitus
  5+ EvidenceClaims
  3 Research TargetFamilies
```

No initial MAGNIOM A/B/C tier is assigned by this specification.

---

# 109. SEEDING PRIORITY

Recommended implementation order:

```text
1. OCD
2. Neuropathic pain
3. Stroke motor
4. Stroke aphasia
5. PTSD
6. TBI
7. Tinnitus
```

This order is for evidence-library engineering convenience.

It is not a statement of commercial or clinical priority.

---

# 110. GOLDEN GRAPH TEST — OCD

Query:

```text
OCD
```

Expected:

* mPFC/ACC deep-field treatment precedent retrieved;
* DLPFC and SMA alternatives retrieved;
* protocol heterogeneity visible;
* 2026 null low-frequency non-navigated synthesis visible;
* no universal “best OCD target” returned;
* MAGNIOM Tier remains unassigned until governance.

---

# 111. GOLDEN GRAPH TEST — NEUROPATHIC PAIN

Query:

```text
right-hand neuropathic pain
```

Expected:

* contralateral M1 evidence path;
* somatotopic requirement;
* external guideline finding;
* heterogeneity/low-certainty limitation;
* care-positioning guideline context;
* no generic universal M1 point coordinate.

---

# 112. GOLDEN GRAPH TEST — STROKE MOTOR

Query:

```text
subacute severe right-hand paresis after left stroke
```

Expected:

* contralesional and ipsilesional M1 evidence paths;
* disease-stage applicability;
* severity context;
* interhemispheric model;
* compensatory-network limitation;
* no rule saying contralesional cortex is universally maladaptive.

---

# 113. GOLDEN GRAPH TEST — APHASIA

Query:

```text
chronic non-fluent aphasia
```

Expected:

* right IFG low-frequency precedent;
* speech-language-therapy context;
* language-domain outcomes;
* alternative/bilateral evidence;
* no generalisation to every aphasia phenotype.

---

# 114. GOLDEN GRAPH TEST — TBI

Query:

```text
post-TBI cognitive impairment
```

Expected:

* 2025 supportive pooled cognition claim;
* 2026 null pooled cognition claim;
* synthesis = mixed;
* target specificity unresolved;
* no invented DLPFC clinical target.

---

# 115. GOLDEN GRAPH TEST — PTSD

Query:

```text
combat-related PTSD
```

Expected:

* general right-DLPFC supportive evidence;
* combat-population sham-controlled neutral synthesis;
* applicability limitation;
* no automatic transfer from broader PTSD literature.

---

# 116. GOLDEN GRAPH TEST — TINNITUS

Query:

```text
persistent bothersome chronic subjective tinnitus
```

Expected:

* AAO-HNS recommendation against routine TMS;
* negative 2020 pooled evidence;
* mixed/positive 2025 synthesis;
* conflicting 2026 syntheses;
* auditory/temporal target hypotheses;
* Research status;
* no Clinical target eligibility.

---

# 117. GRAPH VALIDATION — CLAIM WORDING

Every EvidenceClaim SHALL pass:

```text
claim is no broader than supporting evidence
```

For example, reject:

> rTMS improves stroke recovery.

Prefer:

> In pooled randomized evidence, rTMS was associated with improved upper-extremity motor outcomes after stroke, with effects varying by disease stage and baseline impairment.

---

# 118. GRAPH VALIDATION — TARGET SPECIFICITY

A claim bound to a TargetFamily must demonstrate that the supporting evidence actually tested that family.

Do not infer target from:

* disease;
* common practice;
* another indication;
* mechanistic plausibility.

---

# 119. GRAPH VALIDATION — TREATMENT CONTEXT

If efficacy evidence materially depends on:

```text
rehabilitation
speech-language therapy
symptom provocation
specific coil/device
```

at least one explicit treatment-context edge is required.

---

# 120. GRAPH VALIDATION — NEGATIVE EVIDENCE

Claims with known material negative/conflicting evidence SHALL include the relevant conflict relationship.

A release fails scientific verification if:

```text
positive source included
negative source intentionally omitted.
```

---

# 121. GRAPH VALIDATION — SOURCE OVERLAP

Meta-analyses frequently reuse the same RCTs.

MAGNIOM SHALL NOT treat:

```text
four meta-analyses
```

as:

```text
four independent replications
```

when they synthesize substantially overlapping primary studies.

Record:

```text
independence = partially_overlapping
```

or:

```text
overlapping_dataset.
```

---

# 122. GRAPH VALIDATION — CURRENTNESS

Each active claim SHALL carry:

```text
reviewed_at
next_review_due
```

for living-evidence surveillance.

Higher-risk Research/Validation modules should receive shorter review intervals.

---

# 123. GRAPH VALIDATION — RETRACTION/CORRECTION

A retracted or materially corrected source remains historically identifiable.

Dependent claims are:

```text
flagged_for_review
```

not silently deleted.

---

# 124. LIVING EVIDENCE MONITORING

Surveillance SHOULD detect:

* new RCTs;
* meta-analyses;
* guidelines;
* withdrawals;
* retractions;
* major null trials;
* new targeting methods;
* device-specific regulatory changes.

Surveillance output enters:

# staging.

Never directly:

# Clinical Evidence Path.

---

# 125. LLM ROLE

An LLM MAY assist with:

* candidate source detection;
* structured metadata extraction;
* proposed claim wording;
* PICO extraction;
* duplicate detection;
* support/conflict suggestion.

An LLM SHALL NOT autonomously:

* approve a claim;
* assign MAGNIOM Tier;
* activate a TargetFamily;
* decide that a source conflict is resolved;
* promote an indication to Clinical Mode.

---

# 126. CLAIM REVIEW UI

Evidence reviewers should see:

```text
Claim statement

Population

Target / strategy / geometry

Outcome

Treatment context

Supporting evidence

Conflicting evidence

Primary-study overlap

Evidence dimensions

Applicability limitations

Proposed governance classification
```

The interface should make:

# disagreement

easy to record.

---

# 127. CLINICIAN EVIDENCE UI

Clinician view should not lead with:

```text
Tier B
```

alone.

Prefer:

```text
What is supported?
How directly?
By which target/protocol?
In whom?
What conflicts?
What remains uncertain?
What clinical role has MAGNIOM permitted?
```

Tier may be displayed as one governance attribute.

---

# 128. TARGET ENGINE CONTRACT

The Target Engine SHALL consume only:

```text
EvidencePaths
```

authorised by the active Scientific Policy.

It SHALL NOT independently traverse every staging claim and decide whether the literature is “good enough.”

---

# 129. RESEARCH ENGINE CONTRACT

Research Mode may traverse:

```text
staging
research_permitted
validation_permitted
```

paths according to research policy.

Every candidate must retain:

```text
source EvidencePath
governance state
mode
```

---

# 130. SCIENTIFIC POLICY CONTRACT

Scientific Policy answers:

```text
Which evidence paths may affect which candidate roles?
```

Evidence Graph answers:

```text
What does the literature support or challenge?
```

These responsibilities SHALL remain separate.

---

# 131. NO AUTOMATIC EVIDENCE-TIER ALGORITHM

The following SHALL NOT exist:

```text
if RCT_count >= 3:
    Tier = A
```

or:

```text
meta_analysis_positive = true
→ clinical target
```

Evidence governance requires contextual scientific judgement.

---

# 132. NO VOTE COUNTING

Do not infer:

```text
7 positive papers
3 negative papers
→ 70% confidence.
```

Study design, sample overlap, bias, target specificity and population applicability matter.

---

# 133. NO P-VALUE AS EVIDENCE TIER

A statistically significant result does not automatically establish:

* clinical importance;
* replication;
* target specificity;
* external validity;
* durability.

Likewise, one non-significant trial does not necessarily negate an entire therapeutic concept.

---

# 134. NO REGULATORY-AUTHORISATION SHORTCUT

A regulatory clearance or approval is relevant evidence/context.

It SHALL NOT automatically authorise:

* different devices;
* different coils;
* different target geometries;
* different targeting methods;
* MAGNIOM's own personalised implementation.

---

# 135. NO GUIDELINE SHORTCUT

An external guideline recommendation or evidence grade is highly relevant.

It remains:

# evidence about clinical consensus/efficacy,

not:

# an automatic MAGNIOM Scientific Policy rule.

---

# 136. NO CIRCUIT-INVENTION SHORTCUT

If a treatment effect is demonstrated at:

```text
M1
```

but the distributed therapeutic mechanism remains uncertain:

store:

```text
target-system evidence
```

rather than manufacturing a named network.

MAGNIOM should be less mechanistically specific when the science is less mechanistically specific.

---

# 137. NO TARGET-PRECISION INFLATION

If literature reports:

```text
right inferior frontal gyrus
```

MAGNIOM SHALL NOT convert it into a millimetre-precise coordinate unless that coordinate is separately supported and sourced.

---

# 138. NO CROSS-INDICATION EVIDENCE TRANSFER

The following are invalid shortcuts:

```text
DLPFC works for MDD
→ DLPFC works for TBI depression
```

```text
M1 works for neuropathic pain
→ same M1 strategy works for fibromyalgia
```

```text
right DLPFC PTSD result
→ right DLPFC universally treats anxiety.
```

Each requires its own evidence path.

---

# 139. NO CROSS-OBJECTIVE TRANSFER

Even within one indication:

```text
tinnitus distress
```

is not identical to:

```text
tinnitus loudness.
```

```text
aphasia naming
```

is not identical to:

```text
functional communication.
```

Outcome-specific evidence remains explicit.

---

# 140. INITIAL SCIENTIFIC GOVERNANCE STATE

For all newly seeded v2 claims in:

```text
OCD
neuropathic pain
stroke motor
stroke aphasia
TBI
PTSD
tinnitus
```

canonical initial state:

```text
EvidenceClaim.lifecycle_status
=
approved_scientific_claim
or under_review
```

depending on curator completion;

but:

```text
EvidenceGovernanceClassification.classification_status
=
unassigned
```

unless separately reviewed.

And:

```text
EvidencePath.path_status
≤ validation_permitted
```

until explicit Clinical promotion.

---

# 141. WHY THIS IS NOT OVER-CONSERVATIVE

It permits MAGNIOM to build now:

* indication-specific workspaces;
* TargetFamilies;
* synthetic cases;
* research target generation;
* retrospective analyses;
* evidence comparison;
* validation datasets.

Without falsely asserting:

> MAGNIOM has already clinically validated these modules.

That is exactly the separation required between:

# engineering maturity

and:

# clinical evidence maturity.

---

# 142. INITIAL MODULE MATURITY RECOMMENDATION

Without assigning MAGNIOM Evidence Tier, the current staging posture is:

| Module           | Evidence-library posture                                        |
| ---------------- | --------------------------------------------------------------- |
| OCD              | strong candidate for formal governance review                   |
| Neuropathic pain | strong candidate for formal governance review                   |
| Stroke motor     | strong candidate for formal governance review                   |
| Stroke aphasia   | candidate for formal governance/validation review               |
| PTSD             | mixed population/protocol evidence; controlled review           |
| TBI              | objective-specific and conflicting; Research/validation staging |
| Tinnitus         | materially conflicting/negative evidence; Research staging      |

These are **development priorities**, not MAGNIOM clinical classifications.

---

# 143. RELEASE GOLDEN TESTS

`MAGNIOM-EVIDENCE-2.0.0` staging validation SHALL deterministically answer:

```text
Does the claim exist?

Which population does it apply to?

Which outcome does it measure?

Which target was actually tested?

Was the target geometry point/ROI/field/somatotopic?

Which treatment context was used?

What supports it?

What conflicts?

Has the Tier been assigned?

Is the path Clinical, Validation or Research?
```

---

# 144. EVIDENCE LIBRARY v2 CANONICAL FLOW

```text
Scientific literature
        ↓
Sources
        ↓
Source Findings
        ↓
Evidence Claims
        ↓
Support / Conflict Graph
        ↓
Claim Synthesis
        ↓
Evidence Governance Classification
        ↓
Therapeutic Circuit / Target-System Library
        ↓
Target Families
        ↓
Targeting Strategies
        ↓
Treatment Context
        ↓
Evidence Paths
        ↓
Evidence Library Release
        ↓
Scientific Policy
        ↓
Indication Module
        ↓
Target Engine
        ↓
Patient-specific Target Candidates
        ↓
Target Slate
        ↓
Specialist Decision
```

---

# 145. THE v2 CENTRAL SAFETY RULE

The graph must enforce:

$$
Patient\ Measurement
\not\Rightarrow
Clinical\ Target
$$

without:

$$
Approved\ Evidence\ Path
+
Scientific\ Policy.
$$

Likewise:

$$
Positive\ Publication
\not\Rightarrow
MAGNIOM\ Tier.
$$

And:

$$
External\ Guideline\ Grade
\not\Rightarrow
MAGNIOM\ Clinical\ Permission.
$$

---

# 146. FINAL EVIDENCE PRINCIPLES

# Claims are narrower than papers.

# Source findings are narrower than sources.

# Evidence classification is narrower than scientific belief.

# Clinical permission is narrower than evidence classification.

# Indications do not share evidence merely because they share anatomy.

# Target efficacy does not automatically prove a circuit mechanism.

# Circuit plausibility does not prove target efficacy.

# A guideline grade is not a MAGNIOM Tier.

# A meta-analysis is not a TargetFamily.

# A regulatory clearance is not a universal target rule.

# Treatment context is part of evidence when the trial depended on it.

# Disease stage is part of evidence when effect varies by stage.

# Negative evidence is first-class.

# Null trials are first-class.

# Contradictory meta-analyses are first-class.

# Missing target specificity is a scientific fact, not a database defect.

# Patient imaging refines evidence; it never creates it.

# Research hypotheses remain structurally distinct.

# Every clinical path has a population boundary.

# Every target geometry must reflect what the evidence actually stimulated.

# Every Evidence Library release is immutable.

# Evidence may strengthen.

# Evidence may weaken.

# Evidence may remain unresolved.

# Governance decides clinical classification.

# Scientific Policy decides permitted algorithmic use.

# The specialist decides the patient-level treatment target.

---

# 147. CANONICAL DEFINITION

The **MAGNIOM Evidence Knowledge Graph & Therapeutic Circuit Library v2.0** is:

> **A versioned, claim-centric scientific knowledge system that represents what published evidence actually supports, does not support, or leaves unresolved across defined populations, clinical objectives, disease stages, target families, stimulation strategies, target geometries and treatment contexts, while keeping MAGNIOM evidence classification and clinical permission as separate controlled governance decisions.**

---

# 148. FINAL GOVERNING RULE

> **MAGNIOM shall never promote an emerging TMS application because the literature looks promising in aggregate. It shall first decompose that literature into narrow claims, preserve both supportive and conflicting evidence, identify the population, outcome, target, strategy, geometry and treatment context actually tested, and only then allow independent governance to decide whether a claim deserves a MAGNIOM Evidence Tier and whether Scientific Policy permits it to influence Clinical Mode.**

