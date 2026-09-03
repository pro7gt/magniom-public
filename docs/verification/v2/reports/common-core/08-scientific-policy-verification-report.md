# Scientific Policy Verification Report v2.0
**Document Reference:** MAG-VR-v2-08-POL  
**Standard Reference:** IEC 62304:2006+AMD1:2015 §5.5 / ISO 13485:2016 §7.3.5  
**Specification Reference:** [`MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0.md`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Scientific%20Policy%20&%20Algorithm%20Configuration%20Specification%20v2.0.md) (§80–§88, §179)  
**Test Reference:** `packages/target-engine/tests/v2/` (`evidence-policy.test.ts`, `research-leakage.test.ts`)  
**Status:** PASS  
**Execution Date:** 2026-09-03  

---

## 1. Executive Summary

This report documents the verification of the **Scientific Policy & Algorithm Configuration v2.0** (`POL-v2-2026.09`). Scientific Policy governs which indication modules, candidate generators, evidence tiers, and measurement modalities are permitted to generate and rank targets within a given operating mode (`CLINICAL`, `VALIDATION`, `RESEARCH`).

Verification confirms that every targeting slate satisfies Policy Spec §179 reconstructability criteria and that exploratory research configurations are strictly prevented from leaking into clinical operation.

---

## 2. Verification Against Policy Spec §179 (The 10 Reconstructability Questions)

Under Policy Spec §179, an independent scientific reviewer must be able to reconstruct the rationale for every slate. Verification confirmed:

| # | Scientific Governance Question | Verification Mechanism & Reconstructability Proof | Status |
|---|---|---|:---:|
| 1 | **Why is this indication enabled?** | Bound explicitly to `IndicationModuleRelease` and active session mode in `CaseIndication`. | **PASS** |
| 2 | **Which EvidencePaths can generate targets?** | Stored in `reproducibilityManifest.authorizedEvidencePathIds`. | **PASS** |
| 3 | **Which candidate generators are active?** | Manifest records active generator IDs per indication plugin. | **PASS** |
| 4 | **Which measurements can influence ranking?** | Explicit feature extraction gates confirm only QC-passed modalities contribute. | **PASS** |
| 5 | **Which reliability rules apply?** | Modality-specific `ReliabilityBundle` thresholds evaluate signal quality. | **PASS** |
| 6 | **Which fallback exists?** | Fallback to evidence baseline priors when imaging/MEP is unreliable or missing. | **PASS** |
| 7 | **Which target geometries are legal?** | Target geometry schema enforced; point coercion rejected for field targets. | **PASS** |
| 8 | **Which parameters can change ordering?** | Normalized, transparent scoring rules; no hidden composite black-box formulas. | **PASS** |
| 9 | **What prevents Research leakage?** | Policy gate blocks Research-only candidates from Clinical Mode slates. | **PASS** |
| 10 | **Can abstention be explained?** | Explicit `abstentionDetails` provide machine- and human-readable reason codes. | **PASS** |

---

## 3. Operating Mode Permissions & Isolation

Scientific Policy `POL-v2-2026.09` enforces the following mode permissions:
- **MDD**: Authorized for `CLINICAL` and `RESEARCH`.
- **OCD**: Authorized for `VALIDATION` and `RESEARCH`.
- **Neuropathic Pain**: Authorized for `VALIDATION` and `RESEARCH`.
- **Stroke Motor**: Authorized for `VALIDATION` and `RESEARCH`.
- **Stroke Aphasia**: Authorized for `RESEARCH` only.
- **TBI**: Authorized for `RESEARCH` only.
- **PTSD**: Authorized for `RESEARCH` only.
- **Tinnitus**: Authorized for `RESEARCH` only.

Attempting to request a Clinical slate for a Research-only module (e.g. `TIN09`) results in immediate, fail-closed clinical request denial.

---

## 4. Conclusion
Scientific Policy configuration `POL-v2-2026.09` satisfies all regulatory and scientific governance requirements. Qualified for formal Verification Baseline release.
