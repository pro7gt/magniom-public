# Risk Management Plan (ISO 14971:2019 / Magniom v2.0)

**Standard Reference:** ISO 14971:2019, ISO/TR 24971:2020, IEC 62304:2006+AMD1:2015 Clause 7, IEC 62366-1:2015  
**Document Status:** Controlled Risk Management Baseline  
**Governing Baseline:** Magniom v2.0 Multi-Indication Platform  
**Document ID:** MAG-RMP-002  
**Effective Date:** 2026-09-03  

---

## 1. Scope and Purpose

This Risk Management Plan governs the continuous identification, analysis, evaluation, control, and monitoring of risks for the **MAGNIOM Multi-Indication Neuromodulation Clinical Decision Support System (v2.0)**. 

MAGNIOM calculates, ranks, and visualizes patient-specific transcranial magnetic stimulation (TMS) target candidates across multiple clinical indications (MDD, OCD, neuropathic pain, stroke motor recovery, post-stroke aphasia, traumatic brain injury, PTSD, and chronic tinnitus). The platform operates under a strict clinical governance model: the software provides clinical decision support, while the qualified specialist clinician maintains sole and exclusive prescriptive authority.

### 1.1 Dual-Axis Risk Management Architecture

In accordance with [MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 §4](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Implementation%20&%20Multi-Indication%20Validation%20Roadmap%20v2.0.md), risk management is governed along two independent, orthogonal axes:

1. **Common Platform Engineering Axis ($M0\text{--}M8$):** Governs system-wide software correctness, pure deterministic calculation invariants, multi-tenant database row-level security (RLS), coordinate transformation sanity, audit logging, and core UI shell stability.
2. **Indication Module Qualification Axis ($Q0\text{--}Q8$):** Each scientific indication is governed by an immutable `IndicationModuleRelease` that progresses through module-specific synthetic fixtures, locked retrospective validation, silent prospective evaluation, human factors usability validation, and Clinical Mode qualification.

Software completion of the shared platform never implies clinical qualification of an individual indication module.

---

## 2. Risk Management Team & Governance Roles

| Role | Responsibility | Authority |
|---|---|---|
| **Lead Risk Manager / Systems Safety Engineer** | Maintains the Risk Management File, calculates risk matrices, ensures ISO 14971 compliance. | Veto on releases with unmitigated hazards or incomplete traceability. |
| **Chief Medical Officer / Specialist Clinicians** | Defines clinical harms, severity ratings, clinical acceptability thresholds, and symptom dimension mappings. | Sole authority for clinical risk acceptability and clinical module promotion ($Q5/M7$). |
| **Lead Neuroscientist / Algorithm Authority** | Evaluates biological validity, evidence ceilings, tractography limitations, and electrophysiological parameters. | Approves Scientific Policy Releases and evidence path classifications. |
| **Software Quality & CI/CD Lead** | Ensures automated verification of all risk controls, regression testing, and cryptographic release sealing. | Enforces zero-defect exit criteria on critical risk controls. |

---

## 3. Risk Evaluation & Acceptability Criteria

Risk is evaluated as the combination of the **Severity of Harm** and the **Probability of Occurrence of Harm**.

### 3.1 Severity of Harm Scale

| Level | Severity Classification | Clinical Definition & Consequences in TMS Decision Support |
|---|---|---|
| **S1** | **Negligible** | Inconvenience or slight delay in non-urgent clinical assessment; minor UI formatting defect not altering clinical data. |
| **S2** | **Minor** | Suboptimal target recommendation resulting in temporary lack of therapeutic efficacy without physiological injury; reversible mild headache or scalp discomfort. |
| **S3** | **Serious** | Delivery of stimulation to non-target functional cortex causing transient neurological impairment (e.g. transient motor twitches, speech arrest, exacerbated pain, or focal distress); major delay in effective treatment for high-morbidity disorder. |
| **S4** | **Critical** | Induction of an epileptic seizure due to inappropriate target location, excessive local cortical excitability, or incompatible coil field distribution; stimulation of necrotic tissue leading to acute neurological deterioration. |
| **S5** | **Catastrophic** | Permanent neurological impairment or fatality (e.g. status epilepticus in unmonitored setting, acute psychiatric decompensation resulting in fatal self-harm). |

### 3.2 Probability of Occurrence Scale

| Level | Probability Classification | Quantitative Threshold (Per Clinical Analysis / Session) |
|---|---|---|
| **P5** | **Frequent** | $\ge 1 \text{ in } 100$ |
| **P4** | **Probable** | $1 \text{ in } 100 \text{ to } 1 \text{ in } 1,000$ |
| **P3** | **Occasional** | $1 \text{ in } 1,000 \text{ to } 1 \text{ in } 10,000$ |
| **P2** | **Remote** | $1 \text{ in } 10,000 \text{ to } 1 \text{ in } 100,000$ |
| **P1** | **Improbable** | $< 1 \text{ in } 100,000$ |

### 3.3 Risk Evaluation Matrix

| Severity \ Probability | P1 (Improbable) | P2 (Remote) | P3 (Occasional) | P4 (Probable) | P5 (Frequent) |
|---|---|---|---|---|---|
| **S5 (Catastrophic)** | Medium | High | Unacceptable | Unacceptable | Unacceptable |
| **S4 (Critical)** | Acceptable | Medium | High | Unacceptable | Unacceptable |
| **S3 (Serious)** | Acceptable | Acceptable | Medium | High | Unacceptable |
| **S2 (Minor)** | Broadly Acceptable | Broadly Acceptable | Acceptable | Medium | High |
| **S1 (Negligible)** | Broadly Acceptable | Broadly Acceptable | Broadly Acceptable | Broadly Acceptable | Acceptable |

### 3.4 Risk Acceptability Policies
- **Broadly Acceptable & Acceptable:** No further risk reduction required; risk is accepted under current controls.
- **Medium:** Risk reduction measures must be applied to drive residual risk to "Acceptable" unless clinical benefit demonstrably outweighs residual risk (documented Benefit-Risk Analysis).
- **Unacceptable / High:** Software SHALL NOT be released for clinical use under any circumstance while residual risk remains High or Unacceptable.

---

## 4. Risk Control Hierarchy (Inherent Safety by Design)

Risk control measures in MAGNIOM are strictly prioritized in accordance with ISO 14971:2019 Clause 7.1:

1. **Inherent Safety by Design (First Priority):**
   - Pure, deterministic calculation core (`packages/target-engine/`) executing without external side-effects or floating-point non-determinism.
   - Immutable domain schemas enforcing strict typing, coordinate boundaries, and coordinate space preservation.
   - Indication-scoped evidence graph architecture mathematically prohibiting cross-indication evidence leakage.
   - Hard safety gates strictly preceding compensable scoring and candidate ranking.
   - Automated abstention and "no-target" results when biological prerequisites or reliability bounds fail.
2. **Protective Measures in Software Engineering (Second Priority):**
   - Automated QC filtering (mean frame displacement censoring $< 0.25\text{ mm}$ for fMRI).
   - Coordinate round-trip verification with cryptographic checksum verification (`UT-LAT-001`).
   - Multi-tenant database Row Level Security (RLS) enforcing tenant and organization isolation.
   - Module and Scientific Policy cryptographic release signature validation.
3. **Information for Safety & User Interface Safeguards (Third Priority):**
   - Strict prevention of automation bias: user interface prohibits preselecting default target candidates.
   - Prominent disclosure of evidence tiers, conflicting evidence, and measurement limitations.
   - Research Mode / Validation Mode persistent visual warnings and separate URL routing (`/research/...`).
   - Human clinician sole prescriptive authority enforcement before target export.

---

## 5. Multi-Indication Hazard Taxonomy

In accordance with [MAGNIOM-System Requirements Specification v2.0 §32](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-System%20Requirements%20Specification%20v2.0.md) and [Roadmap v2.0 §16](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Implementation%20&%20Multi-Indication%20Validation%20Roadmap%20v2.0.md), the risk management file tracks hazards across 4 major failure domains:

1. **Multi-Indication Governance & Boundary Integrity:**
   - Incorrect Module Activation (`HAZ-006`)
   - Wrong Indication & Clinical Objective Mismatch (`HAZ-014`)
   - Cross-Module Evidence / Parameter Leakage (`HAZ-007`)
   - Research-to-Clinical Operational Leakage (`HAZ-008`)
   - Silent Historical Target Mutation Across Module Upgrades (`HAZ-020`)
2. **Anatomical, Structural & Geometric Integrity:**
   - Coordinate Space Mismatch and Spatial Inversion (`HAZ-002`)
   - Lesion Laterality, Distortion, and Necrotic Core Targeting (`HAZ-009`)
   - Somatotopic Homunculus / Body-Region Mismatch (`HAZ-010`)
   - Target Geometry Corruption / Lossy Downcasting (`HAZ-012`)
   - Incompatible Coil / Delivery Device Geometry (`HAZ-019`)
3. **Multimodal Measurement & Electrophysiological Interpretation:**
   - Motion Corruption in Functional Connectomics (`HAZ-003`)
   - Unreliable TMS-MEP Motor Mapping (`HAZ-015`)
   - Misleading Task-fMRI & Task Failure Conflation (`HAZ-016`)
   - Invalid Tractography Interpretation as Ground Truth (`HAZ-017`)
   - Tinnitus & Audiology Overinterpretation (`HAZ-011`)
   - Hidden or Heuristic Multimodal Fusion (`HAZ-018`)
4. **Clinical Workflow, Security & Human Factors:**
   - Clinician Automation Bias & Unreviewed Prescriptions (`HAZ-001`)
   - Stale or Inappropriate Clinical Phenotype (`HAZ-004`)
   - Cross-Tenant Confidentiality Breach (`HAZ-005`)
   - Treatment Context Omission for Context-Dependent Protocols (`HAZ-013`)

---

## 6. Traceability and Verification Requirements

Every identified hazard in `docs/risk-management/risk-register.json` must establish a complete, verifiable traceability chain:

$$\text{Hazard ID} \iff \text{Mitigating SRS Requirements} \iff \text{Design Controls} \iff \text{Verification Test IDs} \iff \text{Validation Golden Cases}$$

- Zero dangling hazard IDs are permitted.
- All Critical requirements (`MAG-*-*`) with safety class `critical` must be linked to at least one Hazard Control ID in `docs/software-requirements/requirement-catalog.json`.
- The verification pipeline (`scripts/verify-requirements.ts` and `scripts/verification/verify-risk-traceability.ts`) executes automatically in CI/CD to enforce 100% bidirectional traceability.

---

## 7. Review, Approval & Post-Market Surveillance

1. **Baseline Freezing:** The Risk Management File is frozen at Phase 0 prior to domain migration and clinical module validation.
2. **Clinical Module Promotion ($Q5/M7$):** Before any module achieves Clinical Mode permission, a dedicated Module Risk Assessment Report must confirm all module-specific residual risks are Acceptable.
3. **Post-Market Surveillance & Feedback:** Real-world clinician feedback, adverse event reports, and post-market clinical follow-up data will be reviewed quarterly by the Risk Management Team to update probability estimates and identify emerging hazards.
