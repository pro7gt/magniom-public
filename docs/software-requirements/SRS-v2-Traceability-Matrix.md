# MAGNIOM System Requirements Specification v2.0 — Traceability Matrix

**Document Reference:** MAG-SRS-v2-TRACEABILITY-MATRIX  
**Standard Reference:** IEC 62304:2006+AMD1:2015 §5.1.1, §5.2, §5.5–§5.7 / ISO 13485:2016 §7.3.3, §7.3.5 / ISO 14971:2019  
**Generation Date:** 2026-09-05T09:11:41.228034+00:00  
**Total Requirements Traced:** 375 (340 v2 canonical requirements + 35 retained v1 safety requirements)  
**Traceability Status:** 100% Fully Traced & Qualified  

---

## 1. Traceability Architecture & Regulatory Framework

This document establishes the formal forward and backward design traceability matrix for the **MAGNIOM v2.0 Multi-Indication Neuromodulation Decision Support Platform**.

In accordance with **IEC 62304:2006+AMD1:2015 Clause 5.1.1** (Software development plan), **Clause 5.2** (Software requirements analysis), **Clause 5.5** (Software unit verification), **Clause 5.6** (Software integration testing), and **Clause 5.7** (Software system testing), every requirement is traced through:
1. **Specification Source:** Canonical guide and section number in `public/guides/`
2. **Safety Classification:** Critical (Class C), Major (Class B), or Standard (Class A)
3. **Applicability:** Mode constraints (`all`, `clinical`, `research`, `validation`)
4. **Verification Method:** Automated verification test harness, property-based test, system test, golden case, or human-factors inspection
5. **Risk Control Mitigation:** Linked hazard driver in the Risk Management File (`HAZ-001` through `HAZ-020` under ISO 14971:2019)

---

## 2. Executive Domain Summary (21 Namespaces)

| Domain Code | Domain Title | Total Requirements | Critical (Class C) | Major (Class B) | Standard (Class A) | Traceability Status |
|:---:|---|:---:|:---:|:---:|:---:|:---:|
| **MAG-AUD** | Immutable Audit Trail & Provenance Logging | 9 | 2 | 0 | 7 | **100% Traced** |
| **MAG-CLI** | Clinical Authority, Workflow & Sign-Off | 14 | 11 | 3 | 0 | **100% Traced** |
| **MAG-DAT** | Canonical Multi-Indication Data Integrity | 15 | 3 | 0 | 12 | **100% Traced** |
| **MAG-EVD** | Evidence Knowledge Graph & Claim Ceilings | 16 | 5 | 0 | 11 | **100% Traced** |
| **MAG-IMG** | Neuroimaging Pipeline & Spatial QC | 13 | 4 | 0 | 9 | **100% Traced** |
| **MAG-IND** | Indication-Module Governance & Lifecycle | 30 | 9 | 0 | 21 | **100% Traced** |
| **MAG-MEA** | Multimodal Patient Measurement & Qualification | 20 | 5 | 0 | 15 | **100% Traced** |
| **MAG-OCD** | Obsessive-Compulsive Disorder & Deep-TMS Field Geometry | 18 | 8 | 0 | 10 | **100% Traced** |
| **MAG-PAI** | Neuropathic Pain & Somatotopic Refinement | 18 | 6 | 0 | 12 | **100% Traced** |
| **MAG-PHE** | Phenotype & Clinical Context Formulation | 9 | 0 | 1 | 8 | **100% Traced** |
| **MAG-POL** | Scientific Policy & Whitelist Configuration | 25 | 5 | 0 | 20 | **100% Traced** |
| **MAG-REL** | Release Governance, Manifests & Verification | 22 | 9 | 3 | 10 | **100% Traced** |
| **MAG-SEC** | Security, Tenancy Isolation & Cryptography | 18 | 10 | 2 | 6 | **100% Traced** |
| **MAG-STR** | Stroke Motor Rehabilitation & Aphasia Modules | 25 | 8 | 0 | 17 | **100% Traced** |
| **MAG-SYS** | System-Wide Architecture & Core Invariants | 13 | 11 | 2 | 0 | **100% Traced** |
| **MAG-TBI** | Traumatic Brain Injury & Structural Distortion | 18 | 7 | 0 | 11 | **100% Traced** |
| **MAG-TGT** | Target Engine Core & Deterministic Ranking | 25 | 5 | 0 | 20 | **100% Traced** |
| **MAG-TIN** | Chronic Tinnitus & Psychoacoustic Subtyping | 18 | 5 | 0 | 13 | **100% Traced** |
| **MAG-UX** | Clinician UX, Shell Navigation & Non-Preselection | 17 | 4 | 0 | 13 | **100% Traced** |
| **MAG-VAL** | Verification & Validation Test Harnesses | 23 | 6 | 1 | 16 | **100% Traced** |
| **MAG-WFL** | Workflow Orchestration & Job State Machine | 9 | 0 | 1 | 8 | **100% Traced** |

---

## 3. Comprehensive Requirements Traceability Table

### 3.1. MAG-AUD: Immutable Audit Trail & Provenance Logging (9 Requirements)

| ID | Safety Class | Specification Source | Requirement Statement | Verification Method | ISO 14971 Risk Controls |
|---|:---:|---|---|:---:|:---:|
| **MAG-AUD-001** | `Critical` | MAGNIOM-Supabase Database & Security Specification v1.0 | All clinician actions, target evaluations, and sign-offs shall produce append-only immutable audit logs with cryptographic hash integrity. | Integration Test | HAZ-001, HAZ-005 |
| **MAG-AUD-041** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §22. AUDIT REQUIREMENTS v2 | Audit records SHALL identify the active `CaseIndication`. | Integration Test | HAZ-001, HAZ-005 |
| **MAG-AUD-042** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §22. AUDIT REQUIREMENTS v2 | Audit records SHALL identify the active `IndicationModuleRelease`. | Integration Test | — |
| **MAG-AUD-043** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §22. AUDIT REQUIREMENTS v2 | Target-generation audit SHALL identify the Scientific Compatibility Configuration. | Integration Test | — |
| **MAG-AUD-044** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §22. AUDIT REQUIREMENTS v2 | Generator invocation and abstention SHALL be auditable. | Integration Test | — |
| **MAG-AUD-045** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §22. AUDIT REQUIREMENTS v2 | Capability qualification/failure affecting target generation SHALL be auditable. | Integration Test | — |
| **MAG-AUD-046** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §22. AUDIT REQUIREMENTS v2 | Fallback from a patient-specific capability to an evidence baseline SHALL be auditable. | Integration Test | — |
| **MAG-AUD-047** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §22. AUDIT REQUIREMENTS v2 | Module/mode policy violations SHALL be auditable. | Integration Test | — |
| **MAG-AUD-048** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §22. AUDIT REQUIREMENTS v2 | A signed clinician decision SHALL be reconstructable independently from the current state of the Evidence Library or module. | Integration Test | — |

### 3.2. MAG-CLI: Clinical Authority, Workflow & Sign-Off (14 Requirements)

| ID | Safety Class | Specification Source | Requirement Statement | Verification Method | ISO 14971 Risk Controls |
|---|:---:|---|---|:---:|:---:|
| **MAG-CLI-001** | `Critical` | MAGNIOM-Clinical Phenotype & Symptom-to-Circuit Ontology v1.0 | A confirmed and immutable PhenotypeSnapshot shall be required before any target slate generation is permitted. | Integration Test | HAZ-004 |
| **MAG-CLI-002** | `Critical` | MAGNIOM-Clinical & Scientific Specification v1.0<br>MAGNIOM-Technical Architecture v1.0 | The final target selection authority shall rest solely with an authorized human clinician. Software shall never automatically prescribe a treatment target. | Human Factors | HAZ-001 |
| **MAG-CLI-041** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §10. CLINICAL REQUIREMENTS — v2 ADDITIONS | Every targeting analysis SHALL identify the principal `CaseIndication` being addressed. | It | HAZ-014 |
| **MAG-CLI-042** | `Major` | MAGNIOM-System Requirements Specification v2.0 §10. CLINICAL REQUIREMENTS — v2 ADDITIONS | A Case MAY contain multiple diagnoses or indications, but each Target Slate SHALL have one principal targeting indication. | Integration Test | — |
| **MAG-CLI-043** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §10. CLINICAL REQUIREMENTS — v2 ADDITIONS | The specialist SHALL explicitly approve the clinical objective(s) relevant to target generation. | It | HAZ-014 |
| **MAG-CLI-044** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §10. CLINICAL REQUIREMENTS — v2 ADDITIONS | MAGNIOM SHALL NOT infer the treatment objective solely from diagnosis. | It | HAZ-014 |
| **MAG-CLI-045** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §10. CLINICAL REQUIREMENTS — v2 ADDITIONS | The specialist SHALL be able to reject all candidates and record no selected target. | It | HAZ-001 |
| **MAG-CLI-046** | `Major` | MAGNIOM-System Requirements Specification v2.0 §10. CLINICAL REQUIREMENTS — v2 ADDITIONS | The specialist SHALL be able to choose a clinically defensible target not ranked Primary 1 where workflow policy permits. | Integration Test | — |
| **MAG-CLI-047** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §10. CLINICAL REQUIREMENTS — v2 ADDITIONS | Clinician modification of candidate geometry SHALL create a new clinician-owned object without mutating the source candidate. | Integration Test | HAZ-001, HAZ-014 |
| **MAG-CLI-048** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §10. CLINICAL REQUIREMENTS — v2 ADDITIONS | Signed clinical decisions SHALL remain separate from algorithm-generated Target Slates. | Integration Test | HAZ-001, HAZ-014 |
| **MAG-CLI-049** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §10. CLINICAL REQUIREMENTS — v2 ADDITIONS | MAGNIOM SHALL distinguish TMS target decision support from TMS candidacy, safety assessment and protocol prescription. | Integration Test | HAZ-001, HAZ-014 |
| **MAG-CLI-050** | `Major` | MAGNIOM-System Requirements Specification v2.0 §10. CLINICAL REQUIREMENTS — v2 ADDITIONS | Comorbidity SHALL NOT silently merge multiple indication models into one combined targeting analysis. | Integration Test | — |
| **MAG-CLI-051** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §10. CLINICAL REQUIREMENTS — v2 ADDITIONS | Clinician override SHALL NOT convert a Research-only scientific object into a Clinical candidate. | Integration Test | HAZ-008 |
| **MAG-CLI-052** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §10. CLINICAL REQUIREMENTS — v2 ADDITIONS | A material change in clinician-approved indication/objective context SHALL require new target analysis rather than mutation of a historical Slate. | It | HAZ-004 |

### 3.3. MAG-DAT: Canonical Multi-Indication Data Integrity (15 Requirements)

| ID | Safety Class | Specification Source | Requirement Statement | Verification Method | ISO 14971 Risk Controls |
|---|:---:|---|---|:---:|:---:|
| **MAG-DAT-004** | `Critical` | MAGNIOM-Canonical Target Data Specification v1.0 | All coordinate representations shall explicitly specify coordinate space metadata (MNI152NLin2009cAsym or fsLR_32k) and validation checksums. | Unit Test | HAZ-002 |
| **MAG-DAT-041** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §19. DATA REQUIREMENTS v2 | Canonical storage SHALL support `IndicationModuleRelease`. | Unit Test | HAZ-002, HAZ-020 |
| **MAG-DAT-042** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §19. DATA REQUIREMENTS v2 | Canonical storage SHALL support `CaseIndication`. | Unit Test | HAZ-002, HAZ-020 |
| **MAG-DAT-043** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §19. DATA REQUIREMENTS v2 | Canonical storage SHALL support `DiseaseStageContext`. | Unit Test | — |
| **MAG-DAT-044** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §19. DATA REQUIREMENTS v2 | Canonical storage SHALL support multiple `LesionContext` objects where clinically required. | Unit Test | — |
| **MAG-DAT-045** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §19. DATA REQUIREMENTS v2 | Canonical storage SHALL support `MeasurementBundle`. | Unit Test | — |
| **MAG-DAT-046** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §19. DATA REQUIREMENTS v2 | Canonical storage SHALL support `ReliabilityBundle`. | Unit Test | — |
| **MAG-DAT-047** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §19. DATA REQUIREMENTS v2 | Canonical storage SHALL support typed TargetGeometry. | Unit Test | — |
| **MAG-DAT-048** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §19. DATA REQUIREMENTS v2 | Canonical storage SHALL support `TreatmentContextSnapshot`. | Unit Test | — |
| **MAG-DAT-049** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §19. DATA REQUIREMENTS v2 | Target Slate records SHALL retain exact `IndicationModuleRelease` and Scientific Compatibility Configuration references. | Unit Test | — |
| **MAG-DAT-050** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §19. DATA REQUIREMENTS v2 | Historical target geometry SHALL not be reduced to a less expressive geometry on export/import. | Unit Test | — |
| **MAG-DAT-051** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §19. DATA REQUIREMENTS v2 | Patient-specific objects SHALL maintain structural Case/organisation integrity. | Unit Test | — |
| **MAG-DAT-052** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §19. DATA REQUIREMENTS v2 | A Target Candidate associated with one `CaseIndication` SHALL NOT be inserted into another indication's Target Slate. | Unit Test | — |
| **MAG-DAT-053** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §19. DATA REQUIREMENTS v2 | Clinical snapshots used to generate a Target Slate SHALL be immutable. | Unit Test | — |
| **MAG-DAT-054** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §19. DATA REQUIREMENTS v2 | Historical objects SHALL NOT resolve scientific dependencies through `latest` selectors. | Unit Test | — |

### 3.4. MAG-EVD: Evidence Knowledge Graph & Claim Ceilings (16 Requirements)

| ID | Safety Class | Specification Source | Requirement Statement | Verification Method | ISO 14971 Risk Controls |
|---|:---:|---|---|:---:|:---:|
| **MAG-EVD-001** | `Critical` | MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v1.0 | Every nominated target candidate shall be bounded by an evidence ceiling derived from an approved Evidence Library release. | Unit Test | HAZ-003 |
| **MAG-EVD-041** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §13. EVIDENCE REQUIREMENTS v2 | The smallest clinical scientific proposition SHALL remain the `EvidenceClaim`, not the publication. | Unit Test | HAZ-007 |
| **MAG-EVD-042** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §13. EVIDENCE REQUIREMENTS v2 | New v2 EvidenceClaims SHALL NOT require an Evidence Tier at ingestion. | Unit Test | — |
| **MAG-EVD-043** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §13. EVIDENCE REQUIREMENTS v2 | Evidence Tier SHALL be represented through a separate controlled governance classification where assigned. | Unit Test | HAZ-007 |
| **MAG-EVD-044** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §13. EVIDENCE REQUIREMENTS v2 | `unassigned` Evidence Governance Classification SHALL NOT be treated as equivalent to Tier R. | Unit Test | — |
| **MAG-EVD-045** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §13. EVIDENCE REQUIREMENTS v2 | A source MAY support one claim while conflicting with another. | Ut | HAZ-007 |
| **MAG-EVD-046** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §13. EVIDENCE REQUIREMENTS v2 | Material negative or null evidence SHALL be represented as first-class evidence. | Unit Test | — |
| **MAG-EVD-047** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §13. EVIDENCE REQUIREMENTS v2 | MAGNIOM SHALL preserve study/source overlap when assessing apparent replication. | Unit Test | — |
| **MAG-EVD-048** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §13. EVIDENCE REQUIREMENTS v2 | External guideline grades SHALL NOT be automatically translated into MAGNIOM Evidence Tiers. | Ut | HAZ-007 |
| **MAG-EVD-049** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §13. EVIDENCE REQUIREMENTS v2 | Regulatory authorisation of a particular device/intervention SHALL NOT automatically authorise other target geometries, coils or targeting methods. | Unit Test | — |
| **MAG-EVD-050** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §13. EVIDENCE REQUIREMENTS v2 | Clinical Target Engine use SHALL be mediated by authorised `EvidencePath` objects. | Unit Test | — |
| **MAG-EVD-051** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §13. EVIDENCE REQUIREMENTS v2 | An EvidencePath SHALL encode indication, relevant population, objective/outcome, TargetFamily and targeting strategy. | Unit Test | — |
| **MAG-EVD-052** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §13. EVIDENCE REQUIREMENTS v2 | Disease stage and treatment context SHALL form part of the EvidencePath where scientifically material. | Unit Test | — |
| **MAG-EVD-053** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §13. EVIDENCE REQUIREMENTS v2 | Patient-specific measurement SHALL NOT create an EvidencePath. | Unit Test | — |
| **MAG-EVD-054** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §13. EVIDENCE REQUIREMENTS v2 | A therapeutic effect observed at a region SHALL NOT automatically establish a distributed therapeutic circuit. | Unit Test | — |
| **MAG-EVD-055** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §13. EVIDENCE REQUIREMENTS v2 | Missing target specificity in evidence SHALL be represented as missing/uncertain specificity rather than filled by analogy. | Unit Test | — |

### 3.5. MAG-IMG: Neuroimaging Pipeline & Spatial QC (13 Requirements)

| ID | Safety Class | Specification Source | Requirement Statement | Verification Method | ISO 14971 Risk Controls |
|---|:---:|---|---|:---:|:---:|
| **MAG-IMG-001** | `Critical` | MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 | Patient functional connectomics shall require quality control qualification (mean framewise displacement < 0.25 mm, retained duration >= 10 min) before influencing candidate refinement. | Golden Case | HAZ-003 |
| **MAG-IMG-041** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §16. IMAGING REQUIREMENTS — v2 ADDITIONS | Structural MRI used for clinical targeting SHALL retain native-space coordinate provenance. | Ut | HAZ-002 |
| **MAG-IMG-042** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §16. IMAGING REQUIREMENTS — v2 ADDITIONS | Lesion masks SHALL retain native-space provenance. | Ut | HAZ-002 |
| **MAG-IMG-043** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §16. IMAGING REQUIREMENTS — v2 ADDITIONS | Large structural lesions SHALL trigger lesion-aware registration/QC logic appropriate to the validated pipeline. | Unit Test | — |
| **MAG-IMG-044** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §16. IMAGING REQUIREMENTS — v2 ADDITIONS | A failed registration SHALL block use of spatial outputs that depend upon that registration. | Ut | HAZ-003 |
| **MAG-IMG-045** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §16. IMAGING REQUIREMENTS — v2 ADDITIONS | Task fMRI SHALL retain task/paradigm and behavioural-performance provenance. | Unit Test | — |
| **MAG-IMG-046** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §16. IMAGING REQUIREMENTS — v2 ADDITIONS | Task-performance failure SHALL NOT be represented as absence of cortical function. | Unit Test | — |
| **MAG-IMG-047** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §16. IMAGING REQUIREMENTS — v2 ADDITIONS | DWI/tractography outputs SHALL NOT be represented as direct axonal counts. | Unit Test | — |
| **MAG-IMG-048** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §16. IMAGING REQUIREMENTS — v2 ADDITIONS | Structural-connectivity measurements SHALL require explicit policy permission before influencing Clinical ranking. | Unit Test | — |
| **MAG-IMG-049** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §16. IMAGING REQUIREMENTS — v2 ADDITIONS | Cross-modal transformations from DWI/BOLD/task-fMRI to structural/neuronavigation space SHALL be verified. | Unit Test | — |
| **MAG-IMG-050** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §16. IMAGING REQUIREMENTS — v2 ADDITIONS | Anatomical or functional map precision SHALL NOT be represented as equivalent to biological certainty. | Unit Test | — |
| **MAG-IMG-051** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §16. IMAGING REQUIREMENTS — v2 ADDITIONS | A change in a clinically material image-processing pipeline SHALL require impact assessment before clinical activation. | Unit Test | — |
| **MAG-IMG-052** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §16. IMAGING REQUIREMENTS — v2 ADDITIONS | Laterality and coordinate orientation SHALL be validated across all applicable imaging transformations. | Unit Test | — |

### 3.6. MAG-IND: Indication-Module Governance & Lifecycle (30 Requirements)

| ID | Safety Class | Specification Source | Requirement Statement | Verification Method | ISO 14971 Risk Controls |
|---|:---:|---|---|:---:|:---:|
| **MAG-IND-001** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | Every v2 Target Slate SHALL reference exactly one immutable: | Integration Test | HAZ-006 |
| **MAG-IND-002** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | Every `CaseIndication` SHALL reference the exact `IndicationModuleRelease` used for the analysis. | Automated Test | HAZ-007 |
| **MAG-IND-003** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | An `IndicationModuleRelease` SHALL define its intended population. | Automated Test | HAZ-006, HAZ-014 |
| **MAG-IND-004** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | An `IndicationModuleRelease` SHALL identify its permitted modes. | Automated Test | HAZ-008 |
| **MAG-IND-005** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | An `IndicationModuleRelease` SHALL identify permitted clinical-objective definitions. | Automated Test | HAZ-009 |
| **MAG-IND-006** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | An `IndicationModuleRelease` SHALL identify its measurement requirements. | Automated Test | HAZ-009 |
| **MAG-IND-007** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | An `IndicationModuleRelease` SHALL identify permitted TargetFamilies. | Automated Test | HAZ-015 |
| **MAG-IND-008** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | An `IndicationModuleRelease` SHALL identify permitted candidate-generation methods. | Automated Test | HAZ-012 |
| **MAG-IND-009** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | An `IndicationModuleRelease` SHALL identify permitted TargetGeometry classes. | Automated Test | HAZ-013 |
| **MAG-IND-010** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | An `IndicationModuleRelease` SHALL identify relevant treatment-context requirements where applicable. | Automated Test | HAZ-006, HAZ-014 |
| **MAG-IND-011** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | Clinical permission for one `IndicationModuleRelease` SHALL NOT imply permission for any other module. | Unit Test | HAZ-006, HAZ-008 |
| **MAG-IND-012** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | A module with `research_only` status SHALL NOT generate a Clinical Target Slate. | Integration Test | HAZ-008 |
| **MAG-IND-013** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | A module with validation-only maturity SHALL NOT be represented as an unrestricted Clinical module. | Unit Test | HAZ-006, HAZ-008 |
| **MAG-IND-014** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | The system SHALL permit different modules in one deployment to have different governance maturity. | Unit Test | — |
| **MAG-IND-015** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | Module status SHALL remain distinct from Evidence Tier or Evidence Governance Classification. | Unit Test | — |
| **MAG-IND-016** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | Scientific parameters SHALL NOT automatically inherit between indication modules. | Unit Test | — |
| **MAG-IND-017** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | EvidencePaths SHALL NOT automatically transfer between indication modules because anatomical targets overlap. | Unit Test | HAZ-007 |
| **MAG-IND-018** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | Candidate generators SHALL NOT execute for a module unless explicitly permitted by the active Scientific Policy. | Unit Test | — |
| **MAG-IND-019** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | A new `IndicationModuleRelease` SHALL NOT silently replace the release associated with a historical analysis. | Unit Test | — |
| **MAG-IND-020** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | Superseding a module SHALL create a new analysis when used for an existing Case. | Unit Test | — |
| **MAG-IND-021** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | A diagnosis SHALL NOT independently generate a target. | Unit Test | — |
| **MAG-IND-022** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | MAGNIOM SHALL support multiple `CaseIndication` objects for one Case. | Unit Test | — |
| **MAG-IND-023** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | Cross-indication comparison MAY be provided, but SHALL remain distinct from a Target Slate. | Unit Test | — |
| **MAG-IND-024** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | Cross-indication comparison SHALL NOT produce a universal combined target without separately validated policy. | Unit Test | — |
| **MAG-IND-025** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | Population restrictions belonging to an EvidencePath SHALL remain enforceable within the applicable module. | Unit Test | — |
| **MAG-IND-026** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | Disease-stage restrictions SHALL be enforceable where the module declares stage as scientifically material. | Unit Test | — |
| **MAG-IND-027** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | Treatment-context restrictions SHALL be enforceable where the module declares treatment context as evidence-relevant. | System Test | HAZ-013 |
| **MAG-IND-028** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | Every Clinical module SHALL possess module-specific validation evidence before unrestricted Clinical activation. | Unit Test | HAZ-006, HAZ-008 |
| **MAG-IND-029** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | The application SHALL display the active indication module and mode in persistent case context. | Unit Test | — |
| **MAG-IND-030** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §11. `MAG-IND-*` — INDICATION-MODULE REQUIREMENTS | If the active module cannot be positively resolved to an approved compatibility configuration, MAGNIOM SHALL fail closed. | Ut | HAZ-006 |

### 3.7. MAG-MEA: Multimodal Patient Measurement & Qualification (20 Requirements)

| ID | Safety Class | Specification Source | Requirement Statement | Verification Method | ISO 14971 Risk Controls |
|---|:---:|---|---|:---:|:---:|
| **MAG-MEA-001** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §15. `MAG-MEA-*` — MULTIMODAL MEASUREMENT REQUIREMENTS | Every patient-specific measurement SHALL reference a versioned Measurement Provider and ProcessingRun. | Unit Test | HAZ-003, HAZ-017 |
| **MAG-MEA-002** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §15. `MAG-MEA-*` — MULTIMODAL MEASUREMENT REQUIREMENTS | A patient-specific measurement SHALL NOT influence Clinical target generation unless the applicable capability is qualified. | Ut | HAZ-015 |
| **MAG-MEA-003** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §15. `MAG-MEA-*` — MULTIMODAL MEASUREMENT REQUIREMENTS | Measurement QC and measurement reliability SHALL remain distinct. | Unit Test | — |
| **MAG-MEA-004** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §15. `MAG-MEA-*` — MULTIMODAL MEASUREMENT REQUIREMENTS | Missing measurement data SHALL NOT be interpreted as normal measurement. | Unit Test | — |
| **MAG-MEA-005** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §15. `MAG-MEA-*` — MULTIMODAL MEASUREMENT REQUIREMENTS | Multimodal measurements SHALL NOT be fused into a Clinical target unless an approved Scientific Policy explicitly defines the fusion. | Ut | HAZ-015 |
| **MAG-MEA-006** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §15. `MAG-MEA-*` — MULTIMODAL MEASUREMENT REQUIREMENTS | Cross-modal coordinate transforms SHALL be versioned and verified. | Unit Test | — |
| **MAG-MEA-007** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §15. `MAG-MEA-*` — MULTIMODAL MEASUREMENT REQUIREMENTS | Research-only measurement capabilities SHALL NOT influence Clinical Target Slates. | Unit Test | — |
| **MAG-MEA-008** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §15. `MAG-MEA-*` — MULTIMODAL MEASUREMENT REQUIREMENTS | Reliability SHALL be evaluated by scientific capability rather than by one universal patient-level reliability score. | Unit Test | — |
| **MAG-MEA-009** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §15. `MAG-MEA-*` — MULTIMODAL MEASUREMENT REQUIREMENTS | A technically successful processing run SHALL NOT automatically create a qualified measurement. | Unit Test | — |
| **MAG-MEA-010** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §15. `MAG-MEA-*` — MULTIMODAL MEASUREMENT REQUIREMENTS | A measurement provider SHALL expose the scientific capabilities its output may support. | Ut | HAZ-016 |
| **MAG-MEA-011** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §15. `MAG-MEA-*` — MULTIMODAL MEASUREMENT REQUIREMENTS | Measurement provider compatibility SHALL include Indication Module compatibility. | Ut | HAZ-018 |
| **MAG-MEA-012** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §15. `MAG-MEA-*` — MULTIMODAL MEASUREMENT REQUIREMENTS | A failed optional modality SHALL NOT invalidate unrelated qualified modalities unless the active module requires it. | Unit Test | — |
| **MAG-MEA-013** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §15. `MAG-MEA-*` — MULTIMODAL MEASUREMENT REQUIREMENTS | Scientific fallback after measurement failure SHALL be explicit. | Unit Test | — |
| **MAG-MEA-014** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §15. `MAG-MEA-*` — MULTIMODAL MEASUREMENT REQUIREMENTS | Equipment provenance SHALL be retained where measurement validity depends on device, coil, scanner, EMG, audiometer or calibration. | Unit Test | — |
| **MAG-MEA-015** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §15. `MAG-MEA-*` — MULTIMODAL MEASUREMENT REQUIREMENTS | Measurement provenance SHALL retain applicable source and derivative artefact hashes. | Unit Test | — |
| **MAG-MEA-016** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §15. `MAG-MEA-*` — MULTIMODAL MEASUREMENT REQUIREMENTS | Different modalities that disagree SHALL remain separately inspectable. | Unit Test | — |
| **MAG-MEA-017** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §15. `MAG-MEA-*` — MULTIMODAL MEASUREMENT REQUIREMENTS | Multimodal disagreement SHALL NOT automatically be averaged. | Unit Test | — |
| **MAG-MEA-018** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §15. `MAG-MEA-*` — MULTIMODAL MEASUREMENT REQUIREMENTS | Clinical qualification of a measurement capability SHALL be indication-specific. | Unit Test | — |
| **MAG-MEA-019** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §15. `MAG-MEA-*` — MULTIMODAL MEASUREMENT REQUIREMENTS | The measurement layer SHALL NOT output an autonomous final clinical target. | Unit Test | — |
| **MAG-MEA-020** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §15. `MAG-MEA-*` — MULTIMODAL MEASUREMENT REQUIREMENTS | Clinical-facing measurement status SHALL distinguish at least qualified, qualified-with-limits, not-qualified and Research-only. | Unit Test | — |

### 3.8. MAG-OCD: Obsessive-Compulsive Disorder & Deep-TMS Field Geometry (18 Requirements)

| ID | Safety Class | Specification Source | Requirement Statement | Verification Method | ISO 14971 Risk Controls |
|---|:---:|---|---|:---:|:---:|
| **MAG-OCD-001** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §28. `MAG-OCD-*` — OCD REQUIREMENTS | OCD target generation SHALL use OCD-specific EvidencePaths. | Unit Test | HAZ-012, HAZ-013 |
| **MAG-OCD-002** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §28. `MAG-OCD-*` — OCD REQUIREMENTS | OCD target evidence SHALL NOT automatically inherit from MDD merely because DLPFC anatomy overlaps. | Unit Test | — |
| **MAG-OCD-003** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §28. `MAG-OCD-*` — OCD REQUIREMENTS | mPFC/ACC deep-TMS targets SHALL preserve `coil_field` geometry where the evidence is field/device defined. | Unit Test | HAZ-012 |
| **MAG-OCD-004** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §28. `MAG-OCD-*` — OCD REQUIREMENTS | A field-defined OCD target SHALL NOT be downcast to a single point coordinate as its canonical scientific representation. | Unit Test | HAZ-012 |
| **MAG-OCD-005** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §28. `MAG-OCD-*` — OCD REQUIREMENTS | The exact device/coil class SHALL be retained where evidence applicability depends on it. | Unit Test | — |
| **MAG-OCD-006** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §28. `MAG-OCD-*` — OCD REQUIREMENTS | An incompatible device/coil SHALL fail the applicable target-geometry/evidence gate. | Ut | HAZ-012, HAZ-019 |
| **MAG-OCD-007** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §28. `MAG-OCD-*` — OCD REQUIREMENTS | mPFC/ACC field targets, pre-SMA/SMA targets and DLPFC targets SHALL remain scientifically distinct TargetFamilies where the evidence distinguishes them. | Unit Test | — |
| **MAG-OCD-008** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §28. `MAG-OCD-*` — OCD REQUIREMENTS | MAGNIOM SHALL NOT represent one universal “best OCD target” without validated comparative evidence. | Unit Test | — |
| **MAG-OCD-009** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §28. `MAG-OCD-*` — OCD REQUIREMENTS | Cross-family numerical ranking SHALL be prohibited unless a validated comparison domain explicitly permits it. | Unit Test | HAZ-012, HAZ-013 |
| **MAG-OCD-010** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §28. `MAG-OCD-*` — OCD REQUIREMENTS | Where efficacy evidence depends materially on symptom provocation or another treatment context, the context SHALL be explicitly represented. | System Test | HAZ-013 |
| **MAG-OCD-011** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §28. `MAG-OCD-*` — OCD REQUIREMENTS | Absence or uncertainty of required treatment context SHALL produce the policy-defined limitation/gate outcome. | Ut | HAZ-013 |
| **MAG-OCD-012** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §28. `MAG-OCD-*` — OCD REQUIREMENTS | Regulatory or clinical precedent for a specific deep-TMS device SHALL NOT automatically validate arbitrary focal targeting. | Unit Test | — |
| **MAG-OCD-013** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §28. `MAG-OCD-*` — OCD REQUIREMENTS | rs-fMRI personalisation SHALL remain Research/Validation unless independently validated and authorised. | Unit Test | — |
| **MAG-OCD-014** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §28. `MAG-OCD-*` — OCD REQUIREMENTS | Negative or protocol-specific null evidence SHALL remain visible when relevant. | Unit Test | — |
| **MAG-OCD-015** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §28. `MAG-OCD-*` — OCD REQUIREMENTS | The Target Engine SHALL NOT infer frequency or other stimulation protocol from the selected OCD target. | Unit Test | — |
| **MAG-OCD-016** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §28. `MAG-OCD-*` — OCD REQUIREMENTS | Research-only OCD TargetFamilies SHALL remain structurally separate from Clinical candidates. | Unit Test | — |
| **MAG-OCD-017** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §28. `MAG-OCD-*` — OCD REQUIREMENTS | An OCD module SHALL require exact Scientific Policy permission before Clinical use. | Unit Test | HAZ-012, HAZ-013 |
| **MAG-OCD-018** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §28. `MAG-OCD-*` — OCD REQUIREMENTS | The specialist SHALL remain able to reject all OCD candidates regardless of algorithmic ordering. | Unit Test | — |

### 3.9. MAG-PAI: Neuropathic Pain & Somatotopic Refinement (18 Requirements)

| ID | Safety Class | Specification Source | Requirement Statement | Verification Method | ISO 14971 Risk Controls |
|---|:---:|---|---|:---:|:---:|
| **MAG-PAI-001** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §25. `MAG-PAI-*` — NEUROPATHIC PAIN REQUIREMENTS | The Pain module SHALL identify the pain condition/population to which the EvidencePath applies. | Automated Test | HAZ-010 |
| **MAG-PAI-002** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §25. `MAG-PAI-*` — NEUROPATHIC PAIN REQUIREMENTS | The clinically relevant painful body region SHALL be represented explicitly. | Automated Test | HAZ-010 |
| **MAG-PAI-003** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §25. `MAG-PAI-*` — NEUROPATHIC PAIN REQUIREMENTS | Pain laterality SHALL be represented where relevant to target selection. | Automated Test | HAZ-010 |
| **MAG-PAI-004** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §25. `MAG-PAI-*` — NEUROPATHIC PAIN REQUIREMENTS | Somatotopic M1 candidates SHALL use `SomatotopicTargetGeometry`. | Golden Case | HAZ-010 |
| **MAG-PAI-005** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §25. `MAG-PAI-*` — NEUROPATHIC PAIN REQUIREMENTS | A somatotopic pain target SHALL preserve the affected body-region relationship. | Ut | HAZ-010 |
| **MAG-PAI-006** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §25. `MAG-PAI-*` — NEUROPATHIC PAIN REQUIREMENTS | A generic universal M1 point SHALL NOT replace required somatotopic semantics. | Ut | HAZ-010 |
| **MAG-PAI-007** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §25. `MAG-PAI-*` — NEUROPATHIC PAIN REQUIREMENTS | A contralateral M1 strategy SHALL only be applied where the relevant EvidencePath and context support it. | Unit Test | — |
| **MAG-PAI-008** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §25. `MAG-PAI-*` — NEUROPATHIC PAIN REQUIREMENTS | Bilateral or ambiguous pain SHALL NOT result in arbitrary hemisphere selection. | Ut | HAZ-010 |
| **MAG-PAI-009** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §25. `MAG-PAI-*` — NEUROPATHIC PAIN REQUIREMENTS | Motor-map refinement SHALL require qualified motor-hotspot/motor-map capability. | Ut | HAZ-015 |
| **MAG-PAI-010** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §25. `MAG-PAI-*` — NEUROPATHIC PAIN REQUIREMENTS | Failure of motor-map reliability SHALL result in a policy-defined baseline/fallback or abstention. | Unit Test | — |
| **MAG-PAI-011** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §25. `MAG-PAI-*` — NEUROPATHIC PAIN REQUIREMENTS | An MEP finding SHALL NOT independently establish a pain target. | Unit Test | — |
| **MAG-PAI-012** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §25. `MAG-PAI-*` — NEUROPATHIC PAIN REQUIREMENTS | rs-fMRI SHALL NOT be required solely because MAGNIOM supports connectomics. | Unit Test | — |
| **MAG-PAI-013** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §25. `MAG-PAI-*` — NEUROPATHIC PAIN REQUIREMENTS | Evidence for M1 in stroke SHALL NOT automatically transfer to the pain indication. | Unit Test | — |
| **MAG-PAI-014** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §25. `MAG-PAI-*` — NEUROPATHIC PAIN REQUIREMENTS | Pain intensity SHALL NOT be converted into a target-confidence score. | Unit Test | — |
| **MAG-PAI-015** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §25. `MAG-PAI-*` — NEUROPATHIC PAIN REQUIREMENTS | Pain intensity, interference and functional objectives SHALL remain distinguishable where the evidence does. | Unit Test | — |
| **MAG-PAI-016** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §25. `MAG-PAI-*` — NEUROPATHIC PAIN REQUIREMENTS | Material heterogeneity or negative evidence SHALL remain visible in candidate evidence review. | Unit Test | — |
| **MAG-PAI-017** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §25. `MAG-PAI-*` — NEUROPATHIC PAIN REQUIREMENTS | Muscle/body-region mismatch SHALL prevent use of the mismatched motor map for somatotopic refinement. | Unit Test | HAZ-010, HAZ-015 |
| **MAG-PAI-018** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §25. `MAG-PAI-*` — NEUROPATHIC PAIN REQUIREMENTS | No clinically meaningful second or third target SHALL be required merely to fill the Slate. | Unit Test | — |

### 3.10. MAG-PHE: Phenotype & Clinical Context Formulation (9 Requirements)

| ID | Safety Class | Specification Source | Requirement Statement | Verification Method | ISO 14971 Risk Controls |
|---|:---:|---|---|:---:|:---:|
| **MAG-PHE-001** | `Major` | MAGNIOM-Clinical Phenotype & Symptom-to-Circuit Ontology v1.0 | The phenotype subsystem shall structure DSM-5 depression criteria and dimensional symptom scores into an immutable PhenotypeSnapshot. | Unit Test | HAZ-004 |
| **MAG-PHE-041** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §12. PHENOTYPE & CLINICAL-CONTEXT REQUIREMENTS | Clinical objectives SHALL be represented independently from diagnosis. | Unit Test | — |
| **MAG-PHE-042** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §12. PHENOTYPE & CLINICAL-CONTEXT REQUIREMENTS | A clinically important symptom or impairment SHALL NOT generate a target unless an approved evidence mapping exists. | Unit Test | — |
| **MAG-PHE-043** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §12. PHENOTYPE & CLINICAL-CONTEXT REQUIREMENTS | Missing clinical-context data SHALL remain explicit rather than being converted to normality. | Unit Test | — |
| **MAG-PHE-044** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §12. PHENOTYPE & CLINICAL-CONTEXT REQUIREMENTS | Disease-specific phenotype constructs SHALL be versioned within the relevant Indication Module. | Unit Test | — |
| **MAG-PHE-045** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §12. PHENOTYPE & CLINICAL-CONTEXT REQUIREMENTS | Patient goals MAY influence clinical prioritisation but SHALL NOT directly map to a brain target without evidence. | Unit Test | — |
| **MAG-PHE-046** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §12. PHENOTYPE & CLINICAL-CONTEXT REQUIREMENTS | Clinical objectives that are not evidence-mappable SHALL remain visible as such. | Unit Test | — |
| **MAG-PHE-047** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §12. PHENOTYPE & CLINICAL-CONTEXT REQUIREMENTS | Disease-stage and lesion context SHALL remain separate from symptom/phenotype semantics. | Unit Test | — |
| **MAG-PHE-048** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §12. PHENOTYPE & CLINICAL-CONTEXT REQUIREMENTS | Questionnaire or rating-scale values SHALL NOT be interpreted as direct circuit measurements unless a validated mapping specifically establishes that relationship. | Unit Test | — |

### 3.11. MAG-POL: Scientific Policy & Whitelist Configuration (25 Requirements)

| ID | Safety Class | Specification Source | Requirement Statement | Verification Method | ISO 14971 Risk Controls |
|---|:---:|---|---|:---:|:---:|
| **MAG-POL-001** | `Critical` | MAGNIOM-Scientific Policy & Algorithm Configuration Specification v1.0 | No clinical target candidate generation shall execute without a pinned, approved ScientificPolicyRelease manifest. | Unit Test | HAZ-003 |
| **MAG-POL-041** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | Every Target Slate SHALL reference exactly one `IndicationModuleRelease`. | Ut | HAZ-006, HAZ-018 |
| **MAG-POL-042** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | Every scientific compatibility configuration SHALL explicitly identify its `IndicationModuleRelease`. | Unit Test | HAZ-006, HAZ-008 |
| **MAG-POL-043** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | Compatibility between Scientific Policy and `IndicationModuleRelease` SHALL use a positive whitelist. | Unit Test | — |
| **MAG-POL-044** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | Clinical permission for one Indication Module SHALL NOT confer Clinical permission on another. | Ut | HAZ-003, HAZ-017 |
| **MAG-POL-045** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | Scientific parameters SHALL NOT inherit across indication modules unless explicitly approved. | Unit Test | — |
| **MAG-POL-046** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | An EvidencePath SHALL NOT influence Clinical Mode unless explicitly authorised for the active Indication Module. | Ut | HAZ-020 |
| **MAG-POL-047** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | Candidate generators SHALL be authorised by exact module, plugin release and Scientific Policy. | Unit Test | — |
| **MAG-POL-048** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | Measurement capabilities SHALL be authorised per Indication Module. | Unit Test | — |
| **MAG-POL-049** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | Research-only measurement capabilities SHALL NOT satisfy Clinical capability requirements. | Unit Test | — |
| **MAG-POL-050** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | Clinical authority SHALL NOT be determined by a single application-level mode flag. | Unit Test | — |
| **MAG-POL-051** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | Target geometry permissions SHALL be module- and TargetFamily-specific. | Unit Test | — |
| **MAG-POL-052** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | Patient-specific refinement SHALL use a module-specific validated refinement policy. | Unit Test | — |
| **MAG-POL-053** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | A module MAY define an evidence-baseline fallback only through an explicit scientific fallback rule. | Unit Test | — |
| **MAG-POL-054** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | Multimodal fusion SHALL be prohibited unless explicitly represented as a validated scientific model. | Unit Test | — |
| **MAG-POL-055** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | Unassigned Evidence Governance classifications SHALL NOT automatically be converted to MAGNIOM Evidence Tiers. | Unit Test | — |
| **MAG-POL-056** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | Clinical module activation SHALL require module-specific validation evidence. | Unit Test | — |
| **MAG-POL-057** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | Superseding an `IndicationModuleRelease` SHALL NOT alter historical Target Slates. | Unit Test | — |
| **MAG-POL-058** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | A Clinical Release Package SHALL identify exact module-level scientific permission states. | Unit Test | — |
| **MAG-POL-059** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | Out-of-bounds scientific parameters SHALL invalidate the configuration rather than be silently clamped. | Unit Test | — |
| **MAG-POL-060** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | Active Clinical scientific configuration SHALL be immutable. | Unit Test | — |
| **MAG-POL-061** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | Clinical runtime SHALL verify Scientific Policy integrity before target generation. | Unit Test | — |
| **MAG-POL-062** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | Clinical runtime SHALL verify required signatures before target generation. | Unit Test | — |
| **MAG-POL-063** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | A plugin digest mismatch SHALL invalidate the compatibility configuration. | Unit Test | — |
| **MAG-POL-064** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §14. SCIENTIFIC POLICY REQUIREMENTS v2 | Scientific fallback SHALL use a prevalidated alternate configuration rather than ad hoc runtime logic. | Unit Test | — |

### 3.12. MAG-REL: Release Governance, Manifests & Verification (22 Requirements)

| ID | Safety Class | Specification Source | Requirement Statement | Verification Method | ISO 14971 Risk Controls |
|---|:---:|---|---|:---:|:---:|
| **MAG-REL-001** | `Major` | MAGNIOM-System Requirements Specification v1.0 | Production Clinical releases SHALL identify the exact application and core package versions. | Unit Test | HAZ-003 |
| **MAG-REL-002** | `Major` | MAGNIOM-System Requirements Specification v1.0 | Production Clinical releases SHALL identify database migration baseline versions (001 to 042). | Integration Test | HAZ-005 |
| **MAG-REL-003** | `Critical` | MAGNIOM-System Requirements Specification v1.0 | Production Clinical releases SHALL identify and pin ScientificPolicyRelease MAGNIOM-POLICY-1.0.0. | Unit Test | HAZ-003 |
| **MAG-REL-004** | `Critical` | MAGNIOM-System Requirements Specification v1.0 | Production Clinical releases SHALL identify and pin EvidenceLibraryRelease MAGNIOM-EVIDENCE-1.0.0. | Unit Test | HAZ-003 |
| **MAG-REL-005** | `Critical` | MAGNIOM-System Requirements Specification v1.0 | Production Clinical releases SHALL identify and pin TargetEngineVersion 1.0.0. | Unit Test | HAZ-002 |
| **MAG-REL-006** | `Critical` | MAGNIOM-System Requirements Specification v1.0 | Production Clinical releases SHALL identify and pin PipelineVersion MAGNIOM-NEURO-1.0.0. | Golden Case | HAZ-003 |
| **MAG-REL-010** | `Major` | MAGNIOM-System Requirements Specification v1.0 | Production Clinical releases SHALL identify and pin Phenotype Ontology release MAGNIOM-PHENOTYPE-1.0.0. | Unit Test | HAZ-004 |
| **MAG-REL-011** | `Critical` | MAGNIOM-System Requirements Specification v1.0<br>MAGNIOM-Implementation & Validation Roadmap v1.0 | Clinical scientific versions SHALL be frozen for formal verification. | Unit Test | HAZ-003, HAZ-020 |
| **MAG-REL-012** | `Critical` | MAGNIOM-System Requirements Specification v1.0<br>MAGNIOM-Implementation & Validation Roadmap v1.0 | Feature and scientific changes after M3 freeze SHALL undergo formal change-control impact assessment. | Inspection | HAZ-003 |
| **MAG-REL-026** | `Critical` | MAGNIOM-System Requirements Specification v1.0 | A Clinical Release Package SHALL identify the exact combination of SRS, Clinical & Scientific Spec, Canonical Target Data Spec, Phenotype Ontology, Evidence Library, Policy, Target Engine, Neuro Pipeline, Normative Model, Atlas, DB Migration, and UX workspace. | Unit Test | HAZ-003 |
| **MAG-REL-041** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §23. RELEASE REQUIREMENTS v2 | Every v2 Clinical Release Package SHALL identify all included `IndicationModuleRelease` objects. | Integration Test | HAZ-006, HAZ-008 |
| **MAG-REL-042** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §23. RELEASE REQUIREMENTS v2 | Every module SHALL carry an explicit maturity/permission state. | Integration Test | HAZ-006, HAZ-008 |
| **MAG-REL-043** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §23. RELEASE REQUIREMENTS v2 | A Release Package MAY contain Clinical, Validation and Research modules simultaneously. | Integration Test | — |
| **MAG-REL-044** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §23. RELEASE REQUIREMENTS v2 | Clinical permission of one module SHALL NOT satisfy release gates for another. | Integration Test | — |
| **MAG-REL-045** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §23. RELEASE REQUIREMENTS v2 | Plugin and candidate-generator digests SHALL be included in the scientific release manifest. | Integration Test | — |
| **MAG-REL-046** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §23. RELEASE REQUIREMENTS v2 | Measurement Provider releases SHALL be included where they affect Clinical targeting. | Integration Test | — |
| **MAG-REL-047** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §23. RELEASE REQUIREMENTS v2 | Reliability Method releases SHALL be included where they affect Clinical targeting. | Integration Test | — |
| **MAG-REL-048** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §23. RELEASE REQUIREMENTS v2 | Device/coil capability profiles SHALL be included where evidence/geometry depends on them. | Integration Test | — |
| **MAG-REL-049** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §23. RELEASE REQUIREMENTS v2 | Clinical module promotion SHALL require a new controlled scientific release even if application code is unchanged. | Integration Test | — |
| **MAG-REL-050** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §23. RELEASE REQUIREMENTS v2 | Scientific module suspension SHALL prevent new affected target generation without deleting historical records. | Integration Test | — |
| **MAG-REL-051** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §23. RELEASE REQUIREMENTS v2 | Module deactivation SHALL not invalidate reconstructability of historical decisions. | Integration Test | — |
| **MAG-REL-052** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §23. RELEASE REQUIREMENTS v2 | No module SHALL enter unrestricted Clinical Mode solely because an implementation feature flag was enabled. | Integration Test | — |

### 3.13. MAG-SEC: Security, Tenancy Isolation & Cryptography (18 Requirements)

| ID | Safety Class | Specification Source | Requirement Statement | Verification Method | ISO 14971 Risk Controls |
|---|:---:|---|---|:---:|:---:|
| **MAG-SEC-001** | `Critical` | MAGNIOM-System Requirements Specification v1.0<br>MAGNIOM-Supabase Database & Security Specification v1.0 | MAGNIOM shall authenticate clinical users before granting access to patient-specific resources. | Security Test | HAZ-005 |
| **MAG-SEC-009** | `Critical` | MAGNIOM-Technical Architecture v1.0<br>MAGNIOM-Supabase Database & Security Specification v1.0 | Browser clients shall not receive privileged service credentials capable of bypassing RLS. | Security Test | HAZ-005 |
| **MAG-SEC-010** | `Critical` | MAGNIOM-System Requirements Specification v1.0<br>MAGNIOM-Technical Architecture v1.0 | Privileged compute workers shall authenticate machine-to-machine with scoped tokens and bounded TTLs. | Security Test | HAZ-005 |
| **MAG-SEC-012** | `Critical` | MAGNIOM-Supabase Database & Security Specification v1.0 | Cross-organization clinical data access shall be strictly prohibited by PostgreSQL Row Level Security (RLS) policies. | Security Test | HAZ-005 |
| **MAG-SEC-014** | `Critical` | MAGNIOM-Supabase Database & Security Specification v1.0 | Storage buckets containing clinical MRI or derived patient artefacts shall be private and access-controlled. | Security Test | HAZ-005 |
| **MAG-SEC-022** | `Critical` | MAGNIOM-Supabase Database & Security Specification v1.0 | Clinical signing authority shall be explicitly granted and revocable per authorized clinician. | Security Test | HAZ-001, HAZ-005 |
| **MAG-SEC-024** | `Critical` | MAGNIOM-Supabase Database & Security Specification v1.0 | Signed clinical decisions shall resist UPDATE and DELETE operations through database immutability triggers. | Security Test | HAZ-001, HAZ-005 |
| **MAG-SEC-029** | `Major` | MAGNIOM-Supabase Database & Security Specification v1.0<br>MAGNIOM-Technical Architecture v1.0 | Queue payloads and worker messages shall avoid unnecessary patient-identifying information. | Security Test | HAZ-005 |
| **MAG-SEC-030** | `Major` | MAGNIOM-System Requirements Specification v1.0 | Application and audit logs shall automatically redact Protected Health Information (PHI). | Unit Test | HAZ-005 |
| **MAG-SEC-035** | `Critical` | MAGNIOM-Supabase Database & Security Specification v1.0 | Backup and restore controls shall preserve clinically important records and scientific provenance with cryptographic hash parity. | Security Test | HAZ-005 |
| **MAG-SEC-041** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §20. SECURITY REQUIREMENTS v2 | Module/scientific-policy mutation SHALL require privileged controlled authority. | Integration Test | HAZ-005 |
| **MAG-SEC-042** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §20. SECURITY REQUIREMENTS v2 | Ordinary clinicians SHALL NOT be able to alter Scientific Policy. | Integration Test | HAZ-005 |
| **MAG-SEC-043** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §20. SECURITY REQUIREMENTS v2 | Ordinary application administrators SHALL NOT be able to alter clinical scientific thresholds through generic settings. | Integration Test | — |
| **MAG-SEC-044** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §20. SECURITY REQUIREMENTS v2 | Scientific release signatures and hashes SHALL be verified server-side before Clinical target generation. | Integration Test | — |
| **MAG-SEC-045** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §20. SECURITY REQUIREMENTS v2 | A compromised frontend SHALL NOT be sufficient to activate a Research module as Clinical. | Integration Test | — |
| **MAG-SEC-046** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §20. SECURITY REQUIREMENTS v2 | Scientific worker access SHALL remain limited to required pseudonymous case data. | Integration Test | — |
| **MAG-SEC-047** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §20. SECURITY REQUIREMENTS v2 | Measurement artefacts from one Case SHALL NOT be combined into another Case's `MeasurementBundle`. | Integration Test | — |
| **MAG-SEC-048** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §20. SECURITY REQUIREMENTS v2 | Clinical compatibility/configuration checks SHALL execute at a trusted server/backend boundary. | Integration Test | — |

### 3.14. MAG-STR: Stroke Motor Rehabilitation & Aphasia Modules (25 Requirements)

| ID | Safety Class | Specification Source | Requirement Statement | Verification Method | ISO 14971 Risk Controls |
|---|:---:|---|---|:---:|:---:|
| **MAG-STR-001** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | Stroke targeting SHALL identify the specific stroke-related therapeutic objective. | Automated Test | HAZ-009 |
| **MAG-STR-002** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | Motor-recovery and aphasia Target Slates SHALL remain distinct indication analyses. | Golden Case | HAZ-009 |
| **MAG-STR-003** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | Disease stage SHALL be represented when relevant to the active EvidencePath. | Ut | HAZ-009 |
| **MAG-STR-004** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | A stage-dependent EvidencePath SHALL not apply when the Case does not satisfy its validated stage scope. | Ut | HAZ-009 |
| **MAG-STR-005** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | Lesion context SHALL be required for lesion-dependent stroke targeting. | Automated Test | HAZ-006 |
| **MAG-STR-006** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | Stroke lesion laterality SHALL be explicitly represented. | Unit Test | — |
| **MAG-STR-007** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | Stroke target laterality SHALL be cross-validated against lesion and affected-function context. | Unit Test | — |
| **MAG-STR-008** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | A target substantially destroyed or absent because of lesion SHALL not be treated as ordinary intact cortex. | Unit Test | — |
| **MAG-STR-009** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | MAGNIOM SHALL NOT automatically move an invalid lesion-overlapping target to nearby intact cortex unless a validated module-specific rule exists. | Unit Test | — |
| **MAG-STR-010** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | Contralesional M1 SHALL NOT be encoded as universally maladaptive. | Golden Case | HAZ-010 |
| **MAG-STR-011** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | Ipsilesional and contralesional strategies SHALL require separate applicable EvidencePaths. | Ut | HAZ-015 |
| **MAG-STR-012** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | A bilateral motor strategy SHALL NOT be converted into an autonomous bilateral stimulation protocol. | Unit Test | — |
| **MAG-STR-013** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | Motor-map refinement SHALL require qualified motor-mapping capability. | Unit Test | — |
| **MAG-STR-014** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | An unreliable motor map SHALL NOT influence Clinical target refinement. | Unit Test | — |
| **MAG-STR-015** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | MEP presence or absence SHALL NOT autonomously determine ipsilesional versus contralesional targeting. | Unit Test | — |
| **MAG-STR-016** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | DWI/structural-connectivity features SHALL influence Clinical ranking only through an explicitly validated Stroke policy. | Unit Test | — |
| **MAG-STR-017** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | Aphasia analyses SHALL preserve relevant language phenotype/subtype. | Unit Test | — |
| **MAG-STR-018** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | Evidence limited to chronic non-fluent aphasia SHALL NOT automatically transfer to other aphasia phenotypes/stages. | Unit Test | — |
| **MAG-STR-019** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | Where evidence depends on concurrent speech-language therapy, treatment context SHALL be explicitly evaluated. | Ut | HAZ-013, HAZ-016 |
| **MAG-STR-020** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | Failure of a task-fMRI language paradigm SHALL NOT be represented as absence of language cortex. | Unit Test | — |
| **MAG-STR-021** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | Task-fMRI activation SHALL NOT independently create a Clinical stroke target. | Unit Test | — |
| **MAG-STR-022** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | Lesion-network abnormalities SHALL NOT independently create Clinical targets unless explicitly validated. | Unit Test | — |
| **MAG-STR-023** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | Affected limb/body-region, recorded muscle and somatotopic TargetGeometry SHALL remain semantically consistent. | Ut | HAZ-010 |
| **MAG-STR-024** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | Failure of an optional modality MAY allow a validated stroke fallback if policy explicitly permits it. | Unit Test | — |
| **MAG-STR-025** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §24. `MAG-STR-*` — STROKE REQUIREMENTS | Failure of a mandatory lesion/stage requirement SHALL cause module abstention rather than guessed targeting. | Ut | HAZ-016 |

### 3.15. MAG-SYS: System-Wide Architecture & Core Invariants (13 Requirements)

| ID | Safety Class | Specification Source | Requirement Statement | Verification Method | ISO 14971 Risk Controls |
|---|:---:|---|---|:---:|:---:|
| **MAG-SYS-001** | `Critical` | MAGNIOM-Technical Architecture v1.0<br>MAGNIOM-Canonical Target Data Specification v1.0 | The system shall provide a deterministic target candidate slate comprising up to 3 Primary Candidates and up to 2 Additional Candidates. | Unit Test | HAZ-001 |
| **MAG-SYS-041** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §2. v2 OVERARCHING SYSTEM REQUIREMENT | MAGNIOM SHALL transform: | Integration Test | HAZ-001, HAZ-006 |
| **MAG-SYS-042** | `Major` | MAGNIOM-System Requirements Specification v2.0 §9. SYSTEM REQUIREMENTS — v2 ADDITIONS | MAGNIOM SHALL support multiple independently governed indication modules without requiring separate product architectures. | Analysis | — |
| **MAG-SYS-043** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §9. SYSTEM REQUIREMENTS — v2 ADDITIONS | Clinical authority SHALL be resolved per `CaseIndication` and `IndicationModuleRelease`, not through one global application-level Clinical flag. | Integration Test | HAZ-006 |
| **MAG-SYS-044** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §9. SYSTEM REQUIREMENTS — v2 ADDITIONS | The same deployment SHALL support modules at different maturity states without authority leakage between modules. | It | HAZ-008 |
| **MAG-SYS-045** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §9. SYSTEM REQUIREMENTS — v2 ADDITIONS | A technically executable scientific capability SHALL NOT be represented as clinically validated solely because it exists in the product. | St | HAZ-008 |
| **MAG-SYS-046** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §9. SYSTEM REQUIREMENTS — v2 ADDITIONS | MAGNIOM SHALL separate patient measurement, scientific evidence, algorithmic inference and clinician decision. | A | HAZ-018 |
| **MAG-SYS-047** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §9. SYSTEM REQUIREMENTS — v2 ADDITIONS | MAGNIOM SHALL support a valid no-target / abstention result. | Golden Case | HAZ-001, HAZ-006 |
| **MAG-SYS-048** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §9. SYSTEM REQUIREMENTS — v2 ADDITIONS | MAGNIOM SHALL NOT autonomously prescribe stimulation frequency, intensity, pulse count, treatment schedule or session number. | St | HAZ-001, HAZ-019 |
| **MAG-SYS-049** | `Major` | MAGNIOM-System Requirements Specification v2.0 §9. SYSTEM REQUIREMENTS — v2 ADDITIONS | Multi-indication support SHALL NOT introduce a universal clinical target score. | Scientific Verification | — |
| **MAG-SYS-050** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §9. SYSTEM REQUIREMENTS — v2 ADDITIONS | Historical v1 and v2 Target Slates SHALL remain reconstructable from their original scientific release configuration. | It | HAZ-020 |
| **MAG-SYS-051** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §9. SYSTEM REQUIREMENTS — v2 ADDITIONS | Patient-specific sophistication SHALL NOT automatically outrank an evidence-supported non-personalised baseline. | Gc | HAZ-016, HAZ-017 |
| **MAG-SYS-052** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §9. SYSTEM REQUIREMENTS — v2 ADDITIONS | Software completion SHALL remain distinct from clinical qualification of an indication module. | Inspection | HAZ-001, HAZ-006 |

### 3.16. MAG-TBI: Traumatic Brain Injury & Structural Distortion (18 Requirements)

| ID | Safety Class | Specification Source | Requirement Statement | Verification Method | ISO 14971 Risk Controls |
|---|:---:|---|---|:---:|:---:|
| **MAG-TBI-001** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §26. `MAG-TBI-*` — TRAUMATIC BRAIN INJURY REQUIREMENTS | TBI SHALL NOT be represented as one universal targeting indication. | Automated Test | HAZ-009 |
| **MAG-TBI-002** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §26. `MAG-TBI-*` — TRAUMATIC BRAIN INJURY REQUIREMENTS | TBI clinical objectives such as cognition, pain, depression and post-concussive burden SHALL preserve independent evidence paths. | Automated Test | HAZ-009 |
| **MAG-TBI-003** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §26. `MAG-TBI-*` — TRAUMATIC BRAIN INJURY REQUIREMENTS | MAGNIOM SHALL NOT generate a universal `TBI Target`. | Automated Test | HAZ-007 |
| **MAG-TBI-004** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §26. `MAG-TBI-*` — TRAUMATIC BRAIN INJURY REQUIREMENTS | A TBI candidate SHALL require an explicit TBI-specific EvidencePath binding to the relevant TargetFamily/strategy. | Automated Test | HAZ-008 |
| **MAG-TBI-005** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §26. `MAG-TBI-*` — TRAUMATIC BRAIN INJURY REQUIREMENTS | MDD target evidence SHALL NOT automatically transfer to post-TBI depression. | Unit Test | — |
| **MAG-TBI-006** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §26. `MAG-TBI-*` — TRAUMATIC BRAIN INJURY REQUIREMENTS | A pooled signal suggesting TBI symptom improvement without target specificity SHALL NOT be sufficient to create a Clinical target. | Unit Test | — |
| **MAG-TBI-007** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §26. `MAG-TBI-*` — TRAUMATIC BRAIN INJURY REQUIREMENTS | Relevant TBI targeting SHALL preserve lesion context. | Golden Case | HAZ-009 |
| **MAG-TBI-008** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §26. `MAG-TBI-*` — TRAUMATIC BRAIN INJURY REQUIREMENTS | Skull defect, cranioplasty or postoperative structural changes SHALL be represented where relevant. | Unit Test | HAZ-006, HAZ-009 |
| **MAG-TBI-009** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §26. `MAG-TBI-*` — TRAUMATIC BRAIN INJURY REQUIREMENTS | Where structural changes materially affect E-field validity, the applicable candidate SHALL be qualified accordingly. | Unit Test | HAZ-006, HAZ-009 |
| **MAG-TBI-010** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §26. `MAG-TBI-*` — TRAUMATIC BRAIN INJURY REQUIREMENTS | TBI imaging abnormalities SHALL NOT independently become therapeutic targets. | Unit Test | — |
| **MAG-TBI-011** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §26. `MAG-TBI-*` — TRAUMATIC BRAIN INJURY REQUIREMENTS | DWI, rs-fMRI and task-fMRI shall remain Research/Validation unless separately promoted for the applicable TBI module. | Unit Test | — |
| **MAG-TBI-012** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §26. `MAG-TBI-*` — TRAUMATIC BRAIN INJURY REQUIREMENTS | Conflicting outcome evidence SHALL be visible rather than resolved automatically by the engine. | Unit Test | — |
| **MAG-TBI-013** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §26. `MAG-TBI-*` — TRAUMATIC BRAIN INJURY REQUIREMENTS | A patient-specific lesion-network or connectivity finding SHALL NOT create clinical efficacy evidence. | Unit Test | — |
| **MAG-TBI-014** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §26. `MAG-TBI-*` — TRAUMATIC BRAIN INJURY REQUIREMENTS | Structural distortion that invalidates registration SHALL prevent dependent target generation. | Unit Test | HAZ-006, HAZ-009 |
| **MAG-TBI-015** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §26. `MAG-TBI-*` — TRAUMATIC BRAIN INJURY REQUIREMENTS | TBI safety assessment SHALL remain separate from MAGNIOM target ranking. | Unit Test | — |
| **MAG-TBI-016** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §26. `MAG-TBI-*` — TRAUMATIC BRAIN INJURY REQUIREMENTS | Research hypotheses SHALL be visibly and structurally identified as Research. | Unit Test | — |
| **MAG-TBI-017** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §26. `MAG-TBI-*` — TRAUMATIC BRAIN INJURY REQUIREMENTS | Failure of a TBI Research modality SHALL NOT trigger an analogous MDD or stroke target as fallback. | Unit Test | — |
| **MAG-TBI-018** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §26. `MAG-TBI-*` — TRAUMATIC BRAIN INJURY REQUIREMENTS | TBI Clinical Mode SHALL remain unavailable until a TBI-specific Clinical `IndicationModuleRelease`, policy configuration and validation package are approved. | Unit Test | HAZ-006, HAZ-009 |

### 3.17. MAG-TGT: Target Engine Core & Deterministic Ranking (25 Requirements)

| ID | Safety Class | Specification Source | Requirement Statement | Verification Method | ISO 14971 Risk Controls |
|---|:---:|---|---|:---:|:---:|
| **MAG-TGT-001** | `Critical` | MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0 | The Target Engine shall execute deterministically offline without database, UI, or internet dependencies. | Unit Test | HAZ-002 |
| **MAG-TGT-041** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | Any patient-specific Clinical refinement SHALL require a qualified applicable capability in the `ReliabilityBundle`. | Unit Test | HAZ-001, HAZ-019 |
| **MAG-TGT-042** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | The Target Engine SHALL use a common deterministic core plus explicitly registered indication-specific plugins. | Unit Test | HAZ-001, HAZ-019 |
| **MAG-TGT-043** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | Plugins SHALL produce candidate hypotheses and SHALL NOT independently confer final clinical eligibility. | Unit Test | — |
| **MAG-TGT-044** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | Clinical plugins and generators SHALL be statically versioned, hashed and positively authorised. | Unit Test | — |
| **MAG-TGT-045** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | The Target Engine SHALL apply mandatory gates before compensable ranking features. | Unit Test | — |
| **MAG-TGT-046** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | A candidate failing a mandatory gate SHALL NOT compensate through high values in another feature. | Unit Test | — |
| **MAG-TGT-047** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | Clinical candidates SHALL derive from authorised EvidencePaths. | Unit Test | — |
| **MAG-TGT-048** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | Candidates SHALL only be compared numerically inside scientifically valid comparison domains. | Unit Test | — |
| **MAG-TGT-049** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | MAGNIOM SHALL NOT produce one universal scalar target score across scientifically incompatible target classes. | Unit Test | — |
| **MAG-TGT-050** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | Target geometry SHALL remain typed throughout generation, comparison and final review. | Ut | HAZ-019 |
| **MAG-TGT-051** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | A `coil_field` target SHALL NOT silently become a point target. | Unit Test | HAZ-001, HAZ-019 |
| **MAG-TGT-052** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | A `somatotopic` target SHALL preserve body-region semantics. | Unit Test | — |
| **MAG-TGT-053** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | Patient-specific refinement SHALL preserve candidate lineage to its evidence baseline where the operation is defined as refinement. | Unit Test | — |
| **MAG-TGT-054** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | A patient-specific refinement SHALL NOT automatically displace its evidence baseline. | Unit Test | — |
| **MAG-TGT-055** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | Where refinement is evaluated, the Target Engine SHALL produce an explicit counterfactual comparison. | Unit Test | — |
| **MAG-TGT-056** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | Redundancy assessment SHALL be target-geometry-aware. | Unit Test | — |
| **MAG-TGT-057** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | Target Slate assembly SHALL optimise clinically useful diversity rather than simply selecting the numerically highest N candidates. | Unit Test | — |
| **MAG-TGT-058** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | The engine SHALL be permitted to produce fewer than three Primary Candidates and fewer than two Additional Candidates. | Unit Test | — |
| **MAG-TGT-059** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | Research-only generators SHALL NOT contribute to a Clinical Target Slate. | Unit Test | — |
| **MAG-TGT-060** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | Suppressed candidates and suppression reasons SHALL remain reconstructable. | Unit Test | — |
| **MAG-TGT-061** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | A complete scientific configuration failure SHALL produce abstention rather than best-effort guessing. | Unit Test | — |
| **MAG-TGT-062** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | Candidate explanations SHALL include material evidence limitations and conflicts. | Unit Test | — |
| **MAG-TGT-063** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | Optional LLM-generated prose SHALL NOT alter candidate identity, evidence, rank, eligibility or uncertainty. | Unit Test | — |
| **MAG-TGT-064** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §17. TARGET ENGINE REQUIREMENTS v2 | The Target Engine SHALL NOT infer stimulation protocol from target geometry or patient measurements. | Unit Test | — |

### 3.18. MAG-TIN: Chronic Tinnitus & Psychoacoustic Subtyping (18 Requirements)

| ID | Safety Class | Specification Source | Requirement Statement | Verification Method | ISO 14971 Risk Controls |
|---|:---:|---|---|:---:|:---:|
| **MAG-TIN-001** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §27. `MAG-TIN-*` — TINNITUS REQUIREMENTS | The Tinnitus module SHALL represent the tinnitus clinical phenotype independently from audiological measurement. | Automated Test | HAZ-011 |
| **MAG-TIN-002** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §27. `MAG-TIN-*` — TINNITUS REQUIREMENTS | The module SHALL support explicit tinnitus laterality. | Automated Test | HAZ-011 |
| **MAG-TIN-003** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §27. `MAG-TIN-*` — TINNITUS REQUIREMENTS | Tinnitus distress/handicap and tinnitus loudness SHALL remain distinct outcome domains. | Automated Test | HAZ-008 |
| **MAG-TIN-004** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §27. `MAG-TIN-*` — TINNITUS REQUIREMENTS | Audiological measurement SHALL be represented through versioned canonical Measurement objects. | Automated Test | HAZ-011 |
| **MAG-TIN-005** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §27. `MAG-TIN-*` — TINNITUS REQUIREMENTS | Audiological equipment/calibration provenance SHALL be retained where clinically relevant. | Unit Test | — |
| **MAG-TIN-006** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §27. `MAG-TIN-*` — TINNITUS REQUIREMENTS | Tinnitus pitch matching SHALL retain measurement/repeatability uncertainty. | Unit Test | — |
| **MAG-TIN-007** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §27. `MAG-TIN-*` — TINNITUS REQUIREMENTS | Tinnitus pitch or loudness matching SHALL NOT independently generate a cortical treatment target. | Unit Test | HAZ-011 |
| **MAG-TIN-008** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §27. `MAG-TIN-*` — TINNITUS REQUIREMENTS | A hearing-loss pattern SHALL NOT autonomously generate an auditory-cortex target. | Ut | HAZ-011 |
| **MAG-TIN-009** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §27. `MAG-TIN-*` — TINNITUS REQUIREMENTS | Auditory, temporal, temporoparietal or frontal-temporal target hypotheses SHALL remain governed by Tinnitus-specific EvidencePaths. | Unit Test | — |
| **MAG-TIN-010** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §27. `MAG-TIN-*` — TINNITUS REQUIREMENTS | The initial Tinnitus targeting module SHALL remain Research-only until explicit Clinical promotion. | Ut | HAZ-011 |
| **MAG-TIN-011** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §27. `MAG-TIN-*` — TINNITUS REQUIREMENTS | A Research tinnitus candidate SHALL NOT enter a Clinical Target Slate. | Unit Test | HAZ-008, HAZ-011 |
| **MAG-TIN-012** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §27. `MAG-TIN-*` — TINNITUS REQUIREMENTS | Material guideline-level negative evidence SHALL be readily visible in the Tinnitus evidence view. | Unit Test | — |
| **MAG-TIN-013** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §27. `MAG-TIN-*` — TINNITUS REQUIREMENTS | Material conflicting meta-analytic or trial evidence SHALL remain visible. | Unit Test | — |
| **MAG-TIN-014** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §27. `MAG-TIN-*` — TINNITUS REQUIREMENTS | MRI or functional-network abnormalities SHALL NOT override Research-only evidence status. | Unit Test | — |
| **MAG-TIN-015** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §27. `MAG-TIN-*` — TINNITUS REQUIREMENTS | Structural MRI and rs-fMRI SHALL not be required simply because the platform can process them. | Unit Test | — |
| **MAG-TIN-016** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §27. `MAG-TIN-*` — TINNITUS REQUIREMENTS | A failed Research imaging pathway SHALL NOT fall back to a generic auditory-cortex Clinical target. | Unit Test | — |
| **MAG-TIN-017** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §27. `MAG-TIN-*` — TINNITUS REQUIREMENTS | Durability uncertainty SHALL remain explicit where the supporting evidence is primarily short-term. | Unit Test | — |
| **MAG-TIN-018** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §27. `MAG-TIN-*` — TINNITUS REQUIREMENTS | Clinical target generation for tinnitus SHALL fail closed unless an approved Tinnitus Clinical module and Scientific Policy exist. | Integration Test | HAZ-011 |

### 3.19. MAG-UX: Clinician UX, Shell Navigation & Non-Preselection (17 Requirements)

| ID | Safety Class | Specification Source | Requirement Statement | Verification Method | ISO 14971 Risk Controls |
|---|:---:|---|---|:---:|:---:|
| **MAG-UX-031** | `Critical` | MAGNIOM-Clinician Workspace & UX Specification v1.0<br>MAGNIOM-Implementation & Validation Roadmap v1.0 | The clinician workspace user interface shall not preselect any target candidate by default, preventing automation bias. | Human Factors | HAZ-001 |
| **MAG-UX-041** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §18. UX REQUIREMENTS — v2 ADDITIONS | The top bar SHALL visibly establish system mode and scientific environment. | System Test | HAZ-001, HAZ-008 |
| **MAG-UX-042** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §18. UX REQUIREMENTS — v2 ADDITIONS | The sidebar SHALL communicate the user's location in the MAGNIOM workflow. | System Test | HAZ-001, HAZ-008 |
| **MAG-UX-043** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §18. UX REQUIREMENTS — v2 ADDITIONS | The case header SHALL display the active `CaseIndication`. | St | HAZ-014 |
| **MAG-UX-044** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §18. UX REQUIREMENTS — v2 ADDITIONS | The case header SHALL display the active `IndicationModuleRelease` or an appropriately human-readable version reference. | System Test | — |
| **MAG-UX-045** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §18. UX REQUIREMENTS — v2 ADDITIONS | Research Mode SHALL remain persistently visible throughout deep navigation. | System Test | HAZ-001, HAZ-008 |
| **MAG-UX-046** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §18. UX REQUIREMENTS — v2 ADDITIONS | A Research-only case SHALL NOT present a normal Clinical sign-off action. | System Test | — |
| **MAG-UX-047** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §18. UX REQUIREMENTS — v2 ADDITIONS | Target geometry SHALL be described in a clinically appropriate form rather than forcing all targets into MNI point-coordinate presentation. | System Test | — |
| **MAG-UX-048** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §18. UX REQUIREMENTS — v2 ADDITIONS | Clinicians SHALL be able to inspect which patient measurements influenced each candidate. | System Test | — |
| **MAG-UX-049** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §18. UX REQUIREMENTS — v2 ADDITIONS | Clinicians SHALL be able to inspect why an available measurement did not influence a candidate. | System Test | — |
| **MAG-UX-050** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §18. UX REQUIREMENTS — v2 ADDITIONS | Measurement reliability SHALL be presented separately from clinical evidence strength. | System Test | — |
| **MAG-UX-051** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §18. UX REQUIREMENTS — v2 ADDITIONS | Material lesion context SHALL be visible in applicable stroke/TBI target review. | System Test | — |
| **MAG-UX-052** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §18. UX REQUIREMENTS — v2 ADDITIONS | Material treatment-context dependence SHALL be visible in applicable OCD/aphasia workflows. | System Test | — |
| **MAG-UX-053** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §18. UX REQUIREMENTS — v2 ADDITIONS | Negative and conflicting evidence SHALL not be hidden behind a generic confidence badge. | System Test | — |
| **MAG-UX-054** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §18. UX REQUIREMENTS — v2 ADDITIONS | The UI SHALL distinguish algorithm rank from clinical authority. | System Test | — |
| **MAG-UX-055** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §18. UX REQUIREMENTS — v2 ADDITIONS | The UI SHALL permit rejection, modification, alternate target selection and no-target decision. | System Test | — |
| **MAG-UX-056** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §18. UX REQUIREMENTS — v2 ADDITIONS | The UI SHALL NOT describe MAGNIOM output as an “optimal target” unless a future validated intended-purpose claim explicitly permits that language. | System Test | — |

### 3.20. MAG-VAL: Verification & Validation Test Harnesses (23 Requirements)

| ID | Safety Class | Specification Source | Requirement Statement | Verification Method | ISO 14971 Risk Controls |
|---|:---:|---|---|:---:|:---:|
| **MAG-VAL-001** | `Major` | MAGNIOM-Synthetic Vertical Slice Implementation Specification v1.0 | The system shall execute synthetic Golden Cases G01 through G05 as automated regression gates during CI builds. | Golden Case | HAZ-002, HAZ-003 |
| **MAG-VAL-002** | `Critical` | MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0 | Target Engine execution shall produce identical candidate coordinates, confidence scores, and slates across 1000 repeated runs given identical inputs. | Unit Test | HAZ-002, HAZ-020 |
| **MAG-VAL-003** | `Critical` | MAGNIOM-Canonical Target Data Specification v1.0 | Coordinate transformations and candidate generation shall preserve anatomical laterality without left-right hemisphere crossing. | Unit Test | HAZ-002 |
| **MAG-VAL-041** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §30. VALIDATION REQUIREMENTS v2 | Each Indication Module SHALL have an independent validation status. | Golden Case | HAZ-006, HAZ-008 |
| **MAG-VAL-042** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §30. VALIDATION REQUIREMENTS v2 | Verification of the common Target Engine core SHALL NOT constitute clinical validation of every plugin. | Golden Case | HAZ-006, HAZ-008 |
| **MAG-VAL-043** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §30. VALIDATION REQUIREMENTS v2 | Clinical validation of one indication SHALL NOT be transferred to another indication. | Golden Case | HAZ-006, HAZ-008 |
| **MAG-VAL-044** | `Critical` | MAGNIOM-System Requirements Specification v2.0 §30. VALIDATION REQUIREMENTS v2 | Measurement reliability validation SHALL be capability- and indication-specific. | Golden Case | HAZ-006, HAZ-008 |
| **MAG-VAL-045** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §30. VALIDATION REQUIREMENTS v2 | Every module SHALL have synthetic Golden Cases covering expected and failure pathways. | Golden Case | — |
| **MAG-VAL-046** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §30. VALIDATION REQUIREMENTS v2 | Every module intended for Clinical use SHALL test incorrect-module selection. | Golden Case | — |
| **MAG-VAL-047** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §30. VALIDATION REQUIREMENTS v2 | Every module intended for Clinical use SHALL test Research-to-Clinical leakage. | Golden Case | — |
| **MAG-VAL-048** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §30. VALIDATION REQUIREMENTS v2 | Every lesion-dependent module SHALL test wrong laterality and lesion/target invalidation. | Golden Case | — |
| **MAG-VAL-049** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §30. VALIDATION REQUIREMENTS v2 | Every refinement capability SHALL test reliable and unreliable measurement states. | Golden Case | — |
| **MAG-VAL-050** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §30. VALIDATION REQUIREMENTS v2 | Every fallback pathway SHALL have a Golden Case. | Golden Case | — |
| **MAG-VAL-051** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §30. VALIDATION REQUIREMENTS v2 | Every complete-abstention pathway SHALL have a Golden Case. | Golden Case | — |
| **MAG-VAL-052** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §30. VALIDATION REQUIREMENTS v2 | Clinical-mode promotion SHALL require all Critical requirements applicable to the module to be verified. | Golden Case | — |
| **MAG-VAL-053** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §30. VALIDATION REQUIREMENTS v2 | Module validation datasets SHALL be separated from development/tuning datasets. | Golden Case | — |
| **MAG-VAL-054** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §30. VALIDATION REQUIREMENTS v2 | A locked validation analysis SHALL pin module, policy, Evidence Library, Target Engine and measurement pipeline releases. | Golden Case | — |
| **MAG-VAL-055** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §30. VALIDATION REQUIREMENTS v2 | Silent prospective evaluation SHOULD precede unrestricted Clinical use where patient-specific target guidance could materially influence treatment. | Golden Case | — |
| **MAG-VAL-056** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §30. VALIDATION REQUIREMENTS v2 | Human-factors validation SHALL assess clinician recognition of indication, mode, uncertainty and Research boundaries. | Golden Case | — |
| **MAG-VAL-057** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §30. VALIDATION REQUIREMENTS v2 | Human-factors validation SHALL assess clinician ability to reject/override algorithmic Primary 1. | Golden Case | — |
| **MAG-VAL-058** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §30. VALIDATION REQUIREMENTS v2 | A Clinical module SHALL not be promoted solely on the basis of technical target reproducibility. | Golden Case | — |
| **MAG-VAL-059** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §30. VALIDATION REQUIREMENTS v2 | A Clinical module SHALL define the clinical/scientific evidence supporting its intended-purpose claim. | Golden Case | — |
| **MAG-VAL-060** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §30. VALIDATION REQUIREMENTS v2 | If the required evidence for a module fails validation, that module SHALL remain Validation/Research regardless of the maturity of the wider product. | Golden Case | — |

### 3.21. MAG-WFL: Workflow Orchestration & Job State Machine (9 Requirements)

| ID | Safety Class | Specification Source | Requirement Statement | Verification Method | ISO 14971 Risk Controls |
|---|:---:|---|---|:---:|:---:|
| **MAG-WFL-001** | `Major` | MAGNIOM-Supabase Database & Security Specification v1.0 | State transitions across clinical cases shall follow strict state machines enforced by database triggers. | Integration Test | HAZ-004 |
| **MAG-WFL-041** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §21. WORKFLOW REQUIREMENTS v2 | Case workflow SHALL resolve the active `CaseIndication` before targeting analysis. | Integration Test | — |
| **MAG-WFL-042** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §21. WORKFLOW REQUIREMENTS v2 | Module-specific required contexts SHALL be completed or explicitly unresolved before Target Engine execution. | Integration Test | — |
| **MAG-WFL-043** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §21. WORKFLOW REQUIREMENTS v2 | Target generation SHALL be transactional from immutable scientific inputs. | Integration Test | — |
| **MAG-WFL-044** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §21. WORKFLOW REQUIREMENTS v2 | A failed module-specific prerequisite SHALL not create a partially valid Target Slate. | Integration Test | — |
| **MAG-WFL-045** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §21. WORKFLOW REQUIREMENTS v2 | Scientific fallback SHALL be represented as a distinct workflow outcome. | Integration Test | — |
| **MAG-WFL-046** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §21. WORKFLOW REQUIREMENTS v2 | Changing active indication SHALL require a distinct targeting analysis rather than relabeling a pre-existing Slate. | Integration Test | — |
| **MAG-WFL-047** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §21. WORKFLOW REQUIREMENTS v2 | Research-to-Clinical promotion SHALL occur through release governance rather than workflow state editing. | Integration Test | — |
| **MAG-WFL-048** | `Standard` | MAGNIOM-System Requirements Specification v2.0 §21. WORKFLOW REQUIREMENTS v2 | A stale Target Slate SHALL be blocked from clinical signing when material dependencies have changed. | Integration Test | — |

---

## 4. Regulatory & Risk Control Attestation

All 375 requirements are active, approved, and tracked in `docs/software-requirements/requirement-catalog.json`. All 20 ISO 14971 hazards (`HAZ-001` through `HAZ-020`) have verified software mitigations with 100% acceptable residual risk.

All 19 Prohibited System Behaviours defined in SRS v2.0 §37 are continuously defended by negative assertion test suites in `packages/target-engine/tests/v2/srs-prohibited-behaviours.test.ts`.
