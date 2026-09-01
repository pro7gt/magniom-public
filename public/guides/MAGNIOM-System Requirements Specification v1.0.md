# MAGNIOM
## System Requirements Specification v1.0

**Document status:** Canonical system requirements baseline  
**Date:** 1 September 2026  
**Initial clinical indication:** Major depressive disorder ± clinically significant anxious distress  
**Initial deployment status:** Research / validation system  
**Target deployment status:** Regulated clinician-facing decision-support software  
**Primary user:** Appropriately trained TMS specialist  
**Primary clinical output:** Human-reviewable Target Slate  
**Final treatment authority:** Specialist clinician

---

# 1. PURPOSE

This System Requirements Specification defines the normative requirements that MAGNIOM shall satisfy as it progresses from:

```text
M0 — Design
through
M8 — Clinical Mode.
```

It converts the canonical MAGNIOM specifications into:

# stable, testable requirements.

Each requirement shall ultimately be traceable through:

```text
Requirement
    ↓
Design component
    ↓
Implementation
    ↓
Verification test
    ↓
Risk control
    ↓
Validation evidence
```

This document therefore forms the primary requirements baseline against which:

- software architecture;
- database design;
- Target Engine implementation;
- scientific-policy implementation;
- neuroimaging computation;
- evidence governance;
- clinician UX;
- security;
- verification;
- validation;
- release control

shall be assessed.

---

# 2. SOURCE DESIGN INPUTS

This SRS derives from:

1. MAGNIOM Clinical & Scientific Specification v1.0
2. MAGNIOM Canonical Target Data Specification v1.0
3. MAGNIOM Clinical Phenotype & Symptom-to-Circuit Ontology v1.0
4. MAGNIOM Clinician Workspace & UX Specification v1.0
5. MAGNIOM Evidence Knowledge Graph & Therapeutic Circuit Library v1.0
6. MAGNIOM Implementation & Validation Roadmap v1.0
7. MAGNIOM Neuroimaging & Functional Connectomics Pipeline Specification v1.0
8. MAGNIOM Supabase Database & Security Specification v1.0
9. MAGNIOM Target Engine & Ranking Algorithm Specification v1.0
10. MAGNIOM Technical Architecture v1.0
11. MAGNIOM Scientific Policy & Algorithm Configuration Specification v1.0

Where a conflict is discovered between this SRS and a canonical scientific specification, the conflict shall be resolved through controlled change management rather than by an implementation team silently choosing one interpretation.

---

# 3. NORMATIVE LANGUAGE

## SHALL

Mandatory and independently verifiable requirement.

## SHALL NOT

Mandatory prohibition.

## SHOULD

Recommended design requirement from which deviation requires documented rationale.

## MAY

Permitted optional behaviour.

Only:

# SHALL

and:

# SHALL NOT

statements are normative requirements for formal traceability unless subsequently promoted through change control.

---

# 4. REQUIREMENT ID STANDARD

Requirements use:

```text
MAG-<DOMAIN>-<NUMBER>
```

Canonical domains:

| Prefix | Domain |
|---|---|
| `MAG-SYS` | System-wide |
| `MAG-CLI` | Clinical workflow and authority |
| `MAG-PHE` | Phenotype |
| `MAG-EVD` | Evidence knowledge system |
| `MAG-POL` | Scientific Policy |
| `MAG-IMG` | Neuroimaging/connectomics |
| `MAG-TGT` | Target Engine |
| `MAG-UX` | Clinician workspace/human factors |
| `MAG-DAT` | Canonical data/integrity |
| `MAG-SEC` | Security/privacy |
| `MAG-WFL` | Workflow/jobs/state transitions |
| `MAG-AUD` | Audit/provenance |
| `MAG-REL` | Release/version/configuration |
| `MAG-VAL` | Verification and validation |

IDs are immutable.

A deleted requirement shall be marked:

```text
retired
```

rather than renumbered.

---

# 5. REQUIREMENT ATTRIBUTES

Every controlled requirement shall eventually carry:

```ts
interface MagniomRequirement {
  id: string;
  statement: string;

  source_specification: string[];
  rationale?: string;

  safety_class:
    | "critical"
    | "major"
    | "standard";

  applies_to_mode:
    | "all"
    | "clinical"
    | "research"
    | "validation";

  verification_method:
    | "inspection"
    | "analysis"
    | "unit_test"
    | "integration_test"
    | "security_test"
    | "golden_case"
    | "scientific_verification"
    | "human_factors"
    | "clinical_validation";

  risk_control_ids?: string[];
  verification_test_ids?: string[];
  validation_evidence_ids?: string[];

  status:
    | "draft"
    | "approved"
    | "implemented"
    | "verified"
    | "validated"
    | "retired";
}
```

---

# 6. VERIFICATION METHOD CODES

For compact traceability:

```text
I   Inspection
A   Analysis
UT  Unit Test
IT  Integration Test
ST  Security Test
GC  Golden Case
SV  Scientific Verification
HF  Human-Factors Validation
CV  Clinical Validation
```

Multiple methods may apply.

---

# 7. SAFETY CLASS

## Critical

Failure could contribute to:

- wrong clinical target;
- wrong laterality;
- clinically inappropriate Research/Clinical crossover;
- incorrect patient/case association;
- materially false scientific authority;
- clinically significant data corruption;
- unauthorised clinical-data disclosure.

## Major

Failure could materially mislead clinical interpretation or undermine a clinically important workflow.

## Standard

Failure has no reasonably foreseeable direct clinically significant effect but remains a controlled product requirement.

---

# 8. SYSTEM-WIDE REQUIREMENTS

| ID | Requirement | Class | Verify |
|---|---|---:|---|
| MAG-SYS-001 | MAGNIOM SHALL operate as clinician-facing decision support rather than autonomous treatment prescription. | Critical | I, HF |
| MAG-SYS-002 | MAGNIOM SHALL maintain clinician authority separately from algorithmic candidate generation. | Critical | IT, HF |
| MAG-SYS-003 | MAGNIOM SHALL distinguish scientific evidence, patient-specific observation, algorithmic inference and clinician decision as separate information classes. | Critical | I, IT |
| MAG-SYS-004 | MAGNIOM SHALL preserve Clinical Mode and Research Mode as structurally distinct modes. | Critical | IT, ST |
| MAG-SYS-005 | Research Mode output SHALL NOT influence clinical treatment unless formally promoted and authorised through the Clinical Mode governance pathway. | Critical | IT, ST |
| MAG-SYS-006 | MAGNIOM SHALL support deterministic reconstruction of every published Target Slate. | Critical | GC, SV |
| MAG-SYS-007 | MAGNIOM SHALL record exact versions of all scientific components capable of influencing a Target Slate. | Critical | IT |
| MAG-SYS-008 | Historical clinical outputs SHALL NOT silently change when scientific software, evidence or configuration changes. | Critical | IT |
| MAG-SYS-009 | MAGNIOM SHALL support scientifically valid abstention and fallback results. | Critical | GC |
| MAG-SYS-010 | MAGNIOM SHALL NOT require a target merely because the interface or schema contains target positions. | Major | GC, HF |
| MAG-SYS-011 | MAGNIOM SHALL NOT represent patient-specific targeting as inherently superior to high-quality evidence-based standard targeting. | Major | I, HF |
| MAG-SYS-012 | MAGNIOM SHALL expose uncertainty relevant to clinical interpretation. | Major | IT, HF |
| MAG-SYS-013 | MAGNIOM SHALL maintain sufficient provenance for an authorised reviewer to reconstruct why a target was generated. | Critical | IT, SV |
| MAG-SYS-014 | Scientific behaviour SHALL NOT depend on undocumented runtime state. | Critical | GC |
| MAG-SYS-015 | Software completion SHALL NOT by itself constitute clinical validation or permission for Clinical Mode deployment. | Critical | I |

---

# 9. CLINICAL REQUIREMENTS

| ID | Requirement | Class | Verify |
|---|---|---:|---|
| **MAG-CLI-001** | **A clinician-approved PhenotypeSnapshot SHALL be required before Clinical Mode target generation.** | Critical | IT |
| MAG-CLI-002 | The initial Clinical Mode indication SHALL be restricted to the approved MDD indication scope. | Critical | GC |
| MAG-CLI-003 | MAGNIOM SHALL NOT autonomously diagnose major depressive disorder. | Critical | I, HF |
| MAG-CLI-004 | MAGNIOM SHALL NOT independently determine whether TMS is clinically indicated. | Critical | I, HF |
| MAG-CLI-005 | MAGNIOM SHALL NOT replace TMS safety assessment. | Critical | I, HF |
| MAG-CLI-006 | Final target selection SHALL be stored separately from the Target Slate. | Critical | IT |
| MAG-CLI-007 | Final clinical target selection SHALL require an authorised clinician. | Critical | IT, ST |
| MAG-CLI-008 | A clinician SHALL be able to reject every MAGNIOM candidate. | Major | IT, HF |
| MAG-CLI-009 | A clinician SHALL be able to select an evidence-supported target not ranked first by MAGNIOM. | Major | IT, HF |
| MAG-CLI-010 | A clinician SHALL be able to select no TMS target. | Major | IT |
| MAG-CLI-011 | A clinician SHALL be able to document reasoning for modifying or rejecting candidate targets. | Major | IT |
| MAG-CLI-012 | A signed ClinicianDecision SHALL identify the Target Slate on which the decision was based. | Critical | IT |
| MAG-CLI-013 | A signed ClinicianDecision SHALL identify the authorised clinician responsible for the decision. | Critical | IT |
| MAG-CLI-014 | Every candidate reviewed in a signed decision SHALL have an explicit clinician disposition. | Major | IT |
| MAG-CLI-015 | A signed ClinicianDecision SHALL be immutable. | Critical | IT, ST |
| MAG-CLI-016 | A changed phenotype SHALL NOT mutate an existing Target Slate. | Critical | IT |
| MAG-CLI-017 | Clinically material phenotype changes SHALL require a new Target Slate if updated targeting is requested. | Major | IT |
| MAG-CLI-018 | Clinical Mode SHALL expose the evidence-only targeting counterfactual where applicable. | Major | HF |
| MAG-CLI-019 | MAGNIOM SHALL distinguish a Target Slate from a treatment prescription in clinician-facing presentation. | Critical | HF |
| MAG-CLI-020 | MAGNIOM SHALL NOT autonomously determine stimulation protocol, frequency, dose, intensity, pulse number or accelerated schedule. | Critical | I, HF |

---

# 10. PHENOTYPE REQUIREMENTS

| ID | Requirement | Class | Verify |
|---|---|---:|---|
| MAG-PHE-001 | MAGNIOM SHALL represent diagnosis separately from dimensional phenotype. | Major | UT |
| MAG-PHE-002 | Phenotype data SHALL retain source provenance. | Major | UT |
| MAG-PHE-003 | Symptom observations SHALL remain distinguishable from canonical symptom concepts. | Major | UT |
| MAG-PHE-004 | Canonical symptom concepts SHALL remain distinguishable from clinical symptom domains. | Major | UT |
| MAG-PHE-005 | Clinical symptom domains SHALL remain distinguishable from clinician-approved therapeutic priorities. | Major | UT |
| MAG-PHE-006 | Symptom-to-circuit mappings SHALL require evidence-permitted mappings rather than direct questionnaire-to-target conversion. | Critical | GC |
| MAG-PHE-007 | Baseline questionnaire totals SHALL NOT be treated as direct measurements of therapeutic circuits. | Critical | GC |
| MAG-PHE-008 | Clinical Mode SHALL restrict circuit-influencing phenotype domains to those permitted by the active scientific evidence and policy. | Critical | GC |
| MAG-PHE-009 | The initial Clinical Mode phenotype ontology SHALL support dysphoric and anxiosomatic evidence-permitted circuit domains. | Major | UT |
| MAG-PHE-010 | Other symptom domains MAY be represented clinically without necessarily influencing circuit-specific targeting. | Standard | UT |
| MAG-PHE-011 | A PhenotypeSnapshot SHALL be immutable after approval. | Critical | IT |
| MAG-PHE-012 | The snapshot SHALL identify the clinical assessment and source observations from which it was derived. | Major | IT |
| MAG-PHE-013 | The snapshot SHALL identify clinician-approved treatment priorities. | Major | IT |
| MAG-PHE-014 | Diagnostic uncertainty SHALL be representable. | Major | UT |
| MAG-PHE-015 | Clinically material safety state SHALL be representable independently of circuit eligibility. | Critical | UT |
| MAG-PHE-016 | The Target Engine SHALL consume an immutable PhenotypeSnapshot rather than mutable live observations. | Critical | IT |
| MAG-PHE-017 | A questionnaire item SHALL NOT independently generate a clinical target. | Critical | GC |
| MAG-PHE-018 | Missing or incomplete phenotype data SHALL be explicitly represented rather than inferred as absence of symptoms. | Major | UT |

---

# 11. EVIDENCE KNOWLEDGE REQUIREMENTS

| ID | Requirement | Class | Verify |
|---|---|---:|---|
| MAG-EVD-001 | Clinical target generation SHALL use a versioned EvidenceLibraryRelease. | Critical | IT |
| MAG-EVD-002 | Clinical target generation SHALL NOT consume arbitrary latest evidence rows. | Critical | IT |
| MAG-EVD-003 | An active EvidenceLibraryRelease SHALL be immutable. | Critical | ST, IT |
| MAG-EVD-004 | EvidenceClaims SHALL be narrower canonical propositions rather than mere references to publications. | Major | I |
| MAG-EVD-005 | Each clinical EvidenceClaim SHALL retain supporting source provenance. | Critical | UT |
| MAG-EVD-006 | EvidenceClaims SHALL support conflicting evidence relationships. | Major | UT |
| MAG-EVD-007 | Negative or contradictory evidence SHALL remain queryable. | Major | IT |
| MAG-EVD-008 | Every Clinical Mode TargetFamily SHALL have a complete approved evidence path. | Critical | GC |
| MAG-EVD-009 | A patient imaging abnormality SHALL NOT create its own Clinical Mode evidence path. | Critical | GC |
| MAG-EVD-010 | Clinical TargetFamilies SHALL be constrained by approved populations and indication scope. | Critical | GC |
| MAG-EVD-011 | TargetingStrategy eligibility SHALL be separately governable from TargetFamily eligibility. | Critical | GC |
| MAG-EVD-012 | Evidence tier SHALL function as a governance/eligibility category rather than an assumed linear biological probability. | Major | UT |
| MAG-EVD-013 | Tier D evidence SHALL NOT independently enter Clinical Mode ranking under v1 policy. | Critical | GC |
| MAG-EVD-014 | Tier R evidence SHALL NOT enter Clinical Mode ranking. | Critical | GC |
| MAG-EVD-015 | Tier C SHALL NOT automatically become a standalone Clinical Mode primary candidate. | Critical | GC |
| MAG-EVD-016 | Tier C use SHALL be limited to roles explicitly authorised by ScientificPolicyRelease. | Critical | GC |
| MAG-EVD-017 | New literature SHALL enter staging/review rather than automatically altering active clinical evidence. | Major | IT |
| MAG-EVD-018 | LLM assistance SHALL NOT autonomously approve an EvidenceClaim. | Critical | IT |
| MAG-EVD-019 | LLM assistance SHALL NOT autonomously assign final Evidence Tier. | Critical | IT |
| MAG-EVD-020 | LLM assistance SHALL NOT autonomously promote a TargetFamily into Clinical Mode. | Critical | IT |
| MAG-EVD-021 | Clinically material evidence changes SHALL undergo independent review. | Major | I |
| MAG-EVD-022 | Evidence may be downgraded as well as upgraded. | Major | IT |
| MAG-EVD-023 | Retracted sources SHALL remain in historical provenance but SHALL trigger review of materially dependent claims. | Major | IT |
| MAG-EVD-024 | Clinical circuit/search-space artefacts SHALL carry immutable content hashes. | Critical | IT |
| MAG-EVD-025 | Clinical spatial evidence artefacts SHALL be validated for coordinate space, orientation and laterality before activation. | Critical | SV |

---

# 12. SCIENTIFIC POLICY REQUIREMENTS

| ID | Requirement | Class | Verify |
|---|---|---:|---|
| MAG-POL-001 | Every clinically meaningful scientific configuration SHALL reference one ScientificPolicyRelease. | Critical | IT |
| MAG-POL-002 | ScientificPolicyRelease SHALL be versioned and immutable after activation. | Critical | IT |
| MAG-POL-003 | Scientific Policy SHALL remain distinct from engineering configuration. | Major | I |
| MAG-POL-004 | Any configuration capable of altering candidate generation, eligibility, coordinates, reliability, ranking, suppression or abstention SHALL be treated as scientific configuration. | Critical | I, UT |
| MAG-POL-005 | Scientific ranking parameters SHALL NOT be editable through ordinary production administration interfaces. | Critical | ST |
| MAG-POL-006 | Clinical Mode SHALL use explicit positive scientific-component compatibility. | Critical | GC |
| MAG-POL-007 | Clinical compatibility SHALL NOT be inferred merely because individual components are each active. | Critical | GC |
| MAG-POL-008 | Clinical Mode SHALL validate the complete relevant compatibility tuple before target generation. | Critical | IT |
| MAG-POL-009 | The compatibility tuple SHALL include EvidenceLibraryRelease, TargetEngineVersion, PipelineVersion where applicable, NormativeModelVersion where applicable, EFieldEngineVersion where applicable, indication and mode. | Critical | IT |
| MAG-POL-010 | Scientific component versions SHALL be referenced through immutable identities rather than `latest` selectors. | Critical | IT |
| MAG-POL-011 | Scientific Policy SHALL define role-aware evidence eligibility. | Critical | GC |
| MAG-POL-012 | Scientific Policy SHALL define minimum personalisation reliability. | Critical | UT |
| MAG-POL-013 | Scientific Policy SHALL define applicable personalisation-adoption criteria. | Major | UT |
| MAG-POL-014 | Scientific Policy SHALL define role-specific ranking parameters. | Major | UT |
| MAG-POL-015 | Every scientific parameter SHALL have a controlled value and, where appropriate, validated bounds. | Critical | UT |
| MAG-POL-016 | A parameter outside its permitted bounds SHALL cause configuration rejection rather than silent clamping. | Critical | GC |
| MAG-POL-017 | Scientific Policy SHALL define prohibited configurations. | Critical | UT |
| MAG-POL-018 | Clinical Mode SHALL fail closed when scientific configuration integrity cannot be established. | Critical | GC |
| MAG-POL-019 | Scientific Policy SHALL distinguish feature fallback from complete Target Slate abstention. | Major | GC |
| MAG-POL-020 | An active Clinical ScientificPolicyRelease SHALL carry integrity hashes. | Critical | IT |
| MAG-POL-021 | Clinical activation SHALL require appropriate governance approval. | Critical | IT |
| MAG-POL-022 | Governance approval SHALL be distinguishable from cryptographic integrity/signature evidence. | Major | IT |
| MAG-POL-023 | Changes to ranking-relevant policy parameters SHALL require a new ScientificPolicyRelease. | Critical | IT |
| MAG-POL-024 | Scientific policy changes SHALL NOT retrospectively mutate existing Target Slates. | Critical | IT |
| MAG-POL-025 | ScientificPolicyRelease SHALL record validation maturity separately from lifecycle status. | Major | UT |
| MAG-POL-026 | Clinical activation SHALL NOT be achievable solely by changing a `mode` or status flag. | Critical | ST |
| MAG-POL-027 | Organisation-specific scientific overrides SHALL NOT be permitted without a separately controlled and validated ScientificPolicyRelease. | Critical | ST |
| MAG-POL-028 | Clinical outcomes SHALL NOT automatically update scientific policy parameters. | Critical | IT |
| MAG-POL-029 | Scientific Policy SHALL explicitly define the role of normative modelling. | Major | UT |
| MAG-POL-030 | Scientific Policy SHALL explicitly define the permitted role of E-field modelling. | Major | UT |

---

# 13. NEUROIMAGING AND CONNECTOMICS REQUIREMENTS

| ID | Requirement | Class | Verify |
|---|---|---:|---|
| MAG-IMG-001 | The neuroimaging pipeline SHALL produce measurements rather than final clinical decisions. | Critical | I |
| MAG-IMG-002 | Structural MRI and resting-state fMRI inputs SHALL retain immutable source provenance. | Critical | IT |
| MAG-IMG-003 | Original imaging artefacts SHALL NOT be overwritten during processing. | Major | IT |
| MAG-IMG-004 | Every processing run SHALL reference an immutable PipelineVersion. | Critical | IT |
| MAG-IMG-005 | Every Clinical Mode processing run SHALL record its input manifest. | Critical | IT |
| MAG-IMG-006 | Every Clinical Mode processing run SHALL record immutable hashes for required inputs and outputs. | Critical | IT |
| MAG-IMG-007 | Clinical scientific containers SHALL be version-pinned. | Critical | IT |
| MAG-IMG-008 | Mutable container tags alone SHALL NOT constitute scientific provenance. | Major | I |
| MAG-IMG-009 | Clinical imaging preprocessing SHALL follow the approved Primary Clinical Pipeline. | Critical | SV |
| MAG-IMG-010 | Alternative preprocessing SHALL NOT silently replace the Primary Clinical Pipeline. | Critical | GC |
| MAG-IMG-011 | Sensitivity processing SHALL be used to assess methodological robustness rather than select a preferred target opportunistically. | Critical | SV |
| MAG-IMG-012 | Patient-specific connectomic measurements SHALL NOT influence Clinical Mode unless required QC gates are satisfied. | Critical | GC |
| MAG-IMG-013 | Failed connectomic QC SHALL disable patient-specific FC influence. | Critical | GC |
| MAG-IMG-014 | Connectomic failure SHALL NOT automatically prevent evidence-only targeting where evidence-only generation remains clinically valid. | Major | GC |
| MAG-IMG-015 | Registration quality SHALL be recorded. | Major | IT |
| MAG-IMG-016 | Segmentation quality SHALL be recorded. | Major | IT |
| MAG-IMG-017 | Parcel/surface coverage quality SHALL be recorded where applicable. | Major | IT |
| MAG-IMG-018 | Motion-related QC SHALL be recorded. | Major | IT |
| MAG-IMG-019 | Usable resting-state acquisition duration SHALL be recorded. | Major | IT |
| MAG-IMG-020 | Pipeline output SHALL distinguish spatial coordinate precision from localisation reliability. | Major | HF, SV |
| MAG-IMG-021 | Subject-to-standard coordinate transforms SHALL retain provenance. | Critical | SV |
| MAG-IMG-022 | Coordinate-space conversions SHALL undergo dedicated verification. | Critical | SV |
| MAG-IMG-023 | Laterality SHALL be explicitly verified during imaging validation. | Critical | SV |
| MAG-IMG-024 | Clinical TargetFamily search masks SHALL undergo spatial validation before activation. | Critical | SV |
| MAG-IMG-025 | Target reliability SHALL include applicable cross-run localisation assessment. | Major | SV |
| MAG-IMG-026 | Target reliability SHALL include applicable pipeline-sensitivity information. | Major | SV |
| MAG-IMG-027 | Target reliability SHALL retain the PipelineVersion on which it was calculated. | Critical | IT |
| **MAG-IMG-028** | **Target reliability SHALL include split-half localisation when technically applicable.** | Major | SV |
| MAG-IMG-029 | Reliability-limiting factors SHALL be recorded. | Major | IT |
| MAG-IMG-030 | A TargetReliabilityProfile used by a published Clinical Target Slate SHALL be immutable. | Critical | IT |
| MAG-IMG-031 | A NormativeModelVersion SHALL declare compatible processing. | Critical | UT |
| MAG-IMG-032 | Clinical Mode SHALL reject an incompatible normative-model/pipeline combination. | Critical | GC |
| MAG-IMG-033 | Normative abnormality SHALL NOT independently create a Clinical Mode target unless a future validated Scientific Policy explicitly authorises that role. | Critical | GC |
| MAG-IMG-034 | Normative Model updates SHALL NOT silently change historical normative findings. | Major | IT |
| MAG-IMG-035 | Pipeline upgrades SHALL require reproducibility and target-displacement assessment before Clinical Mode activation. | Critical | SV |
| MAG-IMG-036 | Clinical pipeline software SHALL NOT update automatically merely because newer upstream packages exist. | Critical | ST |
| MAG-IMG-037 | E-field modelling SHALL retain solver, head-model, segmentation, conductivity and coil provenance. | Major | IT |
| MAG-IMG-038 | E-field output SHALL NOT be treated as direct proof of clinical efficacy. | Major | HF |
| MAG-IMG-039 | E-field ranking influence SHALL occur only when enabled by Scientific Policy. | Critical | GC |
| MAG-IMG-040 | Incomplete E-field availability across otherwise comparable candidates SHALL NOT create ranking advantage. | Critical | GC |

---

# 14. TARGET ENGINE REQUIREMENTS

| ID | Requirement | Class | Verify |
|---|---|---:|---|
| MAG-TGT-001 | Target Engine Clinical Mode ranking SHALL be deterministic. | Critical | GC |
| MAG-TGT-002 | Target Engine SHALL NOT use random sampling in Clinical Mode. | Critical | GC |
| MAG-TGT-003 | Target Engine SHALL NOT depend on live internet search for Clinical Mode ranking. | Critical | GC |
| MAG-TGT-004 | Target Engine SHALL NOT depend on live PubMed search for Clinical Mode ranking. | Critical | GC |
| MAG-TGT-005 | Target Engine SHALL NOT depend on LLM output for Clinical Mode candidate eligibility or ranking. | Critical | GC |
| MAG-TGT-006 | Target Engine SHALL NOT depend on undocumented clinician preference. | Critical | GC |
| MAG-TGT-007 | Target Engine SHALL use gates before compensable scores. | Critical | GC |
| MAG-TGT-008 | A candidate failing a mandatory scientific gate SHALL NOT become eligible through a high score in another dimension. | Critical | GC |
| MAG-TGT-009 | Every Clinical Mode candidate SHALL derive from an eligible TargetFamily contained in the pinned EvidenceLibraryRelease. | Critical | GC |
| MAG-TGT-010 | Target Engine SHALL verify indication scope before clinical candidate generation. | Critical | GC |
| MAG-TGT-011 | Target Engine SHALL verify mode compatibility before candidate eligibility. | Critical | GC |
| MAG-TGT-012 | Patient-specific FC SHALL influence ranking only after imaging/reliability qualification. | Critical | GC |
| MAG-TGT-013 | Connectome-refined candidates SHALL remain within evidence-permitted target-generation spaces. | Critical | GC |
| **MAG-TGT-014** | **A Clinical connectome-refined candidate SHALL require a TargetReliabilityProfile.** | Critical | IT |
| MAG-TGT-015 | Low reliability SHALL prevent FC-driven promotion according to the active policy. | Critical | GC |
| MAG-TGT-016 | The engine SHALL preserve an evidence-only counterfactual where personalisation is evaluated. | Major | GC |
| MAG-TGT-017 | Personalisation SHALL NOT automatically replace its evidence-only baseline. | Critical | GC |
| MAG-TGT-018 | Personalisation adoption SHALL satisfy all active Scientific Policy conditions. | Critical | GC |
| MAG-TGT-019 | Failure of personalisation adoption SHALL retain an eligible evidence baseline where appropriate. | Major | GC |
| MAG-TGT-020 | Target utility SHALL NOT be represented as response probability. | Major | HF |
| MAG-TGT-021 | Target utility SHALL NOT be represented as biological certainty. | Major | HF |
| MAG-TGT-022 | Evidence Tier SHALL NOT be included as a simple compensable scalar in candidate utility. | Critical | UT |
| MAG-TGT-023 | Candidate utility SHALL be calculated only after applicable hard gates pass. | Critical | UT |
| MAG-TGT-024 | Utility dimensions SHALL be candidate-class/role appropriate. | Major | UT |
| MAG-TGT-025 | Raw utility values SHALL NOT be globally compared across scientifically incompatible candidate classes. | Major | GC |
| MAG-TGT-026 | Evidence-only missing connectomic dimensions SHALL NOT be represented as zero values that unfairly penalise the baseline. | Major | UT |
| MAG-TGT-027 | Anatomically unstimulable candidates SHALL be excluded from Clinical Mode eligibility. | Critical | GC |
| MAG-TGT-028 | Conditional accessibility SHALL be handled according to active Scientific Policy. | Major | GC |
| MAG-TGT-029 | Candidate redundancy SHALL be assessed using versioned criteria. | Major | GC |
| MAG-TGT-030 | Redundancy logic SHALL NOT treat convergent evidence paths as automatically independent treatment targets. | Major | GC |
| MAG-TGT-031 | Target Slate SHALL contain no more than three Primary Candidates. | Major | UT |
| MAG-TGT-032 | Target Slate SHALL contain no more than two Additional Candidates. | Major | UT |
| MAG-TGT-033 | Target Engine SHALL NOT generate candidates merely to fill five positions. | Major | GC |
| MAG-TGT-034 | Research-only candidates SHALL NOT appear in a Clinical Mode Target Slate. | Critical | GC |
| MAG-TGT-035 | Suppressed candidates SHALL remain reconstructable for validation and audit. | Major | IT |
| MAG-TGT-036 | Suppression SHALL include structured suppression reasons. | Major | UT |
| MAG-TGT-037 | Every Clinical Mode candidate SHALL retain its evidence basis. | Critical | IT |
| MAG-TGT-038 | Every Clinical Mode candidate SHALL retain its ranking features necessary for reconstruction. | Major | IT |
| MAG-TGT-039 | Every candidate SHALL contain uncertainty information. | Major | UT |
| MAG-TGT-040 | Every candidate SHALL contain at least one counterargument or explicit statement of limitations. | Major | UT |
| MAG-TGT-041 | Candidate explanation SHALL answer why the candidate was nominated. | Major | HF |
| MAG-TGT-042 | Candidate explanation SHALL identify what patient imaging contributed, if anything. | Major | HF |
| MAG-TGT-043 | Candidate explanation SHALL identify measurement reliability. | Major | HF |
| MAG-TGT-044 | Candidate explanation SHALL expose the relevant counterfactual. | Major | HF |
| MAG-TGT-045 | Clinical Mode candidate explanation SHALL derive from canonical structured facts. | Major | UT |
| MAG-TGT-046 | An LLM used for later prose rendering SHALL NOT alter evidence, rank, mandatory limitations or uncertainty. | Critical | IT |
| MAG-TGT-047 | Target Engine SHALL support explicit abstention profiles. | Major | GC |
| MAG-TGT-048 | Defined hard-gate failure SHALL produce the specified abstention/fallback behaviour. | Critical | GC |
| MAG-TGT-049 | Target Engine SHALL NOT prescribe a stimulation protocol. | Critical | I |
| MAG-TGT-050 | Target Engine output SHALL be reproducible from its version manifest and immutable inputs. | Critical | GC, SV |

---

# 15. CLINICIAN WORKSPACE / HUMAN-FACTORS REQUIREMENTS

| ID | Requirement | Class | Verify |
|---|---|---:|---|
| MAG-UX-001 | The primary clinician workflow SHALL centre on Cases. | Standard | I |
| MAG-UX-002 | The workflow SHALL present clinical formulation before algorithmic target output. | Critical | HF |
| MAG-UX-003 | The clinician SHALL approve phenotype before seeing a newly generated Target Slate. | Critical | IT, HF |
| MAG-UX-004 | The workspace SHALL keep evidence visible or readily inspectable for each candidate. | Major | HF |
| MAG-UX-005 | A personalised coordinate SHALL NOT be presented without corresponding reliability information. | Critical | HF |
| MAG-UX-006 | The evidence-only counterfactual SHALL remain accessible during candidate review. | Major | HF |
| MAG-UX-007 | Alternative candidates SHALL remain inspectable and SHALL NOT be visually erased by Primary Candidate 1. | Major | HF |
| MAG-UX-008 | The workspace SHALL distinguish algorithmic ranking from clinical authority. | Critical | HF |
| MAG-UX-009 | The interface SHALL distinguish Research Mode from Clinical Mode. | Critical | HF |
| MAG-UX-010 | Mode state SHALL be clearly visible when viewing research output capable of resembling clinical output. | Critical | HF |
| MAG-UX-011 | Clinicians SHALL be able to inspect why personalisation changed or did not change the target. | Major | HF |
| MAG-UX-012 | Clinicians SHALL be able to inspect the strongest counterargument against each candidate. | Major | HF |
| MAG-UX-013 | Clinicians SHALL be able to inspect source evidence supporting a candidate. | Major | HF |
| MAG-UX-014 | Clinicians SHALL be able to inspect material evidence conflicts. | Major | HF |
| MAG-UX-015 | Clinicians SHALL be able to distinguish measurement reliability from coordinate precision. | Critical | HF |
| MAG-UX-016 | Clinicians SHALL be able to recognise when personalisation was unavailable because of imaging limitations. | Major | HF |
| MAG-UX-017 | The workspace SHALL display evidence-only fallback when patient-specific FC is not qualified but evidence targeting remains valid. | Major | HF |
| MAG-UX-018 | The interface SHALL support active clinician rejection of candidates. | Major | HF |
| MAG-UX-019 | The interface SHALL support modification of candidate choice with reasoning. | Major | HF |
| MAG-UX-020 | The interface SHALL support explicit no-target decisions. | Major | HF |
| MAG-UX-021 | Candidate ranking SHALL NOT be visually represented as certainty or response probability. | Major | HF |
| MAG-UX-022 | The workspace SHALL NOT describe a candidate as an “optimal target” unless future validated claims explicitly permit such wording. | Critical | HF |
| MAG-UX-023 | Clinician-facing explanations SHALL include important limitations. | Major | HF |
| MAG-UX-024 | Clinician-facing explanations SHALL not omit contradictory evidence merely because it weakens the top-ranked candidate. | Major | HF |
| MAG-UX-025 | The clinician SHALL be able to compare candidates directly. | Standard | HF |
| MAG-UX-026 | Target visualisation SHALL identify coordinate space and laterality where clinically relevant. | Critical | HF |
| MAG-UX-027 | Target visualisation SHALL distinguish target centre, ROI/confidence region and relevant overlays where available. | Major | HF |
| MAG-UX-028 | Stale or superseded Target Slates SHALL be distinguishable from the current reviewable slate. | Critical | HF |
| MAG-UX-029 | The system SHALL prevent accidental signing against a stale/superseded slate. | Critical | IT, HF |
| MAG-UX-030 | Candidate review SHALL require active clinician reasoning rather than passive confirmation alone. | Major | HF |
| **MAG-UX-031** | **No target candidate SHALL be preselected for clinician acceptance.** | Critical | HF |
| MAG-UX-032 | The interface SHALL NOT provide a generic “Accept MAGNIOM recommendation” action. | Critical | HF |
| MAG-UX-033 | Human-factors validation SHALL test clinician ability to safely override Primary Candidate 1. | Critical | HF |
| MAG-UX-034 | Human-factors validation SHALL test clinician recognition of low-reliability personalisation. | Critical | HF |
| MAG-UX-035 | Human-factors validation SHALL test understanding that the Target Slate is not a prescription. | Critical | HF |
| MAG-UX-036 | Human-factors validation SHALL test recognition of Research Mode. | Critical | HF |
| MAG-UX-037 | Human-factors validation SHALL test recognition of stale Target Slates. | Critical | HF |
| MAG-UX-038 | Critical user tasks SHALL have no unacceptable residual use-related risk before Clinical Mode release. | Critical | HF |

---

# 16. CANONICAL DATA REQUIREMENTS

| ID | Requirement | Class | Verify |
|---|---|---:|---|
| MAG-DAT-001 | Canonical domain entities SHALL use immutable unique identities. | Major | UT |
| MAG-DAT-002 | Mutable facts SHALL NOT be encoded into primary IDs. | Major | UT |
| MAG-DAT-003 | Machine timestamps SHALL use ISO 8601 UTC. | Standard | UT |
| MAG-DAT-004 | Historical event time and persistence/write time SHALL remain distinguishable where relevant. | Major | UT |
| MAG-DAT-005 | Scientific and algorithmic artefacts SHALL retain explicit version identity. | Critical | IT |
| MAG-DAT-006 | Historical Target Slates SHALL retain all scientific versions necessary for reconstruction. | Critical | IT |
| MAG-DAT-007 | Every TargetCandidate SHALL have case context. | Critical | UT |
| MAG-DAT-008 | Reusable scientific objects SHALL remain distinct from patient-specific objects. | Major | UT |
| MAG-DAT-009 | Patient findings SHALL NOT silently become reusable scientific evidence. | Critical | IT |
| MAG-DAT-010 | TargetCandidate SHALL include target definition, evidence basis, uncertainty and clinical rationale. | Major | UT |
| MAG-DAT-011 | TargetCandidate SHALL retain counterarguments. | Major | UT |
| MAG-DAT-012 | TargetReliabilityProfile SHALL identify the applicable imaging/connectome run. | Critical | UT |
| MAG-DAT-013 | TargetSlate SHALL reference the immutable candidate objects it contains. | Critical | IT |
| MAG-DAT-014 | TargetSlate SHALL contain a reproducibility/version manifest or reference thereto. | Critical | IT |
| MAG-DAT-015 | Published TargetSlate payload SHALL be integrity-hashed. | Critical | IT |
| MAG-DAT-016 | ClinicianDecision SHALL remain a separate canonical aggregate from TargetSlate. | Critical | UT |
| MAG-DAT-017 | Clinical snapshots SHALL be immutable after approval/publication. | Critical | ST |
| MAG-DAT-018 | Data quality state SHALL distinguish verified, reviewed, unverified, incomplete and invalid information where applicable. | Major | UT |
| MAG-DAT-019 | Core clinical semantics SHALL NOT be hidden solely inside arbitrary unstructured JSON payloads. | Major | I |
| MAG-DAT-020 | Spatial coordinates SHALL include explicit coordinate-space provenance. | Critical | UT |

---

# 17. SECURITY REQUIREMENTS

| ID | Requirement | Class | Verify |
|---|---|---:|---|
| MAG-SEC-001 | MAGNIOM SHALL authenticate clinical users before access to patient-specific resources. | Critical | ST |
| MAG-SEC-002 | Clinical users SHALL use appropriate MFA controls in Clinical Mode. | Major | ST |
| MAG-SEC-003 | Authorisation SHALL be enforced server/database side and SHALL NOT rely solely on frontend visibility. | Critical | ST |
| MAG-SEC-004 | Patient data access SHALL resolve to organisational authorisation. | Critical | ST |
| MAG-SEC-005 | Clinical resources SHALL enforce organisation membership. | Critical | ST |
| MAG-SEC-006 | Permission checks SHALL be capability-based rather than relying solely on job-title labels. | Major | ST |
| MAG-SEC-007 | Base clinical/scientific schemas SHALL NOT be generically exposed for unrestricted authenticated CRUD access. | Critical | ST |
| MAG-SEC-008 | High-risk mutations SHALL use controlled domain commands, RPCs or trusted server-side services. | Critical | ST |
| MAG-SEC-009 | Browser clients SHALL NOT receive privileged service credentials capable of bypassing RLS. | Critical | ST |
| MAG-SEC-010 | Privileged workers SHALL authenticate machine-to-machine. | Critical | ST |
| MAG-SEC-011 | Privileged worker actions SHALL be auditable. | Major | ST |
| **MAG-SEC-012** | **Cross-organisation clinical data access SHALL be denied by database-enforced Row Level Security.** | Critical | ST |
| MAG-SEC-013 | Critical case-bound child records SHALL enforce organisation/case consistency structurally. | Critical | ST |
| MAG-SEC-014 | Storage containing clinical MRI or derived patient artefacts SHALL be private. | Critical | ST |
| MAG-SEC-015 | Permanent public URLs SHALL NOT be used for clinical imaging artefacts. | Critical | ST |
| MAG-SEC-016 | Temporary signed access SHALL be time-limited and generated only when required. | Major | ST |
| MAG-SEC-017 | Signed access URLs/tokens SHALL NOT be persisted as canonical object identity. | Major | ST |
| MAG-SEC-018 | Clinical and research storage SHALL remain separable. | Critical | ST |
| MAG-SEC-019 | Security-definer functions SHALL undergo dedicated cross-organisation and privilege tests. | Critical | ST |
| MAG-SEC-020 | Scientific-policy mutation permissions SHALL be separate from ordinary organisation administration. | Critical | ST |
| MAG-SEC-021 | Evidence release activation SHALL require privileged controlled workflow. | Critical | ST |
| MAG-SEC-022 | Clinical signing authority SHALL be explicitly granted and revocable. | Critical | ST |
| MAG-SEC-023 | Only authorised clinicians SHALL sign ClinicianDecisions. | Critical | ST |
| MAG-SEC-024 | Signed clinical decisions SHALL resist UPDATE and DELETE through ordinary application/database paths. | Critical | ST |
| MAG-SEC-025 | Published Target Slates SHALL resist ordinary UPDATE and DELETE. | Critical | ST |
| MAG-SEC-026 | Approved PhenotypeSnapshots SHALL resist ordinary UPDATE and DELETE. | Critical | ST |
| MAG-SEC-027 | Active scientific evidence versions SHALL resist ordinary mutation. | Critical | ST |
| MAG-SEC-028 | Authentication secrets and passwords SHALL NOT be replicated into application-domain tables. | Critical | ST |
| MAG-SEC-029 | Queue payloads SHALL avoid unnecessary patient-identifying information. | Major | ST |
| MAG-SEC-030 | Logs SHALL avoid unnecessary patient-identifying information. | Major | ST |
| MAG-SEC-031 | Cross-organisation access attempts SHALL be detectable through security monitoring. | Major | ST |
| MAG-SEC-032 | Scientific-policy activation SHALL generate a high-risk audit event. | Major | ST |
| MAG-SEC-033 | Evidence Library activation SHALL generate a high-risk audit event. | Major | ST |
| MAG-SEC-034 | Clinical signing-authority changes SHALL generate high-risk audit events. | Major | ST |
| MAG-SEC-035 | Backup and restore controls SHALL preserve clinically important records and scientific provenance. | Critical | ST |

---

# 18. WORKFLOW AND STATE REQUIREMENTS

| ID | Requirement | Class | Verify |
|---|---|---:|---|
| MAG-WFL-001 | Clinically significant state transitions SHALL occur through controlled domain actions. | Critical | IT |
| MAG-WFL-002 | Clinical state SHALL NOT depend on a sequence of unrelated client-side mutations. | Critical | IT |
| MAG-WFL-003 | Phenotype approval SHALL be transactional. | Critical | IT |
| MAG-WFL-004 | Target Slate publication SHALL be transactional. | Critical | IT |
| MAG-WFL-005 | Clinician decision signing SHALL be transactional. | Critical | IT |
| MAG-WFL-006 | Evidence Library activation SHALL be transactional. | Critical | IT |
| MAG-WFL-007 | Scientific Policy activation SHALL be transactional. | Critical | IT |
| MAG-WFL-008 | Failed Target Slate publication SHALL roll back incomplete clinical state. | Critical | IT |
| MAG-WFL-009 | Long-running scientific jobs SHALL use durable job-state tracking. | Major | IT |
| MAG-WFL-010 | Scientific jobs SHALL support idempotency. | Major | IT |
| MAG-WFL-011 | Repeated identical job submission SHALL NOT create scientifically different results solely because it was submitted twice. | Critical | IT |
| MAG-WFL-012 | Processing failures SHALL NOT create a partially valid clinical connectome. | Critical | IT |
| MAG-WFL-013 | Jobs SHALL record scientific component/version context necessary for reconstruction. | Critical | IT |
| MAG-WFL-014 | Long-running workflow chains SHALL carry correlation identifiers. | Standard | IT |
| MAG-WFL-015 | Correlation identifiers SHALL NOT use patient names. | Major | ST |
| MAG-WFL-016 | Supersession SHALL preserve previous outputs rather than overwrite them. | Critical | IT |
| MAG-WFL-017 | A case SHALL NOT automatically migrate an existing Target Slate to a new Evidence Library. | Critical | IT |
| MAG-WFL-018 | Updated evidence SHALL require explicit new target generation when re-analysis is desired. | Major | IT |

---

# 19. AUDIT AND PROVENANCE REQUIREMENTS

| ID | Requirement | Class | Verify |
|---|---|---:|---|
| MAG-AUD-001 | MAGNIOM SHALL maintain an append-only semantic audit trail for clinically significant events. | Critical | ST |
| MAG-AUD-002 | Audit events SHALL identify actor, action, time and affected aggregate. | Major | IT |
| MAG-AUD-003 | Scientific version activation SHALL be audited. | Major | IT |
| MAG-AUD-004 | Target Slate generation/publication SHALL be audited. | Critical | IT |
| MAG-AUD-005 | Phenotype approval SHALL be audited. | Major | IT |
| MAG-AUD-006 | ClinicianDecision signing SHALL be audited. | Critical | IT |
| MAG-AUD-007 | Target rejection/modification SHALL remain reconstructable. | Major | IT |
| MAG-AUD-008 | Privileged administrative actions SHALL be audited. | Major | ST |
| MAG-AUD-009 | Research-to-Clinical promotion events SHALL be audited. | Critical | IT |
| MAG-AUD-010 | Scientific Policy integrity/signature failures SHALL be audited. | Critical | ST |
| MAG-AUD-011 | Audit history SHALL NOT be silently rewritten during supersession. | Critical | ST |
| MAG-AUD-012 | An authorised reviewer SHALL be able to reconstruct the evidence→candidate→slate→decision chain. | Critical | SV |

---

# 20. RELEASE AND VERSION REQUIREMENTS

| ID | Requirement | Class | Verify |
|---|---|---:|---|
| MAG-REL-001 | Production Clinical releases SHALL identify the application version. | Major | I |
| MAG-REL-002 | Production Clinical releases SHALL identify database migration version. | Major | I |
| MAG-REL-003 | Production Clinical releases SHALL identify ScientificPolicyRelease. | Critical | I |
| MAG-REL-004 | Production Clinical releases SHALL identify EvidenceLibraryRelease. | Critical | I |
| MAG-REL-005 | Production Clinical releases SHALL identify TargetEngineVersion. | Critical | I |
| MAG-REL-006 | Production Clinical releases SHALL identify PipelineVersion where applicable. | Critical | I |
| MAG-REL-007 | Production Clinical releases SHALL identify NormativeModelVersion where applicable. | Critical | I |
| MAG-REL-008 | Production Clinical releases SHALL identify AtlasVersion where applicable. | Critical | I |
| MAG-REL-009 | Production Clinical releases SHALL identify EFieldEngineVersion where applicable. | Critical | I |
| MAG-REL-010 | Production Clinical releases SHALL identify Phenotype Ontology version. | Major | I |
| MAG-REL-011 | Clinical scientific versions SHALL be frozen for formal verification. | Critical | I |
| MAG-REL-012 | Feature/scientific changes after M3 freeze SHALL undergo change-impact assessment. | Critical | I |
| MAG-REL-013 | Scientific implementation changes SHALL trigger regression verification. | Major | SV |
| MAG-REL-014 | Scientific parameter changes SHALL trigger scientific impact assessment. | Critical | SV |
| MAG-REL-015 | Scientific model changes SHALL trigger validation proportionate to the changed behaviour. | Critical | SV, CV |
| MAG-REL-016 | A new Evidence Library SHALL NOT automatically become clinically active. | Critical | IT |
| MAG-REL-017 | A new neuroimaging software version SHALL NOT automatically become clinically active. | Critical | IT |
| MAG-REL-018 | A new normative model SHALL NOT automatically become clinically active. | Critical | IT |
| MAG-REL-019 | A new Target Engine SHALL NOT automatically become clinically active. | Critical | IT |
| MAG-REL-020 | A new Scientific Policy SHALL NOT automatically become clinically active. | Critical | IT |
| MAG-REL-021 | Clinical release activation SHALL require a controlled Clinical Release Package. | Critical | I |
| MAG-REL-022 | No single developer SHALL independently activate Clinical Mode. | Critical | ST |
| MAG-REL-023 | Superseded releases SHALL remain recoverable for historical reconstruction. | Critical | IT |
| MAG-REL-024 | Withdrawn scientific releases SHALL remain historically identifiable. | Critical | IT |
| MAG-REL-025 | Clinically material release changes SHALL generate a change-impact report. | Major | I |

---

# 21. VERIFICATION AND VALIDATION REQUIREMENTS

| ID | Requirement | Class | Verify |
|---|---|---:|---|
| MAG-VAL-001 | Every approved system requirement SHALL have a defined verification method. | Major | I |
| MAG-VAL-002 | Every critical requirement SHALL be linked to applicable risk controls. | Critical | I |
| MAG-VAL-003 | Formal verification SHALL determine whether implementation conforms to specification. | Critical | SV |
| MAG-VAL-004 | Clinical validation SHALL remain distinguishable from software verification. | Critical | I |
| MAG-VAL-005 | Golden Cases SHALL be established before reliance on real-patient clinical outputs. | Major | GC |
| MAG-VAL-006 | Golden Cases SHALL include expected eligible candidates. | Major | GC |
| MAG-VAL-007 | Golden Cases SHALL include expected suppressed candidates. | Major | GC |
| MAG-VAL-008 | Golden Cases SHALL include expected Target Slate ordering where applicable. | Major | GC |
| MAG-VAL-009 | Golden Cases SHALL include expected abstention/fallback behaviour. | Major | GC |
| MAG-VAL-010 | Golden Cases SHALL include Research/Clinical boundary cases. | Critical | GC |
| MAG-VAL-011 | Golden Cases SHALL include low-reliability connectome cases. | Critical | GC |
| MAG-VAL-012 | Golden Cases SHALL include evidence-ceiling cases. | Critical | GC |
| MAG-VAL-013 | Golden Cases SHALL include incompatible scientific configuration cases. | Critical | GC |
| MAG-VAL-014 | Golden Cases SHALL include personalisation adoption and rejection cases. | Major | GC |
| MAG-VAL-015 | Scientific parameter thresholds SHALL undergo boundary testing. | Major | UT |
| MAG-VAL-016 | Coordinate-transform verification SHALL include laterality testing. | Critical | SV |
| MAG-VAL-017 | Pipeline validation SHALL include target-displacement assessment when processing changes. | Critical | SV |
| MAG-VAL-018 | Pipeline validation SHALL assess target reliability. | Critical | SV |
| MAG-VAL-019 | Retrospective validation SHALL use a locked validation dataset/protocol. | Major | CV |
| MAG-VAL-020 | Validation data SHALL NOT be repeatedly used for unconstrained algorithm tuning. | Critical | CV |
| MAG-VAL-021 | Development and validation cohorts SHALL be separated where required by the validation design. | Major | CV |
| MAG-VAL-022 | Prospective silent validation SHALL prevent MAGNIOM target output from influencing contemporaneous treatment decisions. | Critical | CV |
| MAG-VAL-023 | Clinical Mode promotion SHALL require completion of applicable engineering/security gates. | Critical | I |
| MAG-VAL-024 | Clinical Mode promotion SHALL require applicable scientific/clinical gates. | Critical | I |
| MAG-VAL-025 | Clinical Mode promotion SHALL require applicable human-factors gates. | Critical | I |
| MAG-VAL-026 | Clinical Mode promotion SHALL require applicable regulatory/quality gates. | Critical | I |
| MAG-VAL-027 | Clinical Mode SHALL NOT be released with open critical defects. | Critical | I |
| MAG-VAL-028 | Cross-organisation security testing SHALL pass before Clinical Mode release. | Critical | ST |
| MAG-VAL-029 | Signed-decision immutability SHALL be verified before Clinical Mode release. | Critical | ST |
| MAG-VAL-030 | Research/Clinical separation SHALL be verified before Clinical Mode release. | Critical | IT |
| MAG-VAL-031 | Target localisation reproducibility SHALL be characterised before Clinical Mode use of individualised FC targeting. | Critical | SV |
| MAG-VAL-032 | Reliability thresholds SHALL be empirically justified before they govern Clinical Mode personalisation. | Critical | SV |
| MAG-VAL-033 | Required scan-duration thresholds SHALL be empirically justified before Clinical Mode use. | Critical | SV |
| MAG-VAL-034 | Denoising/preprocessing sensitivity SHALL be characterised before Clinical Mode release. | Critical | SV |
| MAG-VAL-035 | Evidence Library used for Clinical Mode SHALL undergo independent scientific review. | Critical | SV |
| MAG-VAL-036 | Human-factors validation SHALL demonstrate that intended clinicians can understand and safely challenge MAGNIOM output. | Critical | HF |
| MAG-VAL-037 | Human-factors validation SHALL demonstrate clinicians can distinguish Target Slate from prescription. | Critical | HF |
| MAG-VAL-038 | Clinical Mode SHALL require validation evidence appropriate to the actual intended claims. | Critical | CV |
| MAG-VAL-039 | MAGNIOM SHALL NOT claim outcome superiority without appropriately controlled clinical evidence supporting that claim. | Critical | CV |
| MAG-VAL-040 | Post-deployment data SHALL support surveillance and future research without automatic modification of the active clinical algorithm. | Major | I |

---

# 22. NON-FUNCTIONAL AND OPERATIONAL REQUIREMENTS

## Reproducibility

### MAG-SYS-016

Every clinically significant scientific computation SHALL produce sufficient provenance to identify:

```text
software/container
configuration
inputs
scientific references
outputs
timestamps
hashes
```

**Class:** Critical  
**Verification:** IT, SV

### MAG-SYS-017

The same frozen scientific inputs and component versions SHALL produce equivalent deterministic Target Engine results.

**Class:** Critical  
**Verification:** GC

---

## Availability and failure

### MAG-SYS-018

Loss of an optional personalisation component SHALL NOT cause MAGNIOM to fabricate replacement scientific information.

**Class:** Critical  
**Verification:** GC

### MAG-SYS-019

Where an evidence-only fallback is scientifically permitted, failure of personalisation SHALL be communicated explicitly.

**Class:** Major  
**Verification:** GC, HF

### MAG-SYS-020

Scientific processing failure SHALL be distinguishable from clinically valid abstention.

**Class:** Major  
**Verification:** IT

---

## Data durability

### MAG-DAT-021

The system SHALL support backup and restore of signed decisions, Target Slates, snapshots, audit records and scientific manifests.

**Class:** Critical  
**Verification:** IT

### MAG-DAT-022

Object-storage recovery controls SHALL be tested independently of relational-database restore.

**Class:** Major  
**Verification:** IT

### MAG-DAT-023

Artefact integrity SHALL be verifiable after restore using stored hashes.

**Class:** Critical  
**Verification:** IT

---

# 23. EXPLICITLY PROHIBITED SYSTEM BEHAVIOURS

The following are direct system prohibitions.

### MAG-SYS-021

MAGNIOM SHALL NOT create an:

```text
optimal_target = true
```

semantic in Clinical Mode v1.

### MAG-SYS-022

MAGNIOM SHALL NOT generate an unvalidated numerical:

```text
expected_response_probability
```

for a target.

### MAG-SYS-023

MAGNIOM SHALL NOT convert evidence tiers into arbitrary probability percentages.

### MAG-SYS-024

MAGNIOM SHALL NOT automatically convert hypoconnectivity into a stimulation protocol.

### MAG-SYS-025

MAGNIOM SHALL NOT automatically convert hyperconnectivity into a stimulation protocol.

### MAG-SYS-026

MAGNIOM SHALL NOT assume abnormal connectivity is pathological or causal.

### MAG-SYS-027

MAGNIOM SHALL NOT assume additional targets are intrinsically better than fewer targets.

### MAG-SYS-028

MAGNIOM SHALL NOT infer multi-target treatment from Target Slate cardinality.

### MAG-SYS-029

MAGNIOM SHALL NOT promote research hypotheses into Clinical Mode through display-layer behaviour alone.

### MAG-SYS-030

MAGNIOM SHALL NOT use continuously learning Clinical Mode ranking in v1.

All above:

**Class:** Critical or Major according to associated hazardous scenario.  
**Verification:** I, GC, HF as applicable.

---

# 24. REQUIREMENTS TRACEABILITY MODEL

Canonical relationship:

```text
System Requirement
      │
      ├──► Source Specification
      │
      ├──► Risk Control
      │
      ├──► Software Architecture
      │
      ├──► Software Unit / Service
      │
      ├──► Verification Test
      │
      └──► Validation Evidence
```

Example:

```text
MAG-TGT-014
Clinical connectome-refined candidate
requires TargetReliabilityProfile
        ↓
Target Engine Specification
        ↓
Risk: unreliable localisation
        ↓
packages/target-engine
        ↓
TGT-IT-014
        ↓
Golden Case G-LOWREL-02
        ↓
Imaging reliability validation
```

---

# 25. MINIMUM REQUIREMENT-TO-RISK TRACEABILITY

The initial risk-management programme should prioritise mapping requirements associated with:

```text
wrong patient
wrong case
wrong laterality
wrong coordinate transform
wrong evidence release
wrong Scientific Policy
wrong Target Engine
Research/Clinical leakage
unreliable personalisation
incompatible normative model
incorrect E-field influence
automation bias
stale Target Slate
unauthorised signing
cross-organisation disclosure
scientific artefact corruption
```

Any risk control described in another MAGNIOM specification SHALL ultimately be represented by at least one traceable system requirement.

---

# 26. MINIMUM VERIFICATION SUITES

Formal verification shall include at least:

```text
SYS — System integration verification
CLI — Clinical workflow verification
PHE — Phenotype verification
EVD — Evidence Graph verification
POL — Scientific Policy verification
IMG — NeuroCompute verification
TGT — Target Engine verification
UX  — Critical-task verification
DAT — Database/data integrity verification
SEC — Security verification
WFL — Workflow verification
AUD — Audit verification
REL — Release-manifest verification
```

---

# 27. TARGET ENGINE GOLDEN-CASE MATRIX

The Golden Case programme shall contain cases covering at minimum:

### Evidence

```text
Tier A eligible
Tier B eligible
Tier C supporting/refinement
Tier C prohibited standalone
Tier D prohibited clinical
Tier R prohibited clinical
conflicting evidence
```

### Imaging

```text
qualified FC
conditional QC
failed QC
high reliability
moderate reliability
low reliability
unreliable localisation
```

### Personalisation

```text
qualified and adopted
qualified but insufficient incremental value
fails reliability
fails search-space rule
falls back to evidence-only
```

### Scientific configuration

```text
valid tuple
wrong evidence version
wrong engine
wrong pipeline
wrong normative model
Research component in Clinical Mode
invalid indication
```

### Candidate assembly

```text
one strong candidate
two clinically distinct candidates
three defensible candidates
fewer than three
redundant candidates
no valid target
```

### Human authority

```text
accept top candidate
select alternative
modify candidate
reject all
select no target
```

---

# 28. DATABASE VERIFICATION MATRIX

Database verification shall explicitly test:

```text
cross-organisation access denied

research candidate → clinical slate denied

connectome-refined candidate
without reliability profile → denied

published Target Slate update → denied

published Target Slate delete → denied

signed decision update → denied

signed decision delete → denied

approved phenotype mutation → denied

active evidence mutation → denied

invalid scientific compatibility → denied

stale slate signing → denied
```

---

# 29. SCIENTIFIC RELEASE VERIFICATION

Every scientific release candidate shall answer:

```text
What changed?

Why did it change?

Which requirement authorised the change?

Which risk controls are affected?

Which Golden Cases changed?

Which validation cases changed?

Did target coordinates move?

Did candidate ranks change?

Did abstention change?

Did personalisation adoption change?

Did evidence eligibility change?

Does the intended purpose change?

Does additional validation become necessary?
```

---

# 30. REQUIREMENTS BASELINE CONTROL

This document becomes:

# SRS Baseline v1.0

when formally approved.

After baseline approval:

### Requirement wording may not be silently edited.

A requirement change requires:

```text
change request
↓
impact assessment
↓
risk review
↓
scientific review where applicable
↓
approval
↓
new SRS revision
```

Historical requirement versions remain recoverable.

---

# 31. REQUIREMENT DECOMPOSITION

This SRS defines:

# system-level requirements.

Implementation teams may derive:

```text
software requirements
database requirements
API requirements
compute-service requirements
UI component requirements
security requirements
test requirements
```

but derived requirements shall:

# trace upward

to this SRS.

A derived implementation requirement SHALL NOT redefine the scientific meaning of the parent requirement.

---

# 32. REQUIREMENTS THAT REQUIRE EMPIRICAL VALUES

This SRS deliberately does not invent numerical requirements for:

```text
minimum rs-fMRI duration
motion threshold
reliability threshold
split-half distance
cross-run distance
minimum circuit improvement
ranking weights
redundancy distance
E-field threshold
convergence threshold
```

Those values remain:

# controlled scientific parameters requiring empirical justification.

Once validated, they shall be instantiated through:

# ScientificPolicyRelease

rather than hard-coded into this SRS.

The SRS requirement is that:

- the parameter exists;
- it is bounded where required;
- it is version controlled;
- it is validated;
- it is reproducible;
- it cannot be casually modified.

---

# 33. REQUIREMENTS THAT REQUIRE FUTURE REGULATORY DETERMINATION

This SRS does not independently determine:

- final Australian device classification;
- conformity-assessment pathway;
- exact clinical-evidence package;
- final labelling;
- final Intended Purpose wording;
- post-market reporting obligations.

Those shall be controlled through the regulatory programme.

The system requirement remains:

### MAG-VAL-041

Clinical Mode SHALL NOT be commercially supplied without satisfying the regulatory pathway applicable to the final intended purpose and jurisdiction.

**Class:** Critical  
**Verification:** Inspection.

---

# 34. REQUIREMENTS THAT REQUIRE FUTURE HUMAN-FACTORS VALIDATION

Detailed quantitative usability acceptance limits are not yet defined by the source specifications.

They shall be established within:

# Human Factors Engineering Plan.

The SRS requires at minimum that intended clinicians safely demonstrate:

```text
recognition of Target Slate versus prescription

recognition of Research Mode

recognition of low reliability

inspection of counterfactual baseline

inspection of evidence and conflict

ability to reject Primary Candidate 1

ability to choose an alternative

ability to choose no target

recognition of stale/superseded output
```

---

# 35. REQUIREMENTS STATUS AT v1.0

At publication of this SRS:

```text
requirement status = approved design input candidate
```

unless separately formally approved through the quality process.

Implementation status:

```text
not inferred from documentation.
```

Verification status:

```text
not inferred from documentation.
```

Validation status:

```text
not inferred from documentation.
```

A requirement SHALL NOT be marked:

```text
verified
```

merely because an implementation appears to exist.

A requirement SHALL NOT be marked:

```text
validated
```

merely because it passed a software test.

---

# 36. M0 → M8 REQUIREMENT MATURITY

## M0 — Design

Requirements defined.

## M1 — Engineering Prototype

Core system requirements implemented against synthetic data.

## M2 — Research Prototype

Research-mode real-imaging requirements implemented.

## M3 — Verification Build

Critical requirements frozen sufficiently for formal verification.

## M4 — Retrospective Validation

Relevant scientific requirements validated against locked historical datasets.

## M5 — Silent Prospective

Prospective scientific/workflow behaviour evaluated without influencing care.

## M6 — Clinician-Assisted Validation

Human clinical use evaluated under approved controlled conditions.

## M7 — Clinical Release Candidate

Engineering, scientific, security, human-factors and regulatory requirements satisfied for release assessment.

## M8 — Clinical Mode

Approved Clinical Release Package may influence treatment planning according to the defined intended purpose.

---

# 37. CLINICAL RELEASE REQUIREMENT

### MAG-REL-026

A Clinical Release Package SHALL identify the exact combination of:

```text
SRS baseline
Clinical & Scientific Specification
Canonical Target Data Specification
Phenotype Ontology
Evidence Library
Scientific Policy
Target Engine
Neuro Pipeline
Normative Model
Atlas
E-field Engine where used
Database Migration
Clinical Workspace
Application Build
```

that constitutes the release.

**Class:** Critical  
**Verification:** Inspection.

---

# 38. CLINICAL RELEASE BOARD REQUIREMENT

### MAG-REL-027

Before M8 activation, authorised release governance SHALL determine that:

1. the software implements the required specification;
2. neuroimaging measurements are sufficiently reproducible for the intended claim;
3. the scientific output has appropriate clinical evidence;
4. intended clinicians can understand and safely override the system;
5. deployment satisfies applicable quality, security and regulatory requirements.

If any required determination is not satisfied:

# MAGNIOM SHALL remain outside unrestricted Clinical Mode.

**Class:** Critical  
**Verification:** Inspection.

---

# 39. POST-RELEASE REQUIREMENTS

### MAG-VAL-042

Clinical release SHALL NOT terminate scientific surveillance.

### MAG-VAL-043

MAGNIOM SHOULD monitor:

```text
processing failures
reliability distributions
abstention rates
target displacement
clinician override rates
scientific conflicts
software incidents
```

according to the applicable post-release programme.

### MAG-VAL-044

Operational metrics SHALL NOT automatically become clinical evidence.

### MAG-VAL-045

Post-release observations SHALL enter controlled research/analysis before supporting algorithm changes.

### MAG-VAL-046

A clinically material post-release algorithm change SHALL require a new controlled scientific release and validation appropriate to its impact.

---

# 40. SYSTEM ACCEPTANCE PRINCIPLE

MAGNIOM shall not be judged complete because:

```text
the UI works
```

or:

```text
the MRI pipeline runs
```

or:

```text
the Target Engine returns five coordinates.
```

System acceptance requires demonstration that:

```text
clinical semantics are correct

scientific evidence is governed

phenotype is controlled

imaging is reproducible

reliability constrains personalisation

scientific configuration is versioned

target ranking is deterministic

uncertainty remains visible

security boundaries hold

outputs remain auditable

clinicians can challenge the system

Research and Clinical modes remain separate

release evidence supports the intended use.
```

---

# 41. SYSTEM REQUIREMENTS GOVERNING MODEL

The overall system requirements architecture is:

```text
CLINICAL FORMULATION
        ↓
approved PhenotypeSnapshot
        ↓
VERSIONED SCIENTIFIC KNOWLEDGE
        ↓
EvidenceLibraryRelease
        ↓
SCIENTIFIC GOVERNANCE
        ↓
ScientificPolicyRelease
        ↓
PATIENT MEASUREMENT
        ↓
PipelineVersion
ConnectomeRun
TargetReliabilityProfile
        ↓
DETERMINISTIC INFERENCE
        ↓
TargetEngineVersion
        ↓
AUDITABLE OUTPUT
        ↓
TargetCandidates
TargetSlate
        ↓
INDEPENDENT HUMAN AUTHORITY
        ↓
ClinicianDecision
```

At every boundary:

# provenance is retained.

At every scientific change:

# version identity is retained.

At every clinical inference:

# uncertainty remains visible.

At every clinical decision:

# human authority remains separate.

---

# 42. FINAL SRS PRINCIPLES

# Evidence constrains where MAGNIOM may look.

# Phenotype determines what clinical problems matter.

# Patient imaging may refine but does not create clinical evidence.

# Reliability determines whether personalisation deserves influence.

# Scientific Policy determines what component combinations and parameters are permitted.

# The Target Engine constructs competing hypotheses.

# Hard gates precede ranking.

# Evidence is not a compensable score.

# Clinical and Research modes remain structurally separate.

# Clinical configuration is immutable and version specific.

# Every Target Slate is reproducible.

# Every Target Slate is inspectable.

# Every Target Slate may be challenged.

# Abstention is an acceptable scientific output.

# Failed personalisation does not require a guessed personalised target.

# More personalised does not automatically mean better.

# More targets do not automatically mean better.

# More complex models do not automatically mean better.

# Scientific updates do not silently change historical decisions.

# Production outcomes do not automatically retrain the algorithm.

# Software verification does not equal clinical validation.

# A technically successful build does not equal a medical-device release.

# Clinical Mode is earned through engineering, scientific, human-factors and regulatory evidence.

# The professional decides.

---

# 43. CANONICAL SYSTEM REQUIREMENT

The overarching MAGNIOM requirement is:

> **MAGNIOM SHALL transform clinician-approved phenotype, versioned scientific evidence and appropriately qualified patient-specific neuroimaging into a deterministic, source-verifiable and uncertainty-aware Target Slate that an appropriately trained TMS specialist can independently inspect, challenge, modify or reject, while preserving scientific provenance, measurement reliability, Clinical/Research separation and final human clinical authority.**

---

# 44. BASELINE DECLARATION

This document defines:

# MAGNIOM System Requirements Specification v1.0

and establishes the initial controlled requirement namespaces:

```text
MAG-SYS
MAG-CLI
MAG-PHE
MAG-EVD
MAG-POL
MAG-IMG
MAG-TGT
MAG-UX
MAG-DAT
MAG-SEC
MAG-WFL
MAG-AUD
MAG-REL
MAG-VAL
```

All subsequent MAGNIOM design, implementation, verification, validation and risk-management artefacts should trace to this baseline.

No implementation detail, database convenience, machine-learning technique, user-interface shortcut or scientific novelty may silently override these requirements.

Where implementation cannot satisfy a requirement:

# the requirement is not silently weakened.

Instead:

```text
requirement conflict
        ↓
documented impact analysis
        ↓
scientific / clinical / engineering review
        ↓
risk assessment
        ↓
controlled requirement change if justified.
```

That is the requirements discipline under which MAGNIOM progresses from:

# a scientifically specified system

to:

# a verifiable and ultimately clinically defensible product.