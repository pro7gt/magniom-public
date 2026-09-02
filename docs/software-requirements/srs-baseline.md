# Magniom System Requirements Specification Baseline v1.0

**Document Reference:** MAG-SRS-1.0  
**Standard Reference:** IEC 62304 Section 5.2 / ISO 13485 / TGA SaMD Guidelines  
**Status:** Controlled Requirements Baseline

---

## 1. Scope & Purpose

This document defines the normative software and system requirements governing Magniom from **M0 (Design)** to **M8 (Clinical Mode)**.

All requirements are formally tracked in `docs/software-requirements/requirement-catalog.json` and traced to design components, verification tests, and risk controls in `docs/verification/traceability-matrix.md`.

---

## 2. Requirement ID Standard

Requirements adhere to the immutable naming schema: `MAG-<DOMAIN>-<NUMBER>`, where canonical domains include:

- `MAG-SYS`: System-wide invariants
- `MAG-CLI`: Clinical authority & workflow
- `MAG-PHE`: Phenotype formulation
- `MAG-EVD`: Evidence knowledge system
- `MAG-POL`: Scientific policy
- `MAG-IMG`: Neuroimaging & connectomics QC
- `MAG-TGT`: Target Engine
- `MAG-UX`: Clinician workspace & human factors
- `MAG-DAT`: Canonical data integrity
- `MAG-SEC`: Security & multi-tenant isolation
- `MAG-WFL`: Workflow orchestration
- `MAG-AUD`: Audit & provenance
- `MAG-REL`: Release versioning
- `MAG-VAL`: Verification & validation
