# MAGNIOM
## Target Engine & Ranking Algorithm Specification v1.0

**Document status:** Canonical algorithm specification  
**Date:** 1 September 2026  
**Depends on:**  
Magniom Clinical & Scientific Specification v1.0  
Magniom Canonical Target Data Specification v1.0  
Magniom Technical Architecture v1.0  
Magniom Supabase Database & Security Specification v1.0

**Initial Clinical Mode indication:** Major depressive disorder ± clinically significant anxious distress

**Primary output:** Up to 3 Primary Target Candidates + up to 2 Additional Candidates

**Clinical authority:** Specialist clinician

---

# 1. PURPOSE

This document defines exactly how the Magniom Target Engine converts approved clinical and neuroimaging data into an explainable Target Slate.

It specifies:

- candidate eligibility
- evidence gating
- phenotype prioritisation
- candidate generation
- therapeutic-circuit concordance
- patient-specific functional-connectivity refinement
- normative-connectome handling
- target reliability
- anatomical accessibility
- electric-field integration
- candidate ranking
- evidence-only counterfactual targets
- personalisation adoption
- candidate redundancy
- clinical coverage
- convergence
- slate assembly
- abstention
- explanation generation
- deterministic tie-breaking
- versioning
- algorithm validation.

The primary architectural principle is:

# Magniom does not search the entire brain for the most abnormal place.

Instead:

# Evidence defines where Magniom is allowed to look.

# Phenotype defines what matters.

# Connectomics refines where within that defensible space the patient may differ.

# Reliability determines how much that refinement should be trusted.

# Anatomy and E-field determine whether the candidate can actually be stimulated.

# The Target Engine constructs competing hypotheses.

# The clinician decides.

---

# 2. ALGORITHM STATUS

Target Engine v1.0 is initially:

# a scientifically specified algorithm requiring technical, retrospective and prospective validation before claims of improved clinical outcomes can be made.

The equations and thresholds defined below are:

- engineering specifications
- validation hypotheses
- controlled algorithm parameters

and must not be represented as already clinically validated biological laws.

---

# 3. CURRENT SCIENTIFIC CONSTRAINT

The algorithm is deliberately conservative because current evidence does not justify a general rule that personalised targeting is superior to fixed targeting.

A 2025 meta-analysis of ten randomized active-controlled trials involving 647 participants found no overall evidence that personalised rTMS outperformed fixed approaches.

At the same time, a 2026 randomized trial of 40 participants found greater antidepressant improvement with connectivity targeting of a convergent depression circuit than Beam F3 targeting, with individual targets showing mean split-half spatial reproducibility of 4.47 mm.

Another 2026 randomized three-arm study found advantages for structural-connectivity targeting at two weeks and both structural- and functional-connectivity approaches at six weeks relative to a 5-cm strategy, although the differences were not significant by twelve weeks.

Therefore:

# personalisation must earn its place relative to an evidence-only counterfactual.

It does not receive priority merely because patient-specific imaging exists.

---

# 4. TARGET ENGINE INPUT

The canonical engine input is:

```ts
interface MagniomTargetEngineInput {
  case_id: string;

  mode: "clinical" | "research";

  indication: ClinicalConceptRef;

  phenotype_snapshot_id: string;

  evidence_library_release_id: string;

  scientific_policy_release_id: string;

  target_engine_version_id: string;

  connectome_run_id?: string;

  reliability_profile_ids?: string[];

  imaging_snapshot_id?: string;

  device_context?: {
    device_id: string;
    coil_id: string;
  }[];

  efield_run_id?: string;
}
```

The engine must never query mutable clinical observations directly.

---

# 5. TARGET ENGINE OUTPUT

```ts
interface MagniomTargetEngineOutput {
  generated_candidate_ids: string[];

  eligible_candidate_ids: string[];

  suppressed_candidate_ids: string[];

  target_slate_id?: string;

  personalisation_status:
    | "qualified"
    | "limited"
    | "not_available"
    | "not_required";

  abstention?: AbstentionProfile;

  warnings: EngineWarning[];

  engine_version: string;

  scientific_policy_version: string;

  evidence_library_version: string;

  reproducibility_manifest_hash: string;
}
```

---

# 6. DETERMINISM REQUIREMENT

For identical:

- phenotype snapshot
- evidence release
- connectome run
- reliability outputs
- device context
- scientific policy
- algorithm version

Magniom must produce:

# identical candidates

# identical eligibility decisions

# identical rankings

# identical suppression decisions

# identical Target Slate.

No random sampling is permitted in Clinical Mode ranking.

---

# 7. NO DYNAMIC EXTERNAL DATA

Target generation may not depend on:

- current internet search
- current PubMed search
- current time
- LLM output
- user interface state
- undocumented clinician preference
- random seed.

All scientific inputs are version-pinned.

---

# 8. TARGET ENGINE OVERVIEW

Canonical sequence:

```text
VALIDATE INPUT
      ↓
CLINICAL SCOPE GATE
      ↓
LOAD EVIDENCE-ELIGIBLE TARGET FAMILIES
      ↓
LOAD APPROVED PHENOTYPE
      ↓
GENERATE EVIDENCE-ONLY CANDIDATES
      ↓
IF CONNECTOME QUALIFIED:
    GENERATE CONNECTOME-REFINED CANDIDATES
      ↓
ATTACH THERAPEUTIC-CIRCUIT METRICS
      ↓
ATTACH NORMATIVE CONTEXT
      ↓
ATTACH RELIABILITY
      ↓
APPLY ANATOMICAL ACCESSIBILITY
      ↓
APPLY E-FIELD DATA IF VALIDATED/AVAILABLE
      ↓
APPLY EVIDENCE CEILING
      ↓
CALCULATE ROLE-SPECIFIC UTILITY
      ↓
COMPARE PERSONALISED VS COUNTERFACTUAL
      ↓
SUPPRESS REDUNDANCY
      ↓
ASSESS CONVERGENCE
      ↓
ASSEMBLE TARGET SLATE
      ↓
GENERATE EXPLANATIONS
      ↓
PUBLISH IMMUTABLE RESULT
```

---

# 9. ALGORITHM PHILOSOPHY

Magniom v1 uses:

# gates before scores.

A candidate that fails a mandatory scientific gate cannot compensate by receiving a high score elsewhere.

For example:

> weak evidence + extreme fMRI abnormality

must not become:

> high-confidence clinical target.

---

# 10. HARD GATES

The engine evaluates five hard gates.

```text
G1 Clinical Scope
G2 Evidence Eligibility
G3 Imaging / Reliability
G4 Anatomical Stimulability
G5 Mode Compatibility
```

A candidate must pass all applicable gates before entering clinical ranking.

---

# 11. GATE 1 — CLINICAL SCOPE

For Clinical Mode v1:

```text
primary indication = Major Depressive Disorder
```

with or without:

```text
clinically significant anxious distress.
```

If case lies outside the validated Clinical Mode scope:

```text
G1 = FAIL
```

Result:

# no Clinical Mode Target Slate.

The case may be available in Research Mode if separately permitted.

---

# 12. GATE 2 — EVIDENCE ELIGIBILITY

Every candidate must derive from a TargetFamily contained in the pinned Evidence Library release.

Clinical v1 policy:

### Tier A

Permitted.

### Tier B

Permitted.

### Tier C

May contribute supporting information or refine an already eligible Tier A/B target family only where the Scientific Policy explicitly permits it.

### Tier D

Clinical ranking prohibited.

### Tier R

Clinical ranking prohibited.

The exact permitted tiers are stored in:

`ScientificPolicyRelease`.

---

# 13. EVIDENCE IS NOT A NUMERIC SCORE

Magniom must not initially treat:

```text
A = 1.0
B = 0.8
C = 0.6
```

as though evidence grades represent linearly spaced biological quantities.

Evidence Tier is primarily:

# an eligibility and ordering class.

Candidates are compared within scientifically defensible strata.

---

# 14. EVIDENCE PRIORITY ORDER

Where two otherwise comparable candidates belong to different evidence strata:

```text
A outranks B
```

unless a role-specific rule explicitly permits a Tier B candidate because it addresses a distinct prospectively supported clinical domain.

Example:

**Primary 1**

may remain Tier A evidence anchor.

**Primary 2**

may be a Tier B anxiosomatic target because it answers a different clinical question.

This is not equivalent to saying:

> B beat A globally.

---

# 15. GATE 3 — CONNECTOME ELIGIBILITY

Patient-specific FC may influence ranking only if:

```text
ConnectomeRun.status = succeeded
```

and:

```text
QC != fail
```

and:

```text
TargetReliabilityProfile >= configured minimum
```

for the relevant candidate-generation method.

If not:

# FC contribution is disabled.

This does not necessarily terminate target generation.

Magniom falls back to:

# Evidence Mode.

---

# 16. CONNECTOME FALLBACK

Example:

```text
rs-fMRI motion excessive
→ Connectome QC FAIL
```

Engine result:

```text
personalisation_status = not_available
```

but:

```text
Target Slate = evidence-supported candidates
```

where clinically valid.

The output must explicitly state:

> Patient-specific FC did not influence target ranking because imaging reliability requirements were not met.

---

# 17. WHY RELIABILITY IS A HARD GATE

Recent work found individualized SNT-style targets could move by mean distances of approximately 1.45–3.82 cm depending on preprocessing pipeline, with individual changes reaching 6.14 cm.

A separate reproducibility study found longer acquisitions plus spatial clustering were needed to achieve stable personalized targets below approximately the spatial scale of TMS in its modelling framework.

Therefore:

# an FC target without demonstrated measurement stability is not a precision target.

---

# 18. GATE 4 — ANATOMICAL STIMULABILITY

A candidate fails if:

- its cortical region cannot be reached adequately with configured equipment;
- no valid coil pose can be determined;
- required cortical coverage is absent;
- structural registration is invalid;
- device compatibility fails.

A universal arbitrary scalp-to-cortex threshold must not be used across all coils.

---

# 19. GATE 5 — MODE COMPATIBILITY

Clinical Mode candidate cannot originate from:

```text
Research-only TherapeuticCircuit
```

or:

```text
Research-only TargetFamily.
```

Research Mode may consider Clinical Mode targets.

The reverse is prohibited.

---

# 20. PHENOTYPE PRINCIPLE

Magniom does not infer the patient's therapeutic priorities solely from questionnaire scores.

The clinician approves the phenotype before target generation.

The engine uses:

# clinician-approved clinical priorities.

Symptoms inform those priorities.

They do not silently dictate them.

---

# 21. PHENOTYPE INPUT

Each approved clinical priority contains:

```ts
interface ClinicalPriority {
  domain: ClinicalConceptRef;

  rank: number;

  clinician_weight: number;

  patient_weight?: number;

  severity_measurements?: ObservationRef[];

  functional_burden?: number;

  confidence: QualitativeConfidence;
}
```

---

# 22. PRIORITY WEIGHT

`clinician_weight` is normalized:

```text
0 ≤ Wd ≤ 1
```

and explicitly approved by the clinician.

It is not automatically inferred from:

- PHQ-9
- BDI
- MADRS
- BAI

unless a future validated phenotype model specifies that transformation.

---

# 23. V1 CLINICALLY ACTIVE PHENOTYPE DOMAINS

Clinical Mode v1 permits circuit-driven ranking for:

### Dysphoric burden

including the prospectively tested symptom-circuit family derived from depression symptoms such as sadness and anhedonia.

### Anxiosomatic burden

including anxiety/somatic symptom burden.

The original symptom-specific circuit work replicated the two clusters across independent datasets, and the 2026 prospective randomized trial provided initial prospective support for differential symptom effects.

Other symptoms may be recorded and monitored without becoming independent target-generating variables.

---

# 24. PHENOTYPE COVERAGE MATRIX

For each TargetFamily `t` and approved clinical domain `d`, the Evidence Library contains:

```text
Coverage(t,d)
```

with allowed values:

```text
direct
partial
none
unknown
```

These are scientific annotations.

They are not generated dynamically.

---

# 25. COVERAGE NUMERICAL MAPPING

The ranking engine may internally map coverage to numbers.

The mapping is versioned in Scientific Policy.

For example:

```text
direct  = 1.0
partial = α
none    = 0
unknown = 0
```

where:

```text
0 < α < 1
```

The value of `α` is an algorithm parameter requiring validation.

It must not be described as a known biological constant.

---

# 26. PHENOTYPE CONCORDANCE

For candidate `c`:

\[
P(c)=
\frac{
\sum_d W_d \cdot Coverage(c,d)
}{
\sum_d W_d
}
\]

where:

- `Wd` = clinician-approved domain importance;
- `Coverage(c,d)` = evidence-library mapping.

Thus:

```text
0 ≤ P(c) ≤ 1
```

---

# 27. PHENOTYPE MISSINGNESS

If no clinically validated circuit mapping exists for an important symptom:

the engine must mark:

```text
coverage = not_evidence_mappable
```

rather than assign a speculative target.

Example:

> Cognitive fatigue is clinically important but not independently target-mapped in Clinical Mode v1.

---

# 28. TARGET FAMILY GENERATION

Every eligible TargetFamily defines one or more permitted candidate-generation methods.

Clinical Mode v1 may include:

```text
fixed_evidence_target
group_circuit_target
individual_connectivity_refinement
surface_cluster_search
```

Research Mode may additionally include:

```text
normative_anomaly_target
exploratory_parcel_target
novel_network_target
```

---

# 29. EVIDENCE-ONLY TARGET

Every eligible clinical TargetFamily must define an:

# Evidence-Only Counterfactual Candidate.

This may be:

- validated standard coordinate;
- standard anatomical ROI;
- published group-level circuit target;
- validated structural target strategy.

This candidate represents:

> What would Magniom nominate without patient-specific functional-connectivity information?

---

# 30. WHY EVERY CASE NEEDS A COUNTERFACTUAL

Without an evidence-only baseline, Magniom cannot determine whether connectomics:

- changed nothing;
- produced minor refinement;
- materially moved the target;
- moved the target outside the evidence-supported family.

The counterfactual is therefore not merely a UI feature.

It is part of the ranking algorithm.

---

# 31. PATIENT-SPECIFIC CONNECTIVITY CANDIDATE

For an eligible TargetFamily:

1. define cortical search space;
2. calculate patient-specific circuit-concordance map;
3. smooth/cluster according to frozen method;
4. identify eligible local maxima or cluster representatives;
5. compute reliability;
6. retain candidate(s) meeting scientific-policy thresholds.

No search occurs outside the evidence-supported search region in Clinical Mode.

---

# 32. TARGET SEARCH SPACE

A TargetFamily must define:

```text
SearchSpace(t)
```

as:

- surface ROI
- set of parcels
- volume ROI transformed to subject cortex

rather than:

# whole brain.

For depression:

candidate search may occur within a validated left-prefrontal target region.

For anxiosomatic targeting:

a separate dorsomedial search space may apply.

---

# 33. NO UNCONSTRAINED MAXIMUM

The algorithm must not execute:

```text
argmax entire cortex abnormal connectivity
```

and declare the result a clinical target.

This would violate evidence gating.

---

# 34. THERAPEUTIC-CIRCUIT CONCORDANCE

For each candidate location `c` and TherapeuticCircuit `k`, calculate:

\[
C_{raw}(c,k)
\]

using the circuit-specific validated metric.

Possible metrics include:

- connectivity-map spatial correlation
- seed connectivity
- connectivity to a multiregional circuit
- validated circuit-template similarity.

The metric is defined by the TherapeuticCircuit version.

---

# 35. CIRCUIT METRIC IS CIRCUIT-SPECIFIC

Do not require every TherapeuticCircuit to use the same calculation.

Examples:

### sgACC target family

May use:

```text
candidate ↔ sgACC functional connectivity.
```

### Convergent depression circuit

May use:

```text
candidate whole-brain connectivity
versus
published therapeutic circuit map.
```

### Symptom-specific circuit

May use:

```text
candidate connectivity fingerprint
versus
dysphoric/anxiosomatic template.
```

The algorithm records the method.

---

# 36. CIRCUIT CONCORDANCE NORMALISATION

Raw metrics may not be directly comparable.

Therefore, where possible, convert within the TargetFamily search space to:

# candidate percentile.

For candidate `c`:

\[
C(c)=Percentile_{SearchSpace}
(C_{raw}(c))
\]

producing:

```text
0 ≤ C(c) ≤ 1
```

This means:

> candidate lies in the top X% of patient-specific therapeutic-circuit concordance within the eligible search space.

It does not mean:

> X% probability of response.

---

# 37. CLUSTER-BASED TARGETING

Single-voxel or single-vertex maxima are potentially unstable.

Clinical Mode should preferentially use:

# spatially coherent clusters

rather than isolated extreme vertices.

Canonical method:

1. threshold circuit-concordance map using versioned threshold;
2. form contiguous cortical clusters;
3. reject clusters below minimum validated size;
4. calculate robust cluster representative;
5. evaluate stability across runs/partitions.

---

# 38. CLUSTER REPRESENTATIVE

Candidate centre may be:

- weighted centroid;
- surface medoid;
- maximum within stable cluster.

The exact method is a versioned scientific parameter.

Avoid unconstrained selection of a noise-driven peak.

---

# 39. CONNECTOME TARGET VARIANTS

For one TargetFamily Magniom may generate:

```text
Evidence Baseline Candidate
Personalized FC Candidate
Personalized FC Alternative Candidate
```

They remain separate TargetCandidates even if spatially close.

Slate assembly later decides whether they are redundant.

---

# 40. SGACC CONNECTIVITY

sgACC functional connectivity remains a relevant Clinical Mode feature because it has substantial targeting precedent, including SNT, where individualized left-DLPFC targets were chosen according to negative connectivity with sgACC.

However:

# sgACC anticorrelation is one feature, not the universal Magniom objective function.

The 2026 connectivity-guided RCT instead targeted maximal correlation with a broader convergent depression circuit that includes, but is not limited to, negative sgACC connectivity.

---

# 41. NORMATIVE CONNECTOME ROLE

Clinical Mode v1 does not allow:

# magnitude of normative abnormality alone

to generate or rank a clinical target.

Normative deviation is:

# contextual evidence.

This is intentionally more conservative than a pure anomaly-ranking approach.

---

# 42. CINGULUM ANOMALY MODEL

Cingulum's proof-of-concept framework analysed 377 regions, generating 142,129 pairwise relationships and using three-sigma normative outliers after excluding highly variable connections.

This provides important evidence for feasibility of personalised connectomic anomaly analysis.

However, the published MDD cohort was retrospective and uncontrolled.

Therefore, in Magniom Clinical Mode v1:

# normative anomalies can support interpretation but cannot independently create Primary Candidates.

Research Mode may evaluate them directly.

---

# 43. NORMATIVE RELEVANCE

For each candidate:

```text
N(c) ∈ {
  supportive,
  neutral,
  contradictory,
  uncertain
}
```

The default Clinical Mode v1 algorithm:

# displays N(c)

but does not assign a major independent ranking weight.

A future validated Scientific Policy may permit limited use.

---

# 44. NO HYPER/HYPO AUTOMATION

Magniom v1 must never contain:

```text
hyperconnectivity → cTBS
hypoconnectivity → iTBS
```

inside the Target Engine.

Target selection and protocol prescription remain separate.

---

# 45. RELIABILITY MODEL

Patient-specific connectivity is qualified by:

\[
R(c)
\]

with components:

```text
RQ  = data/QC reliability
RS  = spatial target reliability
RC  = connectivity reliability
RA  = atlas/construction reliability where available
RP  = pipeline robustness where validated
```

---

# 46. CONSERVATIVE RELIABILITY AGGREGATION

Clinical Mode v1 should not average away a catastrophic weakness.

Recommended:

\[
R(c)=min(R_Q,R_S,R_C)
\]

for mandatory components.

Optional components:

`RA`, `RP`

can modify interpretation once validated.

This implements:

# weakest critical link.

---

# 47. QC RELIABILITY

`RQ` reflects:

- usable duration
- motion
- censoring
- registration
- segmentation
- parcel coverage.

If any mandatory QC criterion fails:

```text
RQ = 0
```

and individual FC contribution is disabled.

---

# 48. SPATIAL RELIABILITY

Raw measures include:

```text
Dcross = cross-run target distance
Dsplit = split-half target distance
```

Define:

\[
D(c)=max(D_{cross},D_{split})
\]

where both exist.

A monotonic function:

\[
R_S=f_{spatial}(D)
\]

converts distance to `[0,1]`.

---

# 49. NO FIXED UNIVERSAL DISTANCE CLAIM

The function `fspatial` and reliability bands are versioned Scientific Policy parameters.

They must be derived from:

- validation data
- acquisition characteristics
- coil focality
- targeting method

rather than permanently declaring:

> 10 mm is always reliable.

---

# 50. RELIABILITY CLASSES

Scientific Policy defines thresholds:

```text
R ≥ THIGH        → high
TMODERATE ≤ R < THIGH → moderate
TLOW ≤ R < TMODERATE  → low
R < TLOW         → unreliable
```

These thresholds are version controlled.

---

# 51. CLINICAL FC USE THRESHOLD

Clinical Mode v1 requires:

```text
R(c) ≥ minimum_personalisation_reliability
```

for patient-specific FC to influence ranking.

Below threshold:

candidate may remain visible as:

# imaging hypothesis

but cannot outrank evidence baseline because of its FC score.

---

# 52. ACCESSIBILITY

Each candidate receives:

\[
A(c)
\]

based on:

- cortical accessibility
- coil compatibility
- scalp-to-cortex geometry
- viable coil placement
- subject anatomy.

Hard failures produce:

```text
A = 0
```

and candidate becomes ineligible.

---

# 53. ACCESSIBILITY CLASS

```text
good
conditional
poor
```

For Clinical Mode:

### Good

eligible.

### Conditional

eligible with penalty/flag according to Scientific Policy.

### Poor

ineligible for clinical slate.

---

# 54. E-FIELD ROLE

Where subject-specific electric-field modelling is:

- technically valid
- version-pinned
- available for every candidate being compared within a TargetFamily

Magniom may calculate:

\[
F(c)
\]

representing validated stimulation-quality metrics.

Potential components:

- ROI E-field engagement
- field concentration
- off-target field
- pose robustness.

E-field modelling is an increasingly active precision-targeting field but remains a modelling layer rather than direct proof of clinical efficacy.

---

# 55. E-FIELD AVAILABILITY BIAS

Do not reward one candidate merely because an E-field simulation happens to exist for it.

Within a TargetFamily:

either:

# all comparable candidates receive E-field evaluation

or:

# E-field is not included in comparative ranking.

Missingness must not produce ranking artefacts.

---

# 56. UTILITY SCORE PURPOSE

Magniom uses a candidate utility function only:

# after evidence and safety gates.

It is used for:

- ordering eligible candidates within a role;
- comparing candidate variants within an evidence-supported TargetFamily.

It is not:

- response probability;
- biological certainty;
- overall treatment recommendation strength.

---

# 57. CORE CANDIDATE UTILITY

For an eligible candidate:

\[
U(c)=
GMean_w
[
P(c),
C(c),
R(c),
A(c),
F(c)^*
]
\]

where:

- `P` = phenotype concordance;
- `C` = therapeutic-circuit concordance;
- `R` = patient-specific reliability;
- `A` = accessibility;
- `F*` = optional E-field metric.

Weighted geometric mean:

\[
U(c)=
\exp
\left(
\frac{
\sum_j w_j \ln(max(s_j,\epsilon))
}{
\sum_j w_j
}
\right)
\]

---

# 58. WHY GEOMETRIC RATHER THAN ADDITIVE

An additive model can allow:

```text
excellent connectivity
```

to compensate for:

```text
very poor reliability.
```

A geometric model strongly penalises weak dimensions.

This better matches Magniom's scientific philosophy.

Hard gates remain stronger still.

---

# 59. UTILITY WEIGHTS

Weights:

```text
wP
wC
wR
wA
wF
```

are:

# algorithm parameters.

They are stored inside Scientific Policy release.

No clinical UI permits users to alter them.

They require:

- sensitivity testing
- retrospective validation
- prospective validation.

---

# 60. EVIDENCE IS NOT IN CORE UTILITY

Evidence does not enter `U(c)` as another compensable scalar.

It determines:

- candidate eligibility;
- clinical role;
- evidence ceiling;
- ranking stratum.

This prevents:

> poor evidence + beautiful connectome

from becoming a top clinical target.

---

# 61. MISSING COMPONENT POLICY

Components may be absent legitimately.

Example:

Evidence-only candidate has no individual FC metric.

Do not assign:

```text
C = 0
```

because this would unfairly penalise the baseline.

Instead, calculate:

# role-specific utility

using only components relevant to that candidate class.

---

# 62. CANDIDATE CLASSES

## Evidence Candidate

Ranking dimensions:

- evidence
- phenotype
- accessibility
- E-field if consistently available.

## Connectome-Refined Candidate

Ranking dimensions:

- evidence
- phenotype
- circuit concordance
- reliability
- accessibility
- E-field if available.

## Symptom-Circuit Candidate

Ranking dimensions:

- evidence
- relevant clinical-domain priority
- circuit concordance where applicable
- reliability
- accessibility.

Do not compare raw utility values across incompatible candidate classes without role logic.

---

# 63. PERSONALISATION ADOPTION TEST

A personalised candidate does not automatically replace its evidence-only baseline.

Within the same TargetFamily compare:

```text
B = baseline evidence candidate
P = personalised candidate
```

Personalisation becomes preferred only if all required conditions are met.

---

# 64. PERSONALISATION CONDITIONS

### Condition 1 — Same evidence family

Personalised candidate remains inside the clinically permitted target-family search space.

### Condition 2 — Reliability

```text
R(P) ≥ Rminimum
```

### Condition 3 — Incremental circuit improvement

```text
C(P) - C(B) ≥ ΔCminimum
```

or equivalent validated relative improvement.

### Condition 4 — Accessibility

Personalisation does not create materially inferior stimulatability.

### Condition 5 — Evidence transfer

Target displacement does not exceed policy limits without downgrading interpretation.

### Condition 6 — No major contradictory finding

No validated contraindicating network/anatomical criterion.

---

# 65. PERSONALISATION DECISION

If all conditions pass:

```text
preferred_variant = personalised
```

Otherwise:

```text
preferred_variant = evidence_baseline
```

The personalised candidate may remain visible as an alternative.

---

# 66. MINIMUM INCREMENTAL VALUE

`ΔCminimum` is not a biological constant.

It is a Scientific Policy parameter.

Before clinical validation:

it should be selected conservatively and examined across:

- target reproducibility
- clinical outcomes
- displacement
- E-field
- clinician decisions.

---

# 67. PERSONALISATION STATUS

Each TargetFamily receives:

```text
qualified
limited
not_available
not_material
```

### Qualified

FC meaningfully and reliably refines the target.

### Limited

FC available but weakly reliable or only slightly informative.

### Not available

Imaging/QC insufficient.

### Not material

Connectomic candidate essentially agrees with evidence baseline.

---

# 68. COUNTERFACTUAL DISPLACEMENT

Calculate Euclidean or surface-geodesic displacement according to spatial representation:

\[
D_{cf}=distance(P,B)
\]

Store both where scientifically useful:

- Euclidean distance
- cortical-surface geodesic distance.

Do not silently mix the two.

---

# 69. PERSONALISATION IMPACT

Scientific Policy defines provisional bands:

```text
none
minor
moderate
major
```

based on:

- target displacement
- target-family change
- circuit change
- E-field change.

Distance alone is insufficient.

---

# 70. MAJOR DIVERGENCE

A personalised target is automatically flagged:

# MAJOR DIVERGENCE

if it:

- crosses into another TargetFamily;
- changes therapeutic circuit;
- exits validated anatomical search space;
- requires transfer of evidence from a substantially different target.

Such candidate cannot silently replace Primary 1.

---

# 71. ROLE-BASED RANKING

Magniom does not simply sort all candidates by one score.

The engine fills specific clinical roles.

These roles correspond to the Canonical Target Slate.

---

# 72. PRIMARY 1 — EVIDENCE ANCHOR

Purpose:

# preserve the strongest treatment evidence.

Selection procedure:

1. identify eligible Tier A target families;
2. generate evidence baseline;
3. evaluate qualified personalised refinement;
4. apply personalisation adoption test;
5. select best eligible evidence-anchor variant.

If no Tier A target family exists:

Clinical Mode v1 normally abstains unless Scientific Policy explicitly permits a Tier B-only pathway.

---

# 73. PRIMARY 1 PERSONALISATION

Primary 1 may therefore be:

### Evidence-only target

if individual FC adds little or is unreliable.

or:

### Connectome-refined evidence target

if personalisation passes the adoption test.

This avoids treating conventional targeting as an inferior fallback.

---

# 74. PRIMARY 2 — SYMPTOM-CIRCUIT TARGET

Purpose:

# address the highest-priority clinically important domain not already adequately represented by Primary 1.

Procedure:

1. order clinical domains by clinician-approved priority;
2. remove domains adequately covered by P1;
3. identify Tier A/B target families with direct evidence for highest uncovered domain;
4. generate eligible candidates;
5. rank within role;
6. suppress if redundant with P1 without meaningful additional clinical value.

For v1, this is particularly relevant to:

# anxiosomatic targeting.

---

# 75. SYMPTOM-CIRCUIT EVIDENCE

The 2026 prospective head-to-head trial randomized patients with both significant depression and anxiety to dysphoric or anxiosomatic circuit targets and found differential effects in the predicted direction, with greater anxiety improvement from the anxiosomatic target.

This supports inclusion as a Tier B circuit-targeting hypothesis.

It does not justify an unrestricted catalogue of one TMS target per symptom.

---

# 76. PRIMARY 3 — DISTINCT CONNECTOME REFINEMENT

Primary 3 is not simply:

> third-highest score.

It is included only when an additional candidate provides:

- distinct therapeutic information;
- meaningful network difference;
- adequate evidence;
- adequate reliability;
- non-redundant stimulation solution.

---

# 77. PRIMARY 3 ABSENCE IS NORMAL

If:

- P1 already represents dysphoric/evidence network;
- P2 covers anxiosomatic network;
- remaining candidates are nearby variants;

then:

# Primary 3 remains empty.

The engine reports:

> No third primary candidate added because remaining candidates do not provide sufficient independent clinical or network information.

---

# 78. ADDITIONAL A — NETWORK ALTERNATIVE

Purpose:

provide an alternative if Primary candidate is:

- less accessible;
- lower reliability;
- anatomically difficult;
- dependent on stronger personalisation assumptions.

Usually drawn from:

# same evidence-supported therapeutic objective.

---

# 79. ADDITIONAL B — CLINICAL ALTERNATIVE

Purpose:

represent:

- important secondary clinical objective;
- alternative evidence-supported circuit;
- standard target where a personalised Primary target was chosen.

This is often the appropriate location for the:

# evidence-only counterfactual target

when connectome-refined Primary 1 is selected.

---

# 80. CLINICAL COVERAGE

Let approved clinical priorities be:

\[
D={d_1...d_n}
\]

A slate `S` has weighted coverage:

\[
Coverage(S)=
\frac{
\sum_d W_d \cdot max_{c \in S}(Coverage(c,d))
}{
\sum_d W_d
}
\]

This helps determine whether an additional candidate contributes meaningful clinical information.

---

# 81. COVERAGE IS NOT EXPECTED TREATMENT EFFECT

`Coverage(S)` means:

> how much of the clinician-approved phenotype has an evidence-mappable candidate represented in the decision slate.

It does not estimate:

- expected symptom reduction;
- remission probability.

---

# 82. REDUNDANCY PRINCIPLE

Two candidates may be scientifically redundant even if their coordinates differ slightly.

Redundancy must consider:

- spatial proximity
- therapeutic circuit
- TargetFamily
- symptom coverage
- E-field overlap where available.

---

# 83. REDUNDANCY FEATURES

For candidates `a` and `b`:

```text
SpatialSimilarity(a,b)
CircuitSimilarity(a,b)
ClinicalCoverageSimilarity(a,b)
EFieldOverlap(a,b)
```

Each is independently stored where calculable.

---

# 84. SPATIAL REDUNDANCY

Scientific Policy defines:

```text
Dredundant
```

within each target class.

If:

```text
distance(a,b) < Dredundant
```

and:

- same TargetFamily;
- same therapeutic objective;

then candidates are provisionally redundant.

---

# 85. E-FIELD REDUNDANCY

Where E-field available:

\[
Overlap_{EF}(a,b)
\]

may be measured using overlap between supra-threshold cortical field distributions or another validated method.

High E-field overlap can establish redundancy even when coil centres differ.

---

# 86. NETWORK REDUNDANCY

Candidates may also be redundant when:

- connected to same therapeutic circuit;
- clinical coverage essentially identical;
- no meaningful additional objective.

Network redundancy can therefore suppress two targets farther apart than the spatial threshold.

---

# 87. V1 REDUNDANCY RULE

A candidate is suppressed as redundant if:

### Route A

same TargetFamily  
+ spatially close  
+ no new clinical coverage

or

### Route B

high E-field overlap  
+ same clinical objective

or

### Route C

high therapeutic-circuit similarity  
+ same clinical domain  
+ no meaningful reliability/accessibility advantage.

Thresholds live in Scientific Policy.

---

# 88. REDUNDANCY WINNER

When candidates are redundant, retain using lexicographic comparison:

1. stronger Evidence Tier;
2. higher relevant phenotype coverage;
3. qualified personalisation if adoption test passed;
4. greater reliability;
5. greater therapeutic-circuit concordance;
6. better accessibility/E-field;
7. smaller evidence-transfer concern;
8. stable deterministic ID tie-break.

---

# 89. NO OPAQUE DIVERSITY SCORE IN V1

Clinical Mode v1 should use:

# rule-based redundancy and coverage

rather than an unconstrained machine-learned diversity objective.

Research Mode may later evaluate approaches such as maximal marginal relevance or formal optimization.

---

# 90. CONVERGENCE

Magniom calculates whether independent reasoning paths identify the same target region.

Potential sources:

```text
Evidence baseline
Symptom circuit
Patient-specific FC
Normative finding
E-field optimum
Structural connectivity
```

---

# 91. SPATIAL CONVERGENCE

For source-generated target locations:

calculate pairwise distances.

Define a robust central measure:

```text
median pairwise distance
```

or equivalent.

Scientific Policy maps the result to:

```text
high
moderate
low
```

---

# 92. CIRCUIT CONVERGENCE

Even if coordinates differ, candidates may converge on:

- same TherapeuticCircuit;
- same TargetFamily;
- same clinical objective.

Therefore convergence has:

### Spatial convergence

and:

### Circuit convergence.

These should not be conflated.

---

# 93. CONVERGENCE OUTPUT

Example:

```text
Evidence target:
left DLPFC

Dysphoric circuit target:
left DLPFC, 6 mm away

Individual FC target:
left DLPFC, 8 mm away

Result:
HIGH CONVERGENCE
```

Target Slate should contain:

# one Primary target

not three artificial versions.

---

# 94. LOW CONVERGENCE

Example:

```text
Evidence target:
left DLPFC

Individual FC optimum:
32 mm away

Symptom target:
dorsomedial PFC
```

Output:

# LOW CONVERGENCE

This should increase:

- uncertainty
- need for clinician review

not automatically cause one layer to override another.

---

# 95. TARGET ENGINE WARNINGS

Structured warnings include:

```text
LOW_TARGET_CONVERGENCE
PERSONALISATION_MAJOR_DIVERGENCE
LIMITED_FC_RELIABILITY
EVIDENCE_CONFLICT
PATIENT_OUTSIDE_PRIMARY_STUDY_POPULATION
EFIELD_CONDITIONAL
NO_THIRD_PRIMARY_TARGET
NORMATIVE_FINDING_RESEARCH_ONLY
```

Warnings do not necessarily mean algorithm failure.

---

# 96. EXTERNAL VALIDITY

Each candidate evaluates:

# applicability to this patient.

Examples:

- age outside major trial range;
- bipolar II included in one study but not another;
- comorbidity differs;
- treatment protocol cited differs materially from intended clinical pathway.

These create:

`external_validity uncertainty`.

---

# 97. PROTOCOL DIFFERENCE

The Target Engine can show:

> Supporting target evidence was generated using accelerated iTBS.

But because target and protocol are separated:

it must not conclude:

> therefore accelerated iTBS should be used.

Protocol mismatch contributes to:

# evidence-transfer uncertainty.

---

# 98. TARGET ENGAGEMENT DATA

The 2026 symptom-circuit target-engagement study found that baseline target connectivity to the relevant circuit was more informative than observed pre/post connectivity change in its modest cohort, while target-induced connectivity changes were not clearly circuit-specific.

Therefore Clinical Mode v1 prioritises:

# baseline circuit architecture

over attempting to rank targets according to presumed future connectivity change.

---

# 99. CANDIDATE RANKING KEY

Within a defined role, candidates are ordered deterministically using:

```text
1. Evidence eligibility class
2. Role-specific clinical priority
3. Personalisation qualification
4. Candidate utility
5. Reliability
6. Accessibility
7. Evidence-transfer uncertainty
8. Stable candidate ID
```

This makes ties reproducible.

---

# 100. NO GLOBAL TOP-FIVE SORT

The engine must never implement:

```python
sorted(all_candidates, key=score)[:5]
```

as Clinical Mode slate generation.

The five positions have different scientific meanings.

---

# 101. SLATE ASSEMBLY ALGORITHM

Pseudocode:

```python
def build_target_slate(context):

    validate_context(context)

    families = evidence_gate(context)

    if not families:
        return abstain("INSUFFICIENT_EVIDENCE")

    phenotype = load_approved_phenotype(context)

    baseline_candidates = generate_evidence_candidates(
        families,
        phenotype
    )

    if connectome_is_clinically_usable(context):
        personalised_candidates = generate_connectome_candidates(
            families,
            context
        )
    else:
        personalised_candidates = []

    candidates = (
        baseline_candidates
        + personalised_candidates
    )

    for candidate in candidates:
        attach_evidence(candidate)
        attach_phenotype_fit(candidate)
        attach_circuit_metrics(candidate)
        attach_normative_context(candidate)
        attach_reliability(candidate)
        attach_accessibility(candidate)
        attach_efield_if_valid(candidate)
        apply_scientific_gates(candidate)

    eligible = [
        c for c in candidates
        if c.is_clinically_eligible
    ]

    if not eligible:
        return abstain("NO_STIMULATABLE_TARGET")

    resolve_personalisation_variants(eligible)

    primary_1 = select_evidence_anchor(eligible)

    primary_2 = select_uncovered_symptom_target(
        eligible,
        selected=[primary_1]
    )

    primary_3 = select_distinct_refinement(
        eligible,
        selected=[primary_1, primary_2]
    )

    primaries = suppress_redundancy(
        [primary_1, primary_2, primary_3]
    )

    additional_a = select_network_alternative(
        eligible,
        primaries
    )

    additional_b = select_clinical_alternative(
        eligible,
        primaries + [additional_a]
    )

    slate = compact_non_null(
        primaries,
        additional_a,
        additional_b
    )

    compute_slate_coverage(slate)
    compute_convergence(slate)
    compute_counterfactual_summary(slate)
    build_explanations(slate)

    return slate
```

---

# 102. PRIMARY 1 FUNCTION

```python
def select_evidence_anchor(candidates):

    pool = [
        c for c in candidates
        if c.eligible
        and c.role_candidate
            in ("evidence_anchor",
                "connectome_refinement")
        and c.target_family.evidence_tier == "A"
    ]

    family_groups = group_by_target_family(pool)

    preferred_variants = []

    for family in family_groups:

        baseline = family.evidence_baseline
        personalised = family.best_personalised

        if personalised and passes_personalisation_test(
            personalised,
            baseline
        ):
            preferred_variants.append(personalised)
        else:
            preferred_variants.append(baseline)

    return role_rank(preferred_variants)[0]
```

---

# 103. PRIMARY 2 FUNCTION

```python
def select_uncovered_symptom_target(
    candidates,
    selected
):

    uncovered = highest_priority_uncovered_domain(
        selected
    )

    if uncovered is None:
        return None

    pool = [
        c for c in candidates
        if c.supports(uncovered)
        and c.evidence_tier in permitted_tiers
        and not is_redundant(
            c,
            selected
        )
    ]

    if not pool:
        return None

    return role_rank(pool)[0]
```

---

# 104. PRIMARY 3 FUNCTION

```python
def select_distinct_refinement(
    candidates,
    selected
):

    pool = [
        c for c in candidates
        if c.eligible
        and not already_selected(c)
        and adds_distinct_information(
            c,
            selected
        )
        and not is_redundant(
            c,
            selected
        )
    ]

    if not pool:
        return None

    return role_rank(pool)[0]
```

---

# 105. DISTINCT INFORMATION TEST

Candidate adds distinct information when at least one is true:

### A

Covers a high-priority domain not adequately covered.

### B

Represents a prospectively supported different therapeutic circuit.

### C

Provides substantially better reliability/accessibility than existing candidate.

### D

Provides a scientifically meaningful counter-hypothesis under low convergence.

Pure coordinate difference alone is insufficient.

---

# 106. ADDITIONAL CANDIDATE SELECTION

Additional candidates should maximise:

# decision usefulness.

Not treatment quantity.

Preference:

### Additional A

best alternative to the least certain primary.

### Additional B

best clinically distinct alternative or evidence-only counterfactual.

---

# 107. SLATE POSITION MAY REMAIN EMPTY

Valid output:

```text
Primary 1      ✓
Primary 2      ✓
Primary 3      —
Additional A   ✓
Additional B   —
```

The UI must not imply incompleteness.

---

# 108. ABSTENTION MODEL

Magniom supports two major abstention classes.

## Complete abstention

No defensible Target Slate.

## Personalisation abstention

Clinical target evidence exists, but imaging cannot reliably individualise it.

---

# 109. COMPLETE ABSTENTION CONDITIONS

Examples:

```text
clinical indication outside scope
no eligible TargetFamily
all eligible targets anatomically inaccessible
required scientific release unavailable
critical processing incompatibility
```

Result:

# NO CLINICAL TARGET SLATE

---

# 110. PERSONALISATION ABSTENTION CONDITIONS

Examples:

```text
rs-fMRI QC fail
insufficient usable data
unstable target localisation
pipeline incompatibility
connectome run failed
```

Result:

# EVIDENCE-ONLY TARGET SLATE

with explicit explanation.

---

# 111. LOW CONVERGENCE IS NOT AUTOMATIC ABSTENTION

Low convergence may still be clinically informative.

Output should present:

- evidence anchor
- connectomic hypothesis
- uncertainty

for specialist review.

Only defined hard gates trigger abstention.

---

# 112. CANDIDATE EXPLANATION OBJECT

Every candidate must generate:

```ts
interface CandidateExplanation {
  short_summary: string;

  why_nominated: ExplanationFact[];

  what_patient_imaging_added: ExplanationFact[];

  evidence_basis: EvidenceClaimRef[];

  reliability_summary: string;

  counterfactual_summary: string;

  why_it_may_be_wrong: ExplanationFact[];

  alternatives: TargetCandidateRef[];

  uncertainties: UncertaintyItem[];
}
```

---

# 113. EXPLANATION GENERATION

Clinical Mode v1 explanation should be:

# deterministic templating from structured facts.

Example:

> This candidate remains within an established left-prefrontal depression TargetFamily. Patient-specific functional connectivity identified a location with greater concordance to the therapeutic depression circuit than the evidence-only reference target. Target localisation was reproducible across both resting-state runs.

Counterargument:

> The clinical superiority of this individualised displacement has not been established for this patient, and randomized evidence comparing personalised with fixed targeting remains mixed.

---

# 114. NO LLM NEEDED FOR V1 EXPLANATION

An LLM may later rewrite approved structured explanation into clearer prose.

It cannot:

- add evidence;
- alter candidate rank;
- omit mandatory limitations;
- modify uncertainty.

Canonical explanation facts remain stored independently.

---

# 115. RANKING FEATURE STORAGE

For every candidate store:

```text
P phenotype concordance
C therapeutic-circuit concordance
R reliability
A accessibility
F E-field if applicable

Evidence Tier
personalisation status
counterfactual displacement
coverage
redundancy features
external validity
```

This permits algorithm reconstruction.

---

# 116. SUPPRESSED CANDIDATE STORAGE

Suppressed candidates remain stored.

Reasons include:

```text
EVIDENCE_CEILING
RESEARCH_ONLY
REDUNDANT
LOW_RELIABILITY
POOR_ACCESSIBILITY
FAILED_PERSONALISATION_TEST
LOW_INCREMENTAL_VALUE
ROLE_ALREADY_COVERED
```

This is essential for validation.

---

# 117. SCIENTIFIC POLICY PARAMETERS

The following must be configuration, not source-code constants:

```text
permitted Clinical evidence tiers
minimum connectome QC
minimum personalisation reliability
minimum circuit improvement ΔC
phenotype coverage mapping
utility weights
cluster threshold
minimum cluster size
reliability mappings
spatial redundancy threshold
E-field overlap threshold
counterfactual impact bands
conditional accessibility penalty
convergence thresholds
```

All belong to:

# ScientificPolicyRelease.

---

# 118. PARAMETER CHANGE

Changing any ranking-relevant parameter requires:

# new Scientific Policy version

and potentially:

# new Target Engine version

depending on implementation.

Existing slates do not recalculate silently.

---

# 119. V1 RECOMMENDED CONSERVATISM

Before prospective validation:

### Evidence Tier

Prefer A/B.

### Normative abnormalities

Display, but do not allow independent clinical ranking.

### E-field

Use for accessibility/pose optimization before using it as a major efficacy ranking component.

### Personalisation

Require explicit incremental benefit over baseline.

### Low reliability

Fall back to evidence baseline.

### Third target

Leave empty unless clearly distinct.

---

# 120. TARGET FAMILY — V1 DEPRESSION

Minimum Clinical Mode TargetFamily set:

### TF1 — Established left-prefrontal depression family

Role:

Evidence Anchor.

### TF2 — sgACC-related left-prefrontal refinement family

Role:

Connectome refinement within depression evidence.

### TF3 — Convergent depression circuit target family

Role:

Connectome-informed depression refinement.

### TF4 — Dysphoric circuit target family

Role:

Symptom-specific.

### TF5 — Anxiosomatic circuit target family

Role:

Symptom-specific.

Overlap between TF1–TF4 must be handled through convergence and redundancy rather than assumed to represent four independent treatment targets.

---

# 121. V1 CINGULUM RESEARCH CANDIDATES

Research Mode may additionally generate:

### HCP parcel anomaly candidate

### CEN/DMN/SN anomaly candidate

### L8Av candidate

### PGs candidate

### area 46 anomaly candidate

where supported by the relevant Research EvidenceClaims.

They remain:

# Research Mode

until evidence governance promotes them.

---

# 122. MULTI-TARGET TREATMENT MUST NOT BE INFERRED

The Target Engine produces:

# hypotheses for specialist review.

It does not determine:

> stimulate targets 1, 2 and 3 sequentially.

The larger Cingulum safety series supports feasibility/tolerability of multi-target connectome-guided treatment but does not establish routine multi-target superiority.

Therefore:

# slate cardinality is not treatment-target cardinality.

---

# 123. TARGET ENGINE DOES NOT PRESCRIBE PROTOCOL

The engine does not output:

- high-frequency rTMS
- low-frequency rTMS
- iTBS
- cTBS
- pulse number
- intensity
- session frequency
- accelerated schedule.

It may expose:

# protocol precedent from supporting evidence.

A separate Protocol Decision Engine would require a separate specification and validation pathway.

---

# 124. TIE-BREAKING

If candidates remain exactly tied after scientific ranking:

use deterministic ordering:

1. lexicographic TargetFamily code;
2. canonical subject coordinate ordering;
3. immutable candidate UUID lexical value as final fallback.

The tie-break must not imply scientific superiority.

Flag:

# SCIENTIFICALLY EQUIVALENT UNDER CURRENT ENGINE.

---

# 125. ROUNDING

Do not round values before ranking.

Store calculations at full machine precision.

Round only for display.

This prevents apparently identical values from changing internal order unpredictably.

---

# 126. SPATIAL TRANSFORM REQUIREMENT

All candidate comparisons must occur in:

# the same defined coordinate representation.

Do not compare:

- MNI Euclidean distance

with:

- subject surface geodesic distance

inside one threshold without explicit transformation.

---

# 127. SURFACE VS VOLUME

For cortical target refinement:

prefer:

# subject cortical surface representation

where pipeline validation supports it.

MNI coordinates remain useful for:

- evidence reference;
- reporting;
- interoperability.

The patient target itself should not be conceptualised only as an MNI point.

---

# 128. EVIDENCE TRANSFER DISTANCE

Scientific Policy may define a distance/overlap beyond which a personalised location can no longer inherit the full confidence of its parent TargetFamily.

This must be:

- empirically tested;
- family-specific where necessary;
- represented as uncertainty.

Do not assume one universal centimetre threshold.

---

# 129. EXAMPLE — STRONG CONVERGENCE

Patient:

MDD, predominantly dysphoric.

Evidence baseline:

left DLPFC.

Patient FC optimum:

7 mm from baseline.

Reliability:

high.

Circuit improvement:

material.

Accessibility:

good.

Dysphoric circuit:

same region.

Result:

```text
PRIMARY 1
Connectome-refined left-prefrontal target

PRIMARY 2
None

PRIMARY 3
None

ADDITIONAL A
Evidence-only reference target

CONVERGENCE
High
```

Magniom does not invent multiple nearly identical targets.

---

# 130. EXAMPLE — ANXIOUS DEPRESSION

Phenotype:

```text
dysphoric priority  = 0.7
anxiosomatic priority = 1.0
```

P1:

connectome-refined evidence-anchor left DLPFC.

P2:

prospectively supported dorsomedial anxiosomatic target.

P3:

none.

Additional A:

evidence-only left-DLPFC counterfactual.

Result:

two distinct clinical hypotheses.

---

# 131. EXAMPLE — BAD MRI

Evidence baseline:

eligible.

FC scan:

excessive motion.

Reliability:

unreliable.

Result:

```text
PERSONALISATION:
ABSTAINED

PRIMARY 1:
Evidence-supported left-prefrontal target

PRIMARY 2:
Anxiosomatic target if clinically relevant

CONNECTOME:
Not used for ranking
```

This is a successful Magniom result.

---

# 132. EXAMPLE — EXTREME ANOMALY OUTSIDE EVIDENCE

Patient has strong abnormal connectivity involving HCP parcel X.

Parcel X:

Tier D research evidence only.

Result:

```text
Clinical Slate:
not affected.

Research Panel:
Parcel X anomaly displayed.
```

No amount of abnormality overrides evidence ceiling.

---

# 133. EXAMPLE — PERSONALISED TARGET FAR FROM STANDARD

Evidence baseline:

left DLPFC.

Patient FC target:

31 mm away.

Reliability:

high.

Circuit concordance:

very high.

Result:

```text
MAJOR DIVERGENCE
```

Engine may retain:

- evidence target as Primary 1;
- connectomic candidate as Additional/Research candidate depending target-family boundary and evidence policy.

It does not automatically promote the distant FC maximum.

---

# 134. EXAMPLE — THREE TARGETS NOT JUSTIFIED

Generated:

12 eligible candidates.

After redundancy:

4 remain.

Clinical coverage:

P1 and P2 cover all evidence-mappable priorities.

Remaining candidates:

same circuits / no meaningful additional information.

Result:

```text
Primary 3 = empty
```

Candidate count does not drive slate count.

---

# 135. GOLDEN CASE REQUIREMENTS

Target Engine validation suite must include at least:

### G01

Evidence-only standard case.

### G02

High-convergence personalisation.

### G03

Qualified large target refinement.

### G04

Personalisation below incremental-value threshold.

### G05

Low FC reliability.

### G06

Complete MRI QC failure.

### G07

Anxiosomatic domain dominates.

### G08

Dysphoric domain dominates.

### G09

Mixed dysphoric/anxiosomatic.

### G10

Research anomaly larger than Clinical candidate.

### G11

All candidates inaccessible.

### G12

Redundant candidate cluster.

### G13

E-field changes preferred candidate.

### G14

E-field missing for one candidate.

### G15

Evidence Library contains conflicting claims.

### G16

Case outside validated indication.

### G17

Personalised target leaves TargetFamily.

### G18

Only one candidate clinically meaningful.

### G19

Deterministic tie.

### G20

Evidence Library version change modifies ranking.

---

# 136. DETERMINISM TEST

For each Golden Case:

run:

```text
100 identical executions
```

Expected:

```text
identical candidate hashes
identical slate hash
identical suppression reasons
```

Any variability fails release.

---

# 137. MONOTONICITY TESTS

Important scientific invariants:

If all else equal:

### Better reliability

must not lower a personalised candidate's rank.

### Worse reliability

must not increase rank.

### Stronger phenotype relevance

must not reduce role ranking.

### Worse accessibility

must not increase rank.

### Research evidence

must never outrank Clinical evidence solely because of FC metrics.

These become automated property tests.

---

# 138. PERTURBATION TESTING

Small changes in:

- symptom weight
- FC metric
- target coordinate
- reliability

should produce:

# proportionate and interpretable changes

rather than chaotic rank switching.

Measure:

- rank stability
- coordinate stability
- slate stability.

---

# 139. PARAMETER SENSITIVITY

For every scientific parameter:

vary through plausible range.

Measure:

- Primary 1 change rate
- Primary 2 change rate
- slate composition
- abstention rate.

If tiny parameter changes cause widespread target changes:

the algorithm is too brittle for Clinical Mode.

---

# 140. BOOTSTRAP / RESAMPLING VALIDATION

Research validation should evaluate candidate stability under:

- temporal resampling of rs-fMRI;
- scan split-half;
- run leave-one-out;
- reasonable preprocessing perturbation.

These analyses inform:

`TargetReliabilityProfile`.

They do not dynamically change Clinical Policy without governance.

---

# 141. RETROSPECTIVE CLINICAL VALIDATION

For previously treated cases:

calculate Magniom targets without using outcome data.

Then examine:

- distance from actual stimulation site;
- ranking of actual target;
- target-to-circuit concordance;
- symptom-specific outcomes;
- outcome by Magniom rank.

This must be hypothesis testing.

Do not tune and evaluate on the same dataset without proper separation.

---

# 142. DEVELOPMENT / VALIDATION SPLIT

Algorithm development requires:

```text
development dataset
validation dataset
```

Prefer external validation later.

Weights and thresholds chosen using development data become frozen before validation.

---

# 143. SILENT PROSPECTIVE VALIDATION

For new patients:

1. clinician selects target normally;
2. Magniom generates hidden slate;
3. treatment occurs;
4. outcomes collected;
5. compare retrospectively.

Important measures:

- Magniom/clinician target concordance
- displacement
- ranking
- abstention
- clinical outcome association.

---

# 144. CLINICIAN-ASSISTED VALIDATION

Next stage:

clinician sees Magniom slate.

Measure:

- decision time
- target changes
- override frequency
- confidence
- inter-clinician agreement
- usability
- clinical outcome.

This tests:

# decision utility

before claiming improved efficacy.

---

# 145. RANDOMIZED CLINICAL UTILITY TRIAL

Ultimate validation:

### Arm A

high-quality standard evidence-based targeting.

### Arm B

Magniom-assisted targeting.

Both should use otherwise comparable treatment protocols.

This is necessary to isolate:

# targeting contribution.

---

# 146. PRIMARY ALGORITHM VALIDATION QUESTIONS

## Does Magniom generate reproducible candidates?

## Does connectomics materially change targets only when reliable?

## Are higher-ranked candidates associated with better target-specific outcomes?

## Does Magniom improve inter-specialist consistency?

## Does personalisation improve outcomes over a strong evidence baseline?

## Which patients benefit from personalisation?

---

# 147. CALIBRATION

If future data support probabilistic outputs:

Magniom may eventually estimate:

```text
probability target candidate outperforms baseline
```

but only after prospective calibration.

Until then:

do not expose numeric “confidence percentages”.

---

# 148. ALGORITHM RELEASE MANIFEST

Every Target Engine release records:

```json
{
  "engine_version": "1.0.0",
  "scientific_policy_version": "1.0.0",
  "evidence_library_minimum": "1.0.0",
  "code_commit": "...",
  "container_digest": "sha256:...",
  "candidate_schema_version": "1.0",
  "validated_golden_suite": "1.0",
  "approved_at": "...",
  "approved_by": "..."
}
```

---

# 149. REPRODUCIBILITY HASH

Target generation manifest includes:

```text
phenotype snapshot hash
connectome manifest hash
reliability profile hash
evidence library hash
scientific policy hash
target engine digest
device context hash
```

Compute:

# TargetGenerationInputHash.

The resulting Target Slate receives:

# TargetSlateHash.

---

# 150. ALGORITHM AUDIT EVENT

At generation, persist:

```text
TARGET_ENGINE_STARTED
TARGET_CANDIDATES_GENERATED
TARGET_CANDIDATE_SUPPRESSED
PERSONALISATION_QUALIFIED
PERSONALISATION_ABSTAINED
TARGET_SLATE_GENERATED
```

High-volume internal vertex calculations do not need individual clinical audit events.

Scientific summaries do.

---

# 151. REQUIRED INTERNAL LOGGING

For each candidate:

```text
source TargetFamily
candidate-generation method
raw circuit metrics
normalized metrics
reliability
accessibility
E-field
eligibility gates
utility components
role ranking
personalisation comparison
redundancy assessment
suppression reason
```

Enough information must exist to reconstruct the decision.

---

# 152. FRONTEND DISPLAY

Do not expose:

```text
U(c) = 0.847
```

as:

> 84.7% target score.

Instead:

### Evidence

Established / Prospectively supported.

### Phenotype fit

Strong / Moderate / Limited.

### Circuit concordance

High within eligible search space.

### Reliability

High — split-half target distance X mm.

### Accessibility

Good.

### Personalisation impact

Moderate refinement from evidence-only target.

---

# 153. OPTIONAL TECHNICAL VIEW

Specialists/researchers may open:

# Technical Detail

showing:

- raw metrics
- percentile
- utility components
- thresholds
- version.

But UI must explicitly state:

> Internal ranking metrics are not probabilities of clinical response.

---

# 154. EXPLANATION OF PRIMARY 1

Template:

> **Why Primary 1:** This candidate belongs to the strongest evidence-supported target family for the current indication. {If personalised: Patient-specific connectivity identified a reliably localised cortical site with greater concordance to the relevant therapeutic circuit than the evidence-only target.} Anatomical accessibility is {status}.

Counterargument:

> Evidence that individual connectivity-guided targeting improves outcomes over high-quality standard targeting remains mixed, so the personalisation component should be interpreted as a refinement rather than proof of superiority.

---

# 155. EXPLANATION OF PRIMARY 2

Template:

> **Why Primary 2:** This candidate addresses {clinical domain}, which remains a high-priority component of the approved phenotype and is not adequately represented by Primary 1. The relevant therapeutic circuit has {Evidence Tier} support.

---

# 156. EXPLANATION OF EMPTY PRIMARY 3

Template:

> **Why there is no Primary 3:** Remaining eligible candidates substantially overlap the selected targets in anatomical location, therapeutic circuit or clinical objective and do not add enough independent information to justify another primary candidate.

This positively explains restraint.

---

# 157. ENGINE SAFETY RULES

Clinical Mode Target Engine must never:

- generate treatment indication;
- diagnose patient;
- infer clinical priority without clinician-approved phenotype;
- rank Research-only target above Clinical target;
- use failed FC;
- use normative anomaly alone as clinical target;
- prescribe protocol;
- stimulate all slate targets automatically;
- suppress evidence baseline solely because personalisation exists;
- represent utility as response probability;
- hide conflicting evidence;
- invent five targets.

---

# 158. ENGINE SCIENTIFIC RULES

# Evidence defines candidate space.

# Clinical phenotype defines role relevance.

# Individual FC can refine within evidence-supported space.

# FC refinement requires reliability.

# Abnormality is contextual, not automatically therapeutic.

# Personalisation must show incremental value.

# Evidence baseline always remains recoverable.

# Redundant candidates are suppressed.

# Convergence is reported rather than duplicated.

# Abstention is a valid result.

---

# 159. V1 IMPLEMENTATION MODULES

Recommended package structure:

```text
packages/target-engine/
│
├── src/
│   ├── engine.ts
│   │
│   ├── gates/
│   │   ├── clinical-scope.ts
│   │   ├── evidence.ts
│   │   ├── reliability.ts
│   │   ├── accessibility.ts
│   │   └── mode.ts
│   │
│   ├── candidate-generation/
│   │   ├── evidence-baseline.ts
│   │   ├── circuit-search.ts
│   │   ├── clustering.ts
│   │   └── personalised.ts
│   │
│   ├── features/
│   │   ├── phenotype.ts
│   │   ├── circuit.ts
│   │   ├── normative.ts
│   │   ├── reliability.ts
│   │   ├── accessibility.ts
│   │   └── efield.ts
│   │
│   ├── ranking/
│   │   ├── utility.ts
│   │   ├── personalisation.ts
│   │   ├── roles.ts
│   │   ├── redundancy.ts
│   │   └── convergence.ts
│   │
│   ├── slate/
│   │   ├── assemble.ts
│   │   ├── coverage.ts
│   │   ├── counterfactual.ts
│   │   └── explain.ts
│   │
│   └── validation/
│       ├── invariants.ts
│       └── manifests.ts
│
└── tests/
```

---

# 160. FUNCTION PURITY

Most Target Engine modules should be pure functions.

Example:

```ts
calculatePhenotypeFit(
  candidate,
  phenotype,
  policy
)
```

must not:

- query database
- access network
- inspect current date.

Database loading and persistence happen outside the scientific engine.

---

# 161. TYPE SAFETY

No `any` types in canonical Target Engine.

Scientific units should be explicit.

Example:

```ts
type Millimetres = number;
type NormalizedScore = number;
type Percentile = number;
```

Runtime validation must ensure bounds.

---

# 162. FLOATING-POINT POLICY

Document:

- floating-point representation
- normalization
- comparison tolerance
- deterministic ordering.

Use explicit epsilon only where scientifically justified.

Do not let floating-point noise change candidate order unpredictably.

---

# 163. ALGORITHM VERSION BUMP

### Patch

Implementation bug corrected without intended scientific output change.

### Minor

Scientific parameter or algorithm change capable of changing candidates while remaining within same conceptual architecture.

### Major

Scientific decision architecture changes substantially.

Any change producing different Clinical Target Slates should trigger formal impact assessment regardless of semantic version label.

---

# 164. REPROCESSING POLICY

When new engine version released:

historical cases remain unchanged.

Research may rerun historical data explicitly.

Clinical target review requires:

# deliberate new Target Slate.

Never automatically rewrite previous clinical recommendations.

---

# 165. V1 SCIENTIFIC SUCCESS CRITERION

Target Engine v1 is successful when:

# every selected target can be reconstructed and challenged.

For each Primary candidate, a specialist must be able to answer:

### Why was this target scientifically eligible?

### Which clinical priority does it address?

### Which circuit supports it?

### What did patient imaging add?

### Was the imaging sufficiently reliable?

### What would the target have been without imaging?

### How much did personalisation move it?

### Is it anatomically stimulatable?

### What alternative was suppressed?

### Why might this target be wrong?

If the system cannot answer all ten:

# the ranking is not ready for Clinical Mode.

---

# 166. CANONICAL ALGORITHM

The Target Engine can be summarised formally as:

\[
CandidateSpace =
EvidenceEligibleTargets
\]

\[
ClinicalRelevance =
f(ApprovedPhenotype)
\]

\[
PatientRefinement =
f(IndividualConnectome)
\]

subject to:

\[
Reliability \ge R_{minimum}
\]

and:

\[
Accessibility = acceptable
\]

Personalisation is adopted only if:

\[
IncrementalValue(Personalised,Baseline)
\ge Threshold
\]

Then:

\[
Slate =
RoleConstrainedSelection
(
EligibleCandidates
)
\]

subject to:

\[
Redundancy \le Threshold
\]

and:

\[
ClinicalInformationGain > minimum
\]

with:

\[
|Primary| \le 3
\]

and:

\[
|Additional| \le 2
\]

and:

\[
|Slate| \ge 0.
\]

---

# 167. HUMAN AUTHORITY

The algorithm ends at:

# Target Slate.

It never crosses into:

# final prescription authority.

After generation:

```text
Target Slate
      ↓
Specialist review
      ↓
Accept / Reject / Modify / Replace / Defer
      ↓
Final Target Selection
```

The clinician's final decision is stored independently.

---

# 168. FINAL TARGET ENGINE PRINCIPLE

Magniom should not answer:

> “Where is the most abnormal part of this patient's brain?”

It should answer:

> **“Given what has credible TMS treatment evidence, what this specialist is trying to improve, how those therapeutic circuits are expressed in this patient, how reliable that measurement is, and what can actually be stimulated, which target hypotheses deserve consideration—and what evidence argues against each one?”**

That is a fundamentally different algorithm.

It prevents:

# imaging from outrunning evidence,

# mathematical precision from masquerading as biological certainty,

and:

# software ranking from becoming clinical prescription.

---

# 169. TARGET ENGINE MANIFESTO

# Evidence before optimisation.

# Clinical purpose before connectivity.

# Reliability before personalisation.

# Incremental value before displacement.

# Coverage before candidate count.

# Convergence before duplication.

# Alternatives before certainty.

# Abstention before false precision.

# Explanation before automation.

# Clinician judgement after every algorithmic conclusion.

That is the Magniom Target Engine & Ranking Algorithm Specification v1.0.