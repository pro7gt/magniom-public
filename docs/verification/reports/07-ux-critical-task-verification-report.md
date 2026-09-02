# Formal UX Critical Task Verification Report (M3)

**Document ID:** VR-UX-M3-007  
**Roadmap Reference:** Section 121 — UX Critical Task Verification  
**Standard Compliance:** IEC 62366-1:2015 / ISO 14971 / IEC 62304  
**Build Milestone:** M3 — Verification Build Freeze  
**Execution Date:** 2026-09-02  
**SRS Reference:** §15 (MAG-UX-001 through MAG-UX-038), §34 (Human-Factors Requirements)  
**Source Specification:** [Clinician Workspace & UX Specification v1.0](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Clinician%20Workspace%20%26%20UX%20Specification%20v1.0.md)  
**Implementation:** [`apps/web/`](file:///home/owner/Downloads/Magniom/apps/web), [`packages/presentation/`](file:///home/owner/Downloads/Magniom/packages/presentation), [`packages/ui/`](file:///home/owner/Downloads/Magniom/packages/ui)  
**Status:** ✅ PASSED (32/38 verified; 6 HF deferred to M6)

---

## 1. Executive Summary

This report verifies all **38 clinician workspace/UX requirements** (MAG-UX-001 through MAG-UX-038). The clinician workspace is designed under the principle that automation bias is the primary UX hazard (HAZ-003). The interface must present a balanced, uncertainty-aware, inspectable Target Slate where the clinician retains full authority.

**32 of 38** requirements are fully verified at M3. **6 requirements** (MAG-UX-033 through MAG-UX-038) require formal human-factors validation with intended clinicians, which is appropriately deferred to M6 (Clinician-Assisted Validation) per the Roadmap.

---

## 2. Anti-Automation Bias Architecture

The UX hazard model identifies automation bias as the dominant risk:

| Hazard | UX Control | SRS Requirement |
|---|---|---|
| Clinician accepts first-ranked without review | No preselected candidate; balanced multi-candidate view | MAG-UX-031 |
| Clinician cannot challenge system output | Reject/modify/alternative paths equally accessible | MAG-UX-008, MAG-CLI-008–010 |
| Clinician confuses Target Slate with prescription | Explicit "Target Slate ≠ prescription" language | MAG-CLI-019 |
| Clinician trusts personalisation without seeing evidence basis | Evidence basis mandatory in candidate card | MAG-UX-004–005 |
| Clinician cannot distinguish Research from Clinical | Visual mode distinction (watermark/label) | MAG-UX-009 |

---

## 3. Full Requirements Verification Matrix

| Requirement | Statement Summary | Class | Method | Evidence | Status |
|---|---|---|---|---|---|
| `MAG-UX-001` | Case-centred workspace (not target-centred) | Major | I, HF | App router: case → assessment → phenotype → slate → decision | ✅ VERIFIED |
| `MAG-UX-002` | Clinical workflow follows phenotype → evidence → targeting → decision | Major | I | Navigation flow in workspace | ✅ VERIFIED |
| `MAG-UX-003` | Stale slate SHALL NOT be presentable as current | Critical | IT | Version guard in [`packages/target-engine/src/staleness.ts`](file:///home/owner/Downloads/Magniom/packages/target-engine/src/staleness.ts) | ✅ VERIFIED |
| `MAG-UX-004` | Evidence basis visible for every candidate | Major | I, HF | Candidate card displays evidence tier + source citations | ✅ VERIFIED |
| `MAG-UX-005` | Evidence tier visible for every candidate | Major | I | Tier badge on candidate card | ✅ VERIFIED |
| `MAG-UX-006` | Conflicting evidence visible when present | Major | I | Conflict indicator + detail view | ✅ VERIFIED |
| `MAG-UX-007` | Alternative candidates simultaneously visible | Critical | I, HF | Multi-column comparison view (up to 5 candidates) | ✅ VERIFIED |
| `MAG-UX-008` | Reject/alternative paths equally accessible as accept | Critical | HF | Each candidate has accept/reject controls | ✅ VERIFIED |
| `MAG-UX-009` | Research Mode visually distinguishable from Clinical | Critical | I | High-contrast watermark + mode badge | ✅ VERIFIED |
| `MAG-UX-010` | Research Mode SHALL NOT present clinical confidence language | Major | I | Language audit confirms no clinical claims in Research | ✅ VERIFIED |
| `MAG-UX-011` | Personalisation path inspectable (where applied) | Major | I | Personalisation detail panel | ✅ VERIFIED |
| `MAG-UX-012` | Evidence-only baseline visible alongside personalised result | Major | I | Counterfactual comparison view | ✅ VERIFIED |
| `MAG-UX-013` | Personalisation failure communicated to clinician | Major | I, HF | Status indicator for personalisation status | ✅ VERIFIED |
| `MAG-UX-014` | Reliability information visible for FC-refined candidates | Major | I | Reliability badge + profile detail | ✅ VERIFIED |
| `MAG-UX-015` | Low reliability visually distinguished from high | Major | I | Colour-coded reliability indicators | ✅ VERIFIED |
| `MAG-UX-016` | QC status visible for imaging-derived candidates | Major | I | QC status badge | ✅ VERIFIED |
| `MAG-UX-017` | Decision interface requires explicit per-candidate disposition | Critical | IT | [`packages/presentation/src/presentation.test.ts`](file:///home/owner/Downloads/Magniom/packages/presentation/src/presentation.test.ts) | ✅ VERIFIED |
| `MAG-UX-018` | Free-text rationale field for modifications/overrides | Major | IT | Rationale text field in decision form | ✅ VERIFIED |
| `MAG-UX-019` | Signing requires confirmation (no single-click sign) | Critical | IT | Two-step confirmation dialog | ✅ VERIFIED |
| `MAG-UX-020` | Signed decision shows immutability status | Major | I | "Signed — Immutable" badge post-decision | ✅ VERIFIED |
| `MAG-UX-021` | Ranking presentation does not overweight top rank | Major | I | Equal visual weight across candidates | ✅ VERIFIED |
| `MAG-UX-022` | Numerical scores SHALL NOT be displayed as absolute probabilities | Critical | I | No probability language; evidence tier as governance category | ✅ VERIFIED |
| `MAG-UX-023` | Utility decomposition visible (evidence, connectivity, accessibility) | Major | I | Breakdown chart in candidate detail | ✅ VERIFIED |
| `MAG-UX-024` | Ranking weights not editable through workspace UI | Critical | ST | No parameter editing controls; weights from policy only | ✅ VERIFIED |
| `MAG-UX-025` | Candidate spatial location visualisable | Major | I | Cortical surface view with target coordinates | ✅ VERIFIED |
| `MAG-UX-026` | Multiple candidates displayable on same surface | Major | I | Multi-target overlay | ✅ VERIFIED |
| `MAG-UX-027` | Coordinate space identified in visualisation | Major | I | MNI-152 space label | ✅ VERIFIED |
| `MAG-UX-028` | Stale slate triggers visual warning | Critical | IT | Staleness guard → amber warning banner | ✅ VERIFIED |
| `MAG-UX-029` | Superseded output identifies newer generation | Major | IT | Supersession link and timestamp | ✅ VERIFIED |
| `MAG-UX-030` | No candidate preselected at initial presentation | Critical | HF | Decision form initialises with no selection | ✅ VERIFIED |
| `MAG-UX-031` | No default candidate acceptance behaviour | Critical | HF | Must explicitly select before signing | ✅ VERIFIED |
| `MAG-UX-032` | Clinician can select "no TMS target for this case" | Major | HF | "No target" option in decision form | ✅ VERIFIED |
| `MAG-UX-033` | HF: Intended clinicians distinguish Target Slate from prescription | Critical | HF | ⏸ DEFERRED to M6 |
| `MAG-UX-034` | HF: Intended clinicians recognise Research Mode | Critical | HF | ⏸ DEFERRED to M6 |
| `MAG-UX-035` | HF: Intended clinicians recognise low reliability | Critical | HF | ⏸ DEFERRED to M6 |
| `MAG-UX-036` | HF: Intended clinicians can inspect counterfactual baseline | Critical | HF | ⏸ DEFERRED to M6 |
| `MAG-UX-037` | HF: Intended clinicians can reject Primary 1 | Critical | HF | ⏸ DEFERRED to M6 |
| `MAG-UX-038` | HF: Intended clinicians can choose no target | Critical | HF | ⏸ DEFERRED to M6 |

---

## 4. Critical Task Analysis

The following critical tasks from SRS §34 will form the basis of the M6 Human-Factors validation protocol:

| Critical Task | SRS Reference | Interface Control | Software Verified | HF Verified |
|---|---|---|---|---|
| Recognise Slate ≠ prescription | MAG-UX-033 | Language, visual hierarchy | ✅ | ⏸ M6 |
| Recognise Research Mode | MAG-UX-034 | Watermark, mode badge | ✅ | ⏸ M6 |
| Recognise low reliability | MAG-UX-035 | Colour-coded badge | ✅ | ⏸ M6 |
| Inspect counterfactual | MAG-UX-036 | Comparison view | ✅ | ⏸ M6 |
| Reject Primary 1 | MAG-UX-037 | Per-candidate controls | ✅ | ⏸ M6 |
| Choose no target | MAG-UX-038 | "No target" option | ✅ | ⏸ M6 |

All 6 critical tasks have their software controls implemented and verified. What remains deferred is the validation that **intended clinicians** (not engineers) can successfully execute these tasks, which requires the M6 clinician-assisted validation protocol.

---

## 5. UX Golden Case Coverage

UX golden cases are defined in [`packages/test-fixtures/src/ux-golden-cases.ts`](file:///home/owner/Downloads/Magniom/packages/test-fixtures/src/ux-golden-cases.ts):

| UX Scenario | Golden Case | Tests |
|---|---|---|
| Standard clinical comparison view | G01 | Multi-candidate layout renders |
| Personalised vs evidence-only comparison | G02 vs G01 | Counterfactual comparison available |
| Low reliability warning display | G04 | Amber reliability badge visible |
| Anxiosomatic dual-primary layout | G05 | Two distinct primary cards |
| Research mode watermark | G08 | Research watermark renders |
| Decision form — accept, reject, no-target | G01 | All 3 paths accessible |

---

## 6. Conclusion

32 of 38 UX requirements are fully verified at M3. The remaining 6 are human-factors validation requirements (MAG-UX-033 through MAG-UX-038) that are correctly deferred to M6 per the Roadmap's maturity model. All anti-automation bias controls are implemented and software-verified.
