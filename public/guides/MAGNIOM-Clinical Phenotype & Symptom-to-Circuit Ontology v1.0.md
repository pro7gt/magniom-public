# MAGNIOM
## Clinical Phenotype & Symptom-to-Circuit Ontology v1.0

**Document status:** Canonical clinical-semantics specification  
**Date:** 1 September 2026  
**Initial Clinical Mode indication:** Major depressive disorder ± clinically significant anxiety/anxious distress  
**Primary purpose:** Convert clinical assessment into an immutable, structured, clinician-approved `PhenotypeSnapshot` that may safely drive Magniom circuit eligibility and target ranking.

**Depends on:**

- Magniom Clinical & Scientific Specification v1.0
- Magniom Canonical Target Data Specification v1.0
- Magniom Technical Architecture v1.0
- Magniom Supabase Database & Security Specification v1.0
- Magniom Target Engine & Ranking Algorithm Specification v1.0
- Magniom Neuroimaging & Functional Connectomics Pipeline Specification v1.0
- Magniom Evidence Knowledge Graph & Therapeutic Circuit Library v1.0

---

# 1. PURPOSE

The Clinical Phenotype Ontology defines exactly how Magniom represents:

- diagnosis;
- current depressive episode;
- symptom observations;
- standardized rating scales;
- symptom dimensions;
- functional impairment;
- patient goals;
- clinician treatment priorities;
- psychiatric and neurological comorbidity;
- treatment history;
- previous TMS exposure;
- safety-relevant clinical state;
- diagnostic uncertainty;
- symptom-to-circuit evidence;
- circuit eligibility;
- clinician approval.

Its output is the:

# `PhenotypeSnapshot`

used by the Target Engine.

The governing rule is:

> **Questionnaires measure symptoms. The ontology structures them. Evidence determines which symptom constructs can legitimately map to circuits. The clinician decides which clinical problems matter for this treatment course.**

---

# 2. WHY A PHENOTYPE LAYER IS NECESSARY

A diagnosis such as major depressive disorder is too coarse for Magniom's target-selection problem.

Two patients with the same diagnosis may differ substantially in:

- depressed mood;
- anhedonia;
- anxiety;
- somatic distress;
- rumination;
- sleep;
- motivation;
- cognition;
- suicidality;
- functional impairment.

Clinical trials increasingly show that symptom domains can differ in their response to TMS even when total depression scores improve. A 596-participant analysis across the THREE-D and CARTBIND trials found differential change across depression symptom clusters, with anxiety-related symptoms less responsive than several other clusters to standard left-DLPFC treatment.

Magniom therefore requires:

# diagnosis + dimensional phenotype.

But dimensional phenotyping must not become:

# speculative one-symptom-one-target neuromarketing.

---

# 3. CENTRAL SCIENTIFIC CONSTRAINT

Clinical Mode v1 recognises many symptom domains.

Only two are presently permitted to influence circuit-specific target selection:

# Dysphoric burden

and:

# Anxiosomatic burden.

The 2020 circuit-mapping study identified reproducible dysphoric and anxiosomatic symptom-response circuits across independent datasets; importantly, those clusters emerged from relationships between **symptom change and stimulation-site connectivity**, rather than simply clustering baseline symptom severity.

A 2026 randomized trial then prospectively found differential depression-versus-anxiety effects when stimulating the predicted dysphoric versus anxiosomatic targets in adults with MDD and clinically significant anxiety.

Therefore:

# baseline questionnaire totals must not be treated as direct circuit measurements.

---

# 4. ONTOLOGY LAYERS

Magniom separates six semantic layers:

```text
L0  Clinical source data
        ↓
L1  Symptom observations
        ↓
L2  Canonical symptom concepts
        ↓
L3  Clinical symptom domains
        ↓
L4  Clinician-approved therapeutic priorities
        ↓
L5  Evidence-permitted symptom-to-circuit mappings
        ↓
L6  Target Engine phenotype input
```

Each transition has different scientific meaning.

---

# 5. L0 — SOURCE DATA

Examples:

- clinician interview;
- psychiatric examination;
- BDI-II;
- MADRS;
- HAM-D;
- PHQ-9;
- BAI;
- GAD-7;
- WSAS;
- previous clinical records;
- patient-reported treatment history.

Every observation retains:

# provenance.

---

# 6. L1 — SYMPTOM OBSERVATION

A `SymptomObservation` means:

> A particular symptom was reported, measured or observed at a specified time.

It does **not** mean:

> This symptom belongs to a validated TMS circuit.

---

# 7. L2 — CANONICAL SYMPTOM CONCEPT

Different instruments often measure overlapping concepts using different wording.

Magniom therefore maps instrument items to canonical concepts such as:

```text
depressed_mood
loss_of_interest
loss_of_pleasure
low_motivation
anxiety_worry
somatic_anxiety
irritability
sleep_onset_difficulty
sleep_maintenance_difficulty
early_morning_waking
fatigue
psychomotor_slowing
psychomotor_agitation
concentration_difficulty
guilt
hopelessness
suicidal_ideation
appetite_change
sexual_interest_change
```

These concepts standardise clinical semantics.

They are not themselves targetable circuits.

---

# 8. L3 — CLINICAL DOMAINS

Canonical MDD phenotype domains:

```text
DEPRESSED_MOOD
ANHEDONIA_REWARD
MOTIVATION_INITIATION
ANXIETY_WORRY
SOMATIC_ANXIETY
RUMINATION
SLEEP
ENERGY_FATIGUE
COGNITION_EXECUTIVE
PSYCHOMOTOR
APPETITE_WEIGHT
SEXUAL_FUNCTION
GUILT_WORTHLESSNESS
SUICIDALITY
FUNCTION
QUALITY_OF_LIFE
```

Domains can overlap.

The ontology must not force every symptom into exactly one category.

---

# 9. L4 — THERAPEUTIC PRIORITY

A `TherapeuticPriority` represents:

> A clinician-approved problem that meaningfully matters in the current treatment course.

It is distinct from:

- symptom severity;
- questionnaire score;
- patient preference alone;
- algorithmic target relevance.

---

# 10. L5 — CIRCUIT-MAPPABLE DOMAIN

A domain becomes circuit-mappable only where the active Evidence Library contains an approved:

```text
SymptomDomain
→ EvidenceClaim
→ TherapeuticCircuit
```

path.

Clinical v1 permits:

```text
Dysphoric burden
    → TC-MDD-DYSPHORIC

Anxiosomatic burden
    → TC-MDD-ANXIOSOMATIC
```

No other direct symptom-to-circuit Clinical Mode mapping is permitted initially.

---

# 11. L6 — TARGET ENGINE INPUT

The Target Engine receives:

```text
approved clinical priorities
+
approved targetable domains
+
domain evidence status
+
phenotype confidence
+
external-validity annotations
```

It does not receive:

> an uncontrolled pile of questionnaire answers and infer a target.

---

# 12. CORE DOMAIN OBJECTS

The phenotype ontology defines:

```text
DiagnosisAssertion
EpisodeProfile
SymptomObservation
MeasurementInstrument
InstrumentAdministration
CanonicalSymptomConcept
SymptomDomain
DomainAssessment
FunctionalImpact
PatientGoal
TreatmentHistory
PriorTMSExposure
ComorbidityProfile
SafetyState
TherapeuticPriority
SymptomCircuitMapping
PhenotypeUncertainty
PhenotypeSnapshot
```

---

# 13. DIAGNOSIS ASSERTION

```ts
interface DiagnosisAssertion {
  id: string;

  concept: ClinicalConceptRef;

  status:
    | "confirmed"
    | "provisional"
    | "differential"
    | "historical"
    | "excluded";

  primary_for_current_case: boolean;

  asserted_by_clinician_id: string;

  asserted_at: string;

  source_refs: string[];

  confidence:
    | "high"
    | "moderate"
    | "low";

  notes?: string;
}
```

---

# 14. CLINICAL MODE DIAGNOSTIC GATE

Magniom Clinical Mode v1 requires:

```text
DiagnosisAssertion:
major depressive disorder / current major depressive episode
status = confirmed
```

before circuit-based target ranking.

RANZCP guidance similarly places rTMS treatment after detailed psychiatric assessment and identifies depression as its primary clinical indication.

Magniom does not diagnose the disorder.

---

# 15. EPISODE PROFILE

```ts
interface EpisodeProfile {
  onset_date?: string;

  duration_weeks?: number;

  recurrence:
    | "first_episode"
    | "recurrent"
    | "uncertain";

  severity:
    | "mild"
    | "moderate"
    | "severe"
    | "not_classified";

  psychotic_features:
    | "present"
    | "absent"
    | "uncertain";

  anxious_distress_clinical:
    | "present"
    | "absent"
    | "uncertain";

  remission_status:
    | "active_episode"
    | "partial_remission"
    | "remission";

  clinician_summary: string;
}
```

---

# 16. ANXIOUS DISTRESS ≠ ANXIOSOMATIC CIRCUIT

This distinction is mandatory.

A clinician may identify:

# anxious distress

as part of the depressive episode.

The TMS literature describes:

# an anxiosomatic symptom-response circuit.

These concepts overlap clinically but are not interchangeable.

Therefore the ontology must never encode:

```text
anxious_distress = anxiosomatic_circuit
```

automatically.

---

# 17. COMORBIDITY PROFILE

```ts
interface ComorbidityProfile {
  diagnoses: {
    concept: ClinicalConceptRef;

    status:
      | "confirmed"
      | "probable"
      | "possible"
      | "historical";

    active: boolean;

    relevance_to_current_targeting:
      | "major"
      | "moderate"
      | "minor"
      | "unknown";
  }[];

  clinician_interpretation: string;
}
```

---

# 18. IMPORTANT COMORBIDITIES

Clinical Mode should explicitly capture where relevant:

- anxiety disorders;
- OCD;
- PTSD;
- substance-use disorders;
- personality pathology;
- ADHD;
- chronic pain;
- neurological disorders;
- previous brain injury;
- epilepsy/seizure history.

These do not automatically activate other Magniom circuit modules.

---

# 19. BIPOLARITY

Possible bipolarity receives a dedicated structured state:

```ts
type BipolarityStatus =
  | "not_suspected"
  | "requires_review"
  | "bipolar_diagnosis_confirmed";
```

Magniom must not attempt to settle bipolarity by questionnaire algorithm.

If diagnostic uncertainty materially affects the indication:

# targeting may be deferred.

---

# 20. SYMPTOM OBSERVATION

```ts
interface SymptomObservation {
  id: string;

  case_id: string;

  concept: ClinicalConceptRef;

  source_type:
    | "clinician_interview"
    | "clinician_rating"
    | "patient_report"
    | "rating_scale"
    | "clinical_record";

  source_id?: string;

  severity?: number;

  severity_scale?: string;

  presence?:
    | "present"
    | "absent"
    | "uncertain";

  frequency?: string;

  duration?: string;

  functional_consequence?: string;

  quality_state: DataQualityState;

  observed_at: string;
}
```

---

# 21. RAW VALUES MUST BE PRESERVED

If a scale item is:

```text
2 / 3
```

Magniom stores:

- raw score;
- instrument;
- item ID;
- instrument version;
- administration date.

Any subsequent normalization is stored separately.

Never overwrite raw measurements with a normalized score.

---

# 22. MEASUREMENT INSTRUMENT

```ts
interface MeasurementInstrument {
  id: string;

  code: string;

  name: string;

  version?: string;

  instrument_type:
    | "clinician_rated"
    | "patient_reported"
    | "functional"
    | "quality_of_life";

  item_definitions: InstrumentItem[];

  scoring_method_version: string;

  licensing_metadata?: string;
}
```

---

# 23. V1 SUPPORTED INSTRUMENT FAMILIES

Recommended support includes:

### Depression

- MADRS
- HAM-D/HDRS
- BDI-II
- PHQ-9

### Anxiety

- BAI
- GAD-7

### Function

- WSAS

### Quality of life

- EQ-5D-5L or another organisation-approved measure.

Instrument availability does not imply that every instrument is validated for circuit selection.

---

# 24. CLINICIAN-RATED ANCHOR

For Magniom validation studies, a clinician-rated depression measure such as:

# MADRS

or:

# HAM-D

should normally provide a core severity anchor.

Patient-reported measurements complement rather than replace clinical assessment.

---

# 25. SCALE TOTALS

Scale totals may determine:

- baseline severity;
- treatment response;
- remission definitions;
- external validity relative to trials.

They should **not** directly determine:

# target location.

---

# 26. WHY TOTAL SCORES ARE INSUFFICIENT

Two patients can have identical depression totals while their symptom composition differs.

Furthermore, symptom-cluster studies suggest subdomains may respond differently to TMS despite similar total-score trajectories.

Therefore Magniom preserves:

# item-level data where licensing and workflow permit.

---

# 27. INSTRUMENT ADMINISTRATION

```ts
interface InstrumentAdministration {
  id: string;

  instrument_id: string;

  case_id: string;

  administered_at: string;

  administrator_type:
    | "clinician"
    | "patient"
    | "other";

  item_scores: {
    item_code: string;
    raw_score: number | string;
  }[];

  total_score?: number;

  validity_status:
    | "valid"
    | "incomplete"
    | "invalid";

  interpretation?: string;
}
```

---

# 28. CANONICAL SYMPTOM CONCEPT

```ts
interface CanonicalSymptomConcept {
  id: string;

  code: string;

  label: string;

  definition: string;

  parent_domains: string[];

  external_ontology_refs?: ClinicalConceptRef[];

  status: LifecycleStatus;
}
```

---

# 29. INSTRUMENT-TO-SYMPTOM MAPPING

An instrument item can map to:

```text
one or more canonical symptom concepts.
```

Example:

```text
sleep-change item
→ sleep disturbance
```

The mapping stores:

- instrument version;
- item code;
- canonical concept;
- mapping confidence;
- evidence/source.

---

# 30. NO SEMANTIC MAPPING BY ITEM NAME ALONE

An item called:

> “tiredness”

in one scale is not automatically equivalent to an item called:

> “low energy”

in another.

Mappings are curated.

---

# 31. SYMPTOM DOMAIN

```ts
interface SymptomDomain {
  id: string;

  code: string;

  name: string;

  description: string;

  member_concept_ids: string[];

  mode:
    | "clinical_descriptive"
    | "clinical_targetable"
    | "research";

  evidence_claim_ids?: string[];

  therapeutic_circuit_ids?: string[];

  version: string;
}
```

---

# 32. DOMAIN ASSESSMENT

```ts
interface DomainAssessment {
  symptom_domain_id: string;

  evidence_source_ids: string[];

  clinician_severity:
    | "none"
    | "mild"
    | "moderate"
    | "severe";

  functional_burden:
    | "none"
    | "mild"
    | "moderate"
    | "severe";

  persistence:
    | "intermittent"
    | "frequent"
    | "persistent"
    | "unknown";

  confidence: QualitativeConfidence;

  measurement_summary?: DomainMeasurementSummary;

  clinician_interpretation: string;
}
```

---

# 33. MEASUREMENT SUMMARY

```ts
interface DomainMeasurementSummary {
  supporting_observation_ids: string[];

  relevant_instrument_items: {
    instrument_id: string;
    item_codes: string[];
  }[];

  scale_totals?: {
    instrument_id: string;
    score: number;
  }[];

  derived_measurement_signal?: number;

  derivation_version?: string;
}
```

---

# 34. DERIVED MEASUREMENT SIGNAL

Magniom may eventually calculate a standardized domain signal from scale items.

However:

# Clinical v1 must not rely on such a signal as the final therapeutic-priority value.

The clinician remains responsible for confirming:

- domain presence;
- severity;
- relevance;
- treatment priority.

---

# 35. WHY AUTOMATIC LATENT SCORING IS DEFERRED

The original dysphoric/anxiosomatic circuit maps were derived from **patterns of symptom change relative to TMS site connectivity**, not a prospective diagnostic scoring instrument.

Therefore Magniom should not falsely convert:

```text
BDI items + BAI items
```

into:

```text
validated dysphoric circuit score = 0.82
```

without separate validation.

---

# 36. EVIDENCE-SEEDED SYMPTOM ANCHORS

The original 2020 study provides useful anchors for understanding the two constructs.

Examples of symptoms associated with the **dysphoric** cluster included:

- sadness/depressed mood;
- decreased interest/activities;
- suicidality.

Examples associated with the **anxiosomatic** cluster included:

- sleep change;
- irritability/worry;
- reduced sexual interest/libido.

The cluster structure was reproducible across BDI-based and Hamilton-based datasets.

These are:

# semantic anchors.

They are not a new Magniom diagnostic checklist.

---

# 37. DYSPHORIC DOMAIN

Canonical:

```text
DOMAIN-MDD-DYSPHORIC-001
```

Mode:

```text
clinical_targetable
```

Evidence Tier:

B for circuit-specific targeting.

---

# 38. DYSPHORIC DOMAIN CORE CONCEPTS

Initial high-confidence concepts:

```text
depressed_mood
loss_of_interest
loss_of_pleasure
reduced_positive_affect
```

Supporting contextual concepts may include:

```text
hopelessness
suicidal_ideation
low_motivation
```

but each requires careful interpretation.

---

# 39. SUICIDAL IDEATION INSIDE DYSPHORIC EVIDENCE

Suicidality appeared in the retrospective dysphoric cluster.

This does **not** make suicidality an independently targetable domain.

In Clinical Mode:

```text
suicidal_ideation
→ contributes to clinical risk assessment
→ may contribute descriptively to dysphoric phenotype
→ does not independently generate target.
```

---

# 40. ANXIOSOMATIC DOMAIN

Canonical:

```text
DOMAIN-MDD-ANXIOSOMATIC-001
```

Mode:

```text
clinical_targetable
```

Evidence Tier:

B.

---

# 41. ANXIOSOMATIC CORE CONCEPTS

Initial semantic anchors include:

```text
anxiety_worry
somatic_anxiety
irritability
sleep_disturbance
sexual_interest_change
```

These derive from the published symptom-cluster literature rather than from the label “anxiety” alone.

---

# 42. BAI TOTAL IS NOT THE ANXIOSOMATIC DOMAIN

The 2026 prospective trial required significant anxiety and used BAI outcome change, but this does not mean:

```text
BAI total = anxiosomatic circuit score.
```

The study enrolled adults aged 18–65 with MDD, BDI ≥20 and BAI ≥16 and tested the predicted dysphoric and anxiosomatic targets prospectively.

BAI therefore contributes:

- anxiety severity;
- trial-population similarity;
- treatment outcome measurement.

It does not define the circuit by itself.

---

# 43. EXTERNAL VALIDITY PROFILE

For every circuit-targetable domain:

```ts
interface CircuitExternalValidity {
  circuit_id: string;

  source_population_features: {
    age_range?: string;
    diagnosis?: string[];
    required_symptom_severity?: string[];
    comorbidity?: string[];
  };

  patient_similarity:
    | "high"
    | "moderate"
    | "limited"
    | "not_assessable";

  differences: string[];
}
```

---

# 44. TRIAL SIMILARITY ≠ ELIGIBILITY

A patient does not need to satisfy every inclusion criterion of a scientific RCT to receive clinically appropriate TMS.

The field exists to tell the clinician:

> how directly the supporting evidence applies.

It is not a hidden insurance rule.

---

# 45. OTHER CLINICAL DOMAINS

The ontology should actively represent:

### anhedonia/reward

### motivation/initiation

### rumination

### sleep

### cognitive/executive symptoms

### psychomotor change

### fatigue

### appetite

### guilt/worthlessness

### sexual functioning.

But initially:

```text
mode = clinical_descriptive
```

unless captured inside an approved dysphoric/anxiosomatic construct.

---

# 46. ANHEDONIA

Anhedonia is clinically important and strongly represented in the dysphoric circuit literature.

However Clinical v1 should map:

```text
anhedonia
→ supports dysphoric domain
```

rather than create:

```text
independent anhedonia target.
```

---

# 47. RUMINATION

Rumination may be highly salient clinically.

Clinical v1:

```text
DOMAIN-RUMINATION
mode = clinical_descriptive
```

No independent target is generated unless a future Evidence Library release establishes a validated treatment circuit.

---

# 48. COGNITION

Cognitive complaints may include:

- concentration;
- processing speed;
- working memory;
- executive dysfunction.

These influence:

- function;
- clinical formulation;
- outcome measurement.

They do not independently select a v1 TMS target.

---

# 49. SLEEP

Sleep disturbance can contribute to the published anxiosomatic construct.

But Magniom must not infer:

> severe insomnia → dorsomedial target

automatically.

The clinician evaluates whether sleep disturbance is part of the broader clinically meaningful anxiosomatic burden.

---

# 50. SOMATIC SYMPTOMS

Somatic distress can arise from:

- depression;
- anxiety;
- medication;
- pain;
- medical illness.

Therefore:

# symptom presence is not sufficient to establish circuit meaning.

Clinician interpretation is required.

---

# 51. FUNCTION

Clinical improvement is broader than symptom-score improvement.

Magniom explicitly models:

```text
work/study
social function
relationships
self-care
daily activity
cognitive function
physical activity
role participation
```

---

# 52. FUNCTIONAL IMPACT

```ts
interface FunctionalImpact {
  domain:
    | "work_study"
    | "social"
    | "relationships"
    | "self_care"
    | "daily_activity"
    | "cognitive"
    | "physical"
    | "other";

  severity:
    | "none"
    | "mild"
    | "moderate"
    | "severe";

  instrument_source?: string;

  clinician_summary?: string;
}
```

---

# 53. FUNCTION IS NOT CIRCUIT-MAPPED

Clinical v1 does not convert:

```text
unable to work
```

into:

```text
work network target.
```

Functional impact determines:

- clinical importance;
- outcome relevance;
- prioritisation.

Not direct brain localisation.

---

# 54. PATIENT GOALS

```ts
interface PatientGoal {
  id: string;

  description: string;

  functional_domain?: string;

  patient_priority:
    | 1 | 2 | 3 | 4 | 5;

  clinician_agrees_relevant: boolean;

  baseline_state?: string;

  desired_change?: string;
}
```

---

# 55. GOAL RULE

Patient goals help answer:

> What outcome would matter?

They do not answer:

> Which cortical target should be stimulated?

The clinician interprets the link between goals and symptom domains.

---

# 56. THERAPEUTIC PRIORITY

```ts
interface TherapeuticPriority {
  id: string;

  domain_id: string;

  priority_rank: number;

  clinician_weight: number;

  patient_priority?: number;

  rationale: string;

  evidence_mappability:
    | "direct"
    | "partial"
    | "none";

  approved_by_clinician_id: string;
}
```

---

# 57. CLINICIAN WEIGHT

Canonical range:

```text
0.0–1.0
```

Meaning:

# relative importance within the current treatment-planning problem.

It is not:

- disease severity;
- outcome probability;
- circuit confidence.

---

# 58. PRIORITY RANK

`priority_rank` expresses ordering:

```text
1 = highest
2 = next
...
```

A patient may have:

```text
Anxiosomatic burden — rank 1
Dysphoric burden — rank 2
Cognitive difficulty — rank 3
```

Only the first two currently have direct circuit mappings.

---

# 59. PATIENT PRIORITY VS CLINICIAN PRIORITY

Both are preserved.

Example:

Patient:

> Sleep is the main issue.

Clinician:

> Severe anxious depression is the principal treatment objective; sleep disturbance is one component.

The system does not erase either viewpoint.

The final Target Engine weight is clinician-approved.

---

# 60. CLINICIAN PRIORITY CANNOT BE SILENTLY OVERRIDDEN

Questionnaire changes cannot automatically modify:

```text
clinician_weight.
```

A new clinical review is required.

---

# 61. TREATMENT HISTORY

```ts
interface TreatmentHistoryEntry {
  id: string;

  treatment_type:
    | "medication"
    | "psychotherapy"
    | "tms"
    | "ect"
    | "ketamine"
    | "esketamine"
    | "other";

  treatment_name?: string;

  start_date?: string;
  end_date?: string;

  adequacy:
    | "adequate"
    | "inadequate"
    | "uncertain"
    | "not_applicable";

  adherence:
    | "good"
    | "partial"
    | "poor"
    | "unknown";

  response:
    | "remission"
    | "response"
    | "partial"
    | "none"
    | "worsened"
    | "unknown";

  tolerability?: string;

  domain_responses?: DomainTreatmentResponse[];

  source_quality: DataQualityState;
}
```

---

# 62. DOMAIN-SPECIFIC PRIOR RESPONSE

```ts
interface DomainTreatmentResponse {
  domain_id: string;

  response:
    | "marked_improvement"
    | "moderate_improvement"
    | "minimal_improvement"
    | "none"
    | "worsened";

  confidence: QualitativeConfidence;
}
```

This is useful particularly for prior TMS.

---

# 63. TREATMENT RESISTANCE

Magniom can store structured treatment history.

It should not independently make a legal/funding declaration such as:

> “Medicare treatment resistance criteria satisfied”

inside the target ontology.

Funding eligibility is a separate workflow.

---

# 64. PREVIOUS TMS

Prior TMS exposure deserves a dedicated object.

```ts
interface PriorTMSExposure {
  course_id: string;

  indication: ClinicalConceptRef;

  target_description?: string;

  target_coordinates?: SpatialCoordinate[];

  targeting_method?: string;

  protocol_description?: string;

  sessions?: number;

  outcome_summary?: string;

  domain_responses?: DomainTreatmentResponse[];

  tolerability?: string;

  source_quality: DataQualityState;
}
```

---

# 65. PRIOR TMS AS TARGETING INFORMATION

Previous TMS may be highly clinically relevant.

Example:

- clear response to a known left-DLPFC location;
- complete nonresponse despite adequate course;
- anxiety improved while dysphoria did not.

Clinical v1 should:

# expose this prominently to the clinician.

It should **not yet automatically reweight candidate rankings** unless that specific rule has been validated.

---

# 66. PRIOR POSITIVE RESPONSE

A previous positive response may justify:

- clinician selection;
- override;
- target preference.

The Target Engine can flag:

```text
PRIOR_POSITIVE_TARGET_HISTORY
```

but should not silently override current evidence/connectomics.

---

# 67. PRIOR NONRESPONSE

Likewise:

> previous nonresponse to target X

does not prove:

> target X is biologically wrong.

Possible reasons include:

- inadequate dose;
- adherence;
- protocol;
- episode differences;
- medication changes;
- targeting accuracy.

Therefore prior nonresponse becomes:

# clinical evidence for specialist interpretation,

not a hard exclusion.

---

# 68. SAFETY STATE

```ts
interface SafetyState {
  acute_suicide_risk_review_required: boolean;

  possible_mania_review_required: boolean;

  psychosis_review_required: boolean;

  catatonia_review_required: boolean;

  neurological_safety_review_required: boolean;

  seizure_risk_review_required: boolean;

  other_urgent_review_required: boolean;

  clinician_clearance_status:
    | "cleared"
    | "requires_review"
    | "deferred";
}
```

---

# 69. SAFETY IS NOT PHENOTYPE RANKING

Safety flags do not generate target scores.

They control whether routine target-generation workflow may proceed.

---

# 70. SUICIDALITY

Magniom records suicidality as a distinct clinical domain.

It must not autonomously classify emergency risk solely from one questionnaire item.

Instead:

```text
positive/relevant observation
→ clinician review workflow
→ clinician SafetyState.
```

---

# 71. MANIA / HYPOMANIA

Symptoms suggesting possible mania/hypomania may trigger:

```text
possible_mania_review_required = true
```

but diagnostic determination remains clinician-led.

---

# 72. PHENOTYPE UNCERTAINTY

```ts
interface PhenotypeUncertainty {
  diagnosis: QualitativeConfidence;

  symptom_measurement: QualitativeConfidence;

  domain_assignment: QualitativeConfidence;

  functional_assessment: QualitativeConfidence;

  treatment_history: QualitativeConfidence;

  therapeutic_priority: QualitativeConfidence;

  limiting_factors: string[];

  summary: string;
}
```

---

# 73. UNCERTAINTY EXAMPLES

### Measurement uncertainty

Patient completed only half the BDI.

### Diagnostic uncertainty

Possible bipolar spectrum illness under review.

### Domain uncertainty

Fatigue may reflect depression, medication or medical illness.

### Priority uncertainty

Patient and clinician have not yet agreed on principal treatment objective.

These are different problems.

---

# 74. CIRCUIT MAPPING

```ts
interface SymptomCircuitMapping {
  id: string;

  symptom_domain_id: string;

  therapeutic_circuit_id: string;

  evidence_claim_ids: string[];

  evidence_tier: EvidenceTier;

  mode:
    | "clinical"
    | "research";

  mapping_strength:
    | "direct"
    | "supportive"
    | "exploratory";

  population_constraints: string[];

  limitations: string[];

  version: string;
}
```

---

# 75. CLINICAL MAPPING 1

```text
DOMAIN-MDD-DYSPHORIC-001
       ↓ DIRECT
TC-MDD-DYSPHORIC-001
```

Evidence Tier:

# B.

---

# 76. CLINICAL MAPPING 2

```text
DOMAIN-MDD-ANXIOSOMATIC-001
       ↓ DIRECT
TC-MDD-ANXIOSOMATIC-001
```

Evidence Tier:

# B.

---

# 77. SUPPORTIVE MAPPING — DYSPHORIC TO ESTABLISHED DLPFC

Because the dysphoric target lies near conventional left-DLPFC depression targeting and the historical symptom-response literature supports greater dysphoric improvement near this region:

```text
DOMAIN-MDD-DYSPHORIC
→ TF-MDD-LDLPFC-EST
```

may be represented as:

```text
mapping_strength = supportive
```

not as a separate independent circuit claim.

---

# 78. NO DIRECT MAPPING — SLEEP

```text
DOMAIN-SLEEP
→ no standalone Clinical Circuit
```

Sleep observations may support the broader anxiosomatic formulation.

---

# 79. NO DIRECT MAPPING — SUICIDALITY

```text
DOMAIN-SUICIDALITY
→ no standalone Clinical Circuit
```

---

# 80. NO DIRECT MAPPING — COGNITION

```text
DOMAIN-COGNITION
→ no standalone Clinical Circuit
```

---

# 81. NO DIRECT MAPPING — RUMINATION

```text
DOMAIN-RUMINATION
→ no standalone Clinical Circuit
```

These can later change only through an Evidence Library release.

---

# 82. RESEARCH MAPPINGS

Research Mode may contain hypotheses such as:

```text
positive_affect
reward
rumination
cognitive_control
trait_anxiety
```

mapped to emerging circuits.

These must remain visibly:

# Research.

---

# 83. TRAIT ANXIETY CIRCUIT

The 2024 causal anxiety-network study provides an interesting transdiagnostic research pathway, including validation using lesion and TMS data, but even that work noted that the earlier anxiosomatic construct came from item-level clustering rather than a validated standalone anxiety scale.

Therefore:

```text
DOMAIN-ANXIETY
→ TC-ANXIETY-CAUSAL
```

remains Research Mode in Magniom v1.

---

# 84. PHENOTYPE SNAPSHOT

```ts
interface PhenotypeSnapshot {
  id: string;

  case_id: string;

  schema_version: string;

  primary_diagnosis: DiagnosisAssertion;

  episode_profile: EpisodeProfile;

  comorbidity_profile: ComorbidityProfile;

  symptom_observations: SymptomObservationRef[];

  instrument_administrations: InstrumentAdministrationRef[];

  domain_assessments: DomainAssessment[];

  functional_impacts: FunctionalImpact[];

  patient_goals: PatientGoal[];

  treatment_history: TreatmentHistoryEntry[];

  prior_tms: PriorTMSExposure[];

  therapeutic_priorities: TherapeuticPriority[];

  circuit_mappings: ApprovedCircuitMapping[];

  safety_state: SafetyState;

  uncertainty: PhenotypeUncertainty;

  clinician_summary: string;

  approved_by_clinician_id: string;

  approved_at: string;

  evidence_library_version: string;

  ontology_version: string;

  payload_sha256: string;
}
```

---

# 85. SNAPSHOT IS IMMUTABLE

Once approved:

# never edit it.

If:

- symptoms change;
- diagnosis changes;
- priorities change;
- new treatment history appears;

create:

# PhenotypeSnapshot v2.

---

# 86. WHY IMMUTABILITY MATTERS

The system must always answer:

> What exact phenotype caused Magniom to nominate this Target Slate?

Without an immutable snapshot, historical reasoning cannot be reconstructed.

---

# 87. SNAPSHOT APPROVAL

Only an authorised clinician may approve a Clinical Mode `PhenotypeSnapshot`.

Questionnaire completion alone cannot approve it.

---

# 88. SNAPSHOT STATES

```text
draft
ready_for_review
approved
superseded
```

Target Engine accepts only:

```text
approved.
```

---

# 89. TARGET ENGINE PHENOTYPE CONTRACT

The engine should receive a compact object:

```ts
interface TargetPhenotypeInput {
  indication: ClinicalConceptRef;

  approved_priorities: {
    domain_id: string;
    priority_rank: number;
    clinician_weight: number;
    evidence_mappability:
      | "direct"
      | "partial"
      | "none";
  }[];

  eligible_circuit_mappings: {
    domain_id: string;
    circuit_id: string;
    evidence_tier: EvidenceTier;
  }[];

  external_validity: CircuitExternalValidity[];

  phenotype_confidence: QualitativeConfidence;

  safety_clearance: boolean;
}
```

---

# 90. NO RAW SCALE INTERPRETATION INSIDE TARGET ENGINE

The Target Engine must not contain code such as:

```ts
if (BAI > 16) {
  chooseAnxiosomaticTarget();
}
```

That is prohibited.

---

# 91. CORRECT FLOW

Instead:

```text
BAI + interview + clinical assessment
        ↓
Anxiety/somatic symptom observations
        ↓
Clinician interpretation
        ↓
Anxiosomatic DomainAssessment
        ↓
TherapeuticPriority
        ↓
Approved PhenotypeSnapshot
        ↓
Target Engine
```

---

# 92. TRIAL POPULATION MATCH

BAI ≥16 may be stored as an external-validity feature because it characterised the prospective 2026 anxiosomatic/dysphoric RCT population.

It is not:

# Magniom's universal target threshold.

---

# 93. CIRCUIT ELIGIBILITY

For a domain-to-circuit mapping to become active:

```text
Diagnosis gate
AND
Domain present
AND
Clinician priority > 0
AND
Evidence path active
AND
Population not clearly incompatible
AND
Safety clearance
```

---

# 94. CIRCUIT MAPPING DOES NOT GUARANTEE SLATE INCLUSION

An active mapping means:

> This circuit may be considered.

The Target Engine still applies:

- evidence;
- connectome;
- reliability;
- redundancy;
- accessibility;
- clinical coverage.

---

# 95. DYSPHORIC ELIGIBILITY

Conceptually:

```text
confirmed MDD
+
clinician identifies meaningful dysphoric burden
+
dysphoric priority approved
+
Evidence Library includes active Tier B mapping
→ dysphoric circuit eligible.
```

---

# 96. ANXIOSOMATIC ELIGIBILITY

Conceptually:

```text
confirmed MDD
+
clinically meaningful anxiety/somatic burden
+
clinician judges anxiosomatic construct relevant
+
priority approved
+
Evidence Library mapping active
→ anxiosomatic circuit eligible.
```

---

# 97. MIXED PHENOTYPE

Most patients will not be purely dysphoric or anxiosomatic.

Example:

```text
Dysphoric:
weight 0.80

Anxiosomatic:
weight 1.00
```

Both mappings become eligible.

The Target Engine may produce two distinct hypotheses.

---

# 98. DOMAIN WEIGHTS

Weights must represent:

# current clinical importance.

Not certainty.

Example:

```text
dysphoric weight = 0.9
confidence = moderate
```

means:

important domain, but its measurement/formulation has some uncertainty.

---

# 99. DOMAIN PRIORITY NORMALIZATION

The Target Engine may normalise approved weights:

\[
W'_d =
\frac{W_d}{\sum W_d}
\]

for internal phenotype-coverage calculation.

The raw clinician weights remain stored.

---

# 100. MISSING DOMAIN

If a symptom domain was not assessed:

store:

```text
not_assessed
```

rather than:

```text
severity = 0.
```

Missingness must never masquerade as absence.

---

# 101. ABSENT DOMAIN

If explicitly assessed and absent:

```text
presence = absent
```

This is semantically different from missing.

---

# 102. TEMPORAL PHENOTYPE

Symptoms change.

Every observation has:

```text
observed_at.
```

The approved phenotype represents:

# the treatment-planning timepoint.

A target generated six months later may require a new phenotype review.

---

# 103. PHENOTYPE EXPIRY

Magniom should not hardcode a universal:

> phenotype valid for 30 days.

Instead the organisation/scientific policy can define:

```text
review_due
```

and require clinician confirmation if clinically material changes occur.

---

# 104. ACUTE STATE VS TRAIT

Where possible, distinguish:

```text
current_episode symptom
```

from:

```text
longstanding trait.
```

Example:

chronic anxiety predating depression may have different interpretation from anxiety emerging entirely within the depressive episode.

This contributes to external validity and clinician reasoning.

---

# 105. CAUSAL INTERPRETATION

Magniom must not automatically infer:

```text
symptom → circuit dysfunction.
```

The ontology only asserts:

> published treatment-response evidence links this symptom construct to differential response from stimulation of a particular circuit.

This is a more defensible statement.

---

# 106. CLINICAL SUMMARY

Every snapshot requires clinician-authored summary:

> What is the principal clinical formulation and what are the priorities for neuromodulation?

This prevents the phenotype from becoming only structured data without context.

---

# 107. STRUCTURED DATA DOES NOT REPLACE FORMULATION

The best ontology cannot capture every:

- temporal relationship;
- psychosocial factor;
- diagnostic nuance;
- clinical judgement.

Therefore Magniom combines:

# structured phenotype

with:

# clinician narrative.

The Target Engine uses structured fields only.

The clinician workspace shows both.

---

# 108. CLINICIAN WORKSPACE — PHENOTYPE

Recommended screen:

```text
┌─────────────────────────┬─────────────────────────────┐
│ CLINICAL PHENOTYPE      │ TREATMENT PRIORITIES        │
│                         │                             │
│ MDD — confirmed         │ 1. Anxiosomatic             │
│ Current episode         │ 2. Dysphoric                │
│ Severity                │ 3. Cognitive function       │
│ Comorbidity              │                             │
│ Safety                   │ Target-mappable: 2 / 3      │
└─────────────────────────┴─────────────────────────────┘
```

---

# 109. SYMPTOM VISUALISATION

Rather than one total score, show:

```text
Mood                  Severe
Anhedonia             Severe
Anxiety               Severe
Somatic anxiety       Moderate
Sleep                 Severe
Cognition             Moderate
Function              Severe
```

Then separately:

```text
Validated circuit constructs:

Dysphoric       High clinical priority
Anxiosomatic    Highest clinical priority
```

---

# 110. “TARGET-MAPPABLE” LABEL

The UI should visibly distinguish:

### Clinically important

from:

### Target-mappable with current evidence.

Example:

```text
Cognitive difficulty
Clinically important: Yes
Target-mappable: No
```

This is central to Magniom's scientific honesty.

---

# 111. EVIDENCE EXPLANATION

Clicking:

# Why is this domain target-mappable?

shows:

```text
Symptom construct
↓
Evidence Claim
↓
Therapeutic Circuit
↓
Prospective/retrospective evidence
↓
Limitations
```

---

# 112. ANXIOSOMATIC EXPLANATION EXAMPLE

> This clinical construct reflects anxiety/somatic symptom burden relevant to the symptom-specific TMS literature. The underlying circuit hypothesis originated from retrospective item-level treatment-response mapping and received prospective support in a 2026 randomized head-to-head study in adults with MDD and significant anxiety. It should not be interpreted as a universal target for all anxiety disorders.

---

# 113. DYSPHORIC EXPLANATION EXAMPLE

> This construct reflects depressive symptoms such as low mood and reduced interest that clustered with a distinct treatment-response circuit in retrospective TMS datasets. The circuit was subsequently included in prospective head-to-head testing.

---

# 114. CLINICIAN CONFIRMATION

Before approving a snapshot:

```text
☐ Diagnosis reviewed
☐ Current episode reviewed
☐ Rating scales reviewed
☐ Targetable domains reviewed
☐ Functional priorities reviewed
☐ Comorbidities reviewed
☐ Prior treatment reviewed
☐ Safety state reviewed
☐ Patient goals considered
```

Then:

# Approve Phenotype Snapshot.

---

# 115. NO AUTO-APPROVAL

Magniom must never approve a phenotype because:

```text
all mandatory forms are complete.
```

Completion is workflow state.

Approval is clinical judgement.

---

# 116. PHENOTYPE CHANGE AFTER TARGET GENERATION

If a clinically material phenotype field changes after a Target Slate is generated:

current Target Slate becomes:

# potentially stale.

Examples:

- diagnosis changes;
- anxiosomatic priority changes substantially;
- new previous-TMS response is discovered;
- safety clearance changes.

Generate a new snapshot and Target Slate.

---

# 117. MATERIAL VS NONMATERIAL CHANGE

Not every correction requires a new target generation.

Example:

typo in patient goal:

may be nonmaterial.

Change:

```text
anxiosomatic priority 0.2 → 1.0
```

is material.

The application should classify clinical-semantic changes explicitly.

---

# 118. PHENOTYPE CHANGE EVENT

Audit events:

```text
PHENOTYPE_DRAFT_CREATED
PHENOTYPE_DOMAIN_UPDATED
THERAPEUTIC_PRIORITY_UPDATED
PHENOTYPE_APPROVED
PHENOTYPE_SUPERSEDED
```

---

# 119. ONTOLOGY VERSIONING

The ontology itself has a release:

```text
MAGNIOM-PHENOTYPE-1.0.0
```

A PhenotypeSnapshot references the exact ontology release.

---

# 120. ONTOLOGY UPDATE

Adding a new descriptive symptom concept:

may be a minor change.

Adding:

```text
rumination → new Clinical TherapeuticCircuit
```

is a major scientific change requiring:

- Evidence Library update;
- Target Engine impact assessment;
- validation.

---

# 121. EXTERNAL ONTOLOGIES

Where licensing permits, Magniom may map concepts to:

- SNOMED CT;
- ICD-10/ICD-11;
- other controlled vocabularies.

Magniom internal codes remain canonical for algorithm stability.

---

# 122. INTERNAL CODE EXAMPLES

```text
MGP-DX-MDD
MGP-SYM-DEPRESSED-MOOD
MGP-SYM-ANHEDONIA
MGP-SYM-ANXIETY-WORRY
MGP-SYM-SOMATIC-ANXIETY
MGP-DOM-DYSPHORIC
MGP-DOM-ANXIOSOMATIC
MGP-DOM-FUNCTION
```

Codes never encode mutable evidence tiers.

---

# 123. DATABASE MAPPING

Additional database tables should include:

```text
clinical.diagnosis_assertions
clinical.episode_profiles
clinical.symptom_concepts
clinical.symptom_observations
clinical.instrument_definitions
clinical.instrument_items
clinical.instrument_administrations
clinical.instrument_item_scores
clinical.symptom_domains
clinical.domain_concepts
clinical.domain_assessments
clinical.functional_impacts
clinical.patient_goals
clinical.treatment_history
clinical.prior_tms_exposures
clinical.therapeutic_priorities
clinical.phenotype_snapshots

evidence.symptom_circuit_mappings
```

---

# 124. SCALE DEFINITIONS VS PATIENT SCORES

Instrument definitions are:

# versioned scientific/reference data.

Patient administrations are:

# clinical data.

Do not combine them in one mutable table.

---

# 125. COPYRIGHT / LICENSING

Instrument licensing must be respected.

Magniom may sometimes store:

- item identifier;
- item score;
- canonical concept mapping

without redistributing full copyrighted questionnaire wording.

Licensing status belongs in `MeasurementInstrument`.

---

# 126. DOMAIN CONCEPT TABLE

Conceptually:

```sql
clinical.domain_concepts
(
  symptom_domain_id,
  symptom_concept_id,
  relationship,
  mapping_version
)
```

Relationships:

```text
core
supporting
contextual
```

---

# 127. SYMPTOM-CIRCUIT TABLE

```text
evidence.symptom_circuit_mappings
```

contains:

```text
domain_version_id
circuit_version_id
evidence_tier
mode
mapping_strength
evidence_claim_ids
population_constraints
limitations
```

The Evidence Library release determines which version is active.

---

# 128. PHENOTYPE SNAPSHOT PAYLOAD

The canonical JSON snapshot should contain:

```text
diagnostic state
episode state
domain assessments
priorities
function
goals
treatment history summary
prior TMS
comorbidities
safety state
uncertainty
circuit mappings
```

It should reference rather than duplicate every raw scale response unnecessarily.

---

# 129. SNAPSHOT HASH

The approved payload is canonicalised and SHA-256 hashed.

Target Slate stores:

```text
phenotype_snapshot_id
phenotype_snapshot_hash.
```

---

# 130. PHENOTYPE VALIDATION — GOLDEN CASE 1

### Presentation

Severe low mood/anhedonia.

Minimal anxiety.

### Expected

Dysphoric:

high priority.

Anxiosomatic:

low/not active.

### Targetable circuits

Dysphoric + established depression circuit.

No separate anxiety target simply because insomnia is present.

---

# 131. GOLDEN CASE 2

### Presentation

MDD with prominent worry, autonomic anxiety and sleep disturbance plus moderate dysphoria.

### Expected

Anxiosomatic:

highest priority.

Dysphoric:

secondary.

Both mappings eligible.

---

# 132. GOLDEN CASE 3

### Presentation

Severe PHQ-9 total dominated by sleep, fatigue and concentration complaints in complex medical illness.

### Expected

No automatic anxiosomatic assignment.

Clinician must determine whether symptoms reflect:

- depression;
- anxiety;
- medical state.

Phenotype uncertainty may be moderate/high.

---

# 133. GOLDEN CASE 4

### Presentation

High BAI total with primary panic disorder; MDD uncertain.

### Expected

MDD Clinical Mode targeting does not activate automatically.

The MDD anxiosomatic circuit cannot be treated as a generic anxiety target.

---

# 134. GOLDEN CASE 5

### Presentation

MDD plus severe suicidal ideation.

### Expected

Suicidality recorded prominently.

Safety workflow activated.

No standalone suicide target generated.

---

# 135. GOLDEN CASE 6

### Presentation

MDD, major cognitive complaint, little anxiety.

### Expected

Cognitive domain clinically important.

Target-mappable:

No independent cognitive circuit in v1.

Dysphoric target may still be eligible based on broader phenotype.

---

# 136. GOLDEN CASE 7

### Presentation

Prior left-DLPFC TMS produced strong mood response but persistent anxiety.

### Expected

Prior response prominently exposed.

Dysphoric and anxiosomatic domains independently characterised.

No automatic algorithmic conclusion that previous target should be abandoned.

---

# 137. GOLDEN CASE 8

### Presentation

MDD and high anxiety scores, but clinician determines anxiety is largely situational and not a dominant treatment objective.

### Expected

Anxiosomatic clinician weight may remain low.

Questionnaire does not override clinical formulation.

---

# 138. GOLDEN CASE 9

### Presentation

Scale data missing.

High-quality detailed specialist interview available.

### Expected

Phenotype can still be approved if clinically adequate.

Measurement confidence may differ.

Magniom is not questionnaire-dependent.

---

# 139. GOLDEN CASE 10

### Presentation

Complete scales but diagnostic interview incomplete.

### Expected

Target generation blocked.

Data completeness does not equal diagnostic confirmation.

---

# 140. VALIDATION QUESTION 1

Do different clinicians assign the same:

- dysphoric construct;
- anxiosomatic construct;
- therapeutic priorities

from the same structured case?

Measure:

# inter-rater reliability.

---

# 141. VALIDATION QUESTION 2

Do approved phenotype priorities predict:

# symptom-specific outcome trajectories?

This tests whether the ontology captures clinically meaningful heterogeneity.

---

# 142. VALIDATION QUESTION 3

Does adding item-level data improve phenotype reliability relative to:

# total scores + interview?

This should be measured rather than assumed.

---

# 143. VALIDATION QUESTION 4

Does the phenotype-to-circuit mapping improve treatment decisions or outcomes compared with diagnosis-only targeting?

Ultimately this requires prospective evaluation.

---

# 144. VALIDATION QUESTION 5

Does circuit-specific targeting actually outperform simply treating the most severe clinical domain?

This is particularly important because:

# severity and treatment responsiveness are not the same thing.

---

# 145. INTER-RATER STUDY

Before clinical release, independent TMS clinicians should review standardized cases and assign:

- domain presence;
- severity;
- therapeutic priority;
- dysphoric/anxiosomatic relevance.

Measure:

- agreement;
- disagreement reasons;
- ontology ambiguity.

---

# 146. DISAGREEMENT IS VALUABLE DATA

If experts frequently disagree whether:

> severe insomnia belongs to clinically meaningful anxiosomatic burden,

the ontology should expose that uncertainty.

Do not solve ambiguous clinical constructs by adding hidden algorithmic rules.

---

# 147. PHENOTYPE CONFIDENCE

Overall phenotype confidence should initially use:

```text
high
moderate
low
```

based on structured factors such as:

- diagnostic confidence;
- measurement completeness;
- clinician domain confidence;
- consistency of sources.

It is not a probability.

---

# 148. LOW PHENOTYPE CONFIDENCE

If phenotype confidence is low:

Target Engine may still produce:

# evidence anchor

while suppressing or downgrading:

# symptom-specific targeting.

This mirrors the connectome reliability principle.

---

# 149. PHENOTYPE RELIABILITY AS A GATE

Future Scientific Policy may require:

```text
domain confidence ≥ moderate
```

before a Tier B symptom circuit can occupy Primary 2.

This should be validated.

---

# 150. TARGET ENGINE RELATIONSHIP

The phenotype system provides:

```text
WHAT matters clinically.
```

The Evidence Graph provides:

```text
WHICH circuits are scientifically eligible.
```

The Connectome provides:

```text
HOW those circuits appear in the patient.
```

The Target Engine combines them.

---

# 151. CANONICAL REASONING FLOW

```text
Psychiatric assessment
        ↓
Confirmed indication
        ↓
Symptoms measured / observed
        ↓
Canonical symptom concepts
        ↓
Clinical domains
        ↓
Functional consequences
        ↓
Patient goals
        ↓
Clinician treatment priorities
        ↓
Evidence-permitted domain→circuit mappings
        ↓
Approved PhenotypeSnapshot
        ↓
Target Engine
```

---

# 152. PROHIBITED RULES

Magniom Clinical Mode v1 must never encode:

> PHQ-9 ≥ X → target A.

> BAI ≥ X → anxiosomatic target.

> Insomnia → dorsomedial target.

> Anhedonia → unique anhedonia target.

> Suicidality → suicide circuit target.

> Highest symptom score → Primary 1.

> Patient goal → brain region.

> Questionnaire factor → clinical diagnosis.

> Anxiety disorder → MDD anxiosomatic circuit.

> Cognitive complaint → cognitive TMS target.

---

# 153. PERMITTED STATEMENTS

Magniom may state:

> The clinician has identified anxious/somatic symptoms as the highest treatment priority.

> The active Evidence Library contains prospective support for an anxiosomatic circuit target in adults with MDD and significant anxiety.

> The patient's phenotype is broadly similar to the population in that study.

> Cognitive impairment is clinically important but does not currently have an independently validated Clinical Mode target mapping.

> Patient-specific connectomics may now refine the eligible circuit targets.

---

# 154. PHENOTYPE ONTOLOGY SUCCESS CRITERION

For every Target Slate, Magniom must be able to answer:

# Why is this clinical domain important?

# Which observations support it?

# Which scales measured it?

# How much does it impair function?

# Does the patient consider it important?

# Does the clinician consider it a treatment priority?

# Is there an approved circuit mapping?

# How strong is that evidence?

# How similar is the patient to the supporting study population?

# What uncertainty remains?

If these cannot be reconstructed:

# the phenotype is not sufficiently governed.

---

# 155. SCIENTIFIC SAFETY PRINCIPLE

The phenotype ontology should make Magniom more conservative as clinical interpretation becomes less certain.

It must not turn more collected data into:

# artificial certainty.

More questionnaire items are useful only if their meaning remains clinically interpretable.

---

# 156. CANONICAL V1 TARGETABLE PHENOTYPE

The smallest scientifically defensible v1 phenotype is therefore:

```text
Confirmed MDD
+
current episode characterization
+
dysphoric burden
+
anxiosomatic burden
+
functional impairment
+
clinician-approved priorities
+
patient goals
+
treatment history
+
prior TMS
+
comorbidity
+
safety state
+
uncertainty
```

Only:

```text
dysphoric
anxiosomatic
```

currently receive direct symptom-to-circuit Clinical Mode mappings.

---

# 157. FINAL ONTOLOGY PRINCIPLE

Magniom should not ask:

> **“Which symptoms scored highest?”**

It should ask:

> **“What is clinically wrong for this patient, which aspects matter most in this treatment course, which of those aspects have credible circuit-specific TMS evidence, and how confident is the specialist in that formulation?”**

That is the correct phenotype layer for precision neuromodulation.

---

# 158. MAGNIOM PHENOTYPE MANIFESTO

# Diagnose before targeting.

# Preserve symptoms rather than only totals.

# Preserve function rather than only symptoms.

# Preserve patient goals without turning them into brain maps.

# Separate severity from treatment priority.

# Separate anxious distress from the anxiosomatic circuit.

# Separate clinical importance from targetability.

# Never make a questionnaire the prescriber.

# Never invent a circuit for an unmapped symptom.

# Make uncertainty visible.

# Freeze what the Target Engine actually saw.

# Let the clinician approve the phenotype before the connectome is allowed to personalise it.

That is the **Magniom Clinical Phenotype & Symptom-to-Circuit Ontology v1.0**.