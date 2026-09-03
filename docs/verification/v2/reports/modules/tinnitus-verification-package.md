# Module Verification Package: Chronic Subjective Tinnitus
**Module Identifier:** `IMR-TIN-2.0.0`  
**Plugin Implementation:** `TinnitusPlugin` (`packages/target-engine/src/plugins/tinnitus/tinnitus-plugin.ts`)  
**Target Gate:** Q3 — Module Verification Qualified  
**Standard Reference:** IEC 62304:2006+AMD1:2015 §5.5 / ISO 13485:2016 §7.3.5  
**Governing Roadmap:** [`MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0.md`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Implementation%20&%20Multi-Indication%20Validation%20Roadmap%20v2.0.md) (§40, §43, §44)  
**Golden Suite Reference:** `packages/target-engine/tests/v2/golden-suites/tinnitus-golden-suite.test.ts` (10 Scenarios)  
**Status:** PASS (Q3 Qualified)  
**Evaluation Date:** 2026-09-03  

---

## 1. Module Requirements Verification
- **SRS Scope:** `MAG-TIN-001` through `MAG-TIN-018`.
- **Traceability:** 100% of applicable Tinnitus requirements traced and verified. Zero open critical defects.

---

## 2. EvidencePath Verification
- **Curated EvidencePaths:**
  - `EP-TIN-T3P3-01`: Left temporoparietal junction (T3P3 electrode 10-20 position, MNI $[-52, -38, 24]$) 1Hz inhibitory targeting.
  - `EP-TIN-AUDITORY-02`: Primary auditory cortex / Heschl's gyrus tonotopic candidate (Research only).
- **Negative Guideline Evidence (§40 TIN06):** Clinical practice guidelines recommending against routine clinical rTMS for tinnitus are prominently displayed.

---

## 3. Generator Verification
- **Generators:**
  - `tinnitus-t3p3-generator`: Produces temporoparietal coordinates.
  - `tinnitus-auditory-generator`: Produces tonotopic auditory cortex candidates in Research Mode.

---

## 4. Measurement Compatibility Verification
- **Audiological Ingestion:** Audiogram curves, high-frequency hearing loss, and tinnitus pitch matching.
- **Pulsatile Tinnitus Exclusion:** Pulsatile tinnitus presentation requires immediate stop and vascular imaging referral.

---

## 5. Ranking / Refinement Verification
- Temporary audiological pitch matches cannot autonomously justify clinical targeting.
- Conflicting meta-analyses (heterogeneous effect sizes) are presented transparently in Evidence Drawer.

---

## 6. Geometry Verification
- **Permitted Geometry:** `stereotaxic_point`.
- **Laterality:** Unilateral tinnitus maps to contralateral or left temporoparietal cortex; bilateral tinnitus produces single primary candidate to avoid bilateral over-stimulation.

---

## 7. Golden Case Verification (Roadmap §40)
10/10 Canonical Golden Cases PASS:
1. `TIN-GC-01` (Complete Audiology): Ingests complete audiogram and pitch match. (PASS)
2. `TIN-GC-02` (Unilateral Tinnitus): Unilateral tinnitus maps to T3P3 candidate. (PASS)
3. `TIN-GC-03` (Bilateral Tinnitus): Bilateral presentation produces single primary target. (PASS)
4. `TIN-GC-04` (Strong Pitch Match): Pitch match informs context but does not force target. (PASS)
5. `TIN-GC-05` (Strong Imaging Abnormality): Imaging findings cannot override evidence status. (PASS)
6. `TIN-GC-06` (Negative Guideline Evidence): Prominently surfaces negative guideline statements. (PASS)
7. `TIN-GC-07` (Conflicting Meta-Analyses): Displays contradictory meta-analytic findings. (PASS)
8. `TIN-GC-08` (Research Target Generated): Valid research target generated in Research Mode. (PASS)
9. `TIN-GC-09` (Clinical Request Denied): Clinical Mode request is strictly denied. (PASS)
10. `TIN-GC-10` (Pulsatile Tinnitus Referral): Pulsatile symptoms trigger referral stop. (PASS)

---

## 8. Research / Clinical Boundary Verification
- **Permitted Modes:** `research` ONLY.
- **Enforcement:** Clinical signing strictly disabled (`ResearchModeSigningProhibitedError`). Clinical Mode target generation requests are rejected.

---

## Formal Gate Determination
The Chronic Subjective Tinnitus Module satisfies all 10 Q3 Gate criteria.  
**Result: Q3 — Verification Qualified** *(Note: Q3 is not clinical validation)*.
