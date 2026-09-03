# Module Verification Package: Obsessive-Compulsive Disorder (OCD)
**Module Identifier:** `IMR-OCD-2.0.0`  
**Plugin Implementation:** `OCDPlugin` (`packages/target-engine/src/plugins/ocd/ocd-plugin.ts`)  
**Target Gate:** Q3 — Module Verification Qualified  
**Standard Reference:** IEC 62304:2006+AMD1:2015 §5.5 / ISO 13485:2016 §7.3.5  
**Governing Roadmap:** [`MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0.md`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Implementation%20&%20Multi-Indication%20Validation%20Roadmap%20v2.0.md) (§34, §43, §44)  
**Golden Suite Reference:** `packages/target-engine/tests/v2/golden-suites/ocd-golden-suite.test.ts` (8 Scenarios)  
**Status:** PASS (Q3 Qualified)  
**Evaluation Date:** 2026-09-03  

---

## 1. Module Requirements Verification
- **SRS Scope:** `MAG-OCD-001` through `MAG-OCD-018`.
- **Traceability:** 100% of applicable OCD requirements traced and verified. Zero open critical defects.

---

## 2. EvidencePath Verification
- **Curated EvidencePaths:**
  - `EP-OCD-DACC-01`: Bilateral dACC / mPFC deep-TMS stimulation with mandatory provocation.
  - `EP-OCD-SMA-02`: Pre-SMA / SMA bilateral low-frequency inhibitory stimulation.
- **Negative Trials:** Non-navigated low-frequency figure-8 null meta-analyses prominently displayed in Evidence Drawer.

---

## 3. Generator Verification
- **Generators:**
  - `ocd-mpfc-dacc-field-generator`: Produces broad cortical/subcortical field geometries.
  - `ocd-presma-generator`: Produces bilateral pre-SMA focal coordinates ($[-6, 12, 54]$).

---

## 4. Measurement Compatibility Verification
- **Device & Coil Invariants:** Figure-8 focal coils rejected for dACC deep targets; H7 deep-TMS coil required.
- **Treatment Context:** Mandatory symptom provocation co-intervention checked.

---

## 5. Ranking / Refinement Verification
- Primary 1 slot allocated to dACC/mPFC field target when deep-TMS device is selected. Pre-SMA allocated as Primary 2 alternative.

---

## 6. Geometry Verification
- **Permitted Geometry:** `coil_field` for dACC, `stereotaxic_point` for pre-SMA.
- **Critical Invariant (§34 O04):** Rejection of point coercion for broad coil-field targets. Field targets retain volumetric field characteristics.

---

## 7. Golden Case Verification (Roadmap §34)
8/8 Canonical Golden Cases PASS:
1. `OCD-GC-01` (mPFC/dACC Field Target): Generates deep-TMS H7 coil field geometry. (PASS)
2. `OCD-GC-02` (Incompatible Coil): Rejects figure-8 focal coil for deep target. (PASS)
3. `OCD-GC-03` (pre-SMA Alternative): Generates valid inhibitory secondary candidate. (PASS)
4. `OCD-GC-04` (Field Cannot Become Point): Rejects coercion of field target into point coordinate. (PASS)
5. `OCD-GC-05` (Missing Provocation): Missing provocation context triggers warning/gating. (PASS)
6. `OCD-GC-06` (Research Target): Exploratory OFC/vmPFC target blocked from Clinical slates. (PASS)
7. `OCD-GC-07` (Conflicting Evidence): Surfaces negative trials alongside pivotal trials. (PASS)
8. `OCD-GC-08` (Ferromagnetic Abstention): Complete abstention when cranial metallic implant exists. (PASS)

---

## 8. Research / Clinical Boundary Verification
- **Permitted Modes:** `validation`, `research`.
- **Enforcement:** Clinical signing blocked. Module remains in validation/research until prospective gates pass.

---

## Formal Gate Determination
The OCD Module satisfies all 10 Q3 Gate criteria.  
**Result: Q3 — Verification Qualified** *(Note: Q3 is not clinical validation)*.
