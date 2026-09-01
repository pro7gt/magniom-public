# MAGNIOM
## Clinical & Scientific Specification v1.0

**Document status:** Canonical foundation draft  
**Date:** 1 September 2026  
**Initial clinical domain:** Major depressive disorder with or without clinically significant anxious distress  
**Primary purpose:** Connectome-informed TMS target decision support  
**Primary user:** Appropriately trained TMS specialist  
**Clinical output:** Ranked candidate-target slate for specialist review  
**Final treatment decision:** Human clinician only

---

# 1. EXECUTIVE DEFINITION

## 1.1 What Magniom is

**Magniom is a clinician-facing decision-support platform that synthesises clinical phenotype, published therapeutic-circuit evidence, patient-specific functional connectomics, target reliability and stimulation accessibility into an auditable ranked set of candidate cortical TMS targets.**

For each case, Magniom may nominate:

### Primary Candidate 1
The strongest evidence-anchored candidate.

### Primary Candidate 2
The strongest clinically distinct symptom-circuit candidate.

### Primary Candidate 3
The strongest defensible patient-specific connectome refinement.

### Additional Candidate A
An evidence-supported alternative that provides useful network, anatomical or targeting optionality.

### Additional Candidate B
A second evidence-supported alternative addressing uncertainty, another clinically important domain or a competing target hypothesis.

This is the:

# Magniom Target Slate

The target slate is **not a treatment prescription**.

The specialist may ultimately choose:

- one target
- two targets
- three targets
- another evidence-supported target
- standard non-connectomic targeting
- or no TMS target at all.

Magniom must never require that five targets be generated simply because the interface has five positions.

---

# 2. CORE PRODUCT CLAIM

The initial defensible claim for Magniom is:

> **Magniom synthesises clinical phenotype, published circuit evidence and individual functional connectomics into a ranked, source-verifiable set of candidate TMS targets for specialist review.**

Every target must show:

- why it was nominated
- what clinical objective it addresses
- what evidence supports it
- how the patient's connectome influenced it
- how reliable the imaging signal is
- how physically accessible the target is
- what competing target hypotheses exist
- what uncertainty remains

Magniom must not initially claim:

> “Magniom finds the optimal TMS target.”

“Optimal” requires prospective evidence demonstrating that Magniom-guided treatment improves clinical outcomes compared with an appropriate high-quality targeting strategy.

---

# 3. WHAT MAGNIOM IS NOT

Magniom is not:

- an autonomous psychiatric diagnostic system
- an autonomous TMS prescribing system
- an MRI diagnostic engine
- an automated indication-selection tool
- a replacement for psychiatric assessment
- a replacement for TMS safety assessment
- a replacement for clinician judgement
- an algorithm that turns every fMRI abnormality into a treatment target
- an algorithm that assumes personalised targeting is inherently superior
- an algorithm that automatically converts hypoconnectivity into iTBS
- an algorithm that automatically converts hyperconnectivity into cTBS
- a system that guarantees treatment response
- a system that assumes more targets are better
- a system that assumes abnormal connectivity is necessarily pathological or causal

---

# 4. SCIENTIFIC POSITION

Magniom is based on five propositions.

## Proposition 1

# TMS treatment effects depend partly on where stimulation is delivered.

This is sufficiently supported to form part of Magniom's scientific foundation.

---

## Proposition 2

# Therapeutically relevant cortical targets can be understood as accessible nodes of distributed brain circuits.

This concept is supported by converging lesion-network, DBS, TMS and functional-connectivity research.

---

## Proposition 3

# Different symptom dimensions may respond preferentially to different circuits.

Siddiqi and colleagues identified reproducible dysphoric and anxiosomatic treatment circuits retrospectively in 2020. A 2026 prospective randomized head-to-head trial of 40 participants subsequently found differential symptom effects in the predicted direction, including greater anxiety improvement from the anxiosomatic/dorsomedial target.

This is promising prospective support.

It is not yet a complete transdiagnostic atlas of symptoms.

---

## Proposition 4

# Individual functional anatomy varies enough that subject-specific targeting may sometimes materially alter the stimulation site.

This is supported by substantial interindividual differences in functional-connectivity-defined targets.

A recent randomized study using 41 minutes of multiecho resting-state imaging reported a mean within-person split-half target difference of approximately 4.47 mm compared with substantially greater between-person differences.

---

## Proposition 5

# Personalisation does not automatically improve clinical outcomes.

This principle is essential.

A 2025 meta-analysis of ten randomized active-controlled trials involving 647 participants found no overall evidence that personalised rTMS was superior to fixed targeting.

BRIGhTMIND randomized 255 participants across five centres and found no efficacy advantage of connectivity-guided iTBS over MRI-neuronavigated standard F3 rTMS over 26 weeks.

In contrast, smaller 2026 randomized studies have reported advantages for selected connectivity or structural-connectivity targeting strategies, demonstrating that the scientific question is increasingly becoming **which targeting algorithm, circuit, acquisition and treatment protocol works**, rather than whether anything described as “personalised TMS” is intrinsically superior.

---

# 5. CURRENT SCIENTIFIC BASELINE

## 5.1 Established depression TMS

Current Australian professional guidance identifies depression as the primary clinical indication for rTMS and describes a robust evidence base of randomized sham-controlled trials and evidence syntheses.

Magniom therefore begins from:

# an established treatment indication

rather than attempting to create a new indication from imaging.

---

# 6. STANFORD / SNT / SAINT CONTRIBUTION

The Stanford approach represents one of the strongest demonstrations that individual functional connectivity can participate in a clinically successful treatment architecture.

The SNT randomized trial used rs-fMRI to identify, for each participant, a left-DLPFC region with strong negative connectivity to the subgenual anterior cingulate cortex.

In the randomized trial, 29 participants received active or sham treatment; mean MADRS reduction four weeks after treatment was 52.5% with active treatment versus 11.1% with sham.

However, SNT simultaneously combines:

- individual connectivity targeting
- very high treatment dose
- accelerated scheduling
- iTBS
- a specific intersession interval

Therefore:

# the trial validates the treatment package more strongly than it isolates the independent causal contribution of personalised targeting.

Magniom must preserve this distinction.

---

# 7. FOX / SIDDIQI CIRCUIT CONTRIBUTION

This work is central to Magniom.

The 2020 symptom-specific circuit study identified two reproducible treatment networks:

### Dysphoric circuit

Associated with improvement in symptoms such as:

- sadness
- loss of interest
- related depressive symptoms

with an accessible target close to conventional left DLPFC.

### Anxiosomatic circuit

Associated with improvement in:

- anxiety
- somatic symptoms
- related symptom dimensions

with a more dorsomedial prefrontal accessible target.

The maps replicated across datasets and predicted differential symptom response.

The 2026 prospective trial directly tested these hypotheses.

Participants with both significant depression and anxiety were randomized to:

**dysphoric circuit target:** approximately MNI `[-32, 44, 34]`

or

**anxiosomatic circuit target:** approximately MNI `[0, 48, 46]`.

Both groups showed substantial depression improvement, while the anxiosomatic target produced significantly greater anxiety improvement.

This constitutes the strongest initial scientific basis for Magniom's:

# clinical phenotype → therapeutic circuit

layer.

---

# 8. CONVERGENT DEPRESSION CIRCUIT

Network-mapping studies have demonstrated convergence among sites where lesions, stimulation and other interventions affect depressive symptoms.

This supports the concept that depression-related neuromodulation can be understood through a distributed therapeutic circuit rather than one universal stereotactic coordinate.

The recent connectivity-vs-scalp randomized trial operationalised this concept by selecting the left-DLPFC location most connected to a published convergent depression circuit rather than using Beam F3.

Forty participants were randomized.

Connectivity-guided targeting produced greater MADRS improvement at one month than scalp-based targeting, although the authors appropriately describe this as requiring confirmatory efficacy testing.

Magniom should therefore model:

# therapeutic circuit concordance

rather than sgACC anticorrelation alone.

---

# 9. CINGULUM HEALTH CONTRIBUTION

Cingulum Health has produced one of the closest published models to Magniom's broader multi-target concept.

Its published framework uses individual T1 and resting-state fMRI to construct a personalised functional-connectivity model.

The published depression pipeline extracted signals from 377 regions:

- 180 HCP-MMP cortical parcels per hemisphere
- 17 subcortical structures

producing 142,129 correlations.

These were compared against tangent-space connectivity from 200 healthy reference subjects.

Connectivity values outside three standard deviations of the reference distribution were classified as anomalous after excluding the highest-variance third of connectivity pairs.

Cingulum then examined anomalies within networks considered relevant to the patient's presentation.

Its depression cohort commonly used up to three sequential targets and excluded targets deeper than 30 mm from the scalp for the treatment coil being used.

The published MDD cohort comprised 26 patients; 62% met the study remission criterion immediately after treatment. However, the study was retrospective, uncontrolled and explicitly described as proof-of-concept.

The larger 2025 safety analysis included 165 unique patients and 202 target sets and found no serious adverse events; fatigue, muscle twitching, headache and discomfort were the most frequent transient effects.

Cingulum therefore provides important evidence for:

- feasibility
- multi-parcel thinking
- personalised functional-connectivity analysis
- targeting outside conventional DLPFC locations
- multi-target accelerated treatment
- tolerability

It does **not yet establish that abnormal-connectivity-driven multi-target stimulation is superior to high-quality standard targeting**.

Magniom must therefore incorporate Cingulum's work as:

# an important hypothesis-generating and feasibility layer

rather than reproduce its anomaly-selection rules as established clinical truth.

---

# 10. CINGULUM RULE THAT MAGNIOM MUST NOT AUTOMATE

The published Cingulum method generally selected cTBS for hyperconnected regions and iTBS for hypoconnected regions.

Magniom v1 must **not** automatically implement:

> hyperconnected = inhibit

or

> hypoconnected = excite.

The excitatory/inhibitory heuristic for iTBS and cTBS derives heavily from motor-cortex physiology.

Its translation into non-motor networks is insufficiently deterministic to justify automatic patient-specific protocol prescription.

Therefore:

# target selection and stimulation protocol selection are separate clinical decisions.

Magniom may display protocols used in supporting research.

It must not infer stimulation direction simply from the sign of a functional-connectivity deviation.

---

# 11. PERSONALISED TARGETING: CURRENT CONFLICTING EVIDENCE

The scientific baseline must remain visible inside the product.

### Evidence favouring personalisation

The SNT package demonstrates efficacy using individualized sgACC-connected targets.

A 2026 randomized study of 40 participants found improved antidepressant outcomes from connectivity-guided targeting of a convergent depression circuit compared with Beam F3.

A separate 2026 randomized three-arm study of 123 participants found structural-connectivity targeting superior to a 5-cm approach at two weeks, with both structural- and functional-connectivity groups superior at six weeks, although differences were no longer significant at twelve weeks.

### Evidence requiring caution

BRIGhTMIND found no clinical superiority for connectivity-guided iTBS versus MRI-neuronavigated F3 rTMS across 255 participants.

The 2025 personalised-rTMS meta-analysis found no overall superiority of personalised versus fixed approaches.

Therefore Magniom adopts this principle:

# personalised connectivity is evidence that may refine target selection—not proof that a refined target is clinically superior.

---

# 12. FIRST CLINICAL SCOPE

## Magniom Clinical Mode v1.0

The initial validated scope should be restricted to:

# adults with clinician-confirmed major depressive disorder, with or without significant anxious distress, for whom an appropriately trained specialist has already determined that TMS is a reasonable treatment option.

Magniom does not decide whether the patient “has treatment-resistant depression”.

Magniom does not decide whether TMS should replace:

- medication
- psychotherapy
- ECT
- another treatment.

These decisions precede target nomination.

---

# 13. OUT-OF-SCOPE CONDITIONS FOR CLINICAL MODE v1

The following may be recorded but must not drive routine target recommendations in v1:

- OCD
- PTSD
- bipolar depression
- schizophrenia
- chronic pain
- stroke
- brain injury
- tinnitus
- substance-use disorders
- neurodegenerative disorders
- paediatric depression

These may later receive their own separately validated Magniom indication modules.

They must not inherit the MDD targeting model.

---

# 14. RESEARCH MODE

Magniom should contain a physically and visually separated:

# Research Mode

Research Mode may allow investigation of:

- exploratory parcels
- Cingulum-style network anomalies
- alternative atlases
- novel symptom circuits
- non-depression indications
- effective-connectivity approaches
- structural connectivity
- experimental biomarkers
- multi-target hypotheses

Research Mode outputs must never appear indistinguishably from Clinical Mode outputs.

Every research candidate must display:

# RESEARCH HYPOTHESIS — NOT A VALIDATED CLINICAL TARGET RECOMMENDATION

---

# 15. CLINICAL ENTRY GATE

No target calculation should begin until the specialist confirms:

### Diagnosis established

Major depressive disorder / current major depressive episode sufficiently established.

### TMS clinically appropriate

Decision made independently of Magniom.

### Clinical priority defined

What is the primary therapeutic objective?

### Safety assessment performed

Standard TMS safety assessment remains outside the target engine.

### Imaging appropriate

Functional-connectomics MRI is clinically/research justified and available.

---

# 16. SAFETY ESCALATION

Magniom is not an emergency decision system.

Where the clinician records:

- immediate suicide risk
- psychosis
- catatonia
- probable mania
- severe clinical instability

Magniom should prominently display:

# TARGET NOMINATION DEFERRED — URGENT CLINICAL PRIORITY REQUIRES REVIEW

This is not necessarily an assertion that TMS can never be used.

It means routine personalised target selection is not the primary decision at that moment.

---

# 17. CLINICAL PHENOTYPE MODEL

Magniom must not reduce a patient to a diagnosis.

The clinical phenotype should contain four layers:

# Diagnosis → Symptom dimensions → Functional impact → Treatment priorities

---

# 18. DIAGNOSIS LAYER

Required:

**Primary diagnosis**

**Current episode**

**Severity**

**Duration**

**previous episode history**

**treatment history**

**possible bipolarity**

**psychotic features**

**major psychiatric comorbidity**

**relevant neurological history**

---

# 19. SYMPTOM LAYER

Magniom should record symptoms individually rather than only storing a total depression score.

However:

# only symptom dimensions with sufficient circuit evidence may influence target ranking.

Clinical Mode v1 initially permits two circuit-relevant phenotypic families:

## Dysphoric burden

Broadly reflecting the validated depression-related circuit literature.

## Anxiosomatic burden

Reflecting the distinct anxiety/somatic circuit literature.

Other symptoms remain clinically important but initially act as:

**descriptive variables**

rather than independently validated TMS target selectors.

---

# 20. STANDARDIZED MEASURES

Magniom should support structured baseline measurement using validated instruments.

Recommended minimum clinical dataset:

### Depression severity

MADRS or HAM-D as clinician-rated anchor where available.

### Patient-reported depressive symptoms

BDI-II and/or PHQ-9.

### Anxiety

BAI and/or GAD-7.

### Function

Work and Social Adjustment Scale or comparable validated functional measure.

### Quality of life

EQ-5D-5L or comparable instrument where appropriate.

### Individual treatment goal

One to three clinician-reviewed functional goals.

The exact instrument set must be frozen for each validation study.

---

# 21. PHENOTYPE TARGET WEIGHTING

Magniom must distinguish:

### Severity

How intense is the symptom?

### Disability

How much does it interfere with life?

### Treatment priority

How important is changing it in this treatment course?

A severe symptom is not necessarily the highest therapeutic priority.

Therefore each phenotype domain may carry:

**severity**

**functional burden**

**specialist priority**

**patient priority**

and

**measurement confidence.**

---

# 22. HIGH-RISK SYMPTOMS

Suicidal ideation may be recorded and monitored.

It must not initially be used as a standalone automated circuit-target selection variable.

It influences:

- safety
- urgency
- clinical management
- outcome monitoring

not:

# “suicide target selection”.

---

# 23. FUNCTIONAL GOALS

Every Magniom assessment should define meaningful treatment goals.

Examples:

**return to work**

**restore initiation**

**reduce avoidance**

**improve cognitive endurance**

**resume social engagement**

These goals should contribute to clinical prioritisation.

They should not be mapped to arbitrary brain circuits without validated evidence.

---

# 24. EVIDENCE KNOWLEDGE MODEL

Every candidate target must originate from a version-controlled evidence structure.

The canonical relationship is:

# Clinical condition → symptom domain → therapeutic circuit → accessible cortical target → TMS protocol evidence → clinical outcome

Each relationship carries evidence provenance.

---

# 25. EVIDENCE TIERS

## Tier A — Established clinical target family

Requires strong clinical evidence supporting the relevant TMS indication and target family.

Example:

established left-prefrontal depression targeting.

Eligible for:

**Primary 1**

---

## Tier B — Prospectively supported circuit target

Requires prospective clinical evidence that stimulating this circuit/target influences the predicted clinical domain.

Examples in v1:

**dysphoric circuit target**

**anxiosomatic circuit target**

given the 2026 prospective head-to-head trial.

Eligible for:

**Primary 1–3**

---

## Tier C — Replicated retrospective / observational circuit evidence

Strong mechanistic or replicated observational evidence but insufficient prospective validation.

Eligible for:

**additional candidate**

or

**primary connectome refinement only when nested within a Tier A/B therapeutic circuit**

---

## Tier D — Proof-of-concept

Examples include many individual Cingulum parcel associations.

Clinical Mode:

# explanatory only

Research Mode:

candidate generation permitted.

---

## Tier R — Research hypothesis

Mechanistic, biomarker or exploratory finding without sufficient clinical outcome evidence.

Research Mode only.

---

# 26. EVIDENCE CEILING PRINCIPLE

A target's final clinical status cannot exceed its evidence tier.

Example:

A Tier D parcel with:

**extreme individual abnormality**

**excellent MRI reliability**

and

**ideal E-field engagement**

does not become a Tier A target.

The connectome can increase confidence that:

# this patient expresses the relevant feature.

It cannot manufacture clinical efficacy evidence that does not exist.

---

# 27. TARGET TERMINOLOGY

Magniom should use four separate terms.

## Therapeutic Circuit

A distributed brain network associated with a treatment effect.

## Target Family

A cortical region or class of locations through which the circuit may be stimulated.

## Candidate Target

A specific patient-level cortical location proposed for specialist consideration.

## Prescribed Target

The location ultimately selected by the treating specialist.

These must never be treated as synonyms.

---

# 28. MAGNIOM TARGET SLATE ROLES

## Primary 1 — Evidence Anchor

The most clinically defensible target for the principal indication.

This target ensures that personalisation does not pull treatment away from the strongest clinical evidence without a justified reason.

---

## Primary 2 — Symptom Circuit Candidate

A target addressing a clinically important symptom domain supported by target-level or circuit-level evidence.

For v1 this principally concerns:

**dysphoric**

versus

**anxiosomatic**

treatment objectives.

---

## Primary 3 — Connectome Refinement Candidate

The most compelling patient-specific target within an evidence-supported therapeutic circuit.

This is where individual functional connectivity has the greatest direct influence.

It may coincide with Primary 1 or 2.

If so, Magniom should report:

# convergence

rather than invent another distinct target.

---

## Additional A — Network Alternative

A credible alternative location within the same or related therapeutic circuit.

Useful where:

- anatomy is difficult
- E-field is less favourable
- connectivity reliability is imperfect
- multiple target definitions disagree

---

## Additional B — Clinical Alternative

Another evidence-supported target hypothesis for an important secondary clinical objective.

If no defensible candidate exists:

# leave the position empty.

---

# 29. CONVERGENCE OVER QUANTITY

If all three evidence systems nominate essentially the same cortical region:

**standard evidence**

**symptom circuit**

**individual connectome**

Magniom should report:

# HIGH TARGET CONVERGENCE

not generate three nearby coordinates to fill three primary positions.

A valid slate might therefore contain:

**Primary 1 only**

plus two alternatives.

This is scientifically preferable to artificial target multiplicity.

---

# 30. CONNECTOME ROLE

The connectome has four permitted clinical functions.

### 1. Refine

Choose among plausible locations within an evidence-supported cortical target family.

### 2. Rerank

Increase or decrease the priority of otherwise defensible target candidates.

### 3. Characterise

Describe patient-specific circuit anatomy and connectivity.

### 4. Reduce confidence

Reveal instability, absence of the expected network relationship or contradictory individual anatomy.

The connectome must not automatically:

# create an indication.

---

# 31. RESTING-STATE FUNCTIONAL MRI

Magniom Clinical Mode v1 uses:

# resting-state BOLD functional MRI

as its primary connectomic modality.

Structural MRI is required for:

- anatomy
- surface reconstruction
- registration
- target localisation
- neuronavigation

Diffusion/structural connectomics should be architecturally supported but introduced as a separately validated modality.

This is particularly important because recent randomized work suggests structural-connectivity targeting may also have therapeutic value.

---

# 32. MRI ACQUISITION PRINCIPLE

Personalised targeting is only meaningful if the individual measurement is sufficiently reliable.

Historical approaches vary substantially.

Cingulum's published depression acquisition used an 8-minute rs-fMRI run.

A 2026 analysis of SNT-style targeting found target stability no longer improved significantly after approximately 12 minutes in the datasets studied.

A separate 2024 computational-reproducibility analysis found approximately 28 minutes plus spatial clustering was required to achieve within-person target stability below approximately 1 cm in its model.

The 2026 positive connectivity-targeting RCT used a 41-minute multiecho acquisition and reported excellent split-half reproducibility.

Therefore Magniom should initially adopt a deliberately conservative acquisition strategy.

---

# 33. PROVISIONAL MAGNIOM RS-FMRI ACQUISITION STANDARD

For validation and early clinical research:

### Scanner

3 Tesla preferred.

### Structural T1

Approximately 1 mm isotropic or better.

### Resting state

Prefer:

# two independently analysable runs totalling approximately 24–30 minutes of acquired resting-state data.

This is a **provisional Magniom standard**, not a claim that 24 minutes is scientifically proven to be universally optimal.

The purpose is to permit:

- cross-run reliability
- split-half testing
- motion-resilient usable duration
- target stability estimation

### Hard clinical-quality threshold

A case should not receive strong individual-FC weighting unless a predefined minimum amount of high-quality usable data remains after censoring.

The exact threshold must be validated rather than permanently assumed.

A reasonable starting validation hypothesis is:

# ≥12 minutes usable after QC as a minimum, with longer acquisition preferred.

---

# 34. RESTING-STATE CONDITION

Magniom studies must use a standardised acquisition state.

For example:

**eyes open with fixation**

or

**eyes closed**

but not an uncontrolled mixture.

The chosen state must be:

- documented
- standardised
- represented in the normative model
- unchanged within a validation cohort

---

# 35. CONNECTOME QUALITY GATE

Before any target ranking, Magniom must display:

# CONNECTOME QUALITY: PASS / CONDITIONAL / FAIL

Metrics should include:

- usable duration
- mean framewise displacement
- censored volume proportion
- DVARS
- registration quality
- segmentation quality
- signal dropout
- whole-brain coverage
- parcel coverage
- temporal signal quality
- cross-run consistency
- split-half target stability

---

# 36. CONNECTOME FAILURE

If QC fails:

Magniom must not fabricate precision.

Output:

# PATIENT-SPECIFIC CONNECTIVITY TARGETING UNAVAILABLE

Then offer:

**Evidence-based anatomical / circuit target pathway**

or:

**Repeat imaging**

according to clinician judgement.

This is a core product requirement.

---

# 37. PREPROCESSING IMMUTABILITY

The preprocessing pipeline must be:

- frozen
- versioned
- validated
- reproducible

A 2026 study demonstrated that different preprocessing pipelines shifted SNT-style target coordinates by mean Euclidean distances of approximately 1.45–3.82 cm across cohorts, with individual deviations reaching 6.14 cm.

This magnitude is clinically material.

Therefore every Magniom candidate must store:

**pipeline name**

**pipeline version**

**denoising strategy**

**motion strategy**

**temporal filtering**

**smoothing**

**global signal handling**

**registration method**

**atlas version**

**software versions**

---

# 38. NO SILENT PIPELINE CHANGES

Changing:

- smoothing
- denoising
- atlas
- nuisance regression
- global signal strategy
- registration
- target-search algorithm

creates a new:

# Magniom Target Engine Version

Existing targets may not be silently recalculated.

---

# 39. PIPELINE SENSITIVITY

A future advanced Magniom feature should calculate:

# Pipeline Sensitivity Index

using predefined validated secondary processing configurations.

Example:

Primary pipeline target:

`[-38, 42, 32]`

Sensitivity pipeline:

`[-27, 46, 28]`

Distance:

`12.5 mm`

Interpretation:

# localisation depends materially on preprocessing assumptions.

This should reduce confidence.

It should never lead to post-hoc selection of whichever pipeline gives the most clinically attractive coordinate.

---

# 40. PRIMARY PARCELLATION

The preferred initial cortical framework is:

# HCP-MMP1.0

This has several advantages:

- neuroanatomically meaningful cortical parcels
- substantial scientific use
- precedent within the Cingulum framework
- relevant prefrontal subdivisions
- compatibility with parcel-level analysis

Cingulum's use of the same 360 cortical parcels plus 17 subcortical structures provides useful operational precedent.

---

# 41. ATLAS UNCERTAINTY

A target should not be considered biologically precise simply because an atlas provides a precise boundary.

Magniom should eventually support:

# Cross-Atlas Concordance

For example:

HCP-MMP target

versus

Schaefer/network-based representation.

If target identity depends strongly on an arbitrary parcellation boundary:

confidence should decrease.

---

# 42. FUNCTIONAL CONNECTIVITY REPRESENTATIONS

Magniom should retain several distinct representations.

### Whole-brain FC

General connectome.

### Therapeutic-circuit FC

Connectivity between candidate cortical sites and predefined therapeutic circuits.

### Seed-based FC

Examples:

DLPFC ↔ sgACC.

### Network-level FC

Examples:

CEN  
DMN  
salience network.

### Parcel-pair FC

Useful for anomaly analysis.

### Normative deviation

How unusual is the patient's measured relationship relative to reference data?

These should not be collapsed prematurely into one number.

---

# 43. SGACC CONNECTIVITY

Negative connectivity between prefrontal stimulation sites and sgACC has substantial historical and clinical-targeting relevance.

Magniom should calculate it.

However:

# sgACC anticorrelation must not become the sole definition of a good depression target.

Why?

Because contemporary data support:

- broader convergent circuits
- symptom-specific circuits
- structural connectivity
- alternative effective-connectivity models
- mixed results from different sgACC-related targeting approaches

Magniom should treat sgACC FC as an important feature within a larger evidence model.

---

# 44. CONVERGENT DEPRESSION CIRCUIT SCORE

For each candidate cortical site, Magniom should calculate:

# Patient-Specific Therapeutic Circuit Concordance

This asks:

> How strongly does this patient's individual connectivity from the candidate site align with the externally derived therapeutic depression circuit?

This differs from:

# normative abnormality.

A patient's most abnormal parcel is not necessarily their best therapeutic target.

---

# 45. NORMATIVE CONNECTIVITY MODEL

Magniom may calculate deviations from a normative reference connectome.

However the normative architecture must be stronger than simply pooling unrelated public datasets.

Requirements should include:

- known acquisition characteristics
- harmonised processing
- scanner/site modelling
- quality criteria
- sufficient sample size
- age coverage
- demographic representation
- model versioning

A large reference cohort is strongly preferable.

---

# 46. NORMATIVE DEVIATION

For every connection retain:

# continuous deviation

such as:

`z = -3.4`

rather than immediately converting it into:

`abnormal = true`.

Cingulum's three-sigma method provides a highly interpretable proof-of-concept.

Magniom should retain the continuous measurement and allow thresholds to be:

- evidence-derived
- versioned
- tested prospectively.

---

# 47. ABNORMALITY DOES NOT EQUAL TARGET

Magniom must explicitly encode:

# unusual ≠ causal

# causal ≠ therapeutically accessible

# accessible ≠ evidence-supported

# evidence-supported ≠ optimal for this patient

This prevents the anomaly matrix from becoming the entire clinical model.

---

# 48. CONNECTIVITY DIRECTION

Magniom must preserve the measured direction and magnitude of connectivity.

However it must not assume:

**positive = pathological**

or

**negative = healthy**

without circuit-specific evidence.

Functional connectivity is context-dependent.

---

# 49. TARGET RELIABILITY ENGINE

Every patient-specific candidate must receive an independent:

# Target Reliability Profile

This should include at least:

### Cross-run spatial stability

How far apart are independently calculated coordinates?

### Split-half stability

How stable is the location using different halves of the available data?

### Connectivity reliability

How reproducible is the relevant target-to-circuit relationship?

### Atlas stability

Does the candidate survive reasonable parcellation representations?

### Pipeline stability

Future advanced metric.

### Data quality

How much reliable data generated the result?

---

# 50. TARGET STABILITY OUTPUT

Never display:

> Target = [x,y,z]

without uncertainty.

Display instead:

**Target centre:** `[x,y,z]`

**Spatial stability:** approximately ±X mm

**Reliability:** High / Moderate / Low

Where possible, represent the target visually as:

# a confidence region

not a single magical point.

---

# 51. LOW-RELIABILITY TARGETS

If the individual target has poor spatial stability:

Magniom should reduce the influence of patient-specific connectivity.

Example:

**Individual FC reliability: Low**

Therefore:

> “Target ranking defaults primarily to evidence-supported circuit/anatomical targeting. Individual FC refinement is considered unreliable in this acquisition.”

This is preferable to returning a false-precision coordinate.

---

# 52. TARGET ACCESSIBILITY

A functional-connectivity target can only become clinically useful if it can be stimulated meaningfully.

Initial Magniom accessibility metrics:

- scalp-to-cortex distance
- cortical location
- skull geometry
- target surface extent
- device/coil compatibility
- anticipated coil positioning practicality

Cingulum used a pragmatic 30 mm depth cutoff for its specific coil.

Magniom should not assume a universal depth threshold across devices.

---

# 53. ELECTRIC-FIELD MODEL

The mature platform should include individual E-field modelling.

Each candidate should eventually contain:

**coil centre**

**coil orientation**

**target E-field**

**target engagement percentage**

**off-target engagement**

**peak E-field location**

**sensitivity to small pose changes**

Recent work continues to demonstrate rapid personalised E-field optimisation as an active clinical engineering field.

---

# 54. TARGET LOCATION VS COIL POSE

Magniom must distinguish:

# cortical target

from

# optimal coil placement.

The same cortical ROI can be stimulated differently depending on:

- gyral geometry
- coil orientation
- scalp curvature
- E-field direction

Ultimately Magniom should export a:

# stimulation solution

rather than only an MNI coordinate.

---

# 55. TARGET CANDIDATE GENERATION

Clinical Mode target generation should occur in this order:

### Stage 1 — Clinical Evidence Gate

Generate only target families with sufficient evidence for the clinical indication.

↓

### Stage 2 — Phenotype Relevance

Assess which therapeutic circuits correspond to the patient's clinically prioritised symptom domains.

↓

### Stage 3 — Individual Circuit Fit

Measure patient-specific connectivity of candidate cortical regions to the relevant therapeutic circuits.

↓

### Stage 4 — Normative Context

Assess whether candidate network relationships are unusual relative to the reference model.

↓

### Stage 5 — Reliability

Assess whether the individual measurement is stable enough to influence treatment.

↓

### Stage 6 — Accessibility

Remove or penalise poorly stimulatable candidates.

↓

### Stage 7 — E-field

Where available, model actual target engagement.

↓

### Stage 8 — Diversity / Redundancy

Construct the clinically useful slate rather than simply returning the five largest numeric scores.

---

# 56. TARGET RANKING PHILOSOPHY

Magniom v1 should not use opaque machine learning.

The initial production ranking must be:

# deterministic + monotonic + versioned + explainable.

Given the same:

- phenotype
- imaging
- evidence library
- algorithm version

Magniom must produce the same result.

---

# 57. DO NOT USE ONE UNCONSTRAINED WEIGHTED SCORE

A simplistic model such as:

> 30% connectivity + 20% symptoms + 20% anatomy + 30% evidence

would allow a weak-evidence target to compensate with strong imaging.

This is scientifically undesirable.

Instead use:

# evidence-gated ranking.

---

# 58. PROPOSED RANKING ARCHITECTURE

First apply hard gates:

**Clinical evidence eligibility**

×

**connectome QC**

×

**target reliability minimum**

×

**physical stimulatability**

Only surviving candidates proceed.

Within each evidence tier, calculate a:

# Candidate Utility Vector

containing:

**Phenotype concordance**

**therapeutic-circuit concordance**

**normative deviation relevance**

**individual reliability**

**target accessibility**

**E-field quality**

**clinical priority coverage**

No single scalar score should initially be shown to clinicians as if it represented biological truth.

---

# 59. OPTIONAL INTERNAL COMPOSITE SCORE

An internal composite may be used for ordering.

However:

- weights must be frozen
- sensitivity-tested
- version-controlled
- expert-reviewed
- retrospectively validated
- prospectively tested

before Clinical Mode release.

Weights must be described as:

# algorithm parameters

not scientifically established biological coefficients.

---

# 60. EVIDENCE GATING

A candidate can only enter the clinical slate if:

**Evidence Tier ≥ minimum permitted tier**

and:

**relevant indication match = true**

and:

**target family match = true**

and:

**reliability threshold = passed or individual FC contribution disabled**

and:

**stimulatable = true.**

---

# 61. TARGET DIVERSITY

After ranking the highest candidate, Magniom should not simply choose ranks 2–5.

Subsequent candidates should maximise:

# additional clinical information.

Potential redundancy measures include:

- cortical spatial overlap
- E-field overlap
- therapeutic-circuit similarity
- symptom-domain overlap
- functional-network overlap

---

# 62. EXAMPLE

Candidate A:

**dysphoric circuit**
utility 0.92

Candidate B:

**adjacent dysphoric target**
utility 0.90

Candidate C:

**anxiosomatic circuit**
utility 0.84

Candidate D:

**alternative dysphoric target**
utility 0.82

A naive ranking chooses:

A + B + C.

Magniom may instead prefer:

A + C

and only retain B as an alternative because A and B answer essentially the same clinical question.

---

# 63. TARGET CONVERGENCE INDEX

Magniom should calculate whether:

- standard target
- symptom-circuit target
- individual FC target
- normative anomaly
- E-field optimum

converge spatially.

Output:

### High convergence

Multiple independent evidence layers nominate approximately the same cortical region.

### Moderate convergence

Targets differ but remain within the same target family/network.

### Low convergence

Clinical evidence and individual connectomics nominate materially different regions.

Low convergence should increase:

# specialist attention

not automatically favour personalisation.

---

# 64. COUNTERFACTUAL TARGET VIEW

For every personalised case, Magniom should calculate:

# What target would have been recommended without this patient's functional MRI?

Show:

**Evidence-only target**

versus

**Connectome-informed target**

and:

**distance moved**

**reason for movement**

**evidence affected**

**confidence gained/lost**

This feature is scientifically valuable because it quantifies:

# whether personalisation actually changed the decision.

---

# 65. TARGET DISPLACEMENT

Example:

Standard evidence anchor:

`[-38, 44, 30]`

Connectome-informed candidate:

`[-44, 38, 35]`

Distance:

`9.4 mm`

Interpretation:

> “Patient-specific connectivity produced a modest within-target-family refinement.”

Versus:

Distance:

`34 mm`

Interpretation:

> “Patient-specific connectivity materially changes the cortical target. Evidence transfer requires greater caution.”

---

# 66. CLINICAL TARGET CARD

Every candidate should show:

# Primary 2 — Anxiosomatic Circuit Candidate

**Therapeutic objective**  
Reduce clinically significant anxious/somatic symptom burden.

**Target family**  
Dorsomedial prefrontal cortex.

**Subject-space location**

**MNI location**

**Atlas / parcel**

**Supporting therapeutic circuit**

**Evidence tier**

**Clinical phenotype match**

**Individual connectivity fit**

**Normative deviation**

**MRI reliability**

**Target spatial stability**

**Accessibility**

**E-field engagement**

**Counterfactual distance**

**Evidence references**

Then two mandatory sections:

# Why Magniom nominated this target

and

# Why this target may be wrong

---

# 67. “WHY IT MAY BE WRONG” REQUIREMENT

Every target must include counterarguments.

Examples:

- circuit evidence based on small prospective cohort
- individual FC modestly reliable
- alternative target provides similar network engagement
- target shifts materially under sensitivity analysis
- evidence derived from treatment protocol different from proposed clinical protocol
- patient differs from study population
- normative abnormality may not be causal
- E-field poorly confined

This is a defining Magniom feature.

---

# 68. TARGET PROVENANCE

Click:

**Evidence**

and the clinician should see:

Clinical claim  
↓  
Circuit  
↓  
Study  
↓  
Population  
↓  
Stimulation site  
↓  
Protocol  
↓  
Outcome  
↓  
Limitations

No recommendation may exist without this trace.

---

# 69. CLINICIAN REVIEW

The specialist can:

### Accept

Target accepted into final treatment planning.

### Reject

Candidate rejected.

### Replace

Select another evidence-supported candidate.

### Modify

Adjust the cortical location or coil solution.

### Defer

More information needed.

---

# 70. OVERRIDE REASON

A specialist override should record a structured reason.

Examples:

- prior treatment response
- prior non-response
- clinical phenotype mismatch
- E-field concern
- poor imaging reliability
- tolerability
- anatomical issue
- other evidence
- clinician judgement
- patient preference

Free text may supplement the structured reason.

This is not punitive.

It creates a future validation dataset.

---

# 71. FINAL PRESCRIPTION

Magniom must maintain a strict separation between:

# Candidate Target Slate

and:

# Final Clinical Prescription.

The prescription may include:

- one target
- multiple targets
- target sequence
- TMS protocol
- stimulation parameters
- schedule

but these are clinician decisions.

---

# 72. TARGET ≠ PROTOCOL

This separation is mandatory.

Magniom v1 may display:

**protocols used in evidence supporting this target**

but must not infer the final:

- frequency
- pulse pattern
- excitatory/inhibitory direction
- intensity
- dose
- number of sessions
- accelerated schedule

from the target ranking alone.

A separate future:

# Magniom Protocol Decision Module

would require its own scientific specification.

---

# 73. MULTI-TARGET WARNING

The existence of three primary candidate targets does not imply that all three should be stimulated.

Clinical Mode should explicitly display:

> **Target slate ≠ multi-target treatment plan.**

Cingulum provides useful feasibility and observational multi-target experience, but controlled evidence establishing routine multi-target superiority is currently insufficient.

---

# 74. ABSTENTION

Magniom must be designed to abstain.

Possible outputs:

# NO PERSONALISED TARGET REFINEMENT

Reasons:

- inadequate rs-fMRI
- unstable target
- excessive motion
- insufficient usable data
- missing therapeutic-circuit evidence
- candidate inaccessible
- strong disagreement between analyses
- patient outside validated population

Or:

# NO CLINICAL TARGET SLATE

when the entire case falls outside Clinical Mode's validated indication.

---

# 75. ABSTENTION IS SUCCESSFUL FUNCTIONING

The product must never optimise for:

# percentage of cases receiving five targets.

A scientifically mature targeting system should sometimes say:

> “The evidence is insufficient to personalise this target confidently.”

---

# 76. CONFIDENCE SYSTEM

Do not display misleading values such as:

**Target confidence = 93%.**

Unless that number is prospectively calibrated to an interpretable probability.

Instead initially display:

### Evidence confidence

High / Moderate / Limited.

### Patient-specific connectivity confidence

High / Moderate / Low.

### Spatial reliability

Measured in millimetres where possible.

### Stimulation accessibility

Good / Conditional / Poor.

### Overall interpretation

Strong candidate / Reasonable candidate / Alternative / Research hypothesis.

---

# 77. UNCERTAINTY MUST BE DECOMPOSED

Do not use one generic uncertainty field.

Distinguish:

**Evidence uncertainty**

**phenotype uncertainty**

**connectome uncertainty**

**spatial uncertainty**

**normative-model uncertainty**

**E-field uncertainty**

**external-validity uncertainty**

This tells the clinician what kind of uncertainty exists.

---

# 78. CLINICIAN CASE VIEW

The ideal clinical screen should answer six questions immediately:

### 1. What are we treating?

Clinical phenotype.

### 2. Which circuits have relevant treatment evidence?

Evidence layer.

### 3. What does this patient's connectome show?

Patient layer.

### 4. Which cortical nodes can actually be stimulated?

Anatomy / E-field layer.

### 5. Where do those sources agree or disagree?

Convergence layer.

### 6. What are the best defensible candidate targets?

Target slate.

---

# 79. EXAMPLE MAGNIOM CASE

Patient:

major depressive disorder.

Clinical phenotype:

**dysphoria: high**

**anxious distress: high**

**anhedonia: high**

**functional impairment: severe**

Primary goal:

restore motivation and reduce pervasive anxiety sufficiently to resume work.

---

## Evidence layer

Conventional depression target:

supported.

Dysphoric circuit:

prospectively supported.

Anxiosomatic circuit:

prospectively supported.

---

## Connectome

Left prefrontal candidate A:

strong concordance with convergent depression circuit.

Dorsomedial candidate B:

strong individual concordance with anxiosomatic circuit.

Alternative DLPFC parcel C:

similar therapeutic-circuit fit but lower reliability.

---

## Slate

### Primary 1

Evidence-anchor / personalised left-prefrontal target.

### Primary 2

Anxiosomatic dorsomedial candidate.

### Primary 3

No separate candidate.

Reason:

dysphoric circuit and evidence-anchor target converge sufficiently that creating another target would be redundant.

### Alternative A

Standard neuronavigated evidence target.

### Alternative B

Second reliable prefrontal site within the therapeutic circuit.

---

# 80. RESEARCH HYPOTHESES PANEL

Separately:

**L8Av anomaly detected**

Evidence:

Cingulum proof-of-concept / observational.

Status:

# Research hypothesis only

It is not inserted into the clinical target slate merely because the abnormality is large.

---

# 81. OUTCOME MEASUREMENT

Magniom must connect target selection to outcomes.

Otherwise target personalisation cannot eventually be validated.

Collect:

### Baseline

clinical phenotype + standard scales.

### During treatment

regular symptom measurement.

### End of acute course

response and remission status.

### Early follow-up

approximately one month.

### Longer follow-up

protocol-specific timepoints.

---

# 82. DOMAIN-SPECIFIC OUTCOMES

For v1:

### Depression

MADRS/HAM-D plus patient-reported measure.

### Anxiety

BAI/GAD-7.

### Function

WSAS or equivalent.

### Quality of life

optional validated measure.

### Patient-specific goal

Goal attainment / structured functional assessment.

---

# 83. ACTUAL TREATMENT DATA

To validate target selection, Magniom must know what treatment was actually delivered.

Store:

- final target
- target coordinates
- coil pose
- device
- coil
- protocol
- intensity
- pulse count
- sessions
- treatment schedule
- session completion
- dose changes
- coil-position deviations
- treatment interruptions

Otherwise outcome attribution becomes uninterpretable.

---

# 84. TARGET-OUTCOME LINK

For research:

Patient phenotype  
+ intended target  
+ actual E-field  
+ actual treatment dose  
→ symptom-specific outcome

This allows future analysis of:

# whether ranking higher truly predicts better response.

---

# 85. NO CONTINUOUS SELF-LEARNING

Magniom must not automatically modify its target algorithm after every patient.

Clinical outcomes should enter:

# a locked research dataset.

Algorithm changes occur only after:

data lock  
→ statistical analysis  
→ scientific review  
→ independent validation where possible  
→ clinical governance approval  
→ new version release.

---

# 86. ALGORITHM VERSIONING

Example:

**Target Engine v1.0**

becomes:

**Target Engine v1.1**

only through controlled change management.

Each historical case retains the exact engine used at the time.

---

# 87. SCIENTIFIC VALIDATION PROGRAMME

Magniom must progress through defined validation stages.

## Stage 0 — Computational verification

Does the implementation match its mathematical specification?

---

## Stage 1 — Imaging reproducibility

Does the same patient's imaging produce stable candidate targets?

Primary measurements:

- split-half distance
- cross-run distance
- connectivity reproducibility
- E-field stability

---

## Stage 2 — Expert concordance

Do independent TMS/connectomics experts judge Magniom candidates to be clinically credible?

---

## Stage 3 — Retrospective validation

Do Magniom-derived target metrics associate with historical outcomes?

This is hypothesis testing, not proof of clinical benefit.

---

## Stage 4 — Silent prospective validation

For new patients:

Magniom generates the target slate.

The treating specialist remains blinded to it.

Compare:

- specialist target
- Magniom target
- treatment outcome

This provides an unbiased prospective observational dataset.

---

## Stage 5 — Clinician-assistance study

Clinicians can see Magniom.

Measure:

- target-selection consistency
- decision time
- clinician confidence
- override frequency
- explainability
- workflow quality

Clinical outcome claims remain limited.

---

## Stage 6 — Randomized clinical utility trial

Compare:

# Magniom-assisted targeting

versus:

# high-quality conventional / evidence-based targeting.

This is the study required before claiming Magniom improves patient outcomes.

---

# 88. TECHNICAL VALIDATION ENDPOINT

A major early endpoint should be:

# target spatial reproducibility.

Given the emerging evidence that targeting coordinates can vary materially with scan length and preprocessing, Magniom cannot be scientifically credible if its own target localisation is unstable.

---

# 89. CLINICAL VALIDATION ENDPOINTS

Ultimately examine:

### Overall depression outcome

### Anxiety outcome

### Response

### Remission

### Functional recovery

### Durability

### Adverse events

### Treatment tolerability

### Target-specific symptom change

---

# 90. TARGETING-SPECIFIC VALIDATION

A particularly important test:

# Does moving away from the conventional target improve outcome in proportion to Magniom's predicted advantage?

The Counterfactual Target View makes this directly testable.

---

# 91. TARGET-RANK VALIDATION

If Magniom generates candidates:

1, 2, 3, A, B

future data should test whether:

# higher-ranked candidates actually produce better clinical outcomes.

If they do not:

the ranking model requires revision.

---

# 92. EVIDENCE LIBRARY GOVERNANCE

Every circuit claim must record:

- source
- design
- population
- sample size
- target definition
- protocol
- outcome
- replication
- limitations
- evidence tier
- date reviewed

No “common knowledge” target is exempt.

---

# 93. EVIDENCE REVIEW

At least:

# scheduled annual review

and immediate review when:

- major RCT published
- major systematic review published
- evidence classification changes
- safety guidance changes
- targeting method is replicated/refuted
- new guideline changes clinical status

Given the current speed of precision-TMS research, more frequent surveillance is preferable.

---

# 94. EVIDENCE CONFLICT

Magniom must support conflicting studies.

Example:

**Connectivity personalisation**

Evidence supporting advantage:

2026 randomized studies.

Evidence against general superiority:

BRIGhTMIND + 2025 meta-analysis.

Result:

# Mixed evidence

not:

# “Personalised targeting is proven superior.”

---

# 95. SCIENTIFIC RISK REGISTER

## Risk: False precision

**Problem:** precise coordinate interpreted as precise biological truth.

**Mitigation:** spatial uncertainty and reliability displayed.

---

## Risk: Motion artefact

**Problem:** rs-fMRI FC dominated by movement.

**Mitigation:** hard QC gate.

---

## Risk: Pipeline dependence

**Problem:** coordinate changes with processing choices.

**Mitigation:** frozen pipeline + sensitivity validation.

---

## Risk: Atlas dependence

**Problem:** candidate exists because of arbitrary parcel boundary.

**Mitigation:** cross-atlas analysis.

---

## Risk: Normative mismatch

**Problem:** patient differs from reference cohort for non-pathological reasons.

**Mitigation:** harmonised normative modelling + uncertainty.

---

## Risk: Abnormality fallacy

**Problem:** most abnormal connection assumed therapeutic.

**Mitigation:** evidence gate precedes anomaly.

---

## Risk: Connectivity-causality confusion

**Problem:** functional association interpreted as causal therapeutic circuit.

**Mitigation:** evidence tiering.

---

## Risk: Excitation/inhibition simplification

**Problem:** positive/negative FC directly determines iTBS/cTBS.

**Mitigation:** protocol decision separated.

---

## Risk: Overfitting symptom maps

**Problem:** every symptom gets its own speculative target.

**Mitigation:** only prospectively supported symptom dimensions drive Clinical Mode.

---

## Risk: Multi-target enthusiasm

**Problem:** five candidates interpreted as five targets to treat.

**Mitigation:** slate/prescription separation.

---

## Risk: Algorithm automation bias

**Problem:** clinician accepts first-ranked target simply because software ranked it.

**Mitigation:** alternatives + “why it may be wrong” + mandatory sign-off.

---

## Risk: Continuous model drift

**Problem:** target engine changes unpredictably.

**Mitigation:** locked versions and controlled releases.

---

# 96. REQUIRED SCIENTIFIC SAFEGUARDS

A Clinical Mode release may not occur unless Magniom can satisfy all of the following:

1. Same input + same version produces identical output.

2. Every target has explicit evidence provenance.

3. No Research Tier target can silently enter the clinical slate.

4. Failed imaging QC suppresses individual-FC targeting.

5. Target spatial reliability is visible.

6. Evidence level cannot be overridden by large connectomic abnormality.

7. Target selection is separate from stimulation protocol prescription.

8. Magniom can return fewer than five candidates.

9. Magniom can abstain entirely.

10. Clinician can override every recommendation.

11. Override is documented.

12. Historical algorithm versions remain reproducible.

13. Published conflicting evidence can be represented.

14. All clinical outputs identify that they are candidate targets, not autonomous prescriptions.

---

# 97. CLINICAL MODE PROHIBITED RULES

The following rules must never exist in Magniom v1:

> “Most abnormal parcel = best target.”

> “Most anticorrelated DLPFC coordinate = guaranteed best target.”

> “Hyperconnected parcel = cTBS.”

> “Hypoconnected parcel = iTBS.”

> “Personalised target = superior treatment.”

> “Five abnormalities = five treatment targets.”

> “More abnormal = more likely to respond.”

> “Better fMRI precision = better clinical outcome.”

> “One target per symptom.”

> “Scanner algorithm replaces clinical formulation.”

---

# 98. CLINICAL MODE PERMITTED CLAIMS

Magniom may state:

> “This candidate lies within an established depression target family.”

> “This target is strongly connected to the patient's therapeutic depression circuit.”

> “This candidate corresponds to a prospectively studied anxiosomatic target.”

> “Patient-specific connectivity moves the proposed target 11 mm from the evidence-only location.”

> “Target localisation is stable across two resting-state runs.”

> “The imaging does not reliably support further individualisation.”

> “Published evidence supporting this exact target remains limited.”

These are scientifically interpretable claims.

---

# 99. RESEARCH QUESTIONS MAGNIOM SHOULD ANSWER

The platform should be designed to generate evidence around several unresolved questions:

### Does patient-specific FC targeting outperform a well-neuronavigated evidence target?

### Which therapeutic circuit definition is most predictive?

### Is sgACC anticorrelation sufficient?

### Does convergent circuit connectivity add value?

### Do dysphoric/anxiosomatic target differences replicate at scale?

### Do normative anomalies add predictive value beyond circuit connectivity?

### Does target stability predict clinical outcome?

### Does cross-atlas convergence predict response?

### How large a target displacement is clinically meaningful?

### Does E-field engagement improve prediction?

### Are two targets ever better than one?

### Which patients genuinely benefit from personalisation?

---

# 100. MAGNIOM'S SCIENTIFIC DIFFERENTIATOR

Many personalised-targeting systems attempt to answer:

> **Where is this patient's abnormality?**

Magniom should ask a harder sequence:

# What clinical problem has a defensible TMS evidence base?

↓

# Which therapeutic circuits are relevant to this patient's dominant clinical phenotype?

↓

# How are those circuits expressed in this patient?

↓

# Which accessible cortical locations engage them reliably?

↓

# How stable is that conclusion?

↓

# How does it differ from the standard evidence-based target?

↓

# What evidence argues against the recommendation?

↓

# What does the specialist decide?

This is a stronger scientific architecture.

---

# 101. PRODUCT MODES

## Evidence Mode

No functional MRI required.

Outputs evidence-supported target families based on:

- diagnosis
- clinical phenotype
- published evidence.

Useful as baseline/counterfactual.

---

## Connectome Mode

Adds:

- individual resting-state FC
- reliability
- patient-specific target refinement
- normative context.

This is the main Magniom clinical proposition.

---

## Research Mode

Adds experimental:

- alternative circuits
- Cingulum anomaly targets
- structural connectivity
- effective connectivity
- biomarkers
- alternative atlases
- experimental algorithms.

Research Mode may not contaminate Clinical Mode rankings.

---

# 102. MINIMUM V1 CLINICAL TARGET LIBRARY

The first validated library should remain small.

### Established depression target family

Evidence anchor.

### sgACC-related left-prefrontal target family

Connectivity refinement.

### Convergent depression circuit target

Patient-specific refinement.

### Dysphoric circuit target

Phenotype-specific candidate.

### Anxiosomatic circuit target

Phenotype-specific candidate.

This is sufficient to create a scientifically meaningful first version.

---

# 103. CINGULUM PARCELS IN V1

Parcels such as:

**L8Av**

**PGs**

**area 46**

and others identified frequently in Cingulum cohorts may be:

- visualised
- analysed
- annotated
- compared
- included in Research Mode.

They should not initially receive the same clinical evidence status as established or prospectively tested depression circuits simply because they occurred frequently in observational target sets.

---

# 104. VERSION 1 SUCCESS CRITERION

The first Magniom prototype should not be judged by:

> “Did it find surprising targets?”

It should be judged by:

# Did it take a complex clinical + connectomic case and produce a scientifically defensible, reproducible and transparent target discussion that a specialist could audit?

That is the correct MVP objective.

---

# 105. PRE-PRODUCTION SCIENTIFIC ACCEPTANCE TEST

For each synthetic or retrospective case, independent reviewers should be able to answer:

### Clinical

Why is TMS being considered?

### Evidence

Why are these target families eligible?

### Phenotype

Why does this symptom circuit matter?

### Connectome

How did individual imaging change the target?

### Reliability

How stable is that conclusion?

### Anatomy

Can the target be stimulated meaningfully?

### Alternatives

What other target would be reasonable?

### Uncertainty

What evidence could make the proposed target wrong?

### Human decision

Why did the specialist accept or reject it?

If any step cannot be reconstructed:

# the case fails Magniom's scientific standard.

---

# 106. CANONICAL DECISION MODEL

The entire Clinical Mode can be expressed as:

# Evidence constrains.

# Phenotype prioritises.

# Connectomics refines.

# Reliability qualifies.

# Anatomy constrains.

# E-field optimises.

# Alternatives expose uncertainty.

# The specialist decides.

This should become the governing scientific model of Magniom.

---

# 107. FINAL CLINICAL PRINCIPLE

Magniom should never make personalised TMS look more certain than the science currently is.

The software becomes valuable precisely because the scientific literature is now complex:

- standard targets work
- target location matters
- individual functional anatomy differs
- some personalised approaches are promising
- some randomized studies are positive
- some high-quality studies are neutral
- symptom circuits are beginning to receive prospective validation
- connectome abnormalities are intriguing but not automatically therapeutic
- fMRI targeting itself can be unstable

Magniom's purpose is not to hide that complexity behind an algorithm.

Its purpose is to make the complexity:

# structured  
# visible  
# reproducible  
# evidence-ranked  
# patient-specific  
# clinically governable.

---

# 108. MAGNIOM SCIENTIFIC MANIFESTO

**Do not stimulate an abnormality merely because it is visible.**

**Do not personalise what the evidence does not support.**

**Do not convert correlation into causation silently.**

**Do not replace uncertainty with a precise coordinate.**

**Do not confuse a target candidate with a treatment prescription.**

**Do not force five targets when one strong target is enough.**

Instead:

# Start with the clinical problem.

# Find the strongest therapeutic evidence.

# Understand the relevant circuit.

# Examine how that circuit appears in this patient.

# Test whether the imaging is reliable.

# Determine what is physically stimulatable.

# Show competing hypotheses.

# Quantify what personalisation actually changed.

# Let the specialist make the final decision.

That is the scientific foundation of Magniom.