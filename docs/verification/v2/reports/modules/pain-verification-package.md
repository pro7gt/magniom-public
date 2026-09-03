# Module Verification Package: Chronic Neuropathic Pain
**Module Identifier:** `IMR-PAI-2.0.0`  
**Plugin Implementation:** `NeuropathicPainPlugin` (`packages/target-engine/src/plugins/neuropathic-pain/neuropathic-pain-plugin.ts`)  
**Target Gate:** Q3 — Module Verification Qualified  
**Standard Reference:** IEC 62304:2006+AMD1:2015 §5.5 / ISO 13485:2016 §7.3.5  
**Governing Roadmap:** [`MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0.md`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Implementation%20&%20Multi-Indication%20Validation%20Roadmap%20v2.0.md) (§35, §43, §44)  
**Golden Suite Reference:** `packages/target-engine/tests/v2/golden-suites/pain-golden-suite.test.ts` (8 Scenarios)  
**Status:** PASS (Q3 Qualified)  
**Evaluation Date:** 2026-09-03  

---

## 1. Module Requirements Verification
- **SRS Scope:** `MAG-PAI-001` through `MAG-PAI-018`.
- **Traceability:** 100% of applicable Neuropathic Pain requirements traced and verified. Zero open critical defects.

---

## 2. EvidencePath Verification
- **Curated EvidencePaths:**
  - `EP-PAI-M1-HAND-01`: Contralateral M1 hand knob 10Hz/20Hz facilitatory targeting for upper-limb pain.
  - `EP-PAI-M1-LEG-02`: Contralateral M1 medial leg representation targeting for lower-limb pain.
- **Negative Evidence:** Documented lack of efficacy for non-navigated circular coils and S2/insular off-target trials.

---

## 3. Generator Verification
- **Generators:**
  - `pain-m1-hand-generator`: Maps right hand pain to left M1 ($[-37, -21, 58]$).
  - `pain-m1-leg-generator`: Maps left leg pain to right M1 medial wall ($[8, -32, 66]$).

---

## 4. Measurement Compatibility Verification
- **MEP Motor Mapping:** Ingests electromyographic motor mapping coordinates.
- **QC Thresholds:** Reproducibility index $R \ge 0.80$ enables personalized refinement; $R < 0.60$ triggers fallback to anatomical homunculus.

---

## 5. Ranking / Refinement Verification
- Single Primary 1 candidate generated corresponding to the primary painful body region.
- Exploratory targets (S2, insula) restricted to Research Mode to prevent ungrounded multi-target delivery.

---

## 6. Geometry Verification
- **Permitted Geometry:** `stereotaxic_point`.
- **Hard Laterality Gate:** Strict contralateral somatotopy. Generation of an ipsilateral M1 candidate is blocked and rejected by safety gates.

---

## 7. Golden Case Verification (Roadmap §35)
8/8 Canonical Golden Cases PASS:
1. `PAI-GC-01` (Unilateral Hand Pain): Right hand maps to left M1 hand knob prior. (PASS)
2. `PAI-GC-02` (Unilateral Leg Pain): Left leg maps to right M1 medial leg prior. (PASS)
3. `PAI-GC-03` (Qualified MEP Refinement): High-reliability MEP ($R=0.85$) refines target to physiological hotspot. (PASS)
4. `PAI-GC-04` (Unreliable Motor Mapping): Low-reliability MEP ($R=0.45$) falls back to anatomical prior. (PASS)
5. `PAI-GC-05` (Bilateral Pain Ambiguity): Bilateral pain without dominant laterality triggers clinical disambiguation stop. (PASS)
6. `PAI-GC-06` (Body-Region Mismatch): Facial/trigeminal pain fails limb generator gate; triggers abstention. (PASS)
7. `PAI-GC-07` (Laterality Error Gating): Ipsilateral candidate generation is rejected. (PASS)
8. `PAI-GC-08` (Single Primary 1): System avoids ungrounded secondary circuits; outputs single Primary 1. (PASS)

---

## 8. Research / Clinical Boundary Verification
- **Permitted Modes:** `validation`, `research`.
- **Enforcement:** Clinical signing blocked. Module remains in validation/research until retrospective and prospective gates pass.

---

## Formal Gate Determination
The Neuropathic Pain Module satisfies all 10 Q3 Gate criteria.  
**Result: Q3 — Verification Qualified** *(Note: Q3 is not clinical validation)*.
