# Software Verification Plan (SVP) Template

**Standard Reference:** IEC 62304:2006 + AMD1:2015 Clause 5.7  
**Document Status:** Controlled Design-Control Template  

---

## 1. Verification Strategy
Verification proves that design outputs conform to design inputs (SRS requirements).

## 2. Verification Methods & Harnesses
- **Unit Testing (UT):** Vitest testing of all pure mathematical and ranking functions.
- **Integration Testing (IT):** End-to-end synthetic workflow execution from PhenotypeSnapshot to TargetSlate.
- **Golden Case Testing (GC):** Regression tests against canonical Golden Cases (G01–G05).
- **Security Testing (SEC):** Row Level Security cross-tenant data leakage tests with pgTAP.
- **Boundary Verification (BV):** Architectural linters verifying module import restrictions.

## 3. Pass/Fail Criteria & Anomaly Reporting
- 100% test pass required for CI build promotion.
- Zero unresolved critical or major anomalies permitted in release candidates.
