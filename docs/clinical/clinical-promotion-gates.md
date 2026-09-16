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
   - Cleared by regulatory review (CE mark / 510(k)) or established clinical guidelines and pivotal RCT consensus (e.g., 5.5 cm rule, Beam F3, Lefaucheur 2020 international guidelines, Blumberger 2018 THREE-D trial baseline).
   - *Note on Connectomics:* Connectomic methods such as Cash 2021 personalized rs-fMRI (`FC_CLUSTER_PERSONALISED`) and Li 2026 SC tractography (`SC_CLUSTER_PERSONALISED`) remain in the `validation` maturity tier with `clinicalPromotionStatus = 'blocked'` pending multi-cohort individual pipeline qualification and software release clearance.

---

## 2. Gate G14: Fail-Closed Enforcement Rules

Gate G14 (`packages/target-engine/src/gates/v2/g14-research-leakage.ts`) enforces a strict, fail-closed allowlist in `clinical` mode:

1. **Rule 1 (Data Origin Allowlist)**:
   Candidates and relied-on measurements must explicitly declare `dataOrigin = 'patient_measured'` or `'derived_from_patient_measured'`. Missing origin, `'unknown'`, `'synthetic'`, or `'normative'` origins are **strictly rejected** (TN-014 / TN-012).
2. **Rule 2 (Maturity Allowlist)**:
   Candidates must possess `scientificMaturity = 'clinical_approved'` or `'clinical_candidate'`. Unspecified maturity, `'prototype'`, `'research'`, or `'validation'` are **strictly rejected** (TN-012).
3. **Rule 3 (Clinical Promotion Status Allowlist)**:
   Candidates must possess `clinicalPromotionStatus = 'approved'`. Unspecified status, `'blocked'`, `'candidate_under_review'`, or `'provisional_validation'` are **strictly rejected** (TN-012).
4. **Rule 4 (No Silent Passthrough / Fail-Closed Abstention)**:
   If a clinical execution receives zero valid clinical candidates after Gate G14 filtering, the engine **abstains completely** (`abstain_zero_candidates`) rather than substituting an unpromoted research hypothesis.
