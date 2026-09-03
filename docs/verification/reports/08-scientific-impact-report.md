# Formal Scientific Impact & Materiality Report

**Document ID:** VR-SCI-IMPACT-001  
**Specification Reference:** MAGNIOM-Enterprise Verification Spec v1.0 (Sections 100–104)  
**Evaluation Timestamp:** 2026-09-03T11:01:32.061Z  
**Assessed Materiality Tier:** `S1_NONE`  
**Overall Status:** ✅ PASSED_S1  

---

## 1. Executive Summary

This report documents the automated scientific impact evaluation across the 5 canonical Magniom Golden Cases (G01–G05/G07). Spatial coordinate shifts and ranking scores were evaluated against the frozen baseline.

- **Maximum Spatial Coordinate Shift (Δmm):** 0.0000 mm (Tolerance: < 1.0 mm)
- **Maximum Score Shift (Δscore):** 0.0000
- **Candidate Rank Order Invariance:** PRESERVED (100%)

---

## 2. Golden Case Regression Matrix

| Case ID | Name | Primary Candidates | Top Candidate ID | Max Shift (mm) | Max ΔScore | Manifest Hash |
|---|---|---|---|---|---|---|
| `G01` | G01: Evidence-Only Baseline MDD | 1 | `cand-g01-evidence-ldlpfc` | 0.00 | 0.00 | `a07a6bc565a78866...` |
| `G02` | G02: High-Convergence Personalized MDD | 1 | `can-conv-g02` | 0.00 | 0.00 | `db864ef2339a700d...` |
| `G04` | G04: Unreliable FC QC Fallback MDD | 1 | `cand-g04-evidence-ldlpfc` | 0.00 | 0.00 | `0f9f7a2758144de2...` |
| `G05` | G05: Anxiosomatic Multi-Circuit MDD | 2 | `cand-g05-evidence-ldlpfc` | 0.00 | 0.00 | `7e04c9423bc42ff6...` |
| `G07` | G07: Mixed Phenotype Target Slate | 2 | `can-conv-g07` | 0.00 | 0.00 | `10e1b012e6bb51a5...` |

---

## 3. Scientific Materiality Conclusion

- **Materiality Classification:** `S1_NONE` (No unexpected algorithm or coordinate drift detected).
- **Validation Impact:** Baseline is stable and reproducible.
