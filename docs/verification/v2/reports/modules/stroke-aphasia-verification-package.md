# Module Verification Package: Post-Stroke Aphasia
**Module Identifier:** `IMR-STRA-2.0.0`  
**Plugin Implementation:** `StrokeAphasiaPlugin` (`packages/target-engine/src/plugins/stroke-aphasia/stroke-aphasia-plugin.ts`)  
**Target Gate:** Q3 — Module Verification Qualified  
**Standard Reference:** IEC 62304:2006+AMD1:2015 §5.5 / ISO 13485:2016 §7.3.5  
**Governing Roadmap:** [`MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0.md`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Implementation%20&%20Multi-Indication%20Validation%20Roadmap%20v2.0.md) (§37, §43, §44)  
**Golden Suite Reference:** `packages/target-engine/tests/v2/golden-suites/stroke-aphasia-golden-suite.test.ts` (10 Scenarios)  
**Status:** PASS (Q3 Qualified)  
**Evaluation Date:** 2026-09-03  

---

## 1. Module Requirements Verification
- **SRS Scope:** `MAG-STR-015` through `MAG-STR-025`, `MAG-CLI`, `MAG-TGT`.
- **Traceability:** 100% of applicable Stroke Aphasia requirements traced and verified. Zero open critical defects.

---

## 2. EvidencePath Verification
- **Curated EvidencePaths:**
  - `EP-STRA-IFG-CONTRA-01`: Contralesional right IFG (pars triangularis) 1Hz inhibitory targeting for chronic non-fluent Broca's aphasia with mandatory concurrent Speech-Language Therapy (SLT).
- **Mandatory Co-Intervention Edge:** Evidence graph strictly requires active SLT co-intervention edge (§119).

---

## 3. Generator Verification
- **Generators:**
  - `stroke-aphasia-right-ifg-generator`: Nominates right pars triangularis prior ($[50, 24, 14]$).
  - `stroke-aphasia-task-fmri-refiner`: Refines prior based on language localizer task activation.

---

## 4. Measurement Compatibility Verification
- **Phenotypic Scope Gating:** Fluent (Wernicke's) or global aphasia fails non-fluent eligibility gate.
- **Timing Gating:** Acute aphasia ($<1$ month post-stroke) is blocked by disease-stage gate.

---

## 5. Ranking / Refinement Verification
- Valid task-fMRI picture naming activation refines the target toward peak functional activation. Scanner task non-compliance falls back safely to anatomical IFG prior.

---

## 6. Geometry Verification
- **Permitted Geometry:** `stereotaxic_point` and `cortical_parcel` (Brodmann Area 45).
- **Contralesional Lesion Conflict:** A contralesional right-hemisphere infarct invalidates the right IFG inhibitory target.

---

## 7. Golden Case Verification (Roadmap §37)
10/10 Canonical Golden Cases PASS:
1. `STRA-GC-01` (Chronic Non-Fluent): Broca aphasia maps to right IFG 1Hz target. (PASS)
2. `STRA-GC-02` (Fluent Aphasia Mismatch): Fluent aphasia fails clinical scope gate. (PASS)
3. `STRA-GC-03` (Stage Mismatch): Acute aphasia ($<1$ month) blocked by timing gate. (PASS)
4. `STRA-GC-04` (Mandatory SLT Verified): Confirms concurrent SLT co-intervention. (PASS)
5. `STRA-GC-05` (Missing SLT Warning): Missing SLT triggers clinical warning/block. (PASS)
6. `STRA-GC-06` (Task-fMRI Refinement): Valid task-fMRI refines right IFG hotspot. (PASS)
7. `STRA-GC-07` (Scanner Task Failure): Task non-compliance falls back to anatomical prior. (PASS)
8. `STRA-GC-08` (Research Ipsilesional Target): Ipsilesional candidate generated in Research only. (PASS)
9. `STRA-GC-09` (Contralesional Lesion Invalidation): Right IFG stroke invalidates target. (PASS)
10. `STRA-GC-10` (Bilateral Severe Infarct): Severe bilateral damage triggers abstention. (PASS)

---

## 8. Research / Clinical Boundary Verification
- **Permitted Modes:** `research` ONLY.
- **Enforcement:** Clinical signing strictly disabled (`ResearchModeSigningProhibitedError`).

---

## Formal Gate Determination
The Post-Stroke Aphasia Module satisfies all 10 Q3 Gate criteria.  
**Result: Q3 — Verification Qualified** *(Note: Q3 is not clinical validation)*.
