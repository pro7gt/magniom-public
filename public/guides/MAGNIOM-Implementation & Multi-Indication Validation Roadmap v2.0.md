# MAGNIOM

## Implementation & Multi-Indication Validation Roadmap v2.0

**Document status:** Canonical implementation, verification and multi-indication validation programme
**Version:** 2.0
**Date:** 2 September 2026
**Supersedes:** MAGNIOM Implementation & Validation Roadmap v1.0 for new development
**Backward compatibility:** Historical v1 validation plans, datasets, verification reports and release decisions remain governed by their original baseline
**Primary architectural change:** One MDD-centred validation programme → common platform verification plus independently promotable `IndicationModuleRelease` validation programmes
**Primary product state:** Functional multi-indication MAGNIOM MVP progressing toward controlled Research, Validation and Clinical module releases
**Clinical authority:** Specialist clinician
**Scientific-release authority:** Module-specific multidisciplinary governance
**Initial v2 modules:** MDD, OCD, neuropathic pain, stroke motor, post-stroke aphasia, TBI, PTSD and tinnitus

**Normative dependencies:**

* MAGNIOM Canonical Multi-Indication Data Specification v2.0
* MAGNIOM Evidence Knowledge Graph & Therapeutic Circuit Library v2.0
* MAGNIOM Target Engine & Ranking Algorithm Specification v2.0
* MAGNIOM Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0
* MAGNIOM Scientific Policy & Algorithm Configuration Specification v2.0
* MAGNIOM System Requirements Specification v2.0
* MAGNIOM Application Shell, Navigation & Clinical Context Specification
* MAGNIOM Enterprise Verification, Testing & CI/CD Specification v1.0
* MAGNIOM Implementation & Validation Roadmap v1.0

The v1 programme established the essential sequence from engineering prototype through Research, formal verification, retrospective validation, silent prospective validation, clinician-assisted validation and finally Clinical Mode. It also explicitly required that development data be separated from locked validation data and that scientific algorithms be frozen before validation.  

v2 retains those principles but changes the unit of promotion:

# MAGNIOM is no longer promoted to Clinical Mode as one undifferentiated product.

Instead:

# each `IndicationModuleRelease` earns Clinical authority independently.

---

# 1. PURPOSE

This roadmap defines how the functioning MAGNIOM MVP becomes a:

# verified multi-indication platform

capable of supporting independently governed:

```text
Clinical modules
Validation modules
Research modules
```

inside one common product.

It defines:

* v2 repository and package transition;
* database/migration order;
* core/platform verification;
* module-plugin implementation;
* multimodal measurement implementation;
* Evidence Library maturation;
* synthetic Golden Cases;
* module-specific retrospective validation;
* module-specific human-factors validation;
* silent prospective validation;
* clinician-assisted validation;
* clinical performance studies;
* module-specific Clinical Mode promotion;
* post-release surveillance;
* scientific change control.

---

# 2. THE v2 GOVERNING PRINCIPLE

The central roadmap rule is:

> **The shared platform is verified once where functionality is genuinely common; each scientific indication is validated independently wherever clinical meaning, evidence, patient measurements, targeting logic or intended claims differ.**

Therefore:

```text
Common software correctness
             ≠
Clinical validation of every module.
```

---

# 3. v1 PRINCIPLES RETAINED

v2 SHALL preserve the v1 programme principles:

# Software completion is not clinical validation.

# Build synthetic cases before relying on real patients.

# Freeze algorithms before validation.

# Separate development from validation datasets.

# Make reliability a release gate.

# Make abstention a tested feature.

# Run prospectively in silent mode before clinical influence.

# Human factors must test safe interpretation, not merely user satisfaction.

# A clinical trial must be capable of showing no advantage.

# Research Mode must never become a loophole for unvalidated clinical deployment.

The v1 roadmap explicitly defined Research Mode as still requiring authentication, provenance, immutable outputs, versioning, audit, security and scientific reproducibility. 

---

# 4. THE v2 DUAL-AXIS MATURITY MODEL

v2 introduces two independent maturity axes.

## Axis A — Platform Build Maturity

Retain:

```text
M0  Design
M1  Engineering Prototype
M2  Research Prototype
M3  Verification Build
M4  Retrospective Validation Platform
M5  Silent Prospective Platform
M6  Clinician-Assisted Validation Platform
M7  Clinical Release Platform
M8  Production Clinical Platform
```

These describe the **shared product infrastructure**.

The sequence is retained from v1. 

---

# 5. AXIS B — MODULE QUALIFICATION LEVEL

Each immutable `IndicationModuleRelease` receives an independent:

# `ModuleQualificationLevel`

```text
Q0  Scientific concept
Q1  Synthetic implementation
Q2  Research-capable
Q3  Verification-qualified
Q4  Retrospectively validated
Q5  Silent prospective qualified
Q6  Clinician-assisted validated
Q7  Clinical Release Candidate
Q8  Clinical Mode qualified
```

---

# 6. WHY TWO AXES ARE REQUIRED

A production MAGNIOM deployment might validly be:

```text
Platform                       M8

MDD Module                     Q8
Neuropathic Pain               Q5
Stroke Motor                   Q4
Stroke Aphasia                 Q4
OCD                            Q4
PTSD                           Q3
TBI Cognition                  Q2
Tinnitus                       Q2
```

The platform can therefore be production-grade while individual scientific modules remain Research or Validation only.

---

# 7. Q-LEVEL DOES NOT BELONG TO A DIAGNOSIS NAME

Qualification attaches to:

```text
IndicationModuleRelease
```

not simply:

```text
stroke
```

For example:

```text
STROKE-MOTOR-1.0.0       Q5

STROKE-MOTOR-1.1.0       Q3
```

may coexist if 1.1 introduces materially different targeting logic.

A newer version does not inherit validation automatically.

---

# 8. QUALIFICATION IS CONFIGURATION-SPECIFIC

Strictly, the validated object is:

```text
IndicationModuleRelease
+
ScientificPolicyRelease
+
EvidenceLibraryRelease
+
TargetEngineRelease
+
Plugin/generator set
+
MeasurementProvider set
+
Reliability methods
+
applicable device/configuration
```

The shorthand:

```text
Module = Q5
```

means only that a specific approved configuration for that module has attained Q5.

---

# 9. v2 PROGRAMME STRUCTURE

The programme is divided into:

```text
PHASE 0   v2 Baseline & Design Control

PHASE 1   Shared Domain Migration

PHASE 2   Core Target Engine + Plugin SDK

PHASE 3   Multimodal Measurement Platform

PHASE 4   Multi-Indication Evidence Library

PHASE 5   Synthetic Module Vertical Slices

PHASE 6   Formal Platform + Module Verification

PHASE 7   Retrospective Module Validation

PHASE 8   Module Human-Factors Validation

PHASE 9   Silent Prospective Module Validation

PHASE 10  Clinician-Assisted Validation

PHASE 11  Clinical Performance Studies where required

PHASE 12  Module Clinical Release

PHASE 13  Post-Market / Post-Release Evidence
```

Phases may overlap across different modules.

Their gates SHALL NOT be skipped.

---

# 10. v2 PROGRAMME RULE — MODULES MOVE ASYNCHRONOUSLY

MAGNIOM SHALL NOT wait for:

```text
TBI
PTSD
Tinnitus
```

to reach the maturity of MDD before deploying an independently qualified MDD module.

Conversely:

MDD qualification SHALL NOT accelerate those modules artificially.

---

# 11. COMMON CORE VS MODULE VALIDATION

The roadmap distinguishes:

## Common-core verification

Verify once and regression-test continuously:

* authentication;
* organisation security;
* audit;
* immutable snapshots;
* scientific manifests;
* Target Engine orchestration;
* plugin contract;
* Clinical/Research separation;
* signing;
* application shell;
* shared target-review workflow.

## Module validation

Validate separately:

* indication scope;
* evidence paths;
* phenotype/objectives;
* measurements;
* candidate generators;
* ranking/refinement;
* module-specific uncertainty;
* clinical interpretation;
* clinical utility.

---

# 12. WHAT SHALL NOT BE REVALIDATED FROM ZERO

When unchanged, a new module may rely on verified platform infrastructure such as:

* RLS;
* cryptographic signing;
* generic `TargetSlate` immutability;
* generic audit event storage;
* plugin loading integrity;
* deterministic sorting infrastructure;
* general authentication.

This evidence may be referenced through traceability.

---

# 13. WHAT CANNOT BE INHERITED

A module SHALL NOT inherit another module's:

* efficacy evidence;
* target validity;
* measurement relevance;
* reliability threshold;
* disease-stage rules;
* target geometry semantics;
* refinement benefit;
* clinical usability assumptions.

---

# 14. PHASE 0 — v2 CONTROLLED BASELINE

Before expanding implementation:

freeze the v2 canonical design baseline:

```text
Multi-Indication Data v2
Evidence Graph v2
Target Engine v2
Multimodal Measurement v2
Scientific Policy v2
SRS v2
Roadmap v2
```

All become controlled design inputs.

---

# 15. v2 REQUIREMENTS BASELINE

Import every v2 SRS requirement into the traceability system.

Special attention:

```text
MAG-IND-*
MAG-MEA-*
MAG-STR-*
MAG-PAI-*
MAG-TBI-*
MAG-TIN-*
MAG-OCD-*
```

Every Critical requirement must ultimately map:

```text
Requirement
   ↓
Design
   ↓
Implementation
   ↓
Verification
   ↓
Risk Control
   ↓
Validation Evidence
```

This preserves the traceability structure established in v1. 

---

# 16. RISK FILE EXPANSION

Before clinical module validation, expand the risk-management file for:

* incorrect module;
* wrong indication;
* cross-module evidence leakage;
* Research-to-Clinical leakage;
* lesion/laterality errors;
* wrong somatotopy;
* field-target geometry corruption;
* unreliable motor mapping;
* misleading task-fMRI;
* invalid tractography interpretation;
* tinnitus/audiology overinterpretation;
* hidden multimodal fusion;
* treatment-context mismatch.

---

# 17. PHASE 1 — DOMAIN MIGRATION

Implement canonical v2 objects:

```text
IndicationModuleRelease
CaseIndication
DiseaseStageContext
LesionContext
MeasurementBundle
ReliabilityBundle
TreatmentContextSnapshot
TargetGeometry
EvidencePath
EvidenceGovernanceClassification
ScientificCompatibilityConfiguration
```

---

# 18. DATABASE MIGRATION ORDER

Recommended migration sequence:

```text
1  indication modules

2  CaseIndication

3  disease-stage context

4  lesion context

5  treatment context

6  canonical measurements

7  measurement bundles

8  reliability bundles

9  expanded TargetGeometry

10 EvidencePath + governance classification

11 module-policy bindings

12 plugin/generator manifests

13 compatibility configurations

14 target candidate v2 lineage

15 target slate v2 provenance

16 module qualification records

17 validation-study manifests
```

---

# 19. NO DESTRUCTIVE v1 MIGRATION

Existing v1:

* EvidenceClaims;
* TargetCandidates;
* TargetSlates;
* signed decisions;
* imaging runs;

SHALL remain historically valid.

v2 adapters may expose them through v2 interfaces.

They SHALL NOT be silently rewritten.

---

# 20. PHASE 2 — TARGET ENGINE CORE

Implement and verify:

```text
Target Engine Core
        ↓
Plugin SDK
        ↓
Generator Registry
        ↓
Hard Gates
        ↓
Comparison Domains
        ↓
Refinement Framework
        ↓
Redundancy
        ↓
Slate Assembly
        ↓
Abstention
```

---

# 21. TARGET ENGINE CORE EXIT CRITERIA

The core may exit Engineering Prototype only when:

* same inputs produce same outputs;
* plugin execution order cannot alter Slate;
* generator cannot bypass evidence policy;
* Research generator cannot leak into Clinical;
* invalid geometry is rejected;
* refinement requires declared baseline where applicable;
* suppressed candidates remain reconstructable;
* zero-candidate result is supported.

---

# 22. PHASE 2A — MODULE PLUGIN SKELETONS

Implement first:

```text
MDDPlugin
OCDPlugin
NeuropathicPainPlugin
StrokeMotorPlugin
StrokeAphasiaPlugin
TBIPlugin
PTSDPlugin
TinnitusPlugin
```

Initial plugin existence means only:

# executable architecture.

It means nothing about clinical maturity.

---

# 23. PLUGIN CONTRACT TESTS

Every plugin SHALL pass:

* module identity;
* exact version;
* deterministic output;
* allowed geometry;
* evidence provenance;
* no DB/network scientific access;
* no hidden ranking;
* no Research leakage;
* declared measurements;
* declared failure modes.

---

# 24. PHASE 3 — MULTIMODAL MEASUREMENT PLATFORM

Implementation streams:

```text
Structural MRI

Lesion Mapping

Resting-State fMRI

Task fMRI

Diffusion MRI / Tractography

Motor Mapping

MEP

Audiology

E-field
```

---

# 25. MEASUREMENT PLATFORM EXIT CRITERIA

Each provider must demonstrate:

```text
source integrity
processing provenance
QC
reliability
capability qualification
case identity
laterality
immutable output
```

before a module may depend upon it.

---

# 26. CAPABILITY VALIDATION IS SEPARATE FROM PIPELINE VALIDATION

Example:

A motor-mapping implementation may be technically validated for:

```text
coordinate recording
```

without yet being scientifically qualified for:

```text
stroke target refinement.
```

The latter requires module-specific validation.

---

# 27. PHASE 4 — EVIDENCE LIBRARY v2

Seed and curate:

```text
MDD
OCD
Neuropathic Pain
Stroke Motor
Stroke Aphasia
TBI
PTSD
Tinnitus
```

New modules enter through:

```text
Source
→ SourceFinding
→ EvidenceClaim
→ synthesis
→ governance
→ EvidencePath
```

---

# 28. NO PREMATURE TIER PROMOTION

For emerging modules:

```text
EvidenceClaim
```

may be approved scientifically while:

```text
EvidenceGovernanceClassification
=
unassigned
```

remains valid.

Clinical permission occurs later.

---

# 29. EVIDENCE LIBRARY MODULE EXIT CRITERIA

Before Q3 verification:

* target-generating claims independently reviewed;
* material negative evidence represented;
* population boundaries explicit;
* stage restrictions explicit;
* target geometry supported;
* targeting method supported;
* treatment context explicit;
* source overlap documented;
* EvidencePaths reconstructable.

---

# 30. PRIMARY-STUDY EXTRACTION

Meta-analyses alone SHALL NOT be considered sufficient to validate module targeting semantics.

For target-generating EvidencePaths, extract material:

* pivotal trials;
* replication trials;
* negative trials;
* target-comparison studies;
* device-specific evidence;
* targeting-method studies.

---

# 31. PHASE 5 — SYNTHETIC MODULE VERTICAL SLICES

Every module SHALL first work end-to-end on synthetic data.

Canonical flow:

```text
Case
 ↓
CaseIndication
 ↓
clinical context
 ↓
measurement bundle
 ↓
EvidencePaths
 ↓
Target Engine plugin
 ↓
Target Slate
 ↓
evidence review
 ↓
clinician decision
 ↓
signature
 ↓
audit
```

The v1 roadmap explicitly made the complete synthetic vertical slice the first architectural acceptance test before full native imaging integration. 

---

# 32. SHARED SYNTHETIC ACCEPTANCE

Every module must demonstrate:

* correct module displayed;
* correct mode displayed;
* candidate evidence inspectable;
* uncertainty visible;
* candidate may be rejected;
* no target may be selected;
* Research output cannot be signed clinically;
* signed decision immutable.

---

# 33. MDD GOLDEN SUITE

Retain and migrate applicable v1 cases covering:

```text
high convergence

large evidence-vs-FC displacement

high quality but no useful personalisation

poor imaging fallback

only one meaningful target

two clinically distinct circuits

Research anomaly

clinician rejects Primary 1

clinician selects alternate target

historical evidence version change
```

---

# 34. OCD GOLDEN SUITE

Minimum:

```text
O01  mPFC/ACC field target

O02  incompatible coil/device

O03  pre-SMA/SMA alternative

O04  field target cannot become point

O05  treatment-context mismatch

O06  Research-only target

O07  conflicting evidence visible

O08  no valid target
```

---

# 35. PAIN GOLDEN SUITE

Minimum:

```text
P01 unilateral hand pain

P02 unilateral lower-limb pain

P03 qualified motor-map refinement

P04 unreliable motor mapping

P05 bilateral pain ambiguity

P06 body-region mismatch

P07 laterality error

P08 no clinically useful second target
```

---

# 36. STROKE MOTOR GOLDEN SUITE

Minimum:

```text
SM01 stage-compatible case

SM02 stage mismatch

SM03 destroyed ipsilesional target

SM04 valid contralesional hypothesis

SM05 valid ipsilesional hypothesis

SM06 qualified motor-map refinement

SM07 unreliable motor map

SM08 MEP context without autonomous target rule

SM09 Research compensatory target

SM10 lesion laterality conflict
```

---

# 37. STROKE APHASIA GOLDEN SUITE

Minimum:

```text
SA01 chronic non-fluent aphasia

SA02 fluent aphasia mismatch

SA03 stage mismatch

SA04 required SLT context present

SA05 required SLT context absent

SA06 successful task-fMRI

SA07 failed task performance

SA08 Research ipsilesional hypothesis

SA09 lesion/target invalidation

SA10 no target
```

---

# 38. TBI GOLDEN SUITE

Minimum:

```text
TBI01 efficacy signal without target specificity

TBI02 explicit TBI-specific Research target

TBI03 attempted MDD EvidencePath inheritance

TBI04 skull defect

TBI05 cranioplasty

TBI06 distorted registration

TBI07 conflicting cognition evidence

TBI08 Research-only multimodal hypothesis

TBI09 no valid target
```

---

# 39. PTSD GOLDEN SUITE

Minimum:

```text
PTSD01 general PTSD target path

PTSD02 combat-population applicability limitation

PTSD03 right-vs-left target evidence distinction

PTSD04 MDD evidence inheritance prohibited

PTSD05 Research connectome refinement

PTSD06 conflicting evidence visible

PTSD07 no target
```

---

# 40. TINNITUS GOLDEN SUITE

Minimum:

```text
TIN01 complete audiology

TIN02 unilateral tinnitus

TIN03 bilateral tinnitus

TIN04 strong pitch match

TIN05 strong imaging abnormality

TIN06 negative guideline evidence

TIN07 conflicting meta-analyses

TIN08 Research target generated

TIN09 Clinical target request denied

TIN10 no target
```

---

# 41. PHASE 6 — FORMAL VERIFICATION BUILD

Generate a v2:

# Verification Baseline

only after:

* v2 requirements frozen;
* data contracts frozen;
* plugin contracts frozen;
* Evidence Library release frozen;
* Scientific Policy frozen;
* measurement pipelines frozen;
* application shell version frozen.

The v1 roadmap required this same transition from feature building to formal demonstration at M3. 

---

# 42. COMMON-CORE VERIFICATION PACKAGE

Required reports:

```text
System Requirements Verification

Database Verification

Security Verification

Target Engine Core Verification

Plugin Contract Verification

Measurement Core Verification

Evidence Graph Verification

Scientific Policy Verification

Application Shell Verification

Audit Verification

Release Manifest Verification
```

---

# 43. MODULE VERIFICATION PACKAGE

Each module receives:

```text
Module Requirements Verification

EvidencePath Verification

Generator Verification

Measurement Compatibility Verification

Ranking / Refinement Verification

Geometry Verification

Golden Case Verification

Research / Clinical Boundary Verification
```

---

# 44. Q3 — MODULE VERIFICATION GATE

An `IndicationModuleRelease` reaches:

# Q3 — Verification Qualified

only if:

* all applicable Critical SRS requirements pass;
* no unresolved Critical defects;
* module Golden Suite passes;
* exact Scientific Policy resolves;
* plugin/generator integrity passes;
* evidence provenance reconstructs;
* permitted geometry passes;
* module/mode isolation passes;
* required measurements/reliability logic pass;
* fallback/abstention pass.

Q3 is:

# not clinical validation.

---

# 45. PHASE 7 — RETROSPECTIVE VALIDATION

The central retrospective question is retained from v1:

> **If this frozen MAGNIOM configuration had existed before these patients were treated, what would it have generated?**

Target generation SHALL be blinded to outcomes where outcome association will later be analysed. 

---

# 46. RETROSPECTIVE STUDY FREEZE

Before module retrospective validation begins, freeze:

```text
IndicationModuleRelease

ScientificPolicyRelease

EvidenceLibraryRelease

TargetEngineRelease

plugin/generator versions

MeasurementProvider versions

reliability methods

patient cohort

inclusion/exclusion

primary endpoints

secondary endpoints

statistical analysis plan
```

---

# 47. DEVELOPMENT AND VALIDATION COHORTS

For each module:

```text
development cohort
```

may support parameter development.

A separate:

```text
locked validation cohort
```

must remain untouched until algorithm/policy freeze.

This is a direct continuation of v1 validation governance. 

---

# 48. RETROSPECTIVE DATASET MANIFEST

Each dataset SHALL identify:

* source institution;
* inclusion period;
* patient population;
* clinical variables;
* treatment targets;
* delivered treatment;
* outcomes;
* available modalities;
* missingness;
* acquisition compatibility;
* whether target/outcome reviewers are blinded.

---

# 49. HISTORICAL DATA COMPATIBILITY

A historical scan or measurement does not become:

```text
Clinical-acquisition compatible
```

merely because MAGNIOM can process it.

Retrospective studies may require separate analyses of:

```text
target reasoning validity
```

and:

```text
measurement reliability.
```

v1 explicitly warned against pretending heterogeneous historical imaging satisfied a prospective clinical pipeline. 

---

# 50. COMMON RETROSPECTIVE ENDPOINTS

Across modules, assess:

```text
successful target generation

abstention rate

candidate count

target-family distribution

target reproducibility

clinician/MAGNIOM concordance

distance or geometry agreement where meaningful

evidence-path correctness

measurement influence

fallback frequency

suppression behaviour
```

---

# 51. OUTCOME ASSOCIATION IS SECONDARY TO ALGORITHM VALIDITY

Early retrospective validation SHOULD first establish:

> Is MAGNIOM doing what it claims scientifically?

before asking:

> Are its candidates associated with better outcome?

Do not allow favourable outcome correlations to excuse:

* unstable targets;
* wrong laterality;
* evidence leakage;
* unreliable measurements.

---

# 52. RETROSPECTIVE Q4 GENERAL EXIT GATE

A module may progress to:

# Q4 — Retrospectively Validated

only if a pre-specified review concludes:

### Technical

No clinically material unresolved implementation failure.

### Scientific fidelity

Candidates follow approved evidence/context rules.

### Reproducibility

Target generation is stable enough for the proposed use.

### Measurement

Required capabilities demonstrate acceptable validity/reliability.

### Algorithmic behaviour

Fallback and abstention behave appropriately.

### Safety

No unexplained systematic:

* laterality;
* module;
* geometry;
* Research leakage;
* patient identity

failure.

### Clinical relevance

The Slate contains sufficiently interpretable and plausible hypotheses to justify prospective validation.

No arbitrary universal numerical threshold is defined by this roadmap.

Those values belong in locked module validation protocols.

---

# 53. MDD RETROSPECTIVE VALIDATION

Primary questions:

```text
Does v2 preserve approved v1 behaviour?

How often does qualified FC alter the evidence baseline?

Are those alterations reproducible?

How often does the engine correctly retain the baseline?

How often does imaging fail and trigger fallback?

How often do candidate rankings align with historical target/outcome patterns?
```

Potential endpoints:

* baseline/refined displacement;
* circuit concordance;
* candidate rank;
* target-to-delivered-location relationship;
* symptom-specific outcome associations;
* abstention.

---

# 54. MDD Q4 GATE

Require:

* v1 regression equivalence where applicable;
* empirical FC reliability behaviour;
* no systematic personalisation bias;
* appropriate evidence-only fallback;
* no evidence that refinement is dominated by preprocessing artefact;
* reconstructable evidence and target lineage.

---

# 55. OCD RETROSPECTIVE VALIDATION

Primary questions:

```text
Are field-defined and focal target families represented correctly?

Does device/coil compatibility behave correctly?

Does MAGNIOM preserve treatment context?

Can clinicians distinguish field geometry from point targeting?

Does the module avoid falsely producing one universal OCD target?
```

Secondary:

* target-family/outcome relationship;
* Y-BOCS change;
* device-specific treatment concordance.

---

# 56. OCD Q4 GATE

Require:

* field geometry validated end-to-end;
* device/coil restrictions correctly enforced;
* no point-downcasting;
* target-family evidence paths correct;
* conflicting evidence correctly shown;
* acceptable case coverage/abstention for the intended module claim.

---

# 57. NEUROPATHIC PAIN RETROSPECTIVE VALIDATION

Primary questions:

```text
Is affected body region correctly mapped?

Is hemisphere correct?

Does motor mapping refine only when reliable?

Does refinement improve patient-specific somatotopic concordance?

Does the engine avoid arbitrary bilateral decisions?
```

Potential outcomes:

* pain intensity;
* pain interference;
* function;
* durability.

---

# 58. PAIN Q4 GATE

Require:

* zero unexplained laterality errors;
* validated body-region ontology;
* reliable motor-map methodology;
* fallback performance established;
* no evidence of systematic inappropriate motor-map refinement;
* target geometry reproducible.

---

# 59. STROKE MOTOR RETROSPECTIVE VALIDATION

Primary questions:

```text
Does disease stage alter eligibility correctly?

Does lesion context invalidate targets correctly?

Are ipsilesional and contralesional hypotheses kept scientifically separate?

Does motor mapping refine appropriately?

What additional information, if any, do MEP/DWI provide?
```

Potential clinical outcomes:

* FMA-UE;
* ARAT;
* dexterity;
* ADL;
* global disability.

---

# 60. STROKE MOTOR Q4 GATE

Require:

* robust lesion segmentation/registration;
* correct lesion laterality;
* correct disease-stage gating;
* no arbitrary target relocation from destroyed cortex;
* motor-map reliability characterised;
* Research DWI/rs-fMRI cannot alter validation Clinical candidates unless separately authorised.

---

# 61. STROKE APHASIA RETROSPECTIVE VALIDATION

Primary questions:

```text
Does aphasia phenotype affect EvidencePath correctly?

Does disease stage affect eligibility?

Is right-IFG evidence preserved accurately?

Is SLT context preserved?

Does task fMRI add reliable information without becoming autonomous target evidence?
```

Potential outcomes:

* naming;
* comprehension;
* repetition;
* spontaneous speech;
* functional communication.

---

# 62. APHASIA Q4 GATE

Require:

* phenotype/stage accuracy;
* lesion-target geometry validity;
* treatment-context correctness;
* task-fMRI failure handled safely;
* no generalisation of non-fluent evidence to incompatible phenotype;
* acceptable clinician interpretability.

---

# 63. TBI RETROSPECTIVE VALIDATION

The first TBI retrospective programme has a different purpose.

It should initially ask:

> **Can MAGNIOM identify where TBI evidence is sufficiently target-specific to generate a hypothesis—and abstain where it is not?**

Primary outcomes:

```text
correct abstention

correct objective-specific evidence path

cross-indication leakage prevention

lesion/skull context validity

research hypothesis reproducibility
```

Clinical outcome association is secondary initially.

---

# 64. TBI Q4 GATE

A TBI module SHALL NOT reach Q4 merely because:

```text
some pooled TBI outcomes are positive.
```

Require:

* objective-specific evidence;
* explicit target-specific EvidencePaths;
* validated structural context;
* no MDD/stroke evidence borrowing;
* target reproducibility;
* clinically interpretable candidate role.

If target specificity remains inadequate:

# remain Q2/Q3.

That is a valid scientific result.

---

# 65. PTSD RETROSPECTIVE VALIDATION

Primary questions:

```text
Are target-family and stimulation-strategy distinctions preserved?

Does population applicability behave correctly?

Are combat-specific limitations visible?

Does MAGNIOM avoid importing MDD evidence?

Are any patient-specific network refinements sufficiently reproducible?
```

Potential outcomes:

* CAPS;
* PCL;
* depression;
* anxiety;
* function;
* durability.

---

# 66. PTSD Q4 GATE

Require:

* population-transfer controls;
* target/path fidelity;
* negative/conflicting evidence visibility;
* no MDD scientific inheritance;
* reproducible candidate generation;
* reasonable prospective feasibility.

---

# 67. TINNITUS RETROSPECTIVE VALIDATION

The primary purpose is initially:

# evidence-governance and Research-target validation,

not Clinical target promotion.

Questions:

```text
Does the module preserve conflicting evidence?

Can audiology be represented accurately?

Does tinnitus laterality remain correct?

Do research candidates remain clearly research?

Does imaging abnormality fail to override evidence status?

Does the engine abstain appropriately?
```

---

# 68. TINNITUS Q4 GATE

Q4 in tinnitus means:

# retrospectively validated Research module,

not automatic Clinical readiness.

Clinical progression requires additional independent evidence demonstrating that exposing a Tinnitus Target Slate to clinicians is scientifically justified.

---

# 69. RETROSPECTIVE STOP CONDITIONS

Pause module promotion if:

* targets are routinely unstable;
* geometry depends materially on arbitrary processing choices;
* module rules generate clinically nonsensical candidates;
* abstention rate is incompatible with intended use;
* wrong laterality occurs;
* evidence transfer is required to make candidates appear useful;
* required measurement cannot be acquired reliably;
* clinicians cannot interpret output appropriately.

The v1 programme explicitly treated stop conditions as a necessary part of scientific discipline. 

---

# 70. PHASE 8 — HUMAN FACTORS

Human-factors validation has:

```text
Shared Core Tasks
+
Module-Specific Tasks.
```

---

# 71. SHARED CRITICAL TASKS

Clinician must demonstrate ability to:

* identify active indication;
* identify Clinical versus Research Mode;
* distinguish evidence from patient measurement;
* identify reliability limitation;
* inspect evidence conflict;
* compare candidate alternatives;
* reject Primary 1;
* choose no target;
* identify stale Slate;
* complete sign-off correctly.

---

# 72. MODULE-SPECIFIC HF — OCD

Clinician must recognise:

* field target versus point target;
* device/coil dependence;
* treatment-context dependence;
* competing target families.

---

# 73. MODULE-SPECIFIC HF — PAIN

Clinician must recognise:

* affected body region;
* laterality;
* anatomical baseline versus motor-map refinement;
* unreliable motor map.

---

# 74. MODULE-SPECIFIC HF — STROKE

Clinician must recognise:

* lesion location;
* disease stage;
* destroyed/invalid target;
* ipsi/contralesional alternatives;
* measurement versus mechanistic hypothesis.

---

# 75. MODULE-SPECIFIC HF — TBI

Clinician must recognise:

* Research status;
* weak/absent target specificity;
* structural/skull limitation;
* evidence from another indication cannot substitute.

---

# 76. MODULE-SPECIFIC HF — TINNITUS

Clinician must recognise:

* audiology versus therapeutic targeting;
* conflicting evidence;
* Research-only candidate;
* pitch matching does not equal target location.

---

# 77. HUMAN-FACTORS EXIT

A module cannot reach Q6/Q7 unless intended users demonstrate:

# no unacceptable residual use-related risk

for applicable critical tasks.

The v1 roadmap explicitly distinguished this from simple user preference or interface satisfaction. 

---

# 78. PHASE 9 — SILENT PROSPECTIVE VALIDATION

The v1 structure remains canonical:

```text
real patient
   ↓
normal clinical assessment
   ↓
clinician chooses treatment normally
   ↓
MAGNIOM independently processes case
   ↓
Target Slate frozen
   ↓
MAGNIOM output hidden from treating clinician
   ↓
treatment proceeds normally
   ↓
outcomes collected
   ↓
pre-specified analysis
```

This deliberately prevents automation bias and contamination of prospective validation. 

---

# 79. SILENT PROSPECTIVE ENTRY GATE

A module enters silent prospective validation only if:

```text
Q4 retrospective gate passed
+
required technical verification passed
+
prospective workflow feasible
+
ethics/governance approved
+
study protocol frozen
+
statistical plan frozen
+
scientific configuration frozen
```

---

# 80. SILENT STUDY MANIFEST

Freeze:

```text
IndicationModuleRelease

ScientificPolicyRelease

EvidenceLibraryRelease

TargetEngineRelease

plugin/generator releases

MeasurementProvider releases

reliability methods

acquisition profiles

endpoints

analysis plan
```

If a new version is released during the study, existing subjects remain analysed under the pre-specified version unless the protocol prospectively defines transition.

This preserves the v1 versioning principle. 

---

# 81. SILENT PROSPECTIVE OPERATIONAL ENDPOINTS

Every module SHOULD measure:

```text
screening success

case eligibility

required-data completion

measurement acquisition success

processing success

turnaround time

QC distribution

reliability distribution

fallback rate

abstention rate

Target Slate completion

system failure

manual intervention
```

---

# 82. SILENT PROSPECTIVE SCIENTIFIC ENDPOINTS

Where applicable:

```text
target reproducibility

geometry reproducibility

candidate-family distribution

MAGNIOM vs independent clinician target

baseline vs refinement displacement

measurement influence

convergence / disagreement

evidence conflict prevalence
```

---

# 83. SILENT PROSPECTIVE SAFETY ENDPOINTS

Track explicitly:

* wrong patient;
* wrong module;
* wrong indication;
* wrong hemisphere;
* wrong body region;
* invalid transform;
* invalid lesion relationship;
* Research leakage;
* stale scientific configuration;
* inappropriate fallback;
* unexplained target outlier.

---

# 84. SILENT PROSPECTIVE ASSOCIATION ANALYSIS

Where scientifically appropriate:

analyse whether:

```text
actual treatment target
more concordant with MAGNIOM hypothesis
```

is associated with:

```text
better clinical outcome.
```

This remains associative unless study design supports causal inference.

---

# 85. NO SINGLE-P-VALUE PROMOTION RULE

Q5 promotion SHALL NOT depend on:

```text
p < 0.05
```

alone.

The v1 roadmap explicitly required the silent promotion decision to integrate technical reliability, scientific reproducibility, safety, abstention behaviour and clinical plausibility rather than rely on one statistical result. 

---

# 86. Q5 — SILENT PROSPECTIVE EXIT GATE

A module reaches:

# Q5 — Silent Prospective Qualified

only if:

### Operational

The real-world workflow is sufficiently reliable for the intended use.

### Measurement

Required measurements can be acquired and processed with acceptable failure/reliability characteristics.

### Scientific

Targets remain sufficiently reproducible.

### Safety

No unexplained systematic critical error pattern.

### Algorithm

Fallback and abstention operate as expected.

### Evidence

No material newly emerging evidence invalidates the active EvidencePaths.

### Clinical plausibility

Results justify exposing the Target Slate within a controlled clinician-assisted protocol.

---

# 87. MDD SILENT PROSPECTIVE GATE

Specific questions:

* Does routine rs-fMRI meet acquisition/reliability needs?
* What proportion fall back to evidence baseline?
* Is personalised displacement stable prospectively?
* Do patient-specific refinements behave similarly to retrospective estimates?
* Are outliers explained?

Proceed only if personalised targeting is operationally credible.

---

# 88. OCD SILENT PROSPECTIVE GATE

Specific:

* field/pose pipeline works reliably;
* correct coil/device detected;
* target geometry preserved;
* treatment-context data captured reliably;
* no systematic operator/device mismatch;
* alternative TargetFamilies remain understandable.

---

# 89. PAIN SILENT PROSPECTIVE GATE

Specific:

* body-region coding reliable;
* laterality reliable;
* motor mapping feasible routinely;
* hotspot reliability acceptable;
* refinement/fallback rates reasonable;
* no systematic somatotopy mismatch.

---

# 90. STROKE MOTOR SILENT PROSPECTIVE GATE

Specific:

* lesion segmentation turnaround feasible;
* lesion registration robust;
* stage classification reliably captured;
* laterality consistent;
* motor mapping feasible in target population;
* severe impairment does not cause unsafe algorithm behaviour.

---

# 91. STROKE APHASIA SILENT PROSPECTIVE GATE

Specific:

* aphasia subtype/stage captured reliably;
* required treatment context captured;
* task-fMRI feasibility understood if part of intended capability;
* failed tasks handled correctly;
* target generation works across expected lesion heterogeneity.

---

# 92. TBI SILENT PROSPECTIVE GATE

TBI SHOULD NOT enter Q5 until:

```text
target-specific evidence paths
```

are sufficient to justify a prospective targeting hypothesis.

Before that threshold, TBI may have prospective:

# observational Research measurement studies

without prospective Target Slate exposure.

---

# 93. PTSD SILENT PROSPECTIVE GATE

Specific:

* target-family applicability stable;
* trauma-population differences captured;
* comorbid depression does not trigger inappropriate MDD substitution;
* any connectome capability demonstrates prospective reliability.

---

# 94. TINNITUS SILENT PROSPECTIVE GATE

Given the conflicting current evidence architecture, Tinnitus should not automatically follow other modules into silent targeting validation.

Entry requires a separate governance decision that:

> prospective generation of Research Target Slates addresses a scientifically defensible question.

Initial prospective work may instead focus on:

* audiology data quality;
* phenotype;
* target hypothesis reproducibility;
* evidence-governance performance.

---

# 95. PHASE 10 — CLINICIAN-ASSISTED VALIDATION

At this phase:

```text
MAGNIOM Target Slate
```

is shown to clinicians inside an approved controlled evaluation.

Clinician remains free to:

```text
accept
reject
modify
ignore
select no target
```

The v1 programme defined this phase specifically to measure MAGNIOM's effect on clinical decision-making. 

---

# 96. PRE-MAGNIOM DECISION CAPTURE

Before seeing MAGNIOM, record:

```text
planned target / TargetFamily

targeting method

clinical rationale

confidence

alternative considered
```

where clinically meaningful.

---

# 97. POST-MAGNIOM DECISION CAPTURE

After review:

```text
final target

whether changed

geometry/distance change

why changed

whether evidence altered decision

whether patient measurement altered decision

whether clinician rejected MAGNIOM

clinician-rated usefulness
```

---

# 98. CLINICIAN-ASSISTED SAFETY

Monitor:

```text
over-reliance

automation bias

failure to inspect reliability

failure to inspect negative evidence

Research/Clinical confusion

target-slate-as-protocol misunderstanding

failure to recognise stale inputs

incorrect geometry interpretation
```

---

# 99. Q6 — CLINICIAN-ASSISTED EXIT GATE

A module reaches:

# Q6 — Clinician-Assisted Validated

only if:

* intended clinicians can understand the module;
* module meaning is not confused with another indication;
* clinicians can challenge Primary 1;
* clinicians can identify important uncertainty;
* no unacceptable automation-bias pattern;
* decision changes are clinically interpretable;
* overrides are functioning;
* no-target decisions remain feasible;
* no unacceptable use-related risk remains.

---

# 100. DECISION UTILITY BEFORE OUTCOME SUPERIORITY

The first clinical objective remains:

# demonstrate decision utility.

Potential evidence:

* improved transparency;
* faster evidence inspection;
* better documentation;
* more reproducible reasoning;
* useful alternative identification;
* understandable target changes.

The v1 roadmap deliberately placed decision utility before outcome-superiority claims. 

---

# 101. PHASE 11 — CLINICAL PERFORMANCE STUDY

Where the intended claim requires it, progress to prospective clinical performance evaluation.

Key question:

> **Does MAGNIOM-assisted target selection improve a meaningful clinical or decision outcome compared with a credible standard targeting approach?**

---

# 102. COMPARATOR QUALITY

Comparators SHALL represent realistic high-quality care.

Do not deliberately weaken the control arm merely to manufacture superiority.

The v1 roadmap explicitly required a credible comparator for commercially and scientifically meaningful evidence. 

---

# 103. ISOLATE TARGETING EFFECT

Where the question is target-selection efficacy, minimise unnecessary between-group differences in:

* treatment device;
* coil;
* stimulation protocol;
* schedule;
* concomitant treatment.

Otherwise the causal contribution of target selection becomes unclear.

---

# 104. CLAIM LADDER v2

Each module earns claims independently.

## Claim 0

> MAGNIOM reproducibly generates module-specific target hypotheses.

Requires Q3.

## Claim 1

> MAGNIOM presents evidence, uncertainty and patient measurements in one reviewable workflow.

Requires usability/HF evidence.

## Claim 2

> MAGNIOM changes specialist targeting decisions in a controlled and interpretable manner.

Requires Q6.

## Claim 3

> MAGNIOM target concordance is associated with clinically meaningful outcome differences.

Requires appropriate clinical validation.

## Claim 4

> MAGNIOM-assisted targeting improves outcomes versus a credible comparator.

Requires appropriately controlled prospective evidence.

The v1 claim ladder used the same progressive evidence principle. 

---

# 105. CLINICAL MODE DOES NOT ALWAYS REQUIRE CLAIM 4

The evidentiary requirement depends on intended purpose and regulatory claim.

A narrow claim such as:

> structured clinician decision support presenting evidence-qualified target alternatives

may require a different clinical evidence package than:

> improves remission rate.

The claim SHALL never exceed the evidence.

---

# 106. PHASE 12 — MODULE CLINICAL RELEASE

Clinical promotion is:

```text
Q7
Clinical Release Candidate

        ↓

Q8
Clinical Mode Qualified
```

for one exact module configuration.

---

# 107. Q7 ENTRY

A module can become a Clinical Release Candidate only after:

```text
Q3 software/scientific verification
+
Q4 retrospective validation
+
Q5 silent prospective qualification
+
Q6 clinician-assisted validation
```

unless a formally justified alternative clinical-development pathway is approved within the quality/regulatory system.

No stage may simply be ignored for schedule convenience.

---

# 108. CLINICAL PROMOTION GATES v2

Every Clinical module must independently pass:

```text
GATE A  Platform Engineering & Security

GATE B  Module Scientific Evidence

GATE C  Measurement Capability

GATE D  Target Engine / Algorithm

GATE E  Human Factors

GATE F  Prospective Clinical Evidence

GATE G  Quality / Regulatory

GATE H  Deployment & Operational Readiness
```

v1 used four independent Clinical Mode gates spanning engineering/security, science/clinical performance, human factors and regulatory/quality. v2 decomposes those into module-specific gates while retaining the same principle that all necessary domains must pass. 

---

# 109. GATE A — PLATFORM ENGINEERING & SECURITY

Required:

* applicable Critical requirements verified;
* deterministic engine;
* plugin integrity;
* database integrity;
* RLS;
* private storage;
* immutable decisions;
* verified backups;
* audit;
* correct signing;
* no open Critical cybersecurity defect;
* Research/Clinical separation proven.

This gate may substantially reuse platform-level evidence.

---

# 110. GATE B — MODULE SCIENTIFIC EVIDENCE

Required:

* intended population defined;
* target-generating EvidencePaths approved;
* important conflicts represented;
* target geometry supported;
* targeting method supported;
* treatment context captured;
* stage applicability supported;
* evidence governance independently reviewed;
* claims aligned with validation evidence.

---

# 111. GATE C — MEASUREMENT CAPABILITY

For every measurement allowed to affect Clinical output:

* acquisition requirements justified;
* pipeline validated;
* QC justified;
* reliability justified;
* failure/fallback behaviour validated;
* site/equipment compatibility understood;
* indication-specific use supported.

A Research-only modality may remain installed while excluded from this gate.

---

# 112. GATE D — ALGORITHM

Required:

* plugin/generator version frozen;
* hard gates correct;
* ranking/comparison scientifically justified;
* patient-specific refinement validated;
* counterfactual preserved where required;
* redundancy correct;
* abstention correct;
* no hidden multimodal fusion;
* no cross-module transfer.

---

# 113. GATE E — HUMAN FACTORS

Required:

* critical users understand module/mode;
* target geometry understood;
* reliability understood;
* evidence conflict understood;
* no unacceptable automation bias;
* clinician can override;
* clinician can choose no target;
* sign-off workflow safe.

---

# 114. GATE F — PROSPECTIVE CLINICAL EVIDENCE

Required:

* silent prospective completed satisfactorily;
* clinician-assisted evaluation completed where required;
* clinical meaning sufficient for intended claim;
* no major unexplained failure pattern;
* outcome-performance evidence appropriate to claim level.

---

# 115. GATE G — QUALITY / REGULATORY

Required as applicable:

* intended purpose approved;
* risk management complete;
* requirements traceability complete;
* verification reports approved;
* validation reports approved;
* usability engineering file complete;
* cybersecurity evidence complete;
* clinical evaluation complete;
* applicable regulatory pathway addressed.

---

# 116. GATE H — DEPLOYMENT

Required:

* exact scientific release installed;
* compatibility manifest verified;
* supported devices/sites qualified;
* operator training completed;
* monitoring configured;
* incident process established;
* rollback/suspension procedure tested;
* disaster recovery tested.

---

# 117. Q8 — CLINICAL MODE PROMOTION

`IndicationModuleRelease` becomes Q8 only through a:

# Module Clinical Release Board Decision.

The board approves:

```text
exact module
exact policy
exact evidence library
exact engine
exact plugin
exact measurement providers
exact compatible devices/sites
exact intended claim
```

Not simply:

```text
"Stroke is now clinical."
```

---

# 118. MODULE CLINICAL RELEASE BOARD

Minimum functions:

* scientific;
* indication-specific clinical;
* engineering;
* quality/regulatory.

Add relevant specialty expertise where necessary.

Examples:

### Stroke

Neurology / stroke rehabilitation.

### Pain

Pain medicine.

### Aphasia

Language/stroke rehabilitation.

### OCD/PTSD

Psychiatric neuromodulation.

### Tinnitus

Audiology/otology.

---

# 119. MDD Q8 GATE

MDD Clinical promotion requires:

* v1/v2 regression integrity;
* validated MDD EvidencePaths;
* validated FC reliability if FC affects Clinical ranking;
* evidence-only fallback;
* validated personalisation adoption;
* clinician comprehension;
* prospective evidence appropriate to intended claim.

---

# 120. OCD Q8 GATE

In addition to universal gates:

* device/coil transferability demonstrated or explicitly restricted;
* field geometry validated;
* target-family clinical permissions explicit;
* treatment-context dependencies validated;
* no inappropriate cross-family scalar ranking;
* evidence sufficiently mature for Clinical role.

---

# 121. PAIN Q8 GATE

In addition:

* neuropathic pain population explicitly bounded;
* body-region/laterality workflow validated;
* somatotopic baseline supported;
* motor-map capability reproducible if used;
* patient-specific refinement shown to be clinically interpretable;
* prospective operational feasibility demonstrated.

---

# 122. STROKE MOTOR Q8 GATE

In addition:

* disease-stage rules validated;
* lesion pipeline validated prospectively;
* target/lesion intersection safe;
* laterality safe;
* motor-map/MEP roles independently validated;
* severe impairment behaviour understood;
* compensatory Research hypotheses excluded unless separately promoted.

---

# 123. STROKE APHASIA Q8 GATE

In addition:

* phenotype/subtype classification reliable;
* disease-stage restrictions validated;
* lesion context validated;
* SLT/treatment-context semantics validated;
* any task-fMRI Clinical influence independently justified;
* clinically relevant language target reasoning prospectively evaluated.

---

# 124. TBI Q8 GATE

TBI requires particularly strong restraint.

Before Q8:

* exact TBI sub-indication defined;
* target-specific evidence sufficiently mature;
* structural/skull considerations validated;
* no imported MDD/stroke authority;
* proposed patient-specific measurements validated;
* clinician-assisted utility demonstrated;
* prospective evidence justifies target decision support.

A generic:

```text
TBI Clinical Module
```

should not be promoted.

Prefer narrower modules such as:

```text
post-TBI neuropathic pain
```

if scientifically justified.

---

# 125. PTSD Q8 GATE

In addition:

* PTSD population scope explicit;
* trauma-subpopulation transferability assessed;
* target/frequency evidence semantics preserved;
* MDD evidence separation validated;
* any connectome personalisation independently validated;
* prospective decision utility established.

---

# 126. TINNITUS Q8 GATE

Tinnitus should have the highest promotion threshold among the initial exploratory modules because the v2 Evidence Library intentionally preserves material contradictory and negative evidence.

Clinical promotion requires:

* sufficiently supportive and clinically relevant evidence;
* explicit intended population;
* target-family evidence;
* strategy/geometry evidence;
* resolution or bounded interpretation of major conflicts;
* prospective evidence justifying clinician-facing target generation;
* audiology/targeting relationship validated.

Until then:

# remain Research.

---

# 127. NO GROUP PROMOTION

The following SHALL NOT occur:

```text
Stroke motor passes Q8
        ↓
Stroke aphasia automatically Q8.
```

Nor:

```text
MDD Q8
        ↓
PTSD Q8.
```

Each module remains separate.

---

# 128. MODULE PROMOTION LEDGER

Maintain a controlled ledger:

| Module release     | Current Q level | Approved mode | Last review | Next required gate | Blocking issues |
| ------------------ | --------------: | ------------- | ----------- | ------------------ | --------------- |
| MDD x.x            |              Q… | …             | …           | …                  | …               |
| OCD x.x            |              Q… | …             | …           | …                  | …               |
| Pain x.x           |              Q… | …             | …           | …                  | …               |
| Stroke Motor x.x   |              Q… | …             | …           | …                  | …               |
| Stroke Aphasia x.x |              Q… | …             | …           | …                  | …               |
| TBI x.x            |              Q… | …             | …           | …                  | …               |
| PTSD x.x           |              Q… | …             | …           | …                  | …               |
| Tinnitus x.x       |              Q… | …             | …           | …                  | …               |

This is an internal governance object.

---

# 129. VALIDATION DASHBOARD v2

Internal dashboard SHOULD track:

```text
Platform build version

Module Q level

Critical requirements pass

Golden Case status

Evidence review status

Measurement qualification

Retrospective cohort status

Retrospective report

Silent prospective enrolment

Operational failure rate

Reliability distribution

Abstention rate

Human-factors status

Clinical validation status

Open critical risks

Regulatory/quality status
```

The v1 roadmap already proposed an internal validation dashboard tracking build, Golden Cases, security, reproducibility, retrospective and prospective status and open risk. 

---

# 130. MODULE-SPECIFIC CI MATRIX

Every merge to scientific code SHOULD execute:

```text
Core Test Suite

MDD Suite

OCD Suite

Pain Suite

Stroke Motor Suite

Stroke Aphasia Suite

TBI Suite

PTSD Suite

Tinnitus Suite
```

Only affected expensive scientific workloads may be conditionally triggered, but:

# safety invariants remain global.

---

# 131. SCIENTIFIC CHANGE IMPACT

Every material change SHALL answer:

```text
Which modules are affected?

Which Golden Cases changed?

Which Target Slates changed?

Which Primary 1 candidates changed?

Which abstention decisions changed?

Which geometry changed?

Which reliability classifications changed?

Does previous retrospective validation remain applicable?

Does previous prospective validation remain applicable?
```

---

# 132. MODULE IMPACT CLASSIFICATION

A change may be:

```text
Core-no-scientific-output

Module implementation

Module parameter

EvidencePath

Measurement capability

Ranking/refinement

Target geometry

Indication scope

Clinical intended-use
```

The last categories may invalidate existing module validation.

---

# 133. NO AUTOMATIC VALIDATION INHERITANCE AFTER UPGRADE

If:

```text
StrokeMotorPlugin 1.1
```

changes target generation materially:

its qualification may return from:

```text
Q7
```

to:

```text
Q3/Q4
```

until required impact validation is completed.

---

# 134. MINOR SOFTWARE UPDATE

A UI patch with demonstrated no scientific or clinical workflow impact need not reset module Q level.

But:

# impact must be demonstrated,

not assumed from semantic version.

---

# 135. VALIDATION FREEZE BRANCH

Each formal study should reference:

```text
clinical-validation/<module>/<release>
```

or equivalent immutable release tag.

No normal feature development merges into the validated artefact.

---

# 136. CONTAINER / SCIENTIFIC ARTIFACT FREEZE

Freeze exact:

* container digests;
* atlas versions;
* circuit maps;
* normative models;
* lesion models;
* tract definitions;
* task paradigms;
* reliability methods;
* E-field models.

---

# 137. DATASET VERSION CONTROL

Every study dataset receives an immutable manifest including:

```text
subjects
data availability
exclusions
missingness
source
date lock
hashes
blinding state
```

Analysis exclusions after lock require documented protocol governance.

---

# 138. BIOSTATISTICS ROLE

Module statistical expertise must enter:

# before retrospective protocol freeze.

Responsibilities include:

* estimands;
* sample-size planning;
* missing-data strategy;
* repeated measures;
* multiplicity;
* validation thresholds;
* uncertainty intervals;
* subgroup plans.

The v1 roadmap similarly required biostatistics before validation, not after results were available. 

---

# 139. NO UNIVERSAL SAMPLE SIZE

This roadmap SHALL NOT prescribe:

```text
N = 50
```

or:

```text
N = 100
```

for every module.

Required sample size depends on:

* endpoint;
* expected effect;
* validation question;
* variability;
* prevalence of failure;
* module heterogeneity;
* study design.

It belongs in the pre-specified statistical plan.

---

# 140. EXTERNAL VALIDATION

Before Q8, high-risk patient-specific algorithms SHOULD include independent external-site evidence where feasible.

Particularly important for:

```text
rs-fMRI
lesion mapping
motor mapping
DWI
task fMRI
```

to identify site/acquisition dependence.

---

# 141. SITE QUALIFICATION

A module may be Q8 generally but only deployable at:

# qualified sites

if required measurement performance depends materially on:

* scanner;
* acquisition;
* TMS device;
* motor-mapping workflow;
* audiology equipment;
* navigation system.

---

# 142. MODULE-SPECIFIC DEVICE LIMITATION

Clinical release may validly say:

```text
OCD Module Q8
with Device/Coil Profile X only.
```

It does not imply transfer to Device Y.

---

# 143. POST-RELEASE SURVEILLANCE

For every Q8 module monitor:

```text
Target Engine failure

abstention

measurement qualification

candidate distributions

target displacement

clinician override

Research/Clinical boundary events

laterality

incident reports

unexpected evidence conflicts
```

---

# 144. OUTCOME MONITORING IS NOT ONLINE LEARNING

Clinical outcome data enter:

```text
Outcome Dataset
      ↓
Research analysis
      ↓
proposed scientific change
      ↓
validation
      ↓
new release
```

Never:

```text
outcomes
→ automatic ranking weight update.
```

---

# 145. EVIDENCE SURVEILLANCE

Monitor:

* new RCTs;
* major meta-analyses;
* new guidelines;
* regulatory changes;
* retractions;
* negative trials.

New evidence enters staging.

It does not alter Clinical Slates automatically.

---

# 146. MODULE DOWNGRADE

An active module may move:

```text
Q8 → suspended
```

or operationally:

```text
clinical_permitted → validation_only
```

if:

* material evidence weakens;
* measurement reliability fails;
* critical defect identified;
* new safety concern emerges;
* regulatory position changes.

---

# 147. RAPID SUSPENSION

Suspension SHALL:

* prevent new affected Clinical analyses;
* preserve historical records;
* preserve audit;
* identify affected active cases;
* trigger governance review.

---

# 148. CROSS-MODULE INCIDENT REVIEW

If a core defect affects:

```text
coordinate transforms
```

all spatial modules may require evaluation.

If a defect affects:

```text
PainMotorMapRefinementGenerator
```

only affected Pain releases may require suspension.

The architecture should permit precise impact containment.

---

# 149. MODULE VALIDATION PRIORITY

A rational v2 sequence is:

```text
1  MDD
2  Neuropathic Pain
3  Stroke Motor
4  OCD
5  Stroke Aphasia
6  PTSD
7  TBI
8  Tinnitus
```

This is a development recommendation, not a claim of clinical efficacy.

---

# 150. WHY MDD FIRST

MDD already possesses:

* the most mature existing MAGNIOM architecture;
* v1 Target Engine behaviour;
* connectome workflow;
* Golden Cases;
* clinical UX semantics.

It becomes the:

# regression/reference module

for v2 core migration.

---

# 151. WHY PAIN EARLY

Neuropathic Pain provides an excellent first non-MDD validation of the plugin architecture because it tests:

```text
different clinical objective
different geometry
different patient-specific measurement
different reliability model
```

while retaining comparatively understandable cortical targeting semantics.

---

# 152. WHY STROKE MOTOR EARLY

Stroke tests the hardest new v2 architectural concepts:

```text
DiseaseStageContext

LesionContext

laterality

motor mapping

MEP

multimodal measurement

competing mechanistic strategies
```

If the core handles Stroke correctly, the multi-indication abstraction is substantially stronger.

---

# 153. WHY OCD EARLY

OCD tests:

```text
coil-field geometry
device dependence
treatment context
cross-family comparison limits
```

It prevents MAGNIOM from becoming architecturally biased toward point-coordinate targeting.

---

# 154. WHY APHASIA AFTER STROKE MOTOR

Aphasia reuses lesion/stage infrastructure but introduces:

```text
language phenotype

SLT context

task fMRI

functional-language outcomes
```

It therefore builds on the Stroke foundation without being scientifically identical.

---

# 155. WHY TBI LATER

TBI currently presents greater:

* heterogeneity;
* target-specific evidence uncertainty;
* structural variability;
* multimodal temptation.

MAGNIOM should not solve scientific uncertainty by software enthusiasm.

---

# 156. WHY TINNITUS LATER

Tinnitus is an ideal Research stress test because the Evidence Library must preserve:

```text
positive evidence
negative evidence
guideline caution
protocol heterogeneity
uncertain durability.
```

It should advance only when the science justifies it.

---

# 157. PROPOSED PARALLEL WORKSTREAMS

Once the v2 core is stable:

### Stream A — Platform

Web/backend/security.

### Stream B — Target Engine

Core + plugins.

### Stream C — Measurements

MRI/neurophysiology/audiology.

### Stream D — Evidence

Claim-level curation.

### Stream E — Module Science

Indication-specific algorithm development.

### Stream F — Validation

Statistics/datasets/studies.

### Stream G — Human Factors

Clinician workflows.

### Stream H — Quality/Regulatory

Design control and release governance.

---

# 158. WORKSTREAM BOUNDARIES

The:

### Imaging team

shall not invent target evidence.

### Evidence team

shall not activate candidate generators.

### Plugin team

shall not invent clinical phenotype semantics.

### UX team

shall not invent scientific authority.

### Database team

shall not simplify away module/version provenance.

### Validation team

shall not change algorithm parameters after dataset unblinding.

---

# 159. CLINICAL ADVISORY STRUCTURE v2

Use:

# central MAGNIOM Scientific Governance Board

plus:

# indication-specific advisory groups.

The central board owns shared scientific architecture.

Module groups own indication-specific scientific review.

---

# 160. MODULE ADVISORY FUNCTIONS

Each module group reviews:

* EvidencePaths;
* target-family semantics;
* target geometry;
* population boundaries;
* disease stage;
* measurement relevance;
* Golden Cases;
* validation protocol;
* promotion decision.

---

# 161. Q-LEVEL PROMOTION RECORD

Every promotion SHALL generate:

```text
Module Qualification Decision Record
```

containing:

* old Q level;
* proposed Q level;
* module version;
* complete compatibility tuple;
* evidence reviewed;
* validation reports;
* unresolved limitations;
* votes/approvals;
* effective date.

---

# 162. PROMOTION CAN FAIL

Possible outcomes:

```text
approved

approved with restrictions

remain at current level

return to earlier level

suspended
```

A validation programme is valuable even if the result is:

# do not promote.

---

# 163. RESTRICTION EXAMPLES

A module might become Q8 only for:

```text
chronic non-fluent aphasia
```

rather than:

```text
post-stroke aphasia generally.
```

Or:

```text
neuropathic upper-limb pain
```

rather than all chronic pain.

This is preferable to overbroad Clinical authority.

---

# 164. MODULE SUBDIVISION

If validation reveals clinically distinct groups, create separate:

```text
IndicationModuleRelease
```

objects rather than hiding major branching inside one opaque plugin.

Examples:

```text
TBI-Cognition
TBI-Pain

Stroke-Motor
Stroke-Aphasia
```

---

# 165. VALIDATION SHOULD NARROW BEFORE IT BROADENS

The first Clinical release SHOULD normally target the:

# narrowest population and scientific claim sufficiently supported by the evidence.

Expansion becomes a future controlled release.

---

# 166. CLINICAL RELEASE PACKAGE v2

A module Q8 package includes:

```text
Application Release

Database Migration Baseline

SRS Baseline

Risk Management File

IndicationModuleRelease

EvidenceLibraryRelease

ScientificPolicyRelease

TargetEngineRelease

Plugin Manifest

Generator Manifests

Measurement Provider Releases

Reliability Methods

Phenotype / Objective Ontology

Atlas / Normative / E-field artefacts

Golden Case Report

Software Verification Report

Module Verification Report

Retrospective Validation Report

Human-Factors Report

Silent Prospective Report

Clinician-Assisted Validation Report

Clinical Evaluation

Cybersecurity Evidence

Deployment Qualification

Approvals

Cryptographic Release Manifest
```

---

# 167. RELEASE SIGNING

Clinical release should cryptographically bind:

```text
module
policy
evidence
engine
plugins
measurements
parameters
```

so that the installed scientific configuration can be independently verified.

---

# 168. POST-RELEASE MODULE MANIFEST

Every Target Slate generated after release records:

```text
IndicationModuleRelease

ScientificPolicyRelease

CompatibilityConfiguration

EvidenceLibraryRelease

TargetEngineRelease

plugin

generator versions

MeasurementBundle

ReliabilityBundle
```

No dependence on `latest`.

---

# 169. PROGRAMME HARD STOP CONDITIONS

Suspend affected Clinical promotion when:

```text
wrong laterality occurs

cross-patient measurement contamination occurs

Research science enters Clinical Slate

target geometry is corrupted

required target reliability cannot be reproduced

module output depends heavily on uncontrolled pipeline choice

clinicians routinely misunderstand the output

evidence path cannot be reconstructed

targeting benefit appears scientifically implausible

required real-world measurements are operationally infeasible

critical cybersecurity control fails
```

---

# 170. MODULE-SPECIFIC STOP — MDD

Stop/pause if:

* FC target instability dominates;
* preprocessing drives target more than patient signal;
* refinement routinely shifts outside validated family;
* baseline outperforms/equals refinement without clear incremental value and policy assumes otherwise.

---

# 171. MODULE-SPECIFIC STOP — PAIN

Stop/pause if:

* somatotopic mapping is unreliable;
* body-region/laterality errors occur;
* motor-map refinement lacks incremental localisation value;
* clinical phenotype cannot be consistently mapped.

---

# 172. MODULE-SPECIFIC STOP — STROKE

Stop/pause if:

* lesion segmentation unreliable;
* transforms unreliable in severely lesioned brains;
* module systematically proposes targets in compromised cortex;
* disease-stage rules perform poorly;
* one mechanistic model is being overgeneralised.

---

# 173. MODULE-SPECIFIC STOP — OCD

Stop/pause if:

* field geometry cannot be represented reliably;
* device transfer creates major uncertainty;
* point and field targets are being conflated;
* treatment context cannot be operationalised reliably.

---

# 174. MODULE-SPECIFIC STOP — TBI

Stop/pause if:

* target specificity remains inadequate;
* cross-indication borrowing is required;
* structural heterogeneity defeats reproducible targeting;
* multimodal fusion becomes the only way to generate apparently useful output without validation.

---

# 175. MODULE-SPECIFIC STOP — TINNITUS

Stop/pause Clinical promotion if:

* negative/conflicting evidence remains materially unresolved;
* prospective Research targets show poor reproducibility;
* target hypotheses depend primarily on speculative imaging;
* audiology does not meaningfully constrain targeting.

---

# 176. PROGRAMME SUCCESS — ENGINEERING

Before Q8:

```text
100% applicable Critical Golden Cases pass

100% critical organisation-isolation tests pass

0 unresolved Critical defects

100% signed-decision immutability tests pass

100% critical laterality/coordinate tests pass

100% Clinical/Research leakage tests pass
```

Hard engineering requirements may legitimately be absolute.

The v1 roadmap proposed equivalent hard expectations for critical engineering verification. 

---

# 177. PROGRAMME SUCCESS — SCIENCE

Success means the module can convincingly demonstrate:

* scientifically faithful candidate generation;
* appropriate reliability discrimination;
* patient-specific measurements influence output only when qualified;
* fallback behaves correctly;
* abstention behaves correctly;
* uncertainty remains visible;
* evidence remains accurate.

Do not invent universal numerical success thresholds here.

---

# 178. PROGRAMME SUCCESS — HUMAN FACTORS

Success means:

> intended specialists can correctly understand, challenge and safely act on the information without unacceptable use-related risk.

Not merely:

> users like MAGNIOM.

---

# 179. PROGRAMME SUCCESS — CLINICAL

Initially:

# demonstrate decision utility.

Only subsequently claim:

# outcome superiority

when appropriately supported.

---

# 180. PROGRAMME SUCCESS — MULTI-INDICATION ARCHITECTURE

The v2 architecture itself is validated when:

```text
MDD
Pain
Stroke
OCD
```

can all execute through:

# the same governed core

while requiring:

# genuinely different scientific plugins, geometries and measurement models

without cross-contamination.

---

# 181. FIRST MULTI-INDICATION PLATFORM MILESTONE

Recommended milestone:

```text
MDD
+
Neuropathic Pain
+
Stroke Motor
+
OCD
```

all functional at least Q2/Q3.

This demonstrates four distinct scientific patterns:

```text
connectome refinement

somatotopy/motor mapping

lesion/stage-dependent targeting

field/device-dependent targeting.
```

---

# 182. SECOND MILESTONE

Add:

```text
Stroke Aphasia
+
PTSD
```

to test:

* treatment context;
* task fMRI;
* population-transfer constraints.

---

# 183. THIRD MILESTONE

Add mature Research implementations for:

```text
TBI
+
Tinnitus
```

without forcing Clinical promotion.

This demonstrates that the platform can represent:

# scientifically interesting but clinically unresolved domains

without turning them into recommendations.

---

# 184. v2 CRITICAL PATH

The multi-indication critical path is:

```text
Canonical v2 Domain
       ↓
Indication Modules
       ↓
EvidencePaths
       ↓
Target Engine Core + Plugins
       ↓
Measurement Capabilities
       ↓
Reliability
       ↓
Golden Cases
       ↓
Formal Verification
       ↓
Module Retrospective Validation
       ↓
Module Silent Prospective
       ↓
Clinician-Assisted Validation
       ↓
Module Clinical Release
```

---

# 185. WHAT IS NO LONGER THE CRITICAL PATH

Not:

```text
more brain visualisations

more indications in the menu

more candidate generators

more AI explanation
```

The critical question is:

> **Which exact scientific module has earned the right to influence a specialist's decision?**

---

# 186. CANONICAL MODULE PROMOTION FLOW

```text
Q0
Scientific concept
   ↓
Q1
Synthetic implementation
   ↓
Q2
Research-capable
   ↓
Q3
Formal verification
   ↓
Q4
Locked retrospective validation
   ↓
Q5
Silent prospective validation
   ↓
Q6
Clinician-assisted validation
   ↓
Q7
Clinical Release Candidate
   ↓
Q8
Clinical Mode qualified
```

At every arrow:

# promotion may stop.

---

# 187. CANONICAL RETROSPECTIVE GATE

A module SHALL NOT leave retrospective validation because:

> the results look interesting.

It leaves when:

> **the frozen module demonstrates scientifically faithful, reproducible and appropriately conservative target behaviour on a locked dataset, with no unresolved critical failure pattern and sufficient clinical plausibility to justify prospective evaluation.**

---

# 188. CANONICAL SILENT PROSPECTIVE GATE

A module SHALL NOT leave silent prospective validation merely because:

> targets were generated successfully.

It leaves when:

> **the complete real-world acquisition, measurement, evidence and targeting workflow proves operationally feasible, scientifically reproducible and safe enough to justify exposing its Target Slate to clinicians within controlled validation.**

---

# 189. CANONICAL CLINICAL PROMOTION GATE

A module SHALL NOT enter Clinical Mode merely because:

> MAGNIOM can compute the target.

It enters only when:

> **the exact module configuration has passed engineering, evidence, measurement, algorithmic, human-factors, prospective clinical, quality/regulatory and deployment gates sufficient for its intended clinical claim.**

---

# 190. v2 FINAL PROMOTION MATRIX

| Requirement               |         Q2 Research |                   Q3 Verified | Q4 Retrospective |  Q5 Silent Prospective | Q6 Clinician-Assisted |            Q8 Clinical |
| ------------------------- | ------------------: | ----------------------------: | ---------------: | ---------------------: | --------------------: | ---------------------: |
| Synthetic Golden Cases    |                   ✓ |                             ✓ |                ✓ |                      ✓ |                     ✓ |                      ✓ |
| Real patient data         |                   ✓ |                             ✓ |                ✓ |                      ✓ |                     ✓ |                      ✓ |
| Critical SRS verified     |             Partial |                  **Complete** |         Complete |               Complete |              Complete |               Complete |
| EvidencePaths reviewed    |                   ✓ | **Complete for tested paths** |         Complete |               Complete |              Complete |               Complete |
| Measurement reliability   |            Research |                      Verified |    Retrospective |            Prospective |           Prospective |              Qualified |
| Target may influence care |                  No |                            No |               No |                 **No** |   Controlled protocol |                **Yes** |
| Clinician sees target     |            Research |                      Research |  Validation only | **No before decision** |       Yes, controlled |                    Yes |
| Retrospective validation  |                   — |                             — |     **Complete** |               Complete |              Complete |               Complete |
| Silent prospective        |                   — |                             — |                — |           **Complete** |              Complete |               Complete |
| Human factors             |           Formative |                     Formative |        Formative |             Near-final |         **Validated** |              Validated |
| Clinical performance      |         Exploratory |                   Exploratory |    Retrospective |            Associative |      Decision utility |      Claim-appropriate |
| Regulatory/quality        | Research governance |                    Active QMS |       Active QMS |       Study governance |         Clinical-prep | Complete as applicable |
| Clinical permission       |                  No |                            No |               No |                     No |            Restricted |                **Yes** |

---

# 191. FINAL ROADMAP PRINCIPLE

MAGNIOM v2 should no longer ask:

> **When can MAGNIOM become clinical?**

It should ask:

> **What evidence justifies allowing this exact `IndicationModuleRelease`, with this exact Evidence Library, Scientific Policy, Target Engine plugin, measurement configuration and intended claim, to influence a specialist's treatment decision?**

The answer may be:

```text
MDD              yes

Pain             not yet

Stroke Motor     not yet

TBI              no current clinical path

Tinnitus         Research only
```

and that is a sign of scientific maturity, not product incompleteness.

---

# 192. CANONICAL DEFINITION

The **MAGNIOM Implementation & Multi-Indication Validation Roadmap v2.0** is:

> **A dual-axis implementation and validation programme in which the common MAGNIOM platform is engineered and verified as a reusable governed clinical-reasoning system, while every immutable `IndicationModuleRelease` independently progresses through synthetic implementation, formal verification, locked retrospective validation, silent prospective validation, clinician-assisted evaluation and module-specific Clinical Mode qualification according to its own evidence, patient measurements, targeting algorithm, human-factors risks and intended clinical claim.**

---

# 193. FINAL GOVERNING RULE

> **MAGNIOM shall scale by sharing engineering without sharing unearned clinical authority. The platform may reuse infrastructure, security, provenance, audit, workflow and deterministic Target Engine mechanics across indications; it shall not reuse another indication's evidence, measurement validity, targeting assumptions or clinical validation simply because the software architecture is shared. Each module must be able to fail retrospective validation, fail silent prospective validation, remain Research-only indefinitely, or be suspended after release. Only the exact module configuration that independently passes its applicable scientific, technical, clinical, human-factors, quality and deployment gates may enter Clinical Mode.**

That is the essential v2 development model:

# **Build the platform once.

Verify the shared core rigorously.
Validate each indication independently.
Promote only what has earned promotion.**
