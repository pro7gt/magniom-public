# Application Shell Verification Report v2.0
**Document Reference:** MAG-VR-v2-09-APP  
**Standard Reference:** IEC 62304:2006+AMD1:2015 §5.5 / IEC 62366-1:2015 (Usability) / ISO 13485:2016 §7.3.5  
**Specification Reference:** [`MAGNIOM-Application Shell, Navigation & Clinical Context Specification v2.0.md`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Application%20Shell,%20Navigation%20&%20Clinical%20Context%20Specification%20v2.0.md) (§266–§269)  
**Component Reference:** `apps/web/src/components/decision-workspace.tsx`, `@magniom/presentation`  
**Status:** PASS  
**Execution Date:** 2026-09-03  

---

## 1. Executive Summary

This report documents the verification of the **Clinician Workspace & Application Shell v2.0** (`apps/web` and `@magniom/presentation`). The application shell hosts clinician interactions, target candidate review, the Evidence Drawer, and legal digital signature workflows.

Testing verified strict compliance with human-factors safety requirements, persistent mode awareness, automated anti-automation bias controls, and the total prohibition of clinical signing on research outputs.

---

## 2. Shell Safety Controls (§266 Verification)

1. **Persistent Mode Header & Banners**:
   - In `CLINICAL` mode: Crisp, professional clinical branding.
   - In `VALIDATION` mode: Explicit amber indicator designating validation study context.
   - In `RESEARCH` mode: High-contrast persistent warning banner:
     > `RESEARCH MODE — NOT FOR CLINICAL TARGET DECISIONS. Outputs are experimental and cannot be signed as a Clinical Target Slate.`
2. **`MAG-UX-031` Anti-Automation Bias Enforcement**:
   - Verification confirmed that upon loading a new target slate, **no candidate is preselected** (`selectedCandidateIds = []`).
   - The clinician is required to perform an intentional, active selection. Pre-populating acceptance is technically impossible.
3. **Withhold Stimulation / No Target Pathway (§32 Criterion 6)**:
   - Clinicians retain the absolute right to withhold stimulation and select zero targets.
   - The workspace provides a dedicated action (`withholdStimulation`), requiring structured clinical reasoning and recording `decisionType = 'no_target'`.
4. **Research Mode Signing Block (§32 Criterion 7)**:
   - When viewing a Research Slate, the Clinical Signature button is replaced with an inactive status and warning message. Attempts to invoke the signing API programmatically throw `ResearchModeSigningProhibitedError`.
5. **Indication Switching & Context Resolution**:
   - Changing the active `CaseIndication` immediately flushes stale slates and resolves the corresponding indication module and presentation adapters.

---

## 3. Presentation Layer & Accessibility

- **Canonical V2 View Models**:
  - `toTargetSlateViewModelV2`: Correctly renders Primary 1, 2, 3 and Additional counterfactual cards, abstention badges, and anatomical uncertainty.
  - `toEvidenceDrawerViewModelV2`: Formats primary clinical trials, conflicting literature, and negative trials.
  - `toDecisionReviewViewModelV2`: Generates legal attestation language and verifies signing eligibility.
- **Accessibility Verification (WCAG 2.1 AA)**:
  - Full keyboard navigability (Tab, Enter, Space) through all candidate cards and drawer panels.
  - Mode distinctions do not rely solely on color (textual badges accompany all color cues).

---

## 4. Conclusion
The Clinician Workspace and Application Shell v2.0 satisfy all functional, usability, and safety requirements. Qualified for formal Verification Baseline release.
