# MAGNIOM

## System Requirements Specification v2.0

**Document status:** Canonical system requirements baseline
**Version:** 2.0
**Date:** 2 September 2026
**Supersedes:** MAGNIOM System Requirements Specification v1.0 for v2 development and verification
**Backward compatibility:** Historical v1 requirements, implementations, verification records and Target Slates remain traceable to their original requirement baseline
**Primary architectural change:** Single-indication MDD decision support → governed multi-indication platform using immutable `IndicationModuleRelease` objects, indication-specific scientific plugins and multimodal measurement capabilities
**Primary user:** Appropriately trained TMS / neuromodulation specialist
**Primary system output:** Indication-specific, deterministic, evidence-traceable Target Slate for specialist review
**Final clinical authority:** Human clinician
**Initial v2 indication expansion:** MDD, OCD, neuropathic pain, stroke motor rehabilitation, post-stroke aphasia, TBI-related applications, PTSD and tinnitus, subject to independent module maturity and policy permissions

**Normative dependencies:**

* MAGNIOM System Requirements Specification v1.0
* MAGNIOM Canonical Multi-Indication Data Specification v2.0
* MAGNIOM Evidence Knowledge Graph & Therapeutic Circuit Library v2.0
* MAGNIOM Target Engine & Ranking Algorithm Specification v2.0
* MAGNIOM Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0
* MAGNIOM Scientific Policy & Algorithm Configuration Specification v2.0
* MAGNIOM Application Shell, Navigation & Clinical Context Specification
* applicable v1 specifications not yet superseded by a controlled v2 successor

The v1 programme established that every requirement should trace through design, implementation, verification, risk control and validation evidence, and already froze safety-critical identifiers including `MAG-CLI-001`, `MAG-TGT-014`, `MAG-IMG-028`, `MAG-SEC-012` and `MAG-UX-031`.  The same development programme also separated engineering completion from clinical validation and required explicit maturity progression rather than treating executable software as sufficient clinical evidence. 

---

# 1. PURPOSE

This SRS translates the MAGNIOM v2 scientific architecture into:

# stable, testable, traceable system requirements.

It defines what the complete MAGNIOM system SHALL do across:

* multi-indication clinical context;
* indication-module governance;
* evidence governance;
* scientific policy;
* multimodal patient measurement;
* candidate generation;
* target geometry;
* patient-specific refinement;
* uncertainty;
* clinician workflow;
* security;
* auditability;
* release management;
* validation.

It also introduces dedicated requirement namespaces for:

```text
MAG-IND-*   Indication-module architecture
MAG-STR-*   Stroke applications
MAG-PAI-*   Neuropathic pain
MAG-TBI-*   Traumatic brain injury
MAG-TIN-*   Tinnitus
MAG-OCD-*   Obsessive-compulsive disorder
```

and adds:

```text
MAG-MEA-*   Cross-modal measurement requirements
```

because v2 extends beyond MRI.

---

# 2. v2 OVERARCHING SYSTEM REQUIREMENT

## MAG-SYS-041 — Canonical v2 system contract

**Critical**

MAGNIOM SHALL transform:

```text
clinician-approved CaseIndication
+
IndicationModuleRelease
+
clinical objectives / phenotype
+
versioned scientific evidence
+
disease / lesion / treatment context where applicable
+
qualified patient measurements
+
capability-specific reliability
+
approved ScientificPolicyRelease
```

into:

# a deterministic, source-verifiable and uncertainty-aware Target Slate

that an authorised specialist can:

* inspect;
* compare;
* challenge;
* modify;
* reject;
* replace;
* or decline entirely.

The clinician decision SHALL remain independent of algorithmic output.

**Verification:** A, IT, ST, GC, SV, HF.

---

# 3. NORMATIVE LANGUAGE

### SHALL

Mandatory.

### SHALL NOT

Prohibited.

### SHOULD

Expected unless a documented design rationale justifies otherwise.

### MAY

Permitted but optional.

No normative requirement shall depend on descriptive prose elsewhere when the requirement itself can be stated unambiguously.

---

# 4. REQUIREMENT ID STABILITY

v2 SHALL preserve historical requirement IDs.

Existing v1 identifiers SHALL NOT be repurposed.

For example:

### `MAG-CLI-001`

Remains:

> A clinician-approved `PhenotypeSnapshot` is required before Clinical target generation.

### `MAG-TGT-014`

Remains applicable to v1-compatible Clinical connectome-refined candidates requiring an applicable target reliability profile.

v2 adds a more general multimodal requirement rather than rewriting historical meaning.

### `MAG-IMG-028`

Retains the requirement for split-half localisation reliability when technically applicable.

### `MAG-SEC-012`

Retains database-enforced RLS protection against cross-organisation clinical access.

### `MAG-UX-031`

Retains:

> No target candidate shall be preselected for clinician acceptance.

This approach preserves the verification chain already established for v1. 

---

# 5. REQUIREMENT ATTRIBUTES

Each controlled requirement SHALL eventually carry:

| Attribute           | Meaning                                 |
| ------------------- | --------------------------------------- |
| ID                  | Stable requirement identifier           |
| Statement           | Normative requirement                   |
| Source              | Design input/specification              |
| Safety class        | Critical / Major / Standard             |
| Applicable modes    | Clinical / Research / both              |
| Applicable modules  | Indication scope                        |
| Verification        | Test/analysis/inspection method         |
| Risk controls       | Linked risk IDs                         |
| Test IDs            | Verification implementation             |
| Validation evidence | Where applicable                        |
| Status              | Draft / approved / verified / validated |

---

# 6. SAFETY CLASSIFICATION

## Critical

Failure could plausibly contribute to:

* wrong patient;
* wrong indication;
* wrong hemisphere;
* wrong target;
* invalid lesion interpretation;
* Research/Clinical crossover;
* clinically significant scientific-authority error;
* corrupted signed decision;
* cross-tenant disclosure.

## Major

Failure could materially mislead specialist reasoning without necessarily directly creating a wrong target.

## Standard

Controlled functionality with no reasonably foreseeable direct clinically material consequence.

---

# 7. VERIFICATION CODES

```text
I   Inspection
A   Analysis
UT  Unit Test
IT  Integration Test
ST  System Test
GC  Golden Case
SV  Scientific Verification
HF  Human Factors
CV  Clinical Validation
```

A requirement MAY require more than one method.

---

# 8. v2 REQUIREMENT NAMESPACES

Existing namespaces remain:

```text
MAG-SYS   System
MAG-CLI   Clinical
MAG-PHE   Phenotype
MAG-EVD   Evidence
MAG-POL   Scientific policy
MAG-IMG   Imaging
MAG-TGT   Target Engine
MAG-UX    User experience
MAG-DAT   Data
MAG-SEC   Security
MAG-WFL   Workflow
MAG-AUD   Audit
MAG-REL   Release
MAG-VAL   Validation
```

New v2 namespaces:

```text
MAG-IND   Indication-module governance
MAG-MEA   Multimodal measurement
MAG-STR   Stroke
MAG-PAI   Neuropathic pain
MAG-TBI   Traumatic brain injury
MAG-TIN   Tinnitus
MAG-OCD   OCD
```

**Important namespace decision:** `MAG-AUD-*` remains **Audit**, as established in v1. Audiology requirements therefore belong under `MAG-MEA-*` and `MAG-TIN-*`; `MAG-AUD-*` SHALL NOT be reused for audiology.

---

# 9. SYSTEM REQUIREMENTS — v2 ADDITIONS

| ID              | Requirement                                                                                                                                      | Class    | Verification |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------ |
| **MAG-SYS-042** | MAGNIOM SHALL support multiple independently governed indication modules without requiring separate product architectures.                       | Major    | A, IT        |
| **MAG-SYS-043** | Clinical authority SHALL be resolved per `CaseIndication` and `IndicationModuleRelease`, not through one global application-level Clinical flag. | Critical | IT, ST       |
| **MAG-SYS-044** | The same deployment SHALL support modules at different maturity states without authority leakage between modules.                                | Critical | IT, GC       |
| **MAG-SYS-045** | A technically executable scientific capability SHALL NOT be represented as clinically validated solely because it exists in the product.         | Critical | ST, HF       |
| **MAG-SYS-046** | MAGNIOM SHALL separate patient measurement, scientific evidence, algorithmic inference and clinician decision.                                   | Critical | A, ST        |
| **MAG-SYS-047** | MAGNIOM SHALL support a valid no-target / abstention result.                                                                                     | Critical | GC, ST       |
| **MAG-SYS-048** | MAGNIOM SHALL NOT autonomously prescribe stimulation frequency, intensity, pulse count, treatment schedule or session number.                    | Critical | ST, SV       |
| **MAG-SYS-049** | Multi-indication support SHALL NOT introduce a universal clinical target score.                                                                  | Major    | SV           |
| **MAG-SYS-050** | Historical v1 and v2 Target Slates SHALL remain reconstructable from their original scientific release configuration.                            | Critical | IT, ST       |
| **MAG-SYS-051** | Patient-specific sophistication SHALL NOT automatically outrank an evidence-supported non-personalised baseline.                                 | Critical | GC, SV       |
| **MAG-SYS-052** | Software completion SHALL remain distinct from clinical qualification of an indication module.                                                   | Critical | I, A         |

The underlying v1 architecture already defined MAGNIOM as a governed reasoning system rather than “an algorithm with a website around it.” 

---

# 10. CLINICAL REQUIREMENTS — v2 ADDITIONS

| ID              | Requirement                                                                                                                                        |    Class |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------: |
| **MAG-CLI-041** | Every targeting analysis SHALL identify the principal `CaseIndication` being addressed.                                                            | Critical |
| **MAG-CLI-042** | A Case MAY contain multiple diagnoses or indications, but each Target Slate SHALL have one principal targeting indication.                         |    Major |
| **MAG-CLI-043** | The specialist SHALL explicitly approve the clinical objective(s) relevant to target generation.                                                   | Critical |
| **MAG-CLI-044** | MAGNIOM SHALL NOT infer the treatment objective solely from diagnosis.                                                                             | Critical |
| **MAG-CLI-045** | The specialist SHALL be able to reject all candidates and record no selected target.                                                               | Critical |
| **MAG-CLI-046** | The specialist SHALL be able to choose a clinically defensible target not ranked Primary 1 where workflow policy permits.                          |    Major |
| **MAG-CLI-047** | Clinician modification of candidate geometry SHALL create a new clinician-owned object without mutating the source candidate.                      | Critical |
| **MAG-CLI-048** | Signed clinical decisions SHALL remain separate from algorithm-generated Target Slates.                                                            | Critical |
| **MAG-CLI-049** | MAGNIOM SHALL distinguish TMS target decision support from TMS candidacy, safety assessment and protocol prescription.                             | Critical |
| **MAG-CLI-050** | Comorbidity SHALL NOT silently merge multiple indication models into one combined targeting analysis.                                              |    Major |
| **MAG-CLI-051** | Clinician override SHALL NOT convert a Research-only scientific object into a Clinical candidate.                                                  | Critical |
| **MAG-CLI-052** | A material change in clinician-approved indication/objective context SHALL require new target analysis rather than mutation of a historical Slate. | Critical |

---

# 11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS

This namespace is foundational to MAGNIOM v2.

## MAG-IND-001 — Indication module identity

**Critical**

Every v2 Target Slate SHALL reference exactly one immutable:

```text
IndicationModuleRelease.
```

## MAG-IND-002

Every `CaseIndication` SHALL reference the exact `IndicationModuleRelease` used for the analysis.

## MAG-IND-003

An `IndicationModuleRelease` SHALL define its intended population.

## MAG-IND-004

An `IndicationModuleRelease` SHALL identify its permitted modes.

## MAG-IND-005

An `IndicationModuleRelease` SHALL identify permitted clinical-objective definitions.

## MAG-IND-006

An `IndicationModuleRelease` SHALL identify its measurement requirements.

## MAG-IND-007

An `IndicationModuleRelease` SHALL identify permitted TargetFamilies.

## MAG-IND-008

An `IndicationModuleRelease` SHALL identify permitted candidate-generation methods.

## MAG-IND-009

An `IndicationModuleRelease` SHALL identify permitted TargetGeometry classes.

## MAG-IND-010

An `IndicationModuleRelease` SHALL identify relevant treatment-context requirements where applicable.

## MAG-IND-011

Clinical permission for one `IndicationModuleRelease` SHALL NOT imply permission for any other module.

## MAG-IND-012

A module with `research_only` status SHALL NOT generate a Clinical Target Slate.

## MAG-IND-013

A module with validation-only maturity SHALL NOT be represented as an unrestricted Clinical module.

## MAG-IND-014

The system SHALL permit different modules in one deployment to have different governance maturity.

## MAG-IND-015

Module status SHALL remain distinct from Evidence Tier or Evidence Governance Classification.

## MAG-IND-016

Scientific parameters SHALL NOT automatically inherit between indication modules.

## MAG-IND-017

EvidencePaths SHALL NOT automatically transfer between indication modules because anatomical targets overlap.

## MAG-IND-018

Candidate generators SHALL NOT execute for a module unless explicitly permitted by the active Scientific Policy.

## MAG-IND-019

A new `IndicationModuleRelease` SHALL NOT silently replace the release associated with a historical analysis.

## MAG-IND-020

Superseding a module SHALL create a new analysis when used for an existing Case.

## MAG-IND-021

A diagnosis SHALL NOT independently generate a target.

## MAG-IND-022

MAGNIOM SHALL support multiple `CaseIndication` objects for one Case.

## MAG-IND-023

Cross-indication comparison MAY be provided, but SHALL remain distinct from a Target Slate.

## MAG-IND-024

Cross-indication comparison SHALL NOT produce a universal combined target without separately validated policy.

## MAG-IND-025

Population restrictions belonging to an EvidencePath SHALL remain enforceable within the applicable module.

## MAG-IND-026

Disease-stage restrictions SHALL be enforceable where the module declares stage as scientifically material.

## MAG-IND-027

Treatment-context restrictions SHALL be enforceable where the module declares treatment context as evidence-relevant.

## MAG-IND-028

Every Clinical module SHALL possess module-specific validation evidence before unrestricted Clinical activation.

## MAG-IND-029

The application SHALL display the active indication module and mode in persistent case context.

## MAG-IND-030

If the active module cannot be positively resolved to an approved compatibility configuration, MAGNIOM SHALL fail closed.

**Verification:** UT, IT, ST, GC, SV.

---

# 12. PHENOTYPE & CLINICAL-CONTEXT REQUIREMENTS

| ID              | Requirement                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MAG-PHE-041** | Clinical objectives SHALL be represented independently from diagnosis.                                                                                              |
| **MAG-PHE-042** | A clinically important symptom or impairment SHALL NOT generate a target unless an approved evidence mapping exists.                                                |
| **MAG-PHE-043** | Missing clinical-context data SHALL remain explicit rather than being converted to normality.                                                                       |
| **MAG-PHE-044** | Disease-specific phenotype constructs SHALL be versioned within the relevant Indication Module.                                                                     |
| **MAG-PHE-045** | Patient goals MAY influence clinical prioritisation but SHALL NOT directly map to a brain target without evidence.                                                  |
| **MAG-PHE-046** | Clinical objectives that are not evidence-mappable SHALL remain visible as such.                                                                                    |
| **MAG-PHE-047** | Disease-stage and lesion context SHALL remain separate from symptom/phenotype semantics.                                                                            |
| **MAG-PHE-048** | Questionnaire or rating-scale values SHALL NOT be interpreted as direct circuit measurements unless a validated mapping specifically establishes that relationship. |

The v1 phenotype specification already required questionnaire measurement, clinical interpretation and circuit evidence to remain distinct. 

---

# 13. EVIDENCE REQUIREMENTS v2

## MAG-EVD-041

The smallest clinical scientific proposition SHALL remain the `EvidenceClaim`, not the publication.

## MAG-EVD-042

New v2 EvidenceClaims SHALL NOT require an Evidence Tier at ingestion.

## MAG-EVD-043

Evidence Tier SHALL be represented through a separate controlled governance classification where assigned.

## MAG-EVD-044

`unassigned` Evidence Governance Classification SHALL NOT be treated as equivalent to Tier R.

## MAG-EVD-045

A source MAY support one claim while conflicting with another.

## MAG-EVD-046

Material negative or null evidence SHALL be represented as first-class evidence.

## MAG-EVD-047

MAGNIOM SHALL preserve study/source overlap when assessing apparent replication.

## MAG-EVD-048

External guideline grades SHALL NOT be automatically translated into MAGNIOM Evidence Tiers.

## MAG-EVD-049

Regulatory authorisation of a particular device/intervention SHALL NOT automatically authorise other target geometries, coils or targeting methods.

## MAG-EVD-050

Clinical Target Engine use SHALL be mediated by authorised `EvidencePath` objects.

## MAG-EVD-051

An EvidencePath SHALL encode indication, relevant population, objective/outcome, TargetFamily and targeting strategy.

## MAG-EVD-052

Disease stage and treatment context SHALL form part of the EvidencePath where scientifically material.

## MAG-EVD-053

Patient-specific measurement SHALL NOT create an EvidencePath.

## MAG-EVD-054

A therapeutic effect observed at a region SHALL NOT automatically establish a distributed therapeutic circuit.

## MAG-EVD-055

Missing target specificity in evidence SHALL be represented as missing/uncertain specificity rather than filled by analogy.

---

# 14. SCIENTIFIC POLICY REQUIREMENTS v2

The following IDs formalise the requirements already defined by the v2 Scientific Policy specification.

## MAG-POL-041

Every Target Slate SHALL reference exactly one `IndicationModuleRelease`.

## MAG-POL-042

Every scientific compatibility configuration SHALL explicitly identify its `IndicationModuleRelease`.

## MAG-POL-043

Compatibility between Scientific Policy and `IndicationModuleRelease` SHALL use a positive whitelist.

## MAG-POL-044

Clinical permission for one Indication Module SHALL NOT confer Clinical permission on another.

## MAG-POL-045

Scientific parameters SHALL NOT inherit across indication modules unless explicitly approved.

## MAG-POL-046

An EvidencePath SHALL NOT influence Clinical Mode unless explicitly authorised for the active Indication Module.

## MAG-POL-047

Candidate generators SHALL be authorised by exact module, plugin release and Scientific Policy.

## MAG-POL-048

Measurement capabilities SHALL be authorised per Indication Module.

## MAG-POL-049

Research-only measurement capabilities SHALL NOT satisfy Clinical capability requirements.

## MAG-POL-050

Clinical authority SHALL NOT be determined by a single application-level mode flag.

## MAG-POL-051

Target geometry permissions SHALL be module- and TargetFamily-specific.

## MAG-POL-052

Patient-specific refinement SHALL use a module-specific validated refinement policy.

## MAG-POL-053

A module MAY define an evidence-baseline fallback only through an explicit scientific fallback rule.

## MAG-POL-054

Multimodal fusion SHALL be prohibited unless explicitly represented as a validated scientific model.

## MAG-POL-055

Unassigned Evidence Governance classifications SHALL NOT automatically be converted to MAGNIOM Evidence Tiers.

## MAG-POL-056

Clinical module activation SHALL require module-specific validation evidence.

## MAG-POL-057

Superseding an `IndicationModuleRelease` SHALL NOT alter historical Target Slates.

## MAG-POL-058

A Clinical Release Package SHALL identify exact module-level scientific permission states.

Additional v2 requirements:

## MAG-POL-059

Out-of-bounds scientific parameters SHALL invalidate the configuration rather than be silently clamped.

## MAG-POL-060

Active Clinical scientific configuration SHALL be immutable.

## MAG-POL-061

Clinical runtime SHALL verify Scientific Policy integrity before target generation.

## MAG-POL-062

Clinical runtime SHALL verify required signatures before target generation.

## MAG-POL-063

A plugin digest mismatch SHALL invalidate the compatibility configuration.

## MAG-POL-064

Scientific fallback SHALL use a prevalidated alternate configuration rather than ad hoc runtime logic.

---

# 15. `MAG-MEA-*` — MULTIMODAL MEASUREMENT REQUIREMENTS

## MAG-MEA-001

Every patient-specific measurement SHALL reference a versioned Measurement Provider and ProcessingRun.

## MAG-MEA-002

A patient-specific measurement SHALL NOT influence Clinical target generation unless the applicable capability is qualified.

## MAG-MEA-003

Measurement QC and measurement reliability SHALL remain distinct.

## MAG-MEA-004

Missing measurement data SHALL NOT be interpreted as normal measurement.

## MAG-MEA-005

Multimodal measurements SHALL NOT be fused into a Clinical target unless an approved Scientific Policy explicitly defines the fusion.

## MAG-MEA-006

Cross-modal coordinate transforms SHALL be versioned and verified.

## MAG-MEA-007

Research-only measurement capabilities SHALL NOT influence Clinical Target Slates.

## MAG-MEA-008

Reliability SHALL be evaluated by scientific capability rather than by one universal patient-level reliability score.

## MAG-MEA-009

A technically successful processing run SHALL NOT automatically create a qualified measurement.

## MAG-MEA-010

A measurement provider SHALL expose the scientific capabilities its output may support.

## MAG-MEA-011

Measurement provider compatibility SHALL include Indication Module compatibility.

## MAG-MEA-012

A failed optional modality SHALL NOT invalidate unrelated qualified modalities unless the active module requires it.

## MAG-MEA-013

Scientific fallback after measurement failure SHALL be explicit.

## MAG-MEA-014

Equipment provenance SHALL be retained where measurement validity depends on device, coil, scanner, EMG, audiometer or calibration.

## MAG-MEA-015

Measurement provenance SHALL retain applicable source and derivative artefact hashes.

## MAG-MEA-016

Different modalities that disagree SHALL remain separately inspectable.

## MAG-MEA-017

Multimodal disagreement SHALL NOT automatically be averaged.

## MAG-MEA-018

Clinical qualification of a measurement capability SHALL be indication-specific.

## MAG-MEA-019

The measurement layer SHALL NOT output an autonomous final clinical target.

## MAG-MEA-020

Clinical-facing measurement status SHALL distinguish at least qualified, qualified-with-limits, not-qualified and Research-only.

---

# 16. IMAGING REQUIREMENTS — v2 ADDITIONS

## MAG-IMG-041

Structural MRI used for clinical targeting SHALL retain native-space coordinate provenance.

## MAG-IMG-042

Lesion masks SHALL retain native-space provenance.

## MAG-IMG-043

Large structural lesions SHALL trigger lesion-aware registration/QC logic appropriate to the validated pipeline.

## MAG-IMG-044

A failed registration SHALL block use of spatial outputs that depend upon that registration.

## MAG-IMG-045

Task fMRI SHALL retain task/paradigm and behavioural-performance provenance.

## MAG-IMG-046

Task-performance failure SHALL NOT be represented as absence of cortical function.

## MAG-IMG-047

DWI/tractography outputs SHALL NOT be represented as direct axonal counts.

## MAG-IMG-048

Structural-connectivity measurements SHALL require explicit policy permission before influencing Clinical ranking.

## MAG-IMG-049

Cross-modal transformations from DWI/BOLD/task-fMRI to structural/neuronavigation space SHALL be verified.

## MAG-IMG-050

Anatomical or functional map precision SHALL NOT be represented as equivalent to biological certainty.

## MAG-IMG-051

A change in a clinically material image-processing pipeline SHALL require impact assessment before clinical activation.

## MAG-IMG-052

Laterality and coordinate orientation SHALL be validated across all applicable imaging transformations.

`MAG-IMG-028` continues to require split-half localisation when technically applicable to the relevant functional targeting method.

---

# 17. TARGET ENGINE REQUIREMENTS v2

## MAG-TGT-041

Any patient-specific Clinical refinement SHALL require a qualified applicable capability in the `ReliabilityBundle`.

## MAG-TGT-042

The Target Engine SHALL use a common deterministic core plus explicitly registered indication-specific plugins.

## MAG-TGT-043

Plugins SHALL produce candidate hypotheses and SHALL NOT independently confer final clinical eligibility.

## MAG-TGT-044

Clinical plugins and generators SHALL be statically versioned, hashed and positively authorised.

## MAG-TGT-045

The Target Engine SHALL apply mandatory gates before compensable ranking features.

## MAG-TGT-046

A candidate failing a mandatory gate SHALL NOT compensate through high values in another feature.

The v1 Target Engine already established “gates before scores” as a core safety principle. 

## MAG-TGT-047

Clinical candidates SHALL derive from authorised EvidencePaths.

## MAG-TGT-048

Candidates SHALL only be compared numerically inside scientifically valid comparison domains.

## MAG-TGT-049

MAGNIOM SHALL NOT produce one universal scalar target score across scientifically incompatible target classes.

## MAG-TGT-050

Target geometry SHALL remain typed throughout generation, comparison and final review.

## MAG-TGT-051

A `coil_field` target SHALL NOT silently become a point target.

## MAG-TGT-052

A `somatotopic` target SHALL preserve body-region semantics.

## MAG-TGT-053

Patient-specific refinement SHALL preserve candidate lineage to its evidence baseline where the operation is defined as refinement.

## MAG-TGT-054

A patient-specific refinement SHALL NOT automatically displace its evidence baseline.

## MAG-TGT-055

Where refinement is evaluated, the Target Engine SHALL produce an explicit counterfactual comparison.

## MAG-TGT-056

Redundancy assessment SHALL be target-geometry-aware.

## MAG-TGT-057

Target Slate assembly SHALL optimise clinically useful diversity rather than simply selecting the numerically highest N candidates.

## MAG-TGT-058

The engine SHALL be permitted to produce fewer than three Primary Candidates and fewer than two Additional Candidates.

## MAG-TGT-059

Research-only generators SHALL NOT contribute to a Clinical Target Slate.

## MAG-TGT-060

Suppressed candidates and suppression reasons SHALL remain reconstructable.

## MAG-TGT-061

A complete scientific configuration failure SHALL produce abstention rather than best-effort guessing.

## MAG-TGT-062

Candidate explanations SHALL include material evidence limitations and conflicts.

## MAG-TGT-063

Optional LLM-generated prose SHALL NOT alter candidate identity, evidence, rank, eligibility or uncertainty.

## MAG-TGT-064

The Target Engine SHALL NOT infer stimulation protocol from target geometry or patient measurements.

---

# 18. UX REQUIREMENTS — v2 ADDITIONS

## MAG-UX-041

The top bar SHALL visibly establish system mode and scientific environment.

## MAG-UX-042

The sidebar SHALL communicate the user's location in the MAGNIOM workflow.

## MAG-UX-043

The case header SHALL display the active `CaseIndication`.

## MAG-UX-044

The case header SHALL display the active `IndicationModuleRelease` or an appropriately human-readable version reference.

## MAG-UX-045

Research Mode SHALL remain persistently visible throughout deep navigation.

## MAG-UX-046

A Research-only case SHALL NOT present a normal Clinical sign-off action.

## MAG-UX-047

Target geometry SHALL be described in a clinically appropriate form rather than forcing all targets into MNI point-coordinate presentation.

## MAG-UX-048

Clinicians SHALL be able to inspect which patient measurements influenced each candidate.

## MAG-UX-049

Clinicians SHALL be able to inspect why an available measurement did not influence a candidate.

## MAG-UX-050

Measurement reliability SHALL be presented separately from clinical evidence strength.

## MAG-UX-051

Material lesion context SHALL be visible in applicable stroke/TBI target review.

## MAG-UX-052

Material treatment-context dependence SHALL be visible in applicable OCD/aphasia workflows.

## MAG-UX-053

Negative and conflicting evidence SHALL not be hidden behind a generic confidence badge.

## MAG-UX-054

The UI SHALL distinguish algorithm rank from clinical authority.

## MAG-UX-055

The UI SHALL permit rejection, modification, alternate target selection and no-target decision.

## MAG-UX-056

The UI SHALL NOT describe MAGNIOM output as an “optimal target” unless a future validated intended-purpose claim explicitly permits that language.

`MAG-UX-031` remains unchanged: **no target candidate shall be preselected for clinician acceptance.**

---

# 19. DATA REQUIREMENTS v2

## MAG-DAT-041

Canonical storage SHALL support `IndicationModuleRelease`.

## MAG-DAT-042

Canonical storage SHALL support `CaseIndication`.

## MAG-DAT-043

Canonical storage SHALL support `DiseaseStageContext`.

## MAG-DAT-044

Canonical storage SHALL support multiple `LesionContext` objects where clinically required.

## MAG-DAT-045

Canonical storage SHALL support `MeasurementBundle`.

## MAG-DAT-046

Canonical storage SHALL support `ReliabilityBundle`.

## MAG-DAT-047

Canonical storage SHALL support typed TargetGeometry.

## MAG-DAT-048

Canonical storage SHALL support `TreatmentContextSnapshot`.

## MAG-DAT-049

Target Slate records SHALL retain exact `IndicationModuleRelease` and Scientific Compatibility Configuration references.

## MAG-DAT-050

Historical target geometry SHALL not be reduced to a less expressive geometry on export/import.

## MAG-DAT-051

Patient-specific objects SHALL maintain structural Case/organisation integrity.

## MAG-DAT-052

A Target Candidate associated with one `CaseIndication` SHALL NOT be inserted into another indication's Target Slate.

## MAG-DAT-053

Clinical snapshots used to generate a Target Slate SHALL be immutable.

## MAG-DAT-054

Historical objects SHALL NOT resolve scientific dependencies through `latest` selectors.

---

# 20. SECURITY REQUIREMENTS v2

## MAG-SEC-041

Module/scientific-policy mutation SHALL require privileged controlled authority.

## MAG-SEC-042

Ordinary clinicians SHALL NOT be able to alter Scientific Policy.

## MAG-SEC-043

Ordinary application administrators SHALL NOT be able to alter clinical scientific thresholds through generic settings.

## MAG-SEC-044

Scientific release signatures and hashes SHALL be verified server-side before Clinical target generation.

## MAG-SEC-045

A compromised frontend SHALL NOT be sufficient to activate a Research module as Clinical.

## MAG-SEC-046

Scientific worker access SHALL remain limited to required pseudonymous case data.

## MAG-SEC-047

Measurement artefacts from one Case SHALL NOT be combined into another Case's `MeasurementBundle`.

## MAG-SEC-048

Clinical compatibility/configuration checks SHALL execute at a trusted server/backend boundary.

`MAG-SEC-012` remains a Critical requirement requiring database-enforced RLS against cross-organisation clinical access.

---

# 21. WORKFLOW REQUIREMENTS v2

## MAG-WFL-041

Case workflow SHALL resolve the active `CaseIndication` before targeting analysis.

## MAG-WFL-042

Module-specific required contexts SHALL be completed or explicitly unresolved before Target Engine execution.

## MAG-WFL-043

Target generation SHALL be transactional from immutable scientific inputs.

## MAG-WFL-044

A failed module-specific prerequisite SHALL not create a partially valid Target Slate.

## MAG-WFL-045

Scientific fallback SHALL be represented as a distinct workflow outcome.

## MAG-WFL-046

Changing active indication SHALL require a distinct targeting analysis rather than relabeling a pre-existing Slate.

## MAG-WFL-047

Research-to-Clinical promotion SHALL occur through release governance rather than workflow state editing.

## MAG-WFL-048

A stale Target Slate SHALL be blocked from clinical signing when material dependencies have changed.

---

# 22. AUDIT REQUIREMENTS v2

`MAG-AUD-*` continues to mean Audit.

## MAG-AUD-041

Audit records SHALL identify the active `CaseIndication`.

## MAG-AUD-042

Audit records SHALL identify the active `IndicationModuleRelease`.

## MAG-AUD-043

Target-generation audit SHALL identify the Scientific Compatibility Configuration.

## MAG-AUD-044

Generator invocation and abstention SHALL be auditable.

## MAG-AUD-045

Capability qualification/failure affecting target generation SHALL be auditable.

## MAG-AUD-046

Fallback from a patient-specific capability to an evidence baseline SHALL be auditable.

## MAG-AUD-047

Module/mode policy violations SHALL be auditable.

## MAG-AUD-048

A signed clinician decision SHALL be reconstructable independently from the current state of the Evidence Library or module.

---

# 23. RELEASE REQUIREMENTS v2

## MAG-REL-041

Every v2 Clinical Release Package SHALL identify all included `IndicationModuleRelease` objects.

## MAG-REL-042

Every module SHALL carry an explicit maturity/permission state.

## MAG-REL-043

A Release Package MAY contain Clinical, Validation and Research modules simultaneously.

## MAG-REL-044

Clinical permission of one module SHALL NOT satisfy release gates for another.

## MAG-REL-045

Plugin and candidate-generator digests SHALL be included in the scientific release manifest.

## MAG-REL-046

Measurement Provider releases SHALL be included where they affect Clinical targeting.

## MAG-REL-047

Reliability Method releases SHALL be included where they affect Clinical targeting.

## MAG-REL-048

Device/coil capability profiles SHALL be included where evidence/geometry depends on them.

## MAG-REL-049

Clinical module promotion SHALL require a new controlled scientific release even if application code is unchanged.

## MAG-REL-050

Scientific module suspension SHALL prevent new affected target generation without deleting historical records.

## MAG-REL-051

Module deactivation SHALL not invalidate reconstructability of historical decisions.

## MAG-REL-052

No module SHALL enter unrestricted Clinical Mode solely because an implementation feature flag was enabled.

---

# 24. `MAG-STR-*` — STROKE REQUIREMENTS

`MAG-STR-*` covers both:

```text
Stroke — motor rehabilitation
Stroke — aphasia/language rehabilitation
```

unless a future dedicated aphasia namespace is established.

## MAG-STR-001

Stroke targeting SHALL identify the specific stroke-related therapeutic objective.

## MAG-STR-002

Motor-recovery and aphasia Target Slates SHALL remain distinct indication analyses.

## MAG-STR-003

Disease stage SHALL be represented when relevant to the active EvidencePath.

## MAG-STR-004

A stage-dependent EvidencePath SHALL not apply when the Case does not satisfy its validated stage scope.

## MAG-STR-005

Lesion context SHALL be required for lesion-dependent stroke targeting.

## MAG-STR-006

Stroke lesion laterality SHALL be explicitly represented.

## MAG-STR-007

Stroke target laterality SHALL be cross-validated against lesion and affected-function context.

## MAG-STR-008

A target substantially destroyed or absent because of lesion SHALL not be treated as ordinary intact cortex.

## MAG-STR-009

MAGNIOM SHALL NOT automatically move an invalid lesion-overlapping target to nearby intact cortex unless a validated module-specific rule exists.

## MAG-STR-010

Contralesional M1 SHALL NOT be encoded as universally maladaptive.

## MAG-STR-011

Ipsilesional and contralesional strategies SHALL require separate applicable EvidencePaths.

## MAG-STR-012

A bilateral motor strategy SHALL NOT be converted into an autonomous bilateral stimulation protocol.

## MAG-STR-013

Motor-map refinement SHALL require qualified motor-mapping capability.

## MAG-STR-014

An unreliable motor map SHALL NOT influence Clinical target refinement.

## MAG-STR-015

MEP presence or absence SHALL NOT autonomously determine ipsilesional versus contralesional targeting.

## MAG-STR-016

DWI/structural-connectivity features SHALL influence Clinical ranking only through an explicitly validated Stroke policy.

## MAG-STR-017

Aphasia analyses SHALL preserve relevant language phenotype/subtype.

## MAG-STR-018

Evidence limited to chronic non-fluent aphasia SHALL NOT automatically transfer to other aphasia phenotypes/stages.

## MAG-STR-019

Where evidence depends on concurrent speech-language therapy, treatment context SHALL be explicitly evaluated.

## MAG-STR-020

Failure of a task-fMRI language paradigm SHALL NOT be represented as absence of language cortex.

## MAG-STR-021

Task-fMRI activation SHALL NOT independently create a Clinical stroke target.

## MAG-STR-022

Lesion-network abnormalities SHALL NOT independently create Clinical targets unless explicitly validated.

## MAG-STR-023

Affected limb/body-region, recorded muscle and somatotopic TargetGeometry SHALL remain semantically consistent.

## MAG-STR-024

Failure of an optional modality MAY allow a validated stroke fallback if policy explicitly permits it.

## MAG-STR-025

Failure of a mandatory lesion/stage requirement SHALL cause module abstention rather than guessed targeting.

**Primary verification:** GC, SV, CV.

---

# 25. `MAG-PAI-*` — NEUROPATHIC PAIN REQUIREMENTS

## MAG-PAI-001

The Pain module SHALL identify the pain condition/population to which the EvidencePath applies.

## MAG-PAI-002

The clinically relevant painful body region SHALL be represented explicitly.

## MAG-PAI-003

Pain laterality SHALL be represented where relevant to target selection.

## MAG-PAI-004

Somatotopic M1 candidates SHALL use `SomatotopicTargetGeometry`.

## MAG-PAI-005

A somatotopic pain target SHALL preserve the affected body-region relationship.

## MAG-PAI-006

A generic universal M1 point SHALL NOT replace required somatotopic semantics.

## MAG-PAI-007

A contralateral M1 strategy SHALL only be applied where the relevant EvidencePath and context support it.

## MAG-PAI-008

Bilateral or ambiguous pain SHALL NOT result in arbitrary hemisphere selection.

## MAG-PAI-009

Motor-map refinement SHALL require qualified motor-hotspot/motor-map capability.

## MAG-PAI-010

Failure of motor-map reliability SHALL result in a policy-defined baseline/fallback or abstention.

## MAG-PAI-011

An MEP finding SHALL NOT independently establish a pain target.

## MAG-PAI-012

rs-fMRI SHALL NOT be required solely because MAGNIOM supports connectomics.

## MAG-PAI-013

Evidence for M1 in stroke SHALL NOT automatically transfer to the pain indication.

## MAG-PAI-014

Pain intensity SHALL NOT be converted into a target-confidence score.

## MAG-PAI-015

Pain intensity, interference and functional objectives SHALL remain distinguishable where the evidence does.

## MAG-PAI-016

Material heterogeneity or negative evidence SHALL remain visible in candidate evidence review.

## MAG-PAI-017

Muscle/body-region mismatch SHALL prevent use of the mismatched motor map for somatotopic refinement.

## MAG-PAI-018

No clinically meaningful second or third target SHALL be required merely to fill the Slate.

---

# 26. `MAG-TBI-*` — TRAUMATIC BRAIN INJURY REQUIREMENTS

## MAG-TBI-001

TBI SHALL NOT be represented as one universal targeting indication.

## MAG-TBI-002

TBI clinical objectives such as cognition, pain, depression and post-concussive burden SHALL preserve independent evidence paths.

## MAG-TBI-003

MAGNIOM SHALL NOT generate a universal `TBI Target`.

## MAG-TBI-004

A TBI candidate SHALL require an explicit TBI-specific EvidencePath binding to the relevant TargetFamily/strategy.

## MAG-TBI-005

MDD target evidence SHALL NOT automatically transfer to post-TBI depression.

## MAG-TBI-006

A pooled signal suggesting TBI symptom improvement without target specificity SHALL NOT be sufficient to create a Clinical target.

## MAG-TBI-007

Relevant TBI targeting SHALL preserve lesion context.

## MAG-TBI-008

Skull defect, cranioplasty or postoperative structural changes SHALL be represented where relevant.

## MAG-TBI-009

Where structural changes materially affect E-field validity, the applicable candidate SHALL be qualified accordingly.

## MAG-TBI-010

TBI imaging abnormalities SHALL NOT independently become therapeutic targets.

## MAG-TBI-011

DWI, rs-fMRI and task-fMRI shall remain Research/Validation unless separately promoted for the applicable TBI module.

## MAG-TBI-012

Conflicting outcome evidence SHALL be visible rather than resolved automatically by the engine.

## MAG-TBI-013

A patient-specific lesion-network or connectivity finding SHALL NOT create clinical efficacy evidence.

## MAG-TBI-014

Structural distortion that invalidates registration SHALL prevent dependent target generation.

## MAG-TBI-015

TBI safety assessment SHALL remain separate from MAGNIOM target ranking.

## MAG-TBI-016

Research hypotheses SHALL be visibly and structurally identified as Research.

## MAG-TBI-017

Failure of a TBI Research modality SHALL NOT trigger an analogous MDD or stroke target as fallback.

## MAG-TBI-018

TBI Clinical Mode SHALL remain unavailable until a TBI-specific Clinical `IndicationModuleRelease`, policy configuration and validation package are approved.

---

# 27. `MAG-TIN-*` — TINNITUS REQUIREMENTS

## MAG-TIN-001

The Tinnitus module SHALL represent the tinnitus clinical phenotype independently from audiological measurement.

## MAG-TIN-002

The module SHALL support explicit tinnitus laterality.

## MAG-TIN-003

Tinnitus distress/handicap and tinnitus loudness SHALL remain distinct outcome domains.

## MAG-TIN-004

Audiological measurement SHALL be represented through versioned canonical Measurement objects.

## MAG-TIN-005

Audiological equipment/calibration provenance SHALL be retained where clinically relevant.

## MAG-TIN-006

Tinnitus pitch matching SHALL retain measurement/repeatability uncertainty.

## MAG-TIN-007

Tinnitus pitch or loudness matching SHALL NOT independently generate a cortical treatment target.

## MAG-TIN-008

A hearing-loss pattern SHALL NOT autonomously generate an auditory-cortex target.

## MAG-TIN-009

Auditory, temporal, temporoparietal or frontal-temporal target hypotheses SHALL remain governed by Tinnitus-specific EvidencePaths.

## MAG-TIN-010

The initial Tinnitus targeting module SHALL remain Research-only until explicit Clinical promotion.

## MAG-TIN-011

A Research tinnitus candidate SHALL NOT enter a Clinical Target Slate.

## MAG-TIN-012

Material guideline-level negative evidence SHALL be readily visible in the Tinnitus evidence view.

## MAG-TIN-013

Material conflicting meta-analytic or trial evidence SHALL remain visible.

## MAG-TIN-014

MRI or functional-network abnormalities SHALL NOT override Research-only evidence status.

## MAG-TIN-015

Structural MRI and rs-fMRI SHALL not be required simply because the platform can process them.

## MAG-TIN-016

A failed Research imaging pathway SHALL NOT fall back to a generic auditory-cortex Clinical target.

## MAG-TIN-017

Durability uncertainty SHALL remain explicit where the supporting evidence is primarily short-term.

## MAG-TIN-018

Clinical target generation for tinnitus SHALL fail closed unless an approved Tinnitus Clinical module and Scientific Policy exist.

---

# 28. `MAG-OCD-*` — OCD REQUIREMENTS

## MAG-OCD-001

OCD target generation SHALL use OCD-specific EvidencePaths.

## MAG-OCD-002

OCD target evidence SHALL NOT automatically inherit from MDD merely because DLPFC anatomy overlaps.

## MAG-OCD-003

mPFC/ACC deep-TMS targets SHALL preserve `coil_field` geometry where the evidence is field/device defined.

## MAG-OCD-004

A field-defined OCD target SHALL NOT be downcast to a single point coordinate as its canonical scientific representation.

## MAG-OCD-005

The exact device/coil class SHALL be retained where evidence applicability depends on it.

## MAG-OCD-006

An incompatible device/coil SHALL fail the applicable target-geometry/evidence gate.

## MAG-OCD-007

mPFC/ACC field targets, pre-SMA/SMA targets and DLPFC targets SHALL remain scientifically distinct TargetFamilies where the evidence distinguishes them.

## MAG-OCD-008

MAGNIOM SHALL NOT represent one universal “best OCD target” without validated comparative evidence.

## MAG-OCD-009

Cross-family numerical ranking SHALL be prohibited unless a validated comparison domain explicitly permits it.

## MAG-OCD-010

Where efficacy evidence depends materially on symptom provocation or another treatment context, the context SHALL be explicitly represented.

## MAG-OCD-011

Absence or uncertainty of required treatment context SHALL produce the policy-defined limitation/gate outcome.

## MAG-OCD-012

Regulatory or clinical precedent for a specific deep-TMS device SHALL NOT automatically validate arbitrary focal targeting.

## MAG-OCD-013

rs-fMRI personalisation SHALL remain Research/Validation unless independently validated and authorised.

## MAG-OCD-014

Negative or protocol-specific null evidence SHALL remain visible when relevant.

## MAG-OCD-015

The Target Engine SHALL NOT infer frequency or other stimulation protocol from the selected OCD target.

## MAG-OCD-016

Research-only OCD TargetFamilies SHALL remain structurally separate from Clinical candidates.

## MAG-OCD-017

An OCD module SHALL require exact Scientific Policy permission before Clinical use.

## MAG-OCD-018

The specialist SHALL remain able to reject all OCD candidates regardless of algorithmic ordering.

---

# 29. PTSD IN v2

PTSD is included in the v2 scientific architecture but no dedicated `MAG-PTS-*` namespace is created in this baseline.

PTSD-specific behaviour SHALL therefore satisfy:

```text
MAG-IND-*
MAG-EVD-*
MAG-POL-*
MAG-MEA-*
MAG-TGT-*
```

plus module-defined requirements.

At minimum, PTSD implementations SHALL preserve:

* target-specific EvidencePaths;
* population applicability;
* conflicting population evidence;
* separation from MDD evidence;
* Research/Validation status until independently promoted.

A dedicated `MAG-PTS-*` namespace MAY be introduced in a later controlled SRS release without renumbering existing requirements.

---

# 30. VALIDATION REQUIREMENTS v2

## MAG-VAL-041

Each Indication Module SHALL have an independent validation status.

## MAG-VAL-042

Verification of the common Target Engine core SHALL NOT constitute clinical validation of every plugin.

## MAG-VAL-043

Clinical validation of one indication SHALL NOT be transferred to another indication.

## MAG-VAL-044

Measurement reliability validation SHALL be capability- and indication-specific.

## MAG-VAL-045

Every module SHALL have synthetic Golden Cases covering expected and failure pathways.

## MAG-VAL-046

Every module intended for Clinical use SHALL test incorrect-module selection.

## MAG-VAL-047

Every module intended for Clinical use SHALL test Research-to-Clinical leakage.

## MAG-VAL-048

Every lesion-dependent module SHALL test wrong laterality and lesion/target invalidation.

## MAG-VAL-049

Every refinement capability SHALL test reliable and unreliable measurement states.

## MAG-VAL-050

Every fallback pathway SHALL have a Golden Case.

## MAG-VAL-051

Every complete-abstention pathway SHALL have a Golden Case.

## MAG-VAL-052

Clinical-mode promotion SHALL require all Critical requirements applicable to the module to be verified.

## MAG-VAL-053

Module validation datasets SHALL be separated from development/tuning datasets.

## MAG-VAL-054

A locked validation analysis SHALL pin module, policy, Evidence Library, Target Engine and measurement pipeline releases.

## MAG-VAL-055

Silent prospective evaluation SHOULD precede unrestricted Clinical use where patient-specific target guidance could materially influence treatment.

## MAG-VAL-056

Human-factors validation SHALL assess clinician recognition of indication, mode, uncertainty and Research boundaries.

## MAG-VAL-057

Human-factors validation SHALL assess clinician ability to reject/override algorithmic Primary 1.

## MAG-VAL-058

A Clinical module SHALL not be promoted solely on the basis of technical target reproducibility.

## MAG-VAL-059

A Clinical module SHALL define the clinical/scientific evidence supporting its intended-purpose claim.

## MAG-VAL-060

If the required evidence for a module fails validation, that module SHALL remain Validation/Research regardless of the maturity of the wider product.

---

# 31. MODULE GOLDEN-CASE MINIMUMS

The v2 verification baseline SHALL include at least:

| Suite              | Minimum critical scenarios                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **MDD**            | evidence baseline; reliable FC; unreliable FC fallback; large displacement                                               |
| **OCD**            | field target; incompatible coil; alternative focal family; Research leakage                                              |
| **Pain**           | unilateral somatotopy; motor-map refinement; unreliable mapping; bilateral ambiguity                                     |
| **Stroke Motor**   | stage match; stage mismatch; lesion destroyed target; motor-map refinement; Research compensatory candidate              |
| **Stroke Aphasia** | chronic non-fluent path; phenotype mismatch; missing SLT context; task-fMRI failure                                      |
| **TBI**            | no target specificity; Research explicit target; skull defect; prohibited MDD inheritance                                |
| **PTSD**           | general population; population-specific conflict; prohibited MDD inheritance                                             |
| **Tinnitus**       | Research target; Clinical request denial; audiology complete; strong imaging abnormality cannot override evidence status |

---

# 32. NEW v2 CRITICAL HAZARD DRIVERS

The Risk Management File shall map requirements to at least the following v2 hazards:

```text
Wrong IndicationModuleRelease

Wrong CaseIndication

Cross-indication EvidencePath leakage

Cross-indication plugin/generator leakage

Research module shown as Clinical

Wrong lesion laterality

Wrong affected-body laterality

Destroyed cortex treated as valid target

Somatotopic target/body-region mismatch

Field target reduced to wrong point geometry

Incompatible coil/device applied to field-defined evidence

Unreliable motor map used for refinement

Task failure interpreted as absent brain function

Tractography interpreted as biological certainty

Tinnitus pitch converted directly into cortical target

Hidden multimodal fusion

Treatment-context mismatch omitted

Module upgrade silently changing historical target

Clinician automation bias across new indications
```

These do not replace the existing v1 hazard set; they extend it.

---

# 33. RELEASE MATURITY IS NOW MODULE-SPECIFIC

The v1 M0–M8 product maturity model remains useful, but v2 adds:

# module maturity.

For example:

```text
MAGNIOM application build        M6

MDD module                       Clinical-qualified
Pain module                      M5 silent prospective
Stroke motor module              M4 retrospective
OCD module                       M4 retrospective
TBI module                       M2 research
Tinnitus module                  M2 research
```

This is valid.

The application as a whole SHALL NOT imply that every visible module has reached the highest maturity of any one module.

---

# 34. CLINICAL RELEASE GATE v2

For each proposed Clinical `IndicationModuleRelease`, the Clinical Release Board SHALL determine:

### Software

Does the implementation satisfy applicable requirements?

### Evidence

Are the EvidencePaths scientifically appropriate for the intended claim?

### Measurement

Are required patient-specific measurements sufficiently qualified and reproducible?

### Algorithm

Are candidate generators, ranking/refinement and fallback behaviour validated?

### Human factors

Can clinicians recognise the module's evidence, uncertainty, limitations and mode?

### Risk

Are residual risks acceptable for the intended use?

### Security

Can scientific authority and patient data survive frontend/application failure?

### Regulatory/quality

Is the module's intended purpose appropriately supported and governed?

If any required gate fails:

# that module remains outside unrestricted Clinical Mode.

---

# 35. CROSS-INDICATION NON-TRANSFER RULE

The following implication is prohibited:

$$
Validated(MDD)
\Rightarrow
Validated(PTSD)
$$

or:

$$
Validated(M1,\ Pain)
\Rightarrow
Validated(M1,\ Stroke)
$$

or:

$$
Validated(rsFC,\ MDD)
\Rightarrow
Validated(rsFC,\ TBI).
$$

Anatomical overlap, software reuse and technical compatibility are not sufficient evidence of clinical transfer.

---

# 36. MULTIMODAL NON-TRANSFER RULE

Likewise:

$$
Measurement\ available
\not\Rightarrow
Measurement\ clinically\ relevant.
$$

and:

$$
Measurement\ reproducible
\not\Rightarrow
Target\ clinically\ effective.
$$

The multimodal v2 specification explicitly distinguishes measurement existence, QC, reproducibility, capability qualification and permission to influence Clinical Mode. 

---

# 37. PROHIBITED v2 SYSTEM BEHAVIOURS

MAGNIOM v2 SHALL NOT:

```text
diagnosis → target

lesion → target

most abnormal parcel → target

pain severity → target

tinnitus frequency → target

MEP absent → contralesional strategy

task activation → clinical target

tractography maximum → treatment target

MDD DLPFC evidence → TBI DLPFC authority

MDD connectivity algorithm → PTSD authority

same anatomy → same evidence

available plugin → Clinical permission

available measurement → ranking influence

Research module → Clinical Slate

unassigned Evidence Tier → implicit Clinical tier

field target → arbitrary point

somatotopic target → generic M1 coordinate

five candidate slots → five treatment targets

candidate slate → stimulation protocol
```

---

# 38. v2 TRACEABILITY EXAMPLE — STROKE

```text
MAG-STR-008
Target destroyed/absent by lesion shall not be treated
as normal intact cortex
        ↓
LesionContext + LesionTargetRelationship
        ↓
Stroke plugin G6 anatomy/lesion gate
        ↓
STR-GC-002
Destroyed ipsilesional M1
        ↓
Risk:
wrong target in structurally absent tissue
        ↓
Retrospective + synthetic verification
```

---

# 39. v2 TRACEABILITY EXAMPLE — PAIN

```text
MAG-PAI-009
Motor-map refinement requires qualified motor mapping
        ↓
MeasurementBundle
ReliabilityBundle
        ↓
PainMotorMapRefinementGenerator
        ↓
PAI-GC-003
Unreliable hotspot
        ↓
Risk:
false precision from unstable motor localisation
```

---

# 40. v2 TRACEABILITY EXAMPLE — OCD

```text
MAG-OCD-004
Field-defined target shall not be downcast to point target
        ↓
CoilFieldTargetGeometry
        ↓
OcdMpfcAccFieldGenerator
        ↓
OCD-GC-001
Field-target preservation
        ↓
Risk:
misrepresentation of evidence-defined stimulation geometry
```

---

# 41. v2 TRACEABILITY EXAMPLE — TINNITUS

```text
MAG-TIN-007
Tinnitus pitch match shall not independently create target
        ↓
AudiologyMeasurement
        ↓
No permitted Clinical candidate generator
        ↓
TIN-GC-003
Strong specific pitch / imaging finding
        ↓
Expected:
Research context only
```

---

# 42. VERIFICATION BASELINE

A MAGNIOM v2 Verification Build SHALL not exit formal verification until:

* all applicable Critical requirements have verification evidence;
* all v1 retained Critical requirements remain passing;
* each included module passes mode-separation tests;
* every Clinical module passes wrong-module tests;
* compatibility manifests reconstruct correctly;
* scientific hashes/signatures verify;
* cross-case integrity tests pass;
* cross-indication integrity tests pass;
* target geometry tests pass;
* laterality tests pass;
* required measurement reliability tests pass;
* fallback and abstention paths pass;
* signed decisions remain immutable;
* `MAG-UX-031` remains passing;
* human-factors test scenarios are implemented for all intended Clinical modules.

The original roadmap required the same basic discipline before retrospective validation: all critical requirements traced, golden cases passing, deterministic output, correct RLS, immutable decisions and reproducible scientific manifests. 

---

# 43. CLINICAL VALIDATION IS NOT A PLATFORM-WIDE BOOLEAN

MAGNIOM v2 shall represent:

```text
platform software verification
```

separately from:

```text
module scientific validation
```

separately from:

```text
module clinical release qualification.
```

Therefore:

```text
software verified = true
```

does **not** imply:

```text
tinnitus clinical = true
stroke clinical = true
TBI clinical = true.
```

---

# 44. CANONICAL SYSTEM REASONING MODEL v2

The v1 scientific model:

> Evidence constrains. Phenotype prioritises. Connectomics refines. Reliability qualifies. Anatomy constrains. E-field optimises. Alternatives expose uncertainty. The specialist decides.

now becomes the more general v2 model:

# Indication defines the scientific model.

↓

# Evidence constrains what may be considered.

↓

# Clinical objective defines what matters.

↓

# Disease, lesion and treatment context qualify applicability.

↓

# Qualified measurements may refine the hypothesis.

↓

# Reliability qualifies how much each measurement may influence it.

↓

# Target geometry preserves what would actually be stimulated.

↓

# Anatomy and device constraints determine feasibility.

↓

# E-field characterises or optimises where scientifically permitted.

↓

# Alternatives and counterfactuals expose uncertainty.

↓

# The specialist decides.

---

# 45. OVERARCHING v2 SRS

> **MAGNIOM SHALL provide an indication-specific, deterministic and scientifically governed clinical target-decision environment in which each targeting analysis is bound to an immutable `IndicationModuleRelease`, approved EvidencePaths, qualified patient measurements, applicable reliability rules and a complete Scientific Policy configuration; module-specific algorithms may construct competing target hypotheses, but no module, measurement, plugin or scientific capability may gain Clinical authority by technical availability alone, and final target selection shall remain an independent specialist decision.**

---

# 46. FINAL v2 REQUIREMENTS PRINCIPLE

The defining architectural transition from v1 to v2 is:

```text
v1:
Can MAGNIOM safely generate an MDD Target Slate?

v2:
For this exact indication,
under this exact indication-module release,
using this exact evidence,
these exact measurements,
these exact generators,
these exact scientific parameters,
and this exact validation state:

What is MAGNIOM scientifically permitted to do?
```

Only after that question resolves positively may the Target Engine produce a Clinical Target Slate.

> **One MAGNIOM platform may contain many indications. It shall never contain one undifferentiated scientific authority. Each indication earns its own evidence, its own measurement requirements, its own algorithm permissions, its own validation and its own right—if justified—to influence clinical care.**
