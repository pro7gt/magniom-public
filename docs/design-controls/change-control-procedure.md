# Change Control Procedure Template

**Standard Reference:** ISO 13485:2016 Clause 7.3.9 / IEC 62304 Section 8  
**Document Status:** Controlled Design-Control Standard

---

## 1. Principle

No modification to scientific policies, ranking algorithms, clinical database schemas, or safety-critical UX interactions shall be deployed without formal change impact assessment and verification.

## 2. Change Classification

- **Level 1 (Critical):** Algorithm logic, Evidence Tier mapping, coordinate calculation, RLS policies. Requires formal risk assessment, regression testing against Golden Cases G01–G10, and clinical sign-off.
- **Level 2 (Major):** Database schema extensions, worker pipeline orchestration, non-critical UX improvements.
- **Level 3 (Minor):** Documentation updates, dependency patches, internal code refactoring.
