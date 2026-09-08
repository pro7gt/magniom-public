# MAGNIOM System Requirements Specification Baseline v2.0

**Document Reference:** MAG-SRS-2.0  
**Standard Reference:** IEC 62304:2006+AMD1:2015 §5.2 / ISO 13485:2016 §7.3.3 / TGA SaMD Guidelines  
**Status:** Controlled Requirements Baseline (Phase 0 Frozen)  
**Sealing Date:** 2026-09-03  
**Supersedes:** MAG-SRS-1.0 for new multi-indication development (historical v1 baseline preserved)  

---

## 1. Scope & Purpose

This document establishes the normative requirements baseline governing MAGNIOM v2 multi-indication development from **M0 (Design)** to **M8 (Clinical Mode)** across all independently promotable `IndicationModuleRelease` lifecycles (Q0–Q5).

All 375 system requirements (340 v2 canonical requirements + 35 retained v1 safety requirements) are formally tracked in [docs/verification/requirement-inventory-v2.json](file:///home/owner/Downloads/Magniom/docs/verification/requirement-inventory-v2.json) and [docs/software-requirements/requirement-catalog.json](file:///home/owner/Downloads/Magniom/docs/software-requirements/requirement-catalog.json), and traced to design specifications, implementation packages, verification test suites, risk controls, and validation evidence in [docs/software-requirements/SRS-v2-Traceability-Matrix.md](file:///home/owner/Downloads/Magniom/docs/software-requirements/SRS-v2-Traceability-Matrix.md) and [docs/verification/traceability-matrix-v2.md](file:///home/owner/Downloads/Magniom/docs/verification/traceability-matrix-v2.md).

---

## 2. Requirement ID Standard & Namespaces

Requirements adhere to the immutable naming schema: `MAG-<DOMAIN>-<NUMBER>`.

### Retained Core Platform Domains (14)
- `MAG-SYS`: System-wide invariants & multi-indication architecture contract
- `MAG-CLI`: Clinical workflow, authority & decision signing
- `MAG-PHE`: Phenotype & clinical objective formulation
- `MAG-EVD`: Evidence knowledge system & EvidencePaths
- `MAG-POL`: Scientific Policy & algorithm configuration releases
- `MAG-IMG`: Neuroimaging QC & spatial transformations
- `MAG-TGT`: Target Engine deterministic core & ranking algorithms
- `MAG-UX`: Clinician workspace, navigation rail & human factors
- `MAG-DAT`: Canonical multi-indication data integrity
- `MAG-SEC`: Security, multi-tenant RLS isolation & secret hygiene
- `MAG-WFL`: Workflow orchestration & job state transitions
- `MAG-AUD`: Audit trails & immutable provenance
- `MAG-REL`: Release governance & compatibility manifests
- `MAG-VAL`: Verification & validation test harnesses

### Expanded Multi-Indication & Measurement Domains (7)
- `MAG-IND`: Indication-module architecture, lifecycle & cross-module isolation
- `MAG-MEA`: Multimodal patient measurement bundles & reliability qualification
- `MAG-STR`: Stroke motor rehabilitation & post-stroke aphasia modules
- `MAG-PAI`: Chronic neuropathic pain module & somatotopic M1 targeting
- `MAG-TBI`: Traumatic brain injury module & structural distortion handling
- `MAG-TIN`: Chronic tinnitus module & audiological subtyping
- `MAG-OCD`: Obsessive-compulsive disorder module & deep-TMS coil field geometry
