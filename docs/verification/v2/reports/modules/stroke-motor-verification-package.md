# Module Verification Package: Post-Stroke Motor Recovery
**Module Identifier:** `IMR-STRM-2.0.0`  
**Plugin Implementation:** `StrokeMotorPlugin` (`packages/target-engine/src/plugins/stroke-motor/stroke-motor-plugin.ts`)  
**Target Gate:** Q3 — Module Verification Qualified  
**Standard Reference:** IEC 62304:2006+AMD1:2015 §5.5 / ISO 13485:2016 §7.3.5  
**Governing Roadmap:** [`MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0.md`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Implementation%20&%20Multi-Indication%20Validation%20Roadmap%20v2.0.md) (§36, §43, §44)  
**Golden Suite Reference:** `packages/target-engine/tests/v2/golden-suites/stroke-motor-golden-suite.test.ts` (10 Scenarios)  
**Status:** PASS (Q3 Qualified)  
**Evaluation Date:** 2026-09-03  

---

## 1. Module Requirements Verification
- **SRS Scope:** `MAG-STR-001` through `MAG-STR-025`.
- **Traceability:** 100% of applicable Stroke Motor requirements traced and verified. Zero open critical defects.

---

## 2. EvidencePath Verification
- **Curated EvidencePaths:**
  - `EP-STR-M1-IPSI-01`: Ipsilesional high-frequency facilitatory M1 targeting in post-acute stroke with preserved perilesional tissue.
  - `EP-STR-M1-CONTRA-02`: Contralesional 1Hz low-frequency inhibitory M1 targeting for chronic interhemispheric competition reduction.
- **Disease Stage Constraints:** Strict temporal boundary: post-acute (2–6 months) or chronic (>6 months).

---

## 3. Generator Verification
- **Generators:**
  - `stroke-motor-ipsilesional-generator`: Produces perilesional M1 coordinates.
  - `stroke-motor-contralesional-generator`: Produces unaffected hemisphere M1 coordinates.
  - `stroke-motor-premotor-research-generator`: Produces supplementary motor / premotor candidates in Research Mode.

---

## 4. Measurement Compatibility Verification
- **Lesion Mask Ingestion:** Binary lesion segmentation mask detects necrotic core. If the motor hotspot is $>80\%$ destroyed, the ipsilesional generator is suppressed.
- **Disease Stage Ingestion:** Hyperacute stroke ($<2$ weeks) is blocked by disease-stage gate.

---

## 5. Ranking / Refinement Verification
- Perilesional rim MEP response refines anatomical priors to physiological motor hotspots.
- Non-autonomous context: MEP status informs, but does not autonomously override, clinician-selected strategy.

---

## 6. Geometry Verification
- **Permitted Geometry:** `stereotaxic_point`.
- **Lesion Laterality Conflict Gate (§36 SM10):** Clinical hemiparesis laterality must match contralateral lesion hemisphere. An anatomical mismatch halts slate generation.

---

## 7. Golden Case Verification (Roadmap §36)
10/10 Canonical Golden Cases PASS:
1. `STRM-GC-01` (Stage Compatible): Post-acute ischemic stroke qualifies for ipsilesional M1. (PASS)
2. `STRM-GC-02` (Stage Mismatch): Hyperacute stroke ($<2$ weeks) is blocked by safety gate. (PASS)
3. `STRM-GC-03` (Destroyed Target): Destroyed motor cortex suppresses ipsilesional candidate. (PASS)
4. `STRM-GC-04` (Contralesional Hypothesis): Chronic severe stroke qualifies contralesional 1Hz M1. (PASS)
5. `STRM-GC-05` (Ipsilesional Hypothesis): Intact perilesional rim qualifies facilitatory M1. (PASS)
6. `STRM-GC-06` (Qualified MEP Refinement): MEP in preserved rim refines target. (PASS)
7. `STRM-GC-07` (Unreliable Motor Map): Absent MEP falls back safely to structural margin. (PASS)
8. `STRM-GC-08` (MEP Context Non-Autonomous): Specialist clinician retains strategic decision. (PASS)
9. `STRM-GC-09` (Research Compensatory Target): Premotor candidate generated only in Research Mode. (PASS)
10. `STRM-GC-10` (Lesion Conflict): Discordance between reported deficit and lesion halts slate. (PASS)

---

## 8. Research / Clinical Boundary Verification
- **Permitted Modes:** `validation`, `research`.
- **Enforcement:** Clinical signing blocked. Module remains in validation/research until clinical performance trials conclude.

---

## Formal Gate Determination
The Stroke Motor Recovery Module satisfies all 10 Q3 Gate criteria.  
**Result: Q3 — Verification Qualified** *(Note: Q3 is not clinical validation)*.
