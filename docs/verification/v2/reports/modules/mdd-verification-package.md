# Module Verification Package: Major Depressive Disorder (MDD)
**Module Identifier:** `IMR-MDD-2.0.0`  
**Plugin Implementation:** `MDDPlugin` (`packages/target-engine/src/plugins/mdd/mdd-plugin.ts`)  
**Target Gate:** Q3 — Module Verification Qualified  
**Standard Reference:** IEC 62304:2006+AMD1:2015 §5.5 / ISO 13485:2016 §7.3.5  
**Governing Roadmap:** [`MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0.md`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Implementation%20&%20Multi-Indication%20Validation%20Roadmap%20v2.0.md) (§33, §43, §44)  
**Golden Suite Reference:** `packages/target-engine/tests/v2/golden-suites/mdd-golden-suite.test.ts` (10 Scenarios)  
**Status:** PASS (Q3 Qualified)  
**Evaluation Date:** 2026-09-03  

---

## 1. Module Requirements Verification
- **SRS Scope:** `MAG-SYS`, `MAG-CLI`, `MAG-TGT`, `MAG-EVD`, `MAG-POL`, `MAG-DAT`, `MAG-AUD`.
- **Traceability:** 100% of applicable MDD requirements verified through unit, integration, and golden suite tests.
- **Defects:** 0 open critical defects.

---

## 2. EvidencePath Verification
- **Curated EvidencePaths:**
  - `EP-MDD-DLPFC-01`: Left DLPFC anterolateral target ($[-38, 44, 26]$) derived from pivotal trials.
  - `EP-MDD-DMPFC-02`: Bilateral DMPFC anxiosomatic target ($[0, 48, 46]$).
- **Proven Reconstructability:** Every generated candidate links directly to approved claims and primary citations.
- **Negative Trials:** Documented sham-controlled failures and non-navigated null trials surfaced in Evidence Drawer.

---

## 3. Generator Verification
- **Generators:**
  - `mdd-left-dlpfc-generator`: Nominates Left DLPFC priors.
  - `mdd-anxiosomatic-dmpfc-generator`: Nominates DMPFC for anxious depression phenotypes.
- **Activation Logic:** Verified phenotypic gating ensures DMPFC is nominated only when anxiety/somatic subscale is elevated.

---

## 4. Measurement Compatibility Verification
- **Modality Support:** Structural MRI (T1w) mandatory; resting-state fMRI (rs-fMRI) optional for personalized connectivity refinement.
- **QC Gates:** Framewise displacement $>0.35\text{ mm}$ triggers safe fallback to anatomical prior.

---

## 5. Ranking / Refinement Verification
- **Spatial Refinement:** Connectome-refined candidate promoted to Primary 1 when displacement is within anatomical boundary ($<30\text{ mm}$) and incremental circuit gain $\ge 0.10$.
- **Counterfactual Preservation:** The unrefined evidence baseline prior is preserved in Additional A slot.

---

## 6. Geometry Verification
- **Permitted Geometry:** `stereotaxic_point` (MNI coordinates $+/-$ uncertainty radius) and `cortical_parcel` (Brodmann Area 46 / 9).
- **Invalid Geometries:** Deep coil fields rejected as non-conforming for focal MDD protocols.

---

## 7. Golden Case Verification (Roadmap §33)
10/10 Canonical Golden Cases PASS:
1. `MDD-GC-01` (High Convergence): rs-fMRI refines target; baseline in Additional A. (PASS)
2. `MDD-GC-02` (Large Displacement): $>30\text{ mm}$ displacement suppressed by envelope gate. (PASS)
3. `MDD-GC-03` (Low Incremental Value): $+0.06$ gain suppresses personalized target; evidence prior is Primary 1. (PASS)
4. `MDD-GC-04` (Poor Imaging Fallback): High motion ($\text{FD}=0.38\text{ mm}$) triggers fallback to evidence baseline. (PASS)
5. `MDD-GC-05` (Single Target): Dysphoric depression yields single convergent Left DLPFC candidate. (PASS)
6. `MDD-GC-06` (Dual Circuits): Anxiosomatic depression yields Left DLPFC (Primary 1) + DMPFC (Primary 2). (PASS)
7. `MDD-GC-07` (Research Anomaly): Exploratory Area 8Av target blocked from Clinical Mode slates. (PASS)
8. `MDD-GC-08` (Clinician Rejects Primary 1): Clinician records rejection rationale and signs valid decision. (PASS)
9. `MDD-GC-09` (Alternate Selection): Clinician rejects Primary 1 and selects Additional A prior. (PASS)
10. `MDD-GC-10` (Historical Versioning): Historical v1 slates remain bit-for-bit identical across library upgrades. (PASS)

---

## 8. Research / Clinical Boundary Verification
- **Permitted Modes:** `clinical`, `research`.
- **Enforcement:** Research-only candidates blocked from Clinical slates. Historical clinical authorization preserved under controlled baseline.

---

## Formal Gate Determination
The MDD Module satisfies all 10 Q3 Gate criteria.  
**Result: Q3 — Verification Qualified** *(Note: Q3 is not clinical validation)*.
