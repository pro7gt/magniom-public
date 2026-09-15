# Scientific Differential Report v2.0 (§119)
**Report Reference:** SDR-1789461688203  
**Standard Reference:** IEC 62304:2006+AMD1:2015 §5.5–§5.7 / ISO 14971:2019  
**Specification Reference:** `MAGNIOM-Enterprise Verification, Testing CICD Specification v2.0.md` (§50–65, §112–122)  
**Evaluation Date:** 2026-09-15T08:41:28.203Z  
**Gate Status:** PASSED_C0_C1  
**Evaluated Scope:** All 8 Indication Modules (72 Golden Cases)  

---

## 1. Executive Summary

In accordance with Enterprise Verification Spec v2.0 §119–121, this report documents the **spatial and score differentials** across all 72 canonical golden cases following automated execution.

- **Total Golden Cases:** 72
- **Passing Cases:** 72 / 72 (100%)
- **Overall Maximum Coordinate Shift (Δmm):** 0.0000 mm
- **Overall Maximum Score Shift (Δscore):** 0.0000
- **Candidate Rank Order Preservation:** 100% PRESERVED
- **Scientific Impact Level:** **C1**

---

## 2. Multi-Indication Differential Summary

| Indication Module | Golden Cases | Result | Max Δmm | Max Δscore | Rank Preserved | Gate Status |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **MDD** | 10 / 10 | ✅ PASS | 0.00 mm | 0.000 | YES | **PASS** |
| **OCD** | 8 / 8 | ✅ PASS | 0.00 mm | 0.000 | YES | **PASS** |
| **NEUROPATHIC_PAIN** | 8 / 8 | ✅ PASS | 0.00 mm | 0.000 | YES | **PASS** |
| **STROKE_MOTOR** | 10 / 10 | ✅ PASS | 0.00 mm | 0.000 | YES | **PASS** |
| **STROKE_APHASIA** | 10 / 10 | ✅ PASS | 0.00 mm | 0.000 | YES | **PASS** |
| **TBI** | 9 / 9 | ✅ PASS | 0.00 mm | 0.000 | YES | **PASS** |
| **PTSD** | 7 / 7 | ✅ PASS | 0.00 mm | 0.000 | YES | **PASS** |
| **TINNITUS** | 10 / 10 | ✅ PASS | 0.00 mm | 0.000 | YES | **PASS** |

---

## 3. Spatial & Clinical Differential Interpretation (§120–121)

- **Spatial Tolerance (<0.01 mm):** All candidate coordinates remain within sub-millimeter reproducibility bounds.
- **Scientific Reproducibility (§107):** Deterministic manifest hashes match canonical reference states.
- **Mode Isolation (§64):** Research-only outputs (PTSD, TBI, Tinnitus, Stroke Aphasia) strictly prevented clinical signing.
- **Negative Evidence Prominence (§80):** Conflicting evidence and contraindications appropriately triggered zero-candidate abstentions or priors.

---

## 4. Governance & Sign-Off Requirements (§14, §118)

- **Dual Scientific Review:** NOT REQUIRED (C0/C1)
- **Clinical Safety Board Approval:** NOT REQUIRED
