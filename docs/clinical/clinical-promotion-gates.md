# Clinical Promotion Gates & Scientific Maturity Lifecycle

**Document ID:** `MAG-SOP-CLIN-001`  
**Version:** `2.0.0`  
**Classification:** Clinical Decision Support Safety Standard  
**Regulation Conformance:** IEC 62304 / ISO 14971 / FDA SaMD Clinical Evaluation  

---

## 1. Scientific Maturity Progression

Every algorithm, candidate generator, and measurement within MAGNIOM possesses an immutable `ScientificMaturity` state:

```
[ Prototype ] ───► [ Research ] ───► [ Validation ] ───► [ Clinical Candidate ] ───► [ Clinical Approved ]
                                                                 │
                                                                 ▼
                                                             [ Retired ]
```

### 1.1 Maturity Levels

1. **`prototype`**:
   - Initial algorithmic formulation, mock implementations, or toy demonstrations.
   - Strictly forbidden from clinical execution.
2. **`research`**:
   - Exploratory scientific methods (e.g., Seguin 2026 normative pathway modeling).
   - Operates solely under `research` mode.
3. **`validation`**:
   - Algorithmic implementation with complete test coverage, numerical boundary verification, and published literature basis (e.g., Li 2026 SC tractography).
   - Undergoing active clinical trial evaluation; barred from clinical decision support.
4. **`clinical_candidate`**:
   - Fully validated pipeline with verified split-half reliability ($r \ge 0.60$), artifact binary validation, and clinical advisory board review.
   - Permitted in clinical execution for candidate generation.
5. **`clinical_approved`**:
   - Cleared by regulatory review (CE mark / 510(k)) or established clinical consensus (e.g., 5.5 cm rule, Beam F3, Cash 2021 personalized rs-fMRI).

---

## 2. Gate G14: Fail-Closed Enforcement Rules

Gate G14 (`packages/target-engine/src/gates/v2/g14-research-leakage.ts`) strictly enforces the following invariant rules in `clinical` mode:

1. **Rule 1 (Data Origin Fail-Closed)**:
   Any candidate or relied-on measurement with `dataOrigin = 'synthetic'`, `'unknown'`, or `'normative'` is **immediately rejected**.
2. **Rule 2 (Maturity Containment)**:
   Any candidate with `scientificMaturity = 'prototype'`, `'research'`, or `'validation'` is **immediately rejected** in clinical mode.
3. **Rule 3 (Promotion Status)**:
   Any candidate with `clinicalPromotionStatus = 'blocked'` is **immediately rejected**.
4. **Rule 4 (No Silent Passthrough)**:
   If a clinical execution receives zero valid clinical candidates after Gate G14 filtering, the engine **abstains completely** (`abstain_zero_candidates`) rather than substituting an unpromoted research hypothesis.
