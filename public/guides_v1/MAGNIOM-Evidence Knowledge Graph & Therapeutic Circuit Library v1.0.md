# MAGNIOM
## Evidence Knowledge Graph & Therapeutic Circuit Library v1.0

**Document status:** Canonical scientific knowledge specification  
**Date:** 1 September 2026  
**Initial Clinical Mode indication:** Major depressive disorder ± clinically significant anxious distress  
**Knowledge-store implementation:** Versioned relational knowledge graph in Supabase PostgreSQL  
**Primary consumers:** Target Engine, clinician evidence workspace, evidence governance system  
**Clinical authority:** Specialist clinician  
**Evidence authority:** Approved Magniom Evidence Library release

**Depends on:**

- Magniom Clinical & Scientific Specification v1.0
- Magniom Canonical Target Data Specification v1.0
- Magniom Technical Architecture v1.0
- Magniom Supabase Database & Security Specification v1.0
- Magniom Target Engine & Ranking Algorithm Specification v1.0
- Magniom Neuroimaging & Functional Connectomics Pipeline Specification v1.0

---

# 1. PURPOSE

The Magniom Evidence Knowledge Graph converts a heterogeneous scientific literature into structured clinical knowledge that can constrain patient-specific TMS targeting.

It answers:

# What clinical claim is supported?

# In which patient population?

# For which symptom or outcome?

# Through which therapeutic circuit?

# At which cortical target family?

# Using which target-selection method?

# Under which treatment protocol?

# With what level of evidence?

# What evidence conflicts with the claim?

# How far may the evidence legitimately be extrapolated?

The graph exists to prevent a common failure in precision neuromodulation:

> **A scientifically interesting imaging finding being converted into a clinical target without an explicit evidence bridge.**

---

# 2. FUNDAMENTAL KNOWLEDGE PRINCIPLE

Magniom must not reason:

```text
Paper
  ↓
Target
```

It must reason:

```text
Source
  ↓
Evidence Claim
  ↓
Clinical Population
  ↓
Clinical / Symptom Domain
  ↓
Therapeutic Circuit
  ↓
Target Family
  ↓
Permitted Candidate-Generation Method
  ↓
Patient-Specific Target Candidate
```

The individual connectome enters only at the final stages.

---

# 3. CLAIM-CENTRIC, NOT PAPER-CENTRIC

One paper can support multiple claims.

Example:

A randomized trial might simultaneously support:

- antidepressant efficacy;
- safety;
- a defined target family;
- a particular targeting method;
- a specific population;
- a particular follow-up duration.

These are stored separately.

Likewise, a paper can:

# support one claim

while:

# weakening another.

This prevents oversimplified interpretations such as:

> “This is a positive personalised-TMS study, therefore personalised TMS is superior.”

---

# 4. THE GRAPH IS NOT A MARKETING BIBLIOGRAPHY

The Evidence Library is not organised primarily around:

- famous authors;
- landmark papers;
- study titles.

It is organised around:

# clinically actionable propositions.

Sources exist to support or challenge those propositions.

---

# 5. GRAPH IMPLEMENTATION

Magniom does **not** require Neo4j or another graph database for v1.

The graph can be represented cleanly in PostgreSQL using:

- immutable version tables;
- typed edge tables;
- relational integrity;
- JSON scientific payloads;
- recursive queries where required.

This preserves the database/security architecture already defined.

---

# 6. CORE NODE TYPES

The v1 graph contains the following principal scientific node classes:

```text
Source
EvidenceClaim
Population
Condition
SymptomDomain
OutcomeDomain
TherapeuticCircuit
CircuitArtifact
TargetFamily
TargetDefinition
TargetingStrategy
SearchSpace
ProtocolPrecedent
AtlasRegion
EvidenceLibraryRelease
```

Patient-specific nodes such as `TargetCandidate` live outside the evidence graph.

---

# 7. SOURCE

A `Source` represents a citable scientific or professional document.

Examples:

- randomized clinical trial;
- prospective observational study;
- retrospective study;
- systematic review;
- meta-analysis;
- clinical guideline;
- methodological study.

Sources do not themselves have clinical authority.

Claims derived from them do.

---

# 8. SOURCE TYPES

```text
randomized_sham_controlled_trial
randomized_active_controlled_trial
randomized_noninferiority_trial
prospective_trial
prospective_cohort
retrospective_cohort
cross_sectional_imaging
methodological_validation
systematic_review
meta_analysis
guideline
consensus_statement
proof_of_concept
mechanistic_study
```

---

# 9. SOURCE METADATA

Every Source stores:

- title
- authors
- year
- journal
- DOI
- PMID / PMCID where available
- study type
- sample size
- sites
- funding
- conflicts of interest
- registration
- open-access status where relevant
- full citation
- curator notes.

Funding/conflict metadata does not automatically invalidate a source.

It makes provenance transparent.

---

# 10. EVIDENCE CLAIM

An `EvidenceClaim` is:

# the smallest clinical/scientific proposition Magniom permits to influence reasoning.

Example:

> High-frequency stimulation of the left DLPFC has established efficacy for major depression.

This is preferable to:

> “O'Reardon 2007.”

---

# 11. CLAIM TYPES

```text
clinical_efficacy
comparative_efficacy
target_outcome_association
targeting_method_efficacy
symptom_specificity
circuit_validity
individual_variability
target_reliability
normative_deviation
mechanistic
feasibility
safety
durability
negative_evidence
external_validity
```

---

# 12. EVIDENCE CLAIM GRAPH

Canonical relationship:

```text
EvidenceClaim
 ├── APPLIES_TO → Population
 ├── APPLIES_TO → Condition
 ├── ADDRESSES → SymptomDomain
 ├── MEASURES → OutcomeDomain
 ├── SUPPORTS → TherapeuticCircuit
 ├── SUPPORTS → TargetFamily
 ├── SUPPORTS → TargetingStrategy
 ├── HAS_SUPPORT → Source
 └── HAS_CONFLICT → Source
```

---

# 13. GRAPH EDGE TYPES

Core edge ontology:

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

Edges themselves may be versioned when clinically meaningful.

---

# 14. NO UNQUALIFIED “PROVES”

Magniom's graph vocabulary should generally avoid:

```text
PROVES
```

Scientific evidence usually:

- supports;
- validates;
- replicates;
- conflicts with.

The graph should preserve uncertainty rather than encode absolute certainty.

---

# 15. EVIDENCE TIERS

Canonical tiers remain:

## Tier A — Established clinical target family

Strong replicated clinical evidence sufficient to serve as the Clinical Mode evidence anchor.

## Tier B — Prospectively supported therapeutic circuit / target

Meaningful prospective clinical support, but less mature than Tier A.

## Tier C — Replicated observational / retrospective evidence

Clinically important supporting evidence but insufficient alone for unrestricted primary clinical targeting.

## Tier D — Proof-of-concept

Preliminary or uncontrolled clinical evidence.

## Tier R — Research hypothesis

Mechanistic or exploratory evidence only.

---

# 16. EVIDENCE TIER IS NOT PAPER QUALITY ALONE

A well-designed study can support a low-tier claim if the claim remains preliminary.

Example:

A technically excellent imaging study may strongly establish:

# reproducibility of a biomarker

without establishing:

# clinical efficacy of using that biomarker for treatment selection.

Evidence is claim-specific.

---

# 17. EVIDENCE DIMENSIONS

Each EvidenceClaim additionally records separate dimensions:

```text
directness
replication
study_design_strength
sample_support
consistency
clinical_applicability
target_specificity
independence
```

Suggested values:

```text
strong
moderate
limited
uncertain
```

These support governance.

They do not automatically calculate Evidence Tier.

---

# 18. EVIDENCE TIER ASSIGNMENT

Tier is assigned through:

# Evidence Governance.

Not:

- an LLM;
- citation count;
- automatic statistical score;
- journal impact factor.

The governance decision records:

- reviewer
- rationale
- supporting sources
- conflicting sources
- review date.

---

# 19. CONFLICTING EVIDENCE

A claim can simultaneously have:

```text
supporting_sources
```

and:

```text
conflicting_sources.
```

This is essential for personalised targeting.

For example, contemporary evidence contains both positive randomized connectivity-guided studies and a 2025 meta-analysis finding no overall superiority for personalised versus fixed approaches.

Therefore the graph must be capable of expressing:

# promising method + unresolved general superiority.

---

# 20. CONDITION NODE — MDD

Clinical v1 condition:

```text
COND-MDD-001
Major depressive disorder
```

Clinical Mode requires clinician-confirmed indication before graph traversal.

The graph does not diagnose MDD.

---

# 21. SYMPTOM DOMAIN — DYSPHORIC

Canonical:

```text
SYM-MDD-DYSPHORIC-001
Dysphoric burden
```

Conceptual components derived from the symptom-circuit literature include:

- depressed mood / sadness;
- reduced interest / anhedonic burden;
- related dysphoric symptoms.

The 2020 work identified reproducible dysphoric and anxiosomatic symptom clusters across independent cohorts.

---

# 22. SUICIDALITY

Suicidal symptom items contributed to the retrospective dysphoric cluster in the original analysis.

However Magniom must **not** create:

```text
SYM-SUICIDE-TARGET
```

or an autonomous:

# suicide TMS target

from this observation.

Suicidality remains:

- a clinical-risk domain;
- an outcome domain;
- part of broader phenotype where scientifically appropriate.

It does not independently generate a Clinical Mode target in v1.

---

# 23. SYMPTOM DOMAIN — ANXIOSOMATIC

Canonical:

```text
SYM-MDD-ANXIOSOMATIC-001
Anxiosomatic burden
```

This construct represents the symptom family identified in the original symptom-circuit analysis and prospectively tested in 2026.

The retrospective literature included symptoms such as:

- worry/anxiety-related burden;
- sleep disturbance;
- irritability;
- somatic/vegetative symptoms.

The subsequent randomized head-to-head trial directly tested dysphoric versus anxiosomatic targeting in patients with both depression and significant anxiety.

---

# 24. OUTCOME DOMAINS

Initial outcome nodes:

```text
OUT-MDD-SEVERITY
OUT-MDD-RESPONSE
OUT-MDD-REMISSION
OUT-ANXIETY-SEVERITY
OUT-FUNCTION
OUT-QOL
OUT-SAFETY
OUT-DURABILITY
```

A circuit is never described simply as:

> “effective.”

It is effective or associated with:

# a defined outcome.

---

# 25. THERAPEUTIC CIRCUIT

A TherapeuticCircuit represents:

> **a distributed network for which clinically meaningful changes have been associated with stimulation of one or more accessible cortical nodes.**

It is not:

- a resting-state network label;
- a disease biomarker;
- a single ROI;
- a single coordinate.

---

# 26. CIRCUIT ARTIFACT

The spatial representation of a circuit is stored separately:

```text
CircuitArtifact
```

This may be:

- volumetric NIfTI map;
- CIFTI map;
- GIFTI surface;
- weighted ROI set;
- seed ROI.

Each artifact stores:

- coordinate space
- resolution
- map directionality
- threshold status
- source
- derivation
- hash
- licence / permitted use.

---

# 27. DO NOT RECONSTRUCT CIRCUITS FROM FIGURES

Magniom must not take a coloured figure in a journal article and manually recreate a clinical circuit map.

Clinical map acquisition preference:

1. author/public repository;
2. supplementary scientific artifact;
3. validated published coordinate/ROI definition;
4. independently reconstructed algorithm only where methodology fully permits replication and is separately validated.

Anything else remains:

# descriptive evidence only.

---

# 28. LIBRARY RELEASE 1.0 — CLINICAL CIRCUITS

The initial Clinical Mode circuit library should contain four core therapeutic-circuit concepts:

```text
TC-MDD-LPFC-ESTABLISHED
TC-MDD-SGACC
TC-MDD-CONVERGENT
TC-MDD-DYSPHORIC
TC-MDD-ANXIOSOMATIC
```

The first is an established clinical target-family construct rather than a uniquely defined connectivity map.

The remaining four explicitly encode network/circuit hypotheses.

---

# 29. CIRCUIT 1 — ESTABLISHED LEFT PREFRONTAL DEPRESSION TARGET

## ID

```text
TC-MDD-LPFC-ESTABLISHED-001
```

## Mode

Clinical.

## Evidence Tier

# A

## Purpose

Provide the evidence anchor for depression targeting.

## Clinical interpretation

Repeated left-prefrontal/DLPFC stimulation has an established evidence base for major depression.

RANZCP's 2024 professional guidance describes high-frequency left-DLPFC rTMS as the depression protocol with the largest evidence base, including more than 30 independent clinical trials.

Large sham-controlled multicentre trials also support antidepressant efficacy of left-prefrontal stimulation.

---

# 30. IMPORTANT LIMITATION OF CIRCUIT 1

This is not a claim that:

> all left-DLPFC coordinates are equally effective.

It represents:

# an established cortical target family.

Magniom may subsequently refine location using network evidence.

---

# 31. CIRCUIT 1 TARGET FAMILY

```text
TF-MDD-LDLPFC-EST-001
Established left DLPFC depression target family
```

Evidence Tier:

# A

Laterality:

# left

Role:

# Evidence Anchor.

---

# 32. TARGET DEFINITIONS WITHIN TF-MDD-LDLPFC-EST-001

Initial library may contain:

### TD-BEAM-F3-001

Beam F3 / standard scalp-based reference strategy.

### TD-MRI-F3-001

MRI-neuronavigated F3 equivalent.

### TD-PUBLISHED-LDLPFC-001

Validated study-specific left-DLPFC locations.

These are:

# target definitions / strategies

rather than separate therapeutic circuits.

---

# 33. PROTOCOL PRECEDENTS

Protocol precedents linked to this TargetFamily include:

- high-frequency 10 Hz left-DLPFC rTMS;
- left-DLPFC iTBS.

The THREE-D trial randomized 414 participants and found iTBS non-inferior to conventional 10 Hz left-DLPFC stimulation.

These precedents inform evidence provenance.

They do **not** cause the Target Engine to prescribe a protocol.

---

# 34. EVIDENCE CLAIM — ESTABLISHED DLPFC

```text
EC-MDD-LDLPFC-EFFICACY-001
```

Statement:

> Repeated stimulation of the left DLPFC is an established treatment approach for major depression.

Tier:

# A

Supported by:

- major sham-controlled RCTs;
- clinical guidelines;
- meta-analytic literature.

---

# 35. CIRCUIT 2 — SGACC-CONNECTED DEPRESSION CIRCUIT

## ID

```text
TC-MDD-SGACC-001
```

## Name

Subgenual-cingulate-connected depression circuit.

## Evidence Tier

# B

## Mode

Clinical.

## Scientific premise

Left-DLPFC TMS sites with stronger negative functional connectivity to subgenual cingulate have historically been associated with greater antidepressant efficacy.

Fox et al. reported this relationship in 2012.

---

# 36. SGACC INDIVIDUALISATION

Subsequent work demonstrated that individual differences in DLPFC connectivity can be substantial and reproducible and can generate subject-specific candidate targets.

A prospective analysis later supported the relationship between subgenual connectivity and antidepressant efficacy across TMS sites.

---

# 37. LARGE MULTISAMPLE SGACC EVIDENCE

A later study examining 295 patients found that actual stimulation-site connectivity with sgACC was related to treatment outcome when stimulation sites were estimated using E-field modelling, while also highlighting methodological heterogeneity in estimating this relationship.

This supports the circuit.

It does not establish sgACC connectivity as a universally sufficient target-selection rule.

---

# 38. SNT / STANFORD CONTRIBUTION

Stanford Neuromodulation Therapy selected an individual left-DLPFC location according to strong negative connectivity with sgACC and combined this with an accelerated high-dose iTBS schedule.

The sham-controlled randomized trial demonstrated a large treatment-package effect.

However:

# target individualisation, dose and schedule were changed together.

Therefore the graph links the SNT trial as:

```text
SUPPORTS TC-MDD-SGACC
SUPPORTS feasibility of individualized targeting
SUPPORTS treatment-package efficacy
```

but not:

```text
PROVES individualized sgACC targeting alone is superior.
```

---

# 39. SGACC TARGET FAMILY

```text
TF-MDD-SGACC-LDLPFC-001
```

Description:

> Left-DLPFC search region refined according to patient-specific functional connectivity with the versioned sgACC seed/circuit definition.

Tier:

# B

Parent clinical target family:

```text
TF-MDD-LDLPFC-EST-001
```

Relationship:

```text
REFINES
```

---

# 40. SGACC SEARCH SPACE

Clinical Mode search must remain within an approved:

# left-prefrontal cortical search mask.

The exact search-space artifact is versioned.

Magniom must never define the clinical sgACC target as:

```text
whole-cortex minimum sgACC connectivity.
```

---

# 41. SGACC SEED VERSIONING

Create explicit seed objects:

```text
SEED-SGACC-001
SEED-SGACC-002
...
```

Every seed stores:

- coordinate/mask;
- template space;
- radius/shape;
- source study;
- artifact hash.

Because different sgACC definitions can produce different targets, the seed is part of the algorithm version.

---

# 42. SGACC CLAIMS

### EC-MDD-SGACC-ASSOCIATION-001

More negative left-DLPFC–sgACC connectivity is associated with better antidepressant TMS outcomes.

Tier:

B.

### EC-MDD-SGACC-INDIVIDUAL-001

Individual DLPFC–sgACC connectivity can identify reproducible patient-specific locations.

Tier:

C/B methodological support.

### EC-MDD-SGACC-SUPERIORITY-001

Individual sgACC-guided targeting is superior to high-quality standard targeting.

Status:

# NOT ESTABLISHED.

The graph must explicitly contain this negative/uncertain claim.

---

# 43. NORMATIVE SGACC RESEARCH

A 2026 normative-modelling study used 1,313 healthy controls and generated individual sgACC-DLPFC FC deviation maps in 1,583 MDD patients; shorter distance to the resulting FC-normalised target was associated with better outcomes in independent active-treatment cohorts.

This creates:

```text
TC-MDD-SGACC-NORMDEV-001
```

Mode:

# Research / supporting Clinical evidence.

Tier:

# C

It does not replace the main SGACC circuit in Clinical v1.

---

# 44. CIRCUIT 3 — CONVERGENT DEPRESSION CIRCUIT

## ID

```text
TC-MDD-CONVERGENT-001
```

## Evidence Tier

# B

## Mode

Clinical.

## Scientific premise

Depression-modifying lesions, TMS sites and DBS sites converge on a common functional circuit.

---

# 45. CIRCUIT DERIVATION

A large 2021 analysis examined:

- 461 brain lesions;
- 151 TMS sites;
- 101 DBS sites;

across 14 datasets and found convergence on a common depression-related circuit. Connectivity to this circuit also predicted out-of-sample antidepressant efficacy of stimulation sites.

This extends earlier lesion-network work in which heterogeneous depression-associated lesions converged on a network centred around left DLPFC.

---

# 46. WHY THIS CIRCUIT IS IMPORTANT

The convergent circuit is more conceptually robust than:

# one seed-to-one-target connection

because it represents a distributed network derived across:

- lesions;
- TMS;
- DBS.

It therefore forms a strong candidate for Magniom's primary connectomic refinement model.

---

# 47. 2026 RANDOMIZED VALIDATION

A 2026 randomized trial compared accelerated TMS targeted by individual connectivity to this convergent depression circuit with Beam F3 targeting.

Forty patients were randomized.

Connectivity-guided treatment produced greater MADRS improvement at one month, and individual targets showed substantially lower within-person than between-person spatial variability.

This provides direct prospective support for:

# circuit-guided individualisation.

The study remains relatively small and requires confirmatory efficacy work.

---

# 48. CONVERGENT CIRCUIT TARGET FAMILY

```text
TF-MDD-CONVERGENT-LDLPFC-001
```

Tier:

# B

Parent:

```text
TF-MDD-LDLPFC-EST-001
```

Relationship:

```text
REFINES
```

Clinical role:

# Connectome Refinement.

---

# 49. CANDIDATE GENERATION RULE

Clinical Mode may calculate:

> the patient-specific left-DLPFC region whose functional-connectivity profile has maximal concordance with the approved convergent-depression circuit map.

Search remains constrained to the approved left-prefrontal search space.

Reliability rules from the Neuroimaging Specification apply.

---

# 50. CIRCUIT ARTIFACT

```text
CIRCUITMAP-MDD-CONVERGENT-001
```

Requirements:

- source from the publicly available/published map used in the relevant circuit literature;
- native map hash;
- exact template space;
- map semantics;
- positive/negative weight interpretation;
- licence/permitted-use metadata.

---

# 51. CONVERGENT CIRCUIT CLAIMS

### EC-MDD-CONVERGENCE-001

Lesions, TMS and DBS sites affecting depression converge on a reproducible common circuit.

Tier B.

### EC-MDD-CONVERGENCE-TARGETING-001

Patient-specific connectivity to the convergent circuit can be used to define a reproducible left-prefrontal candidate target.

Tier B.

### EC-MDD-CONVERGENCE-RCT-001

A small randomized trial found greater antidepressant improvement using individualized convergent-circuit targeting than Beam F3.

Tier B.

### EC-MDD-CONVERGENCE-DEFINITIVE-001

The convergent-circuit strategy is universally superior to standard targeting.

Status:

# not supported.

---

# 52. CIRCUIT 4 — DYSPHORIC TREATMENT CIRCUIT

## ID

```text
TC-MDD-DYSPHORIC-001
```

## Evidence Tier

# B

## Mode

Clinical.

---

# 53. DYSPHORIC CIRCUIT ORIGIN

The 2020 symptom-specific analysis studied stimulation-site connectivity and individual symptom improvement across:

- discovery TMS cohort;
- active replication cohort;
- sham replication cohort;

and identified two reproducible symptom-related circuit patterns.

One preferentially related to improvement in:

# dysphoric symptoms,

including sadness and reduced interest/anhedonic burden.

---

# 54. RETROSPECTIVE VALIDATION

The dysphoric and anxiosomatic circuit maps were highly reproducible across the original datasets, and the maps predicted symptom improvement in independent patients.

This originally provided:

# replicated retrospective support.

The 2020 evidence alone would therefore have been approximately:

# Tier C.

---

# 55. PROSPECTIVE 2026 UPGRADE

The 2026 randomized head-to-head trial prospectively tested:

### Dysphoric target

MNI:

```text
[-32, 44, 34]
```

versus:

### Anxiosomatic target

MNI:

```text
[0, 48, 46]
```

in 40 adults with significant depression and anxiety.

The observed relative change in depression versus anxiety differed between the targets in the predicted direction.

This justifies provisional:

# Tier B

rather than Tier C.

---

# 56. DYSPHORIC TARGET FAMILY

```text
TF-MDD-DYSPHORIC-001
```

Mode:

Clinical.

Tier:

B.

Canonical group-level reference coordinate:

```text
MNI [-32, 44, 34]
```

Coordinate space must be taken exactly from the source artifact/publication specification.

---

# 57. DYSPHORIC SEARCH SPACE

Magniom should not assume the exact coordinate is a biologically unique point.

Clinical representation should include:

- group reference coordinate;
- versioned surrounding cortical search region;
- relevant circuit map.

Future individual FC refinement may occur within this permitted region after validation.

---

# 58. DYSPHORIC CLINICAL MAPPING

Direct v1 phenotype mapping:

```text
SYM-MDD-DYSPHORIC-001
        ↓
TC-MDD-DYSPHORIC-001
        ↓
TF-MDD-DYSPHORIC-001
```

This is one of the few symptom-to-circuit mappings permitted to influence Clinical Mode v1.

---

# 59. DYSPHORIC LIMITATION

Magniom must not interpret this circuit as:

> “the anhedonia target”

in isolation.

The evidence applies to:

# a broader dysphoric symptom construct.

Anhedonia can be represented within that construct where clinically relevant.

---

# 60. CIRCUIT 5 — ANXIOSOMATIC TREATMENT CIRCUIT

## ID

```text
TC-MDD-ANXIOSOMATIC-001
```

## Evidence Tier

# B

## Mode

Clinical.

---

# 61. ANXIOSOMATIC TARGET

Prospectively tested group coordinate:

```text
MNI [0, 48, 46]
```

This lies in a more dorsomedial prefrontal region than conventional left-DLPFC depression targeting.

---

# 62. TARGET FAMILY

```text
TF-MDD-ANXIOSOMATIC-DMPFC-001
```

Mode:

Clinical.

Tier:

B.

Clinical role:

# Symptom Circuit Candidate.

---

# 63. CLINICAL MAPPING

```text
SYM-MDD-ANXIOSOMATIC-001
          ↓
TC-MDD-ANXIOSOMATIC-001
          ↓
TF-MDD-ANXIOSOMATIC-DMPFC-001
```

The 2026 randomized trial found greater anxiety improvement relative to depression improvement from the anxiosomatic target than from the dysphoric target.

---

# 64. IMPORTANT RESTRICTION

The anxiosomatic target must not be interpreted as:

# universal anxiety-disorder treatment target.

The prospective study population had:

# MDD plus significant anxiety.

Clinical applicability outside that population requires separate evidence.

---

# 65. ANXIETY CIRCUIT — RESEARCH EXPANSION

A 2024 causal network mapping study found convergence across lesions and TMS sites affecting trait anxiety, with individualized TMS-site connectivity predicting anxiety change in an independent dataset.

Create:

```text
TC-ANXIETY-CAUSAL-001
```

Mode:

# Research.

Tier:

C.

This may become useful for future non-MDD anxiety modules but must not be conflated with the MDD anxiosomatic target.

---

# 66. TARGET FAMILY RELATIONSHIP GRAPH

Clinical v1:

```text
TF-MDD-LDLPFC-EST-001
   │
   ├── REFINED_BY → TF-MDD-SGACC-LDLPFC-001
   │
   ├── REFINED_BY → TF-MDD-CONVERGENT-LDLPFC-001
   │
   └── OVERLAPS_WITH → TF-MDD-DYSPHORIC-001

TF-MDD-ANXIOSOMATIC-DMPFC-001
   └── DISTINCT_FROM → left-DLPFC family
```

This is why the Target Engine must perform convergence and redundancy analysis.

---

# 67. TARGET FAMILY VS CIRCUIT

Do not assume one-to-one relationships.

One TargetFamily may engage multiple circuits.

One TherapeuticCircuit may have multiple accessible cortical TargetFamilies.

Therefore:

```text
TherapeuticCircuit ↔ TargetFamily
```

is many-to-many.

---

# 68. TARGET FAMILY ATTRIBUTES

Each TargetFamily stores:

- name
- laterality
- evidence tier
- indication
- associated circuits
- anatomical search-space artifact
- canonical target definitions
- permissible candidate-generation algorithms
- known protocol precedents
- restrictions
- evidence-transfer rules.

---

# 69. TARGETING STRATEGY

A `TargetingStrategy` describes:

# how a target location is determined.

Examples:

```text
Beam F3
MRI-neuronavigated F3
Fixed MNI coordinate
sgACC connectivity maximum/minimum
Convergent circuit correlation
Symptom-circuit coordinate
Normative deviation
Cingulum anomaly selection
```

Targeting strategy is separate from:

# TargetFamily.

---

# 70. CLINICAL TARGETING STRATEGIES v1

```text
TS-BEAM-F3-001
TS-MRI-F3-001
TS-SGACC-FC-001
TS-CONVERGENT-FC-001
TS-DYSPHORIC-GROUP-001
TS-ANXIOSOMATIC-GROUP-001
```

Future individual symptom-circuit refinement becomes a separate strategy/version.

---

# 71. PERSONALISATION EVIDENCE NODE

Create a cross-cutting EvidenceClaim:

```text
EC-PERSONALISED-TMS-SUPERIORITY-001
```

Statement:

> Personalised TMS targeting is generally superior to fixed targeting for MDD.

Current status:

# not established.

A 2025 systematic review/meta-analysis of ten randomized active-controlled trials involving 647 patients found no overall superiority.

This claim should be attached as a limitation to every personalized TargetingStrategy.

---

# 72. WHY THE NEGATIVE CLAIM MATTERS

When Magniom explains a personalized target, it should automatically retrieve:

```text
EC-PERSONALISED-TMS-SUPERIORITY-001
```

and display:

> Evidence that personalised targeting improves outcomes over high-quality fixed targeting remains mixed.

This limitation should not depend on an LLM remembering to mention it.

---

# 73. BRIGhTMIND

BRIGhTMIND was a large randomized comparison of connectivity-guided iTBS and standard F3-based rTMS in treatment-resistant depression and did not demonstrate superior clinical efficacy of the connectivity-guided intervention.

This study should be linked as:

```text
CONFLICTS_WITH
general personalised-targeting superiority
```

rather than:

```text
REFUTES all connectivity targeting.
```

The scientific question is strategy-specific, not ideological.

---

# 74. CINGULUM RESEARCH LIBRARY

The Cingulum work should have a substantial presence in Magniom's Research Mode because it is directly relevant to multi-target connectome-guided TMS.

However its published evidence remains predominantly:

- retrospective;
- proof-of-concept;
- uncontrolled.

---

# 75. CINGULUM FRAMEWORK NODE

```text
TS-CINGULUM-ANOMALY-001
```

Mode:

Research.

Tier:

D.

Description:

> Individual rs-fMRI connectomic anomalies are identified relative to a normative reference and clinically relevant cortical parcels are selected as candidate stimulation sites.

---

# 76. CINGULUM MDD EVIDENCE

The published MDD cohort included 26 patients treated using multiple individually selected cortical targets.

The authors reported 62% meeting their remission criterion immediately after treatment, but the study was retrospective and uncontrolled.

Graph interpretation:

```text
SUPPORTS feasibility
SUPPORTS hypothesis of multi-target connectomic selection
DOES NOT establish comparative efficacy.
```

---

# 77. CINGULUM SAFETY

A 2025 retrospective series included:

- 165 unique patients;
- 202 target sets.

No serious adverse events were recorded; common transient effects included fatigue, muscle twitching, headache and discomfort.

Create:

```text
EC-CINGULUM-SAFETY-001
```

Claim type:

Safety / feasibility.

Tier:

C for safety observation,

but not evidence of target efficacy.

---

# 78. CINGULUM FREQUENT PARCELS

The 2025 safety series reported frequent target parcels including:

- L8Av — 52%;
- LPGs — 28%;
- LTe1m — 21%;
- RTe1m — 18%;
- LPFM — 17%;
- Ls6-8 — 13%;
- L46 — 7%.

These frequencies are:

# descriptive observations.

They must not become popularity-based target rankings.

---

# 79. RESEARCH TARGET FAMILY — L8Av

```text
TF-RES-CING-L8AV-001
```

Mode:

Research.

Tier:

D.

Reason for inclusion:

frequently selected in Cingulum clinical cohorts.

Not permitted:

# Clinical Target Slate solely because L8Av is frequent.

---

# 80. RESEARCH TARGET FAMILY — PGs

```text
TF-RES-CING-LPGS-001
```

Mode:

Research.

Tier:

D.

Same restriction applies.

---

# 81. RESEARCH TARGET FAMILY — AREA 46

```text
TF-RES-CING-L46-001
```

Mode:

Research.

Tier:

D/C depending linked claim.

Important nuance:

Area 46 overlaps conceptually with established DLPFC depression literature, but:

> a Cingulum anomaly-selected L46 parcel

is not scientifically equivalent to:

> an established DLPFC depression target.

The provenance path must remain distinct.

---

# 82. CINGULUM ANXIETY EVIDENCE

The 2023 Cingulum anxiety study used individualized connectomic abnormalities to propose novel targets for anxiety and was explicitly described as proof-of-concept.

Therefore associated circuits/targets remain:

# Research Mode.

---

# 83. CINGULUM STIMULATION-DIRECTION RULE

The Cingulum publications describe protocol decisions influenced by whether a selected connectivity relationship was hyper- or hypoconnected, with cTBS/iTBS used accordingly.

Magniom records this as:

```text
ProtocolPrecedent
```

not:

```text
ClinicalRule.
```

The Target Engine must never automatically infer protocol direction from that evidence.

---

# 84. CINGULUM KNOWLEDGE GRAPH

Conceptually:

```text
Cingulum MDD Source
     ↓ SUPPORTS
Connectomic anomaly feasibility
     ↓
TS-CINGULUM-ANOMALY-001
     ↓ MAY_GENERATE_IN_RESEARCH
L8Av / LPGs / L46 / other parcel hypotheses
```

There is no Clinical Mode edge:

```text
ANOMALY → PRIMARY TARGET.
```

---

# 85. 2026 SGACC SUBGROUP RESEARCH

A 2026 study identified anterior and posterior subgroups of individualized DLPFC-sgACC peak connectivity in MDD; the posterior subgroup had greater anxiety burden, while anterior-targeted TMS outcomes differed between subgroups in a subsample.

Create:

```text
EC-MDD-SGACC-SUBGROUP-001
```

Tier:

C.

Mode:

Research/supporting.

Potential future use:

- phenotype-target interaction;
- sgACC target stratification.

Not yet Clinical Mode ranking logic.

---

# 86. NORMATIVE DLPFC-SGACC TARGET

Create:

```text
TF-MDD-SGACC-NORMDEV-001
```

Mode:

Research.

Tier:

C.

Derived from 2026 normative FC deviation work.

Relationship:

```text
REFINES TF-MDD-SGACC-LDLPFC-001
```

but not yet Clinical Mode primary strategy.

---

# 87. NEW THERAPEUTIC NETWORK RESEARCH

A 2026 study reported that several antidepressant therapies may modulate a common therapeutic network and linked that network to DBS and rTMS target networks.

Create:

```text
TC-MDD-THERAPEUTIC-NETWORK-001
```

Tier:

C/R.

Mode:

Research.

This should be tracked as a potential future convergent map rather than immediately merged with the established Magniom convergent depression circuit.

---

# 88. DO NOT MERGE SIMILAR CIRCUITS PREMATURELY

Two published maps that both concern depression are not automatically:

# the same circuit.

Magniom stores them separately until quantitative comparison demonstrates:

- spatial similarity;
- conceptual equivalence;
- compatible outcome meaning.

The graph can encode:

```text
OVERLAPS_WITH
```

without:

```text
SAME_AS.
```

---

# 89. CIRCUIT SIMILARITY

For map-based TherapeuticCircuits, Magniom may calculate descriptive:

- spatial Pearson correlation;
- Dice overlap after matched thresholding;
- weighted overlap;
- target-rank similarity.

These measures inform:

# circuit governance

but do not automatically merge nodes.

---

# 90. CIRCUIT SUPERSESSION

A circuit may be superseded if:

- better map becomes available;
- map derivation contains error;
- stronger validation changes its definition.

Example:

```text
TC-MDD-CONVERGENT-001 v1
       ↓ SUPERSEDED_BY
TC-MDD-CONVERGENT-001 v2
```

Historical slates retain v1.

---

# 91. SOURCE REGISTRY v1 — CORE CLINICAL EVIDENCE

Initial core sources should include at least the following.

---

# 92. S001 — RANZCP 2024

**Type:** Professional guideline  
**Purpose:** Australian clinical context and established protocol evidence.

Supports:

- depression as established rTMS indication;
- left DLPFC evidence base;
- conventional target family.

RANZCP identifies high-frequency left-DLPFC treatment as having the largest evidence base among depression protocols.

---

# 93. S002 — O'REARDON ET AL. 2007

**Type:** Multisite randomized sham-controlled trial  
**N:** 301.

Supports:

- left-prefrontal antidepressant efficacy;
- established TargetFamily.



---

# 94. S003 — GEORGE ET AL. 2010

**Type:** Multisite randomized sham-controlled trial.

Supports:

- left-prefrontal antidepressant efficacy;
- established target family.



---

# 95. S004 — THREE-D 2018

**Type:** Randomized multicentre non-inferiority trial  
**N:** 414 randomized.

Supports:

- efficacy of left-DLPFC TMS;
- iTBS as protocol precedent.

Does not establish a new therapeutic circuit.



---

# 96. S005 — FOX ET AL. 2012

Supports:

> antidepressant efficacy differences among DLPFC sites relate to connectivity with sgACC.



---

# 97. S006 — FOX ET AL. 2013

Supports:

> individual DLPFC connectivity differences are substantial/reproducible and may define individual targets.



---

# 98. S007 — WEIGAND ET AL. 2018

Supports:

> subgenual connectivity prospectively predicts antidepressant efficacy across TMS sites.



---

# 99. S008 — FUNCTIONAL CONNECTIVITY MAPPING / MULTISAMPLE

Clinical cohort:

295 patients.

Supports:

- sgACC stimulation-site connectivity association;
- need to model actual stimulation/E-field;
- methodological heterogeneity.



---

# 100. S009 — SIDDIQI ET AL. 2020

Supports:

- dysphoric circuit;
- anxiosomatic circuit;
- symptom-specific target hypothesis;
- retrospective cross-dataset reproducibility.



---

# 101. S010 — SIDDIQI ET AL. 2021

Supports:

- convergent depression circuit;
- lesions/TMS/DBS convergence;
- out-of-sample stimulation-site efficacy association.



---

# 102. S011 — SNT RANDOMIZED TRIAL

Supports:

- efficacy of SNT treatment package;
- clinical feasibility of individual sgACC-connectivity targeting.

Does not isolate the targeting effect.

---

# 103. S012 — BRIGhTMIND

Supports:

- feasibility of connectivity-guided treatment;
- negative evidence against assuming universal personalised-targeting superiority.

---

# 104. S013 — PERSONALISED TMS META-ANALYSIS 2025

Ten randomized active-controlled trials, 647 participants.

Finding:

no overall evidence that personalised rTMS was superior to fixed targeting.

This source must be attached to every broad personalised-target superiority claim.

---

# 105. S014 — TAYLOR ET AL. 2026

Randomized head-to-head dysphoric/anxiosomatic target study.

Supports:

- prospective symptom-specific target effects;
- Tier B upgrade for those circuits.



---

# 106. S015 — CONNECTIVITY VS SCALP RCT 2026

Randomized N=40.

Supports:

- individualized convergent-depression-circuit targeting;
- target reproducibility;
- superiority signal versus Beam F3 requiring confirmation.



---

# 107. S016 — CINGULUM MDD 2023

Retrospective N=26.

Supports:

- multi-target individualized connectomic feasibility;
- proof-of-concept clinical outcome signal.

Does not support comparative efficacy.



---

# 108. S017 — CINGULUM ANXIETY 2023

Supports:

- exploratory anxiety target generation;
- network-anomaly targeting concept.

Tier:

D.



---

# 109. S018 — CINGULUM SAFETY 2025

N=165 unique patients / 202 target sets.

Supports:

- safety/tolerability observation;
- descriptive target-parcel frequency.



---

# 110. S019 — SGACC NORMATIVE MODELLING 2026

Supports:

- normative FC-deviation personalised target hypothesis;
- association with clinical outcome in independent active-treatment cohorts.

Tier:

C.



---

# 111. S020 — SGACC TARGET SUBGROUPS 2026

Supports:

- heterogeneity in patient-specific sgACC-connected DLPFC peaks;
- possible relationship with anxiety phenotype.

Tier:

C.



---

# 112. SOURCE-TO-CLAIM RULE

Sources never directly point to patient targets.

They point to EvidenceClaims.

For example:

```text
S015
Connectivity-vs-scalp RCT
        ↓ SUPPORTS
EC-MDD-CONVERGENCE-RCT-001
        ↓ SUPPORTS
TC-MDD-CONVERGENT-001
        ↓ SUPPORTS
TF-MDD-CONVERGENT-LDLPFC-001
```

This is the traceability chain.

---

# 113. CLAIM LIBRARY v1 — REQUIRED CLINICAL CLAIMS

Clinical release 1.0 should contain at least:

```text
EC-MDD-LDLPFC-EFFICACY-001
EC-MDD-LDLPFC-ITBS-001
EC-MDD-SGACC-ASSOCIATION-001
EC-MDD-SGACC-INDIVIDUAL-001
EC-MDD-SGACC-SUPERIORITY-001
EC-MDD-CONVERGENCE-001
EC-MDD-CONVERGENCE-RCT-001
EC-MDD-DYSPHORIC-001
EC-MDD-ANXIOSOMATIC-001
EC-PERSONALISED-SUPERIORITY-001
```

---

# 114. CLAIM — PERSONALISED TARGETING

```text
EC-PERSONALISED-SUPERIORITY-001
```

Statement:

> Current evidence does not establish that personalised targeting is universally superior to fixed or conventional targeting in MDD.

Type:

`negative_evidence`

Tier:

A/B confidence in limitation.

Sources:

- 2025 meta-analysis;
- relevant neutral RCTs;
- positive RCTs as contextual counterevidence.

This is a critical governance claim.

---

# 115. WHY NEGATIVE CLAIMS ARE FIRST-CLASS OBJECTS

Without structured negative claims, evidence systems tend to accumulate only:

# reasons to recommend.

Magniom must equally retrieve:

# reasons for restraint.

Every TargetCandidate explanation should have access to both.

---

# 116. SEARCH SPACE OBJECT

A `SearchSpace` is the anatomical region within which a specific targeting strategy may search.

Example:

```text
SS-MDD-LDLPFC-CONVERGENT-001
```

Contains:

- cortical mask artifact;
- hemisphere;
- coordinate space;
- anatomy description;
- derivation;
- source.

SearchSpace is separate from TargetFamily because different targeting strategies can use different permitted masks within the same family.

---

# 117. SEARCH-SPACE RULE

Clinical Target Engine cannot execute a patient-specific search beyond:

```text
approved SearchSpace
```

unless:

```text
mode = research.
```

This makes the evidence ceiling computationally enforceable.

---

# 118. TARGET DEFINITION OBJECT

A `TargetDefinition` is a specific:

- coordinate;
- ROI;
- landmark;
- rule-derived target.

Example:

```text
TD-DYSPHORIC-MNI-001
MNI [-32,44,34]
```

TargetDefinition does not itself carry the entire Evidence Tier.

It inherits through:

```text
TargetDefinition
 → TargetFamily
 → TherapeuticCircuit
 → EvidenceClaim.
```

---

# 119. GROUP TARGET VS INDIVIDUAL TARGET

The graph must label target definitions as:

```text
group_reference
individualized_rule
anatomical_landmark
scalp_landmark
```

A group reference coordinate must never be displayed as though it were an individual's connectomic optimum.

---

# 120. ATLAS REGION OBJECTS

Initial HCP-MMP concepts include:

```text
HCP-L-8Av
HCP-L-PGs
HCP-L-46
...
```

These nodes provide anatomical labels.

They do not inherently carry therapeutic evidence.

---

# 121. ANATOMY ≠ EVIDENCE

For example:

```text
HCP-L-8Av
```

can be connected to:

```text
TF-RES-CING-L8AV-001
```

via:

```text
LOCATED_IN
```

but:

# the anatomical parcel itself does not become Tier D.

Evidence belongs to the therapeutic relationship.

---

# 122. PROTOCOL PRECEDENT OBJECT

Stores:

- frequency
- pattern
- intensity definition
- pulse count
- schedule
- coil/device
- target
- clinical population
- source.

These are important because:

# target evidence is protocol-contextual.

However ProtocolPrecedent remains informational until the future Protocol Engine specification.

---

# 123. PROTOCOL TRANSFER WARNING

When a target is supported mainly by evidence from one protocol and the clinician intends another:

the graph should generate:

```text
PROTOCOL_TRANSFER_UNCERTAINTY
```

Example:

a target identified in an accelerated iTBS study should not automatically be assumed equivalent under every conventional TMS protocol.

---

# 124. POPULATION OBJECT

Every EvidenceClaim links to a Population.

Properties include:

- diagnosis;
- severity;
- treatment resistance;
- age;
- comorbidity;
- medication state;
- study exclusions.

This enables:

# patient-to-evidence applicability.

---

# 125. PATIENT APPLICABILITY

The Target Engine may compare the clinical case with Population nodes.

It may state:

> The supporting RCT required moderate-to-severe MDD plus significant anxiety.

It may not state:

> This patient has a 73% match to the RCT population

unless such a probability is separately validated.

---

# 126. EXTERNAL VALIDITY EDGE

A claim can contain:

```text
LIMITED_FOR
```

relationships.

Example:

```text
TC-MDD-ANXIOSOMATIC
LIMITED_FOR
primary anxiety disorders without MDD
```

This becomes an explicit clinical boundary.

---

# 127. EVIDENCE MAP OBJECT

Some published studies provide:

- statistical circuit maps;
- symptom maps;
- targeting atlases.

Store each artifact separately rather than merging them into one image.

Example:

```text
MAP-DYSPHORIC-DISCOVERY
MAP-DYSPHORIC-REPLICATION
MAP-DYSPHORIC-CANONICAL
```

---

# 128. MAP DERIVATION

The canonical map may be:

- source-published combination;
- Magniom-combined replication map.

If Magniom derives its own canonical map:

it becomes a:

# Magniom Scientific Artifact

with:

- methodology;
- code version;
- validation;
- hash.

It must not silently masquerade as an original published map.

---

# 129. MAP THRESHOLDING

Store:

- unthresholded map where available;
- threshold used for visualisation;
- threshold used for algorithmic target generation.

Visual thresholds and computational thresholds may differ.

Do not perform target calculation on a figure-display threshold without scientific justification.

---

# 130. CIRCUIT DIRECTIONALITY

A circuit artifact can contain:

- positive weights;
- negative weights.

The meaning is circuit-specific.

Do not apply:

```text
positive = excite
negative = inhibit.
```

Directional map values represent statistical/network relationships, not automatic stimulation direction.

---

# 131. EVIDENCE GRAPH TRAVERSAL — PRIMARY 1

For a patient with MDD:

```text
COND-MDD
  ↓
EC-MDD-LDLPFC-EFFICACY
  ↓
TF-MDD-LDLPFC-EST
  ↓
Evidence baseline candidate
```

If qualified connectome exists:

```text
TF-MDD-LDLPFC-EST
  ↓ REFINED_BY
TC-MDD-CONVERGENT
  ↓
TF-MDD-CONVERGENT-LDLPFC
  ↓
Patient FC refinement
```

This is the Primary 1 knowledge path.

---

# 132. TRAVERSAL — ANXIOUS DEPRESSION

```text
COND-MDD
  +
SYM-MDD-ANXIOSOMATIC
        ↓
EC-MDD-ANXIOSOMATIC-001
        ↓
TC-MDD-ANXIOSOMATIC
        ↓
TF-MDD-ANXIOSOMATIC-DMPFC
        ↓
Symptom-circuit candidate
```

This may produce Primary 2.

---

# 133. TRAVERSAL — CINGULUM ANOMALY

```text
Patient anomaly
   ↓
HCP-L8Av
   ↓
TS-CINGULUM-ANOMALY
   ↓
Proof-of-concept evidence
```

Because Evidence Tier = D:

```text
Clinical Target Engine
        ↓
BLOCKED
```

Research workspace:

```text
VISIBLE.
```

---

# 134. EVIDENCE CEILING IS GRAPH-BASED

The Target Engine does not contain hardcoded:

```text
L8Av is research-only.
```

It asks the active Knowledge Graph:

```text
What is the highest Clinical Evidence Tier linking this target hypothesis
to the current indication and clinical objective?
```

This makes evidence governance upgradeable without rewriting algorithm code.

---

# 135. EVIDENCE PATH

Every candidate must expose an explicit:

# Evidence Path.

Example:

```text
Major depressive disorder
↓
Established left-DLPFC efficacy
↓
Convergent depression circuit
↓
Connectivity-guided left-DLPFC target family
↓
Patient-specific FC candidate
```

The path is stored as node IDs, not generated only as prose.

---

# 136. MULTIPLE EVIDENCE PATHS

A strong candidate may have several paths.

Example:

left DLPFC candidate may inherit:

```text
Established depression RCT evidence
+
sgACC connectivity association
+
convergent depression circuit
+
dysphoric symptom circuit
```

This creates:

# convergence.

It does not create four separate targets.

---

# 137. CONFLICT PATH

Similarly:

```text
Patient-specific FC targeting
↓
Positive 2026 RCT
```

and:

```text
Personalized targeting
↓
2025 meta-analysis: no overall superiority
```

Both paths must remain visible.

---

# 138. GRAPH INTEGRITY RULE

Every Clinical Mode `TargetFamily` must have at least one complete path:

```text
Condition
→ EvidenceClaim
→ TherapeuticCircuit/TargetFamily
→ clinical Source
```

A target with only:

```text
AtlasRegion
→ research paper
```

cannot enter Clinical Mode.

---

# 139. SOURCE INDEPENDENCE

Evidence governance should record whether supporting sources are:

- independent research groups;
- same group replication;
- industry-associated;
- device-associated.

Independent replication increases confidence.

But no simplistic automatic point score should replace governance.

---

# 140. CINGULUM CONFLICT-OF-INTEREST METADATA

Published Cingulum work includes authors affiliated with Cingulum Health and Omniscient Neurotechnology, including founders/employees in some reports.

This metadata should be recorded.

It does not invalidate the research.

It reinforces the need for:

# independent replication

before clinical evidence-tier promotion.

---

# 141. CLAIM REVIEW STATE

Every claim has:

```text
draft
under_review
approved
rejected
deprecated
superseded
```

Only:

```text
approved
```

claims inside an active Evidence Library release can influence Clinical Mode.

---

# 142. EVIDENCE RELEASE

The first release:

```text
MAGNIOM-EVIDENCE-1.0.0
```

contains a frozen manifest of:

- Source versions;
- EvidenceClaims;
- TherapeuticCircuits;
- CircuitArtifacts;
- TargetFamilies;
- TargetDefinitions;
- SearchSpaces;
- TargetingStrategies;
- ProtocolPrecedents.

---

# 143. RELEASE IMMUTABILITY

Once active:

# Evidence Library 1.0.0 never changes.

New evidence creates:

```text
1.1.0
```

or:

```text
2.0.0.
```

Historical Target Slates retain:

```text
1.0.0.
```

---

# 144. RELEASE VERSIONING

Suggested:

### Patch

Metadata/citation correction that does not change clinical reasoning.

### Minor

New evidence or claim refinement that may affect confidence/ranking but does not fundamentally redefine the ontology.

### Major

Evidence classification or target/circuit architecture changes capable of materially changing Clinical Mode.

Any change altering Target Slate results requires impact validation regardless of semantic label.

---

# 145. LIVING EVIDENCE MONITORING

Research surveillance may identify:

- new RCTs;
- systematic reviews;
- circuit maps;
- negative studies.

These enter:

# Evidence Staging.

They do not immediately alter the active library.

---

# 146. EVIDENCE INGESTION PIPELINE

```text
Source identified
     ↓
bibliographic validation
     ↓
full-text review
     ↓
candidate claims extracted
     ↓
population mapped
     ↓
targets/circuits mapped
     ↓
limitations recorded
     ↓
independent review
     ↓
evidence-tier decision
     ↓
release candidate
```

---

# 147. LLM ROLE IN EVIDENCE INGESTION

LLMs may assist with:

- literature discovery;
- metadata extraction;
- suggesting candidate claims;
- summarization.

They must not autonomously:

- approve claims;
- assign final Evidence Tier;
- create Clinical circuits;
- promote TargetFamilies.

Human evidence governance is required.

---

# 148. TWO-REVIEWER GOVERNANCE

For clinically material claim changes, preferred model:

### Reviewer A

extracts and drafts.

### Reviewer B

independently verifies.

### Clinical/Scientific Approver

activates the Evidence Library release.

For high-risk changes:

creator and approver should be different people.

---

# 149. CLAIM PROMOTION RULE

Example:

Tier C circuit becomes Tier B only after:

- credible prospective evidence;
- relevance to defined population;
- appropriate clinical outcome;
- no overriding contradictory evidence.

A larger retrospective series alone does not automatically upgrade a circuit.

---

# 150. CLAIM DOWNGRADE

Evidence can move:

# downward.

Example:

new large randomized trial fails to replicate a small positive target study.

The Evidence Governance panel may:

```text
B → C
```

or add:

```text
mixed evidence.
```

Science does not only promote targets.

---

# 151. DEPRECATION

A circuit/target may be deprecated when:

- source map is incorrect;
- target implementation cannot be reproduced;
- evidence becomes substantially negative;
- newer definition supersedes it.

Deprecated objects remain available for historical reconstruction.

---

# 152. SOURCE RETRACTION

If a source is retracted:

mark:

```text
RETRACTED.
```

All EvidenceClaims depending materially on it trigger:

# mandatory review.

Do not delete the source.

Historical provenance must remain visible.

---

# 153. CIRCUIT ARTIFACT SECURITY

Therapeutic circuit maps may be proprietary/licensed scientific assets.

Store in:

```text
evidence-assets
```

private bucket.

Each artifact includes permitted-use metadata.

Do not expose map downloads publicly unless licence allows it.

---

# 154. CIRCUIT ARTIFACT HASHING

Every map receives:

```text
SHA-256.
```

The active Evidence Library manifest references the hash.

The Target Engine can therefore confirm it used:

# exactly the approved circuit map.

---

# 155. CIRCUIT ARTIFACT VALIDATION

Before activation:

- verify orientation;
- coordinate space;
- left/right;
- map values;
- dimensions;
- expected anatomical features.

A scientifically correct publication paired with an incorrectly oriented NIfTI would still generate dangerous targets.

---

# 156. SEARCH SPACE VALIDATION

Every Clinical search mask must be visually and computationally inspected.

Check:

- hemisphere;
- cortical placement;
- no subcortical contamination;
- correct template;
- plausible extent.

---

# 157. CLINICAL CIRCUIT LIBRARY v1 SUMMARY

| ID | Circuit | Tier | Clinical role |
|---|---|---|---|
| `TC-MDD-LPFC-ESTABLISHED-001` | Established left-prefrontal depression treatment family | A | Evidence anchor |
| `TC-MDD-SGACC-001` | sgACC-connected depression circuit | B | FC refinement |
| `TC-MDD-CONVERGENT-001` | Convergent causal depression circuit | B | FC refinement |
| `TC-MDD-DYSPHORIC-001` | Dysphoric symptom circuit | B | Symptom candidate |
| `TC-MDD-ANXIOSOMATIC-001` | Anxiosomatic symptom circuit | B | Symptom candidate |

---

# 158. RESEARCH LIBRARY v1 SUMMARY

| ID | Hypothesis | Tier |
|---|---|---|
| `TC-MDD-SGACC-NORMDEV-001` | Normative sgACC-DLPFC deviation target | C |
| `EC-MDD-SGACC-SUBGROUP-001` | Anterior/posterior sgACC target phenotype subgroups | C |
| `TC-ANXIETY-CAUSAL-001` | Causal anxiety circuit | C |
| `TC-MDD-THERAPEUTIC-NETWORK-001` | Cross-treatment therapeutic depression network | C/R |
| `TS-CINGULUM-ANOMALY-001` | Cingulum individualized anomaly targeting | D |
| `TF-RES-CING-L8AV-001` | L8Av anomaly target | D |
| `TF-RES-CING-LPGS-001` | LPGs anomaly target | D |
| `TF-RES-CING-L46-001` | L46 anomaly target | D |

---

# 159. WHY AREA 46 APPEARS IN MULTIPLE PATHS

Area 46 may appear in:

- established DLPFC literature;
- sgACC connectivity work;
- Cingulum anomaly cohorts.

Magniom must preserve these as:

# separate therapeutic propositions sharing anatomy.

The graph may encode:

```text
LOCATED_IN → HCP-L46
```

for multiple TargetFamilies.

It must not collapse their evidence.

---

# 160. KNOWLEDGE GRAPH QUERY — “WHY THIS TARGET?”

For a candidate, query:

```text
Candidate
→ TargetFamily
→ TherapeuticCircuit
→ EvidenceClaims
→ Sources
```

and:

```text
EvidenceClaims
→ Conflicting Sources.
```

Return:

- strongest support;
- most relevant limitation;
- population applicability.

---

# 161. QUERY — “WHAT OTHER TARGETS ADDRESS THIS DOMAIN?”

```text
SymptomDomain
→ EvidenceClaims
→ TherapeuticCircuits
→ TargetFamilies
```

filtered by:

- Clinical Mode;
- Evidence Tier;
- patient indication.

This powers the Target comparison workspace.

---

# 162. QUERY — “WHAT CHANGED IN THE NEW EVIDENCE RELEASE?”

Compare:

```text
Evidence Library 1.0
vs
Evidence Library 1.1
```

Return:

- added Claims;
- removed Claims;
- changed Tier;
- new conflicting Sources;
- superseded CircuitArtifacts;
- changed TargetFamilies.

---

# 163. QUERY — “WHAT WOULD THIS TARGET BE WITHOUT CONNECTOMICS?”

Traverse:

```text
TargetFamily
→ baseline TargetingStrategy
→ baseline TargetDefinition.
```

This supports Magniom's Counterfactual Target View.

---

# 164. QUERY — “IS THIS PARCEL A CLINICAL TARGET?”

Example:

```text
HCP-L8Av
```

Graph asks:

```text
Is there an active Clinical Mode path
from current indication
through Tier A/B EvidenceClaim
to this therapeutic target relationship?
```

If no:

output:

# Research hypothesis only.

---

# 165. GRAPH-LEVEL EVIDENCE CEILING

For patient case `p` and candidate `c`:

\[
E_{max}(c,p)
=
\max
\{
Tier(path)
:
path\ connects\ patient's\ indication/objective\ to\ c
\}
\]

The candidate cannot receive a higher Clinical status than:

\[
E_{max}
\]

Connectome magnitude does not alter this ceiling.

---

# 166. MULTIPLE PATH AGGREGATION

Multiple independent strong paths can increase:

# explanation confidence

and:

# convergence.

But Magniom should not naïvely convert:

```text
3 Tier B paths
```

into:

```text
Tier A.
```

Evidence-tier promotion remains a governance decision.

---

# 167. GRAPH VALIDATION TEST — CLINICAL TARGET

For every Clinical TargetFamily:

assert:

```text
at least one active Clinical indication
AND
at least one approved EvidenceClaim
AND
at least one supporting Source
AND
approved SearchSpace
AND
approved TargetingStrategy.
```

Otherwise the Evidence Library release fails.

---

# 168. GRAPH VALIDATION TEST — RESEARCH SEPARATION

Assert:

```text
Research-only TargetFamily
```

has no active edge permitting:

```text
Clinical Target Engine eligibility.
```

---

# 169. GRAPH VALIDATION TEST — CONFLICT

Any claim marked:

```text
mixed
```

must have:

- supporting Source;
- conflicting Source.

---

# 170. GRAPH VALIDATION TEST — SOURCE TRACEABILITY

Every Clinical EvidenceClaim must resolve to:

# at least one primary source or guideline.

No claim can be supported only by:

- a clinic website;
- marketing brochure;
- unsourced narrative review.

---

# 171. GRAPH VALIDATION TEST — MAP HASH

Every Clinical TherapeuticCircuit requiring a spatial artifact must have:

```text
artifact SHA-256
coordinate space
source
version.
```

---

# 172. GRAPH VALIDATION TEST — TARGET COORDINATES

Every Clinical TargetDefinition using coordinates must specify:

- x/y/z;
- unit;
- coordinate space;
- original source.

No generic:

```text
MNI target
```

passes validation.

---

# 173. GRAPH VALIDATION TEST — POPULATION

Every Tier A/B clinical claim must define:

# applicable population.

No:

> “Works for depression”

without a population boundary.

---

# 174. GRAPH VALIDATION TEST — PROTOCOL CONTEXT

If evidence comes from a materially specific protocol:

link:

```text
ProtocolPrecedent.
```

This ensures later explanations can identify evidence-transfer uncertainty.

---

# 175. GRAPH RELEASE GOLDEN TESTS

Evidence Library 1.0 should answer deterministically:

### Test 1

MDD, no connectome.

→ Established left-DLPFC evidence path exists.

### Test 2

MDD + reliable connectome.

→ sgACC/convergent refinement paths exist.

### Test 3

MDD + high anxious distress.

→ anxiosomatic TargetFamily eligible.

### Test 4

MDD + L8Av anomaly.

→ L8Av remains Research only.

### Test 5

primary GAD without MDD.

→ MDD anxiosomatic Clinical path does not automatically apply.

### Test 6

personalised target.

→ broad personalised superiority limitation is retrieved.

---

# 176. GRAPH RELEASE GOLDEN TEST — CONVERGENCE

A left-DLPFC patient target may resolve through:

- established target family;
- sgACC circuit;
- convergent depression circuit;
- dysphoric circuit.

Expected:

# multiple supporting paths / one candidate region,

not four mandatory targets.

---

# 177. EVIDENCE EXPLANATION TEMPLATE

For any clinical candidate:

### Clinical basis

What established indication/target family supports it?

### Circuit basis

Which network evidence refines it?

### Patient-specific basis

Which connectomic result applies?

### Prospective evidence

Has the target/circuit been prospectively tested?

### Contradictory evidence

What challenges the approach?

### Applicability

How similar is the patient to studied populations?

### Evidence Tier

What ceiling applies?

---

# 178. EXAMPLE — CONVERGENT TARGET

**Clinical basis**

Left-prefrontal TMS has established efficacy for MDD.

**Circuit basis**

Lesion, TMS and DBS sites affecting depression converge on a common circuit.

**Prospective targeting evidence**

A small randomized 2026 trial found greater improvement with patient-specific connectivity targeting of this circuit than Beam F3.

**Limitation**

Broader randomized evidence does not establish universal superiority of personalised targeting.

**Evidence Tier**

B for the personalization strategy, nested inside a Tier A depression target family.

This is precisely the kind of nuanced reasoning the graph exists to preserve.

---

# 179. EXAMPLE — L8Av

**Observation**

Patient has marked connectivity deviation involving left 8Av.

**Published context**

L8Av was the most frequently represented target parcel in a large Cingulum safety series.

**Clinical efficacy evidence**

No randomized evidence currently establishes anomaly-selected L8Av as superior for this patient's MDD.

**Evidence Tier**

D / Research.

**Result**

Visible in Research Mode.

Not eligible for Primary Clinical Target solely from anomaly magnitude.

---

# 180. WHAT THE LIBRARY MUST NEVER DO

The Evidence Knowledge Graph must never encode:

> “Most abnormal parcel is the target.”

> “L8Av is proven because it is frequently used.”

> “sgACC is the depression circuit.”

> “Personalised targeting is superior.”

> “Anxiosomatic target treats every anxiety disorder.”

> “One positive RCT makes every nearby coordinate equivalent.”

> “A circuit map automatically specifies stimulation direction.”

> “Protocol evidence transfers freely between targets.”

> “Atlas location equals clinical evidence.”

---

# 181. WHAT THE LIBRARY SHOULD ENABLE

It should enable:

> “This patient-specific target remains within an established left-DLPFC treatment family.”

> “It has greater individual connectivity to a prospectively supported convergent depression circuit.”

> “The personalized targeting strategy has supportive randomized evidence, but broader comparative evidence remains mixed.”

> “The patient's anxious distress provides a separate rationale for considering the prospectively tested dorsomedial anxiosomatic target.”

> “The L8Av abnormality is scientifically interesting but remains a Research Mode hypothesis.”

---

# 182. FUTURE OCD MODULE

The same ontology should later support:

```text
Condition: OCD
↓
CSTC therapeutic circuit
↓
medial prefrontal / ACC target family
↓
specific deep-TMS protocol evidence
```

without changing the core graph model.

The evidence is indication- and protocol-specific.

---

# 183. FUTURE PTSD MODULE

Potential graph:

```text
PTSD
↓
threat / regulation circuits
↓
prefrontal TargetFamilies
↓
protocol-specific evidence
```

but evidence remains developing.

No MDD circuit is automatically inherited.

---

# 184. FUTURE PAIN MODULE

Potential graph:

```text
neuropathic pain phenotype
↓
motor / pain-modulation circuit
↓
M1 TargetFamily
```

again with distinct evidence provenance.

---

# 185. FUTURE STROKE MODULE

Graph must separate:

- motor recovery;
- aphasia;
- dysphagia;
- post-stroke depression.

They are different:

# clinical objectives

with different circuits.

---

# 186. TRANSDIAGNOSTIC CIRCUITS

Magniom architecture allows a TherapeuticCircuit to relate to multiple Conditions.

However cross-diagnostic reuse requires direct evidence.

Example:

a circuit relevant to anxiety symptoms in MDD does not automatically become a target for:

# generalized anxiety disorder.

---

# 187. PATENT / IP OPPORTUNITY

The defensible intellectual property is unlikely to be:

# storing scientific papers in a graph.

Potentially distinctive Magniom IP lies in the combination of:

- evidence ceilings;
- symptom-to-circuit governance;
- patient connectome refinement;
- target reliability;
- evidence-only counterfactual;
- competing evidence paths;
- multi-role Target Slate construction.

The knowledge graph makes these mechanisms computable.

---

# 188. DATABASE MAPPING

Primary tables already defined:

```text
evidence.sources
evidence.claim_series
evidence.claim_versions
evidence.circuit_series
evidence.circuit_versions
evidence.target_family_series
evidence.target_family_versions
evidence.claim_sources
evidence.circuit_claims
evidence.target_family_circuits
evidence.library_releases
```

Additional required tables:

```text
evidence.conditions
evidence.symptom_domains
evidence.outcome_domains
evidence.populations
evidence.targeting_strategies
evidence.target_definitions
evidence.search_spaces
evidence.circuit_artifacts
evidence.protocol_precedents
evidence.claim_conditions
evidence.claim_symptoms
evidence.claim_outcomes
evidence.claim_populations
evidence.claim_target_families
evidence.strategy_target_families
```

---

# 189. GENERIC GRAPH EDGE TABLE

For research navigation, a secondary generic edge index may be created:

```text
evidence.graph_edges
```

containing:

```text
source_type
source_id
relation
target_type
target_id
release_id
```

This is a derived graph index.

The typed relational tables remain authoritative for clinical semantics.

---

# 190. WHY TYPED EDGES REMAIN AUTHORITATIVE

A generic graph table is flexible but can allow nonsense such as:

```text
Source SUPPORTS Patient
```

without constraint.

Typed tables enforce scientific meaning.

The generic graph is useful for:

- visualisation;
- traversal;
- graph explorer.

Not as the sole clinical datastore.

---

# 191. INTERNAL EVIDENCE EXPLORER

Magniom should have an internal:

```text
/evidence/graph
```

workspace.

Users can select:

# Major depressive disorder

and visually expand:

```text
Symptom Domains
Therapeutic Circuits
Target Families
Evidence Claims
Sources
Conflicts
```

This becomes a major governance tool.

---

# 192. CLINICIAN EVIDENCE VIEW

The specialist sees a simpler representation.

For each candidate:

```text
Clinical evidence
Circuit
Prospective validation
Patient-specific relationship
Main limitation
```

Do not expose an unreadable 100-node graph during routine treatment planning.

---

# 193. RESEARCH VIEW

Researchers may view:

- all nodes;
- Research circuits;
- experimental TargetFamilies;
- source relationships;
- map comparisons;
- evidence-tier history.

---

# 194. EVIDENCE CHANGE WATCH

The system should maintain a watchlist for:

```text
individualised TMS targeting
convergent depression circuit
sgACC targeting
symptom-specific TMS
anxious depression
functional connectomics
normative modelling
multi-target TMS
Cingulum / Omniscient
electric-field targeting
```

New papers enter staging.

They do not alter Clinical Mode automatically.

---

# 195. HIGH-PRIORITY FUTURE EVIDENCE QUESTIONS

The v1 library should explicitly track unresolved questions:

### Does convergent-circuit individualisation replicate in a larger RCT?

### Does sgACC individualisation add value beyond broader circuit targeting?

### Do dysphoric/anxiosomatic effects replicate at scale?

### Does symptom-specific targeting improve global outcomes or merely redistribute symptom response?

### Which patients benefit most from individualisation?

### Does normative deviation add information beyond therapeutic-circuit connectivity?

### Does Cingulum-style multi-target treatment outperform single-target treatment?

### Are frequently selected Cingulum parcels truly causal treatment nodes?

### Does target reliability itself predict outcome?

### Does E-field overlap improve target selection?

---

# 196. EVIDENCE GAP OBJECT

Create explicit:

```text
EvidenceGap
```

nodes.

Example:

```text
GAP-MDD-MULTITARGET-RCT-001
```

Statement:

> No adequate randomized evidence currently establishes that stimulating multiple connectome-selected targets produces superior outcomes to an appropriate single-target strategy.

Evidence gaps can be displayed beside research hypotheses.

---

# 197. WHY EVIDENCE GAPS MATTER

A mature scientific library should encode:

# what is unknown

not merely:

# what has been published.

This prevents absence of evidence being hidden by graph density.

---

# 198. LIBRARY v1 CLINICAL DECISION BOUNDARY

The active v1 Clinical Library permits only these core reasoning routes:

### Route A

Established left-DLPFC evidence anchor.

### Route B

sgACC-informed refinement within left-prefrontal evidence space.

### Route C

convergent-depression-circuit refinement within left-prefrontal evidence space.

### Route D

dysphoric symptom-circuit candidate.

### Route E

anxiosomatic symptom-circuit candidate in appropriate MDD + anxiety phenotype.

Everything else remains:

# supportive

or:

# Research Mode.

---

# 199. WHY THIS IS INTENTIONALLY SMALL

A system with:

# five well-governed circuits

is clinically stronger than a system with:

# 150 speculative brain networks.

The scientific value of Magniom comes from:

# disciplined eligibility.

Not graph size.

---

# 200. CLINICAL RELEASE 1.0 MANIFEST

Conceptually:

```json
{
  "release": "MAGNIOM-EVIDENCE-1.0.0",

  "conditions": [
    "COND-MDD-001"
  ],

  "clinical_symptom_domains": [
    "SYM-MDD-DYSPHORIC-001",
    "SYM-MDD-ANXIOSOMATIC-001"
  ],

  "clinical_circuits": [
    "TC-MDD-LPFC-ESTABLISHED-001",
    "TC-MDD-SGACC-001",
    "TC-MDD-CONVERGENT-001",
    "TC-MDD-DYSPHORIC-001",
    "TC-MDD-ANXIOSOMATIC-001"
  ],

  "research_circuits": [
    "TC-MDD-SGACC-NORMDEV-001",
    "TC-ANXIETY-CAUSAL-001",
    "TC-MDD-THERAPEUTIC-NETWORK-001"
  ],

  "clinical_target_families": [
    "TF-MDD-LDLPFC-EST-001",
    "TF-MDD-SGACC-LDLPFC-001",
    "TF-MDD-CONVERGENT-LDLPFC-001",
    "TF-MDD-DYSPHORIC-001",
    "TF-MDD-ANXIOSOMATIC-DMPFC-001"
  ],

  "research_target_families": [
    "TF-MDD-SGACC-NORMDEV-001",
    "TF-RES-CING-L8AV-001",
    "TF-RES-CING-LPGS-001",
    "TF-RES-CING-L46-001"
  ]
}
```

The actual manifest also contains immutable version IDs and hashes.

---

# 201. CANONICAL KNOWLEDGE FLOW

```text
Scientific literature
        ↓
Sources
        ↓
Evidence Claims
        ↓
Evidence Governance
        ↓
Therapeutic Circuits
        ↓
Target Families
        ↓
Search Spaces / Targeting Strategies
        ↓
Evidence Library Release
        ↓
Target Engine
        ↓
Patient-specific Connectome
        ↓
Target Candidates
        ↓
Target Slate
        ↓
Specialist Decision
```

---

# 202. THE GRAPH'S CENTRAL SAFETY RULE

The graph must guarantee:

\[
Patient\ Imaging
\not\Rightarrow
Clinical\ Target
\]

without:

\[
Evidence\ Path.
\]

In other words:

# a brain abnormality cannot create its own clinical evidence.

---

# 203. FINAL EVIDENCE PRINCIPLES

# Papers are evidence sources, not algorithms.

# Claims are narrower than papers.

# Circuits are narrower than diagnoses.

# Target families are narrower than circuits.

# Coordinates are narrower than target families.

# Patient imaging refines evidence; it does not create it.

# Negative evidence must be queryable.

# Conflicting evidence must remain visible.

# Research hypotheses must remain structurally separate.

# Every clinical target requires an evidence path.

# Every evidence path has a population boundary.

# Every circuit map has immutable spatial provenance.

# Every Evidence Library release is frozen.

# Evidence can upgrade.

# Evidence can downgrade.

# Scientific uncertainty is part of the graph.

---

# 204. MAGNIOM EVIDENCE MANIFESTO

Magniom should never ask only:

> **“Which paper supports this target?”**

It should ask:

# What exactly did the paper demonstrate?

# In whom?

# For which outcome?

# At which target?

# Through which circuit?

# With what targeting method?

# Was it replicated?

# Was it prospectively tested?

# What contradicts it?

# Does it actually apply to this patient?

Only then should the system ask:

# How does this patient's connectome refine the clinically defensible target space?

That is the Magniom Evidence Knowledge Graph & Therapeutic Circuit Library v1.0.